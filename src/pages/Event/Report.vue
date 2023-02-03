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
    <EventDetail :EventID="showEventID"/>
  </q-dialog>

  <q-dialog v-else
    v-model="detailModal"
    persistent
    full-height
    full-width
    transition-show="slide-up"
    transition-hide="slide-down"
    class="q-pa-none"
  >
    <q-card style="min-width: 70vw; width: 70vw; max-width: 70vw;">
      <EventDetail :EventID="showEventID"/>
    </q-card>
  </q-dialog>
  
  <!-- 開放節數記錄 -->
  <q-dialog
    v-model="openingModal"
    transition-show="slide-up"
    transition-hide="slide-down"
    class="q-pa-none"
  >
    <q-card style="min-width: 50vw; width: 50vw; max-width: 50vw; height: 50vh; min-height: 50vh; max-height: 50vh;">
      <q-card-section class="bg-primary text-white row">
        <div class="text-body1">開放節數</div>
        <q-space/>
        <q-btn icon="close" flat v-close-popup/>
      </q-card-section>
      <q-card-section>
        <q-table
          dense
          flat
          :rows="dutyTable"
          :columns="dutyTableColumns"
          :pagination="defaultPagination"
          color="primary"
          row-key="date"
          separator="cell"
          hide-bottom
          virtual-scroll
          binary-state-sort
        >
          <template v-slot:body-cell-slot_a="props">
            <q-td :props="props" :class="[props.value? 'bg-green': 'bg-red']">
            </q-td>
          </template>
          <template v-slot:body-cell-slot_b="props">
            <q-td :props="props" :class="[props.value? 'bg-green': 'bg-red']">
            </q-td>
          </template>
          <template v-slot:body-cell-slot_c="props">
            <q-td :props="props" :class="[props.value? 'bg-green': 'bg-red']">
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-dialog>

  <div class="row justify-center">
    <div class="row items-center q-mx-md"><q-btn label="上月" @click="reportDate = qdate.formatDate(qdate.endOfDate(qdate.subtractFromDate(reportDate, {month: 1}), 'month'), 'YYYY/MM/DD')" class="bg-primary text-white items-center"/></div>
    <div>
      <q-input filled v-model="reportDate" mask="date" :rules="['date']">
        <template v-slot:prepend>
          截數月份：
        </template>
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="reportDate">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="關閉" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>
    
    <div class="row items-center q-mx-md"><q-btn label="下月" @click="reportDate = qdate.formatDate(qdate.endOfDate(qdate.addToDate(reportDate, {month: 1}), 'month'), 'YYYY/MM/DD')" class="bg-primary text-white items-center"/></div>
  </div>
  
  <!--<q-date v-model="reportDate" default-view="Months"/>-->
  <q-tabs v-model="activeTab" inline-label align="left" class="desktop-only bg-primary text-white">
    <q-tab name="All" icon="source" :label="'全部活動'" />
    <q-tab name="OS2" icon="pin_drop" label="OS2" />
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
        title="全部活動數據"
        :rows="EventData"
        :columns="eventListColumns"
        :pagination="defaultPagination"
        color="primary"
        row-key="c_act_code"
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
            @click="exportExcel(EventData)"
          />
        </template>
      </q-table>
    </q-tab-panel>

    <q-tab-panel name="OS2" class="q-ma-none q-pa-sm text-body1"> 
      <div>i) Total number of attendance: {{ OS2Data.reduce((x,v) => x + v.i_people_count, 0) }}</div>
      <div>ii) Total number of sessions: {{ Object.values(dutyTable).reduce((x,v) => x + (v.slot_a?1:0) + (v.slot_b?1:0) + (v.slot_c?1:0), 0) }} <q-btn class="bg-primary text-white" flat @click="openingModal = true" label="開放節數"/></div> 
      <div>iii) Average attendance per session: {{ is.number((OS2Data.reduce((x,v) => x + v.i_people_count, 0) / Object.values(dutyTable).reduce((x,v) => x + (v.slot_a?1:0) + (v.slot_b?1:0) + (v.slot_c?1:0), 0)))? (OS2Data.reduce((x,v) => x + v.i_people_count, 0) / Object.values(dutyTable).reduce((x,v) => x + (v.slot_a?1:0) + (v.slot_b?1:0) + (v.slot_c?1:0), 0)).toFixed(2): 0 }}</div>
      <q-table
        dense
        flat
        title="在中心舉行的活動"
        :rows="OS2Data"
        :columns="os2Columns"
        :pagination="defaultPagination"
        color="primary"
        row-key="c_act_code"
        :loading="loading"
        binary-state-sort
        @row-click="rowDetail"
      >
        <!-- export button -->
        <template v-slot:top-right>
          <q-btn
            color="primary"
            icon-right="archive"
            label="匯出Excel"
            no-caps
            @click="exportExcel(QuitData)"
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
              {{ OS2Data.reduce((x,v) => is.number(v[props.cols[index-1].name]) ? x + v[props.cols[index-1].name]: '', 0) }}
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-tab-panel>
    
