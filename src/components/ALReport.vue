<template>
  <q-page>
    <div class="row">
      <div class="col printOnly text-left caption">長洲鄉事委員會青年綜合服務中心</div>
      <div class="col text-right caption" v-if="reportUser.value != ''">
        職員：{{ reportUser.label }} (入職日期：{{
          qdate.formatDate(dateOfEntry, "DD-MMM-YYYY")
        }})
      </div>
    </div>
    <div class="row">
      <div class="col printOnly text-left caption">職員放取年假紀錄</div>
      <div class="col text-right caption">
        年度：{{ getReportYear }} - {{ getReportYear + 1 }}
      </div>
    </div>

    <q-markup-table class="table">
      <thead>
        <tr>
          <th class="firstColumn">月份</th>
          <th>獲得</th>
          <th>放取</th>
          <th>結餘</th>
          <th class="remarks">備註</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th class="dataField">上年度</th>
          <th class="dataField">-</th>
          <th class="dataField">-</th>
          <th class="dataField">{{ getCarryOver(yearStart) }}</th>
          <th>-</th>
        </tr>
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
            </th>
            <td class="dataField">
              {{ item.perMonthGain }}
            </td>
            <td class="dataField">
              {{ item.leaveTotal }}
            </td>
            <td class="dataField">
              {{ item.al_monthEnd }}
            </td>
            <td class="remarks dataField">
              <div v-if="item.leaveTotal != 0" class="row">
                <q-chip
                  v-for="(leaveItem, key) in item.leaveRecord"
                  v-bind:key="key"
                  size="1vw"
                  color="blue-2"
                  class="col-lg-2 col-md-3 col-sm-4 col-xs-12"
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
        <th class="dataField">{{ totalPerMonthGain() }}</th>
        <th class="dataField">{{ totalLeaveRecord() }}</th>
        <th class="dataField">{{ holidayLeft() }}</th>
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

<script>
import { useStore } from "vuex";
import { usersCollection, leaveConfig, scheduleCollection } from "boot/firebase";
import { computed } from "vue";
import { date as qdate } from "quasar";

