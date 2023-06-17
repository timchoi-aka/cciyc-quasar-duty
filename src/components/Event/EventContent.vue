<template>
  <!-- loading dialog -->
  <LoadingDialog v-model="loading" message="處理中"/>

  <!-- delete modal -->
  <q-dialog v-model="deleteDialog">
    <q-card>
      <q-card-section class="text-h6 bg-primary text-white">
        刪除活動
      </q-card-section>
      <q-card-section class="text-h6">
        <div>確定刪除活動？刪除後將不能回復！</div>
        <div>請在以下輸入活動編號{{props.c_act_code}}</div>
        <q-input type="text" v-model="deleteCheck"/>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn :disable="deleteCheck != props.c_act_code.trim()" icon="check" label="確定" class="bg-positive text-white" v-close-popup="-1" @click="deleteAct"/>
        <q-btn icon="cancel" label="取消" class="bg-negative text-white" v-close-popup/>
      </q-card-actions>
    </q-card>
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
        <q-btn v-if="!edit" icon="edit" class="text-primary" flat @click="startEdit">
          <q-tooltip class="bg-white text-primary">修改</q-tooltip>
        </q-btn>
        <q-btn v-if="edit" icon="save" flat @click="saveEdit">
          <q-tooltip class="bg-white text-primary">儲存</q-tooltip>
        </q-btn>
        <q-btn v-if="edit" icon="cancel" flat @click="edit = false">
          <q-tooltip class="bg-white text-primary">取消</q-tooltip>
        </q-btn>
        <q-btn v-if="!edit" icon="delete" class="text-negative" flat @click="deleteDialog = true">
          <q-tooltip class="bg-white text-negative">刪除</q-tooltip>
        </q-btn>
      </q-chip>
      <div class="row q-gutter-lg q-ml-sm col-12 justify-start">
        <span class="col-2 row">
          <div class="col-12">活動編號:</div>
          <div class="col-12">{{props.c_act_code}}</div>
        </span>
        <span class="col-9 row justify-start">
          <div class="col-12 row"><span class="col-2">活動名稱(中文): </span><q-input v-if="edit" filled type="text" class="col-10 text-h6" v-model="editObject.c_act_name"/><span class="text-h6 col-10" v-else>{{Event.c_act_name}}</span></div>
          <div class="col-12 row q-mt-sm"><span class="col-2">活動名稱(英文): </span><q-input class="col-10 text-h6" filled v-if="edit" type="text" v-model="editObject.c_act_nameen"/><span class="text-h6 col-10" v-else>{{Event.c_act_nameen}}</span></div>
        </span>
      </div>
    </q-card-section>

    <q-card-section class="row bg-yellow-2 q-pl-none q-pt-none q-pb-lg">
      <q-chip class="col-12 bg-yellow-4" size="xl">類別</q-chip>
      <div class="row col-12 q-gutter-lg q-ml-sm">  
        <span class="col-3">會計類別： <q-select v-if="edit" :options="acc_type" v-model="editObject.c_acc_type"/><span v-else>{{Event.c_acc_type}}</span></span>
        <span class="col-3">狀況: <q-select v-if="edit" :options="status" v-model="editObject.c_status"/><span v-else>{{Event.c_status}}</span></span>
        <span class="col-2 column">
          <span class="col">免費: <q-checkbox v-if="edit" v-model="editObject.b_freeofcharge"/><span v-else><q-icon class="text-green" v-if="Event.b_freeofcharge" name="check"/><q-icon class="text-red" v-else name="cancel"/></span></span>
          <span class="col">完成: <q-checkbox v-if="edit" v-model="editObject.b_finish"/><span v-else><q-icon class="text-green" v-if="Event.b_finish" name="check"/><q-icon class="text-red" v-else name="cancel"/></span></span>
        </span>
        <span class="col-3">達標日期: <span v-if="edit"><DateComponent v-model="editObject.d_finish_goal"/></span><span v-else>{{qdate.formatDate(Event.d_finish_goal, "YYYY年M月D日")}}</span></span>
      </div>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-3">類別： <q-select v-if="edit" filled :options="type" v-model="editObject.c_type"/><span v-else>{{Event.c_type}}</span></span>
        <span class="col-7">性質： <q-select v-if="edit" filled :options="nature" v-model="editObject.c_nature"/><span v-else>{{Event.c_nature}}</span></span>
      </div>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-3">大分類： <q-select v-if="edit" filled :options="group1" v-model="editObject.c_group1"/><span v-else>{{Event.c_group1}}</span></span>
        <span class="col-7">細類： <q-select v-if="edit" filled :options="group2" v-model="editObject.c_group2"/><span v-else>{{Event.c_group2}}</span></span>
      </div>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-3">對象: <q-select v-if="edit" filled :options="whojoin" v-model="editObject.c_whojoin"/><span v-else>{{Event.c_whojoin}}</span></span>
        <span class="col-3">負責職員: <q-select v-if="edit" filled :options="UserList" v-model="editObject.c_respon"/><span v-else>{{Event.c_respon}}</span></span>
      </div>
    </q-card-section>

    <q-card-section class="row bg-red-1 q-pl-none q-pt-none q-pb-lg">
      <q-chip class="col-12 bg-red-3" size="xl">活動資料</q-chip>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-3">開始日期: <span v-if="edit"><DateComponent v-model="editObject.d_date_from"/></span><span v-else>{{Event.d_date_from}}</span></span>
        <span class="col-3">開始時間: <span v-if="edit"><TimeComponent v-model="editObject.d_time_from"/></span><span v-else>{{Event.d_time_from}}</span></span>
        <span class="col-3">報名日期(開始): <span v-if="edit"><DateComponent v-model="editObject.d_sale_start"/></span><span v-else>{{Event.d_sale_start}}</span></span>
      </div>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-3">終結日期: <span v-if="edit"><DateComponent v-model="editObject.d_date_to"/></span><span v-else>{{Event.d_date_to}}</span></span>
        <span class="col-3">終結時間: <span v-if="edit"><TimeComponent v-model="editObject.d_time_to"/></span><span v-else>{{Event.d_time_to}}</span></span>
        <span class="col-3">報名日期(完結): <span v-if="edit"><DateComponent v-model="editObject.d_sale_end"/></span><span v-else>{{Event.d_sale_end}}</span></span>
      </div>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-3">名額: <q-input v-if="edit" filled type="number" v-model="editObject.i_quota_max"/><span v-else>{{Event.i_quota_max}}</span></span>
        <span class="col-3">總堂數: <q-input v-if="edit" filled type="number" v-model="editObject.i_lessons"/><span v-else>{{Event.i_lessons}}</span></span>
        <span class="col-3">逢星期: <q-select v-if="edit" filled use-input input-debounce="0" @new-value="newWeek" :options="week" v-model="editObject.c_week"/><span v-else>{{Event.c_week}}</span></span>
      </div>
    </q-card-section>

    <q-card-section class="row bg-brown-1 q-pl-none q-pt-none q-pb-lg">
      <q-chip class="col-12 bg-brown-3" size="lg">地點</q-chip>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-3">舉行地點: <q-select v-if="edit" filled use-input input-debounce="0" @new-value="newDest" :options="dest" v-model="editObject.c_dest"/><span v-else>{{Event.c_dest}}</span></span>
        <span class="col-3">集合地點: <q-select v-if="edit" filled use-input input-debounce="0" @new-value="newDest" :options="dest" v-model="editObject.c_start_collect"/><span v-else>{{Event.c_start_collect}}</span></span>
        <span class="col-3">解散地點: <q-select v-if="edit" filled use-input input-debounce="0" @new-value="newDest" :options="dest" v-model="editObject.c_end_collect"/><span v-else>{{Event.c_end_collect}}</span></span>
      </div>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-3">顯示網頁: <q-checkbox v-if="edit" v-model="editObject.IsShow"/><span v-else><q-icon class="text-green" v-if="Event.IsShow" name="check"/><q-icon class="text-red" v-else name="cancel"/></span></span>
      </div>
    </q-card-section>

    <q-card-section class="row bg-green-1 q-pl-none q-pt-none q-pb-lg">
      <q-chip class="col-12 bg-green-3" size="lg">備註</q-chip>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-11">收據: </span>
        <span class="col-11" style="border: 1px solid"><q-input v-if="edit" type="textarea" v-model="editObject.m_remind_content"/><span v-else>{{Event.m_remind_content}}</span></span>
      </div>
      <div class="row col-12 q-gutter-lg q-ml-sm q-mt-sm q-pb-md">
        <span class="col-11">備註: </span>
        <span class="col-11" style="border: 1px solid"><q-input v-if="edit" type="textarea" v-model="editObject.m_remark"/><span v-else>{{Event.m_remark}}</span></span>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { date as qdate, useQuasar} from "quasar";
