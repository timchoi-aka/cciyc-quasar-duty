<template>
  <q-page>
    <div class="row">
      <div class="col printOnly text-left caption">長洲鄉事委員會青年綜合服務中心</div>
      <div class="col text-right caption">職員：{{ reportUser.label }}</div>
    </div>
    <div class="row">
      <div class="col printOnly text-left caption">職員放取年假紀錄</div>
      <div class="col text-right caption">
        年度：{{ getReportYear }} - {{ getReportYear + 1 }}
      </div>
    </div>
    ALReport - {{ reportUser }} {{ renderYear }} {{ renderYearOffset }} HolidaySummary -
    {{ holidaySummary }}
    <table class="table">
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
          <th class="dataField">{{ getHolidaySummaryLastYear("perMonthGain") }}</th>
          <th class="dataField">{{ getHolidaySummaryLastYear("leaveTotal") }}</th>
          <th class="dataField">{{ getHolidaySummaryLastYear("al_monthEnd") }}</th>
          <th>-</th>
        </tr>
        <tr v-for="item in holidaySummary" v-bind:key="item.date">
          <th class="firstColumn dataField">{{ getMonthYear(item.date) }}</th>
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
            <div v-if="item.leaveTotal != 0">
              <q-expansion-item expand-separator :label="item.leaveTotal">
                <q-card>
                  <q-card-section>
                    <q-chip
                      v-for="(leaveItem, key) in item.leaveRecord"
                      v-bind:key="key"
                      color="blue-2"
                      class="col"
                    >
                      {{ formatDate(leaveItem.date) }}{{ leaveItem.slot }}
                    </q-chip>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </div>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <th class="dataField">本年度</th>
        <th class="dataField">{{ totalPerMonthGain() }}</th>
        <th class="dataField">{{ totalLeaveRecord() }}</th>
        <th class="dataField">{{ holidayLeft() }}</th>
        <th>-</th>
      </tfoot>
    </table>
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
// import moment from "moment";
import { useStore } from "vuex";
import { usersCollection, leaveConfig, scheduleCollection } from "boot/firebase";
import { computed } from "vue";
import date from "src/lib/date.js";

