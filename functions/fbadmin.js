const functions = require("firebase-functions");
const admin = require("firebase-admin");
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const FireDB = admin.firestore();
const Timestamp = admin.firestore.Timestamp;
const FieldValue = admin.firestore.FieldValue;
const arrayUnion = FireDB.arrayUnion;

module.exports = {
  FireDB, Timestamp, functions, FieldValue, arrayUnion,
};
