<template>
  <q-page>
    <!-- loading dialog -->
    <q-dialog v-model="waitingAsync" position="bottom">
      <LoadingDialog message="處理中"/>
    </q-dialog>

    <!-- modification dialog -->
    <q-dialog v-model="showModificationDialog" persistent>
      <q-card style="width: 70vw" class="q-pa-none">
        <q-card-section class="fit q-pa-none">
          <div class="text-h6 bg-blue-3 text-center">確定修改義工記錄？</div>
        </q-card-section>

        <q-card-section
          class="bg-grey-2 q-pa-xs"
          :style="
            $q.screen.lt.sm
              ? 'height: 40vw; max-height: 40vw'
              : 'height: 30vw; max-height: 30vw'
          "
        >
          
            <div class="row">
              <div class="row col-12 q-my-sm"><div class="col-2">日期：</div><div class="col-10"><DateComponent v-model="modifyingRow.event_date"/></div></div>
              <div class="row col-12 q-my-sm"><div class="col-2">活動：</div><div class="col-10"><EventSelection v-model="modifyingRow.c_act_code"/></div></div>
              <div class="row col-12 q-my-sm"><div class="col-2">會員：</div><div class="col-10"><MemberSelection v-model="modifyingRow.c_mem_id"/></div></div>
              <div class="row col-12 q-my-sm"><div class="col-2">時數：</div><div class="col-10"><q-input v-model="modifyingRow.hours" type="number"/></div></div>
            </div>
          
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn
            v-close-popup
            flat
            color="grey"
            label="取消"
            @click="modifyingRow = {}"
          />
          <q-btn
            v-close-popup
            @click="confirmModify"
            flat
            color="teal"
            label="確認修改"
            icon="edit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- delete dialog -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card style="width: 70vw" class="q-pa-none">
        <q-card-section class="fit q-pa-none">
          <div class="text-h5 bg-blue-3 text-center">確定刪除義工服務記錄？</div>
        </q-card-section>

        <q-card-section
          class="scroll bg-grey-2 q-pa-xs text-center"
          :style="
            $q.screen.lt.sm
              ? 'height: 40vw; max-height: 40vw'
              : 'height: 20vw; max-height: 20vw'
          "
        >
          <div
            style="border: 1px solid"
            class="col-6 q-pa-sm full-width q-mt-sm"
            v-for="(record, index) in selectedRow"
            :key="index"
            v-html="
              qdate.formatDate(record.event_date, 'YYYY年M月D日') +
              ' - ' + record.c_act_code + ' - ' + 
              record.c_act_name +
              ' 【(' +
              record.c_mem_id + ') ' + record.c_name +
              ' - ' +
              record.hours +
              '小時】 '
            "
          />
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn v-close-popup flat color="grey" label="取消" />
          <q-btn
            v-close-popup
            @click="confirmDelete"
            flat
            color="teal"
            label="確認刪除"
            icon="delete_forever"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- sticky button at bottom -->
    <q-page-sticky
      position="bottom-right"
      :offset="[20, 20]"
      style="z-index: 1"
    >
      <q-fab
        v-if="selectedRow.length == 1"
        label="修改"
        icon="edit"
        color="warning"
        push
        @click="modifyRow"
      />
      <q-fab
        v-if="selectedRow.length"
        label="刪除"
        icon="close"
        color="red"
        push
        @click="showDeleteDialog = true"
      />
    </q-page-sticky>

    <div v-if="$q.screen.gt.sm" class="row fit items-start" style="margin-top: 70px;">
      <div class="col-4"><EventSelection v-model="searchOptions.c_act_code"/></div>
      <div class="col-shrink q-mx-sm">或</div>
      <div class="col-4"><MemberSelection class="text-white" v-model="searchOptions.c_mem_id"/></div>
      <div class="col-1"><q-btn icon="search" class="bg-primary text-white" label="搜尋" @click="search"/></div>
      <div class="col-2"><q-btn class="bg-primary text-white" label="顯示全部記錄" @click="showAll"/></div>
    </div>
    
    <div v-else class="row fit" style="margin-top: 70px;">
      <div class="col-12">活動編號：<EventSelection v-model="searchOptions.c_act_code"/></div>
      <div class="col-12">或</div>
      <div class="col-12">會員號碼：<MemberSelection class="text-white" v-model="searchOptions.c_mem_id"/></div>
      <div class="col-3 q-my-sm"><q-btn icon="search" class="bg-primary text-white" label="搜尋" @click="refetch"/></div>
      <div class="col-3 q-my-sm"><q-btn class="bg-primary text-white" label="顯示全部記錄" @click="showAll"/></div>
    </div>
    
    <q-table
      dense
      flat
      title="義工記錄"
      :rows="volunteerData"
      :columns="VolunteerTableColumns"
      :pagination="defaultPagination"
      color="primary"
      row-key="uuid"
      :loading="loading"
      no-data-label="沒有資料"
      selection="multiple"
      v-model:selected="selectedRow"
    />
    
  </q-page>
