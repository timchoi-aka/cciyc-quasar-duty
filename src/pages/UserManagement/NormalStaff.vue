<template>
  <div>
    <!-- loading dialog -->
    <q-dialog v-model="waitingAsync" position="bottom">
      <LoadingDialog message="儲存中"/>
    </q-dialog>

    <q-table
      flat
      :grid="$q.screen.lt.sm"
      :rows="users"
      :columns="tableFields"
      :hide-bottom="true"
      :pagination="pagination"
      color="primary"
      row-key="uid"
    >
      <!-- grid template -->
      <template v-slot:item="props">
        <div class="q-pa-sm col-xs-12 col-sm-6 col-md-4 flex">
          <q-card class="q-pa-none">
            <q-card-section class="bg-blue-1 q-mb-md row justify-around items-center">
              <div class="col-sm-6 text-body1">{{ props.row.name }}</div>
              <q-space />
              <div class="col-sm-6 q-mx-sm text-body1">
                排序{{ props.row.order }}
                <q-btn
                  :disable="props.row.order == 1"
                  round
                  size="xs"
                  color="positive"
                  icon="keyboard_arrow_up"
                  @click="changeOrder(props.key, 'UP')"
                />
                <q-btn
                  :disable="props.row.order == users.length"
                  round
                  size="xs"
                  color="negative"
                  icon="keyboard_arrow_down"
                  @click="changeOrder(props.key, 'DOWN')"
                />
              </div>
            </q-card-section>
            <q-card-section style="font-size: 1vw" class="row justify-around q-pa-none">
              <div class="col-xs-3 justify-center" style="text-align: center">
                <div class="text-caption">帳戶有效</div>
                <q-btn
                  round
                  :color="props.row.enable ? 'positive' : 'negative'"
                  :label="props.row.enable ? '有' : '沒有'"
                  @click="changeEnable(props.key)"
                />
              </div>
              <div class="col-xs-3 justify-center" style="text-align: center">
                <div class="text-caption">批核假期</div>
                <q-btn
                  round
                  :color="props.row.privilege_leaveApprove ? 'positive' : 'negative'"
                  :label="props.row.privilege_leaveApprove ? '有' : '沒有'"
                  @click="changeLeaveApprove(props.key)"
                />
              </div>
              <div class="col-xs-3 justify-center" style="text-align: center">
                <div class="text-caption">檢視假期</div>
                <q-btn
                  round
                  :color="props.row.privilege_leaveManage ? 'positive' : 'negative'"
                  :label="props.row.privilege_leaveManage ? '有' : '沒有'"
                  @click="changeLeaveManage(props.key)"
                />
              </div>
              <div class="col-xs-3 justify-center" style="text-align: center">
                <div class="text-caption">特別年假</div>
                <q-btn
                  round
                  :color="props.row.privilege_sal ? 'positive' : 'negative'"
                  :label="props.row.privilege_sal ? '有' : '沒有'"
                  @click="changeSal(props.key)"
                />
              </div>
              <div class="col-xs-3 justify-center" style="text-align: center">
                <div class="text-caption">修改更表</div>
                <q-btn
                  round
                  :color="props.row.privilege_scheduleModify ? 'positive' : 'negative'"
                  :label="props.row.privilege_scheduleModify ? '有' : '沒有'"
                  @click="changeScheduleModify(props.key)"
                />
              </div>
              <div class="col-xs-3 justify-center" style="text-align: center">
                <div class="text-caption">用戶管理</div>
                <q-btn
                  round
                  :color="props.row.privilege_userManagement ? 'positive' : 'negative'"
                  :label="props.row.privilege_userManagement ? '有' : '沒有'"
                  @click="changeUserManagement(props.key)"
                />
              </div>
              <div class="col-xs-3 justify-center" style="text-align: center">
                <div class="text-caption">試用</div>
                <q-btn
                  round
                  :color="props.row.privilege_probation ? 'positive' : 'negative'"
                  :label="props.row.privilege_probation ? '有' : '沒有'"
                  @click="changeProbation(props.key)"
                />
              </div>
              <div class="col-xs-3 justify-center" style="text-align: center">
                <div class="text-caption">兼職</div>
                <q-btn
                  round
                  :color="props.row.parttime ? 'positive' : 'negative'"
                  :label="props.row.parttime ? '有' : '沒有'"
                  @click="changeParttime(props.key)"
                />
              </div>
            </q-card-section>
            <q-separator inet class="q-mt-sm" />
            <q-card-section
              style="font-size: 1vw"
              class="row justify-around items-center q-pa-none q-pb-sm"
            >
              <div class="col-xs-8 justify-center q-mx-xs text-body2">
                <div>
                  入職日期：<span
                    v-html="
                      props.row.dateOfEntry
                        ? qdate.formatDate(props.row.dateOfEntry, 'YYYY-MM-DD')
                        : ''
                    "
                  />
                  <q-btn icon="event" round color="primary" class="q-mx-xs">
                    <q-popup-proxy
                      @before-show="proxyDate = props.row.dateOfEntry"
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date v-model="proxyDate">
                        <div class="row items-center justify-end q-gutter-sm">
                          <q-btn label="取消" color="primary" flat v-close-popup />
                          <q-btn
                            label="確定"
                            color="primary"
                            flat
                            @click="changeDateOfEntry(props.row.uid, proxyDate)"
                            v-close-popup
                          />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-btn>
                </div>
                <div>
                  離職日期：<span
                    v-html="
                      props.row.dateOfExit
                        ? qdate.formatDate(props.row.dateOfExit, 'YYYY-MM-DD')
                        : ''
                    "
                  />
                  <q-btn icon="event" round color="primary" class="q-mx-xs">
                    <q-popup-proxy
                      @before-show="proxyDate = props.row.dateOfExit"
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date v-model="proxyDate">
                        <div class="row items-center justify-end q-gutter-sm">
                          <q-btn label="取消" color="primary" flat v-close-popup />
                          <q-btn
                            label="確定"
                            color="primary"
                            flat
                            @click="changeDateOfExit(props.row.uid, proxyDate)"
                            v-close-popup
                          />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-btn>
                </div>
              </div>
              <div class="col-xs-3 justify-center q-mx-xs">
                <q-select
                  :label="rankInputReverseMap[props.row.rank]"
                  hide-bottom-space
                  hint="職級"
                  v-model="props.newRank"
                  :options="rankInputOptions"
                  @update:model-value="
                    (val) => {
                      changeRank(props.key, val);
                    }
                  "
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </template>

      <!-- template of column "enable" -->
      <template v-slot:body-cell-enable="props">
        <q-td :props="props">
          <q-btn
            round
            :color="props.value ? 'positive' : 'negative'"
            :label="props.value ? '有' : '沒有'"
            @click="changeEnable(props.key)"
          />
        </q-td>
      </template>

      <!-- template of column "leaveApprove" -->
      <template v-slot:body-cell-privilege_leaveApprove="props">
        <q-td :props="props">
          <q-btn
            round
            :color="props.value ? 'positive' : 'negative'"
            :label="props.value ? '有' : '沒有'"
            @click="changeLeaveApprove(props.key)"
          />
        </q-td>
      </template>

      <!-- template of column "leaveManage" -->
      <template v-slot:body-cell-privilege_leaveManage="props">
        <q-td :props="props">
          <q-btn
            round
            :color="props.value ? 'positive' : 'negative'"
            :label="props.value ? '有' : '沒有'"
            @click="changeLeaveManage(props.key)"
          />
        </q-td>
      </template>

      <!-- template of column "sal" -->
      <template v-slot:body-cell-privilege_sal="props">
        <q-td :props="props">
          <q-btn
            round
            :color="props.value ? 'positive' : 'negative'"
            :label="props.value ? '有' : '沒有'"
            @click="changeSal(props.key)"
          />
        </q-td>
      </template>

      <!-- template of column "scheduleModify" -->
      <template v-slot:body-cell-privilege_scheduleModify="props">
        <q-td :props="props">
          <q-btn
            round
            :color="props.value ? 'positive' : 'negative'"
            :label="props.value ? '有' : '沒有'"
            @click="changeScheduleModify(props.key)"
          />
        </q-td>
      </template>

      <!-- template of column "userManagement" -->
      <template v-slot:body-cell-privilege_userManagement="props">
        <q-td :props="props">
          <q-btn
            round
            :color="props.value ? 'positive' : 'negative'"
            :label="props.value ? '有' : '沒有'"
            @click="changeUserManagement(props.key)"
          />
        </q-td>
      </template>

      <!-- template of column "probation" -->
      <template v-slot:body-cell-privilege_probation="props">
        <q-td :props="props">
          <q-btn
            round
            :color="props.value ? 'positive' : 'negative'"
            :label="props.value ? '有' : '沒有'"
            @click="changeProbation(props.key)"
          />
        </q-td>
      </template>

      <!-- template of column "parttime" -->
      <template v-slot:body-cell-parttime="props">
        <q-td :props="props">
          <q-btn
            round
            :color="props.value ? 'positive' : 'negative'"
            :label="props.value ? '有' : '沒有'"
            @click="changeParttime(props.key)"
          />
        </q-td>
      </template>

      <!-- template of column "rank" -->
      <template v-slot:body-cell-rank="props">
        <q-td :props="props">
          <q-select
            :label="rankInputReverseMap[props.row.rank]"
            hide-bottom-space
            v-model="props.newRank"
            :options="rankInputOptions"
            @update:model-value="
              (val) => {
                changeRank(props.key, val);
              }
            "
          />
        </q-td>
      </template>

      <!-- template of column "dateOfEntry" -->
      <template v-slot:body-cell-dateOfEntry="props">
        <q-td :props="props">
          <span
            v-html="
              props.row.dateOfEntry
                ? qdate.formatDate(props.row.dateOfEntry, 'YYYY-MM-DD')
                : ''
            "
          />
          <q-btn icon="event" round color="primary" class="q-mx-xs">
            <q-popup-proxy
              @before-show="proxyDate = props.row.dateOfEntry"
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date v-model="proxyDate">
                <div class="row items-center justify-end q-gutter-sm">
                  <q-btn label="取消" color="primary" flat v-close-popup />
                  <q-btn
                    label="確定"
                    color="primary"
                    flat
                    @click="changeDateOfEntry(props.row.uid, proxyDate)"
                    v-close-popup
                  />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-btn>
        </q-td>
      </template>

      <!-- template of column "dateOfExit" -->
      <template v-slot:body-cell-dateOfExit="props">
        <q-td :props="props">
          <span
            v-html="
              props.row.dateOfExit
                ? qdate.formatDate(props.row.dateOfExit, 'YYYY-MM-DD')
                : ''
            "
          />
          <q-btn icon="event" round color="primary" class="q-mx-xs">
            <q-popup-proxy
              @before-show="proxyDate = props.row.dateOfExit"
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date v-model="proxyDate">
                <div class="row items-center justify-end q-gutter-sm">
                  <q-btn label="取消" color="primary" flat v-close-popup />
                  <q-btn
                    label="確定"
                    color="primary"
                    flat
                    @click="changeDateOfExit(props.row.uid, proxyDate)"
                    v-close-popup
                  />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-btn>
        </q-td>
      </template>

      <!-- template of column "order" -->
      <template v-slot:body-cell-order="props">
        <q-td :props="props" class="content-center">
          <div class="q-mx-sm">
            {{ props.value }}
            <q-btn
              :disable="props.value == 1"
              round
              size="xs"
              color="positive"
              icon="keyboard_arrow_up"
              @click="changeOrder(props.key, 'UP')"
            />
            <q-btn
              :disable="props.value == users.length"
              round
              size="xs"
              color="negative"
              icon="keyboard_arrow_down"
              @click="changeOrder(props.key, 'DOWN')"
            />
          </div>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { usersCollection, FirebaseFunctions } from "boot/firebase";
