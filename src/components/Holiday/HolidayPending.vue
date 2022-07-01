<!-- module to do
- sync with unapproved holidays
- display unapproved holidays and allow modify

-->
<template>
  <q-page>
    <q-table
      dense
      flat
      :grid="$q.screen.lt.sm"
      :rows="rows"
      :columns="columns"
      :pagination="defaultPagination"
      separator="cell"
      color="primary"
      row-key="date"
      no-data-label="沒有待審批假期"
    >
      <!-- all cell template -->
      <template v-slot:body-cell-remarks="props">
        <q-td style="font-size: 1.5vw; text-align: center">
          <div v-for="remark in props.value" :key="remark">
            {{ remark }}
          </div>
        </q-td>
      </template>

      <!-- grid template -->
      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4 flex">
          <q-card style="width: 95%; margin: auto; margin-top: 10px" class="q-pa-md">
            <q-card-section class="bg-blue-1 text-h5 q-my-md">
              {{}}
              <div class="text-h6 row">
                <span>日期:</span>
                <span
                  v-html="
                    qdate.formatDate(props.row.date, 'YYYY年MM月DD日(ddd)', {
                      daysShort: ['日', '一', '二', '三', '四', '五', '六'],
                    })
                  "
                />
                <q-space />
                <span>時段:</span><span v-html="slotMap[props.row.slot]" />
                <q-space />
                <span>種類:</span><span v-html="typeMap[props.row.type]" />
              </div>
            </q-card-section>
            <q-separator inset />
            <q-card-section style="font-size: 1vw">
              <div class="col text-left" v-for="remark in props.row.remarks">
                {{ remark }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </template>
    </q-table>

    <q-dialog v-model="waitingAsync" position="bottom">
      <q-card>
        <q-card-section class="row">
          <q-circular-progress
            indeterminate
            show-value
            size="100px"
            :thickness="0.4"
            font-size="10px"
            color="lime"
            track-color="grey-3"
            center-color="grey-3"
            class="q-ma-md col float-right vertical-middle"
            >讀取資料中</q-circular-progress
          >
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { leaveCollection } from "boot/firebase";
import { defineComponent, computed } from "vue";
import { format, date as qdate } from "quasar";

export default defineComponent({
  name: "HolidayPending",
  props: {
    uid: String,
  },
  data() {
    return {
      qdate: qdate,
      pendingApplicationList: [],
      awaitServerResponse: 0,

      defaultPagination: {
        rowsPerPage: 20,
      },
      slotMap: {
        slot_a: "早",
        slot_b: "午",
        slot_c: "晚",
      },
      typeMap: {
        AL: "年假",
        SAL: "特別年假",
        SL: "病假",
        SSL: "特別病假",
      },
      rows: [],
      columns: [
        {
          name: "date",
          label: "日期",
          field: "date",
          style: "font-size: 1.5vw; text-align: center",
          headerStyle: "font-size: 1.5vw; text-align: center;",
          headerClasses: "bg-grey-2",
          format: (val) =>
            qdate.formatDate(val, "M月D日(ddd)", {
              daysShort: ["日", "一", "二", "三", "四", "五", "六"],
            }),
        },
        {
          name: "slot",
          label: "時段",
          field: "slot",
          style: "font-size: 1.5vw; text-align: center",
          headerStyle: "font-size: 1.5vw; text-align: center;",
          headerClasses: "bg-grey-2",
          format: (val) => this.slotMap[val],
        },
        {
          name: "type",
          label: "種類",
          field: "type",
          style: "font-size: 1.5vw; text-align: center",
          headerStyle: "font-size: 1.5vw; text-align: center;",
          headerClasses: "bg-grey-2",
          format: (val) => this.typeMap[val],
        },
        {
          name: "remarks",
          label: "附註",
          field: "remarks",
          style: "font-size: 1.5vw; text-align: center",
          headerStyle: "font-size: 1.5vw; text-align: center;",
          headerClasses: "bg-grey-2",
        },
        /*{
          name: "action",
          label: "動作",
          field: "action",
          style: "font-size: 1.5vw; text-align: center",
          headerStyle: "font-size: 1.5vw; text-align: center;",
          headerClasses: "bg-grey-2",
        },*/
      ],
    };
  },
  methods: {
    /*
    removeApplication(date, slot, type) {
      const docidAttributeName = slot + ".unapprovedDocid";
      let index = this.rows.findIndex((element) => element.Date == date);
      let docid = this.rows[index][docidAttributeName];

      let changeIndex = this.changeApplicationList.findIndex(
        (element) => element.docid == docid
      );

      if (changeIndex >= 0) {
        this.deleteApplicationList.push({
          docid: docid,
          action: "delete",
          date: this.changeApplicationList[changeIndex].old.date,
          slot: this.changeApplicationList[changeIndex].old.slot,
          type: this.changeApplicationList[changeIndex].old.type,
        });
        this.changeApplicationList.splice(changeIndex, 1);
      } else {
        this.deleteApplicationList.push({
          docid: docid,
          action: "delete",
          date: date,
          slot: slot,
          type: type,
        });
      }
      delete this.rows[index][slot + ".unapproved"];
      delete this.rows[index][slot + ".unapprovedValue"];
      delete this.rows[index][slot + ".unapprovedDocid"];
    },
    confirmHolidayApplication() {
      let leaveData = [];
      let now = new Date();

      let combinedRemarks = [];
      if (this.applicationRemarks.length > 0)
        combinedRemarks.push(this.username + ": " + this.applicationRemarks);

      // call https functions to modify leave
      if (this.changeApplicationList.length > 0) {
        combinedRemarks.push(
          "修改：" + qdate.formatDate(now, "YYYY年MM月DD日HH時mm分ss秒")
        );

        for (let doc of this.changeApplicationList) {
          doc.remarks = combinedRemarks;
        }

        const modifyLeaveByDocid = FirebaseFunctions.httpsCallable(
          "holiday-modifyLeaveByDocid"
        );

        this.awaitServerResponse++;
        modifyLeaveByDocid(this.changeApplicationList).then(() => {
          this.awaitServerResponse--;
          this.updateApplicationList();
          this.changeApplicationList = [];
        });
      }

      // call https functions to delete existing applications
      if (this.deleteApplicationList.length > 0) {
        const delLeaveByDocid = FirebaseFunctions.httpsCallable(
          "holiday-delLeaveByDocid"
        );
        this.awaitServerResponse++;
        delLeaveByDocid(this.deleteApplicationList)
          .then(() => {
            this.awaitServerResponse--;
            this.updateApplicationList();
            this.deleteApplicationList = [];
          })
          .catch((error) => {
            console.log(error);
          });
      }

      // call https functions to add leaves
      if (this.applicationList.length > 0) {
        combinedRemarks.push(
          "申請：" + qdate.formatDate(now, "YYYY年MM月DD日HH時mm分ss秒")
        );
        this.applicationList.forEach((leave) => {
          leaveData.push({
            date: leave.date.toISOString(),
            type: leave.type,
            slot: leave.slot,
            uid: this.uid,
            name: this.username,
            validity: true,
            status: "未批",
            remarks: combinedRemarks,
          });
        });

        const addLeave = FirebaseFunctions.httpsCallable("holiday-addLeave");
        this.awaitServerResponse++;
        addLeave(leaveData)
          .then(() => {
            this.awaitServerResponse--;
            this.applicationList = [];
            this.updateApplicationList();
            this.refreshHolidayTable();
          })
          .catch((error) => {
            console.log(error.message);
          });
      }
      this.applicationRemarks = "";
    },
    applyHoliday(props) {
      // add the clicked slot to applicationList array
      let i = this.applicationList.findIndex(
        (element) => element.date == props.row.Date && element.slot == props.col.name
      );

      if (i >= 0) this.applicationList.splice(i, 1);
      this.applicationList.push({
        date: props.row.Date,
        slot: props.col.name,
        type: this.leaveType,
      });
    }, */
    async refreshHolidayTable() {
      // this.pendingApplicationList = [];
      this.rows = [];
      let applications = await leaveCollection
        .where("uid", "==", this.uid)
        .where("status", "==", "未批")
        .get();

      applications.forEach((doc) => {
        this.rows.push({
          docid: doc.id,
          date: doc.data().date,
          slot: doc.data().slot,
          type: doc.data().type,
          remarks: doc.data().remarks,
        });
      });
    },
  },
  async mounted() {
    this.awaitServerResponse++;
    this.refreshHolidayTable().then((response) => {
      this.awaitServerResponse--;
    });
  },
  computed: {
    waitingAsync() {
      return this.awaitServerResponse > 0 ? true : false;
    },
  },
});
</script>

<style lang="scss" scoped>
* {
  margin: 0;
  padding: 0;
}

.q-table__container {
  width: 97.2vw;
  table-layout: auto;
}
</style>
