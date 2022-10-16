/* eslint-disable max-len */
const {functions, FireDB, Timestamp, admin} = require("./fbadmin");
const {formatDate} = require("./utilities");

exports.setCustomClaims = functions.region("asia-east2").https.onCall(async (data, context) => {
  // context.app will be undefined if the request doesn't include an
  // App Check token. (If the request includes an invalid App Check
  // token, the request will be rejected with HTTP error 401.)
  if (context.app == undefined) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called from an App Check verified app.");
  }

  // only authenticated users can run this
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add requests",
    );
  }

  const loginUserDoc = await FireDB.collection("users").doc(context.auth.uid).get();
  const loginUserData = loginUserDoc.data();
  if (!loginUserData.privilege.systemAdmin) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only system admin can run upgrade",
    );
  }

  const customClaims = {
    "https://hasura.io/jwt/claims": {
      "x-hasura-default-role": "user",
      "x-hasura-allowed-roles": ["user"],
      "x-hasura-user-id": context.auth.uid,
    },
  };
  return await admin.auth().setCustomUserClaims(context.auth.uid, customClaims).then(() => {
    console.log(context.auth.uid + " customClaims updated");
  });
});

// API 2.0 - add SAL deadline to 3 user objects
exports.addSALDeadline = functions.https.onCall(async (data, context) => {
  // only authenticated users can run this
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add requests",
    );
  }

  const loginUserDoc = await FireDB.collection("users").doc(context.auth.uid).get();
  const loginUserData = loginUserDoc.data();
  if (!loginUserData.privilege.systemAdmin) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only system admin can run upgrade",
    );
  }

  const deadlineObject = [{
    uid: "d5UWT37p2oa7kkJ456TvT99sjbg2", // shan
    salDeadline: Timestamp.fromDate(new Date("2022/03/31")),
  },
  {
    uid: "wTelpJkzn7ciLTgMkRFOchXWnUg1", // liman
    salDeadline: Timestamp.fromDate(new Date("2027/03/31")),
  }, {
    uid: "90c33aVe0QhLispvCV4CsZP8pzP2", // sheung
    salDeadline: Timestamp.fromDate(new Date("2024/03/31")),
  }];
  const batch = FireDB.batch();

  deadlineObject.forEach((obj) => {
    const ref = FireDB.collection("users").doc(obj.uid);
    batch.update(ref, {salDeadline: obj.salDeadline});
  });

  return await batch.commit().then(()=> {
    console.log("SAL Deadline added");
  });
});

// migrate OT balance from dashboard to user object
exports.migrateOTBalance = functions.https.onCall(async (data, context) => {
  // only authenticated users can run this
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add requests",
    );
  }

  const loginUserDoc = await FireDB.collection("users").doc(context.auth.uid).get();
  const loginUserData = loginUserDoc.data();
  if (!loginUserData.privilege.systemAdmin) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only system admin can run upgrade",
    );
  }
  const batch = FireDB.batch();
  const otConfig = await FireDB.collection("dashboard").doc("otConfig").get();
  const usersDocRef = FireDB.collection("users");
  const usersDoc = await usersDocRef.get();
  usersDoc.forEach((doc) => {
    const userRef = FireDB.collection("users").doc(doc.id);
    let otValue;
    if (isNaN(otConfig.data().balance[doc.id])) {
      otValue = 0;
    } else {
      otValue = otConfig.data().balance[doc.id];
    }
    console.log("otValue:" + otValue);
    batch.update(userRef, {
      balance: {
        ot: Number(otValue),
        al: doc.data().balance.al,
        sal: doc.data().balance.sal,
      },
    });
  });
  return await batch.commit().then(()=> {
    console.log("OT data copied to user object");
  });
});

