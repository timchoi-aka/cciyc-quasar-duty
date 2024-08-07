<template>
  <q-page>
    <!-- loading dialog -->
    <LoadingDialog message="處理中" v-model="loading"/>

    <q-tabs v-model="activeTab" inline-label align="left" class="desktop-only bg-primary text-white q-ma-none" style="margin-top: 55px;">
      <q-tab name="Normal" icon="source" label="一般輸入" />
      <q-tab name="EventBase" icon="event" label="按活動輸入" />
    </q-tabs>

    <q-tab-panels
      v-model="activeTab"
      animated
      swipeable
      transition-prev="jump-up"
      transition-next="jump-up"
    >
      <q-tab-panel name="Normal" class="q-ma-none q-pa-sm text-body1">
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
              <div class="col-1"><MemberSelection :clearable="false" class="text-white" v-model="VolunteerRecord[index].memberInfo.c_mem_id"/></div>
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
              <div class="col-2">會員資料</div><div class="col-10"><MemberSelection :clearable="false" class="text-white" v-model="VolunteerRecord[index].memberInfo.c_mem_id"/></div>
              <div class="col-12 row q-my-sm q-pa-sm bg-blue-1"><MemberInfoByID v-model="VolunteerRecord[index].memberInfo"/></div>
              <div class="col-2">時數</div><div class="col-10"><q-input v-model="VolunteerRecord[index].hours" type="number"/></div>
            </q-card-section>
          </q-card>
        </div>
      </q-tab-panel>

      <q-tab-panel name="EventBase" class="q-ma-none q-pa-sm text-body1">
        <q-chip size="lg" class="bg-primary text-white">活動資料</q-chip>
        <div class="row">
          <div class="col-2">活動編號</div><div class="col-10"><EventSelection v-model="EventBaseData.c_act_code"/></div>
          <div class="col-2">日期</div><div class="col-10"><DateComponent v-model="EventBaseData.eventDate"/></div>
          <div class="col-2">時數</div><div class="col-10"><q-input v-model="EventBaseData.hours" type="number"/></div>
        </div>
        <q-chip size="lg" class="bg-primary text-white">會員資料</q-chip>

        <div class="row">
          <q-btn icon="add" class="bg-primary text-white q-ma-md" label="新增全部已報名會員" @click="addAllRegistered"/>
          <q-btn icon="add" class="bg-primary text-white q-ma-md" label="新增" @click="EventBaseVolunteerRecord.push({...emptyRecord})"/>
          <q-btn icon="save" class="bg-primary text-white q-ma-md" label="儲存" @click="transformAndSave(EventBaseVolunteerRecord)"/>
        </div>
        <div class="row">
          <div v-for="(record, index) in EventBaseVolunteerRecord" :key="index" class="q-mx-md">
            <span>{{ index+1 }}:</span><q-btn icon="delete" flat size="sm" class="text-negative" @click="EventBaseVolunteerRecord.splice(index,1)"/><MemberSelection :clearable="false" :showName="true" class="text-white" v-model="EventBaseVolunteerRecord[index].c_mem_id"/>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>
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
import { date as qdate, useQuasar } from "quasar"
import LoadingDialog from "components/LoadingDialog.vue"
import { onBeforeRouteLeave } from "vue-router"

// variables
const $q = useQuasar()
const VolunteerRecord = ref([])
const EventBaseVolunteerRecord = ref([])
const emptyRecord = ref({c_mem_id: '', u_fee: 0, c_name: '', remark: '', c_sex: '', i_age: '', c_tel: '', d_expired_1: ''})
const loading = ref(0)
const activeTab = ref("EventBase")
const EventBaseData = ref({
  c_act_code: '',
  eventDate: '',
  hours: 0,
})

onBeforeRouteLeave((to, from) => {
  if (EventBaseData.value.c_act_code != "") {
    return new Promise((resolve, reject) => {
      $q.dialog({
        title: "請確認",
        message: '未儲存，確定離開？',
        transitionShow: "slide-up",
        transitionHide: "slide-down",
        position: "bottom",
        ok: {
          push: true,
          label: "確認",
          color: "green",
        },
        cancel: {
          push: true,
          label: "取消",
          color: 'negative'
        },
      }).onOk(() => {
        resolve(true)
      })
    })
  }
})

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

const { result: ApplicantData } = useQuery(gql`
query VolunteerAdd_ApplicantsByActCode($c_act_code: String = "") {
  tbl_act_reg (where: {c_act_code: {_eq: $c_act_code}, b_refund: {_eq: false}}) {
    i_age
    d_reg
    d_refund
    c_type
    c_tel
    c_sex
    c_remarks
    ID
    b_refund
    c_act_code
    c_mem_id
    c_name
    c_receipt_no
  }
}`,
  () => ({
    c_act_code: EventBaseData.value.c_act_code
  }));


// computed
const $store = useStore();
const username = computed(() => $store.getters["userModule/getUsername"])
const Applicants = computed(() => ApplicantData.value?.tbl_act_reg??[])

// functions
function addAllRegistered() {
  //console.log(Applicants.value.map(x => x.c_mem_id))
  if (EventBaseVolunteerRecord.value.length > 0) {
    $q.notify({
      message: "已有會員",
      color: "negative",
      textColor: "white",
      icon: "error"
    })
    return
  }

  let allMember = [...new Set(Applicants.value.map(x => x.c_mem_id))]

  allMember.forEach((data) => {
    EventBaseVolunteerRecord.value.push({
      c_mem_id: data,
      u_fee: 0,
      c_name: '',
      remark: '',
      c_sex: '',
      i_age: '',
      c_tel: '',
      d_expired_1: ''
    })
  })
}

function transformAndSave(record) {
  let vr = []
  //console.log(unref(record))

  record.forEach((rec) => {
    vr.push({
      c_act_code: EventBaseData.value.c_act_code? EventBaseData.value.c_act_code.trim(): '',
      eventDate: EventBaseData.value.eventDate,
      hours: EventBaseData.value.hours,
      memberInfo: {
        c_mem_id: rec.c_mem_id,
      }
    })
  })

  const occurrences = vr.map(x=>x.memberInfo.c_mem_id).reduce(function (acc, curr) {
    return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
  }, {});

  let i = Object.values(occurrences).findIndex((x) => x>1)
  if (i != -1) {
    $q.notify({
      message: "會員" + Object.keys(occurrences)[i] + "重覆輸入",
      color: "negative",
      textColor: "white",
      icon: "error"
    })
    return
  }
  save(vr)
}

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

  loading.value++
  addVolunteer({
    logObject: logObject,
    volObject: volObject
  })
}

// callback
addVolunteer_Completed((result) => {
  VolunteerRecord.value = []
  EventBaseVolunteerRecord.value = []
  EventBaseData.value = {
    c_act_code: '',
    eventDate: '',
    hours: 0,
  }
  loading.value--
  notifyClientSuccess(result)
})

// UI functions
function notifyClientSuccess(result) {
  $q.notify({
    message: "義工記錄" + result.data.insert_Volunteer.returning.map((x) => x.c_mem_id.trim()) + "更新完成。",
  })
}
</script>
