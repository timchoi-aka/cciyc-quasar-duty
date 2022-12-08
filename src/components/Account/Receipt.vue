<template>
  <!-- refund modal -->
  <q-dialog v-model="refundDialog">
    <q-card>
      <q-card-section class="bg-primary text-white text-h6">
        {{Receipt.c_receipt_no}} - 退款
      </q-card-section>
      <q-card-section class="text-h6">
        <div>確定退款？</div>
        <div>請在以下輸入收據編號{{Receipt.c_receipt_no}}</div>
        <q-input type="text" v-model="refundCheck"/>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn :disable="refundCheck != Receipt.c_receipt_no.trim()" icon="check" label="確定" class="bg-positive text-white" v-close-popup="-1" @click="refundConfirm"/>
        <q-btn icon="cancel" label="取消" class="bg-negative text-white" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <div class="row q-ma-md-none q-pa-md-none bg-grey-3 justify-center">
    <div class="bg-primary row col-12" style="min-height: 50px; max-height: 50px;">
      <q-btn icon="print" flat class="bg-primary text-white col-shrink" v-print="printObj">
        <q-tooltip class="bg-white text-primary">列印</q-tooltip>  
      </q-btn>
      <q-space/>
      <q-btn label="退款" icon="currency_exchange" class="bg-negative text-white" flat @click="(refundDialog = true)"/>
      <q-space/>
      <q-btn class="bg-primary text-white col-shrink" dense flat icon="close" v-close-popup>
        <q-tooltip class="bg-white text-primary">關閉</q-tooltip>
      </q-btn>
    </div>

    <div id="printMe" class="row col-12 justify-center bg-white self-start print-area">
      <div class="row self-center text-bold q-my-none highlight_1">長洲鄉事委員會青年綜合服務中心</div>
      <div class="q-my-none" style="font-size: 1px important!">CHEUNG CHAU RURAL COMMITTEE INTEGRATED YOUTH CENTRE</div>
      <div class="row col-12 q-my-none justify-center">
        <span class="q-mr-xs col-4 self-end text-right"><span class="highlight_3">地址</span><span class="q-ml-sm">Address:</span></span><span class="col self-end"><span class="highlight_3">長洲東灣道</span><span class="q-ml-sm">Tung Wan Road, Cheung Chau</span></span>
      </div>
      <div class="row col-12 self-center q-my-none justify-center">
        <span class="col-3 text-right">電話 Tel: 2981 1484</span>
        <span class="col-3 q-mx-md text-center">yc@cciyc.com</span>
        <span class="col-3 text-left">www.cciyc.com</span>
      </div>
      <div v-if="Receipt.b_refund" class="row col-12 justify-center text-bold highlight_2">退款記錄 OFFICIAL REFUND</div>
      <div v-else class="row col-12 justify-center text-bold highlight_2">正式收據 OFFICIAL RECEIPT</div>
      <div class="row col-12 justify-center highlight_2">收據編號 Receipt No: {{Receipt.c_receipt_no}}</div>
      <div class="row col-12 justify-center">
        <span v-if="Receipt.b_refund" class="q-mr-md highlight_2">列印日期 Date: {{qdate.formatDate(Date.now(), "DD/MM/YYYY")}}</span>
        <span v-else class="q-mr-md highlight_2">日期 Date: {{qdate.formatDate(Receipt.d_create, "DD/MM/YYYY")}}</span>
        <span class="text-right self-end">Copy: {{Receipt.i_prints}}</span>
      </div>
      <div class="row col-12">
        <span class="col-4 q-ml-md self-center">
          <div v-if="Receipt.b_refund" class="highlight_2">茲繳付</div>
          <div v-else class="highlight_2">茲收到</div>
          <div v-if="Receipt.b_refund">Pay to</div>
          <div v-else>Received From</div>
        </span>
        <span class="col-7 self-center highlight_2">{{Receipt.c_name}}</span>
      </div>
      <div class="row col-12">
        <span class="col-4 q-ml-md">
          <div class="highlight_2">港幣</div>
          <div>the sum of HK dollars</div>
        </span>
        <span class="col-7 self-center highlight_2">HK${{(Receipt.u_price_after_discount?.toFixed(2)??0)}}</span>
      </div>
      <div class="row col-12">
        <span class="col-4 q-ml-md">
          <div v-if="Receipt.b_refund" class="highlight_2">退款</div>
          <div v-else class="highlight_2">支付</div>
          <div v-if="Receipt.b_refund">being refund for</div>
          <div v-else>being payment for</div>
        </span>
        <span class="col-7 self-center highlight_2">{{Receipt.c_desc}}</span>
      </div>
      <div class="row col-12">
        <span class="col-4 q-ml-md">
          <div class="highlight_2">經手人</div>
          <div>issued by</div>
        </span>
        <span class="col-7 self-center highlight_2">{{Receipt.c_user_id}}</span>
      </div>
      <div class="row col-12 justify-center q-px-md highlight_3">收據字體會退色，若需要保留，請自行影印。</div>
      <div class="row col-12 q-px-md wrap highlight_3">The receipt will eventually fade out.  Please make a photocopy for a more lasting document.</div>
      <div v-if="!Receipt.b_refund" class="row col-12 q-px-md highlight_2" v-html="showRemark(Receipt.m_remark)"/>
    </div>
  </div>
