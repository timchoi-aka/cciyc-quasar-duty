<template>
  <!-- loading dialog -->
  <q-dialog v-model="waitingAsync" position="bottom">
    <LoadingDialog message="處理中"/>
  </q-dialog>

  <div class="row">
    <div class="col-md-4 col-sm-4 col-xs-12 row q-pa-none">
      <div class="bg-primary text-white text-h6 col-12 text-center">點名</div>
      <q-input class="col-12" filled v-model="eventDate" mask="date" :rules="['date']">
        <template v-slot:prepend>
          活動日期：
        </template>
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="eventDate">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="關閉" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
      <div class="col-12 text-body1 q-mb-sm" v-if="Event.d_time_from && Event.d_time_to">
        時段: {{ Event.d_time_from }} - {{ Event.d_time_to }}
      </div>
      <div v-if="Applicants.length > 0" class="text-body1 col-12 q-mb-sm row" style="border-bottom: 1px solid">
        點名名單 (出席共 {{ Object.keys(attendanceList).length? Object.entries(attendanceList).filter(([key,value]) => value).length: 0 }} 人)
        <q-space/>
        <q-btn label="提交" class="bg-positive text-white" flat/>
      </div>
      <div v-else class="text-body1 col-12 q-mb-sm">未有人報名</div>
      <div v-for="(app, index) in Applicants" class="row col-12">
        <span class="col-8 text-body1"><span>{{ index+1 }}</span><span>)</span> <span>{{ app.c_name }}({{ app.c_mem_id }}) - {{ app.i_age }}歲</span></span>
        <q-btn-toggle class="col-*" v-model="attendanceList[app.c_mem_id]" :options="[{label: '出席', value: true}, {label: '缺席', value: false}]"/>
      </div>
    </div>
  </div>
  
  {{ attendanceList }}
  <div>Applicant: {{ Applicants }}</div>
  
  <div>Event: {{ Event }}</div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { EVENT_BY_PK, APPLICANTS_BY_ACT_CODE } from "/src/graphQueries/Event/query.js"
//import { TAKE_ATTENDNACE } from "/src/graphQueries/Event/mutation.js"
import { useQuery, useMutation, useSubscription } from "@vue/apollo-composable"
import { date as qdate, useQuasar } from "quasar";
import LoadingDialog from "components/LoadingDialog.vue"
import Noti from "src/lib/notifications"
import { gql } from "graphql-tag"

// props
const props = defineProps({
  EventID: String, 
})

// variables
const awaitServerResponse = ref(0)
const waitingAsync = computed(() => awaitServerResponse > 0)
const $q = useQuasar()
const $store = useStore();
const eventDate = ref(qdate.formatDate(Date.now(), "YYYY/MM/DD"))
const attendanceList = ref({})

// queries
const { result: EventData, onError: EventDataError, refetch } = useQuery(
  EVENT_BY_PK,
  () => ({
    c_act_code: props.EventID
  }));

const { result: ApplicantData } = useSubscription(
  APPLICANTS_BY_ACT_CODE,
  () => ({
    c_act_code: props.EventID
  }));

  /*const { mutate: TakeAttendance, onDone: TakeAttendance_Completed } = useMutation(gql`
  mutation TakeAttendance(
    $c_mem_id: String! = ""
    $event_date: datetime2,

  ) {

  }
`)*/

// computed
const Event = computed(() => EventData.value?.HTX_Event_by_pk??[])
const username = computed(() => $store.getters["userModule/getUsername"])
const Applicants = computed(() => ApplicantData.value?.tbl_act_reg??[])
// success callbacks
/*
TakeAttendance_Completed((result)=>{
  awaitServerResponse.value--  
  $q.notify({
    message: "活動計劃" + result.data.update_Event_Evaluation_by_pk.c_act_code + "更新完成。",
  })
})
*/

// error callbacks
/*
TakeAttendance_Completed((error) => {
  Noti.notifyClientError(error)
})
*/

// functions
// start editing
function startEdit() {
  clonePlanValue()
  edit.value = true
}

// save
function saveEdit() {
  saveRecord()
  edit.value = false
}

function ApproveOK() {
  console.log("approve_ok " + EvaluationComment.value.trim())
  const logObject = ref({
    "username": username.value,
    "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    "module": "活動系統",
    "action": "批核活動計劃/檢討: " + props.EventID + "。主管評語：" + EvaluationComment.value,
  })
  
  awaitServerResponse.value++
  approveEvaluation({
    logObject: logObject.value,
    ic: username.value,
    ic_date: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    ic_comment: EvaluationComment.value,
    c_act_code: props.EventID,
    uuid: PlanEval.value.uuid,
  })
  // update HTX_Event (m_evaluation_rem), Event_Evaluation (ic_comment, ic_date)
}

