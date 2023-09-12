<template>
  <div>
    <!-- loading dialog -->
    <LoadingDialog v-model="loading" message="處理中"/>
    <q-dialog full-width full-height v-model="showPrepaidClaimForm">
      <PrepaidRemainForm :data="prepaidClaimObject" :c_act_code="props.c_act_code" :eval_uuid="props.eval_uuid"/>
    </q-dialog>

    <q-card v-if="claimResult.length" class="row">
      <q-card-section class="text-body2 bg-grey-2 text-left text-bold col-12 q-ma-none q-pa-sm">申請餘款記錄(共：${{ claimResult.filter((x) => x.approved || (!x.approved && !x.approve_date)).reduce((a,v) => a += v.amount,0) }}) <span v-if="claimResult.length > 0" class="col-2"><q-btn size="sm" icon="print" class="bg-primary text-white" @click="printPrepaidClaimForm(claimResult)"/></span></q-card-section>
      <q-card-section class="row fit justify-left q-ma-none q-pa-sm">
        <div class="col-12 row items-center content-start prepaid-item" v-for="(record, index) in claimResult" :key="index">
          <span class="col-4 text-left">{{ qdate.formatDate(record.apply_date, "YYYY年M月D日") }}</span>
          <span class="col-2">${{ record.amount }}</span>
          <span class="col-2"><q-chip v-if="record.approved" label="已批" class="bg-positive text-white" dense/><q-chip v-if="!record.approved && record.approve_date" label="拒批" dense class="bg-red text-white"/><q-chip v-if="!record.approved && !record.approve_date" label="未批" class="bg-warning text-white" dense/></span>
          <!--<span v-if="record.approved" class="col-2"><q-btn size="sm" icon="print" class="bg-primary text-white" @click="printVoucher(claimResult[index])"/></span>-->
          <q-space/>
          <span class="col-1" v-if="record.apply_user.trim() ==  username && (!record.approved && !record.approve_date)"><q-btn class="bg-white text-red" flat dense icon="delete" @click="deleteClaim(record.uuid)"/></span>
          <span class="col-3" v-if="isCenterIC && (!record.approved && !record.approve_date)"><q-btn class="bg-white text-red" flat dense icon="close" @click="rejectClaim(record.uuid)"/><q-btn class="bg-white text-secondary" flat dense icon="check" @click="acceptClaim(record.uuid)"/></span>
          <q-tooltip v-if="record.recipient && record.recipient.trim().length > 0" class="bg-grey-4 text-black text-body1" :offset="[10, 10]">
            支票抬頭：{{ record.recipient }}
          </q-tooltip>
        </div>
      </q-card-section>
    </q-card>

    <div class="row justify-around items-center">
      <div class="text-left text-body1 text-bold">已預支：${{ prepaidResult.filter((x) => x.approved).reduce((a,v) => a+v.amount, 0) }}</div>
      <q-btn v-if="MaximumClaim > 0 && (props.respon.includes(username) || isUAT)" class="bg-primary text-white q-my-sm" icon="money" label="申請餘款" @click="claim = { recipient: '', amount: MaximumClaim}"/>
    </div>
    <q-form
      @submit="save"
      @reset="claim = {}"
      >
      <div class="row" v-if="Object.keys(claim).length">
        <div class="col-12 text-right q-mt-sm row">
          <q-chip>可申請餘款：${{MaximumClaim}}</q-chip>
        </div>
        <div class="col-12 text-right q-mt-sm row">
          <q-input class="col-12" type="text" label="支票抬頭" v-model="claim.recipient"/>
          <q-input class="col-12"
            label="金額" 
            :rules="[(val) => parseFloat(val) > 0 && parseFloat(val) <= MaximumClaim || '預支為0或超過上限']"
            v-model="claim.amount" 
            />
          <q-btn class="bg-warning text-white text-right q-mx-sm" flat label="取消" type="reset"/>
          <q-btn class="bg-secondary text-white text-right q-mx-sm" flat label="遞交" type="submit"/>
        </div>
      </div>
    </q-form>
  </div>
