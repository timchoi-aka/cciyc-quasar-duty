<template>
  <q-card square>
    <q-tabs v-model="activeTab" inline-label align="left" class="bg-blue-10 text-white">
      <q-route-tab name="BasicInfo" icon="source" label="基本資料" :to="{ name: 'EventContent', params: { id: route.params.id}}"/>
      <q-route-tab v-if="!isFree" name="FeeSetting" icon="paid" label="費用設定" />
      <q-route-tab name="Apply" icon="approval" label="報名" />
      <q-route-tab name="Stat" icon="leaderboard" label="統計節數" />
      <q-route-tab name="PlanEvaluation" icon="summarize" label="計劃檢討" />
      <q-route-tab v-if="isUAT" name="AttendanceList" icon="person_add" label="點名" :to="{ name: 'TakeAttendance', params: { id: route.params.id}}"/>
      <q-route-tab name="AttendancePrint" icon="person_add" label="點名紙" :to="{ name: 'AttendancePrint', params: { id: route.params.id}}"/>
      <FavourateEvent :c_act_code="EventID" :username="username" />
      <q-chip class="bg-blue-3" size="lg" :label="EventID + ' - ' + EventName"/>
      <q-space/>
      <q-btn class="bg-blue-10 text-white" flat icon="close" @click="confirmClose">
        <q-tooltip class="bg-white text-primary">關閉</q-tooltip>
      </q-btn>
    </q-tabs>

    <router-view v-slot="{ Component }">
      <!-- <keep-alive>-->
        <component :is="Component"/>
      <!--</keep-alive>-->
    </router-view>
    <!--
    <q-tab-panels
      v-model="activeTab"
      animated
      swipeable
      keep-alive
      transition-prev="jump-up"
      transition-next="jump-up"
    >
      <q-tab-panel name="BasicInfo" class="q-ma-none q-pa-none">
        <EventContent :c_act_code="EventID"/>
      </q-tab-panel>

      <q-tab-panel name="FeeSetting" class="text-h6">
        <EventFee :c_act_code="EventID"/>
      </q-tab-panel>

      <q-tab-panel name="Apply" class="text-h6">
        <EventApply :c_act_code="EventID"/>
      </q-tab-panel>

      <q-tab-panel name="Stat">
        <EventStat :c_act_code="EventID"/>
      </q-tab-panel>

      <q-tab-panel name="PlanEvaluation">
        <EventEvaluation :EventID="EventID"/>
      </q-tab-panel>

      <q-tab-panel name="AttendanceList">
        <AttendanceList :EventID="route.params.id"/>
      </q-tab-panel>

      <q-tab-panel name="Attendance">
        <Attendance :EventID="EventID"/>
      </q-tab-panel>
    </q-tab-panels>
    -->
  </q-card>
</template>

<script setup>
import { gql } from "graphql-tag"
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { useQuery } from "@vue/apollo-composable"
import FavourateEvent from "components/Event/FavourateEvent.vue"
import { useQuasar } from "quasar"
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
// props
const props = defineProps({
  EventID: String,
})

const params = route.params.id;
const EventID = computed(() => params? params.trim(): props.EventID.trim())

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
  c_act_code: EventID.value
}));

// computed
const username = computed(() => $store.getters["userModule/getUsername"])
const isFree = computed(() => result.value? result.value.HTX_Event_by_pk.b_freeofcharge: false)
const EventName = computed(() => result.value? result.value.HTX_Event_by_pk.c_act_name: '')
const isUAT = computed(() => $store.getters["userModule/getUAT"])

function confirmClose() {
  $q.dialog({
    title: "是否確認關閉？",
    message: "所有未儲存的資料都會遺失！",
    persistent: true,
    cancel: true
  }).onOk(()=>{
    router.go(-1)
    return emits("hideComponent")
  }).onCancel(() => {})
}
</script>
