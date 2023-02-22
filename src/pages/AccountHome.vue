<template>
  <!--<q-page>
    <router-view style="margin-top: 70px;"/>

    <q-page-sticky position="top" expand>
      <q-tabs
        dense
        class="text-black bg-light-blue-2 fit"
        active-color="brown"
        indicator-color="blue"
        align="justify"
      >
        <q-route-tab to="/account/other" icon="calendar_month" label="雜項" />
      </q-tabs>
    </q-page-sticky>
    
  </q-page>-->
  <router-view/>
</template>

<script setup>
import { useStore } from "vuex";
import { computed } from "vue";

const $store = useStore();
$store.dispatch("userModule/switchModule", "account");

const isTmp = computed(() => $store.getters["userModule/getTmp"]) 
</script>

