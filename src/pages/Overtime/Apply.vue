<template>
  <div class="full-width">
    <!-- sticky button at bottom -->
    <q-page-sticky
      position="bottom-right"
      :offset="[20, 20]"
      style="z-index: 1"
    >
      <q-fab
        :disable="!isAllValidDate()"
        v-if="applicationList.length > 0"
        label="確定申請"
        color="primary"
        push
        @click="confirmDialog = !confirmDialog"
      />
    </q-page-sticky>

    <!-- loading dialog -->
    <q-dialog v-model="waitingAsync" position="bottom">
      <LoadingDialog message="讀取資料中" />
    </q-dialog>

    <!-- confirm dialog -->
    <q-dialog v-model="confirmDialog">
      <q-card style="border-radius: 30px">
        <q-card-section>
          <div
            class="text-h5 text-center"
            style="border-bottom: 3px solid blue"
          >
            確定申請超時補假？
          </div>
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div v-for="app in applicationList">
            {{ app.date }} - {{ app.type }} - {{ app.hours }}小時 -
            {{ app.remarks }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn v-close-popup flat color="primary" label="取消" />
          <q-btn
            v-close-popup
            @click="confirmOTApplication"
            flat
            color="primary"
            label="確認申請"
            round
            icon="event"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Application Table -->
    <div class="full-width">
      <div class="row">
        <div class="q-mr-sm col-1 col-xs-5 col-md-3 col-lg-3 col-sm-3 text-h6">
          超時結餘
          <q-knob
            :min="0"
            :max="40"
            readonly
            :model-value="ot_balance"
            show-value
            :thickness="0.22"
            color="primary"
            track-color="grey-3"
          />
        </div>
        <div class="col-1 col-xs-3 col-md-2 col-lg-1 col-sm-3">
          <q-btn
            label="新增"
            color="primary"
            text-color="white"
            square
            @click="
              applicationList.push({
                date: qdate.formatDate(new Date(), 'YYYY/MM/DD'),
                type: 'OT',
                hours: '0',
                remarks: '',
              })
            "
          />
        </div>
      </div>
      
      <!-- header row -->
      <q-table
        dense
        flat
        :grid="$q.screen.lt.md"
        :rows="applicationList"
        :columns="columns"
        :pagination="defaultPagination"
        :hide-bottom="true"
        color="primary"
        row-key="date"
      >

        <!-- date cell template -->
        <template v-slot:body-cell-date="props">
          <q-td class="q-pa-sm" style="font-size: 1.5vw; text-align: center"
            ><q-input
              v-model="applicationList[props.rowIndex].date"
              borderless
              filled
              debounce="500"
              error-message="這日期已有超時補假記錄！"
              :error="!isValidDate(applicationList.indexOf(props.row))"
            >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="applicationList[props.rowIndex].date"
                  >
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="關閉" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
            </q-input>
          </q-td>
        </template>

        <!-- type cell template -->
        <template v-slot:body-cell-type="props">
          <q-td class="q-pa-sm" style="font-size: 1.5vw; text-align: center"
            ><q-btn-toggle
              size="md"
              class="bg-light-blue-2"
              v-model="applicationList[applicationList.indexOf(props.row)].type"
              push
              toggle-color="primary"
              :options="[
                { label: 'OT', value: 'OT' },
                { label: '補OT', value: '補OT' },
              ]"
            />
          </q-td>
        </template>

        <!-- hours cell template -->
        <template v-slot:body-cell-hours="props">
          <q-td class="q-pa-sm" style="font-size: 1.5vw; text-align: center">
            <q-input
              :rules="[
                (val) => val >= 0 || '數值要大於0',
                (val) =>
                  (props.row.type == '補OT' ? val <= ot_balance : true) ||
                  '沒有足夠OT時數',
              ]"
              type="number"
              step="0.5"
              v-model="
                applicationList[applicationList.indexOf(props.row)].hours
              "
            ></q-input>
          </q-td>
        </template>

        <!-- remarks cell template -->
        <template v-slot:body-cell-remarks="props">
          <q-td class="q-pa-sm" style="font-size: 1.5vw; text-align: center">
            <q-input
              type="text"
              v-model="
                applicationList[applicationList.indexOf(props.row)].remarks
              "
            ></q-input>
          </q-td>
        </template>

        <!-- action cell template -->
        <template v-slot:body-cell-actions="props">
          <q-td class="q-pa-sm" style="font-size: 1.5vw; text-align: center">
            <q-btn
              color="red"
              label="刪除"
              @click="
                applicationList.splice(applicationList.indexOf(props.row), 1)
              "
            ></q-btn>
          </q-td>
        </template>

        <!-- grid template -->
        <template v-slot:item="props">
          <q-card class="q-pa-xs q-mb-xs col-xs-12 col-sm-12 col-md-12">
            <q-card-section
              ><q-btn
                color="red"
                class="absolute-top-right"
                icon="cancel"
                @click="
                  applicationList.splice(applicationList.indexOf(props.row), 1)
                "
              ></q-btn>
            </q-card-section>
            <q-card-section>
              <div class="row items-center">
                <div class="col-xs-2 col-sm-2 col-md-2 text-h6">日期:</div>
                <div class="col-xs-10 col-sm-4 col-md-4">
                  <q-input
                    v-model="applicationList[props.rowIndex].date"
                    borderless
                    filled
                    debounce="500"
                    error-message="這日期已有超時補假記錄！"
                    :error="!isValidDate(applicationList.indexOf(props.row))"
                  >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy
                        cover
                        transition-show="scale"
                        transition-hide="scale"
                      >
                        <q-date v-model="applicationList[props.rowIndex].date"
                        >
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="關閉" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  </q-input>
                </div>

                <div class="col-xs-2 col-sm-2 col-md-2 text-h6">種類:</div>
                <div class="col-xs-5 col-sm-3 col-md-3">
                  <q-btn-toggle
                    size="md"
                    class="bg-light-blue-2"
                    v-model="
                      applicationList[applicationList.indexOf(props.row)].type
                    "
                    push
                    toggle-color="primary"
                    :options="[
                      { label: 'OT', value: 'OT' },
                      { label: '補OT', value: '補OT' },
                    ]"
                  />
                </div>
                <div class="col-xs-2 col-sm-2 col-md-2 text-h6">時數:</div>
                <div class="col-xs-3 col-sm-2 col-md-2">
                  <q-input
                    :rules="[
                      (val) => val >= 0 || '數值要大於0',
                      (val) =>
                        (props.row.type == '補OT' ? val <= ot_balance : true) ||
                        '沒有足夠OT時數',
                    ]"
                    type="number"
                    step="0.5"
                    v-model="
                      applicationList[applicationList.indexOf(props.row)].hours
                    "
                  ></q-input>
                </div>
              </div>

              <div class="row">
                <div class="col-xs-2 col-sm-2 col-md-2 text-h6">備註:</div>
                <div class="col-xs-10 col-sm-5 col-md-5">
                  <q-input
                    type="text"
                    v-model="
                      applicationList[applicationList.indexOf(props.row)]
                        .remarks
                    "
                  ></q-input>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script setup>
