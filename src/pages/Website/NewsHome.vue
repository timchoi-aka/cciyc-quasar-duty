<template>
  <q-page-sticky style="z-index: 1" position="top" expand>
    <q-tabs
      dense
      class="text-black bg-light-blue-2 fit"
      active-color="brown"
      indicator-color="blue"
      align="justify"
    >
      <q-route-tab to="/website/news/list" icon="newspaper" label="消息列表" />
      <q-route-tab to="/website/news/add" icon="edit_calendar" label="新增消息"/>
    </q-tabs>
  </q-page-sticky>
  <q-separator class="q-mt-xl" />
  <router-view/>
</template>

<script setup>
import { useQuasar } from "quasar";
import { useStore } from "vuex";
const $store = useStore();
const $q = useQuasar()
$store.dispatch("userModule/switchModule", "website")

</script>
