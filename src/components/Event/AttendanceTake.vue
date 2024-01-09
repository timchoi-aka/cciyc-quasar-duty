<template>
  <!-- Main container -->
  <div class="row items-center q-pa-md">
    <!-- Event date selection -->
    <div class="col-md-3 col-sm-6 col-xs-6">
      <q-select use-input new-value-mode="add-unique" label="活動點名日期" v-model="eventDate" @new-value="addDate" :options="eventDateOptions">
        <!-- Date picker icon and popup -->
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <!-- Date picker -->
              <q-date
                :model-value="qdate.formatDate(eventDate, 'YYYY/MM/DD')"
                v-on:update:model-value="(val) => eventDate = qdate.formatDate(val, 'YYYY-MM-DD')">
                <!-- Close button for date picker -->
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="關閉" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-select>
    </div>

    <!-- Print button -->
    <div class="col-auto">
      <q-btn icon="print" label="點名紙" class="bg-primary text-white q-ma-sm" :to="{ name: 'AttendancePrint', params: { id: route.params.id}}"/>
    </div>
  </div>

  <!-- Information chip -->
  <div class="row items-center q-px-md"><q-chip>每節為4小時</q-chip></div>
  <div class="row items-center q-px-md"><q-chip class="bg-primary text-white">已報名會員</q-chip></div>
  <!-- List of applicants -->
  <div v-for="(app, index) in ApplicantsData" class="row col-12 q-px-md items-center">
    <!-- Applicant details -->
    <div class="col-xs-8 col-sm-4 col-md-3"><span>{{ index+1 }}</span><span>)</span> <span>{{ app.c_name }}({{ app.c_mem_id }}) - {{ app.i_age }}歲 <q-chip color="amber" v-if="app.MemberData.isYouth(eventDate)" label="青年"/><q-chip color="blue-3" v-if="app.MemberData.b_mem_type10" label="青年家人"/></span></div>
    <!-- Attendance toggle buttons -->
    <q-btn-toggle size="sm" clearable class="col-xs-auto col-sm-auto col-md-auto" v-model="attendanceList[app.c_mem_id+'-slot_a']" :options="[{label: '早', value: true}]"/>
    <q-btn-toggle size="sm" clearable class="col-xs-auto col-sm-auto col-md-auto" v-model="attendanceList[app.c_mem_id+'-slot_b']" :options="[{label: '午', value: true}]"/>
    <q-btn-toggle size="sm" clearable class="col-xs-auto col-sm-auto col-md-auto" v-model="attendanceList[app.c_mem_id+'-slot_c']" :options="[{label: '晚', value: true}]"/>
  </div>
  <div class="row items-center q-px-md"><q-chip class="bg-teal text-white">非報名會員</q-chip></div>
  <div class="row items-center q-px-md items-center">
    <div class="col-md-2 col-xs-4 col-sm-4 row items-center"><span>早：</span><q-input type="number" v-model="slot_a_attendance"/></div>
    <div class="col-md-2 col-xs-4 col-sm-4 row items-center"><span>午：</span><q-input type="number" v-model="slot_b_attendance"/></div>
    <div class="col-md-2 col-xs-4 col-sm-4 row items-center"><span>晚：</span><q-input type="number" v-model="slot_c_attendance"/></div>
  </div>

  <div class="q-pa-md">
    <q-btn label="提交" class="bg-positive text-white" @click="save" flat :disable="is.deepEqual(originalAttendanceList, attendanceList) && slot_a_attendance + slot_b_attendance + slot_c_attendance == 0"/>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { date as qdate, useQuasar, is } from "quasar";
import { useAttendanceProvider } from "src/providers/attendance"
import { useAttendanceOthersProvider } from "src/providers/attendanceOthers"
import { useApplicantProvider } from "src/providers/applicant"
import { useLogProvider } from "src/providers/log"
import { useRoute } from 'vue-router'
import { watch } from 'vue';


// variables
const route = useRoute()
const c_act_code = route.params.id
const $q = useQuasar()
const $store = useStore();
const attendanceList = ref({})
const originalAttendanceList = ref({})
const eventDateOptions = ref([])
const eventDate = ref(qdate.formatDate(new Date(), 'YYYY-MM-DD'))
const slot_a_attendance = ref(0)
const slot_b_attendance = ref(0)
const slot_c_attendance = ref(0)

