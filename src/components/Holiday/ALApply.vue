<template>
  <!-- confirm dialog -->
  <q-dialog v-model="confirmDialog">
    <q-card style="border-radius: 30px">
      <q-card-section>
        <div class="text-h5 text-center" style="border-bottom: 3px solid blue">
          確定申請放假？
        </div>
      </q-card-section>

      <q-card-section style="height: 40vh; max-height: 40vh" class="scroll">
        <q-card v-if="applicationList.length > 0">
          <div class="text-center">
            <q-chip
              icon="add"
              color="primary"
              text-color="white"
              square
              class="text-h6 glossy full-width"
              >新增</q-chip
            >
          </div>
          <q-card-section>
            <q-btn
              v-for="(application, index) in applicationList"
              :key="index"
              :label="
                leaveMap[application.type] +
                qdate.formatDate(application.date, 'YYYY年MM月DD日(ddd)', {
                  daysShort: ['日', '一', '二', '三', '四', '五', '六'],
                }) +
                ' - ' +
                slotMap[application.slot]
              "
              :color="leaveColorMap[application.type]"
              disable
              stretch
              class="full-width q-mb-sm"
              text-color="black"
            />
          </q-card-section>
        </q-card>

        <q-card v-if="deleteApplicationList.length > 0">
          <div class="text-center">
            <q-chip
              icon="cancel"
              color="red"
              text-color="white"
              square
              class="text-h6 glossy full-width"
              >刪除</q-chip
            >
          </div>
          <q-card-section>
            <q-btn
              v-for="(application, index) in deleteApplicationList"
              :key="index"
              :label="
                leaveMap[application.type] +
                qdate.formatDate(application.date, 'YYYY年MM月DD日(ddd)', {
                  daysShort: ['日', '一', '二', '三', '四', '五', '六'],
                }) +
                ' - ' +
                slotMap[application.slot]
              "
              :color="leaveColorMap[application.type]"
              disable
              stretch
              text-color="black"
              size="md"
              class="full-width q-mb-sm"
            />
          </q-card-section>
        </q-card>

        <q-card v-if="changeApplicationList.length > 0">
          <div class="text-center">
            <q-chip
              icon="edit"
              color="warning"
              text-color="white"
              square
              class="text-h6 glossy full-width"
              >修改</q-chip
            >
          </div>

          <q-card
            class="row wrap items-stretch"
            v-for="(application, index) in changeApplicationList"
            :key="index"
          >
            <!-- <q-card class="col-auto bg-green-1 q-pa-md"> -->
            <q-card-section>
              <q-chip square readonly icon="edit" :label="leaveMap[application.type]" />
            </q-card-section>
            <q-separator vertical />
            <q-card-section class="col-auto">
              <div
                v-html="
                  '由：' +
                  qdate.formatDate(application.old.date, 'YYYY年MM月DD日(ddd)', {
                    daysShort: ['日', '一', '二', '三', '四', '五', '六'],
                  }) +
                  ' - ' +
                  slotMap[application.old.slot]
                "
              />
              <div
                v-html="
                  '至：' +
                  qdate.formatDate(application.date, 'YYYY年MM月DD日(ddd)', {
                    daysShort: ['日', '一', '二', '三', '四', '五', '六'],
                  }) +
                  ' - ' +
                  slotMap[application.slot]
                "
              />
            </q-card-section>
          </q-card>
        </q-card>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <q-input v-model="applicationRemarks" label="備註：" />
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn v-close-popup flat color="primary" label="取消" />
        <q-btn
          v-close-popup
          @click="confirmHolidayApplication"
          flat
          color="primary"
          label="確認申請"
          round
          icon="event"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- sticky button at bottom -->
  <q-page-sticky position="bottom-right" :offset="[20, 20]" style="z-index: 1">
    <q-fab
      v-if="
        this.applicationList.length +
          this.deleteApplicationList.length +
          this.changeApplicationList.length !=
        0
      "
      label="申請"
      color="primary"
      push
      @click="confirmDialog = !confirmDialog"
    />
  </q-page-sticky>
  <q-page-sticky position="bottom-left" :offset="[30, 30]" style="z-index: 1">
    <q-btn-toggle
      size="md"
      class="bg-light-blue-2"
      v-model="leaveType"
      push
      toggle-color="primary"
      v-if="isSAL"
      :options="[
        { label: '年假', value: 'AL' },
        { label: '特別年假', value: 'SAL' },
        { label: '病假', value: 'SL' },
        { label: '特別病假', value: 'SSL' },
      ]"
    />
    <q-btn-toggle
      size="md"
      class="bg-light-blue-2"
      v-model="leaveType"
      push
      toggle-color="primary"
      v-else
      :options="[
        { label: '年假', value: 'AL' },
        { label: '病假', value: 'SL' },
        { label: '特別病假', value: 'SSL' },
      ]"
    />
  </q-page-sticky>

  <!-- toolbar -->
  <div class="full-width row no-wrap justify-between q-px-sm">
    <div class="col-md-2 col-lg-2 col-xl-2 col-xs-4 col-sm-4">
      <q-btn
        size="lg"
        outline
        color="primary"
        v-on:click="changeRenderYear(-1)"
        class="q-mx-sm"
      >
        上年
      </q-btn>

      <q-btn size="lg" outline color="primary" v-on:click="changeRenderYear(1)">
        下年
      </q-btn>
    </div>
    <q-space class="col" />
    <div class="row col-md-5 col-lg-5 col-xl-5 col-sm-7 col-xs-8">
      <div class="q-mr-sm col">
        本月結餘
        <q-knob
          :min="0"
          :max="100"
          readonly
          v-model="al_balance"
          show-value
          :thickness="0.22"
          color="primary"
          track-color="grey-3"
        />
      </div>
      <div class="q-mr-sm col">
        年度結餘
        <q-knob
          :min="0"
          :max="100"
          readonly
          v-model="al_YearBalance"
          show-value
          :thickness="0.22"
          color="primary"
          track-color="grey-3"
        />
      </div>
      <div v-if="isSAL" class="col">
        特別結餘
        <q-knob
          :min="0"
          readonly
          v-model="sal_balance"
          show-value
          :thickness="0.22"
          color="primary"
          track-color="grey-3"
        />
      </div>
    </div>
  </div>

  <!-- holidayTable -->
  <div class="row q-mt-sm">
    <q-expansion-item
      v-for="month in renderYear"
      :key="month"
      header-class="bg-primary text-white"
      expand-icon-class="text-white"
      popup
      class="q-mt-sm"
      icon="edit_calendar"
      :label="qdate.formatDate(month, 'YYYY年MM月')"
    >
      <q-table
        dense
        flat
        :rows="rows"
        :columns="columns"
        :pagination="defaultPagination"
        :hide-bottom="true"
        :filter="month"
        :filter-method="customFilter"
        color="primary"
        row-key="date"
      >
        <!-- date cell template -->
        <template v-slot:body-cell-Date="props">
          <q-td :class="[getHoliday(props.row.Date) ? 'isHoliday' : '']"
            >{{ props.value }}
            <div class="bg-red-2" v-if="getHoliday(props.row.Date)">
              ({{ getHoliday(props.row.Date) }})
            </div>
          </q-td>
        </template>

        <!-- all cell template -->
        <template v-slot:body-cell="props">
          <q-td
            :props="props"
            class="q-pa-none dataColumn drop-target rounded-borders overflow-hidden"
            @click="
              props.row[props.col.name + '.approved'] ||
              props.row[props.col.name + '.unapproved']
                ? ''
                : applyHoliday(props)
            "
            @dragenter="onDragEnter"
            @dragleave="onDragLeave"
            @dragover="onDragOver"
            @drop="onDrop"
            :id="props.row.Date"
            :slot="props.col.name"
          >
            <div
              v-if="props.col.name + '.approved' in props.row"
              class="q-my-none q-py-none approved"
            >
              {{ props.value }}
            </div>
            <div
              v-if="props.col.name + '.unapproved' in props.row"
              class="q-my-none q-py-none"
              :id="props.row.Date"
              :slot="props.col.name"
            >
              <q-chip
                square
                removable
                :id="props.row[props.col.name + '.unapprovedDocid']"
                :slotValue="props.col.name"
                :dateValue="props.row.Date"
                draggable="true"
                @dragstart="onDragStart"
                @remove="
                  removeApplication(
                    props.row.Date,
                    props.col.name,
                    props.row[props.col.name + '.unapprovedValue']
                  )
                "
                class="q-pa-md"
                size="md"
                :label="'待批核(' + props.row[props.col.name + '.unapprovedValue'] + ')'"
              />
            </div>
            <div
              v-if="!(props.col.name + '.approved' in props.row)"
              style="display: contents"
              class="q-my-none q-py-none"
            >
              <!-- display holiday type if it is in  applicationList -->
              <q-chip
                square
                removable
                @remove="
                  applicationList.splice(
                    applicationList.findIndex(
                      (element) =>
                        element.date == props.row.Date && element.slot == props.col.name
                    ),
                    1
                  )
                "
                :color="
                  leaveColorMap[
                    applicationList[
                      applicationList.findIndex(
                        (element) =>
                          element.date == props.row.Date && element.slot == props.col.name
                      )
                    ].type
                  ]
                "
                :label="
                  leaveMap[
                    applicationList[
                      applicationList.findIndex(
                        (element) =>
                          element.date == props.row.Date && element.slot == props.col.name
                      )
                    ].type
                  ]
                "
                class="q-pa-md"
                size="md"
                v-if="
                  applicationList.find(
                    (element) =>
                      element.date == props.row.Date && element.slot == props.col.name
                  )
                "
              />

              <div v-if="props.value" style="display: contents">
                {{ props.value }}
              </div>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-expansion-item>

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
  </div>
