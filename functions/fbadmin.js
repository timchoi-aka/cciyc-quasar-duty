/* eslint-disable max-len */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const auth = require("firebase-admin/auth");
const firestore = require("firebase-admin/firestore");
const {Storage} = require("@google-cloud/storage");

let app;

if (admin.apps.length === 0) {
  app = admin.initializeApp();
}

const FireAuth = auth;
const FireDB = admin.firestore();
// FireDB.settings({timestampsInSnapshots: true});
const Timestamp = firestore.Timestamp;
const FieldValue = firestore.FieldValue;
const arrayUnion = FireDB.arrayUnion;
const storage = new Storage();

module.exports = {
  FireDB, Timestamp, functions, FieldValue, arrayUnion, admin, app, storage, FireAuth
};