import { date as qdate } from "quasar";
import LoadingDialog from "components/LoadingDialog.vue"
import { httpsCallable } from "@firebase/functions";
import { ref, computed } from "vue"
import { query, where, getDocs } from "firebase/firestore"

// variables
const awaitServerResponse = ref(0)
const proxyDate = ref("")
const users = ref([])

const rankInputOptions = ref(["ASWO", "SWA", "WW", "OA", "CA", "PA", "GA", "TMP"])

const rankInputMap = ref({
  ASWO: "aswo",
  SWA: "swa",
  WW: "ww",
  OA: "oa",
  CA: "ca",
  PA: "pa",
  GA: "ga",
  TMP: "tmp",
})

const rankInputReverseMap = ref({
  aswo: "ASWO",
  swa: "SWA",
  ww: "WW",
  oa: "OA",
  ca: "CA",
  pa: "PA",
  ga: "GA",
  tmp: "TMP",
})

// table config
const pagination = ref({
  sortBy: "order",
  rowsPerPage: 0,
})

const tableFields = ref([
  {
    name: "name",
    label: "姓名",
    field: "name",
    headerStyle:
      "font-size: 1.5vw; text-align: center; width: 3vw;  max-width: 3vw;",
    style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
  },
  {
    name: "enable",
    label: "帳戶有效",
    field: "enable",
    headerStyle:
      "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 3vw;",
    style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
  },
  {
    name: "privilege_leaveApprove",
    label: "批核假期",
    field: "privilege_leaveApprove",
    headerStyle:
      "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 3vw;",
    style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
  },
  {
    name: "privilege_leaveManage",
    label: "檢視假期",
    field: "privilege_leaveManage",
    headerStyle:
      "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 3vw;",
    style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
  },
  {
    name: "privilege_sal",
    label: "特別年假",
    field: "privilege_sal",
    headerStyle:
      "font-size: 1.5vw; text-align: center;  width: 3vw; max-width: 3vw;",
    style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
  },
  {
    name: "privilege_scheduleModify",
    label: "修改更表",
    field: "privilege_scheduleModify",
    headerStyle:
      "font-size: 1.5vw; text-align: center;  width: 3vw; max-width: 3vw;",
    style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
  },
  {
    name: "privilege_userManagement",
    label: "用戶管理",
    field: "privilege_userManagement",
    headerStyle:
      "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 3vw;",
    style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
  },
  {
    name: "privilege_probation",
    label: "試用",
    field: "privilege_probation",
    headerStyle:
      "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 3vw;",
    style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
  },
  {
    name: "parttime",
    label: "兼職",
    field: "parttime",
    headerStyle:
      "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 3vw;",
    style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
  },
  {
    name: "order",
    label: "排序",
    field: "order",
    sortOrder: "ad",
    sort: (a, b, rowA, rowB) => parseInt(a, 10) - parseInt(b, 10),
    sortable: true,
    headerStyle:
      "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 5vw;",
    style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 5vw;",
  },
  {
    name: "dateOfEntry",
    label: "入職日期",
    field: "dateOfEntry",
    format: (value) => (value ? qdate.formatDate(value, "YYYY年M月D日") : ""),
    headerStyle:
      "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 5vw;",
    style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 5vw;",
  },
  {
    name: "dateOfExit",
    label: "離職日期",
    field: "dateOfExit",
    format: (value) => (value ? qdate.formatDate(value, "YYYY年M月D日") : ""),
    headerStyle:
      "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 5vw;",
    style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 5vw;",
  },
  {
    name: "rank",
    label: "職級",
    field: "rank",
    headerStyle:
      "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 5vw;",
    style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 5vw;",
  },
])

