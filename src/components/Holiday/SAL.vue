<template>
  <q-page>
    <div v-if="props.renderDate >= new Date('2027/04/01')" class="q-ml-md text-h5">
      <span
        class="text-h5"
        v-html="qdate.formatDate(props.renderDate, 'YYYY-MM-DD')"
      />特別年假制度完結
    </div>
    <q-table
      v-else
      dense
      flat
      class="q-mb-lg"
      :title="props.renderDate.getFullYear() + '年特別年假表'"
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
          <q-tooltip class="bg-red-2 text-black text-body1" v-if="getHoliday(props.row.Date)">{{
            getHoliday(props.row.Date)
          }}</q-tooltip>
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

<script setup>
import { scheduleCollection, usersCollection } from "boot/firebase"
import { date as qdate } from "quasar"
import holiday from "assets/holiday.json"
import { ref, computed } from "vue"
import { where, orderBy, query, getDocs } from "@firebase/firestore"

const props = defineProps({
  renderDate: Date
})

// variables
const tableData = ref([])

// table config
const tableFields = ref([
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
])

const defaultPagination = ref({
  rowsPerPage: 40,
})

// computed
const publicHoliday = computed(() => holiday? holiday.vcalendar[0].vevent.map(({dtstart, summary}) => ({date: dtstart[0], summary: summary})): [])
     
// functions
function totalAnnualLeaveDays(name) {
  if (name == "Date") return "總數";
  if (tableData.value.length == 0) return "";
  let sum = tableData.value.reduce((a, b) => ({ [name]: a[name] + b[name] }));
  return sum[name];
}
   
function getHoliday(date) {
  let i = publicHoliday.value.findIndex(
    (element) =>
      element.date == qdate.formatDate(date, "YYYYMMDD")
  );
  if (i == -1) {
    return "";
  } else {
    return publicHoliday.value[i].summary;
  }
}
  

// setup date scope
let startOfMonth = qdate.startOfDate(props.renderDate, 'month')
let endOfMonth = qdate.endOfDate(props.renderDate, 'month')

// query definitions
const userDocQuery = query(usersCollection,
  where("privilege.systemAdmin", "==", false),
  where("privilege.sal", "==", true),
  orderBy("order")
)

const scheduleDocQuery = query(scheduleCollection,
  where("date", ">=", startOfMonth),
  where("date", "<=", endOfMonth),
  where("type", "==", "SAL")
)

// load users data
getDocs(userDocQuery).then((userDoc) => {
  // build users list and uidMapping
  let uidMap = []
  userDoc.forEach((doc) => {
    // build tableFields
    if (doc.data().salDeadline && startOfMonth < doc.data().salDeadline.toDate()) {
      tableFields.value.push({
        name: doc.id,
        field: doc.id,
        label: doc.data().name,
        style: "font-size: 2.5vw; text-align: center",
        headerStyle: "font-size: 2.5vw; text-align: center;",
        headerClasses: "bg-grey-2",
      });
    }

    // build uidMap
    uidMap.push({
      uid: doc.id,
      name: doc.data().name,
    });
  });

  // load AL date within this month
  getDocs(scheduleDocQuery).then((scheduleDoc) => {
    const schedules = [];
    scheduleDoc.forEach((doc) => {
      const d = doc.data();
      d.date = d.date.toDate();
      schedules.push(d);
    });

    // load days of the month and user name into table, initialize to 0 ALs
    for (let curDate = startOfMonth; curDate <= endOfMonth; curDate = qdate.addToDate(curDate, {"day":1})) {
      let rowData = {};
      rowData.Date = curDate;
      
      uidMap.forEach((user) => {
        const uid = user.uid;
        const curDateCount = schedules.reduce(
          (sum, value) =>
            qdate.formatDate(value.date, "YYYYMMDD") == qdate.formatDate(curDate, "YYYYMMDD") &&
            value.uid == user.uid
              ? sum + 0.5
              : sum,
          0
        );
        rowData[uid] = curDateCount;
      });
      tableData.value.push(rowData);
    }
  })
})
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