</template>

<script>
import {
  scheduleCollection,
  leaveCollection,
  FirebaseFunctions,
  usersCollection,
  dashboardCollection,
} from "boot/firebase";

import { useStore } from "vuex";
import { ref, defineComponent, computed } from "vue";
import holiday from "assets/holiday.json";
import { date as qdate } from "quasar";

export default defineComponent({
  name: "ALApply",
  props: {
    renderDate: Date,
  },
  data() {
    return {
      confirmDialog: false,
      al_YearBalance: 0,
      applicationRemarks: "",
      qdate: qdate,
      renderYear: [],
      renderYearOffset: 0,
      leaveType: ref("AL"),
      applicationList: [],
      deleteApplicationList: [],
      changeApplicationList: [],
      originalApplicationList: [],
      leaveMap: {
        AL: "年假",
        SAL: "特別年假",
        SL: "病假",
        SSL: "特別病假",
      },
      leaveColorMap: {
        AL: "red-3",
        SAL: "blue-3",
        SL: "warning",
        SSL: "teal-3",
      },

      queryStartDate: {
        type: Date,
      },
      queryEndDate: {
        type: Date,
      },
      awaitServerResponse: 0,

      defaultPagination: {
        rowsPerPage: 400,
      },
      slotMap: {
        slot_a: "早",
        slot_b: "午",
        slot_c: "晚",
      },
      rows: [],
      columns: [
        {
          name: "Date",
          label: "日期",
          field: "Date",
          style: "font-size: 1.5vw; text-align: center",
          headerStyle: "font-size: 1.5vw; text-align: center;",
          headerClasses: "bg-grey-2 nameColumn",
          format: (val) =>
            qdate.formatDate(val, "M月D日(ddd)", {
              daysShort: ["日", "一", "二", "三", "四", "五", "六"],
            }),
        },
        {
          name: "slot_a",
          label: "早",
          field: "slot_a",
          style: "font-size: 1.5vw; text-align: center",
          headerStyle: "font-size: 1.5vw; text-align: center;",
          headerClasses: "bg-grey-2",
        },
        {
          name: "slot_b",
          label: "午",
          field: "slot_b",
          style: "font-size: 1.5vw; text-align: center",
          headerStyle: "font-size: 1.5vw; text-align: center;",
          headerClasses: "bg-grey-2",
        },
        {
          name: "slot_c",
          label: "晚",
          field: "slot_c",
          style: "font-size: 1.5vw; text-align: center",
          headerStyle: "font-size: 1.5vw; text-align: center;",
          headerClasses: "bg-grey-2",
        },
      ],
    };
  },
  methods: {
    // store the id of the draggable element
    onDragStart(e) {
      e.dataTransfer.setData("text", e.target.id);
      e.dataTransfer.dropEffect = "move";
    },
    onDragEnter(e) {
      // don't drop on other draggables
      if (e.target.draggable !== true) {
        e.target.classList.add("drag-enter");
      }
    },
    onDragLeave(e) {
      e.target.classList.remove("drag-enter");
    },
    onDragOver(e) {
      e.preventDefault();
    },
    onDrop(e) {
      e.preventDefault();

      // don't drop on other draggables
      if (e.target.draggable === true) {
        return;
      }

      const draggedId = e.dataTransfer.getData("text");
      const draggedEl = document.getElementById(draggedId);

      // check if original parent node
      if (draggedEl.parentNode === e.target) {
        e.target.classList.remove("drag-enter");
        return;
      }

      /*
      console.log("date: " + draggedEl.getAttribute("dateValue"));
      console.log("slot: " + draggedEl.getAttribute("slotValue"));
      console.log("docid: " + draggedEl.getAttribute("id"));
      */

      // make the exchange
      // draggedEl.parentNode.removeChild(draggedEl);
      // e.target.appendChild(draggedEl);
      let sourceIndex = this.rows.findIndex(
        (element) => element.Date == draggedEl.getAttribute("dateValue")
      );
      let targetIndex = this.rows.findIndex((element) => element.Date == e.target.id);

      if (this.rows[targetIndex][e.target.slot + ".unapproved"]) {
        return;
      }
      this.rows[targetIndex][e.target.slot + ".unapprovedDocid"] = this.rows[sourceIndex][
        draggedEl.getAttribute("slotValue") + ".unapprovedDocid"
      ];
      this.rows[targetIndex][e.target.slot + ".unapproved"] = this.rows[sourceIndex][
        draggedEl.getAttribute("slotValue") + ".unapproved"
      ];
      this.rows[targetIndex][e.target.slot + ".unapprovedValue"] = this.rows[sourceIndex][
        draggedEl.getAttribute("slotValue") + ".unapprovedValue"
      ];
      delete this.rows[sourceIndex][
        draggedEl.getAttribute("slotValue") + ".unapprovedDocid"
      ];
      delete this.rows[sourceIndex][draggedEl.getAttribute("slotValue") + ".unapproved"];
      delete this.rows[sourceIndex][
        draggedEl.getAttribute("slotValue") + ".unapprovedValue"
      ];

      e.target.classList.remove("drag-enter");
      let i = this.originalApplicationList.findIndex(
        (element) => element.docid == draggedId
      );
      // add change to changeApplicationList
      let existIndex = this.changeApplicationList.findIndex(
        (element) => element.docid == draggedId
      );
      if (existIndex >= 0) {
        this.changeApplicationList[existIndex] = {
          docid: draggedId,
          action: "update",
          date: new Date(e.target.id),
          slot: e.target.slot,
          type: this.originalApplicationList[i].type,
          old: { ...this.originalApplicationList[i] },
        };
      } else {
        this.changeApplicationList.push({
          docid: draggedId,
          action: "update",
          date: new Date(e.target.id),
          slot: e.target.slot,
          type: this.originalApplicationList[i].type,
          old: { ...this.originalApplicationList[i] },
        });
      }
    },
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
    customFilter(rows, terms) {
      return rows.filter(
        (row) => qdate.formatDate(row.Date, "YYYYMM") == qdate.formatDate(terms, "YYYYMM")
      );
    },
    async updateApplicationList() {
      this.originalApplicationList = [];
      let applications = await leaveCollection
        .where("uid", "==", this.uid)
        .where("status", "==", "未批")
        .get();

      applications.forEach((doc) => {
        if (
          qdate.isSameDate(
            doc.data().date,
            new Date(
              this.renderDate.getFullYear() + this.renderYearOffset,
              this.renderDate.getMonth(),
              this.renderDate.getDay()
            ),
            "year"
          )
        ) {
          this.originalApplicationList.push({
            docid: doc.id,
            date: doc.data().date,
            slot: doc.data().slot,
            type: doc.data().type,
          });
        }
      });
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
    },
    async changeRenderYear(years) {
      // proceed year change if it is not before 2021 where system start
      if (this.renderDate.getFullYear() + this.renderYearOffset + years >= 2021) {
        // pull up loading screen until server respond
        this.awaitServerResponse++;
        this.renderYearOffset += years;
        this.refreshHolidayTable().then((response) => {
          this.awaitServerResponse--;
        });
      }
    },
    getHoliday(date) {
      let d = qdate.formatDate(date, "YYYYMMDD");
      let i = this.publicHoliday.findIndex((element) => element.date == d);
      if (i == -1) {
        return "";
      } else {
        return this.publicHoliday[i].summary;
      }
    },
    async updateYearEndBalance() {
      // get leaveConfig
      const leaveConfigDoc = await dashboardCollection.doc("leaveConfig").get();
      const leaveConfigData = leaveConfigDoc.data();
      const tiers = leaveConfigData[this.rank];

      // get AL starting balance
      const systemStartBalance = leaveConfigData[this.uid][0].al;

      // determine year end
      const now = new Date();
      let yearEnd;
      if (now.getMonth() < 3) {
        yearEnd = qdate.buildDate({
          year: now.getFullYear(),
          month: 3,
          days: 31,
          hours: 23,
          minutes: 59,
          seconds: 59,
          millisecond: 999,
        });
      } else {
        yearEnd = qdate.buildDate({
          year: now.getFullYear() + 1,
          month: 3,
          days: 31,
          hours: 23,
          minutes: 59,
          seconds: 59,
          millisecond: 999,
        });
      }

      // determine data retrieval boundary combining yearEnd and dateOfExit
      const dataBoundary =
        this.dateOfExit && this.dateOfExit.toDate() < yearEnd
          ? this.dateOfExit.toDate()
          : yearEnd;

      const leaveDocData = await leaveCollection
        .where("uid", "==", this.uid)
        .where("status", "==", "批准")
        .get();
      let leaveData = [];
      leaveDocData.forEach((doc) => {
        let d = new Date(doc.data().date);
        if (d.getTime() < dataBoundary.getTime()) {
          leaveData.push(doc);
        }
      });

      const totalALTaken = leaveData.length / 2;

      let totalGain = 0;
      // begin with system start date
      let systemStart = new Date("2021/04/01");
      let monthLoop = systemStart;
      do {
        const yearServed =
          qdate.getDateDiff(
            qdate.endOfDate(monthLoop, "month"),
            this.dateOfEntry.toDate(),
            "month"
          ) / 12;

        let tier = 0;
        const tiersConfig = [0, 5, 8, 10, 12];
        for (let j = tiersConfig.length; j > 0; j--) {
          if (yearServed >= tiersConfig[j - 1]) {
            tier = tiers["t" + j];
            break;
          }
        }
        let perMonthGain = tier / 12;

        let lastWorkingDate = qdate.addToDate(this.dateBoundary, { days: -1 });

        if (
          qdate.getDateDiff(this.dateBoundary, monthLoop) <
          qdate.daysInMonth(lastWorkingDate)
        ) {
          perMonthGain = 0;
        }
        totalGain += perMonthGain;
        monthLoop = qdate.addToDate(monthLoop, { month: 1 });
      } while (qdate.getDateDiff(monthLoop, dataBoundary, "day") < 0);

      this.al_YearBalance = systemStartBalance + totalGain - totalALTaken;
    },
    async refreshHolidayTable() {
      this.renderYear = [];
      this.rows = [];
      let queryStartDate = new Date(
        this.renderDate.getFullYear() + this.renderYearOffset,
        0,
        1,
        8,
        0,
        0
      );

      let queryYearEndDate = qdate.endOfDate(queryStartDate, "year");
      let queryEndDate =
        this.dateOfExit && this.dateOfExit.toDate() < queryYearEndDate
          ? qdate.subtractFromDate(this.dateOfExit.toDate(), { days: 1 })
          : queryYearEndDate;

      let i = queryStartDate;
      while (qdate.getDateDiff(queryEndDate, i, "day") > 0) {
        this.renderYear.push(i);
        i = qdate.addToDate(i, { months: 1 });
      }

      i = queryStartDate;
      // build rows with dates
      while (qdate.getDateDiff(queryEndDate, i, "day") >= 0) {
        this.rows.push({
          Date: i,
        });
        i = qdate.addToDate(i, { days: 1 });
      }

      // load schedule date in the year
      let schedules = await scheduleCollection
        .where("date", ">=", queryStartDate)
        .where("date", "<=", queryEndDate)
        .where("uid", "==", this.uid)
        .get();

      schedules.forEach((doc) => {
        this.rows[
          this.rows.findIndex(
            (element) =>
              qdate.formatDate(element.Date, "YYYYMMDD") ==
              qdate.formatDate(doc.data().date.toDate(), "YYYYMMDD")
          )
        ][doc.data().slot] = doc.data().type;
      });

      // query all leave records
      let leaves = await leaveCollection
        .where("status", "==", "批准")
        .where("uid", "==", this.uid)
        .get();

      // attach .approved to the approved slot
      leaves.forEach((doc) => {
        let slotApproved = doc.data().slot + ".approved";
        let i = this.rows.findIndex(
          (element) =>
            qdate.formatDate(element.Date, "YYYYMMDD") ==
            qdate.formatDate(doc.data().date, "YYYYMMDD")
        );
        if (i >= 0) {
          this.rows[i][slotApproved] = true;
        }
      });

      this.originalApplicationList.forEach((doc) => {
        let slotUnapproved = doc.slot + ".unapproved";
        let slotValue = doc.slot + ".unapprovedValue";
        let docidValue = doc.slot + ".unapprovedDocid";

        // console.log("docdate: " + qdate.formatDate(doc.date, "YYYYMMDD"));
        let i = this.rows.findIndex(
          (element) =>
            qdate.formatDate(element.Date, "YYYYMMDD") ==
            qdate.formatDate(doc.date, "YYYYMMDD")
        );

        if (i >= 0) {
          this.rows[i][slotUnapproved] = true;
          this.rows[i][slotValue] = doc.type;
          this.rows[i][docidValue] = doc.docid;
        }
      });
    },
  },
  async mounted() {
    this.awaitServerResponse++;
    this.updateApplicationList().then((response) => {
      this.awaitServerResponse--;
    });
    this.awaitServerResponse++;
    this.refreshHolidayTable().then((response) => {
      this.awaitServerResponse--;
    });
    this.awaitServerResponse++;
    this.updateYearEndBalance().then((response) => {
      this.awaitServerResponse--;
    });
  },
  computed: {
    publicHoliday: function () {
      var ph = [];
      holiday.vcalendar[0].vevent.forEach((record) => {
        ph.push({
          date: record.dtstart[0],
          summary: record.summary,
        });
      });
      return ph;
    },
    waitingAsync() {
      return this.awaitServerResponse > 0 ? true : false;
    },
  },
  setup() {
    const $store = useStore();

    return {
      uid: computed(() => $store.getters["userModule/getUID"]),
      username: computed(() => $store.getters["userModule/getUsername"]),
      al_balance: computed(() => $store.getters["userModule/getALBalance"]),
      sal_balance: computed(() => $store.getters["userModule/getSALBalance"]),
      isSAL: computed(() => $store.getters["userModule/getSAL"]),
      dateOfExit: computed(() => $store.getters["userModule/getDateOfExit"]),
      dateOfEntry: computed(() => $store.getters["userModule/getDateOfEntry"]),
      rank: computed(() => $store.getters["userModule/getRank"]),
    };
  },
});
</script>

