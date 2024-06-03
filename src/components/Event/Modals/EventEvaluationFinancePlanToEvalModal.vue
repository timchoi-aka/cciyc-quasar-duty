<template>
  <q-dialog :model-value="true" position="top">
    <q-card>
      <q-card-section class="text-h6 bg-blue-2">
        複制活動財務計劃資料:
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
      </q-card-section>
      <q-card-section v-else key="has-no-finance-data">沒有資料</q-card-section>
      <q-card-actions>
        <q-btn icon="check" label="確定" class="bg-positive text-white" @click="save" v-close-popup
          :disable="!hasFinanceData" />
        <q-btn icon="cancel" label="取消" class="bg-negative text-white" v-close-popup @click="$emit('close')" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useStore } from "vuex";
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

const username = computed(() => $store.getters["userModule/getUsername"]);

const FinanceData = computed(() =>
  result.value && result.value.Event_Evaluation_Account
    ? result.value.Event_Evaluation_Account
    : []
);
const hasFinanceData = computed(
  () => FinanceData.value && FinanceData.value.filter((x) => x.planeval.trim() == "計劃").length > 0
);

const FinanceDataPlan = computed(() =>
  FinanceData.value
    .filter((data) => data.planeval.trim() == "計劃")
    .sort((a, b) => a.type.localeCompare(b.type))
);

const {
  result,
  addFinance,
  message,
} = useEvaluationFinanceProvider({
  eval_uuid: ref(props.evalUUID),
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
    FinanceDataPlan.value.forEach((data) => {
      editObject.value.push({
        type: data.type ? data.type.trim() : "",
        amount: data.amount,
        account_uuid: uid(),
        eval_uuid: props.evalUUID,
        c_act_code: data.c_act_code ? data.c_act_code.trim() : "",
        planeval: "檢討",
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
