<template>
  <!-- loading dialog -->
  <LoadingDialog :model-value="(loadingEventList || loadingCoreEventList || loadingFav || loadingAwaitApproval || loadingAwaitApprovalPrepaidRecords)? 1: 0" message="處理中"/>
  <LoadingDialog :model-value="loading" message="儲存資料中"/>

  <div class="row">
    <!-- favourate -->
    <div :class="[$q.screen.lt.md? 'col-12':'col-5']">
      <q-chip class="bg-warning" size="lg" label="我的收藏"/>
      <q-table
        class="q-mt-sm"
        flat
        bordered
        @row-click="showDetail"
        :rows="FavList"
        :pagination="pagination"
        :columns="FavColumns"
      >
        <!-- applicationInProcess template -->
        <template v-slot:body-cell-b_applicationInProcess="props">
          <q-td :props="props">
            <q-icon class="text-positive" v-if="qdate.isBetweenDates(Date.now(), qdate.extractDate(props.row.d_sale_start, 'D/M/YYYY'), qdate.extractDate(props.row.d_sale_end, 'D/M/YYYY'), { inclusiveFrom: true, inclusiveTo: true })" name="check" />
            <q-icon v-else name="cancel" class="text-negative"/>
          </q-td>
        </template>
      </q-table>
      <q-separator/>
      <div class="row col-12">
        <q-chip class="bg-negative text-white" size="lg" label="待審批項目"/>
      </div>
      <div class="q-pa-sm">
        <q-table
          class="q-mt-sm"
          flat
          bordered
          title="活動計劃檢討"
          @row-click="showDetail"
          :rows="awaitApprovalTableEntries"
          :pagination="pagination"
          :columns="unapprovedColumns"
        />
      </div>
      <div class="q-pa-sm">
        <q-table
          class="q-mt-sm"
          flat
          bordered
          title="活動預支餘款"
          @row-click="showDetail"
          :rows="awaitApprovalPrepaid"
          :pagination="pagination"
          :columns="unapprovedPrepaidColumns"
        />
      </div>
    </div>

    <!-- my events -->
    <div :class="[$q.screen.lt.md? 'col-12':'col-7']">
      <q-chip class="bg-positive text-white q-mr-md" size="lg" label="負責活動"/>
      <q-table
        class="q-mt-sm col-12"
        flat
        bordered
        :filter="filter"
        :filter-method="MyEventFilter"
        @row-click="showDetail"
        :rows="EventList"
        :pagination="pagination"
        :columns="MyColumns"
      >
      <!-- top row -->
      <template v-slot:top>
        <span>
          進行中<q-toggle v-model="coreFilter.status"/>已完成
        </span>
        <q-space/>
        <q-input hide-bottom-space type="text" label="活動編號" v-model="filter.c_act_code" debounce="500">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
        <!-- applicationInProcess template -->
        <template v-slot:body-cell-b_applicationInProcess="props">
          <q-td :props="props">
            <q-icon class="text-positive" v-if="qdate.isBetweenDates(Date.now(), qdate.extractDate(props.row.d_sale_start, 'D/M/YYYY'), qdate.extractDate(props.row.d_sale_end, 'D/M/YYYY'), { inclusiveFrom: true, inclusiveTo: true })" name="check" />
            <q-icon v-else name="cancel" class="text-negative"/>
          </q-td>
        </template>
      </q-table>

      <q-chip v-if="!isCenterIC" class="bg-positive text-white q-mr-md" size="lg" label="核心活動"/>
      <q-table
        v-if="!isCenterIC"
        class="q-mt-sm col-12"
        flat
        bordered
        :filter="coreFilter"
        :filter-method="coreEventFilter"
        @row-click="showDetail"
        :rows="StaffCoreEventList"
        :pagination="pagination"
        :columns="StaffCoreEventColumns"
      >
      <!-- top row -->
      <template v-slot:top>
        <span>
          進行中<q-toggle v-model="coreFilter.status"/>已完成
        </span>
        <q-space/>
        <q-input hide-bottom-space type="text" label="活動編號" v-model="coreFilter.c_act_code" debounce="500">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
        <!-- applicationInProcess template -->
        <template v-slot:body-cell-plan_submit="props">
          <q-td :props="props">
            <q-icon class="text-positive" v-if="props.value" name="check" />
            <q-icon v-else name="cancel" class="text-negative"/>
          </q-td>
        </template>
        <template v-slot:body-cell-eval_submit="props">
          <q-td :props="props">
            <q-icon class="text-positive" v-if="props.value" name="check" />
            <q-icon v-else name="cancel" class="text-negative"/>
          </q-td>
        </template>
        <template v-slot:body-cell-isRejected="props">
          <q-td :props="props">
            <q-icon class="text-red" v-if="props.value" name="warning" />
          </q-td>
        </template>
      </q-table>
    </div>
    <div v-if="isCenterIC" class="col-12 row">
      <q-chip class="bg-positive text-white q-mr-md" size="lg" label="中心核心活動一覽"/>
      <q-table
        class="q-mt-sm col-12"
        flat
        bordered
        :filter="coreFilter"
        :filter-method="coreEventFilter"
        @row-click="showDetail"
        :rows="CoreEventList"
        selection="multiple"
        row-key="c_act_code"
        v-model:selected="selectedRow"
        :pagination="pagination"
        :columns="CoreEventColumns"
      >
      <!-- top row -->
      <template v-slot:top>
        <span>
          進行中<q-toggle v-model="coreFilter.status"/>已完成
        </span>
        <q-space/>
        <q-btn v-if="selectedRow.length > 0" label="標記為已收取紙本計劃檢討表" class="bg-primary text-white" flat @click="markHardcopy"/>
        <q-space/>
        <q-input hide-bottom-space type="text" label="活動編號" v-model="coreFilter.c_act_code" debounce="500">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
        <!-- applicationInProcess template -->
        <template v-slot:body-cell-plan_submit="props">
          <q-td :props="props">
            <q-icon class="text-positive" v-if="props.value" name="check" />
            <q-icon v-else name="cancel" class="text-negative"/>
          </q-td>
        </template>
        <template v-slot:body-cell-eval_submit="props">
          <q-td :props="props">
            <q-icon class="text-positive" v-if="props.value" name="check" />
            <q-icon v-else name="cancel" class="text-negative"/>
          </q-td>
        </template>
        <template v-slot:body-cell-isOutstanding="props">
          <q-td :props="props">
            <q-icon class="text-red" v-if="props.value" name="warning" />
          </q-td>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { useStore } from "vuex";
