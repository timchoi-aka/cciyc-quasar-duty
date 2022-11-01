import { GoogleAuthProvider, FirebaseAuth, usersCollection, getAuth, signInWithCredential } from "boot/firebase.js";


export async function nonWebLogin({commit}) {
  // Build Firebase credential with the Google ID token.
  const credential = GoogleAuthProvider.credential(id_token);

  // Sign in with credential from the Google user.
  const auth = getAuth();
  signInWithCredential(auth, credential).catch((error) => {
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

export async function desktopLogin({commit}) {
  const { user } = await FirebaseAuth.signInWithPopup(GoogleAuthProvider);
  let userDoc = await usersCollection.doc(user.uid).get();
  commit('setUserProfile', userDoc.data());
  commit('setAuth', user);

  // change route to dashboard
  this.$router.push('/').catch(()=>{});
}

export async function login({ commit }) {
  // sign user in
  const { user } = await FirebaseAuth.signInWithPopup(GoogleAuthProvider);
  // let token = await FirebaseAuth.currentUser.getIdToken();
  // sessionStorage.setItem("access-token", token);
  //FirebaseAuth.signInWithRedirect(GoogleAuthProvider);
  // fetch user profile and set in state
  
  let userDoc = await usersCollection.doc(user.uid).get();
  commit('setUserProfile', userDoc.data());
  commit('setAuth', user);

  // change route to dashboard
  this.$router.push('/').catch(()=>{});
}

export async function updateProfile(obj, { commit }) {
  /*let result = await FirebaseAuth.getRedirectResult();

    if (result.user) {
      // fetch user profile and set in state
      let userDoc = await usersCollection.doc(result.user.uid).get();

      commit('setUserProfile', userDoc.data());
      commit('setAuth', result.user);

        // change route to dashboard
        this.$router.push('/').catch(()=>{});

    }
    */
   console.log("userObj: " + JSON.stringify(obj));
}


export async function saveProfile({ commit }) {
  let result = await FirebaseAuth.getRedirectResult();

    if (result.user) {
      // fetch user profile and set in state
      let userDoc = await usersCollection.doc(result.user.uid).get();

      commit('setUserProfile', userDoc.data());
      commit('setAuth', result.user);

        // change route to dashboard
        this.$router.push('/').catch(()=>{});

    }
}

export async function logout({ commit }) {
  FirebaseAuth.signOut().then(()=> {
    // clear userProfile and redirect to /login
    commit('setUserProfile', {})
    commit('setAuth', {})
    sessionStorage.removeItem("access-token");
    this.$router.push('/').catch(()=>{});
  }).catch((e) => {
    console.log(e);
  });
}
