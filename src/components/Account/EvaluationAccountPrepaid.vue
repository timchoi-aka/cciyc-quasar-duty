<template>
  <div>
    <!-- loading dialog -->
    <LoadingDialog v-model="loading" message="處理中"/>
    <q-dialog v-model="showPrintVoucher">
      <Voucher :data="voucherObject" type="預支"/>
    </q-dialog>

    <q-card v-if="prepaidResult.length" class="row">
      <q-card-section class="text-body2 bg-grey-2 text-left text-bold col-12 q-ma-none q-pa-sm">預支記錄(共：${{ prepaidResult.filter((x) => x.approved || (!x.approved && !x.approve_date)).reduce((a,v) => a += v.amount,0) }}) - 預支上限：${{ parseFloat(total*0.8).toFixed(1) }}</q-card-section>
      <q-card-section class="row fit justify-left q-ma-none q-pa-sm">
        <div class="col-12 row items-center content-start prepaid-item" v-for="(record, index) in prepaidResult" :key="index">
          <span class="col-4 text-left">{{ qdate.formatDate(record.apply_date, "YYYY年M月D日") }}</span>
          <span class="col-2">${{ record.amount }}</span>
          <span class="col-2"><q-chip v-if="record.approved" label="已批" class="bg-positive text-white" dense/><q-chip v-if="!record.approved && record.approve_date" label="拒批" dense class="bg-red text-white"/><q-chip v-if="!record.approved && !record.approve_date" label="未批" class="bg-warning text-white" dense/></span>
          <span v-if="record.approved" class="col-2"><q-btn size="sm" icon="print" class="bg-primary text-white" @click="printVoucher(prepaidResult[index])"/></span>
          <q-space/>
          <span class="col-1" v-if="record.apply_user.trim() ==  username && !record.approved && record.approve_date"><q-btn class="bg-white text-primary" flat dense icon="edit" @click="prepaid=JSON.parse(JSON.stringify(record))"/></span>
          <span class="col-1" v-if="record.apply_user.trim() ==  username && (!record.approved && !record.approve_date)"><q-btn class="bg-white text-red" flat dense icon="delete" @click="deletePrepaid(record.uuid)"/></span>
          <span class="col-3" v-if="isCenterIC && (!record.approved && !record.approve_date)"><q-btn class="bg-white text-red" flat dense icon="close" @click="rejectPrepaid(record.uuid)"/><q-btn class="bg-white text-secondary" flat dense icon="check" @click="acceptPrepaid(record.uuid)"/></span>
          <q-tooltip v-if="record.recipient && record.recipient.trim().length > 0" class="bg-grey-4 text-black text-body1" :offset="[10, 10]">
            支票抬頭：{{ record.recipient }}
          </q-tooltip>
        </div>
      </q-card-section>
    </q-card>
    <q-btn v-if="Object.keys(prepaid).length == 0 && prepaidResult.length == 0 && ((props.respon.includes(username) || isUAT) && !props.isSubmitted)" class="bg-primary text-white q-my-sm" icon="money" label="申請預支" @click="prepaid = { recipient: '', amount: 0}"/>
    <q-form
      @submit="save"
      @reset="prepaid = {}"
      >
      <div class="row" v-if="Object.keys(prepaid).length">
        <div class="col-12 q-pa-sm">
          <q-input type="text" label="支票抬頭" v-model="prepaid.recipient"/>
          <q-input 
            type="number" 
            label="金額" 
            :rules="[(val) => val > 0 && val <= total*0.8 - prepaidResult.filter((x) => x.approved || (!x.approved && !x.approve_date)).reduce((a,v) => a+v.amount, 0) || '預支為0或超過上限']"
            v-model="prepaid.amount" 
            />
        </div>
        <div class="col-12 text-right q-mt-sm row">
          <q-chip>總預支：${{prepaid.amount? parseFloat(prepaid.amount) + prepaidResult.filter((x) => x.approved || (!x.approved && !x.approve_date)).reduce((a,v) => a+v.amount, 0): prepaidResult.filter((x) => x.approved || (!x.approved && !x.approve_date)).reduce((a,v) => a+v.amount, 0)}}</q-chip>
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
import { useQuery, useMutation } from "@vue/apollo-composable"
import LoadingDialog from "components/LoadingDialog.vue"
import { date as qdate, useQuasar, is, uid } from "quasar"
import Voucher from 'src/components/HealthCare/Voucher.vue'

// props
const props = defineProps({
  eval_uuid: String,
  c_act_code: String,
  respon: Array,
  isSubmitted: {
    type: Boolean,
    Required: true,
  }
})

const prepaid = ref({})
const loading = ref(0)
const $q = useQuasar()
const voucherObject = ref()
const showPrintVoucher = ref(false)

// queries
const { onResult: getEvaluationResult } = useQuery(gql`
  query Prepaid_GetExpenseByEvalUUID(
    $eval_uuid: uniqueidentifier = "00000000-0000-0000-0000-000000000000",
    ) {
    Event_Evaluation_Account(where: {
      eval_uuid: {_eq: $eval_uuid}, 
      planeval: {_eq: "計劃"},
      type: {_eq: "支出"}
    }) {
      account_uuid
      amount
    }
  }`, () => ({
    eval_uuid: props.eval_uuid,
  }), {
    pollInterval: 5000,
  });

