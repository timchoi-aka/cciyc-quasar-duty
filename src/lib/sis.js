import { date as qdate } from "quasar";
import Member from "src/components/class/member";

// dateRangeOptions for date range comparison, default is including boundaries
const dateRangeOptions = { inclusiveFrom: true, inclusiveTo: true };

/**
 * Checks if a member is not a community volunteer.
 * @param {Object} member - The member object to check.
 * @returns {boolean} True if the member is not a community volunteer, false otherwise.
 */
function isNotCommunityVolunteer(member) {
  return member.c_udf_1 != "社區義工";
}

/**
 * Checks if a member did not exit the membership or exited after a specific date.
 * @param {Object} member - The member object to check.
 * @param {Date} date - The date to compare against the member's exit date.
 * @returns {boolean} True if the member did not exit or exited after the specified date, false otherwise.
 */
function didNotExitMembershipOrExitedAfter(member, date) {
  return member.d_exit_1 == null || (member.d_exit_1 && qdate.getDateDiff(member.d_exit_1, date) > 0);
}

/**
 * Checks if a member's membership did not expire or expired after a specific date.
 * @param {Object} member - The member object to check.
 * @param {Date} date - The date to compare against the member's expiration date.
 * @returns {boolean} True if the member's membership did not expire or expired after the specified date, false otherwise.
 */
function didNotExpireMembershipOrExpiredAfter(member, date) {
  return member.d_expired_1 == null || (member.d_expired_1 && qdate.getDateDiff(member.d_expired_1, date) > 0);
}

/**
 * Checks if a member entered before a specific date.
 * @param {Object} member - The member object to check.
 * @param {Date} date - The date to compare against the member's entry date.
 * @returns {boolean} True if the member entered before the specified date, false otherwise.
 */
function enteredBeforeDate(member, date) {
  return qdate.getDateDiff(member.d_enter_1, date) < 0;
}

/**
 * Object mapping report types to their respective handler functions for regular reports.
 */
const reportTypeHandlers = {
  youth: handleYouth,
  child: handleChild,
  family: handleFamily,
};

/**
 * Object mapping report types to their respective handler functions for yearly reports.
 */
const yearlyReportTypeHandlers = {
  youth: yearlyHandleYouth,
  child: yearlyHandleChild,
  family: yearlyHandleFamily,
};

/**
 * Handles the yearly report logic for youth members.
 * @param {Date} periodStart - The start date of the reporting period.
 * @param {Date} periodEnd - The end date of the reporting period.
 * @param {Object} member - The member object to process.
 * @returns {boolean} True if the member meets the age criteria at the start or end of the period, false otherwise.
 */
function yearlyHandleYouth(periodStart, periodEnd, member) {
  // Logic specific to 'youth'
  return ageMetAtCutoff(new Member(member), periodStart, 15, 24) || ageMetAtCutoff(new Member(member), periodEnd, 15, 24);
}

/**
 * Handles the yearly report logic for child members.
 * @param {Date} periodStart - The start date of the reporting period.
 * @param {Date} periodEnd - The end date of the reporting period.
 * @param {Object} member - The member object to process.
 * @returns {boolean} True if the member is part of a youth family and meets the age criteria at the start or end of the period, false otherwise.
 */
function yearlyHandleChild(periodStart, periodEnd, member) {
  // Logic specific to 'child'
  // is aged 0 - 14 within periodStart and periodEnd, also is a youth family
  return member.isYouthFamily && (ageMetAtCutoff(new Member(member), periodStart, 0, 14) || ageMetAtCutoff(new Member(member), periodEnd, 0, 14));
}

/**
 * Handles the yearly report logic for family members.
 * @param {Date} periodStart - The start date of the reporting period.
 * @param {Date} periodEnd - The end date of the reporting period.
 * @param {Object} member - The member object to process.
 * @returns {boolean} True if the member meets the specific criteria for family members during the reporting period, false otherwise.
 */
function yearlyHandleFamily(periodStart, periodEnd, member) {
  // Logic specific to 'family'
  return member.isYouthFamily && (ageMetAtCutoff(new Member(member), periodStart, 25, 999) || ageMetAtCutoff(new Member(member), periodEnd, 25, 999));
}