function ApproveDeny() {
  console.log("approve_deny " + EvaluationComment.value.trim())

  // update HTX_Event (m_evaluation_rem), Event_Evaluation (ic_comment, ic_date)
  // delete Event_Evaluatoin(submit_date)
}

// purify data before sending to server
function purifyRecord() {
  // basic
  editObject.value.objective = editObject.value.objective? editObject.value.objective.trim() : null
  editObject.value.objective_detail = editObject.value.objective_detail? editObject.value.objective_detail.trim() : null
  
  // plan
  editObject.value.plan_start_date = !editObject.value.plan_start_date? null: qdate.formatDate(editObject.value.plan_start_date, "YYYY-MM-DD")
  editObject.value.plan_end_date = !editObject.value.plan_end_date? null: qdate.formatDate(editObject.value.plan_end_date, "YYYY-MM-DD")
  editObject.value.plan_start_time = !editObject.value.plan_start_time? null: editObject.value.plan_start_time
  editObject.value.plan_end_time = !editObject.value.plan_end_time? null: editObject.value.plan_end_time
  editObject.value.plan_sessions = !editObject.value.plan_sessions? null: parseInt(editObject.value.plan_sessions)
  editObject.value.plan_attend_session_youth = !editObject.value.plan_attend_session_youth? null: parseInt(editObject.value.plan_attend_session_youth)
  editObject.value.plan_attend_session_children = !editObject.value.plan_attend_session_children? null: parseInt(editObject.value.plan_attend_session_children)
  editObject.value.plan_attend_session_parent = !editObject.value.plan_attend_session_parent? null: parseInt(editObject.value.plan_attend_session_parent)
  editObject.value.plan_attend_session_others = !editObject.value.plan_attend_session_others? null: parseInt(editObject.value.plan_attend_session_others)
  editObject.value.plan_attend_headcount_youth = !editObject.value.plan_attend_headcount_youth? null: parseInt(editObject.value.plan_attend_headcount_youth)
  editObject.value.plan_attend_headcount_children = !editObject.value.plan_attend_headcount_children? null: parseInt(editObject.value.plan_attend_headcount_children)
  editObject.value.plan_attend_headcount_parent = !editObject.value.plan_attend_headcount_parent? null: parseInt(editObject.value.plan_attend_headcount_parent)
  editObject.value.plan_attend_headcount_others = !editObject.value.plan_attend_headcount_others? null: parseInt(editObject.value.plan_attend_headcount_others)

  // eval
  editObject.value.eval_start_date = !editObject.value.eval_start_date? null: qdate.formatDate(editObject.value.eval_start_date, "YYYY-MM-DD")
  editObject.value.eval_end_date = !editObject.value.eval_end_date? null: qdate.formatDate(editObject.value.eval_end_date, "YYYY-MM-DD")
  editObject.value.eval_start_time = !editObject.value.eval_start_time? null: editObject.value.eval_start_time
  editObject.value.eval_end_time = !editObject.value.eval_end_time? null: editObject.value.eval_end_time
  editObject.value.eval_sessions = !editObject.value.eval_sessions? null: parseInt(editObject.value.eval_sessions)
  editObject.value.eval_attend_session_youth = !editObject.value.eval_attend_session_youth? null: parseInt(editObject.value.eval_attend_session_youth)
  editObject.value.eval_attend_session_children = !editObject.value.eval_attend_session_children? null: parseInt(editObject.value.eval_attend_session_children)
  editObject.value.eval_attend_session_parent = !editObject.value.eval_attend_session_parent? null: parseInt(editObject.value.eval_attend_session_parent)
  editObject.value.eval_attend_session_others = !editObject.value.eval_attend_session_others? null: parseInt(editObject.value.eval_attend_session_others)
  editObject.value.eval_attend_headcount_youth = !editObject.value.eval_attend_headcount_youth? null: parseInt(editObject.value.eval_attend_headcount_youth)
  editObject.value.eval_attend_headcount_children = !editObject.value.eval_attend_headcount_children? null: parseInt(editObject.value.eval_attend_headcount_children)
  editObject.value.eval_attend_headcount_parent = !editObject.value.eval_attend_headcount_parent? null: parseInt(editObject.value.eval_attend_headcount_parent)
  editObject.value.eval_attend_headcount_others = !editObject.value.eval_attend_headcount_others? null: parseInt(editObject.value.eval_attend_headcount_others)

  // eval only data
  editObject.value.eval_volunteer_count = !editObject.value.eval_volunteer_count? null: parseInt(editObject.value.eval_volunteer_count)
  editObject.value.objective_review_method = !editObject.value.objective_review_method? null: editObject.value.objective_review_method.trim()
  editObject.value.objective_achieved = !editObject.value.objective_achieved? null: editObject.value.objective_achieved.trim()
  editObject.value.objective_achieved_reason = !editObject.value.objective_achieved_reason? null: editObject.value.objective_achieved_reason.trim()
  editObject.value.objective_followup = !editObject.value.objective_followup? null: editObject.value.objective_followup.trim()
}

