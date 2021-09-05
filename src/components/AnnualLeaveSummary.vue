<template>
  {{ tableFields }}
  {{ tableData }}
  <q-page>
    <q-table
      dense
      flat
      :grid="$q.screen.lt.sm && allowModify"
      :rows="tableData"
      :columns="tableFields"
      :pagination="defaultPagination"
      :hide-bottom="true"
      color="primary"
      row-key="name"
    >
      <template #table-caption
        ><h3>{{ renderDate.getFullYear() }}年年假表</h3></template
      >
      <template #foot()="data">
        <span>{{ totalAnnualLeaveDays(data.column) }}</span>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import { scheduleCollection, usersCollection } from "boot/firebase";

export default {
  name: "AnnualLeave",
  props: {
    renderDate: Date,
  },
  data() {
    return {
      tableFields: [],
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
    usersCollection
      .where("privilege.systemAdmin", "==", false)
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
              });
            });

            // build table fields (not neccessary)
            this.tableFields = [];
            this.tableFields.push({
              name: "Date",
              field: "Date",
              label: "日期",
            });
            this.uidMap.forEach((user) => {
              this.tableFields.push({
                name: user.uid,
                label: user.name,
                field: user.uid,
              });
            });

            // load days of the month and user name into table, initialize to 0 ALs
            for (let i = 1; i <= 31; i++) {
              let curDate = new Date(
                this.renderDate.getFullYear(),
                this.renderDate.getMonth(),
                i
              );
              if (curDate > endOfMonth) break;

              tableData.push({
                Date: this.printableDate(curDate),
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
                (row) => row.Date == this.printableDate(item.date)
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

<style scoped>
@media screen {
  .isHoliday {
    background-color: #e07264 !important;
  }

  .table-bordered {
    border: 1px solid black;
  }

  .table-bordered th {
    border: 1px solid black;
  }

  .table-bordered td {
    border: 1px solid black;
  }

  .table {
    border-collapse: collapse;
  }
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
