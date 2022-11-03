<template>
  <q-page>
     <!-- loading dialog -->
     <q-dialog v-model="waitingAsync" position="bottom">
      <LoadingDialog message="資料讀取中"/>
    </q-dialog>

    <q-page-sticky style="z-index: 1" position="top" expand>
      <q-tabs
        dense
        class="text-black bg-light-blue-2 fit"
        active-color="brown"
        indicator-color="blue"
        align="justify"
      >
        <q-route-tab to="/holiday/al-view" icon="celebration" label="年假表" />
        <q-route-tab to="/holiday/sal-view" icon="local_activity" label="特別年假" />
        <q-route-tab to="/holiday/al-apply" icon="edit_calendar" label="申請假期">
          <q-badge color="red" floating
            >{{ ALBalance }}<span v-if="isSAL">+{{ SALBalance }}</span></q-badge
          >
        </q-route-tab>
        <q-route-tab to="/holiday/holiday-pending" icon="hourglass_empty" label="待審批">
          <q-badge color="red" floating>{{ pendingCount }}</q-badge>
        </q-route-tab>
        <q-route-tab
          v-if="isLeaveApprove"
          to="/holiday/holiday-approve"
          icon="approval"
          label="批核假期"
        >
          <q-badge color="red" floating>{{ pendingALApprovalCount }}</q-badge>
        </q-route-tab>
      </q-tabs>
    </q-page-sticky>
    <q-separator class="q-mt-xl" />
    <router-view class="q-mt-md q-mb-xl" />
  </q-page>
</template>

<script>
import { useStore } from "vuex";
import { leaveCollection, dashboardCollection, usersCollection } from "boot/firebase";
import { defineComponent, computed } from "vue";
import { date as qdate } from "quasar";
import LoadingDialog from "components/LoadingDialog.vue"

export default defineComponent({
  name: "Holiday",
  data() {
    return {
      qdate: qdate,
      leaveListener: Function(),
      leaveApprovedListener: Function(),
      dashboardListener: Function(),
      pendingALApprovalCount: 0,
      pendingCount: 0,
      renderDate: new Date(),
      awaitServerResponse: 0,
      ALBalance: 0,
    };
  },
  components: {
    LoadingDialog,
  },
  methods: {},
  computed: {
    waitingAsync() {
      return this.awaitServerResponse > 0 ? true : false;
    },
  },
  async unmounted() {
    this.leaveListener();
    this.dashboardListener();
    this.leaveApprovedListener();
  },
  async mounted() {
    this.leaveListener = leaveCollection
      .where("uid", "==", this.uid)
      .where("status", "==", "未批")
      .onSnapshot((snapshot) => {
        this.pendingCount = Object.keys(snapshot.docs).length;
      });
    this.dashboardListener = dashboardCollection
      .doc("notification")
      .onSnapshot((snapshot) => {
        this.pendingALApprovalCount = snapshot.data().leave_waitingForApproval;
      });
    this.awaitServerResponse++;

    // listen and update month end balance
    // get user data
    const userDoc = await usersCollection.doc(this.uid).get();
    const rank = userDoc.data().rank;
    const dateOfExit = userDoc.data().dateOfExit ? userDoc.data().dateOfExit : null;
    const dateOfEntry = userDoc.data().dateOfEntry;

    // get leaveConfig
    const leaveConfigDoc = await dashboardCollection.doc("leaveConfig").get();
    const leaveConfigData = leaveConfigDoc.data();
    const tiers = leaveConfigData[rank];

    // get AL starting balance
    const systemStartBalance = leaveConfigData[this.uid][0].al;

    // determine month end
    const now = new Date();
    let monthEnd = qdate.endOfDate(now, "month");

    // determine data retrieval boundary combining yearEnd and dateOfExit
    const dataBoundary =
      dateOfExit && dateOfExit.toDate() < monthEnd ? dateOfExit.toDate() : monthEnd;

    let totalGain = 0;
    // begin with system start date
    let systemStart = new Date("2021/04/01");
    let monthLoop = systemStart;
    do {
      const yearServed =
        qdate.getDateDiff(
          qdate.endOfDate(monthLoop, "month"),
          dateOfEntry.toDate(),
          "month"
        ) / 12;

      let tier = 0;
      const tiersConfig = [0, 5, 8, 10, 12];
      for (let j = tiersConfig.length; j > 0; j--) {
        if (yearServed >= tiersConfig[j - 1]) {
          tier = tiers["t" + j];
          break;
        }
      }
      let perMonthGain = tier / 12;

      let lastWorkingDate = qdate.addToDate(dataBoundary, { days: -1 });

      if (
        qdate.getDateDiff(this.dataBoundary, monthLoop) <
        qdate.daysInMonth(lastWorkingDate)
      ) {
        perMonthGain = 0;
      }
      totalGain += perMonthGain;
      monthLoop = qdate.addToDate(monthLoop, { month: 1 });
    } while (qdate.getDateDiff(monthLoop, dataBoundary, "day") < 0);
    let holidayCount = 0;
    this.leaveApprovedListener = leaveCollection
      .where("uid", "==", this.uid)
      .where("status", "==", "批准")
      .where("type", "==", "AL")
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type == "added") {
            let d = change.doc.data();
            qdate.isBetweenDates(d.date, systemStart, dataBoundary)
              ? (holidayCount += 0.5)
              : (holidayCount = holidayCount);
          } else if (change.type == "removed") {
            let d = change.doc.data();
            qdate.isBetweenDates(d.date, systemStart, dataBoundary)
              ? (holidayCount -= 0.5)
              : (holidayCount = holidayCount);
          }

          this.ALBalance = systemStartBalance + totalGain - holidayCount;
        });
      });
    this.ALBalance = systemStartBalance + totalGain - holidayCount;
    this.awaitServerResponse--;
    this.$router.push("/holiday/al-view").catch(() => {});
  },
  setup() {
    const $store = useStore();

    return {
      uid: computed(() => $store.getters["userModule/getUID"]),
      isLeaveManage: computed(() => $store.getters["userModule/getLeaveManage"]),
      isLeaveApprove: computed(() => $store.getters["userModule/getLeaveApprove"]),
      isSAL: computed(() => $store.getters["userModule/getSAL"]),
      SALBalance: computed(() => $store.getters["userModule/getSALBalance"]),
    };
  },
});
</script>

<style scoped></style>
