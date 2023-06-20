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
    <EventDetail :EventID="showEventID" @hide-component="() => detailModal = false"/>
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
      <EventDetail :EventID="showEventID" @hide-component="() => detailModal = false"/>
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
        <q-btn flat icon="print" v-print="printObj"/>
        <q-space/>
        <q-btn icon="close" flat v-close-popup/>
      </q-card-section>
      <q-card-section>
        <div id="printMe" class="print-area">
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
        </div>
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
    <q-tab name="OS3" icon="pin_drop" label="OS3/4" />
    <q-tab name="OS5" icon="pin_drop" label="OS5" />
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
        no-data-label="沒有資料"
        @row-click="rowDetail"
      >
        <template v-slot:top-right="props">
          <q-btn
            color="primary"
            icon-right="archive"
            label="匯出Excel"
            no-caps
            @click="exportExcel(EventData, eventListColumns, '全部活動數據')"
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
        no-data-label="沒有資料"
        @row-click="rowDetail"
      >
        <!-- export button -->
        <template v-slot:top-right>
          <q-btn
            color="primary"
            icon-right="archive"
            label="匯出Excel"
            no-caps
            @click="exportExcel(OS2Data, os2Columns, 'OS2_'+qdate.formatDate(reportDate, 'YYYY-MM'))"
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
    
    <q-tab-panel name="OS3" class="q-ma-none q-pa-sm text-body1">
      <div class="row">
        <div class="col-6">
          <div class="text-h6">OS3</div>
          <div>ia) Guidance and counselling (group and activity): {{ OS3Data.filter((x) => x.c_nature.trim() == "核心青年服務A").reduce((x,v) => x + v.i_number, 0) }}</div>
          <div>ib) Guidance and counselling (case interview): 0</div>
          <div>ii) Supportive service for young people in disadvantaged circumstances: {{ OS3Data.filter((x) => x.c_nature.trim() == "核心青年服務B").reduce((x,v) => x + v.i_number, 0) }}</div> 
          <div>iii) Socialization programmes: {{ OS3Data.filter((x) => x.c_nature.trim() == "核心青年服務C").reduce((x,v) => x + v.i_number, 0) }}</div> 
          <div>iv) Development of social responsibility and competence: {{ OS3Data.filter((x) => x.c_nature.trim() == "核心青年服務D").reduce((x,v) => x + v.i_number, 0) }}</div> 
          <div>v) Total (Output Standard 3): {{ OS3Data.reduce((x,v) => x + v.i_number, 0) }}</div>
        </div> 
        <div class="col-6">
          <div class="text-h6">OS4</div>
          <div>ia) Guidance and counselling (group and activity): {{ OS3Data.filter((x) => x.c_nature.trim() == "核心青年服務A").reduce((x,v) => x + v.i_people_count, 0) }}</div>
          <div>ib) Guidance and counselling (case interview): 0</div>
          <div>ii) Supportive service for young people in disadvantaged circumstances: {{ OS3Data.filter((x) => x.c_nature.trim() == "核心青年服務B").reduce((x,v) => x + v.i_people_count, 0) }}</div> 
          <div>iii) Socialization programmes: {{ OS3Data.filter((x) => x.c_nature.trim() == "核心青年服務C").reduce((x,v) => x + v.i_people_count, 0) }}</div> 
          <div>iv) Development of social responsibility and competence: {{ OS3Data.filter((x) => x.c_nature.trim() == "核心青年服務D").reduce((x,v) => x + v.i_people_count, 0) }}</div> 
          <div>v) Total (Output Standard 4): {{ OS3Data.reduce((x,v) => x + v.i_people_count, 0) }}</div>
        </div> 
      </div>
      <q-table
        dense
        flat
        :rows="OS3Data"
        :columns="os2Columns"
        :pagination="defaultPagination"
        color="primary"
        row-key="c_act_code"
        :loading="loading"
        :filter="search"
        :filter-method="tableFilter"
        binary-state-sort
        no-data-label="沒有資料"
        @row-click="rowDetail"
      >
        <template v-slot:top class="row">
          <q-select class="col-2" clearable label="性質" :options="os3natures" v-model="search.c_nature"/>
          <q-space/>
          <q-btn
            color="primary"
            icon-right="archive"
            label="匯出Excel"
            no-caps
            @click="exportExcel(OS3Data, os2Columns, 'OS34_'+qdate.formatDate(reportDate, 'YYYY-MM'))"
          />
        </template>
      </q-table>
    </q-tab-panel>
    
    <q-tab-panel name="OS5" class="q-ma-none q-pa-sm text-body1"> 
      <div>i) Total number of core programmes completed/case closed in the quarter: {{ Object.keys(OS5Data).length }}</div>
      <div>ii) Total number of core programmes completed/case closed with goals achieved in the quarter: {{ Object.keys(OS5Data.filter((x) => x.c_status.trim() == '完成達標')).length }}</div>
      <div>iii) Rate of achieving core programme plan: {{ is.number((Object.keys(OS5Data.filter((x) => x.c_status.trim() == '完成達標')).length/Object.keys(OS5Data).length))? (Object.keys(OS5Data.filter((x) => x.c_status.trim() == '完成達標')).length*100/Object.keys(OS5Data).length).toFixed(2) + "%":0 }}</div> 
      
      <q-table
        dense
        flat
        title="OS5"
        :rows="OS5Data"
        :columns="os5Columns"
        :pagination="defaultPagination"
        color="primary"
        row-key="c_act_code"
        :loading="os5loading"
        binary-state-sort
        no-data-label="沒有資料"
        @row-click="rowDetail"
      >
        <template v-slot:top-right>
          <q-btn
            color="primary"
            icon-right="archive"
            label="匯出Excel"
            no-caps
            @click="exportExcel(OS5Data, os5Columns, 'OS5_'+qdate.formatDate(reportDate, 'YYYY-MM'))"
          />
        </template>
      </q-table>
    </q-tab-panel>
  </q-tab-panels>
  
