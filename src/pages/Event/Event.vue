<template>
  <q-page-container>
    <Suspense><router-view/></Suspense>
  </q-page-container>
</template>
<script setup>
import { useStore } from "vuex";
const $store = useStore();
$store.dispatch("currentModule/setCurrentModule", "event");
</script>