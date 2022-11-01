<template>
  <div>
    <!-- loading dialog -->
    <q-dialog v-model="waitingAsync" position="bottom">
      <q-card style="width: 200px">
        <q-card-section class="row">
          <q-circular-progress
            indeterminate
            show-value
            size="100px"
            :thickness="0.4"
            font-size="10px"
            color="lime"
            track-color="grey-3"
            center-color="grey-3"
            class="q-ma-md col float-right vertical-middle"
            >登入中</q-circular-progress
          >
        </q-card-section>
      </q-card>
    </q-dialog>

    <template class="flex flex-center">
      <q-btn
        v-if="!username"
        class="flex flex-center q-px-lg q-py-sm q-mb-md"
        color="primary"
        size="md"
        label="Google 登入"
        icon="login"
        @click="google"
      />
      <div v-else>
        <div>你已成功登入</div>
        <!-- 
        <q-btn class="col-grow" name="duty" icon="event" label="編更" @click="setCurrentModule('duty')"/>
        <q-btn class="col-grow" name="member" icon="public" label="會員" @click="setCurrentModule('member')"/>
        -->
      </div>
    </template>
  </div>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";
import { useQuasar } from "quasar";
import { createHttpLink } from "@apollo/client/core";
import { FirebaseAuth } from "boot/firebase"

export default {
  name: "AuthComponent",
  data() {
    return {
      awaitServerResponse: 0,
    };
  },
  setup() {
    const $store = useStore();

    return {
      username: computed(() => $store.getters["userModule/getUsername"]),
      login: () => $store.dispatch("userModule/login"),
      desktopLogin: () => $store.dispatch("userModule/desktopLogin"),
      saveProfile: () => $store.dispatch("userModule/saveProfile"),
      setCurrentModule: ((mod) => $store.dispatch("currentModule/setCurrentModule", mod)),
    };
  },
  computed: {
    waitingAsync() {
      return this.awaitServerResponse > 0 ? true : false;
    },
  },
  methods: {
    google() {
      if (this.$q.platform.is.electron) {
        this.desktopLogin();
      } else {
        this.login()
          .then(() => {
            this.$q.notify({ message: this.username + " 登入成功." });
            /*
            FirebaseAuth.currentUser.getIdToken().then((token) => {
              this.$apollo.provider.defaultClient.setLink(createHttpLink(
                {
                  uri: 'https://cciycgw.eastasia.cloudapp.azure.com/v1/graphql/' ,
                  headers: {
                    "Authorization": `Bearer ${token}`
                  }
                }
              ))
            });
            */
          })
          .catch((error) => console.log("error", error));
      }
      /*
      this.login()
        .then(() => {
          this.$q.notify({ message: this.username + " 登入成功." });
        })
        .catch((error) => console.log("error", error));
        */
    },
  },
  async mounted() {
    if (
      this.username != null &&
      !this.$q.platform.is.capacitor &&
      !this.$q.platform.is.electron
    ) {
      this.awaitServerResponse++;
      this.saveProfile()
        .then(() => {
          this.awaitServerResponse--;
          if (this.username) {
            this.$q.notify({ message: this.username + " 登入成功." });
            /*
            FirebaseAuth.currentUser.getIdToken().then((token) => {
              this.$apollo.provider.defaultClient.setLink(createHttpLink(
                {
                  uri: 'https://cciycgw.eastasia.cloudapp.azure.com/v1/graphql/' ,
                  headers: {
                    "Authorization": `Bearer ${token}`
                  }
                }
              ))
            });
            */
          }
        })
        .catch((error) => console.log("error", error));
    }
  },
};
</script>
