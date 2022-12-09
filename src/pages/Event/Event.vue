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
import { useStore } from "vuex";
const $store = useStore();
$store.dispatch("currentModule/setCurrentModule", "event");
</script>