<template>
  <q-page>
    <!-- saving dialog -->
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
            >處理中</q-circular-progress
          >
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-table
      title="活動一覽表"
      dense
      :grid="$q.screen.lt.sm"
      separator="cell"
      :rows="rows"
      :columns="columns"
      :pagination="defaultPagination"
      :filter="filter"
      :filter-method="tableFilter"
      no-data-label="沒有資料"
      no-results-label="找不到搜尋資料"
      color="primary"
      column-sort-order="da"
      row-key="docid"
      class="q-mb-md"
    >
      <!-- grid template -->
      <template v-slot:item="props">
        <q-page-sticky position="bottom-right" :offset="[15, 30]">
          <q-btn
            fab
            unelevated
            icon="add"
            color="primary"
            @click="startNewActivity()"
            v-if="selectedActivity == 0 && !isAddingNew"
          />
          <q-fab
            unelevated
            color="primary"
            icon="keyboard_arrow_up"
            direction="up"
            v-if="selectedActivity != 0 || isAddingNew"
          >
            <q-fab-action
              v-if="!isModifying"
              color="grey"
              text-color="black"
              @click="editRow(selectedActivity)"
              icon="edit"
            />
            <q-fab-action
              v-if="!isModifying"
              color="grey"
              text-color="black"
              @click="confirmDeleteModal(selectedActivity)"
              icon="delete"
            />
            <q-fab-action
              v-if="isModifying"
              color="grey"
              text-color="black"
              @click="confirmSaveModal()"
              icon="save"
            />
            <q-fab-action
              v-if="isModifying"
              color="grey"
              text-color="black"
              @click="confirmCancelSaveModal()"
              icon="clear"
            />
            <q-fab-action
              v-if="isModifying"
              color="grey"
              text-color="black"
              @click="pickEventDateDialog = !pickEventDateDialog"
              icon="event"
            />
          </q-fab>
        </q-page-sticky>

        <!-- pick calendar dialog -->
        <q-dialog v-model="pickEventDateDialog" persistent>
          <q-date
            :events="publicHoliday"
            event-color="red-14"
            v-model="editingRow.eventDate"
            multiple
            @update:model-value="setEventDateDisplay('editingRow', editingRow.eventDate)"
          >
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="關閉" color="primary" flat />
            </div>
          </q-date>
        </q-dialog>

        <!-- new activity row -->
        <q-dialog
          v-model="isAddingNew"
          persistant
          full-width
          full-height
          transition-show="slide-up"
          transition-hide="slide-down"
        >
          <q-card>
            <q-card-section>
              <q-input
                outlined
                dense
                debounce="300"
                color="primary"
                v-model="new_activity.name"
                label="活動名稱"
              />
              <q-checkbox v-model="new_activity.venue" label="租場活動？" />
              <q-checkbox v-model="new_activity.active" label="有效？" />
              <q-icon
                color="primary"
                size="md"
                name="event"
                class="cursor-pointer q-ma-sm"
              >
                <q-popup-proxy
                  ref="qDateProxy"
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date
                    :events="publicHoliday"
                    event-color="red-14"
                    v-model="new_activity.eventDate"
                    multiple
                    @update:model-value="
                      setEventDateDisplay('new_activity', new_activity.eventDate)
                    "
                  >
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="關閉" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </q-card-section>

            <q-card-section class="text-h6 row">
              <q-separator />
              <div style="display: contents" class="row">
                <span v-for="eDate in new_activity.eventDate" style="display: contents">
                  <q-chip
                    v-model="new_activity.eventDateDisplay[eDate]"
                    color="blue-2"
                    class="col"
                    removable
                    @remove="deleteEventDate('new_activity', eDate)"
                  >
                    {{ formatDate(eDate, "", "年月日") }}
                  </q-chip>
                </span>
              </div>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="取消" color="primary" @click="confirmCancelAddModal()" />
              <q-btn flat label="確定" color="primary" @click="confirmAddModal()" />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
          <!-- default list view on activities -->
          <q-list v-if="!isModifying || editingRow.id != props.row.id" bordered>
            <q-item
              clickable
              @click="selectActivity(props.row.id)"
              :class="[selectedActivity == props.row.id ? 'bg-blue-1' : '']"
            >
              <q-item-section class="text-h5">
                <strong class="col"> {{ props.row.id }} - {{ props.row.name }} </strong>
              </q-item-section>
              <q-space />
              <q-item-section side v-show="props.row.expanded">
                <div class="row">
                  <q-chip
                    class="col"
                    color="primary"
                    text-color="white"
                    :icon="props.row.venue ? 'check' : 'cancel'"
                    label="租場"
                  />
                  <q-chip
                    class="col"
                    color="primary"
                    text-color="white"
                    :icon="props.row.active ? 'check' : 'cancel'"
                    label="有效"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
          <!-- editing activity panel -->
          <div v-if="isModifying && editingRow.id == props.row.id">
            <span>
              <q-input hide-bottom-space v-model="editingRow.name" />
              <q-checkbox v-model="editingRow.venue" label="租場" />
              <q-checkbox v-model="editingRow.active" label="有效" />
            </span>
          </div>

          <!-- date details -->
          <q-card>
            <q-card-section class="text-h6 row" v-show="props.row.expanded">
              <div
                v-if="props.row.id != editingRow.id"
                style="display: contents"
                class="row"
              >
                <span v-for="eDate in props.row.eventDate" style="display: contents">
                  <q-chip color="blue-2" class="col">
                    {{ formatDate(eDate, "", "年月日") }}
                  </q-chip>
                </span>
              </div>
              <div v-else style="display: contents" class="row">
                <span v-for="eDate in editingRow.eventDate" style="display: contents">
                  <q-chip
                    v-model="editingRow.eventDateDisplay[eDate]"
                    color="blue-2"
                    class="col"
                    removable
                    @remove="deleteEventDate('editingRow', eDate)"
                  >
                    {{ formatDate(eDate, "", "年月日") }}
                  </q-chip>
                </span>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </template>

      <!-- event name template -->
      <template v-slot:body-cell-name="props">
        <q-td :props="props">
          <span v-if="props.row.id != editingRow.id" style="display: contents">
            {{ props.row.name }}
          </span>
          <span v-else>
            <q-input v-model="editingRow.name" />
          </span>
        </q-td>
      </template>

      <!-- venue template -->
      <template v-slot:body-cell-venue="props">
        <q-td :props="props">
          <span v-if="props.row.id != editingRow.id" style="display: contents">
            {{ props.value }}
          </span>
          <span v-else>
            <q-checkbox v-model="editingRow.venue" />
          </span>
        </q-td>
      </template>

      <!-- valid template -->
      <template v-slot:body-cell-active="props">
        <q-td :props="props">
          <span v-if="props.row.id != editingRow.id" style="display: contents">
            {{ props.value }}
          </span>
          <span v-else>
            <q-checkbox v-model="editingRow.active" />
          </span>
        </q-td>
      </template>

      <!-- eventDate template -->
      <template v-slot:body-cell-eventDate="props">
        <q-td :props="props">
          <q-card flat v-if="props.row.id != editingRow.id">
            <q-btn
              color="primary"
              flat
              dense
              size="lg"
              :icon-right="
                props.row.expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'
              "
              @click="props.row.expanded = !props.row.expanded"
              class="q-ma-sm float-right"
              :label="props.row.expanded ? '收起' : '展開'"
            >
            </q-btn>

            <q-slide-transition>
              <div v-show="props.row.expanded" class="row">
                <span v-for="eventDate in props.row.eventDate" style="display: contents">
                  <q-chip color="blue-2" class="col">
                    {{ formatDate(eventDate, "", "年月日") }}
                  </q-chip>
                </span>
              </div>
            </q-slide-transition>
          </q-card>
          <q-card flat v-else>
            <div class="row" style="padding-right: 50px">
              <span v-for="eDate in editingRow.eventDate" style="display: contents">
                <q-chip
                  v-model="editingRow.eventDateDisplay[eDate]"
                  color="blue-2"
                  class="col"
                  removable
                  @remove="deleteEventDate('editingRow', eDate)"
                >
                  {{ formatDate(eDate, "", "年月日") }}
                </q-chip>
              </span>
            </div>
            <q-icon
              color="primary"
              size="lg"
              name="event"
              class="cursor-pointer absolute-right q-ma-sm"
            >
              <q-popup-proxy
                ref="qDateProxy"
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  :events="publicHoliday"
                  event-color="red-14"
                  v-model="editingRow.eventDate"
                  multiple
                  @update:model-value="
                    setEventDateDisplay('editingRow', editingRow.eventDate)
                  "
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="關閉" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </q-card>
        </q-td>
      </template>

      <!-- action template -->
      <template v-slot:body-cell-action="props">
        <q-td :props="props" style="padding-right: 50px">
          <q-btn
            v-if="!isModifying"
            dense
            round
            flat
            size="lg"
            color="grey"
            @click="editRow(props.row.id)"
            icon="edit"
          ></q-btn>
          <q-btn
            v-if="!isModifying"
            dense
            round
            flat
            size="lg"
            color="grey"
            @click="confirmDeleteModal(props.row.id)"
            icon="delete"
          ></q-btn>
          <q-btn
            v-if="isModifying && editingRow.id == props.row.id"
            dense
            round
            flat
            size="lg"
            color="grey"
            @click="confirmSaveModal()"
            icon="save"
          ></q-btn>
          <q-btn
            v-if="isModifying && editingRow.id == props.row.id"
            dense
            round
            flat
            size="lg"
            color="grey"
            @click="confirmCancelSaveModal()"
            icon="clear"
          ></q-btn>
        </q-td>
      </template>

      <!-- top template -->
      <template v-slot:top>
        <q-toggle v-model="venueFilter" label="只顯示租場活動" />
        <q-toggle v-model="activeFilter" label="顯示有效活動" />
        <q-space />
        <q-input
          outlined
          dense
          debounce="300"
          color="primary"
          v-model="activityNameFilter"
          label="活動名稱"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <!-- top-row (new event) template -->
      <template v-slot:top-row>
        <q-tr class="vertical-top text-center">
          <q-td style="font-size: 130%">新增</q-td>
          <q-td><q-input v-model="new_activity.name" /></q-td>
          <q-td><q-checkbox v-model="new_activity.venue" /></q-td>
          <q-td><q-checkbox v-model="new_activity.active" /></q-td>
          <q-td style="padding-right: 50px">
            <div class="row">
              <span
                v-for="(date, index) in new_activity.eventDate"
                class="display: contents;"
              >
                <q-chip
                  v-model="new_activity.eventDateDisplay[date]"
                  color="blue-2"
                  class="col"
                  removable
                  @remove="deleteEventDate('new_activity', date)"
                >
                  {{ formatDate(date, "", "年月日") }}
                </q-chip>
              </span>
            </div>
            <q-icon
              color="primary"
              size="lg"
              name="event"
              class="cursor-pointer absolute-top-right q-ma-sm"
            >
              <q-popup-proxy
                ref="qDateProxy"
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  :events="publicHoliday"
                  event-color="red-14"
                  v-model="new_activity.eventDate"
                  multiple
                  @update:model-value="
                    setEventDateDisplay('new_activity', new_activity.eventDate)
                  "
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="關閉" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </q-td>
          <q-td
            ><q-btn
              v-if="!isModifying"
              dense
              round
              flat
              size="lg"
              color="grey"
              @click="confirmAddModal()"
              icon="add"
            ></q-btn
          ></q-td>
        </q-tr>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import { FirebaseFunctions, activityCollection } from "boot/firebase";
