<template>
  <q-page>
    <LoadingDialog v-model="loading" message="讀取中"/>

    <div class="row q-px-md">
      <q-select
        v-model="year"
        :options="years"
        label="年度"
        class="col-3"
        @update:model-value="refreshTable"
      />
      <q-space/>
      <StaffSelection class="col-3" v-model="staff" v-if="isUserManagement" @update:model-value="refreshTable"/>
      <!--
      <q-select
        v-if="isUserManagement"
        v-model="staff"
        :options="userList"
        label="員工"
        class="col-3"
        @update:model-value="refreshTable"
      />
      -->
    </div>
    
    <q-list>
      <q-item v-for="(item, index) in rows" :key="index">
        <q-chip class="bg-primary text-white text-h6">{{ item.username }}</q-chip> <q-chip class="text-h6">已申領： ${{ item.amount }}</q-chip> <q-chip class="bg-negative text-white text-h6">餘額： ${{ maxAmount - item.amount}}</q-chip>
      </q-item>
    </q-list>
    
  </q-page>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { healthcareConfig, healthcareCollection, FirebaseFunctions, usersCollection } from "src/boot/firebase";
import { getDoc, getDocs, query, where, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { useStore } from "vuex";
import User from "components/class/user";
import Healthcare from "components/class/healthcare"
import StaffSelection from "components/Basic/StaffSelection";
import LoadingDialog from "components/LoadingDialog";
import { date as qdate, useQuasar } from "quasar";

const $q = useQuasar()
const $store = useStore()
const maxAmount = ref(0)
const loading = ref(0)
const healthcareSnapshot = ref()
const healthcare = ref([])
const userList = ref([])
const healthcareData = ref([])

const username = computed(() => $store.getters["userModule/getUsername"])
const uid = computed(() => $store.getters["userModule/getUID"])
const isUserManagement = computed(() => $store.getters["userModule/getUserManagement"])
const staff = ref({value: uid.value, label: username.value})
const rows = computed(() => {
  /* sum the amount grouped by uid */
  let res = []
  healthcareData.value.forEach((b) => {
    let i = res.findIndex(a => a.username == b.username)
    if (i >= 0) res[i].amount += b.amount
    else res.push({username: b.username, amount: b.amount})    
  })
  return res
})

getDoc(healthcareConfig).then((healthcareConfigDoc) => {
  maxAmount.value = healthcareConfigDoc.data() && healthcareConfigDoc.data().amount? healthcareConfigDoc.data().amount: 0
})

const defaultPagination = ref({
  rowsPerPage: 10,
  sortBy: "date",
  descending: true,
})

const years = [
  {
    label: "2023-24",
    value: {
      periodStart: new Date(2023,3,1),
      periodEnd: new Date(2024, 2, 31)
    }
  },
  {
    label: "2024-25",
    value: {
      periodStart: new Date(2024,3,1),
      periodEnd: new Date(2025, 2, 31)
    }
  },
  {
    label: "2025-26",
    value: {
      periodStart: new Date(2025,3,1),
      periodEnd: new Date(2026, 2, 31)
    }
  }
  ]
const year = ref(years[0])


onMounted(async () => {
  loading.value++
  refreshTable().then(() => {
    loading.value--
  })
})

async function refreshTable() {
  return new Promise((resolve, reject) => {
    Healthcare.loadApproved(staff.value, year.value.value.periodStart, year.value.value.periodEnd).then((result) => {      
      healthcareData.value = result
      resolve(result)
    })
  });
}
</script>