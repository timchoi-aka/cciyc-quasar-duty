<template>
  <!-- loading dialog -->
  <LoadingDialog v-model="loading" message="處理中" />

  <!-- save modal -->
  <q-dialog v-model="saveDialog">
    <q-card>
      <q-card-section class="text-h6 bg-primary text-white">
        新增活動
      </q-card-section>
      <q-card-section> 確定新增活動？ </q-card-section>
      <q-card-actions>
        <q-btn
          icon="check"
          label="確定"
          class="bg-positive text-white"
          v-close-popup="-1"
          @click="save"
        />
        <q-btn
          icon="cancel"
          label="取消"
          class="bg-negative text-white"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- load event modal -->
  <q-dialog v-model="loadDialog" v-if="$q.screen.lt.md" full-width>
    <q-card>
      <q-card-section class="text-h6 bg-blue-2">
        載入活動資料:
        <EventSelection v-model="loadEventID" />
      </q-card-section>
      <q-card-section v-if="EventData.HTX_Event_by_pk">
        {{ EventData }}
      </q-card-section>
      <q-card-actions>
        <q-btn
          icon="check"
          label="確定"
          class="bg-positive text-white"
          v-close-popup
        />
        <q-btn
          icon="cancel"
          label="取消"
          class="bg-negative text-white"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="loadDialog" position="top" v-else>
    <q-card style="width: 60vw">
      <q-card-section class="text-h6 bg-blue-2">
        載入活動資料:
        <EventSelection v-model="loadEventID" />
      </q-card-section>
      <q-card-section
        v-if="EventData.HTX_Event_by_pk"
        class="text-body1 q-pa-none"
      >
        <q-tabs
          v-model="activeTab"
          inline-label
          align="left"
          class="desktop-only bg-primary text-white"
        >
          <q-tab name="EventInfo" icon="source" label="活動資料" />
          <q-tab name="DateTime" icon="event" label="日期時間" />
          <q-tab name="Venue" icon="pin_drop" label="地點" />
          <q-tab name="Fee" icon="paid" label="費用" />
        </q-tabs>

        <q-tab-panels
          v-model="activeTab"
          animated
          swipeable
          transition-prev="jump-up"
          transition-next="jump-up"
        >
          <q-tab-panel name="EventInfo" class="q-ma-none q-pa-sm text-body1">
            <div>
              活動名稱(中文)：{{ EventData.HTX_Event_by_pk.c_act_name }}
            </div>
            <div>
              活動名稱(英文)：{{ EventData.HTX_Event_by_pk.c_act_nameen }}
            </div>
            <div>會計類別：{{ EventData.HTX_Event_by_pk.c_acc_type }}</div>
            <div>
              免費：<q-icon
                v-if="EventData.HTX_Event_by_pk.b_freeofcharge"
                name="check"
              /><q-icon v-else name="cancel" />
            </div>
            <div>類別：{{ EventData.HTX_Event_by_pk.c_type }}</div>
            <div>性質：{{ EventData.HTX_Event_by_pk.c_nature }}</div>
            <div>大分類：{{ EventData.HTX_Event_by_pk.c_group1 }}</div>
            <div>細類：{{ EventData.HTX_Event_by_pk.c_group2 }}</div>
            <div>對象：{{ EventData.HTX_Event_by_pk.c_whojoin }}</div>
            <div>負責人1：{{ EventData.HTX_Event_by_pk.c_respon }}</div>
            <div>負責人2：{{ EventData.HTX_Event_by_pk.c_respon2 }}</div>
            <div>工作人員1：{{ EventData.HTX_Event_by_pk.c_worker }}</div>
            <div>工作人員2：{{ EventData.HTX_Event_by_pk.c_worker2 }}</div>
            <div>導師：{{ EventData.HTX_Event_by_pk.c_course_tutor }}</div>
          </q-tab-panel>

          <q-tab-panel name="DateTime" class="q-ma-none q-pa-sm text-body1">
            <div>開始時間：{{ EventData.HTX_Event_by_pk.d_time_from }}</div>
            <div>結束時間：{{ EventData.HTX_Event_by_pk.d_time_to }}</div>
            <div>名額：{{ EventData.HTX_Event_by_pk.i_quota_max }}</div>
            <div>總堂數：{{ EventData.HTX_Event_by_pk.i_lessons }}</div>
            <div>逢星期：{{ EventData.HTX_Event_by_pk.c_week }}</div>
            <div>
              收據備註：{{ EventData.HTX_Event_by_pk.m_remind_content }}
            </div>
            <div>備註：{{ EventData.HTX_Event_by_pk.m_remark }}</div>
          </q-tab-panel>

          <q-tab-panel name="Venue" class="q-ma-none q-pa-sm text-body1">
            <div>舉行地點：{{ EventData.HTX_Event_by_pk.c_dest }}</div>
            <div>集合地點：{{ EventData.HTX_Event_by_pk.c_start_collect }}</div>
            <div>解散地點：{{ EventData.HTX_Event_by_pk.c_end_collect }}</div>
            <div>
              本身主辦：<q-icon
                v-if="EventData.HTX_Event_by_pk.b_open_own"
                name="check"
              /><q-icon v-else name="cancel" />
            </div>
            <div>
              合辦機構：<q-icon
                v-if="EventData.HTX_Event_by_pk.b_open_oth"
                name="check"
              /><q-icon v-else name="cancel" />
            </div>
            <div>
              顯示網頁：<q-icon
                v-if="EventData.HTX_Event_by_pk.IsShow"
                name="check"
              /><q-icon v-else name="cancel" />
            </div>
          </q-tab-panel>

          <q-tab-panel name="Fee" class="q-ma-none q-pa-sm text-body1">
            <div v-if="EventFee.tbl_act_fee.length">
              <q-list>
                <q-item v-for="item in EventFee.tbl_act_fee">
                  {{ item.c_type }} - {{ item.u_fee }}
                </q-item>
              </q-list>
            </div>
            <div v-else>沒有收費設定</div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
      <q-card-actions>
        <q-btn
          icon="check"
          label="確定"
          class="bg-positive text-white"
          v-close-popup
          @click="copyEvent"
        />
        <q-btn
          icon="cancel"
          label="取消"
          class="bg-negative text-white"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- add event q-card -->
  <q-card bordered flat class="q-pa-none q-ma-none text-h6 fit">
    <q-card-section class="row bg-grey-2 q-px-none q-pt-none q-pb-lg">
      <div class="col-12 bg-grey-4 q-pa-md q-mb-sm">
        基本資料
        <q-btn icon="save" flat @click="saveDialog = true">
          <q-tooltip class="bg-white text-primary">儲存</q-tooltip>
        </q-btn>
        <q-btn icon="replay" flat @click="editObject = {}">
          <q-tooltip class="bg-white text-primary">清除</q-tooltip>
        </q-btn>
        <q-btn icon="upload_file" flat @click="loadDialog = true">
          <q-tooltip class="bg-white text-primary">載入</q-tooltip>
        </q-btn>
      </div>
      <div class="row q-gutter-lg q-ml-sm">
        <span class="col-2 column">
          <div class="col">活動編號:</div>
          <div class="col">{{ props.modelValue }}</div>
        </span>
        <span class="col-9 row">
          <div class="col-12 row">
            <span class="col-3">活動名稱(中文): </span
            ><q-input
              class="col-9 text-h6"
              filled
              type="text"
              v-model="editObject.c_act_name"
            />
          </div>
          <div class="col-12 row q-mt-sm">
            <span class="col-3">活動名稱(英文): </span
            ><q-input
              class="col-9 text-h6"
              filled
              type="text"
              v-model="editObject.c_act_nameen"
            />
          </div>
        </span>
      </div>
    </q-card-section>

    <q-card-section class="row bg-yellow-2 q-px-none q-pt-none q-pb-lg">
      <div class="col-12 bg-yellow-4 q-pa-md q-mb-sm">類別</div>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-3"
          >會計類別：
          <q-select :options="acc_type" v-model="editObject.c_acc_type"
        /></span>
        <span class="col-3"
          >狀況: <q-select :options="status" v-model="editObject.c_status"
        /></span>
        <span class="col-2 column">
          <span class="col"
            >免費: <q-checkbox v-model="editObject.b_freeofcharge"
          /></span>
          <span class="col"
            >完成: <q-checkbox v-model="editObject.b_finish"
          /></span>
        </span>
        <span class="col-3"
          >達標日期:
          <DateComponent v-model="editObject.d_finish_goal" />
        </span>
      </div>

      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-3"
          >類別： <q-select filled :options="type" v-model="editObject.c_type"
        /></span>
        <span class="col-7"
          >性質：
          <q-select filled :options="nature" v-model="editObject.c_nature"
        /></span>
      </div>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-3"
          >大分類：
          <q-select filled :options="group1" v-model="editObject.c_group1"
        /></span>
        <span class="col-7"
          >細類：
          <q-select filled :options="group2" v-model="editObject.c_group2"
        /></span>
      </div>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-3"
          >對象:
          <q-select
            filled
            use-input
            input-debounce="300"
            @filter="saveBuffer"
            @blur="
              textBuffer.length > 0 ? updateBuffer(editObject, 'c_whojoin') : ''
            "
            @new-value="newWhojoin"
            :options="whojoin"
            v-model="editObject.c_whojoin"
        /></span>
        <span class="col-3"
          >負責職員:
          <q-select filled :options="UserList" v-model="editObject.c_respon"
        /></span>
      </div>
    </q-card-section>

    <q-card-section class="row bg-red-1 q-pl-none q-pt-none q-pb-lg">
      <q-chip class="col-12 bg-red-3" size="xl">活動資料</q-chip>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-3"
          >開始日期:
          <DateComponent v-model="editObject.d_date_from" />
        </span>
        <span class="col-3"
          >開始時間:
          <TimeComponent v-model="editObject.d_time_from" />
        </span>
        <span class="col-3"
          >報名日期(開始):
          <DateComponent v-model="editObject.d_sale_start" />
        </span>
      </div>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-3"
          >終結日期:
          <DateComponent v-model="editObject.d_date_to" />
        </span>
        <span class="col-3"
          >終結時間:
          <TimeComponent v-model="editObject.d_time_to" />
        </span>
        <span class="col-3"
          >報名日期(完結):
          <DateComponent v-model="editObject.d_sale_end" />
        </span>
      </div>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-3"
          >名額: <q-input filled type="number" v-model="editObject.i_quota_max"
        /></span>
        <span class="col-3"
          >總堂數: <q-input filled type="number" v-model="editObject.i_lessons"
        /></span>
        <span class="col-3"
          >逢星期:
          <q-select
            filled
            use-input
            nput-debounce="300"
            @filter="saveBuffer"
            @blur="
              textBuffer.length > 0 ? updateBuffer(editObject, 'c_week') : ''
            "
            @new-value="newWeek"
            :options="week"
            v-model="editObject.c_week"
        /></span>
      </div>
    </q-card-section>

    <q-card-section class="row bg-brown-1 q-pl-none q-pt-none q-pb-lg">
      <div class="col-6 row items-start content-start">
        <q-chip class="col-12 row bg-brown-3" size="lg">地點</q-chip>
        <div class="row col-12 q-gutter-lg q-ml-sm items-start">
          <span class="col-11"
            >舉行地點:
            <q-select
              filled
              use-input
              input-debounce="0"
              @filter="saveBuffer"
              @blur="
                textBuffer.length > 0 ? updateBuffer(editObject, 'c_dest') : ''
              "
              @new-value="newDest"
              :options="dest"
              v-model="editObject.c_dest"
          /></span>
          <span class="col-11"
            >集合地點:
            <q-select
              filled
              use-input
              input-debounce="0"
              @filter="saveBuffer"
              @blur="
                textBuffer.length > 0
                  ? updateBuffer(editObject, 'c_start_collect')
                  : ''
              "
              @new-value="newDest"
              :options="dest"
              v-model="editObject.c_start_collect"
          /></span>
          <span class="col-11"
            >解散地點:
            <q-select
              filled
              use-input
              input-debounce="0"
              @filter="saveBuffer"
              @blur="
                textBuffer.length > 0
                  ? updateBuffer(editObject, 'c_end_collect')
                  : ''
              "
              @new-value="newDest"
              :options="dest"
              v-model="editObject.c_end_collect"
          /></span>
        </div>
      </div>
      <div class="col-6 row items-start content-start">
        <q-chip class="col-12 bg-brown-2" size="lg">網頁</q-chip>
        <div class="row col-12 q-gutter-lg q-ml-sm">
          <span class="col-12 row"
            >顯示網頁: <q-checkbox v-model="editObject.IsShow"
          /></span>
          <span class="col-12 row"
            >網頁海報: <span>{{ editObject.poster }}</span>
            <q-btn
              icon="delete"
              class="bg-negative text-white"
              label="刪除現有海報"
              @click="editObject.poster = ''"
            />
            <div class="col-12 row">
              <FileUpload
                class="col-11"
                mode="single"
                path=""
                @onDone="(val) => updateFilenames(val)"
              />
            </div>
          </span>
        </div>
      </div>
    </q-card-section>

    <q-card-section class="row bg-green-1 q-pl-none q-pt-none q-pb-lg">
      <q-chip class="col-12 bg-green-3" size="xl">備註</q-chip>
      <div class="row col-12 q-gutter-lg q-ml-sm">
        <span class="col-11">收據: </span>
        <span class="col-11" style="border: 1px solid"
          ><q-input type="textarea" v-model="editObject.m_remind_content"
        /></span>
      </div>
      <div class="row col-12 q-gutter-lg q-ml-sm q-mt-md">
        <span class="col-11">備註: </span>
        <span class="col-11" style="border: 1px solid"
          ><q-input type="textarea" v-model="editObject.m_remark"
        /></span>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useStore } from "vuex";
