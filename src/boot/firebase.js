import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, onAuthStateChanged, onIdTokenChanged, getIdToken } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, collection, doc } from "firebase/firestore";
import { getApp } from "firebase/app";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const { initializeAppCheck, ReCaptchaV3Provider } = require("firebase/app-check");

const firebaseConfig = {
  apiKey: "AIzaSyBn3kOruwr2QZlFuecSiPswBdm6ijulxvM",
  authDomain: "manage-hr.firebaseapp.com",
  projectId: "manage-hr",
  storageBucket: "manage-hr.appspot.com",
  messagingSenderId: "40845111899",
  appId: "1:40845111899:web:f5110e9801b0c21704457e"
};

const app = initializeApp(firebaseConfig)
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(getApp(), "asia-east2");

if (process.env.NODE_ENV === "development") {
//if(window.location.hostname === 'localhost') {
  // connect to real firebase auth for token test
  //connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, 'localhost', 8081);
  connectFunctionsEmulator(functions, "localhost", 5001);
  
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = "D0934CAD-09BB-46E6-ABCD-EB7BD32B9365";
  console.log("Debug Mode Enabled")
}

// Pass your reCAPTCHA v3 site key (public key) to activate(). Make sure this
// key is the counterpart to the secret key you set in the Firebase console.
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6Ldn54UiAAAAAHwOOAqgnuVJ78Mgs2f6D-VfiB6H'),
  isTokenAutoRefreshEnabled: true
});

/*
import { getIdToken, onAuthStateChanged } from "firebase/auth";

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const token = await getIdToken(user);
  }
});
*/
export async function getCurrentUser() {
  return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, user => {
          unsubscribe();
          resolve(user);
      }, reject);

      const refreshToken = onIdTokenChanged(auth, user => {
        refreshToken();
        if (user) {
          getIdToken(user).then((token) => {
            sessionStorage.setItem("access-token", token)
            //console.log("token:" + token)
          })
        }
        resolve(user);
    }, reject);
  })
}

export const FirebaseAuth = auth
export const FireDB = db
export const FirebaseFunctions = functions

// collection references
export const usersCollection = collection(db, 'users')
export const scheduleCollection = collection(db, 'schedule')
export const sessionCollection = collection(db, 'session')
export const activityCollection = collection(db, 'activity')
export const leaveCollection = collection(db, 'leave')
export const OTCollection = collection(db, 'ot')
export const activityOverviewCollection = collection(db, 'activityOverview')
export const dashboardCollection = collection(db, 'dashboard')
export const leaveConfig = doc(db, 'dashboard', "leaveConfig")
export const OTConfig = doc(db, 'dashboard', "otConfig")
export const Notification = doc(db, 'dashboard', "notification")


