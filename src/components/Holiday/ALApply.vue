<template>
  <!-- loading dialog -->
  <q-dialog v-model="waitingAsync" position="bottom">
    <LoadingDialog message="儲存中"/>
  </q-dialog>

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
  <q-page-sticky position="bottom-left" :offset="[30, 80]" style="z-index: 1">
    <q-fab
      v-if="
        applicationList.length +
          deleteApplicationList.length +
          changeApplicationList.length !=
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

  <!-- holidayTable -->
  <div class="row">
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
        :pagination="pagination"
        :hide-bottom="true"
        :filter="month"
        :filter-method="customFilter"
        color="primary"
        row-key="date"
      >
        <!-- date cell template -->
        <template v-slot:body-cell-Date="props">
          <q-td
            style="font-size: 2.5vw; text-align: center"
            :class="[getHoliday(props.row.Date) ? 'isHoliday' : '']"
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
  </div>
</template>

<script setup>
import {
  scheduleCollection,
  leaveCollection,
  FirebaseFunctions,
} from "boot/firebase";
import { useStore } from "vuex";
import { ref, computed, onMounted } from "vue";
import holiday from "assets/holiday.json";
import { date as qdate } from "quasar";
import LoadingDialog from "components/LoadingDialog.vue"
import { getDocs, query, where } from "firebase/firestore";
import { httpsCallable } from "@firebase/functions";


const props = defineProps({
  renderDate: Date,
  renderYearOffset: Number,
})

const $store = useStore();
const deleteApplicationList = ref([])
const originalApplicationList = ref([])
const changeApplicationList = ref([])
const applicationList = ref([])
const renderYear = ref([])
const confirmDialog = ref(false)
const awaitServerResponse = ref(0)
const leaveType = ref("AL")
const rows = ref([])
const applicationRemarks = ref("")
// table config
const slotMap = ref({
  slot_a: "早",
  slot_b: "午",
  slot_c: "晚",
})

const leaveMap = ref({
  AL: "年假",
  SAL: "特別年假",
  SL: "病假",
  SSL: "特別病假",
})

const leaveColorMap = ref({
  AL: "red-3",
  SAL: "blue-3",
  SL: "warning",
  SSL: "teal-3",
})

const columns = ref([
  {
    name: "Date",
    label: "日期",
    field: "Date",
    style: "font-size: 2.5vw; text-align: center",
    headerStyle: "font-size: 2.5vw; text-align: center;",
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
    style: "font-size: 2.5vw; text-align: center",
    headerStyle: "font-size: 2.5vw; text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "slot_b",
    label: "午",
    field: "slot_b",
    style: "font-size: 2.5vw; text-align: center",
    headerStyle: "font-size: 2.5vw; text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "slot_c",
    label: "晚",
    field: "slot_c",
    style: "font-size: 2.5vw; text-align: center",
    headerStyle: "font-size: 2.5vw; text-align: center;",
    headerClasses: "bg-grey-2",
  },
])

const pagination = ref({
  rowsPerPage: 400,
})

// computed
const publicHoliday = computed(() => holiday? holiday.vcalendar[0].vevent.map(({dtstart, summary}) => ({date: dtstart[0], summary: summary})): [])
const waitingAsync = computed(() => awaitServerResponse.value > 0)
const uid = computed(() => $store.getters["userModule/getUID"])
const username = computed(() => $store.getters["userModule/getUsername"])
const isSAL = computed(() => $store.getters["userModule/getSAL"])
const dateOfExit = computed(() => $store.getters["userModule/getDateOfExit"])


// drag and drop event handling
// store the id of the draggable element
function onDragStart(e) {
  e.dataTransfer.setData("text", e.target.id);
  e.dataTransfer.dropEffect = "move";
}

function onDragEnter(e) {
  // don't drop on other draggables
  if (e.target.draggable !== true) {
    e.target.classList.add("drag-enter");
  }
}

function onDragLeave(e) {
  e.target.classList.remove("drag-enter");
}
function onDragOver(e) {
  e.preventDefault();
}

