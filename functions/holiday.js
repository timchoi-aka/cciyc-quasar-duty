/* eslint-disable max-len */
const {functions, FireDB, FieldValue, Timestamp} = require("./fbadmin");
const {formatDate} = require("./utilities");

// API 1.0 - delete a leave application
exports.delLeave = functions.https.onCall(async (data, context) => {
  const leaveDoc = FireDB.collection("leave").doc(data);
  const leave = await leaveDoc.get();
  const leaveData = leave.data();

  const user = await FireDB.collection("users").doc(context.auth.uid).get();
  const userData = user.data();

  if (leave.data().uid == context.auth.uid) {
    return await leaveDoc.delete().then((doc) => {
      console.log(
          "HOLIDAY: " + userData.name +
          " 刪除了 " +
          leaveData.date +
          " 於 " +
          leaveData.slot +
          " 假期種類 " +
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

// API 2.0 - delete a leave application
exports.delLeaveByDocid = functions.https.onCall(async (data, context) => {
  if (!context.auth.uid) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated user can access this function",
    );
  }
  // get user information for logging
  const user = await FireDB.collection("users").doc(context.auth.uid).get();
  const userData = user.data();

  let logData = "";
  const result = [];
  const batch = FireDB.batch();
  for (const d of data) {
    const leaveDoc = FireDB.collection("leave").doc(d.docid);
    const leave = await leaveDoc.get();
    if (leave.data().uid == context.auth.uid) {
      result.push({docid: d.docid});
      batch.delete(leaveDoc);
      logData += "HOLIDAY: " + userData.name +
        " 刪除了 " +
        leave.data().date +
        " 於 " +
        leave.data().slot +
        " 假期種類 " +
        leave.data().type + "\n";
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

// API 1.0 - approve a leave
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
  const leaveDoc = FireDB.collection("leave").doc(docid);
  const leave = await leaveDoc.get();
  const leaveData = leave.data();

  if (remarks) leaveData.remarks.push("主任：" + remarks);
  leaveData.remarks.push("批准：" + currentDate.toLocaleDateString("HK"));
  leaveData.status = "批准";

  await leaveDoc.set(leaveData).then(() => {
    console.log(
        "HOLIDAY: " + userData.name +
          " 批准了 " +
          leaveData.name +
          " 於 " +
          leaveData.date +
          " 時段 " +
          leaveData.slot +
          " 假期種類 " +
          leaveData.type,
    );
  });

  const firebaseDate = Timestamp.fromDate(
      new Date(leaveData.date),
  );

  const scheduleCollection = FireDB.collection("schedule");

  // find if timeslot is already occupied
  const scheduleDoc = await scheduleCollection
      .where("date", "==", firebaseDate)
      .where("slot", "==", leaveData.slot)
      .where("uid", "==", leaveData.uid)
      .get();

  // load the matched documents in a tmp array
  const tmp = [];
  scheduleDoc.forEach((doc) => {
    const d = doc.data();
    d.id = doc.id;
    tmp.push(d);
  });

  switch (tmp.length) {
    case 0: // no entry found, create new schedule
      return scheduleCollection.add({
        date: firebaseDate,
        slot: leaveData.slot,
        uid: leaveData.uid,
        type: leaveData.type,
        leaveDocid: docid,
      }).then(()=>{
        console.log(
            "HOLIDAY: （己獲批准-新）" +
                    leaveData.name +
                    " 於 " +
                    leaveData.date +
                    " 時段 " +
                    leaveData.slot +
                    " 假期種類 " +
                    leaveData.type,
        );
        return Promise.resolve("Approved Holiday");
      });
    case 1: // normal case, 1 entry found, modify that entry
      return scheduleCollection.doc(tmp[0].id).set({
        date: firebaseDate,
        slot: leaveData.slot,
        uid: leaveData.uid,
        type: leaveData.type,
        leaveDocid: docid,
      }).then(() => {
        console.log(
            "HOLIDAY: （已獲批准-修改）" +
                    leaveData.name +
                    " 於 " +
                    leaveData.date +
                    " 時段 " +
                    leaveData.slot +
                    " 假期種類 " +
                    leaveData.type,
        );
        return Promise.resolve("Approved Holiday");
      });
    default: // it should not have more than 1 entries, return with error
      throw new functions.https.HttpsError(
          "already-exists",
          "duplicated entries found in schedule, please contact administrator",
      );
  }
});

// API 2.0 - approve a leave by docid
exports.approveLeaveByDocid = functions.https.onCall(async (data, context) => {
  const runUser = await FireDB.collection("users").doc(context.auth.uid).get();
  const runUserData = runUser.data();
  if (!context.auth.uid) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated user can access this function",
    );
  }

  if (runUserData.privilege.leaveApprove != true) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only leave admin can approve leave request",
    );
  }
  const currentDate = new Date();
  // offset 8 hours to hk time
  currentDate.setTime(currentDate.getTime() + 8 * 60 * 60 * 1000);

  let logData = "";
  const batch = FireDB.batch();

  for (const d of data) {
    const leaveDoc = FireDB.collection("leave").doc(d.docid);
    const scheduleDocid = d.uid + formatDate(d.date, "", "YYYYMMDD") + d.slot;
    const userRef = FireDB.collection("users").doc(d.uid);

    batch.update(leaveDoc, {
      remarks: FieldValue.arrayUnion(...d.remarks),
      status: d.status,
    });

    logData += "HOLIDAY: " + runUserData.name +
            " 批准了 " +
            d.name +
            " 於 " +
            d.date +
            " 時段 " +
            d.slot +
            " 假期種類 " +
            d.type + "\n";

    // reduce balance
    if (d.type == "AL") {
      batch.update(userRef, "balance.al", FieldValue.increment(-0.5));
    } else if (d.type == "SAL") {
      batch.update(userRef, "balance.sal", FieldValue.increment(-0.5));
    }


    const firebaseDate = Timestamp.fromDate(
        new Date(d.date),
    );

    const scheduleCollection = FireDB.collection("schedule");

    // find if timeslot is already occupied
    const scheduleDoc = scheduleCollection.doc(scheduleDocid);
    const schedule = await scheduleDoc.get();
    const scheduleData = schedule.data();

    if (!scheduleData) { // old data doesn't exist, create new schedule
      batch.set(scheduleDoc, {
        date: firebaseDate,
        slot: d.slot,
        uid: d.uid,
        type: d.type,
        leaveDocid: d.docid,
      });

      logData += "HOLIDAY>SCHEDULE: （批准假期>新更表）" +
                      d.name +
                      " 於 " +
                      d.date +
                      " 時段 " +
                      d.slot +
                      " 假期種類 " +
                      d.type + "\n";
    } else {
      batch.update(scheduleDoc, {
        type: d.type,
        leaveDocid: d.docid,
      });

      logData += "HOLIDAY>SCHEDULE: （批准假期>修改更表）" +
      d.name +
      " 於 " +
      d.date +
      " 時段 " +
      d.slot +
      " 假期種類 " +
      d.type + "\n";
    }
  }

  return await batch.commit().then((result) => {
    console.log(logData);
  });
});

// API 2.0 - modify a leave by docid
exports.modifyLeaveByDocid = functions.https.onCall(async (data, context) => {
  if (!context.auth.uid) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated user can access this function",
    );
  }
  const actionUsername = context.auth.token.name;

  const userDoc = FireDB
      .collection("users")
      .doc(context.auth.uid);
  const user = await userDoc.get();
  const userData = user.data();

  const batch = FireDB.batch();
  let logData = "";
  for (const d of data) {
    const leaveDoc = FireDB
        .collection("leave")
        .doc(d.docid);
    const leave = await leaveDoc.get();
    const leaveData = leave.data();
    const scheduleCollection = FireDB.collection("schedule");
    const oldScheduleDocid = leaveData.uid + formatDate(leaveData.date, "", "YYYYMMDD") + leaveData.slot;
    const oldScheduleDocRef = scheduleCollection.doc(oldScheduleDocid);
    const newScheduleDocid = leaveData.uid + formatDate(d.date, "", "YYYYMMDD") + d.slot;
    const newScheduleDocRef = scheduleCollection.doc(newScheduleDocid);
    const newScheduleDoc = await newScheduleDocRef.get();
    const newScheduleDocData = newScheduleDoc.data();

    if (leaveData.uid == context.auth.uid || userData.privilege.leaveApprove) {
      batch.update(leaveDoc, {
        date: d.date,
        slot: d.slot,
        type: d.type,
        remarks: FieldValue.arrayUnion(...d.remarks),
      });

      logData +=
          "HOLIDAY: " + actionUsername +
          " 修改了申請 - 由 [" +
          leaveData.name + "]" +
          leaveData.date +
          ":" +
          leaveData.slot +
          "(" +
          leaveData.type + ")" +
          " 至 " +
          d.date +
          ":" +
          d.slot +
          "(" +
          d.type + ")\n";

      if (leaveData.status == "批准") { // modify schedule if the leave is already approved, otherwise do nothing
        if (newScheduleDocData) { // modify existing schedule information
          batch.update(newScheduleDocRef, {
            type: d.type,
            leaveDocid: d.docid,
          });

          logData += "HOLIDAY: " +
          actionUsername +
          " 在[時間表] 修改了 " +
          d.date +
          ":" +
          d.slot +
          "(" +
          d.type + ")\n";
        } else { // add new schedule
          batch.set(newScheduleDocRef, {
            date: Timestamp.fromDate(new Date(d.date)),
            slot: d.slot,
            uid: d.uid,
            type: d.type,
            leaveDocid: d.docid,
          });

          logData += "HOLIDAY: " +
          actionUsername +
          " 在[時間表] 新增了 " +
          d.date +
          ":" +
          d.slot +
          "(" +
          d.type + ")\n";
        }

        // delete old schedule information
        batch.delete(oldScheduleDocRef);
        logData += "HOLIDAY: " +
        actionUsername +
        " 在[時間表] 重置了 " +
        leaveData.date +
        ":" +
        leaveData.slot + "\n";
      }
    } else {
      throw new functions.https.HttpsError(
          "unauthenticated",
          "only leave admin or leave owner can modify leave request",
      );
    }
  }

  return await batch.commit().then(() => {
    console.log(logData);
  });
});


