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
    <q-tab-panel name="BasicInfo" class="row fit text-h6"> 
      <q-card class="fit" bordered flat>
        <q-card-section class="row fit bg-grey-3">
          <span class="col-2 column">
            <div class="col">活動編號:</div>
            <div class="col">{{props.EventID}}</div>
          </span>
          <span class="col-10 column">
            <div class="col">活動名稱(中文): {{Event.c_act_name}}</div>
            <div class="col">活動名稱(英文): {{Event.c_act_nameen}}</div>
          </span>
        </q-card-section>

        <q-card-section>

        </q-card-section>
      </q-card>
     
      <div class="row fit">
        <span class="col-3">會計類別： {{Event.c_acc_type}}</span>
        <span class="col-3">狀況: {{Event.c_status}}</span>
        <span class="col-2">免費: <q-icon class="text-green" v-if="Event.b_freeofcharge" name="check"/><q-icon class="text-red" v-else name="cancel"/></span>
        <span class="col-4">達標日期: {{Event.d_finish_goal}}</span>
      </div>
      <div class="row fit">
        <span class="col-3">類別： {{Event.c_type}}</span>
        <span class="col-8">性質： {{Event.c_nature}}</span>
      </div>
      <div class="row fit">
        <span class="col-3">大分類： {{Event.c_group1}}</span>
        <span class="col-8">細類： {{Event.c_group2}}</span>
      </div>
      <div class="row fit">
        <span class="col-3">對象: {{Event.c_whojoin}}</span>
        <span class="col-3">負責人1: {{Event.c_respon}}</span>
        <span class="col-3">負責人2: {{Event.c_respon2}}</span>
      </div>
      <div class="row fit">
        <span class="col-3">工作人員1: {{Event.c_worker}}</span>
        <span class="col-3">工作人員2: {{Event.c_worker2}}</span>
        <span class="col-3">導師: {{Event.c_course_tutor}}</span>
      </div>
      <div class="row fit">
        <span class="col-3">開始日期: {{Event.d_date_from}}</span>
        <span class="col-3">開始時間: {{Event.d_time_from}}</span>
        <span class="col-3">報名日期(開始): {{Event.d_sale_start}}</span>
      </div>
      <div class="row fit">
        <span class="col-3">終結日期: {{Event.d_date_to}}</span>
        <span class="col-3">終結時間: {{Event.d_time_to}}</span>
        <span class="col-3">報名日期(完結): {{Event.d_sale_end}}</span>
      </div>
      <div class="row fit">
        <span class="col-3">名額: {{Event.i_quota_max}}</span>
        <span class="col-3">總堂數: {{Event.i_lessons}}</span>
        <span class="col-3">逢星期: {{Event.c_week}}</span>
      </div>
      <div class="row fit">
        <span class="col-3">舉行地點: {{Event.c_dest}}</span>
        <span class="col-3">集合地點: {{Event.c_start_collect}}</span>
        <span class="col-3">解散地點: {{Event.c_end_collect}}</span>
      </div>
      <div class="row fit">
        <span class="col-3">本身主辦: <q-icon class="text-green" v-if="Event.b_open_own" name="check"/><q-icon class="text-red" v-else name="cancel"/></span>
        <span class="col-3">合辦機構: <q-icon class="text-green" v-if="Event.b_open_other" name="check"/><q-icon class="text-red" v-else name="cancel"/>{{Event.c_open_other}}</span>
        <span class="col-3">顯示網頁: <q-icon class="text-green" v-if="Event.b_IsShow" name="check"/><q-icon class="text-red" v-else name="cancel"/>{{Event.c_open_other}}</span>
      </div>
      <div class="row fit">
        <span class="col-3">收據: </span>
        <span class="col-8">{{Event.m_remind_content}}</span>
      </div>
      <div class="row fit">
        <span class="col-12">備註: </span>
        <span class="col-12" style="border: 1px solid">{{Event.m_remark}}</span>
      </div>
    </q-tab-panel>

    <q-tab-panel name="FeeSetting" class="text-h6">
      <div>收費模式:</div>
      <q-list>
        <q-item v-for="item in Fee" :key="item">{{item.c_type}} - {{item.u_fee}}</q-item>
      </q-list>
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
import { EVENT_BY_PK, EVENT_FEE_BY_PK, EVENT_STAT_BY_PK, EVENT_EVALUATION_BY_ACT_CODE } from "/src/graphQueries/Event/query.js"
import {useQuery} from "@vue/apollo-composable"
import EventEvaluation from "components/Event/EventEvalation.vue"

const props = defineProps({
  EventID: String, 
})
const $q = useQuasar()
const $store = useStore();
const userProfileLogout = () => $store.dispatch("userModule/logout")
const refreshToken = () => $store.dispatch("userModule/refreshToken")

const isDebug = false;
const activeTab = ref("BasicInfo")

// computed
const waitingAsync = computed(() => this.awaitServerResponse > 0)
const username = computed(() => $store.getters["userModule/getUsername"])
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
const { result: EventData, onError: EventDataError } = useQuery(
  EVENT_BY_PK,
  () => ({
    c_act_code: props.EventID
  }));

const { result: EventFee, onError: EventFeeError } = useQuery(
  EVENT_FEE_BY_PK,
  () => ({
    c_act_code: props.EventID
  }));

const { result: EventStat, onError: EventStatError } = useQuery(
  EVENT_STAT_BY_PK,
  () => ({
    c_act_code: props.EventID
  }));


const Event = computed(() => EventData.value?.HTX_Event_by_pk??[])
const Fee = computed(() => EventFee.value?.tbl_act_fee??[])
const Stat = computed(() => EventStat.value?.tbl_act_session??[])

function debug(args) {
  if (isDebug) {
    console.debug(args)
  }
}

EventDataError((error) => {
  // console.log("error in module:" + JSON.stringify(error))
  if (error.graphQLErrors[0].extensions.code == "invalid-jwt") {
    userProfileLogout()
      .then(() => {
        $q.notify({ message: "系統逾時，自動登出." });
      })
      .catch((error) => console.log("error", error));
  }
})

EventFeeError((error) => {
  // console.log("error in module:" + JSON.stringify(error))
  if (error.graphQLErrors[0].extensions.code == "invalid-jwt") {
    userProfileLogout()
      .then(() => {
        $q.notify({ message: "系統逾時，自動登出." });
      })
      .catch((error) => console.log("error", error));
  }
})

EventStatError((error) => {
  // console.log("error in module:" + JSON.stringify(error))
  if (error.graphQLErrors[0].extensions.code == "invalid-jwt") {
    refreshToken() //userProfileLogout()
      .then(() => {
        //$q.notify({ message: "系統逾時，自動登出." });
        $q.notify({ message: "系統逾時，已重新連接." });
      })
      .catch((error) => console.log("error", error));
  }
})
</script>

