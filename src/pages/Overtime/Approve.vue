<template>
  <q-page class="full-width q-pa-sm">
    <!-- duty calendar dialog -->
    <q-dialog v-model="showDutyCalendar" full-width>
      <q-card class="full-width q-pa-sm" style="height: 70vh; max-height: 70vh">
        <q-card-section class="no-wrap row">
          <q-btn outline color="primary" @click="changeRenderDate(-7)">上周</q-btn>
          <q-btn outline color="primary" @click="changeRenderDate(7)">下周</q-btn>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <DutyCalendar
          v-bind:renderDate="renderDate"
          v-bind:allowModify="false"
          :printOnly="false"
          :key="renderDate"
        />
      </q-card>
    </q-dialog>

    <!-- confirm dialog -->
    <q-dialog v-model="showApproveDialog">
      <q-card style="width: 70vw; border-radius: 30px">
        <q-card-section>
          <div class="text-h5 bg-blue-3 text-center">確定批准放假？</div>
        </q-card-section>

        <q-card-section
          class="scroll bg-grey-2 q-pa-xs text-center"
          :style="
            $q.screen.lt.sm
              ? 'height: 40vw; max-height: 40vw'
              : 'height: 20vw; max-height: 20vw'
          "
        >
          <div
            style="border: 1px solid"
            class="col-6 q-pa-sm full-width q-mt-sm"
            v-for="(application, index) in selectedRow"
            :key="index"
            v-html="
              application.name +
              ' - ' +
              leaveMap[application.type] +
              ' 【' +
              qdate.formatDate(application.date, 'YYYY年MM月DD日(ddd)', {
                daysShort: ['日', '一', '二', '三', '四', '五', '六'],
              }) +
              application.hours +
              '小時】 '
            "
          />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <q-input v-model="applicationRemarks" label="備註：" />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn v-close-popup flat color="primary" label="取消" />
          <q-btn
            v-close-popup
            @click="confirmApprove"
            flat
            color="primary"
            label="確認批准"
            round
            icon="check"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- reject dialog -->
    <q-dialog v-model="showRejectDialog">
      <q-card style="width: 70vw; border-radius: 30px">
        <q-card-section>
          <div class="text-h5 bg-blue-3 text-center">確定拒絕放假？</div>
        </q-card-section>

        <q-card-section
          class="scroll bg-grey-2 q-pa-xs text-center"
          :style="
            $q.screen.lt.sm
              ? 'height: 40vw; max-height: 40vw'
              : 'height: 20vw; max-height: 20vw'
          "
        >
          <div
            style="border: 1px solid"
            class="col-6 q-pa-sm full-width q-mt-sm"
            v-for="(application, index) in selectedRow"
            :key="index"
            v-html="
              application.name +
              ' - ' +
              leaveMap[application.type] +
              ' 【' +
              qdate.formatDate(application.date, 'YYYY年MM月DD日(ddd)', {
                daysShort: ['日', '一', '二', '三', '四', '五', '六'],
              }) +
              application.hours +
              '小時】 '
            "
          />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <q-input v-model="applicationRemarks" label="備註：" />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn v-close-popup flat color="primary" label="取消" />
          <q-btn
            v-close-popup
            @click="confirmReject"
            flat
            color="red"
            label="確認拒絕"
            round
            icon="cancel"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- modification dialog -->
    <q-dialog v-model="showModificationDialog">
      <q-card style="width: 100vw; border-radius: 30px" class="q-pa-none">
        <q-card-section>
          <div class="text-h5 bg-blue-3 text-center">確定修改放假？</div>
        </q-card-section>

        <q-card-section
          class="scroll bg-grey-2 q-pa-xs text-center"
          :style="
            $q.screen.lt.sm
              ? 'height: 40vw; max-height: 40vw'
              : 'height: 20vw; max-height: 20vw'
          "
        >
          <div
            :style="
              application.invalidEdit ? 'border: 1px solid red' : 'border: 1px solid blue'
            "
            class="col-12 q-pa-sm full-width q-mt-sm"
            v-for="(application, index) in modifyingRow"
            :key="index"
          >
            <div v-if="!$q.screen.lt.sm">
              <div class="row items-center">
                <span class="col-2">{{ application.name }}</span>
                <span class="col-3"
                  ><q-btn-toggle
                    class="bg-light-blue-2"
                    v-model="application.type"
                    push
                    toggle-color="primary"
                    :options="[
                      { label: 'OT', value: 'OT' },
                      { label: '補OT', value: 'CL' },
                    ]"
                    @update:model-value="checkValidEdit_Slot(index)"
                  />
                </span>
                <span class="col-3">
                  <span v-html="qdate.formatDate(application.date, 'DD/MM/YYYY')" />
                  <q-btn icon="event" round color="primary">
                    <q-popup-proxy
                      @before-show="proxyDate = application.date"
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date v-model="proxyDate" mask="YYYY-MM-DD">
                        <div class="row items-center justify-end q-gutter-sm">
                          <q-btn label="取消" color="primary" flat v-close-popup />
                          <q-btn
                            label="確定"
                            color="primary"
                            @click="checkValidEdit_Date(index)"
                            flat
                            v-close-popup
                          />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-btn>
                </span>
                <span class="col-2 offset-1">
                  <q-input
                    label="時數"
                    type="number"
                    step="0.5"
                    v-model="application.hours"
                  ></q-input>
                </span>
              </div>
            </div>
            <div v-else>
              <div class="row justify-left">
                <div class="row fit">
                  <div class="col-xs-6">員工：{{ application.name }}</div>
                  <div class="col-xs-6">
                    <q-btn-toggle
                      class="bg-light-blue-2"
                      v-model="application.type"
                      push
                      size="xs"
                      toggle-color="primary"
                      :options="[
                        { label: 'OT', value: 'OT' },
                        { label: '補OT', value: 'CL' },
                      ]"
                      @update:model-value="checkValidEdit_Slot(index)"
                    />
                  </div>
                </div>
                <div class="col-xs-7 items-center">
                  日期：
                  <span v-html="qdate.formatDate(application.date, 'DD/MM/YYYY')" />
                  <q-btn icon="event" round color="primary" class="q-mx-xs">
                    <q-popup-proxy
                      @before-show="proxyDate = application.date"
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date v-model="proxyDate" mask="YYYY-MM-DD">
                        <div class="row items-center justify-end q-gutter-sm">
                          <q-btn label="取消" color="primary" flat v-close-popup />
                          <q-btn
                            label="確定"
                            color="primary"
                            @click="checkValidEdit_Date(index)"
                            flat
                            v-close-popup
                          />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-btn>
                </div>
                <div class="col-xs-5 row items-center">
                  <div class="col-xs-5">時數：</div>
                  <q-input
                    class="col-xs-6"
                    type="number"
                    step="0.5"
                    v-model="application.hours"
                  ></q-input>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pa-md">
          <q-input v-model="applicationRemarks" label="備註：" />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            v-close-popup
            flat
            color="grey"
            label="取消"
            @click="modifyingRow.value = []"
          />
          <q-btn
            v-close-popup
            @click="confirmModify"
            :disable="invalidInModification()"
            flat
            color="teal"
            label="確認修改"
            round
            icon="edit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- sticky button at bottom -->
    <q-page-sticky
      v-if="!$q.screen.lt.sm"
      position="bottom-right"
      :offset="[20, 20]"
      style="z-index: 1"
    >
      <q-fab
        v-if="checkForApproval()"
        label="批准"
        icon="check"
        color="primary"
        push
        @click="showApproveDialog = !showApproveDialog"
      />
      <q-fab
        v-if="checkForModification()"
        label="修改"
        icon="edit"
        color="warning"
        push
        @click="
          modifyingRow.value = JSON.parse(JSON.stringify(selectedRow.value));
          showModificationDialog = !showModificationDialog;
        "
      />
      <q-fab
        v-if="checkForApproval()"
        label="拒絕"
        icon="close"
        color="red"
        push
        @click="showRejectDialog = !showRejectDialog"
      />
    </q-page-sticky>

    <q-page-sticky position="bottom-left" :offset="[20, 20]" style="z-index: 1">
      <q-fab
        label="更表"
        icon="calendar_month"
        color="primary"
        push
        @click="showDutyCalendar = !showDutyCalendar"
      />
    </q-page-sticky>

    <!-- toolbar -->
    <div class="row full-width">
      <div class="col-12 col-xs-12 text-h6">篩選：</div>
      <div class="col-md-3 col-xs-4 row justify-left">
        <q-select
          class="col"
          v-model="usersSelected"
          hide-bottom-space
          multiple
          :options="userList"
          label="員工"
          filled
        ></q-select>
      </div>
      <q-space />
      <q-select
        class="col-md-2 col-xs-4 justify-left"
        v-model="statusSelected"
        hide-bottom-space
        :options="statusList"
        label="狀態"
        filled
      ></q-select>
      <q-space />
      <q-btn
        class="col-md-2 col-xs-4 justify-left"
        icon="restart_alt"
        label="重置篩選"
        size="md"
        @click="
          usersSelected = [];
          statusSelected = { value: '未批', label: '未批' };
        "
      />
    </div>

    <div class="q-mt-md row full-width">
      <q-table
        class="col"
        dense
        flat
        :grid="$q.screen.lt.sm"
        :rows="rows"
        :columns="columns"
        :pagination="defaultPagination"
        :filter="filterValues"
        :filter-method="customFilter"
        separator="cell"
        color="primary"
        row-key="docid"
        selection="multiple"
        v-model:selected="selectedRow"
        no-results-label="沒有合乎篩選條件的資料"
      >
        <!-- remark template -->
        <template v-slot:body-cell-remarks="props">
          <q-td style="font-size: 1.5vw; text-align: center">
            <div v-for="remark in props.value" :key="remark">
              {{ remark }}
            </div>
          </q-td>
        </template>

        <!-- grid template -->
        <template v-slot:item="props">
          <div class="col-xs-12 col-sm-6 col-md-4 full-width">
            <q-card class="q-mt-md">
              <q-card-section class="bg-blue-1 text-h6">
                <div class="row">
                  <div class="col">{{ props.row.name }}</div>
                  <q-space />
                  <div class="col text-right">
                    <q-icon v-if="props.row.status == '批准'" name="check" />【{{
                      props.row.status
                    }}】
                  </div>
                </div>

                <div class="text-caption row">
                  <span>日期:</span>
                  <span
                    v-html="
                      qdate.formatDate(props.row.date, 'YYYY年MM月DD日(ddd)', {
                        daysShort: ['日', '一', '二', '三', '四', '五', '六'],
                      })
                    "
                  />
                  <q-space />
                  <span>小時:</span><span v-html="props.row.hours" />
                  <q-space />
                  <span>種類:</span><span v-html="leaveMap[props.row.type]" />
                </div>
              </q-card-section>
              <q-separator inset />
              <q-card-section class="row">
                <div class="col-12 text-caption">
                  <div class="col-12 text-left">附註：</div>
                  <div class="col-12 text-left" v-for="remark in props.row.remarks">
                    {{ remark }}
                  </div>
                </div>
              </q-card-section>
              <q-separator inset />
              <q-card-actions class="row">
                <div
                  v-if="props.row.status == '未批'"
                  class="col-xs-12 row justify-around"
                >
                  <div class="col-xs-6">
                    <q-btn
                      class="fit"
                      icon="check"
                      color="blue"
                      outline
                      label="批准"
                      @click="singleApprove(props.row)"
                    />
                  </div>
                  <div class="col-xs-6">
                    <q-btn
                      class="fit"
                      icon="close"
                      color="red"
                      outline
                      label="拒絕"
                      @click="
                        selectedRow.value.push(props.row);
                        showRejectDialog = !showRejectDialog;
                      "
                    />
                  </div>
                </div>
                <div v-else class="col-xs-6">
                  <q-btn
                    icon="edit"
                    color="warning"
                    outline
                    label="修改"
                    @click="
                      modifyingRow.value = [JSON.parse(JSON.stringify(props.row))];
                      showModificationDialog = !showModificationDialog;
                    "
                  />
                </div>
              </q-card-actions>
            </q-card>
          </div>
        </template>
      </q-table>
    </div>
    <q-dialog v-model="waitingAsync" position="bottom">
      <LoadingDialog message="讀取資料中"/>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { OTCollection, usersCollection, FirebaseFunctions } from "boot/firebase";