import { EVENT_BY_PK } from "/src/graphQueries/Event/query.js"
import { DELETE_EVENT_BY_PK, UPDATE_EVENT_BY_PK } from "/src/graphQueries/Event/mutation.js"
import { useQuery, useMutation } from "@vue/apollo-composable"
import DateComponent from "components/Basic/DateComponent.vue"
import TimeComponent from "components/Basic/TimeComponent.vue"
import LoadingDialog from "components/LoadingDialog.vue"
import { usersCollection} from "boot/firebase";
import { getDocs, query, where } from "firebase/firestore";

// props
const props = defineProps({
  c_act_code: String, 
})

// variables
const $q = useQuasar()
const $store = useStore();
const edit = ref(false)
const editObject = ref({})
const deleteDialog = ref(false)
const deleteCheck = ref("")
const serverObject = ref({})
const saveDialog = ref(false)
const loading = ref(0)

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
const { result: EventData, onError: EventDataError, refetch } = useQuery(
  EVENT_BY_PK,
  () => ({
    c_act_code: props.c_act_code
  }));
const { mutate: delEvent, onDone: delEvent_Completed, onError: delEvent_Error } = useMutation(DELETE_EVENT_BY_PK)
const { mutate: updateEvent, onDone: updateEvent_Completed, onError: updateEvent_Error } = useMutation(UPDATE_EVENT_BY_PK)

