<template>
  <q-table
    :rows="StatData"
    :columns="statTableColumn"
    no-data-label="沒有統計數據"
    :pagination="pagination"
    :loading="loading"
    >
    <!-- add data button -->
    <template v-slot:top>
      <q-btn color="primary" icon="add" :disable="loading" label="新增" @click="addRow" />
      <q-btn class="q-ml-md" color="positive" icon="save" :disable="(JSON.stringify(StatData) == JSON.stringify(serverStat))" label="儲存" @click="save" />
    </template>

    <!-- popup edit on body cell -->
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td key="action" :props="props">
          <q-btn v-if="eventMonthValidation(props.row.d_act)" icon="delete" class="text-negative" flat @click="deleteRow(props.row.d_act, props.row.inCenter)"/>
        </q-td>
        <q-td key="inCenter" :props="props">
          <q-icon v-if="props.row.inCenter" color="positive" name="check">
            <q-popup-edit v-if="eventMonthValidation(props.row.d_act)" filled v-model="props.row.inCenter" title="中心舉行" auto-save v-slot="scope">
              <q-toggle v-model="scope.value"/>
            </q-popup-edit>  
          </q-icon>
          <q-icon v-else color="negative" name="cancel">
            <q-popup-edit v-if="eventMonthValidation(props.row.d_act)" filled v-model="props.row.inCenter" title="中心舉行" auto-save v-slot="scope">
              <q-toggle v-model="scope.value"/>
            </q-popup-edit>  
          </q-icon>
        </q-td>
        <!-- error-message="未能新增/修改舊記錄"
              :error="isPastDeadline" -->
        <q-td key="d_act" :props="props">
          {{ props.row.d_act }}
          <q-popup-edit v-if="!props.row.d_act" filled v-model="props.row.d_act" title="活動月份" 
            auto-save v-slot="scope"
            :validate="eventMonthValidation"
            @hide="eventMonthValidation"
            >
            <q-input v-model="scope.value" mask="##/####" hint="MM/YYYY" dense autofocus counter 
              @keyup.enter="scope.set" 
              :error="errorDate"
              :error-message="errorMessageDate"
              />
          </q-popup-edit>
        </q-td>
        <q-td key="i_number" :props="props">
          {{ props.row.i_number }}
          <q-popup-edit v-if="eventMonthValidation(props.row.d_act)" v-model.number="props.row.i_number" auto-save v-slot="scope">
            <q-input type="number" v-model.number="scope.value" dense autofocus @keyup.enter="scope.set" />
          </q-popup-edit>
        </q-td>
        <q-td key="i_people_count" :props="props">
          {{ props.row.i_people_count }}
          <q-popup-edit v-if="eventMonthValidation(props.row.d_act)" v-model.number="props.row.i_people_count" auto-save v-slot="scope">
            <q-input type="number" v-model.number="scope.value" dense autofocus @keyup.enter="scope.set" />
          </q-popup-edit>
        </q-td>
        <q-td key="i_number_a" :props="props">
          {{ props.row.i_number_a }}
          <q-popup-edit v-if="eventMonthValidation(props.row.d_act)" v-model.number="props.row.i_number_a" auto-save v-slot="scope">
            <q-input type="number" v-model.number="scope.value" dense autofocus @keyup.enter="scope.set" />
          </q-popup-edit>
        </q-td>
        <q-td key="i_people_count_a" :props="props">
          {{ props.row.i_people_count_a }}
          <q-popup-edit v-if="eventMonthValidation(props.row.d_act)" v-model.number="props.row.i_people_count_a" auto-save v-slot="scope">
            <q-input type="number" v-model.number="scope.value" dense autofocus @keyup.enter="scope.set" />
          </q-popup-edit>
        </q-td>
        <q-td key="i_number_b" :props="props">
          {{ props.row.i_number_b }}
          <q-popup-edit v-if="eventMonthValidation(props.row.d_act)" v-model.number="props.row.i_number_b" auto-save v-slot="scope">
            <q-input type="number" v-model.number="scope.value" dense autofocus @keyup.enter="scope.set" />
          </q-popup-edit>
        </q-td>
        <q-td key="i_people_count_b" :props="props">
          {{ props.row.i_people_count_b }}
          <q-popup-edit v-if="eventMonthValidation(props.row.d_act)" v-model.number="props.row.i_people_count_b" auto-save v-slot="scope">
            <q-input type="number" v-model.number="scope.value" dense autofocus @keyup.enter="scope.set" />
          </q-popup-edit>
        </q-td>
        <q-td key="i_number_c" :props="props">
          {{ props.row.i_number_c }}
          <q-popup-edit v-if="eventMonthValidation(props.row.d_act)" v-model.number="props.row.i_number_c" auto-save v-slot="scope">
            <q-input type="number" v-model.number="scope.value" dense autofocus @keyup.enter="scope.set" />
          </q-popup-edit>
        </q-td>
        <q-td key="i_people_count_c" :props="props">
          {{ props.row.i_people_count_c }}
          <q-popup-edit v-if="eventMonthValidation(props.row.d_act)" v-model.number="props.row.i_people_count_c" auto-save v-slot="scope">
            <q-input type="number" v-model.number="scope.value" dense autofocus @keyup.enter="scope.set" />
          </q-popup-edit>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { date as qdate, useQuasar} from "quasar";
