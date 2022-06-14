<!-- module to do
- sync with unapproved holidays
- display unapproved holidays and allow modify

-->
<template>
  <q-page class="full-width q-pa-md">
    <!-- duty calendar dialog -->
    <q-dialog v-model="showDutyCalendar" full-width>
      <q-card
        class="q-pa-md"
        :style="
          $q.screen.lt.sm
            ? 'width: 70vw; height: 70vw; max-height: 70vw'
            : 'width: 70vw; height: 50vw; max-height: 50vw'
        "
      >
        <q-card-section class="no-wrap row">
          <q-btn outline color="primary" @click="changeRenderDate(-7)">上周</q-btn>
          <q-btn outline color="primary" @click="changeRenderDate(7)">下周</q-btn>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <DutyCalendar
          class="scroll"
          v-bind:renderDate="renderDate"
          v-bind:allowModify="false"
          :key="renderDate"
        />
      </q-card>
    </q-dialog>

    <!-- confirm dialog -->
    <q-dialog v-model="showApproveDialog">
      <q-card style="width: 70vw; border-radius: 30px" class="q-gutter-md q-pa-md">
        <q-card-section>
          <div class="text-h5 bg-blue-3 text-center">確定批准放假？</div>
        </q-card-section>

        <q-card-section
          class="scroll bg-grey-2 q-pa-xs text-center"
          :style="
            $q.screen.lt.sm
              ? 'height: 40vw; max-height: 40vw'
              : 'height: 20vw; max-height: 20vw'
          "
        >
          <div
            style="border: 1px solid"
            class="col-6 q-pa-sm full-width q-mt-sm"
            v-for="(application, index) in selectedRow"
            :key="index"
            v-html="
              application.name +
              ' - ' +
              typeMap[application.type] +
              ' 【' +
              qdate.formatDate(application.date, 'YYYY年MM月DD日(ddd)', {
                daysShort: ['日', '一', '二', '三', '四', '五', '六'],
              }) +
              ' - ' +
              slotMap[application.slot] +
              '】 '
            "
          />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <q-input v-model="applicationRemarks" label="備註：" />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn v-close-popup flat color="primary" label="取消" />
          <q-btn
            v-close-popup
            @click="confirmApprove"
            flat
            color="primary"
            label="確認批准"
            round
            icon="check"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- reject dialog -->
    <q-dialog v-model="showRejectDialog">
      <q-card style="width: 70vw; border-radius: 30px" class="q-gutter-md q-pa-md">
        <q-card-section>
          <div class="text-h5 bg-blue-3 text-center">確定拒絕放假？</div>
        </q-card-section>

        <q-card-section
          class="scroll bg-grey-2 q-pa-xs text-center"
          :style="
            $q.screen.lt.sm
              ? 'height: 40vw; max-height: 40vw'
              : 'height: 20vw; max-height: 20vw'
          "
        >
          <div
            style="border: 1px solid"
            class="col-6 q-pa-sm full-width q-mt-sm"
            v-for="(application, index) in selectedRow"
            :key="index"
            v-html="
              application.name +
              ' - ' +
              typeMap[application.type] +
              ' 【' +
              qdate.formatDate(application.date, 'YYYY年MM月DD日(ddd)', {
                daysShort: ['日', '一', '二', '三', '四', '五', '六'],
              }) +
              ' - ' +
              slotMap[application.slot] +
              '】 '
            "
          />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <q-input v-model="applicationRemarks" label="備註：" />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn v-close-popup flat color="primary" label="取消" />
          <q-btn
            v-close-popup
            @click="confirmReject"
            flat
            color="red"
            label="確認拒絕"
            round
            icon="cancel"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- sticky button at bottom -->
    <q-page-sticky
      v-if="!$q.screen.lt.sm"
      position="bottom-right"
      :offset="[20, 20]"
      style="z-index: 1"
    >
      <q-fab
        :disable="checkForApproval()"
        label="批准"
        icon="check"
        color="primary"
        push
        @click="showApproveDialog = !showApproveDialog"
      />
      <q-fab
        :disable="this.selectedRow.length == 0"
        label="修改"
        icon="edit"
        color="warning"
        push
        @click="modifyDialog = !modifyDialog"
      />
      <q-fab
        :disable="checkForApproval()"
        label="拒絕"
        icon="close"
        color="red"
        push
        @click="showRejectDialog = !showRejectDialog"
      />
    </q-page-sticky>

    <q-page-sticky position="bottom-left" :offset="[20, 20]" style="z-index: 1">
      <q-fab
        label="更表"
        icon="calendar_month"
        color="primary"
        push
        @click="showDutyCalendar = !showDutyCalendar"
      />
    </q-page-sticky>

    <div class="row full-width">
      <div class="col-12 col-xs-12 text-h6">篩選：</div>
      <div class="col-3 col-xs-4 row justify-left">
        <q-select
          class="col"
          v-model="usersSelected"
          hide-bottom-space
          multiple
          :options="userList"
          label="員工"
          filled
        ></q-select>
      </div>
      <q-select
        class="col-2 col-xs-3 offset-1 justify-left"
        v-model="statusSelected"
        hide-bottom-space
        :options="statusList"
        label="狀態"
        filled
      ></q-select>

      <q-btn
        class="col-2 col-xs-3 offset-1 justify-left"
        icon="restart_alt"
        label="重置篩選"
        size="sm"
        @click="
          this.usersSelected = [];
          this.statusSelected = '';
        "
      />
    </div>

    <div class="q-mt-md row full-width">
      <q-table
        class="col"
        dense
        flat
        :grid="$q.screen.lt.sm"
        :rows="rows"
        :columns="columns"
        :pagination="defaultPagination"
        :filter="filterValues"
        :filter-method="customFilter"
        separator="cell"
        color="primary"
        row-key="docid"
        selection="multiple"
        v-model:selected="selectedRow"
        no-results-label="沒有合乎篩選條件的資料"
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
                <div class="row">
                  <div class="col">{{ props.row.name }}</div>
                  <q-space />
                  <div class="col text-right">
                    <q-icon v-if="props.row.status == '批准'" name="check" />【{{
                      props.row.status
                    }}】
                  </div>
                </div>

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
              <q-card-section class="row">
                <div class="col-9" style="font-size: 1vw">
                  <div class="col-1 text-left">附註：</div>
                  <div class="col text-left" v-for="remark in props.row.remarks">
                    {{ remark }}
                  </div>
                </div>
                <div v-if="props.row.status == '未批'" class="col-3">
                  <q-btn
                    icon="check"
                    color="blue"
                    outline
                    label="批准"
                    @click="singleApprove(props.row)"
                  />
                  <q-btn icon="close" color="red" outline label="拒絕" />
                </div>
                <div v-else class="col-3">
                  <q-btn icon="edit" color="warning" outline label="修改" />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </template>
      </q-table>
    </div>
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
import { leaveCollection, usersCollection, FirebaseFunctions } from "boot/firebase";
import { defineComponent, computed } from "vue";
import { date as qdate } from "quasar";
import { useStore } from "vuex";
import DutyCalendar from "components/DutyCalendar.vue";

