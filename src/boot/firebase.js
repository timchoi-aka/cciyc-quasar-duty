import Firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';
import 'firebase/storage';
import 'firebase/app-check';

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

// Pass your reCAPTCHA v3 site key (public key) to activate(). Make sure this
// key is the counterpart to the secret key you set in the Firebase console.
const appCheck = Firebase.appCheck();
appCheck.activate(
  '6Ldn54UiAAAAAHwOOAqgnuVJ78Mgs2f6D-VfiB6H',
  // Optional argument. If true, the SDK automatically refreshes App Check
  // tokens as needed.
  true);

if(window.location.hostname === 'localhost') {
  // connect to real firebase auth for token test
  // Firebase.auth().useEmulator('http://localhost:9099');
  // Firebase.firestore().useEmulator('localhost', 8081);
  // Firebase.functions().useEmulator('localhost', 5001);
}

  //Firebase.auth().useEmulator('http://10.0.2.2:9099');
  //Firebase.firestore().useEmulator('10.0.2.2', 8081);
  //Firebase.functions().useEmulator('10.0.2.2', 5001);

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
export const FirebaseFunctions = app.functions("asia-east2");
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
