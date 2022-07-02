/* eslint-disable max-len */
const {functions, FireDB, Timestamp} = require("./fbadmin");
const {formatDate} = require("./utilities");
// API 2.0 - add temp staff
exports.addTempStaff = functions.https.onCall(async (data, context) => {
  // only authenticated users can run this
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add requests",
    );
  }

  // only user management can run this
  const loginUserDoc = FireDB
      .collection("users")
      .doc(context.auth.uid);
  const loginUser = await loginUserDoc.get();
  const loginUserData = loginUser.data();
  if (loginUserData.privilege.userManagement != true) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only user management admin can add temp users",
    );
  }

  const newStaff = JSON.parse(JSON.stringify(data));
  const users = await FireDB.collection("users").where("privilege.tmp", "==", true).get();
  const userCount = users.docs.length + 100;
  const tempUserCount = users.docs.length + 1;
  const entryTimestamp = Timestamp.fromDate(new Date(newStaff.dateOfEntry));

  const newDocRef = FireDB.collection("users").doc();

  newStaff.uid = newDocRef.id;
  newStaff.dateOfEntry = entryTimestamp;
  newStaff.order = userCount;

  return await newDocRef.set(newStaff).then(() => {
    console.log("USERS: " + context.auth.token.name + "新增了臨時員工" + data.name);
    console.log("USERS: 臨時員工總數 - " + tempUserCount);
  });
});

// API 2.0 - add temp staff
exports.delTempStaff = functions.https.onCall(async (data, context) => {
  // only authenticated users can run this
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add requests",
    );
  }

  // only user management can run this
  const loginUserDoc = FireDB
      .collection("users")
      .doc(context.auth.uid);
  const loginUser = await loginUserDoc.get();
  const loginUserData = loginUser.data();
  if (loginUserData.privilege.userManagement != true) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only user management admin can delete temp users",
    );
  }

  let batch = FireDB.batch();

  let logData = "";
  let scheduleCount = 0;
  for (const d of data) {
    const userRef = FireDB.collection("users").doc(d.uid);
    batch.delete(userRef);
    logData += d.name + " ";

    // commit a batch once every 200 items (200 delete + 200 update)
    if (batch._ops.length == 200) {
      await batch.commit();
      batch = FireDB.batch();
    }

    const scheduleDoc = await FireDB.collection("schedule").where("uid", "==", d.uid).get();
    for (const doc of scheduleDoc.docs) {
      const scheduleRef = FireDB.collection("schedule").doc(doc.id);
      batch.delete(scheduleRef);
      scheduleCount++;
      // commit a batch once every 200 items (200 delete + 200 update)
      if (batch._ops.length == 200) {
        await batch.commit();
        batch = FireDB.batch();
      }
    }
  }

  return await batch.commit().then(() => {
    console.log("USERS: " + context.auth.token.name + "刪除了臨時員工" + logData + ". 移除了" + scheduleCount + "項更表記錄.");
  });
});

// API 1.0 - auth trigger (new user signup)
exports.newUserSignUp = functions.auth.user().onCreate((user) => {
  // for background triggers you must return a value/promise
  return FireDB
      .collection("users")
      .get()
      .then((users) => {
        const userCount = users.docs.length + 1;
        console.log("Total Number of Users after creation: " + userCount);
        const now = Timestamp.fromDate(new Date());
        return FireDB
            .collection("users")
            .doc(user.uid)
            .set({
              email: user.email,
              name: user.displayName,
              uid: user.uid,
              order: userCount,
              enable: true,
              privilege: {
                scheduleModify: false,
                leaveManage: false,
                leaveApprove: false,
                logViewer: false,
                systemAdmin: false,
                sal: false,
                userManagement: false,
                tmp: true,
              },
              balance: {
                al: 0,
                sal: 0,
                ot: 0,
              },
              rank: "tmp",
              dateOfEntry: now,
              defaultSchedule: [
                "",
                "",
                "",
                "",
                "1",
                "2",
                "",
                "3",
                "4",
                "",
                "5",
                "6",
                "",
                "7",
                "8",
                "",
                "9",
                "10",
                "11",
                "",
                "",
              ],
            }).then(()=>{
              return FireDB
                  .collection("dashboard")
                  .doc("leaveConfig")
                  .set({
                    [user.uid]: [{
                      "al": 0,
                      "date": "2021-03-30T16:00:00.000Z",
                    }],
                  }, {merge: true}).then(()=>{
                    return FireDB.collection("dashboard").doc("otConfig").set({
                      [user.uid]: 0,
                    }, {merge: true}).then(()=>{
                      return FireDB
                          .collection("dashboard")
                          .doc("otConfig")
                          .update({
                            [`balance.${user.uid}`]: 0,
                          }, {merge: true});
                    });
                  });
            });
      });
});

