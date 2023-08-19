<template>
  <!-- loading dialog -->
  <LoadingDialog v-model="loading" message="處理中"/>

  <!-- confirm delete plan dialog SYSTEM-ADMIN only -->
  <q-dialog v-model="confirmDeleteDialog">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        是否刪除計劃檢討？
      </q-card-section>
      <q-card-section>
        <div>注意：刪除後不能再回復！</div>
        <div>請在以下輸入活動編號{{props.EventID}}</div>
        <q-input type="text" v-model="deleteCheck"/>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="warning" label="取消" v-close-popup/>
        <q-btn :disable="deleteCheck != props.EventID.trim()" color="positive" label="確定" @click="onOKDelete" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- confirm submit plan dialog -->
  <q-dialog v-model="confirmPlanDialog">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        用 {{username}} 的身份提交計劃？
      </q-card-section>
      <q-card-section>
        注意：提交後不能再修改報告！
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="warning" label="取消" v-close-popup/>
        <q-btn color="positive" label="確定" @click="onOKClickPlan" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>
  
   <!-- confirm submit eval dialog -->
   <q-dialog v-model="confirmEvalDialog">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        用 {{username}} 的身份提交檢討？
      </q-card-section>
      <q-card-section>
        注意：提交後不能再修改報告！
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="warning" label="取消" v-close-popup/>
        <q-btn color="positive" label="確定" @click="onOKClickEval" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- IC approval dialog -->
  <q-dialog v-model="approvalDialog">
    <q-card class="q-dialog-plugin">
      <q-card-section class="bg-primary text-white text-body1">
        <span v-if="mode == 'plan'">計劃</span><span v-else>檢討</span>批核 - {{Event.c_act_name}}({{EventID}}) 
      </q-card-section>
      <q-card-section class="row q-mt-md">
        <div class="col-12">主管意見：</div>
        <q-input class="col-12" v-model="EvaluationComment" filled type="textarea"/>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="warning" label="取消" v-close-popup/>
        <q-btn color="negative" label="發回" @click="ApproveDeny" v-close-popup/>
        <q-btn color="positive" label="批准" @click="ApproveOK" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <div class="q-px-md text-h6 bg-primary text-white q-py-md row">
    <span class="col-xs-12 col-sm-6 col-md-6 row">
      <div class="col-xs-12">{{EventID}} - {{Event.c_act_name}}</div>
      <div class="col-xs-12">
        <q-btn v-if="!edit && (!isSubmitted || isCenterIC)" icon="edit" flat @click="startEdit">
          <q-tooltip class="bg-white text-primary">修改</q-tooltip>
        </q-btn>
        <q-btn v-if="edit" icon="save" flat @click="saveEdit">
          <q-tooltip class="bg-white text-primary">儲存</q-tooltip>
        </q-btn>
        <q-btn v-if="edit" icon="cancel" flat @click="edit = false">
          <q-tooltip class="bg-white text-primary">取消</q-tooltip>
        </q-btn>
        <q-btn v-if="!edit && isSubmitted" flat icon="print" @click="printEvaluation = true">
          <q-tooltip class="bg-white text-primary">列印</q-tooltip>
        </q-btn>
        <q-btn v-if="isSystemAdmin && Object.keys(PlanEval).length > 0" icon="delete" class="text-negative" flat @click="confirmDeleteDialog = true">
          <q-tooltip class="bg-white text-negative">刪除</q-tooltip>
        </q-btn>
      </div>
    </span>
    <q-space/>
    <div class="col-xs-12 col-sm-2 col-md-2">
      <q-btn bordered class="bg-positive text-white" v-if="PlanEval.submit_plan_date && !PlanEval.ic_plan_date && isCenterIC" @click="startApprove('plan')" icon="verified" label="批核計劃"/>
      <q-btn bordered class="bg-positive text-white" v-if="PlanEval.submit_eval_date && !PlanEval.ic_eval_date && isCenterIC" @click="startApprove('eval')" icon="verified" label="批核檢討"/>
      <q-btn v-if="Object.keys(PlanEval).length > 0 && !PlanEval.submit_plan_date && !edit" icon="verified" label="提交計劃" class="bg-positive text-white" bordered @click="confirmPlanDialog = true" />
      <q-btn v-if="Object.keys(PlanEval).length > 0 && !PlanEval.submit_eval_date && PlanEval.submit_plan_date && PlanEval.ic_plan_date && !edit" icon="verified" label="提交檢討" class="bg-purple-6 text-white" bordered @click="confirmEvalDialog = true" />
    </div>
    <div class="col-xs-12 col-sm-4 col-md-4 text-right">
      <div class="col-6">
        <q-chip dense v-if="PlanEval.submit_plan_date">提交計劃：{{PlanEval.staff_name}} @ {{qdate.formatDate(PlanEval.submit_plan_date, "YYYY年M月D日")}}</q-chip>
        <q-chip dense v-if="PlanEval.ic_plan_date">審批計劃：{{qdate.formatDate(PlanEval.ic_plan_date, "YYYY年M月D日")}}</q-chip>
      </div>
      <div class="col-6">
        <q-chip dense v-if="PlanEval.submit_eval_date">提交檢討：{{PlanEval.staff_name}} @ {{qdate.formatDate(PlanEval.submit_eval_date, "YYYY年M月D日")}}</q-chip>
        <q-chip dense v-if="PlanEval.ic_eval_date">審批檢討：{{qdate.formatDate(PlanEval.ic_eval_date, "YYYY年M月D日")}}</q-chip>
      </div>
    </div>
  </div>

  <!-- desktop -->
  <div v-if="$q.screen.gt.xs">
    <div class="row text-h6">
      <div v-if="PlanEval.ic_comment" class="col-12 q-my-sm" style="border: 1px dotted red;">主管評語: <span class="col-10" v-if="edit && isCenterIC"><q-input filled type="text" v-model="editObject.ic_comment"/></span><span class="col-10" v-else>{{PlanEval.ic_comment}}</span></div>
      <div class="col-2 q-my-sm">工作目的: </div><span class="col-10" v-if="edit"><q-input filled type="text" v-model="editObject.objective"/></span><span class="col-10" v-else>{{PlanEval.objective}}</span>
      <div class="col-2 q-my-sm">工作內容: </div><span class="col-10" v-if="edit"><q-input filled type="text" v-model="editObject.objective_detail"/></span><span class="col-10" v-else>{{PlanEval.objective_detail}}</span>
      <div class="col-2 q-my-sm">合辦機構: </div><span class="col-10" v-if="edit"><q-input filled type="text" v-model="editObject.partner_agency"/></span><span class="col-10" v-else>{{PlanEval.partner_agency}}</span>
      <div class="col-2 q-my-sm">合辦聯絡人: </div><span class="col-4" v-if="edit"><q-input filled type="text" v-model="editObject.partner_name"/></span><span class="col-4" v-else>{{PlanEval.partner_name}}</span>
      <div class="col-2 q-my-sm">聯絡人電話: </div><span class="col-4" v-if="edit"><q-input filled type="text" v-model="editObject.partner_phone"/></span><span class="col-4" v-else>{{PlanEval.partner_phone}}</span>
      <div class="col-2 q-my-sm">導師: </div><span class="col-4" v-if="edit"><q-input filled type="text" v-model="editObject.tutor_name"/></span><span class="col-4" v-else>{{PlanEval.tutor_name}}</span>
      <div class="col-2 q-my-sm">導師電話: </div><span class="col-4" v-if="edit"><q-input filled type="text" v-model="editObject.tutor_phone"/></span><span class="col-4" v-else>{{PlanEval.tutor_phone}}</span>
    </div>
    <q-splitter
      v-model="splitterModel"
      class="fit">
        <template v-slot:before>
          <div class="q-pa-md text-h6 bg-secondary text-white">
            計劃 <q-btn flat v-if="edit" icon="download" label="載入活動資料" @click="loadEventToPlan"/>
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
            <div class="col-2 q-my-sm">次數: </div>
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
                <EvaluationAccount :respon="[Event.c_respon? Event.c_respon.trim(): '', Event.c_respon2? Event.c_respon2.trim(): '']" :isSubmitted="isSubmitted" type="收入" planeval="計劃" :eval_uuid="PlanEval.uuid" :c_act_code="PlanEval.c_act_code"/>
              </div>
              <div class="col-6 row content-start">
                <EvaluationAccount :respon="[Event.c_respon? Event.c_respon.trim(): '', Event.c_respon2? Event.c_respon2.trim(): '']" :isSubmitted="isSubmitted" type="支出" planeval="計劃" :eval_uuid="PlanEval.uuid" :c_act_code="PlanEval.c_act_code"/>
              </div>
            </div>
          </div>
        </template>
        <template v-slot:after>
          <div class="q-pa-md text-h6 bg-warning text-white">
            檢討 <q-btn flat v-if="edit" icon="download" label="載入活動資料" @click="loadEventToEval"/>
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
            <div class="col-2 q-my-sm">次數: </div>
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
                <EvaluationAccount :respon="[Event.c_respon? Event.c_respon.trim(): '', Event.c_respon2? Event.c_respon2.trim(): '']" :isSubmitted="isSubmitted" type="收入" planeval="檢討" :eval_uuid="PlanEval.uuid" :c_act_code="PlanEval.c_act_code"/>
              </div>
              <div class="col-6 row content-start">
                <EvaluationAccount :respon="[Event.c_respon? Event.c_respon.trim(): '', Event.c_respon2? Event.c_respon2.trim(): '']" :isSubmitted="isSubmitted" type="支出" planeval="檢討" :eval_uuid="PlanEval.uuid" :c_act_code="PlanEval.c_act_code"/>
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
  </div>
  <div v-else>
    Mobile version developing, refer to desktop for now
  </div>

  <q-dialog 
    v-model="printEvaluation"
    maximized
    full-width
    full-height
    transition-show="slide-up"
    transition-hide="slide-down"
    >
    <EventEvaluationPrint :model-value="Event"/>
  </q-dialog>