// computed
const waitingAsync = computed(() => awaitServerResponse.value > 0)

// function
function changeDateOfExit(uid, date) {
  const changeDateOfExit = httpsCallable(FirebaseFunctions, "user-changeDateOfExit");
  awaitServerResponse.value++;
  changeDateOfExit({ uid: uid, dateOfExit: new Date(date) }).then((result) => {
    users.value[
      users.value.findIndex((value) => value.uid == result.data.uid)
    ].dateOfExit = result.data.dateOfExit;
    awaitServerResponse.value--;
  });
}

function changeDateOfEntry(uid, date) {
  const changeDateOfEntry = httpsCallable(FirebaseFunctions, "user-changeDateOfEntry");
  awaitServerResponse.value++;
  changeDateOfEntry({ uid: uid, dateOfEntry: new Date(date) }).then((result) => {
    users.value[
      users.value.findIndex((value) => value.uid == result.data.uid)
    ].dateOfEntry = result.data.dateOfEntry;
    awaitServerResponse.value--;
  });
}
    
function changeRank(uid, rank) {
  const changeRank = httpsCallable(FirebaseFunctions, "user-changeRank");
  awaitServerResponse.value++;
  changeRank({ uid: uid, rank: rankInputMap.value[rank] }).then((result) => {
    users.value[users.value.findIndex((value) => value.uid == result.data.uid)].rank =
      result.data.rank;
    awaitServerResponse.value--;
  });
}

