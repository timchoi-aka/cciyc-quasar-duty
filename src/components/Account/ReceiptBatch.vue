<template>
  <!-- print receipt modal -->
  <div class="fit row wrap justify-start items-stretch content-start">
    <div v-if="loading">
      <q-spinner color="primary" size="3em" :thickness="10" />
    </div>
    <div class="print-area q-pa-none q-ma-none" v-if="$q.platform.is.desktop">
      <div v-if="Receipt.length > 0" class="text-h6 text-center">
        合共 {{ Receipt.length }} 張收據，總金額 HK$
        {{
          Receipt.map((x) => x.u_price_after_discount)
            .reduce((a, b) => a + b, 0)
            .toFixed(2)
        }}
      </div>
      <q-pdfviewer v-if="src != null" type="html5" :src="src" />
      <div v-else class="text-center q-mt-md text-bold text-h6">請選擇收據</div>
    </div>
    <div v-if="$q.platform.is.mobile">請在新視窗開啟PDF</div>
  </div>
</template>

<script setup>
import { computed, ref, watch, toRef } from "vue";
import { date as qdate, useQuasar } from "quasar";
import { useStore } from "vuex";
import jspdf from "jspdf";
import { font } from "/src/assets/NotoSansTC-Regular-normal.js";
import { useQuery } from "@vue/apollo-composable";
import { gql } from "graphql-tag";

const src = ref(null);

// props
const props = defineProps({
  c_receipt_no: {
    type: Array,
    required: true,
  },
});

const arr_receipt_no = toRef(props, "c_receipt_no");

const $q = useQuasar();
const $store = useStore();
const username = computed(() => $store.getters["userModule/getUsername"]);

watch(arr_receipt_no, (newVal, oldVal) => {
  if (newVal != oldVal) {
    refetch();
  }
});

// query
const { result, loading, refetch } = useQuery(
  gql`
    query GetReceiptByReceiptNumbers($arr_receipt_no: [String!] = []) {
      tbl_account(where: { c_receipt_no: { _in: $arr_receipt_no } }) {
        b_OtherIncome
        b_clear
        b_cssa
        b_delete
        b_refund
        c_act_code
        c_cash_type
        c_cheque_no
        c_desc
        c_mem_id
        c_name
        c_receipt_no
        c_refno
        c_refno2
        c_type
        c_user_id
        d_clear
        d_create
        i_prints
        i_receipt_type
        m_remark
        m_remark2
        u_price_after_discount
        u_discount
      }
    }
  `,
  () => ({
    arr_receipt_no:
      arr_receipt_no.value.length > 0 ? arr_receipt_no.value : [""],
  })
);

const Receipt = computed(() => result.value?.tbl_account ?? []);

// regenerate pdf if data change
watch(Receipt, (newVal, oldVal) => {
  if (newVal != oldVal) {
    displayPDF(newVal);
  }
});

