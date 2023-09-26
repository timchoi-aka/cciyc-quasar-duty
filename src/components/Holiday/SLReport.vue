<template>
  <q-page>
    <div class="row">
      <div class="col printOnly text-left caption">長洲鄉事委員會青年綜合服務中心</div>
      <div class="col text-right caption" v-if="reportUser.value != ''">
        職員：{{ props.reportUser.label }} (入職日期：{{
          qdate.formatDate(dateOfEntry, "DD-MMM-YYYY")
        }})
      </div>
    </div>
    <div class="row">
      <div class="col printOnly text-left caption">職員放取病假紀錄</div>
      <div class="col caption row q-px-sm">
        <div class="hideOnPrint">備註：
          <q-chip class="bg-blue-2" label="病假"/>
          <q-chip class="bg-red-2" label="特別病假"/>
        </div>
        <q-space/>
        <div class="text-right">年度：{{ getReportYear }} - {{ getReportYear + 1 }}</div>
      </div>
    </div>

    <q-markup-table class="table">
      <thead>
        <tr>
          <th class="firstColumn">月份</th>
          <th class="dataField">放取</th>
          <th class="remarks">備註</th>
        </tr>
      </thead>
      <tbody>
        <template
          v-for="item in holidaySummary"
          v-bind:key="item.date"
          style="display: contents"
        >
          <tr
            v-if="
              qdate.isBetweenDates(item.date, yearStart, yearEnd, {
                inclusiveFrom: true,
                inclusiveTo: true,
              })
            "
          >
            <th class="firstColumn dataField">
              {{ getMonthYear(item.date) }}
              <div v-if="item.lastMonth">
                <span v-html="qdate.formatDate(item.dateOfExit, 'YYYY-MM-DD') + '離職'" />
              </div>
            </th>
            <td class="dataField">
              {{ item.leaveTotal }}
            </td>
            <td class="remarks dataField">
              <div v-if="item.leaveTotal != 0" class="row">
                <q-chip
                  v-for="(leaveItem, key) in item.leaveRecord.filter((x) => x.type == 'SL')"
                  v-bind:key="key"
                  size="1vw"
                  color="blue-2"
                  class="col-lg-2 col-md-3 col-sm-4 col-xs-12 col-3"
                >
                  {{
                    qdate.formatDate(leaveItem.date, "M月D日(ddd)", {
                      daysShort: ["日", "一", "二", "三", "四", "五", "六"],
                    })
                  }}{{ leaveItem.slot }}
                </q-chip>
                <q-chip
                  v-for="(leaveItem, key) in item.leaveRecord.filter((x) => x.type == 'SSL')"
                  v-bind:key="key"
                  size="1vw"
                  color="red-2"
                  class="col-lg-2 col-md-3 col-sm-4 col-xs-12 col-3"
                >
                  {{
                    qdate.formatDate(leaveItem.date, "M月D日(ddd)", {
                      daysShort: ["日", "一", "二", "三", "四", "五", "六"],
                    })
                  }}{{ leaveItem.slot }}
                </q-chip>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
      <tfoot>
        <th class="dataField">本年度</th>
        <th class="dataField">{{ totalLeaveRecord() }}</th>
        <th>-</th>
      </tfoot>
    </q-markup-table>
    <div class="row printOnly" style="margin-top: 1cm">
      <div class="col text-left">
        員工簽署：_________________&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;日期：_________________
      </div>
      <div class="col text-right">
        主管簽署：_________________&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;日期：_________________
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useStore } from "vuex";
import { leaveConfig, scheduleCollection, FireDB } from "boot/firebase";
import { ref, computed } from "vue";
import { date as qdate } from "quasar";
import { getDoc, getDocs, where, query, doc } from "firebase/firestore"

// props
const props = defineProps({
  renderYear: Number,
  renderYearOffset: Number,
  reportUser: {
    value: String,
    label: String,
  }
})

// variables
const $store = useStore()
const holidaySummary = ref([])
const sl_monthStart = ref(0)
const dateOfEntry = ref(0)
const dateOfExit = ref(0)
const yearStart = ref(0)
const yearEnd = ref(0)
const tableFields = ref(["日期"])
const tableData = ref([])
const date = ref([])
const uidMap = ref([])


// computed
const getReportYear = computed(() => props.renderYear + props.renderYearOffset -1)
const uid = computed(() => $store.getters["userModule/getUID"])
const reportUser = computed(() => Object.keys(props.reportUser).length || props.reportUser.value ? props.reportUser.value: uid.value)