import { FirebaseFunctions, OTCollection } from "boot/firebase";
import LoadingDialog from "components/LoadingDialog.vue"
import { useStore } from "vuex";
import { ref, computed, onMounted } from "vue";
import { date as qdate, useQuasar } from "quasar";
import { httpsCallable } from "@firebase/functions";
import { getDocs, query, where } from "@firebase/firestore";

onMounted(() => {
  fetchAllOTRecords()
})

// variables
const $store = useStore()
const $q = useQuasar()
const confirmDialog = ref(false)
const OTHistory = ref([])
const applicationList = ref([])
const awaitServerResponse = ref(0)
const leaveMap = ref({
  OT: "OT",
  CL: "補OT",
})
const leaveInverseMap = ref({
  OT: "OT",
  補OT: "CL",
})

// table config
const defaultPagination = ref({
  rowsPerPage: 10,
})

const columns = ref([
  {
    name: "date",
    label: "日期",
    field: "date",
    style: "font-size: 1.5vw; text-align: center",
    headerStyle: "font-size: 1.5vw; text-align: center; width: 13vw;",
    headerClasses: "bg-grey-2 nameColumn",
  },
  {
    name: "type",
    label: "種類",
    field: "type",
    style: "font-size: 1.5vw; text-align: center",
    headerStyle: "font-size: 1.5vw; text-align: center; width: 10vw;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "hours",
    label: "時數",
    field: "hours",
    style: "font-size: 1.5vw; text-align: center",
    headerStyle: "font-size: 1.5vw; text-align: center; width: 10vw;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "remarks",
    label: "備註",
    field: "remarks",
    style: "font-size: 1.5vw; text-align: center",
    headerStyle:
      "font-size: 1.5vw; text-align: center; width: 40vw; min-width: 40vw;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "actions",
    label: "動作",
    field: "actions",
    style: "font-size: 1.5vw; text-align: center",
    headerStyle: "font-size: 1.5vw; text-align: center; width: 10vw;",
    headerClasses: "bg-grey-2",
  },
])