import { EVENT_STAT_BY_PK } from "/src/graphQueries/Event/query.js"
import { UPDATE_EVENT_STAT_BY_PK, DELETE_EVENT_STAT } from "/src/graphQueries/Event/mutation.js"
import { useQuery, useMutation } from "@vue/apollo-composable"

// props
const props = defineProps({
  c_act_code: String, 
})

// variables
const $q = useQuasar()
const $store = useStore();
const StatData = ref([])
const deleteData = ref([])
const errorDate = ref(false)
const errorMessageDate = ref("未能新增/修改舊記錄")

const statTableColumn = ref([
  {
    name: "action",
    label: "動作",
    field: "action",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "inCenter",
    label: "中心舉行",
    field: "inCenter",
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
  {
    name: "i_number_a",
    label: "兒童節數",
    field: "i_number_a",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "i_people_count_a",
    label: "兒童人次",
    field: "i_people_count_a",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "i_number_b",
    label: "家長節數",
    field: "i_number_b",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "i_people_count_b",
    label: "家長人次",
    field: "i_people_count_b",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "i_number_c",
    label: "社區人士節數",
    field: "i_number_c",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "i_people_count_c",
    label: "社區人士人次",
    field: "i_people_count_c",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
])
const pagination = ref({
  rowsPerPage: 30,
  sortBy: "d_act",
  descending: true,
})

// query
const { result: EventStat, onError: EventStatError, loading, refetch, onResult } = useQuery(
  EVENT_STAT_BY_PK,
  () => ({
    c_act_code: props.c_act_code
  }), {
    notifyOnNetworkStatusChange: true
  });
const { mutate: updateEventStat, onDone: updateEventStat_Completed, onError: updateEventStat_Error } = useMutation(UPDATE_EVENT_STAT_BY_PK)
const { mutate: deleteEventStat, onDone: deleteEventStat_Completed, onError: deleteEventStat_Error } = useMutation(DELETE_EVENT_STAT)

// computed
const serverStat = computed(() => EventStat.value?.tbl_act_session??[])
const username = computed(() => $store.getters["userModule/getUsername"])
const userProfileLogout = () => $store.dispatch("userModule/logout")
const isCenterIC = computed(() => $store.getters["userModule/getCenterIC"])
const deadline = computed(() => {
  let d = qdate.addToDate(new Date(), {hours: 8})
  if (d.getDate() > 10) return qdate.startOfDate(d, 'month')
  else return qdate.startOfDate(qdate.subtractFromDate(d, {month: 1}), 'month')
})

// functions
function addRow() {
  StatData.value.push({
    c_act_code: props.c_act_code.trim(),
    d_act: "",
    i_number: 0,
    i_people_count: 0, 
    i_number_a: 0,
    i_people_count_a: 0,
    i_number_b: 0,
    i_people_count_b: 0,
    i_number_c: 0,
    i_people_count_c: 0,
    inCenter: true,
  })
}

function save() {
  if (StatData.value.length > 0) {
    const logObject = ref({
      "username": username,
      "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      "module": "活動系統",
      "action": "修改活動統計數據: " + props.c_act_code + "。新資料:" + JSON.stringify(StatData.value, null, 2)
    })
    
    StatData.value.forEach((data) => {
      delete data["__typename"]
    })
    
    updateEventStat({
      objects: StatData.value,
      logObject: logObject.value,
    })
  }

  if (deleteData.value.length > 0) {
    deleteData.value.forEach((data) => {
      delete data["__typename"]
    })

    const logObject = ref({
      "username": username,
      "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      "module": "活動系統",
      "action": "刪除活動統計數據: " + props.c_act_code + "。刪除資料:" + JSON.stringify(deleteData.value, null, 2)
    })

    deleteEventStat({
      delete_dAct: deleteData.value.map(a => a.d_act),
      delete_cActCode: props.c_act_code,
      delete_inCenter: deleteData.value.map(a => a.inCenter),
      logObject: logObject.value,
    })
  }
}

function eventMonthValidation(val) {
  let d = qdate.extractDate(val, 'MM/YYYY')
  if (!isCenterIC.value && d < deadline.value) {
    errorDate.value = true
    return false
  }
  errorDate.value = false 
  return true
}

function deleteRow(d_act, inCenter) {
  let i = StatData.value.findIndex((element) => element.d_act == d_act && element.inCenter == inCenter)
  deleteData.value.push(StatData.value[i])
  StatData.value.splice(i, 1)
}

// UI functions
function notifyClientError(error) {
  $q.notify({ message: "系統錯誤，請重新載入." });
  console.error("error", error);
}

function notifyClientSuccess(result) {
  refetch()
  $q.notify({
    message: "更新活動統計資料" + props.c_act_code + "完成。",
  })
}

// callback
EventStatError((error) => {
  notifyClientError(error)
})

updateEventStat_Error((error) => {
  notifyClientError(error)
})

deleteEventStat_Error((error) => {
  notifyClientError(error)
})

updateEventStat_Completed((result) => {
  notifyClientSuccess(result.data.insert_tbl_act_session.returning.c_act_code)
})

deleteEventStat_Completed((result) => {
  deleteData.value = []
  notifyClientSuccess(props.c_act_code)
})

onResult((result) => {
  StatData.value = result.data? JSON.parse(JSON.stringify(result.data.tbl_act_session)): []  
})
</script>