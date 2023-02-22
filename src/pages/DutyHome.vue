<template>
  <q-page>
    <router-view style="margin-top: 70px;"/>
    <q-page-sticky position="top" expand>
      <q-tabs
        dense
        class="text-black bg-light-blue-2 fit"
        active-color="brown"
        indicator-color="blue"
        align="justify"
      >
        <q-route-tab to="/duty/dutytable" icon="calendar_month" label="更表" />
        <q-route-tab v-if="!isTmp" to="/duty/activity" icon="event" label="活動" />
        <q-route-tab v-if="!isTmp" to="/duty/print" icon="print" label="列印更表" />
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

const isTmp = computed(() => $store.getters["userModule/getTmp"]) 
</script>

