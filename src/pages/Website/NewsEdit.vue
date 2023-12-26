<template>
  <!--<WebEditor :newsID="parseInt(route.params.id)"/>-->
  <Ckeditor v-model="text" :newsID="parseInt(route.params.id)"/>
</template>

<script setup>
import { ref } from 'vue';
import { useStore } from "vuex";
// import WebEditor from "src/components/Website/WebEditor.vue";
import Ckeditor from '/src/components/Basic/Ckeditor.vue';
import { useRoute } from "vue-router"
const text = ref()
const route = useRoute()
const $store = useStore();
$store.dispatch("userModule/switchModule", "website")

</script>
