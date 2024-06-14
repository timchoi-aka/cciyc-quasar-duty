<template>
  <!-- loading dialog -->
  <q-dialog v-model="loading" position="bottom">
    <LoadingDialog message="處理中" />
  </q-dialog>

  <!-- rowDetail modal -->
  <q-dialog v-if="$q.screen.lt.md" v-model="detailModal" persistent maximized full-width transition-show="slide-up"
    transition-hide="slide-down">
    <MemberDetail v-model="showMemberID" />
  </q-dialog>

  <q-dialog v-else v-model="detailModal" persistent full-height transition-show="slide-up" transition-hide="slide-down"
    class="q-pa-none">
    <q-card style="min-width: 70vw; width: 70vw; max-width: 70vw;">
      <MemberDetail v-model="showMemberID" />
    </q-card>
  </q-dialog>
  <div class="row justify-center">

    <div class="row items-center q-mx-md"><q-btn label="上月"
        @click="reportDate = qdate.formatDate(qdate.endOfDate(qdate.subtractFromDate(reportDate, { month: 1 }), 'month'), 'YYYY/MM/DD')"
        class="bg-primary text-white items-center" /></div>

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

    <div class="row items-center q-mx-md"><q-btn label="下月"
        @click="reportDate = qdate.formatDate(qdate.endOfDate(qdate.addToDate(reportDate, { month: 1 }), 'month'), 'YYYY/MM/DD')"
        class="bg-primary text-white items-center" /></div>
  </div>


  <!--<q-date v-model="reportDate" default-view="Months"/>-->
  <q-tabs v-model="activeTab" inline-label align="left" class="desktop-only bg-primary text-white">
    <q-tab name="All" icon="source" :label="'全部(' + MemberData.length + '人)'" />
    <q-tab name="Youth" icon="pin_drop" :label="'青年(' + YouthData.length + '人)'" />
    <q-tab name="Family_15" icon="pin_drop" :label="'家人(<15)(' + Family_15Data.length + '人)'" />
    <q-tab name="Family_24" icon="pin_drop" :label="'家人(>24)(' + Family_24Data.length + '人)'" />
    <q-tab name="Quit" icon="pin_drop" :label="'退會(' + QuitData.length + '人)'" />
    <q-tab name="Expired" icon="pin_drop" :label="'截數月過期(' + ExpiredData.length + '人)'" />
    <q-tab name="Error" icon="error" :label="'錯誤(' + ErrorData.length + '人)'" />
    <q-tab name="Duplicate" icon="error" :label="'重覆(' + DuplicateData.length + '人)'" />
  </q-tabs>

  <q-tab-panels v-model="activeTab" animated swipeable transition-prev="jump-up" transition-next="jump-up">
    <q-tab-panel name="All" class="q-ma-none q-pa-sm text-body1">
      <q-table dense flat title="全部會員數據" :rows="MemberData" :columns="memberListColumns" :pagination="defaultPagination"
        color="primary" row-key="c_mem_id" :loading="loading" binary-state-sort @row-click="rowDetail">
        <template v-slot:top-right>
          <q-btn color="primary" icon-right="archive" label="匯出Excel" no-caps
            @click="exportExcel(MemberData, memberListColumns, '全部會員數據')" />
        </template>
      </q-table>
    </q-tab-panel>

    <q-tab-panel name="Quit" class="q-ma-none q-pa-sm text-body1">
      <q-table dense flat title="退會會員數據" :rows="QuitData" :columns="memberListColumns" :pagination="defaultPagination"
        color="primary" row-key="c_mem_id" :loading="loading" binary-state-sort @row-click="rowDetail">
        <template v-slot:top-right>
          <q-btn color="primary" icon-right="archive" label="匯出Excel" no-caps
            @click="exportExcel(QuitData, memberListColumns, '退會會員數據')" />
        </template>
      </q-table>
    </q-tab-panel>

    <q-tab-panel name="Youth" class="q-ma-none q-pa-sm text-body1">
      <q-table dense flat title="青年會員數據" :rows="YouthData" :columns="memberListColumns" :pagination="defaultPagination"
        color="primary" row-key="c_mem_id" :loading="loading" binary-state-sort @row-click="rowDetail">
        <template v-slot:top-right>
          <q-btn color="primary" icon-right="archive" label="匯出Excel" no-caps
            @click="exportExcel(YouthData, memberListColumns, '青年會員數據_' + qdate.formatDate(reportDate, 'YYYY-MM'))" />
        </template>
      </q-table>
    </q-tab-panel>

    <q-tab-panel name="Family_15" class="q-ma-none q-pa-sm text-body1">
      <q-table dense flat title="家人(<15)會員數據" :rows="Family_15Data" :columns="memberListColumns"
        :pagination="defaultPagination" color="primary" row-key="c_mem_id" :loading="loading" binary-state-sort
        @row-click="rowDetail">
        <template v-slot:top-right>
          <q-btn color="primary" icon-right="archive" label="匯出Excel" no-caps
            @click="exportExcel(Family_15Data, memberListColumns, '家人(14歲或以下)會員數據_' + qdate.formatDate(reportDate, 'YYYY-MM'))" />
        </template>
      </q-table>
    </q-tab-panel>

    <q-tab-panel name="Family_24" class="q-ma-none q-pa-sm text-body1">
      <q-table dense flat title="家人(>24)會員數據" :rows="Family_24Data" :columns="memberListColumns"
        :pagination="defaultPagination" color="primary" row-key="c_mem_id" :loading="loading" binary-state-sort
        @row-click="rowDetail">
        <template v-slot:top-right>
          <q-btn color="primary" icon-right="archive" label="匯出Excel" no-caps
            @click="exportExcel(Family_24Data, memberListColumns, '家人(25歲或以上)會員數據_' + qdate.formatDate(reportDate, 'YYYY-MM'))" />
        </template>
      </q-table>
    </q-tab-panel>

    <q-tab-panel name="Expired" class="q-ma-none q-pa-sm text-body1">
      <q-table dense flat title="過期會員數據" :rows="ExpiredData" :columns="memberListColumns"
        :pagination="defaultPagination" color="primary" row-key="c_mem_id" :loading="loading" binary-state-sort
        @row-click="rowDetail">
        <template v-slot:top-right>
          <q-btn color="primary" icon-right="archive" label="匯出Excel" no-caps
            @click="exportExcel(ExpiredData, memberListColumns, '過期會員數據_' + qdate.formatDate(reportDate, 'YYYY-MM'))" />
        </template>
      </q-table>
    </q-tab-panel>

    <q-tab-panel name="Error" class="q-ma-none q-pa-sm text-body1">
      <q-table dense flat title="錯誤會員數據" :rows="ErrorData" :columns="memberListColumns" :pagination="defaultPagination"
        color="primary" row-key="c_mem_id" :loading="loading" binary-state-sort @row-click="rowDetail">
        <template v-slot:top-right>
          <q-btn color="primary" icon-right="archive" label="匯出Excel" no-caps
            @click="exportExcel(ErrorData, memberListColumns, '錯誤會員數據')" />
        </template>
      </q-table>
    </q-tab-panel>

    <q-tab-panel name="Duplicate" class="q-ma-none q-pa-sm text-body1">
      <q-table dense flat title="重覆會員數據" :rows="DuplicateData" :columns="memberListColumns"
        :pagination="defaultPagination" color="primary" row-key="c_mem_id" :loading="loading" binary-state-sort
        @row-click="rowDetail">
        <template v-slot:top-right>
          <q-btn color="primary" icon-right="archive" label="匯出Excel" no-caps
            @click="exportExcel(DuplicateData, memberListColumns, '重覆會員數據')" />
        </template>
      </q-table>
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup>
import { ref, watch } from "vue";
import { exportFile, date as qdate } from "quasar";
import { useQuery } from "@vue/apollo-composable"
import { gql } from "graphql-tag"
import MemberDetail from "components/Member/MemberDetail.vue";
import Report from "src/lib/sis"
import LoadingDialog from "components/LoadingDialog.vue"
import dateUtil from "src/lib/calculateAge"
import Excel from "src/lib/exportExcel"

