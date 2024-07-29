<template><q-layout id="q-app" view="hHh lpR lFf">
  <!-- loading dialog -->
  <LoadingDialog v-model="loading" message="處理中" />

  <q-header elevated class="bg-primary text-white" height-hint="98">
    <q-dialog v-model="bugReportModal">
      <q-card>
        <q-card-section>
          <div class="text-h6">錯誤回報</div>
        </q-card-section>
        <q-card-section class="row">
          <div class="col-3">錯誤發生日期：</div>
          <div class="col-9">
            <DateComponent v-model="bugReportObject.date" />
          </div>
          <div class="col-3">錯誤描述：</div>
          <div class="col-9">
            <q-input type="text" v-model="bugReportObject.message" />
          </div>
          <div class="col-3">截圖（如有）：</div>
          <FileUpload class="col-9" path="bug-report" @onDone="updateFilenames" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="取消" class="bg-negative text-white" v-close-popup />
          <q-btn label="提交" class="bg-primary text-white" @click="submitBugReport" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-toolbar>
      <q-btn class="mobile-only" dense flat round icon="menu" @click="toggleLeftDrawer" />

      <q-toolbar-title>
        <q-avatar size="70px">
          <img src="~assets/cciyc_logo.svg" />
        </q-avatar>
        <span class="desktop-only">青年</span>
      </q-toolbar-title>

      <!-- notifications -->
      <div v-if="username && UAT" class="q-ml-sm bg-primary text-white">
        <q-btn flat class="desktop-only" icon="bug_report" label="錯誤回報" @click="bugReportModal = true" />
      </div>
      <div v-if="username" class="q-mx-sm bg-primary text-white">
        <NotificationBell />
      </div>

      <div v-if="username" class="desktop-only q-mr-md">
        <q-avatar rounded left v-if="photoURL" size="42px">
          <img :src="photoURL" />
        </q-avatar>
        <q-btn class="q-px-sm q-py-sm" size="md" flat text-color="white" :label="'登出: ' + username" icon="logout"
          @click="logout">
        </q-btn>
      </div>
      <q-btn v-if="isLocal" class="desktop-only" dense flat round icon="menu" @click="toggleRightDrawer" />
    </q-toolbar>

    <MenuBar :key="module" />
  </q-header>

  <q-drawer v-if="$q.platform.is.mobile" class="mobile-only column" v-model="leftDrawerOpen" side="left" overlay
    behavior="mobile" elevated>
    <q-list v-if="!uid">
      <EssentialLink title="登入" caption="請先登入" icon="login" link="/" />
    </q-list>
    <q-list v-if="uid && module == 'duty'">
      <EssentialLink v-for="link in dutyList" :key="link.title" v-bind="link" />
    </q-list>
    <q-list v-if="uid && module == 'member'">
      <EssentialLink v-for="link in memberList" :key="link.title" v-bind="link" />
    </q-list>
    <q-list v-if="uid && module == 'event'">
      <EssentialLink v-for="link in eventList" :key="link.title" v-bind="link" />
    </q-list>
    <q-list v-if="uid && module == 'account'">
      <EssentialLink v-for="link in accountList" :key="link.title" v-bind="link" />
    </q-list>
    <q-space />

    <div class="row col-*">
      <q-btn class="col" name="duty" icon="event" label="編更" @click="setCurrentModule('duty')"
        :disable="isStaging"><q-tooltip v-if="isStaging"> 測試環境不能使用編更系統。 </q-tooltip>
      </q-btn>
      <q-btn v-if="!isTmp && isLocal" class="col" name="member" icon="public" label="會員"
        @click="setCurrentModule('member')" />
      <q-btn v-if="!isTmp && isLocal" class="col" name="event" icon="festival" label="活動"
        @click="setCurrentModule('event')" />
      <q-btn v-if="!isTmp && isLocal" class="col" name="finance" icon="money" label="財務"
        @click="setCurrentModule('account')" />
    </div>
    <div class="row text-h6 q-ml-md q-my-sm">
      {{ qdate.formatDate(new Date(), "YYYY年M月D日") }}
    </div>
  </q-drawer>

  <!-- right drawer -->
  <q-drawer :width="100" v-model="rightDrawerOpen" side="right" overlay elevated class="column justify-around"
    behavior="mobile">
    <q-btn v-close-popup class="col-grow" name="duty" icon="event" label="編更" to="/duty/dutytable"
      :disable="isStaging"><q-tooltip v-if="isStaging"> 測試環境不能使用編更系統。 </q-tooltip>
    </q-btn>
    <q-btn v-if="!isTmp && isLocal" v-close-popup class="col-grow" name="member" icon="public" label="會員"
      to="/member/list" />
    <q-btn v-if="!isTmp && isLocal" v-close-popup class="col-grow" name="event" icon="festival" label="活動"
      to="/event/my-event" />
    <q-btn v-if="!isTmp && isLocal" v-close-popup class="col-grow" name="finance" icon="money" label="財務"
      to="/account/receipt/search" />
    <q-btn v-if="!isTmp && isLocal" v-close-popup class="col-grow" name="web" icon="home" label="網站"
      to="/website/gallery/list?type=event" />
  </q-drawer>

  <q-page-container>
    <router-view />
  </q-page-container>
