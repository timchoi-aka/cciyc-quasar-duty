/* eslint-disable max-len */
const { functions, FireDB, Timestamp } = require("./fbadmin");
const { formatDate } = require("./utilities");
// API 2.0 - add temp staff
exports.addTempStaff = functions.region("asia-east2").https.onCall(async (data, context) => {
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
  console.log("data: " + JSON.stringify(data));
  const newStaff = JSON.parse(JSON.stringify(data));
  const users = await FireDB.collection("users").where("privilege.tmp", "==", true).get();
  const userCount = users.docs.length + 100;
  const tempUserCount = users.docs.length + 1;
  // const entryTimestamp = Timestamp.fromDate(new Date(newStaff.dateOfEntry));
  const entryTimestamp = new Timestamp(data.employment[0].dateOfEntry.seconds, data.employment[0].dateOfEntry.nanoseconds);

  const newDocRef = FireDB.collection("users").doc();
  newStaff.uid = newDocRef.id;
  newStaff.employment = [
    {
      dateOfEntry: entryTimestamp,
      rank: "tmp",
    },
  ];
  newStaff.rank = "tmp";
  newStaff.order = userCount;
  console.log("newStaff: " + JSON.stringify(newStaff));
  return await newDocRef.set(newStaff).then((result) => {
    console.log("USERS: " + context.auth.token.name + "新增了臨時員工" + data.name);
    console.log("USERS: 臨時員工總數 - " + tempUserCount);
    return newStaff;
  });
});

