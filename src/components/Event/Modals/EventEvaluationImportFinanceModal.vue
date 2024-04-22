<template>
  <q-dialog :model-value="true" position="top">
    <q-card>
      <q-card-section class="text-h6 bg-blue-2">
        載入活動計劃財務資料:
        <EventEvaluationSelection v-model="c_act_code" />
      </q-card-section>
      <q-card-section v-if="hasFinanceData" key="has-finance-data">
        <q-chip>計劃</q-chip>
        <ul v-if="FinanceDataPlan.length > 0" key="has_plan_data">
          <li v-for="data in FinanceDataPlan" :key="data.account_uuid">
            {{ data.type }} -
            {{ date.formatDate(data.txn_date, "YYYY年M月D日") }} -
            {{ data.description }} - ${{ data.amount }}
          </li>
        </ul>
        <div v-else key="has-no-plan-data">沒有資料</div>
        <q-chip>檢討</q-chip>
        <ul v-if="FinanceDataEval.length > 0" key="has_eval_data">
          <li v-for="data in FinanceDataEval" :key="data.account_uuid">
            {{ data.type }} -
            {{ date.formatDate(data.txn_date, "YYYY年M月D日") }} -
            {{ data.description }} - ${{ data.amount }}
          </li>
        </ul>
        <div v-else key="has-no-eval-data">沒有資料</div>
      </q-card-section>
      <q-card-section v-else key="has-no-finance-data">沒有資料</q-card-section>
      <q-card-actions>
        <q-btn
          icon="check"
          label="確定"
          class="bg-positive text-white"
          @click="save"
          v-close-popup
          :disable="!hasFinanceData"
        />
        <q-btn
          icon="cancel"
          label="取消"
          class="bg-negative text-white"
          v-close-popup
          @click="$emit('close')"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import EventEvaluationSelection from "components/Event/EventEvaluationSelection.vue";
import { ref, watch, computed } from "vue";
import { useStore } from "vuex";
import { useEventProvider } from "src/providers/event";
import { uid, date, useQuasar } from "quasar";
import { useEvaluationFinanceProvider } from "src/providers/evaluationFinance";
import { useRouter } from "vue-router";

const router = useRouter();
const $q = useQuasar();
const $store = useStore();
const props = defineProps({
  evalUUID: {
    type: String,
    required: true,
    validation: (value) => {
      return value.length > 0;
    },
  },
  c_act_code: {
    type: String,
    required: true,
    validation: (value) => {
      return value.length > 0;
    },
  },
});
const emit = defineEmits(["close"]);

const c_act_code = ref(null);

const { result, loading, refetch } = useEventProvider({
  c_act_code: c_act_code,
  loadEvaluation: ref(true),
});

const username = computed(() => $store.getters["userModule/getUsername"]);
watch(c_act_code, (newValue) => {
  refetch();
});

const FinanceData = computed(() =>
  result.value && result.value.HTX_Event_by_pk
    ? result.value.HTX_Event_by_pk.Event_to_Evaluation.length > 0 &&
      result.value.HTX_Event_by_pk.Event_to_Evaluation[0].Evaluation_to_Account
        .length > 0
      ? result.value.HTX_Event_by_pk.Event_to_Evaluation[0]
          .Evaluation_to_Account
      : {}
    : {}
);
const hasFinanceData = computed(
  () => Object.keys(FinanceData.value).length > 0
);
const FinanceDataPlan = computed(() =>
  FinanceData.value
    .filter((data) => data.planeval.trim() == "計劃")
    .sort((a, b) => a.type.localeCompare(b.type))
);
const FinanceDataEval = computed(() =>
  FinanceData.value
    .filter((data) => data.planeval.trim() == "檢討")
    .sort((a, b) => a.type.localeCompare(b.type))
);

const {
  result: financeResult,
  addFinance,
  message,
} = useEvaluationFinanceProvider({
  evalUUID: props.evalUUID,
});

watch(message, (newMessage) => {
  if (newMessage) {
    $q.notify({
      message: newMessage,
    });
  }
});

function save() {
  let editObject = ref([]);
  if (hasFinanceData) {
    FinanceData.value.forEach((data) => {
      editObject.value.push({
        type: data.type ? data.type.trim() : "",
        amount: data.amount,
        account_uuid: uid(),
        eval_uuid: props.evalUUID,
        c_act_code: props.c_act_code ? props.c_act_code.trim() : "",
        planeval: data.planeval ? data.planeval.trim() : "",
        description: data.description ? data.description.trim() : "",
        txn_date: date.formatDate(new Date(), "YYYY-MM-DDTHH:mm:ss"),
      });
    });
  }

  addFinance({
    objects: editObject,
    username: username,
    c_act_code: ref(props.c_act_code),
  }).then(() => {
    $q.notify({
      message: "財務資料已載入。",
    });

    router.push({
      path: "/event/detail/" + props.c_act_code + "/evaluation/view",
    });
  });
}
</script>
