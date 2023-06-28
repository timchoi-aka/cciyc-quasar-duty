/* eslint-disable max-len */
const {functions, FireDB, FieldValue} = require("./fbadmin");
const {formatDate} = require("./utilities");
const {publishTopic} = require("./notification");

// add a leave application
exports.addLeave = functions.region("asia-east2").https.onCall(async (data, context) => {
  // App Check token. (If the request includes an invalid App Check
  // token, the request will be rejected with HTTP error 401.)
  if (context.app == undefined) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called from an App Check verified app.");
  }

  if (!context.auth.uid) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated user can apply for OT/CL",
    );
  }

  /* const leave = {
      validity: true,
      uid: data.uid,
      name: data.name,
      date: data.date,
      slot: data.slot,
      type: data.type,
      status: data.status,
      remarks: data.remarks,
    }; */
  // const leaveCollection = FireDB.collection("notification");
  data.hours = Number(data.hours);
  return await FireDB.collection("ot").add(data).then(() => {
    console.log(
        "OT: " + data.name + " 申請了 " + data.date + " (" + data.hours + "小時)" + " 的 " + data.type,
    );
  });
});

// API 2.0 add a leave application
exports.addLeaveByDocid = functions.region("asia-east2").https.onCall(async (data, context) => {
  // App Check token. (If the request includes an invalid App Check
  // token, the request will be rejected with HTTP error 401.)
  if (context.app == undefined) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called from an App Check verified app.");
  }

  if (!context.auth.uid) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated user can apply for OT/CL",
    );
  }
  // data structure expected
  /* const leave = {
      validity: true,
      uid: data.uid,
      name: data.name,
      date: data.date,
      slot: data.slot,
      type: data.type,
      status: data.status,
      remarks: data.remarks,
    }; */
  // const leaveCollection = FireDB.collection("notification");
  const batch = FireDB.batch();
  let logData = "";
  const notiQueue = [];

  for (let i = 0; i < data.length; i++) {
    const otRef = await FireDB.collection("ot").doc();
    batch.set(otRef, data[i]);
    logData += "OT: " + data[i].name + " 申請了 " + formatDate(data[i].date, "-", "YYYYMMDD") + "(" + data[i].hours + "小時)" + " 的 " + data[i].type + "\n";
    const holidayDate = new Date(data[i].date);

    notiQueue.push({
      message: {
        title: "青年-超時系統",
        body: data[i].name + "申請了" + holidayDate.getFullYear() + "年" + parseInt(holidayDate.getMonth()+1) + "月" + holidayDate.getDate() + "日" + "(" + data[i].type + data[i].hours + "小時)",
      },
      topic: "holidayApprove",
    });
  }

  return await batch.commit().then(() => {
    notiQueue.forEach((queue) => {
      publishTopic(queue.topic, queue.message);
    });
    console.log(logData);
  });
});

// API 1.0 approve a leave
/*
exports.approveLeave = functions.region("asia-east2").https.onCall(async (data, context) => {
  // App Check token. (If the request includes an invalid App Check
  // token, the request will be rejected with HTTP error 401.)
  if (context.app == undefined) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called from an App Check verified app.");
  }

  const docid = data.docid;
  const remarks = data.remarks;
  const user = await FireDB.collection("users").doc(context.auth.uid).get();
  const userData = user.data();
  if (userData.privilege.leaveApprove != true) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only leave admin can approve leave request",
    );
  }

  const currentDate = new Date();
  // offset 8 hours to hk time
  currentDate.setTime(currentDate.getTime() + 8 * 60 * 60 * 1000);
  const leaveDoc = FireDB.collection("ot").doc(docid);
  const leave = await leaveDoc.get();
  const leaveData = leave.data();

  if (remarks) leaveData.remarks.push("主任：" + remarks);
  leaveData.remarks.push("批准：" + currentDate.toLocaleDateString("HK"));
  leaveData.status = "批准";

  await leaveDoc.set(leaveData).then(() => {
    console.log(
        "OT: " + userData.name +
            " 批准了 " +
            leaveData.name +
            " 於 " +
            leaveData.date +
            " (" +
            leaveData.hours +
            "小時) " +
            leaveData.type,
    );
  });
  const OTConfig = await FireDB.collection("dashboard").doc("otConfig").get();
  const OTConfigData = OTConfig.data();
  const balance = {...OTConfigData.balance};
  const uid = leaveData.uid;
  const myBal = Number(balance[uid]);

  if (myBal + leaveData.hours > 24) {
    return FireDB.collection("dashboard").doc("otConfig").update({
      [`balance.${uid}`]: 24,
    });
  } else {
    return FireDB.collection("dashboard").doc("otConfig").update({
      [`balance.${uid}`]: myBal + leaveData.hours,
    });
  }
});
*/

