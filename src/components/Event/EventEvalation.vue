<template>
  <!-- loading dialog -->
  <q-dialog v-model="waitingAsync" position="bottom">
    <LoadingDialog message="處理中"/>
  </q-dialog>

  <!-- confirm submit dialog -->
  <q-dialog v-model="confirmDialog">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        用 {{username}} 的身份提交計劃檢討？
      </q-card-section>
      <q-card-section>
        注意：提交後不能再修改報告！
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="primary" label="確定" @click="onOKClick" v-close-popup/>
        <q-btn color="primary" label="取消" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>
  
  <div class="q-px-md text-h6 bg-primary text-white q-py-md row">
    {{EventID}} - {{Event.c_act_name}}
    <q-btn v-if="!edit && !isSubmitted" icon="edit" flat @click="startEdit">
      <q-tooltip class="bg-white text-primary">修改</q-tooltip>
    </q-btn>
    <q-btn v-if="edit" icon="save" flat @click="saveEdit">
      <q-tooltip class="bg-white text-primary">儲存</q-tooltip>
    </q-btn>
    <q-btn v-if="edit" icon="cancel" flat @click="edit = false">
      <q-tooltip class="bg-white text-primary">取消</q-tooltip>
    </q-btn>
    <q-space/>
    <q-chip v-if="PlanEval.submit_date">已提交：{{PlanEval.staff_name}} @ {{qdate.formatDate(PlanEval.submit_date, "YYYY-MM-DD HH:mm")}}</q-chip>
    <q-chip v-if="PlanEval.supervisor_date">已審批：{{PlanEval.supervisor}} @ {{qdate.formatDate(PlanEval.supervisor_date, "YYYY-MM-DD HH:mm")}}</q-chip>
    <q-chip v-if="PlanEval.ic_date">已審批：{{PlanEval.ic}} @ {{qdate.formatDate(PlanEval.ic_date, "YYYY-MM-DD HH:mm")}}</q-chip>
    <q-btn v-if="Object.keys(PlanEval).length > 0 && !PlanEval.submit_date" icon="verified" label="提交審批" class="bg-positive text-white" bordered @click="confirmDialog = true" />
  </div>
  <div class="row text-h6">
    <div class="col-2 q-my-sm">工作目的: </div><span class="col-10" v-if="edit"><q-input filled type="text" v-model="editObject.objective"/></span><span class="col-10" v-else>{{PlanEval.objective}}</span>
    <div class="col-2 q-my-sm">工作內容: </div><span class="col-10" v-if="edit"><q-input filled type="text" v-model="editObject.objective_detail"/></span><span class="col-10" v-else>{{PlanEval.objective_detail}}</span>
  </div>
  <q-splitter
    v-model="splitterModel"
    class="fit">
      <template v-slot:before>
        <div class="q-pa-md text-h6 bg-secondary text-white">
          計劃
        </div>
        <div class="row fit q-pa-sm" style="border: 1px solid">
          <q-chip class="fit" square label="基本資料"/>
            <div class="col-2 q-my-sm">開始日期: </div>
            <div class="col-10" v-if="edit">
              <DateComponent v-model="editObject.plan_start_date"/>
            </div>
            <div class="col-10" v-else>{{qdate.formatDate(PlanEval.plan_start_date, "YYYY-MM-DD")}}</div>
          <div class="col-2 q-my-sm">結束日期: </div>
            <div class="col-10" v-if="edit">
              <DateComponent v-model="editObject.plan_end_date"/>
            </div>
            <div class="col-10" v-else>{{qdate.formatDate(PlanEval.plan_end_date, "YYYY-MM-DD")}}</div>
          <div class="col-2 q-my-sm">開始時間: </div>
            <div class="col-10" v-if="edit">
              <TimeComponent v-model="editObject.plan_start_time"/>
            </div>
            <div class="col-10" v-else>{{PlanEval.plan_start_time ? PlanEval.plan_start_time.split(":")[0] + ":" + PlanEval.plan_start_time.split(":")[1]: ""}}</div>
            <!--<div class="col-10" v-else>{{PlanEval.plan_start_time}}</div>-->
          <div class="col-2 q-my-sm">結束時間: </div>
            <div class="col-10" v-if="edit">
              <TimeComponent v-model="editObject.plan_end_time"/>
            </div>
            <div class="col-10" v-else>{{PlanEval.plan_end_time ? PlanEval.plan_end_time.split(":")[0] + ":" + PlanEval.plan_end_time.split(":")[1] : ""}}</div>
          <div class="col-2 q-my-sm">次數/節數: </div>
            <div class="col-10" v-if="edit">
              <q-input type="number" filled v-model="editObject.plan_sessions"/>
            </div>
            <div class="col-10" v-else>{{PlanEval.plan_sessions}}</div>
          <div class="col-2 q-my-sm invisible">協助義工人數: </div>
            <div class="col-10 invisible" v-if="edit">
              <q-input type="number" filled v-model="editObject.eval_volunteer_count"/>
            </div>
            <div class="col-10 invisible" v-else>{{PlanEval.eval_volunteer_count}}</div>
        </div>
        
        <div class="row fit q-pa-sm" style="border: 1px solid">
          <q-chip class="fit" square label="出席記錄"/>
          <div class="col-3 q-my-sm">青年節數: <span v-if="edit"><q-input type="number" filled v-model="editObject.plan_attend_session_youth"/></span><span v-else>{{PlanEval.plan_attend_session_youth}}</span></div>
          <div class="col-3 q-my-sm">兒童節數: <span v-if="edit"><q-input type="number" filled v-model="editObject.plan_attend_session_children"/></span><span v-else>{{PlanEval.plan_attend_session_children}}</span></div>
          <div class="col-3 q-my-sm">家長節數: <span v-if="edit"><q-input type="number" filled v-model="editObject.plan_attend_session_parent"/></span><span v-else>{{PlanEval.plan_attend_session_parent}}</span></div>
          <div class="col-3 q-my-sm">公眾節數: <span v-if="edit"><q-input type="number" filled v-model="editObject.plan_attend_session_others"/></span><span v-else>{{PlanEval.plan_attend_session_others}}</span></div>
          <q-separator class="fit" inset/>
          <div class="col-3 q-my-sm">青年人次: <span v-if="edit"><q-input type="number" filled v-model="editObject.plan_attend_headcount_youth"/></span><span v-else>{{PlanEval.plan_attend_headcount_youth}}</span></div>
          <div class="col-3 q-my-sm">兒童人次: <span v-if="edit"><q-input type="number" filled v-model="editObject.plan_attend_headcount_children"/></span><span v-else>{{PlanEval.plan_attend_headcount_children}}</span></div>
          <div class="col-3 q-my-sm">家長人次: <span v-if="edit"><q-input type="number" filled v-model="editObject.plan_attend_headcount_parent"/></span><span v-else>{{PlanEval.plan_attend_headcount_parent}}</span></div>
          <div class="col-3 q-my-sm">公眾人次: <span v-if="edit"><q-input type="number" filled v-model="editObject.plan_attend_headcount_others"/></span><span v-else>{{PlanEval.plan_attend_headcount_others}}</span></div>
        </div>

        <div class="row fit q-pa-sm" style="border: 1px solid">
          <q-chip class="fit" square label="財政預算"/>
          <div v-if="Object.keys(PlanEval).length == 0">先儲存活動計劃才能開始財政預算</div>
          <div v-else class="row col-grow">
            <div class="col-6 row content-start">
              <EvaluationAccount :isSubmitted="isSubmitted" type="收入" planeval="計劃" :eval_uuid="PlanEval.uuid" :c_act_code="PlanEval.c_act_code"/>
            </div>
            <div class="col-6 row content-start">
              <EvaluationAccount :isSubmitted="isSubmitted" type="支出" planeval="計劃" :eval_uuid="PlanEval.uuid" :c_act_code="PlanEval.c_act_code"/>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:after>
        <div class="q-pa-md text-h6 bg-warning text-white">
          檢討
        </div>
        <div class="row fit q-pa-sm" style="border: 1px solid">
          <q-chip class="fit" square label="基本資料"/>
            <div class="col-2 q-my-sm">開始日期: </div>
            <div class="col-10" v-if="edit">
              <DateComponent v-model="editObject.eval_start_date"/>
            </div>
            <div class="col-10" v-else>{{qdate.formatDate(PlanEval.eval_start_date, "YYYY-MM-DD")}}</div>
          <div class="col-2 q-my-sm">結束日期: </div>
            <div class="col-10" v-if="edit">
              <DateComponent v-model="editObject.eval_end_date"/>
            </div>
            <div class="col-10" v-else>{{qdate.formatDate(PlanEval.eval_end_date, "YYYY-MM-DD")}}</div>
          <div class="col-2 q-my-sm">開始時間: </div>
            <div class="col-10" v-if="edit">
              <TimeComponent v-model="editObject.eval_start_time"/>
            </div>
            <div class="col-10" v-else>{{PlanEval.eval_start_time ? PlanEval.eval_start_time.split(":")[0] + ":" + PlanEval.eval_start_time.split(":")[1]: ""}}</div>
          <div class="col-2 q-my-sm">結束時間: </div>
            <div class="col-10" v-if="edit">
              <TimeComponent v-model="editObject.eval_end_time"/>
            </div>
            <div class="col-10" v-else>{{PlanEval.eval_end_time ? PlanEval.eval_end_time.split(":")[0] + ":" + PlanEval.eval_end_time.split(":")[1] : ""}}</div>
          <div class="col-2 q-my-sm">次數/節數: </div>
            <div class="col-10" v-if="edit">
              <q-input type="number" filled v-model="editObject.eval_sessions"/>
            </div>
            <div class="col-10" v-else>{{PlanEval.eval_sessions}}</div>
          <div class="col-2 q-my-sm">協助義工人數: </div>
            <div class="col-10" v-if="edit">
              <q-input type="number" filled v-model="editObject.eval_volunteer_count"/>
            </div>
            <div class="col-10" v-else>{{PlanEval.eval_volunteer_count}}</div>
        </div>
        
        <div class="row fit q-pa-sm" style="border: 1px solid">
          <q-chip class="fit" square label="出席記錄"/>
          <div class="col-3 q-my-sm">青年節數: <span v-if="edit"><q-input type="number" filled v-model="editObject.eval_attend_session_youth"/></span><span v-else>{{PlanEval.eval_attend_session_youth}}</span></div>
          <div class="col-3 q-my-sm">兒童節數: <span v-if="edit"><q-input type="number" filled v-model="editObject.eval_attend_session_children"/></span><span v-else>{{PlanEval.eval_attend_session_children}}</span></div>
          <div class="col-3 q-my-sm">家長節數: <span v-if="edit"><q-input type="number" filled v-model="editObject.eval_attend_session_parent"/></span><span v-else>{{PlanEval.eval_attend_session_parent}}</span></div>
          <div class="col-3 q-my-sm">公眾節數: <span v-if="edit"><q-input type="number" filled v-model="editObject.eval_attend_session_others"/></span><span v-else>{{PlanEval.eval_attend_session_others}}</span></div>
          <q-separator class="fit" inset/>
          <div class="col-3 q-my-sm">青年人次: <span v-if="edit"><q-input type="number" filled v-model="editObject.eval_attend_headcount_youth"/></span><span v-else>{{PlanEval.eval_attend_headcount_youth}}</span></div>
          <div class="col-3 q-my-sm">兒童人次: <span v-if="edit"><q-input type="number" filled v-model="editObject.eval_attend_headcount_children"/></span><span v-else>{{PlanEval.eval_attend_headcount_children}}</span></div>
          <div class="col-3 q-my-sm">家長人次: <span v-if="edit"><q-input type="number" filled v-model="editObject.eval_attend_headcount_parent"/></span><span v-else>{{PlanEval.eval_attend_headcount_parent}}</span></div>
          <div class="col-3 q-my-sm">公眾人次: <span v-if="edit"><q-input type="number" filled v-model="editObject.eval_attend_headcount_others"/></span><span v-else>{{PlanEval.eval_attend_headcount_others}}</span></div>
        </div>

        <div class="row fit q-pa-sm" style="border: 1px solid">
          <q-chip class="fit" square label="財政檢討"/>
          <div v-if="Object.keys(PlanEval).length == 0">先儲存活動計劃才能開始財政檢討</div>
          <div v-else class="row col-grow">
            <div class="col-6 row content-start">
              <EvaluationAccount :isSubmitted="isSubmitted" type="收入" planeval="檢討" :eval_uuid="PlanEval.uuid" :c_act_code="PlanEval.c_act_code"/>
            </div>
            <div class="col-6 row content-start">
              <EvaluationAccount :isSubmitted="isSubmitted" type="支出" planeval="檢討" :eval_uuid="PlanEval.uuid" :c_act_code="PlanEval.c_act_code"/>
            </div>
          </div>
        </div>

        <div class="row fit q-pa-sm" style="border: 1px solid">
          <q-chip class="fit" square label="成效檢討"/>
            <div class="col-2 q-my-sm">檢討方法: </div>
            <div class="col-10" v-if="edit">
              <q-input filled type="text" v-model="editObject.objective_review_method"/>
            </div>
            <div class="col-10" v-else>{{PlanEval.objective_review_method}}</div>
          <div class="col-2 q-my-sm">目標達成: </div>
            <div class="col-10" v-if="edit">
              <q-input type="text" filled v-model="editObject.objective_achieved"/>
            </div>
            <div class="col-10" v-else>{{PlanEval.objective_achieved}}</div>
          <div class="col-2 q-my-sm">原因: </div>
            <div class="col-10" v-if="edit">
              <q-input type="text" filled v-model="editObject.objective_achieved_reason"/>
            </div>
            <div class="col-10" v-else>{{PlanEval.objective_achieved_reason}}</div>
          <div class="col-2 q-my-sm">跟進/建議: </div>
            <div class="col-10" v-if="edit">
              <q-input type="textarea" filled v-model="editObject.objective_followup"/>
            </div>
            <div class="col-10" v-else>{{PlanEval.objective_followup}}</div>
        </div>
        
      </template>
  </q-splitter>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { EVENT_EVALUATION_BY_ACT_CODE } from "/src/graphQueries/Event/query.js"
