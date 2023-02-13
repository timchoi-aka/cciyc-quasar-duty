<template>
  <q-tabs v-if="username && (module == 'duty' || module == '')" inline-label class="desktop-only" align="left">
    <q-route-tab to="/duty/dutytable" icon="calendar_month" label="編更系統" />
    <q-route-tab v-if="!isTmp" to="/holiday/al-view" icon="festival" label="假期系統" />
    <q-route-tab v-if="!isTmp" to="/overtime/ot-view" icon="schedule" label="超時系統" />
    <q-route-tab
        v-if="isUserManagement"
        to="/user/normal"
        icon="account_circle"
        label="用戶管理"
    />
    <q-route-tab
        v-if="isSystemAdmin"
        to="/system-admin"
        icon="build"
        label="系統管理"
    />
  </q-tabs>
  <q-tabs v-if="username && module == 'member'" inline-label class="desktop-only" align="left">
    <q-route-tab to="/member/list" icon="public" label="會員列表" />
    <q-route-tab to="/member/add" icon="public" label="新增會員" />
    <q-route-tab to="/volunteer" icon="public" label="義工記錄" />
    <q-route-tab to="/member/report" icon="public" label="報表" />
    <q-route-tab to="/member/log" icon="public" label="系統記錄" />
    <q-route-tab to="/member/admin" icon="public" label="系統管理" />
    <q-route-tab to="/member/status" icon="public" label="開發狀況" />
  </q-tabs>
  <q-tabs v-if="username && module == 'event'" inline-label class="desktop-only" align="left">
    <q-route-tab to="/event/my-event" icon="public" label="我的活動" />
    <q-route-tab to="/event/active" icon="public" label="活動進行中" />
    <q-route-tab to="/event/search" icon="public" label="搜尋活動" />
    <q-route-tab to="/event/add" icon="public" label="新增活動" />
    <q-route-tab to="/event/report" icon="public" label="報表" />
    <q-route-tab to="/event/log" icon="public" label="系統記錄" />
    <q-route-tab to="/event/status" icon="public" label="開發狀況" />
  </q-tabs>
  <q-tabs v-if="username && module == 'account'" inline-label class="desktop-only" align="left">
    <q-route-tab to="/account/other" icon="public" label="雜項收入" />
  </q-tabs>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";

const $store = useStore();

// computed
const username = computed(() => $store.getters["userModule/getUsername"])
const isTmp = computed(() => $store.getters["userModule/getTmp"])
const isUserManagement = computed(() => $store.getters["userModule/getUserManagement"])
const isSystemAdmin = computed(() => $store.getters["userModule/getSystemAdmin"])
const module = computed(() => $store.getters["currentModule/getCurrentModule"])
</script>