</template>

<script setup>
import { gql } from "graphql-tag"
import { computed, ref, defineAsyncComponent } from "vue";
import { useStore } from "vuex";
import { EVENT_EVALUATION_BY_ACT_CODE } from "/src/graphQueries/Event/query.js"
import { ADD_EVALUATION_FROM_ACT_CODE, UPDATE_EVALUATION_FROM_PK, SUBMIT_EVALUATION, SUBMIT_PLAN, APPROVE_EVALUATION, APPROVE_PLAN } from "/src/graphQueries/Event/mutation.js"
import { useQuery, useMutation } from "@vue/apollo-composable"
import { date as qdate, useQuasar } from "quasar";
import LoadingDialog from "components/LoadingDialog.vue"
import DateComponent from "components/Basic/DateComponent.vue"
import TimeComponent from "components/Basic/TimeComponent.vue"
import EvaluationAccount from "components/Account/EvaluationAccount.vue"
import { onBeforeRouteLeave } from "vue-router"
import { httpsCallable } from "@firebase/functions";
import { getDocs, where, query } from "firebase/firestore"
import { FirebaseFunctions, usersCollection } from "boot/firebase";


// props
const props = defineProps({
  EventID: String, 
})

// variables
const splitterModel = ref(50) // default split at 50%
const edit = ref(false)
const loading = ref(0)
const $q = useQuasar()
const editObject = ref({})
const $store = useStore();
const confirmPlanDialog = ref(false)
const confirmEvalDialog = ref(false)
const confirmDeleteDialog = ref(false)
const deleteCheck = ref("")
const approvalDialog = ref(false)
const EvaluationComment = ref("")
const userMapping = ref({})
const mode = ref("")
const printEvaluation = ref(false)
const EventEvaluationPrint = defineAsyncComponent(() =>
  import('components/Event/EventEvaluationPrint.vue')
)