import { date as qdate, is, useQuasar } from "quasar";
import DateComponent from "components/Basic/DateComponent.vue";
import TimeComponent from "components/Basic/TimeComponent.vue";
import { usersCollection, FirebaseAuth } from "boot/firebase";
import { ADD_EVENT } from "/src/graphQueries/Event/mutation.js";
import {
  EVENT_SEARCHINFO_BY_PK,
  EVENT_FEE_BY_ACT_CODE,
} from "/src/graphQueries/Event/query.js";
import { useMutation, useQuery } from "@vue/apollo-composable";
import LoadingDialog from "components/LoadingDialog.vue";
import dateUtil from "/src/lib/date.js";
import { getDocs, query, where } from "firebase/firestore";
import EventSelection from "components/Event/EventSelection.vue";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import FileUpload from "src/components/Basic/FileUpload.vue";

const token = ref();
onMounted(async () => {
  token.value = await FirebaseAuth.currentUser.getIdToken();
});

// props
const props = defineProps({
  modelValue: String,
});

// variables
const router = useRouter();
const $q = useQuasar();
const $store = useStore();
const editObject = ref({});
const serverObject = ref({});
const saveDialog = ref(false);
const loadDialog = ref(false);
const loading = ref(0);
const loadEventID = ref("");
const activeTab = ref("EventInfo");
const textBuffer = ref("");
const EventData = ref();
const upload_API =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5001/manage-hr/asia-east2"
    : "https://asia-east2-manage-hr.cloudfunctions.net";
