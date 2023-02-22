<template>
  <!-- loading dialog -->
  <q-dialog v-model="loading" position="bottom">
    <LoadingDialog message="處理中"/>
  </q-dialog>

  <!-- rowDetail modal -->
  <q-dialog v-if="$q.screen.lt.md"
    v-model="detailModal"
    persistent
    maximized
    full-width
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <Receipt :c_receipt_no="showReceiptNo"/>
  </q-dialog>

  <q-dialog v-else
    v-model="detailModal"
    persistent
    full-height
    transition-show="slide-up"
    transition-hide="slide-down"
    class="q-pa-none"
  >
    <q-card style="min-width: 70vw; width: 70vw; max-width: 70vw;">
      <Receipt :c_receipt_no="showReceiptNo"/>
    </q-card>
  </q-dialog>


  <!-- Event Detail modal -->
  <q-dialog v-if="$q.screen.lt.md"
    v-model="EventDetailModal"
    persistent
    maximized
    full-width
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <EventDetail :EventID="showEventID"/>
  </q-dialog>

  <q-dialog v-else
    v-model="EventDetailModal"
    persistent
    full-width
    full-height
    transition-show="slide-up"
    transition-hide="slide-down"
    class="q-pa-none"
  >
    <EventDetail :EventID="showEventID"/>
  </q-dialog>

  <!-- date range selector -->
  <div class="row justify-center" style="margin-top: 70px;">
    <div class="row q-mb-sm justify-center items-center">
      <div class="col-2 q-mx-md"><DateComponent v-model="reportStartDate" label="開始日期"/></div>
      <div class="col-2 q-mx-md"><DateComponent v-model="reportEndDate" label="結束日期"/></div>
      <div class="col-2 q-mx-md"><EventSelection v-model="reportEvent" /></div>
      <div class="col-2 q-mx-md"><StaffSelection v-model="reportStaff" /></div>
      <div class="col-1 q-mx-md"><q-btn icon="undo" label="重置" class="bg-primary text-white" @click="reset"/></div>
    </div>
  </div>
  
  <q-tabs v-model="activeTab" inline-label align="left" class="desktop-only bg-primary text-white">
    <q-tab name="All" icon="source" :label="'全部('+ReceiptData.length+')'" />
    <!--
    <q-tab name="Error" icon="error" :label="'錯誤('+ErrorData.length+'人)'" />
    -->
    <q-tab name="delete" icon="source" :label="'已刪除('+DeletedData.length+')'" />
    <q-tab name="accountReport" icon="source" label="會計報表" />
  </q-tabs>
  
  <q-tab-panels
    v-model="activeTab"
    animated
    swipeable
    transition-prev="jump-up"
    transition-next="jump-up"
  >
    <q-tab-panel name="All" class="q-ma-none q-pa-sm text-body1"> 
      <q-table
        dense
        flat
        title="全部收據"
        :rows="ReceiptData"
        :columns="receiptListColumns"
        :pagination="defaultPagination"
        color="primary"
        row-key="c_receipt_no"
        :loading="loading"
        binary-state-sort
        @row-click="rowDetail"
      >
       <!-- loading -->
       <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>

        <!-- status -->
        <template v-slot:body-cell-c_status="props">
          <q-td :props="props">
            <div v-if="props.row.b_refund">退款</div>
            <div v-if="props.row.b_delete">刪除</div>
          </q-td>
        </template>

        <!-- export -->
        <template v-slot:top-right>
          <q-btn
            color="primary"
            icon-right="archive"
            label="匯出Excel"
            no-caps
            @click="exportExcel(ReceiptData, receiptListColumns, '全部收據')"
          />
        </template>
      </q-table>
    </q-tab-panel>
    <!--
    <q-tab-panel name="Quit" class="q-ma-none q-pa-sm text-body1"> 
      <q-table
        dense
        flat
        title="退會會員數據"
        :rows="QuitData"
        :columns="memberListColumns"
        :pagination="defaultPagination"
        color="primary"
        row-key="c_mem_id"
        :loading="loading"
        binary-state-sort
        @row-click="rowDetail"
      >
        <template v-slot:top-right>
          <q-btn
            color="primary"
            icon-right="archive"
            label="匯出Excel"
            no-caps
            @click="exportExcel(QuitData, memberListColumns, '退會會員數據')"
          />
        </template>
      </q-table>
    </q-tab-panel>

    <q-tab-panel name="Youth" class="q-ma-none q-pa-sm text-body1"> 
      <q-table
        dense
        flat
        title="青年會員數據"
        :rows="YouthData"
        :columns="memberListColumns"
        :pagination="defaultPagination"
        color="primary"
        row-key="c_mem_id"
        :loading="loading"
        binary-state-sort
        @row-click="rowDetail"
      >
        <template v-slot:top-right>
          <q-btn
            color="primary"
            icon-right="archive"
            label="匯出Excel"
            no-caps
            @click="exportExcel(YouthData, memberListColumns, '青年會員數據_' + qdate.formatDate(reportDate, 'YYYY-MM'))"
          />
        </template>
      </q-table>
    </q-tab-panel>

    <q-tab-panel name="Family_15" class="q-ma-none q-pa-sm text-body1"> 
      <q-table
        dense
        flat
        title="家人(<15)會員數據"
        :rows="Family_15Data"
        :columns="memberListColumns"
        :pagination="defaultPagination"
        color="primary"
        row-key="c_mem_id"
        :loading="loading"
        binary-state-sort
        @row-click="rowDetail"
      >
        <template v-slot:top-right>
          <q-btn
            color="primary"
            icon-right="archive"
            label="匯出Excel"
            no-caps
            @click="exportExcel(Family_15Data, memberListColumns, '家人(14歲或以下)會員數據_' + qdate.formatDate(reportDate, 'YYYY-MM'))"
          />
        </template>
      </q-table>
    </q-tab-panel>

    <q-tab-panel name="Family_24" class="q-ma-none q-pa-sm text-body1"> 
      <q-table
        dense
        flat
        title="家人(>24)會員數據"
        :rows="Family_24Data"
        :columns="memberListColumns"
        :pagination="defaultPagination"
        color="primary"
        row-key="c_mem_id"
        :loading="loading"
        binary-state-sort
        @row-click="rowDetail"
      >
        <template v-slot:top-right>
          <q-btn
            color="primary"
            icon-right="archive"
            label="匯出Excel"
            no-caps
            @click="exportExcel(Family_24Data, memberListColumns, '家人(25歲或以上)會員數據_' + qdate.formatDate(reportDate, 'YYYY-MM'))"
          />
        </template>
      </q-table>
    </q-tab-panel>

    <q-tab-panel name="Expired" class="q-ma-none q-pa-sm text-body1"> 
      <q-table
        dense
        flat
        title="過期會員數據"
        :rows="ExpiredData"
        :columns="memberListColumns"
        :pagination="defaultPagination"
        color="primary"
        row-key="c_mem_id"
        :loading="loading"
        binary-state-sort
        @row-click="rowDetail"
      >
        <template v-slot:top-right>
          <q-btn
            color="primary"
            icon-right="archive"
            label="匯出Excel"
            no-caps
            @click="exportExcel(ExpiredData, memberListColumns, '過期會員數據_' + qdate.formatDate(reportDate, 'YYYY-MM'))"
          />
        </template>
      </q-table>
    </q-tab-panel>
    -->

    
    <q-tab-panel name="delete" class="q-ma-none q-pa-sm text-body1"> 
      <q-table
        dense
        flat
        title="刪除收據表"
        :rows="DeletedData"
        :columns="receiptListColumns"
        :pagination="defaultPagination"
        color="primary"
        row-key="c_receipt_no"
        :loading="loading"
        binary-state-sort
        @row-click="rowDetail"
      >
        <!-- loading -->
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>

        <!-- status -->
        <template v-slot:body-cell-c_status="props">
          <q-td :props="props">
            <div v-if="props.row.b_refund">退款</div>
            <div v-if="props.row.b_delete">刪除</div>
          </q-td>
        </template>

        <!-- export -->
        <template v-slot:top-right>
          <q-btn
            color="primary"
            icon-right="archive"
            label="匯出Excel"
            no-caps
            @click="exportExcel(DeletedData, receiptListColumns, '刪除收據表' + reportStartDate + '-' + reportEndDate)"
          />
        </template>

        <!-- bottom total row -->
        <template v-slot:bottom-row="props">
          <q-tr>
            <q-td
              v-for="index in props.cols.length"
              class="text-center bg-grey-2"
              style="font-size: 1vw"
            >
              {{ DeletedData.reduce((x,v) => props.cols[index-1].name == 'u_price_after_discount'? x + v[props.cols[index-1].name]: '', 0) }}
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-tab-panel>
    
    <!-- 會計報表 -->
    <!--title="會計報表(PF)"-->
    <q-tab-panel name="accountReport" class="q-ma-none q-pa-sm text-body1"> 
      <q-table
        dense
        flat
        :rows="PFData"
        :columns="accountReportColumns"
        :pagination="accountReportPagination"
        color="primary"
        :loading="loading"
        binary-state-sort
        @row-click="eventDetail"
      >
        <!-- loading -->
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>

        <!-- status -->
        <template v-slot:body-cell-c_status="props">
          <q-td :props="props">
            <div v-if="props.row.b_refund">退款</div>
            <div v-if="props.row.b_delete">刪除</div>
          </q-td>
        </template>

        <!-- export -->
        <template v-slot:top>
          <div>會計報表</div>
          <q-select class="q-mx-md" :options="['PF', 'CF', 'RF', 'MF', 'SF', '續會員費','新會員費']" v-model="typeToggle"/>
          <q-space/>
          <q-btn
            color="primary"
            icon-right="archive"
            label="匯出Excel"
            no-caps
            @click="exportExcel(PFData, accountReportColumns, '會計報表(PF)-' + reportStartDate + '-' + reportEndDate)"
          />
        </template>

        <!-- bottom total row -->
        <template v-slot:bottom-row="props">
          <q-tr>
            <q-td
              v-for="index in props.cols.length"
              class="text-center bg-grey-2"
              style="font-size: 1vw"
            >
              {{ PFData.reduce((x,v) => props.cols[index-1].name == 'total'? x + v[props.cols[index-1].name]: '', 0) }}
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup>
import { computed, ref } from "vue";
import { exportFile, date as qdate } from "quasar";
import { useQuery } from "@vue/apollo-composable"
import { gql } from "graphql-tag"
import Receipt from "components/Account/Receipt.vue";
import LoadingDialog from "components/LoadingDialog.vue"
import Excel from "src/lib/exportExcel"
import DateComponent from "src/components/Basic/DateComponent.vue";
import EventDetail from "src/components/Event/EventDetail.vue";
import EventSelection from "src/components/Event/EventSelection.vue";
import StaffSelection from "src/components/Basic/StaffSelection.vue";

