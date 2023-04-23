//  - systemAdmin-adminFunc
//  - systemAdmin-convertNewSystem
//  - systemAdmin-mergeActivity
exports.systemAdmin = require("./systemAdmin");
// const systemAdmin = require("./systemAdmin");
//  - holiday-delLeave
//  - holiday-approveLeave
//  - holiday-modifyLeave
//  - holiday-rejectLeave
//  - holiday-addLeave
exports.holiday = require("./holiday");
// const holiday = require("./holiday");
//  - user.newUserSignup
//  - user.userDeleted
//  - user.toggleLeaveApprove
exports.user = require("./user");
// const user = require("./user");

//  - activity.delActivity
//  - activity.editActivityCustomName
//  - activity.modifyActivity
//  - activity.modifyActivity_old
//  - activity.addActivity_old
//  - activity.addActivity
// const activity = require("./activity");
exports.activity = require("./activity");

//  - schedule.updateSchedule
// const schedule = require("./schedule");
exports.schedule = require("./schedule");

// const ot = require("./ot");
exports.ot = require("./ot");
//  - ot.addLeave
//  - ot.approveLeave
//  - ot.rejectLeave
//  - ot.modifyLeave
//  - ot.delLeave
//  - ot.updatePendingCount
/*
module.exports = {
  ot, schedule, activity, user, holiday, systemAdmin,
};
*/

// import housekeep from "./housekeep.mjs"
exports.housekeep = require("./housekeep.js");
// exports.housekeep = housekeep
// - housekeep.updateMemberStatus

exports.notification = require("./notification.js");

exports.healthcare = require("./healthcare.js")