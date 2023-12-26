<template>
  <q-page class="row q-pa-sm">
    <!-- loading dialog -->
    <LoadingDialog v-model="loading" message="處理中" />

    <!-- print receipt modal -->
    <q-dialog v-if="$q.screen.gt.md"
      v-model="printReceiptModal"
      full-height
      full-width
      transition-show="slide-up"
      transition-hide="slide-down"
      class="q-pa-none"
      >
      <Receipt :c_receipt_no="ReceiptNo"/>
    </q-dialog>

    <q-dialog v-if="$q.screen.lt.md"
      v-model="printReceiptModal"
      maximized
      full-width
      persistent
      transition-show="slide-up"
      transition-hide="slide-down"
      class="q-pa-none"
      >
      <Receipt :c_receipt_no="ReceiptNo"/>
    </q-dialog>
    <q-card class="col-5">
      <q-card-section class="row content-start">
        <div class="col-6 row content-start">
          <div class="col-grow"><MemberSelection v-model="MemberObject.c_mem_id"/></div>
          <q-card square class="col-11">
            <q-card-section class="bg-primary text-white">
              付款人資料
            </q-card-section>
            <q-card-section>
              <q-input v-if="MemberObject.c_mem_id == '9999'" v-model="MemberObject.c_name"/>
              <MemberInfoByID v-else v-model="MemberObject"/>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-6 row content-start">
          <div class="col-12"><IncomeTypeSelection v-model="incomeType" @update:model-value="updateAmount"/></div>
          <div class="col-12 q-mt-sm">
            <q-input
              v-model="quantity"
              label="數量"
              type="number"
              @update:model-value="updateAmount"
              />
          </div>

        </div>
      </q-card-section>
      <q-separator inset/>
      <q-card-actions class="row">
        <div class="q-mt-sm text-h6 q-mx-sm col-7 row">
          <span class="col-4">總數：$</span><q-input type="number" v-model="totalAmount" class="col-8"/>
        </div>
        <q-space/>
        <q-btn label="重置" icon="restart_alt" class="bg-warning text-white q-mx-sm col-2" @click="reset"/>
        <q-btn label="確認" icon="check" class="bg-positive text-white q-mx-sm col-2" @click="save"/>
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed } from "vue"
import { useStore } from "vuex";
import { useQuasar, date as qdate} from "quasar";
import MemberSelection from "components/Member/MemberSelection.vue"
import MemberInfoByID from "components/Member/MemberInfoByID.vue"
import { gql } from "graphql-tag"
import IncomeTypeSelection from "components/Account/IncomeTypeSelection.vue"
import { LATEST_MRECEIPT_NO } from "/src/graphQueries/Member/query.js"
import { useMutation, useSubscription } from "@vue/apollo-composable"
import LoadingDialog from "components/LoadingDialog.vue"
import Receipt from "components/Account/Receipt.vue"

// variables
const $q = useQuasar()
const $store = useStore();
const MemberObject = ref({ c_mem_id: "9999", c_name: "顧客", c_sex: null, c_tel: null, d_expired_1: null })
const accountType = ref()
const incomeType = ref()
const quantity = ref(1)
const printReceiptModal = ref(false)
const ReceiptNo = ref("")
const totalAmount = ref(0)
const loading = ref(0)

// query
const { result: ReceiptData } = useSubscription(
    LATEST_MRECEIPT_NO,
  );
const { mutate: addOtherIncome, onDone: addOtherIncome_Completed, onError: addOtherIncome_Error} = useMutation(gql`
mutation addOtherIncome (
  $logObject: Log_insert_input! = {},
  $accountObject: tbl_account_insert_input = {}
)
{
  insert_Log_one(object: $logObject) {
    log_id
  }
  insert_tbl_account_one(object: $accountObject) {
    c_receipt_no
  }
}`)

// computed
const username = computed(() => $store.getters["userModule/getUsername"])
const latestReceiptNO = computed(() => {
  if (ReceiptData.value) {
    let token = ReceiptData.value.tbl_account[0].c_receipt_no.split("-")
    let receiptNo = parseInt(token[1])
    receiptNo = (receiptNo + 1).toString()
    while (receiptNo.length < 4) receiptNo = "0" + receiptNo
    return token[0] + "-" + receiptNo
  } else return null
})

// functions
function reset() {
  MemberObject.value = { c_mem_id: "9999", c_name: "顧客", c_sex: null, c_tel: null, d_expired_1: null }
  incomeType.value = null
  quantity.value = 0
}

function updateAmount() {
  totalAmount.value = incomeType.value? incomeType.value.u_fee * quantity.value: 0
}

function save() {
  if (incomeType.value == null || quantity.value == 0) {
    $q.notify({
      message: "請輸入正確資料！",
      color: "negative",
      textColor: "white",
      icon: "error"
    })
    return
  }

  const logObject = ref({
    "username": username,
    "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    "module": "會計系統",
    "action": "雜項收費。會員(" + MemberObject.value.c_mem_id + ")" + MemberObject.value.c_name? MemberObject.value.c_name: MemberObject.value.c_name_other + "，收費項目：" + incomeType.value.value + "（$" + incomeType.value.u_fee + ") 數目：" + quantity.value + " 總數：" + quantity.value * incomeType.value.u_fee + " 收據號碼：" + latestReceiptNO.value,
  })

  const remark = incomeType.value.value + "： \r" + quantity.value + " X HK$" + incomeType.value.u_fee.toFixed(2) + "\r"
  const accountObject = ref({
    c_receipt_no: latestReceiptNO,
    d_create: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    i_receipt_type: 7, //type 7 = 雜項收費
    c_desc: incomeType.value.value? incomeType.value.value.trim() :"",
    c_act_code: null,
    c_type: incomeType.value.c_acc_type? incomeType.value.c_acc_type.trim(): "",
    u_discount: 0,
    u_price_after_discount: parseFloat(totalAmount.value),
    c_cash_type: "Cash",
    c_cheque_no: "",
    m_remark: remark,
    c_mem_id: MemberObject.value.c_mem_id? MemberObject.value.c_mem_id.trim(): "",
    c_user_id: username,
    c_name: MemberObject.value.c_name? MemberObject.value.c_name.trim(): MemberObject.value.c_name_other.trim(),
    b_cssa: false,
    b_refund: false,
    b_OtherIncome: true,
    b_clear: false,
    d_clear: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    i_prints: 0,
    b_delete: false,
  })

  loading.value++
  addOtherIncome({
    logObject: logObject.value,
    accountObject: accountObject.value
  })
}

// callbacks
addOtherIncome_Completed((result) => {
  loading.value--
  const receiptNumber = result.data.insert_tbl_account_one?.c_receipt_no??""
  totalAmount.value = 0
  $q.notify({
    progress: true,
    message:
      "收費完成。收據編號：" + receiptNumber,
    actions: [
      { label: '列印收據', color: 'yellow', handler: () => { ReceiptNo.value = receiptNumber; printReceiptModal.value = true } },
      { label: '關閉', color: 'white', handler: () => {  } }
    ]
  }, 5000)
})
</script>