// API 1.0 - modify a leave
exports.modifyLeave = functions.https.onCall(async (data, context) => {
  const docid = data.docid;
  /* const existingLeaveObject = {
      date: data.date,
      id: data.id,
      name: data.name,
      remarks: data.remarks,
      slot: data.slot,
      status: data.status,
      type: data.type,
      uid: data.uid,
      validity: data.validity,
    }; */

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
      .collection("leave")
      .doc(docid);
  const leave = await leaveDoc.get();
  const leaveData = leave.data();

  await leaveDoc.set(data).then(() => {
    console.log(
        "HOLIDAY: " + userData.name +
        " 修改了申請 - 由 [" +
        leaveData.name + "]" +
        leaveData.date +
        ":" +
        leaveData.slot +
        "(" +
        leaveData.type + ")" +
        " 至 " +
        data.date +
        ":" +
        data.slot +
        "(" +
        data.type + ")",
    );
  });

  const oldFirebaseDate = Timestamp.fromDate(
      new Date(leaveData.date),
  );
  const newFirebaseDate = Timestamp.fromDate(
      new Date(data.date),
  );

  const scheduleCollection = FireDB.collection("schedule");

  // find if timeslot is already occupied
  const oldScheduleDoc = await scheduleCollection
      .where("date", "==", oldFirebaseDate)
      .where("slot", "==", leaveData.slot)
      .where("uid", "==", leaveData.uid)
      .get();

  // load the matched documents in a tmp schedules array
  const oldSchedules = [];
  oldScheduleDoc.forEach((doc) => {
    const d = doc.data();
    d.id = doc.id;
    oldSchedules.push(d);
  });

  // it should have 1 entries (normal case, modify entry), or 0 entry if the holiday is modified after approve (do nothing)
  if (oldSchedules.length == 1) {
    await scheduleCollection.doc(oldSchedules[0].id).delete().then(()=>{
      console.log(
          "HOLIDAY: " +
        leaveData.name +
        " 在[時間表] 重置了 " +
        leaveData.date +
        ":" +
        leaveData.slot,
      );
    });
  }

  const newScheduleDoc = await scheduleCollection
      .where("date", "==", newFirebaseDate)
      .where("slot", "==", data.slot)
      .where("uid", "==", data.uid)
      .get();

  const newSchedules = [];
  newScheduleDoc.forEach((doc) => {
    const d = doc.data();
    d.id = doc.id;
    newSchedules.push(d);
  });

  // it should not have 0 or more than 2 entries, return with error
  if (newScheduleDoc.length > 1) {
    console.log("newSchedules");
    console.log(JSON.stringify(newSchedules));
    throw new functions.https.HttpsError(
        "already-exists",
        "duplicated entries found in schedule, please contact administrator",
    );
  }

  // existing schedule found, overwrite the type
  if (newScheduleDoc.length == 1) {
    return await scheduleCollection.doc(newSchedules[0].id).update({
      type: data.type,
      leaveDocid: docid,
    }).then(() => {
      console.log(
          "HOLIDAY: " +
        data.name +
        " 在[時間表] 修改了 " +
        data.date +
        ":" +
        data.slot +
        "(" +
        data.type + ")",
      );
      return Promise.resolve("Updated Schedule");
    });
  } else {
    // no existing entry found, creating new schedule
    return await scheduleCollection.doc(data.uid+formatDate(data.date, "", "YYYYMMDD")+data.slot).set({
      date: newFirebaseDate,
      slot: data.slot,
      uid: data.uid,
      type: data.type,
      leaveDocid: docid,
    }).then(()=>{
      console.log(
          "HOLIDAY: " +
        data.name +
        " 在[時間表] 新增了 " +
        data.date +
        ":" +
        data.slot +
        "(" +
        data.type + ")",
      );
      return Promise.resolve("Updated Schedule");
    });
  }
});

