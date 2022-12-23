<template>
  <q-layout view="hHh lpR lFf">
    <q-header elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-btn
          class="mobile-only"
          dense
          flat
          round
          icon="menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          <q-avatar size="70px">
            <img src="~assets/cciyc_logo.svg" />
          </q-avatar>
          <span class="desktop-only">青年 假期系統</span>
        </q-toolbar-title>

        <div v-if="username" class="q-mr-md">
          <q-chip>
            <q-avatar v-if="photoURL">
              <img :src="photoURL" />
            </q-avatar>
            {{ username }}
          </q-chip>
        </div>

        <div v-if="username">
          <q-btn
            class="flex flex-center q-px-lg q-py-sm"
            size="md"
            flat
            text-color="white"
            label="登出"
            icon="logout"
            @click="logout"
            color="white"
          />
        </div>
        <q-btn v-if="UAT" dense flat round icon="menu" @click="toggleRightDrawer" />
      </q-toolbar>

      <MenuBar/>
    </q-header>

    <q-drawer
      class="mobile-only"
      v-model="leftDrawerOpen"
      side="left"
      overlay
      behavior="mobile"
      elevated
    >
      <q-list v-if="uid">
        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
      <q-list v-else>
        <EssentialLink title="登入" caption="請先登入" icon="login" link="/" />
      </q-list>
    </q-drawer>
    
    <!-- right drawer -->
    <q-drawer :width="100" v-model="rightDrawerOpen" side="right" overlay elevated class="column justify-around" behavior="mobile">
        <q-btn v-close-popup class="col-grow" name="duty" icon="event" label="編更" to="/duty"/>
        <q-btn v-close-popup class="col-grow" name="member" icon="public" label="會員" to="/member"/>
        <q-btn v-close-popup class="col-grow" name="event" icon="festival" label="活動" to="/event"/>
        <q-btn v-close-popup class="col-grow" name="finance" icon="money" label="財務" to="/finance"/>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import EssentialLink from "components/EssentialLink.vue";
import MenuBar from "components/MenuBar.vue";
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { useQuasar } from "quasar"

// variables
const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);
const $store = useStore();
const $q = useQuasar();

// computed
// getters
const uid = computed(() => $store.getters["userModule/getUID"])
const username = computed(() => $store.getters["userModule/getUsername"])
const photoURL = computed(() => $store.getters["userModule/getPhotoURL"])
const UAT = computed(() => $store.getters["userModule/getUAT"])
const isTmp = computed(() => $store.getters["userModule/getTmp"])
const isSystemAdmin = computed(() => $store.getters["userModule/getSystemAdmin"])
const isUserManagement = computed(() => $store.getters["userModule/getUserManagement"])
// dispatch
const userProfileLogout = () => $store.dispatch("userModule/logout")
const toggleLeftDrawer = () => leftDrawerOpen.value = !leftDrawerOpen.value
const toggleRightDrawer = () => rightDrawerOpen.value = !rightDrawerOpen.value
  
// functions
function logout() {
  userProfileLogout().then(() => {
    $q.notify({ message: "登出成功." });
  })
  .catch((error) => console.log("error", error));
}

// links
const linksList = ref([
  {
    title: "編更系統",
    caption: "編更，活動，列印",
    icon: "calendar_month",
    link: "/duty",
    enable: true,
  },
  {
    title: "假期系統",
    caption: "年假，申請，審批",
    icon: "festival",
    link: "/holiday",
    enable: !isTmp.value,
  },
  {
    title: "超時系統",
    caption: "超時，申請，審批",
    icon: "schedule",
    link: "/overtime",
    enable: !isTmp.value,
  },
  {
    title: "用戶管理",
    caption: "權限，臨時員工",
    icon: "account_circle",
    link: "/user",
    enable: isUserManagement.value,
  },
  {
    title: "系統管理",
    caption: "系統管理員專用",
    icon: "build",
    link: "/system-admin",
    enable: isSystemAdmin.value,
  },
])
</script>
