<template>
  <router-view />
  <q-page-sticky position="top" expand>
    <q-tabs
      dense
      class="text-black bg-light-blue-2 fit"
      active-color="brown"
      indicator-color="blue"
      align="justify"
    >
      <q-route-tab to="/account/inventory/add" icon="add" label="新增物資" />
      <q-route-tab
        to="/account/inventory/list"
        icon="description"
        label="資產列表"
      />
      <q-route-tab
        to="/account/inventory/delete"
        icon="delete"
        label="報銷物資"
      />
      <q-route-tab
        to="/account/inventory/report"
        icon="leaderboard"
        label="報表"
      />
    </q-tabs>
  </q-page-sticky>
</template>

<script setup>
import { useStore } from "vuex";
import { computed } from "vue";
import { useQuasar } from "quasar";

const $store = useStore();
const $q = useQuasar();

const isTmp = computed(() => $store.getters["userModule/getTmp"]);
</script>
