/* eslint-disable max-len */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const firestore = require("firebase-admin/firestore");
const {initializeAppCheck, ReCaptchaV3Provider} = require("firebase/app-check");

let app;
if (admin.apps.length === 0) {
  app = admin.initializeApp();
}

initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider("6Ldn54UiAAAAAHwOOAqgnuVJ78Mgs2f6D-VfiB6H"),

  // Optional argument. If true, the SDK automatically refreshes App Check
  // tokens as needed.
  isTokenAutoRefreshEnabled: true,
});


const FireDB = admin.firestore();
// FireDB.settings({timestampsInSnapshots: true});
const Timestamp = firestore.Timestamp;
const FieldValue = firestore.FieldValue;
const arrayUnion = FireDB.arrayUnion;

module.exports = {
  FireDB, Timestamp, functions, FieldValue, arrayUnion, admin,
};