</q-layout></template>

<script setup>
import EssentialLink from "components/EssentialLink.vue";
import NotificationBell from "components/Basic/NotificationBell.vue";
import MenuBar from "components/MenuBar.vue";
import { ref, computed, provide, onMounted } from "vue";
import { useStore } from "vuex";
import { useQuasar, date as qdate } from "quasar";
import { FirebaseMessaging } from "boot/firebase";
import { httpsCallable } from "@firebase/functions";
import { FirebaseFunctions } from "boot/firebase";
import DateComponent from "./components/Basic/DateComponent.vue";
import LoadingDialog from "components/LoadingDialog.vue";
import { authenticator, uploader } from "./boot/axios";
import { useRouter } from "vue-router";
import FileUpload from "./components/Basic/FileUpload.vue";
provide("messaging", FirebaseMessaging);

// variables
const leftDrawerOpen = ref(false);
const rightDrawerOpen = ref(false);
const $store = useStore();
const $q = useQuasar();
const bugReportModal = ref(false);
const loading = ref(0);
const router = useRouter();

// computed
// userModule getters
const uid = computed(() => $store.getters["userModule/getUID"]);
const username = computed(() => $store.getters["userModule/getUsername"]);
const photoURL = computed(() => $store.getters["userModule/getPhotoURL"]);
const UAT = computed(() => $store.getters["userModule/getUAT"]);
const isTmp = computed(() => $store.getters["userModule/getTmp"]);
const isCenterIC = computed(() => $store.getters["userModule/getCenterIC"]);
const isInventoryManagement = computed(() => $store.getters["userModule/getInventoryManagement"]);
const isStaging = computed(() => process.env.DEV_MODE == "staging");
const isSystemAdmin = computed(
  () => $store.getters["userModule/getSystemAdmin"]
);
const isUserManagement = computed(
  () => $store.getters["userModule/getUserManagement"]
);
// currentModule getters
const module = computed(() => $store.getters["userModule/getModule"]);

// bug report object
const bugReportObject = ref({
  date: qdate.formatDate(new Date(), "YYYY/MM/DD"),
  uid: uid.value,
  username: username.value,
  message: "",
  status: "未解決",
  path: "bug-report",
  filenames: [],
  docid: qdate.formatDate(new Date(), "YYYYMMDDHHmmss"),
});

// menu items
// links
const dutyList = computed(() => [
  {
    title: "編更系統",
    caption: "編更，活動，列印",
    icon: "calendar_month",
    link: "/duty",
    enable: true,
  },
  {
    title: "假期系統",
    caption: "年假，申請，結餘，審批",
    icon: "festival",
    link: "/holiday",
    enable: !isTmp.value,
  },
  {
    title: "超時系統",
    caption: "超時，申請，結餘，審批",
    icon: "schedule",
    link: "/overtime",
    enable: !isTmp.value,
  },
  {
    title: "員工醫療",
    caption: "申請醫療津貼，結餘，審批",
    icon: "health_and_safety",
    link: "/healthcare",
    enable: !isTmp.value,
  },
  {
    title: "用戶管理",
    caption: "權限，臨時員工",
    icon: "account_circle",
    link: "/user",
    enable: isUserManagement.value && !isTmp.value,
  },
  {
    title: "系統管理",
    caption: "系統管理員專用",
    icon: "build",
    link: "/system-admin",
    enable: isSystemAdmin.value && !isTmp.value,
  },
]);

// dispatch
const userProfileLogout = () => $store.dispatch("userModule/logout");
const toggleLeftDrawer = () => (leftDrawerOpen.value = !leftDrawerOpen.value);
const toggleRightDrawer = () =>
  (rightDrawerOpen.value = !rightDrawerOpen.value);
const setCurrentModule = (module) =>
  $store.dispatch("userModule/switchModule", module);

const isLocal = ref(false);

