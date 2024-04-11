<template>
  <div class="print-area q-pa-none q-ma-none" v-if="$q.platform.is.desktop">
    <q-pdfviewer v-if="src != null" type="html5" :src="src" />
  </div>
  <div v-if="$q.platform.is.mobile">請在新視窗開啟PDF</div>
</template>

<script setup>
import jspdf from "jspdf";
import { onMounted, ref, computed } from "vue";
import { font } from "/src/assets/NotoSansTC-Regular-normal.js";
import { openURL, date, useQuasar } from "quasar";

const $q = useQuasar();
const props = defineProps({
  eventData: {
    type: Object,
    required: true,
  },
  attendanceData: {
    type: Array,
    required: true,
  },
  attendanceOthersData: {
    type: Array,
    required: true,
  },
  reportMonth: {
    type: String,
    required: false,
  },
});
const src = ref(null);
// attendance table
const attendanceRecord = computed(() => {
  let res = [];
  if (props.attendanceData && props.attendanceData.length > 0) {
    props.attendanceData.forEach((att) => {
      // add att.d_date to res if not exist
      if (!res.find((r) => r.d_date == att.d_date)) {
        res.push({
          d_date: att.d_date,
        });
      }

      // count youth
      res.find((r) => r.d_date == att.d_date).youthCount = props.attendanceData
        .filter(
          (rec) =>
            (rec.b_is_youth || rec.b_is_youth_family) &&
            rec.d_date == att.d_date
        )
        .reduce((a, b) => a + b.i_in_center_session, 0);
    });

    // count session
    if (props.attendanceOthersData) {
      res.forEach((r) => {
        let i = props.attendanceOthersData.findIndex(
          (rec) => rec.d_date == r.d_date
        );
        r.sessionCount = props.attendanceOthersData[i].i_in_center_sessions;
      });
    }
  }

  return res;
});

const attendanceMonthlyRecord = computed(() => {
  // monthly attendance
  if (
    props.eventData.HTX_Event_by_pk &&
    props.eventData.HTX_Event_by_pk.Event_to_Session &&
    props.eventData.HTX_Event_by_pk.Event_to_Session.length > 0
  ) {
    return {
      youthCount: props.eventData.HTX_Event_by_pk.Event_to_Session.filter(
        (session) =>
          session.d_act.trim() == date.formatDate(props.reportMonth, "MM/YYYY")
      ).reduce((a, b) => a + b.i_people_count, 0),
      session: props.eventData.HTX_Event_by_pk.Event_to_Session.filter(
        (session) =>
          session.d_act.trim() == date.formatDate(props.reportMonth, "MM/YYYY")
      ).reduce((a, b) => a + b.i_number, 0),
    };
  } else return {};
  /*
    props.eventData.HTX_Event_by_pk.Event_to_Session.forEach((session) => {
      if (
        session.d_act.trim() == date.formatDate(props.reportMonth, "MM/YYYY")
      ) {
        res.push({
          d_date: session.d_act,
          youthCount: session.i_people_count,
          session: session.i_number,
        });
      }
    });
  }
  */
});

const attendanceDailyRecord = computed(() => {
  // daily attendance
  return {
    youthCount: props.attendanceOthersData.reduce(
      (a, b) => a + b.i_youth_count + b.i_youth_family_count,
      0
    ),
    session: props.attendanceOthersData.reduce(
      (a, b) => a + b.i_youth_session + b.i_youth_family_session,
      0
    ),
  };
});

onMounted(() => {
  if (!props.reportMonth) return;

  var doc = new jspdf({
    orientation: "p",
    unit: "mm",
    format: [297, 210],
  });
  doc.addFileToVFS("NotoSansTC-Regular.ttf", font);
  doc.addFont("NotoSansTC-Regular.ttf", "NotoSans", "normal");
  doc.setFont("NotoSans");

  drawContent(
    doc,
    props.eventData.HTX_Event_by_pk,
    attendanceRecord.value,
    attendanceMonthlyRecord.value,
    attendanceDailyRecord.value,
    props.reportMonth
  );

  doc.setProperties({
    title: props.eventData.HTX_Event_by_pk.c_act_code + "每月服務統計表.pdf",
    filename: props.eventData.HTX_Event_by_pk.c_act_code + "每月服務統計表.pdf",
    subject: props.eventData.HTX_Event_by_pk.c_act_code + "每月服務統計表",
    keywords: "每月服務統計表, " + props.eventData.HTX_Event_by_pk.c_act_code,
    creator: "CCIYC",
    author: "CCIYC",
  });

  $q.platform.is.mobile
    ? openURL(
        doc.output("bloburi", {
          filename:
            props.eventData.HTX_Event_by_pk.c_act_code + "每月服務統計表.pdf",
        })
      )
    : (src.value = doc.output("datauristring", {
        filename:
          props.eventData.HTX_Event_by_pk.c_act_code + "每月服務統計表.pdf",
      }));
});

