<template>
  <q-markup-table flat wrap-cells square style="overflow: hidden">
    <q-dialog v-model="waitingAsync" position="bottom">
      <LoadingDialog message="儲存中"/>
    </q-dialog>

    <thead v-show="printHeader">
      <tr>
        <th class="caption"></th>
        <th class="column-head" v-for="col in columns">
          {{ qdate.formatDate(col.name, "M月D日") }}<br />{{ dateUtil.daysOfWeek(col.name) }}
        </th>
      </tr>
    </thead>

    <tbody>
      <tr>
        <th class="caption">活動</th>
        <td class="column-head" v-for="index in columns.length" v-bind:key="index">
          <ul>
            <ul v-if="getHoliday(columns[index-1].name)">
              <li class="eventItem holidayItem">
                <div>公眾假期</div>
                <div>【{{getHoliday(columns[index-1].name)}}】</div>
                <div>中心休息</div>
              </li>
            </ul>
            <template v-for="(object, key) in rows" v-bind:key="key">
              <li
                v-if="
                  !object.venue &&
                  object.date == columns[index - 1].name &&
                  object.customName
                "
                class="customName eventItem"
              >
                {{ object.customName }}
                <q-popup-edit v-model="object.customName">
                  <template v-slot="scope">
                    <q-input
                      v-model="scope.value"
                      dense
                      autofocus
                      @keyup.enter="updateCustomName(object, scope).then(scope.hide)"
                    >
                      <template v-slot:after>
                        <q-btn
                          flat
                          dense
                          color="negative"
                          icon="restart_alt"
                          label="重置"
                          @click.stop="updateCustomName(object, '').then(scope.hide)"
                        />
                        <q-btn
                          flat
                          dense
                          color="positive"
                          icon="check_circle"
                          label="儲存"
                          @click.stop="updateCustomName(object, scope).then(scope.hide)"
                          :disable="scope.initialValue === scope.value"
                        />
                      </template>
                    </q-input>
                  </template>
                </q-popup-edit>
              </li>
              <li
                v-if="
                  !object.venue &&
                  object.date == columns[index - 1].name &&
                  !object.customName
                "
                class="eventItem"
              >
                {{ object.name }}
                <q-popup-edit v-model="object.name">
                  <template v-slot="scope">
                    <q-input
                      v-model="scope.value"
                      dense
                      autofocus
                      @keyup.enter="updateCustomName(object, scope).then(scope.hide)"
                    >
                      <template v-slot:after>
                        <q-btn
                          flat
                          dense
                          color="positive"
                          icon="check_circle"
                          label="儲存"
                          @click.stop="updateCustomName(object, scope).then(scope.hide)"
                          :disable="scope.initialValue === scope.value"
                        />
                      </template>
                    </q-input>
                  </template>
                </q-popup-edit>
              </li>
            </template>
          </ul>
        </td>
      </tr>
      <tr>
        <th class="caption">租場</th>
        <td class="column-head" v-for="index in columns.length" v-bind:key="index">
          <ul>
            <template v-for="(object, key) in rows" v-bind:key="key">
              <li
                v-if="
                  object.venue &&
                  object.date == columns[index - 1].name &&
                  object.customName
                "
                class="customName eventItem"
              >
                {{ object.customName }}
                <q-popup-edit v-model="object.customName">
                  <template v-slot="scope">
                    <q-input
                      v-model="scope.value"
                      dense
                      autofocus
                      @keyup.enter="updateCustomName(object, scope).then(scope.hide)"
                    >
                      <template v-slot:after>
                        <q-btn
                          flat
                          dense
                          color="negative"
                          icon="restart_alt"
                          label="重置"
                          @click.stop="updateCustomName(object, '').then(scope.hide)"
                        />
                        <q-btn
                          flat
                          dense
                          color="positive"
                          icon="check_circle"
                          label="儲存"
                          @click.stop="updateCustomName(object, scope).then(scope.hide)"
                          :disable="scope.initialValue === scope.value"
                        />
                      </template>
                    </q-input>
                  </template>
                </q-popup-edit>
              </li>
              <li
                v-if="
                  object.venue &&
                  object.date == columns[index - 1].name &&
                  !object.customName
                "
                class="eventItem"
              >
                {{ object.name }}
                <q-popup-edit v-model="object.name">
                  <template v-slot="scope">
                    <q-input
                      v-model="scope.value"
                      dense
                      autofocus
                      @keyup.enter="updateCustomName(object, scope).then(scope.hide)"
                    >
                      <template v-slot:after>
                        <q-btn
                          flat
                          dense
                          color="positive"
                          icon="check_circle"
                          label="儲存"
                          @click.stop="updateCustomName(object, scope).then(scope.hide)"
                          :disable="scope.initialValue === scope.value"
                        />
                      </template>
                    </q-input>
                  </template>
                </q-popup-edit>
              </li>
            </template>
          </ul>
        </td>
      </tr>
    </tbody>
  </q-markup-table>
