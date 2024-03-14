<template>
  <q-page>
    <div class="print-area q-pa-none q-ma-none" v-if="$q.platform.is.desktop">
      <q-pdfviewer v-if="src != null" type="html5" :src="src" />
    </div>
    <div v-else="$q.platform.is.mobile">請在新視窗開啟PDF</div>
  </q-page>
</template>

<script setup>
import jspdf from 'jspdf'
import { ref, computed, watch } from 'vue';
import { font } from "/src/assets/NotoSansTC-Regular-normal.js"
import { openURL, date, useQuasar } from 'quasar'
import { useEventProvider } from 'src/providers/event.js'
import logoImage from '../../assets/cciyc_logo.png'

const props = defineProps({
  c_act_code: {
    type: String,
    default: '',
    required: true,
  },
  reportType: {
    type: String,
    default: '計劃',
    required: true,
  }
})

const $q = useQuasar()
const reportType = ref(props.reportType == 'planning' ? '計劃' : '檢討')
const c_act_code = ref(props.c_act_code)

const src = ref(null)
const { result: eventResult } = useEventProvider({ c_act_code: c_act_code, loadSession: ref(false), loadEvaluation: ref(true) })
const EventData = computed(() => eventResult.value ? eventResult.value.HTX_Event_by_pk : {})

watch(() => ([EventData.value, reportType.value]), ([newVal, newReportType], [oldVal, oldReportType]) => generatePDF(newVal, newReportType))

function atLine(lineNo) { return 15 + 7 * lineNo }

function generatePDF(event, type) {
  var doc = new jspdf({
    orientation: 'p',
    unit: 'mm',
    format: [297, 210],
  });
  doc.addFileToVFS("NotoSansTC-Regular.ttf", font)
  doc.addFont("NotoSansTC-Regular.ttf", 'NotoSans', 'normal')
  doc.setFont("NotoSans")

  //drawContent(doc, props.eventData.HTX_Event_by_pk, attendanceRecord.value, props.reportMonth)
  drawContent(doc, event, type)

  doc.setProperties({
    title: c_act_code.value + '活動' + type + '表.pdf',
    filename: c_act_code.value + '活動' + type + '表.pdf',
    subject: c_act_code.value + '活動' + type + '表.pdf',
    keywords: '活動' + type + '表, ' + c_act_code.value,
    creator: "CCIYC",
    author: "CCIYC",
  })

  $q.platform.is.mobile ?
    openURL(doc.output('bloburi', { filename: c_act_code.value + '活動' + type + '表.pdf' })) :
    src.value = doc.output("datauristring", { filename: c_act_code.value + '活動' + type + '表.pdf' })
}