export default {
  name: "ALReport",
  props: {
    renderYear: Number,
    renderYearOffset: Number,
    reportUser: {
      value: String,
      label: String,
    },
  },
  data() {
    return {
      holidaySummary: [],
      holidaySummaryLastYear: [],
      al_monthStart: 0,
      dateOfEntry: 0,
      yearStart: 0,
      yearEnd: 0,
      tableFields: ["日期"],
      tableData: [],
      date: [],
      uidMap: [],
      qdate: qdate,
    };
  },
  computed: {
    getReportYear() {
      return this.renderYear + this.renderYearOffset;
    },
  },
  methods: {
    getMonthYear(date) {
      if (typeof date === "function") return;
      return qdate.formatDate(new Date(date), "MM/YYYY");
    },
    totalPerMonthGain() {
      if (this.holidaySummary.length == 0) return;
      let sum = this.holidaySummary.reduce((a, b) => ({
        perMonthGain: a.perMonthGain + b.perMonthGain,
      }));
      return sum.perMonthGain;
    },
    totalLeaveRecord() {
      if (this.holidaySummary.length == 0) return;
      let sum = this.holidaySummary.reduce((a, b) => ({
        leaveTotal: a.leaveTotal + b.leaveTotal,
      }));
      return sum.leaveTotal;
    },
    getCarryOver(yearStart) {
      if (yearStart == 0) return;
      if (this.renderYearOffset + this.renderYear == 2021) {
        return this.al_monthStart;
      } else {
        let i = this.holidaySummary.findIndex(
          (value) =>
            qdate.formatDate(value.date, "MMYYYY") ==
            qdate.formatDate(
              qdate.subtractFromDate(yearStart, { milliseconds: 1 }),
              "MMYYYY"
            )
        );
        if (i > 0) return this.holidaySummary[i].al_monthEnd;
        else return "-";
      }
    },
    totalAnnualLeaveDays(name) {
      let index = this.uidMap.findIndex((element) => element.uid == name);
      if (index == -1) return "總數";
      if (this.tableData.length == 0) return "";
      let sum = this.tableData.reduce((a, b) => ({ [name]: a[name] + b[name] }));
      return sum[name];
    },
    holidayLeft() {
      if (this.holidaySummary.length == 0) return;
      return this.holidaySummary[Object.keys(this.holidaySummary).length - 1].al_monthEnd;
    },
    async renderALTable() {
      this.holidaySummary = [];
      const leaveConfigDoc = await leaveConfig.get();
      const leaveConfigData = leaveConfigDoc.data();
      const now = new Date();
      let reportUserProfile;
      let reportUserDoc;

      if (Object.keys(this.reportUser).length == 0 || this.reportUser.value == "") {
        reportUserDoc = await usersCollection.doc(this.uid).get();
      } else {
        reportUserDoc = await usersCollection.doc(this.reportUser.value).get();
      }

      // console.log(JSON.stringify("reportUser: " + JSON.stringify(this.reportUser)));
      reportUserProfile = reportUserDoc.data();
      this.reportUser.value = reportUserProfile.uid;
      this.reportUser.label = reportUserProfile.name;
      /*
      console.log(
        JSON.stringify("reportUserProfile: " + JSON.stringify(reportUserProfile))
      ); */

      const tiers = leaveConfigData[reportUserProfile.rank];

      const systemStart = qdate.startOfDate(new Date(2021, 3, 1), "month");

      // determine yearly start (1/4 of 2021)
      const thisYearStart =
        now.getMonth() <= 2
          ? qdate.startOfDate(
              new Date(this.renderYear - 1 + this.renderYearOffset, 3, 1),
              "month"
            )
          : qdate.startOfDate(
              new Date(this.renderYear + this.renderYearOffset, 3, 1),
              "month"
            );

      this.yearStart = thisYearStart;

      // set year end at 31/3 of next year
      const thisYearEnd = qdate.endOfDate(
        new Date(thisYearStart.getFullYear() + 1, 2, 31),
        "month"
      );
      this.yearEnd = thisYearEnd;

      const dateOfEntry = reportUserProfile.dateOfEntry.toDate();
      this.dateOfEntry = dateOfEntry;

      // console.log("dateOfEntry: " + dateOfEntry);
      // console.log("thisYearStart: " + thisYearStart);
      // console.log("thisYearEnd: " + thisYearEnd);

      const tiersConfig = [0, 5, 8, 10, 12];

      let al_monthEnd;
      // let monthLoop = thisYearStart;
      let monthLoop = systemStart;

      // if (this.renderYearOffset == 0) {
      al_monthEnd = leaveConfigData.hasOwnProperty(reportUserProfile.uid)
        ? leaveConfigData[reportUserProfile.uid][0].al
        : 0;

      this.al_monthStart = al_monthEnd;
      // carry over from last year
      // pushing last year carry over
      // this.holidaySummaryLastYear[this.renderYearOffset] = {
      /*
        this.holidaySummaryLastYear.push({
          date: monthLoop,
          al_monthEnd: al_monthEnd, // year carry over, for example 28
        });
      } else {
        al_monthEnd = this.holidaySummaryLastYear[this.renderYearOffset].al_monthEnd;
      }
*/
      // get all AL record
      const alScheduleDoc = await scheduleCollection
        .where("uid", "==", reportUserProfile.uid)
        .where("type", "==", "AL")
        .get();
      let alSchedule = [];
      alScheduleDoc.forEach((doc) => {
        let d = doc.data();
        d.date = doc.data().date.toDate();
        alSchedule.push(d);
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
        for (const leave of alSchedule) {
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
            });
            /*
            console.log(
              "alSchedule size before splice: " + Object.keys(alSchedule).length
            );
            alSchedule.splice(alSchedule.indexOf(leave), 1);
            console.log(
              "alSchedule size after splice: " + Object.keys(alSchedule).length
            );
            */
          }
        }
        // console.log("ending alSchedule Loop");
        // console.log("monthLoop:" + monthLoop);
        // update yearServed based on current month and get al entitied
        const yearServed =
          qdate.getDateDiff(qdate.endOfDate(monthLoop, "month"), dateOfEntry, "month") /
          12;

        // console.log("yearServed: " + yearServed);
        let tier = 0;
        for (let j = tiersConfig.length; j > 0; j--) {
          if (yearServed >= tiersConfig[j - 1]) {
            tier = tiers["t" + j];
            break;
          }
        }
        const perMonthGain = tier / 12;

        // set up month start and month end data
        const al_monthStart = al_monthEnd;
        al_monthEnd = al_monthStart - monthlyTotal + perMonthGain;

        this.holidaySummary.push({
          date: qdate.endOfDate(monthLoop, "month"),
          al_monthStart: al_monthStart,
          perMonthGain: perMonthGain,
          leaveTotal: monthlyTotal,
          leaveRecord: monthlyRecord,
          al_monthEnd: al_monthEnd,
        });
        // skip anything in future
        // console.log("monthLoop: " + monthLoop.toString());
        // console.log("thisYearEnd: " + thisYearEnd.toString());
        // if (qdate.getDateDiff(monthLoop, thisYearEnd, "day") > 0) break;
        monthLoop = qdate.addToDate(monthLoop, { month: 1 });
      } while (qdate.getDateDiff(monthLoop, thisYearEnd, "day") < 0);
      /*
      if (Object.keys(this.holidaySummaryLastYear).length <= this.renderYearOffset + 1) {
        this.holidaySummaryLastYear.push({
          date: this.holidaySummary[11].date,
          perMonthGain: this.totalPerMonthGain(),
          leaveTotal: this.totalLeaveRecord(),
          al_monthEnd: this.holidaySummary[11].al_monthEnd,
        });
      }
      */
      //store.dispatch("setALReportHistory", this.holidaySummaryLastYear);
      //console.log("holidaySummary: " + JSON.stringify(this.holidaySummary));
      // this.holidaySummaryLastYear.push(this.holidaySummary);
      // console.log("lastYear:" + JSON.stringify(this.ALReportHistory));
    },
  },
  async mounted() {
    // this.holidaySummaryLastYear = this.ALReportHistory;
    await this.renderALTable();
  },
  setup() {
    const $store = useStore();

    return {
      uid: computed(() => $store.getters["userModule/getUID"]),
      // isSystemAdmin: computed(() => $store.getters["userModule/getSystemAdmin"]),
      // isScheduleModify: computed(() => $store.getters["userModule/getScheduleModify"]),
      // isCenterIC: computed(() => $store.getters["userModule/getCenterIC"]),
    };
  },
};
</script>

<style scoped>
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
    width: 255mm;
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

  .card {
    width: 180mm;
    border: none;
  }

  .card-body {
    border: none;
    padding: 0;
    text-overflow: ellipsis;
  }

  .card-body b-col {
    background-color: whitesmoke !important;
    margin: 0;
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
