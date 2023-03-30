<template>

    <router-view />

</template>

<script setup>
import { useQuasar } from "quasar";
import { useStore } from "vuex";
const $store = useStore();
const $q = useQuasar()
$store.dispatch("userModule/switchModule", "website")

</script>
