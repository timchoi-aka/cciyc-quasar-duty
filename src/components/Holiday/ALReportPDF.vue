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

const queryStartDate = computed(() =>
  date.startOfDate(new Date(reportYear.value - 1, 3, 1), "month")
);

const queryEndDate = computed(() =>
  date.endOfDate(new Date(reportYear.value, 2, 31), "month")
);
/*
const leaveRecordByMonth = computed(() => {
  let res = [];
  let monthLoop = systemStart;

  // build month array
  while (monthLoop <= queryEndDate.value) {
    res.push({
      date: date.formatDate(monthLoop, "MM/YYYY"),
      monthlyRecord: [],
    });
    monthLoop = date.addToDate(monthLoop, { month: 1 });
  }

  // add leave record to month array
  leaveData.value.forEach((leave) => {
    let index = res.findIndex(
      (x) => x.date == date.formatDate(leave.date, "MM/YYYY")
    );
    if (index >= 0) {
      res[index].monthlyRecord.push({
        date: leave.date,
        slot: leave.slot,
      });
    }
  });

  console.log("res: ", res);

  return res;
});
*/
//const reportUID = computed(() => reportUser.value.uid);
const { result: leaveData, user } = useAnnualLeaveProvider({
  userid: ref(reportUser.value.uid),
  queryStartDate: queryStartDate,
  queryEndDate: queryEndDate,
});

/*
const sortedTiers = computed(() =>
  leaveConfigData.value && leaveConfigData.value.rank
    ? Object.entries(leaveConfigData.value.rank).sort((a, b) =>
        a[0].localeCompare(b[0])
      )
    : []
); */

watch(leaveData, (newValue, oldValue) => {
  if (newValue.length > 0) {
    generatePDF(
      //leaveRecordByMonth.value,
      leaveData.value,
      user.value,
      reportYear.value
    );
  }
});

function generatePDF(data, reportUser, reportYear) {
  console.log(data);
  console.log(reportUser);
  console.log(reportYear);
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
    parseInt(reportYear - 1).toString() +
    "-" +
    reportYear.toString() +
    "年度";

  doc.setProperties({
    title: filename,
    filename: filename + ".pdf",
    subject: filename,
    keywords:
      "每月服務統計表, " +
      (reportUser.name ? reportUser.name : "") +
      ", " +
      parseInt(reportYear - 1).toString() +
      "-" +
      reportYear.toString() +
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
  /*
  while (monthLoop <= queryEndDate.value) {
    let monthIndex = data.findIndex(
      (x) => x.date == date.formatDate(monthLoop, "MM/YYYY")
    );
    console.log("monthIndex: ", monthIndex);
    if (monthIndex >= 0) {
      // console.log("monthData: ", monthData);

      let tierIndex = tiersConfig.reduce((acc, curr, i, arr) => {
        return curr <= reportUser.yearServed(monthLoop) &&
          (i === arr.length - 1 ||
            arr[i + 1] > reportUser.yearServed(monthLoop))
          ? i
          : acc;
      }, -1);

      data[monthIndex].alGain = sortedTiers.value[tierIndex][1] / 12;
    }
    monthLoop = date.addToDate(monthLoop, { month: 1 });
  }
  */
  console.log(JSON.stringify(data));
  doc.setFontSize(14);
  doc.text("長洲鄉事委員會青年綜合服務中心", 110, 5, "center");
  doc.text("職員放取年假紀錄", 110, 12, "center");
  doc.text("職員：" + reportUser.name, 5, 19, "left");
  doc.text(
    "年度：" + (reportYear - 1 + "-" + reportYear).toString(),
    165,
    19,
    "left"
  );
  doc.setFontSize(12);

  // first line
  const horLine1 = 21;
  const verLine1 = 4;
  const verLine2 = 24;
  const verLine3 = 39;
  const verLine4 = 54;
  const verLine5 = 70;
  const verLine6 = 205;
  const lastLine = 180;
  doc.line(4, 21, 205, 21);
  let lineNo = 1;
  doc.text("月份", 13, atLine(lineNo), "center");
  doc.text("獲得", 31, atLine(lineNo), "center");
  doc.text("放取", 46, atLine(lineNo), "center");
  doc.text("結餘", 61, atLine(lineNo), "center");
  doc.text("備註", 130, atLine(lineNo), "center");
  doc.line(verLine1, atLine(lineNo) + 2, verLine6, atLine(lineNo) + 2);

  lineNo++;
  doc.text("上年度", 13, atLine(lineNo), "center");
  doc.text("0", 31, atLine(lineNo), "center");
  doc.text("0", 46, atLine(lineNo), "center");
  doc.text("0", 61, atLine(lineNo), "center");
  doc.text("0", 130, atLine(lineNo), "center");
  doc.line(verLine1, atLine(lineNo) + 2, verLine6, atLine(lineNo) + 2);

  // vertical lines
  doc.line(verLine1, horLine1, verLine1, lastLine);
  doc.line(verLine2, horLine1, verLine2, lastLine);
  doc.line(verLine3, horLine1, verLine3, lastLine);
  doc.line(verLine4, horLine1, verLine4, lastLine);
  doc.line(verLine5, horLine1, verLine5, lastLine);
  doc.line(verLine6, horLine1, verLine6, lastLine);
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
