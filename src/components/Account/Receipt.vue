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

  <!-- delete modal -->
  <q-dialog v-model="deleteDialog">
    <q-card>
      <q-card-section class="bg-primary text-white text-h6">
        {{Receipt.c_receipt_no}} - 刪除
      </q-card-section>
      <q-card-section class="text-h6">
        <div>確定刪除？</div>
        <div>請在以下輸入收據編號{{Receipt.c_receipt_no}}</div>
        <q-input type="text" v-model="deleteCheck"/>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn :disable="deleteCheck != Receipt.c_receipt_no.trim()" icon="check" label="確定" class="bg-positive text-white" v-close-popup="-1" @click="deleteConfirm"/>
        <q-btn icon="cancel" label="取消" class="bg-negative text-white" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <div class="row q-ma-md-none q-pa-md-none justify-center">
    <div class="bg-primary row col-12 items-center" style="min-height: 50px; max-height: 50px;">
      <q-btn label="Copy+1" flat class="bg-primary text-white col-shrink" v-print="printObj">
        <q-tooltip class="bg-white text-primary">列印</q-tooltip>  
      </q-btn>
      <!--<q-btn icon="picture_as_pdf" flat class="bg-primary text-white col-shrink" @click="download"/>-->
      <q-space/>
      <div v-if="!Receipt.b_delete && isFinance"><q-btn label="刪除" icon="delete" class="bg-negative text-white q-mx-sm" flat @click="deleteDialog = true"/></div>
      <div v-if="!Receipt.b_refund && isFinance"><q-btn label="退款" icon="currency_exchange" class="bg-negative text-white q-mx-sm" flat @click="refundDialog = true"/></div>
      <q-space/>
      <q-btn class="bg-primary text-white col-shrink" dense flat icon="close" v-close-popup>
        <q-tooltip class="bg-white text-primary">關閉</q-tooltip>
      </q-btn>
    </div>
    <div v-if="loading">
      <q-spinner
        color="primary"
        size="3em"
        :thickness="10"/>
    </div>
    <div v-else id="printReceipt" class="fit flex flex-top">
      <q-pdfviewer
        v-if="src != null"
        type="html5"
        class="fit"
        ref="printbox"
        :src="src"
        style="height: 100%; min-height: 100%;"
        
      />
    </div>
    <!--
    <div  class="row justify-center bg-white print-area" style="display: none;">
      <div class="row col-12 q-my-none self-center"><div class="col-12 text-center text-bold highlight_1">長洲鄉事委員會青年綜合服務中心</div></div>
      <div class="row col-12 q-my-none self-center"><div class="col-12 text-center highlight_4">CHEUNG CHAU RURAL COMMITTEE INTEGRATED YOUTH CENTRE</div></div>
      <div class="row col-12 q-my-none justify-center">
        <span class="q-mr-xs col-4 self-end text-right"><span class="highlight_3">地址</span><span class="q-ml-sm highlight_4">Address:</span></span><span class="col self-end"><span class="col-8 highlight_3">長洲東灣道</span><span class="q-ml-sm highlight_4">Tung Wan Road, Cheung Chau</span></span>
      </div>
      <div class="row col-12 self-center q-my-none justify-center">
        <span class="col-3 text-right highlight_4">電話 Tel: 2981 1484</span>
        <span class="col-3 q-mx-md text-center highlight_4">yc@cciyc.com</span>
        <span class="col-3 text-left highlight_4">www.cciyc.com</span>
      </div>
      <div v-if="Receipt.b_refund" class="row col-12 justify-center text-bold highlight_2">退款記錄 OFFICIAL REFUND</div>
      <div v-else class="row col-12 justify-center text-bold highlight_2">正式收據 OFFICIAL RECEIPT</div>
      <div class="row col-12 justify-center highlight_3">收據編號 Receipt No: {{Receipt.c_receipt_no}}</div>
      <div class="row col-12 justify-center">
        <span v-if="Receipt.b_refund" class="q-mr-md highlight_2">列印日期 Date: {{qdate.formatDate(Date.now(), "DD/MM/YYYY")}}</span>
        <span v-else class="q-mr-md highlight_3">日期 Date: {{qdate.formatDate(Receipt.d_create, "DD/MM/YYYY")}}</span>
        <span class="text-right self-end highlight_4">Copy: {{Receipt.i_prints}}</span>
      </div>
      <div class="row col-12">
        <span class="col-4 q-ml-md self-center">
          <div v-if="Receipt.b_refund" class="highlight_2">茲繳付</div>
          <div v-else class="highlight_3">茲收到</div>
          <div v-if="Receipt.b_refund">Pay to</div>
          <div v-else class="highlight_4">Received From</div>
        </span>
        <span class="col-7 self-center highlight_2">{{Receipt.c_name}}</span>
      </div>
      <div class="row col-12">
        <span class="col-4 q-ml-md">
          <div class="highlight_3">港幣</div>
          <div class="highlight_4">the sum of HK dollars</div>
        </span>
        <span class="col-7 self-center highlight_2">HK${{(Receipt.u_price_after_discount?.toFixed(2)??0)}}</span>
      </div>
      <div class="row col-12">
        <span class="col-4 q-ml-md">
          <div v-if="Receipt.b_refund" class="highlight_2">退款</div>
          <div v-else class="highlight_3">支付</div>
          <div v-if="Receipt.b_refund">being refund for</div>
          <div v-else class="highlight_4">being payment for</div>
        </span>
        <span class="col-7 self-center highlight_2">{{Receipt.c_desc}}</span>
      </div>
      <div class="row col-12">
        <span class="col-4 q-ml-md">
          <div class="highlight_3">經手人</div>
          <div class="highlight_4">issued by</div>
        </span>
        <span class="col-7 self-center highlight_2">{{staffNameMapping[Receipt.c_user_id]? staffNameMapping[Receipt.c_user_id]: Receipt.c_user_id}}</span>
      </div>
      <div class="row col-12 justify-center q-px-md highlight_3">收據字體會退色，若需要保留，請自行影印。</div>
      <div class="row col-12 q-px-md wrap highlight_3">The receipt will eventually fade out.  Please make a photocopy for a more lasting document.</div>
      <div v-if="!Receipt.b_refund" class="row col-12 q-px-md highlight_2" v-html="showRemark(Receipt.m_remark)"/>
    </div>
  -->
  </div>