</template>

<script setup>
import { useQuery, useMutation } from "@vue/apollo-composable";
import { computed, ref } from "vue"
import { RECEIPTS_BY_NO } from "src/graphQueries/Account/query.js"
import { ADD_RECEIPT_PRINT_COUNT, REFUND_BY_RECEIPT_NO } from "src/graphQueries/Account/mutation.js"
import { date as qdate, useQuasar } from "quasar"
import { useStore } from "vuex";

// props
const props = defineProps({
  c_receipt_no: String,
})

const $q = useQuasar()
const $store = useStore();
const username = computed(() => $store.getters["userModule/getUsername"])
const userProfileLogout = () => $store.dispatch("userModule/logout")
const refundCheck = ref("")
const refundDialog = ref(false)
const printObj = ref({
  id: "printMe",
  preview: false,
  previewTitle: "列印預覽", // The title of the preview window. The default is 打印预览
  popTitle: "收據",
  openCallback (vue) {
    
    const logObject = ref({
      "username": username,
      "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      "module": "會計系統",
      "action": "重新列印收據 " + Receipt.value.c_receipt_no,
    })
    
    addReceiptPrintCount({
      logObject: logObject.value,
      c_receipt_no: Receipt.value.c_receipt_no,
      i_prints: parseInt(Receipt.value.i_prints)+1
    })
  },
})

// query
const {result, loading, refetch} = useQuery(RECEIPTS_BY_NO, 
  () => ({
    c_receipt_no: props.c_receipt_no
  }));
const { mutate: addReceiptPrintCount, onDone: addReceiptPrintCount_Completed, onError: addReceiptPrintCount_Error } = useMutation(ADD_RECEIPT_PRINT_COUNT)
const { mutate: refund, onDone: refund_Completed, onError: refund_Error } = useMutation(REFUND_BY_RECEIPT_NO)

const Receipt = computed(() => result.value?.tbl_account_by_pk??[])

// function
function showRemark(rem) {
  return rem ? rem.replaceAll("\r\n", "<br/>").replaceAll("\r", "<br/>").replaceAll("\n", "<br/>") : ""
}

// UI functions
function notifyClientError(error) {
  userProfileLogout()
    .then(() => {
      $q.notify({ message: "系統錯誤，請重新登入." });
    })
    .catch((error) => console.log("error", error));
}

function refundConfirm() {
  const logObject = ref({
    "username": username,
    "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    "module": "會計系統",
    "action": Receipt.value.c_receipt_no + "退款，費用：" + Receipt.value.u_price_after_discount,
  })

  const remarks = Receipt.value.c_receipt_no + "退款，費用：" + Receipt.value.u_price_after_discount + " 經手人：" + username.value

  refund({
    logObject: logObject.value,
    remarks: remarks,
    c_receipt_no: Receipt.value.c_receipt_no 
  })
}

// callback
addReceiptPrintCount_Completed((result) => {
  refetch()
})

refund_Completed((result) => {
  refetch()
  $q.notify({ message: "收據編號：" + result.data.update_tbl_account_by_pk.c_receipt_no + "退款成功。" });
})

refund_Error((error) => {
  notifyClientError(error)
})

addReceiptPrintCount_Error((error) => {
  notifyClientError(error)
})
</script>

<script>
import print from "vue3-print-nb";

export default {
  name: "PrintReceipt",
  directives: {
    print,
  },
}
</script>

<style scoped>
@media screen {
  .print-area {
    width: 136mm; 
    height: 160mm;
    margin: 0; 
    overflow: hidden; 
    border: 1px solid
  }
  .highlight_1 {
    font-size: 1.2rem;
  }

  .highlight_2 {
    font-size: 1rem;
  }

  .highlight_3 {
    font-size: 0.8rem;
  }
}

@media print {
  @page {
    size: 68mm 120mm portrait;
    margin: 0;
    overflow: hidden;
    scale: 50%;
  }
  .print-area { 
    border: none;
  }
  .highlight_1 {
    font-size: 1.2rem;
  }

  .highlight_2 {
    font-size: 1rem;
  }

  .highlight_3 {
    font-size: 0.8rem;
  }
}
</style>