// queries
const { result: attendanceResult, loading: loadAttendance, addAttendance } = useAttendanceProvider({ c_act_code: c_act_code})
const { result: attendanceOthersResult, loading: loadAttendanceOthers, addAttendanceOthers } = useAttendanceOthersProvider({ c_act_code: ref(c_act_code) })
const { result: applicantResult, loading: loadApplicant } = useApplicantProvider({ c_act_code: c_act_code})
const { addNewLog } = useLogProvider({ module: ref("活動系統")})

const ApplicantsData = computed(() => applicantResult.value? applicantResult.value: [])

// update attendance list when event date or attendance result changes
watch(([eventDate, attendanceResult]), ([newEventDate, newResult]) => {
  if (newResult && newResult.Attendance) {
    attendanceList.value = {}
    newResult.Attendance.forEach((att) => {
      // add att.d_date to eventDates if not exist
      if (!eventDateOptions.value.includes(qdate.formatDate(att.d_date, 'YYYY-MM-DD'))) {
        eventDateOptions.value.push(qdate.formatDate(att.d_date, 'YYYY-MM-DD'))
      }
      if (qdate.formatDate(att.d_date, 'YYYY-MM-DD') == eventDate.value) attendanceList.value[att.c_mem_id + "-" + att.c_slot] = att.b_attend
    })
    // sort eventDateOptions in ascending order
    eventDateOptions.value.sort((a,b) => qdate.extractDate(a, 'YYYY-MM-DD') - qdate.extractDate(b, 'YYYY-MM-DD'))

    // save original attendanceList for comparison - only enable save button if it has changes
    if (Object.keys(originalAttendanceList.value).length == 0) originalAttendanceList.value = {...attendanceList.value}
  }

  if (newEventDate && attendanceResult.value.length > 0) {
    attendanceList.value = {}
    attendanceResult.value.forEach((att) => {
      if (qdate.formatDate(att.d_date, 'YYYY-MM-DD') == newEventDate) attendanceList.value[att.c_mem_id + "-" + att.c_slot] = att.b_attend
    })
  }
}, { immediate: true });

watch(([eventDate, attendanceOthersResult]), ([newEventDate, newResult]) => {
  if (newResult && newResult.AttendanceOthers) {
    newResult.AttendanceOthers.forEach((att) => {
      // add att.d_date to eventDates if not exist
      if (!eventDateOptions.value.includes(qdate.formatDate(att.d_date, 'YYYY-MM-DD'))) {
        eventDateOptions.value.push(qdate.formatDate(att.d_date, 'YYYY-MM-DD'))
      }
      if (qdate.formatDate(att.d_date, 'YYYY-MM-DD') == eventDate.value && att.c_slot == "slot_a") slot_a_attendance.value = att.i_count
      if (qdate.formatDate(att.d_date, 'YYYY-MM-DD') == eventDate.value && att.c_slot == "slot_b") slot_b_attendance.value = att.i_count
      if (qdate.formatDate(att.d_date, 'YYYY-MM-DD') == eventDate.value && att.c_slot == "slot_c") slot_c_attendance.value = att.i_count
    })
  }

  if (newEventDate && attendanceOthersResult.value && attendanceOthersResult.value.AttendanceOthers && attendanceOthersResult.value.AttendanceOthers.length > 0) {
    slot_a_attendance.value = 0
    slot_b_attendance.value = 0
    slot_c_attendance.value = 0
    attendanceOthersResult.value.AttendanceOthers.forEach((att) => {
      if (qdate.formatDate(att.d_date, 'YYYY-MM-DD') == newEventDate && att.c_slot == "slot_a") slot_a_attendance.value = att.i_count
      if (qdate.formatDate(att.d_date, 'YYYY-MM-DD') == newEventDate && att.c_slot == "slot_b") slot_b_attendance.value = att.i_count
      if (qdate.formatDate(att.d_date, 'YYYY-MM-DD') == newEventDate && att.c_slot == "slot_c") slot_c_attendance.value = att.i_count
    })
  }
}, { immediate: true })

// computed
const username = computed(() => $store.getters["userModule/getUsername"])

