<template>
  <q-page>
    <router-view/> 
    <q-page-sticky position="top" expand>
      <q-tabs
        dense
        class="text-black bg-light-blue-2 fit"
        active-color="brown"
        indicator-color="blue"
        align="justify"
      >
        <q-route-tab to="/volunteer/add" icon="add" label="新增記錄" />
        <q-route-tab to="/volunteer/edit" icon="edit" label="修改記錄" />
        <q-route-tab to="/volunteer/report" icon="leaderboard" label="報表" />
      </q-tabs>
    </q-page-sticky>
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar";
import { useStore } from "vuex";

const $store = useStore();
const $q = useQuasar()
// $q.localStorage.set("module", "member");
</script>

