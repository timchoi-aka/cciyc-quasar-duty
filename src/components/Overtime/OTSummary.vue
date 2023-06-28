<template>
  <div>
    <!-- loading dialog -->
    <LoadingDialog v-model="loading" message="讀取資料中"/>

    <q-table
      dense
      flat
      :title="'超時補假記錄 - ' + props.renderName"
      :rows="tableData"
      :columns="tableFields"
      :pagination="defaultPagination"
      no-data-label="沒有超時補假資料"
      separator="cell"
      color="primary"
      row-key="date"
    >
      <!-- remark template -->
      <template v-slot:body-cell-remarks="props">
        <q-td style="font-size: 2.5vw; text-align: center">
          <div v-for="remark in props.value" :key="remark">
            {{ remark }}
          </div>
        </q-td>
      </template>

      <!-- top row -->
      <template v-slot:top-row="props" v-if="tableData.length > 0">
        <q-tr>
          <q-td
            v-for="index in props.cols.length"
            class="text-center bg-grey-2"
            style="font-size: 2.5vw"
          >
            {{ OTCarryOver(props.cols[index - 1]) }}
          </q-td>
        </q-tr>
      </template>

      <!-- bottom row -->
      <template v-slot:bottom-row="props" v-if="tableData.length > 0">
        <q-tr>
          <q-td
            v-for="index in props.cols.length"
            class="text-center bg-grey-2"
            style="font-size: 2.5vw"
          >
            {{ OTBalance(props.cols[index - 1]) }}
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { OTCollection, FireDB } from "boot/firebase";
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { date as qdate } from "quasar";
import LoadingDialog from "components/LoadingDialog.vue"
import { getDoc, getDocs, query, where, doc } from "@firebase/firestore";

// props
const props = defineProps({
  renderUID: String,
  renderName: String,
})

// variables
const $store = useStore();
const loading = ref(0)
const carryOver = ref(0)
      
// table config
const tableFields = ref([
  {
    name: "date",
    field: "date",
    label: "日期",
    style: "font-size: 2.5vw; text-align: center",
    headerStyle: "font-size: 2.5vw; text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => qdate.formatDate(val, "YYYY年M月DD日"),
  },
  {
    name: "type",
    field: "type",
    label: "種類",
    style: "font-size: 2.5vw; text-align: center",
    headerStyle: "font-size: 2.5vw; text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => typeMap.value[val],
  },
  {
    name: "hours",
    field: "hours",
    label: "時數",
    style: "font-size: 2.5vw; text-align: center",
    headerStyle: "font-size: 2.5vw; text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "remarks",
    field: "remarks",
    label: "附註",
    style: "font-size: 2.5vw; text-align: center",
    headerStyle: "font-size: 2.5vw; text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "status",
    field: "status",
    label: "狀態",
    style: "font-size: 2.5vw; text-align: center",
    headerStyle: "font-size: 2.5vw; text-align: center;",
    headerClasses: "bg-grey-2",
  },
])
      
const tableData = ref([])
const typeMap = ref({
  OT: "超時",
  CL: "補假",
})
const defaultPagination = ref({
  rowsPerPage: 40,
  sortBy: "date",
})
  
// functions
function OTCarryOver(col) {
  //console.log(JSON.stringify(col));
  if (tableData.value.length == 0) return "";
  if (col.name == "date") return "開始結餘";
  if (col.name == "hours") return carryOver.value;
}

function OTBalance(col) {
  //console.log(JSON.stringify(col));
  if (tableData.value.length == 0) return "";
  if (col.name == "date") return "結餘";
  if (col.name == "hours") {
    let approvedData = tableData.value.filter((row) => {
      return row.status == "批准";
    });
    if (approvedData.length > 0) {
      let sum = approvedData.reduce((a, b) => ({
        hours: parseFloat(a.hours) + parseFloat(b.hours),
      }));
      return carryOver.value + sum.hours;
    } else return carryOver.value;
  }
}
 

// load OT history
const OTQuery = query(OTCollection,
  where("uid", "==", props.renderUID),
  where("validity", "==", true)
)

getDocs(OTQuery).then((OTDoc) => {
  OTDoc.forEach((doc) => {
    tableData.value.push({
      date: doc.data().date,
      type: doc.data().type,
      hours: doc.data().hours,
      remarks: doc.data().remarks,
      status: doc.data().status,
    });
  });
})
  

getDoc(doc(FireDB, "dashboard", "otConfig")).then((dashboardDoc) => {
  carryOver.value = dashboardDoc.data()[props.renderUID] == "undefined" ? 0 : dashboardDoc.data()[props.renderUID];
})
</script>

<style lang="scss" scoped>
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
