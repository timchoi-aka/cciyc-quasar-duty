<!--
  * @Description: Event Evaluation Review Block
  * - To provide a UI block for reviewing the effectiveness of an event.
  * - Includes sections for selecting the review method and determining if objectives were achieved.

  * @Input Props:
  *   - modelValue: The current value of the review block, used for v-model binding.

  * @Output Emits:
  *   - update:modelValue: Emits updates to the modelValue when changes occur within the component.

  * @Components Used:
  * - EventEvaluationReviewBlockReviewMethodSelection: For selecting the review method.
  * - EventEvaluationReviewBlockObjectiveAchievedSelection: For indicating if objectives were achieved.
-->

<template>
  <div class="row fit q-pa-sm items-center" style="border: 1px solid">
    <q-chip class="col-12" square label="成效檢討" />
    <div class="col-2 q-my-sm">檢討方法:</div>
    <div class="col-10 q-my-sm">
      <EventEvaluationReviewBlockReviewMethodSelection
        :model-value="props.modelValue.objective_review_method"
        @update:model-value="
          (val) =>
            emit('update:modelValue', {
              ...props.modelValue,
              objective_review_method: val,
            })
        "
      />
    </div>

    <div class="col-2 q-my-sm">目標達成:</div>
    <div class="col-10 q-my-sm">
      <EventEvaluationReviewBlockObjectiveAchievedSelection
        :model-value="props.modelValue.objective_achieved"
        @update:model-value="
          (val) =>
            emit('update:modelValue', {
              ...props.modelValue,
              objective_achieved: val,
            })
        "
      />
    </div>

    <div class="col-2 q-my-sm">原因:</div>
    <div class="col-10 q-my-sm">
      <q-input
        class="q-my-sm"
        type="textarea"
        filled
        :model-value="props.modelValue.objective_achieved_reason"
        @update:model-value="
          (val) =>
            emit('update:modelValue', {
              ...props.modelValue,
              objective_achieved_reason: val,
            })
        "
      />
    </div>

    <div class="col-2 q-my-sm">跟進/建議:</div>
    <div class="col-10 q-my-sm">
      <q-input
        class="q-my-sm"
        type="textarea"
        filled
        :model-value="props.modelValue.objective_followup"
        @update:model-value="
          (val) =>
            emit('update:modelValue', {
              ...props.modelValue,
              objective_followup: val,
            })
        "
      />
    </div>
  </div>
</template>

<script setup>
import EventEvaluationReviewBlockReviewMethodSelection from "./EventEvaluationReviewBlockReviewMethodSelection.vue";
import EventEvaluationReviewBlockObjectiveAchievedSelection from "./EventEvaluationReviewBlockObjectiveAchievedSelection.vue";

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["update:modelValue"]);
</script>