<!--
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
            @click="exportExcel(YouthData)"
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
            @click="exportExcel(Family_15Data)"
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
            @click="exportExcel(Family_24Data)"
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
            @click="exportExcel(ExpiredData)"
          />
        </template>
      </q-table>
    </q-tab-panel>

    <q-tab-panel name="Error" class="q-ma-none q-pa-sm text-body1"> 
      <q-table
        dense
        flat
        title="錯誤會員數據"
        :rows="ErrorData"
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
            @click="exportExcel(ErrorData)"
          />
        </template>
      </q-table>
    </q-tab-panel>
    -->
  </q-tab-panels>
  
</template>

<script setup>
import { sessionCollection } from "boot/firebase";
import { computed, ref, watch, onMounted } from "vue";
import { exportFile, date as qdate, is } from "quasar";
import { useSubscription, useQuery } from "@vue/apollo-composable"
import { gql } from "graphql-tag"
import EventDetail from "components/Event/EventDetail.vue";
import Report from "src/lib/sis"
import LoadingDialog from "components/LoadingDialog.vue"
import dateUtil from "src/lib/date.js";
import { getDocs, query, where, orderBy, onSnapshot } from "firebase/firestore";

onMounted(() => {
  refreshSchedule(reportDate.value)
})

// variables
const reportDate = ref(qdate.formatDate(qdate.endOfDate(qdate.subtractFromDate(Date.now(), {month: 1}), 'month'), "YYYY/MM/DD"))
const detailModal = ref(false)
const openingModal = ref(false)
const showEventID = ref("")
const activeTab = ref("All")
const dutyTable = ref([])
const destInCenter = [
  '本中心', '大堂', '活動室(一)', '活動室(二)', '舞蹈室', 'Band房', '電腦室', '會議室', '中心廣場', '星有利球場', '星有利籃球場'
]
//const closeList = ref(["覆", "AL", "SL", "補", "長", "短"])
const scheduleSnapshot = ref()

const defaultPagination = ref({
  rowsPerPage: 40,
  sortBy: "c_act_code",
  descending: true,
})
const dutyTableColumns = ref([
  {
    name: "date",
    label: "日期",
    field: "date",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => qdate.formatDate(val, "YYYY年M月D日(ddd)", {
                  daysShort: ['日', '一', '二', '三', '四', '五', '六'],
                })
  },
  {
    name: "slot_a",
    label: "早",
    field: "slot_a",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "slot_b",
    label: "午",
    field: "slot_b",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "slot_c",
    label: "晚",
    field: "slot_c",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  }
])

