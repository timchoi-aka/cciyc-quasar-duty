<template>
  <q-card bordered flat class="q-pa-none q-ma-none text-h6">
    <q-card-section class="row bg-grey-2 q-pl-none q-py-none">
      <q-chip class="col-12 bg-grey-4" size="lg">基本資料
        <q-btn v-if="!edit" icon="edit" flat @click="startEdit">
          <q-tooltip class="bg-white text-primary">修改</q-tooltip>
        </q-btn>
        <q-btn v-if="edit" icon="save" flat @click="saveEdit">
          <q-tooltip class="bg-white text-primary">儲存</q-tooltip>
        </q-btn>
        <q-btn v-if="edit" icon="cancel" flat @click="edit = false">
          <q-tooltip class="bg-white text-primary">取消</q-tooltip>
        </q-btn>
      </q-chip>
      <span class="col-2 column">
        <div class="col">活動編號:</div>
        <div class="col">{{props.c_act_code}}</div>
      </span>
      <span class="col-10 row">
        <div class="col-12 row"><span class="col-2">活動名稱(中文): </span><q-input class="col-10 text-h6" filled v-if="edit" type="text" v-model="editObject.c_act_name"/><span class="col-10" v-else>{{Event.c_act_name}}</span></div>
        <div class="col-12 row"><span class="col-2">活動名稱(英文): </span><q-input class="col-10 text-h6" filled v-if="edit" type="text" v-model="editObject.c_act_nameen"/><span class="col-10" v-else>{{Event.c_act_nameen}}</span></div>
      </span>
    </q-card-section>

    <q-card-section class="row bg-yellow-2 q-pl-none q-py-none">
      <q-chip class="col-12 bg-yellow-4" size="lg">類別</q-chip>
      <div class="row col-12">  
        <span class="col-3">會計類別： {{Event.c_acc_type}}</span>
        <span class="col-3">狀況: {{Event.c_status}}</span>
        <span class="col-2">免費: <q-icon class="text-green" v-if="Event.b_freeofcharge" name="check"/><q-icon class="text-red" v-else name="cancel"/></span>
        <span class="col-4">達標日期: {{Event.d_finish_goal}}</span>
      </div>
      <div class="row col-12">
        <span class="col-3">類別： {{Event.c_type}}</span>
        <span class="col-8">性質： {{Event.c_nature}}</span>
      </div>
      <div class="row col-12">
        <span class="col-3">大分類： {{Event.c_group1}}</span>
        <span class="col-8">細類： {{Event.c_group2}}</span>
      </div>
      <div class="row col-12">
        <span class="col-3">對象: {{Event.c_whojoin}}</span>
        <span class="col-3">負責人1: {{Event.c_respon}}</span>
        <span class="col-3">負責人2: {{Event.c_respon2}}</span>
      </div>
      <div class="row col-12">
        <span class="col-3">工作人員1: {{Event.c_worker}}</span>
        <span class="col-3">工作人員2: {{Event.c_worker2}}</span>
        <span class="col-3">導師: {{Event.c_course_tutor}}</span>
      </div>
    </q-card-section>

    <q-card-section class="row bg-red-1 q-pl-none q-py-none">
      <q-chip class="col-12 bg-red-3" size="lg">活動資料</q-chip>
      <div class="row col-12">
        <span class="col-3">開始日期: {{Event.d_date_from}}</span>
        <span class="col-3">開始時間: {{Event.d_time_from}}</span>
        <span class="col-3">報名日期(開始): {{Event.d_sale_start}}</span>
      </div>
      <div class="row col-12">
        <span class="col-3">終結日期: {{Event.d_date_to}}</span>
        <span class="col-3">終結時間: {{Event.d_time_to}}</span>
        <span class="col-3">報名日期(完結): {{Event.d_sale_end}}</span>
      </div>
      <div class="row col-12">
        <span class="col-3">名額: {{Event.i_quota_max}}</span>
        <span class="col-3">總堂數: {{Event.i_lessons}}</span>
        <span class="col-3">逢星期: {{Event.c_week}}</span>
      </div>
    </q-card-section>

    <q-card-section class="row bg-brown-1 q-pl-none q-py-none">
      <q-chip class="col-12 bg-brown-3" size="lg">地點</q-chip>
      <div class="row col-12">
        <span class="col-3">舉行地點: {{Event.c_dest}}</span>
        <span class="col-3">集合地點: {{Event.c_start_collect}}</span>
        <span class="col-3">解散地點: {{Event.c_end_collect}}</span>
      </div>
      <div class="row col-12">
        <span class="col-3">本身主辦: <q-icon class="text-green" v-if="Event.b_open_own" name="check"/><q-icon class="text-red" v-else name="cancel"/></span>
        <span class="col-3">合辦機構: <q-icon class="text-green" v-if="Event.b_open_other" name="check"/><q-icon class="text-red" v-else name="cancel"/>{{Event.c_open_other}}</span>
        <span class="col-3">顯示網頁: <q-icon class="text-green" v-if="Event.b_IsShow" name="check"/><q-icon class="text-red" v-else name="cancel"/>{{Event.c_open_other}}</span>
      </div>
    </q-card-section>

    <q-card-section class="row bg-green-1 q-pl-none q-py-none">
      <q-chip class="col-12 bg-green-3" size="lg">備註</q-chip>
      <div class="row col-12">
        <span class="col-3">收據: </span>
        <span class="col-8">{{Event.m_remind_content}}</span>
      </div>
      <div class="row col-12">
        <span class="col-12">備註: </span>
        <span class="col-12" style="border: 1px solid">{{Event.m_remark}}</span>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { date as qdate, is, useQuasar} from "quasar";
import { EVENT_BY_PK } from "/src/graphQueries/Event/query.js"
import {useQuery} from "@vue/apollo-composable"

// props
const props = defineProps({
  c_act_code: String, 
})

// variables
const $q = useQuasar()
const $store = useStore();
const edit = ref(false)
const editObject = ref({})

// query
const { result: EventData, onError: EventDataError } = useQuery(
  EVENT_BY_PK,
  () => ({
    c_act_code: props.c_act_code
  }));

// computed
const username = computed(() => $store.getters["userModule/getUsername"])
const Event = computed(() => EventData.value?.HTX_Event_by_pk??[])

// functions
function startEdit() {
  for (const [key, value] of Object.entries(Event.value)) {
    editObject.value[key] = value
  }
  delete editObject.value["__typename"]
  edit.value = true
}

function saveEdit() {

}
</script>