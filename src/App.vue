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
          青年 假期系統
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
            label="登出"
            icon="logout"
            @click="logout"
            color="primary"
          />
        </div>
      </q-toolbar>

      <q-tabs class="desktop-only" align="left">
        <q-route-tab to="/duty" label="更表" />
        <q-route-tab to="/activity" label="活動" />
        <q-route-tab to="/print" label="列印更表" />
        <q-route-tab to="/al-view" label="年假表" />
      </q-tabs>
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
        <EssentialLink v-for="link in essentialLinks" :key="link.title" v-bind="link" />
      </q-list>
      <q-list v-else>
        <EssentialLink title="登入" caption="請先登入" icon="login" link="/" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import EssentialLink from "components/EssentialLink.vue";
import { defineComponent, ref, computed } from "vue";
import firebase from "firebase/app";
import { useStore } from "vuex";
import { mapState } from "vuex";

const linksList = [
  {
    title: "更表",
    caption: "編每星期的更表",
    icon: "date_range",
    link: "duty",
  },
  {
    title: "活動",
    caption: "修改更表上的活動",
    icon: "event_available",
    link: "activity",
  },
  {
    title: "列印更表",
    caption: "列印更表和活動",
    icon: "print",
    link: "print",
  },
  {
    title: "年假表",
    caption: "年假結餘和放取記錄",
    icon: "table_rows",
    link: "al-view",
  },
];

export default defineComponent({
  name: "App",

  components: {
    EssentialLink,
  },

  setup() {
    const leftDrawerOpen = ref(false);
    const $store = useStore();

    return {
      userProfile: computed(() => $store.state.userModule.userProfile),
      uid: computed(() => $store.getters["userModule/getUID"]),
      username: computed(() => $store.getters["userModule/getUsername"]),
      photoURL: computed(() => $store.getters["userModule/getPhotoURL"]),
      userProfileLogout: () => $store.dispatch("userModule/logout"),
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
  methods: {
    logout() {
      this.userProfileLogout()
        .then(() => {
          this.$q.notify({ message: "登出成功." });
        })
        .catch((error) => console.log("error", error));
    },
  },
});
</script>

<style scoped>
/* @import url("https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400&display=swap"); */
@media screen {
  #app {
    /* font-family: "Noto Sans TC", sans-serif; */
  }
}
</style>
