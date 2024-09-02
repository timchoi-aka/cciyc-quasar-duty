import { initializeApp, getApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
import {
  getAuth,
  onAuthStateChanged,
  onIdTokenChanged,
  getIdToken,
  connectAuthEmulator,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  doc,
} from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
//import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(getApp(), "asia-east2");

if (process.env.DEV_MODE === "development") {
  // disable the following line if test in emulator
  //connectAuthEmulator(auth, "http://127.0.0.1:9099");
  connectFirestoreEmulator(db, "127.0.0.1", 8081);
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);

  self.FIREBASE_APPCHECK_DEBUG_TOKEN =
    process.env.FIREBASE_APPCHECK_DEBUG_TOKEN;
  console.log("Development Mode Enabled");
}

// Pass your reCAPTCHA v3 site key (public key) to activate(). Make sure this
// key is the counterpart to the secret key you set in the Firebase console.
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(process.env.RECAPCHA_SITE_KEY),
  isTokenAutoRefreshEnabled: true,
});

/*
import { getIdToken, onAuthStateChanged } from "firebase/auth";

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const token = await getIdToken(user);
  }
});
*/
export async function requestPermission() {
  console.log("Requesting permission...");
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      console.log("Notification permission granted.");
    }
  });
}

export async function getCurrentUser() {
  // after login, get the messaging token
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject
    );

    const refreshToken = onIdTokenChanged(
      auth,
      (user) => {
        refreshToken();
        if (user) {
          getIdToken(user).then((token) => {
            sessionStorage.setItem("access-token", token);
            //console.log("token:" + token)
          });
        }
        resolve(user);
      },
      reject
    );

    /*
    if (sessionStorage.getItem("vuex")) resolve
    else reject
    */
  });
}

export const FirebaseAuth = auth;
export const FireDB = db;
export const FirebaseFunctions = functions;
export const FirebaseMessaging = messaging;

// CloudFunctions always connect to live functions
const cloudfunctions = getFunctions(getApp(), "asia-east2");
export const CloudFunctions = cloudfunctions;

// collection references
export const usersCollection = collection(db, "users");
export const scheduleCollection = collection(db, "schedule");
export const sessionCollection = collection(db, "session");
export const activityCollection = collection(db, "activity");
export const leaveCollection = collection(db, "leave");
export const OTCollection = collection(db, "ot");
export const bugsCollection = collection(db, "bugs");
export const activityOverviewCollection = collection(db, "activityOverview");
export const dashboardCollection = collection(db, "dashboard");
export const healthcareCollection = collection(db, "healthcare");
export const leaveConfig = doc(db, "dashboard", "leaveConfig");
export const OTConfig = doc(db, "dashboard", "otConfig");
export const Notification = doc(db, "dashboard", "notification");
export const healthcareConfig = doc(db, "healthcare", "config");
