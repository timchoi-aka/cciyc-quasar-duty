<template>
  <router-view/>
  <q-page-sticky position="top" expand>
    <q-tabs
      dense
      class="text-black bg-light-blue-2 fit"
      active-color="brown"
      indicator-color="blue"
      align="justify"
    >
      <q-route-tab to="/account/inventory/list" icon="add" label="物資管理" />
      <q-route-tab to="/account/inventory/take_record" icon="leaderboard" label="盤點" />
    </q-tabs>
  </q-page-sticky>
</template>

<script setup>
import { useStore } from "vuex";
import { computed } from "vue";
import { useQuasar } from "quasar";

const $store = useStore();
const $q = useQuasar()

const isTmp = computed(() => $store.getters["userModule/getTmp"]) 
</script>