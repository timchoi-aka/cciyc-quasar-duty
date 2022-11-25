<template>
  <q-page>
    <router-view/>
  </q-page>
</template>
<script setup>
import { useStore } from "vuex";
const $store = useStore();
$store.dispatch("currentModule/setCurrentModule", "member");
</script>