import { date as qdate } from "quasar";
import calculateAge from "./calculateAge.js";

function sisFilter(reportDate, reportType, x) {
  /*
  console.log(x.c_mem_id + ":" + qdate.startOfDate(qdate.subtractFromDate(reportDate.value, {years: 15}), 'month') + ":" + qdate.getDateDiff(
    x.d_birth,
    qdate.startOfDate(qdate.subtractFromDate(reportDate.value, {years: 15}), 'month')
  ) )
    */
  return (
    x.c_udf_1 != "社區義工" &&
    ( // did not exit membership or exit after start of report month
      x.d_exit_1 == null ||
      x.d_exit_1 && qdate.getDateDiff(x.d_exit_1, qdate.startOfDate(reportDate.value, 'month')) > 0
    ) &&
    ( // did not expire membership or expire after start of report month
      (x.d_expired_1 == null) ||
      (x.d_expired_1 && qdate.getDateDiff(x.d_expired_1, qdate.startOfDate(reportDate.value, 'month')) > 0)
    ) &&
    (
      // enter before end of report month
      qdate.getDateDiff(x.d_enter_1, qdate.endOfDate(reportDate.value, 'month')) < 0 &&
      // expiry after begin of report month
      qdate.getDateDiff(x.d_expired_1, qdate.startOfDate(reportDate.value, 'month')) > 0
    ) &&
    (
      // youth: is age 15-24 in the report month
      ( reportType == 'youth' &&
        // age 15 - 24 at the end of report month
        qdate.isBetweenDates(
          x.d_birth,
          qdate.startOfDate(qdate.subtractFromDate(reportDate.value, {years: 25}), 'month'),
          qdate.endOfDate(qdate.subtractFromDate(reportDate.value, {years: 15}), 'month'), {
            inclusiveFrom: true, inclusiveTo: true
          }
        )
      ) ||
      // children: is aged below 15 and isYouthFamily
      ( reportType == 'child' &&
        qdate.getDateDiff(
          x.d_birth,
          qdate.endOfDate(qdate.subtractFromDate(reportDate.value, {years: 15}), 'month')
        ) > 0 &&
        x.isYouthFamily
      ) ||
      // family: is aged 25 or above and isYouthFamily and family Membership
      (
        reportType == 'family' &&
        qdate.getDateDiff(
          x.d_birth,
          qdate.startOfDate(qdate.subtractFromDate(reportDate.value, {years: 25}), 'month')
        ) < 0 &&
        x.isYouthFamily
        //&&
        //x.c_udf_1 == "青年家人義工"
      )
    ) && (
      (
        // for report months Jan-Mar, May-Dec
        qdate.formatDate(reportDate.value, "M") != 4 &&
        (
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
          ) ||
          ( // age 15 birthday within report month (youth only)
            reportType == 'youth' &&
            qdate.isBetweenDates(
              x.d_birth,
              qdate.startOfDate(qdate.subtractFromDate(reportDate.value, {years: 15}), 'month'),
              qdate.endOfDate(qdate.subtractFromDate(reportDate.value, {years: 15}), 'month'), {
                inclusiveFrom: true, inclusiveTo: true, onlyDate: true
            })
          ) ||
          ( // passed age 25 birthday 1 month before report month (family only)
            reportType == 'family' && x.isYouthFamily &&
            qdate.isBetweenDates(
              x.d_birth,
              qdate.startOfDate(qdate.subtractFromDate(reportDate.value, {years: 25, months: 1}), 'month'),
              qdate.endOfDate(qdate.subtractFromDate(reportDate.value, {years: 25, months: 1}), 'month'), {
                inclusiveFrom: true, inclusiveTo: true, onlyDate: true
            })
          )
        )
      ) ||
      (
        // for report months Apr
        qdate.formatDate(reportDate.value, "M") == 4 &&
        //console.log(x.c_mem_id + " " + x.c_name + " " + qdate.formatDate(x.d_enter_1, "YYYYMMDD") + " " + qdate.getDateDiff(x.d_enter_1, qdate.endOfDate(reportDate.value, 'month'))) &&
        ( // enter before end of report month
          qdate.getDateDiff(x.d_enter_1, qdate.endOfDate(reportDate.value, 'month')) < 0
        ) &&
        ( // expiry after begin of report month
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
  allRelations.filter((x) => qdate.getDateDiff(new Date(x.d_effective), reportDate.value) < 0).forEach((relation) => {
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
      // 2) membership not yet expired (compare with start of report month)
      // 3) no quit date or not quit yet (compare with start of report month)
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
                      (database[j].d_expired_1 && qdate.getDateDiff(database[j].d_expired_1, qdate.startOfDate(reportDate.value, 'month')) > 0)
                    ) &&
                    (
                      // 3
                      database[j].d_exit_1 == null ||
                      database[j].d_exit_1 && qdate.getDateDiff(database[j].d_exit_1, qdate.startOfDate(reportDate.value, 'month')) > 0
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
