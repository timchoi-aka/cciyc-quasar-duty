<template>
  <!-- refund modal -->
  <q-dialog v-model="refundDialog">
    <q-card>
      <q-card-section class="bg-primary text-white text-h6">
        {{ Receipt.c_receipt_no }} - 退款
      </q-card-section>
      <q-card-section class="text-h6">
        <div>確定退款？</div>
        <div>請在以下輸入收據編號{{ Receipt.c_receipt_no }}</div>
        <q-input type="text" :autofucus="true" v-model="refundCheck" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn :disable="refundCheck != Receipt.c_receipt_no.trim()" icon="check" label="確定"
          class="bg-positive text-white" v-close-popup="-1" @click="refundConfirm" />
        <q-btn icon="cancel" label="取消" class="bg-negative text-white" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- delete modal -->
  <q-dialog v-model="deleteDialog">
    <q-card>
      <q-card-section class="bg-primary text-white text-h6">
        {{ Receipt.c_receipt_no }} - 刪除
      </q-card-section>
      <q-card-section class="text-h6">
        <div>確定刪除？</div>
        <div>請在以下輸入收據編號{{ Receipt.c_receipt_no }}</div>
        <q-input type="text" v-model="deleteCheck" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn :disable="deleteCheck != Receipt.c_receipt_no.trim()" icon="check" label="確定"
          class="bg-positive text-white" v-close-popup="-1" @click="deleteConfirm" />
        <q-btn icon="cancel" label="取消" class="bg-negative text-white" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- print receipt modal -->
  <div class="row q-ma-md-none q-pa-md-none justify-center">
    <div class="bg-primary row col-12 items-center" style="min-height: 50px; max-height: 50px">
      <q-btn label="Copy+1" flat class="bg-primary text-white col-shrink"
        @click="rePrint(Receipt.c_receipt_no, Receipt.i_prints)">
        <q-tooltip class="bg-white text-primary">列印</q-tooltip>
      </q-btn>
      <!--<q-btn icon="picture_as_pdf" flat class="bg-primary text-white col-shrink" @click="download"/>-->
      <q-space />
      <div v-if="!Receipt.b_delete && isFinance">
        <q-btn label="刪除" icon="delete" class="bg-negative text-white q-mx-sm" flat @click="deleteDialog = true" />
      </div>
      <div v-if="!Receipt.b_refund && isFinance">
        <q-btn label="退款" icon="currency_exchange" class="bg-negative text-white q-mx-sm" flat
          @click="refundDialog = true" />
      </div>
      <q-space />
      <q-btn class="bg-primary text-white col-shrink" dense flat icon="close" v-close-popup>
        <q-tooltip class="bg-white text-primary">關閉</q-tooltip>
      </q-btn>
    </div>
    <div v-if="loading">
      <q-spinner color="primary" size="3em" :thickness="10" />
    </div>
    <div v-else id="printReceipt" class="fit flex flex-top">
      <q-pdfviewer v-if="src != null" type="html5" class="fit" :src="src" style="height: 100%; min-height: 100%" />
    </div>
  </div>
</template>

<script setup>
import { useMutation } from "@vue/apollo-composable";
import { computed, onMounted, ref, watch } from "vue";
import {
  ADD_RECEIPT_PRINT_COUNT,
  REFUND_BY_RECEIPT_NO,
  DELETE_BY_RECEIPT_NO,
} from "src/graphQueries/Account/mutation.js";
import { date as qdate, useQuasar } from "quasar";
import { useStore } from "vuex";
import jspdf from "jspdf";
import { font } from "/src/assets/NotoSansTC-Regular-normal.js";
import { useAccountProvider } from "src/providers/account.js";
const src = ref(null);

// props
const props = defineProps({
  c_receipt_no: String,
});
const staffNameMapping = {
  lswu: "胡小姐",
  ywho: "何先生",
  mwchan: "陳小姐",
  lsfung: "馮小姐",
  pswong: "黃小姐",
  kyma: "馬姑娘",
  hlng: "吳先生",
  myli: "李姑娘",
};

const $q = useQuasar();
const $store = useStore();
const username = computed(() => $store.getters["userModule/getUsername"]);
const isFinance = computed(() => $store.getters["userModule/getFinance"]);
const userProfileLogout = () => $store.dispatch("userModule/logout");
const deleteCheck = ref("");
const deleteDialog = ref(false);
const refundCheck = ref("");
const refundDialog = ref(false);

onMounted(async () => {
  refetch();
});

// query
const { result, loading, refetch } = useAccountProvider({
  c_receipt_no: ref(props.c_receipt_no),
});

const Receipt = computed(() => result.value?.tbl_account[0] ?? {});

