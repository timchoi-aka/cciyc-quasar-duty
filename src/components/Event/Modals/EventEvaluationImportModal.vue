<template>
  <q-dialog :model-value="true" persistent position="top">
    <q-card>
      <q-card-section class="text-h6 bg-blue-2">
        載入活動計劃檢討資料:
        <EventEvaluationSelection v-model="c_act_code" />
      </q-card-section>
      <q-card-section v-if="hasEvalData" key="has-eval-data">
        <EventEvaluationSelectionSummaryDisplay :model-value="EvalData" />
      </q-card-section>
      <q-card-section v-else>沒有資料</q-card-section>
      <q-card-actions>
        <q-btn
          icon="check"
          label="確定"
          class="bg-positive text-white"
          @click="updateEvent"
          v-close-popup
        />
        <q-btn
          icon="cancel"
          label="取消"
          class="bg-negative text-white"
          @click="$emit('close')"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import EventEvaluationSelection from "components/Event/EventEvaluationSelection.vue";
import EventEvaluationSelectionSummaryDisplay from "components/Event/EventEvaluationSelectionSummaryDisplay.vue";

import { ref, watch, computed } from "vue";
import { useEventProvider } from "src/providers/event";

const c_act_code = ref(null);
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["update:modelValue", ["close"]]);

const { result, loading, refetch } = useEventProvider({
  c_act_code: c_act_code,
  loadEvaluation: ref(true),
});

watch(c_act_code, (newValue) => {
  refetch();
});

const EvalData = computed(() =>
  result.value && result.value.HTX_Event_by_pk
    ? result.value.HTX_Event_by_pk.Event_to_Evaluation.length > 0
      ? result.value.HTX_Event_by_pk.Event_to_Evaluation[0]
      : {}
    : {}
);
const hasEvalData = computed(() => Object.keys(EvalData.value).length > 0);

function updateEvent() {
  emit("update:modelValue", {
    remarks: EvalData.value.remarks ? EvalData.value.remarks.trim() : "",
    c_act_code: props.modelValue.c_act_code,
    eval_end_date: EvalData.value.eval_end_date
      ? EvalData.value.eval_end_date
      : null,
    eval_end_time: EvalData.value.eval_end_time
      ? EvalData.value.eval_end_time.trim()
      : null,
    eval_sessions: EvalData.value.eval_sessions
      ? EvalData.value.eval_sessions
      : 0,
    eval_start_date: EvalData.value.eval_start_date
      ? EvalData.value.eval_start_date
      : null,
    eval_start_time: EvalData.value.eval_start_time
      ? EvalData.value.eval_start_time.trim()
      : null,
    eval_volunteer_count: EvalData.value.eval_volunteer_count
      ? EvalData.value.eval_volunteer_count
      : 0,
    objective: EvalData.value.objective ? EvalData.value.objective.trim() : "",
    objective_achieved: EvalData.value.objective_achieved
      ? EvalData.value.objective_achieved.trim()
      : null,
    objective_achieved_reason: EvalData.value.objective_achieved_reason
      ? EvalData.value.objective_achieved_reason.trim()
      : null,
    objective_followup: EvalData.value.objective_followup
      ? EvalData.value.objective_followup.trim()
      : null,
    objective_detail: EvalData.value.objective_detail
      ? EvalData.value.objective_detail.trim()
      : "",
    objective_review_method: EvalData.value.objective_review_method
      ? EvalData.value.objective_review_method.trim()
      : null,
    plan_end_date: EvalData.value.plan_end_date
      ? EvalData.value.plan_end_date
      : null,
    plan_end_time: EvalData.value.plan_end_time
      ? EvalData.value.plan_end_time.trim()
      : null,
    plan_start_date: EvalData.value.plan_start_date
      ? EvalData.value.plan_start_date
      : null,
    plan_start_time: EvalData.value.plan_start_time
      ? EvalData.value.plan_start_time.trim()
      : null,
    plan_sessions: EvalData.value.plan_sessions
      ? EvalData.value.plan_sessions
      : 0,
    plan_volunteer_count: EvalData.value.plan_volunteer_count
      ? EvalData.value.plan_volunteer_count
      : 0,
    tutor_name: EvalData.value.tutor_name
      ? EvalData.value.tutor_name.trim()
      : "",
    tutor_phone: EvalData.value.tutor_phone
      ? EvalData.value.tutor_phone.trim()
      : "",
    partner_agency: EvalData.value.partner_agency
      ? EvalData.value.partner_agency.trim()
      : "",
    partner_name: EvalData.value.partner_name
      ? EvalData.value.partner_name.trim()
      : "",
    partner_phone: EvalData.value.partner_phone
      ? EvalData.value.partner_phone.trim()
      : "",
  });
}
</script>
