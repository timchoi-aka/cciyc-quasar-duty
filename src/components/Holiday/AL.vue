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
          
          :class="[getHoliday(props.row.Date) ? 'isHoliday' : '']"
        >
          <div v-if="$q.screen.lt.sm" v-html="qdate.formatDate(props.row.Date, 'MM/DD')" />
          <div v-else>{{ props.value }}</div>
          <q-tooltip class="bg-red-2 text-body1 text-black" v-if="getHoliday(props.row.Date)">{{
            getHoliday(props.row.Date)
          }}</q-tooltip>
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

<script setup>
import { scheduleCollection, usersCollection } from "boot/firebase";
import { computed, onUnmounted, ref } from "vue";
import { date as qdate } from "quasar";
import holiday from "assets/holiday.json";
import { useStore } from "vuex";
import { query, where, orderBy, onSnapshot, getDocs } from "firebase/firestore"

// props
const props = defineProps({
  renderDate: Date,
})

// variables
const $store = useStore();
const scheduleListener = ref()
const tableData = ref([])

// table config
const tableFields = ref([{
  name: "Date",
  field: "Date",
  label: "日期",
  headerStyle: "font-size: 2vw; text-align: center;",
  headerClasses: "bg-grey-2 q-pa-none",
  classes: "q-pa-none",
  format: (val) => qdate.formatDate(val, "M月D日(ddd)", {
            daysShort: ['日', '一', '二', '三', '四', '五', '六'],
          }),
}])

const defaultPagination = ref({
  rowsPerPage: 40,
})

// computed
const isProbation = computed(() => $store?.getters["userModule/getProbation"]??false)
const uid = computed(() => $store.getters["userModule/getUID"])
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
    (element) => element.date == qdate.formatDate(date, "YYYYMMDD")
  );
  if (i == -1) {
    return "";
  } else {
    return publicHoliday.value[i].summary;
  }
}

onUnmounted(() => {
  scheduleListener.value? scheduleListener.value(): ''
})

// query definitions
const userQuery = query(usersCollection,
  where("privilege.systemAdmin", "==", false),
  where("enable", "==", true),
  where("rank", "!=", "tmp"),
  orderBy("rank"),
  orderBy("order")
)
  
// load users data
getDocs(userQuery).then((userDoc) => {
  var rows = [];
  let users = [];
  let uidMap = [];
  const startOfMonth = qdate.startOfDate(props.renderDate, 'month')
  const endOfMonth = qdate.endOfDate(props.renderDate, 'month')

  // build users list and uidMapping
  userDoc.forEach((doc) => {
    // user under probation can only view their own AL
    if (isProbation.value) {
      if (uid.value == doc.id) {
        users.push({
          uid: doc.id,
          name: doc.data().name,
          email: doc.data().email,
        });

        uidMap.push({
          uid: doc.id,
          name: doc.data().name,
          order: doc.data().order,
        });
      }
    } else {
      // check if user has left the company
      // put the user to the valid staff if he's still working
      let validStaff = true
      if (qdate.getDateDiff(doc.data().dateOfEntry.toDate(), startOfMonth) > 0) validStaff = false
      if (doc.data().dateOfExit) {
        if (qdate.getDateDiff(doc.data().dateOfExit.toDate(), endOfMonth) < 0) validStaff = false
      }
      if (validStaff) {
        users.push({
          uid: doc.id,
          name: doc.data().name,
          email: doc.data().email,
        });

        uidMap.push({
          uid: doc.id,
          name: doc.data().name,
          order: doc.data().order,
        });
      }
    }
  });

  // sort users by order
  uidMap.sort((a, b) => parseInt(a.order) - parseInt(b.order));

  // put the users into table columns
  uidMap.forEach((user) => {
    tableFields.value.push({
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
  for (let curDate = startOfMonth; curDate < endOfMonth; curDate = qdate.addToDate(curDate, {day: 1})) {
    rows.push({
      Date: curDate
    })

    users.forEach((user) => {
      rows[rows.length - 1][user.uid] = 0;
    });
  }
  
  const scheduleQuery = query(scheduleCollection, 
    where("date", ">=", startOfMonth),
    where("date", "<=", endOfMonth),
    where("type", "==", "AL")
  )

  scheduleListener.value = onSnapshot(scheduleQuery, (scheduleDoc) => {
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
      let i = rows.findIndex(
        (row) =>
          qdate.formatDate(row.Date, "YYYYMMDD") ==
          qdate.formatDate(item.date, "YYYYMMDD")
      )
      if (i == -1) return;
      // add 0.5 to holiday count on each record
      rows[i][item.uid] = Number.parseFloat(rows[i][item.uid]) + 0.5;
    });
    tableData.value = rows;
  });
});
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