const {
  mutate: addReceiptPrintCount,
  onDone: addReceiptPrintCount_Completed,
  onError: addReceiptPrintCount_Error,
} = useMutation(ADD_RECEIPT_PRINT_COUNT);
const {
  mutate: refund,
  onDone: refund_Completed,
  onError: refund_Error,
} = useMutation(REFUND_BY_RECEIPT_NO);
const {
  mutate: deleteReceipt,
  onDone: deleteReceipt_Completed,
  onError: deleteReceipt_Error,
} = useMutation(DELETE_BY_RECEIPT_NO);

// regenerate pdf if data change
watch(Receipt, (newVal, oldVal) => {
  if (newVal != oldVal) {
    displayPDF(newVal);
  }
});

/**
 * Reprint receipt
 * @param {string} c_receipt_no
 * @param {number} i_prints
 * @returns {void}
 */
function rePrint(c_receipt_no, i_prints) {
  const logObject = ref({
    username: username,
    datetime: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    module: "會計系統",
    action: "重新列印收據 " + c_receipt_no,
  });

  addReceiptPrintCount({
    logObject: logObject.value,
    c_receipt_no: c_receipt_no,
    i_prints: parseInt(i_prints) + 1,
  }).then(() => {
    refetch();
  });
}

function displayPDF(data) {
  var doc = new jspdf({
    orientation: "p",
    unit: "mm",
    format: [68, 120],
  });
  doc.addFileToVFS("NotoSansTC-Regular.ttf", font);
  doc.addFont("NotoSansTC-Regular.ttf", "NotoSans", "normal");
  doc.setFont("NotoSans");

  doc.setFontSize(10);
  doc.text("長洲鄉事委員會青年綜合服務中心", 34, 5, "center");
  doc.setFontSize(6);
  doc.text(
    "CHEUNG CHAU RURAL COMMITTEE INTEGRATED YOUTH CENTRE",
    34,
    8,
    "center"
  );
  doc.setFontSize(8);
  doc.text("地址", 7, 12);
  doc.setFontSize(5);
  doc.text("Address:", 14, 12);
  doc.setFontSize(8);
  doc.text("長洲東灣道", 22, 12);
  doc.setFontSize(5);
  doc.text("Tung Wan Road, Cheung Chau", 37, 12);
  doc.setFontSize(5);
  doc.text("電話 Tel: 2981 1484", 12, 15);
  doc.text("yc@cciyc.com", 30, 15);
  doc.text("www.cciyc.com", 45, 15);
  doc.setFontSize(10);
  if (data.b_refund) doc.text("退款記錄 OFFICIAL REFUND", 34, 20, "center");
  else doc.text("正式收據 OFFICIAL RECEIPT", 34, 20, "center");
  doc.setFontSize(8);
  doc.text("收據編號 Receipt No: " + data.c_receipt_no, 34, 25, "center");
  doc.setFontSize(8);
  if (data.b_refund)
    doc.text(
      "列印日期 Date: " + qdate.formatDate(Date.now(), "DD/MM/YYYY"),
      12,
      29
    );
  else
    doc.text(
      "日期 Date: " + qdate.formatDate(data.d_create, "DD/MM/YYYY"),
      12,
      29
    );
  doc.setFontSize(6);
  doc.text("Copy: " + data.i_prints, 50, 29);

  // 茲收到/茲繳付
  let lineNo = 1;
  doc.setFontSize(8);
  if (data.b_refund) doc.text("茲繳付", 5, atLine(lineNo));
  else doc.text("茲收到", 5, atLine(lineNo));
  doc.setFontSize(10);
  doc.text(data.c_name, 32, atLine(lineNo), { maxWidth: 35 });
  doc.setFontSize(6);
  lineNo++;
  if (data.b_refund) doc.text("Pay to", 5, atLine(lineNo));
  else doc.text("Received from:", 5, atLine(lineNo));

  // 港幣
  lineNo += data.c_name
    ? Math.ceil(data.c_name.trim().length / 7) > 2
      ? Math.ceil(data.c_name.trim().length / 7) - 0.5
      : 1.5
    : 1.5;
  doc.setFontSize(8);
  doc.text("港幣", 5, atLine(lineNo));
  doc.setFontSize(10);
  doc.text(
    "HK$" + data.u_price_after_discount?.toFixed(2) ?? 0,
    32,
    atLine(lineNo)
  );
  lineNo++;
  doc.setFontSize(6);
  doc.text("the sum of HK dollars", 5, atLine(lineNo));

  // 退款/支付
  lineNo += 1.5;
  doc.setFontSize(8);
  if (data.b_refund) doc.text("退款", 5, atLine(lineNo));
  else doc.text("支付", 5, atLine(lineNo));
  doc.setFontSize(10);
  doc.text(data.c_desc, 32, atLine(lineNo), { maxWidth: 30 });
  lineNo++;
  doc.setFontSize(6);
  if (data.b_refund) doc.text("being refund for", 5, atLine(lineNo));
  else doc.text("being payment for", 5, atLine(lineNo));

  // 經手人
  lineNo += data.c_desc
    ? Math.ceil(data.c_desc.trim().length / 7) > 2
      ? Math.ceil(data.c_desc.trim().length / 7) - 0.5
      : 1.5
    : 1.5;
  doc.setFontSize(8);
  doc.text("經手人", 5, atLine(lineNo));
  doc.setFontSize(10);
  doc.text(
    staffNameMapping[data.c_user_id]
      ? staffNameMapping[data.c_user_id]
      : data.c_user_id,
    32,
    atLine(lineNo) + 1
  );
  lineNo++;
  doc.setFontSize(6);
  doc.text("issued by", 5, atLine(lineNo));

  // 收據備註
  lineNo += 2;
  let lines;
  doc.setFontSize(8);
  let reminder1Chi = "收據字體會退色，若需要保留，請自行影印。"
  lines = doc.splitTextToSize(reminder1Chi, 60);
  doc.text(reminder1Chi, 34, atLine(lineNo), {
    align: "center",
    maxWidth: 60,
  });
  lineNo += lines.length;

  doc.setFontSize(7);
  let reminder1Eng = "The receipt will eventually fade out.  Please make a photocopy for a more lasting document."
  lines = doc.splitTextToSize(reminder1Eng, 60);
  doc.text(
    reminder1Eng,
    34,
    atLine(lineNo),
    { align: "center", maxWidth: 60 }
  );
  lineNo += lines.length;

  doc.setFontSize(8);
  let reminder2Chi = "請保留收據，直至課堂結束。"
  lines = doc.splitTextToSize(reminder2Chi, 60);
  doc.text(reminder2Chi, 34, atLine(lineNo), {
    align: "center", maxWidth: 60,
  });
  lineNo += lines.length;

  doc.setFontSize(7);
  let reminder2Eng = "Please keep the receipt until the end of the lessons.";
  lines = doc.splitTextToSize(reminder2Eng, 60);
  doc.text(reminder2Eng, 34, atLine(lineNo), {
    align: "center", maxWidth: 60,
  });
  lineNo += lines.length;

  // 活動備註
  lineNo++;
  doc.setFontSize(10);
  if (!data.b_refund) {
    let lines = doc.splitTextToSize(data.m_remark, 65);
    doc.text(data.m_remark, 3, atLine(lineNo), { maxWidth: 65 });
    lineNo += lines.length + 1;
    if (data.Account_to_Event?.m_remind_content) doc.text(data.Account_to_Event.m_remind_content, 3, atLine(lineNo), { maxWidth: 65 })
  }
  doc.setProperties({
    title: data.c_receipt_no + ".pdf",
    filename: data.c_receipt_no + ".pdf",
  });

  src.value = doc.output("bloburi", {
    filename: data.c_receipt_no + ".pdf",
  });
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
    username: username,
    datetime: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    module: "會計系統",
    action:
      Receipt.value.c_receipt_no +
      "退款，費用：" +
      Receipt.value.u_price_after_discount,
  });

  const remarks =
    Receipt.value.c_receipt_no +
    "退款，費用：" +
    Receipt.value.u_price_after_discount +
    " 經手人：" +
    username.value;

  refund({
    logObject: logObject.value,
    remarks: remarks,
    c_receipt_no: Receipt.value.c_receipt_no,
  });
}