import { ref, computed, onMounted } from "vue";
import { date as qdate } from "quasar";
import { useStore } from "vuex";
import DutyCalendar from "components/Duty/DutyCalendar.vue";
import LoadingDialog from "components/LoadingDialog.vue"
import { getDocs, query, where, orderBy } from "@firebase/firestore";
import { httpsCallable } from "@firebase/functions";

onMounted(() => {
  const userQuery = query(usersCollection,
    where("privilege.systemAdmin", "==", false),
    orderBy("order")
  )

  getDocs(userQuery).then((userDoc) => {
    userDoc.forEach((doc) => {
      userList.value.push({
        value: doc.data().uid,
        label: doc.data().name,
      });
    });
  })
  refreshHolidayTable()
})

// variables
const $store = useStore();
const renderDate = ref(new Date())
const proxyDate = ref(new Date())
const modifyingRow = ref([])
const applicationRemarks = ref("")
const showDutyCalendar = ref(false)
const showApproveDialog = ref(false)
const showModificationDialog = ref(false)
const showRejectDialog = ref(false)
const statusSelected = ref({ value: "未批", label: "未批" })
const usersSelected = ref([])
const selectedRow = ref([])
const userList = ref([])
const pendingApplicationList = ref([])
const awaitServerResponse = ref(0)

