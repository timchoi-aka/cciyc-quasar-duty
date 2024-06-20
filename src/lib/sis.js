import { date as qdate } from "quasar";
import Member from "src/components/class/member";
const dateRangeOptions = { inclusiveFrom: true, inclusiveTo: true };

function isNotCommunityVolunteer(member) {
  return member.c_udf_1 != "社區義工";
}

function didNotExitMembershipOrExitedAfter(member, date) {
  return member.d_exit_1 == null || (member.d_exit_1 && qdate.getDateDiff(member.d_exit_1, date) > 0);
}

function didNotExpireMembershipOrExpiredAfter(member, date) {
  return member.d_expired_1 == null || (member.d_expired_1 && qdate.getDateDiff(member.d_expired_1, date) > 0);
}

function enteredBeforeDate(member, date) {
  return qdate.getDateDiff(member.d_enter_1, date) < 0;
}

const reportTypeHandlers = {
  youth: handleYouth,
  child: handleChild,
  family: handleFamily,
};

const yearlyReportTypeHandlers = {
  youth: yearlyHandleYouth,
  child: yearlyHandleChild,
  family: yearlyHandleFamily,
};

function yearlyHandleYouth(periodStart, periodEnd, member) {
  // Logic specific to 'youth'
  return ageMetAtCutoff(new Member(member), periodStart, 15, 24) || ageMetAtCutoff(new Member(member), periodEnd, 15, 24);
}

function yearlyHandleChild(periodStart, periodEnd, member) {
  // Logic specific to 'child'
  // is aged 0 - 14 within periodStart and periodEnd, also is a youth family
  return member.isYouthFamily && (ageMetAtCutoff(new Member(member), periodStart, 0, 14) || ageMetAtCutoff(new Member(member), periodEnd, 0, 14));
}

function yearlyHandleFamily(periodStart, periodEnd, member) {
  // Logic specific to 'family'
  return member.isYouthFamily && (ageMetAtCutoff(new Member(member), periodStart, 25, 999) || ageMetAtCutoff(new Member(member), periodEnd, 25, 999));
}

function handleYouth(periodStart, periodEnd, member) {
  // Logic specific to 'youth'
  return ageInRange(new Member(member), periodStart, periodEnd, 15, 24);
}

function handleChild(periodStart, periodEnd, member) {
  // Logic specific to 'child'
  // is aged 0 - 14 within periodStart and periodEnd, also is a youth family
  return ageInRange(new Member(member), periodStart, periodEnd, 0, 14) && member.isYouthFamily;
}

function handleFamily(periodStart, periodEnd, member) {
  // Logic specific to 'family'
  return ageInRange(new Member(member), periodStart, periodEnd, 25, 999) && member.isYouthFamily;
}

function ageInRange(memObj, periodStart, periodEnd, lowerBound, upperBound) {
  return (memObj.getAge(periodStart) >= lowerBound && memObj.getAge(periodStart) <= upperBound) || (memObj.getAge(periodEnd) >= lowerBound && memObj.getAge(periodEnd) <= upperBound)
}

function ageMetAtCutoff(memObj, date, lowerBound, upperBound) {
  return (memObj.getAge(date) >= lowerBound && memObj.getAge(date) <= upperBound)
}

function validAgeBasedOnReportType(reportType, periodStart, periodEnd, member) {
  const handler = reportTypeHandlers[reportType];
  if (handler) {
    return handler(periodStart, periodEnd, member);
  } else {
    console.error("Unsupported report type:", reportType);
    return false; // Or any other default/fallback action
  }
}

function yearlyValidAgeBasedOnReportType(reportType, periodStart, periodEnd, member) {
  const handler = yearlyReportTypeHandlers[reportType];
  if (handler) {
    return handler(periodStart, periodEnd, member);
  } else {
    console.error("Unsupported report type:", reportType);
    return false; // Or any other default/fallback action
  }
}

function associatedRelationInPeriod(relations, periodStart, periodEnd) {
  return relations.some(relation =>
    qdate.isBetweenDates(relation.d_effective, periodStart, periodEnd, dateRangeOptions)
  );
}

function isDateInRange(date, periodStart, periodEnd) {
  return qdate.isBetweenDates(date, periodStart, periodEnd, dateRangeOptions);
}

function hasValidRelation(relations, periodStart, periodEnd) {
  return relations.some(relation =>
    qdate.getDateDiff(relation.d_effective, periodStart) < 0
  );
}

function isNewOrRenewInPeriod(member, periodStart, periodEnd, dateRangeOptions) {
  return isDateInRange(member.d_enter_1, periodStart, periodEnd, dateRangeOptions) || isDateInRange(member.d_renew_1, periodStart, periodEnd, dateRangeOptions);
}

