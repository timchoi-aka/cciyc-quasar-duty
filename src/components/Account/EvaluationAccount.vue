<template>
  <!-- loading dialog -->
  <LoadingDialog v-model="loading" message="處理中" />

  <div class="col-12 row justify-center">
    <q-chip class="bg-grey-4" size="lg" square :label="props.type" />
    <q-btn
      flat
      v-if="!edit && (!props.isSubmitted || isCenterIC)"
      icon="edit"
      class="bg-white text-primary"
      @click="startEdit"
    />
    <q-btn
      flat
      v-if="edit"
      icon="add"
      class="bg-white text-primary"
      @click="addObject"
    />
    <q-btn
      flat
      v-if="edit"
      icon="save"
      class="col-2 bg-white text-positive"
      @click="save"
    />
    <q-btn
      flat
      v-if="edit"
      icon="restart_alt"
      class="col-2 bg-white text-negative"
      @click="edit = false"
    />
  </div>
  <q-list
    class="col-12 self-start"
    v-if="!edit && account.length > 0"
    bordered
    separator
  >
    <q-item v-for="item in account" clickable>
      <q-item-section
        ><q-item-label>{{ item.description }}</q-item-label></q-item-section
      >
      <q-item-section side class="text-black"
        >HK${{ item.amount.toFixed(2)
        }}<q-btn v-if="edit" icon="remove" class="bg-negative text-white"
      /></q-item-section>
      <q-tooltip>
        日期：{{ date.formatDate(item.txn_date, "YYYY年M月D日") }}
      </q-tooltip>
    </q-item>
  </q-list>
  <q-list
    v-if="edit && editObject.length > 0"
    class="col-12 self-start"
    bordered
    separator
  >
    <span v-for="(newPlanIncome, index) in editObject" class="row">
      <SelectionWithAdd
        :options="inputOptions"
        class="col-7"
        type="text"
        label="項目名稱"
        v-model="editObject[index].description"
      />
      <q-input
        hide-hint
        class="col-3"
        type="number"
        label="金額"
        v-model="editObject[index].amount"
      />
      <div class="col-2 row">
        <span
          class="text-negative"
          v-if="removeRecord.includes(editObject[index].account_uuid)"
          >會刪除</span
        >
        <q-btn
          v-if="edit"
          icon="delete"
          class="bg-white text-negative"
          flat
          @click="removeRecord.push(editObject[index].account_uuid)"
        />
      </div>
      <div class="col-12">
        <DateComponent v-model="editObject[index].txn_date" />
      </div>
    </span>
  </q-list>
  <div class="col-12 text-right q-mt-sm q-px-sm">總數: HK${{ total }}</div>
  <div
    class="col-12 text-right q-mt-sm"
    v-if="props.type == '支出' && props.planeval == '計劃'"
  >
    <EvaluationAccountPrepaid
      :isSubmitted="props.isSubmitted"
      :c_act_code="props.c_act_code"
      :eval_uuid="props.eval_uuid"
      :respon="props.respon"
    />
  </div>
  <div
    class="col-12 text-right q-mt-sm"
    v-if="props.type == '支出' && props.planeval == '檢討'"
  >
    <EvaluationAccountRemain
      :isSubmitted="props.isSubmitted"
      :c_act_code="props.c_act_code"
      :eval_uuid="props.eval_uuid"
      :respon="props.respon"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useStore } from "vuex";
import { ADD_EVALUATION_ACCOUNT_FROM_UUID } from "/src/graphQueries/Event/mutation.js";
import { useMutation } from "@vue/apollo-composable";
import { date, useQuasar, uid } from "quasar";
import LoadingDialog from "components/LoadingDialog.vue";
import EvaluationAccountPrepaid from "components/Account/EvaluationAccountPrepaid.vue";
import EvaluationAccountRemain from "components/Account/EvaluationAccountRemain.vue";
import DateComponent from "components/Basic/DateComponent.vue";
import { useEvaluationFinanceProvider } from "src/providers/evaluationFinance";
import SelectionWithAdd from "../Basic/SelectionWithAdd.vue";