/**
 * Handles the regular report logic for family members.
 * @param {Date} periodStart - The start date of the reporting period.
 * @param {Date} periodEnd - The end date of the reporting period.
 * @param {Object} member - The member object to process.
 * @returns {boolean} True if the member is part of a family and meets the age criteria during the reporting period, false otherwise.
 */
function handleYouth(periodStart, periodEnd, member) {
  // Logic specific to 'youth'
  return ageInRange(new Member(member), periodStart, periodEnd, 15, 24);
}

/**
 * Handles the regular report logic for child members.
 * @param {Date} periodStart - The start date of the reporting period.
 * @param {Date} periodEnd - The end date of the reporting period.
 * @param {Object} member - The member object to process.
 * @returns {boolean} True if the member is a child and meets the age criteria during the reporting period, false otherwise.
 */
function handleChild(periodStart, periodEnd, member) {
  // Logic specific to 'child'
  // is aged 0 - 14 within periodStart and periodEnd, also is a youth family
  return ageInRange(new Member(member), periodStart, periodEnd, 0, 14) && member.isYouthFamily;
}

/**
 * Handles the regular report logic for family members.
 * @param {Date} periodStart - The start date of the reporting period.
 * @param {Date} periodEnd - The end date of the reporting period.
 * @param {Object} member - The member object to process.
 * @returns {boolean} True if the member is part of a family and meets the age criteria during the reporting period, false otherwise.
 */
function handleFamily(periodStart, periodEnd, member) {
  // Logic specific to 'family'
  return ageInRange(new Member(member), periodStart, periodEnd, 25, 999) && member.isYouthFamily;
}

/**
 * Checks if a member's age falls within a specified range during a given period.
 * @param {Member} member - The member object to check.
 * @param {Date} periodStart - The start date of the period.
 * @param {Date} periodEnd - The end date of the period.
 * @param {number} minAge - The minimum age to check for.
 * @param {number} maxAge - The maximum age to check for.
 * @returns {boolean} True if the member's age is within the specified range during the period, false otherwise.
 */
function ageInRange(memObj, periodStart, periodEnd, lowerBound, upperBound) {
  return (memObj.getAge(periodStart) >= lowerBound && memObj.getAge(periodStart) <= upperBound) || (memObj.getAge(periodEnd) >= lowerBound && memObj.getAge(periodEnd) <= upperBound)
}

/**
 * Handles the regular report logic for family members.
 * @param {Date} periodStart - The start date of the reporting period.
 * @param {Date} periodEnd - The end date of the reporting period.
 * @param {Object} member - The member object to process.
 * @returns {boolean} True if the member is part of a family and meets the age criteria during the reporting period, false otherwise.
 */
function ageMetAtCutoff(memObj, date, lowerBound, upperBound) {
  return (memObj.getAge(date) >= lowerBound && memObj.getAge(date) <= upperBound)
}

/**
 * Determines if a member's age is valid based on the report type and specified period.
 * @param {string} reportType - The type of report being generated (e.g., 'youth', 'child', 'family').
 * @param {Date} periodStart - The start date of the reporting period.
 * @param {Date} periodEnd - The end date of the reporting period.
 * @param {Object} member - The member object to process.
 * @returns {boolean} True if the member's age is valid for the report type within the specified period, false otherwise.
 */
function validAgeBasedOnReportType(reportType, periodStart, periodEnd, member) {
  const handler = reportTypeHandlers[reportType];
  if (handler) {
    return handler(periodStart, periodEnd, member);
  } else {
    console.error("Unsupported report type:", reportType);
    return false; // Or any other default/fallback action
  }
}

/**
 * Determines if a member's age is valid for yearly reports based on the report type and specified period.
 * @param {string} reportType - The type of yearly report being generated (e.g., 'youth', 'child', 'family').
 * @param {Date} periodStart - The start date of the reporting period for the yearly report.
 * @param {Date} periodEnd - The end date of the reporting period for the yearly report.
 * @param {Object} member - The member object to process for the yearly report.
 * @returns {boolean} True if the member's age is valid for the yearly report type within the specified period, false otherwise.
 */
function yearlyValidAgeBasedOnReportType(reportType, periodStart, periodEnd, member) {
  const handler = yearlyReportTypeHandlers[reportType];
  if (handler) {
    return handler(periodStart, periodEnd, member);
  } else {
    console.error("Unsupported report type:", reportType);
    return false; // Or any other default/fallback action
  }
}

