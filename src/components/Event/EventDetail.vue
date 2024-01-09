<template>
  <q-card square>
    <div v-if="$q.screen.lt.sm" class="row no-wrap bg-blue-10 text-white text-body2 q-pa-xs items-center">
      <div class="col-auto">{{ c_act_code }} - {{ EventName}}</div>
      <q-space/>
      <FavourateEvent class="col-1" :c_act_code="c_act_code" :username="username" />
    </div>
    <q-tabs inline-label
        outside-arrows
        mobile-arrows align="left" class="bg-blue-10 text-white" >
      <q-route-tab icon="source" label="基本資料" :to="{ name: 'EventContent', params: { id: route.params.id}}"/>
      <q-route-tab v-if="!isFree" icon="paid" label="費用設定" :to="{ name: 'EventFee', params: { id: route.params.id}}"/>
      <q-route-tab icon="approval" label="報名" :to="{ name: 'EventApply', params: { id: route.params.id}}"/>
      <q-route-tab icon="leaderboard" label="統計節數" :to="{ name: 'EventStat', params: { id: route.params.id}}"/>
      <q-route-tab icon="person_add" label="點名" :to="{ name: 'TakeAttendance', params: { id: route.params.id}}"/>
      <q-route-tab icon="report" label="每月服務統計" :to="{ name: 'EventAttendanceReport', params: { id: route.params.id}}"/>
      <q-route-tab icon="summarize" label="計劃檢討" :to="{ name: 'EventEvaluation', params: { id: route.params.id}}"/>
      <FavourateEvent v-if="$q.screen.gt.xs" :c_act_code="c_act_code" :username="username" />
      <q-chip v-if="$q.screen.gt.xs" class="bg-blue-3" size="lg" :label="c_act_code + ' - ' + EventName"/>
      <q-space/>
      <q-btn v-if="$q.screen.gt.xs" class="bg-blue-10 text-white" flat icon="close" @click="router.push(previousRoute)">
        <q-tooltip class="bg-white text-primary">關閉</q-tooltip>
      </q-btn>
    </q-tabs>

    <router-view v-slot="{ Component }">
      <component :is="Component"/>
    </router-view>
  </q-card>
</template>

<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import FavourateEvent from "components/Event/FavourateEvent.vue"
import { useRouter, useRoute,  } from 'vue-router'
import { useEventProvider } from "src/providers/event";
import { useQuasar } from "quasar";

// variables
const $q = useQuasar()
const router = useRouter()
const route = useRoute()
const previousRoute = router.options.history.state.back
const c_act_code = ref(route.params.id)
const $store = useStore();

const { result } = useEventProvider({ c_act_code: c_act_code.value})

// computed
const username = computed(() => $store.getters["userModule/getUsername"])
const isFree = computed(() => result.value && result.value.HTX_Event_by_pk? result.value.HTX_Event_by_pk.b_freeofcharge: false)
const EventName = computed(() => result.value && result.value.HTX_Event_by_pk? result.value.HTX_Event_by_pk.c_act_name: '')
const isUAT = computed(() => $store.getters["userModule/getUAT"])
</script>
