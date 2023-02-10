<template>
  <div>
    <!-- loading dialog -->
    <q-dialog v-model="waitingAsync" position="bottom">
      <LoadingDialog message="處理中"/>
    </q-dialog>
    
    <q-card v-if="prepaidResult.length" class="row">
      <q-card-section class="text-body2 bg-grey-2 text-left text-bold col-12 q-ma-none q-pa-sm">預支記錄(共：${{ prepaidResult.filter((x) => x.approved || (!x.approved && !x.approve_date)).reduce((a,v) => a += v.amount,0) }}) - 預支上限：${{ total*0.8 }}</q-card-section>
      <q-card-section class="row fit justify-left q-ma-none q-pa-sm">
        <div class="col-12 row items-center content-start" v-for="record in prepaidResult">
          <span class="col-4 text-left">{{ qdate.formatDate(record.apply_date, "YYYY年M月D日") }}</span>
          <span class="col-2">${{ record.amount }}</span>
          <span class="col-2"><q-chip v-if="record.approved" label="已批" class="bg-positive text-white" dense/><q-chip v-if="!record.approved && record.approve_date" label="拒批" dense class="bg-red text-white"/><q-chip v-if="!record.approved && !record.approve_date" label="未批" class="bg-warning text-white" dense/></span>
          <q-space/>
          <span class="col-1" v-if="record.apply_user.trim() ==  username && (!record.approved && !record.approve_date)"><q-btn class="bg-white text-red" flat dense icon="delete" @click="deletePrepaid(record.uuid)"/></span>
          <span class="col-3" v-if="isCenterIC && (!record.approved && !record.approve_date)"><q-btn class="bg-white text-red" flat dense icon="close" @click="rejectPrepaid(record.uuid)"/><q-btn class="bg-white text-secondary" flat dense icon="check" @click="acceptPrepaid(record.uuid)"/></span>
        </div>
      </q-card-section>
    </q-card>
    <q-btn v-if="Object.keys(props.modelValue).length == 0 && (props.respon.includes(username) || isUAT)" class="bg-primary text-white q-my-sm" icon="money" label="申請預支" @click="$emit('update:modelValue', { cheque: '', amount: 0})"/>
    <q-form
      @submit="save"
      @reset="$emit('update:modelValue', {})"
      >
      <div class="row" v-if="Object.keys(props.modelValue).length">
        <div class="col-12 q-pa-sm">
          <q-input type="text" label="支票抬頭" :model-value="props.modelValue.cheque" @update:model-value="(value) => updateModel('cheque', value)"/>
            <q-input 
              type="number" 
              label="金額" 
              :rules="[(val) => val > 0 && val <= total*0.8 - prepaidResult.filter((x) => x.approved || (!x.approved && !x.approve_date)).reduce((a,v) => a+v.amount, 0) || '預支為0或超過上限']"
              :model-value="props.modelValue.amount" 
              @update:model-value="(value) => updateModel('amount', value)"/>
        </div>
        <div class="col-12 text-right q-mt-sm row">
          <q-chip>總預支：${{props.modelValue.amount? parseFloat(props.modelValue.amount) + prepaidResult.filter((x) => x.approved || (!x.approved && !x.approve_date)).reduce((a,v) => a+v.amount, 0): prepaidResult.filter((x) => x.approved || (!x.approved && !x.approve_date)).reduce((a,v) => a+v.amount, 0)}}</q-chip>
          <q-space/>
          <q-btn class="bg-warning text-white text-right q-mx-sm" flat label="取消" type="reset"/>
          <q-btn class="bg-secondary text-white text-right q-mx-sm" flat label="遞交申請" type="submit"/>
        </div>
      </div>
    </q-form>
  </div>
</template>
<script setup>
import { gql } from "graphql-tag"
import { ref, computed } from "vue"
import { useStore } from "vuex";
import { useQuery, useMutation, useSubscription } from "@vue/apollo-composable"
import LoadingDialog from "components/LoadingDialog.vue"
import { date as qdate, useQuasar, is } from "quasar"

// props & emit
const props = defineProps({
  type: String, // 預支 / 餘款
  eval_uuid: String,
  c_act_code: String,
  modelValue: Object,
  respon: Array,
})
const emit = defineEmits(["update:modelValue"])
const awaitServerResponse = ref(0)
const $q = useQuasar()

