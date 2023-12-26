<template>
  <q-btn flat :class="[visible? 'text-primary': 'text-negative']" :icon="visible ? 'visibility' : 'visibility_off'" @click="emit('click', visible? 0: 1)">
    <q-tooltip>{{visible ? '隱藏': '顯示'}}</q-tooltip>
  </q-btn>
</template>
<script setup>
import { computed } from 'vue';

const props = defineProps({
  state: {
    /* type(Number):
    * 1 = visible
    * 0 = invisible
    */
    type: Number,
  }
})
const emit = defineEmits(["click"]);
const visible = computed(() => props.state? props.state === 1: false)
</script>
