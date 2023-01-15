const fetch = require('node-fetch');
const adminSecret = process.env.adminSecret;
const hgeEndpoint = process.env.hgeEndpoint;

const query = `
query getMemberNameFromID($c_mem_ids: [String!]) {
  Member {
    c_mem_id,
    b_mem_type1,
    b_mem_type2,
    b_mem_type3,
    b_mem_type4,
    c_udf_1,
    d_enter_1,
    d_exit_1,
    d_renew_1,
    d_expired_1,
    d_enter_2,
    d_exit_2,
    d_renew_2,
    d_expired_2,
    d_enter_3,
    d_exit_3,
    d_renew_3,
    d_expired_3,
    d_enter_4,
    d_exit_4,
    d_renew_4,
    d_expired_4,
    b_mem_type10,
    d_birth,
    c_name,
    c_name_other,
  }
  Relation {
    uuid
    c_mem_id_1
    c_mem_id_2
    relation
  }
}`;

const mutation = `
mutation updateMemberStatus(
  $upsertObjects: [Member_insert_input!] = [],
  $logObject: Log_insert_input! = {}, 
  ) {
  insert_Member(
    objects: $upsertObjects, if_matched: {match_columns: c_mem_id, update_columns: [b_mem_type1]}
  ) {
    affected_rows
  }
  insert_Log_one(object: $logObject) {
    log_id
  }
}`;

const mutation_updateYouthMemberStatus = `
mutation updateYouthMemberStatus(
  $c_mem_id: String = "", 
  $b_mem_type10: Boolean = false,
  $d_expired_1: datetime2,
  $logObject: Log_insert_input! = {}, 
  ) {
  update_Member_by_pk(pk_columns: {c_mem_id: $c_mem_id}, _set: {b_mem_type10: $b_mem_type10, d_expired_1: $d_expired_1}) {
    c_mem_id
  }
  insert_Log_one(object: $logObject) {
    log_id
  }
}`

