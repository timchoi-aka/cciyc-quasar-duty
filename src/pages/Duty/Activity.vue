<template>
  <q-page class="q-mt-md">
    <!-- saving dialog -->
    <q-dialog v-model="waitingAsync" position="bottom">
      <LoadingDialog message="處理中"/>
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
            @update:model-value="setEventDateDisplay(editingRow, editingRow.eventDate)"
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
                      setEventDateDisplay(new_activity, new_activity.eventDate)
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
                    @remove="deleteEventDate(new_activity, eDate)"
                  >
                    {{ qdate.formatDate(eDate, "YYYY年M月D日") }}
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
              <q-item-section class="text-body1">
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
                  <q-chip size="lg" color="blue-2" class="col">
                    {{ qdate.formatDate(eDate, "YYYY年M月D日") }}
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
                    @remove="deleteEventDate(editingRow, eDate)"
                  >
                    {{ qdate.formatDate(eDate, "YYYY年M月D日") }}
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
                    {{ qdate.formatDate(eventDate, "YYYY年M月D日") }}
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
                  @remove="deleteEventDate(editingRow, eDate)"
                >
                  {{ qdate.formatDate(eDate, "YYYY年M月D日") }}
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
                    setEventDateDisplay(editingRow, editingRow.eventDate)
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
                  @remove="deleteEventDate(new_activity, date)"
                >
                  {{ qdate.formatDate(date, "YYYY年M月D日") }}
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
                    setEventDateDisplay(new_activity, new_activity.eventDate)
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

<script setup>
import { FirebaseFunctions, activityCollection } from "boot/firebase"
import { useStore } from "vuex"
import { ref, computed, onUnmounted } from "vue"
import { useQuasar, date as qdate } from "quasar"
import holiday from "assets/holiday.json"
import LoadingDialog from "components/LoadingDialog.vue"
import { httpsCallable } from "firebase/functions"
import { query, onSnapshot } from "firebase/firestore";

onUnmounted(() => {
  activitySnapshot.value()
})

// variables
const $store = useStore();
const $q = useQuasar()
const activitySnapshot = ref()
const pickEventDateDialog = ref(false)
const selectedActivity = ref(0)
const awaitServerResponse = ref(0)
const rows = ref([])
const activityNameFilter = ref("")
const activeFilter = ref(true)
const venueFilter = ref(false)
const editingRow = ref({
  id: 0,
  name: "",
  userName: "",
  venue: false,
  active: true,
  eventDate: [],
  eventDateDisplay: [],
  firestoreDate: [],
})

const new_activity = ref({
  id: 0,
  name: "",
  userName: "",
  venue: false,
  active: true,
  eventDate: [],
  eventDateDisplay: [],
  firestoreDate: [],
})

// table config
const defaultPagination = ref({
  rowsPerPage: 20,
  descending: true,
  sortBy: "id",
})

const columns = ref([
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
])

// computed
const filter = computed(() => ({
  search: activityNameFilter.value,
  venue: venueFilter.value,
  active: activeFilter.value,
}))

const publicHoliday = computed(() => holiday? holiday.vcalendar[0].vevent.map(({dtstart}) => qdate.formatDate(qdate.extractDate(dtstart[0], "YYYYMMDD"), "YYYY/MM/DD")): [])
const waitingAsync = computed(() => awaitServerResponse.value > 0)
const isModifying = computed(() => editingRow.value.id > 0)
const isAddingNew = computed(() => new_activity.value.id > 0)
const uid = computed(() => $store.getters["userModule/getUID"])
const username = computed(() => $store.getters["userModule/getUsername"])
const isSystemAdmin = computed(() => $store.getters["userModule/getSystemAdmin"])
const isScheduleModify = computed(() => $store.getters["userModule/getScheduleModify"])
const isCenterIC = computed(() => $store.getters["userModule/getCenterIC"])

// functions
function selectActivity(id) {
  if (isModifying.value) return;
  rows.value[rows.value.findIndex((element) => element.id == id)].expanded = !rows.value[
    rows.value.findIndex((element) => element.id == id)
  ].expanded;
  if (selectedActivity.value != 0) {
    rows.value[
      rows.value.findIndex((element) => element.id == selectedActivity.value)
    ].expanded = false;
  }

  selectedActivity.value == id
    ? (selectedActivity.value = 0)
    : (selectedActivity.value = id);
}

function editRow(id) {
  editingRow.value = JSON.parse(JSON.stringify(rows.value[rows.value.findIndex((element) => element.id == id)]))
  editingRow.value.userName = username.value;
  rows.value[rows.value.findIndex((element) => element.id == id)].expanded = true;
  editingRow.value.eventDateDisplay = [];
  for (let i = 0; i < editingRow.value.eventDate.length; i++) {
    editingRow.value.eventDateDisplay.push({
      [editingRow.value.eventDate[i]]: true,
    });
  }
}

function confirmCancelAddModal() {
  $q.dialog({
    title: "請確認",
    message: "確認取消新增活動？",
    cancel: true,
    persistent: true,
  })
  .onOk(() => {
    new_activity.value = {
      id: 0,
      name: "",
      userName: username.value,
      venue: false,
      active: true,
      eventDate: [],
      eventDateDisplay: [],
      firestoreDate: [],
    };
  });
}

