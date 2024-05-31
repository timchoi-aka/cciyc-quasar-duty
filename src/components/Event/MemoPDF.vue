<template>
  <q-pdfviewer v-if="src != null" type="html5" :src="src" style="height: 100%; min-height: 100%" />
</template>

<script setup>
import { ref, toRef, watch } from "vue";
import jspdf from "jspdf";
import { font } from "/src/assets/NotoSansTC-Regular-normal.js";
import { useMemoProvider } from "src/providers/memo.js";
import { date } from "quasar";

const src = ref(null);
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
const props = defineProps({
  printMemo: {
    type: Object,
    default: { c_mem_id: "", c_act_code: "" },
  },
});

const c_mem_id = toRef(props.printMemo, "c_mem_id");
const c_act_code = toRef(props.printMemo, "c_act_code");

const { result, loading } = useMemoProvider({
  c_mem_id: c_mem_id,
  c_act_code: c_act_code,
});

// regenerate pdf if data change
watch(result, (newVal, oldVal) => {
  if (newVal != oldVal) {
    displayPDF(newVal.tbl_act_reg[0]);
  }
});

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
  doc.text("活動備忘 PROGRAM MEMO", 34, 20, "center");

  doc.setFontSize(8);

  doc.text(
    "列印日期 Date: " + date.formatDate(new Date(), "DD/MM/YYYY HH:mm"),
    12,
    24
  );

  // 參加者
  let lineNo = 1;
  doc.setFontSize(8);
  doc.text("參加者", 5, atLine(lineNo));
  doc.setFontSize(10);
  doc.text(data.c_name, 25, atLine(lineNo) + 1, { maxWidth: 35 });
  doc.setFontSize(6);
  lineNo++;
  doc.text("Participant", 5, atLine(lineNo));

  // 港幣
  lineNo += data.c_name
    ? Math.ceil(data.c_name.trim().length / 7) > 2
      ? Math.ceil(data.c_name.trim().length / 7) - 0.5
      : 1.5
    : 1.5;
  doc.setFontSize(8);
  doc.text("參加活動", 5, atLine(lineNo));
  doc.setFontSize(10);
  doc.text(data.EventRegistration_to_Event.c_act_name, 25, atLine(lineNo), {
    maxWidth: 40,
  });

  lineNo++;
  doc.setFontSize(6);
  doc.text("Join the service", 5, atLine(lineNo));

  // 經手人
  lineNo += data.EventRegistration_to_Event.c_act_name
    ? Math.ceil(data.EventRegistration_to_Event.c_act_name.trim().length / 11) >
      2
      ? Math.ceil(data.EventRegistration_to_Event.c_act_name.trim().length / 11)
      : 1
    : 1;
  doc.setFontSize(8);
  doc.text("經手人", 5, atLine(lineNo));
  doc.setFontSize(10);
  doc.text(
    staffNameMapping[data.c_user_id?.toLowerCase()]
      ? staffNameMapping[data.c_user_id?.toLowerCase()]
      : data.c_user_id,
    25,
    atLine(lineNo) + 1
  );
  lineNo++;
  doc.setFontSize(6);
  doc.text("issued by", 5, atLine(lineNo));

  // 收據備註
  lineNo += 1.5;
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

  // 活動備註
  lineNo += 2.5;
  doc.setFontSize(10);
  doc.text("服務資料 Service Detail", 5, atLine(lineNo));
  lineNo++;
  if (
    data.EventRegistration_to_Event.d_date_from &&
    data.EventRegistration_to_Event.d_date_to
  ) {
    doc.setFontSize(8);
    doc.text("日期 Date:", 5, atLine(lineNo));
    if (
      date.formatDate(
        data.EventRegistration_to_Event.d_date_from,
        "YYYYMMDD"
      ) ==
      date.formatDate(data.EventRegistration_to_Event.d_date_to, "YYYYMMDD")
    ) {
      doc.text(
        date.formatDate(
          date.extractDate(
            data.EventRegistration_to_Event.d_date_from.trim(),
            "D/M/YYYY"
          ),
          "YYYY年M月D日 星期ddd", {
          daysShort: ["日", "一", "二", "三", "四", "五", "六"],
        }
        ),
        20,
        atLine(lineNo)
      );
      lineNo++
    } else {
      let dateText =
        date.formatDate(
          date.extractDate(
            data.EventRegistration_to_Event.d_date_from.trim(),
            "D/M/YYYY"
          ),
          "YYYY年M月D日"
        ) +
        " 至 " +
        date.formatDate(
          date.extractDate(
            data.EventRegistration_to_Event.d_date_to.trim(),
            "D/M/YYYY"
          ),
          "YYYY年M月D日"
        ) +
        (data.EventRegistration_to_Event.c_week && (date.formatDate(data.EventRegistration_to_Event.d_date_from, "YYYYMMDD") != date.formatDate(data.EventRegistration_to_Event.d_date_to, "YYYYMMDD"))
          ? " 逢星期" + data.EventRegistration_to_Event.c_week
          : "");
      doc.text(dateText, 20, atLine(lineNo), {
        maxWidth: 50,
      });
      let lines = doc.splitTextToSize(dateText, 50);
      lineNo += lines.length;
    }
  }
  if (
    data.EventRegistration_to_Event.d_time_from &&
    data.EventRegistration_to_Event.d_time_to
  ) {
    doc.setFontSize(8);
    doc.text("時間 Time: ", 5, atLine(lineNo));
    let startDatetime = date.extractDate(
      data.EventRegistration_to_Event.d_date_from.trim() +
      " " +
      data.EventRegistration_to_Event.d_time_from.trim(),
      "D/M/YYYY h:mm:ss A"
    );

    let endDatetime = date.extractDate(
      data.EventRegistration_to_Event.d_date_to.trim() +
      " " +
      data.EventRegistration_to_Event.d_time_to.trim(),
      "D/M/YYYY h:mm:ss A"
    );
    doc.text(
      date.formatDate(startDatetime, "h:mm A") +
      " - " +
      date.formatDate(endDatetime, "h:mm A"),
      20,
      atLine(lineNo)
    );

    lineNo++;
  }

  lineNo += 0.5;

  if (
    (data.EventRegistration_to_Event.m_remark &&
      data.EventRegistration_to_Event.m_remark.length > 0) ||
    (data.EventRegistration_to_Event.m_remind_content &&
      data.EventRegistration_to_Event.m_remind_content.length > 0)
  ) {
    doc.setFontSize(8);
    doc.text("活動備註", 5, atLine(lineNo));
    lineNo += 1.2;
    doc.text(
      data.EventRegistration_to_Event.m_remark &&
        data.EventRegistration_to_Event.m_remark.length > 0
        ? data.EventRegistration_to_Event.m_remark
        : data.EventRegistration_to_Event.m_remind_content,
      5,
      atLine(lineNo),
      {
        maxWidth: 50,
      }
    );
  }
  let filename = data.c_mem_id + "_" + data.c_act_code + "活動備忘";
  doc.setProperties({
    title: filename + ".pdf",
    filename: filename + ".pdf",
  });

  src.value = doc.output("bloburi", {
    filename: filename + ".pdf",
  });
}

function atLine(lineNo) {
  return 26 + 3.5 * lineNo;
}
</script>
