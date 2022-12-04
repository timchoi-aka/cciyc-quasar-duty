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
      <EventStat :c_act_code="props.EventID"/>
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
import { useQuasar} from "quasar";
import { EVENT_BY_PK} from "/src/graphQueries/Event/query.js"
import { useQuery } from "@vue/apollo-composable"
import EventEvaluation from "components/Event/EventEvalation.vue"
import EventContent from "components/Event/EventContent.vue"
import EventFee from "components/Event/EventFee.vue"
import EventStat from "components/Event/EventStat.vue"

// props
const props = defineProps({
  EventID: String, 
})

// variables
const $q = useQuasar()
const $store = useStore();
const isDebug = false;
const activeTab = ref("BasicInfo")

// query
const { result: EventData, onError: EventDataError } = useQuery(
  EVENT_BY_PK,
  () => ({
    c_act_code: props.EventID
  }));

// computed
const waitingAsync = computed(() => this.awaitServerResponse > 0)
const username = computed(() => $store.getters["userModule/getUsername"])
const userProfileLogout = () => $store.dispatch("userModule/logout")
const Event = computed(() => EventData.value?.HTX_Event_by_pk??[])


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

// UI functions
function notifyClientError(error) {
  userProfileLogout()
    .then(() => {
      $q.notify({ message: "系統錯誤，請重新登入." });
    })
    .catch((error) => console.log("error", error));
}
</script>