// variables
// const reportDate = ref(qdate.formatDate(qdate.endOfDate(qdate.subtractFromDate(Date.now(), {month: 1}), 'month'), "YYYY/MM/DD"))
const reportStartDate = ref(qdate.formatDate(qdate.startOfDate(Date.now(), 'month'), "YYYY/MM/DD"))
const reportEndDate = ref(qdate.formatDate(qdate.endOfDate(Date.now(), 'month'), "YYYY/MM/DD"))
const reportEvent = ref()
const reportStaff = ref()
const detailModal = ref(false)
const EventDetailModal = ref(false)
const showEventID = ref("")
const showReceiptNo = ref("")
const activeTab = ref("All")
const typeToggle = ref("PF")
const staffNameMapping = {
  "胡麗嫦": "lswu",
  "何有永": "ywho",
  "陳美雲": "mwchan",
  "馮麗嫦": "lsfung",
  "黃佩珊": "pswong",
  "馬桂儀": "kyma",
  "吳學麟": "hlng",
  "李文艷": "myli",
}

const receiptTypeOptions = 
  [
    { value: 1, label: '會員' },
    { value: 2, label: '活動' },
    { value: 3, label: '食堂' } ,
    { value: 4, label: '洗衣' },
    { value: 5, label: '罰款' },
    { value: 6, label: '捐款' },
    { value: 7, label: '雜項' },
    { value: 51, label: '會員退款' },
    { value: 52, label: '活動退款' },
    { value: 53, label: '食堂退款' },
    { value: 54, label: '洗衣退款' },
    { value: 55, label: '罰款退款' },
    { value: 56, label: '捐款退款' },
    { value: 57, label: '雜項退款' }
  ]

