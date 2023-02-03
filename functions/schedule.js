/* eslint-disable max-len */
const {functions, FireDB, Timestamp} = require("./fbadmin");
const {formatDate} = require("./utilities");

// http callable function (change opening session)
exports.changeOpeningSession = functions.region("asia-east2").https.onCall(async (data, context) => {
  // App Check token. (If the request includes an invalid App Check
  // token, the request will be rejected with HTTP error 401.)
  if (context.app == undefined) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called from an App Check verified app.");
  }

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
  if (loginUserData.privilege.scheduleModify != true) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only user with scheduleModify right can change opening session",
    );
  }

  const firebaseDate = Timestamp.fromDate(new Date(data.date));

  // set docid and try to get it
  const newDocid = formatDate(data.date, "", "YYYYMMDD")+"_"+data.slot;
  const sessionDoc = FireDB.collection("session").doc(newDocid);
  const session = await sessionDoc.get();

  if (!session.exists) { // no record found
    return await sessionDoc.set({
      date: firebaseDate,
      slot: data.slot,
    }).then(() => {
      console.log("USER:" + loginUserData.name + "設定這節為開放:" + data.date + ":" + data.slot);
      return data;
    });
  } else {
    return await sessionDoc.delete().then(() => {
      console.log("USER:" + loginUserData.name + "設定這節為關閉:" + data.date + ":" + data.slot);
      return data;
    });
  }
});

// http callable function (adding a schedule)
exports.updateSchedule = functions.region("asia-east2").https.onCall(async (datas, context) => {
  // App Check token. (If the request includes an invalid App Check
  // token, the request will be rejected with HTTP error 401.)
  if (context.app == undefined) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called from an App Check verified app.");
  }

  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add requests",
    );
  }

  /* app check
  if (context.app == undefined) {
    throw new functions.https.HttpsError(
        'failed-precondition',
        'The function must be called from an App Check verified app.')
  }
  */
  const batch = FireDB.batch();

  let logData = "";
  for (const data of datas) {
    const firebaseDate = Timestamp.fromDate(new Date(data.date));
    // get user and schedule buckets
    const userDoc = FireDB
        .collection("users")
        .doc(data.uid);
    const user = await userDoc.get();

    // set docid and try to get it
    const newDocid = data.uid+formatDate(data.date, "", "YYYYMMDD")+data.slot;
    const scheduleDoc = FireDB.collection("schedule").doc(newDocid);
    const schedule = await scheduleDoc.get();

    if (!schedule.exists) { // no record found
      if (data.type == "") { // do nothing if the schedule content is empty
        continue;
      } else { // create a new schedule
        batch.set(scheduleDoc, {
          date: firebaseDate,
          slot: data.slot,
          uid: data.uid,
          type: data.type,
        });
        logData += "SCHEDULE: " +
            user.data().name +
            " added " +
            formatDate(data.date, "-", "YYYYMMDD") +
            ":" +
            data.slot +
            "(" +
            data.type + ")" + "\n";
      }
    } else { // if existing record found
      if (data.type == null) { // delete if it changes to empty
        batch.delete(scheduleDoc);
        logData += "SCHEDULE: " +
            user.data().name +
            " deleted " +
            formatDate(data.date, "-", "YYYYMMDD") +
            ":" +
            data.slot + "\n";
      } else { // update new value if old schedule found
        if (data.type == schedule.data().type) continue;
        else {
          batch.update(scheduleDoc, {
            type: data.type,
          });
          logData += "SCHEDULE: " +
                user.data().name +
                " modified " +
                formatDate(data.date, "-", "YYYYMMDD") +
                ":" +
                data.slot +
                "(" +
                data.type + ")" + "\n";
        }
      }
    }
  }
  return batch.commit().then((res) => {
    console.log(logData);

    return {
      status: true,
      result: "Successfully updated schedules",
    };
  }).catch((e) => {
    throw e;
  });
});
