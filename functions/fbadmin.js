const functions = require("firebase-functions");
const admin = require("firebase-admin");
const firestore = require("firebase-admin/firestore");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const FireDB = admin.firestore();
// FireDB.settings({timestampsInSnapshots: true});
const Timestamp = firestore.Timestamp;
const FieldValue = firestore.FieldValue;
const arrayUnion = FireDB.arrayUnion;

module.exports = {
  FireDB, Timestamp, functions, FieldValue, arrayUnion, admin,
};