</template>

<script setup>
import { FirebaseFunctions, activityCollection } from "boot/firebase";
import dateUtil from "src/lib/date.js";
import { httpsCallable } from "firebase/functions";
import { useStore } from "vuex";
import { date as qdate } from 'quasar'
import holiday from "assets/holiday.json";
import LoadingDialog from "components/LoadingDialog.vue"
import { onUnmounted, ref, computed } from "vue";
import { onSnapshot } from "firebase/firestore";

onUnmounted(() => {
  activitySnapshot.value()
})

// props
const props = defineProps({
  renderDate: Date,
  printHeader: Boolean,
})

// variables
const $store = useStore();
const modifyTable = ref(false)
const rows = ref([])
const activitySnapshot = ref()
const defaultPagination = ref({
  rowsPerPage: 20,
})
const modifyObject = ref({
  name: "",
  active: true,
  venue: false,
  customName: "",
  date: "",
  docid: "",
})
const awaitServerResponse = ref(0)

// computed
const waitingAsync = computed(() => awaitServerResponse.value > 0)
const columns = computed(() => [...dateUtil.generateTableColumns(props.renderDate, false)])
const publicHoliday = computed(() => holiday? holiday.vcalendar[0].vevent.map(({dtstart, summary}) => ({date: dtstart[0], summary: summary})): [])

//functions
async function updateCustomName(object, scope) {
  const value = scope.value;
  const ob = Object.assign({}, object);

  // cancel scope first to avoid error after server respond with change and item got removed
  const cancelScope = new Promise((resolve, reject) => {
    scope.hide;
    resolve();
  });

  cancelScope.then(() => {
    if (value == ob.name) {
      ob.customName = "";
    } else {
      ob.customName = value;
    }

    const editActivityCustomName = httpsCallable(FirebaseFunctions,
      "activity-editActivityCustomName"
    );
    awaitServerResponse.value++;
    return editActivityCustomName(ob)
      .then(() => {
        awaitServerResponse.value--;
      })
      .catch((error) => {
        console.log(error.message);
      });
  });
}

// load all activities
activitySnapshot.value = onSnapshot(activityCollection, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    let d = change.doc.data();
    d.docid = change.doc.id;
    let dateEntries = d.date;
    // rows.value.push({})
    // console.log("dateEntries: " + JSON.stringify(dateEntries));
    if (change.type == "added") {
      dateEntries.forEach((docDate) => {
        let i = columns.value.findIndex(
          (element) =>
            element.name == qdate.formatDate(docDate.date.toDate(), "YYYY-MM-DD")
        );
        if (i != -1) {
          rows.value.push({
            docid: d.docid,
            name: d.name,
            date: columns.value[i].name,
            customName: docDate.customName,
            active: d.active,
            venue: d.venue,
          });
        }
      });
    } else if (change.type == "modified") {
      // remove all and add new items back
      // removing
      let repeat = false;
      do {
        repeat = false;
        rows.value.forEach((row) => {
          if (row.docid == d.docid) {
            repeat = true;
            rows.value.splice(rows.value.indexOf(row), 1);
          }
        });
      } while (repeat);

      // adding
      dateEntries.forEach((docDate) => {
        let i = columns.value.findIndex(
          (element) =>
            element.name == qdate.formatDate(docDate.date.toDate(), "YYYY-MM-DD")
        );
        if (i != -1) {
          rows.value.push({
            docid: d.docid,
            name: d.name,
            date: columns.value[i].name,
            customName: docDate.customName,
            active: d.active,
            venue: d.venue,
          });
        }
      });
    } else if (change.type == "removed") {
      let repeat = false;
      do {
        repeat = false;
        rows.value.forEach((row) => {
          if (row.docid == d.docid) {
            repeat = true;
            rows.value.splice(rows.value.indexOf(row), 1);
          }
        });
      } while (repeat);
    }
  });
});