// FireDB Query setup user mapping
const userQuery = query(usersCollection,
  where("enable", "==", true)
)

getDocs(userQuery).then((user) => {
  user.forEach((u) => {
    userMapping.value[u.data().name] = u.data().uid
  });
});

// queries
const { result: EventEvaluation, onError: EventEvaluationError, refetch } = useQuery(
  EVENT_EVALUATION_BY_ACT_CODE,
  () => ({
    c_act_code: props.EventID
  }));
const { mutate: addEvaluationFromActCode, onDone: addEvaluationFromActCode_Completed, onError: addEvaluationFromActCode_Error } = useMutation(ADD_EVALUATION_FROM_ACT_CODE)
const { mutate: updateEvaluationFromActCode, onDone: updateEvaluationFromActCode_Completed, onError: updateEvaluationFromActCode_Error } = useMutation(UPDATE_EVALUATION_FROM_PK)
const { mutate: submitPlan, onDone: submitPlan_Completed, onError: submitPlan_Error } = useMutation(SUBMIT_PLAN)
const { mutate: submitEvaluation, onDone: submitEvaluation_Completed, onError: submitEvaluation_Error } = useMutation(SUBMIT_EVALUATION)
const { mutate: approvePlan, onDone: approvePlan_Completed, onError: approvePlan_Error } = useMutation(APPROVE_PLAN)
const { mutate: approveEvaluation, onDone: approveEvaluation_Completed, onError: approveEvaluation_Error } = useMutation(APPROVE_EVALUATION)
const { mutate: denyPlan, onDone: denyPlan_Completed, onError: denyPlan_Error } = useMutation(gql`
mutation denyPlanFromUUID(
  $uuid: uniqueidentifier = "", 
  $c_act_code: String = "",
  $ic: String = "", 
  $ic_plan_date: smalldatetime = "",
  $ic_comment: String = "",
  $logObject: Log_insert_input! = {}
  ) {
  update_Event_Evaluation_by_pk(
    pk_columns: {uuid: $uuid}, 
    _set: {
      ic: $ic, 
      ic_plan_date: $ic_plan_date,
      ic_comment: $ic_comment,
      submit_plan_date: null,
    }) {
      uuid
      c_act_code
      staff_name
  }
  update_HTX_Event_by_pk(
    pk_columns: {c_act_code: $c_act_code},
    _set: {
      m_evaluation_rem: $ic_comment
    }) {
      c_act_code
      m_evaluation_rem
  }
  insert_Log_one(object: $logObject) {
    log_id
  }
}
`)

