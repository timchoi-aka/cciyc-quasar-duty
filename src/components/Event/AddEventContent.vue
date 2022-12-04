<template>
  <!-- loading dialog -->
  <q-dialog v-model="waitingAsync" position="bottom">
    <LoadingDialog message="處理中"/>
  </q-dialog>

  <!-- save modal -->
  <q-dialog v-model="saveDialog">
    <q-card>
      <q-card-section class="text-h6 bg-primary text-white">
        新增活動
      </q-card-section>
      <q-card-section>
        確定新增活動？
      </q-card-section>
      <q-card-actions>
        <q-btn icon="check" label="確定" class="bg-positive text-white" v-close-popup="-1" @click="save"/>
        <q-btn icon="cancel" label="取消" class="bg-negative text-white" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-card bordered flat class="q-pa-none q-ma-none text-h6 fit">
    <q-card-section class="row bg-grey-2 q-pl-none q-pt-none q-pb-lg">
      <q-chip class="col-12 bg-grey-4" size="xl">基本資料
        <q-btn icon="save" flat @click="saveDialog = true">
          <q-tooltip class="bg-white text-primary">儲存</q-tooltip>
        </q-btn>
      </q-chip>
      <div class="row q-gutter-lg q-ml-sm">
        <span class="col-2 column">
          <div class="col">活動編號:</div>
          <div class="col">{{props.c_act_code}}</div>
        </span>
        <span class="col-9 row">
          <div class="col-12 row"><span class="col-3">活動名稱(中文): </span><q-input class="col-9 text-h6" filled type="text" v-model="editObject.c_act_name"/></div>
          <div class="col-12 row q-mt-sm"><span class="col-3">活動名稱(英文): </span><q-input class="col-9 text-h6" filled type="text" v-model="editObject.c_act_nameen"/></div>
        </span>
      </div>
    </q-card-section>

    <q-card-section class="row bg-yellow-2 q-pl-none q-pt-none q-pb-lg">
      <q-chip class="col-12 bg-yellow-4" size="xl">類別</q-chip>
      <div class="row col-12 q-gutter-lg q-ml-sm">  
        <span class="col-3">會計類別： <q-select :options="acc_type" v-model="editObject.c_acc_type"/></span>
        <span class="col-3">狀況: <q-select :options="status" v-model="editObject.c_status"/></span>
        <span class="col-2 column">
          <span class="col">免費: <q-checkbox v-model="editObject.b_freeofcharge"/></span>
          <span class="col">完成: <q-checkbox v-model="editObject.b_finish"/></span>
        </span>
        <span class="col-3">達標日期: <DateComponent v-model="editObject.d_finish_goal"/></span>
      </div>
      
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-3">類別： <q-select filled :options="type" v-model="editObject.c_type"/></span>
        <span class="col-7">性質： <q-select filled :options="nature" v-model="editObject.c_nature"/></span>
      </div>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-3">大分類： <q-select filled :options="group1" v-model="editObject.c_group1"/></span>
        <span class="col-7">細類： <q-select filled :options="group2" v-model="editObject.c_group2"/></span>
      </div>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-3">對象: <q-select filled :options="whojoin" v-model="editObject.c_whojoin"/></span>
        <span class="col-3">負責人1: <q-select filled :options="UserList" v-model="editObject.c_respon"/></span>
        <span class="col-3">負責人2: <q-select filled :options="UserList" v-model="editObject.c_respon2"/></span>
      </div>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-3">工作人員1: <q-select filled :options="UserList" v-model="editObject.c_worker"/></span>
        <span class="col-3">工作人員2: <q-select filled :options="UserList" v-model="editObject.c_worker2"/></span>
        <span class="col-3">導師: <q-input filled type="text" v-model="editObject.c_course_tutor"/></span>
      </div>
    </q-card-section>

    <q-card-section class="row bg-red-1 q-pl-none q-pt-none q-pb-lg">
      <q-chip class="col-12 bg-red-3" size="xl">活動資料</q-chip>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-3">開始日期: <DateComponent v-model="editObject.d_date_from"/></span>
        <span class="col-3">開始時間: <TimeComponent v-model="editObject.d_time_from"/></span>
        <span class="col-3">報名日期(開始): <DateComponent v-model="editObject.d_sale_start"/></span>
      </div>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-3">終結日期: <DateComponent v-model="editObject.d_date_to"/></span>
        <span class="col-3">終結時間: <TimeComponent v-model="editObject.d_time_to"/></span>
        <span class="col-3">報名日期(完結): <DateComponent v-model="editObject.d_sale_end"/></span>
      </div>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-3">名額: <q-input filled type="number" v-model="editObject.i_quota_max"/></span>
        <span class="col-3">總堂數: <q-input filled type="number" v-model="editObject.i_lessons"/></span>
        <span class="col-3">逢星期: <q-select filled use-input input-debounce="0" @new-value="newWeek" :options="week" v-model="editObject.c_week"/></span>
      </div>
    </q-card-section>

    <q-card-section class="row bg-brown-1 q-pl-none q-pt-none q-pb-lg">
      <q-chip class="col-12 bg-brown-3" size="xl">地點</q-chip>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-3">舉行地點: <q-select filled use-input input-debounce="0" @new-value="newDest" :options="dest" v-model="editObject.c_dest"/></span>
        <span class="col-3">集合地點: <q-select filled use-input input-debounce="0" @new-value="newDest" :options="dest" v-model="editObject.c_start_collect"/></span>
        <span class="col-3">解散地點: <q-select filled use-input input-debounce="0" @new-value="newDest" :options="dest" v-model="editObject.c_end_collect"/></span>
      </div>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-3">本身主辦: <q-checkbox v-model="editObject.b_open_own"/></span>
        <span class="col-3">合辦機構: <q-checkbox v-model="editObject.b_open_oth"/></span>
        <span class="col-3">顯示網頁: <q-checkbox v-model="editObject.IsShow"/></span>
      </div>
    </q-card-section>

    <q-card-section class="row bg-green-1 q-pl-none q-pt-none q-pb-lg">
      <q-chip class="col-12 bg-green-3" size="xl">備註</q-chip>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-11">收據: </span>
        <span class="col-11" style="border: 1px solid"><q-input type="textarea" v-model="editObject.m_remind_content"/></span>
      </div>
      <div class="row col-12 q-gutter-lg q-ml-sm q-mt-md">
        <span class="col-11">備註: </span>
        <span class="col-11" style="border: 1px solid"><q-input type="textarea" v-model="editObject.m_remark"/></span>
      </div>
    </q-card-section>
  </q-card>