// variables
const reportDate = ref(qdate.formatDate(qdate.endOfDate(qdate.subtractFromDate(Date.now(), { month: 1 }), 'month'), "YYYY/MM/DD"))
const detailModal = ref(false)
const showMemberID = ref("")
const activeTab = ref("All")

watch(() => reportDate.value, (newValue, oldValue) => {
  if (newValue != oldValue) updateReport()
})

const defaultPagination = ref({
  rowsPerPage: 30,
  sortBy: "c_mem_id",
})
const memberListColumns = ref([
  {
    name: "c_mem_id",
    label: "會員編號",
    field: "c_mem_id",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    sortable: true,
  },
  {
    name: "c_name",
    label: "姓名",
    field: "c_name",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    sortable: true,
  },
  {
    name: "c_name_other",
    label: "英文姓名",
    field: "c_name_other",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_sex",
    label: "性別",
    field: "c_sex",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_udf_1",
    label: "會籍",
    field: "c_udf_1",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "d_birth",
    label: "出生日期",
    field: "d_birth",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => val ? qdate.formatDate(val, "YYYY年M月D日") : '錯誤'
  },
  {
    name: "age",
    label: "年齡(至截數日)",
    field: "d_birth",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => val ? dateUtil.calculateAge(val, reportDate) : '錯誤'
  },
  //
  {
    name: "d_enter_1",
    label: "入會日期",
    field: "d_enter_1",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => val ? qdate.formatDate(val, "YYYY年M月D日") : '錯誤'
  },
  {
    name: "d_renew_1",
    label: "續會日期",
    field: "d_renew_1",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => val ? qdate.formatDate(val, "YYYY年M月D日") : ''
  },
  {
    name: "d_exit_1",
    label: "退會日期",
    field: "d_exit_1",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => val ? qdate.formatDate(val, "YYYY年M月D日") : ''
  },
  {
    name: "d_expired_1",
    label: "屆滿日期",
    field: "d_expired_1",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) =>
      qdate.formatDate(val, "YYYY年M月D日") == "3000年1月1日"
        ? "永久"
        : qdate.formatDate(val, "YYYY年M月D日"),
  },
  {
    name: "isYouthFamily",
    label: "青年家人",
    field: "isYouthFamily",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => val ? '是' : ''
  },
  {
    name: "youthMemberName",
    label: "青年家人姓名",
    field: "youthMemberName",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => [...val].join(',')
  },
])