const { mutate: denyEvaluation, onDone: denyEvaluation_Completed, onError: denyEvaluation_Error } = useMutation(gql`
mutation denyEvaluationFromUUID(
  $uuid: uniqueidentifier = "", 
  $c_act_code: String = "",
  $ic: String = "", 
  $ic_eval_date: smalldatetime = "",
  $ic_comment: String = "",
  $logObject: Log_insert_input! = {}
  ) {
  update_Event_Evaluation_by_pk(
    pk_columns: {uuid: $uuid}, 
    _set: {
      ic: $ic, 
      ic_eval_date: $ic_eval_date,
      ic_comment: $ic_comment,
      submit_eval_date: null,
    }) {
      uuid
      c_act_code
      staff_name
  }
  update_HTX_Event_by_pk(
    pk_columns: {c_act_code: $c_act_code},
    _set: {
      m_evaluation_rem: $ic_comment
    }) {
      c_act_code
      m_evaluation_rem
  }
  insert_Log_one(object: $logObject) {
    log_id
  }
}
`)

const { mutate: deletePlanEval, onDone: deletePlanEval_Completed, onError: deletePlanEval_Error } = useMutation(gql`
mutation deletePlanEvalFromUUID(
  $uuid: uniqueidentifier = "", 
  $logObject: Log_insert_input! = {}
  ) {
  delete_Event_Evaluation_by_pk(
    uuid: $uuid 
  ) {
    uuid
    c_act_code
  }
  insert_Log_one(object: $logObject) {
    log_id
  }
}
`)
// computed
const Event = computed(() => EventEvaluation.value?.HTX_Event_by_pk??[])
const PlanEval = computed(() => EventEvaluation.value?.HTX_Event_by_pk.Event_to_Evaluation[0]??[])
const username = computed(() => $store.getters["userModule/getUsername"])
const isCenterIC = computed(() => $store.getters["userModule/getCenterIC"])
const isSystemAdmin = computed(() => $store.getters["userModule/getSystemAdmin"])
const isSubmitted = computed(() => PlanEval.value.submit_plan_date && PlanEval.value.submit_eval_date? PlanEval.value.submit_plan_date.length > 0 && PlanEval.value.submit_eval_date.length > 0 : false)

// success callbacks
updateEvaluationFromActCode_Completed((result)=>{
  notifyClientSuccess(result.data.update_Event_Evaluation_by_pk.c_act_code)
})

addEvaluationFromActCode_Completed((result)=>{
  notifyClientSuccess(result.data.insert_Event_Evaluation_one.c_act_code)
})

deletePlanEval_Completed((result) => {
  notifyClientSuccess(result.data.delete_Event_Evaluation_by_pk.c_act_code)
})