// API 1.0 - reject leave
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
      .collection("leave")
      .doc(docid);
  const leave = await leaveDoc.get();
  const leaveData = leave.data();

  if (remarks) leaveData.remarks.push("主任：" + remarks);
  leaveData.remarks.push("拒絕：" + currentDate.toLocaleDateString("HK"));
  leaveData.status = "拒絕";

  return await leaveDoc.set(leaveData).then(() => {
    console.log(
        userData.name +
          " rejected leave application of " +
          leaveData.name +
          " on " +
          leaveData.date +
          " with slot " +
          leaveData.slot +
          " and type " +
          leaveData.type,
    );
  });
});

// API 2.0 - reject leave by docid
exports.rejectLeaveByDocid = functions.https.onCall(async (data, context) => {
  const user = await FireDB.collection("users").doc(context.auth.uid).get();
  const userData = user.data();

  if (!context.auth.uid) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated user can access this function",
    );
  }

  if (userData.privilege.leaveApprove != true) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only leave admin can reject leave request",
    );
  }

  const currentDate = new Date();
  // offset 8 hours to hk time
  currentDate.setTime(currentDate.getTime() + 8 * 60 * 60 * 1000);

  let logData = "";
  const batch = FireDB.batch();

  for (const d of data) {
    const leaveDoc = FireDB.collection("leave").doc(d.docid);

    batch.update(leaveDoc, {
      remarks: FieldValue.arrayUnion(...d.remarks),
      status: d.status,
    });

    logData += "HOLIDAY: " + userData.name +
            " 拒絕了 " +
            d.name +
            " 於 " +
            d.date +
            " 時段 " +
            d.slot +
            " 假期種類 " +
            d.type + "\n";
  }

  return await batch.commit().then((result) => {
    console.log(logData);
  });
});