// computed
const userDocQuery = query(usersCollection,
  where("privilege.systemAdmin", "==", false),
  where("privilege.tmp", "!=", true),
  where("enable", "==", true)
)

const UserList = ref([])

getDocs(userDocQuery).then((docs) =>
  docs.forEach((doc) => {
    UserList.value.push(doc.data().name)
  })
)

const username = computed(() => $store.getters["userModule/getUsername"])
const Event = computed(() => EventData.value?.HTX_Event_by_pk??[])
const userProfileLogout = () => $store.dispatch("userModule/logout")

// functions
/**
 * Start editing content
 * clone the value to an edit object
 * @returns {any}
 */
function startEdit() {
  for (const [key, value] of Object.entries(Event.value)) {
    editObject.value[key] = value
  }
  delete editObject.value["__typename"]
  editObject.value.d_date_from = editObject.value.d_date_from? qdate.formatDate(qdate.extractDate(editObject.value.d_date_from, "D/M/YYYY"), "YYYY-MM-DD"): null
  editObject.value.d_date_to = editObject.value.d_date_to? qdate.formatDate(qdate.extractDate(editObject.value.d_date_to, "D/M/YYYY"), "YYYY-MM-DD"): null
  editObject.value.d_sale_start = editObject.value.d_sale_start? qdate.formatDate(qdate.extractDate(editObject.value.d_sale_start, "D/M/YYYY"), "YYYY-MM-DD"): null
  editObject.value.d_sale_end = editObject.value.d_sale_end? qdate.formatDate(qdate.extractDate(editObject.value.d_sale_end, "D/M/YYYY"), "YYYY-MM-DD"): null
  editObject.value.d_finish_goal = editObject.value.d_finish_goal? qdate.formatDate(editObject.value.d_finish_goal, "YYYY-MM-DD"): null
  editObject.value.d_time_from = editObject.value.d_time_from? qdate.formatDate(qdate.extractDate(editObject.value.d_time_from, "h:mm:ss A"), "HH:mm"): null
  editObject.value.d_time_to = editObject.value.d_time_to? qdate.formatDate(qdate.extractDate(editObject.value.d_time_to, "h:mm:ss A"), "HH:mm"): null
  editObject.value.IsShow = editObject.value.IsShow == 1? true: false
  edit.value = true
}

function saveEdit() {
  // clone the object to a new object before purification
  // avoid v-model limit during purification
  Object.assign(serverObject.value, editObject.value)
  purityData()
  
  const logObject = ref({
    "username": username,
    "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    "module": "活動系統",
    "action": "修改活動: " + props.c_act_code + "。新資料:" + JSON.stringify(serverObject.value, null, 2)
  })
  
  loading.value++
  updateEvent({
    logObject: logObject.value,
    object: serverObject.value,
    c_act_code: props.c_act_code,
  })
}

function deleteAct() {
  const logObject = ref({
    "username": username,
    "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    "module": "活動系統",
    "action": "刪除活動: " + props.c_act_code + "。最後資料:" + JSON.stringify(Event.value, null, 2)
  })

  delEvent({
    c_act_code: props.c_act_code,
    logObject: logObject.value,
  })
}

