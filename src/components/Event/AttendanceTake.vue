<template>
  <div class="row items-center">

    attendanceList: {{ attendanceList }}
    <div class="col-9">
      <DateComponent v-model="eventDate" label="活動日期"/>
    </div>
    <q-space/>
    <div class="col-2">
      <q-btn icon="print" label="列印點名紙" class="fit bg-primary text-white" :to="{ name: 'AttendancePrint', params: { id: route.params.id}}"/>
    </div>
  </div>
  <div v-for="(app, index) in ApplicantsData" class="row col-12">
    <span class="col-4 text-body1"><span>{{ index+1 }}</span><span>)</span> <span>{{ app.c_name }}({{ app.c_mem_id }}) - {{ app.i_age }}歲 <q-chip color="amber" v-if="app.MemberData.isYouth(eventDate)" label="青年"></q-chip></span></span>
    <q-btn-toggle clearable class="col-*" v-model="attendanceList[app.c_mem_id+'-slot_a']" :options="[{label: '早-出席', value: true, icon: 'check'}, {label: '早-缺席', value: false, icon: 'cancel'}]"/>
    <q-btn-toggle clearable class="col-*" v-model="attendanceList[app.c_mem_id+'-slot_b']" :options="[{label: '午-出席', value: true, icon: 'check'}, {label: '午-缺席', value: false, icon: 'cancel'}]"/>
    <q-btn-toggle clearable class="col-*" v-model="attendanceList[app.c_mem_id+'-slot_c']" :options="[{label: '晚-出席', value: true, icon: 'check'}, {label: '晚-缺席', value: false, icon: 'cancel'}]"/>
  </div>
  <div class="text-h6 row items-center">
    <span>未有報名的青年人次：</span><q-input type="number" filled v-model="otherAttendance"/>
    <q-space/>
    <q-btn label="提交" class="bg-positive text-white" @click="save" flat/>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { date as qdate, useQuasar } from "quasar";
import Noti from "src/lib/notifications"
import DateComponent from "../Basic/DateComponent.vue";
import { useAttendanceProvider } from "src/providers/attendance"
import { useApplicantProvider } from "src/providers/applicant"
import { useEventProvider } from "src/providers/event"
import { useMemberProvider } from "src/providers/member"
import { useRoute } from 'vue-router'
import { watch } from 'vue';


// variables
const otherAttendance = ref(0)
const route = useRoute()
const c_act_code = route.params.id
const $q = useQuasar()
const $store = useStore();
const attendanceList = ref({})
const Applicants = ref([])
const eventDate = ref(qdate.formatDate(new Date(), 'YYYY-MM-DD'))

// queries
const { result: attendanceResult, loading: loadAttendance, addAttendance } = useAttendanceProvider({ c_act_code: c_act_code})
const { result: applicantResult, loading: loadApplicant } = useApplicantProvider({ c_act_code: c_act_code})
const { result: eventResult, loading: loadEvent } = useEventProvider({ c_act_code: c_act_code})

const ApplicantsData = computed(() => applicantResult.value? applicantResult.value: [])

watch(attendanceResult, (newValue) => {
  if (newValue && newValue.tbl_act_attend) {
    attendanceList.value = {}
    newValue.tbl_act_attend.forEach((att) => {
      attendanceList.value[att.c_mem_id + "-" + att.c_act_detail] = true
    })
  }
}, { immediate: true });

const EventData = computed(() => eventResult.value? eventResult.value.HTX_Event_by_pk: [])




// computed
// const Event = computed(() => EventData.value?.HTX_Event_by_pk??[])
const username = computed(() => $store.getters["userModule/getUsername"])


// functions
function save() {
  if (Object.keys(attendanceList.value).length > 0) {
    const logObject = ref({
      "username": username.value,
      "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      "module": "活動系統",
      "action": "活動點名: " + c_act_code + "。日期：" + qdate.formatDate(eventDate.value, "YYYY-MM-DD") + "。出席會員：" + Object.entries(attendanceList.value).filter(([key,value]) => value).map(([key,value]) => key),
    })
    // console.log(logObject.value)
    let upsertObjects = []
    Object.entries(attendanceList.value).forEach(([key,value]) => {
      const [MEMBER_ID, SLOT] = key.split("-")

      if (value) {
        let i = ApplicantsData.value.findIndex((app) => app.c_mem_id == MEMBER_ID)

        upsertObjects.push({
          c_mem_id: MEMBER_ID,
          c_act_code: c_act_code,
          d_date: qdate.formatDate(qdate.extractDate(eventDate.value.trim(), "YYYY-MM-DD"), "YYYY-MM-DDTHH:mm:ss"),
          // slot data stored in c_act_detail
          c_act_detail: SLOT,
          c_name: ApplicantsData.value[i].MemberData.c_name?ApplicantsData.value[i].MemberData.c_name:ApplicantsData.value[i].MemberData.c_name_other,
          c_user_id: username.value,
          d_datetime: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
          // if member is youth or youth related, then i_marks = 1
          i_marks: ApplicantsData.value[i].MemberData.isYouth(eventDate.value)? 1: 0,
        })
      }
    })

    if (upsertObjects.length > 0) {
      addAttendance(upsertObjects).then(() => {
        $q.notify({
          message: "活動" + c_act_code + ":" + qdate.formatDate(eventDate.value, 'YYYY-MM-DD') + "點名完成。",
        })
      })
    }
  }
}
</script>