function changeOrder(uid, dir) {
  // call https functions to change leaveApprove privilege
  const changeOrder = httpsCallable(FirebaseFunctions, "user-changeOrder");
  awaitServerResponse.value++;
  changeOrder({ uid: uid, dir: dir }).then((result) => {
    if (result.data.uid1) {
      users.value[users.value.findIndex((value) => value.uid == result.data.uid1)].order =
        result.data.order1;
    }

    if (result.data.uid2) {
      users.value[users.value.findIndex((value) => value.uid == result.data.uid2)].order =
        result.data.order2;
    }
    awaitServerResponse.value--;
  });
}
    
function changeEnable(uid) {
  // call https functions to change leaveApprove privilege
  const toggleEnable = httpsCallable(FirebaseFunctions, "user-toggleEnable");
  awaitServerResponse.value++;
  toggleEnable(uid).then((result) => {
    users.value[users.value.findIndex((value) => value.uid == uid)].enable =
      result.data;
    awaitServerResponse.value--;
  });
}
    
function changeLeaveApprove(uid) {
  // call https functions to change leaveApprove privilege
  const toggleLeaveApprove = httpsCallable(FirebaseFunctions, 
    "user-toggleLeaveApprove"
  );
  awaitServerResponse.value++;
  toggleLeaveApprove(uid).then((result) => {
    users.value[
      users.value.findIndex((value) => value.uid == uid)
    ].privilege_leaveApprove = result.data;
    awaitServerResponse.value--;
  });
}

