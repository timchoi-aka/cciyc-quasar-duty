<template>
  <!-- loading dialog -->
  <q-dialog v-model="waitingAsync" position="bottom">
    <LoadingDialog message="處理中"/>
  </q-dialog>
<!-- 
  :filter="filter"
    :filter-method="tableFilter"
 :rows="dataRows"
    @row-click="rowDetail"
    @request="onRequest"
-->
  <q-dialog
    full-height
    full-width
    v-model="eventDetailDialog"
  >
    <EventDetail :EventID="selectedEventID"/>
  </q-dialog>
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
    :loading="loading"
    binary-state-sort
    @row-click="showDetail"
    />

</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { EVENT_GET_ALL_ACTIVE } from "/src/graphQueries/Event/query.js";
import { useQuery } from "@vue/apollo-composable";
import { useStore } from "vuex";
import LoadingDialog from "components/LoadingDialog.vue"
import EventDetail from "components/Event/EventDetail.vue";

// save current module
const $store = useStore();
$store.dispatch("currentModule/setCurrentModule", "event");

const awaitServerResponse = ref(0)
const initialData = ref()
const selectedEventID = ref("")
// load graphql subscription on event list
// const { result: eventCount } = useSubscription(EVENT_GET_COUNT);
const { result: eventList, loading, fetchMore } = useQuery(EVENT_GET_ALL_ACTIVE);
const eventDetailDialog = ref(false)

// computed variables
const uid = computed(() => $store.getters["userModule/getUID"])
const EventList = computed(() => eventList.value?.HTX_Event??[])
const waitingAsync = computed(() => awaitServerResponse > 0 ? true : false)
// const dataCount = computed(() => eventCount.value? JSON.parse(eventCount.value.HTX_Event_aggregate).aggregate.count:0)
const dataRows = ref([])

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
function getRowsNumberCount(filter) {
  if (!filter) {
    return originalRows.length
  }
  let count = 0
  originalRows.forEach(treat => {
    if (treat.name.includes(filter)) {
      ++count
    }
  })
  return count
}

onMounted(() => {
  initialData.value.requestServerInteraction()
})

/*
onResult((result) => {
  //console.log(JSON.stringify(result))
  // get initial data from server (1st page)
  if (!initialData.value) 
    initialData.value = result.data.HTX_Event
})
*/

// emulate ajax call
// SELECT * FROM ... WHERE...LIMIT...
async function fetchFromServer(startRow, count, filter, sortBy, descending) {
  console.log("inFetchFromServer:" + startRow + ":" + count + ":" + filter + ":" + sortBy + ":" + descending)
  /*
  const data = filter
    ? originalRows.filter(row => row.name.includes(filter))
    : originalRows.slice()

  // handle sortBy
  if (sortBy) {
    const sortFn = sortBy === 'desc'
      ? (descending
          ? (a, b) => (a.name > b.name ? -1 : a.name < b.name ? 1 : 0)
          : (a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0)
        )
      : (descending
          ? (a, b) => (parseFloat(b[ sortBy ]) - parseFloat(a[ sortBy ]))
          : (a, b) => (parseFloat(a[ sortBy ]) - parseFloat(b[ sortBy ]))
        )
    data.sort(sortFn)
  }

  return data.slice(startRow, startRow + count)
  */
  return fetchMore({
    variables: {
      offset: startRow,
      limit: count,
    },
    updateQuery: (previousResult, { fetchMoreResult }) => {
      // No new feed posts
      if (!fetchMoreResult) return previousResult
      //console.log("previousResult:" + JSON.stringify(previousResult))
      //console.log("fetchMoreResult:" + JSON.stringify(fetchMoreResult))
      // Concat previous feed with new feed posts
      return {
        HTX_Event: [
          ...previousResult.HTX_Event,
          ...fetchMoreResult.HTX_Event,
        ],
      }
    },
  })
}

function showDetail(evt, row, index) {
  eventDetailDialog.value = true
  selectedEventID.value = row.c_act_code
}

async function onRequest(props) {
  console.log("props:" + JSON.stringify(props))
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  const filter = props.filter
  console.log("dataCount:" + dataCount)
  //pagination.value.rowsNumber = getRowsNumberCount(filter)
  pagination.value.rowsNumber = 4615

  // get all rows if "All" (0) is selected
  const fetchCount = rowsPerPage === 0 ? pagination.value.rowsNumber : rowsPerPage

  // calculate starting row of data
  const startRow = (page - 1) * rowsPerPage + 1 //offset event 9999

  // fetch data from "server"
  const returnedData = await fetchFromServer(startRow, fetchCount, filter, sortBy, descending)
  //console.log("returnedData:" + JSON.stringify(returnedData))
  // clear out existing data and add new
  dataRows.value.splice(0, dataRows.value.length, ...returnedData.data.HTX_Event)

  // don't forget to update local pagination object
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending
  console.log("pagination: " + JSON.stringify(pagination.value))
}
</script>