// API 2.0 - approve a leave
exports.approveLeaveByDocid = functions.region("asia-east2").https.onCall(async (data, context) => {
  // App Check token. (If the request includes an invalid App Check
  // token, the request will be rejected with HTTP error 401.)
  if (context.app == undefined) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called from an App Check verified app.");
  }

  if (!context.auth.uid) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated user can apply for OT/CL",
    );
  }

  const editorDoc = FireDB
      .collection("users")
      .doc(context.auth.uid);
  const editor = await editorDoc.get();
  const editorData = editor.data();
  if (editorData.privilege.leaveApprove != true) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only leave admin can reject leave request",
    );
  }

  const batch = FireDB.batch();
  let logData = "";
  const notiQueue = [];
  for (let i = 0; i < data.length; i++) {
    const leaveDoc = FireDB
        .collection("ot")
        .doc(data[i].docid);
    const leave = await leaveDoc.get();
    const leaveData = leave.data();
    delete data[i].docid;

    batch.update(leaveDoc, data[i]);
    logData += "OT: " + editorData.name +
    " 批准了 " +
    leaveData.name +
    " 於 " +
    leaveData.date +
    " (" +
    leaveData.hours +
    "小時) 的 " +
    leaveData.type + "\n";

    const holidayDate = new Date(data[i].date);

    notiQueue.push({
      message: {
        title: "青年-超時系統",
        body: holidayDate.getFullYear() + "年" + parseInt(holidayDate.getMonth()+1) + "月" + holidayDate.getDate() + "日" + "(" + data[i].type + data[i].hours + "小時)已獲批",
      },
      topic: data[i].uid,
    });

    const userRef = FireDB.collection("users").doc(data[i].uid);
    const userDoc = await userRef.get();
    const OTBalance = Number(userDoc.data().balance.ot);
    const newBal = OTBalance + Number(leaveData.hours);

    // can't use batch, because next loop need the latest result of this loop
    if (newBal > 24) {
      await userRef.update({
        balance: {
          ot: 24,
          al: userDoc.data().balance.al,
          sal: userDoc.data().balance.sal,
        },
      });
    } else {
      await userRef.update({
        balance: {
          ot: newBal,
          al: userDoc.data().balance.al,
          sal: userDoc.data().balance.sal,
        },
      });
    }
  }

  return await batch.commit().then(() => {
    notiQueue.forEach((queue) => {
      publishTopic(queue.topic, queue.message);
    });
    console.log(logData);
  });
});

// API 1.0 - reject leave
/*
exports.rejectLeave = functions.region("asia-east2").https.onCall(async (data, context) => {
  const docid = data.docid;
  const remarks = data.remarks;
  const userDoc = FireDB
      .collection("users")
      .doc(context.auth.uid);
  const user = await userDoc.get();
  const userData = user.data();
  if (userData.privilege.leaveApprove != true) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only leave admin can reject leave request",
    );
  }
  const currentDate = new Date();
  currentDate.setTime(currentDate.getTime() + 8 * 60 * 60 * 1000);
  const leaveDoc = FireDB
      .collection("ot")
      .doc(docid);
  const leave = await leaveDoc.get();
  const leaveData = leave.data();

  if (remarks) leaveData.remarks.push("主任：" + remarks);
  leaveData.remarks.push("拒絕：" + currentDate.toLocaleDateString("HK"));
  leaveData.status = "拒絕";

  return await leaveDoc.set(leaveData).then(() => {
    console.log(
        "OT: " + userData.name +
            " 拒絕了 " +
            leaveData.name +
            " 於 " +
            leaveData.date +
            " (" +
            leaveData.hours +
            "小時) 的 " +
            leaveData.type,
    );
  });
});
*/