import { ADD_EVALUATION_FROM_ACT_CODE, UPDATE_EVALUATION_FROM_PK, SUBMIT_EVALUATION } from "/src/graphQueries/Event/mutation.js"
import { useQuery, useMutation } from "@vue/apollo-composable"
import { date as qdate, useQuasar } from "quasar";
import LoadingDialog from "components/LoadingDialog.vue"
import DateComponent from "components/Basic/DateComponent.vue"
import TimeComponent from "components/Basic/TimeComponent.vue"
import EvaluationAccount from "components/Account/EvaluationAccount.vue"

// props
const props = defineProps({
  EventID: String, 
})

const emits = defineEmits(["useDialogPluginComponent.emits"])

// variables
const splitterModel = ref(50) // default split at 50%
const edit = ref(false)
const awaitServerResponse = ref(0)
const waitingAsync = computed(() => awaitServerResponse > 0 ? true : false)
const $q = useQuasar()
const editObject = ref({})
const $store = useStore();
const confirmDialog = ref(false)

// queries
const { result: EventEvaluation, onError: EventEvaluationError, refetch } = useQuery(
  EVENT_EVALUATION_BY_ACT_CODE,
  () => ({
    c_act_code: props.EventID
  }));
const { mutate: addEvaluationFromActCode, onDone: addEvaluationFromActCode_Completed, onError: addEvaluationFromActCode_Error } = useMutation(ADD_EVALUATION_FROM_ACT_CODE)
const { mutate: updateEvaluationFromActCode, onDone: updateEvaluationFromActCode_Completed, onError: updateEvaluationFromActCode_Error } = useMutation(UPDATE_EVALUATION_FROM_PK)
const { mutate: submitEvaluation, onDone: submitEvaluation_Completed, onError: submitEvaluation_Error } = useMutation(SUBMIT_EVALUATION)

