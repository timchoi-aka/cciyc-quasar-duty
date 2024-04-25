<!--
  TODO: mobile UI
-->
<template>
  <LoadingDialog :model-value="loading ? 1 : 0" message="讀取中" />
  <div v-if="$q.screen.gt.xs">
    <!-- 活動基本資料 -->
    <div class="row text-h6">
      <!-- 審批評語 -->
      <div
        v-if="
          PlanEval &&
          PlanEval.ic_comment &&
          PlanEval.ic_comment.trim().length > 0
        "
        class="col-12 q-my-sm redBorder row"
      >
        <div class="col-2 q-my-sm">審批評語:</div>
        <span class="col-10 q-my-sm">{{
          PlanEval && PlanEval.ic_comment
        }}</span>
      </div>
      <!-- 工作目的 -->
      <div class="col-2 q-my-sm">工作目的:</div>
      <span class="col-10 q-my-sm">{{ PlanEval && PlanEval.objective }}</span>

      <!--工作內容-->
      <div class="col-2 q-my-sm">工作內容:</div>
      <span class="col-10 q-my-sm">{{
        PlanEval && PlanEval.objective_detail
      }}</span>

      <!--合辦機構-->
      <div class="col-2 q-my-sm">合辦機構:</div>
      <span class="col-10 q-my-sm">{{
        PlanEval && PlanEval.partner_agency
      }}</span>

      <!--合辦聯絡人-->
      <div class="col-2 q-my-sm">合辦聯絡人:</div>
      <span class="col-4 q-my-sm">{{ PlanEval && PlanEval.partner_name }}</span>

      <!--合辦聯絡人電話-->
      <div class="col-2 q-my-sm">聯絡人電話:</div>
      <span class="col-4 q-my-sm">{{
        PlanEval && PlanEval.partner_phone
      }}</span>

      <!--導師-->
      <div class="col-2 q-my-sm">導師:</div>
      <span class="col-4 q-my-sm">{{ PlanEval && PlanEval.tutor_name }}</span>

      <!--導師電話-->
      <div class="col-2 q-my-sm">導師電話:</div>
      <span class="col-4 q-my-sm">{{ PlanEval && PlanEval.tutor_phone }}</span>

      <!--計劃備註-->
      <div class="col-2 q-my-sm">計劃備註:</div>
      <span class="col-10 q-my-sm">{{ PlanEval && PlanEval.remarks }}</span>

      <!--檢討備註-->
      <div class="col-2 q-my-sm" v-if="planSubmitted">檢討備註:</div>
      <span class="col-10 q-my-sm" v-if="planSubmitted">{{
        PlanEval && PlanEval.remarks_eval
      }}</span>
    </div>

    <!-- 計劃/檢討 -->
    <q-splitter v-model="splitterModel" class="fit">
      <!-- 計劃 -->
      <template v-slot:before>
        <div class="q-pa-md text-h6 bg-secondary text-white">計劃</div>
        <div class="row fit q-pa-sm solidBorder">
          <q-chip class="fit" square label="基本資料" />
          <!-- 開始日期 -->
          <div class="col-2 q-my-sm">開始日期:</div>
          <div class="col-10 q-my-sm">
            {{
              PlanEval && PlanEval.plan_start_date
                ? qdate.formatDate(PlanEval.plan_start_date, "YYYY-MM-DD")
                : ""
            }}
          </div>
          <!-- 結束日期 -->
          <div class="col-2 q-my-sm">結束日期:</div>
          <div class="col-10 q-my-sm">
            {{
              PlanEval && PlanEval.plan_end_date
                ? qdate.formatDate(PlanEval.plan_end_date, "YYYY-MM-DD")
                : ""
            }}
          </div>

          <!-- 開始時間 -->
          <div class="col-2 q-my-sm">開始時間:</div>
          <div class="col-10 q-my-sm">
            {{
              PlanEval && PlanEval.plan_start_time
                ? PlanEval.plan_start_time.split(":")[0] +
                  ":" +
                  PlanEval.plan_start_time.split(":")[1]
                : ""
            }}
          </div>

          <!-- 結束時間 -->
          <div class="col-2 q-my-sm">結束時間:</div>
          <div class="col-10 q-my-sm">
            {{
              PlanEval && PlanEval.plan_end_time
                ? PlanEval.plan_end_time.split(":")[0] +
                  ":" +
                  PlanEval.plan_end_time.split(":")[1]
                : ""
            }}
          </div>

          <!-- 次數 -->
          <div class="col-2 q-my-sm">次數:</div>
          <div class="col-10 q-my-sm">
            {{ PlanEval && PlanEval.plan_sessions }}
          </div>

          <!-- 協助義工人數 -->
          <div class="col-2 q-my-sm">協助義工人數:</div>
          <div class="col-10 q-my-sm">
            {{ PlanEval && PlanEval.plan_volunteer_count }}
          </div>
        </div>

        <!-- 出席記錄 -->
        <div class="row fit q-pa-sm solidBorder">
          <q-chip class="fit" square label="出席記錄" />
          <!-- 青年節數 -->
          <div class="col-3 q-my-sm">
            青年節數:
            <span class="q-my-sm">{{
              PlanEval && PlanEval.plan_attend_session_youth
            }}</span>
          </div>

          <!-- 兒童節數 -->
          <div class="col-3 q-my-sm">
            兒童節數:
            <span class="q-my-sm">{{
              PlanEval && PlanEval.plan_attend_session_children
            }}</span>
          </div>

          <!-- 家長節數 -->
          <div class="col-3 q-my-sm">
            家長節數:
            <span class="q-my-sm">{{
              PlanEval && PlanEval.plan_attend_session_parent
            }}</span>
          </div>

          <!-- 公眾節數 -->
          <div class="col-3 q-my-sm">
            公眾節數:
            <span class="q-my-sm">{{
              PlanEval && PlanEval.plan_attend_session_others
            }}</span>
          </div>
          <q-separator class="fit" inset />
          <!-- 青年人次 -->
          <div class="col-3 q-my-sm">
            青年人次:
            <span class="q-my-sm">{{
              PlanEval && PlanEval.plan_attend_headcount_youth
            }}</span>
          </div>

          <!-- 兒童人次 -->
          <div class="col-3 q-my-sm">
            兒童人次:
            <span class="q-my-sm">{{
              PlanEval && PlanEval.plan_attend_headcount_children
            }}</span>
          </div>

          <!-- 家長人次 -->
          <div class="col-3 q-my-sm">
            家長人次:
            <span class="q-my-sm">{{
              PlanEval && PlanEval.plan_attend_headcount_parent
            }}</span>
          </div>

          <!-- 公眾人次 -->
          <div class="col-3 q-my-sm">
            公眾人次:
            <span class="q-my-sm">{{
              PlanEval && PlanEval.plan_attend_headcount_others
            }}</span>
          </div>
        </div>

        <!-- 財政預算 -->
        <div class="row fit q-pa-sm solidBorder">
          <q-chip class="fit" square label="財政預算" />
          <div v-if="hasPlanEval" class="row col-grow">
            <!-- 計劃/收入 -->
            <div class="col-6 row content-start">
              <EvaluationAccount
                :respon="[
                  Event && Event.c_respon ? Event.c_respon.trim() : '',
                  Event && Event.c_respon2 ? Event.c_respon2.trim() : '',
                ]"
                :isSubmitted="isSubmitted"
                type="收入"
                planeval="計劃"
                :eval_uuid="PlanEval.uuid"
                :c_act_code="PlanEval.c_act_code"
              />
            </div>

            <!-- 計劃/支出 -->
            <div class="col-6 row content-start">
              <EvaluationAccount
                :respon="[
                  Event && Event.c_respon ? Event.c_respon.trim() : '',
                  Event && Event.c_respon2 ? Event.c_respon2.trim() : '',
                ]"
                :isSubmitted="isSubmitted"
                type="支出"
                planeval="計劃"
                :eval_uuid="PlanEval.uuid"
                :c_act_code="PlanEval.c_act_code"
              />
            </div>
          </div>
          <div v-else>先儲存活動計劃才能開始財政預算</div>
        </div>
      </template>

      <!-- 檢討 -->
      <template v-slot:after>
        <div class="q-pa-md text-h6 bg-warning text-white">檢討</div>
        <div class="row fit q-pa-sm solidBorder">
          <q-chip class="fit" square label="基本資料" />
          <!-- 開始日期 -->
          <div class="col-2 q-my-sm">開始日期:</div>
          <div class="col-10 q-my-sm">
            {{
              PlanEval && PlanEval.eval_start_date
                ? qdate.formatDate(PlanEval.eval_start_date, "YYYY-MM-DD")
                : ""
            }}
          </div>

          <!-- 結束日期 -->
          <div class="col-2 q-my-sm">結束日期:</div>
          <div class="col-10 q-my-sm">
            {{
              PlanEval && PlanEval.eval_end_date
                ? qdate.formatDate(PlanEval.eval_end_date, "YYYY-MM-DD")
                : ""
            }}
          </div>

          <!-- 開始時間 -->
          <div class="col-2 q-my-sm">開始時間:</div>
          <div class="col-10 q-my-sm">
            {{
              PlanEval && PlanEval.eval_start_time
                ? PlanEval.eval_start_time.split(":")[0] +
                  ":" +
                  PlanEval.eval_start_time.split(":")[1]
                : ""
            }}
          </div>

          <!-- 結束時間 -->
          <div class="col-2 q-my-sm">結束時間:</div>
          <div class="col-10 q-my-sm">
            {{
              PlanEval && PlanEval.eval_end_time
                ? PlanEval.eval_end_time.split(":")[0] +
                  ":" +
                  PlanEval.eval_end_time.split(":")[1]
                : ""
            }}
          </div>

          <!-- 次數 -->
          <div class="col-2 q-my-sm">次數:</div>
          <div class="col-10 q-my-sm">
            {{ PlanEval && PlanEval.eval_sessions }}
          </div>

          <!-- 協助義工人數 -->
          <div class="col-2 q-my-sm">協助義工人數:</div>
          <div class="col-10 q-my-sm">
            {{ PlanEval && PlanEval.eval_volunteer_count }}
          </div>
        </div>

        <!-- 出席記錄 -->
        <div class="row fit q-pa-sm solidBorder">
          <q-chip class="fit" square label="出席記錄" />
          <!-- 青年節數 -->
          <div class="col-3 q-my-sm">
            青年節數:
            <span class="q-my-sm">{{
              PlanEval && PlanEval.eval_attend_session_youth
            }}</span>
          </div>

          <!-- 兒童節數 -->
          <div class="col-3 q-my-sm">
            兒童節數:
            <span class="q-my-sm">{{
              PlanEval && PlanEval.eval_attend_session_children
            }}</span>
          </div>

          <!-- 家長節數 -->
          <div class="col-3 q-my-sm">
            家長節數:
            <span class="q-my-sm">{{
              PlanEval && PlanEval.eval_attend_session_parent
            }}</span>
          </div>

          <!-- 公眾節數 -->
          <div class="col-3 q-my-sm">
            公眾節數:
            <span class="q-my-sm">{{
              PlanEval && PlanEval.eval_attend_session_others
            }}</span>
          </div>
          <q-separator class="fit" inset />

          <!-- 青年人次 -->
          <div class="col-3 q-my-sm">
            青年人次:
            <span class="q-my-sm">{{
              PlanEval && PlanEval.eval_attend_headcount_youth
            }}</span>
          </div>

          <!-- 兒童人次 -->
          <div class="col-3 q-my-sm">
            兒童人次:
            <span class="q-my-sm">{{
              PlanEval && PlanEval.eval_attend_headcount_children
            }}</span>
          </div>

          <!-- 家長人次 -->
          <div class="col-3 q-my-sm">
            家長人次:
            <span class="q-my-sm">{{
              PlanEval && PlanEval.eval_attend_headcount_parent
            }}</span>
          </div>

          <!-- 公眾人次 -->
          <div class="col-3 q-my-sm">
            公眾人次:
            <span class="q-my-sm">{{
              PlanEval && PlanEval.eval_attend_headcount_others
            }}</span>
          </div>
        </div>

        <!-- 財政檢討 -->
        <div class="row fit q-pa-sm solidBorder">
          <q-chip class="fit" square label="財政檢討" />
          <div v-if="hasPlanEval" class="row col-grow">
            <!-- 檢討/收入 -->
            <div class="col-6 row content-start">
              <EvaluationAccount
                :respon="[
                  Event && Event.c_respon ? Event.c_respon.trim() : '',
                  Event && Event.c_respon2 ? Event.c_respon2.trim() : '',
                ]"
                :isSubmitted="isSubmitted"
                type="收入"
                planeval="檢討"
                :eval_uuid="PlanEval.uuid"
                :c_act_code="PlanEval.c_act_code"
              />
            </div>

            <!-- 檢討/支出 -->
            <div class="col-6 row content-start">
              <EvaluationAccount
                :respon="[
                  Event && Event.c_respon ? Event.c_respon.trim() : '',
                  Event && Event.c_respon2 ? Event.c_respon2.trim() : '',
                ]"
                :isSubmitted="isSubmitted"
                type="支出"
                planeval="檢討"
                :eval_uuid="PlanEval.uuid"
                :c_act_code="PlanEval.c_act_code"
              />
            </div>
          </div>
          <div v-else>先儲存活動計劃才能開始財政檢討</div>
        </div>

        <div class="row fit q-pa-sm items-stretch solidBorder">
          <q-chip class="col-12" square label="成效檢討" />
          <!-- 檢討方法 -->
          <div class="col-2 q-my-sm">檢討方法:</div>
          <div class="col-10 q-my-sm">
            {{ PlanEval && PlanEval.objective_review_method }}
          </div>

          <!-- 目標達成 -->
          <div class="col-2 q-my-sm">目標達成:</div>
          <div class="col-10 q-my-sm">
            {{ PlanEval && PlanEval.objective_achieved }}
          </div>

          <!-- 原因 -->
          <div class="col-2 q-my-sm">原因:</div>
          <div class="col-10 q-my-sm">
            {{ PlanEval && PlanEval.objective_achieved_reason }}
          </div>

          <!-- 跟進/建議 -->
          <div class="col-2 q-my-sm">跟進/建議:</div>
          <div class="col-10 q-my-sm">
            {{ PlanEval && PlanEval.objective_followup }}
          </div>
        </div>
      </template>
    </q-splitter>
  </div>
  <div v-else>手機版本 - 開發中</div>
