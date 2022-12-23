<template>
  <!-- loading dialog -->
  <q-dialog v-model="waitingAsync" position="bottom">
    <LoadingDialog message="儲存中"/>
  </q-dialog>

  <!-- dutycalender table -->
  <q-table
    dense
    flat
    :grid="$q.screen.lt.sm && !printOnly"
    :rows="rows"
    :columns="columns"
    :pagination="defaultPagination"
    :hide-bottom="true"
    color="primary"
    row-key="name"
    card-container-style="font-size: 4vw;"
    table-class="q-pa-none"
    square
  >
    <!-- header template -->
    <template v-slot:header="props">
      <q-tr :props="props" class="bg-blue-2">
        <template
          style="display: contents"
          v-for="(col, index) in props.cols"
          :key="col.name"
          :props="props"
        >
          <q-th v-if="index == 0" rowspan="2" class="vertical-bottom nameColumn">
            <div v-html="qdate.formatDate(renderDate, 'YYYY年')" />
            {{ col.label }}
          </q-th>
          <q-th v-if="index % 3 == 1" colspan="3" :class="[
              'q-px-md',
              getHoliday(dateUtil.splitDateSlot(col.label)[0]) != '' ? 'bg-red-2' : '',
            ]">
            <span>
              {{ qdate.formatDate(dateUtil.splitDateSlot(col.label)[0], "M月D日")
              }}{{ dateUtil.daysOfWeek(dateUtil.splitDateSlot(col.label)[0]) }}
              <q-tooltip
                v-if="getHoliday(dateUtil.splitDateSlot(col.label)[0]) != ''"
                anchor="top middle"
                self="bottom middle"
                :offset="[10, 10]"
                transition-show="flip-right"
                transition-hide="flip-left"
              >
                {{ getHoliday(dateUtil.splitDateSlot(col.label)[0]) }}
              </q-tooltip>
            </span>
          </q-th>
        </template>
      </q-tr>
      <q-tr class="bg-blue-2">
        <template
          style="display: contents"
          v-for="(col, index) in props.cols"
          :key="col.name"
          :props="props"
        >
          <q-th v-if="index > 0" class="dataColumn">
            {{ slotMap[dateUtil.splitDateSlot(col.label)[1]] }}
          </q-th>
        </template>
      </q-tr>
    </template>

    <!-- username column template -->
    <template v-slot:body-cell-name="props">
      <q-td :props="props" class="q-pa-none nameColumn">
        <div class="row wrap">
          <div>
            {{ props.value }}
          </div>
          <q-btn
            class="q-mx-auto"
            size="1vw"
            color="primary"
            dense
            outline
            icon="edit"
            v-if="canModifyTable(props.row.uid) && !rowUnderModification"
            @click="toggleModifyTable(props.row)"
            >編更
          </q-btn>
        </div>
        <span class="row">
          <q-btn
            size="1vw"
            class="col"
            color="primary"
            dense
            outline
            icon="save"
            :disabled="validateEditingRow"
            v-if="
              canModifyTable(props.row.uid) && rowUnderModification == props.row.uid
            "
            @click="updateTable()"
            >儲存
          </q-btn>
          <q-btn
            size="1vw"
            class="col"
            color="primary"
            dense
            outline
            icon="input"
            v-if="
              canModifyTable(props.row.uid) && rowUnderModification == props.row.uid
            "
            @click="loadDefault(props.row)"
            >預設
          </q-btn>
        </span>
      </q-td>
    </template>

    <!-- all cell template -->
    <template v-slot:body-cell="props">
      <q-td :props="props" :class="['q-pa-none', 'dataColumn', Object.keys(props.row).includes(props.col.name + '.approved')? 'approved': '']">
        <template
          v-if="
            rowUnderModification == props.row.uid &&
            !(props.col.name + '.approved' in props.row)
          "
        >
          <q-select
            new-value-mode="add"
            class="q-ma-none"
            hide-dropdown-icon
            use-input
            :options="dutyInputOptions"
            color="primary"
            bg-color="green-2"
            dense
            options-dense
            tabindex="0"
            v-model="editingRow[props.col.name]"
            @input-value="
              (val) => {
                tempInputValue = val;
              }
            "
            @update:model-value="
              (val) => {
                tempInputValue = val;
              }
            "
            @blur="updateEditingRow(props.col.name)"
            :rules="[(val) => validateInput(val)]"
          >
            <template v-if="editingRow[props.col.name]" v-slot:append>
              <q-icon
                name="cancel"
                tabindex="-1"
                @click.stop="editingRow[props.col.name] = null"
                class="cursor-pointer"
              />
            </template>
          </q-select>
        </template>
        <div class="q-my-none q-py-none">
          {{ props.value? props.value : '&nbsp' }}
        </div>
      </q-td>
    </template>

    <!-- top row template -->
    <template v-slot:top v-if="$q.screen.lt.sm && !printOnly">
      <div class="text-h5 text-bold">
        <span
          v-html="qdate.formatDate(dateUtil.splitDateSlot(Object(columns[1]).name)[0], 'YYYY年')"
        />
        {{ qdate.formatDate(dateUtil.splitDateSlot(Object(columns[1]).name)[0], "M月D日") }} 至
        {{ qdate.formatDate(dateUtil.splitDateSlot(Object(columns[21]).name)[0], "M月D日") }}
      </div>
    </template>

    <!-- grid template -->
    <template v-slot:item="props">
      <q-card class="q-pa-xs col-xs-12 col-sm-6 col-md-4 q-mb-xs">
        <q-card-section class="row">
          <span>員工: </span><strong>{{ props.row.name }}</strong>

          <q-btn
            class="q-mx-sm q-pa-xs"
            color="primary"
            icon="edit"
            outline
            dense
            v-if="canModifyTable(props.row.uid) && !rowUnderModification"
            @click="toggleModifyTable(props.row)"
            label="編更"
          />

          <q-btn
            class="q-mx-sm q-pa-xs"
            color="primary"
            icon="save"
            outline
            dense
            :disabled="validateEditingRow"
            v-if="
              canModifyTable(props.row.uid) && rowUnderModification == props.row.uid
            "
            @click="updateTable()"
            label="儲存"
          />

          <q-btn
            class="q-mx-sm q-pa-xs"
            color="primary"
            icon="input"
            outline
            dense
            v-if="
              canModifyTable(props.row.uid) && rowUnderModification == props.row.uid
            "
            @click="loadDefault(props.row)"
            label="預設"
          />

          <q-space />
          <q-btn
            color="grey"
            round
            flat
            dense
            :icon="
              qcardExpanded[props.row.uid] ? 'keyboard_arrow_up' : 'keyboard_arrow_down'
            "
            @click="qcardExpanded[props.row.uid] = !qcardExpanded[props.row.uid]"
          />
        </q-card-section>
        <q-slide-transition v-show="qcardExpanded[props.row.uid]">
          <q-card-section>
            <div v-for="(col, index) in props.cols" class="text-h6">
              <template v-if="col.label != '員工'">
                <div style="border-bottom: 1px solid black" class="row justify-around">
                  <div class="col-auto text-left q-ml-sm">
                    {{ qdate.formatDate(dateUtil.splitDateSlot(col.label)[0], "M月D日") }}
                    {{ slotMap[dateUtil.splitDateSlot(col.label)[1]] }}
                  </div>
                  <q-space />
                  <div class="col-2 text-right q-mr-sm">
                    <div
                      v-if="
                        rowUnderModification == props.row.uid &&
                        !(col.name + '.approved' in props.row)
                      "
                    >
                      <q-select
                        hide-bottom-space
                        behavior="dialog"
                        new-value-mode="add"
                        clearable
                        use-input
                        :options="dutyInputOptions"
                        color="primary"
                        bg-color="green-2"
                        dense
                        options-dense
                        v-model="editingRow[col.name]"
                        @input-value="
                          (val) => {
                            tempInputValue = val;
                          }
                        "
                        @update:model-value="
                          (val) => {
                            tempInputValue = val;
                          }
                        "
                        @blur="updateEditingRow(col.name)"
                        :rules="[(val) => validateInput(val)]"
                      ></q-select>
                    </div>
                    <div v-else>
                      <q-chip
                        square
                        color="secondary"
                        size="md"
                        v-if="col.name + '.approved' in props.row"
                        >{{ props.row[col.name] }}</q-chip
                      >
                      <span v-else style="display: contents">{{
                        props.row[col.name]
                      }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </q-card-section>
        </q-slide-transition>
      </q-card>
    </template>
  </q-table>
</template>

<script setup>
import {
  scheduleCollection,
  leaveCollection,
  FirebaseFunctions,
  usersCollection,
} from "boot/firebase";
import { useStore } from "vuex";
import { ref, computed, onUnmounted } from "vue";
import dateUtil from "src/lib/date.js";
import { date as qdate } from "quasar";
import LoadingDialog from "components/LoadingDialog.vue"
import { getDocs, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

// props
const props = defineProps({
  renderDate: Date,
  allowModify: Boolean,
  printOnly: Boolean,
})

// variables  
const tempInputValue = ref("")
const qcardExpanded = ref([])
const queryStartDate = props.renderDate? ref(qdate.startOfDate( qdate.subtractFromDate(props.renderDate, { days: qdate.formatDate(props.renderDate, "d")}), 'day')): ""
const queryEndDate = props.renderDate? ref(qdate.endOfDate( qdate.addToDate(props.renderDate, { days: 6 - qdate.formatDate(props.renderDate, "d")}), 'day')): ""
const awaitServerResponse = ref(0)
const rowUnderModification = ref("")
const $store = useStore();
const scheduleSnapshot = ref()
const leaveSnapshot = ref()
const editingRow = ref([])

// options
const dutyInputOptions = ref(["覆", "O", "M", "補", "長", "短"],)
const slotMap = ref({
  slot_a: "早",
  slot_b: "午",
  slot_c: "晚",
})

// computed
const publicHoliday = computed(() => holiday? holiday.vcalendar[0].vevent.map(({dtstart, summary}) => ({date: dtstart[0], summary: summary})): [])
const waitingAsync = computed(() => awaitServerResponse.value > 0)
const myUID = computed(() => $store.getters["userModule/getUID"])
const isSystemAdmin = computed(() => $store.getters["userModule/getSystemAdmin"])
const isScheduleModify = computed(() => $store.getters["userModule/getScheduleModify"])
const isCenterIC = computed(() => $store.getters["userModule/getCenterIC"])

// table parameters
const defaultPagination = ref({
  rowsPerPage: 20,
})

const rows = ref([])
const columns = computed(() => [
  {
    name: "name",
    label: "員工",
    field: "name",
  }, ...dateUtil.generateTableColumns(props.renderDate) ]
)

const colString = computed(() => columns.value.reduce(function (previousValue, currentValue) {
  let res = currentValue.name.split("|");
  if (res[0] != "name") {
    let d = new Date(res[0]);
    let dateString = d.toISOString();
    let i = previousValue.findIndex((element) => element == dateString);
    if (i == -1 && dateString != "Invalid Date") {
      previousValue.push(dateString);
    }
  }
  return previousValue;
}, []))
      
// functions
function updateEditingRow(col) {
  if (tempInputValue.value) {
    editingRow.value[col] = tempInputValue.value;
    tempInputValue.value = "";
  }
}

function getHoliday(date) {
  let d = qdate.formatDate(date, "YYYYMMDD");
  let i = publicHoliday.value.findIndex((element) => element.date == d);
  if (i == -1) {
    return "";
  } else {
    return this.publicHoliday[i].summary;
  }
}
 
function loadDefault(row) {
  for (const [index, item] of Object.entries(row.defaultSchedule)) {
    if (!(columns.value[Number(index) + 1].name + ".approved" in editingRow.value)) {
      // change to default if not approved
      editingRow.value[columns.value[Number(index) + 1].name] = item; // index + 1 for skipping first name column
    }
  }
}

async function updateTable() {
  // sort differences between original data and editingRow
  let i = rows.value.findIndex((element) => element.uid == editingRow.value.uid);
  let changeRequest = [];
  for (const [key, obj] of Object.entries(columns.value)) {
    if (obj.name != "name") {
      // ignore name column
      if (rows.value[i][obj.name] != editingRow.value[obj.name]) {
        if (
          !([obj.name] in rows.value[i]) &&
          (editingRow.value[obj.name] == "" || ![obj.name] in editingRow.value)
        )
          continue;
        // no change if existing key not found, and new key doesn't exist or equal to empty
        let s = new String(obj.name);
        const scheduleDate = s.split("|");
        changeRequest.push({
          uid: editingRow.value.uid,
          date: scheduleDate[0],
          slot: scheduleDate[1],
          type: editingRow.value[obj.name],
        });
      }
    }
  }

  if (changeRequest.length > 0) {
    // modify database if there's any change
    const updateSchedule = httpsCallable(FirebaseFunctions, "schedule-updateSchedule");
    awaitServerResponse.value++;
    updateSchedule(changeRequest)
      .then((response) => {
        awaitServerResponse.value--;
        rowUnderModification.value = "";
        editingRow.value = {};
      })
      .catch((error) => {
        console.log(error.message);
      });
  } else {
    // exit editing mode if nothing changes
    rowUnderModification.value = "";
    editingRow.value = {};
  }
}
 
const validateEditingRow = computed(() => {
  if (Object.keys(editingRow.value).length == 0) return false;
  if (isSystemAdmin.value || isCenterIC.value) return false;
  const constrains = ["al", "sal", "sl", "ssl"];
  for (const [key, value] of Object.entries(editingRow.value)) {    
    if (
      key != "uid" &&
      key != "name" &&
      key != "defaultSchedule" &&
      !key.endsWith(".approved")
    ) {
      if (
        value &&
        constrains.includes(value.toLowerCase()) &&
        !([key] + ".approved" in editingRow.value)
      ) {
        return true;
      }
    }
  }
  return false;
})

function toggleModifyTable(row) {
  const index = rows.value.indexOf(row);
  editingRow.value = { ...rows.value[index] };
  rowUnderModification.value = row.uid;
  qcardExpanded.value[row.uid] = true;
}

function validateInput(item) {
  if (!item) return true;
  if (isSystemAdmin || isCenterIC) return true;
  const contrains = ["al", "sal", "sl", "ssl"];
  if (contrains.includes(item.toLowerCase())) {
    return false;
  }
  return true;
}

function canModifyTable(uid) {
  let result = false;
  if (myUID.value == uid) result = true;
  if (isScheduleModify.value) result = true;
  if (isSystemAdmin.value) result = true;
  if (isCenterIC.value) result = true;
  if (!props.allowModify) result = false;
  return result;
}

// query definition and start querying
const userDocQuery = query(usersCollection, 
  where("enable", "==", true),
  where("privilege.systemAdmin", "==", false),
  orderBy("order")
)

const scheduleDocQuery = query(scheduleCollection, 
  where("date", ">=", queryStartDate.value),
  where("date", "<=", queryEndDate.value)
)

const leaveDocQuery = query(leaveCollection,
  where("date", "in", colString.value),
  where("status", "==", "批准")
)

getDocs(userDocQuery).then((userDoc) => {
  userDoc.forEach((doc) => {
    const dateOfEntry = doc.data().dateOfEntry?.toDate()??''
    const dateOfExit = doc.data().dateOfExit? doc.data().dateOfExit.toDate() : new Date("9999/12/31")
    if (
      qdate.isBetweenDates(queryStartDate.value, dateOfEntry, dateOfExit, {
        inclusiveFrom: true,
        inclusiveTo: true,
      }) ||
      qdate.isBetweenDates(queryEndDate.value, dateOfEntry, dateOfExit, {
        inclusiveFrom: true,
        inclusiveTo: true,
      })
    ) {
      rows.value.push({
        uid: doc.id,
        name: doc.data().name,
        defaultSchedule: doc.data().defaultSchedule,
      });
      qcardExpanded.value.push({
        uid: false,
      });
    }
  })

  scheduleSnapshot.value = onSnapshot(scheduleDocQuery, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      let d = change.doc.data();
      let dateSlot = dateUtil.mergeDateSlot(d.date.toDate(), d.slot);
      let i = rows.value.findIndex((element) => element.uid == d.uid);
      if (i == -1) return;
      if (change.type == "added") {
        // console.log("added: " + d.uid + ":" + dateSlot + "[" + d.type + "]")
        rows.value[i][dateSlot] = d.type;
      } else if (change.type === "modified") {
        // console.log("changed: " + d.uid + ":" + dateSlot + "[" + d.type + "]")
        rows.value[i][dateSlot] = d.type;
      } else if (change.type === "removed") {
        // console.log("deleted: " + d.uid + ":" + dateSlot)
        delete rows.value[i][dateSlot];
      }
    });
  });

  leaveSnapshot.value = onSnapshot(leaveDocQuery, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      let d = change.doc.data();

      let dateSlot = dateUtil.mergeDateSlot(new Date(d.date), d.slot);
      let j = columns.value.findIndex((element) => element.name == dateSlot);
      if (j != -1) {
        let i = rows.value.findIndex((element) => element.uid == d.uid);
        if (i == -1) return;
        let colName = dateSlot + ".approved";
        if (change.type == "added") {
          // console.log("added: " + d.uid + ":" + dateSlot + "[" + d.type + "]")
          rows.value[i][colName] = true;
        } else if (change.type === "modified") {
          // console.log("changed: " + d.uid + ":" + dateSlot + "[" + d.type + "]")
          rows.value[i][colName] = true;
        } else if (change.type === "removed") {
          // console.log("deleted: " + d.uid + ":" + dateSlot)
          delete rows.value[i][colName];
        }
      }
    });
  });
});