// auth trigger (user deleted)
exports.userDeleted = functions.auth.user().onDelete((user) => {
  const doc = FireDB
      .collection("users")
      .doc(user.uid);
  return doc.delete();
});

exports.toggleEnable = functions.https.onCall(async (data, context) => {
  const loginUserDoc = FireDB
      .collection("users")
      .doc(context.auth.uid);
  const loginUser = await loginUserDoc.get();
  const loginUserData = loginUser.data();
  if (loginUserData.privilege.userManagement != true) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only user management admin can change user privilege",
    );
  }

  const changeUserDoc = FireDB.collection("users").doc(data);
  const changeUser = await changeUserDoc.get();
  const changeUserData = changeUser.data();
  const newEnable = !changeUserData.enable;
  return await changeUserDoc.update({
    "enable": newEnable,
  }).then(() => {
    console.log("USER: " +
    changeUserData.name + "[enable]:" + newEnable);
    return newEnable;
  });
});

exports.toggleUserManagement = functions.https.onCall(async (data, context) => {
  const loginUserDoc = FireDB
      .collection("users")
      .doc(context.auth.uid);
  const loginUser = await loginUserDoc.get();
  const loginUserData = loginUser.data();
  if (loginUserData.privilege.userManagement != true) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only user management admin can change user privilege",
    );
  }

  const changeUserDoc = FireDB.collection("users").doc(data);
  const changeUser = await changeUserDoc.get();
  const changeUserData = changeUser.data();
  const newPrivilege = !changeUserData.privilege.userManagement;
  return await changeUserDoc.update({
    "privilege.userManagement": newPrivilege,
  }).then(() => {
    console.log("USER: " +
    changeUserData.name + "[privilege.userManagement]:" + newPrivilege);
    return newPrivilege;
  });
});

exports.toggleLeaveApprove = functions.https.onCall(async (data, context) => {
  const loginUserDoc = FireDB
      .collection("users")
      .doc(context.auth.uid);
  const loginUser = await loginUserDoc.get();
  const loginUserData = loginUser.data();
  if (loginUserData.privilege.userManagement != true) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only user management admin can change user privilege",
    );
  }

  const changeUserDoc = FireDB.collection("users").doc(data);
  const changeUser = await changeUserDoc.get();
  const changeUserData = changeUser.data();
  const newPrivilege = !changeUserData.privilege.leaveApprove;
  return await changeUserDoc.update({
    "privilege.leaveApprove": newPrivilege,
  }).then(() => {
    console.log("USER: " +
    changeUserData.name + "[privilege.leaveApprove]:" + newPrivilege);
    return newPrivilege;
  });
});

exports.toggleLeaveManage = functions.https.onCall(async (data, context) => {
  const loginUserDoc = FireDB
      .collection("users")
      .doc(context.auth.uid);
  const loginUser = await loginUserDoc.get();
  const loginUserData = loginUser.data();
  if (loginUserData.privilege.userManagement != true) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only user management admin can change user privilege",
    );
  }

  const changeUserDoc = FireDB.collection("users").doc(data);
  const changeUser = await changeUserDoc.get();
  const changeUserData = changeUser.data();
  const newPrivilege = !changeUserData.privilege.leaveManage;
  return await changeUserDoc.update({
    "privilege.leaveManage": newPrivilege,
  }).then(() => {
    console.log("USER: " +
    changeUserData.name + "[privilege.leaveManage]:" + newPrivilege);
    return newPrivilege;
  });
});

exports.toggleScheduleModify = functions.https.onCall(async (data, context) => {
  const loginUserDoc = FireDB
      .collection("users")
      .doc(context.auth.uid);
  const loginUser = await loginUserDoc.get();
  const loginUserData = loginUser.data();
  if (loginUserData.privilege.userManagement != true) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only user management admin can change user privilege",
    );
  }

  const changeUserDoc = FireDB.collection("users").doc(data);
  const changeUser = await changeUserDoc.get();
  const changeUserData = changeUser.data();
  const newPrivilege = !changeUserData.privilege.scheduleModify;
  return await changeUserDoc.update({
    "privilege.scheduleModify": newPrivilege,
  }).then(() => {
    console.log("USER: " +
    changeUserData.name + "[privilege.scheduleModify]:" + newPrivilege);
    return newPrivilege;
  });
});

