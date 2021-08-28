/* eslint-disable max-len */


//  - systemAdmin-adminFunc
//  - systemAdmin-convertNewSystem
//  - systemAdmin-mergeActivity
exports.systemAdmin = require("./systemAdmin");

//  - holiday-delLeave
//  - holiday-approveLeave
//  - holiday-modifyLeave
//  - holiday-rejectLeave
//  - holiday-addLeave
exports.holiday = require("./holiday");

//  - user.newUserSignup
//  - user.userDeleted
//  - user.toggleLeaveApprove
exports.user = require("./user");

//  - activity.delActivity
//  - activity.editActivityCustomName
//  - activity.modifyActivity
//  - activity.modifyActivity_old
//  - activity.addActivity_old
//  - activity.addActivity
exports.activity = require("./activity");

//  - schedule.updateSchedule
exports.schedule = require("./schedule");

exports.ot = require("./ot");
//  - ot.addLeave
//  - ot.approveLeave
//  - ot.rejectLeave
//  - ot.modifyLeave
//  - ot.delLeave
//  - ot.updatePendingCount
