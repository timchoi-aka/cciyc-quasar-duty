<template class="row items-scretch q-pa-none q-ma-none">
  <!-- loading dialog -->
  <q-dialog :model-value="waitingAsync" position="top">
    <LoadingDialog message="處理中"/>
  </q-dialog>
  
  <!-- <q-btn icon="print" flat class="bg-primary text-white col-shrink" v-print="printObj" label="列印"/> -->
  <!--<div id="printAttendance" class="print-area q-mx-md">-->
  <div class="print-area q-pa-none q-ma-none" v-if="!eventLoading && !applicantsLoading">
    <q-pdfviewer
      v-if="src != null"
      type="html5"
      class="scretch"
      ref="printbox"
      :src="src"
      style="height: 100%; min-height: 100%;"
    />
  </div>
  <!--</div>-->

  <!--
  <div id="printAttendance" class="print-area q-mx-md">
    <div class="row justify-center" style="border-bottom: 2px solid">
      <div class="row col-12 justify-center highlight_3 text-weight-bold">長洲鄉事委員會青年綜合服務中心 - 活動點名表</div>
      <div class="row col-12 q-my-sm">
        <div class="col-3 normal">活動編號：<span style="border-bottom: 1px solid">{{ Event.c_act_code }}</span></div>
        <div class="col-3 normal">活動名稱：<span style="border-bottom: 1px solid">{{ Event.c_act_name }}</span></div>
        <div class="col-3 normal">性質：<span style="border-bottom: 1px solid">{{ Event.c_nature }}</span></div>
        <div class="col-3 normal">負責同事：<span style="border-bottom: 1px solid">{{ Event.c_respon }}</span></div>
      </div>
      <div class="row col-12 q-my-sm">
        <div class="col-3 normal">開始日期：<span style="border-bottom: 1px solid">{{ Event.d_date_from }}</span></div>
        <div class="col-3 normal">結束日期：<span style="border-bottom: 1px solid">{{ Event.d_date_to }}</span></div>
        <div class="col-3 normal">開始時間：<span style="border-bottom: 1px solid">{{ qdate.formatDate(qdate.extractDate(Event.d_time_from, "h:mm:ss A"), "h:mm A") }}</span></div>
        <div class="col-3 normal">結束時間：<span style="border-bottom: 1px solid">{{ qdate.formatDate(qdate.extractDate(Event.d_time_to, "h:mm:ss A"), "h:mm A") }}</span></div>
      </div>
      <div class="row col-12 q-my-sm">
        <div class="col-6 normal">地點：<span style="border-bottom: 1px solid">{{ Event.c_dest }}</span></div>
        <div class="col-2 normal">逢星期：<span style="border-bottom: 1px solid">{{ Event.c_week }}</span></div>
        <div class="col-2 normal">堂數：<span style="border-bottom: 1px solid">{{ Event.i_lessons }}</span></div>
        <div class="col-2 normal">參加人數：<span style="border-bottom: 1px solid">{{ Applicants.length }}</span></div>
      </div>
    </div>
    -->

    <!-- table header -->
    <!--
    <div class="row col-12 q-mt-sm">
      <div style="border: 1px solid;" class="col-1 text-center normal">編號</div>
      <div style="border: 1px solid;" class="col-2 text-center normal">姓名</div>
      <div style="border: 1px solid;" class="col-1 text-center normal">年齡</div>
      <div style="border: 1px solid;" class="col-6 text-center row">
        <div style="border-bottom: 1px solid;" class="col-12 text-center normal">日期</div>
        <div class="row col-12 text-center justify-center">
          <div class="col-grow normal" style="border: 1px solid; line-height: 200%;" v-for="n in numberOfSlots">&nbsp;</div>
        </div>
      </div>
      <div style="border: 1px solid;" class="col-2 text-center normal">備註</div>
    </div>
    -->

    <!-- table body -->
    <!--
    <div class="row col-12 q-mt-none" v-for="(member, index) in Applicants" :key="index">
      <div style="border: 1px solid;" class="col-1 text-center normal">{{ index+1 }}</div>
      <div style="border: 1px solid;" class="col-2 text-center normal">{{ member.c_name }} ({{ member.c_mem_id }})</div>
      <div style="border: 1px solid;" class="col-1 text-center normal">{{ member.i_age }}</div>
      <div style="border: 1px solid;" class="col-6 text-center row">
        <div class="col-grow" style="border-right: 1px solid;" v-for="n in numberOfSlots">&nbsp;</div>
      </div>
      <div style="border: 1px solid;" class="col-2 text-center">&nbsp;</div>
    </div>
    -->

    <!-- table footer -->
    <!--
    <div class="row col-12 q-mt-none">
      <div style="border: 1px solid;" class="col-4 text-center normal">出席人數：</div>
      <div style="border: 1px solid;" class="col-6 text-center row">
        <div class="col-grow" style="border-right: 1px solid;" v-for="n in numberOfSlots">&nbsp;</div>
      </div>
      <div style="border: 1px solid;" class="col-2 text-center normal">&nbsp;</div>
    </div>
    <div class="row col-12 q-mt-none">
      <div style="border: 1px solid;" class="col-4 text-center normal">活動節數：</div>
      <div style="border: 1px solid;" class="col-6 text-center row">
        <div class="col-grow" style="border-right: 1px solid;" v-for="n in numberOfSlots">&nbsp;</div>
      </div>
      <div style="border: 1px solid;" class="col-2 text-center normal">&nbsp;</div>
    </div>
    <div class="row col-12 q-mt-none">
      <div style="border: 1px solid;" class="col-4 text-center normal">15-24歲青年人數：</div>
      <div style="border: 1px solid;" class="col-6 text-center row">
        <div class="col-grow" style="border-right: 1px solid;" v-for="n in numberOfSlots">&nbsp;</div>
      </div>
      <div style="border: 1px solid;" class="col-2 text-center normal">&nbsp;</div>
    </div>
  </div> 
  -->