const WEB_IMG_PREFIX =
  process.env.NODE_ENV === "development"
    ? "http://localhost:9199/cciyc-web/"
    : "https://storage.googleapis.com/cciyc-web/";

const acc_type = ref(["PF", "OF", "MF", "SF"]);

const status = ref(["完成達標", "未完成", "取消", "完成不達標"]);

const type = ref(["小組", "活動", "課堂", "偶到", "其他"]);

const nature = ref([
  "核心青年服務A",
  "核心青年服務B",
  "核心青年服務C",
  "核心青年服務D",
  "非核心青年服務",
  "其他服務",
]);

const group1 = ref([
  "社交/興趣",
  "學習/發展",
  "義務工作",
  "青少年就業",
  "家長服務",
  "新來港人士服務",
  "社區服務",
  "中心設施",
]);

const group2 = ref([
  "領袖訓練",
  "青年義務工作",
  "參與地區公民事務",
  "內地交流活動",
]);

const whojoin = ref([
  "2-6歲幼兒",
  "7-11歲兒童",
  "12-14歲青少年",
  "15-24歲青年",
  "義工",
  "童軍",
  "親子",
  "新來港人士",
  "其他人士",
]);

const whojoin_class = ref({
  "2-6歲幼兒": 1,
  "15-24歲青年": 4,
  其他人士: 6,
  義工: 8,
  童軍: 9,
  "12-14歲青少年": 10,
  "7-11歲兒童": 11,
  親子: 12,
  新來港人士: 13,
});