</template>

<script setup>
import { computed, ref } from "vue";
import { date as qdate, useQuasar } from "quasar";
import { useRoute } from "vue-router";
import { useEventProvider } from "src/providers/event";
import User from "src/components/class/user.js";
import EvaluationAccount from "components/Account/EvaluationAccount.vue";
import LoadingDialog from "components/LoadingDialog.vue";

// variables
const route = useRoute();
const c_act_code = ref(route.params.id);
const splitterModel = ref(50); // default split at 50%
const $q = useQuasar();
const editObject = ref({});
const userMapping = ref({});

// load user mapping
User.loadPermUsers().then((res) => {
  userMapping.value = res.map((u) => {
    return { [u.name]: u.uid };
  });
});

// queries
const { result: EventEvaluation, loading } = useEventProvider({
  c_act_code: c_act_code,
  loadEvaluation: ref(true),
});

// computed
const Event = computed(() =>
  EventEvaluation.value ? EventEvaluation.value.HTX_Event_by_pk : {}
);
const PlanEval = computed(() =>
  Event.value && Event.value.Event_to_Evaluation
    ? Event.value.Event_to_Evaluation[0]
    : {}
);
const hasPlanEval = computed(
  () => PlanEval.value && Object.keys(PlanEval.value).length > 0
);
const isSubmitted = computed(() =>
  PlanEval.value.submit_plan_date && PlanEval.value.submit_eval_date
    ? PlanEval.value.submit_plan_date.length > 0 &&
      PlanEval.value.submit_eval_date.length > 0
    : false
);
const planSubmitted = computed(() =>
  PlanEval.value.submit_plan_date
    ? PlanEval.value.submit_plan_date.length > 0
    : false
);

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
</script>

<style scoped lang="scss">
.redBorder {
  border: 1px dotted red;
}

.solidBorder {
  border: 1px solid;
}
</style>