// query - load graphql subscription on member list
const { onResult: MemberResult, loading, refetch } = useQuery(gql`
  query Member_getMember {
    Member(order_by: {c_mem_id: desc}, offset: 1) {
      c_mem_id
      b_mem_type1
      b_mem_type10
      c_name
      c_name_other
      c_sex
      c_udf_1
      d_birth
      d_expired_1
      d_exit_1
      d_renew_1
      d_enter_1
      MemberRelation1 {
        c_mem_id_1
        c_mem_id_2
        relation
        uuid
        d_effective
      }
      MemberRelation2 {
        c_mem_id_1
        c_mem_id_2
        relation
        uuid
        d_effective
      }
    }
  }`, {}, { pollInterval: 50000 });

// computed
const MemberData = ref([])
const QuitData = ref([])
const YouthData = ref([])
const Family_15Data = ref([])
const Family_24Data = ref([])
const ErrorData = ref([])
const DuplicateData = ref([])
const ExpiredData = ref([])
const tmpResult = ref([])

MemberResult((result) => {
  if (result.data) {
    tmpResult.value = result.data.Member
    updateReport()
  }
})

// functions
function updateReport() {
  let res = []
  if (!tmpResult.value || tmpResult.value.length == 0) return

  tmpResult.value.forEach((x) => {
    res.push({
      ...x,
      ...Report.isYouthFamily(reportDate, tmpResult.value, x.c_mem_id)
    })
  })

  MemberData.value = res
  Family_15Data.value = res.filter((x) => Report.sisFilter(reportDate, 'child', x))
  Family_24Data.value = res.filter((x) => Report.sisFilter(reportDate, 'family', x))

  QuitData.value = res.filter((x) => x.d_exit_1 != null)
  YouthData.value = res.filter((x) => Report.sisFilter(reportDate, 'youth', x))

  ErrorData.value = res.filter((x) =>
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
  )

  let now = new Date()
  let DuplicateDataRes = [];

  res.forEach((x) => {
    // console.log("c_name:" + x.c_name + " - d_birth:" + x.d_birth)
    if (res.filter((member) => member.c_name == x.c_name && member.d_birth == x.d_birth && (qdate.extractDate(member.d_expired_1, "YYYY-MM-DDTHH:mm:ss") > now && qdate.extractDate(x.d_expired_1, "YYYY-MM-DDTHH:mm:ss") > now)).length > 1) {
      DuplicateDataRes.push(x)
    }
  })

  DuplicateData.value = DuplicateDataRes
  ExpiredData.value = res.filter((x) =>
    !x.d_exit_1 &&
    x.d_expired_1 && qdate.getDateDiff(x.d_expired_1, reportDate.value) < 0 &&
    qdate.isBetweenDates(x.d_expired_1, qdate.startOfDate(reportDate.value, 'month'), qdate.endOfDate(reportDate.value, 'month'))
  )
}

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
    showMemberID.value = row.c_mem_id;
  }
}
</script>
