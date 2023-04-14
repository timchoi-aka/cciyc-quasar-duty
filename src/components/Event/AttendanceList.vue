<template>
  <div v-if="Applicants.length > 0" class="text-body1 col-12 q-mb-sm row" style="border-bottom: 1px solid">
    點名名單 (出席共 {{ Object.keys(attendanceList).length? Object.entries(attendanceList).filter(([key,value]) => value).length: 0 }} 人)
    <q-space/>
    <q-btn label="提交" class="bg-positive text-white" @click="save" flat/>
  </div>
  <div v-else class="text-body1 col-12 q-mb-sm">未有人報名</div>
  <div v-for="(app, index) in Applicants" class="row col-12">
    <span class="col-8 text-body1"><span>{{ index+1 }}</span><span>)</span> <span>{{ app.c_name }}({{ app.c_mem_id }}) - {{ app.i_age }}歲</span></span>
    <q-btn-toggle class="col-*" v-model="attendanceList[app.c_mem_id]" :options="[{label: '出席', value: true}, {label: '缺席', value: false}]"/>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { useQuery, useMutation } from "@vue/apollo-composable"
import { date as qdate, useQuasar } from "quasar";
import Noti from "src/lib/notifications"
import { gql } from "graphql-tag"

// props
const props = defineProps({
  EventID: String, 
  EventDate: String,
  StartTime: String,
  EndTime: String,
})

// variables
const $q = useQuasar()
const $store = useStore();
const attendanceList = ref({})
const Applicants = ref([])

// queries
const { onResult, refetch } = useQuery(gql`
  query Event_ApplicantsByActCodeAndDate(
    $c_act_code: String! = "", 
    $d_date: datetime2,
    ) {
    tbl_act_reg (where: {c_act_code: {_eq: $c_act_code}, b_refund: {_eq: false}}) {
      ID
      i_age
      d_reg
      d_refund
      c_type
      c_tel
      c_sex
      c_remarks
      b_refund
      c_act_code
      c_mem_id
      c_name
      EventRegistration_to_Event {
        c_act_code
        c_act_name
        c_act_nameen
        d_date_from
        d_date_to
        d_time_from
        d_time_to
      }
    }
    tbl_act_attend (where: {c_act_code: {_eq: $c_act_code}, d_date: {_eq: $d_date}}) {
      d_date
      d_datetime
      d_timefrom
      d_timeto
      i_marks
      ID
      c_act_code
      c_act_detail
      c_mem_id
      c_name
      c_user_id
    }
  }`,
  () => ({
    c_act_code: props.EventID.trim(),
    d_date: qdate.formatDate(qdate.extractDate(props.EventDate, "YYYY/MM/DD"), "YYYY-MM-DDTHH:mm:ss")
  }))


const { mutate: TakeAttendance, onDone: TakeAttendance_Completed } = useMutation(gql`
  mutation TakeAttendance(
    $objects: [tbl_act_attend_insert_input!] = {},
    $logObject: Log_insert_input! = {}
    ) {
  insert_tbl_act_attend(
    objects: $objects, 
    if_matched: {match_columns: [c_mem_id, c_act_code, d_date, d_timefrom, d_timeto], update_columns: [c_name, c_user_id, d_datetime, i_marks]}) {
    affected_rows
  }
  insert_Log_one(object: $logObject) {
    log_id
  }
}`)

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
      "action": "活動點名: " + props.EventID.trim() + "。日期：" + props.EventDate.trim() + "。時間：" + props.StartTime.trim() + "-" + props.EndTime.trim() + "。出席會員：" + Object.entries(attendanceList.value).filter(([key,value]) => value).map(([key,value]) => key),
    })

    let upsertObjects = []
    Object.entries(attendanceList.value).forEach(([key,value]) => {
      console.log(key + ":" + value)
      /*
      upsertObjects.push({
        c_mem_id: key,
        c_act_code: props.EventID.trim(),
        d_date: qdate.formatDate(qdate.extractDate(props.EventDate.trim(), "YYYY/MM/DD"), "YYYY-MM-DDTHH:mm:ss"),
        d_timefrom: TIME_FROM ,
        d_timeto: TIME_TO,
        c_name: MEMBER_NAME,
        c_user_id: username.value,
        d_datetime: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
        i_marks: value? 1: 0,

      })
      */
    })
    /*
    TakeAttendance({
      logObject: logObject.value,
      objects: upsertObjects,
    })
    */
  }
}

// callbacks
onResult((result) => {
  console.log(result.data.tbl_act_attend)
  if (result.data) {
    Applicants.value = result.data.tbl_act_reg
  }
})

TakeAttendance_Completed((result)=>{
  awaitServerResponse.value--  
  $q.notify({
    message: "活動" + props.EventID.trim() + ":" + props.EventDate + "點名完成。",
  })
})


// error callbacks
TakeAttendance_Completed((error) => {
  Noti.notifyClientError(error)
})

</script>