import { date as qdate } from "quasar";

function sisFilter(reportDate, reportType, x) {
  /*
  console.log(x.c_mem_id + ":" + qdate.startOfDate(qdate.subtractFromDate(reportDate.value, {years: 15}), 'month') + ":" + qdate.getDateDiff(
    x.d_birth,
    qdate.startOfDate(qdate.subtractFromDate(reportDate.value, {years: 15}), 'month')
  ) ) */
  return (
    ( // did not exit membership or exit after report date
      x.d_exit_1 == null ||
      x.d_exit_1 && qdate.getDateDiff(x.d_exit_1, reportDate.value) > 0
    ) &&
    ( // did not expire membership or expire after report date
      (x.d_expired_1 == null) || 
      (x.d_expired_1 && qdate.getDateDiff(x.d_expired_1, reportDate.value) > 0)
    ) &&
    ( 
      // youth: is age 15-24 in the report month
      ( reportType == 'youth' &&
        qdate.isBetweenDates(
          x.d_birth,
          qdate.startOfDate(qdate.subtractFromDate(reportDate.value, {years: 25}), 'month'),
          qdate.endOfDate(qdate.subtractFromDate(reportDate.value, {years: 15}), 'month'), {
            inclusiveFrom: true, inclusiveTo: true
          }
        )
      ) ||
      // children: is aged below 15
      ( reportType == 'child' &&
        qdate.getDateDiff(
          x.d_birth,
          qdate.endOfDate(qdate.subtractFromDate(reportDate.value, {years: 15}), 'month')
        ) > 0
      )
    ) && (
      (
        // for report months Jan-Mar, May-Dec
        qdate.formatDate(reportDate.value, "M") != 4 && 
        ( // enter within report month
          qdate.isBetweenDates(
            x.d_enter_1, 
            qdate.startOfDate(reportDate.value, 'month'),
            qdate.endOfDate(reportDate.value, 'month'), 
            {
              inclusiveFrom: true, inclusiveTo: true
            }
          )
        ) || 
        ( // renew within report month
          qdate.isBetweenDates(
            x.d_renew_1, 
            qdate.startOfDate(reportDate.value, 'month'),
            qdate.endOfDate(reportDate.value, 'month'), 
            {
              inclusiveFrom: true, inclusiveTo: true
            }
          )
        )
      ) ||
      (
        // for report months Apr
        qdate.formatDate(reportDate.value, "M") == 4 && 
        ( // enter before end of report month
          qdate.getDateDiff(x.d_enter_1, qdate.endOfDate(reportDate.value, 'month')) < 0
        ) && 
        ( // no expiry date or expiry after begin of report month
          !x.d_expired_1 ||
          qdate.getDateDiff(x.d_expired_1, qdate.startOfDate(reportDate.value, 'month')) > 0
        )
      )
    )
  )
}

// determine if c_mem_id is a youth family at the time of reportDate
// database is the object to search information for
function isYouthFamily(reportDate, database, c_mem_id) {
  let result = {
    isYouthFamily: false,
    youthMemberName: [],
  }

  let i = database.findIndex((element) => element.c_mem_id == c_mem_id)
  if (i == -1) return result
  if (database[i].MemberRelation1.length == 0 && database[i].MemberRelation2.length == 0) return result

  let allRelations = [...database[i].MemberRelation1, ...database[i].MemberRelation2]
  let relatedMembers = []
  allRelations.forEach((relation) => {
    if (relation.c_mem_id_1 == c_mem_id) relatedMembers.push(relation.c_mem_id_2)
    else relatedMembers.push(relation.c_mem_id_1)
  })
  
  //console.log(relatedMembers)
  
  relatedMembers.forEach((mem_id) => {
    // console.log(mem_id)
    let j = database.findIndex((element) => element.c_mem_id == mem_id)
    if ( j != -1 ) {
      // target is youth?
      // 1) check age
      // 2) membership not yet expired
      // 3) no quit date or not quit yet
      let isYouth = // 1
                    qdate.isBetweenDates(
                      database[j].d_birth,
                      qdate.startOfDate(qdate.subtractFromDate(reportDate.value, {years: 25}), 'month'),
                      qdate.endOfDate(qdate.subtractFromDate(reportDate.value, {years: 15}), 'month'), {
                        inclusiveFrom: true, inclusiveTo: true
                      }
                    ) && (
                      // 2
                      (database[j].d_expired_1 == null) || 
                      (database[j].d_expired_1 && qdate.getDateDiff(database[j].d_expired_1, reportDate.value) > 0)
                    ) && 
                    (
                      // 3
                      database[j].d_exit_1 == null ||
                      database[j].d_exit_1 && qdate.getDateDiff(database[j].d_exit_1, reportDate.value) > 0
                    )
      if (isYouth) {
        result.isYouthFamily = true
        result.youthMemberName.push(database[j].c_name? database[j].c_name: database[j].c_name_other)
      }
    }
  })
  
  return result
}
export default { sisFilter, isYouthFamily }