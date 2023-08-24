<template>  
   <!-- loading dialog -->
  <LoadingDialog v-model="loading" message="處理中"/>
  
  <div class="col-12 row justify-center">
    <q-chip class="bg-grey-4" size="lg" square :label="props.type"/>
    <q-btn flat v-if="!edit && (!props.isSubmitted || isCenterIC)" icon="edit" class="bg-white text-primary" @click="startEdit"/>
    <q-btn flat v-if="edit" icon="add" class="bg-white text-primary" @click="addObject"/>
    <q-btn flat v-if="edit" icon="save" class="col-2 bg-white text-positive" @click="save"/>
    <q-btn flat v-if="edit" icon="restart_alt" class="col-2 bg-white text-negative" @click="edit = false"/>
  </div>
  <q-list class="col-12 self-start" v-if="!edit && account.length > 0" bordered separator>
    <q-item v-for="item in account" clickable >
      <q-item-section><q-item-label>{{item.description}}</q-item-label></q-item-section>
      <q-item-section side class="text-black">HK${{item.amount.toFixed(2)}}<q-btn v-if="edit" icon="remove" class="bg-negative text-white"/></q-item-section>
      <q-tooltip>
         日期：{{ qdate.formatDate(item.txn_date, "YYYY年M月D日") }}
      </q-tooltip>
    </q-item>   
  </q-list>
  <q-list v-if="edit && editObject.length > 0" class="col-12 self-start" bordered separator>
    <span v-for="(newPlanIncome, index) in editObject" class="row">
      <q-input hide-hint class="col-7" type="text" label="項目名稱" v-model="editObject[index].description"/>
      <q-input hide-hint class="col-3" type="number" label="金額" v-model="editObject[index].amount"/>
      <div class="col-2 row">
        <span class="text-negative" v-if="removeRecord.includes(editObject[index].account_uuid)">會刪除</span>
        <q-btn v-if="edit" icon="delete" class="bg-white text-negative" flat @click="removeRecord.push(editObject[index].account_uuid)"/>
      </div>
      <div class="col-12"><DateComponent v-model="editObject[index].txn_date"/></div>
    </span>   
  </q-list>
  <div class="col-12 text-right q-mt-sm q-px-sm">總數: HK${{total}}</div>
  <div class="col-12 text-right q-mt-sm" v-if="props.type == '支出' && props.planeval == '計劃'">
    <EvaluationAccountPrepaid :isSubmitted="props.isSubmitted" :c_act_code="props.c_act_code" :eval_uuid="props.eval_uuid" :respon="props.respon"/>
  </div>
  <div class="col-12 text-right q-mt-sm" v-if="props.type == '支出' && props.planeval == '檢討'">
    <EvaluationAccountRemain :isSubmitted="props.isSubmitted" :c_act_code="props.c_act_code" :eval_uuid="props.eval_uuid" :respon="props.respon"/>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { EVALUATION_ACCOUNT } from "/src/graphQueries/Event/query.js"
import { ADD_EVALUATION_ACCOUNT_FROM_UUID } from "/src/graphQueries/Event/mutation.js"
import { useQuery, useMutation } from "@vue/apollo-composable"
import { date as qdate, useQuasar, uid } from "quasar";
import LoadingDialog from "components/LoadingDialog.vue"
import EvaluationAccountPrepaid from "components/Account/EvaluationAccountPrepaid.vue"
import EvaluationAccountRemain from "components/Account/EvaluationAccountRemain.vue"
import DateComponent from "components/Basic/DateComponent.vue"

// variables
const edit = ref(false)
const editObject = ref({})
const removeRecord = ref([])
const loading = ref(0)
const $q = useQuasar()


// props
const props = defineProps({
  type: String,
  planeval: String,
  eval_uuid: String,
  c_act_code: String,
  isSubmitted: Boolean,
  respon: Array,
})

// queries
const { result, onError, refetch } = useQuery(
  EVALUATION_ACCOUNT,
  () => ({
    eval_uuid: props.eval_uuid,
    type: props.type,
    planeval: props.planeval,
  }));

const { mutate: addEvaluationAccountFromUUID, onDone: addEvaluationAccountFromUUID_Completed, onError: addEvaluationAccountFromUUID_Error } = useMutation(ADD_EVALUATION_ACCOUNT_FROM_UUID)

// computed values
const $store = useStore();
const username = computed(() => $store.getters["userModule/getUsername"])
const account = computed(() => result.value?.Event_Evaluation_Account??[])
const total = computed(() => result.value?.Event_Evaluation_Account_aggregate.aggregate.sum.amount??0)
const isCenterIC = computed(() => $store.getters["userModule/getCenterIC"])

// functions
function addObject() {
  editObject.value.push({
    description: "", 
    amount: 0,
    type: props.type,
    eval_uuid: props.eval_uuid,
    planeval: props.planeval,
    c_act_code: props.c_act_code.trim(),
    txn_date: qdate.formatDate(new Date(), "YYYY/MM/DD")
  })
}

function startEdit() {
  editObject.value = JSON.parse(JSON.stringify(account.value))
  removeRecord.value = []
  // purify the object
  editObject.value.forEach((obj) => {
    delete obj["__typename"]
    for (const [key,value] of Object.entries(obj)) {
      switch (typeof(value)) {
        case "string":
          obj[key] = value.trim()
          break;
        case "number":
          obj[key] = value.toFixed(2)
          break;
        default:
          break;
      }
    }
  })
  
  edit.value = true
}

function save() {
  const logObject = ref({
    "username": username,
    "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    "module": "活動系統",
    "action": "修改活動計劃/檢討: " + props.c_act_code + "的財務預算。新資料:" + JSON.stringify(editObject.value, null, 2) + " 刪除記錄: " + JSON.stringify(removeRecord.value, null, 2)
  })
  
  editObject.value.forEach((obj) => {
    obj.type = obj.type.trim()
    obj.amount = parseFloat(obj.amount)
    obj.account_uuid = obj.account_uuid? obj.account_uuid.trim() : uid()
    obj.c_act_code = obj.c_act_code.trim()
    obj.planeval = obj.planeval.trim()
    obj.description = obj.description.trim()
    obj.txn_date = qdate.formatDate(obj.txn_date, "YYYY-MM-DDTHH:mm:ss")
  })

  loading.value++
  addEvaluationAccountFromUUID({
    logObject: logObject.value,
    objects: editObject.value,
    removeRecord: removeRecord.value.length > 0? removeRecord.value: ["00000000-0000-0000-0000-000000000000"], //use dummy uuid
  })

  edit.value = false
}

// UI functions
function notifyClientSuccess(result) {
  refetch()
  loading.value--  
  $q.notify({
    message: "財政預算" + props.c_act_code + "更新完成。",
  })
}

// callbacks
addEvaluationAccountFromUUID_Completed((result) => {
  notifyClientSuccess(result)
})
</script>