<template>
  <q-page class="row items-start">
    <!-- loading dialog -->
    <q-dialog v-model="waitingAsync" position="bottom">
      <LoadingDialog message="處理中"/>
    </q-dialog>

    <div class="col-4 row items-start">
      <q-form @submit="apply" class="col-12 row items-center">
        <div class="col-6"><DateComponent v-model="healthCareObject.date" label="申領日期"/></div>
        <div class="col-4"><q-input v-model="healthCareObject.amount" label="申領金額" type="number" :rules="[val => (val >= 0 && val <= 200) || '申領金額 0-200']"/></div>
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
          <template v-slot:body-cell-isApproved="props">
            <q-td :props="props">
              <q-btn v-if="(props.row.c_receipt_no && !props.row.b_refund)" icon="print" color="positive" @click="printReceipt(props.row.c_receipt_no)" size="md" padding="none" outline>
                <q-tooltip class="bg-white text-positive">列印收據</q-tooltip>
              </q-btn>
              <q-btn v-if="(props.row.c_receipt_no && props.row.b_refund)" icon="print" color="negative" @click="printReceipt(props.row.c_receipt_no)" size="md" padding="none" outline>
                <q-tooltip class="bg-white text-negative">列印已取消收據</q-tooltip>
              </q-btn>
              {{props.row.c_receipt_no}}
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
    <div class="col-8 row justify-center items-start">
      <Voucher class="fit" :data="printObject"/>
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

const $q = useQuasar()
const $store = useStore()
const maxAmount = ref(0)
const awaitServerResponse = ref(0)
const healthcareSnapshot = ref()
const healthcare = ref([])

const defaultObject = ref({
  date: qdate.formatDate(Date.now(), "YYYY/MM/DD"),
  amount: 0,
  isApproved: false,
})
const defaultPagination = ref({
  rowsPerPage: 10,
  sortBy: "date",
  descending: true,
})

// table settings
const columns = ref([
  {
    name: "date",
    label: "日期",
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
    name: "isApproved",
    label: "審批",
    field: "isApproved",
    style: "font-size: 1rem",
    headerStyle: "font-size: 1rem",
    headerClasses: "bg-blue-2"
  },
])

const healthCareObject = ref()
resetObject()
const printObject = ref({
  date: "",
  username: "",
  amount: 0,
})
// computed
const uid = computed(() => $store.getters["userModule/getUID"])
const username = computed(() => $store.getters["userModule/getUsername"])
const waitingAsync = computed(() => awaitServerResponse > 0)

getDoc(healthcareConfig).then((healthcareConfigDoc) => {
  maxAmount.value = healthcareConfigDoc.data().amount
})

// query definition and start querying
const healthcareDocQuery = query(healthcareCollection,
  where("uid", "==", uid.value),
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
        isApproved: d.isApproved,
        approveDate: d.approveDate?.toDate()??""
      })
    } else if (change.type === "removed") {
      healthcare.value.splice({id: change.doc.id, ...d}, 1)
    }
  })
})

function apply() {
  const applyHealthCare = httpsCallable(FirebaseFunctions, "healthcare-applyHealthCare");
  awaitServerResponse.value++;
  applyHealthCare({ 
    date: qdate.formatDate(qdate.extractDate(healthCareObject.value.date, "YYYY/MM/DD"), "YYYY-MM-DDT00:00:00"),
    amount: healthCareObject.value.amount,
    isApproved: healthCareObject.value.isApproved,
    username: username.value,
  }).then(() => {
    awaitServerResponse.value--;
    $q.notify({ message: "成功申請！"})
    resetObject()
  })
  
}

function resetObject() {
  healthCareObject.value = JSON.parse(JSON.stringify(defaultObject.value))
}
</script>