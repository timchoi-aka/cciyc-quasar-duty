<template>
  <q-btn @click="upgradeUserProfile" label="Upgrade User Profile"></q-btn>
  <q-btn @click="addNewRank" label="addNewRank"></q-btn>
  <q-btn @click="migrateOTBalance" label="migrateOTBalance"></q-btn>
  <q-btn @click="updateLeaveBalance" label="updateLeaveBalance"></q-btn>
  <q-btn @click="housekeepSchedule" label="housekeepSchedule"></q-btn>
  <q-btn @click="findDanglingHoliday" label="findDanglingHoliday"></q-btn>
  <q-btn disabled @click="getApprovedHoliday" label="getApprovedHoliday"></q-btn>
  <q-btn @click="calculateLeaveBalance" label="calculateLeaveBalance"></q-btn>
  <q-btn @click="addSALDeadline" label="addSALDeadline"></q-btn>
  <q-btn @click="addCustomClaims" label="Add Custom Claims"></q-btn>
  <q-btn @click="testNotify" label="Test Notify"></q-btn>
</template>

<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import {
  usersCollection,
  leaveCollection,
  scheduleCollection,
  FirebaseFunctions,
  FirebaseAuth,
} from "boot/firebase";
import { date as qdate } from "quasar";
import { httpsCallable } from "firebase/functions";
import { getDocs, query, where } from "@firebase/firestore";

// variables
const $store = useStore(); 

// computed
const hasuraClaim = computed(() => $store.getters["userModule/getHasuraClaim"])
const uid = computed(() => $store.getters["userModule/getUID"])

function testNotify() {
  const testNoti = httpsCallable(FirebaseFunctions,
    "systemAdmin-testNotify"
  );

  testNoti({
    title: "a test title",
    body: "the test body",
    link: "http://localhost:8080/#/system-admin",
  }).then((result) => {
    console.log(JSON.stringify(result));
  })
}

function addSALDeadline() {
  const addSALDL = httpsCallable(FirebaseFunctions,
    "systemAdmin-addSALDeadline"
  );
  addSALDL()
    .then((result) => {
      console.log(JSON.stringify(result));
    })
    .catch((err) => {
      console.err(JSON.stringify(err));
    });
}

function calculateLeaveBalance() {
  const calculate = httpsCallable(FirebaseFunctions,
    "systemAdmin-calculateLeaveBalance"
  );
  calculate()
    .then((result) => {
      console.log(JSON.stringify(result));
    })
    .catch((err) => {
      console.err(JSON.stringify(err));
    });
}

function migrateOTBalance() {
  const migrate = httpsCallable(FirebaseFunctions, "systemAdmin-migrateOTBalance");
  migrate()
    .then((result) => {
      console.log(JSON.stringify(result));
    })
    .catch((err) => {
      console.err(JSON.stringify(err));
    });
}
 
function upgradeUserProfile() {
  const upgrade = httpsCallable(FirebaseFunctions, "systemAdmin-upgradeUserObject");
  upgrade()
    .then((result) => {
      console.log(JSON.stringify(result));
    })
    .catch((err) => {
      console.err(JSON.stringify(err));
    });
}

function updateLeaveBalance() {
  const update = httpsCallable(FirebaseFunctions, "systemAdmin-updateLeaveBalance");
  update()
    .then((result) => {
      console.log(JSON.stringify(result));
    })
    .catch((err) => {
      console.err(JSON.stringify(err));
    });
}

function housekeepSchedule() {
  const housekeep = httpsCallable(FirebaseFunctions, "systemAdmin-housekeepSchedule");
  housekeep()
    .then((result) => {
      console.log(JSON.stringify(result));
    })
    .catch((err) => {
      console.err(JSON.stringify(err));
    });
}

function addNewRank() {
  const addRank = httpsCallable(FirebaseFunctions, "systemAdmin-addNewRank");
  addRank({
    rank: "tmp",
    t1: 0,
    t2: 0,
    t3: 0,
    t4: 0,
    t5: 0,
  })
    .then((result) => {
      console.log(JSON.stringify(result));
    })
    .catch((err) => {
      console.err(JSON.stringify(err));
    });
}

function findDanglingHoliday() {
  const findDangling = httpsCallable(FirebaseFunctions, 
    "systemAdmin-findDanglingHoliday"
  );
  findDangling()
    .then((result) => {
      console.log(JSON.stringify(result));
    })
    .catch((err) => {
      console.err(JSON.stringify(err));
    });
}

async function getApprovedHoliday() {
  const leaveDocQuery = query(leaveCollection,
    where("status", "==", "批准"),
    where("uid", "==", "egoz4VCb3kSA2NwwT8CyiVSYkv83"),
    where("type", "==", "AL"),
    orderBy("date")
  )
  
  const leaveDoc = await getDocs(leaveDocQuery)

  leaveDoc.forEach((doc) => {
    console.log(
      qdate.formatDate(doc.data().date, "YYYY-MM-DD") + "[" + doc.data().slot + "]"
    );
    console.log(JSON.stringify(doc.data()));
  });
  console.log("total: " + leaveDoc.docs.length);
}

async function addCustomClaims() {
  const setCustomClaims = httpsCallable(FirebaseFunctions, "systemAdmin-setCustomClaims");
  setCustomClaims().then((result) => {
      console.log(result);
  })  
}
</script>