submitEvaluation_Completed((result) => {
  if (result.data) {
    const notifyUser = httpsCallable(FirebaseFunctions,
      "notification-notifyUser"
    );
    
    notifyUser({
      topic: "eventApprove",
      data: {
        title: "提交活動檢討",
        body: username.value + "提交了活動計劃" + result.data.update_Event_Evaluation_by_pk.c_act_code,
      }
    }).then(() => {
      notifyClientSuccess(result.data.update_Event_Evaluation_by_pk.c_act_code)
    })
  }
})

submitPlan_Completed((result) => {
  if (result.data) {
    const notifyUser = httpsCallable(FirebaseFunctions,
      "notification-notifyUser"
    );
    
    notifyUser({
      topic: "eventApprove",
      data: {
        title: "提交活動計劃",
        body: username.value + "提交了活動計劃" + result.data.update_Event_Evaluation_by_pk.c_act_code,
      }
    }).then(() => {
      notifyClientSuccess(result.data.update_Event_Evaluation_by_pk.c_act_code)
    })
  }
})

approvePlan_Completed((result) => {
  /*
  console.log("username: " + result.data.update_Event_Evaluation_by_pk.staff_name.trim())
  console.log("userMapping: " + JSON.stringify(userMapping.value))
  console.log("uid:" + userMapping.value[result.data.update_Event_Evaluation_by_pk.staff_name.trim()])
  */
  if (result.data) {
    const notifyUser = httpsCallable(FirebaseFunctions,
      "notification-notifyUser"
    );
    
    notifyUser({
      topic: userMapping.value[result.data.update_Event_Evaluation_by_pk.staff_name.trim()],
      data: {
        title: "活動計劃",
        body: result.data.update_Event_Evaluation_by_pk.c_act_code + "的計劃已被審批",
      }
    }).then(() => {
      notifyClientSuccess(result.data.update_Event_Evaluation_by_pk.c_act_code)
    })
  }
})

approveEvaluation_Completed((result) => {
  /*
  console.log("username: " + result.data.update_Event_Evaluation_by_pk.staff_name.trim())
  console.log("userMapping: " + JSON.stringify(userMapping.value))
  console.log("uid:" + userMapping.value[result.data.update_Event_Evaluation_by_pk.staff_name.trim()])
  */
  if (result.data) {
    const notifyUser = httpsCallable(FirebaseFunctions,
      "notification-notifyUser"
    );
    
    notifyUser({
      topic: userMapping.value[result.data.update_Event_Evaluation_by_pk.staff_name.trim()],
      data: {
        title: "活動檢討",
        body: result.data.update_Event_Evaluation_by_pk.c_act_code + "的檢討已被審批",
      }
    }).then(() => {
      notifyClientSuccess(result.data.update_Event_Evaluation_by_pk.c_act_code)
    })
  }
})

denyEvaluation_Completed((result) => {
  if (result.data) {
    // console.log(JSON.stringify(result.data))
    const notifyUser = httpsCallable(FirebaseFunctions,
      "notification-notifyUser"
    );
    
    notifyUser({
      topic: userMapping.value[result.data.update_Event_Evaluation_by_pk.staff_name.trim()],
      data: {
        title: "活動檢討",
        body: result.data.update_Event_Evaluation_by_pk.c_act_code + "的檢討已被發回",
      }
    }).then(() => {
      notifyClientSuccess(result.data.update_Event_Evaluation_by_pk.c_act_code)
    })
  }
})

