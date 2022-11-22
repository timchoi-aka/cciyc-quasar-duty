<template>
    <q-tabs v-if="username && (module == 'duty' || module == '')" inline-label class="desktop-only" align="left">
        <q-route-tab to="/duty" icon="calendar_month" label="編更系統" />
        <q-route-tab v-if="!isTmp" to="/holiday" icon="festival" label="假期系統" />
        <q-route-tab v-if="!isTmp" to="/overtime" icon="schedule" label="超時系統" />
        <q-route-tab
            v-if="isUserManagement"
            to="/user"
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
        <q-route-tab to="/member/admin" icon="public" label="系統管理" />
        <q-route-tab to="/member/status" icon="public" label="開發狀況" />
        <!--

        <q-route-tab v-if="!isTmp" to="/holiday" icon="festival" label="假期系統" />
        <q-route-tab v-if="!isTmp" to="/overtime" icon="schedule" label="超時系統" />
        <q-route-tab
            v-if="isUserManagement"
            to="/user"
            icon="account_circle"
            label="用戶管理"
        />
        <q-route-tab
            v-if="isSystemAdmin"
            to="/system-admin"
            icon="build"
            label="系統管理"
        />
        -->
    </q-tabs>
    <q-tabs v-if="username && module == 'event'" inline-label class="desktop-only" align="left">
        <q-route-tab to="/event/active" icon="public" label="活動進行中" />
        <q-route-tab to="/event/search" icon="public" label="搜尋活動" />
        <!--

        <q-route-tab v-if="!isTmp" to="/holiday" icon="festival" label="假期系統" />
        <q-route-tab v-if="!isTmp" to="/overtime" icon="schedule" label="超時系統" />
        <q-route-tab
            v-if="isUserManagement"
            to="/user"
            icon="account_circle"
            label="用戶管理"
        />
        <q-route-tab
            v-if="isSystemAdmin"
            to="/system-admin"
            icon="build"
            label="系統管理"
        />
        -->
    </q-tabs>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";

export default {
    name: "MenuBar",
    setup() {
        const $store = useStore();

        return {
            username: computed(() => $store.getters["userModule/getUsername"]),
            isTmp: computed(() => $store.getters["userModule/getTmp"]),
            isUserManagement: computed(() => $store.getters["userModule/getUserManagement"]),
            isSystemAdmin: computed(() => $store.getters["userModule/getSystemAdmin"]),
            module: computed(() => $store.getters["currentModule/getCurrentModule"]),
        };
    },
}
</script>