// computed
const userProfileLogout = () => $store.dispatch("userModule/logout")
const isLogin = computed(() => $store.getters["userModule/isLogin"])
const waitingAsync = computed(() => awaitServerResponse.value > 0)
const uid = computed(() => $store.getters["userModule/getUID"])
const username = computed(() => $store.getters["userModule/getUsername"])
const ot_balance = computed(() => $store.getters["userModule/getOTBalance"]? $store.getters["userModule/getOTBalance"]: 0)

// logout if timeout
if (!isLogin.value) {
  userProfileLogout().then(() => {
    $q.notify({ message: "系統超時，請重新登入。" });
  })
  .catch((error) => console.log("error", error));
}

// function
function isValidDate(index) {
  let result = true;
  if (OTHistory.value.includes(applicationList.value[index].date)) result = false;
  for (let i = 0; i < applicationList.value.length; i++) {
    if (index == i) continue;
    if (applicationList.value[index].date == applicationList.value[i].date)
      result = false;
  }
  return result;
}

function isAllValidDate() {
  let result = true;
  for (let i = 0; i < applicationList.value.length; i++) {
    if (OTHistory.value.includes(applicationList.value[i].date)) result = false;
    if (applicationList.value[i].hours <= 0) result = false;
    for (let j = 0; j < applicationList.value.length; j++) {
      // prevents the element from comparing with itself
      if (i !== j) {
        // check if elements' values are equal
        if (applicationList.value[i].date === applicationList.value[j].date) {
          // duplicate element present
          result = false;
          // terminate inner loop
          break;
        }
      }
    }
  }
  let tempApplicationList = JSON.parse(JSON.stringify(applicationList.value));
  for (let i = 0; i < tempApplicationList.length; i++) {
    if (tempApplicationList[i].type == "補OT")
      tempApplicationList[i].hours = -tempApplicationList[i].hours;
  }

  if (
    ot_balance.value +
      tempApplicationList.reduce((a, b) => parseFloat(a) + parseFloat(b.hours), 0) <
    0
  )
    result = false;
  return result;
}
    
function confirmOTApplication() {
  // feed applicationList to a formal leaveData structure
  let leaveData = [];

  applicationList.value.forEach((leave) => {
    leaveData.push({
      date: new Date(leave.date),
      type: leaveInverseMap.value[leave.type],
      hours:
        leaveInverseMap.value[leave.type] == "CL"
          ? -parseFloat(leave.hours)
          : parseFloat(leave.hours),
      remarks: [leave.remarks],
      uid: uid.value,
      name: username.value,
      validity: true,
      status: "未批",
    });
  });

  // call https functions to add leaves
  const addOT = httpsCallable(FirebaseFunctions, "ot-addLeaveByDocid");
  awaitServerResponse.value++;
  addOT(leaveData)
    .then(() => {
      awaitServerResponse.value--;
      applicationList.value = [];
      fetchAllOTRecords();
    })
    .catch((error) => {
      console.log(error.message);
    });
}
    
function fetchAllOTRecords() {
  OTHistory.value = [];
  const OTQuery = query(OTCollection,
    where("uid", "==", uid.value),
    where("status", "!=", "拒絕")
  )

  getDocs(OTQuery).then((OTRecords) => {
    OTRecords.forEach((doc) => {
      OTHistory.value.push(qdate.formatDate(doc.data().date, "YYYY/MM/DD"));
    });
  })
}
</script>

<style lang="scss" scoped>
.gridCard {
  font-size: 4vw;
}
</style>
