<template>
  <div>
    <q-dialog v-model="waitingAsync" position="bottom">
      <q-card style="width: 200px">
        <q-card-section class="row">
          <!-- <div class="col text-h5 text-bold fixed-left vertical-bottom">儲存中...</div> -->
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
            >儲存中</q-circular-progress
          >
        </q-card-section>
      </q-card>
    </q-dialog>
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
            <q-th v-if="index % 3 == 1" colspan="3">
              <span
                :class="[
                  'q-px-md',
                  getHoliday(splitDateSlot(col.label)[0]) != '' ? 'bg-red-2' : '',
                ]"
                >{{ formatDate(splitDateSlot(col.label)[0], "", "月日")
                }}{{ daysOfWeek(splitDateSlot(col.label)[0]) }}
                <q-tooltip
                  v-if="getHoliday(splitDateSlot(col.label)[0]) != ''"
                  anchor="top middle"
                  self="bottom middle"
                  :offset="[10, 10]"
                  transition-show="flip-right"
                  transition-hide="flip-left"
                >
                  {{ getHoliday(splitDateSlot(col.label)[0]) }}
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
              {{ slotMap[splitDateSlot(col.label)[1]] }}
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
              :disabled="validateEditingRow()"
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
        <q-td :props="props" class="q-pa-none dataColumn">
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
          <div
            v-if="props.col.name + '.approved' in props.row"
            class="q-my-none q-py-none approved"
          >
            {{ props.value }}
          </div>
          <div v-else style="display: contents" class="q-my-none q-py-none">
            <span v-if="props.value">{{ props.value }}</span>
            <span v-else>&nbsp;</span>
          </div>
        </q-td>
      </template>

      <!-- top row template -->
      <template v-slot:top v-if="$q.screen.lt.sm && !printOnly">
        <div class="text-h5 text-bold">
          <span
            v-html="qdate.formatDate(splitDateSlot(Object(columns[1]).name)[0], 'YYYY年')"
          />
          {{ formatDate(splitDateSlot(Object(columns[1]).name)[0], "", "月日") }} 至
          {{ formatDate(splitDateSlot(Object(columns[21]).name)[0], "", "月日") }}
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
              :disabled="validateEditingRow()"
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
                      {{ formatDate(splitDateSlot(col.label)[0], "", "月日") }}
                      {{ slotMap[splitDateSlot(col.label)[1]] }}
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
  </div>
</template>

<script>
import {
  scheduleCollection,
  leaveCollection,
  FirebaseFunctions,
  usersCollection,
} from "boot/firebase";

import { useStore } from "vuex";
import { defineComponent, computed } from "vue";
import holiday from "assets/holiday.json";
import date from "src/lib/date.js";
import dateHeader from "src/lib/dateHeader.js";
import { date as qdate } from "quasar";

