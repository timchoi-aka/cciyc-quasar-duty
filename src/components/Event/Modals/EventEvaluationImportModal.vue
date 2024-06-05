<template>
  <q-dialog :model-value="true" persistent position="top">
    <q-card>
      <q-card-section class="text-h6 bg-blue-2">
        載入活動計劃檢討資料:
        <EventEvaluationSelection v-model="c_act_code" />
      </q-card-section>
      <q-card-section v-if="hasEvalData" key="has-eval-data">
        <EventEvaluationSelectionSummaryDisplay :model-value="EvalData" :loadMode="props.loadMode" />
      </q-card-section>
      <q-card-section v-else>沒有資料</q-card-section>
      <q-card-actions>
        <q-btn icon="check" label="確定" class="bg-positive text-white" @click="updateEvent" v-close-popup
          :disable="Object.keys(EvalData).length == 0" />
        <q-btn icon="cancel" label="取消" class="bg-negative text-white" @click="$emit('close')" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import EventEvaluationSelection from "components/Event/EventEvaluationSelection.vue";
import EventEvaluationSelectionSummaryDisplay from "components/Event/EventEvaluationSelectionSummaryDisplay.vue";
import { ref, computed } from "vue";
import { useEventProvider } from "src/providers/event";
import { extend } from 'quasar'

const c_act_code = ref(null);
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  loadMode: {
    type: String,
    default: "plan",
  },
});
const emit = defineEmits(["update:modelValue", ["close"]]);

const { result } = useEventProvider({
  c_act_code: c_act_code,
  loadEvaluation: ref(true),
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
  if (props.loadMode == "plan") {
    emitPlan();
  } else {
    emitEval();
  }
}

function emitPlan() {
  let emitObject = extend(true, {}, props.modelValue);
  emitObject.c_act_code = props.modelValue.c_act_code;
  emitObject.remarks = EvalData.value.remarks ? EvalData.value.remarks.trim() : "";
  emitObject.objective = EvalData.value.objective ? EvalData.value.objective.trim() : "";
  emitObject.objective_detail = EvalData.value.objective_detail
    ? EvalData.value.objective_detail.trim()
    : "";
  emitObject.plan_end_date = EvalData.value.plan_end_date
    ? EvalData.value.plan_end_date
    : null;
  emitObject.plan_end_time = EvalData.value.plan_end_time
    ? EvalData.value.plan_end_time.trim()
    : null;
  emitObject.plan_start_date = EvalData.value.plan_start_date
    ? EvalData.value.plan_start_date
    : null;
  emitObject.plan_start_time = EvalData.value.plan_start_time
    ? EvalData.value.plan_start_time.trim()
    : null;
  emitObject.plan_sessions = EvalData.value.plan_sessions
    ? EvalData.value.plan_sessions
    : 0;
  emitObject.plan_volunteer_count = EvalData.value.plan_volunteer_count
    ? EvalData.value.plan_volunteer_count
    : 0;
  emitObject.tutor_name = EvalData.value.tutor_name
    ? EvalData.value.tutor_name.trim()
    : "";
  emitObject.tutor_phone = EvalData.value.tutor_phone
    ? EvalData.value.tutor_phone.trim()
    : "";
  emitObject.partner_agency = EvalData.value.partner_agency
    ? EvalData.value.partner_agency.trim()
    : "";
  emitObject.partner_name = EvalData.value.partner_name
    ? EvalData.value.partner_name.trim()
    : "";
  emitObject.partner_phone = EvalData.value.partner_phone
    ? EvalData.value.partner_phone.trim()
    : "";
  emit("update:modelValue", emitObject);
}

function emitEval() {
  let emitObject = extend(true, {}, props.modelValue);
  emitObject.c_act_code = props.modelValue.c_act_code;
  emitObject.eval_end_date = EvalData.value.eval_end_date
    ? EvalData.value.eval_end_date
    : null;
  emitObject.eval_end_time = EvalData.value.eval_end_time
    ? EvalData.value.eval_end_time.trim()
    : null;
  emitObject.eval_sessions = EvalData.value.eval_sessions
    ? EvalData.value.eval_sessions
    : 0;
  emitObject.eval_start_date = EvalData.value.eval_start_date
    ? EvalData.value.eval_start_date
    : null;
  emitObject.eval_start_time = EvalData.value.eval_start_time
    ? EvalData.value.eval_start_time.trim()
    : null;
  emitObject.eval_volunteer_count = EvalData.value.eval_volunteer_count
    ? EvalData.value.eval_volunteer_count
    : 0;
  emitObject.objective_achieved = EvalData.value.objective_achieved
    ? EvalData.value.objective_achieved.trim()
    : null;
  emitObject.objective_achieved_reason = EvalData.value.objective_achieved_reason
    ? EvalData.value.objective_achieved_reason.trim()
    : null;
  emitObject.objective_followup = EvalData.value.objective_followup
    ? EvalData.value.objective_followup.trim()
    : null;
  emitObject.objective_review_method = EvalData.value.objective_review_method
    ? EvalData.value.objective_review_method.trim()
    : null;
  emit("update:modelValue", emitObject);
}
</script>
