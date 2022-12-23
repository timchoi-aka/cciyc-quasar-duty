import { FireDB, FirebaseAuth,  /*getAuth, signInWithCredential*/ } from "boot/firebase.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { collection, getDoc, doc, getDocs } from "firebase/firestore"; 
import { Notify } from 'quasar'

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