exports.toggleSal = functions.https.onCall(async (data, context) => {
  const loginUserDoc = FireDB
      .collection("users")
      .doc(context.auth.uid);
  const loginUser = await loginUserDoc.get();
  const loginUserData = loginUser.data();
  if (loginUserData.privilege.userManagement != true) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only user management admin can change user privilege",
    );
  }

  const changeUserDoc = FireDB.collection("users").doc(data);
  const changeUser = await changeUserDoc.get();
  const changeUserData = changeUser.data();
  const newPrivilege = !changeUserData.privilege.sal;
  return await changeUserDoc.update({
    "privilege.sal": newPrivilege,
  }).then(() => {
    console.log("USER: " +
    changeUserData.name + "[privilege.sal]:" + newPrivilege);
    return newPrivilege;
  });
});

exports.changeOrder = functions.https.onCall(async (data, context) => {
  const loginUserDoc = FireDB
      .collection("users")
      .doc(context.auth.uid);
  const loginUser = await loginUserDoc.get();
  const loginUserData = loginUser.data();
  if (loginUserData.privilege.userManagement != true) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only user management admin can change user privilege",
    );
  }

  const changeUserDoc1 = FireDB.collection("users").doc(data.uid);
  const changeUser1 = await changeUserDoc1.get();
  const changeUserData1 = changeUser1.data();
  const order1 = changeUserData1.order + (data.dir == "UP"? -1: 1);

  const changeUserDoc2 = await FireDB.collection("users")
      .where("order", "==", order1)
      .get();

  let changeUserData2;
  changeUserDoc2.forEach((doc) => {
    changeUserData2 = doc.data();
  });

  return await changeUserDoc1.update({
    "order": order1,
  }).then(() => {
    FireDB.collection("users").doc(changeUserData2.uid).update({
      "order": changeUserData1.order,
    });
  }).then(() => {
    console.log("USER: " +
    changeUserData1.name + "[order]:" + order1);
    console.log("USER: " +
    changeUserData2.name + "[order]:" + changeUserData1.order);
    return {
      uid1: changeUserData1.uid,
      uid2: changeUserData2.uid,
      order1: order1,
      order2: changeUserData1.order,
    };
  });
});

exports.changeRank = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add requests",
    );
  }

  const loginUserDoc = FireDB
      .collection("users")
      .doc(context.auth.uid);
  const loginUser = await loginUserDoc.get();
  const loginUserData = loginUser.data();
  if (loginUserData.privilege.userManagement != true) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only user management admin can change user privilege",
    );
  }

  const changeUserDoc = FireDB.collection("users").doc(data.uid);
  const changeUser = await changeUserDoc.get();
  const changeUserData = changeUser.data();

  return await changeUserDoc.update({
    "rank": data.rank,
  }).then(() => {
    console.log("USER: " +
    loginUserData.name + "修改了 " + changeUserData.name + "[職級]:" + data.rank);
    return {
      uid: changeUserData.uid,
      rank: data.rank,
    };
  });
});

exports.changeDateOfExit = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add requests",
    );
  }

  const loginUserDoc = FireDB
      .collection("users")
      .doc(context.auth.uid);
  const loginUser = await loginUserDoc.get();
  const loginUserData = loginUser.data();
  if (loginUserData.privilege.userManagement != true) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only user management admin can change user privilege",
    );
  }

  const changeUserDoc = FireDB.collection("users").doc(data.uid);
  const changeUser = await changeUserDoc.get();
  const changeUserData = changeUser.data();

  const exitTimestamp = Timestamp.fromDate(new Date(data.dateOfExit));
  const dateOfExit = new Date(data.dateOfExit);
  dateOfExit.setTime(dateOfExit.getTime() + 8 * 60 * 60 * 1000);

  return await changeUserDoc.update({
    "dateOfExit": exitTimestamp,
  }).then(() => {
    console.log("USER: " +
    loginUserData.name + " 修改了 " + changeUserData.name + "[離職日期]:" + formatDate(dateOfExit, "-", "YYYYMMDD"));
    return {
      uid: changeUserData.uid,
      dateOfExit: data.dateOfExit,
    };
  });
});