function changeLeaveManage(uid) {
  // call https functions to change leaveApprove privilege
  const toggleLeaveManage = httpsCallable(FirebaseFunctions, "user-toggleLeaveManage");
  awaitServerResponse.value++;
  toggleLeaveManage(uid).then((result) => {
    users.value[
      users.value.findIndex((value) => value.uid == uid)
    ].privilege_leaveManage = result.data;
    awaitServerResponse.value--;
  });
}
 
function changeUserManagement(uid) {
  // call https functions to change leaveApprove privilege
  const toggleUserManagement = httpsCallable(FirebaseFunctions,
    "user-toggleUserManagement"
  );
  awaitServerResponse.value++;
  toggleUserManagement(uid).then((result) => {
    users.value[
      users.value.findIndex((value) => value.uid == uid)
    ].privilege_userManagement = result.data;
    awaitServerResponse.value--;
  });
}

function changeProbation(uid) {
  // call https functions to change leaveApprove privilege
  const toggleProbation = httpsCallable(FirebaseFunctions,
    "user-toggleProbation"
  );
  awaitServerResponse.value++;
  toggleProbation(uid).then((result) => {
    users.value[
      users.value.findIndex((value) => value.uid == uid)
    ].privilege_probation = result.data;
    awaitServerResponse.value--;
  });
}

function changeParttime(uid) {
  // call https functions to change leaveApprove privilege
  const toggleParttime = httpsCallable(FirebaseFunctions,
    "user-toggleParttime"
  );
  awaitServerResponse.value++;
  toggleParttime(uid).then((result) => {
    users.value[
      users.value.findIndex((value) => value.uid == uid)
    ].parttime = result.data;
    awaitServerResponse.value--;
  });
}

function changeSal(uid) {
  // call https functions to change sal privilege
  const toggleSal = httpsCallable(FirebaseFunctions, "user-toggleSal");
  awaitServerResponse.value++;
  toggleSal(uid).then((result) => {
    users.value[users.value.findIndex((value) => value.uid == uid)].privilege_sal =
      result.data;
    awaitServerResponse.value--;
  });
}

function changeScheduleModify(uid) {
  // call https functions to change scheduleModify privilege
  const toggleScheduleModify = httpsCallable(FirebaseFunctions, 
    "user-toggleScheduleModify"
  );
  awaitServerResponse.value++;
  toggleScheduleModify(uid).then((result) => {
    users.value[
      users.value.findIndex((value) => value.uid == uid)
    ].privilege_scheduleModify = result.data;
    awaitServerResponse.value--;
  });
}

// module logic
const userQuery = query(usersCollection, 
  where("privilege.systemAdmin", "==", false),
  where("privilege.tmp", "!=", true)
)

getDocs(userQuery).then((userDoc) => {
  userDoc.forEach((user) => {
    let d = user.data();
    if (d.dateOfEntry != undefined) {
      d.dateOfEntry = new Date(d.dateOfEntry.toDate());
    } else {
      d.dateOfEntry = new Date();
    }

    if (d.dateOfExit != undefined) {
      d.dateOfExit = new Date(d.dateOfExit.toDate());
    } else {
      d.dateOfExit = "";
    }

    users.value.push({
      name: d.name,
      enable: "enable" in d ? d.enable : true,
      uid: d.uid,
      privilege_leaveApprove: d.privilege.leaveApprove,
      privilege_leaveManage: d.privilege.leaveManage,
      privilege_sal: d.privilege.sal,
      privilege_scheduleModify: d.privilege.scheduleModify,
      privilege_userManagement: d.privilege.userManagement,
      privilege_probation: d.privilege.probation? d.privilege.probation: false,
      parttime: d.parttime? d.parttime: false,
      order: d.order,
      dateOfEntry: d.dateOfEntry,
      dateOfExit: d.dateOfExit,
      rank: d.rank,
    });
  });
})
</script>

<style scoped></style>