// variables
const edit = ref(false);
const editObject = ref({});
const removeRecord = ref([]);
const loading = ref(0);
const $q = useQuasar();

const inputOptions = ref([
  "中心津貼: 整筆過撥款",
  "中心津貼: 捐款儲備",
  "中心津貼: 非資助儲備",
  "其他資助: 青年發展計劃暑期一般活動",
  "其他資助: 青年發展計劃地區青年活動",
  "其他資助: 地區夥伴協作計劃",
  "活動收費",
]);
// props
const props = defineProps({
  type: String,
  planeval: String,
  eval_uuid: String,
  c_act_code: String,
  isSubmitted: Boolean,
  respon: Array,
});

const { result, message, addFinance } = useEvaluationFinanceProvider({
  eval_uuid: ref(props.eval_uuid),
});

// display result message to user
watch(message, (newMessage) => {
  if (newMessage) {
    $q.notify({
      message: newMessage,
    });
  }
});
/*
const {
  mutate: addEvaluationAccountFromUUID,
  onDone: addEvaluationAccountFromUUID_Completed,
  onError: addEvaluationAccountFromUUID_Error,
} = useMutation(ADD_EVALUATION_ACCOUNT_FROM_UUID);
*/

// computed values
const $store = useStore();
const username = computed(() => $store.getters["userModule/getUsername"]);
const isCenterIC = computed(() => $store.getters["userModule/getCenterIC"]);
const account = computed(() =>
  result.value &&
  result.value.Event_Evaluation_Account &&
  result.value.Event_Evaluation_Account.length > 0
    ? result.value.Event_Evaluation_Account.filter(
        (data) =>
          data.type.trim() == props.type &&
          data.planeval.trim() == props.planeval
      )
    : []
);

const total = computed(() =>
  account.value
    ? parseFloat(account.value.reduce((a, v) => a + v.amount, 0)).toFixed(2)
    : 0
);

// functions
function addObject() {
  editObject.value.push({
    description: "",
    amount: 0,
    type: props.type,
    eval_uuid: props.eval_uuid,
    planeval: props.planeval,
    c_act_code: props.c_act_code.trim(),
    txn_date: date.formatDate(new Date(), "YYYY/MM/DD"),
  });
}

function startEdit() {
  editObject.value = JSON.parse(JSON.stringify(account.value));
  removeRecord.value = [];
  // purify the object
  editObject.value.forEach((obj) => {
    delete obj["__typename"];
    for (const [key, value] of Object.entries(obj)) {
      switch (typeof value) {
        case "string":
          obj[key] = value.trim();
          break;
        case "number":
          obj[key] = value.toFixed(2);
          break;
        default:
          break;
      }
    }
  });

  edit.value = true;
}

function newValue(value, done) {
  if (value) {
    inputOptions.value.push(value);
  }
  done(value);
}

function save() {
  editObject.value.forEach((obj) => {
    obj.type = obj.type.trim();
    obj.amount = parseFloat(obj.amount);
    obj.account_uuid = obj.account_uuid ? obj.account_uuid.trim() : uid();
    obj.c_act_code = obj.c_act_code.trim();
    obj.planeval = obj.planeval.trim();
    obj.description = obj.description ? obj.description.trim() : "";
    obj.txn_date = date.formatDate(obj.txn_date, "YYYY-MM-DDTHH:mm:ss");
  });

  // loading.value++;
  addFinance({
    objects: editObject,
    username: username,
    c_act_code: ref(props.c_act_code.trim()),
    removeRecord:
      removeRecord.value.length > 0
        ? removeRecord
        : ref(["00000000-0000-0000-0000-000000000000"]), //use dummy uuid
  });

  edit.value = false;
}
/*
// UI functions
function notifyClientSuccess(result) {
  refetch();
  loading.value--;
  $q.notify({
    message: "財政預算" + props.c_act_code + "更新完成。",
  });
}

// callbacks
addEvaluationAccountFromUUID_Completed((result) => {
  notifyClientSuccess(result);
}); */
</script>
