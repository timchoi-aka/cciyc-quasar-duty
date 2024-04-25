<template>
  <!-- loading dialog -->
  <LoadingDialog :model-value="loading ? 1 : 0" message="處理中" />

  <!-- confirm delete plan dialog SYSTEM-ADMIN only -->
  <q-dialog v-model="confirmDeleteDialog">
    <q-card class="q-dialog-plugin">
      <q-card-section> 是否刪除計劃檢討？ </q-card-section>
      <q-card-section>
        <div>注意：刪除後不能再回復！</div>
        <div>請在以下輸入活動編號{{ c_act_code }}</div>
        <q-input type="text" autofocus v-model="deleteCheck" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="warning" label="取消" v-close-popup />
        <q-btn
          :disable="deleteCheck != c_act_code.trim()"
          color="positive"
          label="確定"
          @click="onOKDelete"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- confirm submit plan dialog -->
  <q-dialog v-model="confirmPlanDialog">
    <q-card class="q-dialog-plugin">
      <q-card-section> 用 {{ username }} 的身份提交計劃？ </q-card-section>
      <q-card-section> 注意：提交後不能再修改報告！ </q-card-section>
      <q-card-actions align="right">
        <q-btn color="warning" label="取消" v-close-popup />
        <q-btn
          color="positive"
          label="確定"
          @click="onOKClickPlan"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- confirm submit eval dialog -->
  <q-dialog v-model="confirmEvalDialog">
    <q-card class="q-dialog-plugin">
      <q-card-section> 用 {{ username }} 的身份提交檢討？ </q-card-section>
      <q-card-section> 注意：提交後不能再修改報告！ </q-card-section>
      <q-card-actions align="right">
        <q-btn color="warning" label="取消" v-close-popup />
        <q-btn
          color="positive"
          label="確定"
          @click="onOKClickEval"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- IC approval dialog -->
  <q-dialog v-model="approvalDialog">
    <q-card class="q-dialog-plugin">
      <q-card-section class="bg-primary text-white text-body1">
        <span v-if="mode == 'plan'">計劃</span><span v-else>檢討</span>批核 -
        {{ Event ? Event.c_act_name : "" }} ({{ c_act_code }})
      </q-card-section>
      <q-card-section class="row q-mt-md">
        <div class="col-12">主管意見：</div>
        <q-input
          class="col-12"
          v-model="EvaluationComment"
          filled
          type="textarea"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="warning" label="取消" v-close-popup />
        <q-btn
          color="negative"
          label="發回"
          @click="ApproveDeny"
          v-close-popup
        />
        <q-btn color="positive" label="批准" @click="ApproveOK" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <div class="q-px-md text-h6 bg-primary text-white q-py-md row">
    <span class="col-xs-12 col-sm-6 col-md-6 row">
      <div class="col-xs-12">
        {{ c_act_code }} - {{ Event ? Event.c_act_name : "" }}
      </div>
      <div class="col-xs-12">
        <q-btn
          icon="description"
          flat
          :to="{
            path: '/event/detail/' + route.params.id + '/evaluation/view',
          }"
        >
          <q-tooltip class="bg-white text-primary">檢視</q-tooltip>
        </q-btn>

        <q-btn
          v-if="displayEditButton"
          icon="edit"
          flat
          :to="{
            path: '/event/detail/' + route.params.id + '/evaluation/edit',
          }"
        >
          <q-tooltip class="bg-white text-primary">修改</q-tooltip>
        </q-btn>

        <q-btn
          v-if="displayDeleteButton"
          icon="delete"
          class="text-negative"
          flat
          @click="confirmDeleteDialog = true"
        >
          <q-tooltip class="bg-white text-negative">刪除</q-tooltip>
        </q-btn>

        <q-btn
          v-if="!edit && isPlanSubmitted"
          icon="print"
          flat
          :to="{
            path:
              '/event/detail/' + route.params.id + '/evaluation/print/planning',
          }"
        >
          <!--<q-btn icon="print" flat @click="pdfModal = true">-->
          <q-tooltip class="bg-white text-primary">列印計劃</q-tooltip>
          <q-badge>計劃</q-badge>
        </q-btn>

        <q-btn
          v-if="!edit && isEvalSubmitted"
          icon="print"
          flat
          :to="{
            path:
              '/event/detail/' +
              route.params.id +
              '/evaluation/print/evaluation',
          }"
        >
          <!--<q-btn icon="print" flat @click="pdfModal = true">-->
          <q-tooltip class="bg-white text-primary">列印檢討</q-tooltip>
          <q-badge>檢討</q-badge>
        </q-btn>
      </div>
    </span>
    <q-space />
    <div class="col-xs-12 col-sm-2 col-md-2">
      <q-btn
        bordered
        class="bg-positive text-white"
        v-if="displayApprovePlanButton"
        @click="startApprove('plan')"
        icon="verified"
        label="批核計劃"
      />
      <q-btn
        bordered
        class="bg-positive text-white"
        v-if="displayApproveEvalButton"
        @click="startApprove('eval')"
        icon="verified"
        label="批核檢討"
      />
      <q-btn
        v-if="displaySubmitPlanButton"
        icon="verified"
        label="提交計劃"
        class="bg-positive text-white"
        bordered
        @click="confirmPlanDialog = true"
      />
      <q-btn
        v-if="displaySubmitEvalButton"
        icon="verified"
        label="提交檢討"
        class="bg-purple-6 text-white"
        bordered
        @click="confirmEvalDialog = true"
      />
    </div>
    <div class="col-xs-12 col-sm-4 col-md-3 text-right q-mr-md">
      <q-btn v-if="isPlanSubmitted" icon="event_note" label="計劃" flat>
        <q-tooltip class="bg-white text-primary">
          <div>
            提交：{{ PlanEval.staff_name }} @
            {{
              PlanEval.submit_plan_date
                ? qdate.formatDate(PlanEval.submit_plan_date, "YYYY年M月D日")
                : "未提交"
            }}
          </div>

          <div v-if="isPlanApproved" key="plan_approved">
            審批：{{ PlanEval.ic }} @
            {{
              PlanEval.ic_plan_date
                ? qdate.formatDate(PlanEval.ic_plan_date, "YYYY年M月D日")
                : "未審批"
            }}
          </div>
        </q-tooltip>

        <q-badge v-if="isPlanApproved" key="plan_approved" transparent>
          <q-icon name="check_circle" color="positive" />
        </q-badge>
        <q-badge v-else key="plan_not_approved" transparent>
          <q-icon name="help" color="warning" />
        </q-badge>
      </q-btn>

      <q-btn v-if="isEvalSubmitted" icon="assessment" label="檢討" flat>
        <q-tooltip class="bg-white text-primary">
          <div>
            提交：{{ PlanEval.staff_name }} @
            {{
              PlanEval.submit_eval_date
                ? qdate.formatDate(PlanEval.submit_eval_date, "YYYY年M月D日")
                : "未提交"
            }}
          </div>
          <div v-if="isEvalApproved" key="eval_approved">
            審批：{{ PlanEval.ic }} @
            {{
              PlanEval.ic_eval_date
                ? qdate.formatDate(PlanEval.ic_eval_date, "YYYY年M月D日")
                : "未審批"
            }}
          </div>
        </q-tooltip>

        <q-badge v-if="isEvalApproved" key="eval_approved" transparent>
          <q-icon name="check_circle" color="positive" />
        </q-badge>
        <q-badge v-else key="eval_not_approved" transparent>
          <q-icon name="help" color="warning" />
        </q-badge>
      </q-btn>
    </div>
  </div>

  <EventEvaluationContentView v-if="route.params.action == 'view'" />
  <EventEvaluationContentEdit v-if="route.params.action == 'edit'" />
  <EventEvaluationReportPDF
    v-if="route.params.action == 'print'"
    :reportType="route.params.type"
    :c_act_code="route.params.id"
    :key="route.params.type + route.params.id"
  />
