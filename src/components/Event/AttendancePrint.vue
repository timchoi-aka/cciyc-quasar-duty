<template class="row items-scretch q-pa-none q-ma-none">
  <!-- loading dialog -->
  <q-dialog :model-value="waitingAsync" position="bottom">
    <LoadingDialog message="處理中"/>
  </q-dialog>

  <!-- JSPDF module -->
  <div class="print-area q-pa-none q-ma-none" v-if="!waitingAsync && $q.platform.is.desktop">
    <q-pdfviewer
      v-if="src != null "
      type="html5"
      :src="src"
    />
  </div>
  <div v-if="$q.platform.is.mobile">請在新視窗開啟PDF</div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { EVENT_BY_PK, APPLICANTS_BY_ACT_CODE } from "/src/graphQueries/Event/query.js"
import { useQuery } from "@vue/apollo-composable"
import { date as qdate, useQuasar } from "quasar";
import LoadingDialog from "components/LoadingDialog.vue"
import jspdf from 'jspdf'
import { font } from "/src/assets/NotoSansTC-Regular-normal.js"
import { useRoute } from 'vue-router'
import { openURL, is } from 'quasar'

const route = useRoute()
const c_act_code = route.params.id
const $q = useQuasar()

// queries
const { onResult: EventData, loading: eventLoading} = useQuery(
  EVENT_BY_PK,
  () => ({
    c_act_code: c_act_code
  }));

const { onResult: ApplicantData, loading: applicantsLoading } = useQuery(
  APPLICANTS_BY_ACT_CODE,
  () => ({
    c_act_code: c_act_code
  }), {
    pollInterval: 5000,
  });

// variables
const waitingAsync = computed(() => eventLoading.value || applicantsLoading.value)
const numberOfApplicantSlots = ref(12)
const numberOfDateSlots = ref(15)
const Event = ref([])
const Applicants = ref([])
const src = ref(null)

// watcher
watch([Applicants, Event], ([newApp, newEvent], [oldApp, oldEvent]) => {
  if (newApp.length > 0 && is.object(newEvent))
  generatePDF(newApp, newEvent, numberOfApplicantSlots.value, numberOfDateSlots.value)
})

// callbacks
ApplicantData((result) => {
  if (result.data) Applicants.value = result.data.tbl_act_reg
})

EventData((result) => {
  if (result.data) Event.value = result.data.HTX_Event_by_pk
})

// PDF generation functions
function drawHeader(doc, applicants, event, dateSlots) {
  doc.setFontSize(18)
  doc.text("長洲鄉事委員會青年綜合服務中心 - 活動點名表", 140, 10, "center")
  doc.setFontSize(12)

  // first line
  doc.text("活動編號：", 10, 20, "left")
  if (event.c_act_code) doc.text(event.c_act_code, 32, 20, "left")
  doc.line(32, 22, 55, 22)
  doc.text("活動名稱：", 60, 20, "left")
  if (event.c_act_name) doc.text(event.c_act_name, 82, 20, {align: "left", maxWidth: 95})
  doc.line(82, 22, 190, 22)
  doc.text("性質：", 195, 20, "left")
  if (event.c_nature) doc.text(event.c_nature, 210, 20, "left")
  doc.line(210, 22, 245, 22)
  doc.text("負責同事：", 250, 20, "left")
  if (event.c_respon) doc.text(event.c_respon, 272, 20, "left")
  doc.line(272, 22, 285, 22)

  // second line
  doc.text("開始日期：", 10, 30, "left")
  if (event.d_date_from) doc.text(event.d_date_from, 32, 30, "left")
  doc.line(32, 32, 75, 32)
  doc.text("結束日期：", 80, 30, "left")
  if (event.d_date_to) doc.text(event.d_date_to, 102, 30, "left")
  doc.line(102, 32, 145, 32)
  doc.text("開始時間：", 150, 30, "left")
  if (event.d_time_from) doc.text(qdate.formatDate(qdate.extractDate(event.d_time_from, "h:mm:ss A"), "h:mm A"), 172, 30, "left")
  doc.line(172, 32, 215, 32)
  doc.text("結束時間：", 220, 30, "left")
  if (event.d_time_to) doc.text(qdate.formatDate(qdate.extractDate(event.d_time_to, "h:mm:ss A"), "h:mm A"), 242, 30, "left")
  doc.line(242, 32, 285, 32)

  // third line
  doc.text("地點：", 10, 40, "left")
  if (event && event.c_dest) doc.text(event.c_dest, 32, 40, "left")
  doc.line(32, 42, 145, 42)
  doc.text("逢星期：", 150, 40, "left")
  if (event && event.c_week) doc.text(event.c_week, 168, 40, "left")
  doc.line(168, 42, 175, 42)
  doc.text("堂數：", 185, 40, "left")
  if (event && event.i_lessons) doc.text(event.i_lessons.toString(), 200, 40, "left")
  doc.line(200, 42, 210, 42)
  doc.text("參加人數：", 220, 40, "left")
  if (applicants) doc.text(applicants.length.toString(), 250, 40, "left")
  doc.line(242, 42, 285, 42)

  // draw table lines
  // header horizontal line
  doc.line(10, 50, 285, 50)
  doc.line(100, 55, 236, 55)
  doc.line(10, 62, 285, 62)
  // header vertical lines
  doc.line(10, 50, 10, 204)
  doc.line(30, 50, 30, 180)
  doc.line(80, 50, 80, 180)
  doc.line(100, 50, 100, 204)
  doc.line(236, 50, 236, 204)
  doc.line(285, 50, 285, 204)
  for (let i = 1; i <= dateSlots; i++) {
    doc.line(100+(236-100)/dateSlots*i, 55, 100+(236-100)/dateSlots*i, 204)
  }

  // header text
  doc.text("編號", 15, 55, "left")
  doc.text("姓名", 50, 55, "left")
  doc.text("年齡", 85, 55, "left")
  doc.text("日期", 160, 54, "left")
  doc.text("備註", 255, 55, "left")
}

