<template>
  <div v-if="loadMode == 'plan'">
    <div>工作目的：{{ data.objective }}</div>
    <div>工作內容：{{ data.objective_detail }}</div>
    <div>合辦機構：{{ data.partner_agency }}</div>
    <div>合辦聯絡人：{{ data.partner_name }}</div>
    <div>聯絡人電話：{{ data.partner_phone }}</div>
    <div>導師：{{ data.tutor_name }}</div>
    <div>導師電話：{{ data.tutor_phone }}</div>
    <div>備註：{{ data.remarks }}</div>
  </div>
  <div v-else>
    <div>檢討方法：{{ data.objective_review_method }}</div>
    <div>目標達成: {{ data.objective_achieved }}</div>
    <div>原因： {{ data.objective_achieved_reason }}</div>
    <div>跟進/建議： {{ data.objective_followup }}</div>
  </div>
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
  loadMode: {
    type: String,
    default: "plan",
  },
});

const data = computed(() => {
  return props.modelValue;
});
</script>
