<template>
  <q-page>
    <!-- loading dialog -->
    <q-dialog v-model="waitingAsync" position="bottom">
      <LoadingDialog message="處理中"/>
    </q-dialog>
    
    <q-btn icon="add" class="bg-primary text-white q-ma-md" label="新增" @click="VolunteerRecord.push({c_act_code: '', eventDate: '', memberInfo: emptyRecord, hours: 0})"/>
    <q-btn icon="save" class="bg-primary text-white q-ma-md" label="儲存" @click="save(VolunteerRecord)"/>
    <div v-if="VolunteerRecord.length">
      <q-card v-if="$q.screen.gt.sm" bordered class="q-ma-sm q-pa-sm">
        <div class="row text-body1 text-bold">
          <div class="col-shrink"><q-chip>#</q-chip></div>
          <div class="col-2">活動編號</div>
          <div class="col-2">日期</div>
          <div class="col-6">會員資料</div>
          <div class="col-1">時數</div>
        </div>
        <div v-for="(record, index) in VolunteerRecord" :key="index" class="row">
          <div class="col-shrink text-bold text-center"><q-btn flat round icon="cancel" :label="index+1" @click="VolunteerRecord.splice(index,1)"/></div>
          <div class="col-2"><EventSelection v-model="VolunteerRecord[index].c_act_code"/></div>
          <div class="col-2 q-px-sm"><DateComponent v-model="VolunteerRecord[index].eventDate"/></div>
          <div class="col-1"><MemberSelection class="text-white" v-model="VolunteerRecord[index].memberInfo.c_mem_id"/></div>
          <div class="col-5 row text-body1"><MemberInfoByID v-model="VolunteerRecord[index].memberInfo"/></div>
          <div class="col-1"><q-input v-model="VolunteerRecord[index].hours" type="number"/></div>
        </div>
      </q-card>

      <q-card v-else>
        <q-card-section v-for="(record, index) in VolunteerRecord" :key="index" class="row q-py-sm">
          <div class="col-11 text-bold text-left"><q-chip>{{ index + 1 }}</q-chip></div>
          <q-btn class="col-1" flat round icon="cancel" @click="VolunteerRecord.splice(index,1)">
            <q-tooltip class="bg-white text-primary">刪除</q-tooltip>
          </q-btn>
          <div class="col-2">活動編號</div><div class="col-10"><EventSelection v-model="VolunteerRecord[index].c_act_code"/></div>
          <div class="col-2">日期</div><div class="col-10"><DateComponent v-model="VolunteerRecord[index].eventDate"/></div>
          <div class="col-2">會員資料</div><div class="col-10"><MemberSelection class="text-white" v-model="VolunteerRecord[index].memberInfo.c_mem_id"/></div>
          <div class="col-12 row q-my-sm q-pa-sm bg-blue-1"><MemberInfoByID v-model="VolunteerRecord[index].memberInfo"/></div>
          <div class="col-2">時數</div><div class="col-10"><q-input v-model="VolunteerRecord[index].hours" type="number"/></div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from "vue"
import { useStore } from "vuex";
import MemberSelection from "components/Member/MemberSelection.vue"
import EventSelection from "components/Event/EventSelection.vue"
import MemberInfoByID from "components/Member/MemberInfoByID.vue"
import DateComponent from "components/Basic/DateComponent.vue"
import { useMutation } from "@vue/apollo-composable"
import { gql } from "graphql-tag"
import { date as qdate, useQuasar } from "quasar"
import LoadingDialog from "components/LoadingDialog.vue"

// variables
const $q = useQuasar()
const VolunteerRecord = ref([])
const emptyRecord = ref({c_mem_id: '', u_fee: 0, c_name: '', remark: '', c_sex: '', i_age: '', c_tel: '', d_expired_1: ''})
const awaitServerResponse = ref(0)

// query
const { mutate: addVolunteer, onDone: addVolunteer_Completed, onError: addVolunteer_Error } = useMutation(gql`
mutation AddVolunteer(
  $logObject: Log_insert_input! = {}, 
  $volObject: [Volunteer_insert_input!] = {},
  ) {
  insert_Volunteer(objects: $volObject) {
    returning {
      c_act_code
      c_mem_id
      event_date
      hours
      uuid
    }
  }
  insert_Log_one(object: $logObject) {
    log_id
  }
}`)

// computed
const $store = useStore();
const username = computed(() => $store.getters["userModule/getUsername"])
const waitingAsync = computed(() => awaitServerResponse > 0)

// functions
function save(record) {
  let volObject = []
  record.forEach((rec) => {
    if (rec.memberInfo.c_mem_id && rec.c_act_code && rec.eventDate && rec.hours) {
      volObject.push({
        c_mem_id: rec.memberInfo.c_mem_id.trim(),
        c_act_code: rec.c_act_code.trim(),
        event_date: qdate.formatDate(qdate.extractDate(rec.eventDate, "YYYY/MM/DD"), "YYYY-MM-DDT00:00:00"),
        hours: parseFloat(rec.hours)
      })
    }
  })
  
  if (volObject.length == 0) {
    $q.notify({
      message: "請輸入有效資料",
      color: "negative",
      textColor: "white",
      icon: "error"
    })
    return
  }

  let logObject = {
    "username": username.value,
    "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    "module": "會員系統",
    "action": "新增義工記錄: " + JSON.stringify(volObject)
  }
  
  awaitServerResponse.value++
  addVolunteer({
    logObject: logObject,
    volObject: volObject
  })
}

// callback
addVolunteer_Completed((result) => {
  VolunteerRecord.value = []
  awaitServerResponse.value--
  notifyClientSuccess(result)
})

// UI functions
function notifyClientSuccess(result) {
  $q.notify({
    message: "義工記錄" + result.data.insert_Volunteer.returning.map((x) => x.c_mem_id.trim()) + "更新完成。",
  })
}
</script>