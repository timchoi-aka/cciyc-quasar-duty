import Firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/functions';
import 'firebase/compat/storage';
import 'firebase/compat/app-check';

const firebaseConfig = {
  apiKey: "AIzaSyBn3kOruwr2QZlFuecSiPswBdm6ijulxvM",
  authDomain: "manage-hr.firebaseapp.com",
  projectId: "manage-hr",
  storageBucket: "manage-hr.appspot.com",
  messagingSenderId: "40845111899",
  appId: "1:40845111899:web:f5110e9801b0c21704457e"
};

let app;
!Firebase.apps.length ? app = Firebase.initializeApp(firebaseConfig) : '';

if (process.env.NODE_ENV === "development") {
//if(window.location.hostname === 'localhost') {
  // connect to real firebase auth for token test
  // Firebase.auth().useEmulator('http://localhost:9099');
  // Firebase.app().firestore().useEmulator('localhost', 8081);
  // Firebase.app().functions().useEmulator('localhost', 5001);
  
  // Firebase.auth().useEmulator('http://localhost:9099');
  app.firestore().useEmulator('localhost', 8081);
  app.functions("asia-east2").useEmulator('localhost', 5001);
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = "D0934CAD-09BB-46E6-ABCD-EB7BD32B9365";
  console.log("Debug Mode Enabled")
}

// Pass your reCAPTCHA v3 site key (public key) to activate(). Make sure this
// key is the counterpart to the secret key you set in the Firebase console.
const appCheck = Firebase.appCheck();
appCheck.activate('6Ldn54UiAAAAAHwOOAqgnuVJ78Mgs2f6D-VfiB6H', true); // auto-refresh = true

Firebase.getCurrentUser = () => {
  return new Promise((resolve, reject) => {
      const unsubscribe = FirebaseAuth.onAuthStateChanged(user => {
          unsubscribe();
          resolve(user);
      }, reject);
  })
};

export const GoogleAuthProvider = new Firebase.auth.GoogleAuthProvider();
export const FirebaseAuth = Firebase.auth();
export const Firestore = Firebase.firestore();
//export const FirebaseFunctions = app.functions("asia-east2");
export const FirebaseFunctions = Firebase.app().functions("asia-east2");
export const FirebaseStorage = Firebase.storage();
export const getAuth = Firebase.auth().getAuth;
export const signInWithCredential = Firebase.auth().signInWithCredential;

export default Firebase;


// collection references
export const usersCollection = Firestore.collection('users')
export const scheduleCollection = Firestore.collection('schedule')
export const activityCollection = Firestore.collection('activity')
export const leaveCollection = Firestore.collection('leave')
export const OTCollection = Firestore.collection('ot')
export const activityOverviewCollection = Firestore.collection('activityOverview')
export const dashboardCollection = Firestore.collection('dashboard')
export const leaveConfig = Firestore.collection('dashboard').doc("leaveConfig")
export const OTConfig = Firestore.collection('dashboard').doc("otConfig")
export const Notification = Firestore.collection('dashboard').doc("notification")
