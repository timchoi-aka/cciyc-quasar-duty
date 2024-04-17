<template>
  <q-page>
    <span v-for="date in accountDates" :key="date">
      <q-btn
        :label="date"
        color="primary"
        @click="showAccounts(date)"
        class="q-mx-md q-mb-md"
      />
    </span>

    <div
      class="print-area q-pa-none q-ma-none"
      v-if="src != null && $q.platform.is.desktop"
    >
      <q-pdfviewer type="html5" :src="src" />
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref } from "vue";
import { openURL, date, useQuasar } from "quasar";
import jspdf from "jspdf";
import { font } from "/src/assets/NotoSansTC-Regular-normal.js";

// get props
const props = defineProps({
  accounts: {
    type: Array,
    required: true,
  },
});

const $q = useQuasar();
const src = ref(null);
const accTypeMap = {
  PF: "活動收費",
  MF: "會員費",
  SF: "活動收費",
  RF: "活動收費",
  CF: "活動收費",
  OF: "其他",
  續會員費: "會員費",
  新會員費: "會員費",
};

// get unique account dates
const accountDates = computed(() => {
  let r = Array.from(
    new Set(
      props.accounts
        ? props.accounts.map((account) =>
            date.formatDate(account.d_create, "DD/MM/YYYY")
          )
        : []
    )
  );

  // sort by date
  return r.sort((a, b) => {
    return date.getDateDiff(
      date.extractDate(b, "DD/MM/YYYY"),
      date.extractDate(a, "DD/MM/YYYY")
    ) > 0
      ? 1
      : -1;
  });
});

// show accounts by date
const showAccounts = (d) => {
  const reportData = props.accounts
    .filter((account) => date.formatDate(account.d_create, "DD/MM/YYYY") === d)
    .sort((a, b) => a.c_receipt_no.localeCompare(b.c_receipt_no));

  var doc = new jspdf({
    orientation: "p",
    unit: "mm",
    format: [297, 210],
  });
  doc.addFileToVFS("NotoSansTC-Regular.ttf", font);
  doc.addFont("NotoSansTC-Regular.ttf", "NotoSans", "normal");
  doc.setFont("NotoSans");

  drawContent(doc, reportData);

  doc.setProperties({
    title: "每日收款摘要" + d + ".pdf",
    filename: "每日收款摘要" + d + ".pdf",
    subject: "每日收款摘要" + d + ".pdf",
    keywords: "每日收款摘要" + d,
    creator: "CCIYC",
    author: "CCIYC",
  });

  $q.platform.is.mobile
    ? openURL(
        doc.output("bloburi", {
          filename: "每日收款摘要" + d + ".pdf",
        })
      )
    : (src.value = doc.output("datauristring", {
        filename: "每日收款摘要" + d + ".pdf",
      }));
};

function drawContent(doc, reportData) {
  // title and logo
  doc.setFontSize(14);
  doc.text("長洲鄉事委員會青年綜合服務中心", 110, 10, "center");
  doc.text("每日收款摘要", 110, 17, "center");
  doc.setFontSize(12);
  doc.text(
    "收款月份: " + date.formatDate(reportData[0].d_create, "MM/YYYY"),
    40,
    24,
    "center"
  );
  doc.text(
    "收款日期: " + date.formatDate(reportData[0].d_create, "DD/MM/YYYY"),
    150,
    24,
    "center"
  );
  // draw table headers
  doc.setLineWidth(0.5);

  // first line
  doc.line(15, 27, 185, 27);
  doc.line(15, 34, 185, 34);
  doc.text("收條號碼", 30, 32, "center");
  doc.text("會員費", 60, 32, "center");
  doc.text("活動收費", 90, 32, "center");
  doc.text("其他", 120, 32, "center");
  doc.text("存入銀行日期", 160, 32, "center");

  let lineNo = 1;
  reportData.forEach((account) => {
    // doc.line(15, atLine(lineNo), 185, atLine(lineNo));
    doc.text(account.c_receipt_no, 30, atLine(lineNo), "center");
    accTypeMap[account.c_type] == "會員費"
      ? doc.text(
          account.u_price_after_discount.toString(),
          60,
          atLine(lineNo),
          "center"
        )
      : "";
    accTypeMap[account.c_type] == "活動收費"
      ? doc.text(
          account.u_price_after_discount.toString(),
          90,
          atLine(lineNo),
          "center"
        )
      : "";
    accTypeMap[account.c_type] == "其他"
      ? doc.text(
          account.u_price_after_discount.toString(),
          120,
          atLine(lineNo),
          "center"
        )
      : "";

    lineNo++;
  });
  // bottom line
  doc.line(15, atLine(lineNo - 1) + 2, 185, atLine(lineNo - 1) + 2);

  // total line
  doc.text("每日總計金額", 30, atLine(lineNo), "center");
  reportData.filter((account) => accTypeMap[account.c_type] == "會員費")
    .length > 0
    ? doc.text(
        reportData
          .filter((account) => accTypeMap[account.c_type] == "會員費")
          .map((account) => account.u_price_after_discount)
          .reduce((a, b) => a + b)
          .toString(),
        60,
        atLine(lineNo),
        "center"
      )
    : "";
  reportData.filter((account) => accTypeMap[account.c_type] == "活動收費")
    .length > 0
    ? doc.text(
        reportData
          .filter((account) => accTypeMap[account.c_type] == "活動收費")
          .map((account) => account.u_price_after_discount)
          .reduce((a, b) => a + b)
          .toString(),
        90,
        atLine(lineNo),
        "center"
      )
    : "";
  reportData.filter((account) => accTypeMap[account.c_type] == "其他").length >
  0
    ? doc.text(
        reportData
          .filter((account) => accTypeMap[account.c_type] == "其他")
          .map((account) => account.u_price_after_discount)
          .reduce((a, b) => a + b)
          .toString(),
        120,
        atLine(lineNo),
        "center"
      )
    : "";

  // bottom line
  doc.line(15, atLine(lineNo) + 2, 185, atLine(lineNo) + 2);

  // draw vertical lines
  doc.line(15, 27, 15, atLine(lineNo) + 2);
  doc.line(48, 27, 48, atLine(lineNo) + 2);
  doc.line(75, 27, 75, atLine(lineNo) + 2);
  doc.line(105, 27, 105, atLine(lineNo) + 2);
  doc.line(135, 27, 135, atLine(lineNo) + 2);
  doc.line(185, 27, 185, atLine(lineNo) + 2);

  // footer
  lineNo += 2;
  doc.text("編製人員: ", 20, atLine(lineNo), "left");
  doc.text("日期: ", 110, atLine(lineNo), "left");
  doc.line(40, atLine(lineNo) + 2, 105, atLine(lineNo) + 2);
  doc.line(125, atLine(lineNo) + 2, 175, atLine(lineNo) + 2);

  lineNo += 2;
  doc.text(
    "每日收款項目已與上述每日總計金額及正式收據核對無誤。",
    40,
    atLine(lineNo),
    "left"
  );
  lineNo += 2;
  doc.text("核對人員: ", 20, atLine(lineNo), "left");
  doc.text("日期: ", 110, atLine(lineNo), "left");
  doc.line(40, atLine(lineNo) + 2, 105, atLine(lineNo) + 2);
  doc.line(125, atLine(lineNo) + 2, 175, atLine(lineNo) + 2);
}

function atLine(lineNo) {
  return 32 + 7 * lineNo;
}
</script>

<style lang="scss" scoped>
.print-area {
  size: landscape;
  width: 29.7cm;
  height: 21cm;
  margin: 3mm;
  overflow: hidden;
  border: 1px solid;
}
</style>