/**
 * Checks if any of the given relations are active within the specified period.
 * @param {Array} relations - An array of relation objects to check.
 * @param {Date} periodStart - The start date of the period.
 * @param {Date} periodEnd - The end date of the period.
 * @returns {boolean} True if at least one relation is active within the period, false otherwise.
 */
function associatedRelationInPeriod(relations, periodStart, periodEnd) {
  return relations.some(relation =>
    qdate.isBetweenDates(relation.d_effective, periodStart, periodEnd, dateRangeOptions)
  );
}

/**
 * Determines if a specific date falls within the specified period.
 * @param {Date} date - The date to check.
 * @param {Date} periodStart - The start date of the period.
 * @param {Date} periodEnd - The end date of the period.
 * @returns {boolean} True if the date is within the period, false otherwise.
 */
function isDateInRange(date, periodStart, periodEnd) {
  return qdate.isBetweenDates(date, periodStart, periodEnd, dateRangeOptions);
}

/**
 * Determines if there is a valid relation within the specified period.
 * @param {Array} relations - An array of relation objects to check.
 * @param {Date} periodStart - The start date of the period.
 * @param {Date} periodEnd - The end date of the period.
 * @returns {boolean} True if there is at least one valid relation within the period, false otherwise.
 */
function hasValidRelation(relations, periodStart, periodEnd) {
  return relations.some(relation =>
    qdate.getDateDiff(relation.d_effective, periodStart) < 0
  );
}

/**
 * Checks if a member's entry or renewal date falls within the specified period.
 * @param {Object} member - The member object to check.
 * @param {Date} periodStart - The start date of the period.
 * @param {Date} periodEnd - The end date of the period.
 * @returns {boolean} True if the member's entry or renewal date is within the period, false otherwise.
 */
function isNewOrRenewInPeriod(member, periodStart, periodEnd) {
  return isDateInRange(member.d_enter_1, periodStart, periodEnd, dateRangeOptions) || isDateInRange(member.d_renew_1, periodStart, periodEnd, dateRangeOptions);
}

/**
 * Filters members for the monthly report based on their associated relation within the specified period and report type.
 * @param {Date} periodStart - The start date of the reporting period.
 * @param {Date} periodEnd - The end date of the reporting period.
 * @param {string} reportType - The type of report being generated.
 * @param {Object} member - The member object to process.
 * @returns {boolean} True if the member meets the criteria for inclusion in the monthly report, false otherwise.
 */
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
          isNewOrRenewInPeriod(member, periodStart, periodEnd) ||
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
      return false;
  }
}

/**
 * For Apr report, generate yearly report
 * yearly report needs members to just have active relation within that period
 * Filters members for the yearly report based on various criteria including membership status, entry date, and age.
 * @param {Date} periodStart - The start date of the reporting period for the yearly report.
 * @param {Date} periodEnd - The end date of the reporting period for the yearly report.
 * @param {string} reportType - The type of yearly report being generated.
 * @param {Object} member - The member object to process for the yearly report.
 * @returns {boolean} True if the member meets the criteria for inclusion in the yearly report, false otherwise.
 */
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
 * @param {Object} reportDate - A reference object containing a Date value, used to determine the report's reference date.
 * @param {string} reportType - A string indicating the type of report, which influences age validation criteria.
 * @param {Object} member - An object representing a member's data, including their birth date, membership status, and other relevant information.
 * @returns {boolean} - Returns true if the member meets all the criteria for inclusion in the report, false otherwise.
 */
function sisFilter(reportDate, reportType, member) {
  // For reports generated in April, generate yearly report
  // For reports generated in other months, generate monthly report
  return qdate.formatDate(reportDate.value, "M") == 4 ? yearlyReportFilter(qdate.startOfDate(reportDate.value, 'month'), qdate.endOfDate(reportDate.value, 'month'), reportType, member) : monthlyReportFilter(qdate.startOfDate(reportDate.value, 'month'), qdate.endOfDate(reportDate.value, 'month'), reportType, member)
}

/**
 * Determines if a specified member is part of a youth family at the time of the given report date.
 * @param {Object} reportDate - An object containing a Date value, used as the reference date for the report.
 * @param {Array} database - An array of member objects, each containing member and relation data.
 * @param {string} c_mem_id - The member ID to check for youth family status.
 * @returns {Object} - An object with a boolean indicating if the member is part of a youth family and an array of youth member names.
 */
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