// reshape user object in 2.0 rollout
exports.upgradeUserObject = functions.https.onCall(async (data, context) => {
  // only authenticated users can run this
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add requests",
    );
  }

  const loginUserDoc = await FireDB.collection("users").doc(context.auth.uid).get();
  const loginUserData = loginUserDoc.data();
  if (!loginUserData.privilege.systemAdmin) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only system admin can run upgrade",
    );
  }

  const batch = FireDB.batch();
  const usersDocRef = FireDB.collection("users");
  const usersDoc = await usersDocRef.get();
  usersDoc.forEach((doc) => {
    const docData = doc.data();
    let change = false;
    if (! ("dateOfEntry" in docData)) {
      docData.dateOfEntry = new Date();
      change = true;
    }

    if (! ("defaultSchedule" in docData)) {
      docData.defaultSchedule = ["", "", "", "", "1", "2", "", "3", "4", "", "5", "6", "", "7", "8", "", "9", "10", "11", "", ""];
      change = true;
    }

    if (! ("email" in docData)) {
      docData.email = "";
      change = true;
    }

    if (! ("name" in docData)) {
      docData.name = "";
      change = true;
    }

    if (! ("order" in docData)) {
      docData.order = 0;
      change = true;
    }

    if (! ("rank" in docData)) {
      docData.rank = "tmp";
      change = true;
    }

    if (! ("uid" in docData)) {
      docData.uid = doc.docid;
      change = true;
    }

    if (! ("enable" in docData)) {
      docData.enable = true;
      change = true;
    }

    if (! ("balance" in docData)) {
      docData.balance = {
        al: 0,
        sal: 0,
        ot: 0,
      };
      change = true;
    }

    if (! ("al" in docData.balance)) {
      docData.balance = {
        al: 0,
        ...docData.balance,
      };
      change = true;
    }

    if (! ("sal" in docData.balance)) {
      docData.balance = {
        sal: 0,
        ...docData.balance,
      };
      change = true;
    }

    if (! ("ot" in docData.balance)) {
      docData.balance = {
        ot: 0,
        ...docData.balance,
      };
      change = true;
    }

    if (! ("tmp" in docData.privilege)) {
      docData.privilege = {
        tmp: false,
        ...docData.privilege,
      };
      change = true;
    }

    if (change) {
      batch.update(FireDB.collection("users").doc(doc.id), docData);
    }
  });

  const changes = batch._ops.length;
  return await batch.commit().then(() => {
    if (changes > 0) {
      console.log("ADMIN: " + changes + " Users Profile updated at " + new Date());
    } else {
      console.log("ADMIN: No Users Profiles Updated");
    }
  });
});

// API 2.0 - find dangling approved holiday
exports.findDanglingHoliday = functions.https.onCall(async (data, context) => {
  // only authenticated users can run this
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add requests",
    );
  }

  const loginUserDoc = await FireDB.collection("users").doc(context.auth.uid).get();
  const loginUserData = loginUserDoc.data();
  if (!loginUserData.privilege.systemAdmin) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only system admin can list dangling holiday",
    );
  }

  const leaveDoc = await FireDB.collection("leave").where("type", "==", "AL").where("status", "==", "批准").get();
  const leaveData = [];
  leaveDoc.forEach((doc) => {
    leaveData.push({
      docid: doc.id,
      ...doc.data()});
  });

  const scheduleDoc = await FireDB.collection("schedule").where("type", "==", "AL").where("leaveDocid", "!=", "").get();
  const scheduleData = [];
  scheduleDoc.forEach((doc) => {
    scheduleData.push(doc.data());
  });

  // console.log("leaveData: " + JSON.stringify(leaveData));
  // console.log("scheduleData: " + JSON.stringify(scheduleData));
  for (let i = 0; i < leaveData.length; i++) {
    for (let j = 0; j < scheduleData.length; j++) {
      if (leaveData[i].docid == scheduleData[j].leaveDocid) {
        leaveData.splice(i, 1);
      }
    }
  }

  console.log("leaveDataDangling: " + JSON.stringify(leaveData));
  const batch = FireDB.batch();

  leaveData.forEach((data) => {
    const ref = FireDB.collection("leave").doc(data.docid);
    batch.delete(ref);
  });

  return await batch.commit().then(() => {
    return leaveData;
  });
});

// API 2.0 - add new staff rank
exports.addNewRank = functions.https.onCall(async (data, context) => {
  // only authenticated users can run this
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add requests",
    );
  }

  const loginUserDoc = await FireDB.collection("users").doc(context.auth.uid).get();
  const loginUserData = loginUserDoc.data();
  if (!loginUserData.privilege.userManagement) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only user admin can add ranks",
    );
  }
  const leaveConfigRef = FireDB.collection("dashboard").doc("leaveConfig");
  // const leaveConfigDoc = await leaveConfigRef.get();

  return await leaveConfigRef.update({
    [data.rank]: {
      t1: data.t1,
      t2: data.t2,
      t3: data.t3,
      t4: data.t4,
      t5: data.t5,
    },
  });
});