// PDF generation functions
async function drawContent(doc, event, type) {
  const EvalData = event.Event_to_Evaluation && event.Event_to_Evaluation.length > 0 ? event.Event_to_Evaluation[0] : {}
  const AccountData = event.Event_to_Evaluation && event.Event_to_Evaluation.length > 0 && event.Event_to_Evaluation[0].Evaluation_to_Account ? event.Event_to_Evaluation[0].Evaluation_to_Account : []

  // title and logo
  doc.addImage(logoImage, 'PNG', 60, 2, 13, 12)
  doc.setFontSize(14)
  doc.text("長洲鄉事委員會青年綜合服務中心", 110, 5, "center")
  doc.text('活動' + type + '表', 110, 12, "center")
  doc.setFontSize(12)

  // first line
  let lineNo = 1
  doc.text("活動名稱：", 5, atLine(lineNo), "left")
  if (event.c_act_code || event.c_act_name) doc.text(event.c_act_name.trim() + "（" + event.c_act_code.trim() + "）", 27, atLine(lineNo), { align: 'left', maxWidth: 100 })
  doc.line(27, atLine(lineNo) + 1, 120, atLine(lineNo) + 1)
  doc.text("性質：", 130, atLine(1), "left")
  if (event.c_nature) doc.text(event.c_nature.trim(), 145, atLine(1), "left")
  doc.line(145, atLine(lineNo) + 1, 200, atLine(lineNo) + 1)

  // second line
  lineNo++
  doc.text("類別：", 5, atLine(lineNo), "left")
  if (event.c_type) doc.text(event.c_type, 20, atLine(lineNo), "left")
  doc.line(20, atLine(lineNo) + 1, 45, atLine(2) + 1)
  doc.text("大類：", 50, atLine(lineNo), "left")
  if (event.c_group1) doc.text(event.c_group1, 65, atLine(lineNo), "left")
  doc.line(65, atLine(lineNo) + 1, 105, atLine(2) + 1)
  doc.text("細類：", 110, atLine(lineNo), "left")
  if (event.c_group2) doc.text(event.c_group2, 125, atLine(lineNo), "left")
  doc.line(125, atLine(lineNo) + 1, 200, atLine(lineNo) + 1)

  // seperator line
  // doc.setLineDash([10, 2], 0);
  // doc.line(5, atLine(lineNo)+4, 200, atLine(lineNo)+4)

  // third line
  lineNo++
  doc.text("舉辦日期：", 5, atLine(lineNo), "left")
  let s_planDateTime = EvalData.plan_start_date ? "計劃： " + EvalData.plan_start_date + " 至 " + EvalData.plan_end_date + " " + EvalData.plan_start_time + " - " + EvalData.plan_end_time : ''
  let s_evalDateTime = EvalData.eval_start_date ? "檢討： " + EvalData.eval_start_date + " 至 " + EvalData.eval_end_date + " " + EvalData.eval_start_time + " - " + EvalData.eval_end_time : ''
  doc.text(s_planDateTime, 30, atLine(lineNo), "left")
  doc.line(30, atLine(lineNo) + 1, 200, atLine(lineNo) + 1)

  // forth line - 檢討
  if (s_evalDateTime.length > 0) {
    lineNo++
    doc.text(s_evalDateTime, 30, atLine(lineNo), "left")
    doc.line(30, atLine(lineNo) + 1, 200, atLine(lineNo) + 1)
  }

  // fifth line - 地點及對象
  lineNo++
  doc.text("地點：", 5, atLine(lineNo), "left")
  if (event.c_dest) doc.text(event.c_dest, 20, atLine(lineNo), "left")
  doc.line(20, atLine(lineNo) + 1, 95, atLine(lineNo) + 1)
  doc.text("對象：", 100, atLine(lineNo), "left")
  if (event.c_whojoin) doc.text(event.c_whojoin, 115, atLine(lineNo), "left")
  doc.line(115, atLine(lineNo) + 1, 200, atLine(lineNo) + 1)

  // sixth line - 工作目的
  lineNo++
  doc.text("工作目的：", 5, atLine(lineNo), "left")
  let noOfLines = 0
  if (EvalData.objective) {
    doc.text(EvalData.objective, 30, atLine(lineNo), { align: "left", maxWidth: 170, lineHeightFactor: 1.65 })
    noOfLines = EvalData.objective ? Math.ceil(EvalData.objective.trim().length / 50) : 0
    for (let i = 0; i < noOfLines; i++) {
      doc.line(30, atLine(lineNo) + 1, 200, atLine(lineNo) + 1)
      lineNo++
    }
  } else {
    doc.line(30, atLine(lineNo) + 1, 200, atLine(lineNo) + 1)
    lineNo++
  }

  // seventh line - 工作內容
  doc.text("工作內容：", 5, atLine(lineNo), "left")
  noOfLines = 0
  if (EvalData.objective_detail) {
    doc.text(EvalData.objective_detail, 30, atLine(lineNo), { align: "left", maxWidth: 170, lineHeightFactor: 1.65 })
    noOfLines = EvalData.objective_detail ? Math.ceil(EvalData.objective_detail.trim().length / 50) : 0
    for (let i = 0; i < noOfLines; i++) {
      doc.line(30, atLine(lineNo) + 1, 200, atLine(lineNo) + 1)
      lineNo++
    }
  } else {
    doc.line(30, atLine(lineNo) + 1, 200, atLine(lineNo) + 1)
    lineNo++
  }

  // eighth line - 合辦
  doc.text("合辦：", 5, atLine(lineNo), "left")
  if (event.partner_agency) doc.text(event.partner_agency, 20, atLine(lineNo), "left")
  doc.line(20, atLine(lineNo) + 1, 95, atLine(lineNo) + 1)
  doc.text("合辦聯絡人：", 100, atLine(lineNo), "left")
  if (event.partner_name) doc.text(event.partner_name + event.partner_phone ? "（" + event.partner_phone + "）" : '', 130, atLine(lineNo), "left")
  doc.line(130, atLine(lineNo) + 1, 200, atLine(lineNo) + 1)

  // nineth line - 導師
  lineNo++
  doc.text("導師：", 5, atLine(lineNo), "left")
  if (event.tutor_name) doc.text(event.tutor_name, 20, atLine(lineNo), "left")
  doc.line(20, atLine(lineNo) + 1, 65, atLine(lineNo) + 1)
  doc.text("導師電話：", 70, atLine(lineNo), "left")
  if (event.tutor_phone) doc.text(event.tutor_phone, 95, atLine(lineNo), "left")
  doc.line(95, atLine(lineNo) + 1, 125, atLine(lineNo) + 1)
  doc.text("協助義工：", 130, atLine(lineNo), "left")
  if (EvalData.eval_volunteer_count) doc.text(EvalData.eval_volunteer_count, 155, atLine(lineNo), "left")
  doc.line(155, atLine(lineNo) + 1, 200, atLine(lineNo) + 1)

  // tenth line - 青年節數
  lineNo++
  doc.text("青年節數：", 5, atLine(lineNo), "left")
  let youthSession = ''
  youthSession += EvalData.plan_attend_session_youth ? "計劃： " + EvalData.plan_attend_session_youth : ''
  youthSession += EvalData.eval_attend_session_youth ? "/ 檢討： " + EvalData.eval_attend_session_youth : ''
  if (youthSession.length > 0) doc.text(youthSession, 30, atLine(lineNo), "left")
  doc.line(30, atLine(lineNo) + 1, 95, atLine(lineNo) + 1)
  let youthHeadcount = ''
  youthHeadcount += EvalData.plan_attend_headcount_youth ? "計劃： " + EvalData.plan_attend_headcount_youth : ''
  youthHeadcount += EvalData.eval_attend_headcount_youth ? "/ 檢討： " + EvalData.eval_attend_headcount_youth : ''
  doc.text("青年人次：", 100, atLine(lineNo), "left")
  if (youthHeadcount.length > 0) doc.text(youthHeadcount, 125, atLine(lineNo), "left")
  doc.line(125, atLine(lineNo) + 1, 200, atLine(lineNo) + 1)

  // eleventh line - 財務狀況
  lineNo++
  doc.text("財務狀況 - 收入：", 5, atLine(lineNo), "left")
  doc.text("財務狀況 - 支出：", 110, atLine(lineNo), "left")

  // twelveth line - table
  lineNo++
  // Table columns
  const columns = (reportType.value == '計劃') ? [
    {
      title: "項目",
      columnWidth: 80,
    },
    {
      title: "計劃",
      columnWidth: 10,
    },
  ] :
    [
      {
        title: "項目",
        columnWidth: 70,
      },
      {
        title: "計劃",
        columnWidth: 15,
      },
      {
        title: "檢討",
        columnWidth: 15,
      },
    ];

  // Table data
  const incomeData = (reportType.value == '計劃') ?
    // 計劃 only
    AccountData.filter(item => item.type.trim() == '收入').map(item => [item.description.trim(), parseFloat(item.amount)]) :
    // 計劃 and 檢討
    AccountData.filter(item => item.type.trim() == '收入').map(item => [item.description.trim(), item.planeval.trim() == '計劃' ? parseFloat(item.amount) : '0', item.planeval.trim() == '檢討' ? parseFloat(item.amount) : '0'])

  const expenseData = (reportType.value == '計劃') ?
    // 計劃 only
    AccountData.filter(item => item.type.trim() == '支出').map(item => [item.description.trim(), parseFloat(item.amount)]) :
    // 計劃 and 檢討
    AccountData.filter(item => item.type.trim() == '支出').map(item => [item.description.trim(), item.planeval.trim() == '計劃' ? parseFloat(item.amount) : '0', item.planeval.trim() == '檢討' ? parseFloat(item.amount) : '0'])

  // draw table
  let incomeTableRows, expenseTableRows = 0
  incomeTableRows = drawTable(doc, columns, incomeData, 5, lineNo) - lineNo
  expenseTableRows = drawTable(doc, columns, expenseData, 110, lineNo) - lineNo
  //console.log(incomeTableRows, expenseTableRows)
  lineNo += Math.max(incomeTableRows, expenseTableRows)

  // thirteenth line - 備註
  lineNo++
  doc.setFontSize(12)
  doc.text("備註：", 5, atLine(lineNo), "left")
  if (EvalData.remark) doc.text(EvalData.remark, 20, atLine(lineNo), "left")
  doc.line(20, atLine(lineNo) + 1, 200, atLine(lineNo) + 1)

  // footer - 簽署
  lineNo += 2
  doc.text("簽署：", 5, atLine(lineNo), "left")
  lineNo++
  doc.text("負責職員簽署：", 5, atLine(lineNo), "left")
  doc.text("中心主任審閱：", 110, atLine(lineNo), "left")
  if (event.c_respon) doc.text("（" + event.c_respon.trim() + "）", 70, atLine(lineNo), "left")
  if (EvalData.ic) doc.text("（" + EvalData.ic.trim() + "）", 180, atLine(lineNo), "left")
  doc.line(35, atLine(lineNo) + 1, 70, atLine(lineNo) + 1)
  doc.line(145, atLine(lineNo) + 1, 180, atLine(lineNo) + 1)

  // footer - 日期
  lineNo++
  doc.text("日期：", 5, atLine(lineNo), "left")
  doc.text("日期：", 110, atLine(lineNo), "left")
  doc.line(20, atLine(lineNo) + 1, 70, atLine(lineNo) + 1)
  doc.line(130, atLine(lineNo) + 1, 180, atLine(lineNo) + 1)
}