// API 2.0 - reject leave by docid
exports.rejectLeaveByDocid = functions.region("asia-east2").https.onCall(async (data, context) => {
  // App Check token. (If the request includes an invalid App Check
  // token, the request will be rejected with HTTP error 401.)
  if (context.app == undefined) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called from an App Check verified app.");
  }

  if (!context.auth.uid) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated user can apply for OT/CL",
    );
  }

  const editorDoc = FireDB
      .collection("users")
      .doc(context.auth.uid);
  const editor = await editorDoc.get();
  const editorData = editor.data();
  if (editorData.privilege.leaveApprove != true) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only leave admin can reject leave request",
    );
  }

  const batch = FireDB.batch();
  let logData = "";
  const notiQueue = [];

  for (let i = 0; i < data.length; i++) {
    const leaveDoc = FireDB
        .collection("ot")
        .doc(data[i].docid);
    const leave = await leaveDoc.get();
    const leaveData = leave.data();
    delete data[i].docid;

    batch.update(leaveDoc, data[i]);
    logData += "OT: " + editorData.name +
    " 拒絕了 " +
    leaveData.name +
    " 於 " +
    leaveData.date +
    " (" +
    leaveData.hours +
    "小時) 的 " +
    leaveData.type + "\n";

    const holidayDate = new Date(data[i].date);

    notiQueue.push({
      message: {
        title: "青年-超時系統",
        body: holidayDate.getFullYear() + "年" + parseInt(holidayDate.getMonth()+1) + "月" + holidayDate.getDate() + "日" + "(" + data[i].type + data[i].hours + "小時)不獲批",
      },
      topic: data[i].uid,
    });
  }

  return await batch.commit().then(() => {
    notiQueue.forEach((queue) => {
      publishTopic(queue.topic, queue.message);
    });
    console.log(logData);
  });
});

// delete a leave application
/*
exports.delLeave = functions.region("asia-east2").https.onCall(async (data, context) => {
  const leaveDoc = FireDB.collection("ot").doc(data);
  const leave = await leaveDoc.get();
  const leaveData = leave.data();

  const user = await FireDB.collection("users").doc(context.auth.uid).get();
  const userData = user.data();

  if (leave.data().uid == context.auth.uid) {
    return await leaveDoc.delete().then((doc) => {
      console.log(
          "OT: " + userData.name +
            " 刪除了 " +
            leaveData.date +
            " (" +
            leaveData.hours +
            "小時) 的 " +
            leaveData.type,
      );
    });
  } else {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only leave owner can delete leave request",
    );
  }
});
*/

// API 2.0 - delete a leave application
exports.delLeaveByDocid = functions.region("asia-east2").https.onCall(async (data, context) => {
  // App Check token. (If the request includes an invalid App Check
  // token, the request will be rejected with HTTP error 401.)
  if (context.app == undefined) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called from an App Check verified app.");
  }

  if (!context.auth.uid) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated user can apply for OT/CL",
    );
  }

  const user = await FireDB.collection("users").doc(context.auth.uid).get();
  const userData = user.data();

  let logData = "";
  const batch = FireDB.batch();

  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i].uid == context.auth.uid) {
      const ref = FireDB.collection("ot").doc(data[i].docid);
      batch.delete(ref);
      result.push({docid: data[i].docid});
      logData += "OT: " + userData.name +
          " 刪除了 " +
          formatDate(data[i].date, "-", "YYYYMMDD") +
          " (" +
          data[i].hours +
          "小時) 的 " +
          data[i].type + "\n";
    } else {
      throw new functions.https.HttpsError(
          "unauthenticated",
          "only leave owner can delete leave request",
      );
    }
  }
  return await batch.commit().then((doc) => {
    console.log(logData);
    return result;
  });
});

// API 1.0 - modify a leave
/*
exports.modifyLeave = functions.region("asia-east2").https.onCall(async (data, context) => {
  const docid = data.docid;

  const userDoc = FireDB
      .collection("users")
      .doc(context.auth.uid);
  const user = await userDoc.get();
  const userData = user.data();
  if (userData.privilege.leaveApprove != true) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only leave admin can modify leave request",
    );
  }
  const leaveDoc = FireDB
      .collection("ot")
      .doc(docid);
  const leave = await leaveDoc.get();
  const leaveData = leave.data();

  const OTConfig = await FireDB.collection("dashboard").doc("otConfig").get();
  const OTConfigData = OTConfig.data();
  const balance = {...OTConfigData.balance};
  const uid = leaveData.uid;
  const myBal = Number(balance[uid]);

  return await leaveDoc.set(data).then(() => {
    console.log(
        "OT: " + userData.name +
          " 修改了申請 - 由 [" +
          leaveData.name + "] " +
          leaveData.date +
          " (" +
          leaveData.hours +
          "小時) " +
          leaveData.type +
          " 至 " +
          data.date +
          " (" +
          data.hours +
          "小時) " +
          data.type,
    );

    if (leaveData.status == "批准" && data.status == "批准") {
      const newBal = myBal - leaveData.hours + data.hours;
      return FireDB.collection("dashboard").doc("otConfig").update({
        [`balance.${uid}`]: newBal,
      });
    }
  });
});
*/

