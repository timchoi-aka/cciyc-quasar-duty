import { GoogleAuthProvider, FirebaseAuth, usersCollection } from "boot/firebase.js";

export async function login({ commit }) {
  // sign user in
  const { user } = await FirebaseAuth.signInWithPopup(GoogleAuthProvider);

  // fetch user profile and set in state
  let userDoc = await usersCollection.doc(user.uid).get();
  commit('setUserProfile', userDoc.data());
  commit('setAuth', user);

  // change route to dashboard
  this.$router.push('/').catch(()=>{});
}

export async function logout({ commit }) {
  await FirebaseAuth.signOut()

  // clear userProfile and redirect to /login
  commit('setUserProfile', {})
  commit('setAuth', {})
  this.$router.push('/login').catch(()=>{});
}
