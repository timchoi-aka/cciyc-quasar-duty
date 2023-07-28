<template>
  <q-page>
    <!-- All staff annual balance dialog -->
    <q-dialog v-model="showAllBalanceModal" full-width>
      <AllBalance :renderDate="renderDate"/>
    </q-dialog>

    <!-- toolbar -->
    <div class="full-width row justify-between q-px-sm">
      <div class="col-md-4 col-lg-4 col-xl-4 col-xs-12 col-sm-6 q-my-sm">
        <q-btn
          size="lg"
          outline
          color="primary"
          v-on:click="changeRenderYear(-1)"
          class="q-mx-sm q-pa-sm"
        >
          上年
        </q-btn>

        <q-btn
          size="lg"
          class="q-mx-sm q-pa-sm"
          outline
          color="primary"
          v-on:click="changeRenderYear(1)"
        >
          下年
        </q-btn>

        <q-btn
          v-if="isLeaveApprove"
          size="lg"
          class="q-mx-sm q-pa-sm"
          outline
          color="primary"
          v-on:click="showAllBalanceModal = true"
        >
          全體結餘
        </q-btn>
      </div>
      <q-space class="col" />
      <div class="row col-md-5 col-lg-5 col-xl-5 col-sm-6 col-xs-12">
        <div class="q-mr-sm col">
          本月結餘
          <q-knob
            :min="0"
            :max="100"
            readonly
            v-model="monthlyBalance"
            show-value
            :thickness="0.22"
            color="primary"
            track-color="grey-3"
          />
        </div>
        <div class="q-mr-sm col">
          年度結餘
          <q-knob
            :min="0"
            :max="100"
            readonly
            :model-value="annualBalance"
            show-value
            :thickness="0.22"
            color="primary"
            track-color="grey-3"
          />
        </div>
        <div v-if="isSAL" class="col">
          特別結餘
          <q-knob
            :min="0"
            readonly
            :model-value="sal_balance"
            show-value
            :thickness="0.22"
            color="primary"
            track-color="grey-3"
          />
        </div>
      </div>
    </div>
    <div class="row q-mx-xs justify-center">
      <ALApply :renderDate="renderDate" :renderYearOffset="renderYearOffset" :key="renderDate + renderYearOffset"/>
    </div>
  </q-page>
</template>

<script setup>
import { useStore } from "vuex";
import { ref, computed } from "vue"
import ALApply from "components/Holiday/ALApply"
import AllBalance from "components/Holiday/AllBalance.vue"
import { getDoc, getDocs, where, query, doc } from "firebase/firestore"
import { FireDB, leaveCollection, leaveConfig } from "boot/firebase"
import { date as qdate } from "quasar"

// variables
const $store = useStore();
const renderDate = ref(new Date())
const renderYearOffset = ref(0)
const balance = ref([])
const showAllBalanceModal = ref(false)

// computed
const isLeaveApprove = computed(() => $store.getters["userModule/getLeaveApprove"])
const sal_balance = computed(() => $store.getters["userModule/getSALBalance"])
const uid = computed(() => $store.getters["userModule/getUID"])
//const uid = ref("egoz4VCb3kSA2NwwT8CyiVSYkv83")
const isSAL = computed(() => $store.getters["userModule/getSAL"])
const annualBalance = computed(() => balance.value.length? balance.value[balance.value.length -1].systemStartBalance + balance.value[balance.value.length -1].totalGain - balance.value[balance.value.length -1].totalALTaken: 0)
const monthlyBalance = computed(() => {
  const monthEnd = qdate.endOfDate(new Date(), 'month')
  if (balance.value.length) {
    let i = balance.value.findIndex((element) => qdate.formatDate(element.month, "YYYYMMDD") == qdate.formatDate(monthEnd, "YYYYMMDD"))
    if (i >= 0) return balance.value[i].systemStartBalance + balance.value[i].totalGain - balance.value[i].totalALTaken
    else return 0
  } else return 0
})
const periodEnd = computed(() => (new Date()).getMonth() < 3?
                                  qdate.buildDate({
                                    year: (new Date()).getFullYear(),
                                    month: 3,
                                    days: 31,
                                    hours: 23,
                                    minutes: 59,
                                    seconds: 59,
                                    millisecond: 999,
                                  }) :
                                  qdate.buildDate({
                                    year: (new Date()).getFullYear() + 1,
                                    month: 3,
                                    days: 31,
                                    hours: 23,
                                    minutes: 59,
                                    seconds: 59,
                                    millisecond: 999,
                                  }))