</template>
  
<script setup>
import { computed, ref } from "vue"
import { useStore } from "vuex"
import { date as qdate, is, useQuasar} from "quasar"
import DateComponent from "components/Basic/DateComponent.vue"
import TimeComponent from "components/Basic/TimeComponent.vue"
import { usersCollection} from "boot/firebase";
import { ADD_EVENT } from "/src/graphQueries/Event/mutation.js"
import { useMutation } from "@vue/apollo-composable"
import LoadingDialog from "components/LoadingDialog.vue"
import dateUtil from "/src/lib/date.js"

// props
const props = defineProps({
  c_act_code: String, 
})

// variables
const $q = useQuasar()
const $store = useStore();
const editObject = ref({})
const serverObject = ref({})
const saveDialog = ref(false)
const awaitServerResponse = ref(0)

const acc_type = ref([
  'PF', 'CF', 'RF', 'MF', 'SF'
])

const status = ref([
  '完成達標', '未完成', '取消', '完成不達標'
])

const type = ref([
  "小組", "活動", "課堂", "偶到", "其他"
])

const nature = ref([
  "核心青年服務A", "核心青年服務B", "核心青年服務C", "核心青年服務D", "非核心青年服務", "其他服務"
])

const group1 = ref([
  '社交/興趣','學習/發展','義務工作','青少年就業','家長服務','新來港人士服務','社區服務','中心設施'
])

const group2 = ref([
  '領䄂訓練','青年義務工作','參與地區公民事務','內地交流活動'
])

const whojoin = ref([
  '2-6歲幼兒', '7-11歲兒童', '12-14歲青少年', '15-24歲青年', '義工', '童軍', '親子', '新來港人士', '其他人士'
])

const whojoin_class = ref({
  "2-6歲幼兒": 1,
  "15-24歲青年": 4,
  '其他人士': 6,
  '義工': 8,
  '童軍': 9,
  '12-14歲青少年': 10,
  '7-11歲兒童': 11,
  '親子': 12,
  '新來港人士': 13
})

const week = ref([
  '一', '二', '三', '四', '五', '六', '日', '一三五', '二四六'
])