</template>
<script setup>
import { gql } from "graphql-tag"
import { ref, computed } from "vue"
import { useStore } from "vuex";
import { useMutation, useQuery } from "@vue/apollo-composable"
import LoadingDialog from "components/LoadingDialog.vue"
import { date as qdate, useQuasar } from "quasar"
import Voucher from 'src/components/HealthCare/Voucher.vue'
import PrepaidRemainForm from "../Event/PrepaidRemainForm.vue";

// props
const props = defineProps({
  eval_uuid: String,
  c_act_code: String,
  respon: Array,
})

const prepaid = ref({})
const claim = ref({})
const loading = ref(0)
const $q = useQuasar()
const voucherObject = ref()
const prepaidClaimObject = ref([])
const showPrintVoucher = ref(false)
const showPrepaidClaimForm = ref(false)

// queries
const { onResult: getEvaluationResult } = useQuery(gql`
  query Remain_GetExpenseByEvalUUID(
    $eval_uuid: uniqueidentifier = "00000000-0000-0000-0000-000000000000",
    ) {
    Event_Evaluation_Account(where: {
      eval_uuid: {_eq: $eval_uuid}, 
      planeval: {_eq: "檢討"},
    }) {
      account_uuid
      type
      amount
    }
  }`, () => ({
    eval_uuid: props.eval_uuid,
  }), {
    pollInterval: 5000,
  });

const { onResult: getPrepaidResult } = useQuery(gql`
  query Remain_GetPrepaidAmountByEvalUUID(
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
      recipient
      type
      eval_uuid
      payment_method
      uuid
    }
  }`, () => ({
    eval_uuid: props.eval_uuid,
  }), {
    pollInterval: 5000,
  });