// API 2.0 - update leave balance
exports.updateLeaveBalance = functions.https.onCall(async (data, context) => {
  const DEBUG = false;
  // only authenticated users can run this
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add requests",
    );
  }

  const loginUserDoc = await FireDB.collection("users").doc(context.auth.uid).get();
  const loginUserData = loginUserDoc.data();
  if (!loginUserData.privilege.systemAdmin) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only system admin can run upgrade",
    );
  }

  // const batch = FireDB.batch();
  const usersDocRef = FireDB.collection("users");
  const usersDoc = await usersDocRef.where("privilege.tmp", "==", false).where("privilege.systemAdmin", "==", false).get();
  const userData = [];
  const allLeaveData = [];
  const salLeaveData = [];
  const recordEnd = new Date();
  recordEnd.setTime(new Date(recordEnd.getFullYear(), recordEnd.getMonth()+1, 1, 0, 0, 0) - 1);
  if (DEBUG) console.log(recordEnd);

  const leaveDocRef = FireDB.collection("leave");
  const leaveDoc = await leaveDocRef.where("status", "==", "批准").where("validity", "==", true).where("type", "==", "AL").orderBy("uid").get();
  const salLeaveDoc = await leaveDocRef.where("status", "==", "批准").where("validity", "==", true).where("type", "==", "SAL").orderBy("uid").get();
  usersDoc.forEach((doc) => {
    userData.push(doc.data());
  });
  leaveDoc.forEach((doc) => {
    allLeaveData.push(doc.data());
  });
  salLeaveDoc.forEach((doc) => {
    salLeaveData.push(doc.data());
  });
  if (DEBUG) console.log("before filter: " + allLeaveData.length);
  const leaveData = allLeaveData.filter((record) => Date.parse(record.date) < recordEnd.getTime());
  if (DEBUG) console.log("after filter: " + leaveData.length);

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

      if (DEBUG) console.log("yearServed:" + yearServed + " dateOfEntry:" + entryDate + " counter:" + counter + " tier:" + tier);
      if (DEBUG) console.log(usr.name + " date diff: " + yearDiff + ":" + monthDiff + ":" + monthDiff );
      if (DEBUG) console.log(usr.name + "[" + usr.rank + ":" + tier + "]: " + ALTaken);
      leaveGain += tier/12;
      counter = new Date(counter.getFullYear(), counter.getMonth()+1, 1);
    } while (counter <= thisMonthStart);

    const ALTaken = leaveData.filter((row) => row.uid == usr.uid).length/2;
    const alBalance = parseFloat(leaveConfigData[usr.uid][0]["al"]) + parseFloat(leaveGain) - parseFloat(ALTaken);
    const salBalance = parseFloat(salBeginBalance) - parseFloat(salLeaveData.filter((element) => element.uid == usr.uid).length/2);
    if (DEBUG) {
      console.log(usr.name + " starts with " + leaveConfigData[usr.uid][0]["al"] + " gained " + leaveGain + " ALTaken " + ALTaken + " balance: " + alBalance);
      leaveData.forEach((data) => {
        if (data.uid == usr.uid) {
          console.log(data.date + "[" + data.slot + "]");
        }
      });
    }

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

  if (DEBUG) console.log(JSON.stringify(leaveData));

  return await batch.commit().then(() => {
    console.log("ALBalance updated at: " + new Date());
  });
});