</template>

<script setup>
import { useQuery, useMutation } from "@vue/apollo-composable";
import { computed, onMounted, onBeforeUnmount, ref } from "vue"
import { RECEIPTS_BY_NO } from "src/graphQueries/Account/query.js"
import { ADD_RECEIPT_PRINT_COUNT, REFUND_BY_RECEIPT_NO, DELETE_BY_RECEIPT_NO } from "src/graphQueries/Account/mutation.js"
import { date as qdate, useQuasar } from "quasar"
import { useStore } from "vuex";
import jspdf from 'jspdf'
import { font } from "/src/assets/NotoSansTC-Regular-normal.js"
const src = ref(null)
const printbox = ref(null)

onMounted(() => {
  
  //window.addEventListener('afterprint', setPlaceholders)
})

function setPlaceholders(event) {
  console.log("before print")
  console.log("event:" + JSON.stringify(event))
}

onBeforeUnmount(() => {
  // window.removeEventListener('beforeprint')
  //window.removeEventListener('afterprint', setPlaceholders)
})

// props
const props = defineProps({
  c_receipt_no: String,
})
const staffNameMapping = {
  "lswu": "胡小姐",
  "ywho": "何先生",
  "mwchan": "陳小姐",
  "lsfung": "馮小姐",
  "pswong": "黃小姐",
  "kyma": "馬姑娘",
  "hlng": "吳先生",
  "myli": "李姑娘",
}

