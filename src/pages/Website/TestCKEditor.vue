<template>
  <div>
    <Ckeditor v-model="text" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Ckeditor from '/src/components/Basic/Ckeditor.vue';

const text = ref('<p>Some initial content</p>');
</script>