function onDrop(e) {
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
  let sourceIndex = rows.value.findIndex(
    (element) => element.Date == draggedEl.getAttribute("dateValue")
  );
  let targetIndex = rows.value.findIndex((element) => element.Date == e.target.id);

  if (rows.value[targetIndex][e.target.slot + ".unapproved"]) {
    return;
  }
  rows.value[targetIndex][e.target.slot + ".unapprovedDocid"] = rows.value[sourceIndex][
    draggedEl.getAttribute("slotValue") + ".unapprovedDocid"
  ];
  rows.value[targetIndex][e.target.slot + ".unapproved"] = rows.value[sourceIndex][
    draggedEl.getAttribute("slotValue") + ".unapproved"
  ];
  rows.value[targetIndex][e.target.slot + ".unapprovedValue"] = rows.value[sourceIndex][
    draggedEl.getAttribute("slotValue") + ".unapprovedValue"
  ];
  delete rows.value[sourceIndex][
    draggedEl.getAttribute("slotValue") + ".unapprovedDocid"
  ];
  delete rows.value[sourceIndex][draggedEl.getAttribute("slotValue") + ".unapproved"];
  delete rows.value[sourceIndex][
    draggedEl.getAttribute("slotValue") + ".unapprovedValue"
  ];

  e.target.classList.remove("drag-enter");
  let i = originalApplicationList.value.findIndex(
    (element) => element.docid == draggedId
  );
  // add change to changeApplicationList
  let existIndex = changeApplicationList.value.findIndex(
    (element) => element.docid == draggedId
  );
  if (existIndex >= 0) {
    changeApplicationList.value[existIndex] = {
      docid: draggedId,
      action: "update",
      date: new Date(e.target.id),
      slot: e.target.slot,
      type: originalApplicationList.value[i].type,
      old: { ...originalApplicationList.value[i] },
    };
  } else {
    changeApplicationList.value.push({
      docid: draggedId,
      action: "update",
      date: new Date(e.target.id),
      slot: e.target.slot,
      type: originalApplicationList.value[i].type,
      old: { ...originalApplicationList.value[i] },
    });
  }
}

// other functions
function removeApplication(date, slot, type) {
  const docidAttributeName = slot + ".unapprovedDocid";
  let index = rows.value.findIndex((element) => element.Date == date);
  let docid = rows.value[index][docidAttributeName];

  let changeIndex = changeApplicationList.value.findIndex(
    (element) => element.docid == docid
  );

  if (changeIndex >= 0) {
    deleteApplicationList.value.push({
      docid: docid,
      action: "delete",
      date: changeApplicationList.value[changeIndex].old.date,
      slot: changeApplicationList.value[changeIndex].old.slot,
      type: changeApplicationList.value[changeIndex].old.type,
    });
    changeApplicationList.value.splice(changeIndex, 1);
  } else {
    deleteApplicationList.value.push({
      docid: docid,
      action: "delete",
      date: date,
      slot: slot,
      type: type,
    });
  }
  delete rows.value[index][slot + ".unapproved"];
  delete rows.value[index][slot + ".unapprovedValue"];
  delete rows.value[index][slot + ".unapprovedDocid"];
}