// API 2.0 - modify a leave
exports.modifyLeaveByDocid = functions.region("asia-east2").https.onCall(async (data, context) => {
  // App Check token. (If the request includes an invalid App Check
  // token, the request will be rejected with HTTP error 401.)
  if (context.app == undefined) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called from an App Check verified app.");
  }

  if (!context.auth.uid) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated user can apply for OT/CL",
    );
  }

  const editorDoc = FireDB
      .collection("users")
      .doc(context.auth.uid);
  const editor = await editorDoc.get();
  const editorData = editor.data();
  if (editorData.privilege.leaveApprove != true) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only leave admin can modify leave request",
    );
  }

  const batch = FireDB.batch();
  let logData = "";
  for (let i = 0; i < data.length; i++) {
    const otRef = FireDB
        .collection("ot")
        .doc(data[i].docid);
    const leave = await otRef.get();
    const leaveData = leave.data();
    logData += "OT: " + context.auth.token.name + "修改了" + leaveData.name + "的申請 - 由 " + formatDate(leaveData.date, "-", "YYYYMMDD") + "[" + leaveData.type + "](" + leaveData.hours + "小時) 至 " + formatDate(data[i].date, "-", "YYYYMMDD") + "[" + data[i].type + "](" + data[i].hours + "小時) \n";
    batch.update(otRef, data[i]);

    // update ot balance
    if (leaveData.status == "批准" && data[i].status == "批准") {
      const userRef = FireDB.collection("users").doc(data[i].uid);
      const userDoc = await userRef.get();
      const newBal = Number(userDoc.data().balance.ot) - Number(leaveData.hours) + Number(data[i].hours);

      batch.update(userRef, {
        balance: {
          ot: newBal,
          al: userDoc.data().balance.al,
          sal: userDoc.data().balance.sal,
        },
      });
    }
  }

  return await batch.commit().then(() => {
    console.log(logData);
  });
});

// Listen for changes in all documents in the 'ot' collection and update dashboard
exports.updatePendingCount = functions.region("asia-east2").firestore
    .document("ot/{leaveId}")
    .onWrite(async (change, context) => {
      if (change.before.exists) { // update of record
        // delete record or didn't approve anything
        if (!change.after.exists || (change.before.data().status == "未批" && change.after.data().status != "未批")) {
          const pendingDoc = await FireDB.collection("dashboard").doc("notification").get();
          let pending = Number(pendingDoc.data().ot_waitingForApproval);
          pending--;
          console.log("OT待審批: " + pending);
          return FireDB.collection("dashboard").doc("notification").update(
              {
                ot_waitingForApproval: FieldValue.increment(-1),
              });
        // change back to un-approved
        } else if (change.before.data().status != "未批" && change.after.data().status == "未批") {
          const pendingDoc = await FireDB.collection("dashboard").doc("notification").get();
          let pending = Number(pendingDoc.data().ot_waitingForApproval);
          pending++;
          console.log("OT待審批: " + pending);
          return FireDB.collection("dashboard").doc("notification").update(
              {
                ot_waitingForApproval: FieldValue.increment(1),
              });
        }
      } else { // add new record
        if (change.after.data().status == "未批") {
          await FireDB.collection("dashboard").doc("notification").update(
              {
                ot_waitingForApproval: FieldValue.increment(1),
              }); // send email notification
          const pendingDoc = await FireDB.collection("dashboard").doc("notification").get();
          const pending = Number(pendingDoc.data().ot_waitingForApproval);
          console.log("OT待審批: " + pending);

          const emailSubject = change.after.data().name + "申請了" + change.after.data().type + "{" + formatDate(change.after.data().date, "/", "DDMMYYYY") + "(" + change.after.data().hours + "小時)}";
          return FireDB.collection("mail").add({
            to: "zoe@cciyc.com",
            message: {
              subject: emailSubject,
              html: emailSubject,
            },
          });
        }
      }
      console.log(change.after.data());
      return Promise.reject("OT - updatePendingCount: Direct DB modification/deletion or Unhandled Case.");
    });
