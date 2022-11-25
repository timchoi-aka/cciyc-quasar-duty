<template>
  {{PlanEval}}
  <!-- loading dialog -->
  <q-dialog v-model="waitingAsync" position="bottom">
    <LoadingDialog message="處理中"/>
  </q-dialog>
  starttime:{{PlanEval.plan_start_time}}
  <div class="q-px-md text-h6 bg-primary text-white q-py-md">
    {{EventID}} - {{Event.c_act_name}}
    <q-btn v-if="!editBasic" icon="edit" flat @click="startEditBasic">
      <q-tooltip class="bg-white text-primary">修改</q-tooltip>
    </q-btn>
    <q-btn v-if="editBasic" icon="save" flat @click="saveEditBasic">
      <q-tooltip class="bg-white text-primary">儲存</q-tooltip>
    </q-btn>
    <q-btn v-if="editBasic" icon="cancel" flat @click="editBasic = false">
      <q-tooltip class="bg-white text-primary">取消</q-tooltip>
    </q-btn>
  </div>
  <div class="row text-h6">
    <div class="col-1 q-my-sm">工作目的: </div><span class="col-11" v-if="editBasic"><q-input filled v-model="Plan.objective"/></span><span class="col-11" v-else>{{PlanEval.objective}}</span>
    <div class="col-1 q-my-sm">工作內容: </div><span class="col-11" v-if="editBasic"><q-input filled v-model="Plan.objective_detail"/></span><span class="col-11" v-else>{{PlanEval.objective_detail}}</span>
  </div>
  <q-splitter
    v-model="splitterModel"
    class="fit">
      <template v-slot:before>
        <div class="q-pa-md text-h6 bg-secondary text-white">
          計劃
          <q-btn v-if="!editPlan" icon="edit" flat @click="startEditPlan">
            <q-tooltip class="bg-white text-primary">修改</q-tooltip>
          </q-btn>
          <q-btn v-if="editPlan" icon="save" flat @click="saveEditPlan">
            <q-tooltip class="bg-white text-primary">儲存</q-tooltip>
          </q-btn>
          <q-btn v-if="editPlan" icon="cancel" flat @click="editPlan = false">
            <q-tooltip class="bg-white text-primary">取消</q-tooltip>
          </q-btn>
        </div>
        <div class="row fit q-pa-sm" style="border: 1px solid">
          <q-chip class="fit" square label="基本資料"/>
            <div class="col-2 q-my-sm">開始日期: </div>
            <div class="col-10" v-if="editPlan">
              <DateComponent v-model="Plan.plan_start_date"/>
            </div>
            <div class="col-10" v-else>{{qdate.formatDate(PlanEval.plan_start_date, "YYYY-MM-DD")}}</div>
          <div class="col-2 q-my-sm">結束日期: </div>
            <div class="col-10" v-if="editPlan">
              <DateComponent v-model="Plan.plan_end_date"/>
            </div>
            <div class="col-10" v-else>{{qdate.formatDate(PlanEval.plan_end_date, "YYYY-MM-DD")}}</div>
          <div class="col-2 q-my-sm">開始時間: </div>
            <div class="col-10" v-if="editPlan">
              <TimeComponent v-model="Plan.plan_start_time"/>
            </div>
            <div class="col-10" v-else>{{qdate.formatDate(PlanEval.plan_start_time, "hh:mm")}}</div>
            <!--<div class="col-10" v-else>{{PlanEval.plan_start_time}}</div>-->
          <div class="col-2 q-my-sm">結束時間: </div>
            <div class="col-10" v-if="editPlan">
              <TimeComponent v-model="Plan.plan_end_time"/>
            </div>
            <div class="col-10" v-else>{{qdate.formatDate(PlanEval.plan_end_time, "HH:mm")}}</div>
          <div class="fit q-my-sm">節數: {{PlanEval.plan_sessions}}</div>
        </div>
        
        <div class="row fit q-pa-sm" style="border: 1px solid">
          <q-chip class="fit" square label="出席記錄"/>
          <div class="col-3 q-my-sm">青年節數: <span v-if="editPlan"><q-input v-model="Plan.plan_attend_session_youth"/></span><span v-else>{{Plan.plan_attend_session_youth}}</span></div>
          <div class="col-3 q-my-sm">兒童節數: <span v-if="editPlan"><q-input v-model="Plan.plan_attend_session_children"/></span><span v-else>{{Plan.plan_attend_session_children}}</span></div>
          <div class="col-3 q-my-sm">家長節數: <span v-if="editPlan"><q-input v-model="Plan.plan_attend_session_parent"/></span><span v-else>{{Plan.plan_attend_session_parent}}</span></div>
          <div class="col-3 q-my-sm">公眾節數: <span v-if="editPlan"><q-input v-model="Plan.plan_attend_session_others"/></span><span v-else>{{Plan.plan_attend_session_others}}</span></div>
          <q-separator class="fit" inset/>
          <div class="col-3 q-my-sm">青年人次: <span v-if="editPlan"><q-input v-model="Plan.plan_attend_headcount_youth"/></span><span v-else>{{Plan.plan_attend_headcount_youth}}</span></div>
          <div class="col-3 q-my-sm">兒童人次: <span v-if="editPlan"><q-input v-model="Plan.plan_attend_headcount_children"/></span><span v-else>{{Plan.plan_attend_headcount_children}}</span></div>
          <div class="col-3 q-my-sm">家長人次: <span v-if="editPlan"><q-input v-model="Plan.plan_attend_headcount_parent"/></span><span v-else>{{Plan.plan_attend_headcount_parent}}</span></div>
          <div class="col-3 q-my-sm">公眾人次: <span v-if="editPlan"><q-input v-model="Plan.plan_attend_headcount_others"/></span><span v-else>{{Plan.plan_attend_headcount_others}}</span></div>
          
        </div>
      </template>
      <template v-slot:after>
        <div class="q-pa-md text-h6 bg-warning text-white">
          檢討
          <q-btn icon="edit" flat @click="editEval = true"/>
        </div>
          
        
      </template>
  </q-splitter>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { EVENT_EVALUATION_BY_ACT_CODE } from "/src/graphQueries/Event/query.js"