// API 2.0 - show leave balance calculation
exports.calculateLeaveBalance = functions.https.onCall(async (data, context) => {
  // only authenticated users can run this
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add requests",
    );
  }

  const loginUserDoc = await FireDB.collection("users").doc(context.auth.uid).get();
  const loginUserData = loginUserDoc.data();
  if (!loginUserData.privilege.systemAdmin) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only system admin can run upgrade",
    );
  }

  // const batch = FireDB.batch();
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
    salLeaveData.push({
      docid: doc.id,
      ...doc.data(),
    });
  });
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

    // console.log(usr.name);
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

    const ALTaken = leaveData.filter((row) => row.uid == usr.uid).length/2;
    const alBalance = parseFloat(leaveConfigData[usr.uid][0]["al"]) + parseFloat(leaveGain) - parseFloat(ALTaken);

    // debug printout
    console.log(usr.name + " starts with " + leaveConfigData[usr.uid][0]["al"] + " gained " + leaveGain + " ALTaken " + ALTaken + " balance: " + alBalance);
    leaveData.forEach((data) => {
      if (data.uid == usr.uid) {
        console.log(data.date + "[" + data.slot + "]");
      }
    });

    console.log(usr.name + " SAL balance: initial " + salBeginBalance);
    salLeaveData.forEach((data) => {
      if (data.uid == usr.uid) {
        console.log(data.docid + " " + data.date + "[" + data.slot + "]");
      }
    });
    console.log("Total SAL date: " + salLeaveData.filter((element) => element.uid == usr.uid).length/2);
  }
});

// upgrade user privilege object
exports.upgradePrivilege = functions.https.onCall(async (data, context) => {
  // only authenticated users can run this
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add requests",
    );
  }

  const users = [];
  const userDoc = await FireDB.collection("users").get();

  userDoc.forEach((doc) => {
    users.push(doc.data());
  });

  const batch = FireDB.batch();
  users.forEach((user) => {
    let newSal = false;
    if (user.sal === undefined) {
      newSal = false;
    } else {
      newSal = user.sal;
    }

    let newScheduleModify = false;
    if (user.admin === undefined) {
      newScheduleModify = false;
    } else {
      newScheduleModify = user.admin;
    }

    let newSystemAdmin = false;
    if (user.hidden === undefined) {
      newSystemAdmin = false;
    } else {
      newSystemAdmin = user.hidden;
    }
    user.privilege = {
      leaveApprove: false,
      leaveManage: false,
      logViewer: false,
      sal: newSal,
      scheduleModify: newScheduleModify,
      systemAdmin: newSystemAdmin,
    };
    delete user.admin;
    delete user.hidden;
    delete user.leaveAdmin;
    delete user.sal;

    const ref = FireDB.collection("users").doc(user.uid);
    batch.set(ref, user);
  });
  batch.commit();
});

// attach holiday to schedule
exports.attachHoliday = functions.https.onCall(async (data, context) => {
  // only authenticated users can run this
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add requests",
    );
  }

  const holidays = [];
  const holidayDoc = await FireDB.collection("leave").get();

  holidayDoc.forEach((doc) => {
    const d = doc.data();
    d.docid = doc.id;
    if (d.status == "批准") {
      holidays.push(d);
    }
  });
  const batch = FireDB.batch();
  let count = 0;
  const scheduleCollection = FireDB.collection("schedule");
  for (const doc of holidays) {
    const scheduleDocid = doc.uid + formatDate(doc.date, "", "YYYYMMDD") + doc.slot;
    const scheduleDoc = await scheduleCollection.doc(scheduleDocid).get();
    const ref = scheduleCollection.doc(scheduleDocid);

    if (scheduleDoc.exists && scheduleDoc.data().type === doc.type) {
      batch.update(ref, {
        leaveDocid: doc.docid,
      });
      count++;
    }
  }
  batch.commit().then(() => {
    console.log("ADMIN-ATTACHHOLIDAY: total approved holidays: " + holidays.length);
    console.log("ADMIN-ATTACHHOLIDAY: total updated schedule: " + count);
    Promise.resolve("Successfully attached holiday to schedules");
  });
});

// remove NaN schedules
exports.deleteNaNSchedule = functions.https.onCall(async (data, context) => {
  // only authenticated users can run this
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add requests",
    );
  }

  const schedule = [];
  const scheduleDocid = [];
  const newScheduleDocid = [];
  const scheduleDoc = await FireDB.collection("schedule").get();

  scheduleDoc.forEach((doc) => {
    const d = doc.data();
    if (doc.id.includes("NaN")) {
      scheduleDocid.push(doc.id);
      schedule.push(d);
    }
  });
  console.log("dataset: " + JSON.stringify(schedule));
  console.log("datasize: " + schedule.length);

  // create a batch
  let batch = FireDB.batch();
  for (let i=0; i < schedule.length; i++) {
    // delete old record
    const ref = FireDB.collection("schedule").doc(scheduleDocid[i]);
    batch.delete(ref);
  }
  await batch.commit();
  batch = FireDB.batch();
  for (let i=0; i < schedule.length; i++) {
    const dateString = new Date(schedule[i].date.toMillis());
    const newDocid = schedule[i].uid + formatDate(dateString, "", "YYYYMMDD") + schedule[i].slot;
    console.log(newDocid);
    newScheduleDocid.push(newDocid);
    const newRef = FireDB.collection("schedule").doc(newDocid);
    console.log("ref:" + JSON.stringify(newRef));
    batch.set(newRef, {...schedule[i]});
  }
  console.log("updated dataset: " + JSON.stringify(newScheduleDocid));
  console.log("updated datasize: " + newScheduleDocid.length);
  await batch.commit();
});

