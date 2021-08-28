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