</template>

<script setup>
import { gql } from "graphql-tag";
import { computed, ref, defineAsyncComponent, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { EVENT_EVALUATION_BY_ACT_CODE } from "/src/graphQueries/Event/query.js";
import {
  ADD_EVALUATION_FROM_ACT_CODE,
  UPDATE_EVALUATION_FROM_PK,
  SUBMIT_EVALUATION,
  SUBMIT_PLAN,
  APPROVE_EVALUATION,
  APPROVE_PLAN,
} from "/src/graphQueries/Event/mutation.js";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { date as qdate, useQuasar } from "quasar";
import LoadingDialog from "components/LoadingDialog.vue";
import { onBeforeRouteLeave } from "vue-router";
import { httpsCallable } from "@firebase/functions";
import { FirebaseFunctions, usersCollection } from "boot/firebase";
import { useRoute, useRouter } from "vue-router";
import { useEventProvider } from "src/providers/event";

// variables
const route = useRoute();
const router = useRouter();
const c_act_code = ref(route.params.id);
const splitterModel = ref(50); // default split at 50%
const edit = computed(
  () => route.path.split("/")[route.path.split("/").length - 1] == "edit"
);
const $q = useQuasar();
const editObject = ref({});
const $store = useStore();
const confirmPlanDialog = ref(false);
const confirmEvalDialog = ref(false);
const confirmDeleteDialog = ref(false);
const pdfModal = ref(false);
const deleteCheck = ref("");
const approvalDialog = ref(false);
const EvaluationComment = ref("");
const mode = ref("");
const printPlan = ref(false);
const printEvaluation = ref(false);
const EventEvaluationReportPDF = defineAsyncComponent(() =>
  import("components/Event/EventEvaluationReportPDF.vue")
);
const EventEvaluationContentView = defineAsyncComponent(() =>
  import("components/Event/EventEvaluationContentView.vue")
);
const EventEvaluationContentEdit = defineAsyncComponent(() =>
  import("components/Event/EventEvaluationContentEdit.vue")
);

const {
  result: EventEvaluation,
  submitPlanById,
  submitEvalById,
  approvePlanById,
  approveEvalById,
  deletePlanEvalById,
  loading,
  message,
} = useEventProvider({ c_act_code: c_act_code, loadEvaluation: ref(true) });

watch(message, (value) => {
  if (value) {
    $q.notify({ message: value });
  }
});

onMounted(async () => {});

// queries
const {
  mutate: addEvaluationFromActCode,
  onDone: addEvaluationFromActCode_Completed,
  onError: addEvaluationFromActCode_Error,
} = useMutation(ADD_EVALUATION_FROM_ACT_CODE);
const {
  mutate: updateEvaluationFromActCode,
  onDone: updateEvaluationFromActCode_Completed,
  onError: updateEvaluationFromActCode_Error,
} = useMutation(UPDATE_EVALUATION_FROM_PK);

const {
  mutate: submitEvaluation,
  onDone: submitEvaluation_Completed,
  onError: submitEvaluation_Error,
} = useMutation(SUBMIT_EVALUATION);
const {
  mutate: approvePlan,
  onDone: approvePlan_Completed,
  onError: approvePlan_Error,
} = useMutation(APPROVE_PLAN);
const {
  mutate: approveEvaluation,
  onDone: approveEvaluation_Completed,
  onError: approveEvaluation_Error,
} = useMutation(APPROVE_EVALUATION);
const {
  mutate: denyPlan,
  onDone: denyPlan_Completed,
  onError: denyPlan_Error,
} = useMutation(gql`
  mutation denyPlanFromUUID(
    $uuid: uniqueidentifier = ""
    $c_act_code: String = ""
    $ic: String = ""
    $ic_plan_date: smalldatetime = ""
    $ic_comment: String = ""
    $logObject: Log_insert_input! = {}
  ) {
    update_Event_Evaluation_by_pk(
      pk_columns: { uuid: $uuid }
      _set: {
        ic: $ic
        ic_plan_date: $ic_plan_date
        ic_comment: $ic_comment
        submit_plan_date: null
      }
    ) {
      uuid
      c_act_code
      staff_name
    }
    update_HTX_Event_by_pk(
      pk_columns: { c_act_code: $c_act_code }
      _set: { m_evaluation_rem: $ic_comment }
    ) {
      c_act_code
      m_evaluation_rem
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }
`);

const {
  mutate: denyEvaluation,
  onDone: denyEvaluation_Completed,
  onError: denyEvaluation_Error,
} = useMutation(gql`
  mutation denyEvaluationFromUUID(
    $uuid: uniqueidentifier = ""
    $c_act_code: String = ""
    $ic: String = ""
    $ic_eval_date: smalldatetime = ""
    $ic_comment: String = ""
    $logObject: Log_insert_input! = {}
  ) {
    update_Event_Evaluation_by_pk(
      pk_columns: { uuid: $uuid }
      _set: {
        ic: $ic
        ic_eval_date: $ic_eval_date
        ic_comment: $ic_comment
        submit_eval_date: null
      }
    ) {
      uuid
      c_act_code
      staff_name
    }
    update_HTX_Event_by_pk(
      pk_columns: { c_act_code: $c_act_code }
      _set: { m_evaluation_rem: $ic_comment }
    ) {
      c_act_code
      m_evaluation_rem
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }
`);

const {
  mutate: deletePlanEval,
  onDone: deletePlanEval_Completed,
  onError: deletePlanEval_Error,
} = useMutation(gql`
  mutation deletePlanEvalFromUUID(
    $uuid: uniqueidentifier = ""
    $logObject: Log_insert_input! = {}
  ) {
    delete_Event_Evaluation_by_pk(uuid: $uuid) {
      uuid
      c_act_code
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }
`);
// computed
const Event = computed(() =>
  EventEvaluation.value ? EventEvaluation.value.HTX_Event_by_pk : {}
);
const PlanEval = computed(() =>
  EventEvaluation.value && EventEvaluation.value.HTX_Event_by_pk
    ? EventEvaluation.value.HTX_Event_by_pk.Event_to_Evaluation[0]
    : null
);
const username = computed(() => $store.getters["userModule/getUsername"]);
const isEventApprover = computed(
  () => $store.getters["userModule/getEventApprove"]
);
const isSystemAdmin = computed(
  () => $store.getters["userModule/getSystemAdmin"]
);
const isSubmitted = computed(() =>
  PlanEval.value &&
  PlanEval.value.submit_plan_date &&
  PlanEval.value.submit_eval_date
    ? PlanEval.value.submit_plan_date.length > 0 &&
      PlanEval.value.submit_eval_date.length > 0
    : false
);
const isPlanSubmitted = computed(() =>
  PlanEval.value && PlanEval.value.submit_plan_date
    ? PlanEval.value.submit_plan_date.length > 0
    : false
);
const isEvalSubmitted = computed(() =>
  PlanEval.value && PlanEval.value.submit_eval_date
    ? PlanEval.value.submit_eval_date.length > 0
    : false
);
const isPlanApproved = computed(
  () => PlanEval.value && PlanEval.value.ic_plan_date
);
const isEvalApproved = computed(
  () => PlanEval.value && PlanEval.value.ic_eval_date
);
const displayApprovePlanButton = computed(
  () =>
    PlanEval.value &&
    PlanEval.value.submit_plan_date &&
    !PlanEval.value.ic_plan_date &&
    isEventApprover.value
);
const displayApproveEvalButton = computed(
  () =>
    PlanEval.value &&
    PlanEval.value.submit_eval_date &&
    !PlanEval.value.ic_eval_date &&
    isEventApprover.value
);
const displaySubmitPlanButton = computed(
  () => PlanEval.value && !PlanEval.value.submit_plan_date && !edit.value
);
const displaySubmitEvalButton = computed(
  () =>
    PlanEval.value &&
    !PlanEval.value.submit_eval_date &&
    PlanEval.value.submit_plan_date &&
    PlanEval.value.ic_plan_date &&
    !edit.value
);
const displayDeleteButton = computed(
  () => isSystemAdmin.value && !edit.value && PlanEval.value
);
const displayEditButton = computed(
  () => !edit.value && (!isSubmitted.value || isEventApprover.value)
);

// success callbacks
updateEvaluationFromActCode_Completed((result) => {
  notifyClientSuccess(result.data.update_Event_Evaluation_by_pk.c_act_code);
});

addEvaluationFromActCode_Completed((result) => {
  notifyClientSuccess(result.data.insert_Event_Evaluation_one.c_act_code);
});

deletePlanEval_Completed((result) => {
  notifyClientSuccess(result.data.delete_Event_Evaluation_by_pk.c_act_code);
  router.push({ path: "/event/detail/" + route.params.id.trim() + "/content" });
});

submitEvaluation_Completed((result) => {
  if (result.data) {
    const notifyUser = httpsCallable(
      FirebaseFunctions,
      "notification-notifyUser"
    );

    if (process.env.NODE_ENV != "development") {
      notifyUser({
        topic: "eventApprove",
        data: {
          title: "提交活動檢討",
          body:
            username.value +
            "提交了活動計劃" +
            result.data.update_Event_Evaluation_by_pk.c_act_code,
        },
      }).then(() => {
        notifyClientSuccess(
          result.data.update_Event_Evaluation_by_pk.c_act_code
        );
      });
    }
  }
});

approvePlan_Completed((result) => {
  /*
  console.log("username: " + result.data.update_Event_Evaluation_by_pk.staff_name.trim())
  console.log("userMapping: " + JSON.stringify(userMapping.value))
  console.log("uid:" + userMapping.value[result.data.update_Event_Evaluation_by_pk.staff_name.trim()])
  */
  if (result.data) {
    const notifyUser = httpsCallable(
      FirebaseFunctions,
      "notification-notifyUser"
    );

    if (process.env.NODE_ENV != "development") {
      notifyUser({
        topic:
          userMapping.value[
            result.data.update_Event_Evaluation_by_pk.staff_name.trim()
          ],
        data: {
          title: "活動計劃",
          body:
            result.data.update_Event_Evaluation_by_pk.c_act_code +
            "的計劃已被審批",
        },
      }).then(() => {
        notifyClientSuccess(
          result.data.update_Event_Evaluation_by_pk.c_act_code
        );
      });
    } else {
      notifyClientSuccess(result.data.update_Event_Evaluation_by_pk.c_act_code);
    }
  }
});

approveEvaluation_Completed((result) => {
  /*
  console.log("username: " + result.data.update_Event_Evaluation_by_pk.staff_name.trim())
  console.log("userMapping: " + JSON.stringify(userMapping.value))
  console.log("uid:" + userMapping.value[result.data.update_Event_Evaluation_by_pk.staff_name.trim()])
  */
  if (result.data) {
    const notifyUser = httpsCallable(
      FirebaseFunctions,
      "notification-notifyUser"
    );

    if (process.env.NODE_ENV != "development") {
      notifyUser({
        topic:
          userMapping.value[
            result.data.update_Event_Evaluation_by_pk.staff_name.trim()
          ],
        data: {
          title: "活動檢討",
          body:
            result.data.update_Event_Evaluation_by_pk.c_act_code +
            "的檢討已被審批",
        },
      }).then(() => {
        notifyClientSuccess(
          result.data.update_Event_Evaluation_by_pk.c_act_code
        );
      });
    } else {
      notifyClientSuccess(result.data.update_Event_Evaluation_by_pk.c_act_code);
    }
  }
});

denyEvaluation_Completed((result) => {
  if (result.data) {
    // console.log(JSON.stringify(result.data))
    const notifyUser = httpsCallable(
      FirebaseFunctions,
      "notification-notifyUser"
    );

    if (process.env.NODE_ENV != "development") {
      notifyUser({
        topic:
          userMapping.value[
            result.data.update_Event_Evaluation_by_pk.staff_name.trim()
          ],
        data: {
          title: "活動檢討",
          body:
            result.data.update_Event_Evaluation_by_pk.c_act_code +
            "的檢討已被發回",
        },
      }).then(() => {
        notifyClientSuccess(
          result.data.update_Event_Evaluation_by_pk.c_act_code
        );
      });
    } else {
      notifyClientSuccess(result.data.update_Event_Evaluation_by_pk.c_act_code);
    }
  }
});

denyPlan_Completed((result) => {
  if (result.data) {
    const notifyUser = httpsCallable(
      FirebaseFunctions,
      "notification-notifyUser"
    );

    if (process.env.NODE_ENV != "development") {
      notifyUser({
        topic:
          userMapping.value[
            result.data.update_Event_Evaluation_by_pk.staff_name.trim()
          ],
        data: {
          title: "活動計劃",
          body:
            result.data.update_Event_Evaluation_by_pk.c_act_code +
            "的計劃已被審批",
        },
      }).then(() => {
        notifyClientSuccess(
          result.data.update_Event_Evaluation_by_pk.c_act_code
        );
      });
    } else {
      notifyClientSuccess(result.data.update_Event_Evaluation_by_pk.c_act_code);
    }
  }
});

// error callbacks
addEvaluationFromActCode_Error((error) => {
  notifyClientError(error);
});

updateEvaluationFromActCode_Error((error) => {
  notifyClientError(error);
});

submitEvaluation_Error((error) => {
  notifyClientError(error);
});

approveEvaluation_Error((error) => {
  notifyClientError(error);
});

approvePlan_Error((error) => {
  notifyClientError(error);
});

denyEvaluation_Error((error) => {
  notifyClientError(error);
});

denyPlan_Error((error) => {
  notifyClientError(error);
});

// functions
function startApprove(m) {
  mode.value = m;
  EvaluationComment.value = PlanEval.value.ic_comment
    ? PlanEval.value.ic_comment.trim()
    : "";
  approvalDialog.value = true;
}

function ApproveOK() {
  if (mode.value) {
    const logObject = ref({
      username: username.value,
      datetime: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      module: "活動系統",
      action:
        "批核活動" + mode.value == "plan"
          ? "計劃: "
          : "檢討: " +
            c_act_code.value.trim() +
            "。主管評語：" +
            EvaluationComment.value,
    });

    // loading.value++
    if (mode.value == "plan") {
      approvePlanById({
        uuid: PlanEval.value.uuid,
        staff_name: username.value,
        c_act_code: c_act_code.value.trim(),
        ic_comment: EvaluationComment.value,
      });
    } else {
      approveEvalById({
        uuid: PlanEval.value.uuid,
        staff_name: username.value,
        c_act_code: c_act_code.value.trim(),
        ic_comment: EvaluationComment.value,
      });
    }
  }
  // update HTX_Event (m_evaluation_rem), Event_Evaluation (ic_comment, ic_plan_date)
}

function ApproveDeny() {
  if (mode.value) {
    const logObject = ref({
      username: username.value,
      datetime: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      module: "活動系統",
      action:
        "發回活動" + mode.value == "plan"
          ? "計劃: "
          : "檢討: " +
            c_act_code.value.trim() +
            "。主管評語：" +
            EvaluationComment.value,
    });

    // loading.value++
    if (mode.value == "plan") {
      denyPlan({
        logObject: logObject.value,
        ic: username.value,
        ic_plan_date: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
        submit_plan_date: null,
        ic_comment: EvaluationComment.value,
        c_act_code: c_act_code.value.trim(),
        uuid: PlanEval.value.uuid,
      });
    } else {
      denyEvaluation({
        logObject: logObject.value,
        ic: username.value,
        ic_eval_date: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
        submit_eval_date: null,
        ic_comment: EvaluationComment.value,
        c_act_code: c_act_code.value.trim(),
        uuid: PlanEval.value.uuid,
      });
    }
  }
  // update HTX_Event (m_evaluation_rem), Event_Evaluation (ic_comment, ic_plan_date)
  // delete Event_Evaluatoin(submit_plan_date)
}

// admin only - delete plan/eval
function onOKDelete() {
  deletePlanEvalById({
    uuid: PlanEval.value.uuid,
    staff_name: username.value,
  });
}

function onOKClickPlan() {
  submitPlanById({
    c_act_code: c_act_code.value,
    uuid: PlanEval.value.uuid,
    staff_name: username.value,
  });
}

function onOKClickEval() {
  submitEvalById({
    uuid: PlanEval.value.uuid,
    staff_name: username.value,
    submit_eval_date: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
  });
}

// UI response
function notifyClientError(error) {
  // console.log(error)
  if (
    error.graphQLErrors &&
    error.graphQLErrors[0].extensions.code == "invalid-jwt"
  ) {
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
  // refetch()
  // loading.value--
  $q.notify({
    message: "活動計劃" + c_act_code + "更新完成。",
  });
}

onBeforeRouteLeave((to, from) => {
  if (edit.value) {
    return new Promise((resolve, reject) => {
      $q.dialog({
        title: "請確認",
        message: "未儲存，確定離開？",
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
          color: "negative",
        },
      }).onOk(() => {
        resolve(true);
      });
    });
  }
});
</script>
