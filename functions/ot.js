/* eslint-disable max-len */
const {functions, FireDB, FieldValue} = require("./fbadmin");
const {formatDate} = require("./utilities");

// add a leave application
exports.addLeave = functions.https.onCall(async (data, context) => {
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

// approve a leave
exports.approveLeave = functions.https.onCall(async (data, context) => {
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
      balance: {
        [uid]: 24,
      },
    });
  } else {
    return FireDB.collection("dashboard").doc("otConfig").update({
      balance: {
        [uid]: myBal + leaveData.hours,
      },
    });
  }
});

// reject leave
exports.rejectLeave = functions.https.onCall(async (data, context) => {
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

// delete a leave application
exports.delLeave = functions.https.onCall(async (data, context) => {
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

// modify a leave
exports.modifyLeave = functions.https.onCall(async (data, context) => {
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
        balance: {
          [uid]: newBal,
        },
      });
    }
  });
});

// Listen for changes in all documents in the 'ot' collection and update dashboard
exports.updatePendingCount = functions.firestore
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
      return Promise.reject(new Error("OT - updatePendingCount: Direct DB modification/deletion or Unhandled Case."));
    });
