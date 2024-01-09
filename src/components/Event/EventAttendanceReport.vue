<template>
  <!-- date buttons -->
  <div class="q-ma-md">
    <q-btn-toggle v-model="reportMonth" :options="buttonOptions" class="bg-primary text-white" toggle-color="light-blue"/>
  </div>
  <EventAttendanceReportPDF :key="reportMonth" :eventData="eventResult" :attendanceData="attendanceRecord" :attendanceOthersData="attendanceOthersRecord" :reportMonth="reportMonth"/>
</template>

<script setup>
import { useEventProvider } from 'src/providers/event';
import { useAttendanceProvider } from 'src/providers/attendance';
import { useRoute } from 'vue-router'
import { date } from 'quasar'
import { computed, ref } from 'vue'
import EventAttendanceReportPDF from './EventAttendanceReportPDF.vue';

const route = useRoute()
const c_act_code = route.params.id
const reportMonth = ref()
const { result: eventResult } = useEventProvider({ c_act_code: ref(c_act_code), loadSession: ref(true), loadEvaluation: ref(true)})
const { result: attendanceResult } = useAttendanceProvider({ c_act_code: c_act_code})

// computed
const eventMonths = computed(() => {
  let res = []
  if (eventResult.value && eventResult.value.HTX_Event_by_pk) {
    let d_start = date.startOfDate(date.extractDate(eventResult.value.HTX_Event_by_pk.d_date_from, 'D/M/YYYY'), 'month')
    let d_end = date.endOfDate(date.extractDate(eventResult.value.HTX_Event_by_pk.d_date_to, 'D/M/YYYY'), 'month')
    while (d_start <= d_end) {
      res.push(date.formatDate(d_start, 'YYYY-MM'))
      d_start = date.addToDate(d_start, { months: 1 })
    }
  }
  return res
})
const buttonOptions = computed(() => eventMonths.value.map(mth => ({label: mth, value: mth})))
const attendanceRecord = computed(() => {
  let res = []
  if (attendanceResult.value && attendanceResult.value.Attendance) {
    attendanceResult.value.Attendance.forEach(att => {
      if (date.formatDate(att.d_date, 'YYYY-MM') == reportMonth.value) {
        res.push(att)
      }
    })
  }
  return res
})
const attendanceOthersRecord = computed(() => {
  let res = []
  if (attendanceResult.value && attendanceResult.value.AttendanceOthers) {
    attendanceResult.value.AttendanceOthers.forEach(att => {
      if (date.formatDate(att.d_date, 'YYYY-MM') == reportMonth.value) {
        res.push(att)
      }
    })
  }
  return res
})
</script>