async function keepAlive() {
  if (process.env.DEV_MODE == "development") {
    isLocal.value = true;
    return;
  }
  setTimeout(function () {
    authenticator({
      timeout: 1000, // Set a timeout of 5 seconds
      method: "get",
      url: "https://192.168.2.44:3001",
      responseType: "text",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
      },
    })
      .then((result) => {
        if (result.status == 200) {
          isLocal.value = true;
        }
      })
      .catch((e) => {
        // time out, out of center network
        if (e.code == "ECONNABORTED") {
          if (isSystemAdmin.value) {
            // enable all function for admin
            isLocal.value = true;
          } else {
            if (isLocal.value) {
              // redirect if not in local network
              $store.dispatch("userModule/switchModule", "duty");
              router.push("/duty");
              isLocal.value = false;
            }
          }
        } else if (e.code == "ERR_NETWORK") {
          // cert invalid, means it's in center network
          isLocal.value = true;
        }
      });
    keepAlive();
  }, 10000);
}
onMounted(() => {
  keepAlive();
});

// functions
function logout() {
  userProfileLogout()
    .then(() => {
      $q.notify({ message: "登出成功." });
    })
    .catch((error) => console.log("error", error));
}

async function submitBugReport() {
  const addBugReport = httpsCallable(
    FirebaseFunctions,
    "systemAdmin-addBugReport"
  );

  loading.value++;
  addBugReport(bugReportObject.value).then(() => {
    loading.value--;
    bugReportObject.value = {
      date: qdate.formatDate(new Date(), "YYYY/MM/DD"),
      uid: uid.value,
      username: username.value,
      message: "",
      status: "未解決",
      path: "bug-report",
      filenames: [],
      docid: qdate.formatDate(new Date(), "YYYYMMDDHHmmss"),
    };
    bugReportModal.value = false;
    $q.notify({
      message: "成功提交錯誤報告。",
    });
  });
}

function updateFilenames(filename) {
  bugReportObject.value.filenames.push(filename.files[0].name);
}

const memberList = ref([
  {
    title: "會員列表",
    caption: "列出所有有效會員",
    icon: "card_membership",
    link: "/member/list",
    enable: !isTmp.value,
  },
  {
    title: "新增會員",
    caption: "增加新會員",
    icon: "person_add",
    link: "/member/add",
    enable: !isTmp.value,
  },
  {
    title: "義工記錄",
    caption: "記錄義工時數、報表",
    icon: "volunteer_activism",
    link: "/volunteer",
    enable: !isTmp.value,
  },
  {
    title: "報表",
    caption: "社署報表",
    icon: "summarize",
    link: "/member/report",
    enable: !isTmp.value,
  },
  {
    title: "系統記錄",
    caption: "檢視會員系統的記錄",
    icon: "schedule",
    link: "/member/log",
    enable: isSystemAdmin.value,
  },
  {
    title: "系統管理",
    caption: "系統管理員工具",
    icon: "account_circle",
    link: "/member/admin",
    enable: isSystemAdmin.value,
  },
]);

const eventList = ref([
  {
    title: "我的活動",
    caption: "我負責的活動，我的最愛",
    icon: "calendar_month",
    link: "/event/my-event",
    enable: !isTmp.value,
  },
  {
    title: "活動進行中",
    caption: "全部未完成的活動",
    icon: "festival",
    link: "/event/active",
    enable: !isTmp.value,
  },
  {
    title: "搜尋活動",
    caption: "找尋個別活動資料",
    icon: "search",
    link: "/event/search",
    enable: !isTmp.value,
  },
  {
    title: "活動查詢",
    caption: "按活動開始日期查詢",
    icon: "schedule",
    link: "/event/summer-event",
    enable: !isTmp.value,
  },
  {
    title: "活動報名",
    caption: "一人同時報名多個活動",
    icon: "add",
    link: "/event/batch-apply",
    enable: !isTmp.value,
  },
  {
    title: "新增活動",
    caption: "加入新活動",
    icon: "schedule",
    link: "/event/add",
    enable: !isTmp.value,
  },
  {
    title: "報表",
    caption: "SIS報表",
    icon: "report",
    link: "/event/report",
    enable: !isTmp.value,
  },
  {
    title: "系統記錄",
    caption: "檢視活動有關的系統記錄",
    icon: "account_circle",
    link: "/event/log",
    enable: isSystemAdmin.value,
  },
]);

const accountList = ref([
  {
    title: "雜項收入",
    caption: "雜項收入",
    icon: "payment",
    link: "/account/other",
    enable: !isTmp.value,
  },
  {
    title: "收據一覽",
    caption: "搜尋收據",
    icon: "receipt_long",
    link: "/account/receipt/search",
    enable: !isTmp.value,
  },
  {
    title: "物資管理",
    caption: "物資管理，庫存，報表",
    icon: "inventory_2",
    link: "/account/inventory",
    enable: !isTmp.value && (isInventoryManagement.value || isSystemAdmin.value || isCenterIC.value),
  },
]);
</script>