function drawFooter(doc) {
  // footer words
  doc.text("出席人數：", 40, 186, "left")
  doc.text("活動節數：", 40, 194, "left")
  doc.text("15-24歲青年人數：", 35, 202, "left")

  // footer lines
  doc.line(10, 188, 285, 188)
  doc.line(10, 196, 285, 196)
  doc.line(10, 204, 285, 204)
}

async function generatePDF(applicants, event, appSlots, dateSlots) {
  if (event.c_act_code == null) return
  var doc = new jspdf({
    orientation: 'l',
    unit: 'mm',
    format: [297, 210],
  });
  doc.addFileToVFS("NotoSansTC-Regular.ttf", font)
  doc.addFont("NotoSansTC-Regular.ttf", 'NotoSans', 'normal')
  doc.setFont("NotoSans")

  // determine number of pages
  for (let page = 0; page <= applicants.length/appSlots; page++) {
    if (page > 0) {
      doc.addPage()
    }
    drawHeader(doc, applicants, event, dateSlots)

    // draw applicant entry lines
    for (let i = 1; i <= appSlots; i++) {
      let endOfLine = 62+(180-62)/appSlots*i
      doc.line(10, endOfLine, 285, endOfLine)
    }

    // print applicants names
    for (let i = 1; i <= Math.min(applicants.length-page*appSlots, appSlots); i++) {
      let endOfLine = 62+(180-62)/appSlots*i
      let lineHeight = (180-62)/appSlots
      doc.text((page*appSlots + i).toString(), 20, endOfLine - lineHeight/2.5 , "center")
      doc.text(applicants[page*appSlots+i-1].c_name + "(" + applicants[page*appSlots+i-1].c_mem_id + ")", 55, endOfLine - lineHeight/2.5, {align: "center", maxWidth: 60})
      doc.text(applicants[page*appSlots+i-1].i_age.toString(), 90, endOfLine - lineHeight/2.5, "center")
    }

    drawFooter(doc)
  }

  doc.setProperties({
    title: event.c_act_code + '點名表.pdf',
    filename: event.c_act_code + '點名表.pdf',
    subject: event.c_act_code + '點名表',
    keywords: "點名表, " + event.c_act_code,
    creator: "CCIYC",
    author: "CCIYC",
  })

  $q.platform.is.mobile?
    openURL(doc.output('bloburi', {filename: event.c_act_code + '點名表.pdf'})):
    src.value = doc.output("datauristring", {filename: event.c_act_code + '點名表.pdf'})
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
