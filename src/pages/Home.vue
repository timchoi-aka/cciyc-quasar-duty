<template>
  <q-page class="flex q-pa-md">
    Welcome Home {{ this.username }}
    <q-space />
    <div>
      <q-btn
        v-if="username"
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
import { computed } from "vue";
import { useStore } from "vuex";

export default {
  name: "Home",
  data() {
    return {};
  },
  methods: {
    logout() {
      firebase.auth().signOut();
      this.$router
        .push("/login")
        .then(() => {
          this.$q.notify({ message: "登出成功." });
        })
        .catch((error) => console.log("error", error));
    },
  },
  setup() {
    const $store = useStore();

    return {
      username: computed(() => $store.getters["userModule/getUsername"]),
    };
  },
};
</script>