// API 2.0 - housekeep schedule docid
exports.housekeepSchedule = functions.https.onCall(async (data, context) => {
  // only authenticated users can run this
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add requests",
    );
  }

  const schedule = [];
  const users = [];
  const scheduleDoc = await FireDB.collection("schedule").get();
  const userDoc = await FireDB.collection("users").get();

  userDoc.forEach((doc) => {
    users.push(doc);
  });

  scheduleDoc.forEach((doc) => {
    let invalidEntry = true;
    users.forEach((usr) => {
      if (doc.id.includes(usr.id)) {
        invalidEntry = false;
      }
    });

    if (invalidEntry) {
      console.log(doc.id);
      const d = doc.data();
      d.docid = doc.id;
      schedule.push(d);
    }
  });

  console.log("datasize: " + schedule.length);

  // create a batch
  let batch = FireDB.batch();
  for (let i=0; i < schedule.length; i++) {
    // formulate the new document id format
    const dateString = new Date(schedule[i].date.toMillis());
    const newDocid = schedule[i].uid + formatDate(dateString, "", "YYYYMMDD") + schedule[i].slot;

    // delete old record
    const ref = FireDB.collection("schedule").doc(schedule[i].docid);
    batch.delete(ref);

    const newRef = FireDB.collection("schedule").doc(newDocid);
    const newRefDoc = await newRef.get();

    if (newRefDoc.data()) {
      console.log("[ADMIN] housekeepSchedule: " + JSON.stringify(newRefDoc.data()));
    } else {
      // if the type is empty, skip making new record
      if (schedule[i].type != "") {
        delete schedule[i].docid;
        batch.set(newRef, schedule[i]);
      }
    }
    // commit a batch once every 200 items (200 delete + 200 update)
    if ((i + 1) % 199 === 0) {
      await batch.commit();
      batch = FireDB.batch();
    }
  }

  // For committing final batch
  if (!(schedule.length % 499) == 0) {
    return await batch.commit().then(() => {
      return schedule;
    });
  }
});

// API 1.0 - http callable function (adding an activity)
exports.mergeActivity = functions.https.onCall(async (data, context) => {
  // only authenticated users can run this
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add requests",
    );
  }
  // grab collections & overview pointers
  const activityCollection = FireDB.collection("activity");
  const activityOverviewCollection = FireDB
      .collection("activityOverview");

  const activityDoc = await activityCollection.get();
  const activities = [];
  activityDoc.forEach((doc) => {
    activities.push(doc.id);
  });
  // console.log(activities);
  for (const act of activities) {
    const batch = FireDB.batch();
    const activityOverviewDoc = await activityOverviewCollection
        .where("docid", "==", act)
        .get();
    const customName = [];
    const pendingDelete = [];
    activityOverviewDoc.docs.forEach((doc) => {
      pendingDelete.push(doc.id);
      customName.push({
        date: doc.data().date,
        customName: doc.data().customName,
      });
    });

    const ref = activityCollection.doc(act);
    batch.update(ref, {
      date: customName,
    });

    pendingDelete.forEach((d) => {
      const ref = activityOverviewCollection.doc(d);
      batch.delete(ref);
    });
    batch.commit();
  }
});

