<template>
  <!-- loading dialog -->
  <q-dialog v-model="waitingAsync" position="bottom">
    <LoadingDialog message="處理中" />
  </q-dialog>
  <q-btn class="q-mt-md q-mx-md" :disable="migrated_relations.length == 0" @click="startMigrateRelation" label="Migrate Relation"/>
  <q-btn class="q-mt-md q-mx-md" :disable="Members.length == 0" @click="updateYouthRelatedMember" label="Update Youth Relation"/>
  {{updateQueue}}
</template>

<script setup>
import { MIGRATE_RELATION, GET_MEMBER_BASIC_AND_RELATED_MEMBER_FROM_IDS, GET_RELATION_BY_PK } from "/src/graphQueries/Member/query.js";
import { gql } from "graphql-tag"
import LoadingDialog from "components/LoadingDialog.vue";
import { ref, computed, watch } from "vue";
import ageUtil from "src/lib/calculateAge.js"
import { date as qdate } from "quasar";
import { UPDATE_RELATED_YOUTH_MEMBER_STATUS, UPDATE_YOUTH_MEMBER_STATUS } from "/src/graphQueries/Member/mutation.js"
import { useStore } from "vuex";
import { useQuery, useMutation } from "@vue/apollo-composable"

// variables
const $store = useStore()
const awaitServerResponse = ref(0)
const migrated_relations = ref([])
const updateQueue = ref([])

// watcher
watch(updateQueue.value, (newQueue, oldQueue)  => { 
  if (newQueue.length > 0) {
    console.log("updating: " + newQueue[0])
    awaitServerResponse.value++
    updateYouthMemberStatusByMemberID.value = { c_mem_id: newQueue[0] }
  }
})

// query
const { mutate: UpdateYouthMemberStatus, onDone: UpdateYouthMemberStatus_Completed, onError: UpdateYouthMemberStatus_Error } = useMutation(UPDATE_YOUTH_MEMBER_STATUS)
const { onResult: GetRelationByPK_Completed, variables: updateYouthMemberStatusByMemberID, loading: updatingYouthMemberStatus } = useQuery(GET_RELATION_BY_PK, 
  {
    c_mem_id: ""
  }, {
    fetchPolicy: 'network-only'
  })

const { onResult: onRelationResult } = useQuery(MIGRATE_RELATION)
const { mutate: migrateRelation, onDone: migrateRelation_Completed, onError: migrateRelation_Error } = useMutation(gql`
  mutation migrateRelation(
    $migrated_relations: [Relation_insert_input!] = {}
    ) {
    insert_Relation(objects: $migrated_relations) {
      affected_rows
    }
  }
`)

const { result: activeMembers } = useQuery(gql`
  query getActiveMember {
    Member(where: {b_mem_type1: {_eq: true}}) {
      c_mem_id
    }
  }`)

const { mutate: updateYouthStatus, onDone: updateYouthStatus_Completed, onError: updateYouthStatus_Error } = useMutation(gql`
  mutation updateYouthStatus(
    $memberObjects: [Member_insert_input!] = {},
    $logObject: Log_insert_input! = {}, 
    ) {
    insert_Member(objects: $memberObjects, if_matched: {match_columns: c_mem_id, update_columns: b_mem_type10}) {
      affected_rows
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }`)

// computed
const waitingAsync = computed(() => awaitServerResponse.value > 0)
const username = computed(() => $store.getters["userModule/getUsername"])  
const ActiveMembers = computed(() => activeMembers.value?.Member.map(a => a.c_mem_id)??[''])
const Members = ref([])
const Relations = ref([])

const { onResult } = useQuery(GET_MEMBER_BASIC_AND_RELATED_MEMBER_FROM_IDS, 
  () => ({
    c_mem_ids: ActiveMembers.value
  }))

onRelationResult((result) => {
  result.data.Member.forEach((mem) => {
    if (mem.c_mem_relative_memid) {
      migrated_relations.value.push({
        c_mem_id_1: mem.c_mem_id? mem.c_mem_id: "",
        c_mem_id_2: mem.c_mem_relative_memid? mem.c_mem_relative_memid: "",
        relation: mem.c_mem_relation? mem.c_mem_relation: ""
      })
    }
  })
})

// functions
function startMigrateRelation() {
  migrateRelation({
    migrated_relations: migrated_relations.value,
  })   
}