const { mutate: addRemainRequest, onDone: addRemainRequest_Completed } = useMutation(gql`
  mutation Remain_addPrepaid(
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

const { mutate: approveClaim, onDone: approveClaim_Completed } = useMutation(gql`
mutation approveClaim(
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

const { mutate: denyClaim, onDone: denyClaim_Completed } = useMutation(gql`
mutation denyClaim(
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

const { mutate: delClaim, onDone: delClaim_Completed } = useMutation(gql`
mutation delClaim($uuid: uniqueidentifier = "") {
  delete_Event_Prepaid_by_pk(uuid: $uuid) {
    uuid
  }
}`) 

// computed
const EvaluatedIncome = ref([])
const EvaluatedExpense = ref([])
const IncomeTotal = computed(() => EvaluatedIncome.value? EvaluatedIncome.value.reduce((a,v) => a + v.amount, 0): 0)
const ExpenseTotal = computed(() => EvaluatedExpense.value? EvaluatedExpense.value.reduce((a,v) => a + v.amount, 0): 0)
const prepaidResult = ref([])
const claimResult = ref([])
const MaximumClaim = computed(() => ExpenseTotal.value - prepaidResult.value.filter((x) => x.approved).reduce((a,v) => a+v.amount, 0) - claimResult.value.filter((x) => x.approved).reduce((a,v) => a+v.amount, 0))
const $store = useStore();
const username = computed(() => $store.getters["userModule/getUsername"])
const isUAT = computed(() => $store.getters["userModule/getUAT"])
const isCenterIC = computed(() => $store.getters["userModule/getCenterIC"])

// function
function deleteClaim(uuid) {
  loading.value++
  delClaim({
    uuid: uuid
  })
}

function save() { 
  let remainObject = {
    amount: parseFloat(claim.value.amount),
    apply_date: new Date(),
    apply_user: username.value,
    c_act_code: props.c_act_code,
    eval_uuid: props.eval_uuid,
    recipient: claim.value.recipient,
    type: '餘款',
  }

  let logObject = {
    "username": username.value,
    "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    "module": "活動系統",
    "action": "申請餘款: " + JSON.stringify(remainObject)
  }

  loading.value++
  addRemainRequest({
    logObject: logObject,
    object: remainObject
  })
}

function acceptClaim(uuid) {
  let i = claimResult.value.findIndex((element) => element.uuid == uuid)
  $q.dialog({
    title: '<div class="bg-blue text-white q-pa-sm q-ma-none">批核餘款申請</div>',
    message: "<div class='text-body1 q-py-xs'>確定批核餘款申請？ </div><br/><div>申請人：" + claimResult.value[i].apply_user + "</div><br/><div>活動：" + claimResult.value[i].c_act_code + "</div><br/><div>金額：$" + claimResult.value[i].amount.toFixed(1) + "</div><hr class='q-mb-md'/><div class='text-body1'>選擇支付方法：</div>",
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
      "action": "批核餘款申請 - 系統編號：" + uuid + " 申請人：" + claimResult.value[i].apply_user + " 活動編號：" + claimResult.value[i].c_act_code + " 金額：" + claimResult.value[i].amount.toFixed(1)
    }
    loading.value++
    approveClaim({
      logObject: logObject,
      uuid: uuid,
      approve_date: qdate.formatDate(new Date(), "YYYY-MM-DDTHH:mm:ss"),
      approve_user: username.value,
      approved: true,
      payment_method: data,
    })
  })
}

function rejectClaim(uuid) {
  let i = claimResult.value.findIndex((element) => element.uuid == uuid)
  $q.dialog({
    title: '<div class="bg-blue text-white q-pa-sm q-ma-none">拒絕餘款申請</div>',
    message: "<div class='text-body1 q-py-xs'>確定拒絕餘款申請？ </div><br/><div>申請人：" + claimResult.value[i].apply_user + "</div><br/><div>活動：" + claimResult.value[i].c_act_code + "</div><br/><div>金額：$" + claimResult.value[i].amount.toFixed(1) + "</div>",
    html: true,
    cancel: true,
    persistent: true
  }).onOk(() => {
    let logObject = {
      "username": username.value,
      "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      "module": "活動系統",
      "action": "拒絕餘款申請: " + uuid
    }
    loading.value++
    denyClaim({
      logObject: logObject,
      uuid: uuid,
      approve_date: qdate.formatDate(new Date(), "YYYY-MM-DDTHH:mm:ss"),
      approve_user: username.value,
      approved: false,
    })
  })
}

function printVoucher(record) {
  // console.log(record)
  voucherObject.value = record
  showPrintVoucher.value = true
}

function printPrepaidClaimForm(record) {
  prepaidClaimObject.value = record
  showPrepaidClaimForm.value = true
}

// callback
getPrepaidResult((result) => {
  if (result.data) {
    claimResult.value = result.data.Event_Prepaid.filter((x) => x.type.trim() == '餘款')
    prepaidResult.value = result.data.Event_Prepaid.filter((x) => x.type.trim() == '預支')
  }
})

getEvaluationResult((result) => {
  if (result.data) {
    EvaluatedIncome.value = result.data.Event_Evaluation_Account.filter((x) => x.type.trim() == '收入')
    EvaluatedExpense.value = result.data.Event_Evaluation_Account.filter((x) => x.type.trim() == "支出")
  }
})

addRemainRequest_Completed((result) => {
  claim.value = {}
  loading.value--
  $q.notify({
    message: "活動" + result.data.insert_Event_Prepaid_one.c_act_code + "，成功新增申請餘款記錄。",
  }) 
})

denyClaim_Completed((result) => {
  loading.value--
  $q.notify({
    message: "拒絕了餘款申請。",
  })
})

delClaim_Completed((result) => {
  loading.value--
  $q.notify({
    message: "刪除了餘款申請。",
  })
})

approveClaim_Completed((result) => {
  loading.value--
  $q.notify({
    message: "批核了餘款申請。",
  })
})
</script>

<style>
.prepaid-item:hover {
  border: 1px solid black;
}
</style>