<template>
  <q-page class="row items-start">
    <!-- loading dialog -->
    <LoadingDialog message="處理中" v-model="awaitServerResponse"/>
    

    <div v-if="$q.screen.gt.sm" class="row fit">
      <div class="col-4 row items-start">
        <q-form @submit="apply" class="col-12 row items-center">
          <div class="col-6"><DateComponent v-model="healthCareObject.date" label="收據日期"/></div>
          <div class="col-4"><q-input v-model="healthCareObject.amount" label="申領金額" type="number" :rules="[val => (val > 0 && val <= maxRemaining) || '申領金額 0-'+maxRemaining]"/></div>
          <div class="col-2"><q-btn label="新增" size="md" class="bg-positive text-white" type="submit"/></div>
        </q-form>
        <div class="col-12 items-start">
          <q-table
            flat
            bordered
            :rows="healthcare"
            :columns="columns"
            :pagination="defaultPagination"
            row-key="id"
            @row-click="(event, row, index) => printObject = row">
            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <q-icon v-if="props.row.status == '批准'" class="text-positive" name="check">
                  <q-tooltip class="bg-white text-positive">已獲批</q-tooltip>
                </q-icon>
                <q-icon v-if="props.row.status == '拒絕'" class="text-negative" name="cancel">
                  <q-tooltip class="bg-white text-negative">申請被拒</q-tooltip>
                </q-icon>
                <q-btn v-if="props.row.status == '未批'" icon="delete" color="negative" @click="deleteApplication(props.row.id)" size="md" padding="none" outline>
                  <q-tooltip class="bg-white text-negative">取消申請</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </div>
      </div>
      <div class="col-8 justify-center items-start">
        <Voucher v-if="printObject.amount > 0" class="fit" :data="printObject" type="醫療"/>
      </div>
    </div>
    
    <div v-else>
      <div class="row col-12 items-start q-mt-md">
        <q-form @submit="apply" class="col-12 row items-center">
          <div class="col-6"><DateComponent v-model="healthCareObject.date" label="收據日期"/></div>
          <div class="col-4"><q-input v-model="healthCareObject.amount" label="申領金額" type="number" :rules="[val => (val > 0 && val <= maxRemaining) || '申領金額 0-'+maxRemaining]"/></div>
          <div class="col-2"><q-btn label="新增" size="md" class="bg-positive text-white" type="submit"/></div>
        </q-form>
        <div class="fit items-start">
          <q-table
            flat
            bordered
            :rows="healthcare"
            :columns="columns"
            :pagination="mobilePagination"
            row-key="id"
            @row-click="(event, row, index) => printObject = row">
            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <q-icon v-if="props.row.status == '批准'" class="text-positive" name="check">
                  <q-tooltip class="bg-white text-positive">已獲批</q-tooltip>
                </q-icon>
                <q-icon v-if="props.row.status == '拒絕'" class="text-negative" name="cancel">
                  <q-tooltip class="bg-white text-negative">申請被拒</q-tooltip>
                </q-icon>
                <q-btn v-if="props.row.status == '未批'" icon="delete" color="negative" @click="deleteApplication(props.row.id)" size="md" padding="none" outline>
                  <q-tooltip class="bg-white text-negative">取消申請</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </div>
        <div class="fit justify-center items-start">
          <Voucher v-if="printObject.amount > 0" class="fit" :data="printObject" type="醫療"/>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import DateComponent from 'src/components/Basic/DateComponent.vue';