// table config
const statusList = ref([
        { value: "全部", label: "全部" },
        { value: "批准", label: "批准" },
        { value: "未批", label: "未批" },
        { value: "拒絕", label: "拒絕" },
      ])

const defaultPagination = ref({
  sortBy: "date",
  descending: true,
  rowsPerPage: 20,
})

const leaveMap = ref({
  OT: "OT",
  CL: "補OT",
})

const leaveReverseMap = ref({
  OT: "OT",
  補OT: "CL",
})
const rows = ref([])
const columns = ref([
  {
    name: "name",
    label: "員工",
    field: "name",
    style: "font-size: 1.5vw; text-align: center",
    headerStyle: "font-size: 1.5vw; text-align: center;",
    headerClasses: "bg-grey-2",
    sortable: true,
  },
  {
    name: "date",
    label: "日期",
    field: "date",
    style: "font-size: 1.5vw; text-align: center",
    headerStyle: "font-size: 1.5vw; text-align: center;",
    headerClasses: "bg-grey-2",
    sortable: true,
    sortOrder: "da",
    format: (val) =>
      qdate.formatDate(val, "YYYY年M月D日(ddd)", {
        daysShort: ["日", "一", "二", "三", "四", "五", "六"],
      }),
  },
  {
    name: "type",
    label: "種類",
    field: "type",
    style: "font-size: 1.5vw; text-align: center",
    headerStyle: "font-size: 1.5vw; text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => leaveMap.value[val],
    sortable: true,
  },
  {
    name: "hours",
    label: "時數",
    field: "hours",
    style: "font-size: 1.5vw; text-align: center",
    headerStyle: "font-size: 1.5vw; text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "remarks",
    label: "附註",
    field: "remarks",
    style: "font-size: 1.5vw; text-align: center",
    headerStyle: "font-size: 1.5vw; text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "status",
    label: "狀態",
    field: "status",
    style: "font-size: 1.5vw; text-align: center",
    headerStyle: "font-size: 1.5vw; text-align: center;",
    headerClasses: "bg-grey-2",
    sortable: true,
  },
])