// API 1.0 - add a leave application
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
  // const leaveCollection = FireDB.collection("leave");
  // only authenticated can proceed
  if (!context.auth.uid) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated user can access this function",
    );
  }

  const batch = FireDB.batch();
  let logData = "";
  let leaveDoc;
  data.forEach((d) => {
    leaveDoc = FireDB.collection("leave").doc();
    batch.set(leaveDoc, d);
    logData += "HOLIDAY: " + d.name + " 申請了 " + d.date + ":" + d.slot + "(" + d.type + ")\n";
  });

  return await batch.commit().then(() => {
    console.log(logData);
  });
});

/*
exports.setCarryOverHoliday = functions.https.onCall(async (data, context) => {
  if (!context.auth.uid) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated user can save year-end holiday",
    );
  }
  const yearEnd = moment.utc("2021-03-31");
  return FireDB.collection("leave").doc("config").update({
    [context.auth.uid]: [{
      date: yearEnd.endOf("month"),
      al: 28,
    }],
  });
});
*/

// API 1.0 - Listen for changes in all documents in the 'leave' collection and update dashboard
exports.updatePendingCount = functions.firestore
    .document("leave/{leaveId}")
    .onWrite(async (change, context) => {
      if (change.before.exists) { // update of record
        // delete record / approve / reject
        if (!change.after.exists || (change.before.data().status == "未批" && change.after.data().status != "未批")) {
          const pendingDoc = await FireDB.collection("dashboard").doc("notification").get();
          let pending = pendingDoc.data().leave_waitingForApproval;
          pending -= 1;
          console.log("HOLIDAY: 待審批 " + pending);
          return FireDB.collection("dashboard").doc("notification").update(
              {
                leave_waitingForApproval: FieldValue.increment(-1),
              });
          // change back to un-approved
        } else if (change.before.data().status != "未批" && change.after.data().status == "未批") {
          const pendingDoc = await FireDB.collection("dashboard").doc("notification").get();
          let pending = pendingDoc.data().leave_waitingForApproval;
          pending += 1;
          console.log("HOLIDAY: 待審批 " + pending);
          return FireDB.collection("dashboard").doc("notification").update(
              {
                leave_waitingForApproval: FieldValue.increment(1),
              });
        }
      } else { // add new record
        if (change.after.data().status == "未批") {
          await FireDB.collection("dashboard").doc("notification").update(
              {
                leave_waitingForApproval: FieldValue.increment(1),
              }); // send email notification
          const pendingDoc = await FireDB.collection("dashboard").doc("notification").get();
          const pending = pendingDoc.data().leave_waitingForApproval;
          console.log("HOLIDAY: 待審批 " + pending);
          let slot;
          switch (change.after.data().slot) {
            case "slot_a":
              slot = "(早)";
              break;
            case "slot_b":
              slot = "(午)";
              break;
            case "slot_c":
              slot = "(晚)";
              break;
          }
          const emailSubject = change.after.data().name + "申請了" + change.after.data().type + "{" + formatDate(change.after.data().date, "/", "DDMMYYYY") + slot + "}";
          return FireDB.collection("mail").add({
            to: "zoe@cciyc.com",
            message: {
              subject: emailSubject,
              html: emailSubject,
            },
          });
        }
      }
      console.log("待審批不變: 由 " + JSON.stringify(change.before.data()) + " 改為: " + JSON.stringify(change.after.data()));
      // return Promise.reject(new Error("updatePendingCount: Direct DB modification/deletion or Unhandled Case."));
    });


