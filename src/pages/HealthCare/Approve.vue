<template>
  <q-page class="full-width q-pa-sm">
    <LoadingDialog v-model="loading"/>

    <!-- confirm dialog -->
    <q-dialog v-model="showApproveDialog">
      <q-card style="width: 70vw; border-radius: 30px">
        <q-card-section>
          <div class="text-h5 bg-blue-3 text-center">確定批准醫療申請？</div>
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
              application.username +
              ' - ' +
              qdate.formatDate(application.date.toDate(), 'YYYY年M月D日') +
              ' 【$' +
              application.amount +
              '】 '
            "
          />
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
          <div class="text-h5 bg-blue-3 text-center">確定拒絕醫療申請？</div>
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
              application.username +
              ' - ' +
              qdate.formatDate(application.date.toDate(), 'YYYY年M月D日') +
              ' 【$' +
              application.amount +
              '】 '
            "
          />
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
          <div class="text-h5 bg-blue-3 text-center">確定修改醫療申請？</div>
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
                <span class="col-2">{{ application.username }}</span>
                <span class="col-3">
                  <span v-html="qdate.formatDate(new Timestamp(application.date.seconds, application.date.nanoseconds).toDate(), 'YYYY年M月D日')" />
                </span>
                <span class="col-2 offset-1">
                  <q-input
                    label="金額"
                    type="number"
                    step="1"
                    v-model="application.amount"
                  ></q-input>
                </span>
              </div>
            </div>
            <div v-else>
              <div class="row justify-left">
                <div class="row fit">
                  <div class="col-xs-6">員工：{{ application.username }}</div>
                </div>
                <div class="col-xs-7 items-center">
                  日期： 
                  <span v-html="qdate.formatDate(new Timestamp(application.date.seconds, application.date.nanoseconds).toDate(), 'YYYY年M月D日')" />
                </div>
                <div class="col-xs-5 row items-center">
                  <div class="col-xs-5">金額：</div>
                  <q-input
                    class="col-xs-6"
                    type="number"
                    step="1"
                    v-model="application.amount"
                  ></q-input>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            v-close-popup
            flat
            color="grey"
            label="取消"
            @click="modifyingRow = []"
          />
          <q-btn
            v-close-popup
            @click="confirmModify"
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
          modifyingRow = JSON.parse(JSON.stringify(selectedRow));
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

    <!-- toolbar -->
    <div class="row full-width q-mt-md">
      <div class="col-12 col-xs-12 text-h6">篩選：</div>
      <div class="col-md-3 col-xs-4 row justify-left">
        <StaffSelectionMultiple class="col" v-model="usersSelected" />
        <!--
        <q-select
          class="col"
          v-model="usersSelected"
          hide-bottom-space
          multiple
          :options="userOptionsList"
          label="員工"
          filled
        ></q-select>
        -->
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
                        selectedRow.push(props.row);
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
                      modifyingRow = [JSON.parse(JSON.stringify(props.row))];
                      showModificationDialog = !showModificationDialog;
                    "
                  />
                </div>
              </q-card-actions>
            </q-card>
          </div>
        </template>

        <!-- remark template -->
        <template v-slot:body-cell-remarks="props">
          <q-td style="font-size: 1.5vw; text-align: center">
            <div v-for="remark in props.value" :key="remark">
              {{ remark }}
            </div>
          </q-td>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script setup>
import { healthcareCollection, usersCollection, FirebaseFunctions } from "boot/firebase";
import { ref, computed, onMounted } from "vue";
import { date as qdate, useQuasar } from "quasar";
import { useStore } from "vuex";
import LoadingDialog from "components/LoadingDialog.vue"
import { getDocs, query, where, orderBy, Timestamp } from "@firebase/firestore";
import { httpsCallable } from "@firebase/functions";
import StaffSelectionMultiple from "src/components/Basic/StaffSelectionMultiple.vue";

onMounted(async () => {
  loading.value++
  return new Promise((resolve, reject) => {
    refreshHolidayTable().then((result) => {
      rows.value = result
      loading.value--
      resolve(result)
    })
  })
})

