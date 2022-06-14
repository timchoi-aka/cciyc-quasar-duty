const {functions, FireDB, Timestamp} = require("./fbadmin");
// auth trigger (new user signup)
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
              privilege: {
                scheduleModify: false,
                leaveManage: false,
                leaveApprove: false,
                logViewer: false,
                systemAdmin: false,
                sal: false,
                userManagement: false,
              },
              rank: "wm2",
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