function drawTable(doc, columns, data, initTablePosition, tableStartLine) {
  // Draw table headers
  if (data.length > 0) {
    doc.setFontSize(9)
    let curTablePosition = initTablePosition
    columns.forEach((header, index) => {
      doc.text(header.title, curTablePosition, atLine(tableStartLine), { align: index == 0 ? 'left' : 'right' });
      curTablePosition += header.columnWidth;
    });
    tableStartLine++

    // Draw table rows
    data.forEach(row => {
      curTablePosition = initTablePosition
      row.forEach((cell, index) => {
        //console.log(cell, curTablePosition, atLine(lineNo), 'align: ' + (index%2 == 0? 'left': 'right'))
        if (index == 0) {
          doc.text(cell, curTablePosition, atLine(tableStartLine), { align: index == 0 ? 'left' : 'right' });
        } else {
          doc.text('HK$' + parseFloat(cell).toFixed(1), curTablePosition, atLine(tableStartLine), "right");
        }
        curTablePosition += columns[index].columnWidth;
      });
      tableStartLine++ // Move to the next row
    });

    // draw total row
    curTablePosition = initTablePosition
    doc.line(initTablePosition, atLine(tableStartLine) + 1, initTablePosition + columns.reduce((a, v) => a + parseInt(v.columnWidth), 0) - 10, atLine(tableStartLine) + 1)
    doc.text("合計", curTablePosition, atLine(tableStartLine), "left")
    curTablePosition += columns[0].columnWidth
    let total = data.reduce((a, b) => a + (b[1] ? b[1] : 0), 0)
    doc.text('HK$' + parseFloat(total).toFixed(1), curTablePosition, atLine(tableStartLine), "right")
    curTablePosition += columns[1].columnWidth
    if (columns.length > 2) {
      total = data.reduce((a, b) => a + (b[2] ? b[2] : 0), 0)
      doc.text('HK$' + parseFloat(total).toFixed(1), curTablePosition, atLine(tableStartLine), "right")
    }
  }
  return tableStartLine + 1
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
