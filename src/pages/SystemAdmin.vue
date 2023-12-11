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
  <q-btn @click="subscribeAllUserTopics" label="Subscribe All Topics"></q-btn>
  <q-btn @click="migrateALBalance" label="Migrate AL Balance"></q-btn>
</template>

<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { getToken } from "firebase/messaging";
import {
  usersCollection,
  leaveCollection,
  scheduleCollection,
  FirebaseFunctions,
  FirebaseAuth,
  FirebaseMessaging,
} from "boot/firebase";
import { date as qdate } from "quasar";
import { httpsCallable } from "firebase/functions";
import { getDocs, query, where, orderBy } from "firebase/firestore";

// variables
const $store = useStore();

// computed
const hasuraClaim = computed(() => $store.getters["userModule/getHasuraClaim"])
const uid = computed(() => $store.getters["userModule/getUID"])

function subscribeAllUserTopics() {
  const userDocQuery = query(usersCollection,
    where("enable", "==", true),
    where("rank", "!=", "tmp"),
    orderBy("rank")
  )
  const userList = []
  getDocs(userDocQuery).then((userDoc) => {
    userDoc.forEach((user) => {
      if (!user.data().privilege.systemAdmin) {
        userList.push(
          user.data().uid,
        );
      }
    });

    // subscribe also to the special topic "holidayApprove"
    userList.push("holidayApprove")
    getToken(FirebaseMessaging, {vapidKey: "BFu5VzDUwOVWSQ--MUDmSEPt9AYN9QlTPIzijXKzQVqrIdpKi1goG9l3L8_fDJFr5mojwX5Eo2tDC1XiMmIfSXA"}).then((currentToken) => {
      if (currentToken) {
        const subscribeTopic = httpsCallable(FirebaseFunctions, "notification-subscribeTopic");
        userList.forEach((user) => {
          console.log("registering to topic " + user)
          subscribeTopic({
            topic: user,
            token: currentToken,
          })
        })
      } else {
        // Show permission request UI
        console.log('No registration token available. Request permission to generate one.');
      }
    }).catch((err) => {
      console.log('An error occurred while retrieving token. ', err);
    });
  })
}

async function testNotify() {
  const testNoti = httpsCallable(FirebaseFunctions,
    "systemAdmin-testNotify"
  );
  await new Promise(callback => setTimeout(callback, 5000))
  testNoti({
    title: "a test title",
    body: "the test body",
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
    rank: "gw",
    t1: 12,
    t2: 18,
    t3: 18,
    t4: 24,
    t5: 30,
  })
    .then((result) => {
      console.log(JSON.stringify(result));
    })
    .catch((err) => {
      console.err(JSON.stringify(err));
    });

  addRank({
    rank: "ga_pt",
    t1: 6,
    t2: 9,
    t3: 9,
    t4: 9,
    t5: 12,
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

function migrateALBalance() {
  const migrate = httpsCallable(FirebaseFunctions, "holiday-migrateALBalance");
  migrate()
    .then((result) => {
      console.log(JSON.stringify(result));
    })
    .catch((err) => {
      console.error(JSON.stringify(err));
    });
}
</script>