function startNewActivity() {
  new_activity.value.id = rows.value.reduce((a, b) => Math.max(a, b.id), 0) + 1;
}

function confirmAddModal() {
  $q.dialog({
    title: "請確認",
    message: "確認新增活動？",
    cancel: true,
    persistent: true,
  })
  .onOk(() => {
    new_activity.value.userName = username.value;
    new_activity.value.id = rows.value.reduce((a, b) => Math.max(a, b.id), 0) + 1;

    var firestoreDate = [];
    new_activity.value.eventDate.forEach((d) => {
      const dd = new Date(
        qdate.formatDate(d, "YYYY-MM-DD") + "T00:00:00.000+00:00"
      );
      const ddd = dd.toISOString();
      firestoreDate.push(ddd);
    });
    new_activity.value.firestoreDate = firestoreDate;

    // console.log(JSON.stringify(new_activity.value));
    const addActivity = httpsCallable(FirebaseFunctions, "activity-addActivity");
    awaitServerResponse.value++;
    addActivity(new_activity.value)
      .then(() => {
        new_activity.value = {
          id: 0,
          name: "",
          userName: username.value,
          venue: false,
          active: true,
          eventDate: [],
          eventDateDisplay: [],
          firestoreDate: [],
        };
        awaitServerResponse.value--;
      })
      .catch((error) => {
        //showNotification(error.message);
        console.log(error.message);
      });

  });
}

function deleteEventDate(dataset, value) {
  dataset.eventDate.splice(dataset.eventDate.indexOf(value), 1);
  dataset.eventDateDisplay.splice(
    dataset.eventDateDisplay.findIndex((element) => value in element),
    1
  );
}

function setEventDateDisplay(dataset, value) {
  let selectedDates = new String(value).split(",");
  dataset.eventDateDisplay = [];
  for (let i = 0; i < selectedDates.length; i++) {
    dataset.eventDateDisplay.push({
      [selectedDates[i]]: true,
    });
  }
}

function tableFilter(rows, terms) {
  // rows contain the entire data
  // terms contains whatever you have as filter
  // console.log(terms,rows)

  // let lowerSearch = terms.search ? terms.search.toLowerCase() : ""

  const filteredRows = rows.filter((row, i) => {
    //assume row doesn't match
    let ans = false;

    //Gather toggle conditions
    let c1 = venueFilter.value == row.venue;
    let c2 = activeFilter.value == row.active;

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
}

function confirmCancelSaveModal() {
  $q.dialog({
    title: "請確認",
    message: "確認取消修改？",
    cancel: true,
    persistent: true,
  })
  .onOk(() => {
    editingRow.value = {
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
}

function confirmSaveModal() {
  $q.dialog({
    title: "請確認",
    message: "確認修改活動？",
    cancel: true,
    persistent: true,
  })
  .onOk(() => {
    let id = editingRow.value.id;
    const modifyActivity = httpsCallable(FirebaseFunctions, "activity-modifyActivity");
    editingRow.value.firestoreDate = [];
    editingRow.value.eventDate.forEach((d) => {
      const dd = new Date(
        qdate.formatDate(d, "YYYY-MM-DD") + "T00:00:00.000+00:00"
      );
      const ddd = dd.toISOString();
      editingRow.value.firestoreDate.push(ddd);
    });

    awaitServerResponse.value++;
    modifyActivity(editingRow.value).then(() => {
      editingRow.value = {
        id: 0,
        name: "",
        userName: "",
        venue: false,
        active: true,
        eventDate: [],
        eventDateDisplay: [],
        firestoreDate: [],
      };
      awaitServerResponse.value--;
      selectedActivity.value = 0;
    });
  });
}

function confirmDeleteModal(id) {
  $q.dialog({
    title: "請確認",
    message: "確認刪除活動？",
    cancel: true,
    persistent: true,
  })
  .onOk(() => {
    let docid = rows.value[rows.value.findIndex((element) => element.id == id)].docid;
    const delActivity = httpsCallable(FirebaseFunctions, "activity-delActivity");
    awaitServerResponse.value++;
    delActivity({ id: id, docid: docid })
      .then(() => {
        awaitServerResponse.value--;
        selectedActivity.value = 0;
      })
      .catch((error) => console.log(error));
  });
}

activitySnapshot.value = onSnapshot(query(activityCollection), (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    let d = change.doc.data();
    d.docid = change.doc.id;
    d.expanded = false;
    let eventDate = [];
    d.date.forEach((eventDateItem) => {
      eventDate.push(qdate.formatDate(eventDateItem.date.toDate(), "YYYY/MM/DD"));
    });
    d.eventDate = eventDate;
    delete d.date;
    if (change.type == "added") {
      rows.value.push(d);
    } else if (change.type == "modified") {
      let i = rows.value.findIndex((element) => element.docid == d.docid);
      rows.value[i] = d;
    } else if (change.type == "removed") {
      let i = rows.value.findIndex((element) => element.docid == d.docid);
      rows.value.splice(i, 1);
    }
  });
});
</script>