import { MY_EVENT_SEARCH, CORE_EVENT_SEARCH, MY_FAV, EVALUATION_UNAPPROVED } from "/src/graphQueries/Event/query.js";
import LoadingDialog from "components/LoadingDialog.vue"
import { date as qdate, useQuasar } from "quasar";
import { gql } from "graphql-tag"
import { useRouter } from "vue-router"

// variables
const router = useRouter()
const $store = useStore();
const $q = useQuasar()
const loading = ref(0)
const selectedRow = ref([])
const filter = ref({
  status: false,
  c_act_code: ""
})

const coreFilter = ref({
  status: false,
  c_act_code: ""
})
const eventDetailDialog = ref(false)
 const username = computed(() => $store.getters["userModule/getUsername"])
//const username = ref("馬桂儀")
const isCenterIC = computed(() => $store.getters["userModule/getCenterIC"])
const searchCondition = ref({
  condition: {
    _or: [
      { c_respon: {_eq : username}},
      { c_respon2: {_eq : username}},
      { c_worker: {_eq : username}},
      { c_worker2: {_eq : username}}
    ]
  }
})

const coreEventCondition = ref({
  condition: {
    _and: [
      { c_nature: {_gte : '核心'}},
      { b_hardcopy: {_neq: true}}
    ]
  }
})

const pagination = ref({
  rowsPerPage: 20,
  descending: true,
  sortBy: "c_act_code",
})

