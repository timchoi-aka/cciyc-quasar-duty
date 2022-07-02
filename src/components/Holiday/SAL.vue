<template>
  <q-page>
    <div v-if="renderDate >= new Date('2027/04/01')" class="q-ml-md text-h5">
      <span
        class="text-h5"
        v-html="qdate.formatDate(renderDate, 'YYYY-MM-DD')"
      />特別年假制度完結
    </div>
    <q-table
      v-if="renderDate < new Date('2027/04/01')"
      dense
      flat
      class="q-mb-lg"
      :title="renderDate.getFullYear() + '年特別年假表'"
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
          style="font-size: 2.5vw; text-align: center"
          :class="['nameColumn', getHoliday(props.row.Date) != '' ? 'isHoliday' : '']"
        >
          {{ props.value }}
          <q-popup-proxy class="bg-red-2" v-if="getHoliday(props.row.Date) != ''">{{
            getHoliday(props.row.Date)
          }}</q-popup-proxy>
        </q-td>
      </template>

      <!-- bottom row -->
      <template v-slot:bottom-row="props">
        <q-tr>
          <q-td
            v-for="index in props.cols.length"
            class="text-center bg-grey-2"
            style="font-size: 2.5vw"
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
import { date as qdate } from "quasar";
import holiday from "assets/holiday.json";

export default {
  name: "AnnualLeave",
  props: {
    renderDate: Date,
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
  data() {
    return {
      qdate: qdate,
      tableFields: [
        {
          name: "Date",
          field: "Date",
          label: "日期",
          style: "font-size: 2.5vw; text-align: center",
          headerStyle: "font-size: 2.5vw; text-align: center;",
          headerClasses: "bg-grey-2",
          format: (val) =>
            qdate.formatDate(val, "M月D日(ddd)", {
              daysShort: ["日", "一", "二", "三", "四", "五", "六"],
            }),
        },
      ],
      tableData: [],
      date: [],
      uidMap: [],
      defaultPagination: {
        rowsPerPage: 40,
      },
    };
  },
  methods: {
    totalAnnualLeaveDays(name) {
      let index = this.uidMap.findIndex((element) => element.uid == name);
      if (index == -1) return "總數";
      if (this.tableData.length == 0) return "";
      let sum = this.tableData.reduce((a, b) => ({ [name]: a[name] + b[name] }));
      return sum[name];
    },
    printableDate(date) {
      let d = new Date(Number(Date.parse(date)));
      let result = d.getMonth() + 1 + "月" + d.getDate() + "日";
      return result;
    },
    getHoliday(date) {
      let i = this.publicHoliday.findIndex(
        (element) =>
          qdate.formatDate(element.date, "DDMMYYYY") == qdate.formatDate(date, "DDMMYYYY")
      );
      if (i == -1) {
        return "";
      } else {
        return this.publicHoliday[i].summary;
      }
    },
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
    let queryEndDate = new Date(endOfMonth.getTime() + 86399000); // offset 23:59:59

    // load users data
    const userDoc = await usersCollection
      .where("privilege.systemAdmin", "==", false)
      .where("privilege.sal", "==", true)
      .orderBy("order")
      .get();

    // build users list and uidMapping
    userDoc.forEach((doc) => {
      // build tableFields
      if (doc.data().salDeadline && queryStartDate < doc.data().salDeadline.toDate()) {
        this.tableFields.push({
          name: doc.id,
          field: doc.id,
          label: doc.data().name,
          style: "font-size: 2.5vw; text-align: center",
          headerStyle: "font-size: 2.5vw; text-align: center;",
          headerClasses: "bg-grey-2",
        });
      }

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
      .where("type", "==", "SAL")
      .get();

    const schedules = [];
    scheduleDoc.forEach((doc) => {
      const d = doc.data();
      d.date = d.date.toDate();
      schedules.push(d);
    });

    // load days of the month and user name into table, initialize to 0 ALs
    for (let i = 1; i <= 31; i++) {
      let rowData = {};
      let curDate = new Date(
        this.renderDate.getFullYear(),
        this.renderDate.getMonth(),
        i
      );
      if (curDate > endOfMonth) break;
      rowData.Date = curDate;
      // this.tableData.push({
      //  Date: this.printableDate(curDate),
      // });
      this.uidMap.forEach((user) => {
        const uid = user.uid;
        const curDateCount = schedules.reduce(
          (sum, value) =>
            this.printableDate(value.date) == this.printableDate(curDate) &&
            value.uid == user.uid
              ? sum + 0.5
              : sum,
          0
        );
        // this.tableData[this.tableData.length - 1][uid] = curDateCount;
        rowData[uid] = curDateCount;
      });
      this.tableData.push(rowData);
    }
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

.q-table__container::v-deep(.q-table__title) {
  font-size: 2vw !important;
}

.q-table__container::v-deep(.nameColumn) {
  font-size: 1.5vw;
  text-decoration: bold;
  text-align: center;
}

@media screen {
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