import { ref, computed } from 'vue';
import { healthcareConfig, healthcareCollection, FirebaseFunctions } from "src/boot/firebase";
import { getDoc, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { date as qdate, useQuasar } from "quasar"
import LoadingDialog from "components/LoadingDialog.vue"
import { httpsCallable } from "firebase/functions";
import { useStore } from "vuex";
import Voucher from 'src/components/HealthCare/Voucher.vue'
import dateUtil from "src/lib/date.js";

const $q = useQuasar()
const $store = useStore()
const maxAmount = ref(0)
const awaitServerResponse = ref(0)
const healthcareSnapshot = ref()
const healthcare = ref([])

class healthCare {
  constructor() {
    this.date = qdate.formatDate(Date.now(), "YYYY/MM/DD")
    this.amount = 0
    this.status = "未批"
  }
}

const defaultPagination = ref({
  rowsPerPage: 10,
  sortBy: "date",
  descending: true,
})

const mobilePagination = ref({
  rowsPerPage: 3,
  sortBy: "date",
  descending: true,
})

// table settings
const columns = ref([
  {
    name: "date",
    label: "收據日期",
    field: "date",
    sortable: true,
    format: (val) => qdate.formatDate(val, "YYYY年M月D日"),
    style: "font-size: 1rem",
    headerStyle: "font-size: 1rem",
    headerClasses: "bg-blue-2"
  },
  {
    name: "amount",
    label: "金額",
    field: "amount",
    style: "font-size: 1rem",
    headerStyle: "font-size: 1rem",
    headerClasses: "bg-blue-2"
  },
  {
    name: "status",
    label: "狀態",
    field: "status",
    style: "font-size: 1rem",
    headerStyle: "font-size: 1rem",
    headerClasses: "bg-blue-2"
  },
])

const healthCareObject = ref(new healthCare())
const printObject = ref(new healthCare())

// computed
const uid = computed(() => $store.getters["userModule/getUID"])
const username = computed(() => $store.getters["userModule/getUsername"])
const waitingAsync = computed(() => awaitServerResponse.value > 0)
const maxRemaining = computed(() => maxAmount.value - healthcare.value.reduce((a,b) => b.status == "批准"? a + b.amount: a, 0 ) > 200? 200: maxAmount.value - healthcare.value.reduce((a,b) => b.status == "批准"? a + b.amount: a, 0 ))
getDoc(healthcareConfig).then((healthcareConfigDoc) => {
  maxAmount.value = healthcareConfigDoc.data().amount
})

// query definition and start querying
const fy = dateUtil.getFY(new Date())
const healthcareDocQuery = query(healthcareCollection,
  where("uid", "==", uid.value),
  where("date", ">=", fy.periodStart),
  where("date", "<=", fy.periodEnd),
  orderBy("date")
)

healthcareSnapshot.value = onSnapshot(healthcareDocQuery, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    let d = change.doc.data();

    if (change.type == "added") {
      healthcare.value.push({
        id: change.doc.id,
        username: d.username,
        date: d.date?.toDate()??"",
        amount: parseFloat(d.amount),
        status: d.status,
        approveDate: d.approveDate?.toDate()??""
      })
    } else if (change.type === "removed") {
      healthcare.value.splice({id: change.doc.id, ...d}, 1)
    }
  })
})

function apply() {
  if (healthCareObject.amount <= 0 || healthCareObject.amount > 200) return
  const applyHealthCare = httpsCallable(FirebaseFunctions, "healthcare-applyHealthCare");
  awaitServerResponse.value++;
  applyHealthCare({ 
    date: qdate.formatDate(qdate.extractDate(healthCareObject.value.date, "YYYY/MM/DD"), "YYYY-MM-DDT00:00:00"),
    amount: parseFloat(healthCareObject.value.amount),
    status: healthCareObject.value.status,
    username: username.value,
  }).then(() => {
    awaitServerResponse.value--;
    $q.notify({ message: "成功申請！"})
    resetObject()
  }) 
}

function deleteApplication(id) {
  const deleteHealthCare = httpsCallable(FirebaseFunctions, "healthcare-deleteHealthCare")
  awaitServerResponse.value++
  deleteHealthCare({
    id: id
  }).then(() => {
    awaitServerResponse.value--
    $q.notify({ message: "成功刪除！"})
    resetObject()
  })
}

function resetObject() {
  healthCareObject.value = new healthCare()
  printObject.value = new healthCare()
}
</script>