// API 1.0 - move leaveConfig
exports.moveLeaveConfig = functions.https.onCall(async (data, context) => {
  const oldLeaveConfigDoc = FireDB.collection("leave").doc("config");
  const oldLeaveConfig = await oldLeaveConfigDoc.get();
  const oldLeaveConfigData = oldLeaveConfig.data();
  const newLeaveConfigDoc = FireDB.collection("dashboard").doc("leaveConfig");
  return await newLeaveConfigDoc.set({...oldLeaveConfigData}).then(() => {
    oldLeaveConfigDoc.delete();
  });
});

// API 1.0 - manual administration function
exports.adminFunc = functions.https.onCall(async (data, context) => {
  const oldUID = data.oldUID;
  const newUID = data.newUID;
  console.log("converting " + oldUID + " to " + newUID);
  const batch = FireDB.batch();
  const userCollection = FireDB.collection("users");

  const scheduleDoc = FireDB.collection("schedule");
  let docCount = 0;
  const docList = [];
  scheduleDoc
      .where("uid", "==", oldUID)
      .get()
      .then((doc) => {
        doc.forEach((d) => {
          docCount++;
          docList.push(d);
        });

        docList.forEach((d) => {
          const ref = scheduleDoc.doc(d.id);
          batch.update(ref, {
            uid: newUID,
          });
        });

        if (batch._writes.length > 0) {
          batch.commit().then(() => {
            console.log(
                "AdminFunc UID " +
              oldUID +
              " has " +
              docCount +
              " schedules coverted to new UID " +
              newUID,
            );
          });
        }
      });

  const activityBatch = FireDB.batch();
  const activityCollection = FireDB.collection("activity");
  let actCount = 0;
  const actList = [];
  activityCollection
      .where("uid", "==", oldUID)
      .get()
      .then((doc) => {
        doc.forEach((d) => {
          actCount++;
          actList.push(d);
        });

        actList.forEach((d) => {
          const ref = scheduleDoc.doc(d.id);
          activityBatch.update(ref, {
            uid: newUID,
          });
        });

        if (actCount > 0) {
          activityBatch.commit().then(() => {
            console.log(
                "AdminFunc UID " +
            oldUID +
            " has " +
            actCount +
            " activities records coverted to new UID " +
            newUID,
            );
            userCollection.doc(oldUID).delete();
            console.log("Cleaning up oldUID account: " + oldUID);
          });
        }
      });
});

// API 1.0 - used during system migration
exports.convertNewSystem = functions.https.onCall(async (data, context) => {
  const oldUID = data.oldUID;
  const newUID = data.newUID;

  const userCollection = FireDB.collection("users");
  console.log("auto migrating " + oldUID + " to " + newUID);
  const userDoc = await userCollection.where("uid", "==", oldUID).get();
  console.log("userCount: " + userDoc.size);
  let userObject;
  userDoc.forEach((d) => {
    if (d.data().uid == oldUID) {
      userObject = {
        admin: d.data().admin,
        defaultSchedule: d.data().defaultSchedule,
        email: d.data().email,
        hidden: d.data().hidden,
        name: d.data().name,
        order: d.data().order,
        sal: d.data().sal,
        uid: newUID,
      };
    }
  });
  await userCollection.doc(newUID).set(userObject);

  const scheduleBatch = FireDB.batch();
  const scheduleCollection = FireDB.collection("schedule");

  const scheduleDoc = await scheduleCollection.where("uid", "==", oldUID).get();
  console.log("scheduleSize: " + scheduleDoc.size);
  scheduleDoc.forEach((d) => {
    const ref = scheduleCollection.doc(d.id);
    scheduleBatch.update(ref, {
      uid: newUID,
    });
  });
  scheduleBatch.commit().then(() => {
    console.log(
        "UID " +
    oldUID +
    " has " +
    scheduleDoc.size +
    " schedules coverted to new UID " +
    newUID,
    );
  });

  const activityBatch = FireDB.batch();
  const activityCollection = FireDB.collection("activity");

  const activityDoc = await activityCollection.where("uid", "==", oldUID).get();
  activityDoc.forEach((d) => {
    const ref = activityCollection.doc(d.id);
    activityBatch.update(ref, {
      uid: newUID,
    });
  });

  activityBatch.commit().then(() => {
    console.log(
        "UID " +
    oldUID +
    " has " +
    activityDoc.size +
    " activities records coverted to new UID " +
    newUID,
    );
    userCollection.doc(oldUID).delete();
    console.log("Cleaning up oldUID account: " + oldUID);
  });
});
