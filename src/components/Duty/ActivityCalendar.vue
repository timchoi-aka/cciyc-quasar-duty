<template>
  <q-markup-table flat wrap-cells square style="overflow: hidden">
    <q-dialog v-model="waitingAsync" position="bottom">
      <LoadingDialog message="儲存中"/>
    </q-dialog>

    <thead v-show="printHeader">
      <tr>
        <th class="caption"></th>
        <th class="column-head" v-for="col in columns">
          {{ formatDate(col.name, "", "月日") }}<br />{{ daysOfWeek(col.name) }}
        </th>
      </tr>
    </thead>

    <tbody>
      <tr>
        <th class="caption">活動</th>
        <td class="column-head" v-for="index in columns.length" v-bind:key="index">
          <ul>
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

<script>
import { FirebaseFunctions, activityCollection } from "boot/firebase";
import date from "src/lib/date.js";
import dateHeader from "src/lib/dateHeader.js";
import { useStore } from "vuex";
import LoadingDialog from "components/LoadingDialog.vue"

export default {
  name: "ActivityCalendar",
  props: {
    renderDate: Date,
    printHeader: Boolean,
  },
  computed: {
    waitingAsync() {
      return this.awaitServerResponse > 0 ? true : false;
    },
  },
  components: {
    LoadingDialog,
  },
  data() {
    return {
      activityListener: Function(),
      modifyTable: false,
      awaitServerResponse: 0,
      columns: [],
      //   {
      //     name: "firstCol",
      //     title: "firstCol",
      //     field: "firstCol",
      //   },
      // ],
      rows: [],
      defaultPagination: {
        rowsPerPage: 20,
      },
      modifyObject: {
        name: "",
        active: true,
        venue: false,
        customName: "",
        date: Date,
        docid: "",
      },
    };
  },
  methods: {
    async updateCustomName(object, scope) {
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

        const editActivityCustomName = FirebaseFunctions.httpsCallable(
          "activity-editActivityCustomName"
        );
        this.awaitServerResponse++;
        return editActivityCustomName(ob)
          .then(() => {
            this.awaitServerResponse--;
          })
          .catch((error) => {
            console.log(error.message);
          });
      });
    },
  },
  async unmounted() {
    this.activityListener();
  },
  async mounted() {
    this.columns.push(...this.generateTableColumns(this.renderDate, false));

    // load all activities
    this.activityListener = activityCollection.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        let d = change.doc.data();
        d.docid = change.doc.id;
        let dateEntries = d.date;
        // this.rows.push({})
        // console.log("dateEntries: " + JSON.stringify(dateEntries));
        if (change.type == "added") {
          dateEntries.forEach((docDate) => {
            let i = this.columns.findIndex(
              (element) =>
                element.name == this.formatDate(docDate.date.toDate(), "-", "YYYYMMDD")
            );
            if (i != -1) {
              this.rows.push({
                docid: d.docid,
                name: d.name,
                date: this.columns[i].name,
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
            this.rows.forEach((row) => {
              if (row.docid == d.docid) {
                repeat = true;
                this.rows.splice(this.rows.indexOf(row), 1);
              }
            });
          } while (repeat);

          // adding
          dateEntries.forEach((docDate) => {
            let i = this.columns.findIndex(
              (element) =>
                element.name == this.formatDate(docDate.date.toDate(), "-", "YYYYMMDD")
            );
            if (i != -1) {
              this.rows.push({
                docid: d.docid,
                name: d.name,
                date: this.columns[i].name,
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
            this.rows.forEach((row) => {
              if (row.docid == d.docid) {
                repeat = true;
                this.rows.splice(this.rows.indexOf(row), 1);
              }
            });
          } while (repeat);
        }

        /* dateEntries.forEach((docDate) => {
          dateFields.forEach((fieldDate) => {
            // if activity date matches datefield, push that event into that date with customName
            if (fieldDate.toDateString() == docDate.date.toDate().toDateString()) {
              acts.push({
                date: docDate.date.toDate(),
                name: doc.data().name,
                customName: docDate.customName,
                active: doc.data().active,
                venue: doc.data().venue,
                docid: doc.id,
              });
            }
          });
        });
        */
        //}
      });
    });
  },
  created() {
    this.daysOfWeek = date.daysOfWeek.bind(this);
    this.formatDate = date.formatDate.bind(this);
    this.mergeDateSlot = date.mergeDateSlot.bind(this);
    this.splitDateSlot = date.splitDateSlot.bind(this);
    this.generateTableColumns = dateHeader.generateTableColumns.bind(this);
  },
  setup() {
    const $store = useStore();
  },
};
</script>

<style lang="scss" scoped>
@media screen {
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
    size: landscape;
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
    max-width: 14.9vw;
    // min-width: 14.9vw;
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
}

@media print and (orientation: portrait) {
  @page {
    size: portrait;
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
    width: 9%;
    vertical-align: top;
    border-left: 0.5px solid black;
    max-width: 9%;
    min-width: 9%;
    padding: 0;
  }

  .column-head {
    padding: 0 !important;
    width: 12.6%;
    min-width: 12.6%;
    max-width: 12.6%;
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
}
</style>
