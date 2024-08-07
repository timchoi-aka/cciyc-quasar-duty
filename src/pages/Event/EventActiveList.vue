<template>
  <!-- loading dialog -->
  <LoadingDialog v-model="loading" message="處理中"/>

  <q-table
    ref="initialData"
    class="col"
    dense
    flat
    :rows="EventList"
    :pagination="pagination"
    :columns="eventListColumns"
    color="primary"
    row-key="c_act_code"
    :loading="loadingEvents"
    binary-state-sort
    @row-click="showDetail"
    />

</template>

<script setup>
import { ref } from "vue";
import { EVENT_GET_ALL_ACTIVE } from "/src/graphQueries/Event/query.js";
import { useQuery } from "@vue/apollo-composable";
import { useStore } from "vuex";
import { useQuasar } from "quasar";
import LoadingDialog from "components/LoadingDialog.vue"
import { useRouter } from "vue-router"
const router = useRouter()
// variables
const $store = useStore();
const $q = useQuasar()
const loading = ref(0)
const initialData = ref()

// graphql subscriptions
const { onResult: eventList, loading: loadingEvents, onError: EventListError } = useQuery(EVENT_GET_ALL_ACTIVE, {}, {pollInterval: 5000});

// computed variables
const EventList = ref([])
const userProfileLogout = () => $store.dispatch("userModule/logout")

eventList((result) => {
  if (result.data) EventList.value = result.data.HTX_Event
})

// table config
const pagination = ref({
  rowsPerPage: 30,
  page: 1,
  //rowsNumber: 1000,
  sortBy: "c_act_code",
  descending: true,
})

const eventListColumns = ref([
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
    name: "c_nature",
    label: "性質",
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
    label: "類別",
    field: "c_type",
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
  {
    name: "c_status",
    label: "狀態",
    field: "c_status",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
])

// functions
function showDetail(evt, row, index) {
 router.push({
  path: "/event/detail/" + row.c_act_code.trim() + "/content",
 })
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
EventListError((error) => {
  notifyClientError(error)
})
</script>