<style lang="scss" scoped>
.isHoliday {
  background-color: $red-2;
}

.toolbar {
  max-width: 95%;
}

.q-table__container {
  width: 97.2vw;
  font-size: 1.3vw;
  table-layout: auto;
}

.q-table__container .q-table--grid {
  font-size: 2vw;
}

.gridCard {
  font-size: 4vw;
}

i.notranslate.material-icons.q-icon {
  display: none !important;
}

.drag-enter {
  outline-style: dashed;
}

@media screen {
  .q-table thead .q-tr th {
    border: 0.5px solid black;
    border-collapse: collapse;
    padding: 0 !important;
    font-size: 1.3vw;
  }

  .q-table tbody td {
    text-align: center;
    border: 0.5px solid black;
    border-collapse: collapse;
    padding: 0 !important;
    height: 31px;
    font-size: 1.3vw;
  }

  .q-table .nameColumn {
    width: 40%;
    max-width: 40%;
  }

  .q-table .dataColumn {
    width: 20%;
    max-width: 20%;
  }

  .q-table div.approved {
    background-color: $green-3;
  }
}

@media print {
  .q-table td,
  th {
    border: 0.5px solid grey;
    border-collapse: collapse;
    text-align: center;
  }

  .q-table thead .q-tr th {
    font-size: 1.3vw;
    background-color: lightgrey;
    padding: 0 !important;
  }

  .q-table .nameColumn {
    width: 9vw;
    padding: 0 !important;
    font-size: 1.3vw;
  }

  .q-table .dataColumn {
    width: 4.2vw;
    padding: 0 !important;
    font-size: 1.3vw;
  }

  .q-table div.approved {
    background-color: lightgrey;
  }
}
</style>
