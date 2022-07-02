<template>
  <q-page class="full-width">
    <div class="row full-width">
      <q-table
        class="col"
        dense
        flat
        selection="multiple"
        v-model:selected="selectedRow"
        :grid="$q.screen.lt.sm"
        :rows="rows"
        :columns="columns"
        :pagination="defaultPagination"
        separator="cell"
        color="primary"
        row-key="date"
        no-data-label="沒有待審批假期"
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
          <div class="col-xs-12 col-sm-6 col-md-4 flex full-width">
            <q-card class="q-mt-md full-width">
              <q-card-section
                ><q-btn
                  color="red"
                  class="absolute-top-right"
                  icon="cancel"
                  @click="confirmALRemoveByDocid(props.row)"
                ></q-btn>
              </q-card-section>
              <q-card-section class="bg-blue-1 text-body1">
                <div class="row">
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

              <q-card-section class="text-body1">
                <div class="col text-left" v-for="remark in props.row.remarks">
                  {{ remark }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </template>
      </q-table>

      <!-- loading dialog -->
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

      <!-- sticky button at bottom -->
      <q-page-sticky position="bottom-right" :offset="[20, 20]" style="z-index: 1">
        <q-fab
          v-if="this.selectedRow.length > 0 && !$q.screen.lt.sm"
          label="確定刪除"
          color="red"
          push
          @click="confirmDialog = !confirmDialog"
        />
      </q-page-sticky>

      <!-- confirm delete dialog -->
      <q-dialog v-model="confirmDialog">
        <q-card style="border-radius: 30px">
          <q-card-section>
            <div class="text-h5 text-center" style="border-bottom: 3px solid red">
              確定取消申請假期？
            </div>
          </q-card-section>

          <q-card-section class="q-pa-md">
            <div v-for="app in selectedRow">
              <span
                v-html="
                  '【' +
                  typeMap[app.type] +
                  '】 ' +
                  qdate.formatDate(app.date, 'YYYY-MM-DD') +
                  ' - ' +
                  slotMap[app.slot]
                "
              />
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn v-close-popup flat color="primary" label="取消" />
            <q-btn
              v-close-popup
              @click="confirmALRemove"
              flat
              color="red"
              label="確認刪除"
              round
              icon="cancel"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script>
import { FirebaseFunctions, leaveCollection } from "boot/firebase";
import { defineComponent } from "vue";
import { date as qdate } from "quasar";

export default defineComponent({
  name: "HolidayPending",
  props: {
    uid: String,
  },
  data() {
    return {
      qdate: qdate,
      selectedRow: [],
      confirmDialog: false,
      pendingApplicationList: [],
      awaitServerResponse: 0,

      defaultPagination: {
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
          name: "date",
          label: "日期",
          field: "date",
          style: "font-size: 1.5vw; text-align: center",
          headerStyle: "font-size: 1.5vw; text-align: center;",
          headerClasses: "bg-grey-2",
          format: (val) =>
            qdate.formatDate(val, "M月D日(ddd)", {
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
        },
        {
          name: "remarks",
          label: "附註",
          field: "remarks",
          style: "font-size: 1.5vw; text-align: center",
          headerStyle: "font-size: 1.5vw; text-align: center;",
          headerClasses: "bg-grey-2",
        },
      ],
    };
  },
  methods: {
    async confirmALRemove() {
      // call https functions to add leaves
      const delAL = FirebaseFunctions.httpsCallable("holiday-delLeaveByDocid");
      this.awaitServerResponse++;
      delAL(this.selectedRow)
        .then((result) => {
          for (let i = 0; i < result.data.length; i++) {
            let index = this.rows.findIndex(
              (element) => element.docid == result.data[i].docid
            );
            this.rows.splice(index, 1);
          }
          this.awaitServerResponse--;
          this.selectedRow = [];
        })
        .catch((error) => {
          console.log(error.message);
        });
    },
    async confirmALRemoveByDocid(docid) {
      // call https functions to add leaves
      const delAL = FirebaseFunctions.httpsCallable("holiday-delLeaveByDocid");
      this.awaitServerResponse++;
      delAL([docid])
        .then((result) => {
          for (let i = 0; i < result.data.length; i++) {
            let index = this.rows.findIndex(
              (element) => element.docid == result.data[i].docid
            );
            this.rows.splice(index, 1);
          }
          this.awaitServerResponse--;
          this.selectedRow = [];
        })
        .catch((error) => {
          console.log(error.message);
        });
    },
    async refreshHolidayTable() {
      // this.pendingApplicationList = [];
      this.rows = [];
      let applications = await leaveCollection
        .where("uid", "==", this.uid)
        .where("status", "==", "未批")
        .get();

      applications.forEach((doc) => {
        this.rows.push({
          docid: doc.id,
          date: doc.data().date,
          slot: doc.data().slot,
          type: doc.data().type,
          remarks: doc.data().remarks,
        });
      });
    },
  },
  async mounted() {
    this.awaitServerResponse++;
    this.refreshHolidayTable().then((response) => {
      this.awaitServerResponse--;
    });
  },
  computed: {
    waitingAsync() {
      return this.awaitServerResponse > 0 ? true : false;
    },
  },
});
</script>

<style lang="scss" scoped></style>
