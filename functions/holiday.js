/* eslint-disable max-len */
const {functions, FireDB, FieldValue, Timestamp} = require("./fbadmin");
const {formatDate} = require("./utilities");

/* testing cloud function to read holiday file from storage
exports.getPublicHoliday = functions.region("asia-east2").https.onCall(async (data, context) => {
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
        "only authenticated user can access this function",
    );
  }
  const {Storage} = require("@google-cloud/storage");
  const storage = new Storage();
  const myBucket = storage.bucket("manage-hr.appspot.com");
  const file = myBucket.file("tc.json");
  const content = await file.download();
  const jsonContent = JSON.parse(content.toString());
  console.log(jsonContent);
  // return fetch("https://www.1823.gov.hk/common/ical/tc.json").then((res) => res.json()).then((data) => data);
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

// API 2.0 - approve a leave by docid
exports.approveLeaveByDocid = functions.region("asia-east2").https.onCall(async (data, context) => {
  // App Check token. (If the request includes an invalid App Check
  // token, the request will be rejected with HTTP error 401.)
  if (context.app == undefined) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called from an App Check verified app.");
  }

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

// API 2.0 - reject leave by docid
exports.rejectLeaveByDocid = functions.region("asia-east2").https.onCall(async (data, context) => {
  // App Check token. (If the request includes an invalid App Check
  // token, the request will be rejected with HTTP error 401.)
  if (context.app == undefined) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called from an App Check verified app.");
  }

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

// API 1.0/2.0 - Listen for changes in all documents in the 'leave' collection and update dashboard
exports.updatePendingCount = functions.region("asia-east2").firestore
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

// API 2.0 Scheduled task to updated AL Balance
exports.updateALBalance = functions.region("asia-east2").pubsub.schedule("0 0 1 * *").timeZone("Asia/Hong_Kong").onRun(async (context) => {
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


// API 2.0 - add a leave application
exports.addLeave = functions.region("asia-east2").https.onCall(async (data, context) => {
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