const whojoin_class_reverse = ref({
  1: "2-6歲幼兒",
  4: "15-24歲青年",
  6: "其他人士",
  8: "義工",
  9: "童軍",
  10: "12-14歲青少年",
  11: "7-11歲兒童",
  12: "親子",
  13: "新來港人士",
});

const week = ref([
  "一",
  "二",
  "三",
  "四",
  "五",
  "六",
  "日",
  "一三五",
  "二四六",
]);

const dest = ref([
  "大堂",
  "活動室(一)",
  "活動室(二)",
  "舞蹈室",
  "Band房",
  "電腦室",
  "會議室",
  "中心廣場",
  "星有利球場",
  "南蛇塘體育館",
  "海傍街體育館",
  "長洲碼頭",
  "中環五號碼頭",
]);
// query
const {
  mutate: addEvent,
  onDone: addEvent_Completed,
  onError: addEvent_Error,
} = useMutation(ADD_EVENT);
const { onResult: EventDataRaw } = useQuery(EVENT_SEARCHINFO_BY_PK, () => ({
  c_act_code: loadEventID.value ? loadEventID.value : "",
}));
const { result: EventFee } = useQuery(EVENT_FEE_BY_ACT_CODE, () => ({
  c_act_code: loadEventID.value ? loadEventID.value : "",
}));