function onOKClick() {
  console.log("OK")
  const logObject = ref({
    "username": username.value,
    "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    "module": "活動系統",
    "action": "提交活動計劃/檢討: " + props.EventID
  })
  //console.log(PlanEval.value.uuid)
  //console.log(username.value)
  //console.log(qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"))
  //console.log(logObject.value)
  awaitServerResponse.value++
  submitEvaluation({
    uuid: PlanEval.value.uuid,
    staff_name: username.value, 
    submit_date: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    logObject: logObject.value,
  })
}

// save the record
function saveRecord() {
  purifyRecord()
  if (PlanEval.value && PlanEval.value.uuid) {
    const logObject = ref({
      "username": username.value,
      "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      "module": "活動系統",
      "action": "修改活動計劃/檢討: " + props.EventID,
    })
    
    awaitServerResponse.value++
    updateEvaluationFromActCode({
      uuid: PlanEval.value.uuid,
      logObject: logObject.value,
      evaluationObject: editObject.value,
    })
  } else {
    const logObject = ref({
      "username": username.value,
      "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      "module": "活動系統",
      "action": "新增活動計劃/檢討: " + props.EventID,
    })
    
    awaitServerResponse.value++
    addEvaluationFromActCode({
      evaluationObject: editObject.value,
      logObject: logObject.value
    })
  }
}

// copy server data to editObject for modification
function clonePlanValue() {
  editObject.value = {
    attendance: PlanEval.value?.attendance??null,
    c_act_code: props.EventID,
    eval_attend_headcount_children: PlanEval.value?.eval_attend_headcount_children??0,
    eval_attend_headcount_others: PlanEval.value?.eval_attend_headcount_others??0,
    eval_attend_headcount_parent: PlanEval.value?.eval_attend_headcount_parent??0,
    eval_attend_headcount_youth: PlanEval.value?.eval_attend_headcount_youth??0,
    eval_attend_session_children: PlanEval.value?.eval_attend_session_children??0,
    eval_attend_session_others: PlanEval.value?.eval_attend_session_others??0,
    eval_attend_session_parent: PlanEval.value?.eval_attend_session_parent??0,
    eval_attend_session_youth: PlanEval.value?.eval_attend_session_youth??0,
    eval_end_date: PlanEval.value?.eval_end_date??null,
    eval_end_time: PlanEval.value?.eval_end_time??null,
    eval_sessions: PlanEval.value?.eval_sessions??null,
    eval_start_date: PlanEval.value?.eval_start_date??null,
    eval_start_time: PlanEval.value?.eval_start_time??null,
    eval_volunteer_count: PlanEval.value?.eval_volunteer_count??0,
    ic: PlanEval.value?.ic??null,
    ic_date: PlanEval.value?.ic_date??null,
    objective: PlanEval.value?.objective??null,
    objective_achieved: PlanEval.value?.objective_achieved??null,
    objective_achieved_reason: PlanEval.value?.objective_achieved_reason??null,
    objective_followup: PlanEval.value?.objective_followup??null,
    objective_detail: PlanEval.value?.objective_detail??null,
    objective_review_method: PlanEval.value?.objective_review_method??null,
    plan_attend_headcount_children: PlanEval.value?.plan_attend_headcount_children??0,
    plan_attend_headcount_others: PlanEval.value?.plan_attend_headcount_others??0,
    plan_attend_headcount_parent: PlanEval.value?.plan_attend_headcount_parent??0,
    plan_attend_headcount_youth: PlanEval.value?.plan_attend_headcount_youth??0,
    plan_attend_session_children: PlanEval.value?.plan_attend_session_children??0,
    plan_attend_session_others: PlanEval.value?.plan_attend_session_others??0,
    plan_attend_session_parent: PlanEval.value?.plan_attend_session_parent??0,
    plan_attend_session_youth: PlanEval.value?.plan_attend_session_youth??0,
    plan_end_date: PlanEval.value?.plan_end_date??null,
    plan_end_time: PlanEval.value?.plan_end_time??null,
    plan_start_date: PlanEval.value ? qdate.formatDate(PlanEval.value.plan_start_date, "YYYY/MM/DD") : null,
    plan_start_time: PlanEval.value?.plan_start_time??null,
    plan_sessions: PlanEval.value?.plan_sessions??0,
    staff_name: PlanEval.value?.staff_name??null,
    submit_date: PlanEval.value?.submit_date??null,
    supervisor: PlanEval.value?.supervisor??null,
    supervisor_date: PlanEval.value?.supervisor_date??null,
  }
}
</script>