const $q = useQuasar()
const $store = useStore();
const username = computed(() => $store.getters["userModule/getUsername"])
const isFinance = computed(() => $store.getters["userModule/getFinance"])
const userProfileLogout = () => $store.dispatch("userModule/logout")
const deleteCheck = ref("")
const deleteDialog = ref(false)
const refundCheck = ref("")
const refundDialog = ref(false)
const printObj = ref({
  id: "printReceipt",
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

    refetch()
  },
})

// query
const {onResult, loading, refetch} = useQuery(RECEIPTS_BY_NO, 
  () => ({
    c_receipt_no: props.c_receipt_no
  }));
const { mutate: addReceiptPrintCount, onDone: addReceiptPrintCount_Completed, onError: addReceiptPrintCount_Error } = useMutation(ADD_RECEIPT_PRINT_COUNT)
const { mutate: refund, onDone: refund_Completed, onError: refund_Error } = useMutation(REFUND_BY_RECEIPT_NO)
const { mutate: deleteReceipt, onDone: deleteReceipt_Completed, onError: deleteReceipt_Error } = useMutation(DELETE_BY_RECEIPT_NO)

// computed
const Receipt = ref({ b_delete: false})

onResult((result) => {
  if (result.data) {
    Receipt.value = result.data.tbl_account_by_pk
    displayPDF()
  }
})

const isSystemAdmin = computed(() => $store.getters["userModule/getSystemAdmin"])

function displayPDF() {
  var doc = new jspdf({
    orientation: 'p',
    unit: 'mm',
    format: [68, 120],
    //format: "a4",
    //putOnlyUsedFonts:true
  });
  doc.addFileToVFS("NotoSansTC-Regular.ttf", font)
  doc.addFont("NotoSansTC-Regular.ttf", 'NotoSans', 'normal')
  doc.setFont("NotoSans")
  
  doc.setFontSize(10)
  doc.text("長洲鄉事委員會青年綜合服務中心", 34, 5, "center")
  doc.setFontSize(6)
  doc.text("CHEUNG CHAU RURAL COMMITTEE INTEGRATED YOUTH CENTRE", 34, 8, "center")
  doc.setFontSize(8)
  doc.text("地址", 7, 12)
  doc.setFontSize(5)
  doc.text("Address:", 14, 12)
  doc.setFontSize(8)
  doc.text("長洲東灣道", 22, 12)
  doc.setFontSize(5)
  doc.text("Tung Wan Road, Cheung Chau", 37, 12)
  doc.setFontSize(5)
  doc.text("電話 Tel: 2981 1484", 12, 15)
  doc.text("yc@cciyc.com", 30, 15)
  doc.text("www.cciyc.com", 45, 15)
  doc.setFontSize(10)
  if (Receipt.value.b_refund) 
    doc.text("退款記錄 OFFICIAL REFUND", 34, 20, "center")
  else
    doc.text("正式收據 OFFICIAL RECEIPT", 34, 20, "center")
  doc.setFontSize(8)
  doc.text("收據編號 Receipt No: " + Receipt.value.c_receipt_no, 34, 25, "center")
  doc.setFontSize(8)
  if (Receipt.value.b_refund) 
    doc.text("列印日期 Date: " + qdate.formatDate(Date.now(), "DD/MM/YYYY"), 12, 29)
  else 
    doc.text("日期 Date: " + qdate.formatDate(Receipt.value.d_create, "DD/MM/YYYY"), 12, 29)
  doc.setFontSize(6)
  doc.text("Copy: " + Receipt.value.i_prints, 50, 29)
  
  // 茲收到/茲繳付
  doc.setFontSize(8)
  if (Receipt.value.b_refund) 
    doc.text("茲繳付", 5, 34)
  else
    doc.text("茲收到", 5, 34)
  doc.setFontSize(6)
  if (Receipt.value.b_refund) 
    doc.text("Pay to", 5, 37)
  else
    doc.text("Received from:", 5, 37)
  doc.setFontSize(10)
  doc.text(Receipt.value.c_name, 32, 35)

  // 港幣 
  doc.setFontSize(8)
  doc.text("港幣", 5, 42)
  doc.setFontSize(6)
  doc.text("the sum of HK dollars", 5, 45)
  doc.setFontSize(10)
  doc.text("HK$" + Receipt.value.u_price_after_discount?.toFixed(2)??0, 32, 43)

  // 退款/支付
  doc.setFontSize(8)
  if (Receipt.value.b_refund) 
    doc.text("退款", 5, 50)
  else
    doc.text("支付", 5, 50)
  doc.setFontSize(6)
  if (Receipt.value.b_refund) 
    doc.text("being refund for", 5, 53)
  else
    doc.text("being payment for", 5, 53)
  doc.setFontSize(10)
  doc.text(Receipt.value.c_desc, 32, 51, {maxWidth: 30})

  // 經手人
  doc.setFontSize(8)
  doc.text("經手人", 5, 59)
  doc.setFontSize(6)
  doc.text("issued by", 5, 62)
  doc.setFontSize(10)
  doc.text(staffNameMapping[Receipt.value.c_user_id]? staffNameMapping[Receipt.value.c_user_id]: Receipt.value.c_user_id, 32, 60)
  

  doc.setFontSize(8)
  doc.text("收據字體會退色，若需要保留，請自行影印。", 6, 66, {maxWidth: 60})
  doc.setFontSize(7)
  doc.text("The receipt will eventually fade out.  Please make a photocopy for a more lasting document.", 4, 70, {maxWidth: 60})
  
  doc.setFontSize(10)
  if (!Receipt.value.b_refund) 
    doc.text(Receipt.value.m_remark, 3, 77, {maxWidth: 65})
  doc.setProperties({ 
    title: Receipt.value.c_receipt_no + '.pdf',
    filename: Receipt.value.c_receipt_no + '.pdf',
  })
  src.value = doc.output("datauristring", {filename: Receipt.value.c_receipt_no + '.pdf'})
  
  // doc.save(Receipt.value.c_receipt_no + '.pdf');
}

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

