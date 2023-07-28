<template>
  <q-page>
    <q-page-sticky style="z-index: 1;" position="top" expand>
      <q-tabs
        dense
        class="text-black bg-light-blue-2 fit"
        active-color="brown"
        indicator-color="blue"
        align="justify"
      >
        <q-route-tab to="/holiday/al-view" icon="celebration" label="年假表" />
        <q-route-tab v-if="isSAL || isCenterIC" to="/holiday/sal-view" icon="local_activity" label="特別年假" />
        <q-route-tab to="/holiday/al-apply" icon="edit_calendar" label="申請假期">
          <q-badge v-if="$q.screen.gt.xs" color="red" floating
            >{{ ALBalance }}<span v-if="isSAL">+{{ SALBalance }}</span></q-badge
          >
          <q-badge v-else color="red"
            >{{ ALBalance }}<span v-if="isSAL">+{{ SALBalance }}</span></q-badge
          >
        </q-route-tab>
        <q-route-tab to="/holiday/holiday-pending" icon="hourglass_empty" label="待審批">
          <q-badge v-if="$q.screen.gt.xs" color="red" floating>{{ pendingCount }}</q-badge>
          <q-badge v-else color="red">{{ pendingCount }}</q-badge>
        </q-route-tab>
        <q-route-tab
          v-if="isLeaveApprove"
          to="/holiday/holiday-approve"
          icon="approval"
          label="批核假期"
        >
          <q-badge v-if="$q.screen.gt.xs" color="red" floating>{{ pendingALApprovalCount }}</q-badge>
          <q-badge v-else color="red">{{ pendingALApprovalCount }}</q-badge>
        </q-route-tab>
        <q-route-tab v-if="isCenterIC" to="/holiday/sl-report" icon="vaccines" label="病假記錄" />
      </q-tabs>
    </q-page-sticky>
    <q-separator class="q-mt-xl" />

    <router-view class="q-mt-lg q-mb-xl" />

  </q-page>
</template>

<script setup>
import { useStore } from "vuex";
import { leaveCollection, dashboardCollection, usersCollection, FireDB } from "boot/firebase";
import { ref, computed, onUnmounted } from "vue";
import { date as qdate, useQuasar } from "quasar";
import { query, where, onSnapshot, doc, getDoc, Timestamp } from "firebase/firestore"

// unregister listeners
onUnmounted(() => {
  leaveListener.value();
  dashboardListener.value();
  leaveApprovedListener.value();
})

const $q = useQuasar()
const $store = useStore()
// listeners
const leaveListener = ref()
const leaveApprovedListener = ref()
const dashboardListener = ref()
const pendingALApprovalCount = ref(0)
const pendingCount = ref(0)
const systemStartBalance = ref(0)
const totalGain = ref(0)
const holidayCount = ref(0)
const dataBoundary = ref(qdate.endOfDate(new Date(), 'month'))
const systemStart = new Date("2021/04/01");


// computed
const uid = computed(() => $store.getters["userModule/getUID"])
// for debugging
// const uid = ref("egoz4VCb3kSA2NwwT8CyiVSYkv83")

const isLeaveApprove = computed(() => $store.getters["userModule/getLeaveApprove"])
const isSAL = computed(() => $store.getters["userModule/getSAL"])
const isCenterIC = computed(() => $store.getters["userModule/getCenterIC"])
const SALBalance = computed(() => $store.getters["userModule/getSALBalance"])
const ALBalance = computed(() => systemStartBalance.value + totalGain.value - holidayCount.value)


// query
const leaveQuery = query(leaveCollection,
  where("uid", "==", uid.value),
  where("status", "==", "未批"),
)
const dashboardQuery = doc(dashboardCollection, "notification")
const leaveConfigRef = doc(dashboardCollection, "leaveConfig")
const leaveApprovedQuery = query(leaveCollection,
  where("uid", "==", uid.value),
  where("status", "==", "批准"),
  where("type", "==", "AL")
)

// hook listeners
leaveListener.value = onSnapshot(leaveQuery, (snapshot) => {
  pendingCount.value = Object.keys(snapshot.docs).length;
})

dashboardListener.value = onSnapshot(dashboardQuery, (snapshot) => {
  pendingALApprovalCount.value = snapshot.data().leave_waitingForApproval;
});

leaveApprovedListener.value = onSnapshot(leaveApprovedQuery, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type == "added") {
      let d = change.doc.data();
      qdate.isBetweenDates(d.date, systemStart, dataBoundary.value)
        ? (holidayCount.value += 0.5)
        : (holidayCount.value = holidayCount.value);
    } else if (change.type == "removed") {
      let d = change.doc.data();
      qdate.isBetweenDates(d.date, systemStart, dataBoundary.value)
        ? (holidayCount.value -= 0.5)
        : (holidayCount.value = holidayCount.value);
    }
  });
});

getDoc(leaveConfigRef).then((leaveConfigDoc) => {
  getDoc(doc(FireDB, "users", uid.value)).then((userDoc) => {
    systemStartBalance.value = leaveConfigDoc.data()[uid.value][0].al
    const dateOfExit = userDoc.data().employment[userDoc.data().employment.length-1].dateOfExit? new Date(userDoc.data().employment[userDoc.data().employment.length-1].dateOfExit.toDate() - 28800000): null
    // const dateOfEntry = new Date(userDoc.data().employment[0].dateOfEntry.toDate() - 28800000);
    // dateOfEntry no timezone offset
    const dateOfEntry = new Date(userDoc.data().employment[0].dateOfEntry.toDate());

    // let tiers = doc.data()[rank.value]
    let monthEnd = qdate.endOfDate(new Date(), "month");
    dataBoundary.value = dateOfExit && dateOfExit < monthEnd ? dateOfExit : monthEnd

    // begin with system start date
    let monthLoop = systemStart;
    do {
      const yearServed =
        qdate.getDateDiff(
          qdate.endOfDate(monthLoop, "month"),
          dateOfEntry,
          "month"
        ) / 12;
      let currentEmployment
      userDoc.data().employment.forEach((e) => {
        if (new Date(e.dateOfEntry.toDate()-28800000) <= monthLoop && (!e.dateOfExit || new Date(e.dateOfExit.toDate()-28800000) >= monthLoop)) {
          currentEmployment = e
        }
      })

      const tiers = currentEmployment? leaveConfigDoc.data()[currentEmployment.rank]:
        {
          t1: 0,
          t2: 0,
          t3: 0,
          t4: 0,
          t5: 0
        };

      let tier = 0;
      const tiersConfig = [0, 5, 8, 10, 12];
      for (let j = tiersConfig.length; j > 0; j--) {
        if (yearServed >= tiersConfig[j - 1]) {
          tier = tiers["t" + j];
          break;
        }
      }
      let perMonthGain = tier / 12;
      let lastWorkingDate = qdate.addToDate(dataBoundary.value, { days: -1 });

      if (
        qdate.getDateDiff(dataBoundary.value, monthLoop) <
        qdate.daysInMonth(lastWorkingDate)
      ) {
        perMonthGain = 0;
      }
      // debug
      // console.log("dateOfEntry: " + dateOfEntry + "monthLoop:" + monthLoop + ": " + yearServed + ":" + perMonthGain)
      totalGain.value += perMonthGain;
      monthLoop = qdate.addToDate(monthLoop, { month: 1 });
    } while (qdate.getDateDiff(monthLoop, dataBoundary.value, "day") < 0);
  })
})
</script>
