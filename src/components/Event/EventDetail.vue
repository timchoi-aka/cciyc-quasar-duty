<template>
  <q-card>
  <q-tabs v-model="activeTab" inline-label align="left" class="desktop-only bg-primary text-white">
    <q-tab name="BasicInfo" icon="source" label="基本資料" />
    <q-tab name="FeeSetting" icon="paid" label="費用設定" />
    <q-tab name="Apply" icon="approval" label="報名" />
    <q-tab name="Stat" icon="leaderboard" label="統計節數" />
    <q-tab name="PlanEvaluation" icon="summarize" label="計劃檢討" />
    <FavourateEvent :c_act_code="props.EventID" :username="username" />
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

    <q-tab-panel name="Apply" class="text-h6">
      <EventApply :c_act_code="props.EventID"/>
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
import { ref, computed } from "vue";
import { useStore } from "vuex";
import EventEvaluation from "components/Event/EventEvalation.vue"
import EventContent from "components/Event/EventContent.vue"
import EventFee from "components/Event/EventFee.vue"
import EventStat from "components/Event/EventStat.vue"
import EventApply from "components/Event/EventApply.vue"
import FavourateEvent from "components/Event/FavourateEvent.vue"

// props
const props = defineProps({
  EventID: String, 
})

// variables
const activeTab = ref("BasicInfo")
const $store = useStore();

// computed
const username = computed(() => $store.getters["userModule/getUsername"])</script>

