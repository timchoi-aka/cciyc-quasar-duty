<template>
  <div
    class="row q-ma-md-none q-pa-md-none bg-grey-3 justify-center"
    style="width: 700px; max-width: 80vw; height: 600px; max-height: 60vh"
  >
    <div
      class="bg-primary row col-12 justify-left q-px-md"
      style="min-height: 50px; max-height: 50px"
    >
      <q-space />
      <q-btn
        icon="close"
        flat
        dense
        class="bg-primary text-white col-shrink"
        v-close-popup
        align="right"
      >
        <q-tooltip class="bg-white text-primary">關閉</q-tooltip>
      </q-btn>
    </div>
    <div class="print-area q-pa-none q-ma-none" v-if="$q.platform.is.desktop">
      <q-pdfviewer v-if="src != null" type="html5" :src="src" />
    </div>
    <div v-else="$q.platform.is.mobile">請在新視窗開啟PDF</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { date, useQuasar } from "quasar";
import { useStore } from "vuex";
import jspdf from "jspdf";
import { font } from "/src/assets/NotoSansTC-Regular-normal.js";

// props
const props = defineProps({
  data: Object,
  type: {
    type: String,
    required: true,
  },
});

const $q = useQuasar();
const $store = useStore();
const src = ref(null);

onMounted(() => {
  // declare pdf file
  var doc = new jspdf({
    orientation: "p",
    unit: "mm",
    format: [297, 210],
  });
  doc.addFileToVFS("NotoSansTC-Regular.ttf", font);
  doc.addFont("NotoSansTC-Regular.ttf", "NotoSans", "normal");
  doc.setFont("NotoSans");

  let filename =
    props.type && props.type == "醫療"
      ? "員工醫療（" +
        (props.data.date
          ? date.formatDate(props.data.date, "YYYY年M月D日")
          : "") +
        "）"
      : (props.data.c_act_code ? props.data.c_act_code : "") + "活動預支";

  // start drawing content
  doc.setFontSize(20);
  doc.text("長洲鄉事委員會青年綜合服務中心", 110, 15, "center");
  doc.text(
    "Cheung Chau Rural Committee Integrated Youth Centre",
    110,
    25,
    "center"
  );
  doc.text("領款書 Voucher", 110, 35, "center");
  doc.setFontSize(18);

  // first line
  let lineNo = 1;
  doc.text("商鋪/受款人：", 5, atLine(lineNo), "left");
  doc.text(
    (props.data.recipient ? props.data.recipient : "") +
      (props.data.username ? props.data.username : ""),
    50,
    atLine(lineNo),
    "left"
  );
  lineNo += 2;

  // second line
  doc.text("祈付：", 5, atLine(lineNo), "left");
  doc.text(filename, 25, atLine(lineNo), "left");
  lineNo += 2;

  // third line
  doc.text("金額：", 5, atLine(lineNo), "left");
  doc.text(
    props.data.amount ? convertToChinese(props.data.amount) : "0",
    25,
    atLine(lineNo),
    "left"
  );
  lineNo += 2;

  // forth line
  doc.text("港幣：", 5, atLine(lineNo), "left");
  doc.text(
    "HK$" + (props.data.amount ? props.data.amount.toString() : "0"),
    25,
    atLine(lineNo),
    "left"
  );
  doc.text("支票號碼：", 120, atLine(lineNo), "left");
  lineNo += 2;

  // fifth line
  doc.text("中心主任：", 5, atLine(lineNo), "left");
  doc.text("收款人/經手人：", 120, atLine(lineNo), "left");
  lineNo += 2;

  // sixth line
  doc.text("日期：", 5, atLine(lineNo), "left");
  doc.text("日期：", 120, atLine(lineNo), "left");

  // export file
  doc.setProperties({
    title:
      filename +
      (props.data.username ? props.data.username : "") +
      "-領款書.pdf",
    filename:
      filename +
      (props.data.username ? props.data.username : "") +
      "-領款書.pdf",
    subject:
      filename +
      (props.data.username ? props.data.username : "") +
      "-領款書.pdf",
    keywords:
      filename +
      (props.data.username ? props.data.username : "") +
      "-領款書.pdf",
    creator: "CCIYC",
    author: "CCIYC",
  });

  $q.platform.is.mobile
    ? openURL(
        doc.output("bloburi", {
          filename:
            filename +
            (props.data.username ? props.data.username : "") +
            "-領款書.pdf",
        })
      )
    : (src.value = doc.output("datauristring", {
        filename:
          filename +
          (props.data.username ? props.data.username : "") +
          "-領款書.pdf",
      }));
});
// function
function convertToChinese(number) {
  if (number >= 100000) return "金額超過上限";
  // Define arrays of characters
  const digits = ["", "壹", "貳", "參", "肆", "伍", "陸", "柒", "捌", "玖"];

  // Split the number into portions of before and after decimal
  let units = number.toString().split(".");
  let unit = parseInt(units[0]);
  let cent = parseInt(units[1]);

  // Convert each portion to Chinese characters
  const chineseParts = [];
  const digitsPart = [];

  let tenThousand = Math.floor(unit / 10000);
  if (tenThousand > 0) digitsPart.push(digits[tenThousand] + "萬");
  unit %= 10000;

  let thousand = Math.floor(unit / 1000);
  if (thousand > 0) digitsPart.push(digits[thousand] + "仟");
  unit %= 1000;

  let hundred = Math.floor(unit / 100);
  if (hundred > 0) {
    if (thousand == 0 && tenThousand > 0) {
      digitsPart.push("零");
    }
    digitsPart.push(digits[hundred] + "佰");
  }
  unit %= 100;

  let ten = Math.floor(unit / 10);
  if (ten > 0) {
    if (hundred == 0 && (thousand > 0 || tenThousand > 0)) {
      digitsPart.push("零");
    }
    if (ten != 1) {
      digitsPart.push(digits[ten] + "拾");
    } else {
      if (hundred + thousand + tenThousand > 0) {
        digitsPart.push("壹拾");
      } else digitsPart.push("拾");
    }
    unit %= 10;
  }

  if (unit > 0) {
    if ((hundred > 0 || thousand > 0 || tenThousand > 0) && ten == 0)
      digitsPart.push("零" + digits[unit]);
    else digitsPart.push(digits[unit]);
  }
  digitsPart.push("圓");

  if (cent > 10) {
    digitsPart.push(digits[Math.floor(cent / 10)] + "角");
    let mini = cent % 10;
    if (mini > 0) digitsPart.push(digits[mini] + "分");
  } else if (cent > 0) {
    digitsPart.push(digits[cent] + "角");
  } else digitsPart.push("正");

  return digitsPart.join("");
}

function atLine(lineNo) {
  return 50 + 7 * lineNo;
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
