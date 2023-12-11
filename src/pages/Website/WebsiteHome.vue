<template>
  <router-view/>
</template>

<script setup>
import { useStore } from "vuex";
const $store = useStore();
$store.dispatch("userModule/switchModule", "website")

</script>
