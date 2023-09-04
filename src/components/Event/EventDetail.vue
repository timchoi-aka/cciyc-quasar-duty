<template>
  <q-card>
    <q-tabs v-model="activeTab" inline-label align="left" class="bg-primary text-white">
      <q-tab name="BasicInfo" icon="source" label="基本資料" />
      <q-tab v-if="!isFree" name="FeeSetting" icon="paid" label="費用設定" />
      <q-tab name="Apply" icon="approval" label="報名" />
      <q-tab name="Stat" icon="leaderboard" label="統計節數" />
      <q-tab name="PlanEvaluation" icon="summarize" label="計劃檢討" />
      <q-tab name="Attendance" icon="person_add" label="點名紙" />
      <FavourateEvent :c_act_code="props.EventID" :username="username" />
      <q-chip class="bg-blue-3" size="lg" :label="props.EventID + ' - ' + EventName"/>
      <q-space/>
      <q-btn class="bg-primary text-white" flat icon="close" @click="confirmClose">
        <q-tooltip class="bg-white text-primary">關閉</q-tooltip>
      </q-btn>
    </q-tabs>

    <q-tab-panels
      v-model="activeTab"
      animated
      swipeable
      keep-alive
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
        <EventStat :c_act_code="props.EventID"/>
      </q-tab-panel>

      <q-tab-panel name="PlanEvaluation">
        <EventEvaluation :EventID="EventID"/>
      </q-tab-panel>

      <q-tab-panel name="Attendance">
        <Attendance :EventID="EventID"/>
      </q-tab-panel>
    </q-tab-panels>
  </q-card>
</template>

<script setup>
import { gql } from "graphql-tag"
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { useQuery } from "@vue/apollo-composable"
import EventEvaluation from "components/Event/EventEvalation.vue"
import EventContent from "components/Event/EventContent.vue"
import EventFee from "components/Event/EventFee.vue"
import EventStat from "components/Event/EventStat.vue"
import EventApply from "components/Event/EventApply.vue"
import FavourateEvent from "components/Event/FavourateEvent.vue"
import Attendance from "components/Event/Attendance.vue"
import { useQuasar } from "quasar"
// props
const props = defineProps({
  EventID: String, 
})
const emits = defineEmits(["hideComponent"])
// variables
const $q = useQuasar()
const activeTab = ref("BasicInfo")
const $store = useStore();

// query
const { result } = useQuery(gql`
query Detail_Event_by_pk($c_act_code: String!) {
  HTX_Event_by_pk(c_act_code: $c_act_code) {
    c_act_code
    b_freeofcharge
    c_act_name
  }
}`, () => ({
  c_act_code: props.EventID.trim()
}));

// computed
const username = computed(() => $store.getters["userModule/getUsername"])
const isFree = computed(() => result.value? result.value.HTX_Event_by_pk.b_freeofcharge: false)
const EventName = computed(() => result.value? result.value.HTX_Event_by_pk.c_act_name: '')

function confirmClose() {
  $q.dialog({
    title: "是否確認關閉？",
    message: "所有未儲存的資料都會遺失！",
    persistent: true,
    cancel: true
  }).onOk(()=>{
    return emits("hideComponent")
  }).onCancel(() => {})
}
</script>