<template>
  <EventEvaluationImportModal
    v-if="loadDialog"
    v-model="editObject"
    @close="loadDialog = false"
  />
  <EventEvaluationImportFinanceModal
    v-if="importFinanceModal"
    :evalUUID="PlanEval.uuid"
    :c_act_code="PlanEval.c_act_code"
    @close="importFinanceModal = false"
  />
  <!-- sticky button at bottom -->
  <q-page-sticky
    v-if="edit"
    position="bottom-right"
    :offset="[20, 20]"
    style="z-index: 1"
  >
    <q-fab label="儲存" icon="save" color="primary" push @click="saveEdit" />
    <q-fab
      label="取消"
      icon="cancel"
      color="warning"
      push
      @click="cancelEdit"
    />
  </q-page-sticky>
  <div v-if="$q.screen.gt.xs">
    <q-btn
      icon="upload_file"
      outline
      label="載入其他活動計劃檢討"
      @click="loadDialog = true"
      color="positive"
      class="q-ma-md"
      v-if="!isPlanSubmitted && !isEvalSubmitted"
    />
    <div class="row text-h6">
      <div
        v-if="PlanEval.ic_comment"
        class="col-12 q-my-sm"
        style="border: 1px dotted red"
      >
        審批評語:
        <span class="col-10" v-if="edit && isEventApprove"
          ><q-input filled type="text" v-model="editObject.ic_comment" /></span
        ><span class="col-10" v-else>{{ PlanEval.ic_comment }}</span>
      </div>
      <div class="col-2 q-my-sm">工作目的:</div>
      <span class="col-10" v-if="edit"
        ><q-input
          filled
          type="text"
          v-model="editObject.objective"
          maxlength="200" /></span
      ><span class="col-10" v-else>{{ PlanEval.objective }}</span>
      <div class="col-2 q-my-sm">工作內容:</div>
      <span class="col-10" v-if="edit"
        ><q-input
          filled
          type="text"
          v-model="editObject.objective_detail"
          maxlength="200" /></span
      ><span class="col-10" v-else>{{ PlanEval.objective_detail }}</span>
      <div class="col-2 q-my-sm">合辦機構:</div>
      <span class="col-10" v-if="edit"
        ><q-input
          filled
          type="text"
          v-model="editObject.partner_agency" /></span
      ><span class="col-10" v-else>{{ PlanEval.partner_agency }}</span>
      <div class="col-2 q-my-sm">合辦聯絡人:</div>
      <span class="col-4" v-if="edit"
        ><q-input filled type="text" v-model="editObject.partner_name" /></span
      ><span class="col-4" v-else>{{ PlanEval.partner_name }}</span>
      <div class="col-2 q-my-sm">聯絡人電話:</div>
      <span class="col-4" v-if="edit"
        ><q-input filled type="text" v-model="editObject.partner_phone" /></span
      ><span class="col-4" v-else>{{ PlanEval.partner_phone }}</span>
      <div class="col-2 q-my-sm">導師:</div>
      <span class="col-4" v-if="edit"
        ><q-input filled type="text" v-model="editObject.tutor_name" /></span
      ><span class="col-4" v-else>{{ PlanEval.tutor_name }}</span>
      <div class="col-2 q-my-sm">導師電話:</div>
      <span class="col-4" v-if="edit"
        ><q-input filled type="text" v-model="editObject.tutor_phone" /></span
      ><span class="col-4" v-else>{{ PlanEval.tutor_phone }}</span>
      <div key="planning_remarks" class="row col-12">
        <div class="col-2 q-my-sm">計劃備註:</div>
        <span class="col-10" v-if="edit" key="edit_planning_remarks"
          ><q-input filled type="text" v-model="editObject.remarks" /></span
        ><span class="col-10" v-else key="display_planning_remarks">{{
          PlanEval.remarks
        }}</span>
      </div>
      <div v-if="isPlanSubmitted" key="eval_remarks" class="row col-12">
        <div class="col-2 q-my-sm">檢討備註:</div>
        <span class="col-10" v-if="edit" key="edit_eval_remarks"
          ><q-input
            filled
            type="text"
            v-model="editObject.remarks_eval" /></span
        ><span class="col-10" v-else key="display_eval_remarks">{{
          PlanEval.remarks_eval
        }}</span>
      </div>
    </div>
    <q-splitter v-model="splitterModel" class="fit">
      <template v-slot:before>
        <div class="q-pa-md text-h6 bg-secondary text-white">
          計劃
          <q-btn
            flat
            v-if="edit"
            icon="download"
            label="載入活動資料"
            @click="loadEventToPlan"
          />
        </div>
        <div class="row fit q-pa-sm" style="border: 1px solid">
          <q-chip class="fit" square label="基本資料" />
          <div class="col-2 q-my-sm">開始日期:</div>
          <div class="col-10" v-if="edit">
            <DateComponent v-model="editObject.plan_start_date" />
          </div>
          <div class="col-10" v-else>
            {{ qdate.formatDate(PlanEval.plan_start_date, "YYYY-MM-DD") }}
          </div>
          <div class="col-2 q-my-sm">結束日期:</div>
          <div class="col-10" v-if="edit">
            <DateComponent v-model="editObject.plan_end_date" />
          </div>
          <div class="col-10" v-else>
            {{ qdate.formatDate(PlanEval.plan_end_date, "YYYY-MM-DD") }}
          </div>
          <div class="col-2 q-my-sm">開始時間:</div>
          <div class="col-10" v-if="edit">
            <TimeComponent v-model="editObject.plan_start_time" />
          </div>
          <div class="col-10" v-else>
            {{
              PlanEval.plan_start_time
                ? PlanEval.plan_start_time.split(":")[0] +
                  ":" +
                  PlanEval.plan_start_time.split(":")[1]
                : ""
            }}
          </div>
          <div class="col-2 q-my-sm">結束時間:</div>
          <div class="col-10" v-if="edit">
            <TimeComponent v-model="editObject.plan_end_time" />
          </div>
          <div class="col-10" v-else>
            {{
              PlanEval.plan_end_time
                ? PlanEval.plan_end_time.split(":")[0] +
                  ":" +
                  PlanEval.plan_end_time.split(":")[1]
                : ""
            }}
          </div>
          <div class="col-2 q-my-sm">次數:</div>
          <div class="col-10" v-if="edit">
            <q-input type="number" filled v-model="editObject.plan_sessions" />
          </div>
          <div class="col-10" v-else>{{ PlanEval.plan_sessions }}</div>
          <div class="col-2 q-my-sm">協助義工人數:</div>
          <div class="col-10" v-if="edit">
            <q-input
              type="number"
              filled
              v-model="editObject.plan_volunteer_count"
            />
          </div>
          <div class="col-10" v-else>{{ PlanEval.plan_volunteer_count }}</div>
        </div>

        <div class="row fit q-pa-sm" style="border: 1px solid">
          <q-chip class="fit" square label="出席記錄" />
          <div class="col-3 q-my-sm">
            青年節數:
            <span v-if="edit"
              ><q-input
                type="number"
                filled
                v-model="editObject.plan_attend_session_youth" /></span
            ><span v-else>{{ PlanEval.plan_attend_session_youth }}</span>
          </div>
          <div class="col-3 q-my-sm">
            兒童節數:
            <span v-if="edit"
              ><q-input
                type="number"
                filled
                v-model="editObject.plan_attend_session_children" /></span
            ><span v-else>{{ PlanEval.plan_attend_session_children }}</span>
          </div>
          <div class="col-3 q-my-sm">
            家長節數:
            <span v-if="edit"
              ><q-input
                type="number"
                filled
                v-model="editObject.plan_attend_session_parent" /></span
            ><span v-else>{{ PlanEval.plan_attend_session_parent }}</span>
          </div>
          <div class="col-3 q-my-sm">
            公眾節數:
            <span v-if="edit"
              ><q-input
                type="number"
                filled
                v-model="editObject.plan_attend_session_others" /></span
            ><span v-else>{{ PlanEval.plan_attend_session_others }}</span>
          </div>
          <q-separator class="fit" inset />
          <div class="col-3 q-my-sm">
            青年人次:
            <span v-if="edit"
              ><q-input
                type="number"
                filled
                v-model="editObject.plan_attend_headcount_youth" /></span
            ><span v-else>{{ PlanEval.plan_attend_headcount_youth }}</span>
          </div>
          <div class="col-3 q-my-sm">
            兒童人次:
            <span v-if="edit"
              ><q-input
                type="number"
                filled
                v-model="editObject.plan_attend_headcount_children" /></span
            ><span v-else>{{ PlanEval.plan_attend_headcount_children }}</span>
          </div>
          <div class="col-3 q-my-sm">
            家長人次:
            <span v-if="edit"
              ><q-input
                type="number"
                filled
                v-model="editObject.plan_attend_headcount_parent" /></span
            ><span v-else>{{ PlanEval.plan_attend_headcount_parent }}</span>
          </div>
          <div class="col-3 q-my-sm">
            公眾人次:
            <span v-if="edit"
              ><q-input
                type="number"
                filled
                v-model="editObject.plan_attend_headcount_others" /></span
            ><span v-else>{{ PlanEval.plan_attend_headcount_others }}</span>
          </div>
        </div>

        <div class="row fit q-pa-sm" style="border: 1px solid">
          <div class="row fit">
            <q-chip square label="財政預算" />
            <q-btn
              v-if="Object.keys(PlanEval).length > 0"
              flat
              outline
              dense
              class="bg-positive text-white"
              icon="upload_file"
              label="滙入財務計劃檢討資料"
              @click="importFinanceModal = true"
            />
          </div>
          <div v-if="Object.keys(PlanEval).length == 0">
            先儲存活動計劃才能開始財政預算
          </div>
          <div v-else class="row col-grow">
            <div class="col-6 row content-start">
              <EvaluationAccount
                :respon="[
                  Event.c_respon ? Event.c_respon.trim() : '',
                  Event.c_respon2 ? Event.c_respon2.trim() : '',
                ]"
                :isSubmitted="isSubmitted"
                type="收入"
                planeval="計劃"
                :eval_uuid="PlanEval.uuid"
                :c_act_code="PlanEval.c_act_code"
              />
            </div>
            <div class="col-6 row content-start">
              <EvaluationAccount
                :respon="[
                  Event.c_respon ? Event.c_respon.trim() : '',
                  Event.c_respon2 ? Event.c_respon2.trim() : '',
                ]"
                :isSubmitted="isSubmitted"
                type="支出"
                planeval="計劃"
                :eval_uuid="PlanEval.uuid"
                :c_act_code="PlanEval.c_act_code"
              />
            </div>
          </div>
        </div>
      </template>

      <template v-slot:after>
        <div class="q-pa-md text-h6 bg-warning text-white">
          檢討
          <q-btn
            flat
            v-if="edit"
            icon="download"
            label="載入活動資料"
            @click="loadEventToEval"
          />
        </div>
        <div class="row fit q-pa-sm" style="border: 1px solid">
          <q-chip class="fit" square label="基本資料" />
          <div class="col-2 q-my-sm">開始日期:</div>
          <div class="col-10" v-if="edit">
            <DateComponent v-model="editObject.eval_start_date" />
          </div>
          <div class="col-10" v-else>
            {{ qdate.formatDate(PlanEval.eval_start_date, "YYYY-MM-DD") }}
          </div>
          <div class="col-2 q-my-sm">結束日期:</div>
          <div class="col-10" v-if="edit">
            <DateComponent v-model="editObject.eval_end_date" />
          </div>
          <div class="col-10" v-else>
            {{ qdate.formatDate(PlanEval.eval_end_date, "YYYY-MM-DD") }}
          </div>
          <div class="col-2 q-my-sm">開始時間:</div>
          <div class="col-10" v-if="edit">
            <TimeComponent v-model="editObject.eval_start_time" />
          </div>
          <div class="col-10" v-else>
            {{
              PlanEval.eval_start_time
                ? PlanEval.eval_start_time.split(":")[0] +
                  ":" +
                  PlanEval.eval_start_time.split(":")[1]
                : ""
            }}
          </div>
          <div class="col-2 q-my-sm">結束時間:</div>
          <div class="col-10" v-if="edit">
            <TimeComponent v-model="editObject.eval_end_time" />
          </div>
          <div class="col-10" v-else>
            {{
              PlanEval.eval_end_time
                ? PlanEval.eval_end_time.split(":")[0] +
                  ":" +
                  PlanEval.eval_end_time.split(":")[1]
                : ""
            }}
          </div>
          <div class="col-2 q-my-sm">次數:</div>
          <div class="col-10" v-if="edit">
            <q-input type="number" filled v-model="editObject.eval_sessions" />
          </div>
          <div class="col-10" v-else>{{ PlanEval.eval_sessions }}</div>
          <div class="col-2 q-my-sm">協助義工人數:</div>
          <div class="col-10" v-if="edit">
            <q-input
              type="number"
              filled
              v-model="editObject.eval_volunteer_count"
            />
          </div>
          <div class="col-10" v-else>{{ PlanEval.eval_volunteer_count }}</div>
        </div>

        <div class="row fit q-pa-sm" style="border: 1px solid">
          <q-chip class="fit" square label="出席記錄" />
          <div class="col-3 q-my-sm">
            青年節數:
            <span v-if="edit"
              ><q-input
                type="number"
                filled
                v-model="editObject.eval_attend_session_youth" /></span
            ><span v-else>{{ PlanEval.eval_attend_session_youth }}</span>
          </div>
          <div class="col-3 q-my-sm">
            兒童節數:
            <span v-if="edit"
              ><q-input
                type="number"
                filled
                v-model="editObject.eval_attend_session_children" /></span
            ><span v-else>{{ PlanEval.eval_attend_session_children }}</span>
          </div>
          <div class="col-3 q-my-sm">
            家長節數:
            <span v-if="edit"
              ><q-input
                type="number"
                filled
                v-model="editObject.eval_attend_session_parent" /></span
            ><span v-else>{{ PlanEval.eval_attend_session_parent }}</span>
          </div>
          <div class="col-3 q-my-sm">
            公眾節數:
            <span v-if="edit"
              ><q-input
                type="number"
                filled
                v-model="editObject.eval_attend_session_others" /></span
            ><span v-else>{{ PlanEval.eval_attend_session_others }}</span>
          </div>
          <q-separator class="fit" inset />
          <div class="col-3 q-my-sm">
            青年人次:
            <span v-if="edit"
              ><q-input
                type="number"
                filled
                v-model="editObject.eval_attend_headcount_youth" /></span
            ><span v-else>{{ PlanEval.eval_attend_headcount_youth }}</span>
          </div>
          <div class="col-3 q-my-sm">
            兒童人次:
            <span v-if="edit"
              ><q-input
                type="number"
                filled
                v-model="editObject.eval_attend_headcount_children" /></span
            ><span v-else>{{ PlanEval.eval_attend_headcount_children }}</span>
          </div>
          <div class="col-3 q-my-sm">
            家長人次:
            <span v-if="edit"
              ><q-input
                type="number"
                filled
                v-model="editObject.eval_attend_headcount_parent" /></span
            ><span v-else>{{ PlanEval.eval_attend_headcount_parent }}</span>
          </div>
          <div class="col-3 q-my-sm">
            公眾人次:
            <span v-if="edit"
              ><q-input
                type="number"
                filled
                v-model="editObject.eval_attend_headcount_others" /></span
            ><span v-else>{{ PlanEval.eval_attend_headcount_others }}</span>
          </div>
        </div>

        <div class="row fit q-pa-sm" style="border: 1px solid">
          <q-chip class="fit" square label="財政檢討" />
          <div v-if="Object.keys(PlanEval).length == 0">
            先儲存活動計劃才能開始財政檢討
          </div>
          <div v-else class="row col-grow">
            <div class="col-6 row content-start">
              <EvaluationAccount
                :respon="[
                  Event.c_respon ? Event.c_respon.trim() : '',
                  Event.c_respon2 ? Event.c_respon2.trim() : '',
                ]"
                :isSubmitted="isSubmitted"
                type="收入"
                planeval="檢討"
                :eval_uuid="PlanEval.uuid"
                :c_act_code="PlanEval.c_act_code"
              />
            </div>
            <div class="col-6 row content-start">
              <EvaluationAccount
                :respon="[
                  Event.c_respon ? Event.c_respon.trim() : '',
                  Event.c_respon2 ? Event.c_respon2.trim() : '',
                ]"
                :isSubmitted="isSubmitted"
                type="支出"
                planeval="檢討"
                :eval_uuid="PlanEval.uuid"
                :c_act_code="PlanEval.c_act_code"
              />
            </div>
          </div>
        </div>
        <EventEvaluationReviewBlock v-model="editObject" />
      </template>
    </q-splitter>
  </div>
  <div v-else>Mobile version developing, refer to desktop for now</div>

  <q-dialog
    v-model="printEvaluation"
    maximized
    full-width
    full-height
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <EventEvaluationPrint :model-value="Event" />
  </q-dialog>

  <q-dialog
    v-model="printPlan"
    maximized
    full-width
    full-height
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <EventPlanPrint :model-value="Event" />
  </q-dialog>