const defaultPagination = ref({
  rowsPerPage: 30,
  sortBy: "c_receipt_no",
})

const accountReportPagination = ref({
  rowsPerPage: 30,
  sortBy: "c_act_code",
})

const receiptListColumns = ref([
  {
    name: "c_status",
    label: "狀態",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_receipt_no",
    label: "收據",
    field: "c_receipt_no",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "d_clear",
    label: "日期",
    field: "d_clear",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    sortable: true,
    format: (val) => qdate.formatDate(val, "YYYY年M月D日")
  },
  {
    name: "i_receipt_type",
    label: "種類",
    field: "i_receipt_type",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => receiptTypeOptions[receiptTypeOptions.findIndex((x) => x.value == val)].label
  },
  {
    name: "c_type",
    label: "會計類別",
    field: "c_type",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    sortable: true,
  },
  {
    name: "c_name",
    label: "付款人",
    field: "c_name",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_desc",
    label: "收費項目",
    field: "c_desc",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "u_price_after_discount",
    label: "金額(HKD)",
    field: "u_price_after_discount",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
])

const accountReportColumns = ref([
  {
    name: "c_act_code",
    label: "活動編號",
    field: "c_act_code",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_desc",
    label: "收費項目",
    field: "c_desc",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "amount",
    label: "金額(HKD)",
    field: "amount",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    sortable: true,
  },
  {
    name: "number",
    label: "數量",
    field: "number",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "total",
    label: "總金額",
    field: "total",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
])

// query - load graphql subscription on account list
const { result, loading, refetch} = useQuery(gql`
 query getAllReceipt ($condition: tbl_account_bool_exp = {c_receipt_no: {_eq: ""}}) {
  tbl_account(order_by: {c_receipt_no: desc}, where: $condition) {
    c_receipt_no
    b_OtherIncome
    b_refund
    c_act_code
    c_desc
    c_mem_id
    c_name
    c_type
    d_clear
    d_create
    i_receipt_type
    u_price_after_discount
    b_delete
    c_user_id
  }
}`, () => ({
    condition: {
      _and: [
        {d_create: {"_gte" : qdate.formatDate(qdate.startOfDate(qdate.extractDate(reportStartDate.value, "YYYY/MM/DD"), "day"), "YYYY-MM-DDTHH:mm:ss")}},
        {d_create: {"_lte" : qdate.formatDate(qdate.endOfDate(qdate.extractDate(reportEndDate.value, "YYYY/MM/DD"), "day"), "YYYY-MM-DDTHH:mm:ss")}},
        reportEvent.value? {c_act_code: {"_eq": reportEvent.value}}:{},
        reportStaff.value? {c_user_id: {"_eq": reportStaff.value in staffNameMapping? staffNameMapping[reportStaff.value]: reportStaff.value}}: {},
      ]
    }
  }));

// computed
const ReceiptData = computed(() => result.value?.tbl_account??[])
const DeletedData = computed(() => ReceiptData.value? ReceiptData.value.filter((x) => x.b_delete): [])
const PFData = computed(() => {
  let res = []
  if (ReceiptData.value) {
    ReceiptData.value.forEach((rec) => {
      if (rec.c_type == typeToggle.value && !rec.b_delete && !rec.b_refund) {
        let i = res.findIndex((element) => element.c_act_code == rec.c_act_code && element.amount == rec.u_price_after_discount)
        if (i == -1) {
          res.push({
            c_act_code: rec.c_act_code,
            c_desc: rec.c_desc,
            amount: rec.u_price_after_discount,
            number: 1,
            total: rec.u_price_after_discount
          })
        } else {
          res[i].number = res[i].number + 1
          res[i].total = res[i].total + rec.u_price_after_discount
        }
      }
    })
  }
  return res
})
/*
const QuitData = computed(() => MemberData.value? MemberData.value.filter((x) => x.d_exit_1 != null): [])
const YouthData = computed(() => MemberData.value? 
  MemberData.value.filter((x) => Report.sisFilter(reportDate, 'youth', x)
) : [])

const Family_15Data = computed(() => MemberData.value? MemberData.value.filter((x) => 
  Report.sisFilter(reportDate, 'child', x)
) : [])

const Family_24Data = computed(() => MemberData.value? MemberData.value.filter((x) => 
  Report.sisFilter(reportDate, 'family', x)
): [])

const ErrorData = computed(() => MemberData.value? MemberData.value.filter((x) => 
  (
    x.d_birth == null || 
    x.d_birth > reportDate.value || 
    x.d_enter_1 == null
  ) &&
  x.c_udf_1 != "社區義工" &&
  (
    (x.d_expired_1 == null) || 
    (x.d_expired_1 && qdate.getDateDiff(x.d_expired_1, reportDate.value) > 0)
  )
  ): [])

const ExpiredData = computed(() => MemberData.value? MemberData.value.filter((x) =>
  !x.d_exit_1 &&
  x.d_expired_1 && qdate.getDateDiff(x.d_expired_1, reportDate.value) < 0 &&
  qdate.isBetweenDates(x.d_expired_1, qdate.startOfDate(reportDate.value, 'month'), qdate.endOfDate(reportDate.value, 'month'))
): [])
*/
// functions
function exportExcel(datasource, columns, filename) {
  let content = Excel.jsonToXLS(datasource, columns)
  
  const status = exportFile(
    filename + '.xls',
    content,
    'text/xls'
  )

  if (status !== true) {
    $q.notify({
      message: '瀏覽器阻止下載檔案...',
      color: 'negative',
      icon: 'warning'
    })
  }  
}

function rowDetail(evt, row, index) {
  if (evt.target.nodeName === 'TD') {
    detailModal.value = true;
    showReceiptNo.value = row.c_receipt_no;
  }
}

function eventDetail(evt, row, index) {
  if (evt.target.nodeName === 'TD') {
    EventDetailModal.value = true;
    showEventID.value = row.c_act_code;
  }
}

function reset() {
  reportStartDate.value = qdate.formatDate(qdate.startOfDate(Date.now(), 'month'), "YYYY/MM/DD")
  reportEndDate.value = qdate.formatDate(qdate.endOfDate(Date.now(), 'month'), "YYYY/MM/DD")
  reportEvent.value = null
  reportStaff.value = null
}
</script>