function purityData() {
  serverObject.value.c_act_code = props.c_act_code.trim()
  serverObject.value.c_act_name = serverObject.value.c_act_name? serverObject.value.c_act_name.trim() : null
  serverObject.value.c_act_nameen = serverObject.value.c_act_nameen? serverObject.value.c_act_nameen.trim() : null
  serverObject.value.c_acc_type = serverObject.value.c_acc_type? serverObject.value.c_acc_type.trim() : null
  serverObject.value.c_group1 = serverObject.value.c_group1? serverObject.value.c_group1.trim() : null
  serverObject.value.c_group2 = serverObject.value.c_group2? serverObject.value.c_group2.trim() : null
  serverObject.value.c_nature = serverObject.value.c_nature? serverObject.value.c_nature.trim() : null
  serverObject.value.c_respon = serverObject.value.c_respon? serverObject.value.c_respon.trim() : null
  serverObject.value.c_respon2 = serverObject.value.c_respon2? serverObject.value.c_respon2.trim() : null
  serverObject.value.c_dest = serverObject.value.c_dest? serverObject.value.c_dest.trim() : null
  serverObject.value.c_start_collect = serverObject.value.c_start_collect? serverObject.value.c_start_collect.trim() : null
  serverObject.value.c_end_collect = serverObject.value.c_end_collect? serverObject.value.c_end_collect.trim() : null
  serverObject.value.c_status = serverObject.value.c_status? serverObject.value.c_status.trim() : null
  serverObject.value.c_type = serverObject.value.c_type? serverObject.value.c_type.trim() : null
  serverObject.value.c_week = serverObject.value.c_week? serverObject.value.c_week.trim() : null
  serverObject.value.c_whojoin = serverObject.value.c_whojoin? serverObject.value.c_whojoin.trim() : null
  serverObject.value.c_worker = serverObject.value.c_worker? serverObject.value.c_worker.trim() : null
  serverObject.value.c_worker2 = serverObject.value.c_worker2? serverObject.value.c_worker2.trim() : null
  serverObject.value.m_remind_content = serverObject.value.m_remind_content? serverObject.value.m_remind_content.trim() : null
  serverObject.value.m_remark = serverObject.value.m_remark? serverObject.value.m_remark.trim() : null
  serverObject.value.IsShow = serverObject.value.IsShow? 1: 0
  serverObject.value.EventClassID = whojoin_class.value[serverObject.value.c_group1]
  serverObject.value.i_quota_max = serverObject.value.i_quota_max? parseInt(serverObject.value.i_quota_max): 0
  serverObject.value.i_lessons = serverObject.value.i_lessons? parseInt(serverObject.value.i_lessons): 0
  serverObject.value.EventClassID = serverObject.value.c_whojoin? whojoin_class.value[serverObject.value.c_whojoin]: null
  serverObject.value.b_finish = serverObject.value.b_finish? true: false
  serverObject.value.d_date_from = serverObject.value.d_date_from? qdate.formatDate(serverObject.value.d_date_from, "D/M/YYYY"): null
  serverObject.value.d_date_to = serverObject.value.d_date_to? qdate.formatDate(serverObject.value.d_date_to, "D/M/YYYY"): null
  //serverObject.value.d_finish_goal = serverObject.value.d_finish_goal? qdate.formatDate(serverObject.value.d_finish_goal, "D/M/YYYY"): null
  serverObject.value.d_finish_goal = serverObject.value.d_finish_goal
  serverObject.value.d_sale_start = serverObject.value.d_sale_start? qdate.formatDate(serverObject.value.d_sale_start, "D/M/YYYY"): null
  serverObject.value.d_sale_end = serverObject.value.d_sale_end? qdate.formatDate(serverObject.value.d_sale_end, "D/M/YYYY"): null
  
  // append seconds
  serverObject.value.d_time_from = serverObject.value.d_time_from? serverObject.value.d_time_from + ":00": null
  serverObject.value.d_time_to = serverObject.value.d_time_to? serverObject.value.d_time_to + ":00": null

  // convert to 12H server format
  serverObject.value.d_time_from = serverObject.value.d_time_from? qdate.formatDate(qdate.extractDate(serverObject.value.d_time_from, "HH:mm:ss"), "h:mm:ss A"): null
  serverObject.value.d_time_to = serverObject.value.d_time_to? qdate.formatDate(qdate.extractDate(serverObject.value.d_time_to, "HH:mm:ss"), "h:mm:ss A"): null
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

function notifyClientSuccess(result) {
  loading.value--  
  $q.notify({
    message: "刪除活動" + props.c_act_code + "完成。",
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
delEvent_Completed((result) => {
  notifyClientSuccess(result.data.delete_HTX_Event_by_pk.c_act_code)
})

updateEvent_Completed((result) => {
  serverObject.value = {}
  editObject.value = {}
  saveDialog.value = false
  edit.value = false
  refetch()
  notifyClientSuccess(result.data.update_HTX_Event_by_pk.c_act_code)
})

// callback error
delEvent_Error((error) => {
  notifyClientError(error)
})

EventDataError((error) => {
  notifyClientError(error)
})

updateEvent_Error((error) => {
  notifyClientError(error)
})
</script>