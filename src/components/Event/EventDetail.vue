<template>
  <q-card>
  <q-tabs v-model="activeTab" inline-label align="left" class="desktop-only bg-primary text-white">
    <q-tab name="BasicInfo" icon="source" label="基本資料" />
    <q-tab name="FeeSetting" icon="paid" label="費用設定" />
    <q-tab name="Stat" icon="leaderboard" label="統計節數" />
    <q-tab name="PlanEvaluation" icon="summarize" label="計劃檢討" />
    <q-space/>
    <q-btn class="bg-primary text-white" flat icon="close" v-close-popup>
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
    <q-tab-panel name="BasicInfo" class="q-ma-none q-pa-none"> 
      <EventContent :c_act_code="props.EventID"/>
    </q-tab-panel>

    <q-tab-panel name="FeeSetting" class="text-h6">
      <EventFee :c_act_code="props.EventID"/>
    </q-tab-panel>

    <q-tab-panel name="Stat">
      <div>統計數據:</div>
      <q-table
        :rows="Stat"
        :columns="statTableColumn"
        no-data-label="沒有統計數據"
        />
    </q-tab-panel>

    <q-tab-panel name="PlanEvaluation">
      <EventEvaluation :EventID="EventID"/>
    </q-tab-panel>
  </q-tab-panels>
    
</q-card>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import LoadingDialog from "components/LoadingDialog.vue"
import { date as qdate, is, useQuasar} from "quasar";
import { EVENT_BY_PK, EVENT_STAT_BY_PK, EVENT_EVALUATION_BY_ACT_CODE } from "/src/graphQueries/Event/query.js"
import {useQuery} from "@vue/apollo-composable"
import EventEvaluation from "components/Event/EventEvalation.vue"
import EventContent from "components/Event/EventContent.vue"
import EventFee from "components/Event/EventFee.vue"

// props
const props = defineProps({
  EventID: String, 
})

// variables
const $q = useQuasar()
const $store = useStore();
const isDebug = false;
const activeTab = ref("BasicInfo")

const statTableColumn = ref([
  {
    name: "d_act",
    label: "月份",
    field: "d_act",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "i_number",
    label: "青年節數",
    field: "i_number",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "i_people_count",
    label: "青年人次",
    field: "i_people_count",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "i_number_a",
    label: "兒童節數",
    field: "i_number_a",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "i_people_count_a",
    label: "兒童人次",
    field: "i_people_count_a",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "i_number_b",
    label: "家長節數",
    field: "i_number_b",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "i_people_count_b",
    label: "家長人次",
    field: "i_people_count_b",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "i_number_c",
    label: "社區人士節數",
    field: "i_number_c",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "i_people_count_c",
    label: "社區人士人次",
    field: "i_people_count_c",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
])

// query
const { result: EventData, onError: EventDataError } = useQuery(
  EVENT_BY_PK,
  () => ({
    c_act_code: props.EventID
  }));

const { result: EventStat, onError: EventStatError } = useQuery(
  EVENT_STAT_BY_PK,
  () => ({
    c_act_code: props.EventID
  }));

// computed
const waitingAsync = computed(() => this.awaitServerResponse > 0)
const username = computed(() => $store.getters["userModule/getUsername"])
const userProfileLogout = () => $store.dispatch("userModule/logout")
const Event = computed(() => EventData.value?.HTX_Event_by_pk??[])
const Stat = computed(() => EventStat.value?.tbl_act_session??[])

// functions
function debug(args) {
  if (isDebug) {
    console.debug(args)
  }
}

// callback error
EventDataError((error) => {  
  notifyClientError(error)
})

EventStatError((error) => {
  notifyClientError(error)
})

// UI functions
function notifyClientError(error) {
  userProfileLogout()
    .then(() => {
      $q.notify({ message: "系統錯誤，請重新登入." });
    })
    .catch((error) => console.log("error", error));
}
</script>

