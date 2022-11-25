<template>
  <q-page>
    <Suspense><router-view/></Suspense>
  </q-page>
</template>
<script setup>
import { useStore } from "vuex";
const $store = useStore();
$store.dispatch("currentModule/setCurrentModule", "event");
</script>