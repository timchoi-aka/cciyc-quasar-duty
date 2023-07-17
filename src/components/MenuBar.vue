<template>
  <q-tabs v-if="username && (module == 'duty')" inline-label class="desktop-only" align="left">
    <q-route-tab to="/duty/dutytable" icon="calendar_month" label="編更系統" />
    <q-route-tab v-if="!isTmp" to="/holiday/al-view" icon="festival" label="假期系統" />
    <q-route-tab v-if="!isTmp" to="/overtime/ot-view" icon="schedule" label="超時系統" />
    <q-route-tab v-if="!isTmp" to="/healthcare" icon="health_and_safety" label="員工醫療" />
    <q-route-tab
        v-if="isUserManagement && !isTmp"
        to="/user/normal"
        icon="account_circle"
        label="用戶管理"
    />
    <q-route-tab
        v-if="isSystemAdmin && !isTmp"
        to="/system-admin"
        icon="build"
        label="系統管理"
    />
    <q-route-tab
        v-if="(isSystemAdmin || isCenterIC) && !isTmp"
        to="/bugs"
        icon="bug_report"
        label="錯誤報告"
    />
  </q-tabs>
  <q-tabs v-if="username && (module == 'member') && !isTmp && isLocal" inline-label class="desktop-only" align="left">
    <q-route-tab to="/member/list" icon="card_membership" label="會員列表" />
    <q-route-tab to="/member/add" icon="person_add" label="新增會員" />
    <q-route-tab to="/volunteer" icon="volunteer_activism" label="義工記錄" />
    <q-route-tab to="/member/report" icon="summarize" label="報表" />
    <q-route-tab v-if="isSystemAdmin && !isTmp" to="/member/log" icon="schedule" label="系統記錄" />
    <q-route-tab v-if="isSystemAdmin && !isTmp" to="/member/admin" icon="public" label="系統管理" />
    <q-route-tab v-if="isSystemAdmin && !isTmp" to="/member/status" icon="public" label="開發狀況" />
  </q-tabs>
  <q-tabs v-if="username && (module == 'event') && !isTmp && isLocal" inline-label class="desktop-only" align="left">
    <q-route-tab to="/event/my-event" icon="public" label="我的活動" />
    <q-route-tab to="/event/active" icon="public" label="活動進行中" />
    <q-route-tab to="/event/search" icon="public" label="搜尋活動" />
    <q-route-tab to="/event/add" icon="public" label="新增活動" />
    <q-route-tab to="/event/report" icon="public" label="報表" />
    <q-route-tab v-if="isSystemAdmin && !isTmp" to="/event/log" icon="public" label="系統記錄" />
    <q-route-tab v-if="isSystemAdmin && !isTmp" to="/event/status" icon="public" label="開發狀況" />
  </q-tabs>
  <q-tabs v-if="username && (module == 'account') && !isTmp && isLocal" inline-label class="desktop-only" align="left">
    <q-route-tab to="/account/other" icon="public" label="雜項收入" />
    <q-route-tab to="/account/receipt/" icon="public" label="收據一覽" />
    <q-route-tab to="/account/inventory/" icon="public" label="物資管理" />
    <q-route-tab v-if="isSystemAdmin && !isTmp" to="/account/log" icon="public" label="系統記錄" />
  </q-tabs>
  <q-tabs v-if="username && (module == 'website') && !isTmp && isSystemAdmin && isLocal" inline-label class="desktop-only" align="left">
    <q-route-tab to="/website/news" icon="public" label="最新消息" />
  </q-tabs>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useStore } from "vuex";
import { authenticator } from "boot/axios"
import { useRouter } from "vue-router"
const $store = useStore();
const router = useRouter();

// computed
const username = computed(() => $store.getters["userModule/getUsername"])
const isTmp = computed(() => $store.getters["userModule/getTmp"])
const isUserManagement = computed(() => $store.getters["userModule/getUserManagement"])
const isSystemAdmin = computed(() => $store.getters["userModule/getSystemAdmin"])
const module = computed(() => $store.getters["userModule/getModule"])
const isCenterIC = computed(() => $store.getters["userModule/getCenterIC"])

const isLocal = ref(false)

onMounted(async () => {
  authenticator({
    timeout: 1000, // Set a timeout of 5 seconds
    method: "get",
    url: "http://192.168.2.44:3001",
    responseType: "text"
  }).then((result) => {
    if (result.status == 200) {
      isLocal.value = true
    }
  }).catch((e) => {
    $store.dispatch("userModule/switchModule", "duty");
    isLocal.value = false
    router.push('/duty')
  })
})
</script>
