<template>
  <q-tabs
    v-if="username && module == 'duty'"
    inline-label
    class="desktop-only"
    align="left"
  >
    <q-route-tab to="/duty/dutytable" icon="calendar_month" label="編更系統" />
    <q-route-tab
      v-if="!isTmp"
      to="/holiday/al-view"
      icon="festival"
      label="假期系統"
    />
    <q-route-tab
      v-if="!isTmp"
      to="/overtime/ot-view"
      icon="schedule"
      label="超時系統"
    />
    <q-route-tab
      v-if="!isTmp"
      to="/healthcare"
      icon="health_and_safety"
      label="員工醫療"
    />
    <q-route-tab
      v-if="isUserManagement && !isTmp"
      to="/user/normal"
      icon="account_circle"
      label="用戶管理"
    />
    <q-route-tab
      v-if="isSystemAdmin && !isTmp"
      to="/system-admin"
      icon="build"
      label="系統管理"
    />
    <q-route-tab
      v-if="(isSystemAdmin || isCenterIC) && !isTmp"
      to="/bugs"
      icon="bug_report"
      label="錯誤報告"
    />
  </q-tabs>
  <q-tabs
    v-if="username && module == 'member' && !isTmp"
    inline-label
    class="desktop-only"
    align="left"
  >
    <q-route-tab to="/member/list" icon="card_membership" label="會員列表" />
    <q-route-tab to="/member/add" icon="person_add" label="新增會員" />
    <q-route-tab to="/volunteer" icon="volunteer_activism" label="義工記錄" />
    <q-route-tab to="/member/report" icon="summarize" label="報表" />
    <q-route-tab
      v-if="isSystemAdmin && !isTmp"
      to="/member/log"
      icon="schedule"
      label="系統記錄"
    />
    <q-route-tab
      v-if="isSystemAdmin && !isTmp"
      to="/member/admin"
      icon="public"
      label="系統管理"
    />
    <q-route-tab
      v-if="isSystemAdmin && !isTmp"
      to="/member/status"
      icon="public"
      label="開發狀況"
    />
  </q-tabs>
  <q-tabs
    v-if="username && module == 'event' && !isTmp"
    inline-label
    class="desktop-only"
    align="left"
  >
    <q-route-tab to="/event/my-event" icon="public" label="我的活動" />
    <q-route-tab to="/event/active" icon="public" label="活動進行中" />
    <q-route-tab to="/event/search" icon="public" label="搜尋活動" />
    <q-route-tab to="/event/summer-event" icon="public" label="活動查詢" />
    <q-route-tab to="/event/batch-apply" icon="add" label="活動報名" />
    <q-route-tab to="/event/add" icon="public" label="新增活動" />
    <q-route-tab to="/event/unplan" icon="public" label="待計劃">
      <div class="column items-center q-ml-sm">
        <q-badge color="yellow" text-color="black">
          {{ unplan_count.filter((x) => !x.plan_submit).length }}
        </q-badge>
        <q-badge color="red" text-color="white">
          {{
            unplan_count.filter(
              (x) =>
                !x.plan_submit &&
                date.getDateDiff(
                  new Date(),
                  date.extractDate(x.d_date_from, "YYYY-MM-DD"),
                  "days"
                ) >= PLAN_DEADLINE
            ).length
          }}
        </q-badge>
      </div>
    </q-route-tab>
    <q-route-tab to="/event/uneval" icon="public" label="待檢討">
      <div class="column items-center q-ml-sm">
        <q-badge color="yellow" text-color="black">
          {{
            unplan_count.filter(
              (x) =>
                !x.eval_submit &&
                date.getDateDiff(
                  new Date(),
                  date.extractDate(x.d_date_to, "YYYY-MM-DD"),
                  "days"
                ) >= 0
            ).length
          }}
        </q-badge>
        <q-badge color="red" text-color="white">
          {{
            unplan_count.filter(
              (x) =>
                !x.eval_submit &&
                date.getDateDiff(
                  new Date(),
                  date.extractDate(x.d_date_to, "YYYY-MM-DD"),
                  "days"
                ) >= 21
            ).length
          }}
        </q-badge>
      </div>
    </q-route-tab>
    <q-route-tab to="/event/report" icon="public" label="報表" />
    <q-route-tab
      v-if="isSystemAdmin && !isTmp"
      to="/event/log"
      icon="public"
      label="系統記錄"
    />
    <q-route-tab
      v-if="isSystemAdmin && !isTmp"
      to="/event/status"
      icon="public"
      label="開發狀況"
    />
  </q-tabs>
  <q-tabs
    v-if="username && module == 'account' && !isTmp"
    inline-label
    class="desktop-only"
    align="left"
  >
    <q-route-tab to="/account/other" icon="public" label="雜項收入" />
    <q-route-tab to="/account/receipt/" icon="public" label="收據一覽" />
    <q-route-tab to="/account/inventory/" icon="public" label="固定資產" />
    <q-route-tab
      v-if="isSystemAdmin && !isTmp"
      to="/account/log"
      icon="public"
      label="系統記錄"
    />
  </q-tabs>
  <q-tabs
    v-if="username && module == 'website' && !isTmp"
    inline-label
    class="desktop-only"
    align="left"
  >
    <q-route-tab
      v-if="isUAT"
      to="/website/news"
      icon="public"
      label="最新消息"
    />
    <q-route-tab
      to="/website/gallery/list?type=event"
      icon="photo"
      label="活動花絮"
    />
    <q-route-tab
      to="/website/gallery/list?type=class"
      icon="photo"
      label="班組花絮"
    />
  </q-tabs>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { useEventPlanEvalProvider } from "src/providers/eventPlanEval";
import { date } from "quasar";

const $store = useStore();
const PLAN_DEADLINE = -7; // deadline for plan submission is 7 days before event start
// computed
const username = computed(() => $store.getters["userModule/getUsername"]);
const isTmp = computed(() => $store.getters["userModule/getTmp"]);
const isUserManagement = computed(
  () => $store.getters["userModule/getUserManagement"]
);
const isSystemAdmin = computed(
  () => $store.getters["userModule/getSystemAdmin"]
);
const isUAT = computed(() => $store.getters["userModule/getUAT"]);
const module = computed(() => $store.getters["userModule/getModule"]);
const isCenterIC = computed(() => $store.getters["userModule/getCenterIC"]);

const { result: unplan_count } = useEventPlanEvalProvider({
  c_respon: isCenterIC.value ? ref(null) : username,
});
</script>
