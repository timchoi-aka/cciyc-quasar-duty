<template>
  <div class="q-pa-sm">
    <!-- loading dialog -->
    <q-dialog v-model="waitingAsync" position="bottom">
      <LoadingDialog message="儲存中"/>
    </q-dialog>

    <!-- add user dialog -->
    <q-dialog v-model="addDialog">
      <q-card bordered>
        <q-card-section>
          <div class="text-h5 bg-blue-3 text-center">新增臨時員工</div>
        </q-card-section>
        <q-card-section class="q-mt-sm">
          <q-input type="text" hint="姓名" v-model="newStaff.name"></q-input>
          <q-input v-model="newStaff.dateOfEntry" type="date" hint="入職日期" />
        </q-card-section>
        <q-card-actions align="center">
          <q-btn
            square
            flat
            v-close-popup
            color="primary"
            icon="add"
            label="新增"
            @click="addTempStaff"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- delete user dialog -->
    <q-dialog v-model="deleteDialog">
      <q-card bordered>
        <q-card-section>
          <div class="text-h5 bg-blue-3 text-center">刪除臨時員工</div>
        </q-card-section>
        <q-card-section class="q-mt-sm">
          <div class="text-h6" v-for="row in selectedRow" :key="row.uid">
            {{ row.name }}
          </div>
        </q-card-section>
        <q-card-section>
          <div class="text-h6 text-red">注意：員工的所有編更記錄也會一併刪除！</div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn
            square
            flat
            v-close-popup
            color="red"
            icon="cancel"
            label="確認刪除"
            @click="deleteTempStaff"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- add / remove buttons -->
    <div class="row">
      <q-btn
        :disable="selectedRow.length > 0"
        class="col-1 col-xs-4 col-sm-4 col-md-4"
        square
        text-color="white"
        color="primary"
        icon="add"
        label="新增"
        @click="addDialog = true"
      />

      <q-btn
        :disable="selectedRow.length == 0"
        class="col-1 offset-1 col-xs-4 col-sm-4 col-md-4"
        square
        text-color="white"
        color="red"
        icon="cancel"
        label="刪除"
        v-if="!$q.screen.lt.sm"
        @click="deleteDialog = true"
      />
    </div>
    <q-table
      flat
      selection="multiple"
      :grid="$q.screen.lt.sm"
      v-model:selected="selectedRow"
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
              <div class="col-sm-5 text-body1">{{ props.row.name }}</div>
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
            <q-card-section
              class="row justify-around items-center q-mb-sm q-pa-none"
            >
              <div class="row justify-center q-mx-xs">
                <div class="text-body1 q-mx-md items-end">帳戶有效</div>
                <q-btn
                  dense
                  :color="props.row.enable ? 'positive' : 'negative'"
                  :label="props.row.enable ? '有' : '沒有'"
                  @click="changeEnable(props.key)"
                />
              </div>
              <div class="row justify-center q-mx-xs text-body1">
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
            </q-card-section>
          </q-card>
        </div>
      </template>

      <template v-slot:header-selection="scope">
        <q-checkbox v-model="scope.selected" />
      </template>

      <template v-slot:body-selection="scope">
        <q-checkbox v-model="scope.selected" />
      </template>

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

      <template v-slot:body-cell-order="props">
        <q-td :props="props" class="content-center">
          <div class="q-mx-sm">
            {{ props.value }}
            <q-btn
              :disable="props.value == 100"
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
    </q-table>
  </div>
</template>

<script setup>
import { usersCollection, FirebaseFunctions } from "boot/firebase";
import { date as qdate } from "quasar";
import LoadingDialog from "components/LoadingDialog.vue"
import { ref, computed, onMounted } from "vue"
import { httpsCallable } from "@firebase/functions";
import { getDocs, query, where } from "@firebase/firestore";

const selectedRow = ref([])
const addDialog = ref(false)
const deleteDialog = ref(false)
const awaitServerResponse = ref(0)
const newStaff = ref({
        name: "",
        dateOfEntry: new Date(),
        email: "n/a",
        uid: "",
        order: 0,
        enable: true,
        parttime: false,
        privilege: {
          scheduleModify: false,
          leaveManage: false,
          leaveApprove: false,
          logViewer: false,
          systemAdmin: false,
          sal: false,
          userManagement: false,
          tmp: true,
        }})
const balance = ref({
  al: 0,
  sal: 0,
  ot: 0,
})
const rank = ref("tmp")
const defaultSchedule = ref([
  "",
  "",
  "",
  "",
  "1",
  "2",
  "",
  "3",
  "4",
  "",
  "5",
  "6",
  "",
  "7",
  "8",
  "",
  "9",
  "10",
  "11",
  "",
  "",
])