import { mapState } from "vuex";
import { useStore } from "vuex";
import { defineComponent, computed } from "vue";
import date from "src/lib/date.js";
import { useQuasar } from "quasar";
import holiday from "assets/holiday.json";

export default {
  data() {
    return {
      activityListener: Function(),
      pickEventDateDialog: false,
      selectedActivity: 0,
      awaitServerResponse: 0,
      defaultPagination: {
        rowsPerPage: 20,
        descending: true,
        sortBy: "id",
      },
      columns: [
        {
          name: "id",
          label: "編號",
          field: "id",
          sortable: true,
          sortOrder: "da",
          align: "center",
          classes: "text-bold vertical-top",
          style: "font-size: 130%;",
          headerClasses: "bg-blue-2",
          headerStyle: "width: 8%; font-size: 130%;",
        },
        {
          name: "name",
          label: "活動名稱",
          field: "name",
          align: "center",
          classes: "text-bold vertical-top",
          style: "font-size: 130%;",
          headerClasses: "bg-blue-2",
          headerStyle: "width: 18%; font-size: 130%;",
        },
        {
          name: "venue",
          label: "租場？",
          field: "venue",
          align: "center",
          classes: "text-bold vertical-top",
          headerClasses: "bg-blue-2",
          style: "font-size: 130%;",
          format: (val) => (val ? "是" : "否"),
          headerStyle: "width: 8%; font-size: 130%;",
        },
        {
          name: "active",
          label: "有效？",
          field: "active",
          align: "center",
          classes: "text-bold vertical-top",
          headerClasses: "bg-blue-2",
          style: "font-size: 130%;",
          format: (val) => (val ? "是" : "否"),
          headerStyle: "width: 8%; font-size: 130%;",
        },
        {
          name: "eventDate",
          label: "活動日期",
          field: "eventDate",
          align: "left",
          classes: "text-bold vertical-top",
          style: "font-size: 130%;",
          headerClasses: "bg-blue-2 text-center",
          headerStyle: "max-width: 50%; width: 44%; font-size: 130%;",
        },
        {
          name: "action",
          label: "指令",
          field: "action",
          align: "center",
          classes: "text-bold vertical-top",
          style: "font-size: 130%;",
          headerClasses: "bg-blue-2",
          headerStyle: "width: 8%; font-size: 130%;",
        },
      ],
      rows: [],
      activityNameFilter: "",
      activeFilter: true,
      venueFilter: false,
      editingRow: {
        id: 0,
        name: "",
        userName: "",
        venue: false,
        active: true,
        eventDate: [],
        eventDateDisplay: [],
        firestoreDate: [],
      },
      new_activity: {
        id: 0,
        name: "",
        userName: "",
        venue: false,
        active: true,
        eventDate: [],
        eventDateDisplay: [],
        firestoreDate: [],
      },
    };
  },
  created() {
    this.daysOfWeek = date.daysOfWeek.bind(this);
    this.formatDate = date.formatDate.bind(this);
    this.mergeDateSlot = date.mergeDateSlot.bind(this);
    this.splitDateSlot = date.splitDateSlot.bind(this);
  },
  computed: {
    filter() {
      return {
        search: this.activityNameFilter,
        venue: this.venueFilter,
        active: this.activeFilter,
      };
    },
    publicHoliday: function () {
      var ph = [];
      holiday.vcalendar[0].vevent.forEach((record) => {
        ph.push(
          [
            record.dtstart[0].slice(0, 4),
            record.dtstart[0].slice(4, 6),
            record.dtstart[0].slice(6, 8),
          ].join("/")
        );
      });
      return ph;
    },
    waitingAsync() {
      return this.awaitServerResponse > 0 ? true : false;
    },
    isModifying() {
      return this.editingRow.id > 0 ? true : false;
    },
    isAddingNew() {
      return this.new_activity.id > 0 ? true : false;
    },
  },
  methods: {
    selectActivity(id) {
      if (this.isModifying) return;
      this.rows[this.rows.findIndex((element) => element.id == id)].expanded = !this.rows[
        this.rows.findIndex((element) => element.id == id)
      ].expanded;
      if (this.selectedActivity != 0) {
        this.rows[
          this.rows.findIndex((element) => element.id == this.selectedActivity)
        ].expanded = false;
      }

      this.selectedActivity == id
        ? (this.selectedActivity = 0)
        : (this.selectedActivity = id);
    },
    editRow(id) {
      this.editingRow = {
        ...this.rows[this.rows.findIndex((element) => element.id == id)],
      };
      this.editingRow.userName = this.username;
      this.rows[this.rows.findIndex((element) => element.id == id)].expanded = true;
      this.editingRow.eventDateDisplay = [];
      for (let i = 0; i < this.editingRow.eventDate.length; i++) {
        this.editingRow.eventDateDisplay.push({
          [this.editingRow.eventDate[i]]: true,
        });
      }
    },
    confirmCancelAddModal() {
      this.$q
        .dialog({
          title: "請確認",
          message: "確認取消新增活動？",
          cancel: true,
          persistent: true,
        })
        .onOk(() => {
          this.new_activity = {
            id: 0,
            name: "",
            userName: this.username,
            venue: false,
            active: true,
            eventDate: [],
            eventDateDisplay: [],
            firestoreDate: [],
          };
        });
    },
    startNewActivity() {
      this.new_activity.id = this.rows.reduce((a, b) => Math.max(a, b.id), 0) + 1;
    },
    confirmAddModal() {
      this.$q
        .dialog({
          title: "請確認",
          message: "確認新增活動？",
          cancel: true,
          persistent: true,
        })
        .onOk(() => {
          this.new_activity.userName = this.username;
          this.new_activity.id = this.rows.reduce((a, b) => Math.max(a, b.id), 0) + 1;

          var firestoreDate = [];
          this.new_activity.eventDate.forEach((d) => {
            const dd = new Date(
              this.formatDate(d, "-", "YYYYMMDD") + "T00:00:00.000+00:00"
            );
            const ddd = dd.toISOString();
            firestoreDate.push(ddd);
          });
          this.new_activity.firestoreDate = firestoreDate;

          // console.log(JSON.stringify(this.new_activity));
          const addActivity = FirebaseFunctions.httpsCallable("activity-addActivity");
          this.awaitServerResponse++;
          addActivity(this.new_activity)
            .then(() => {
              this.new_activity = {
                id: 0,
                name: "",
                userName: this.username,
                venue: false,
                active: true,
                eventDate: [],
                eventDateDisplay: [],
                firestoreDate: [],
              };
              this.awaitServerResponse--;
            })
            .catch((error) => {
              //showNotification(error.message);
              console.log(error.message);
            });
        });
    },
    deleteEventDate(dataset, value) {
      this[dataset].eventDate.splice(this[dataset].eventDate.indexOf(value), 1);
      this[dataset].eventDateDisplay.splice(
        this[dataset].eventDateDisplay.findIndex((element) => value in element),
        1
      );
    },
    setEventDateDisplay(dataset, value) {
      let selectedDates = new String(value).split(",");
      this[dataset].eventDateDisplay = [];
      for (let i = 0; i < selectedDates.length; i++) {
        this[dataset].eventDateDisplay.push({
          [selectedDates[i]]: true,
        });
      }
    },
    tableFilter(rows, terms) {
      // rows contain the entire data
      // terms contains whatever you have as filter
      // console.log(terms,rows)

      // let lowerSearch = terms.search ? terms.search.toLowerCase() : ""

      const filteredRows = rows.filter((row, i) => {
        //assume row doesn't match
        let ans = false;

        //Gather toggle conditions
        let c1 = this.venueFilter == row.venue;
        let c2 = this.activeFilter == row.active;

        //Gather search condition
        //Assume true in case there is no search
        let s1 = terms.search == "";

        if (terms.search != "" && row.name.includes(terms.search)) {
          s1 = true;
        }

        //check if any of the conditions match
        if (c1 && s1 && c2 && s1) {
          ans = true;
        }

        return ans;
      });

      return filteredRows;
    },
    confirmCancelSaveModal() {
      this.$q
        .dialog({
          title: "請確認",
          message: "確認取消修改？",
          cancel: true,
          persistent: true,
        })
        .onOk(() => {
          this.editingRow = {
            id: 0,
            name: "",
            userName: "",
            venue: false,
            active: true,
            eventDate: [],
            eventDateDisplay: [],
            firestoreDate: [],
          };
        });
    },
    confirmSaveModal() {
      this.$q
        .dialog({
          title: "請確認",
          message: "確認修改活動？",
          cancel: true,
          persistent: true,
        })
        .onOk(() => {
          let id = this.editingRow.id;
          const modifyActivity = FirebaseFunctions.httpsCallable(
            "activity-modifyActivity"
          );
          this.editingRow.firestoreDate = [];
          this.editingRow.eventDate.forEach((d) => {
            const dd = new Date(d);
            const ddd = dd.toISOString();
            this.editingRow.firestoreDate.push(ddd);
          });

          this.awaitServerResponse++;
          modifyActivity(this.editingRow).then(() => {
            this.editingRow = {
              id: 0,
              name: "",
              userName: "",
              venue: false,
              active: true,
              eventDate: [],
              eventDateDisplay: [],
              firestoreDate: [],
            };
            this.awaitServerResponse--;
            this.selectedActivity = 0;
          });
        });
    },
    confirmDeleteModal(id) {
      this.$q
        .dialog({
          title: "請確認",
          message: "確認刪除活動？",
          cancel: true,
          persistent: true,
        })
        .onOk(() => {
          let docid = this.rows[this.rows.findIndex((element) => element.id == id)].docid;
          const delActivity = FirebaseFunctions.httpsCallable("activity-delActivity");
          this.awaitServerResponse++;
          delActivity({ id: id, docid: docid })
            .then(() => {
              this.awaitServerResponse--;
              this.selectedActivity = 0;
            })
            .catch((error) => console.log(error));
        });
    },
  },
  setup() {
    const $store = useStore();
    const $q = useQuasar();

    return {
      uid: computed(() => $store.getters["userModule/getUID"]),
      username: computed(() => $store.getters["userModule/getUsername"]),
      isSystemAdmin: computed(() => $store.getters["userModule/getSystemAdmin"]),
      isScheduleModify: computed(() => $store.getters["userModule/getScheduleModify"]),
      isCenterIC: computed(() => $store.getters["userModule/getCenterIC"]),
    };
  },
  async unmounted() {
    this.activityListener();
  },
  async mounted() {
    this.activityListener = activityCollection.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        let d = change.doc.data();
        d.docid = change.doc.id;
        d.expanded = false;
        let eventDate = [];
        d.date.forEach((eventDateItem) => {
          eventDate.push(this.formatDate(eventDateItem.date.toDate(), "/", "YYYYMMDD"));
        });
        d.eventDate = eventDate;
        delete d.date;
        if (change.type == "added") {
          this.rows.push(d);
        } else if (change.type == "modified") {
          let i = this.rows.findIndex((element) => element.docid == d.docid);
          this.rows[i] = d;
        } else if (change.type == "removed") {
          let i = this.rows.findIndex((element) => element.docid == d.docid);
          this.rows.splice(i, 1);
        }
      });
    });
  },
};
</script>

<style scoped></style>