</template>

<script setup>
import { ref, computed } from "vue"
import { useStore } from "vuex";
import MemberSelection from "components/Member/MemberSelection.vue"
import EventSelection from "components/Event/EventSelection.vue"
import MemberInfoByID from "components/Member/MemberInfoByID.vue"
import DateComponent from "components/Basic/DateComponent.vue"
import { useMutation, useQuery } from "@vue/apollo-composable"
import { gql } from "graphql-tag"
import { date as qdate, is, useQuasar } from "quasar"
import LoadingDialog from "components/LoadingDialog.vue"

// variables
const $q = useQuasar()
const showDeleteDialog = ref(false)
const showModificationDialog = ref(false)
const searchOptions = ref({
  c_mem_id: '', 
  c_act_code: ''
})
const awaitServerResponse = ref(0)
const queryFilter = ref({
  where: {
    _and: {
      c_act_code: {_eq: searchOptions.value.c_act_code},
      c_mem_id: {_eq: searchOptions.value.c_mem_id}
    }
  }
})
const defaultPagination = ref({
  rowsPerPage: 40,
  sortBy: "event_date",
  descending: true,
})
const selectedRow = ref([])
const modifyingRow = ref({})

const VolunteerTableColumns = ref([
  {
    name: "event_date",
    label: "服務日期",
    field: "event_date",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => qdate.formatDate(val, "YYYY年M月D日(ddd)", {
                  daysShort: ['日', '一', '二', '三', '四', '五', '六'],
                })
  }, 
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
    name: "c_mem_id",
    label: "會員編號",
    field: "c_mem_id",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  }, 
  {
    name: "c_name",
    label: "姓名",
    field: "c_name",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  }, 
  {
    name: "hours",
    label: "服務時數",
    field: "hours",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  }, 
])
// query
const { result, refetch, loading } = useQuery(gql`
query GetVolunteer(
  $where: Volunteer_bool_exp = {}
  ) {
    Volunteer(where: $where) {
    c_act_code
    c_mem_id
    event_date
    hours
    uuid
    Volunteer_to_Event {
      c_act_code
      c_act_name
    }
    Volunteer_to_Member {
      c_mem_id
      c_name
    }
  }
}`, () => queryFilter.value)

const { mutate: editVolunteer, onDone: editVolunteer_Completed, onError: editVolunteer_Error } = useMutation(gql`
mutation EditVolunteer(
  $uuid: uniqueidentifier = "", 
  $logObject: Log_insert_input! = {}, 
  $volObject: Volunteer_set_input = {}) {
  update_Volunteer_by_pk(pk_columns: {uuid: $uuid}, _set: $volObject) {
    c_act_code
    c_mem_id
    hours
    event_date
    uuid
  }
  insert_Log_one(object: $logObject) {
    log_id
  }
}`)


const { mutate: delVolunteer, onDone: delVolunteer_Completed, onError: delVolunteer_Error } = useMutation(gql`
mutation DelVolunteer(
  $logObject: Log_insert_input! = {}, 
  $volObject: [uniqueidentifier!] = "",
  ) {
  delete_Volunteer(where: {uuid: {_in: $volObject}}) {
    affected_rows
  }
  insert_Log_one(object: $logObject) {
    log_id
  }
}`)