</template>

<script setup>
import DateComponent from "components/Basic/DateComponent.vue";
import TimeComponent from "components/Basic/TimeComponent.vue";
import EvaluationAccount from "components/Account/EvaluationAccount.vue";
import { computed, ref, defineAsyncComponent, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { date as qdate, useQuasar, uid } from "quasar";
import { onBeforeRouteLeave } from "vue-router";
import { useRoute, useRouter } from "vue-router";
import User from "src/components/class/user";
import { useEventProvider } from "src/providers/event";
import EventEvaluationReviewBlock from "src/components/Event/Evaluation/EventEvaluationReviewBlock.vue";

// variables
const route = useRoute();
const router = useRouter();
const c_act_code = ref(route.params.id);
const splitterModel = ref(50); // default split at 50%
const $q = useQuasar();
const editObject = ref({});
const $store = useStore();
const loadDialog = ref(false);
const importFinanceModal = ref(false);
const userMapping = ref({});
const printPlan = ref(false);
const printEvaluation = ref(false);
const EventEvaluationPrint = defineAsyncComponent(() =>
  import("components/Event/EventEvaluationPrint.vue")
);
const EventPlanPrint = defineAsyncComponent(() =>
  import("components/Event/EventPlanPrint.vue")
);
const EventEvaluationImportModal = defineAsyncComponent(() =>
  import("components/Event/Modals/EventEvaluationImportModal.vue")
);
const EventEvaluationImportFinanceModal = defineAsyncComponent(() =>
  import("components/Event/Modals/EventEvaluationImportFinanceModal.vue")
);

// queries
const {
  result: EventEvaluation,
  message,
  upsertPlanEvalById,
} = useEventProvider({
  c_act_code: c_act_code,
  loadEvaluation: ref(true),
});

onMounted(async () => {
  // load user name - uid mapping
  const users = await User.loadPermUsers();
  users.forEach((u) => {
    userMapping.value[u.name] = u.uid;
  });
});

// computed
const Event = computed(() => EventEvaluation.value?.HTX_Event_by_pk ?? []);

const PlanEval = computed(
  () => EventEvaluation.value?.HTX_Event_by_pk.Event_to_Evaluation[0] ?? []
);
const username = computed(() => $store.getters["userModule/getUsername"]);
const isEventApprove = computed(
  () => $store.getters["userModule/getEventApprove"]
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
const isEventApprover = computed(
  () => $store.getters["userModule/getEventApprove"]
);
const edit = computed(() => !isEvalSubmitted.value || isEventApprover.value);

// functions
function saveEdit() {
  saveRecord().then(() => {
    router.push({
      path: "/event/detail/" + route.params.id + "/evaluation/view",
    });
  });
}

function cancelEdit() {
  router.push({
    path: "/event/detail/" + route.params.id + "/evaluation/view",
  });
}

function loadEventToPlan() {
  editObject.value.plan_start_date = Event.value.d_date_from
    ? qdate.formatDate(
        qdate.extractDate(Event.value.d_date_from.trim(), "D/M/YYYY"),
        "YYYY/MM/DD"
      )
    : "";
  editObject.value.plan_end_date = Event.value.d_date_to
    ? qdate.formatDate(
        qdate.extractDate(Event.value.d_date_to.trim(), "D/M/YYYY"),
        "YYYY/MM/DD"
      )
    : "";
  editObject.value.plan_start_time = Event.value.d_time_from
    ? qdate.formatDate(
        qdate.extractDate(Event.value.d_time_from.trim(), "h:mm:ss A"),
        "HH:mm:ss"
      )
    : "";
  editObject.value.plan_end_time = Event.value.d_time_to
    ? qdate.formatDate(
        qdate.extractDate(Event.value.d_time_to.trim(), "h:mm:ss A"),
        "HH:mm:ss"
      )
    : "";
  editObject.value.plan_sessions = Event.value.i_lessons
    ? parseInt(Event.value.i_lessons)
    : 0;
}

function loadEventToEval() {
  editObject.value.eval_start_date = Event.value.d_date_from
    ? qdate.formatDate(
        qdate.extractDate(Event.value.d_date_from.trim(), "D/M/YYYY"),
        "YYYY/MM/DD"
      )
    : "";
  editObject.value.eval_end_date = Event.value.d_date_to
    ? qdate.formatDate(
        qdate.extractDate(Event.value.d_date_to.trim(), "D/M/YYYY"),
        "YYYY/MM/DD"
      )
    : "";
  editObject.value.eval_start_time = Event.value.d_time_from
    ? qdate.formatDate(
        qdate.extractDate(Event.value.d_time_from.trim(), "h:mm:ss A"),
        "HH:mm:ss"
      )
    : "";
  editObject.value.eval_end_time = Event.value.d_time_to
    ? qdate.formatDate(
        qdate.extractDate(Event.value.d_time_to.trim(), "h:mm:ss A"),
        "HH:mm:ss"
      )
    : "";
  editObject.value.eval_sessions = Event.value.i_lessons
    ? parseInt(Event.value.i_lessons)
    : 0;
}

// purify data before sending to server
function purifyRecord(editObject) {
  let returnObject = ref(JSON.parse(JSON.stringify(editObject.value)));

  // basic
  returnObject.value.uuid = editObject.value.uuid
    ? editObject.value.uuid.trim()
    : uid();
  returnObject.value.staff_name = editObject.value.staff_name
    ? editObject.value.staff_name.trim()
    : null;
  returnObject.value.objective = editObject.value.objective
    ? editObject.value.objective.trim()
    : null;
  returnObject.value.objective_detail = editObject.value.objective_detail
    ? editObject.value.objective_detail.trim()
    : null;
  returnObject.value.partner_agency = editObject.value.partner_agency
    ? editObject.value.partner_agency.trim()
    : null;
  returnObject.value.partner_name = editObject.value.partner_name
    ? editObject.value.partner_name.trim()
    : null;
  returnObject.value.partner_phone = editObject.value.partner_phone
    ? editObject.value.partner_phone.trim()
    : null;
  returnObject.value.tutor_name = editObject.value.tutor_name
    ? editObject.value.tutor_name.trim()
    : null;
  returnObject.value.tutor_phone = editObject.value.tutor_phone
    ? editObject.value.tutor_phone.trim()
    : null;
  returnObject.value.remarks = editObject.value.remarks
    ? editObject.value.remarks.trim()
    : null;
  returnObject.value.remarks_eval = editObject.value.remarks_eval
    ? editObject.value.remarks_eval.trim()
    : null;
  returnObject.value.supervisor = editObject.value.supervisor
    ? editObject.value.supervisor.trim()
    : null;
  returnObject.value.supervisor_comment = editObject.value.supervisor_comment
    ? editObject.value.supervisor_comment.trim()
    : null;
  returnObject.value.ic_comment = editObject.value.ic_comment
    ? editObject.value.ic_comment.trim()
    : null;

  // plan
  returnObject.value.plan_volunteer_count = !editObject.value
    .plan_volunteer_count
    ? null
    : parseInt(editObject.value.plan_volunteer_count);
  returnObject.value.plan_start_date = !editObject.value.plan_start_date
    ? null
    : qdate.formatDate(editObject.value.plan_start_date, "YYYY-MM-DD");
  returnObject.value.plan_end_date = !editObject.value.plan_end_date
    ? null
    : qdate.formatDate(editObject.value.plan_end_date, "YYYY-MM-DD");
  returnObject.value.plan_start_time = !editObject.value.plan_start_time
    ? null
    : editObject.value.plan_start_time;
  returnObject.value.plan_end_time = !editObject.value.plan_end_time
    ? null
    : editObject.value.plan_end_time;
  returnObject.value.plan_sessions = !editObject.value.plan_sessions
    ? null
    : parseInt(editObject.value.plan_sessions);
  returnObject.value.plan_attend_session_youth = !editObject.value
    .plan_attend_session_youth
    ? null
    : parseInt(editObject.value.plan_attend_session_youth);
  returnObject.value.plan_attend_session_children = !editObject.value
    .plan_attend_session_children
    ? null
    : parseInt(editObject.value.plan_attend_session_children);
  returnObject.value.plan_attend_session_parent = !editObject.value
    .plan_attend_session_parent
    ? null
    : parseInt(editObject.value.plan_attend_session_parent);
  returnObject.value.plan_attend_session_others = !editObject.value
    .plan_attend_session_others
    ? null
    : parseInt(editObject.value.plan_attend_session_others);
  returnObject.value.plan_attend_headcount_youth = !editObject.value
    .plan_attend_headcount_youth
    ? null
    : parseInt(editObject.value.plan_attend_headcount_youth);
  returnObject.value.plan_attend_headcount_children = !editObject.value
    .plan_attend_headcount_children
    ? null
    : parseInt(editObject.value.plan_attend_headcount_children);
  returnObject.value.plan_attend_headcount_parent = !editObject.value
    .plan_attend_headcount_parent
    ? null
    : parseInt(editObject.value.plan_attend_headcount_parent);
  returnObject.value.plan_attend_headcount_others = !editObject.value
    .plan_attend_headcount_others
    ? null
    : parseInt(editObject.value.plan_attend_headcount_others);

  // eval
  returnObject.value.eval_start_date = !editObject.value.eval_start_date
    ? null
    : qdate.formatDate(editObject.value.eval_start_date, "YYYY-MM-DD");
  returnObject.value.eval_end_date = !editObject.value.eval_end_date
    ? null
    : qdate.formatDate(editObject.value.eval_end_date, "YYYY-MM-DD");
  returnObject.value.eval_start_time = !editObject.value.eval_start_time
    ? null
    : editObject.value.eval_start_time;
  returnObject.value.eval_end_time = !editObject.value.eval_end_time
    ? null
    : editObject.value.eval_end_time;
  returnObject.value.eval_sessions = !editObject.value.eval_sessions
    ? null
    : parseInt(editObject.value.eval_sessions);
  returnObject.value.eval_attend_session_youth = !editObject.value
    .eval_attend_session_youth
    ? null
    : parseInt(editObject.value.eval_attend_session_youth);
  returnObject.value.eval_attend_session_children = !editObject.value
    .eval_attend_session_children
    ? null
    : parseInt(editObject.value.eval_attend_session_children);
  returnObject.value.eval_attend_session_parent = !editObject.value
    .eval_attend_session_parent
    ? null
    : parseInt(editObject.value.eval_attend_session_parent);
  returnObject.value.eval_attend_session_others = !editObject.value
    .eval_attend_session_others
    ? null
    : parseInt(editObject.value.eval_attend_session_others);
  returnObject.value.eval_attend_headcount_youth = !editObject.value
    .eval_attend_headcount_youth
    ? null
    : parseInt(editObject.value.eval_attend_headcount_youth);
  returnObject.value.eval_attend_headcount_children = !editObject.value
    .eval_attend_headcount_children
    ? null
    : parseInt(editObject.value.eval_attend_headcount_children);
  returnObject.value.eval_attend_headcount_parent = !editObject.value
    .eval_attend_headcount_parent
    ? null
    : parseInt(editObject.value.eval_attend_headcount_parent);
  returnObject.value.eval_attend_headcount_others = !editObject.value
    .eval_attend_headcount_others
    ? null
    : parseInt(editObject.value.eval_attend_headcount_others);

  // eval only data
  returnObject.value.eval_volunteer_count = !editObject.value
    .eval_volunteer_count
    ? null
    : parseInt(editObject.value.eval_volunteer_count);
  returnObject.value.objective_review_method = !editObject.value
    .objective_review_method
    ? null
    : editObject.value.objective_review_method.trim();
  returnObject.value.objective_achieved = !editObject.value.objective_achieved
    ? null
    : editObject.value.objective_achieved.trim();
  returnObject.value.objective_achieved_reason = !editObject.value
    .objective_achieved_reason
    ? null
    : editObject.value.objective_achieved_reason.trim();
  returnObject.value.objective_followup = !editObject.value.objective_followup
    ? null
    : editObject.value.objective_followup.trim();

  return returnObject.value;
}

// save the record
async function saveRecord() {
  let purifiedRecord = purifyRecord(editObject);

  upsertPlanEvalById({
    c_act_code: c_act_code.value,
    object: purifiedRecord,
    isNew: purifiedRecord.uuid == PlanEval.value.uuid,
    staff_name: username.value,
  });
}

// clone data object to edit object
watch(PlanEval, (data) => {
  // copy server data to editObject for modification
  if (data) {
    editObject.value = {
      uuid: data.uuid ? data.uuid.trim() : null,
      attendance: data.attendance ? data.attendance.trim() : null,
      c_act_code: c_act_code.value.trim(),
      eval_attend_headcount_children: data.eval_attend_headcount_children
        ? data.eval_attend_headcount_children
        : 0,
      eval_attend_headcount_others: data.eval_attend_headcount_others
        ? data.eval_attend_headcount_others
        : 0,
      eval_attend_headcount_parent: data.eval_attend_headcount_parent
        ? data.eval_attend_headcount_parent
        : 0,
      eval_attend_headcount_youth: data.eval_attend_headcount_youth
        ? data.eval_attend_headcount_youth
        : 0,
      eval_attend_session_children: data.eval_attend_session_children
        ? data.eval_attend_session_children
        : 0,
      eval_attend_session_others: data.eval_attend_session_others
        ? data.eval_attend_session_others
        : 0,
      eval_attend_headcount_parent: data.eval_attend_headcount_parent
        ? data.eval_attend_headcount_parent
        : 0,
      eval_attend_session_youth: data.eval_attend_session_youth
        ? data.eval_attend_session_youth
        : 0,
      eval_end_date: data.eval_end_date ? data.eval_end_date : null,
      eval_end_time: data.eval_end_time ? data.eval_end_time : null,
      eval_sessions: data.eval_sessions ? data.eval_sessions : null,
      eval_start_date: data.eval_start_date ? data.eval_start_date : null,
      eval_start_time: data.eval_start_time ? data.eval_start_time : null,
      eval_volunteer_count: data.eval_volunteer_count
        ? data.eval_volunteer_count
        : 0,
      ic: data.ic ? data.ic.trim() : null,
      ic_plan_date: data.ic_plan_date ? data.ic_plan_date : null,
      ic_comment: data.ic_comment ? data.ic_comment.trim() : null,
      objective: data.objective ? data.objective.trim() : null,
      objective_achieved: data.objective_achieved
        ? data.objective_achieved.trim()
        : null,
      objective_achieved_reason: data.objective_achieved_reason
        ? data.objective_achieved_reason.trim()
        : null,
      objective_followup: data.objective_followup
        ? data.objective_followup.trim()
        : null,
      objective_detail: data.objective_detail
        ? data.objective_detail.trim()
        : null,
      objective_review_method: data.objective_review_method
        ? data.objective_review_method.trim()
        : null,
      partner_agency: data.partner_agency ? data.partner_agency.trim() : null,
      partner_name: data.partner_name ? data.partner_name.trim() : null,
      partner_phone: data.partner_phone ? data.partner_phone.trim() : null,
      tutor_name: data.tutor_name ? data.tutor_name.trim() : null,
      tutor_phone: data.tutor_phone ? data.tutor_phone.trim() : null,
      remarks: data.remarks ? data.remarks.trim() : null,
      remarks_eval: data.remarks_eval ? data.remarks_eval.trim() : null,
      plan_attend_headcount_children: data.plan_attend_headcount_children
        ? data.plan_attend_headcount_children
        : 0,
      plan_attend_headcount_others: data.plan_attend_headcount_others
        ? data.plan_attend_headcount_others
        : 0,
      plan_attend_headcount_parent: data.plan_attend_headcount_parent
        ? data.plan_attend_headcount_parent
        : 0,
      plan_attend_headcount_youth: data.plan_attend_headcount_youth
        ? data.plan_attend_headcount_youth
        : 0,
      plan_attend_session_children: data.plan_attend_session_children
        ? data.plan_attend_session_children
        : 0,
      plan_attend_session_others: data.plan_attend_session_others
        ? data.plan_attend_session_others
        : 0,
      plan_attend_session_parent: data.plan_attend_session_parent
        ? data.plan_attend_session_parent
        : 0,
      plan_attend_session_youth: data.plan_attend_session_youth
        ? data.plan_attend_session_youth
        : 0,
      plan_end_date: data.plan_end_date
        ? qdate.formatDate(data.plan_end_date, "YYYY/MM/DD")
        : null,
      plan_end_time: data.plan_end_time ? data.plan_end_time : null,
      plan_start_date: data.plan_start_date
        ? qdate.formatDate(data.plan_start_date, "YYYY/MM/DD")
        : null,
      plan_start_time: data.plan_start_time ? data.plan_start_time : null,
      plan_sessions: data.plan_sessions ? data.plan_sessions : 0,
      plan_volunteer_count: data.plan_volunteer_count
        ? data.plan_volunteer_count
        : 0,
      staff_name: data.staff_name ? data.staff_name.trim() : null,
      supervisor: data.supervisor ? data.supervisor.trim() : null,
      supervisor_comment: data.supervisor_comment
        ? data.supervisor_comment.trim()
        : null,
    };
  }
});

// display result message to user
watch(message, (newMessage) => {
  if (newMessage) {
    $q.notify({
      message: newMessage,
    });
  }
});

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