// computed
const username = computed(() => $store.getters["userModule/getUsername"])
const waitingAsync = computed(() => awaitServerResponse.value > 0)
const filterValues = computed(() => ({
  usersSelected: usersSelected.value,
  statusSelected: statusSelected.value,
}))
      
// functions    
function invalidInModification() {
  return modifyingRow.value.findIndex((element) => "invalidEdit" in element) != -1;
}
    
function checkValidEdit_Date(modifyingRowIndex) {
  modifyingRow.value[modifyingRowIndex].date = new Date(proxyDate.value);

  checkDuplicate(modifyingRow.value[modifyingRowIndex])
    ? (modifyingRow.value[modifyingRowIndex].invalidEdit = true)
    : delete modifyingRow.value[modifyingRowIndex].invalidEdit;
}

function checkValidEdit_Slot(modifyingRowIndex) {
  checkDuplicate(modifyingRow.value[modifyingRowIndex])
    ? (modifyingRow.value[modifyingRowIndex].invalidEdit = true)
    : delete modifyingRow.value[modifyingRowIndex].invalidEdit;
}

function checkDuplicate(data) {
  let i = rows.value.findIndex(
    (element) =>
      element.docid != data.docid &&
      element.uid == data.uid &&
      qdate.formatDate(element.date, "YYYYMMDD") ==
        qdate.formatDate(data.date, "YYYYMMDD") &&
      element.slot == data.slot &&
      (element.status == "批准" || element.status == "未批")
  );
  return i != -1;
}

function singleApprove(row) {
  selectedRow.value = [row];
  showApproveDialog.value = true;
}
    
function changeRenderDate(days) {
  if (days > 0) {
    renderDate.value = qdate.addToDate(renderDate.value, { day: days });
  } else {
    renderDate.value = qdate.subtractFromDate(renderDate.value, { day: -days });
  }
}

function checkForApproval() {
  if (selectedRow.value.length == 0) return false;
  let i = selectedRow.value.findIndex(
    (element) => element.status == "批准" || element.status == "拒絕"
  );
  return i == -1;
}
 
