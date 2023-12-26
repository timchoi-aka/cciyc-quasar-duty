<template>
  <q-page>
    <router-view v-slot="{ Component }">
      <!-- <keep-alive>-->
        <component :is="Component" :key="route.query.type"/>
      <!--</keep-alive>-->
    </router-view>
  </q-page>
</template>
<script setup>
import { useStore } from "vuex";
import { useRoute } from 'vue-router'
const route = useRoute()
const $store = useStore();
$store.dispatch("userModule/switchModule", "website");
</script>