// variables
const $store = useStore()
const $q = useQuasar()
const renderDate = ref(new Date())
const proxyDate = ref(new Date())
const modifyingRow = ref([])
const showApproveDialog = ref(false)
const showModificationDialog = ref(false)
const showRejectDialog = ref(false)
const statusSelected = ref({ value: "未批", label: "未批" })
const usersSelected = ref([])
const selectedRow = ref([])
// const userList = User.loadPermUsers()
// const userOptionsList = computed(() => userList.length > 0? userList : [])
const pendingApplicationList = ref([])
const loading = ref(0)

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

const rows = ref([])
const columns = ref([
  {
    name: "username",
    label: "員工",
    field: "username",
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
      qdate.formatDate(val.toDate(), "YYYY年M月D日(ddd)", {
        daysShort: ["日", "一", "二", "三", "四", "五", "六"],
      }),
  }, 
  {
    name: "amount",
    label: "金額",
    field: "amount",
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
const userProfileLogout = () => $store.dispatch("userModule/logout")
const isLogin = computed(() => $store.getters["userModule/isLogin"])
const username = computed(() => $store.getters["userModule/getUsername"])
const filterValues = computed(() => ({
  usersSelected: usersSelected.value? usersSelected.value: [],
  statusSelected: statusSelected.value,
}))

// logout if timeout
if (!isLogin.value) {
  userProfileLogout().then(() => {
    $q.notify({ message: "系統超時，請重新登入。" });
  })
  .catch((error) => console.log("error", error));
}

// functions    
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
  let now = new Date();

  const remarks = "批准：" + qdate.formatDate(now, "YYYY年MM月DD日HH時mm分ss秒");
  
  for (let doc of selectedRow.value) {
    doc.remarks = [...doc.remarks, remarks];
    doc.status = "批准";
  }

  const approveHealthCareByDocid = httpsCallable(FirebaseFunctions,
    "healthcare-approveHealthCareByDocid"
  );
  
  loading.value++;
  approveHealthCareByDocid(selectedRow.value).then(() => {
    refreshHolidayTable().then((result) => {
      rows.value = result
      loading.value--;
      selectedRow.value = [];
    });
  });
}
    
function confirmReject() {
  let now = new Date();

  const remarks = "拒絕：" + qdate.formatDate(now, "YYYY年MM月DD日HH時mm分ss秒");
  
  for (let doc of selectedRow.value) {
    doc.remarks = [...doc.remarks, remarks];
    doc.status = "拒絕";
  }

  const rejectHealthCareByDocid = httpsCallable(FirebaseFunctions,
    "healthcare-rejectHealthCareByDocid"
  );
  
  loading.value++;
  rejectHealthCareByDocid(selectedRow.value).then(() => {    
    refreshHolidayTable().then((result) => {
      rows.value = result
      loading.value--
      selectedRow.value = [];
    });
  });
}
    
function confirmModify() {
  let now = new Date();

  const remarks = "修改：" + qdate.formatDate(now, "YYYY年MM月DD日HH時mm分ss秒");

  for (let doc of modifyingRow.value) {
    doc.remarks = [...doc.remarks, remarks];
  }

  const modifyHealthCareByDocid = httpsCallable(FirebaseFunctions, "healthcare-modifyHealthCareByDocid");

  loading.value++;
  modifyHealthCareByDocid(modifyingRow.value).then(() => {
    refreshHolidayTable().then((result) => {
      rows.value = result
      loading.value--
      selectedRow.value = []
    })
  });

  modifyingRow.value = [];
}
    
async function refreshHolidayTable() {
  return new Promise((resolve, reject) => {
    const HCQuery = query(healthcareCollection)
    let result = [];
    getDocs(HCQuery).then((applications) => {
      applications.forEach((doc) => {
        if (doc.id != "config") {
          let d = doc.data()
          result.push({
            docid: doc.id,
            username: d.username,
            uid: d.uid,
            date: d.date,
            amount: d.amount,
            status: d.status,
            remarks: d.remarks? [...d.remarks]: [],
          });
        }  
      });
      resolve(result)
    })
  })
}
</script>