export default defineComponent({
  name: "HolidayApprove",
  components: {
    DutyCalendar,
  },
  data() {
    return {
      renderDate: new Date(),
      applicationRemarks: "",
      showDutyCalendar: false,
      showApproveDialog: false,
      showRejectDialog: false,
      statusSelected: "",
      usersSelected: [],
      selectedRow: [],
      userList: [],
      statusList: [
        { value: "批准", label: "批准" },
        { value: "未批", label: "未批" },
        { value: "拒絕", label: "拒絕" },
      ],
      qdate: qdate,
      pendingApplicationList: [],
      awaitServerResponse: 0,

      defaultPagination: {
        sortBy: "date",
        descending: true,
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
          name: "name",
          label: "員工",
          field: "name",
          style: "font-size: 1.5vw; text-align: center",
          headerStyle: "font-size: 1.5vw; text-align: center;",
          headerClasses: "bg-grey-2",
          sortable: true,
        },
        {
          name: "date",
          label: "日期",
          field: "date",
          style: "font-size: 1.5vw; text-align: center",
          headerStyle: "font-size: 1.5vw; text-align: center;",
          headerClasses: "bg-grey-2",
          sortable: true,
          sortOrder: "da",
          format: (val) =>
            qdate.formatDate(val, "YYYY年M月D日(ddd)", {
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
          sortable: true,
        },
        {
          name: "remarks",
          label: "附註",
          field: "remarks",
          style: "font-size: 1.5vw; text-align: center",
          headerStyle: "font-size: 1.5vw; text-align: center;",
          headerClasses: "bg-grey-2",
        },
        {
          name: "status",
          label: "狀態",
          field: "status",
          style: "font-size: 1.5vw; text-align: center",
          headerStyle: "font-size: 1.5vw; text-align: center;",
          headerClasses: "bg-grey-2",
          sortable: true,
        },
      ],
    };
  },
  methods: {
    singleApprove(row) {
      this.selectedRow = [row];
      this.showApproveDialog = true;
    },
    changeRenderDate(days) {
      if (days > 0) {
        this.renderDate = qdate.addToDate(this.renderDate, { day: days });
      } else {
        this.renderDate = qdate.subtractFromDate(this.renderDate, { day: -days });
      }
    },
    checkForApproval() {
      if (this.selectedRow.length == 0) return true;
      let i = this.selectedRow.findIndex((element) => element.status == "批准");
      return i != -1;
    },
    customFilter(rows, terms) {
      if (terms.usersSelected.length > 0 || terms.statusSelected != "") {
        let rowsReturn = rows;
        if (terms.usersSelected.length > 0) {
          rowsReturn = rowsReturn.filter(
            (row) =>
              terms.usersSelected.findIndex((element) => element.value == row.uid) != -1
          );
        }

        if (terms.statusSelected != "") {
          rowsReturn = rowsReturn.filter(
            (row) => row.status == terms.statusSelected.value
          );
        }
        return rowsReturn;
      } else {
        return rows;
      }
    },
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
    },*/
    async confirmApprove() {
      let leaveData = [];
      let now = new Date();

      let combinedRemarks = [];
      if (this.applicationRemarks.length > 0) {
        combinedRemarks.push(this.username + ": " + this.applicationRemarks);
      }

      combinedRemarks.push(
        "批准：" + qdate.formatDate(now, "YYYY年MM月DD日HH時mm分ss秒")
      );

      for (let doc of this.selectedRow) {
        doc.remarks = combinedRemarks;
        doc.status = "批准";
      }

      const approveLeaveByDocid = FirebaseFunctions.httpsCallable(
        "holiday-approveLeaveByDocid"
      );

      this.awaitServerResponse++;
      approveLeaveByDocid(this.selectedRow).then(() => {
        this.awaitServerResponse--;
        this.refreshHolidayTable();
        this.selectedRow = [];
      });

      this.applicationRemarks = "";
    },
    async confirmReject() {
      let leaveData = [];
      let now = new Date();

      let combinedRemarks = [];
      if (this.applicationRemarks.length > 0) {
        combinedRemarks.push(this.username + ": " + this.applicationRemarks);
      }

      combinedRemarks.push(
        "拒絕：" + qdate.formatDate(now, "YYYY年MM月DD日HH時mm分ss秒")
      );

      for (let doc of this.selectedRow) {
        doc.remarks = combinedRemarks;
        doc.status = "拒絕";
      }

      const rejectLeaveByDocid = FirebaseFunctions.httpsCallable(
        "holiday-rejectLeaveByDocid"
      );

      this.awaitServerResponse++;
      rejectLeaveByDocid(this.selectedRow).then(() => {
        this.awaitServerResponse--;
        this.refreshHolidayTable();
        this.selectedRow = [];
      });

      this.applicationRemarks = "";
    },
    /*
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
      this.rows = [];
      let applications = await leaveCollection.get();

      applications.forEach((doc) => {
        this.rows.push({
          docid: doc.id,
          name: doc.data().name,
          uid: doc.data().uid,
          date: doc.data().date,
          slot: doc.data().slot,
          type: doc.data().type,
          remarks: doc.data().remarks,
          status: doc.data().status,
        });
      });
    },
  },
  async mounted() {
    const userDoc = await usersCollection
      .where("privilege.systemAdmin", "==", false)
      .orderBy("order")
      .get();

    userDoc.forEach((doc) => {
      this.userList.push({
        value: doc.data().uid,
        label: doc.data().name,
      });
    });

    this.awaitServerResponse++;
    this.refreshHolidayTable().then((response) => {
      this.awaitServerResponse--;
    });
  },
  computed: {
    waitingAsync() {
      return this.awaitServerResponse > 0 ? true : false;
    },
    filterValues() {
      return {
        usersSelected: this.usersSelected,
        statusSelected: this.statusSelected,
      };
    },
  },
  setup() {
    const $store = useStore();

    return {
      username: computed(() => $store.getters["userModule/getUsername"]),
    };
  },
});
</script>

<style lang="scss" scoped>
/*
.q-table__container {
  width: 97.2vw;
  table-layout: auto;
}*/
</style>
