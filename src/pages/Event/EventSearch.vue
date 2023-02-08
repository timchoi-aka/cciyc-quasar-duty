<template>
  <q-page class="row">
    <q-dialog
      full-height
      full-width
      v-model="eventDetailDialog"
    >
      <EventDetail :EventID="selectedEventID"/>
    </q-dialog>

    <div class="col-2" style="border: 1px solid;">
      <q-form
        @submit="submitSearch"
        @reset="clearSearch"
      >
      <div class="row">
        <q-btn type="submit" class="col-6 bg-secondary text-white" square icon="search" label="搜尋" flat @click="submitSearch"/>
        <q-btn type="reset" class="col-6 bg-negative text-white" square icon="restart_alt" label="重設" flat @click="clearSearch"/>
      </div>
      <div class="column">
        <div><q-input clearable label="活動編號" v-model="search.c_act_code"/></div>
        <div><q-input clearable label="活動名稱" v-model="search.c_act_name"/></div>
        <div><q-select clearable label="會計類別" :options="acc_type" v-model="search.c_acc_type"/></div>
        <div><q-select clearable label="性質" :options="c_nature" v-model="search.c_nature"/></div>
        <div><q-select clearable use-input input-debounce="0" @new-value="newUser" label="負責人員" :options="userList" v-model="search.c_respon"/></div>
        <div><q-select clearable label="大分類" :options="group1" v-model="search.c_group1"/></div>
        <div><q-select clearable label="狀態" :options="status" v-model="search.c_status"/></div>
      </div>
      </q-form>
    </div>
      
    <q-table
      class="col-10"
      dense
      flat
      :rows="EventList"   
      :pagination="pagination"
      :columns="eventListColumns"
      color="primary"
      row-key="c_act_code"
      :loading="loading"
      binary-state-sort
      no-data-label="沒有找到活動"
      @row-click="showDetail"
      />
  </q-page>
</template>

<script setup>
import { computed, ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { useStore } from "vuex";
import { EVENT_SEARCH } from "/src/graphQueries/Event/query.js";
import { usersCollection } from "boot/firebase";
import EventDetail from "components/Event/EventDetail.vue";
import { useQuasar } from "quasar";
import { getDocs, query, where } from "@firebase/firestore";

const UserList = ref([])
const userQuery = query(usersCollection,
  where("privilege.systemAdmin", "==", false),
  where("privilege.tmp", "!=", true)
)
 
getDocs(userQuery).then((userDoc) => {
  userDoc.forEach((doc) => {
    if (doc.data().enable) UserList.value.push(doc.data().name)
  })
})

const $q = useQuasar()
const userList = ref(UserList.value)
const eventDetailDialog = ref(false)
const selectedEventID = ref("")
// save current module
const $store = useStore();
$store.dispatch("currentModule/setCurrentModule", "event");
const userProfileLogout = () => $store.dispatch("userModule/logout")

const searchCondition = ref({
  //condition: {}
})

const search = ref({
  c_act_name: "",
  c_act_code: "",
  c_respon: "",
  c_status: "",
  c_acc_type: "",
  c_group1: "",
  c_nature: "",
})



// computed variables
const uid = computed(() => $store.getters["userModule/getUID"])
const EventList = computed(() => eventList.value?.HTX_Event??[])

// table config
const pagination = ref({
  rowsPerPage: 30,
  page: 1,
  sortBy: "c_act_code",
  descending: true,
})

const acc_type = ref([
  'PF', 'CF', 'RF', 'MF', 'SF'
])

const c_nature = ref([
  '核心青年服務A','核心青年服務B','核心青年服務C','核心青年服務D','非核心青年服務','其他服務'
])

const group1 = ref([
  '社交/興趣','學習/發展','義務工作','青少年就業','家長服務','新來港人士服務','社區服務','中心設施'
])

const status = ref([
  '完成達標', '未完成', '取消', '完成不達標'
])
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

//function
function submitSearch() {
  searchCondition.value.condition = {}
  if (search.value.c_act_name) searchCondition.value.condition.c_act_name = {"_like" : "%"+search.value.c_act_name+"%"} 
  if (search.value.c_act_code) searchCondition.value.condition.c_act_code = {"_eq" : search.value.c_act_code} 
  if (search.value.c_respon) searchCondition.value.condition.c_respon = {"_eq" : search.value.c_respon} 
  if (search.value.c_status) searchCondition.value.condition.c_status = {"_eq" : search.value.c_status} 
  if (search.value.c_acc_type) searchCondition.value.condition.c_acc_type = {"_eq" : search.value.c_acc_type} 
  if (search.value.c_group1) searchCondition.value.condition.c_group1 = {"_eq" : search.value.c_group1} 
  if (search.value.c_nature) searchCondition.value.condition.c_nature = {"_eq" : search.value.c_nature} 
  //console.log(searchCondition.value)
  refetch()
}

function showDetail(evt, row, index) {
  eventDetailDialog.value = true
  selectedEventID.value = row.c_act_code
}

function clearSearch() {
  search.value = {
    c_act_name: "",
    c_act_code: "",
    c_respon: "",
    c_status: "",
    c_acc_type: "",
    c_group1: "",
    c_nature: "",
  }
  delete searchCondition.value.condition
  refetch()
}

function newUser(val, done) {
  if (val.length > 0) {
    if (!userList.value.includes(val)) {
      userList.value.push(val)
    }
    done(val, 'toggle')
  }
}
// actual query
const { result: eventList, loading, refetch, onError: EventListError } = useQuery(EVENT_SEARCH, searchCondition.value);

EventListError((error) => {
  // console.log("error in module:" + JSON.stringify(error))
  if (error.graphQLErrors[0].extensions.code == "invalid-jwt") {
    userProfileLogout()
      .then(() => {
        $q.notify({ message: "系統逾時，自動登出." });
      })
      .catch((error) => console.log("error", error));
  }
})
</script>