// function
function changeRenderYear(years) {
  // proceed year change if it is not before 2021 where system start
  if (renderDate.value.getFullYear() + renderYearOffset.value + years >= 2021) {
    renderYearOffset.value += years;
  }
}

// get user data
getDoc(doc(FireDB, "users", uid.value)).then((userDoc) => {
  // const rank = userDoc.data().rank;
  const dateOfExit = userDoc.data().employment[userDoc.data().employment.length-1].dateOfExit? new Date(userDoc.data().employment[userDoc.data().employment.length-1].dateOfExit.toDate() - 28800000): null
  //const dateOfEntry = new Date(userDoc.data().employment[0].dateOfEntry.toDate() - 28800000);
  const dateOfEntry = new Date(userDoc.data().employment[0].dateOfEntry.toDate())// no offset

  // get leaveConfig
  getDoc(leaveConfig).then((leaveConfigDoc) => {
    const leaveConfigData = leaveConfigDoc.data();

    // get AL starting balance
    const systemStartBalance = leaveConfigData[uid.value][0].al;
    // determine year end
    const now = new Date();
    // console.log("systemStartBalance:" + systemStartBalance)
    // determine data retrieval boundary combining periodEnd and dateOfExit
    const dataBoundary =
      dateOfExit && dateOfExit < periodEnd.value
        ? qdate.subtractFromDate(dateOfExit, { milliseconds: 1 })
        : periodEnd.value;

    const leaveDocQuery = query(leaveCollection,
      where("uid", "==", uid.value),
      where("status", "==", "批准"),
      where("type", "==", "AL")
    )

    getDocs(leaveDocQuery).then((leaveDocData) => {
      let leaveData = [];
      leaveDocData.forEach((doc) => {
        let d = new Date(doc.data().date);
        if (d - qdate.addToDate(dataBoundary, {hour: 8}) < 0) {
          leaveData.push(doc.data());
        }
      });
      //console.log("leaveData:" + leaveData.map(a=>a.date))
      let totalGain = 0
      let totalALTaken = 0
      let monthlyALTaken = 0

      // begin with system start date
      let systemStart = qdate.buildDate({
        year: 2021,
        month: 3,
        day: 31,
        hour: 23,
        minutes: 59,
        second: 59,
        millisecond: 999
      })
      //console.log("systemStart:" + systemStart)
      let monthLoop = systemStart;
      do {
        //console.log("dateOfEntry:" + dateOfEntry)
        const yearServed =
          qdate.getDateDiff(
            qdate.endOfDate(monthLoop, "month"),
            dateOfEntry,
            "month"
          ) / 12;
        // console.log("yearServed:" + yearServed)
        let currentEmployment
        userDoc.data().employment.forEach((employment) => {
          if (new Date(employment.dateOfEntry.toDate()-28800000) <= monthLoop && (!employment.dateOfExit || new Date(employment.dateOfExit.toDate()-28800000) >= monthLoop)) {
            currentEmployment = employment
          }
        })

        const tiers = currentEmployment? leaveConfigData[currentEmployment.rank]:
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
        if (
            monthLoop == systemStart || (qdate.formatDate(dataBoundary, "YYYYMMDD") != qdate.formatDate(qdate.endOfDate(dataBoundary, 'month'), "YYYYMMDD") && qdate.getDateDiff(dataBoundary, monthLoop) <
            qdate.daysInMonth(monthLoop) - 1)
        ) {
          perMonthGain = 0;
        }
        // debug log
        // console.log("monthLoop: " + monthLoop + " perMonthGain: " + perMonthGain + " tier: " + tier + " yearServed: " + yearServed + " dateOfEntry: " + dateOfEntry)
        totalGain += perMonthGain;
        totalALTaken = leaveData.filter(a => qdate.isBetweenDates(a.date, systemStart, monthLoop)).length / 2
        monthlyALTaken = leaveData.filter(a => qdate.isBetweenDates(a.date, qdate.startOfDate(monthLoop, "month"), qdate.endOfDate(monthLoop, "month"))).length / 2
        balance.value.push({
          uid: uid.value,
          systemStartBalance: systemStartBalance,
          month: monthLoop,
          perMonthGain: perMonthGain,
          totalGain: totalGain,
          monthlyALTaken: monthlyALTaken,
          totalALTaken: totalALTaken
        })
        monthLoop = qdate.endOfDate(qdate.addToDate(monthLoop, { month: 1 }), 'month')
      } while (qdate.getDateDiff(monthLoop, dataBoundary, "day") <= 0);
    })
  })
})
</script>
