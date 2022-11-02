<template>
  <div>
    <!-- loading dialog -->
    <q-dialog v-model="waitingAsync" position="bottom">
      <LoadingDialog message="讀取資料中"/>
    </q-dialog>

    <q-table
      dense
      flat
      :title="'超時補假記錄 - ' + renderName"
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

<script>
import { OTCollection, dashboardCollection } from "boot/firebase";
import { computed } from "vue";
import { useStore } from "vuex";
import { date as qdate } from "quasar";
import LoadingDialog from "components/LoadingDialog.vue"

export default {
  name: "OTSummary",
  components: {
    LoadingDialog,
  },
  props: {
    renderUID: String,
    renderName: String,
  },
  data() {
    return {
      awaitServerResponse: 0,
      carryOver: 0,
      qdate: qdate,
      tableFields: [
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
          format: (val) => this.typeMap[val],
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
      ],
      tableData: [],
      typeMap: {
        OT: "超時",
        CL: "補假",
      },
      defaultPagination: {
        rowsPerPage: 40,
        sortBy: "date",
      },
    };
  },
  setup() {
    const $store = useStore();

    return {
      uid: computed(() => $store.getters["userModule/getUID"]),
    };
  },
  computed: {
    waitingAsync() {
      return this.awaitServerResponse > 0 ? true : false;
    },
  },
  methods: {
    OTCarryOver(col) {
      //console.log(JSON.stringify(col));
      if (this.tableData.length == 0) return "";
      if (col.name == "date") return "開始結餘";
      if (col.name == "hours") return this.carryOver;
    },
    OTBalance(col) {
      //console.log(JSON.stringify(col));
      if (this.tableData.length == 0) return "";
      if (col.name == "date") return "結餘";
      if (col.name == "hours") {
        let approvedData = this.tableData.filter((row) => {
          return row.status == "批准";
        });
        if (approvedData.length > 0) {
          let sum = approvedData.reduce((a, b) => ({
            hours: parseFloat(a.hours) + parseFloat(b.hours),
          }));
          return this.carryOver + sum.hours;
        } else return this.carryOver;
      }
    },
  },
  async unmounted() {},
  mounted() {
    const uid = this.renderUID;
    let data = [];
    // load OT history

    OTCollection.where("uid", "==", uid)
      .where("validity", "==", true)
      .get()
      .then((OTDoc) => {
        OTDoc.forEach((doc) => {
          data.push({
            date: doc.data().date,
            type: doc.data().type,
            hours: doc.data().hours,
            remarks: doc.data().remarks,
            status: doc.data().status,
          });
        });
        this.tableData = data;
      });

    // load carryover OT
    dashboardCollection
      .doc("otConfig")
      .get()
      .then((dashboardDoc) => {
        let d = dashboardDoc.data();
        this.carryOver = d[uid] == "undefined" ? 0 : d[uid];
      });
  },
};
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
