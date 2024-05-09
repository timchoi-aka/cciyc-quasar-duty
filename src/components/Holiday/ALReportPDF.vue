<template>
  <div class="print-area q-pa-none q-ma-none" v-if="$q.platform.is.desktop">
    <q-pdfviewer v-if="src != null" type="html5" :src="src" />
  </div>
  <div v-if="$q.platform.is.mobile">請在新視窗開啟PDF</div>
</template>

<script setup>
import jspdf from "jspdf";
import { watch, ref, computed } from "vue";
import { font } from "/src/assets/NotoSansTC-Regular-normal.js";
import { openURL, date, useQuasar } from "quasar";
import { useAnnualLeaveProvider } from "src/providers/leave";
import { useStore } from "vuex";

const systemStart = date.startOfDate(new Date(2021, 3, 1), "month");
const $store = useStore();
const $q = useQuasar();
const props = defineProps({
  modelValue: {
    renderYear: {
      type: Number,
      required: true,
    },
    renderYearOffset: {
      type: Number,
      required: true,
    },
    reportUser: {
      type: Object,
      required: true,
    },
  },
});

const src = ref(null);

// computed
const reportYear = computed(
  () => props.modelValue.renderYear + props.modelValue.renderYearOffset
);
const uid = computed(() => $store.getters["userModule/getUID"]);
const username = computed(() => $store.getters["userModule/getUsername"]);
const reportUser = computed(() => {
  return {
    uid: props.modelValue.reportUser.value
      ? props.modelValue.reportUser.value
      : uid.value,
    name: props.modelValue.reportUser.label
      ? props.modelValue.reportUser.label
      : username.value,
  };
});

const queryEndDate = computed(() =>
  date.endOfDate(new Date(reportYear.value + 1, 2, 31), "month")
);

const { result, user } = useAnnualLeaveProvider({
  userid: ref(reportUser.value.uid),
  queryEndDate: queryEndDate,
});

watch(result, (newValue, oldValue) => {
  if (newValue.length > 0) {
    generatePDF(newValue, user.value, reportYear.value);
  }
});

function generatePDF(data, reportUser, reportYear) {
  var doc = new jspdf({
    orientation: "p",
    unit: "mm",
    format: [297, 210],
  });
  doc.addFileToVFS("NotoSansTC-Regular.ttf", font);
  doc.addFont("NotoSansTC-Regular.ttf", "NotoSans", "normal");
  doc.setFont("NotoSans");

  drawContent(doc, data, reportUser, reportYear);
  let filename =
    "職員放取年假紀錄-" +
    (reportUser.name ? reportUser.name : "") +
    "-" +
    reportYear.toString() +
    "-" +
    parseInt(reportYear + 1).toString() +
    "年度";

  doc.setProperties({
    title: filename,
    filename: filename + ".pdf",
    subject: filename,
    keywords:
      "每月服務統計表, " +
      (reportUser.name ? reportUser.name : "") +
      ", " +
      reportYear.toString() +
      "-" +
      parseInt(reportYear + 1).toString() +
      "年度, ",
    creator: "CCIYC",
    author: "CCIYC",
  });

  $q.platform.is.mobile
    ? openURL(
        doc.output("bloburi", {
          filename: filename + ".pdf",
        })
      )
    : (src.value = doc.output("datauristring", {
        filename: filename + ".pdf",
      }));
}