export default {
  name: "ALReport",
  props: {
    renderYear: Number,
    renderYearOffset: Number,
    reportUser: String,
  },
  data() {
    return {
      holidaySummary: [],
      holidaySummaryLastYear: [],
      tableFields: ["日期"],
      tableData: [],
      date: [],
      uidMap: [],
    };
  },
  computed: {
    // ...mapState(["ALReportHistory"]),
    getReportYear() {
      return this.renderYear + this.renderYearOffset;
    },
  },
  created() {
    this.daysOfWeek = date.daysOfWeek.bind(this);
    this.formatDate = date.formatDate.bind(this);
    this.mergeDateSlot = date.mergeDateSlot.bind(this);
    this.splitDateSlot = date.splitDateSlot.bind(this);
  },
  methods: {
    getMonthYear(date) {
      if (typeof date === "function") return;
      const data = moment.utc(new Date(date));
      return data.format("MM/YYYY");
    },
    DateToSerial(date) {
      const d = new Date(date);
      return d.getTime();
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
    getHolidaySummaryLastYear(param) {
      // console.log("this.holidaySummaryLastYear.length:" + this.holidaySummaryLastYear.length);
      /*
      if (this.holidaySummaryLastYear.length > 0) {
        return this.holidaySummaryLastYear[this.renderYearOffset][param];
      } else return "-";
      */
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
    printableDate(date) {
      let d = new Date(Number(Date.parse(date)));
      let result = d.getMonth() + 1 + "月" + d.getDate() + "日";
      return result;
    },
    async renderALTable() {
      // console.log(this.renderYear + "" + this.renderYearOffset + this.reportUserID + this.reportUsername);
      // clear store data
      // store.dispatch("setALReportHistory", []);
      this.holidaySummary = [];
      const leaveConfigDoc = await leaveConfig.get();
      const leaveConfigData = leaveConfigDoc.data();
      const now = new Date();
      let reportUserProfile;
      let reportUserDoc;
      // console.log("uid: " + this.uid);
      // console.log("reportUser: " + this.reportUser);
      if (this.reportUser == "") {
        reportUserDoc = await usersCollection.doc(this.uid).get();
      } else {
        reportUserDoc = await usersCollection.doc(this.reportUser).get();
      }
      console.log("reportUserDoc: " + this.reportUserDoc);
      reportUserProfile = reportUserDoc.data();
      const tiers = leaveConfigData[reportUserProfile.rank];

      // determine yearly start (31/3 of every year)
      let thisYearStart;
      if (now.getMonth() >= 3) {
        thisYearStart = new Date(now.getFullYear() + this.renderYearOffset, 2, 31);
      } else {
        thisYearStart = new Date(now.getFullYear() - 1 + this.renderYearOffset, 2, 31);
      }

      const thisYearEnd = new Date(thisYearStart.year() + 1, 2, 31);
      const dateOfEntry = new Date(reportUserProfile.dateOfEntry);
      console.log("dateOfEntry: " + dateOfEntry);
      console.log("thisYearStart: " + thisYearStart);
      console.log("thisYearStart: " + thisYearStart);

      const tiersConfig = [0, 5, 8, 10, 12];

      let al_monthEnd;
      let monthLoop = thisYearStart;

      if (this.renderYearOffset == 0) {
        al_monthEnd = leaveConfigData[reportUserProfile.uid][0].al; // carry over from last year
        // pushing last year carry over
        this.holidaySummaryLastYear[this.renderYearOffset] = {
          date: monthLoop.toString(),
          al_monthEnd: al_monthEnd, // year carry over, for example 28
        };
      } else {
        al_monthEnd = this.holidaySummaryLastYear[this.renderYearOffset].al_monthEnd;
      }

      // monthLoop.add(1, "M");
      // get all AL record of this user
      const alScheduleDoc = await scheduleCollection
        .where("uid", "==", reportUserProfile.uid)
        .where("type", "==", "AL")
        // .where("date", ">", thisYearStart.utc().toDate())
        // .where("date", "<=", thisYearEnd.utc().toDate())
        .get();
      let alSchedule = [];
      alScheduleDoc.forEach((doc) => {
        let d = doc.data();
        d.date = moment.utc(doc.data().date.toMillis());
        alSchedule.push(d);
      });

      //console.log("start monthLoop 1:" + monthLoop.toString());
      // console.log("start monthLoop 2:" + monthLoop.toString());

      // loop for this year and add holiday to holidayRemains
      for (let i = 0; i < 12; i++) {
        // console.log("looping i: " + i);
        // console.log("monthLoop: " + monthLoop.toString());
        // console.log("alSchedule:" + JSON.stringify(alSchedule));
        // temporary date sturcture to store leave of current looping month
        // let monthlyLeaveData = {
        let monthlyTotal = 0;
        let monthlyRecord = [];
        // };
        for (const leave of alSchedule) {
          // loop all al schedules, find those within this month and update this month record
          if (
            leave.date.year() == monthLoop.year() &&
            leave.date.month() == monthLoop.month()
          ) {
            monthlyTotal += 0.5;
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
          }
        }

        // update yearServed based on current month and get al entitied
        const yearServed = monthLoop.endOf("month").diff(dateOfEntry, "years");
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
          date: monthLoop.endOf("month").toString(),
          al_monthStart: al_monthStart,
          perMonthGain: perMonthGain,
          leaveTotal: monthlyTotal,
          leaveRecord: monthlyRecord,
          al_monthEnd: al_monthEnd,
        });
        // skip anything in future
        // console.log("monthLoop: " + monthLoop.toString());
        // console.log("thisYearEnd: " + thisYearEnd.toString());
        if (monthLoop.isAfter(thisYearEnd)) break;
        monthLoop.add(1, "M");
      }
      this.holidaySummaryLastYear[this.renderYearOffset + 1] = {
        date: this.holidaySummary[11].date,
        perMonthGain: this.totalPerMonthGain(),
        leaveTotal: this.totalLeaveRecord(),
        al_monthEnd: this.holidaySummary[11].al_monthEnd,
      };
      //store.dispatch("setALReportHistory", this.holidaySummaryLastYear);
      // console.log("lastYear:" + JSON.stringify(this.ALReportHistory));
    },
  },
  async mounted() {
    this.holidaySummaryLastYear = this.ALReportHistory;
    /*
    // setup date scope
    let startOfMonth = new Date(this.renderDate.getFullYear(), this.renderDate.getMonth(), 1, 8, 0, 0);
    let endOfMonth = new Date(this.renderDate.getFullYear(), this.renderDate.getMonth() + 1, 0, 8, 0, 0);
    let queryStartDate = startOfMonth;
    let queryEndDate = new Date(endOfMonth.getTime() + 86399000); // offset 23:59:59

    // load users data
    const userDoc = await usersCollection
      .where("privilege.systemAdmin", "==", false)
      .where("privilege.sal", "==", true)
      .orderBy("order").get();


    // build users list and uidMapping
    userDoc.forEach((doc) => {
      // build tableFields
      this.tableFields.push({
        key: doc.id,
        label: doc.data().name,
      });

      // build uidMap
      this.uidMap.push({
        uid: doc.id,
        name: doc.data().name,
      });
    });

    // load AL date within this month
    const scheduleDoc = await scheduleCollection
      .where("date", ">=", queryStartDate)
      .where("date", "<=", queryEndDate)
      .where("type", "==", "SAL").get();

    const schedules = [];
    scheduleDoc.forEach((doc) => {
      const d = doc.data();
      d.date = d.date.toDate();
      schedules.push(d);
    })

    // load days of the month and user name into table, initialize to 0 ALs
    for (let i = 1; i <= 31; i++) {
      let curDate = new Date(this.renderDate.getFullYear(), this.renderDate.getMonth(), i);
      if (curDate > endOfMonth) break;
      this.tableData.push({
        日期: this.printableDate(curDate),
      })
      this.uidMap.forEach((user)=> {
        const uid = user.uid;
        const curDateCount = schedules.reduce((sum,value) => ((this.printableDate(value.date) == this.printableDate(curDate) && value.uid == user.uid) ? sum+0.5: sum), 0);
        this.tableData[this.tableData.length-1].[uid] = curDateCount;
      })
    }
    */
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
  }

  .table th,
  td {
    border: 1px solid black;
    width: 5%;
  }

  .table th.firstColumn,
  td.firstColumn {
    border: 1px solid black;
    width: 8%;
  }

  .table th.remarks,
  td.remarks {
    width: 50%;
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