</template>

<script setup>
import { computed, ref } from "vue";
import { EVENT_BY_PK, APPLICANTS_BY_ACT_CODE } from "/src/graphQueries/Event/query.js"
import { useQuery } from "@vue/apollo-composable"
import { date as qdate } from "quasar";
import LoadingDialog from "components/LoadingDialog.vue"
import jspdf from 'jspdf'
import { font } from "/src/assets/NotoSansTC-Regular-normal.js"
const src = ref(null)
const printbox = ref(null)

// props
const props = defineProps({
  EventID: String, 
})

// variables

const waitingAsync = computed(() => eventLoading.value || applicantsLoading.value)
const numberOfApplicantSlots = ref(12)
const numberOfDateSlots = ref(15)

// queries
const { onResult: EventData, loading: eventLoading} = useQuery(
  EVENT_BY_PK,
  () => ({
    c_act_code: props.EventID
  }));

const { onResult: ApplicantData, loading: applicantsLoading } = useQuery(
  APPLICANTS_BY_ACT_CODE,
  () => ({
    c_act_code: props.EventID
  }), {
    pollInterval: 5000,
  });

// computed
const Event = ref([])
const Applicants = ref([])

ApplicantData((result) => {
  if (result.data) Applicants.value = result.data.tbl_act_reg
  generatePDF()
})

EventData((result) => {
  if (result.data) Event.value = result.data.HTX_Event_by_pk
})

