<template>
  <q-card square>
    <div
      v-if="$q.screen.lt.sm"
      class="row no-wrap bg-blue-10 text-white text-body2 q-pa-xs items-center"
    >
      <div class="col-auto">{{ c_act_code }} - {{ EventName }}</div>
      <q-space />
      <FavourateEvent
        class="col-1"
        :c_act_code="c_act_code"
        :username="username"
      />
    </div>
    <div v-if="Object.keys(route.params).length > 0">
      <q-tabs
        inline-label
        outside-arrows
        mobile-arrows
        align="left"
        class="bg-blue-10 text-white"
      >
        <q-route-tab
          icon="source"
          label="基本資料"
          :to="{ name: 'EventContent', params: { id: c_act_code } }"
        />
        <q-route-tab
          v-if="!isFree"
          icon="paid"
          label="費用設定"
          :to="{ name: 'EventFee', params: { id: c_act_code } }"
        />
        <q-route-tab
          icon="approval"
          label="報名"
          :to="{ name: 'EventApply', params: { id: c_act_code } }"
        />
        <q-route-tab
          icon="leaderboard"
          label="統計節數"
          :to="{ name: 'EventStat', params: { id: c_act_code } }"
        />
        <q-route-tab
          icon="person_add"
          label="每日統計"
          :to="{ name: 'TakeAttendance', params: { id: c_act_code } }"
        />
        <q-route-tab
          icon="report"
          label="每月服務統計"
          :to="{ name: 'EventAttendanceReport', params: { id: c_act_code } }"
        />
        <q-route-tab
          icon="summarize"
          label="計劃檢討"
          :to="{ path: '/event/detail/' + c_act_code + '/evaluation/view' }"
        />
        <FavourateEvent
          v-if="$q.screen.gt.xs"
          :c_act_code="c_act_code"
          :username="username"
        />
        <q-chip
          v-if="$q.screen.gt.xs"
          class="bg-blue-3"
          size="lg"
          :label="c_act_code + ' - ' + EventName"
        />
        <q-space />
        <q-btn
          v-if="$q.screen.gt.xs"
          class="bg-blue-10 text-white"
          flat
          icon="close"
          @click="router.push(previousRoute)"
        >
          <q-tooltip class="bg-white text-primary">關閉</q-tooltip>
        </q-btn>
      </q-tabs>

      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </div>
    <div v-else>
      <q-tabs
        v-model="activeTab"
        inline-label
        outside-arrows
        mobile-arrows
        align="left"
        class="desktop-only bg-blue-10 text-white"
      >
        <q-tab icon="source" label="基本資料" name="EventContent" />
        <q-tab v-if="!isFree" icon="paid" label="費用設定" name="EventFee" />
        <q-tab icon="approval" label="報名" name="EventApply" />
        <q-tab icon="leaderboard" label="統計節數" name="EventStat" />
        <q-tab icon="person_add" label="每日統計" name="TakeAttendance" />
        <q-tab
          icon="report"
          label="每月服務統計"
          name="EventAttendanceReport"
        />

        <FavourateEvent
          v-if="$q.screen.gt.xs"
          :c_act_code="c_act_code"
          :username="username"
        />
        <q-chip
          v-if="$q.screen.gt.xs"
          class="bg-blue-3"
          size="lg"
          :label="c_act_code + ' - ' + EventName"
        />
        <q-space />
        <q-btn
          v-if="$q.screen.gt.xs"
          class="bg-blue-10 text-white"
          flat
          icon="close"
          v-close-popup
        >
          <q-tooltip class="bg-white text-primary">關閉</q-tooltip>
        </q-btn>
      </q-tabs>

      <q-tab-panels
        v-model="activeTab"
        animated
        swipeable
        transition-prev="jump-up"
        transition-next="jump-up"
      >
        <q-tab-panel name="EventContent" class="q-ma-none q-pa-sm text-body1">
          <EventContent :c_act_code="c_act_code" />
        </q-tab-panel>
        <q-tab-panel name="EventFee" class="q-ma-none q-pa-sm text-body1">
          <EventFee :c_act_code="c_act_code" />
        </q-tab-panel>
        <q-tab-panel name="EventApply" class="q-ma-none q-pa-sm text-body1">
          <EventApply :c_act_code="c_act_code" />
        </q-tab-panel>
        <q-tab-panel name="EventStat" class="q-ma-none q-pa-sm text-body1">
          <EventStat :c_act_code="c_act_code" />
        </q-tab-panel>
        <q-tab-panel name="TakeAttendance" class="q-ma-none q-pa-sm text-body1">
          <AttendanceTake :c_act_code="c_act_code" />
        </q-tab-panel>
        <q-tab-panel
          name="EventAttendanceReport"
          class="q-ma-none q-pa-sm text-body1"
        >
          <EventAttendanceReport :c_act_code="c_act_code" />
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-card>
</template>

<script setup>
import { ref, computed, defineAsyncComponent } from "vue";
import { useStore } from "vuex";
import FavourateEvent from "components/Event/FavourateEvent.vue";
import { useRouter, useRoute } from "vue-router";
import { useEventProvider } from "src/providers/event";
import { useQuasar } from "quasar";

const EventContent = defineAsyncComponent(() => import("./EventContent.vue"));
const EventFee = defineAsyncComponent(() => import("./EventFee.vue"));
const EventApply = defineAsyncComponent(() => import("./EventApply.vue"));
const EventStat = defineAsyncComponent(() => import("./EventStat.vue"));
const AttendanceTake = defineAsyncComponent(() =>
  import("./AttendanceTake.vue")
);
const EventAttendanceReport = defineAsyncComponent(() =>
  import("./EventAttendanceReport.vue")
);

// variables
const props = defineProps({
  EventID: {
    type: String,
    required: false,
  },
});
const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const previousRoute = router.options.history.state.back;
const $store = useStore();
const activeTab = ref("EventContent");
const c_act_code = computed(() =>
  route.params.id ? route.params.id : props.EventID
);

const { result } = useEventProvider({
  c_act_code: c_act_code,
});

// computed
const username = computed(() => $store.getters["userModule/getUsername"]);
const isFree = computed(() =>
  result.value && result.value.HTX_Event_by_pk
    ? result.value.HTX_Event_by_pk.b_freeofcharge
    : false
);
const EventName = computed(() =>
  result.value && result.value.HTX_Event_by_pk
    ? result.value.HTX_Event_by_pk.c_act_name
    : ""
);
</script>