// PDF generation functions
async function drawContent(doc, data, reportUser, reportYear) {
  // build month gain and leave record
  let monthLoop = systemStart;
  const noOfDatesPerLine = 5;

  const slotMap = {
    slot_a: "早",
    slot_b: "午",
    slot_c: "晚",
  };

  const periodStart = computed(() =>
    date.startOfDate(new Date(reportYear, 3, 1), "month")
  );
  const periodEnd = computed(() => {
    let reportYearEnd = date.endOfDate(
      new Date(reportYear + 1, 2, 31),
      "month"
    );
    if (reportUser.getDateOfExit() != null) {
      if (date.getDateDiff(reportYearEnd, reportUser.getDateOfExit()) <= 0) {
        return reportYearEnd;
      } else {
        return date.endOfDate(reportUser.getDateOfExit(), "month");
      }
    }
    return reportYearEnd;
  });

  let accumulatedLeave = [];
  let alGain = 0;
  let alTaken = 0;

  for (let i = 0; i < data.length; i++) {
    alGain += data[i].alGain;
    alTaken += data[i].alTaken;
    if (i % 12 == 0) {
      accumulatedLeave.push({
        date: data[i].date,
        alGain: alGain,
        alTaken: alTaken,
      });
      alGain = 0;
      alTaken = 0;
    }
  }

  doc.setFontSize(14);
  doc.text("長洲鄉事委員會青年綜合服務中心", 110, 5, "center");
  doc.text("職員放取年假紀錄", 110, 12, "center");

  reportUser
    ? doc.text(
        "職員：" +
          reportUser.name +
          " （入職日期：" +
          date.formatDate(reportUser.getDateOfEntry(), "YYYY年M月D日") +
          "）",
        5,
        19,
        "left"
      )
    : null;
  doc.text(
    "年度：" + (reportYear + "-" + parseInt(reportYear + 1).toString()),
    165,
    19,
    "left"
  );
  doc.setFontSize(10);

  // first line
  const horLine1 = 21;
  const verLine1 = 4;
  const verLine2 = 24;
  const verLine3 = 39;
  const verLine4 = 54;
  const verLine5 = 70;
  const verLine6 = 205;

  doc.line(4, 21, 205, 21);
  let lineNo = 1;
  doc.text("月份", 13, atLine(lineNo), "center");
  doc.text("獲得", 31, atLine(lineNo), "center");
  doc.text("放取", 46, atLine(lineNo), "center");
  doc.text("結餘", 61, atLine(lineNo), "center");
  doc.text("備註", 130, atLine(lineNo), "center");
  doc.line(verLine1, atLine(lineNo) + 2, verLine6, atLine(lineNo) + 2);

  lineNo++;
  let accumulatedGain = 0,
    accumulatedTaken = 0,
    accumulatedBalance = 0;

  while (date.getDateDiff(monthLoop, periodEnd.value) <= 0) {
    if (date.getDateDiff(monthLoop, periodStart.value, "months") == -1) {
      let i = accumulatedLeave.findIndex((x) =>
        date.isSameDate(x.date, monthLoop)
      );
      let j = data.findIndex((x) => date.isSameDate(x.date, monthLoop));
      doc.text("上年度", 13, atLine(lineNo), "center");
      doc.text(
        accumulatedLeave[i].alGain.toString(),
        31,
        atLine(lineNo),
        "center"
      );
      doc.text(
        accumulatedLeave[i].alTaken.toString(),
        46,
        atLine(lineNo),
        "center"
      );
      doc.text(data[j].balance.toString(), 61, atLine(lineNo), "center");
      doc.line(verLine1, atLine(lineNo) + 2, verLine6, atLine(lineNo) + 2);
      lineNo++;
    }
    if (date.getDateDiff(monthLoop, periodStart.value, "months") >= 0) {
      let i = data.findIndex((x) => date.isSameDate(x.date, monthLoop));

      if (i >= 0) {
        doc.text(
          date.formatDate(data[i].date, "MM/YYYY"),
          13,
          atLine(lineNo),
          "center"
        );

        accumulatedGain += data[i].alGain;
        accumulatedTaken += data[i].alTaken;
        accumulatedBalance = data[i].balance;
        doc.text(data[i].alGain.toString(), 31, atLine(lineNo), "center");
        doc.text(data[i].alTaken.toString(), 46, atLine(lineNo), "center");
        doc.text(data[i].balance.toString(), 61, atLine(lineNo), "center");
        let monthlyRecordString = [];
        let tempLine = [];
        for (let j = 0; j < data[i].monthlyRecord.length; j++) {
          tempLine.push(
            date.formatDate(data[i].monthlyRecord[j].date, "M月D日") +
              "(" +
              slotMap[data[i].monthlyRecord[j].slot] +
              ")"
          );
          if (tempLine.length == noOfDatesPerLine) {
            monthlyRecordString.push(tempLine);
            tempLine = [];
          }
        }

        if (tempLine.length > 0) {
          monthlyRecordString.push(tempLine);
        }

        for (let j = 0; j < monthlyRecordString.length; j++) {
          doc.text(monthlyRecordString[j].join("  "), 75, atLine(lineNo), {
            align: "left",
            maxWidth: 120,
          });
          lineNo++;
        }
        if (monthlyRecordString.length > 0) lineNo -= 0.5;
        doc.line(verLine1, atLine(lineNo) + 1, verLine6, atLine(lineNo) + 1);
      }
      lineNo += 1;
    }
    monthLoop = date.addToDate(monthLoop, { month: 1 });
  }

  doc.text("本年度", 13, atLine(lineNo), "center");
  doc.text(accumulatedGain.toString(), 31, atLine(lineNo), "center");
  doc.text(accumulatedTaken.toString(), 46, atLine(lineNo), "center");
  doc.text(accumulatedBalance.toString(), 61, atLine(lineNo), "center");
  doc.line(verLine1, atLine(lineNo) + 3, verLine6, atLine(lineNo) + 3);

  // vertical lines
  doc.line(verLine1, horLine1, verLine1, atLine(lineNo) + 3);
  doc.line(verLine2, horLine1, verLine2, atLine(lineNo) + 3);
  doc.line(verLine3, horLine1, verLine3, atLine(lineNo) + 3);
  doc.line(verLine4, horLine1, verLine4, atLine(lineNo) + 3);
  doc.line(verLine5, horLine1, verLine5, atLine(lineNo) + 3);
  doc.line(verLine6, horLine1, verLine6, atLine(lineNo) + 3);

  if (
    reportUser.getDateOfExit() &&
    date.isSameDate(
      date.endOfDate(date.subtractFromDate(monthLoop, { month: 1 }), "month"),
      date.endOfDate(reportUser.getDateOfExit(), "month")
    )
  ) {
    lineNo++;
    doc.text(
      "離職日期：" +
        date.formatDate(reportUser.getDateOfExit(), "YYYY年M月D日"),
      100,
      atLine(lineNo),
      "center"
    );
  }

  lineNo += 2;
  doc.text(
    "員工簽署：____________________________   日期：________________________________",
    13,
    atLine(lineNo),
    "left"
  );
}

function atLine(lineNo) {
  return 19 + 7 * lineNo;
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