function updateYouthRelatedMember() {
  let result = [...Relations.value.map(a => a.c_mem_id_1), ...Relations.value.map(a => a.c_mem_id_2)]
  updateQueue.value.push(...new Set(result)) // unique items only
}

function updateYouthRelatedMember_old() {
  let youthLog = ""
  let memberObject = []
  // loop both members in Relations
  // find their index, and age in Members
  // if both members in Relations are found
  //    calculate their ages
  //    if member is youth, update Members.b_mem_type10 in Relations
  // update Members object to server
  Relations.value.forEach((rel) => {
    let mem1Index = Members.value.findIndex((element) => element.c_mem_id == rel.c_mem_id_1)
    let mem2Index = Members.value.findIndex((element) => element.c_mem_id == rel.c_mem_id_2)
    
    if (mem1Index != -1 && mem2Index != -1) {
      let age1 = ageUtil.calculateAge(Members.value[mem1Index].d_birth)
      let age2 = ageUtil.calculateAge(Members.value[mem2Index].d_birth)
      
      if (age1 >= 15 && age1 <= 24) {
        memberObject.push({
          c_mem_id: Members.value[mem2Index].c_mem_id,
          b_mem_type10: true
        })
        youthLog += Members.value[mem2Index].c_mem_id + ", "
      }

      if (age2 >= 15 && age2 <= 24) {
        memberObject.push({
          c_mem_id: Members.value[mem1Index].c_mem_id,
          b_mem_type10: true
        })
        youthLog += Members.value[mem1Index].c_mem_id + ", "
      }
    }
  })
  
  // remove duplicates
  memberObject = memberObject.filter((value, index, self) =>
    index === self.findIndex((t) => (
      t.c_mem_id === value.c_mem_id && t.b_mem_type10 === value.b_mem_type10
    ))
  )

  const logObject = ref({
    "username": username.value + "(自動系統管理)",
    "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    "module": "會員系統",
    "action": "以下會員被設定為青年家人會員：" + youthLog
  })
       
  console.log("data length: " + memberObject.length)
  
  awaitServerResponse.value++
  updateYouthStatus({
    memberObjects: memberObject,
    logObject: logObject.value
  })
};
// callback
migrateRelation_Completed((result) => {
  console.log(JSON.stringify(result))
})

migrateRelation_Error((error) => {
  console.log(JSON.stringify(error))
})

updateYouthStatus_Error((error) => {
  awaitServerResponse.value--
  console.log(JSON.stringify(error))
})

updateYouthStatus_Completed((result) => {
  awaitServerResponse.value--
  console.log(result)
})

onResult((result) => {
  Members.value = JSON.parse(JSON.stringify(result.data.Member))
  Relations.value = JSON.parse(JSON.stringify(result.data.Relation))
})