const UserList = ref([]);
// computed
const usersQuery = query(
  usersCollection,
  where("privilege.systemAdmin", "==", false),
  where("privilege.tmp", "!=", true),
  where("enable", "==", true)
);

EventDataRaw((data) => {
  if (data.data) {
    EventData.value = data.data;
  }
});

getDocs(usersQuery).then((userDoc) => {
  UserList.value = userDoc.docs.map((a) => a.data().name);
});

const username = computed(() => $store.getters["userModule/getUsername"]);
//const UserList = computed(() => userDoc.docs? userDoc.docs.map(a => a.data().name): [])
const userProfileLogout = () => $store.dispatch("userModule/logout");

//function
function copyEvent() {
  if (Object.keys(EventData.value.HTX_Event_by_pk).length) {
    for (const key of Object.keys(EventData.value.HTX_Event_by_pk)) {
      if (key == "d_time_from" || key == "d_time_to") {
        editObject.value[key] = dateUtil.rConvert(
          EventData.value.HTX_Event_by_pk[key].trim()
        );
        continue;
      }
      if (key != "__typename") {
        editObject.value[key] = EventData.value.HTX_Event_by_pk[key];
      }
    }
  }
}

// update web url
function updateFilenames(filename) {
  editObject.value.poster = WEB_IMG_PREFIX + filename.files[0].name;
}

function saveBuffer(buf, onDone) {
  textBuffer.value = buf;
  onDone(() => {});
}

function updateBuffer(o, key) {
  o[key] = textBuffer.value;
  // console.log("textBuffer: " +  textBuffer.value)
  // console.log("o.value:" + o.value)
  // console.log(editObject.value.c_dest)
  textBuffer.value = "";
}