function checkForModification() {
  if (selectedRow.value.length == 0) return false;
  let i = selectedRow.value.findIndex((element) => element.status != "批准");
  return !(i != -1);
}

function customFilter(rows, terms) {
  if (terms.usersSelected.length > 0 || terms.statusSelected.value != "全部") {
    let rowsReturn = rows;
    if (terms.usersSelected.length > 0) {
      rowsReturn = rowsReturn.filter(
        (row) =>
          terms.usersSelected.findIndex((element) => element.value == row.uid) != -1
      );
    }

    if (terms.statusSelected.value != "全部") {
      rowsReturn = rowsReturn.filter(
        (row) => row.status == terms.statusSelected.value
      );
    }
    return rowsReturn;
  } else {
    return rows;
  }
}

function confirmApprove() {
  let leaveData = [];
  let now = new Date();

  let combinedRemarks = "";
  if (applicationRemarks.value.length > 0) {
    combinedRemarks =
      "批准：" +
      username.value +
      "-" +
      applicationRemarks.value +
      " " +
      qdate.formatDate(now, "YYYY年MM月DD日HH時mm分ss秒");
  } else {
    combinedRemarks = "批准：" + qdate.formatDate(now, "YYYY年MM月DD日HH時mm分ss秒");
  }

  for (let doc of selectedRow.value) {
    doc.remarks = [...doc.remarks, combinedRemarks];
    doc.status = "批准";
  }

  const approveLeaveByDocid = httpsCallable(FirebaseFunctions,
    "ot-approveLeaveByDocid"
  );

  awaitServerResponse.value++;
  approveLeaveByDocid(selectedRow.value).then(() => {
    awaitServerResponse.value--;
    refreshHolidayTable();
    selectedRow.value = [];
  });

  applicationRemarks.value = "";
}
    
function confirmReject() {
  let leaveData = JSON.parse(JSON.stringify(selectedRow.value));
  let now = new Date();

  let combinedRemarks = "";
  if (applicationRemarks.value.length > 0) {
    combinedRemarks =
      "拒絕：" +
      username.value +
      "-" +
      applicationRemarks.value +
      " " +
      qdate.formatDate(now, "YYYY年MM月DD日HH時mm分ss秒");
  } else {
    combinedRemarks = "拒絕：" + qdate.formatDate(now, "YYYY年MM月DD日HH時mm分ss秒");
  }

  for (let doc of leaveData) {
    doc.remarks = [...doc.remarks, combinedRemarks];
    doc.status = "拒絕";
  }

  const rejectLeaveByDocid = httpsCallable(FirebaseFunctions, "ot-rejectLeaveByDocid");

  awaitServerResponse.value++;
  rejectLeaveByDocid(leaveData).then(() => {
    awaitServerResponse.value--;
    refreshHolidayTable();
    selectedRow.value = [];
  });

  applicationRemarks.value = "";
}
    
function confirmModify() {
  let now = new Date();

  let combinedRemarks = "";
  if (applicationRemarks.value.length > 0) {
    combinedRemarks =
      "修改：" +
      username.value +
      "-" +
      applicationRemarks.value +
      " " +
      qdate.formatDate(now, "YYYY年MM月DD日HH時mm分ss秒");
  } else {
    combinedRemarks = "修改：" + qdate.formatDate(now, "YYYY年MM月DD日HH時mm分ss秒");
  }

  for (let doc of modifyingRow.value) {
    doc.remarks = [...doc.remarks, combinedRemarks];
    doc.date = new Date(doc.date);
  }

  const modifyLeaveByDocid = httpsCallable(FirebaseFunctions, "ot-modifyLeaveByDocid");

  awaitServerResponse.value++;
  modifyLeaveByDocid(modifyingRow.value).then(() => {
    awaitServerResponse.value--;
    refreshHolidayTable();
    selectedRow.value = [];
  });

  applicationRemarks.value = "";
  modifyingRow.value = [];
}
    
function refreshHolidayTable() {
  rows.value = [];

  const OTQuery = query(OTCollection)

  getDocs(OTQuery).then((applications) => {
    applications.forEach((doc) => {
      rows.value.push({
        docid: doc.id,
        name: doc.data().name,
        uid: doc.data().uid,
        date: doc.data().date,
        hours: doc.data().hours,
        type: doc.data().type,
        remarks: doc.data().remarks,
        status: doc.data().status,
      });
    });
  })
}
</script>

<style scoped></style>