function deleteConfirm() {
  const logObject = ref({
    "username": username,
    "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    "module": "會計系統",
    "action": "刪除收據" + Receipt.value.c_receipt_no + "，費用：" + Receipt.value.u_price_after_discount,
  })

  const remarks = "刪除收據" + Receipt.value.c_receipt_no + "，費用：" + Receipt.value.u_price_after_discount + " 經手人：" + username.value

  deleteReceipt({
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

deleteReceipt_Completed((result) => {
  refetch()
  $q.notify({ message: "收據編號：" + result.data.update_tbl_account_by_pk.c_receipt_no + "刪除成功。" });
})

deleteReceipt_Error((error) => {
  notifyClientError(error)
})

addReceiptPrintCount_Error((error) => {
  notifyClientError(error)
})
</script>

<script>
import print from "vue3-print-nb";
import { reload } from "firebase/auth";

export default {
  name: "PrintReceipt",
  directives: {
    print,
  },
}
</script>

<style lang="scss" scoped>
@media screen {
  .print-area {
    width: 68mm; 
    height: auto;
    margin: none;
    border: 1px solid;
    overflow: auto;
    border: 1px solid;
    scale: 180%;
    transform-origin: top;
  }
  .highlight_1 {
    font-size: 0.8rem;
  }

  .highlight_2 {
    font-size: 0.7rem;
  }

  .highlight_3 {
    font-size: 0.5rem;
  }

  .highlight_4 {
    font-size: 0.4rem;
  }
}

@media print {
  @page {
    size: landscape !important;
    width: 68mm; 
    margin: none;
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

  .highlight_4 {
    font-size: 0.5rem;
  }
}
</style>