onUnmounted(() => {
  leaveSnapshot.value();
  scheduleSnapshot.value();
})
</script>

<script>
import holiday from "assets/holiday.json";
</script>

<style lang="scss" scoped>
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
    width: 9vw;
    max-width: 9vw;
    min-width: 9vw;
  }

  .q-table .dataColumn {
    width: 4.2vw;
    max-width: 4.2vw;
    min-width: 4.2vw;
  }

  .q-table .approved {
    background-color: $green-3;
  }
}

@media print and (orientation: landscape) {
  @page {
    size: landscape;
  }

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

    min-width: 9vw;
    max-width: 9vw;
  }

  .q-table .dataColumn {
    width: 4.2vw;
    padding: 0 !important;
    font-size: 1.3vw;

    min-width: 4.2vw;
    max-width: 4.2vw;
  }

  .q-table .approved {
    background-color: lightgrey;
  }
}

@media print and (orientation: portrait) {
  @page {
    size: portrait;
  }

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
    width: 12.8%;
    padding: 0 !important;
    font-size: 1vw;

    min-width: 12.8%;
    max-width: 12.8%;
  }

  .q-table .dataColumn {
    width: 4.2%;
    padding: 0 !important;
    font-size: 1vw;

    min-width: 4.2%;
    max-width: 4.2%;
  }

  .q-table .approved {
    background-color: lightgrey;
  }
}
</style>