const { result: getPrepaidResult, onError: getPrepaidResult_Error, refetch: getPrepaidResult_Refetch } = useQuery(gql`
  query Prepaid_GetPrepaidAmountByEvalUUID(
    $eval_uuid: uniqueidentifier = "00000000-0000-0000-0000-000000000000",
    ) {
    Event_Prepaid(where: {
      eval_uuid: {_eq: $eval_uuid}, 
      type: {_eq: "預支"}
    }) {
      amount
      apply_date
      apply_user
      approve_date
      approve_user
      approved
      c_act_code
      recipient
      eval_uuid
      payment_method
      uuid
      type
    }
  }`, () => ({
    eval_uuid: props.eval_uuid,
  }));

const { mutate: addPrepaidRequest, onDone: addPrepaidRequest_Completed, onError: addPrepaidRequest_Error } = useMutation(gql`
  mutation Prepaid_addPrepaid(
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
      recipient
      eval_uuid
      payment_method
      uuid
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }`)

const { mutate: editPrepaidRequest, onDone: editPrepaidRequest_Completed, onError: editPrepaidRequest_Error } = useMutation(gql`
  mutation Prepaid_editPrepaid(
    $logObject: Log_insert_input! = {}, 
    $object: Event_Prepaid_set_input = {},
    $uuid: uniqueidentifier = ""
    ) {
    update_Event_Prepaid_by_pk(pk_columns: {uuid: $uuid}, _set: $object) {
      amount
      apply_date
      apply_user
      approve_date
      approve_user
      approved
      c_act_code
      recipient
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
const total = ref(0)
  
// const total = ref(0)
const prepaidResult = computed(() => getPrepaidResult.value? getPrepaidResult.value.Event_Prepaid:[])
const $store = useStore();
const username = computed(() => $store.getters["userModule/getUsername"])
const isUAT = computed(() => $store.getters["userModule/getUAT"])
const isCenterIC = computed(() => $store.getters["userModule/getCenterIC"])


// function
function deletePrepaid(uuid) {
  loading.value++
  delPrepaid({
    uuid: uuid
  })
}

function printVoucher(record) {
  console.log(record)
  voucherObject.value = record
  showPrintVoucher.value = true
}

function save() { 
  let prepaidObject = {
    amount: parseFloat(prepaid.value.amount),
    apply_date: new Date(),
    apply_user: username.value,
    approve_date: null,
    approve_user: null,
    approved: false,
    c_act_code: props.c_act_code,
    recipient: prepaid.value.recipient,
    eval_uuid: props.eval_uuid,
    type: '預支',
    payment_method: prepaid.value.payment_method? prepaid.value.payment_method.trim(): null,
  }

  if (prepaid.value.uuid) { // edit record
    let logObject = {
      "username": username.value,
      "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      "module": "活動系統",
      "action": "修改預支: uid - " + prepaid.value.uuid + " " + JSON.stringify(prepaidObject)
    }

    loading.value++
    editPrepaidRequest({
      logObject: logObject,
      object: prepaidObject,
      uuid: prepaid.value.uuid.trim()
    })
  } else { // new record
    let logObject = {
      "username": username.value,
      "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      "module": "活動系統",
      "action": "新增預支: " + JSON.stringify(prepaidObject)
    }

    loading.value++
    addPrepaidRequest({
      logObject: logObject,
      object: prepaidObject
    })
  }
  
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
    loading.value++
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
    loading.value++
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
getEvaluationResult((result) => {
  if (result.data) {
    total.value = result.data.Event_Evaluation_Account.reduce((a,v) => a + v.amount, 0)
  }
})

addPrepaidRequest_Completed((result) => {
  prepaid.value = {}
  getPrepaidResult_Refetch()
  loading.value--
  $q.notify({
    message: "活動" + result.data.insert_Event_Prepaid_one.c_act_code + "，成功新增預支記錄。",
  }) 
})

editPrepaidRequest_Completed((result) => {
  prepaid.value = {}
  getPrepaidResult_Refetch()
  loading.value--
  $q.notify({
    message: "活動" + result.data.update_Event_Prepaid_by_pk.c_act_code + "，成功修改預支記錄。",
  }) 
})

denyPrepaid_Completed((result) => {
  getPrepaidResult_Refetch()
  loading.value--
  $q.notify({
    message: "拒絕了預支申請。",
  })
})

delPrepaid_Completed((result) => {
  getPrepaidResult_Refetch()
  loading.value--
  $q.notify({
    message: "刪除了預支申請。",
  })
})

approvePrepaid_Completed((result) => {
  getPrepaidResult_Refetch()
  loading.value--
  $q.notify({
    message: "批核了預支申請。",
  })
})
</script>

<style>
.prepaid-item:hover {
  border: 1px solid black;
}
</style>