function deleteConfirm() {
  const logObject = ref({
    username: username,
    datetime: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    module: "會計系統",
    action:
      "刪除收據" +
      Receipt.value.c_receipt_no +
      "，費用：" +
      Receipt.value.u_price_after_discount,
  });

  const remarks =
    "刪除收據" +
    Receipt.value.c_receipt_no +
    "，費用：" +
    Receipt.value.u_price_after_discount +
    " 經手人：" +
    username.value;

  deleteReceipt({
    logObject: logObject.value,
    remarks: remarks,
    c_receipt_no: Receipt.value.c_receipt_no,
  });
}
// callback
addReceiptPrintCount_Completed((result) => {
  refetch();
});

refund_Completed((result) => {
  $q.notify({
    message:
      "收據編號：" +
      result.data.update_tbl_account_by_pk.c_receipt_no +
      "退款成功。",
  });
  refetch();
});

refund_Error((error) => {
  notifyClientError(error);
});

deleteReceipt_Completed((result) => {
  refetch();
  $q.notify({
    message:
      "收據編號：" +
      result.data.update_tbl_account_by_pk.c_receipt_no +
      "刪除成功。",
  });
});

deleteReceipt_Error((error) => {
  notifyClientError(error);
});

addReceiptPrintCount_Error((error) => {
  notifyClientError(error);
});

function atLine(lineNo) {
  return 31 + 3.5 * lineNo;
}
</script>