denyPlan_Completed((result) => {
  if (result.data) {
    const notifyUser = httpsCallable(FirebaseFunctions,
      "notification-notifyUser"
    );
    
    notifyUser({
      topic: userMapping.value[result.data.update_Event_Evaluation_by_pk.staff_name.trim()],
      data: {
        title: "活動計劃",
        body: result.data.update_Event_Evaluation_by_pk.c_act_code + "的計劃已被審批",
      }
    }).then(() => {
      notifyClientSuccess(result.data.update_Event_Evaluation_by_pk.c_act_code)
    })
  }
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

submitPlan_Error((error) => {
  notifyClientError(error)
})

submitEvaluation_Error((error) => {
  notifyClientError(error)
})

approveEvaluation_Error((error) => {
  notifyClientError(error)
})

approvePlan_Error((error) => {
  notifyClientError(error)
})

denyEvaluation_Error((error) => {
  notifyClientError(error)
})

denyPlan_Error((error) => {
  notifyClientError(error)
})
// functions
// start editing
function startEdit() {
  clonePlanValue()
  edit.value = true
}

function startApprove(m) {
  mode.value = m
  EvaluationComment.value = PlanEval.value.ic_comment? PlanEval.value.ic_comment.trim(): ''
  approvalDialog.value = true
}

// save
function saveEdit() {
  saveRecord()
  edit.value = false
}

function loadEventToPlan() {
  editObject.value.plan_start_date = Event.value.d_date_from? qdate.formatDate(qdate.extractDate(Event.value.d_date_from.trim(), "D/M/YYYY"), "YYYY/MM/DD"): ""
  editObject.value.plan_end_date = Event.value.d_date_to? qdate.formatDate(qdate.extractDate(Event.value.d_date_to.trim(), "D/M/YYYY"), "YYYY/MM/DD"): ""
  editObject.value.plan_start_time = Event.value.d_time_from? qdate.formatDate(qdate.extractDate(Event.value.d_time_from.trim(), "h:mm:ss A"), "HH:mm:ss"): ""
  editObject.value.plan_end_time = Event.value.d_time_to? qdate.formatDate(qdate.extractDate(Event.value.d_time_to.trim(), "h:mm:ss A"), "HH:mm:ss"): ""
  editObject.value.plan_sessions = Event.value.i_lessons? parseInt(Event.value.i_lessons): 0
}

function loadEventToEval() {
  editObject.value.eval_start_date = Event.value.d_date_from? qdate.formatDate(qdate.extractDate(Event.value.d_date_from.trim(), "D/M/YYYY"), "YYYY/MM/DD"): ""
  editObject.value.eval_end_date = Event.value.d_date_to? qdate.formatDate(qdate.extractDate(Event.value.d_date_to.trim(), "D/M/YYYY"), "YYYY/MM/DD"): ""
  editObject.value.eval_start_time = Event.value.d_time_from? qdate.formatDate(qdate.extractDate(Event.value.d_time_from.trim(), "h:mm:ss A"), "HH:mm:ss"): ""
  editObject.value.eval_end_time = Event.value.d_time_to? qdate.formatDate(qdate.extractDate(Event.value.d_time_to.trim(), "h:mm:ss A"), "HH:mm:ss"): ""
  editObject.value.eval_sessions = Event.value.i_lessons? parseInt(Event.value.i_lessons): 0
}

function ApproveOK() {
  if (mode.value) {
    const logObject = ref({
      "username": username.value,
      "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      "module": "活動系統",
      "action": "批核活動" + mode.value == 'plan'? "計劃: ": "檢討: " + props.EventID.trim() + "。主管評語：" + EvaluationComment.value,
    })
    
    loading.value++
    if (mode.value == 'plan') {
      approvePlan({
        logObject: logObject.value,
        ic: username.value,
        ic_plan_date: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
        ic_comment: EvaluationComment.value,
        c_act_code: props.EventID.trim(),
        uuid: PlanEval.value.uuid,
      })
    } else {
      approveEvaluation({
        logObject: logObject.value,
        ic: username.value,
        ic_eval_date: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
        ic_comment: EvaluationComment.value,
        c_act_code: props.EventID.trim(),
        uuid: PlanEval.value.uuid,
      })
    }
  }
  // update HTX_Event (m_evaluation_rem), Event_Evaluation (ic_comment, ic_plan_date)
}

function ApproveDeny() {
  if (mode.value) {
    const logObject = ref({
      "username": username.value,
      "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      "module": "活動系統",
      "action": "發回活動" + mode.value == 'plan'? "計劃: ": "檢討: " + props.EventID.trim() + "。主管評語：" + EvaluationComment.value,
    })

    loading.value++
    if (mode.value == 'plan') {
      denyPlan({
        logObject: logObject.value,
        ic: username.value,
        ic_plan_date: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
        ic_comment: EvaluationComment.value,
        c_act_code: props.EventID.trim(),
        uuid: PlanEval.value.uuid,
      })
    } else {
      denyEvaluation({
        logObject: logObject.value,
        ic: username.value,
        ic_eval_date: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
        ic_comment: EvaluationComment.value,
        c_act_code: props.EventID.trim(),
        uuid: PlanEval.value.uuid,
      })
    }
  }
  // update HTX_Event (m_evaluation_rem), Event_Evaluation (ic_comment, ic_plan_date)
  // delete Event_Evaluatoin(submit_plan_date)
}

// purify data before sending to server
function purifyRecord() {
  // basic
  editObject.value.objective = editObject.value.objective? editObject.value.objective.trim() : null
  editObject.value.objective_detail = editObject.value.objective_detail? editObject.value.objective_detail.trim() : null
  editObject.value.partner_agency = editObject.value.partner_agency? editObject.value.partner_agency.trim(): null
  editObject.value.partner_name = editObject.value.partner_name? editObject.value.partner_name.trim(): null
  editObject.value.partner_phone = editObject.value.partner_phone? editObject.value.partner_phone.trim(): null
  editObject.value.tutor_name = editObject.value.tutor_name? editObject.value.tutor_name.trim(): null
  editObject.value.tutor_phone = editObject.value.tutor_phone? editObject.value.tutor_phone.trim(): null

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

// admin only - delete plan/eval
function onOKDelete() {
  const logObject = ref({
    "username": username.value,
    "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    "module": "活動系統",
    "action": "刪除活動計劃: " + props.EventID + " 內容：" + JSON.stringify(PlanEval.value, null, " ")
  })
  loading.value++
  deletePlanEval({
    uuid: PlanEval.value.uuid,
    logObject: logObject.value,
  })
}

function onOKClickPlan() {
  const logObject = ref({
    "username": username.value,
    "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    "module": "活動系統",
    "action": "提交活動計劃: " + props.EventID
  })
  //console.log(PlanEval.value.uuid)
  //console.log(username.value)
  //console.log(qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"))
  //console.log(logObject.value)
  loading.value++
  submitPlan({
    uuid: PlanEval.value.uuid,
    staff_name: username.value, 
    submit_plan_date: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    logObject: logObject.value,
  })
}

function onOKClickEval() {
  const logObject = ref({
    "username": username.value,
    "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    "module": "活動系統",
    "action": "提交活動檢討: " + props.EventID
  })
  //console.log(PlanEval.value.uuid)
  //console.log(username.value)
  //console.log(qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"))
  //console.log(logObject.value)
  loading.value++
  submitEvaluation({
    uuid: PlanEval.value.uuid,
    staff_name: username.value, 
    submit_eval_date: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
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
      "action": "修改活動計劃/檢討: " + props.EventID.trim() + " 內容：" + JSON.stringify(editObject.value, null, "")
    })
    
    loading.value++
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
      "action": "新增活動計劃/檢討: " + props.EventID.trim() + " 內容：" + JSON.stringify(editObject.value, null, " ")
    })
    
    loading.value++
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
    c_act_code: props.EventID.trim(),
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
    ic_plan_date: PlanEval.value?.ic_plan_date??null,
    ic_comment: PlanEval.value && PlanEval.value.ic_comment? PlanEval.value.ic_comment.trim():null,
    objective: PlanEval.value?.objective??null,
    objective_achieved: PlanEval.value?.objective_achieved??null,
    objective_achieved_reason: PlanEval.value?.objective_achieved_reason??null,
    objective_followup: PlanEval.value?.objective_followup??null,
    objective_detail: PlanEval.value?.objective_detail??null,
    objective_review_method: PlanEval.value?.objective_review_method??null,
    partner_agency: PlanEval.value?.partner_agency??null,
    partner_name: PlanEval.value?.partner_name??null,
    partner_phone: PlanEval.value?.partner_phone??null,
    tutor_name: PlanEval.value?.tutor_name??null,
    tutor_phone: PlanEval.value?.tutor_phone??null,
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
    submit_plan_date: PlanEval.value?.submit_plan_date??null,
    supervisor: PlanEval.value?.supervisor??null,
    supervisor_date: PlanEval.value?.supervisor_date??null,
  }
}

// UI response
function notifyClientError(error) {
  // console.log(error)
  if (error.graphQLErrors && error.graphQLErrors[0].extensions.code == "invalid-jwt") {
    userProfileLogout()
      .then(() => {
        $q.notify({ message: "系統逾時，自動登出." });
      })
      .catch((error) => console.log("error", error));
  } else {
    $q.notify({ message: "系統錯誤，請重新載入頁面." });
  }  
}

function notifyClientSuccess(c_act_code) {
  refetch()
  loading.value--  
  $q.notify({
    message: "活動計劃" + c_act_code + "更新完成。",
  })
}

onBeforeRouteLeave((to, from) => {
  if (edit) {
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
</script>