function drawHeader(doc) {
  doc.setFontSize(18)
  doc.text("長洲鄉事委員會青年綜合服務中心 - 活動點名表", 140, 10, "center")
  doc.setFontSize(12)

  // first line
  doc.text("活動編號：", 10, 20, "left")
  doc.text(Event.value.c_act_code, 32, 20, "left")
  doc.line(32, 22, 55, 22)
  doc.text("活動名稱：", 60, 20, "left")
  doc.text(Event.value.c_act_name, 82, 20, "left", {maxWidth: 95})
  doc.line(82, 22, 190, 22)
  doc.text("性質：", 195, 20, "left")
  doc.text(Event.value.c_nature, 210, 20, "left")
  doc.line(210, 22, 245, 22)
  doc.text("負責同事：", 250, 20, "left")
  doc.text(Event.value.c_respon, 272, 20, "left")
  doc.line(272, 22, 285, 22)

  // second line
  doc.text("開始日期：", 10, 30, "left")
  doc.text(Event.value.d_date_from, 32, 30, "left")
  doc.line(32, 32, 75, 32)
  doc.text("結束日期：", 80, 30, "left")
  doc.text(Event.value.d_date_to, 102, 30, "left")
  doc.line(102, 32, 145, 32)
  doc.text("開始時間：", 150, 30, "left")
  doc.text(qdate.formatDate(qdate.extractDate(Event.value.d_time_from, "h:mm:ss A"), "h:mm A"), 172, 30, "left")
  doc.line(172, 32, 215, 32)
  doc.text("結束時間：", 220, 30, "left")
  doc.text(qdate.formatDate(qdate.extractDate(Event.value.d_time_to, "h:mm:ss A"), "h:mm A"), 242, 30, "left")
  doc.line(242, 32, 285, 32)

  // third line
  doc.text("地點：", 10, 40, "left")
  if (Event.value && Event.value.c_dest) doc.text(Event.value.c_dest, 32, 40, "left")
  doc.line(32, 42, 145, 42)
  doc.text("逢星期：", 150, 40, "left")
  if (Event.value && Event.value.c_week) doc.text(Event.value.c_week, 168, 40, "left")
  doc.line(168, 42, 175, 42)
  doc.text("堂數：", 185, 40, "left")
  if (Event.value && Event.value.i_lessons) doc.text(Event.value.i_lessons.toString(), 200, 40, "left")
  doc.line(200, 42, 210, 42)
  doc.text("參加人數：", 220, 40, "left")
  doc.text(Applicants.value.length.toString(), 250, 40, "left")
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
  for (let i = 1; i <= numberOfDateSlots.value; i++) {
    doc.line(100+(236-100)/numberOfDateSlots.value*i, 55, 100+(236-100)/numberOfDateSlots.value*i, 204)
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

function generatePDF() {
  var doc = new jspdf({
    orientation: 'l',
    unit: 'mm',
    format: [297, 210],
    //format: "a4",
    //putOnlyUsedFonts:true
  });
  doc.addFileToVFS("NotoSansTC-Regular.ttf", font)
  doc.addFont("NotoSansTC-Regular.ttf", 'NotoSans', 'normal')
  doc.setFont("NotoSans")
 
  // determine number of pages
  for (let page = 0; page <= Applicants.value.length/numberOfApplicantSlots.value; page++) {
    if (page > 0) {
      doc.addPage()
    }
    drawHeader(doc)
    
    // draw applicant entry lines
    for (let i = 1; i <= numberOfApplicantSlots.value; i++) {
      let endOfLine = 62+(180-62)/numberOfApplicantSlots.value*i
      doc.line(10, endOfLine, 285, endOfLine)
    }

    // print applicants names
    for (let i = 1; i <= Math.min(Applicants.value.length-page*numberOfApplicantSlots.value, numberOfApplicantSlots.value); i++) {
      let endOfLine = 62+(180-62)/numberOfApplicantSlots.value*i
      let lineHeight = (180-62)/numberOfApplicantSlots.value
      doc.text((page*numberOfApplicantSlots.value + i).toString(), 18, endOfLine - lineHeight/2.5 , "left")
      doc.text(Applicants.value[page*numberOfApplicantSlots.value+i-1].c_name + "(" + Applicants.value[page*numberOfApplicantSlots.value+i-1].c_mem_id + ")", 43, endOfLine - lineHeight/2.5, "left")
      doc.text(Applicants.value[page*numberOfApplicantSlots.value+i-1].i_age.toString(), 88, endOfLine - lineHeight/2.5, "left")
    }

    drawFooter(doc)
  }
  
  doc.setProperties({ 
    title: Event.value.c_act_code + '點名表.pdf',
    filename: Event.value.c_act_code + '點名表.pdf',
  })
  
  src.value = doc.output("datauristring", {filename: Event.value.c_act_code + '點名表.pdf'})
}

</script>

<script>
import print from "vue3-print-nb";

export default {
  name: "PrintAttendance",
  directives: {
    print,
  },
}
</script>

<style lang="scss" scoped>
@media screen {
  .print-area {
    size: landscape;
    width: 29.7cm;
    height: 21cm;
    margin: 3mm; 
    overflow: hidden; 
    border: 1px solid;
  }
  .highlight_3 {
    font-size: 1.4rem;
  }

  .normal {
    font-size: 0.8rem;
  }
}

@media print {
  @page {
    size: landscape !important;
    width: 29.7cm;
    /* height: 21cm; */
    margin: 3mm;
    overflow: hidden;
    scale: 100%;
  }
  .print-area { 
    border: none;
  }

  .highlight_3 {
    font-size: 0.7rem;
  }
  .normal {
    font-size: 0.4rem;
  }
}
</style>