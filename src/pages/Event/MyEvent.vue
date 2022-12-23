<template>
  <!-- loading dialog -->
  <q-dialog v-model="waitingAsync" position="bottom">
    <LoadingDialog message="處理中"/>
  </q-dialog>

  <!-- event detail modal -->
  <q-dialog
    full-height
    full-width
    v-model="eventDetailDialog"
    z-index="1"
  >
    <EventDetail :EventID="selectedEventID"/>
  </q-dialog>

  <div class="row">
    <!-- my events -->
    <div class="col-7">
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
          進行中<q-toggle v-model="filter.status"/>已完成
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
    </div>

    <!-- favourate -->
    <div class="col-5">
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
    </div>
  </div>
  <div class="q-mt-md col-12">
    <div class="row col-12">
      <q-chip class="bg-negative text-white" size="lg" label="待審批 - 主任only"/>
    </div>
    待主任審批的活動檢討
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useSubscription } from "@vue/apollo-composable";
import { useStore } from "vuex";
import { MY_EVENT_SEARCH, MY_FAV } from "/src/graphQueries/Event/query.js";
import EventDetail from "components/Event/EventDetail.vue";
import LoadingDialog from "components/LoadingDialog.vue"
import { date as qdate, useQuasar } from "quasar";

// variables
const $store = useStore();
const $q = useQuasar()
const awaitServerResponse = ref(0)
const selectedEventID = ref("")
const filter = ref({
  status: false,
  c_act_code: ""
})
const eventDetailDialog = ref(false)
const username = computed(() => $store.getters["userModule/getUsername"])
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

// setting current module
$store.dispatch("currentModule/setCurrentModule", "event");

// queries
const { result: eventList, onError } = useSubscription(MY_EVENT_SEARCH, searchCondition.value);
const { result: fav, onError: fav_onError } = useSubscription(MY_FAV, 
() => ({
  username: username.value
}));

// computed
const userProfileLogout = () => $store.dispatch("userModule/logout")
const EventList = computed(() => eventList.value?.HTX_Event??[])
const FavList = computed(() => fav.value?.Event_Favourate.map(a => a.Favourate_to_Event)??[])
const waitingAsync = computed(() => awaitServerResponse > 0 ? true : false)

// functions 
function showDetail(evt, row, index) {
  eventDetailDialog.value = true
  selectedEventID.value = row.c_act_code
}

function MyEventFilter(rows, terms) {
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
  userProfileLogout()
    .then(() => {
      $q.notify({ message: "系統錯誤，請重新登入." });
    })
    .catch((error) => console.log("error", error));   
}

// callbacks
onError((error) => {
  notifyClientError(error)
})

fav_onError((error) => {
  notifyClientError(error)
})
</script>