// computed
const Event = computed(() => EventEvaluation.value?.HTX_Event_by_pk??[])
const PlanEval = computed(() => EventEvaluation.value?.HTX_Event_by_pk.Event_to_Evaluation[0]??[])
const username = computed(() => $store.getters["userModule/getUsername"])
const isSubmitted = computed(() => PlanEval.value.submit_date? PlanEval.value.submit_date.length > 0 : false)

// success callbacks
updateEvaluationFromActCode_Completed((result)=>{
  notifyClientSuccess(result.data.update_Event_Evaluation_by_pk.c_act_code)
})

addEvaluationFromActCode_Completed((result)=>{
  notifyClientSuccess(result.data.insert_Event_Evaluation_one.c_act_code)
})

submitEvaluation_Completed((result) => {
  notifyClientSuccess(result.data.update_Event_Evaluation_by_pk.c_act_code)
})

// error callbacks
addEvaluationFromActCode_Error((error) => {
  notifyClientError(error)
})

updateEvaluationFromActCode_Error((error) => {
  notifyClientError(error)
})

EventEvaluationError((error) => {
  notifyClientError(error)
})

submitEvaluation_Error((error) => {
  notifyClientError(error)
})

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

// purify data before sending to server
function purifyRecord() {
  // basic
  editObject.value.objective = !editObject.value.objective? null: editObject.value.objective.trim()
  editObject.value.objective_detail = !editObject.value.objective_detail? null: editObject.value.objective_detail.trim()
  
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
    "username": username,
    "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    "module": "活動系統",
    "action": "提交活動計劃/檢討: " + props.EventID
  })
  console.log(PlanEval.value.uuid)
  console.log(username)
  console.log(qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"))
  console.log(logObject.value)
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
      "username": username,
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
      "username": username,
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

// UI response
function notifyClientError(error) {
  console.log(error)
  if (error.graphQLErrors && error.graphQLErrors[0].extensions.code == "invalid-jwt") {
    userProfileLogout()
      .then(() => {
        $q.notify({ message: "系統逾時，自動登出." });
      })
      .catch((error) => console.log("error", error));
  }
}

function notifyClientSuccess(c_act_code) {
  refetch()
  awaitServerResponse.value--  
  $q.notify({
    message: "活動計劃" + c_act_code + "更新完成。",
  })
}
</script>