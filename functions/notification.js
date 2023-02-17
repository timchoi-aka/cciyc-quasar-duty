/* eslint-disable max-len */
// const {functions, admin} = require("./fbadmin");
const {functions, admin, FireDB} = require("./fbadmin");
const {formatDateTime} = require("./utilities");
const messaging = admin.messaging();

exports.registerToken = functions.region("asia-east2").https.onCall(async (data, context) => {
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

  /*
  const loginUserDoc = FireDB
      .collection("users")
      .doc(context.auth.uid);
  const loginUser = await loginUserDoc.get();
  const loginUserData = loginUser.data();
  */

  // subscribe to user's topic
  return await messaging.subscribeToTopic(data.token, context.auth.uid).then((result)=>{
    console.log(result);
  });
  // update token in user object
  /*
  return await loginUserDoc.update({
    "FCM_Tokens": {
      token: data.token,
      timestamp: data.timestamp,
    },
  }).then(() => {
    this.notify(context.auth.uid, {title: "Timestamp updated", body: "Your client timestamp is updated"});
    console.log("USER: " + loginUserData.name + " update [FCM_Token] " + data.token + " with timestamp:" + data.timestamp);
  });
  */
});

exports.notify = async (uid, data) => {
  const loginUserDoc = FireDB
      .collection("users")
      .doc(uid);
  const loginUser = await loginUserDoc.get();
  const loginUserData = loginUser.data();

  const token = loginUserData.FCM_Tokens.token;
  console.log("Delivering to tokens: " + token);
  const message = {
    data: {
      title: data.title,
      body: data.body,
      datetime: formatDateTime(new Date()),
    },
    token: token,
  };

  // Send a message to the device corresponding to the provided
  // registration token.
  messaging.send(message).then((response) => {
    // Response is a message ID string.
    console.log("成功發送通知給：" + loginUserData.name);
  }).catch((error) => {
    console.log("發送通知失敗:", error);
  });
};

exports.publishToTopic = async (topic, data) => {
  const message = {
    data: {
      title: data.title,
      body: data.body,
      datetime: formatDateTime(new Date()),
    },
    topic: topic,
    webpush: {
      fcm_options: {
        link: data.link,
      },
    },
  };

  // Send a message to the device corresponding to the provided
  // registration token.
  messaging.send(message).then((response) => {
    // Response is a message ID string.
    console.log("成功發送通知給Topic：" + topic);
  }).catch((error) => {
    console.log("發送通知失敗:", error);
  });
};
