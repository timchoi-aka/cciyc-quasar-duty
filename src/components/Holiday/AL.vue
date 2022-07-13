<template>
  <q-page>
    <q-table
      dense
      flat
      :title="renderDate.getFullYear() + '年年假表'"
      :rows="tableData"
      :columns="tableFields"
      :pagination="defaultPagination"
      :hide-bottom="true"
      separator="cell"
      color="primary"
      row-key="name"
    >
      <!-- date column -->
      <template v-slot:body-cell-Date="props">
        <q-td
          style="font-size: 2vw; text-align: center"
          v-if="$q.screen.lt.sm"
          :class="[getHoliday(props.row.Date) ? 'isHoliday' : '']"
        >
          <div v-html="qdate.formatDate(props.row.Date, 'MM/DD')" />
          <q-popup-proxy class="bg-red-2" v-if="getHoliday(props.row.Date)">{{
            getHoliday(props.row.Date)
          }}</q-popup-proxy>
        </q-td>
        <q-td
          style="font-size: 2vw; text-align: center"
          v-else
          :class="['nameColumn', getHoliday(props.row.Date) ? 'isHoliday' : '']"
        >
          {{ props.value }}{{ daysOfWeek(props.row.Date) }}
          <q-popup-proxy class="bg-red-2" v-if="getHoliday(props.row.Date)">{{
            getHoliday(props.row.Date)
          }}</q-popup-proxy>
        </q-td>
      </template>

      <!-- bottom total row -->
      <template v-slot:bottom-row="props">
        <q-tr>
          <q-td
            v-for="index in props.cols.length"
            class="text-center bg-grey-2"
            style="font-size: 2vw"
          >
            {{ totalAnnualLeaveDays(props.cols[index - 1].name) }}
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import { scheduleCollection, usersCollection } from "boot/firebase";
import date from "src/lib/date.js";
import { computed } from "vue";
import { date as qdate } from "quasar";
import holiday from "assets/holiday.json";

export default {
  name: "AnnualLeave",
  props: {
    renderDate: Date,
  },
  data() {
    return {
      userListener: Function(),
      qdate: qdate,
      tableFields: [],
      tableData: [],
      date: [],
      uidMap: [],
      defaultPagination: {
        rowsPerPage: 40,
      },
    };
  },
  computed: {
    publicHoliday: function () {
      var ph = [];
      holiday.vcalendar[0].vevent.forEach((record) => {
        ph.push({
          date: new Date(
            Date.UTC(
              record.dtstart[0].substring(0, 4),
              new Number(record.dtstart[0].substring(4, 6)) - 1,
              record.dtstart[0].substring(6, 8),
              0,
              0,
              0
            )
          ),
          summary: record.summary,
        });
      });
      return ph;
    },
  },
  created() {
    this.daysOfWeek = date.daysOfWeek.bind(this);
    this.formatDate = date.formatDate.bind(this);
    this.mergeDateSlot = date.mergeDateSlot.bind(this);
    this.splitDateSlot = date.splitDateSlot.bind(this);
  },
  methods: {
    totalAnnualLeaveDays(name) {
      let index = this.uidMap.findIndex((element) => element.uid == name);
      if (index == -1) return "總數";
      if (this.tableData.length == 0) return "";
      let sum = this.tableData.reduce((a, b) => ({ [name]: a[name] + b[name] }));
      return sum[name];
    },
    getHoliday(date) {
      let i = this.publicHoliday.findIndex(
        (element) => element.date.getTime() == date.getTime()
      );
      if (i == -1) {
        return "";
      } else {
        return this.publicHoliday[i].summary;
      }
    },
  },
  async unmounted() {
    this.userListener();
  },
  async mounted() {
    // setup date scope
    let startOfMonth = new Date(
      this.renderDate.getFullYear(),
      this.renderDate.getMonth(),
      1,
      8,
      0,
      0
    );
    let endOfMonth = new Date(
      this.renderDate.getFullYear(),
      this.renderDate.getMonth() + 1,
      0,
      8,
      0,
      0
    );
    let queryStartDate = startOfMonth;
    let queryEndDate = new Date(endOfMonth.getTime() + 86399000);

    // load users data
    this.userListener = usersCollection
      .where("privilege.systemAdmin", "==", false)
      .where("enable", "==", true)
      .where("rank", "!=", "tmp")
      .orderBy("rank")
      .orderBy("order")
      .onSnapshot((userDoc) => {
        // load AL date within this month
        scheduleCollection
          .where("date", ">=", queryStartDate)
          .where("date", "<=", queryEndDate)
          .where("type", "==", "AL")
          .onSnapshot((scheduleDoc) => {
            var tableData = [];
            let users = [];
            this.uidMap = [];

            // build users list and uidMapping
            userDoc.forEach((doc) => {
              users.push({
                uid: doc.id,
                name: doc.data().name,
                email: doc.data().email,
              });

              this.uidMap.push({
                uid: doc.id,
                name: doc.data().name,
                order: doc.data().order,
              });
            });

            this.uidMap.sort((a, b) => parseInt(a.order) - parseInt(b.order));

            // build table fields (not neccessary)
            this.tableFields = [];
            this.tableFields.push({
              name: "Date",
              field: "Date",
              label: "日期",
              headerStyle: "font-size: 2vw; text-align: center;",
              headerClasses: "bg-grey-2 q-pa-none",
              classes: "q-pa-none",
              format: (val) => this.formatDate(val, "", "月日"),
            });
            this.uidMap.forEach((user) => {
              this.tableFields.push({
                name: user.uid,
                label: user.name,
                field: user.uid,
                style: "font-size: 2vw; text-align: center;",
                headerStyle: "font-size: 2vw; text-align: center;",
                headerClasses: "bg-grey-2 q-pa-none",
                classes: "q-pa-none",
              });
            });

            // load days of the month and user name into table, initialize to 0 ALs
            for (let i = 1; i <= 31; i++) {
              let curDate = new Date(
                Date.UTC(
                  this.renderDate.getFullYear(),
                  this.renderDate.getMonth(),
                  i,
                  0,
                  0,
                  0
                )
              );
              if (curDate > endOfMonth) break;

              tableData.push({
                Date: curDate,
              });

              users.forEach((user) => {
                tableData[tableData.length - 1][user.uid] = 0;
              });
            }

            // load schedule data into AL items array
            let items = [];
            scheduleDoc.forEach((doc) => {
              let i = items.findIndex((element) => element.docid == doc.id);
              if (i == -1) {
                items.push({
                  date: doc.data().date.toDate(),
                  uid: doc.data().uid,
                  type: doc.data().type,
                  docid: doc.id,
                });
              }
            });

            // add up AL items array and update table
            items.forEach((item) => {
              let i = tableData.findIndex(
                (row) =>
                  date.formatDate(row.Date, "", "YYYYMMDD") ==
                  date.formatDate(item.date, "", "YYYYMMDD")
              );

              if (i == -1) return;
              let thisCount = Number.parseFloat(tableData[i][item.uid]) + 0.5;
              tableData[i][item.uid] = thisCount;
            });

            this.tableData = tableData;
          });
      });
  },
};
</script>

<style lang="scss" scoped>
.q-table__container {
  width: 97.2vw;
  margin-bottom: 5vh;
  margin-left: auto;
  margin-right: auto;
}

.isHoliday {
  background-color: $red-2;
}

@media print {
  .table thead th {
    background-color: lightgray !important;
  }
  .table th {
    border: 1px solid black !important;
  }
  .table tbody td {
    border: 1px solid black !important;
  }
}
</style>
