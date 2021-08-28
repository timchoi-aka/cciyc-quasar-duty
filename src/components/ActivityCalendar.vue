<template>
  <table>
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
                @click="modifyNameModal(object)"
                class="customName eventItem"
              >
                {{ object.customName }}
              </li>
              <li
                v-if="
                  !object.venue &&
                  object.date == columns[index - 1].name &&
                  !object.customName
                "
                @click="modifyNameModal(object)"
                class="eventItem"
              >
                {{ object.name }}
              </li>
            </template>
          </ul>
        </td>
      </tr>
      <tr>
        <th class="caption">租場</th>
        <td class="column-head" v-for="index in 7" v-bind:key="index">
          <ul>
            <template v-for="(object, key) in rows" v-bind:key="key">
              <li
                v-if="
                  object.venue && object.date == columns[index - 1] && object.customName
                "
                @click="modifyNameModal(object)"
                class="customName eventItem"
              >
                {{ object.customName }}
              </li>
              <li
                v-if="
                  object.venue &&
                  object.date == columns[index - 1].name &&
                  !object.customName
                "
                @click="modifyNameModal(object)"
                class="eventItem"
              >
                {{ object.name }}
              </li>
            </template>
          </ul>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { FirebaseFunctions, activityCollection } from "boot/firebase";
import date from "src/lib/date.js";
import dateHeader from "src/lib/dateHeader.js";
import { useStore } from "vuex";
import { useQuasar } from "quasar";

export default {
  name: "ActivityCalendar",
  props: {
    renderDate: Date,
    printHeader: Boolean,
  },
  data() {
    return {
      modifyTable: false,
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
    closeModal(modal) {
      this.$bvModal.hide(modal);
    },
    modifyNameModal(object) {
      this.modifyObject.name = object.name;
      this.modifyObject.venue = object.venue;
      this.modifyObject.active = object.active;
      if (object.customName == "") this.modifyObject.customName = object.name;
      else this.modifyObject.customName = object.customName;
      this.modifyObject.date = object.date;
      this.modifyObject.docid = object.docid;

      // console.log(JSON.stringify(this.modifyObject));
      this.$bvModal.show("modifyActivityNameModal");
      /*.msgBoxConfirm("修改活動？", {
          title: "請確認",
          size: "sm",
          buttonSize: "sm",
          okVariant: "danger",
          okTitle: "確認",
          cancelTitle: "取消",
          footerClass: "p-2",
          hideHeaderClose: false,
          centered: true,
        })
        .then((value) => {
          if (value) this.modifyEvent(docid);
          else this.table[id-1].isModify = !this.table[id-1].isModify;
        })
        .catch((err) => {
          console.log(err);
          // An error occurred
        });*/
    },
    resetName() {
      let i = this.table.findIndex(
        (element) =>
          element.date == this.modifyObject.date &&
          element.docid == this.modifyObject.docid
      );

      this.table[i] = this.modifyObject;
      this.$bvModal.hide("modifyActivityNameModal");
      const editActivityCustomName = FirebaseFunctions.httpsCallable(
        "activity-editActivityCustomName"
      );
      editActivityCustomName({
        name: this.modifyObject.name,
        venue: this.modifyObject.venue,
        active: this.modifyObject.active,
        customName: "",
        date: this.modifyObject.date.toISOString(),
        docid: this.modifyObject.docid,
      })
        .then(() => {})
        .catch((error) => {
          console.log(error.message);
        });

      this.modifyObject = {
        name: "",
        venue: false,
        active: true,
        customName: "",
        date: Date.now(),
        docid: "",
      };
    },
    modifyName() {
      let i = this.table.findIndex(
        (element) =>
          element.date == this.modifyObject.date &&
          element.docid == this.modifyObject.docid
      );

      this.table[i] = this.modifyObject;

      this.$bvModal.hide("modifyActivityNameModal");
      const editActivityCustomName = FirebaseFunctions.httpsCallable(
        "activity-editActivityCustomName"
      );
      editActivityCustomName({
        name: this.modifyObject.name,
        venue: this.modifyObject.venue,
        active: this.modifyObject.active,
        customName: this.modifyObject.customName,
        date: this.modifyObject.date.toISOString(),
        docid: this.modifyObject.docid,
      })
        .then(() => {})
        .catch((error) => {
          console.log(error.message);
        });

      this.modifyObject = {
        name: "",
        venue: false,
        active: true,
        customName: "",
        date: Date.now(),
        docid: "",
      };
    },
    refreshTable(date) {
      this.table = acts;
    },
  },
  async mounted() {
    this.columns.push(...this.generateTableColumns(this.renderDate, false));

    // load all activities
    activityCollection.onSnapshot((snapshot) => {
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
  computed: {
    modifyObjectFormatDate() {
      return this.formatDate(this.modifyObject.date, "", "月日");
    },
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
    const $q = useQuasar();

    return {
      // uid: computed(() => $store.getters["userModule/getUID"]),
      // username: computed(() => $store.getters["userModule/getUsername"]),
      // isSystemAdmin: computed(() => $store.getters["userModule/getSystemAdmin"]),
      // isScheduleModify: computed(() => $store.getters["userModule/getScheduleModify"]),
      // isCenterIC: computed(() => $store.getters["userModule/getCenterIC"]),
    };
  },
};
</script>

<style lang="scss" scoped>
* {
  margin: 0;
  padding: 0;
}

table {
  width: 100%;
  border: 0.5px solid black;
  border-collapse: collapse;
}

table th,
td {
  border: 0.5px solid black;
  padding: 0 !important;
}

@media screen {
  table .caption {
    //width: 9%;
    font-weight: bold;
    font-size: 1.3vw;
    //width: 20.3mm;
    width: 5vw !important;
    padding: 0 !important;
    vertical-align: top;
  }

  table .column-head {
    // width: 13%;
    padding: 0 !important;
    width: 8vw !important;
    vertical-align: top;
  }

  ul li.eventItem {
    list-style: none;
    display: block;
    border: 0.5px solid black;
    padding: 2px 5px !important;
    font-size: 1.3vw !important;
    line-height: 1.3vw !important;
  }

  .eventItem:hover {
    background-color: $green-2;
  }

  .customName {
    background-color: yellow;
    display: block;
  }
}
@media print {
  table .caption {
    //width: 15mm !important;
    //max-width: 15mm !important;
    width: 5vw !important;
    max-width: 5vw !important;
    padding: 0 !important;
    vertical-align: top;
  }

  table .column-head {
    padding: 0 !important;
    width: 8.01vw !important;
    //width: 13% !important;
    vertical-align: top;
  }

  table thead th {
    background-color: lightgray !important;
  }

  ul li.eventItem {
    list-style: none;
    border-bottom: 0.5px solid grey;
    padding: 0.5mm 1mm 0.5mm 1mm !important;
    //margin: 0 !important;
    //font-size: 2vmin !important;
    //line-height: 2vmin !important;
    font-size: 10pt !important;
    line-height: 10pt !important;
  }

  .customName {
    background-color: lightgray;
    display: block;
  }
}
</style>
