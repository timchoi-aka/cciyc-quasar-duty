<template>
  <q-page>
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </q-page>
</template>
<script setup>
import { useQuasar } from "quasar";
import { useStore } from "vuex";
const $store = useStore();
const $q = useQuasar()
$store.dispatch("userModule/switchModule", "event");
</script>
