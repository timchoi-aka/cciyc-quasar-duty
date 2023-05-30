<template>
  <q-page>
    <div class="row q-px-md">
      <q-select
        v-model="year"
        :options="years"
        label="年度"
        class="col-3"
        @update:model-value="refreshTable"
      />
      <q-space/>
      <q-select
        v-if="isUserManagement"
        v-model="staff"
        :options="userList"
        label="員工"
        class="col-3"
        @update:model-value="refreshTable"
      />
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
import { User } from "components/class/user";
import { date as qdate, useQuasar } from "quasar";

const $q = useQuasar()
const $store = useStore()
const maxAmount = ref(0)
const awaitServerResponse = ref(0)
const healthcareSnapshot = ref()
const healthcare = ref([])
const userList = ref([{value: "", label: "全部"}])
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
  maxAmount.value = healthcareConfigDoc.data().amount
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


onMounted(() => {
  const userQuery = query(usersCollection,
    where("privilege.systemAdmin", "==", false),
    orderBy("order")
  )

  getDocs(userQuery).then((userDoc) => {
    userDoc.forEach((doc) => {
      const u = new User(doc.data())
      if (u.isValidEmployment()) {
        userList.value.push({
          value: u.uid,
          label: u.name,
        });
      }
    });
  })

  refreshTable()
})

function refreshTable() {
  let HCQuery;
  healthcareData.value = []
  let start = Timestamp.fromDate(year.value.value.periodStart)
  let end = Timestamp.fromDate(year.value.value.periodEnd)
  if (staff.value.value) {
    HCQuery = query(healthcareCollection, 
      where("uid", "==", staff.value.value),
      where("date", ">=", start),
      where("date", "<=", end),
      where("status", "==", "批准"),
      )
  } else {
    HCQuery = query(healthcareCollection, 
      where("date", ">=", start),
      where("date", "<=", end),
      where("status", "==", "批准"),
      )
  }

  getDocs(HCQuery).then((docs) => {
    docs.forEach((doc) => {
      if (doc.id != "config") {
        let d = doc.data()
        healthcareData.value.push({
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
  })
}
</script>