// computed
const $store = useStore();
const username = computed(() => $store.getters["userModule/getUsername"])
const waitingAsync = computed(() => awaitServerResponse.value > 0)
const volunteerData = computed(() => {
  let res = []
  if (result.value) {
    result.value.Volunteer.forEach((record) => {
      res.push({
        event_date: record.event_date,
        c_act_code: record.c_act_code,
        c_act_name: record.Volunteer_to_Event.c_act_name,
        c_mem_id: record.c_mem_id,
        c_name: record.Volunteer_to_Member.c_name,
        hours: record.hours,
        uuid: record.uuid,
      })
    })
  }
  return res
})

// functions
function search() {
  if (searchOptions.value.c_mem_id && !searchOptions.value.c_act_code) {
    queryFilter.value = {
      where: {
        c_mem_id: {_eq: searchOptions.value.c_mem_id}
      }
    }
  } else if (!searchOptions.value.c_mem_id && searchOptions.value.c_act_code) {
    queryFilter.value = {
      where: {
        c_act_code: {_eq: searchOptions.value.c_act_code}
      }
    }
  } else {
    queryFilter.value = {
      where: {
        _and: {
          c_act_code: {_eq: searchOptions.value.c_act_code?searchOptions.value.c_act_code:''},
          c_mem_id: {_eq: searchOptions.value.c_mem_id?searchOptions.value.c_mem_id:''}
        }
      }
    }
  }

  refetch()
}

function showAll() {
  queryFilter.value = {}
  refetch()
}

function modifyRow() {
  Object.assign(modifyingRow.value, selectedRow.value[0])
  showModificationDialog.value = true
}

function confirmModify() {
  if (!modifyingRow.value.event_date || !modifyingRow.value.c_act_code || !modifyingRow.value.c_mem_id || !is.number(parseFloat(modifyingRow.value.hours))) {
    $q.notify({
      message: "請輸入有效資料",
      color: "negative",
      textColor: "white",
      icon: "error"
    })
    return
  }

  let changeObject = {
    event_date: qdate.formatDate(modifyingRow.value.event_date, "YYYY-MM-DDT00:00:00"),
    c_mem_id: modifyingRow.value.c_mem_id.trim(),
    c_act_code: modifyingRow.value.c_act_code.trim(),
    hours: parseFloat(modifyingRow.value.hours)
  }
  let logContent = "舊資料：" + JSON.stringify(selectedRow.value[0]) + " - 新資料：" + JSON.stringify(changeObject)

  let logObject = {
    "username": username.value,
    "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    "module": "會員系統",
    "action": "修改義工記錄: " + logContent
  }

  awaitServerResponse.value++
  editVolunteer({
    uuid: modifyingRow.value.uuid,
    volObject: changeObject,
    logObject: logObject,
  })
}

function confirmDelete() {
  let volObject = selectedRow.value.map((x) => x.uuid)
  let logContent = ""

  selectedRow.value.forEach((record) => {
    logContent += "【" + qdate.formatDate(record.event_date, "YYYY年M月D日") + "-活動：" + record.c_act_code.trim() + "-會員：" + record.c_mem_id.trim() + "-" + record.hours + "小時】、"
  })
  
  let logObject = {
    "username": username.value,
    "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    "module": "會員系統",
    "action": "刪除義工記錄: " + logContent
  }
  
  awaitServerResponse.value++
  delVolunteer({
    logObject: logObject,
    volObject: volObject,
  })
  
}

// callback
delVolunteer_Completed((result) => {
  refetch()
  selectedRow.value = []
  awaitServerResponse.value--
  notifyClientSuccess(result)
})

editVolunteer_Completed((result) => {
  refetch()
  selectedRow.value = []
  awaitServerResponse.value--
  $q.notify({
    message: "成功修改義工記錄。",
  })
})

// UI functions
function notifyClientSuccess(result) {
  awaitServerResponse.value--  
  $q.notify({
    message: "刪除" + result.data.delete_Volunteer.affected_rows + "條義工記錄。",
  })
  
}
</script>