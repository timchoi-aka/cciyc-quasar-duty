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
  <q-btn @click="addCustomClaims" label="testAxios"></q-btn>
</template>

<script>
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import Firebase, {
  usersCollection,
  leaveCollection,
  scheduleCollection,
  FirebaseFunctions,
  FirebaseAuth,
  getAuth,
} from "boot/firebase";
import { date as qdate } from "quasar";

export default defineComponent({
  name: "SystemAdmin",
  data() {
    return {};
  },
  setup() {
    const $store = useStore();

    return {
      hasuraClaim: computed(() => $store.getters["userModule/getHasuraClaim"]),
      uid: computed(() => $store.getters["userModule/getUID"]),
    };
  },
  methods: {
    addSALDeadline() {
      const addSALDeadline = FirebaseFunctions.httpsCallable(
        "systemAdmin-addSALDeadline"
      );
      addSALDeadline()
        .then((result) => {
          console.log(JSON.stringify(result));
        })
        .catch((err) => {
          console.err(JSON.stringify(err));
        });
    },
    calculateLeaveBalance() {
      const calculate = FirebaseFunctions.httpsCallable(
        "systemAdmin-calculateLeaveBalance"
      );
      calculate()
        .then((result) => {
          console.log(JSON.stringify(result));
        })
        .catch((err) => {
          console.err(JSON.stringify(err));
        });
    },
    migrateOTBalance() {
      const migrate = FirebaseFunctions.httpsCallable("systemAdmin-migrateOTBalance");
      migrate()
        .then((result) => {
          console.log(JSON.stringify(result));
        })
        .catch((err) => {
          console.err(JSON.stringify(err));
        });
    },
    upgradeUserProfile() {
      const upgrade = FirebaseFunctions.httpsCallable("systemAdmin-upgradeUserObject");
      upgrade()
        .then((result) => {
          console.log(JSON.stringify(result));
        })
        .catch((err) => {
          console.err(JSON.stringify(err));
        });
    },
    updateLeaveBalance() {
      const update = FirebaseFunctions.httpsCallable("systemAdmin-updateLeaveBalance");
      update()
        .then((result) => {
          console.log(JSON.stringify(result));
        })
        .catch((err) => {
          console.err(JSON.stringify(err));
        });
    },
    housekeepSchedule() {
      const housekeep = FirebaseFunctions.httpsCallable("systemAdmin-housekeepSchedule");
      housekeep()
        .then((result) => {
          console.log(JSON.stringify(result));
        })
        .catch((err) => {
          console.err(JSON.stringify(err));
        });
    },
    addNewRank() {
      const addRank = FirebaseFunctions.httpsCallable("systemAdmin-addNewRank");
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
    },
    findDanglingHoliday() {
      const findDangling = FirebaseFunctions.httpsCallable(
        "systemAdmin-findDanglingHoliday"
      );
      findDangling()
        .then((result) => {
          console.log(JSON.stringify(result));
        })
        .catch((err) => {
          console.err(JSON.stringify(err));
        });
    },
    async getApprovedHoliday() {
      const leaveDoc = await leaveCollection
        .where("status", "==", "批准")
        .where("uid", "==", "egoz4VCb3kSA2NwwT8CyiVSYkv83")
        .where("type", "==", "AL")
        .orderBy("date")
        .get();

      leaveDoc.forEach((doc) => {
        console.log(
          qdate.formatDate(doc.data().date, "YYYY-MM-DD") + "[" + doc.data().slot + "]"
        );
        console.log(JSON.stringify(doc.data()));
      });
      console.log("total: " + leaveDoc.docs.length);
    },
    async addCustomClaims() {
      const setCustomClaims = FirebaseFunctions.httpsCallable("systemAdmin-setCustomClaims");
      setCustomClaims().then((result) => {
         console.log(result);
      })  
    }
  },
});
</script>