function save() {
  // clone the object to a new object before purification
  // avoid v-model limit during purification
  Object.assign(serverObject.value, editObject.value);
  purityData();
  const logObject = ref({
    username: username,
    datetime: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    module: "活動系統",
    action:
      "新增活動: " +
      props.modelValue +
      "。新資料:" +
      JSON.stringify(serverObject.value, null, 2),
  });

  loading.value++;
  addEvent({
    logObject: logObject.value,
    object: serverObject.value,
  });
  saveDialog.value = false;
}

function purityData() {
  serverObject.value.c_act_code = props.modelValue.trim();
  serverObject.value.IsShow = serverObject.value.IsShow ? 1 : 0;
  serverObject.value.EventClassID =
    whojoin_class.value[serverObject.value.c_group1];
  serverObject.value.i_quota_max = serverObject.value.i_quota_max
    ? parseInt(serverObject.value.i_quota_max)
    : 0;
  serverObject.value.i_lessons = serverObject.value.i_lessons
    ? parseInt(serverObject.value.i_lessons)
    : 0;
  serverObject.value.EventClassID = serverObject.value.c_whojoin
    ? whojoin_class.value[serverObject.value.c_whojoin]
    : null;
  serverObject.value.b_finish = serverObject.value.b_finish ? true : false;
  serverObject.value.d_date_from = serverObject.value.d_date_from
    ? qdate.formatDate(serverObject.value.d_date_from, "D/M/YYYY")
    : null;
  serverObject.value.d_date_to = serverObject.value.d_date_to
    ? qdate.formatDate(serverObject.value.d_date_to, "D/M/YYYY")
    : null;
  serverObject.value.d_finish_goal = serverObject.value.d_finish_goal
    ? qdate.formatDate(serverObject.value.d_finish_goal, "D/M/YYYY")
    : null;
  serverObject.value.d_sale_start = serverObject.value.d_sale_start
    ? qdate.formatDate(serverObject.value.d_sale_start, "D/M/YYYY")
    : null;
  serverObject.value.d_sale_end = serverObject.value.d_sale_end
    ? qdate.formatDate(serverObject.value.d_sale_end, "D/M/YYYY")
    : null;

  // append seconds
  serverObject.value.d_time_from = serverObject.value.d_time_from
    ? serverObject.value.d_time_from + ":00"
    : null;
  serverObject.value.d_time_to = serverObject.value.d_time_to
    ? serverObject.value.d_time_to + ":00"
    : null;

  // convert to 12H server format
  serverObject.value.d_time_from = serverObject.value.d_time_from
    ? dateUtil.tConvert(serverObject.value.d_time_from)
    : null;
  serverObject.value.d_time_to = serverObject.value.d_time_to
    ? dateUtil.tConvert(serverObject.value.d_time_to)
    : null;
}

// UI functions
function newWeek(val, done) {
  if (val.length > 0) {
    if (!week.value.includes(val)) {
      week.value.push(val);
    }
    done(val, "toggle");
  }
}

function newDest(val, done) {
  if (val.length > 0) {
    if (!dest.value.includes(val)) {
      dest.value.push(val);
    }
    done(val, "toggle");
  }
}

function newWhojoin(val, done) {
  if (val.length > 0) {
    if (!whojoin.value.includes(val)) {
      whojoin.value.push(val);
    }
    done(val, "toggle");
  }
}

// UI functions
function notifyClientSuccess(result) {
  editObject.value = {};
  serverObject.value = {};
  loading.value--;
  $q.notify({
    message: "新增活動" + props.modelValue + "完成。",
  });
}

function notifyClientError(error) {
  $q.notify({ message: "系統錯誤，請重新登入." });
  console.log("error", error);
}

// callback success
addEvent_Completed((result) => {
  notifyClientSuccess(result.data.insert_HTX_Event_one.c_act_code);
});

// callback error
addEvent_Error((error) => {
  notifyClientError(error);
});

onBeforeRouteLeave((to, from, next) => {
  if (Object.keys(editObject.value).length > 0) {
    $q.dialog({
      title: "是否確認關閉？",
      message: "所有未儲存的資料都會遺失！",
      persistent: true,
      cancel: true,
    })
      .onOk(() => {
        next();
      })
      .onCancel(() => {});
  } else {
    next();
  }
});
</script>