// functions
function getMonthYear(date) {
  if (typeof date === "function") return;
  return qdate.formatDate(new Date(date), "MM/YYYY");
}

function totalLeaveRecord() {
  if (holidaySummary.value.length == 0) return;
  let recordStart = qdate.buildDate({
    year: getReportYear.value,
    month: 4,
    day: 1,
  });
  let recordEnd = qdate.subtractFromDate(qdate.addToDate(recordStart, { years: 1 }), {
    milliseconds: 1,
  });

  return holidaySummary.value
    .filter((row) => qdate.isBetweenDates(row.date, recordStart, recordEnd))
    .reduce((a, b) => a + b.leaveTotal, 0);
}

function totalAnnualLeaveDays(name) {
  let index = uidMap.value.findIndex((element) => element.uid == name);
  if (index == -1) return "總數";
  if (tableData.value.length == 0) return "";
  let sum = tableData.value.reduce((a, b) => ({ [name]: a[name] + b[name] }));
  return sum[name];
}

getDoc(leaveConfig).then((leaveDoc) => {
  const leaveConfigData = leaveDoc.data()
  const now = new Date();
  const systemStart = qdate.startOfDate(new Date(2021, 3, 1), "month");

  getDoc(doc(FireDB, 'users', reportUser.value)).then((reportUserDoc)=> {
    // console.log(JSON.stringify("reportUser: " + JSON.stringify(this.reportUser)));
    const reportUserProfile = reportUserDoc.data();
    const tiers = leaveConfigData[reportUserProfile.rank];

    // determine yearly start (1/4 of 2021)
    yearStart.value =
        now.getMonth() <= 2
          ? qdate.startOfDate(
              new Date(props.renderYear - 1 + props.renderYearOffset, 3, 1),
              "month"
            )
          : qdate.startOfDate(
              new Date(props.renderYear + props.renderYearOffset, 3, 1),
              "month"
            );

     // set year end at 31/3 of next year
     yearEnd.value = qdate.endOfDate(
        new Date(yearStart.value.getFullYear() + 1, 2, 31),
        "month"
      );
    //this.reportUser.value = reportUserProfile.uid;
    //this.reportUser.label = reportUserProfile.name;

    dateOfEntry.value = reportUserProfile.employment[0].dateOfEntry.toDate();
    dateOfExit.value = reportUserProfile.employment[reportUserProfile.employment.length-1].dateOfExit
        ?.toDate()
        ?? new Date("9999/12/31");
     // console.log("dateOfEntry: " + dateOfEntry.value);
     // console.log("thisYearStart: " + yearStart.value);
     // console.log("thisYearEnd: " + yearEnd.value);

    const tiersConfig = [0, 5, 8, 10, 12];

    let sl_monthEnd;
    let monthLoop = systemStart;

    // if (props.renderYearOffset == 0) {
    sl_monthEnd = leaveConfigData.hasOwnProperty(reportUserProfile.uid)
      ? leaveConfigData[reportUserProfile.uid][0].al
      : 0;

    sl_monthStart.value = sl_monthEnd;
    // carry over from last year
    // pushing last year carry over
    // holidaySummary.valueLastYear[props.renderYearOffset] = {

    //  holidaySummary.valueLastYear.push({
    //    date: monthLoop,
    //    sl_monthEnd: sl_monthEnd, // year carry over, for example 28
    //  });
    //} else {
    //  sl_monthEnd = holidaySummary.valueLastYear[props.renderYearOffset].sl_monthEnd;
    //}


    // get all SL record
    const slScheduleQuery = query(scheduleCollection,
      where("uid", "==", reportUserProfile.uid),
      where("type", "in", ['SL', 'SSL'])
    )

    getDocs(slScheduleQuery).then((slScheduleDoc) => {
      let slSchedule = [];
      slScheduleDoc.forEach((doc) => {
        let d = doc.data();
        d.date = doc.data().date.toDate();
        slSchedule.push(d);
      });

      // console.log("start monthLoop 1:" + monthLoop.toString());
      // console.log("start monthLoop 2:" + monthLoop.toString());

      // loop for this year and add holiday to holidayRemains
      do {
        //for (let i = 0; i < 12; i++) {
        // console.log("looping i: " + i);
        // console.log("monthLoop: " + monthLoop.toString());
        // console.log("alSchedule:" + JSON.stringify(alSchedule));
        // temporary variables to store leave of current looping month
        let monthlyTotal = 0;
        let monthlyRecord = [];
        // console.log("starting alSchedule Loop");
        for (const leave of slSchedule) {
          // loop all al schedules, find those within this month and update this month record

          if (
            leave.date.getFullYear() == monthLoop.getFullYear() &&
            leave.date.getMonth() == monthLoop.getMonth()
          ) {
            monthlyTotal += 0.5;

            // replace by slotmap
            let slot;
            switch (leave.slot) {
              case "slot_a":
                slot = "(早)";
                break;
              case "slot_b":
                slot = "(午)";
                break;
              case "slot_c":
                slot = "(晚)";
                break;
            }
            monthlyRecord.push({
              date: leave.date,
              slot: slot,
              type: leave.type
            });

            //console.log(
            //  "alSchedule size before splice: " + Object.keys(alSchedule).length
            //);
            //alSchedule.splice(alSchedule.indexOf(leave), 1);
            //console.log(
            //  "alSchedule size after splice: " + Object.keys(alSchedule).length
            //);
          }
        }
        // console.log("ending alSchedule Loop");
        // console.log("monthLoop:" + monthLoop);
        // update yearServed based on current month and get al entitied
        const yearServed =
          qdate.getDateDiff(qdate.endOfDate(monthLoop, "month"), dateOfEntry.value, "month") /
          12;

        //console.log("yearServed: " + yearServed);

        let lastMonth = false;
        let lastWorkingDate = qdate.addToDate(dateOfExit.value, { days: -1 });

        if (
          qdate.getDateDiff(dateOfExit.value, monthLoop) <
          qdate.daysInMonth(lastWorkingDate)
        ) {
          lastMonth = true;
        }


        holidaySummary.value.push({
          date: qdate.endOfDate(monthLoop, "month"),
          leaveTotal: monthlyTotal,
          leaveRecord: monthlyRecord,
          lastMonth: lastMonth,
          dateOfExit: dateOfExit.value,
        });
        // skip anything in future
        // console.log("monthLoop: " + monthLoop.toString());
        // console.log("thisYearEnd: " + thisYearEnd.toString());
        // if (qdate.getDateDiff(monthLoop, thisYearEnd, "day") > 0) break;
        monthLoop = qdate.addToDate(monthLoop, { month: 1 });
      } while (
        qdate.getDateDiff(monthLoop, yearEnd.value, "day") < 0 &&
        monthLoop <= dateOfExit.value
      );

      //if (Object.keys(holidaySummary.valueLastYear).length <= props.renderYearOffset + 1) {
      //  holidaySummary.valueLastYear.push({
      //    date: holidaySummary.value[11].date,
      //    perMonthGain: this.totalPerMonthGain(),
      //    leaveTotal: this.totalLeaveRecord(),
      //    al_monthEnd: holidaySummary.value[11].al_monthEnd,
      //  });
      //}

      //store.dispatch("setALReportHistory", holidaySummary.valueLastYear);
      //console.log("holidaySummary: " + JSON.stringify(holidaySummary.value));
      // holidaySummary.valueLastYear.push(holidaySummary.value);

    })
  })
})
</script>

