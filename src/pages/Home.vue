<template>
  <q-page class="flex q-pa-md">
      Welcome Home
    <q-space />
    <div>
      <q-btn
        class="flex flex-center q-px-lg q-py-sm q-mb-md"
        size="md"
        label="Logout"
        @click="logout"
        color="primary"
      />
    </div>
  </q-page>
</template>

<script>
import firebase from "firebase/app";

export default {
name: "Home",
  data () {
  return {}
  },
  methods: {
    logout() {
      firebase.auth().signOut();
      this.$router.push('/login').then(() => {
        this.$q.notify({message: '登出成功.'})
      })
      .catch(error =>  console.log('error',error))
    }
  }
}
</script>