const users = ref([])
const pagination = ref({
  sortBy: "order",
  rowsPerPage: 0,
})

const tableFields = ref([
  {
    name: "name",
    label: "姓名",
    field: "name",
    headerStyle: "font-size: 1.5vw; text-align: center;",
    style: "font-size: 1.2vw; text-align: center;",
  },
  {
    name: "enable",
    label: "帳戶有效",
    field: "enable",
    headerStyle: "font-size: 1.5vw; text-align: center;",
    style: "font-size: 1.2vw; text-align: center;",
  },
  {
    name: "order",
    label: "排序",
    field: "order",
    sortOrder: "ad",
    sort: (a, b, rowA, rowB) => parseInt(a, 10) - parseInt(b, 10),
    sortable: true,
    headerStyle: "font-size: 1.5vw; text-align: center;",
    style: "font-size: 1.2vw; text-align: center;",
  },
  {
    name: "dateOfEntry",
    label: "入職日期",
    field: "dateOfEntry",
    format: (value) => (value ? qdate.formatDate(value, "YYYY年M月D日") : ""),
    headerStyle: "font-size: 1.5vw; text-align: center;",
    style: "font-size: 1.2vw; text-align: center;",
  },
  {
    name: "dateOfExit",
    label: "離職日期",
    field: "dateOfExit",
    format: (value) => (value ? qdate.formatDate(value, "YYYY年M月D日") : ""),
    headerStyle: "font-size: 1.5vw; text-align: center;",
    style: "font-size: 1.2vw; text-align: center;",
  },
])

// computed
const waitingAsync = computed(() => awaitServerResponse.value > 0)

// function
function changeDateOfEntry(uid, date) {
  const changeDateOfEntry = httpsCallable(FirebaseFunctions, "user-changeDateOfEntry");
  changeDateOfEntry({ uid: uid, dateOfEntry: new Date(date) }).then((result) => {
    users.value[
      users.value.findIndex((value) => value.uid == result.data.uid)
    ].dateOfExit = result.data.dateOfEntry;
  });
}

function changeDateOfExit(uid, date) {
  const changeDateOfExit = httpsCallable(FirebaseFunctions, "user-changeDateOfExit");
  changeDateOfExit({ uid: uid, dateOfExit: new Date(date) }).then((result) => {
    users.value[
      users.value.findIndex((value) => value.uid == result.data.uid)
    ].dateOfExit = result.data.dateOfExit;
  });
}

function initializeNewStaffObject() {
  newStaff.value = ref({
    name: "",
    dateOfEntry: new Date(),
    email: "n/a",
    uid: "",
    order: 0,
    enable: true,
    parttime: false,
    privilege: {
      scheduleModify: false,
      leaveManage: false,
      leaveApprove: false,
      logViewer: false,
      systemAdmin: false,
      sal: false,
      userManagement: false,
      tmp: true,
    }
  })

  balance.value = ref({
    al: 0,
    sal: 0,
    ot: 0,
  })

  rank.value = ref("tmp")
  const defaultSchedule = ref([
    "",
    "",
    "",
    "",
    "1",
    "2",
    "",
    "3",
    "4",
    "",
    "5",
    "6",
    "",
    "7",
    "8",
    "",
    "9",
    "10",
    "11",
    "",
    "",
  ])
}
    
function deleteTempStaff() {
  const delTmp = httpsCallable(FirebaseFunctions, "user-delTempStaff");
  awaitServerResponse.value++;
  delTmp(selectedRow.value)
    .then((result) => {
      awaitServerResponse.value--;
      selectedRow.value = [];
      updateTempUserTable();
    })
    .catch((err) => {
      console.err(JSON.stringify(err));
    });
}
    
function addTempStaff() {
  const addTmp = httpsCallable(FirebaseFunctions, "user-addTempStaff");
  awaitServerResponse.value++;
  addTmp(newStaff.value)
    .then((result) => {
      awaitServerResponse.value--;
      initializeNewStaffObject();
      updateTempUserTable();
    })
    .catch((err) => {
      console.err(JSON.stringify(err));
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
  toggleEnable(uid).then((result) => {
    users.value[users.value.findIndex((value) => value.uid == uid)].enable =
      result.data;
  });
}
    
function updateTempUserTable() {
  users.value = [];
  // get tmp users

  const userQuery = query(usersCollection,
    where("privilege.systemAdmin", "==", false),
    where("privilege.tmp", "==", true)
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
        order: d.order,
        dateOfEntry: d.dateOfEntry,
        dateOfExit: d.dateOfExit,
      });
    });
  })
}

onMounted(() => {
  updateTempUserTable()
})
</script>