exports.updateALBalance = functions.pubsub.schedule("0 0 1 * *").timeZone("Asia/Hong_Kong").onRun(async (context) => {
  const usersDocRef = FireDB.collection("users");
  const usersDoc = await usersDocRef.where("privilege.tmp", "==", false).where("privilege.systemAdmin", "==", false).get();
  const userData = [];
  const leaveData = [];
  const salLeaveData = [];

  const leaveDocRef = FireDB.collection("leave");
  const leaveDoc = await leaveDocRef.where("status", "==", "批准").where("validity", "==", true).where("type", "==", "AL").orderBy("uid").get();
  const salLeaveDoc = await leaveDocRef.where("status", "==", "批准").where("validity", "==", true).where("type", "==", "SAL").orderBy("uid").get();
  usersDoc.forEach((doc) => {
    userData.push(doc.data());
  });
  leaveDoc.forEach((doc) => {
    leaveData.push(doc.data());
  });
  salLeaveDoc.forEach((doc) => {
    salLeaveData.push(doc.data());
  });
  const batch = FireDB.batch();
  const leaveConfigRef = FireDB.collection("dashboard").doc("leaveConfig");
  const leaveConfigDoc = await leaveConfigRef.get();
  const leaveConfigData = leaveConfigDoc.data();
  const tiersConfig = [0, 5, 8, 10, 12];

  for (const usr of userData) {
    const tiers = leaveConfigData[usr.rank];
    const salBeginBalance = leaveConfigData[usr.uid][0].sal? leaveConfigData[usr.uid][0].sal:0;
    const today = new Date();
    const entryDate = new Date(usr.dateOfEntry.toDate().getTime() + 28800000);
    const systemMonthStart = new Date(2021, 3, 1);
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    let counter = systemMonthStart;
    let leaveGain = 0;
    do {
      // year difference, and month difference, then calculate exact year difference
      const yearDiff = counter.getFullYear() - entryDate.getFullYear();
      const monthDiff = counter.getMonth() - entryDate.getMonth();
      const yearServed = Math.floor((yearDiff*12 + monthDiff)/12);
      let tier = 0;
      for (let j = tiersConfig.length; j > 0; j--) {
        if (yearServed >= tiersConfig[j - 1]) {
          tier = tiers["t" + j];
          break;
        }
      }

      // console.log("yearServed:" + yearServed + " dateOfEntry:" + entryDate + " counter:" + counter + " tier:" + tier);
      leaveGain += tier/12;
      counter = new Date(counter.getFullYear(), counter.getMonth()+1, 1);
    } while (counter <= thisMonthStart);

    // console.log(usr.name + " date diff: " + yearDiff + ":" + monthDiff + ":" + diff );
    const ALTaken = leaveData.filter((row) => row.uid == usr.uid).length/2;
    const alBalance = parseFloat(leaveConfigData[usr.uid][0]["al"]) + parseFloat(leaveGain) - parseFloat(ALTaken);
    // console.log(usr.name + "[" + usr.rank + ":" + tier + "]: " + ALTaken);
    // console.log(usr.name + " starts with " + leaveConfigData[usr.uid][0]["al"] + " gained " + leaveGain + " ALTaken " + ALTaken + " balance: " + alBalance);
    /* leaveData.forEach((data) => {
      if (data.uid == usr.uid) {
        console.log(data.date + "[" + data.slot + "]");
      }
    });
    */
    const salBalance = parseFloat(salBeginBalance) - parseFloat(salLeaveData.filter((element) => element.uid == usr.uid).length/2);
    const ref = FireDB.collection("users").doc(usr.uid);
    const refData = await ref.get();
    batch.update(ref, {
      balance: {
        al: alBalance,
        sal: salBalance,
        ot: refData.data().balance.ot,
      },
    });
  }

  // console.log(JSON.stringify(leaveData));

  return await batch.commit().then(() => {
    console.log("AL / SAL Balance updated at: " + new Date());
  });
});