module.exports = async (context, myTimer) => {
  var timeStamp = new Date().toISOString();
  
  if (myTimer.isPastDue)
  {
      context.log('JavaScript is running late!');
  }
  context.log('JavaScript timer trigger function ran!', timeStamp); 

  const res = await fetch(hgeEndpoint + '/v1/graphql/', {
    method: 'POST',
    body: JSON.stringify({ query: query }),
    headers: { 'Content-Type': 'application/json', 'x-hasura-admin-secret': adminSecret },
  })
  const json = await res.json()
  
  let Members = json.data.Member
  let Relations = json.data.Relation
  
  
  if (Members.length) {
    let queue = []
    // calculate b_mem_type1
    Members.forEach((member) => {      
      if (member.c_mem_id != "9999") {
        let original_b_mem_type1 = member.b_mem_type1
        let b_mem_type1 = member.b_mem_type1
        let d_expired_1 = new Date(member.d_expired_1)
        let now = new Date()
        
        if (now - d_expired_1 < 0) {
          b_mem_type1 = true
        } else b_mem_type1 = false
        
        // expired or quit, set active member status to false
        if (b_mem_type1 != original_b_mem_type1) {
          //console.log(member.c_mem_id + ":" + original_b_mem_type1 + ":" + b_mem_type1 + ":" + member.d_expired_1 + ":" + d_expired_1 + ":" + (now - d_expired_1))
          queue.push({
            c_mem_id: member.c_mem_id,
            b_mem_type1: b_mem_type1,
          })
          // update the member object for calculating relations
          member.b_mem_type1 = b_mem_type1
        }
      }
    })      
    
    
    // debug test
    /*queue.push({
      c_mem_id: "0281",
      b_mem_type1: true,
    })*/

    console.log("會藉自動更新數目：" + queue.length)
    let relationQueue = [...queue]
    if (queue.length > 0) {  
      let loopCount = Math.floor(queue.length / 1000)
      
      for (let i = 0; i <= loopCount; i++) {  
        let submitQueue = []
        let end = queue.length > 1000? 1000: queue.length
        
        for (let j = 0; j < end; j++) {
          submitQueue.push(queue.shift())
        }
        
        const qv = { 
          upsertObjects: submitQueue,
          logObject: {
            "username": "系統每日",
            "datetime": (new Date()).toISOString(),
            "module": "會員系統",
            "action": "系統自動更新會藉狀態:" + JSON.stringify(submitQueue),
          }
        };
        const res = await fetch(hgeEndpoint + '/v1/graphql/', {
          method: 'POST',
          body: JSON.stringify({ query: mutation, variables: qv }),
          headers: { 'Content-Type': 'application/json', 'x-hasura-admin-secret': adminSecret },
        })
        const json = await res.json()
        console.log(json) 
      }
      //console.log("relationQueue: "+ relationQueue)
      // update b_mem_type10
      /*
        algorithm: for each member that has b_mem_type1 changed,
        get a list of all his related members (j)
        for each (j), check his youth related status against j's related members (k)
      */
      for (const member of relationQueue) {
        //console.log("member:"+member)
        let i = Members.findIndex((element) => element.c_mem_id == member.c_mem_id)

        let rel = []
        // loop through all related members, find related member of the member that b_mem_type1 changed
        Relations.forEach((relation) => {
          if (relation.c_mem_id_1 == Members[i].c_mem_id) rel.push(relation.c_mem_id_2)
          if (relation.c_mem_id_2 == Members[i].c_mem_id) rel.push(relation.c_mem_id_1)
        })
        // remove duplicates
        rel = [...new Set(rel)]
        // console.log("rel:" + JSON.stringify(rel))
        // update all related member of this member who changed b_mem_type1
        if (rel.length > 0) {
          // loop on every related members
          for (const rm of rel) {
            let j = Members.findIndex((element) => element.c_mem_id == rm)
            if (j != -1) {
              // build the related members of the related member
              let rel_rel = []
              // loop through all related members, find related member 
              Relations.forEach((relation) => {
                if (relation.c_mem_id_1 == Members[j].c_mem_id) rel_rel.push(relation.c_mem_id_2)
                if (relation.c_mem_id_2 == Members[j].c_mem_id) rel_rel.push(relation.c_mem_id_1)
              })
              // console.log("rel_rel of " + Members[j].c_mem_id + ":" + rel_rel)
              // only consider "青年家人義工"
              // default is not Youth relative, and membership expire today
              let youthMembership = Members[j].c_udf_1 == '青年家人義工'
              // console.log("youthMembership:" + youthMembership)
              let isYouth = false
              let currentExpiryDate = new Date()

              rel_rel.forEach((rel_rel_rm) => {                
                let k = Members.findIndex((element) => element.c_mem_id == rel_rel_rm)
                // check relation member youth status
                // criterion: b_mem_type1 valid && d_exit_1 invalid && relatedMember membership is not yet expired && relatedMember age is 15-24
                
                let tempYouth = Members[k].b_mem_type1 && !Members[k].d_exit_1 && (Members[k].d_expired_1 && (Date.now() - new Date(Members[k].d_expired_1) < 0)) && calculateAge(Members[k].d_birth) >= 15 && calculateAge(Members[k].d_birth) <= 24
                
                // set isYouth to true if one of the relation is youth
                if (tempYouth) isYouth = tempYouth
                // if target is youth && this member is a youth membership, determine expiry date
                if (tempYouth && youthMembership) {
                  // determine this member expiry base on relatedMember membership and age
                  switch (Members[k].c_udf_1) {
                    case "個人會員":
                      if (currentExpiryDate < new Date(Members[k].d_expired_1)) currentExpiryDate = new Date(new Date(Members[k].d_expired_1).setHours(8))
                      break
                    case "永久會員":
                    case "青年義工會員":
                      // timezone adjust
                      let t = new Date(new Date(Members[k].d_birth).setHours(8))
                      // add 25 years after birth to expiry date
                      let dateOfTwentyFive = new Date(t.setFullYear(t.getFullYear() + 25))
                      // console.log("dateOfTwentyFive: " + dateOfTwentyFive.toISOString())
                      if (currentExpiryDate < dateOfTwentyFive) currentExpiryDate = dateOfTwentyFive
                      break
                  }
                }
              })
              
              if (isYouth && youthMembership) {
                // console.log("currentExpiryDate:" + currentExpiryDate.toISOString())
                const logObject = {
                  "username": "系統每日",
                  "datetime": (new Date()).toISOString(),
                  "module": "會員系統",
                  "action": "系統自動更新:" + Members[j].c_mem_id + " 青年家人狀態-" + isYouth + " 會藉屆滿日期-" + currentExpiryDate.toISOString(),
                }
    
                const qv = { 
                  c_mem_id: Members[j].c_mem_id,
                  b_mem_type10: isYouth,
                  d_expired_1: currentExpiryDate.toISOString(),
                  logObject: logObject
                };
                const res = await fetch(hgeEndpoint + '/v1/graphql/', {
                  method: 'POST',
                  body: JSON.stringify({ query: mutation_updateYouthMemberStatus, variables: qv }),
                  headers: { 'Content-Type': 'application/json', 'x-hasura-admin-secret': adminSecret },
                })
                const json = await res.json()
                console.log(json) 
                console.log("setting " + Members[j].c_mem_id + " b_mem_type10 to " + isYouth + " expiryDate: " + currentExpiryDate.toISOString())
              } else {
                const logObject = {
                  "username": "系統每日",
                  "datetime": (new Date()).toISOString(),
                  "module": "會員系統",
                  "action": "系統自動更新:" + Members[j].c_mem_id + " 青年家人狀態-" + isYouth + " 會藉屆滿日期-" + Members[j].d_expired_1,
                }
    
                const qv = { 
                  c_mem_id: Members[j].c_mem_id,
                  b_mem_type10: isYouth,
                  d_expired_1: Members[j].d_expired_1,
                  logObject: logObject
                }
                const res = await fetch(hgeEndpoint + '/v1/graphql/', {
                  method: 'POST',
                  body: JSON.stringify({ query: mutation_updateYouthMemberStatus, variables: qv }),
                  headers: { 'Content-Type': 'application/json', 'x-hasura-admin-secret': adminSecret },
                })
                const json = await res.json()
                console.log(json) 
                console.log("setting " + Members[j].c_mem_id + " b_mem_type10 to " + isYouth)
              }
            }
          }
        }
      }
    }
  }
};

function calculateAge(dob) {
  let now = new Date();
  let birth = new Date(dob);
  let birthyear = birth.getFullYear();
  birth = birth.setFullYear(now.getFullYear())
  let offset = now - birth < 0? -1: 0
  if (birthyear == now.getFullYear()) {
    return 0
  } else {
    return parseInt(now.getFullYear()) - birthyear + offset;
  }
}