const eventListColumns = ref([
  {
    name: "c_act_code",
    label: "活動編號",
    field: "c_act_code",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    sortable: true,
  },
  {
    name: "c_act_name",
    label: "活動名稱",
    field: "c_act_name",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_dest",
    label: "地點",
    field: "c_dest",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_nature",
    label: "分類",
    field: "c_nature",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_respon",
    label: "負責人",
    field: "c_respon",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_type",
    label: "種類",
    field: "c_type",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_status",
    label: "狀態",
    field: "c_status",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_group1",
    label: "大分類",
    field: "c_group1",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_group2",
    label: "細類",
    field: "c_group2",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_acc_type",
    label: "會計",
    field: "c_acc_type",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
])

const os2Columns = ref([
  {
    name: "c_act_code",
    label: "活動編號",
    field: "c_act_code",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    sortable: true,
  },
  {
    name: "c_act_name",
    label: "活動名稱",
    field: "c_act_name",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_dest",
    label: "地點",
    field: "c_dest",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_nature",
    label: "分類",
    field: "c_nature",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_respon",
    label: "負責人",
    field: "c_respon",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_type",
    label: "種類",
    field: "c_type",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_status",
    label: "狀態",
    field: "c_status",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_group1",
    label: "大分類",
    field: "c_group1",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_group2",
    label: "細類",
    field: "c_group2",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "d_act",
    label: "月份",
    field: "d_act",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "i_number",
    label: "青年節數",
    field: "i_number",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "i_people_count",
    label: "青年人次",
    field: "i_people_count",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
])

// query - load graphql subscription on member list
const { result, loading } = useSubscription(gql`
  subscription getEvent {
    HTX_Event(order_by: {c_act_code: desc}, offset: 1) {
      c_act_code
      c_act_name
      c_nature
      c_respon
      c_type
      c_status
      c_group1
      c_group2
      c_acc_type
      c_dest
    }
  }`);

const { result: os2result, loading: os2loading } = useQuery(gql`
query queryO2Result(
  $d_act: String = ""
  ) {
  tbl_act_session(where: {d_act: {_eq: $d_act}}) {
    c_act_code
    d_act
    i_number
    i_people_count
    s_GUID
    Session_to_Event {
      c_act_code
      c_act_name
      c_dest
      c_group1
      c_group2
      c_nature
      c_respon
      c_type
      c_status
    }
  }
}`, () => ({
  d_act: qdate.formatDate(reportDate.value, "MM/YYYY")
}))

const tableHeader = {
  c_act_code: "活動編號",
  c_act_name: "活動名稱",
  c_dest: "地點",
  c_nature: "分類",
  c_respon: "負責人",
  c_type: "種類",
  c_status: "狀態",
  c_group1: "大分類",
  c_group2: "細類",
  c_acc_type: "會計",
  d_act: "月份",
  i_number: "青年節數",
  i_people_count: "青年人次"
}

// watcher
watch(reportDate, (newDate, oldDate)  => { 
  dutyTable.value = []
  refreshSchedule(newDate)
})

// computed
const EventData = computed(() => result.value?.HTX_Event??[])
const OS2Data = computed(() => {
  let res = []
  if (os2result.value) {
    os2result.value.tbl_act_session.forEach((x) => {
      let result = false
      let locations = x.Session_to_Event.c_dest? x.Session_to_Event.c_dest.split(/[,、]+/): []
      
      locations.forEach((loc) => {
        let res = destInCenter.includes(loc.trim())
        if (res) result = true
      })
      
      if (x.Session_to_Event.c_group1 && x.Session_to_Event.c_group1.trim().includes('中心設施')) result = true
      if (x.Session_to_Event.c_type && x.Session_to_Event.c_type.trim().includes('偶到')) result = true
      
      if (result) {
        res.push({
          d_act: x.d_act,
          i_number: x.i_number,
          i_people_count: x.i_people_count,
          ...x.Session_to_Event,
        })
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
function exportExcel(datasource) {
  //console.log(memberListColumns.value.map(col => wrapCsvValue(col.label)))
  /*
  let data = datasource.map(row => memberListColumns.value.map(col => wrapCsvValue(
      typeof col.field === 'function'
        ? col.field(row)
        : row[ col.field === void 0 ? col.name : col.field ],
      col.format,
      row
    )))
  //console.log(data)
  
  for (const row of data) {
    for (const item of row) {
      console.log(item)
    }
  }
  */
  
  let content = jsonToXLS(datasource)
  
  const status = exportFile(
    'CCIYC-Report.xls',
    content,
    'text/xls'
  )

  if (status !== true) {
    $q.notify({
      message: 'Browser denied file download...',
      color: 'negative',
      icon: 'warning'
    })
  }
  
}

function refreshSchedule(newDate) {
  // build up dates in month
  for (let day = qdate.addToDate(qdate.startOfDate(newDate, 'month'), {hours: 8}); day < qdate.endOfDate(newDate, 'month'); day = qdate.addToDate(day, { day: 1})) {
    dutyTable.value.push({
      date: day
    })
  }

  const sessionDocQuery = query(sessionCollection, 
    where("date", ">=", qdate.startOfDate(newDate, 'month')),
    where("date", "<=", qdate.endOfDate(newDate, 'month'))
  )

  getDocs(sessionDocQuery).then((sessionDoc) => {
    sessionDoc.forEach((doc) => {
      let i = dutyTable.value.findIndex((element) => qdate.formatDate(element.date, "YYYY-MM-DD") == qdate.formatDate(doc.data().date.toDate(), "YYYY-MM-DD"))
      dutyTable.value[i][doc.data().slot] = true
    });
  });
}

function rowDetail(evt, row, index) {
  if (evt.target.nodeName === 'TD') {
    detailModal.value = true;
    showEventID.value = row.c_act_code;
  }
}

function exportTable(dataSource) {
  // naive encoding to csv format
  const content = [memberListColumns.value.map(col => wrapCsvValue(col.label))].concat(
    dataSource.map(row => memberListColumns.value.map(col => wrapCsvValue(
      typeof col.field === 'function'
        ? col.field(row)
        : row[ col.field === void 0 ? col.name : col.field ],
      col.format,
      row
    )).join(','))
  ).join('\r\n')

  const status = exportFile(
    'table-export.csv',
    content,
    'text/csv'
  )

  if (status !== true) {
    $q.notify({
      message: 'Browser denied file download...',
      color: 'negative',
      icon: 'warning'
    })
  }
}

function wrapCsvValue (val, formatFn, row) {
  let formatted = formatFn !== void 0
    ? formatFn(val, row)
    : val

  formatted = formatted === void 0 || formatted === null
    ? ''
    : String(formatted)

  formatted = formatted.split('"').join('""')
  /**
   * Excel accepts \n and \r in strings, but some other CSV parsers do not
   * Uncomment the next two lines to escape new lines
   */
  // .split('\n').join('\\n')
  // .split('\r').join('\\r')

  //return `"${formatted}"`
  return `${formatted}`
}

// export to xls functions
// mime type [xls, csv]
const type = "xls"

// Json to download
const data = null
    
// fields inside the Json Object that you want to export
// if no given, all the properties in the Json are exported
const fields = () => null
    
// this prop is used to fix the problem with other components that use the
// variable fields, like vee-validate. exportFields works exactly like fields
const exportFields = () => null

// Use as fallback when the row has no field values
const defaultValue = ""

// Title(s) for the data, could be a string or an array of strings (multiple titles)
const header = null

// Footer(s) for the data, could be a string or an array of strings (multiple footers)
const footer = null

// filename to export
const name = "data.xls"
 
    
const meta = () => []
 
const worksheet = "Sheet1"
    

// Determine if CSV Data should be escaped
const escapeCsv = true

// long number stringify
const stringifyLongNum = true

function jsonToXLS(data) {
  let xlsTemp =
    '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta name=ProgId content=Excel.Sheet> <meta name=Generator content="Microsoft Excel 11"><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><style>br {mso-data-placement: same-cell;}</style></head><body><table>${table}</table></body></html>';
  let xlsData = "<thead>";
  const colspan = Object.keys(data[0]).length;
  //Header
  // const header = this.header || this.$attrs.title;
  if (header) {
    xlsData += parseExtraData(
      header,
      '<tr><th colspan="' + colspan + '">${data}</th></tr>'
    );
  }
  
  //Fields
  xlsData += "<tr>";
  let tableHeader = eventListColumns.value.map(col => wrapCsvValue(col.label))
  for (let key of tableHeader) {
    xlsData += "<th>" + key + "</th>";
  }
  xlsData += "</tr>";
  xlsData += "</thead>";
  
  
  /*data.map(row => memberListColumns.value.map(col => wrapCsvValue(
      typeof col.field === 'function'
        ? col.field(row)
        : row[ col.field === void 0 ? col.name : col.field ],
      col.format,
      row
    )))*/

  //Data
  xlsData += "<tbody>";

  let tableFieldData = data.map(row => eventListColumns.value.map(col => wrapCsvValue(
                        typeof col.field === 'function'
                          ? col.field(row)
                          : row[ col.field === void 0 ? col.name : col.field ],
                        col.format,
                        row
                      )))
  /*
  data.map(function (item, index) {
    xlsData += "<tr>";
    for (let key in item) {
      xlsData +=
        "<td>" +
        preprocessLongNum(
          valueReformattedForMultilines(item[key])
        ) +
        "</td>";
    }
    xlsData += "</tr>";
  });
  */
  // ableFieldData)
  for (const row of tableFieldData) {
    xlsData += "<tr>"
    for (const item of row) {
      xlsData +=
        "<td>" +
        preprocessLongNum(
          valueReformattedForMultilines(item)
        ) +
        "</td>";
    }
    xlsData += "</tr>";
  }
  xlsData += "</tbody>";
  
  //Footer
  if (footer != null) {
    xlsData += "<tfoot>";
    xlsData += parseExtraData(
      footer,
      '<tr><td colspan="' + colspan + '">${data}</td></tr>'
    );
    xlsData += "</tfoot>";
  }
  
  return xlsTemp
    .replace("${table}", xlsData)
    .replace("${worksheet}", worksheet);
}
 
/*
jsonToCSV
---------------
Transform json data into an CSV file.
*/
function jsonToCSV(data) {
  var csvData = [];
  //Header
  // const header = this.header || this.$attrs.title;
  if (header) {
    csvData.push(parseExtraData(header, "${data}\r\n"));
  }
  //Fields
  for (let key in data[0]) {
    csvData.push(key);
    csvData.push(",");
  }
  csvData.pop();
  csvData.push("\r\n");
  //Data
  data.map(function (item) {
    for (let key in item) {
      let escapedCSV = item[key] + "";
      // Escaped CSV data to string to avoid problems with numbers or other types of values
      // this is controlled by the prop escapeCsv
      if (escapeCsv) {
        escapedCSV = '="' + escapedCSV + '"'; // cast Numbers to string
        if (escapedCSV.match(/[,"\n]/)) {
          escapedCSV = '"' + escapedCSV.replace(/\"/g, '""') + '"';
        }
      }
      csvData.push(escapedCSV);
      csvData.push(",");
    }
    csvData.pop();
    csvData.push("\r\n");
  });
  //Footer
  if (footer != null) {
    csvData.push(parseExtraData(footer, "${data}\r\n"));
  }
  return csvData.join("");
}

/*
getProcessedJson
---------------
Get only the data to export, if no fields are set return all the data
*/
function getProcessedJson(data, header) {
  let keys = getKeys(data, header);
  let newData = [];
  data.map(function (item, index) {
    let newItem = {};
    for (let label in keys) {
      let property = keys[label];
      newItem[label] = getValue(property, item);
    }
    newData.push(newItem);
  });
  return newData;
}

function getKeys(data, header) {
  if (header) {
    return header;
  }
  let keys = {};
  for (let key in data[0]) {
    keys[key] = key;
  }
  return keys;
}

/*
parseExtraData
---------------
Parse title and footer attribute to the csv format
*/
function parseExtraData(extraData, format) {
  let parseData = "";
  if (Array.isArray(extraData)) {
    for (var i = 0; i < extraData.length; i++) {
      if (extraData[i])
        parseData += format.replace("${data}", extraData[i]);
    }
  } else {
    parseData += format.replace("${data}", extraData);
  }
  return parseData;
}

function getValue(key, item) {
  const field = typeof key !== "object" ? key : key.field;
  let indexes = typeof field !== "string" ? [] : field.split(".");
  let value = defaultValue;
  if (!field) value = item;
  else if (indexes.length > 1)
    value = getValueFromNestedItem(item, indexes);
  else value = parseValue(item[field]);
  if (key.hasOwnProperty("callback"))
    value = getValueFromCallback(value, key.callback);
  return value;
}

/*
convert values with newline \n characters into <br/>
*/
function valueReformattedForMultilines(value) {
  if (typeof value == "string") return value.replace(/\n/gi, "<br/>");
  else return value;
}

function preprocessLongNum(value) {
  if (stringifyLongNum) {
    if (String(value).startsWith("0x")) {
      return value;
    }
    if (!isNaN(value) && value != "") {
      if (value > 99999999999 || value < 0.0000000000001) {
        return '="' + value + '"';
      }
    }
  }
  return value;
}
    
function getValueFromNestedItem(item, indexes) {
  let nestedItem = item;
  for (let index of indexes) {
    if (nestedItem) nestedItem = nestedItem[index];
  }
  return parseValue(nestedItem);
}
  
function getValueFromCallback(item, callback) {
  if (typeof callback !== "function") return defaultValue;
  const value = callback(item);
  return parseValue(value);
}
   
function parseValue(value) {
  return value || value === 0 || typeof value === "boolean"
    ? value
    : defaultValue;
}

function base64ToBlob(data, mime) {
  let base64 = window.btoa(window.unescape(encodeURIComponent(data)));
  let bstr = atob(base64);
  let n = bstr.length;
  let u8arr = new Uint8ClampedArray(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
</script>