<template>
    <q-page>
      <router-view style="margin-top: 55px;"/>
      <q-page-sticky position="top" expand>
        <q-tabs
          dense
          class="text-black bg-light-blue-2 fit"
          active-color="brown"
          indicator-color="blue"
          align="justify"
        >
          <q-route-tab to="/healthcare/apply" icon="calendar_month" label="申請" />
          <q-route-tab to="/healthcare/balance" icon="event" label="結餘" />
          <q-route-tab v-if="!isCenterIC" to="/duty/print" icon="print" label="審批" />
        </q-tabs>
      </q-page-sticky>
    </q-page>
  </template>
  
  <script setup>
  import { useStore } from "vuex";
  import { computed } from "vue";
  import { useQuasar } from "quasar";
  
  const $store = useStore();
  const $q = useQuasar()
  
  $store.dispatch("userModule/switchModule", "duty");
  
  const isCenterIC = computed(() => $store.getters["userModule/getCenterIC"]) 
  </script>
  
  