</template>

<script setup>
import { sessionCollection } from "boot/firebase";
import { computed, ref, watch, onMounted } from "vue";
import { exportFile, date as qdate, is } from "quasar";
import { useSubscription, useQuery } from "@vue/apollo-composable"
import { gql } from "graphql-tag"
import EventDetail from "components/Event/EventDetail.vue";
import LoadingDialog from "components/LoadingDialog.vue"
import Excel from "src/lib/exportExcel"
import { getDocs, query, where } from "firebase/firestore";
import print from "vue3-print-nb";

onMounted(() => {
  refreshSchedule(reportDate.value)
})

// variables
const reportDate = ref(qdate.formatDate(qdate.endOfDate(qdate.subtractFromDate(Date.now(), {month: 1}), 'month'), "YYYY/MM/DD"))
const detailModal = ref(false)
const openingModal = ref(false)
const showEventID = ref("")
const search = ref({})
const activeTab = ref("All")
const dutyTable = ref([])
const os3natures = [
  '核心青年服務A','核心青年服務B','核心青年服務C','核心青年服務D'
]
const os5status = [
  '完成達標', '完成不達標'
]
const destInCenter = [
  '本中心', '大堂', '活動室(一)', '活動室(二)', '舞蹈室', 'Band房', '電腦室', '會議室', '中心廣場', '星有利球場', '星有利籃球場'
]
//const closeList = ref(["覆", "AL", "SL", "補", "長", "短"])
const scheduleSnapshot = ref()

const printObj = ref({
  id: "printMe",
  preview: false,
})

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

const os5Columns = ref([
  {
    name: "c_act_code",
    label: "活動編號",
    field: "c_act_code",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
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
    name: "c_nature",
    label: "性質",
    field: "c_nature",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_respon",
    label: "負責職員",
    field: "c_respon",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_status",
    label: "狀況",
    field: "c_status",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_type",
    label: "類別",
    field: "c_type",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "d_finish_goal",
    label: "完成日期",
    field: "d_finish_goal",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => qdate.formatDate(val, "YYYY年M月D日")
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
  subscription Event_getEvent {
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
    inCenter
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

const { result: os5result, loading: os5loading } = useQuery(gql`
query queryOS5Result(
  $startDate: smalldatetime = "", 
  $endDate: smalldatetime = ""
  ) {
  HTX_Event(where: {_and: {d_finish_goal: {_gte: $startDate}}, d_finish_goal: {_lte: $endDate}}) {
    c_act_code
    c_act_name
    c_nature
    c_respon
    c_status
    c_type
    d_finish_goal
  }
}`, () => ({
  startDate: qdate.formatDate(qdate.startOfDate(reportDate.value, 'month'), "YYYY-MM-DD"),
  endDate: qdate.formatDate(qdate.endOfDate(reportDate.value, 'month'), "YYYY-MM-DD")
}))

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
      
      if (result && x.inCenter) {
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
const OS3Data = computed(() => { //os2result.value? os2result.value.tbl_act_session.filter((x) => os3natures.includes(x.Session_to_Event.c_nature.trim())): [])
  let res = []
  if (os2result.value) {
    os2result.value.tbl_act_session.forEach((x) => {
      let result = os3natures.includes(x.Session_to_Event.c_nature.trim())
      
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

const OS5Data = computed(() => os5result.value?.HTX_Event.filter((x) => os5status.includes(x.c_status.trim()))??[])

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

function tableFilter(rows, terms) {
  return rows.filter(
    (row) => terms.c_nature? row.c_nature.trim() == terms.c_nature: true
  );
}

function rowDetail(evt, row, index) {
  if (evt.target.nodeName === 'TD') {
    detailModal.value = true;
    showEventID.value = row.c_act_code;
  }
}
</script>

<script>
import print from "vue3-print-nb";

export default {
  name: "PrintOpeningSessions",
  directives: {
    print,
  },
}
</script>

<style scoped>
@media print {
  .print-area { 
    margin: 30px;
    border: none;
  }
}
</style>