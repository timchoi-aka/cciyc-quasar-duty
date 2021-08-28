<template>
  <div>
    <template class="flex flex-center">
      <q-btn v-if="!username" class="flex flex-center q-px-lg q-py-sm q-mb-md" color="primary" size="md" label="Google 登入" icon="login"
        @click="google"
      />
      <div v-if="username">你已成功登入</div>
    </template>
  </div>
</template>

<script>
import firebase from "firebase/app";
import { computed } from "vue"
import { useStore } from "vuex"

export default {
  name: "AuthComponent",
  setup() {
    const $store = useStore()

    return {
      username: computed(() => $store.getters['userModule/getUsername']),
      login: () => $store.dispatch('userModule/login')
    }
  },
  methods: {
    google () {
      this.login()
      .then(()=> {
        this.$q.notify({message: this.username + " 登入成功."})
      })
      .catch(error => console.log('error',error))
    },
  }
}
</script>