function confirmHolidayApplication() {
  let leaveData = [];
  let now = new Date();

  let combinedRemarks = [];
  if (applicationRemarks.value.length > 0)
    combinedRemarks.push(username.value + ": " + applicationRemarks.value);

  // call https functions to modify leave
  if (changeApplicationList.value.length > 0) {
    combinedRemarks.push(
      "修改：" + qdate.formatDate(now, "YYYY年MM月DD日HH時mm分ss秒")
    );

    for (let doc of changeApplicationList.value) {
      doc.remarks = combinedRemarks;
    }

    const modifyLeaveByDocid = httpsCallable(FirebaseFunctions,
      "holiday-modifyLeaveByDocid"
    );

    awaitServerResponse.value++;
    modifyLeaveByDocid(changeApplicationList.value).then(() => {
      awaitServerResponse.value--;
      updateTable()
      changeApplicationList.value = [];
    });
  }

  // call https functions to delete existing applications
  if (deleteApplicationList.value.length > 0) {
    const delLeaveByDocid = httpsCallable(FirebaseFunctions,
      "holiday-delLeaveByDocid"
    );
    awaitServerResponse.value++;
    delLeaveByDocid(deleteApplicationList.value)
      .then(() => {
        awaitServerResponse.value--;
        updateTable()
        deleteApplicationList.value = [];
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // call https functions to add leaves
  if (applicationList.value.length > 0) {
    combinedRemarks.push(
      "申請：" + qdate.formatDate(now, "YYYY年MM月DD日HH時mm分ss秒")
    );
    applicationList.value.forEach((leave) => {
      leaveData.push({
        date: leave.date.toISOString(),
        type: leave.type,
        slot: leave.slot,
        uid: uid.value,
        name: username.value,
        validity: true,
        status: "未批",
        remarks: combinedRemarks,
      });
    });

    const addLeave = httpsCallable(FirebaseFunctions, "holiday-addLeave");
    awaitServerResponse.value++;
    addLeave(leaveData)
      .then(() => {
        awaitServerResponse.value--;
        updateTable()
        applicationList.value = [];
      })
      .catch((error) => {
        console.log(error.message);
      });
  }
  applicationRemarks.value = "";
}

function customFilter(rows, terms) {
  return rows.filter(
    (row) => qdate.formatDate(row.Date, "YYYYMM") == qdate.formatDate(terms, "YYYYMM")
  );
}


function applyHoliday(props) {
  // add the clicked slot to applicationList array
  let i = applicationList.value.findIndex(
    (element) => element.date == props.row.Date && element.slot == props.col.name
  );

  if (i >= 0) applicationList.value.splice(i, 1);
  applicationList.value.push({
    date: props.row.Date,
    slot: props.col.name,
    type: leaveType.value,
  });
}

function getHoliday(date) {
  let d = qdate.formatDate(date, "YYYYMMDD");
  let i = publicHoliday.value.findIndex((element) => element.date == d);
  if (i == -1) {
    return "";
  } else {
    return publicHoliday.value[i].summary;
  }
}

// module logic

function updateTable() {
  awaitServerResponse.value++
  rows.value = []
  renderYear.value = []
  originalApplicationList.value = []
  let queryStartDate = new Date(
    props.renderDate.getFullYear() + props.renderYearOffset,
    0,
    1,
    8,
    0,
    0
  );
  let queryYearEndDate = qdate.endOfDate(queryStartDate, "year");

  let queryEndDate =
      dateOfExit.value && dateOfExit.value.toDate() < queryYearEndDate
        ? qdate.subtractFromDate(dateOfExit.value.toDate(), { days: 1 })
        : queryYearEndDate;

  // build months in table
  let i = queryStartDate;
  while (qdate.getDateDiff(queryEndDate, i, "day") > 0) {
    renderYear.value.push(i);
    i = qdate.addToDate(i, { months: 1 });
  }

  i = queryStartDate;
  // build rows with dates
  while (qdate.getDateDiff(queryEndDate, i, "day") >= 0) {
    rows.value.push({
      Date: i,
    });
    i = qdate.addToDate(i, { days: 1 });
  }

  const scheduleQuery = query(scheduleCollection,
    where("date", ">=", queryStartDate),
    where("date", "<=", queryEndDate),
    where("uid", "==", uid.value)
  )

  // load schedule date in the year
  getDocs(scheduleQuery).then((schedules)=> {
    schedules.forEach((doc) => {
      rows.value[
        rows.value.findIndex(
          (element) =>
            qdate.formatDate(element.Date, "YYYYMMDD") ==
            qdate.formatDate(doc.data().date.toDate(), "YYYYMMDD")
        )
      ][doc.data().slot] = doc.data().type;
    });

    const leaveQuery = query(leaveCollection,
      where("uid", "==", uid.value)
    )

    // get original application list
    getDocs(leaveQuery).then((applications) => {
      applications.forEach((doc) => {
        if (doc.data().status == "未批") {
          if (
            qdate.isSameDate(
              doc.data().date,
              new Date(
                props.renderDate.getFullYear() + props.renderYearOffset,
                props.renderDate.getMonth(),
                props.renderDate.getDay()
              ),
              "year"
            )
          ) {
            originalApplicationList.value.push({
              docid: doc.id,
              date: doc.data().date,
              slot: doc.data().slot,
              type: doc.data().type,
            });
          }
        } else {
          let slotApproved = doc.data().slot + ".approved";
          let i = rows.value.findIndex(
            (element) =>
              qdate.formatDate(element.Date, "YYYYMMDD") ==
              qdate.formatDate(doc.data().date, "YYYYMMDD")
          );
          if (i >= 0) {
            rows.value[i][slotApproved] = true;
          }
        }
      })

      originalApplicationList.value.forEach((doc) => {
        let slotUnapproved = doc.slot + ".unapproved";
        let slotValue = doc.slot + ".unapprovedValue";
        let docidValue = doc.slot + ".unapprovedDocid";

        // console.log("docdate: " + qdate.formatDate(doc.date, "YYYYMMDD"));
        let i = rows.value.findIndex(
          (element) =>
            qdate.formatDate(element.Date, "YYYYMMDD") ==
            qdate.formatDate(doc.date, "YYYYMMDD")
        );

        if (i >= 0) {
          rows.value[i][slotUnapproved] = true;
          rows.value[i][slotValue] = doc.type;
          rows.value[i][docidValue] = doc.docid;
        }
      })
      awaitServerResponse.value--
    })
  })
}

onMounted(() => {
  updateTable()
})
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