function displayPDF(data) {
  if (data.length == 0) return;
  var doc = new jspdf({
    orientation: "p",
    unit: "mm",
    format: [68, 150],
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
  doc.text("正式收據 OFFICIAL RECEIPT", 34, 20, "center");
  doc.setFontSize(8);
  //doc.text("收據編號 Receipt No: " + data.c_receipt_no, 34, 25, "center");
  //doc.setFontSize(8);
  doc.text(
    "列印日期 Date: " + qdate.formatDate(Date.now(), "DD/MM/YYYY"),
    17,
    24
  );
  doc.setFontSize(6);

  // 茲收到/茲繳付
  let lineNo = 1;
  doc.setFontSize(8);
  doc.text("茲收到", 5, atLine(lineNo));
  doc.setFontSize(10);
  doc.text(data[0].c_name, 32, atLine(lineNo), { maxWidth: 35 });
  doc.setFontSize(6);
  lineNo += 0.6;
  doc.text("Received from:", 5, atLine(lineNo));
  lineNo++;

  // table header
  doc.text("收據編號", 5, atLine(lineNo));
  doc.text("項目", 20, atLine(lineNo), { maxWidth: 40 });
  doc.text("金額", 55, atLine(lineNo));
  lineNo += 0.6;
  doc.text("Receipt No", 5, atLine(lineNo));
  doc.text("Items", 20, atLine(lineNo));
  doc.text("Amount", 55, atLine(lineNo));
  doc.line(5, atLine(lineNo) + 1, 65, atLine(lineNo) + 1);

  lineNo++;
  data.forEach((d) => {
    doc.text(d.c_receipt_no, 5, atLine(lineNo));
    doc.text(
      d.c_act_code ? "(" + d.c_act_code + ")" + d.c_desc : d.c_desc,
      20,
      atLine(lineNo),
      {
        align: "left",
        maxWidth: 30,
      }
    );
    d.u_price_after_discount
      ? doc.text(
          "HK$" + d.u_price_after_discount.toFixed(2),
          64,
          atLine(lineNo),
          { align: "right" }
        )
      : doc.text("免費", 64, atLine(lineNo), { align: "right" });
    for (let i = d.c_desc.length; i >= 0; i++) {
      lineNo += 0.6;
      i -= 30;
    }
    lineNo++;
  });
  doc.line(5, atLine(lineNo - 1) + 1, 65, atLine(lineNo - 1) + 1);

  doc.text("合共/Total", 5, atLine(lineNo));
  doc.text(data.length + " 項/Items", 32, atLine(lineNo), { align: "center" });
  data.filter((x) => x.u_price_after_discount).length > 0
    ? doc.text(
        "HK$" +
          data
            .map((x) => x.u_price_after_discount)
            .reduce((a, b) => a + b, 0)
            .toFixed(2),
        64,
        atLine(lineNo),
        { align: "right" }
      )
    : doc.text("免費", 64, atLine(lineNo), { align: "right" });

  // 總金額
  lineNo += 2;
  doc.setFontSize(8);
  doc.text("總金額", 5, atLine(lineNo));
  doc.setFontSize(10);
  data.filter((x) => x.u_price_after_discount).length > 0
    ? doc.text(
        "HK$" +
          data
            .map((x) => x.u_price_after_discount)
            .reduce((a, b) => a + b, 0)
            .toFixed(2),
        32,
        atLine(lineNo)
      )
    : doc.text("免費", 32, atLine(lineNo));
  lineNo += 0.6;
  doc.setFontSize(6);
  doc.text("the sum of HK dollars", 5, atLine(lineNo));

  // 經手人
  lineNo += 2;
  doc.setFontSize(8);
  doc.text("經手人", 5, atLine(lineNo));
  doc.setFontSize(10);
  doc.text(username.value, 32, atLine(lineNo) + 1);
  lineNo += 0.6;
  doc.setFontSize(6);
  doc.text("issued by", 5, atLine(lineNo));

  // 收據備註
  lineNo += 2;
  doc.setFontSize(8);
  doc.text("收據字體會退色，若需要保留，請自行影印。", 6, atLine(lineNo), {
    maxWidth: 60,
  });
  lineNo++;
  doc.setFontSize(7);
  doc.text(
    "The receipt will eventually fade out.  Please make a photocopy for a more lasting document.",
    4,
    atLine(lineNo),
    { maxWidth: 60 }
  );

  doc.setProperties({
    title: data.map((x) => x.c_receipt_no).join("_") + ".pdf",
    filename: data.map((x) => x.c_receipt_no).join("_") + ".pdf",
  });

  src.value = doc.output("datauristring", {
    filename: data.map((x) => x.c_receipt_no).join("_") + ".pdf",
  });
}

function atLine(lineNo) {
  return 27 + 3.5 * lineNo;
}
</script>

<style lang="scss" scoped>
@media screen {
  .print-area {
    width: 100%;
    height: 800px;
    min-height: 800px;
    margin: none;
    border: 1px solid;
    overflow: auto;
    border: 1px solid;
    scale: 100%;
    transform-origin: top;
  }
}
</style>