<style lang="scss" scoped>
@media screen {
  .table {
    border: 1px solid black;
    border-collapse: collapse;
    min-width: 95%;
    font-size: 1.3vw;
  }

  .table th,
  td {
    border: 1px solid black;
    text-align: center;
  }

  .table span {
    border-collapse: collapse;
  }

  .table th.firstColumn,
  td.firstColumn {
    border: 1px solid black;
    width: 8%;
    min-width: 8%;
  }

  .dataField {
    vertical-align: middle;
    text-align: center;
    width: 8%;
    min-width: 8%;
  }

  .table th.remarks,
  td.remarks {
    width: 60%;
    font-size: 1.4vw;
  }

  .printOnly {
    display: none;
  }
}

@page {
  size: A4;
  margin: 2cm;

  @bottom-center {
    content: "第" counter(page) "/" counter(pages) "頁";
    font-size: 10pt;
  }
}

@media print {
  .table {
    width: 240mm;
    border-collapse: collapse;
  }
  .btn {
    display: none;
  }
  .table thead th {
    background-color: lightgray !important;
  }

  .table td,
  th {
    padding: 0 1mm 0 1mm;
    border: 1px solid black !important;
  }

  .dataField {
    vertical-align: middle;
    text-align: center;
  }


  .sign {
    margin-top: 60px;
    font-size: 1.3em;
  }

  .hideOnPrint {
    display: none;
  }
}

.caption {
  font-size: 1.2em;
  color: black;
}

.bold {
  font-weight: bold;
}
</style>
