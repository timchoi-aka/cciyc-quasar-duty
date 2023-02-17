import { FireDB, FirebaseAuth, FirebaseMessaging, FirebaseFunctions /*getAuth, signInWithCredential*/ } from "boot/firebase.js";
import { getToken } from "firebase/messaging";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { collection, getDoc, doc, getDocs, Timestamp } from "firebase/firestore"; 
import { Notify } from 'quasar'
import { httpsCallable } from "firebase/functions";

export async function refreshToken({ commit }) {
  const credential = GoogleAuthProvider.credentialFromResult(result)
  const token = credential.accessToken
  sessionStorage.setItem("access-token", token)
}

export async function login({ commit }) {
  // sign user in
  // fetch user profile and set in state
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  provider.setCustomParameters({
    'login_hint': 'user@cciyc.com'
  });
  
  signInWithPopup(FirebaseAuth, provider).then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    sessionStorage.setItem("access-token", token);
    // The signed-in user info.
    const user = result.user;
    
    // get messaging token
    // Add the public key generated from the console here.
    getToken(FirebaseMessaging, {vapidKey: "BFu5VzDUwOVWSQ--MUDmSEPt9AYN9QlTPIzijXKzQVqrIdpKi1goG9l3L8_fDJFr5mojwX5Eo2tDC1XiMmIfSXA"}).then((currentToken) => {
      if (currentToken) {
        // Send the token to your server and update the UI if necessary
        //subscribeToTopic(currentToken, "notiication")
        const regToken = httpsCallable(FirebaseFunctions, "notification-registerToken");
        regToken({
          uid: user.uid,
          token: currentToken,
          timestamp: Timestamp.fromDate(new Date())
        })
        // console.log("Got Messaging Token:" + currentToken)
      } else {
        // Show permission request UI
        console.log('No registration token available. Request permission to generate one.');
      }
    }).catch((err) => {
      console.log('An error occurred while retrieving token. ', err);
    });

    getDoc(doc(FireDB, "users", user.uid)).then((userDoc) => {
      if (userDoc.exists()) {
        let d = userDoc.data();
        d.dateOfEntry = new Date(userDoc.data().dateOfEntry.toDate().setHours(0))
        d.dateOfExit = userDoc.data().dateOfExit? new Date(userDoc.data().dateOfExit.toDate().setHours(0)): null
        commit('setUserProfile', d);
        commit('setAuth', user);
        this.$router.push('/').catch(()=>{});
        Notify.create({
          message: userDoc.data().name + " 登入成功."
        })
      }
    })
  }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
  }); 
}

export async function logout({ commit }) {
  const auth = getAuth();
  signOut(auth).then(() => {
    // Sign-out successful.
    // clear userProfile and redirect to /login
    commit('setUserProfile', {})
    commit('setAuth', {})
    sessionStorage.removeItem("access-token");
    this.$router.push('/').catch(()=>{});
  }).catch((error) => {
    // An error happened.
    console.log(error);
  });
}
