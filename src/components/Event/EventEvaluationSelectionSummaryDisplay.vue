<template>
  <!-- loading dialog -->
  <div>工作目的：{{ data.objective }}</div>
  <div>工作內容：{{ data.objective_detail }}</div>
  <div>合辦機構：{{ data.partner_agency }}</div>
  <div>合辦聯絡人：{{ data.partner_name }}</div>
  <div>聯絡人電話：{{ data.partner_phone }}</div>
  <div>導師：{{ data.tutor_name }}</div>
  <div>導師電話：{{ data.tutor_phone }}</div>
  <div>備註：{{ data.remarks }}</div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    validator: (value) => {
      return (
        value.hasOwnProperty("__typename") &&
        value.__typename === "Event_Evaluation"
      );
    },
  },
});

const data = computed(() => {
  return props.modelValue;
});
</script>