function getHoliday(date) {
  let d = qdate.formatDate(date, "YYYYMMDD");
  let i = publicHoliday.value.findIndex((element) => element.date == d);
  if (i == -1) {
    return "";
  } else {
    return publicHoliday.value[i].summary;
  }
}
</script>

<style lang="scss" scoped>
@media screen {
  .holidayItem {
    font-size: 1.5vw;
    color: red;
    text-align: center;
  }

  table {
    font-size: 1.3vw;
    border-collapse: collapse;
    border: 0;
  }

  .caption {
    width: 9vw;
    vertical-align: top;
    border-left: 0.5px solid black;
    max-width: 9vw;
    min-width: 9vw;
    padding: 0;
  }

  .column-head {
    width: 12.6vw;
    min-width: 12.6vw;
    max-width: 12.6vw;
    vertical-align: top;
  }

  ul li.eventItem {
    list-style: none;
    border-bottom: 0.5px solid black;
    line-height: 100%;
    padding: 0.5vh 0;
  }

  table td {
    padding: 0;
    margin: 0;
    border: 0.5px solid black;
  }

  table .caption {
    font-weight: bold;
  }

  ul {
    padding: 0;
    margin: 0;
  }
  ul li.eventItem {
    padding: 0.5ev !important;
  }

  .eventItem:hover {
    background-color: $green-2;
  }

  .customName {
    background-color: yellow;
    display: block;
  }
}
@media print and (orientation: landscape) {
  @page {
    size: A4 landscape;
    margin-left: 1cm;
    margin-right: 1cm;
  }

  table {
    width: 100% !important;
    border: none;
    border-collapse: collapse;
  }

  table tr {
    border-bottom: 0.5px solid black;
  }

  table td {
    padding: 0;
    margin: 0;
    border-right: 0.5px solid black;
    border-left: 0.5px solid black;
  }

  .caption {
    width: 9vw;
    vertical-align: top;
    border-left: 0.5px solid black;
    max-width: 9vw;
    min-width: 9vw;
    padding: 0;
  }

  .column-head {
    padding: 0 !important;
    width: 12.6vw;
    min-width: 12.6vw;
    max-width: 12.6vw;
    vertical-align: top;
  }

  table thead th {
    background-color: lightgray !important;
  }

  ul {
    padding: 0;
    margin: 0;
  }

  ul li.eventItem {
    list-style: none;
    border-bottom: 0.5px solid black;
    line-height: 100%;
    padding: 0.5vh 0;
  }

  .customName {
    background-color: lightgray;
    display: block;
  }

  .holidayItem {
    font-size: 1.5vw;
    color: red;
    text-align: center;
  }
}

@media print and (orientation: portrait) {
  @page {
    size: A4 portrait;
    margin-left: 1cm;
    margin-right: 1cm;
  }
  table {
    width: 100% !important;
    border: none;
    border-collapse: collapse;
  }

  table tr {
    border-bottom: 0;
  }

  table td {
    padding: 0;
    margin: 0;
    border-right: 0.5px solid black;
    border-left: 0.5px solid black;
  }
  .caption {
    width: 9vw;
    vertical-align: top;
    border-left: 0.5px solid black;
    max-width: 9vw;
    min-width: 9vw;
    padding: 0;
  }

  .column-head {
    padding: 0 !important;
    width: 9vw;
    min-width: 9vw;
    max-width: 9vw;
    vertical-align: top;
  }
  table thead th {
    background-color: lightgray !important;
  }

  ul {
    padding: 0;
    margin: 0;
  }

  ul li.eventItem {
    list-style: none;
    border-bottom: 0.5px solid black;
    line-height: 100%;
    padding: 0.5vh 0;
  }

  .customName {
    background-color: lightgray;
    display: block;
  }

  .holidayItem {
    font-size: 1.5vw;
    color: red;
    text-align: center;
  }
}
</style>