// PDF generation functions
async function drawContent(
  doc,
  event,
  attendance,
  attendanceMonthly,
  attendanceDaily,
  reportMonth
) {
  //const svgUrl = require('../../assets/cciyc_logo.svg'); // Adjust the path
  //const svgResponse = await fetch(svgUrl);
  //const svgText = await svgResponse.text();
  //doc.addSvgAsImage(svgText, 50, 50, 20, 20, 'none', 'FAST', 0);

  doc.setFontSize(14);
  doc.text("長洲鄉事委員會青年綜合服務中心", 110, 5, "center");
  doc.text("每月服務統計表", 110, 12, "center");
  doc.text(date.formatDate(reportMonth, "MM/YYYY"), 110, 19, "center");
  doc.setFontSize(12);

  // first line
  doc.text("活動編號：", 5, 26, "left");
  if (event.c_act_code) doc.text(event.c_act_code, 27, 26, "left");
  doc.line(27, 28, 55, 28);
  doc.text("活動名稱：", 60, 26, "left");
  if (event.c_act_name) doc.text(event.c_act_name, 82, 26, "left");
  doc.line(82, 28, 200, 28);

  // second line
  doc.text("性質：", 5, 34, "left");
  if (event.c_nature) doc.text(event.c_nature, 27, 34, "left");
  doc.line(27, 36, 55, 36);
  doc.text("類別：", 60, 34, "left");
  if (event.c_type) doc.text(event.c_type, 82, 34, "left");
  doc.line(82, 36, 99, 36);
  doc.text("對象：", 109, 34, "left");
  if (event.c_whojoin) doc.text(event.c_whojoin, 121, 34, "left");
  doc.line(121, 36, 155, 36);
  doc.text("負責職員：", 160, 34, "left");
  if (event.c_respon) doc.text(event.c_respon, 180, 34, "left");
  doc.line(180, 36, 200, 36);

  // third line
  doc.text("日期：", 5, 42, "left");
  if (event.d_date_from)
    doc.text(
      event.d_date_from.trim() + " - " + event.d_date_to,
      27,
      42,
      "left"
    );
  doc.line(27, 44, 99, 44);
  doc.text("時間：", 109, 42, "left");
  if (event.d_time_from)
    doc.text(
      event.d_time_from.trim() + " - " + event.d_time_to,
      121,
      42,
      "left"
    );
  doc.line(121, 44, 200, 44);

  // forth line
  doc.text("地點：", 5, 50, "left");
  if (event.c_dest) doc.text(event.c_dest, 27, 50, "left");
  doc.line(27, 52, 200, 52);

  // fifth line
  let line = 59;
  doc.text("目的：", 5, line - 1, "left");
  if (
    event.Event_to_Evaluation &&
    event.Event_to_Evaluation.length > 0 &&
    event.Event_to_Evaluation[0].objective
  ) {
    doc.text(event.Event_to_Evaluation[0].objective.trim(), 27, line - 1, {
      maxWidth: 173,
    });
    let i = event.Event_to_Evaluation[0].objective.trim().length / 40;
    for (
      let i = 0;
      i < event.Event_to_Evaluation[0].objective.trim().length / 40;
      i++
    ) {
      doc.line(27, line, 200, line);
      line += 5;
    }
  } else doc.line(27, line, 200, line);

  // sixth line
  line += 6;
  doc.text("內容：", 5, line - 1, "left");
  if (
    event.Event_to_Evaluation &&
    event.Event_to_Evaluation.length > 0 &&
    event.Event_to_Evaluation[0].objective_detail
  ) {
    doc.text(
      event.Event_to_Evaluation[0].objective_detail.trim(),
      27,
      line - 1,
      { maxWidth: 173 }
    );
    let i = event.Event_to_Evaluation[0].objective_detail.trim().length / 40;
    for (
      let i = 0;
      i < event.Event_to_Evaluation[0].objective_detail.trim().length / 40;
      i++
    ) {
      doc.line(27, line, 200, line);
      line += 5;
    }
  } else doc.line(27, line, 200, line);

  // attendance table
  doc.line(30, line + 2, 170, line + 2);
  let tableLineStart = line;
  line += 6;
  // table header
  doc.text("服務日期", 55, line, "center");
  doc.text("15-24歲青年及其家屬人次", 135, line, "right");
  doc.text("活動節數", 163, line, "right");
  doc.line(30, line + 2, 170, line + 2);
  line += 6;
  for (let i = 0; i < attendance.length; i++) {
    doc.text(
      date.formatDate(attendance[i].d_date, "DD/MM/YYYY"),
      55,
      line,
      "center"
    );

    doc.text(
      attendance[i].youthCount ? attendance[i].youthCount.toString() : "0",
      110,
      line,
      "right"
    );
    doc.text(
      attendance[i].sessionCount ? attendance[i].sessionCount.toString() : "0",
      157,
      line,
      "right"
    );
    doc.line(30, line + 2, 170, line + 2);
    line += 6;
  }

  // attendance other record (per month)
  doc.text("非報名統計(每月)", 55, line, "center");
  doc.text(
    attendanceMonthly.youthCount
      ? attendanceMonthly.youthCount.toString()
      : "0",
    110,
    line,
    "right"
  );
  doc.text(
    attendanceMonthly.session ? attendanceMonthly.session.toString() : "0",
    157,
    line,
    "right"
  );
  doc.line(30, line + 2, 170, line + 2);
  line += 6;

  // attendance other record (per date)
  doc.text("非報名統計(每日)", 55, line, "center");
  doc.text(attendanceDaily.youthCount.toString(), 110, line, "right");
  doc.line(30, line + 2, 170, line + 2);
  line += 6;

  // total
  doc.text("合計", 55, line, "center");
  doc.text(
    (
      attendance.reduce((a, b) => a + (b.youthCount ? b.youthCount : 0), 0) +
      attendanceMonthly.youthCount +
      attendanceDaily.youthCount
    ).toString(),
    110,
    line,
    "right"
  );

  doc.text(
    (
      attendance.reduce(
        (a, b) => a + (b.sessionCount ? b.sessionCount : 0),
        0
      ) + attendanceMonthly.session
    ).toString(),
    157,
    line,
    "right"
  );
  doc.line(30, line + 2, 170, line + 2);
  doc.line(30, tableLineStart + 2, 30, line + 2);
  doc.line(80, tableLineStart + 2, 80, line + 2);
  doc.line(140, tableLineStart + 2, 140, line + 2);
  doc.line(170, tableLineStart + 2, 170, line + 2);
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
