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
  <q-btn @click="testAxios" label="testAxios"></q-btn>
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
  getAuth
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
    async testAxios() {
      try {
      const graphqlQuery = {
        operationName: "MyQuery",
        query: `query MyQuery {
                  HTX_Member(where: {c_barcode: {_eq: "0001"}}) {
                    b_cssa
                    b_lib_user
                    c_HKID
                    c_barcode
                    c_centre_id
                    c_email
                    c_emer_name
                    c_emer_rel
                    c_emer_tel1_1
                    c_intro_source
                    c_job
                    c_mem_id
                    c_mem_pwd
                    c_name
                    c_name_other
                    c_sex
                    c_tel
                    c_udf_1
                    c_udf_6
                    c_user_id
                    c_vol_ser_unit
                    c_vol_service_time
                    c_vol_skill_act
                    c_vol_skill_arts
                    c_vol_skill_music
                    c_vol_training
                    d_birth
                    d_come_HK
                    d_enter_1
                    d_expired_1
                    d_update
                    d_write
                    m_addscom
                    m_vol_remarks
                  }
                }`,
        variables: {},
      };
      
      const setCustomClaims = FirebaseFunctions.httpsCallable("systemAdmin-setCustomClaims");
      setCustomClaims().then((result) => {
         console.log(result);
      })  
      
      var token = await FirebaseAuth.currentUser.getIdToken();
     
     
      this.$api.defaults.headers.common = {
        "content-type": "application/json",
      }
      
      this.$api.defaults.headers.common['Authorization'] = "Bearer " + token;

      const articleResponse = await this.$api({
        method: "post",
        data: graphqlQuery,
      });

      console.log(articleResponse);
    } catch (error) {
      this.error = error;
    }
    }
  },
});
</script>