export default defineComponent({
  name: "DutyCalendar",
  props: {
    renderDate: Date,
    allowModify: Boolean,
    printOnly: Boolean,
  },
  created() {
    this.daysOfWeek = date.daysOfWeek.bind(this);
    this.formatDate = date.formatDate.bind(this);
    this.mergeDateSlot = date.mergeDateSlot.bind(this);
    this.splitDateSlot = date.splitDateSlot.bind(this);
    this.generateTableColumns = dateHeader.generateTableColumns.bind(this);
  },
  data() {
    return {
      qdate: qdate,
      tempInputValue: "",
      qcardExpanded: [],
      dutyInputOptions: ["覆", "O", "M", "補", "長", "短"],
      queryStartDate: {
        type: Date,
      },
      queryEndDate: {
        type: Date,
      },
      awaitServerResponse: 0,
      rowUnderModification: "",
      defaultPagination: {
        rowsPerPage: 20,
      },
      slotMap: {
        slot_a: "早",
        slot_b: "午",
        slot_c: "晚",
      },
      rows: [],
      columns: [
        {
          name: "name",
          label: "員工",
          field: "name",
        },
      ],
      editingRow: [],
      scheduleListener: Function(),
      leaveListener: Function(),
    };
  },
  methods: {
    selectPop() {
      //console.log("test");
      //console.log(this.$refs.selectionPopup);
      this.$refs.selectionPopup.show();
      this.$refs.test.value = "hello";
      console.log(this.$refs.test);
    },
    getHoliday(date) {
      let d = this.formatDate(date, "", "YYYYMMDD");
      let i = this.publicHoliday.findIndex((element) => element.date == d);
      if (i == -1) {
        return "";
      } else {
        return this.publicHoliday[i].summary;
      }
    },
    loadDefault(row) {
      for (const [index, item] of Object.entries(row.defaultSchedule)) {
        if (!(this.columns[Number(index) + 1].name + ".approved" in this.editingRow)) {
          // change to default if not approved
          this.editingRow[this.columns[Number(index) + 1].name] = item; // index + 1 for skipping first name column
        }
      }
    },
    async updateTable() {
      // sort differences between original data and editingRow
      let i = this.rows.findIndex((element) => element.uid == this.editingRow.uid);
      let changeRequest = [];
      for (const [key, obj] of Object.entries(this.columns)) {
        if (obj.name != "name") {
          // ignore name column
          if (this.rows[i][obj.name] != this.editingRow[obj.name]) {
            if (
              !([obj.name] in this.rows[i]) &&
              (this.editingRow[obj.name] == "" || ![obj.name] in this.editingRow)
            )
              continue;
            // no change if existing key not found, and new key doesn't exist or equal to empty
            let s = new String(obj.name);
            const scheduleDate = s.split("|");
            changeRequest.push({
              uid: this.editingRow.uid,
              date: scheduleDate[0],
              slot: scheduleDate[1],
              type: this.editingRow[obj.name],
            });
          }
        }
      }

      if (changeRequest.length > 0) {
        // modify database if there's any change
        const updateSchedule = FirebaseFunctions.httpsCallable("schedule-updateSchedule");
        this.awaitServerResponse++;
        updateSchedule(changeRequest)
          .then((response) => {
            // console.log(JSON.stringify(response));
            this.awaitServerResponse--;
            this.rowUnderModification = "";
            this.editingRow = {};
          })
          .catch((error) => {
            console.log(error.message);
          });
      } else {
        // exit editing mode if nothing changes
        this.rowUnderModification = "";
        this.editingRow = {};
      }
    },
    validateEditingRow() {
      if (Object.keys(this.editingRow) == 0) return false;
      const constrains = ["al", "sal", "sl"];
      for (const [key, value] of Object.entries(this.editingRow)) {
        if (
          key != "uid" &&
          key != "name" &&
          key != "defaultSchedule" &&
          !key.endsWith(".approved")
        ) {
          if (
            value &&
            constrains.includes(value.toLowerCase()) &&
            !([key] + ".approved" in this.editingRow)
          ) {
            return true;
          }
        }
      }
      return false;
    },
    toggleModifyTable(row) {
      const index = this.rows.indexOf(row);
      this.editingRow = { ...this.rows[index] };
      this.rowUnderModification = row.uid;
      this.qcardExpanded[row.uid] = true;
    },
    validateInput(item) {
      if (!item) return true;
      if (this.isSystemAdmin || this.isCenterIC) return true;
      const contrains = ["al", "sal", "sl", "ssl"];
      if (contrains.includes(item.toLowerCase())) {
        return false;
      }
      return true;
    },
    canModifyTable(uid) {
      let result = false;
      if (this.uid == uid) result = true;
      if (this.isScheduleModify) result = true;
      if (this.isSystemAdmin) result = true;
      if (this.isCenterIC) result = true;
      if (!this.allowModify) result = false;
      return result;
    },
  },
  async mounted() {
    this.columns.push(...this.generateTableColumns(this.renderDate, true));
    let queryStartDate = new Date(this.splitDateSlot(this.columns[1].name)[0]);
    let endDate = new Date(
      this.splitDateSlot(this.columns[this.columns.length - 1].name)[0]
    );

    let queryEndDate = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate(),
      15,
      59,
      59
    );

    // load users data
    const userDoc = await usersCollection
      .where("enable", "==", true)
      .where("privilege.systemAdmin", "==", false)
      .orderBy("order")
      .get();

    userDoc.forEach((doc) => {
      const dateOfEntry = doc.data().dateOfEntry.toDate();
      const dateOfExit = doc.data().dateOfExit
        ? doc.data().dateOfExit.toDate()
        : new Date("9999/12/31");
      if (
        qdate.isBetweenDates(queryStartDate, dateOfEntry, dateOfExit, {
          inclusiveFrom: true,
          inclusiveTo: true,
        }) ||
        qdate.isBetweenDates(queryEndDate, dateOfEntry, dateOfExit, {
          inclusiveFrom: true,
          inclusiveTo: true,
        })
      ) {
        this.rows.push({
          uid: doc.id,
          name: doc.data().name,
          defaultSchedule: doc.data().defaultSchedule,
        });
        this.qcardExpanded.push({
          uid: false,
        });
      }
    });

    // load schedule date within this week
    this.scheduleListener = scheduleCollection
      .where("date", ">=", queryStartDate)
      .where("date", "<=", queryEndDate)
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          let d = change.doc.data();
          let dateSlot = this.mergeDateSlot(d.date.toDate(), d.slot);
          let i = this.rows.findIndex((element) => element.uid == d.uid);
          if (i == -1) return;
          if (change.type == "added") {
            // console.log("added: " + d.uid + ":" + dateSlot + "[" + d.type + "]")
            this.rows[i][dateSlot] = d.type;
          } else if (change.type === "modified") {
            // console.log("changed: " + d.uid + ":" + dateSlot + "[" + d.type + "]")
            this.rows[i][dateSlot] = d.type;
          } else if (change.type === "removed") {
            // console.log("deleted: " + d.uid + ":" + dateSlot)
            delete this.rows[i][dateSlot];
          }
        });
      });

    // build dateString array based on column headers
    let colString = this.columns.reduce(function (previousValue, currentValue) {
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
    }, []);

    // query leave record based on date string array
    this.leaveListener = leaveCollection
      .where("date", "in", colString)
      .where("status", "==", "批准")
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          let d = change.doc.data();

          let dateSlot = this.mergeDateSlot(new Date(d.date), d.slot);
          let j = this.columns.findIndex((element) => element.name == dateSlot);
          if (j != -1) {
            let i = this.rows.findIndex((element) => element.uid == d.uid);
            if (i == -1) return;
            let colName = dateSlot + ".approved";
            if (change.type == "added") {
              // console.log("added: " + d.uid + ":" + dateSlot + "[" + d.type + "]")
              this.rows[i][colName] = true;
            } else if (change.type === "modified") {
              // console.log("changed: " + d.uid + ":" + dateSlot + "[" + d.type + "]")
              this.rows[i][colName] = true;
            } else if (change.type === "removed") {
              // console.log("deleted: " + d.uid + ":" + dateSlot)
              delete this.rows[i][colName];
            }
          }
        });
      });
  },
  async unmounted() {
    // removing database listeners
    this.leaveListener();
    this.scheduleListener();
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
      isSystemAdmin: computed(() => $store.getters["userModule/getSystemAdmin"]),
      isScheduleModify: computed(() => $store.getters["userModule/getScheduleModify"]),
      isCenterIC: computed(() => $store.getters["userModule/getCenterIC"]),
    };
  },
});
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

  .q-table div.approved {
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

  .q-table div.approved {
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

  .q-table div.approved {
    background-color: lightgrey;
  }
}
</style>