// queries
const { result: getEvaluationResult } = useSubscription(gql`
  subscription GetExpenseByEvalUUID(
    $eval_uuid: uniqueidentifier = "00000000-0000-0000-0000-000000000000",
    $type: String! = "",
    $planeval: String! = ""
    ) {
    Event_Evaluation_Account(where: {
      eval_uuid: {_eq: $eval_uuid}, 
      planeval: {_eq: $planeval}, 
      type: {_eq: $type}
    }) {
      account_uuid
      amount
    }
  }`, () => ({
    eval_uuid: props.eval_uuid,
    type: props.type == '預支'? '支出': '收入',
    planeval: props.type == '預支'? '計劃': '檢討',
  }));

const { result: getPrepaidResult, onError: getPrepaidResult_Error, refetch: getPrepaidResult_Refetch } = useQuery(gql`
  query GetPrepaidAmountByEvalUUID(
    $eval_uuid: uniqueidentifier = "00000000-0000-0000-0000-000000000000",
    ) {
    Event_Prepaid(where: {
      eval_uuid: {_eq: $eval_uuid}, 
    }) {
      amount
      apply_date
      apply_user
      approve_date
      approve_user
      approved
      c_act_code
      cheque
      eval_uuid
      payment_method
      uuid
    }
  }`, () => ({
    eval_uuid: props.eval_uuid,
  }));

const { mutate: addPrepaidRequest, onDone: addPrepaidRequest_Completed, onError: addPrepaidRequest_Error } = useMutation(gql`
  mutation addPrepaid(
    $logObject: Log_insert_input! = {}, 
    $object: Event_Prepaid_insert_input = {}
    ) {
    insert_Event_Prepaid_one(object: $object) {
      amount
      apply_date
      apply_user
      approve_date
      approve_user
      approved
      c_act_code
      cheque
      eval_uuid
      payment_method
      uuid
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }`)

const { mutate: approvePrepaid, onDone: approvePrepaid_Completed } = useMutation(gql`
mutation approvePrepaid(
  $logObject: Log_insert_input! = {}, 
  $uuid: uniqueidentifier = "", 
  $approve_date: datetime2 = "", 
  $approve_user: String = "", 
  $approved: Boolean = false, 
  $payment_method: String = ""
  ) {
  update_Event_Prepaid_by_pk(
    pk_columns: {uuid: $uuid}, 
    _set: {approve_date: $approve_date, approve_user: $approve_user, approved: $approved, payment_method: $payment_method}
    ) {
      uuid
    }
  insert_Log_one(object: $logObject) {
    log_id
  }
}`)

const { mutate: denyPrepaid, onDone: denyPrepaid_Completed } = useMutation(gql`
mutation denyPrepaid(
  $logObject: Log_insert_input! = {}, 
  $uuid: uniqueidentifier = "", 
  $approve_date: datetime2 = "", 
  $approve_user: String = "", 
  $approved: Boolean = false, 
  ) {
  update_Event_Prepaid_by_pk(
    pk_columns: {uuid: $uuid}, 
    _set: {approve_date: $approve_date, approve_user: $approve_user, approved: $approved}
    ) {
      uuid
    }
  insert_Log_one(object: $logObject) {
    log_id
  }
}`)

const { mutate: delPrepaid, onDone: delPrepaid_Completed } = useMutation(gql`
mutation delPrepaid($uuid: uniqueidentifier = "") {
  delete_Event_Prepaid_by_pk(uuid: $uuid) {
    uuid
  }
}`) 

// computed
const total = computed(() => getEvaluationResult.value? getEvaluationResult.value.Event_Evaluation_Account.reduce((a,v) => a + v.amount, 0): 0)
  
// const total = ref(0)
const prepaidResult = computed(() => getPrepaidResult.value?.Event_Prepaid??[])
const $store = useStore();
const username = computed(() => $store.getters["userModule/getUsername"])
const isUAT = computed(() => $store.getters["userModule/getUAT"])
const isCenterIC = computed(() => $store.getters["userModule/getCenterIC"])
const waitingAsync = computed(() => awaitServerResponse > 0)