const dest = ref([
  '大堂', '活動室(一)', '活動室(二)', '舞蹈室', 'Band房', '電腦室', '會議室', '中心廣場', '星有利球場', '南蛇塘體育館', '海傍街體育館', '長洲碼頭', '中環五號碼頭'
])
// query
const { mutate: addEvent, onDone: addEvent_Completed, onError: addEvent_Error } = useMutation(ADD_EVENT)

// computed
const userDoc = await usersCollection
  .where("privilege.systemAdmin", "==", false)
  .where("privilege.tmp", "!=", true)
  .where("enable", "==", true)
  .get()
const username = computed(() => $store.getters["userModule/getUsername"])
const UserList = computed(() => userDoc.docs? userDoc.docs.map(a => a.data().name): [])
const waitingAsync = computed(() => awaitServerResponse > 0)
const userProfileLogout = () => $store.dispatch("userModule/logout")

//function
function save() {
  // clone the object to a new object before purification
  // avoid v-model limit during purification
  Object.assign(serverObject.value, editObject.value)
  purityData()  
  const logObject = ref({
    "username": username,
    "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    "module": "活動系統",
    "action": "新增活動: " + props.c_act_code + "。新資料:" + JSON.stringify(serverObject.value, null, 2)
  })
  
  awaitServerResponse.value++
  addEvent({
    logObject: logObject.value,
    object: serverObject.value,
  })
  saveDialog.value = false
}

function purityData() {
  serverObject.value.c_act_code = props.c_act_code.trim()
  serverObject.value.IsShow = serverObject.value.IsShow? 1: 0
  serverObject.value.EventClassID = whojoin_class.value[serverObject.value.c_group1]
  serverObject.value.i_quota_max = serverObject.value.i_quota_max? parseInt(serverObject.value.i_quota_max): 0
  serverObject.value.i_lessons = serverObject.value.i_lessons? parseInt(serverObject.value.i_lessons): 0
  serverObject.value.EventClassID = serverObject.value.c_whojoin? whojoin_class.value[serverObject.value.c_whojoin]: null
  serverObject.value.b_finish = serverObject.value.b_finish? true: false
  serverObject.value.d_date_from = serverObject.value.d_date_from? qdate.formatDate(serverObject.value.d_date_from, "D/M/YYYY"): null
  serverObject.value.d_date_to = serverObject.value.d_date_to? qdate.formatDate(serverObject.value.d_date_to, "D/M/YYYY"): null
  serverObject.value.d_finish_goal = serverObject.value.d_finish_goal? qdate.formatDate(serverObject.value.d_finish_goal, "D/M/YYYY"): null
  serverObject.value.d_sale_start = serverObject.value.d_sale_start? qdate.formatDate(serverObject.value.d_sale_start, "D/M/YYYY"): null
  serverObject.value.d_sale_end = serverObject.value.d_sale_end? qdate.formatDate(serverObject.value.d_sale_end, "D/M/YYYY"): null
  
  // append seconds
  serverObject.value.d_time_from = serverObject.value.d_time_from? serverObject.value.d_time_from + ":00": null
  serverObject.value.d_time_to = serverObject.value.d_time_to? serverObject.value.d_time_to + ":00": null

  // convert to 12H server format
  serverObject.value.d_time_from = serverObject.value.d_time_from? dateUtil.tConvert(serverObject.value.d_time_from): null
  serverObject.value.d_time_to = serverObject.value.d_time_to? dateUtil.tConvert(serverObject.value.d_time_to): null
}

// UI functions
function newWeek(val, done) {
  if (val.length > 0) {
    if (!week.value.includes(val)) {
      week.value.push(val)
    }
    done(val, 'toggle')
  }
}

function newDest(val, done) {
  if (val.length > 0) {
    if (!dest.value.includes(val)) {
      dest.value.push(val)
    }
    done(val, 'toggle')
  }
}

// UI functions
function notifyClientSuccess(result) {
  editObject.value = {}
  serverObject.value = {}
  awaitServerResponse.value--  
  $q.notify({
    message: "新增活動" + props.c_act_code + "完成。",
  })
}

function notifyClientError(error) {
  userProfileLogout()
    .then(() => {
      $q.notify({ message: "系統錯誤，請重新登入." });
    })
    .catch((error) => console.log("error", error));
}

// callback success
addEvent_Completed((result) => {
  notifyClientSuccess(result.data.insert_HTX_Event_one.c_act_code)
})

// callback error
addEvent_Error((error) => {
  notifyClientError(error)
})
</script>