/* eslint-disable max-len */
const {functions, FireDB, FieldValue, Timestamp} = require("./fbadmin");
const {formatDate} = require("./utilities");

// apply health care
exports.applyHealthCare = functions.region("asia-east2").https.onCall(async (data, context) => {
  // App Check token. (If the request includes an invalid App Check
  // token, the request will be rejected with HTTP error 401.)
  /*
  if (context.app == undefined) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called from an App Check verified app.");
  } */
  

  // only authenticated users can run this
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add healthcare requests",
    );
  }

  const firebaseDate = Timestamp.fromDate(new Date(data.date));

  return await FireDB.collection("healthcare").doc().set({
    uid: context.auth.uid,
    date: firebaseDate,
    amount: data.amount,
    status: data.status,
    username: data.username,
  }).then(() => {
    FireDB.collection("dashboard").doc("notification").update({
      healthcare_waitingForApproval: FieldValue.increment(1),
    }).then(() => {
      console.log("HEALTHCARE: " + context.auth.token.name + "申領員工醫療 - 日期：" + data.date + " 金額：" + data.amount);
    });
  });
});

// delete health care
exports.deleteHealthCare = functions.region("asia-east2").https.onCall(async (data, context) => {
  // App Check token. (If the request includes an invalid App Check
  // token, the request will be rejected with HTTP error 401.)
  /*
  if (context.app == undefined) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called from an App Check verified app.");
  } */
  

  // only authenticated users can run this
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can delete healthcare requests",
    );
  }

  FireDB.collection("healthcare").doc(data.id).get().then((doc) => {
    const d = doc.data();
    if (d.uid == context.auth.uid) { // can only delete your own application
      return FireDB.collection("healthcare").doc(data.id).delete().then((result) => {
        if (result) {
          FireDB.collection("dashboard").doc("notification").update({
            healthcare_waitingForApproval: FieldValue.increment(-1),
          }).then(() => {
            console.log("HEALTHCARE: " + context.auth.token.name + " 刪除員工醫療 - 文件ID: " + data.id + " 員工：" + d.username + " 日期：" + d.date.toDate() + " 金額：" + d.amount);
          });
        }
      });
    }
  });
});

// approve health care
exports.approveHealthCareByDocid = functions.region("asia-east2").https.onCall(async (data, context) => {
  // App Check token. (If the request includes an invalid App Check
  // token, the request will be rejected with HTTP error 401.)
  /*
  if (context.app == undefined) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called from an App Check verified app.");
  } */
  

  // only authenticated users can run this
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add healthcare requests");
  }

  // only leave admin can run this
  const runUser = await FireDB.collection("users").doc(context.auth.uid).get();
  const runUserData = runUser.data();
  if (runUserData.privilege.healthapprove != true) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only user with health approve right can approve healthcare request");
  }

  let logData = "";
  const batch = FireDB.batch();
  for (const d of data) {
    const healthcareDoc = FireDB.collection("healthcare").doc(d.docid);

    batch.update(healthcareDoc, {
      remarks: FieldValue.arrayUnion(...d.remarks),
      status: d.status,
    });

    logData += "HEALTHCARE: " + runUserData.name +
            " 批准了 " +
            d.username +
            " 於 " +
            formatDate((new Timestamp(d.date.seconds, d.date.nanoseconds)).toDate(), "-", "YYYYMMDD") +
            " 申請的醫療津貼 $" +
            d.amount + "\n";
  }

  return await batch.commit().then(() => {
    FireDB.collection("dashboard").doc("notification").update({
      // decrease the number of outstanding approval count
      healthcare_waitingForApproval: FieldValue.increment(0 - data.length),
    }).then(() => {
      console.log(logData);
    });
  });
});

// approve health care
exports.rejectHealthCareByDocid = functions.region("asia-east2").https.onCall(async (data, context) => {
  // App Check token. (If the request includes an invalid App Check
  // token, the request will be rejected with HTTP error 401.)
  /*
  if (context.app == undefined) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called from an App Check verified app.");
  } */
  

  // only authenticated users can run this
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add requests");
  }

  // only leave admin can run this
  const runUser = await FireDB.collection("users").doc(context.auth.uid).get();
  const runUserData = runUser.data();
  if (runUserData.privilege.leaveApprove != true) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only leave admin can reject healthcare request");
  }

  let logData = "";
  const batch = FireDB.batch();
  for (const d of data) {
    const healthcareDoc = FireDB.collection("healthcare").doc(d.docid);

    batch.update(healthcareDoc, {
      remarks: FieldValue.arrayUnion(...d.remarks),
      status: d.status,
    });

    logData += "HEALTHCARE: " + runUserData.name +
            " 拒絕了 " +
            d.username +
            " 於 " +
            formatDate((new Timestamp(d.date.seconds, d.date.nanoseconds)).toDate(), "-", "YYYYMMDD") +
            " 申請的醫療津貼 $" +
            d.amount + "\n";
  }

  return await batch.commit().then(() => {
    FireDB.collection("dashboard").doc("notification").update({
      // decrease the number of outstanding approval count
      healthcare_waitingForApproval: FieldValue.increment(0 - data.length),
    }).then(() => {
      console.log(logData);
    });
  });
});

// modify health care
exports.modifyHealthCareByDocid = functions.region("asia-east2").https.onCall(async (data, context) => {
  // App Check token. (If the request includes an invalid App Check
  // token, the request will be rejected with HTTP error 401.)
  /*
  if (context.app == undefined) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called from an App Check verified app.");
  } */
  

  // only authenticated users can run this
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add healthcare requests");
  }

  // only leave admin can run this
  const runUser = await FireDB.collection("users").doc(context.auth.uid).get();
  const runUserData = runUser.data();
  if (runUserData.privilege.leaveApprove != true) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only leave admin can modify healthcare request");
  }

  let logData = "";
  const batch = FireDB.batch();
  for (const d of data) {
    const healthcareDoc = FireDB.collection("healthcare").doc(d.docid);

    batch.update(healthcareDoc, {
      remarks: FieldValue.arrayUnion(...d.remarks),
      amount: d.amount,
    });

    logData += "HEALTHCARE: " + runUserData.name +
            " 修改了 " +
            d.username +
            " 於 " +
            formatDate((new Timestamp(d.date.seconds, d.date.nanoseconds)).toDate(), "-", "YYYYMMDD") +
            " 申請的醫療津貼金額至 $" +
            d.amount + "\n";
  }

  return await batch.commit().then(() => {
    console.log(logData);
  });
});