// function
function updateModel(field, value) {
  let result = JSON.parse(JSON.stringify(props.modelValue))
  result[field] = value
  emit('update:modelValue', result)
}

function deletePrepaid(uuid) {
  awaitServerResponse.value++
  delPrepaid({
    uuid: uuid
  })
}

function save() { 
  let prepaidObject = {
    amount: parseFloat(props.modelValue.amount),
    apply_date: new Date(),
    apply_user: username.value,
    c_act_code: props.c_act_code,
    cheque: props.modelValue.cheque,
    eval_uuid: props.eval_uuid,
    type: props.type,
  }

  let logObject = {
    "username": username.value,
    "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    "module": "活動系統",
    "action": "新增預支: " + JSON.stringify(prepaidObject)
  }

  awaitServerResponse.value++
  addPrepaidRequest({
    logObject: logObject,
    object: prepaidObject
  })
}

function acceptPrepaid(uuid) {
  let i = prepaidResult.value.findIndex((element) => element.uuid == uuid)
  $q.dialog({
    title: '<div class="bg-blue text-white q-pa-sm q-ma-none">批核預支申請</div>',
    message: "<div class='text-body1 q-py-xs'>確定批核預支？ </div><br/><div>申請人：" + prepaidResult.value[i].apply_user + "</div><br/><div>活動：" + prepaidResult.value[i].c_act_code + "</div><br/><div>金額：$" + prepaidResult.value[i].amount.toFixed(1) + "</div><hr class='q-mb-md'/><div class='text-body1'>選擇支付方法：</div>",
    html: true,
    options: {
      type: 'radio',
      model: 'payment_method',
      items: [
        { label: '現金', value: 'cash' },
        { label: '支票', value: 'cheque' }
      ]
    },
    cancel: true,
    persistent: true
  }).onOk((data) => {
    let logObject = {
      "username": username.value,
      "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      "module": "活動系統",
      "action": "批核預支: " + uuid
    }
    awaitServerResponse.value++
    approvePrepaid({
      logObject: logObject,
      uuid: uuid,
      approve_date: qdate.formatDate(new Date(), "YYYY-MM-DDTHH:mm:ss"),
      approve_user: username.value,
      approved: true,
      payment_method: data,
    })
  })
}

function rejectPrepaid(uuid) {
  let i = prepaidResult.value.findIndex((element) => element.uuid == uuid)
  $q.dialog({
    title: '<div class="bg-blue text-white q-pa-sm q-ma-none">拒絕預支申請</div>',
    message: "<div class='text-body1 q-py-xs'>確定拒絕預支？ </div><br/><div>申請人：" + prepaidResult.value[i].apply_user + "</div><br/><div>活動：" + prepaidResult.value[i].c_act_code + "</div><br/><div>金額：$" + prepaidResult.value[i].amount.toFixed(1) + "</div>",
    html: true,
    cancel: true,
    persistent: true
  }).onOk(() => {
    let logObject = {
      "username": username.value,
      "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      "module": "活動系統",
      "action": "拒絕預支: " + uuid
    }
    awaitServerResponse.value++
    denyPrepaid({
      logObject: logObject,
      uuid: uuid,
      approve_date: qdate.formatDate(new Date(), "YYYY-MM-DDTHH:mm:ss"),
      approve_user: username.value,
      approved: false,
    })
  })
}

// callback
addPrepaidRequest_Completed((result) => {
  emit('update:modelValue', {})
  getPrepaidResult_Refetch()
  awaitServerResponse.value--
  notifyClientSuccess(result)
})

denyPrepaid_Completed((result) => {
  getPrepaidResult_Refetch()
  awaitServerResponse.value--
  $q.notify({
    message: "拒絕了預支申請。",
  })
})

delPrepaid_Completed((result) => {
  getPrepaidResult_Refetch()
  awaitServerResponse.value--
  $q.notify({
    message: "刪除了預支申請。",
  })
})

approvePrepaid_Completed((result) => {
  getPrepaidResult_Refetch()
  awaitServerResponse.value--
  $q.notify({
    message: "批核了預支申請。",
  })
})
// UI functions
function notifyClientSuccess(result) {
  $q.notify({
    message: "活動" + result.data.insert_Event_Prepaid_one.c_act_code + "，成功新增預支記錄。",
  }) 
}
</script>