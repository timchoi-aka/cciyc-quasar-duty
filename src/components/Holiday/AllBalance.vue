<template>
  <q-card class="q-pa-none">
    <q-card-section class="bg-primary text-white q-px-md row">
      <div :class="[$q.screen.lt.md? 'text-body1': 'text-h4', 'col-shrink']">全體員工假期結餘表</div>
      <q-space />
      <div class="col-shrink">
        <q-btn
          icon="cancel"
          flat
          dense
          text-color="white"
          v-close-popup
        />
      </div>
    </q-card-section>

    <q-card-section>
      <q-table
        class="col"
        dense
        flat
        :rows="tableRow"
        :columns="columns"
        :pagination="pagination"
        :hide-bottom="true"
        separator="cell"
        color="primary"
        row-key="uid"
      >
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed } from "vue"
import { getDoc, getDocs, where, query, orderBy } from "firebase/firestore"
import { leaveCollection, leaveConfig, usersCollection } from "boot/firebase"
import { date as qdate } from "quasar"

// props
const props = defineProps({
  renderDate: Date
})

// variables
const balance = ref([])

// table config
const pagination = ref({
  rowsPerPage: 40,
})

const columns = ref([
  {
    name: "name",
    label: "員工",
    field: "name",
    style: "font-size: 2.5vw; text-align: center",
    headerStyle: "font-size: 2.5vw; text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "month",
    label: "本月年假",
    field: "month",
    style: "font-size: 2.5vw; text-align: center",
    headerStyle: "font-size: 2.5vw; text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "year",
    label: "年尾年假",
    field: "year",
    style: "font-size: 2.5vw; text-align: center",
    headerStyle: "font-size: 2.5vw; text-align: center;",
    headerClasses: "bg-grey-2",
  },

  {
    name: "salBalance",
    label: "特別年假",
    field: "salBalance",
    style: "font-size: 2.5vw; text-align: center",
    headerStyle: "font-size: 2.5vw; text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "otBalance",
    label: "超時結餘（小時）",
    field: "otBalance",
    style: "font-size: 2.5vw; text-align: center",
    headerStyle: "font-size: 2.5vw; text-align: center;",
    headerClasses: "bg-grey-2",
  },
])

// computed
const periodEnd = computed(() => props.renderDate? props.renderDate.getMonth() < 3? 
                                  qdate.buildDate({
                                    year: props.renderDate.getFullYear(),
                                    month: 3,
                                    days: 31,
                                    hours: 23,
                                    minutes: 59,
                                    seconds: 59,
                                    millisecond: 999,
                                  }) :
                                  qdate.buildDate({
                                    year: props.renderDate.getFullYear() + 1,
                                    month: 3,
                                    days: 31,
                                    hours: 23,
                                    minutes: 59,
                                    seconds: 59,
                                    millisecond: 999,
                                  }) : 0)

const tableRow = computed(() => {
  let result = []
  let yearlyResult = balance.value.filter(a => qdate.formatDate(a.month, "YYYYMMDD") == qdate.formatDate(qdate.subtractFromDate(periodEnd.value, {hour: 8}), "YYYYMMDD"))
  let monthlyResult = balance.value.filter(a => qdate.formatDate(a.month, "YYYYMMDD") == qdate.formatDate(qdate.endOfDate(props.renderDate, 'month'), "YYYYMMDD"))
  
  balance.value.forEach((record) => {
    let i = result.findIndex((element) => element.uid == record.uid)
    if (i == -1) {
      let j = monthlyResult.findIndex((monthlyElement) => monthlyElement.uid == record.uid)
      let k = yearlyResult.findIndex((yearlyElement) => yearlyElement.uid == record.uid)
      if (j != -1 && k != -1) {
        result.push({
          uid: record.uid,
          name: record.name,
          month: monthlyResult[j].systemStartBalance + monthlyResult[j].totalGain - monthlyResult[j].totalALTaken,
          year: yearlyResult[k].systemStartBalance + yearlyResult[k].totalGain - yearlyResult[k].totalALTaken,
          salBalance: record.salBalance,
          otBalance: record.otBalance
        })
      }
    }
  })
  return result
})

// query
const usersQuery = query(usersCollection,
  where("privilege.systemAdmin", "==", false),
  where("privilege.tmp", "==", false),
  where("enable", "==", true),
  orderBy("order")
)

// get user data
getDocs(usersQuery).then((userDocs) => {
  userDocs.forEach((userDoc) => {
    const uid = userDoc.data().uid
    const name = userDoc.data().name
    const rank = userDoc.data().rank
    const isParttime = userDoc.data().parttime? userDoc.data().parttime: false
    const salBalance = userDoc.data().balance.sal
    const otBalance = userDoc.data().balance.ot
    const dateOfExit = userDoc.data().dateOfExit ? userDoc.data().dateOfExit.toDate() : null;
    const dateOfEntry = userDoc.data().dateOfEntry.toDate();

    // get leaveConfig
    getDoc(leaveConfig).then((leaveConfigDoc) => {
      const leaveConfigData = leaveConfigDoc.data();
      const tiers = leaveConfigData[rank];
      // get AL starting balance
      const systemStartBalance = leaveConfigData[uid]? leaveConfigData[uid][0].al: 0
      // determine year end
      const now = new Date();    
      
      // determine data retrieval boundary combining periodEnd and dateOfExit
      const dataBoundary =
        dateOfExit && dateOfExit < periodEnd.value
          ? qdate.subtractFromDate(dateOfExit, { milliseconds: 1 })
          : periodEnd.value;

      const leaveDocQuery = query(leaveCollection, 
        where("uid", "==", uid),
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
        
        let monthLoop = systemStart;
        do {
          
          const yearServed =
            qdate.getDateDiff(
              qdate.endOfDate(monthLoop, "month"),
              dateOfEntry,
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
          let perMonthGain = isParttime? tier/2/12: tier / 12;
          
          if (
            monthLoop == systemStart || (qdate.formatDate(dataBoundary, "YYYYMMDD") != qdate.formatDate(qdate.endOfDate(dataBoundary, 'month'), "YYYYMMDD") && qdate.getDateDiff(dataBoundary, monthLoop) <
            qdate.daysInMonth(monthLoop) - 1)
          ) {
            perMonthGain = 0;
          }
          totalGain += perMonthGain;
          totalALTaken = leaveData.filter(a => qdate.isBetweenDates(a.date, systemStart, monthLoop)).length / 2
          monthlyALTaken = leaveData.filter(a => qdate.isBetweenDates(a.date, qdate.startOfDate(monthLoop, "month"), qdate.endOfDate(monthLoop, "month"))).length / 2
          balance.value.push({
            uid: uid,
            name: name,
            systemStartBalance: systemStartBalance,
            month: monthLoop,
            perMonthGain: perMonthGain,
            totalGain: totalGain,
            monthlyALTaken: monthlyALTaken,
            totalALTaken: totalALTaken,
            salBalance: salBalance,
            otBalance: otBalance
          })
          monthLoop = qdate.endOfDate(qdate.addToDate(monthLoop, { month: 1 }), 'month')
        } while (qdate.getDateDiff(monthLoop, dataBoundary, "day") <= 0);
      })
    })
  })
})

</script>