// API 2.0 - delete temp staff
exports.delTempStaff = functions.region("asia-east2").https.onCall(async (data, context) => {
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
exports.newUserSignUp = functions.region("asia-east2").auth.user().onCreate((user) => {
  // for background triggers you must return a value/promise
  return FireDB.collection("users").get().then((users) => {
    const userCount = users.docs.length + 1;
    console.log("Total Number of Users after creation: " + userCount);
    const now = Timestamp.fromDate(new Date());
    return FireDB.collection("users").doc(user.uid).set({
      email: user.email,
      name: user.displayName,
      uid: user.uid,
      order: userCount,
      enable: true,
      privilege: {
        centeric: false,
        uat: false,
        finance: false,
        probation: true,
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
      employment: [{
        dateOfEntry: now,
        dateOfExit: null,
        rank: "tmp",
      }],
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
    }).then(() => {
      return FireDB.collection("dashboard").doc("leaveConfig").set({
        [user.uid]: [{
          "al": 0,
          "date": "2021-03-30T16:00:00.000Z",
        }],
      }, { merge: true }).then(() => {
        return FireDB.collection("dashboard").doc("otConfig").set({
          [user.uid]: 0,
        }, { merge: true }).then(() => {
          const customClaims = {
            "https://hasura.io/jwt/claims": {
              "x-hasura-default-role": "user",
              "x-hasura-allowed-roles": ["user"],
              "x-hasura-user-id": user.email,
            },
          };

          return admin.auth().setCustomUserClaims(user.uid, customClaims).then(() => {
            console.log(context.auth.token.name + " updated customClaims on " + user.displayName);
          }).catch((error) => {
            console.log("error in " + user.displayName);
            console.log(error.code + ":" + error.message);
          });
        });
      });
    });
  });
});

// auth trigger (user deleted)
exports.userDeleted = functions.region("asia-east2").auth.user().onDelete((user) => {
  const doc = FireDB
    .collection("users")
    .doc(user.uid);
  return doc.delete();
});

exports.updateDefaultSchedule = functions.region("asia-east2").https.onCall(async (data, context) => {
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
    "defaultSchedule": data.schedule,
  }).then(() => {
    console.log("USER: " +
      changeUserData.name + "[defaultSchedule]:" + data.schedule);
    return data.schedule;
  });
});

exports.toggleEnable = functions.region("asia-east2").https.onCall(async (data, context) => {
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
  const newEnable = !changeUserData.enable;
  return await changeUserDoc.update({
    "enable": newEnable,
  }).then(() => {
    console.log("USER: " +
      changeUserData.name + "[enable]:" + newEnable);
    return newEnable;
  });
});

exports.toggleUserManagement = functions.region("asia-east2").https.onCall(async (data, context) => {
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

exports.toggleFinance = functions.region("asia-east2").https.onCall(async (data, context) => {
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
  const newPrivilege = !changeUserData.privilege.finance;
  return await changeUserDoc.update({
    "privilege.finance": newPrivilege,
  }).then(() => {
    console.log("USER: " +
      changeUserData.name + "[privilege.finance]:" + newPrivilege);
    return newPrivilege;
  });
});

exports.toggleEventManagement = functions.region("asia-east2").https.onCall(async (data, context) => {
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
  const newPrivilege = changeUserData.privilege.eventManagement ? false : true;
  return await changeUserDoc.update({
    "privilege.eventManagement": newPrivilege,
  }).then(() => {
    console.log("USER: " +
      changeUserData.name + "[privilege.eventManagement]:" + newPrivilege);
    return newPrivilege;
  });
});

exports.toggleInventoryManagement = functions.region("asia-east2").https.onCall(async (data, context) => {
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
  const newPrivilege = changeUserData.privilege.inventoryManagement ? false : true;
  return await changeUserDoc.update({
    "privilege.inventoryManagement": newPrivilege,
  }).then(() => {
    console.log("USER: " +
      changeUserData.name + "[privilege.inventoryManagement]:" + newPrivilege);
    return newPrivilege;
  });
});

exports.toggleEventApprove = functions.region("asia-east2").https.onCall(async (data, context) => {
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
  const newPrivilege = changeUserData.privilege.eventApprove ? false : true;
  return await changeUserDoc.update({
    "privilege.eventApprove": newPrivilege,
  }).then(() => {
    console.log("USER: " +
      changeUserData.name + "[privilege.eventApprove]:" + newPrivilege);
    return newPrivilege;
  });
});

exports.toggleProbation = functions.region("asia-east2").https.onCall(async (data, context) => {
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
  const newPrivilege = changeUserData.privilege.probation ? !changeUserData.privilege.probation : true;
  return await changeUserDoc.update({
    "privilege.probation": newPrivilege,
  }).then(() => {
    console.log("USER: " +
      changeUserData.name + "[privilege.probation]:" + newPrivilege);
    return newPrivilege;
  });
});

exports.toggleParttime = functions.region("asia-east2").https.onCall(async (data, context) => {
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
  const newPrivilege = changeUserData.parttime ? !changeUserData.parttime : true;
  return await changeUserDoc.update({
    "parttime": newPrivilege,
  }).then(() => {
    console.log("USER: " +
      changeUserData.name + "[parttime]:" + newPrivilege);
    return newPrivilege;
  });
});

exports.toggleLeaveApprove = functions.region("asia-east2").https.onCall(async (data, context) => {
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

exports.toggleLeaveManage = functions.region("asia-east2").https.onCall(async (data, context) => {
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

exports.toggleHealthApprove = functions.region("asia-east2").https.onCall(async (data, context) => {
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
  const newPrivilege = !changeUserData.privilege.healthapprove;
  return await changeUserDoc.update({
    "privilege.healthapprove": newPrivilege,
  }).then(() => {
    console.log("USER: " +
      changeUserData.name + "[privilege.healthapprove]:" + newPrivilege);
    return newPrivilege;
  });
});

exports.toggleScheduleModify = functions.region("asia-east2").https.onCall(async (data, context) => {
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

exports.toggleSal = functions.region("asia-east2").https.onCall(async (data, context) => {
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

exports.changeOrder = functions.region("asia-east2").https.onCall(async (data, context) => {
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
  const order1 = changeUserData1.order + (data.dir == "UP" ? -1 : 1);

  const changeUserDoc2 = await FireDB.collection("users")
    .where("order", "==", order1)
    .get();

  let changeUserData2;
  if (!changeUserDoc2.empty) {
    changeUserDoc2.forEach((doc) => {
      changeUserData2 = doc.data();
    });
  } else changeUserData2 = null;

  return await changeUserDoc1.update({
    "order": order1,
  }).then(() => {
    if (changeUserData2) {
      FireDB.collection("users").doc(changeUserData2.uid).update({
        "order": changeUserData1.order,
      });
    }
  }).then(() => {
    console.log("USER: " +
      changeUserData1.name + "[order]:" + order1);

    if (changeUserData2) {
      console.log("USER: " +
        changeUserData2.name + "[order]:" + changeUserData1.order);
      return {
        uid1: changeUserData1.uid,
        uid2: changeUserData2.uid,
        order1: order1,
        order2: changeUserData1.order,
      };
    } else {
      return {
        uid1: changeUserData1.uid,
        order1: order1,
      };
    }
  });
});

exports.changeRank = functions.region("asia-east2").https.onCall(async (data, context) => {
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

exports.changeDateOfExit = functions.region("asia-east2").https.onCall(async (data, context) => {
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

  const employment = changeUserData.employment;
  employment[data.index].dateOfExit = exitTimestamp;

  dateOfExit.setTime(dateOfExit.getTime() + 8 * 60 * 60 * 1000);

  return await changeUserDoc.update({
    employment: employment,
  }).then(() => {
    console.log("USER: " +
      loginUserData.name + " 修改了 " + changeUserData.name + "[離職日期]:" + formatDate(dateOfExit, "-", "YYYYMMDD"));
    return {
      uid: changeUserData.uid,
      index: data.index,
      dateOfExit: exitTimestamp,
    };
  });
});

exports.changeDateOfEntry = functions.region("asia-east2").https.onCall(async (data, context) => {
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

  const entryTimestamp = Timestamp.fromDate(new Date(data.dateOfEntry));
  const dateOfEntry = new Date(data.dateOfEntry);
  const employment = changeUserData.employment;
  employment[data.index].dateOfEntry = entryTimestamp;

  dateOfEntry.setTime(dateOfEntry.getTime() + 8 * 60 * 60 * 1000);

  return await changeUserDoc.update({
    employment: employment,
  }).then(() => {
    console.log("USER: " +
      loginUserData.name + " 修改了 " + changeUserData.name + "[入職日期]:" + formatDate(dateOfEntry, "-", "YYYYMMDD"));
    return {
      uid: changeUserData.uid,
      index: data.index,
      dateOfEntry: entryTimestamp,
    };
  });
});

exports.saveEmployment = functions.region("asia-east2").https.onCall(async (data, context) => {
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
  const employmentData = JSON.parse(JSON.stringify(data.employment));
  // console.log("employmentData:" + JSON.stringify(employmentData));
  employmentData.forEach((d) => {
    d.dateOfEntry = d.dateOfEntry ? Timestamp.fromDate(new Date(d.dateOfEntry)) : null;
    d.dateOfExit = d.dateOfExit ? Timestamp.fromDate(new Date(d.dateOfExit)) : null;
  });
  return await changeUserDoc.update({
    "employment": employmentData,
  }).then(() => {
    console.log("USER: " +
      changeUserData.name + "[受聘記錄]:" + JSON.stringify(data.employment));
    return data.employment;
  });
});

exports.delete = functions.region("asia-east2").https.onCall(async (data, context) => {
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

  const userRef = FireDB.collection("users").doc(data.uid);
  const user = await userRef.get();
  const userData = user.data();
  batch.delete(userRef);
  logData += userData.name + " ";

  // commit a batch once every 200 items (200 delete + 200 update)
  if (batch._ops.length == 200) {
    await batch.commit();
    batch = FireDB.batch();
  }

  const scheduleDoc = await FireDB.collection("schedule").where("uid", "==", data.uid).get();
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

  return await batch.commit().then(() => {
    console.log("USERS: " + context.auth.token.name + "刪除了臨時員工" + logData + ". 移除了" + scheduleCount + "項更表記錄.");
  });
});
