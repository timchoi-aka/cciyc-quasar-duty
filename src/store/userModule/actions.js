import { GoogleAuthProvider, FirebaseAuth, usersCollection } from "boot/firebase.js";

export async function login({ commit }) {
  // sign user in
  // const { user } = await FirebaseAuth.signInWithPopup(GoogleAuthProvider);


  FirebaseAuth.signInWithRedirect(GoogleAuthProvider);
  // fetch user profile and set in state
  /*
  let userDoc = await usersCollection.doc(user.uid).get();
  commit('setUserProfile', userDoc.data());
  commit('setAuth', user);

  // change route to dashboard
  this.$router.push('/').catch(()=>{});
  */
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
    this.$router.push('/').catch(()=>{});
  }).catch((e) => {
    console.log(e);
  });
}