// functions
function save() {
  const logObject = ref()
  const logOthersObject = ref()
  let upsertObjects = []
  let upsertOthersObjects = []
  let error = false
  if (Object.keys(attendanceList.value).length > 0) {
    logObject.value = {
      "username": username.value,
      "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      "module": "活動系統",
      "action": "活動點名: " + c_act_code + "。日期：" + qdate.formatDate(eventDate.value, "YYYY-MM-DD") + "。出席會員：" + Object.entries(attendanceList.value).map(([key,value]) => key.split('-')[0] + "(" + key.split('-')[1] + ")" + "=" + (value?'出席':'缺席')).join(", ") + "。"
    }

    Object.entries(attendanceList.value).forEach(([key,value]) => {
      const [MEMBER_ID, SLOT] = key.split("-")
      let i = ApplicantsData.value.findIndex((app) => app.c_mem_id == MEMBER_ID)
      // error when member data is deleted but application record still exist
      if (i == -1) {
        $q.notify({
          message: "找不到會員" + MEMBER_ID + "的資料。",
          color: "negative",
        })
        error = true
        return
      }

      // add new attendance
      upsertObjects.push({
        c_mem_id: MEMBER_ID,
        c_act_code: c_act_code,
        d_date: qdate.formatDate(qdate.extractDate(eventDate.value.trim(), "YYYY-MM-DD"), "YYYY-MM-DDTHH:mm:ss"),
        c_slot: SLOT,
        c_name: ApplicantsData.value[i].MemberData.c_name?ApplicantsData.value[i].MemberData.c_name:ApplicantsData.value[i].MemberData.c_name_other,
        c_user_id: username.value,
        d_updatetime: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
        b_is_youth: (ApplicantsData.value[i].MemberData.isYouth(eventDate.value) || ApplicantsData.value[i].MemberData.b_mem_type10)? true: false,
        b_attend: value? true: false,
      })
    })
  }

  if (parseInt(slot_a_attendance.value) + parseInt(slot_b_attendance.value) + parseInt(slot_c_attendance.value) > 0) {
    logOthersObject.value = {
      "username": username.value,
      "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      "module": "活動系統",
      "action": "活動點名: " + c_act_code + "。日期：" + qdate.formatDate(eventDate.value, "YYYY-MM-DD") + "。非報名會員：（早）" + slot_a_attendance.value + " （午）" + slot_b_attendance.value + " （晚）" + slot_c_attendance.value
    }

    if (parseInt(slot_a_attendance.value) > 0) {
      upsertOthersObjects.push({
        c_act_code: c_act_code,
        d_date: qdate.formatDate(qdate.extractDate(eventDate.value.trim(), "YYYY-MM-DD"), "YYYY-MM-DDTHH:mm:ss"),
        c_updateuser: username.value,
        d_updatetime: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
        c_slot: "slot_a",
        i_count: parseInt(slot_a_attendance.value),
      })
    }

    if (parseInt(slot_b_attendance.value) > 0) {
      upsertOthersObjects.push({
        c_act_code: c_act_code,
        d_date: qdate.formatDate(qdate.extractDate(eventDate.value.trim(), "YYYY-MM-DD"), "YYYY-MM-DDTHH:mm:ss"),
        c_updateuser: username.value,
        d_updatetime: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
        c_slot: "slot_b",
        i_count: parseInt(slot_b_attendance.value),
      })
    }

    if (parseInt(slot_c_attendance.value) > 0) {
      upsertOthersObjects.push({
        c_act_code: c_act_code,
        d_date: qdate.formatDate(qdate.extractDate(eventDate.value.trim(), "YYYY-MM-DD"), "YYYY-MM-DDTHH:mm:ss"),
        c_updateuser: username.value,
        d_updatetime: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
        c_slot: "slot_c",
        i_count: parseInt(slot_c_attendance.value),
      })
    }
  }

  // error prompt and return if error
  if (error) {
    $q.notify({
      message: "資料錯誤，未能儲存。",
      color: "negative",
    })
    return
  }

  // add new attendance and log
  if (upsertObjects.length > 0) {
    addAttendance(upsertObjects).then(() => {
      addNewLog(logObject.value).then(() => {
        $q.notify({
          message: "活動" + c_act_code + ":" + qdate.formatDate(eventDate.value, 'YYYY-MM-DD') + "報名會員點名完成。",
        })
      })
    })
  }

  if (upsertOthersObjects.length > 0) {
    addAttendanceOthers(upsertOthersObjects).then(() => {
      addNewLog(logOthersObject.value).then(() => {
        $q.notify({
          message: "活動" + c_act_code + ":" + qdate.formatDate(eventDate.value, 'YYYY-MM-DD') + "非報名會員點名完成。",
        })
      })
    })
  }
}

function addDate(newValue, done) {
  // Handle the new value
  eventDateOptions.value.push(qdate.formatDate(newValue, "YYYY-MM-DD"));
  // Call done to update the model with the new value
  done(qdate.formatDate(newValue, "YYYY-MM-DD"));
}
</script>