// after getting relation from mem_id, calculate whether this is a youth relative
// and determine this membership expiry date if it is a youth relative member
GetRelationByPK_Completed((result) => {
  awaitServerResponse.value--
  // console.log("result returned: " + JSON.stringify(result))
  if (result.data.Member_by_pk) {
    // only consider "青年家人義工"
    // default is not Youth relative, and membership expire today
    let youthMembership = result.data.Member_by_pk.c_udf_1 == '青年家人義工'
    console.log("youthMembership:" + youthMembership)
    let isYouth = false
    let currentExpiryDate = Date.now()
  
    // loop through all related members
    let rel = [...result.data.Member_by_pk.MemberRelation1, ...result.data.Member_by_pk.MemberRelation2]
    if (rel.length > 0) {
      // console.log("rel:" + JSON.stringify(rel))
      rel.forEach((rm) => {
        if (rm.c_mem_id_1 == result.data.Member_by_pk.c_mem_id) { // relation member 1 = this member
          // check relation member 2 youth status
          // criterion: b_mem_type1 valid && d_exit_1 invalid && relatedMember membership is not yet expired && relatedMember age is 15-24
          if (rm.RelationMember2) { // only proceed if relation member exist
            isYouth = rm.RelationMember2.b_mem_type1 && !rm.RelationMember2.d_exit_1 && qdate.getDateDiff(Date.now(), rm.RelationMember2.d_expired_1) < 0 && ageUtil.calculateAge(rm.RelationMember2.d_birth) >= 15 && ageUtil.calculateAge(rm.RelationMember2.d_birth) <= 24
          
            // if target is youth && this member is a youth membership, determine expiry date
            if (isYouth && youthMembership) {
              // determine this member expiry base on relatedMember membership and age
              // console.log("membership:" + rm.RelationMember2.c_udf_1)
              switch (rm.RelationMember2.c_udf_1) {
                case "個人會員":
                  if (currentExpiryDate < rm.RelationMember2.d_expired_1) currentExpiryDate = rm.RelationMember2.d_expired_1
                  break
                case "永久會員":
                case "青年義工會員(15-24歲)":
                  if (currentExpiryDate < qdate.addToDate(rm.RelationMember2.d_birth, {years: 25})) currentExpiryDate = qdate.addToDate(rm.RelationMember2.d_birth, {years: 25})
                  break
              }
            }
            console.log("Member2:" + rm.RelationMember2.c_mem_id + " b_mem_type1:" + rm.RelationMember2.b_mem_type1 + " d_exit_1: " + rm.RelationMember2.d_exit_1 + " d_expired_1: " + rm.RelationMember2.d_expired_1 + " age: " + ageUtil.calculateAge(rm.RelationMember2.d_birth) + " isYouth:" + isYouth)
          }
        }
        if (rm.c_mem_id_2 == result.data.Member_by_pk.c_mem_id) { // relation member 2 = this member
          // check relation member 2 youth status
          // criterion: b_mem_type1 valid && d_exit_1 invalid && relatedMember membership is not yet expired && relatedMember age is 15-24
          if (rm.RelationMember1) { // only proceed if relation member exist
            isYouth = rm.RelationMember1.b_mem_type1 && !rm.RelationMember1.d_exit_1 && qdate.getDateDiff(Date.now(), rm.RelationMember1.d_expired_1) < 0 && ageUtil.calculateAge(rm.RelationMember1.d_birth) >= 15 && ageUtil.calculateAge(rm.RelationMember1.d_birth) <= 24
          
            // if target is youth && this member is a youth membership, determine expiry date
            if (isYouth && youthMembership) {
              // determine this member expiry base on relatedMember membership and age
              // console.log("membership:" + rm.RelationMember2.c_udf_1)
              switch (rm.RelationMember1.c_udf_1) {
                case "個人會員":
                  if (currentExpiryDate < rm.RelationMember1.d_expired_1) currentExpiryDate = rm.RelationMember1.d_expired_1
                  break
                case "永久會員":
                case "青年義工會員(15-24歲)":
                  if (currentExpiryDate < qdate.addToDate(rm.RelationMember1.d_birth, {years: 25})) currentExpiryDate = qdate.addToDate(rm.RelationMember1.d_birth, {years: 25})
                  break
              }
            }
            console.log("Member1:" + rm.RelationMember1.c_mem_id + " b_mem_type1:" + rm.RelationMember1.b_mem_type1 + " d_exit_1: " + rm.RelationMember1.d_exit_1 + " d_expired_1: " + rm.RelationMember1.d_expired_1 + " age: " + ageUtil.calculateAge(rm.RelationMember1.d_birth) + " isYouth:" + isYouth)
          }
        }
      })
    }
    
    const logObject = ref({
      "username": username.value,
      "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      "module": "會員系統",
      "action": "系統自動更新:" + result.data.Member_by_pk.c_mem_id + " 青年家人狀態-" + isYouth + " 會藉屆滿日期-" + qdate.formatDate(currentExpiryDate, "YYYY-MM-DD"),
    })
    
    if (youthMembership) {
      UpdateYouthMemberStatus({
        c_mem_id: result.data.Member_by_pk.c_mem_id,
        b_mem_type10: isYouth,
        d_expired_1: qdate.formatDate(currentExpiryDate, "YYYY/MM/DD"),
        logObject: logObject.value
      })
      console.log("setting " + result.data.Member_by_pk.c_mem_id + " b_mem_type10 to " + isYouth + " expiryDate: " + currentExpiryDate)
    } else {
      UpdateYouthMemberStatus({
        c_mem_id: result.data.Member_by_pk.c_mem_id,
        b_mem_type10: isYouth,
        logObject: logObject.value
      })
      console.log("setting " + result.data.Member_by_pk.c_mem_id + " b_mem_type10 to " + isYouth)
    }
  }
  updateQueue.value.splice(0, 1)
})
</script>