const MyColumns = ref([
  {
    name: "c_act_code",
    label: "編號",
    field: "c_act_code",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_act_name",
    label: "名稱",
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
    name: "d_date_from",
    label: "開始",
    field: "d_date_from",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "d_date_to",
    label: "結束",
    field: "d_date_to",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "b_applicationInProcess",
    label: "報名中",
    field: "b_applicationInProcess",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
])

const StaffCoreEventColumns = ref([
  {
    name: "c_act_code",
    label: "編號",
    field: "c_act_code",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_act_name",
    label: "名稱",
    field: "c_act_name",
    style: "border-top: 1px solid; text-align: center; width: 5%;",
    headerStyle: "text-align: center; width: 5%;",
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
    name: "d_date_from",
    label: "開始",
    field: "d_date_from",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "d_date_to",
    label: "結束",
    field: "d_date_to",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "plan_submit",
    label: "計劃",
    field: "plan_submit",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "eval_submit",
    label: "檢討",
    field: "eval_submit",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "isRejected",
    label: "被拒絕",
    field: "isRejected",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
])

const CoreEventColumns = ref([
  {
    name: "c_act_code",
    label: "編號",
    field: "c_act_code",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_act_name",
    label: "名稱",
    field: "c_act_name",
    style: "border-top: 1px solid; text-align: center; width: 5%;",
    headerStyle: "text-align: center; width: 5%;",
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
    name: "d_date_from",
    label: "開始",
    field: "d_date_from",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "d_date_to",
    label: "結束",
    field: "d_date_to",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "plan_submit",
    label: "計劃",
    field: "plan_submit",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "eval_submit",
    label: "檢討",
    field: "eval_submit",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "isOutstanding",
    label: "欠報告",
    field: "isOutstanding",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
])

const FavColumns = ref([
  {
    name: "c_act_code",
    label: "編號",
    field: "c_act_code",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_act_name",
    label: "名稱",
    field: "c_act_name",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "b_applicationInProcess",
    label: "報名中",
    field: "b_applicationInProcess",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
])

const unapprovedColumns = ref([
  {
    name: "c_act_code",
    label: "編號",
    field: "c_act_code",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_act_name",
    label: "名稱",
    field: "c_act_name",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "submit_plan_date",
    label: "遞交計劃日期",
    field: "submit_plan_date",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => qdate.formatDate(val, "YYYY年M月D日")
  },
  {
    name: "submit_eval_date",
    label: "遞交檢討日期",
    field: "submit_eval_date",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => qdate.formatDate(val, "YYYY年M月D日")
  },
  {
    name: "c_status",
    label: "狀態",
    field: "c_status",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
])

const unapprovedPrepaidColumns = ref([
  {
    name: "c_act_code",
    label: "活動編號",
    field: "c_act_code",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "apply_user",
    label: "申請人",
    field: "apply_user",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "apply_date",
    label: "申請日期",
    field: "apply_date",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => qdate.formatDate(val, "YYYY年M月D日")
  },
  {
    name: "type",
    label: "種類",
    field: "type",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "amount",
    label: "金額",
    field: "amount",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => `$${val.toFixed(1)}`
  },
])
// setting current module
// $q.localStorage.set("module", "event");

// queries
const { mutate: markHardCopyMutation, onDone: markHardCopyMutation_Completed, onError: markHardCopyMutation_Error } = useMutation(gql`
  mutation update_HTX_Event_MarkHardcopy(
    $logObject: Log_insert_input! = {},
    $c_act_code: [String!] = ""
    ) {
    update_HTX_Event(where: {c_act_code: {_in: $c_act_code}}, _set: {b_hardcopy: true}) {
      affected_rows
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }`)
const { onResult: eventList, onError: eventList_Error, loading: loadingEventList } = useQuery(MY_EVENT_SEARCH, searchCondition.value, {pollInterval: 5000});
const { onResult: coreEventList, onError: coreEventList_Error, loading: loadingCoreEventList } = useQuery(CORE_EVENT_SEARCH, coreEventCondition.value, {pollInterval: 5000});
const { onResult: fav, onError: fav_onError, loading: loadingFav } = useQuery(MY_FAV,
() => ({
  username: username.value
}), {
  pollInterval: 5000
});
const { onResult: awaitApproval, loading: loadingAwaitApproval } = useQuery(EVALUATION_UNAPPROVED, {}, {pollInterval: 5000});
const { onResult: awaitApprovalPrepaidRecords, loading: loadingAwaitApprovalPrepaidRecords } = useQuery(gql`
query GetUnapprovedPrepaid {
  Event_Prepaid(where: {approved: {_eq: false}, approve_date: {_is_null: true}}) {
    apply_user
    apply_date
    amount
    c_act_code
    type
    uuid
  }
}`, {}, {
  pollInterval: 5000
})

// computed
const userProfileLogout = () => $store.dispatch("userModule/logout")
const EventList = ref([])
const CoreEventList = ref([])
const FavList = ref([])
const awaitApprovalTableEntries = ref([])
const awaitApprovalPrepaid = ref([])
const StaffCoreEventList = computed(() => CoreEventList.value.filter(x => x.c_respon == username.value))

eventList((result) => {
  if (result.data) EventList.value = result.data.HTX_Event
})

coreEventList((result) => {
  if (result.data) CoreEventList.value = result.data.HTX_Event.map(x => ({
    b_finish: x.b_finish,
    c_act_code: x.c_act_code? x.c_act_code.trim(): '',
    c_act_name: x.c_act_name? x.c_act_name.trim(): '',
    c_act_nameen: x.c_act_nameen? x.c_act_nameen.trim(): '',
    c_acc_type: x.c_acc_type? x.c_acc_type.trim(): '',
    c_dest: x.c_dest? x.c_dest.trim(): '',
    c_nature: x.c_nature? x.c_nature.trim(): '',
    c_respon: x.c_respon? x.c_respon.trim(): '',
    c_type: x.c_type? x.c_type.trim(): '',
    c_status: x.c_status? x.c_status.trim(): '',
    c_group1: x.c_group1? x.c_group1.trim(): '',
    c_group2: x.c_group2? x.c_group2.trim(): '',
    c_worker: x.c_worker? x.c_worker.trim(): '',
    c_worker2: x.c_worker2? x.c_worker2.trim(): '',
    d_date_from: x.d_date_from? x.d_date_from: '',
    d_date_to: x.d_date_to? x.d_date_to: '',
    d_finish_goal: x.d_finish_goal? x.d_finish_goal: '',
    plan_submit: x.Event_to_Evaluation && x.Event_to_Evaluation[0] && x.Event_to_Evaluation[0].submit_plan_date? true: false,
    eval_submit: x.Event_to_Evaluation && x.Event_to_Evaluation[0] && x.Event_to_Evaluation[0].submit_eval_date? true: false,
    isRejected:
      (
        (x.Event_to_Evaluation && x.Event_to_Evaluation[0] && !x.Event_to_Evaluation[0].submit_plan_date) &&
        (x.Event_to_Evaluation && x.Event_to_Evaluation[0] && x.Event_to_Evaluation[0].ic_plan_date)
      ) ||
      (
        (x.Event_to_Evaluation && x.Event_to_Evaluation[0] && !x.Event_to_Evaluation[0].submit_eval_date) &&
        (x.Event_to_Evaluation && x.Event_to_Evaluation[0] && x.Event_to_Evaluation[0].ic_eval_date)
      ) ? true: false,
    isOutstanding:
      (
        x.Event_to_Evaluation.length == 0 ||
        (x.Event_to_Evaluation && x.Event_to_Evaluation[0] && !x.Event_to_Evaluation[0].submit_plan_date) ||
        (
          x.d_date_to &&
          (qdate.getDateDiff(qdate.extractDate(x.d_date_to.trim(), "D/M/YYYY"), new Date()) < 0) &&
          (x.Event_to_Evaluation && x.Event_to_Evaluation[0] && !x.Event_to_Evaluation[0].submit_eval_date)
        )
      )? true: false
  }))
})

fav((result) => {
  if (result.data) FavList.value = result.data.Event_Favourate.map(a => a.Favourate_to_Event)
})

awaitApproval((result) => {
  if (result.data) {
    awaitApprovalTableEntries.value = result.data.Event_Evaluation.map(x => ({
      c_act_code: x.c_act_code,
      c_act_name: x.Evaluation_to_Event.c_act_name,
      submit_plan_date: x.submit_plan_date,
      submit_eval_date: x.submit_eval_date,
      c_status: x.Evaluation_to_Event.c_status,
    }))
  }
})

awaitApprovalPrepaidRecords((result) => {
  if (result.data) awaitApprovalPrepaidRecords.value = result.data.Event_Prepaid
})
// functions
function showDetail(evt, row, index) {
 router.push({
  path: "/event/detail/" + row.c_act_code.trim() + "/content",
 })
}

function MyEventFilter(rows, terms) {
  // rows contain the entire data
  // terms contains whatever you have as filter
  // let lowerSearch = terms.search ? terms.search.toLowerCase() : ""
  return rows.filter((row) => {
    if (terms.c_act_code) {
      return row.b_finish == terms.status && row.c_act_code.includes(terms.c_act_code)
    } else return row.b_finish == terms.status
  });
}

function markHardcopy() {
  let c_act_code = selectedRow.value.map(x=>x.c_act_code)
  const logObject = ref({
    "username": username,
    "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    "module": "活動系統",
    "action": "標示活動: " + c_act_code.join(',') + "為已收到紙本計劃檢討表。"
  })

  loading.value++
  markHardCopyMutation({
    logObject: logObject.value,
    c_act_code: c_act_code,
  })
}
function coreEventFilter(rows, terms) {
  // rows contain the entire data
  // terms contains whatever you have as filter
  // let lowerSearch = terms.search ? terms.search.toLowerCase() : ""
  return rows.filter((row) => {
    if (terms.c_act_code) {
      return (row.b_finish == terms.status && row.c_act_code.includes(terms.c_act_code))
    } else return row.b_finish == terms.status
  });
}

// UI Functions
function notifyClientError(error) {
  $q.notify({ message: "系統錯誤，請重新登入." });
  console.error("error", error);
}

// callbacks
markHardCopyMutation_Completed((result) => {
  selectedRow.value = []
  loading.value--
  $q.notify({ message: "已修改了" + result.data.update_HTX_Event.affected_rows + "項記錄" });
})

eventList_Error((error) => {
  notifyClientError(error)
})

coreEventList_Error((error) => {
  notifyClientError(error)
})

fav_onError((error) => {
  notifyClientError(error)
})
</script>
