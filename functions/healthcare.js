/* eslint-disable max-len */
const {functions, FireDB, Timestamp} = require("./fbadmin");

// apply health care
exports.applyHealthCare = functions.region("asia-east2").https.onCall(async (data, context) => {
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

  const firebaseDate = Timestamp.fromDate(new Date(data.date));

  return await FireDB.collection("healthcare").doc().set({
    uid: context.auth.uid,
    date: firebaseDate,
    amount: data.amount,
    isApproved: data.isApproved,
    username: data.username,
  }).then(() => {
    console.log("HEALTHCARE: " + context.auth.token.name + "申領員工醫療 - 日期：" + data.date + " 金額：" + data.amount);
  })
});