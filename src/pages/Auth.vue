<template>
  <q-page class="flex flex-center">
    <q-btn
      v-if="!username"
      class="flex flex-center q-px-lg q-py-sm q-mb-md"
      color="primary"
      size="md"
      label="Google 登入"
      icon="login"
      @click="login"
    />
    <div v-else>{{username}}已成功登入</div>
  </q-page>
  
  <template class="flex flex-center" v-if="$q.platform.is.capacitor">
    Capacitor specific items (to be developed)
  </template>
</template>

<script setup>
import { ref, computed, inject } from "vue";
import { useStore } from "vuex";
import { useQuasar } from "quasar"

// variables
const $store = useStore();
const $q = useQuasar();


// computed    
const username = computed(() => $store.getters["userModule/getUsername"])
const login = () => $store.dispatch("userModule/login")
</script>