import { ADD_EVALUATION_FROM_ACT_CODE, UPDATE_EVALUATION_FROM_PK } from "/src/graphQueries/Event/mutation.js"
import { useQuery, useMutation } from "@vue/apollo-composable"
import { date as qdate, useQuasar } from "quasar";
import LoadingDialog from "components/LoadingDialog.vue"
import DateComponent from "components/Basic/DateComponent.vue"
import TimeComponent from "components/Basic/TimeComponent.vue"

const splitterModel = ref(50) // default split at 50%
const editBasic = ref(false)
const editPlan = ref(false)
const editEval = ref(false)
const awaitServerResponse = ref(0)
const waitingAsync = computed(() => awaitServerResponse > 0 ? true : false)
const $q = useQuasar()

const props = defineProps({
  EventID: String, 
})

const $store = useStore();
const userProfileLogout = () => $store.dispatch("userModule/logout")
const username = computed(() => $store.getters["userModule/getUsername"])

const { result: EventEvaluation, onError: PlanEvaluationError, refetch } = useQuery(
  EVENT_EVALUATION_BY_ACT_CODE,
  () => ({
    c_act_code: props.EventID
  }));

const { mutate: addEvaluationFromActCode, onDone: addEvaluationFromActCode_Completed, onError: addEvaluationFromActCode_Error } = useMutation(ADD_EVALUATION_FROM_ACT_CODE)
const { mutate: updateEvaluationFromActCode, onDone: updateEvaluationFromActCode_Completed, onError: updateEvaluationFromActCode_Error } = useMutation(UPDATE_EVALUATION_FROM_PK)

const Event = computed(() => EventEvaluation.value?.HTX_Event_by_pk??[])
const PlanEval = computed(() => EventEvaluation.value?.HTX_Event_by_pk.Event_to_Evaluation[0]??[])
const IncomeExpense = computed(() => PlanEval.value?.Evaluation_to_Account??[])

const Plan = ref({})

addEvaluationFromActCode_Error((error) => {
  notifyClientError(error)
})

updateEvaluationFromActCode_Error((error) => {
  notifyClientError(error)
})

updateEvaluationFromActCode_Completed((result)=>{
  notifyClientSuccess(result)
})

addEvaluationFromActCode_Completed((result)=>{
  notifyClientSuccess(result)
})

PlanEvaluationError((error) => {
  notifyClientError(error)
})

function startEditPlan() {
  clonePlanValue()
  editPlan.value = true
}

function startEditBasic() {
  clonePlanValue()
  editBasic.value = true
}

function saveEditPlan() {
  saveRecord()
  editPlan.value = false
}

function saveEditBasic() {  
  saveRecord()
  editBasic.value = false
}

function purifyRecord() {
  Plan.value.plan_start_date = Plan.value.plan_start_date == ""? null: qdate.formatDate(Plan.value.plan_start_date, "YYYY-MM-DD")
  Plan.value.plan_end_date = Plan.value.plan_end_date == ""? null: qdate.formatDate(Plan.value.plan_end_date, "YYYY-MM-DD")
  Plan.value.plan_start_time = Plan.value.plan_start_time == ""? null: Plan.value.plan_start_time
  Plan.value.plan_end_time = Plan.value.plan_end_time == ""? null: Plan.value.plan_end_time
}

function saveRecord() {
  purifyRecord()
  if (PlanEval.value && PlanEval.value.uuid) {
    const logObject = ref({
      "username": username,
      "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      "module": "活動系統",
      "action": "修改活動計劃/檢討: " + props.EventID,
    })
    
    awaitServerResponse.value++
    updateEvaluationFromActCode({
      uuid: PlanEval.value.uuid,
      logObject: logObject.value,
      evaluationObject: Plan.value,
    })
  } else {
    const logObject = ref({
      "username": username,
      "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      "module": "活動系統",
      "action": "新增活動計劃/檢討: " + props.EventID,
    })
    
    awaitServerResponse.value++
    addEvaluationFromActCode({
      evaluationObject: Plan.value,
      logObject: logObject.value
    })
  }
}

function notifyClientError(error) {
  if (error.graphQLErrors[0].extensions.code == "invalid-jwt") {
    userProfileLogout()
      .then(() => {
        $q.notify({ message: "系統逾時，自動登出." });
      })
      .catch((error) => console.log("error", error));
  }
}

function notifyClientSuccess(result) {
  refetch()
  awaitServerResponse.value--  
  $q.notify({
    message: "活動計劃" + result.data.update_Event_Evaluation_by_pk.c_act_code + "更新完成。",
  })
}

function clonePlanValue() {
  Plan.value = {
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