// for report months Jan-Mar, May-Dec, generate monthly report
// monthly report needs members to have associated relation within that period
function monthlyReportFilter(periodStart, periodEnd, reportType, member) {
  switch (reportType) {
    case 'youth':
      // youth has to be renewed or entered in the period
      // or turned 15 within the period
      return isNotCommunityVolunteer(member) &&
        didNotExitMembershipOrExitedAfter(member, periodStart) &&
        didNotExpireMembershipOrExpiredAfter(member, periodStart) &&
        enteredBeforeDate(member, periodEnd) &&
        (
          isNewOrRenewInPeriod(member, periodStart, periodEnd, dateRangeOptions) ||
          isDateInRange(qdate.addToDate(member.d_birth, { year: 15 }), periodStart, periodEnd)
        ) &&
        validAgeBasedOnReportType(reportType, periodStart, periodEnd, member);

    case 'child':
    case 'family':
      // child and family has to be renewed or entered in the period
      // or has valid relation associated within period
      return isNotCommunityVolunteer(member) &&
        didNotExitMembershipOrExitedAfter(member, periodStart) &&
        didNotExpireMembershipOrExpiredAfter(member, periodStart) &&
        enteredBeforeDate(member, periodEnd) &&
        validAgeBasedOnReportType(reportType, periodStart, periodEnd, member) &&
        (
          isNewOrRenewInPeriod(member, periodStart, periodEnd) ||
          associatedRelationInPeriod(member.MemberRelation1, periodStart, periodEnd) ||
          associatedRelationInPeriod(member.MemberRelation2, periodStart, periodEnd)
        )

    default:
      console.error("Unsupported report type:", reportType);
      return false; // Or any other default/fallback action
  }
}

// for Apr report, generate yearly report
// yearly report needs members to just have active relation within that period
function yearlyReportFilter(periodStart, periodEnd, reportType, member) {
  switch (reportType) {
    case 'youth':
      // youth has to be renewed or entered in the period
      return isNotCommunityVolunteer(member) &&
        didNotExitMembershipOrExitedAfter(member, periodStart) &&
        didNotExpireMembershipOrExpiredAfter(member, periodStart) &&
        enteredBeforeDate(member, periodEnd) &&
        yearlyValidAgeBasedOnReportType(reportType, periodStart, periodEnd, member);

    case 'child':
    case 'family':
      // child and family has to be renewed or entered in the period
      // or has valid relation associated within period
      return isNotCommunityVolunteer(member) &&
        didNotExitMembershipOrExitedAfter(member, periodStart) &&
        didNotExpireMembershipOrExpiredAfter(member, periodStart) &&
        enteredBeforeDate(member, periodEnd) &&
        yearlyValidAgeBasedOnReportType(reportType, periodStart, periodEnd, member) &&
        (
          isNewOrRenewInPeriod(member, periodStart, periodEnd) ||
          hasValidRelation(member.MemberRelation1, periodStart, periodEnd) ||
          hasValidRelation(member.MemberRelation2, periodStart, periodEnd)
        )

    default:
      console.error("Unsupported report type:", reportType);
      return false; // Or any other default/fallback action
  }
}

/**
 * Filters members based on specific criteria including membership status, entry and exit dates, and age validity determined by report type.
 *
 * @param {Object} reportDate - A reference object containing a Date value, used to determine the report's reference date.
 * @param {string} reportType - A string indicating the type of report, which influences age validation criteria.
 * @param {Object} member - An object representing a member's data, including their birth date, membership status, and other relevant information.
 *
 * @returns {boolean} - Returns true if the member meets all the criteria for inclusion in the report, false otherwise.
 */
function sisFilter(reportDate, reportType, member) {
  // For reports generated in April, generate yearly report
  // For reports generated in other months, generate monthly report
  return qdate.formatDate(reportDate.value, "M") == 4 ? yearlyReportFilter(qdate.startOfDate(reportDate.value, 'month'), qdate.endOfDate(reportDate.value, 'month'), reportType, member) : monthlyReportFilter(qdate.startOfDate(reportDate.value, 'month'), qdate.endOfDate(reportDate.value, 'month'), reportType, member)
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

  allRelations.filter((rel) => qdate.getDateDiff(new Date(rel.d_effective), reportDate.value) < 0).forEach((relation) => {
    if (relation.c_mem_id_1 == c_mem_id) relatedMembers.push(relation.c_mem_id_2)
    else relatedMembers.push(relation.c_mem_id_1)
  })

  relatedMembers.forEach((mem_id) => {
    let j = database.findIndex((element) => element.c_mem_id == mem_id)
    if (j != -1) {
      // target is youth?
      // 1) check age
      // 2) membership not yet expired (compare with start of report month)
      // 3) no quit date or not quit yet (compare with start of report month)
      let isYouth = // 1
        qdate.isBetweenDates(
          database[j].d_birth,
          qdate.startOfDate(qdate.subtractFromDate(reportDate.value, { years: 25 }), 'month'),
          qdate.endOfDate(qdate.subtractFromDate(reportDate.value, { years: 15 }), 'month'), {
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
        result.youthMemberName.push(database[j].c_name ? database[j].c_name : database[j].c_name_other)
      }
    }
  })

  return result
}
export default { sisFilter, isYouthFamily }
