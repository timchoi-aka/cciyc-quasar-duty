<!-- disable CL application if balance not enough -->
<template>
  <div class="full-width">
    <!-- sticky button at bottom -->
    <q-page-sticky position="bottom-right" :offset="[20, 20]" style="z-index: 1">
      <q-fab
        :disable="!isAllValidDate()"
        v-if="this.applicationList.length > 0"
        label="確定申請"
        color="primary"
        push
        @click="confirmDialog = !confirmDialog"
      />
    </q-page-sticky>

    <!-- loading dialog -->
    <q-dialog v-model="waitingAsync" position="bottom">
      <LoadingDialog message="讀取資料中"/>
    </q-dialog>

    <!-- confirm dialog -->
    <q-dialog v-model="confirmDialog">
      <q-card style="border-radius: 30px">
        <q-card-section>
          <div class="text-h5 text-center" style="border-bottom: 3px solid blue">
            確定申請超時補假？
          </div>
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div v-for="app in applicationList">
            {{ app.date }} - {{ app.type }} - {{ app.hours }}小時 - {{ app.remarks }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn v-close-popup flat color="primary" label="取消" />
          <q-btn
            v-close-popup
            @click="confirmOTApplication"
            flat
            color="primary"
            label="確認申請"
            round
            icon="event"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Application Table -->
    <div class="full-width">
      <div class="row">
        <div class="q-mr-sm col-1 col-xs-5 col-md-3 col-lg-3 col-sm-3 text-h6">
          超時結餘
          <q-knob
            :min="0"
            :max="40"
            readonly
            v-model="ot_balance"
            show-value
            :thickness="0.22"
            color="primary"
            track-color="grey-3"
          />
        </div>
        <div class="col-1 col-xs-3 col-md-2 col-lg-1 col-sm-3">
          <q-btn
            label="新增"
            color="primary"
            text-color="white"
            square
            @click="
              applicationList.push({
                date: qdate.formatDate(new Date(), 'YYYY-MM-DD'),
                type: 'OT',
                hours: '0',
                remarks: '',
              })
            "
          />
        </div>
      </div>

      <!-- header row -->
      <q-table
        dense
        flat
        :grid="$q.screen.lt.md"
        :rows="applicationList"
        :columns="columns"
        :pagination="defaultPagination"
        :hide-bottom="true"
        color="primary"
        row-key="date"
      >
        <!-- date cell template -->
        <template v-slot:body-cell-date="props">
          <q-td class="q-pa-sm" style="font-size: 1.5vw; text-align: center"
            ><q-input
              borderless
              v-model="applicationList[applicationList.indexOf(props.row)].date"
              filled
              error-message="這日期已有超時補假記錄！"
              :error="!isValidDate(applicationList.indexOf(props.row))"
              type="date"
              @update:model-value="
                (value) => {
                  applicationList[applicationList.indexOf(props.row)].date = value;
                }
              "
            >
              <template v-slot:append>
                <q-icon name="event" />
              </template>
            </q-input>
          </q-td>
        </template>

        <!-- type cell template -->
        <template v-slot:body-cell-type="props">
          <q-td class="q-pa-sm" style="font-size: 1.5vw; text-align: center"
            ><q-btn-toggle
              size="md"
              class="bg-light-blue-2"
              v-model="applicationList[applicationList.indexOf(props.row)].type"
              push
              toggle-color="primary"
              :options="[
                { label: 'OT', value: 'OT' },
                { label: '補OT', value: '補OT' },
              ]"
            />
          </q-td>
        </template>

        <!-- hours cell template -->
        <template v-slot:body-cell-hours="props">
          <q-td class="q-pa-sm" style="font-size: 1.5vw; text-align: center">
            <q-input
              :rules="[
                (val) => val >= 0 || '數值要大於0',
                (val) =>
                  (props.row.type == '補OT' ? val <= ot_balance : true) ||
                  '沒有足夠OT時數',
              ]"
              type="number"
              step="0.5"
              v-model="applicationList[applicationList.indexOf(props.row)].hours"
            ></q-input>
          </q-td>
        </template>

        <!-- remarks cell template -->
        <template v-slot:body-cell-remarks="props">
          <q-td class="q-pa-sm" style="font-size: 1.5vw; text-align: center">
            <q-input
              type="text"
              v-model="applicationList[applicationList.indexOf(props.row)].remarks"
            ></q-input>
          </q-td>
        </template>

        <!-- action cell template -->
        <template v-slot:body-cell-actions="props">
          <q-td class="q-pa-sm" style="font-size: 1.5vw; text-align: center">
            <q-btn
              color="red"
              label="刪除"
              @click="applicationList.splice(applicationList.indexOf(props.row), 1)"
            ></q-btn>
          </q-td>
        </template>

        <!-- grid template -->
        <template v-slot:item="props">
          <q-card class="q-pa-xs q-mb-xs col-xs-12 col-sm-12 col-md-12">
            <q-card-section
              ><q-btn
                color="red"
                class="absolute-top-right"
                icon="cancel"
                @click="applicationList.splice(applicationList.indexOf(props.row), 1)"
              ></q-btn>
            </q-card-section>
            <q-card-section>
              <div class="row items-center">
                <div class="col-xs-2 col-sm-2 col-md-2 text-h6">日期:</div>
                <div class="col-xs-10 col-sm-4 col-md-4">
                  <q-input
                    borderless
                    bottom-slots
                    v-model="applicationList[applicationList.indexOf(props.row)].date"
                    filled
                    error-message="這日期已有記錄！"
                    :error="!isValidDate(applicationList.indexOf(props.row))"
                    type="date"
                    @update:model-value="
                      (value) => {
                        applicationList[applicationList.indexOf(props.row)].date = value;
                      }
                    "
                  >
                    <template v-slot:append>
                      <q-icon name="event" />
                    </template>
                  </q-input>
                </div>

                <div class="col-xs-2 col-sm-2 col-md-2 text-h6">種類:</div>
                <div class="col-xs-5 col-sm-3 col-md-3">
                  <q-btn-toggle
                    size="md"
                    class="bg-light-blue-2"
                    v-model="applicationList[applicationList.indexOf(props.row)].type"
                    push
                    toggle-color="primary"
                    :options="[
                      { label: 'OT', value: 'OT' },
                      { label: '補OT', value: '補OT' },
                    ]"
                  />
                </div>
                <div class="col-xs-2 col-sm-2 col-md-2 text-h6">時數:</div>
                <div class="col-xs-3 col-sm-2 col-md-2">
                  <q-input
                    :rules="[
                      (val) => val >= 0 || '數值要大於0',
                      (val) =>
                        (props.row.type == '補OT' ? val <= ot_balance : true) ||
                        '沒有足夠OT時數',
                    ]"
                    type="number"
                    step="0.5"
                    v-model="applicationList[applicationList.indexOf(props.row)].hours"
                  ></q-input>
                </div>
              </div>

              <div class="row">
                <div class="col-xs-2 col-sm-2 col-md-2 text-h6">備註:</div>
                <div class="col-xs-10 col-sm-5 col-md-5">
                  <q-input
                    type="text"
                    v-model="applicationList[applicationList.indexOf(props.row)].remarks"
                  ></q-input>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script>
import { FirebaseFunctions, OTCollection } from "boot/firebase";
import LoadingDialog from "components/LoadingDialog.vue"
import { useStore } from "vuex";
import { defineComponent, computed } from "vue";
import { date as qdate } from "quasar";

export default defineComponent({
  name: "OTApply",
  components: {
    LoadingDialog,
  },
  data() {
    return {
      confirmDialog: false,
      qdate: qdate,
      OTHistory: [],
      applicationList: [],
      leaveMap: {
        OT: "OT",
        CL: "補OT",
      },
      leaveInverseMap: {
        OT: "OT",
        補OT: "CL",
      },
      defaultPagination: {
        rowsPerPage: 10,
      },
      columns: [
        {
          name: "date",
          label: "日期",
          field: "date",
          style: "font-size: 1.5vw; text-align: center",
          headerStyle: "font-size: 1.5vw; text-align: center; width: 10vw;",
          headerClasses: "bg-grey-2 nameColumn",
        },
        {
          name: "type",
          label: "種類",
          field: "type",
          style: "font-size: 1.5vw; text-align: center",
          headerStyle: "font-size: 1.5vw; text-align: center; width: 10vw;",
          headerClasses: "bg-grey-2",
        },
        {
          name: "hours",
          label: "時數",
          field: "hours",
          style: "font-size: 1.5vw; text-align: center",
          headerStyle: "font-size: 1.5vw; text-align: center; width: 10vw;",
          headerClasses: "bg-grey-2",
        },
        {
          name: "remarks",
          label: "備註",
          field: "remarks",
          style: "font-size: 1.5vw; text-align: center",
          headerStyle:
            "font-size: 1.5vw; text-align: center; width: 40vw; min-width: 40vw;",
          headerClasses: "bg-grey-2",
        },
        {
          name: "actions",
          label: "動作",
          field: "actions",
          style: "font-size: 1.5vw; text-align: center",
          headerStyle: "font-size: 1.5vw; text-align: center; width: 10vw;",
          headerClasses: "bg-grey-2",
        },
      ],
      awaitServerResponse: 0,
    };
  },
  methods: {
    isValidDate(index) {
      let result = true;
      if (this.OTHistory.includes(this.applicationList[index].date)) result = false;
      for (let i = 0; i < this.applicationList.length; i++) {
        if (index == i) continue;
        if (this.applicationList[index].date == this.applicationList[i].date)
          result = false;
      }
      return result;
    },
    isAllValidDate() {
      let result = true;
      for (let i = 0; i < this.applicationList.length; i++) {
        if (this.OTHistory.includes(this.applicationList[i].date)) result = false;
        if (this.applicationList[i].hours <= 0) result = false;
        for (let j = 0; j < this.applicationList.length; j++) {
          // prevents the element from comparing with itself
          if (i !== j) {
            // check if elements' values are equal
            if (this.applicationList[i].date === this.applicationList[j].date) {
              // duplicate element present
              result = false;
              // terminate inner loop
              break;
            }
          }
        }
      }
      let tempApplicationList = JSON.parse(JSON.stringify(this.applicationList));
      for (let i = 0; i < tempApplicationList.length; i++) {
        if (tempApplicationList[i].type == "補OT")
          tempApplicationList[i].hours = -tempApplicationList[i].hours;
      }

      if (
        this.ot_balance +
          tempApplicationList.reduce((a, b) => parseFloat(a) + parseFloat(b.hours), 0) <
        0
      )
        result = false;
      return result;
    },
    async confirmOTApplication() {
      // feed applicationList to a formal leaveData structure
      let leaveData = [];

      this.applicationList.forEach((leave) => {
        leaveData.push({
          date: new Date(leave.date),
          type: this.leaveInverseMap[leave.type],
          hours:
            this.leaveInverseMap[leave.type] == "CL"
              ? -parseFloat(leave.hours)
              : parseFloat(leave.hours),
          remarks: [leave.remarks],
          uid: this.uid,
          name: this.username,
          validity: true,
          status: "未批",
        });
      });

      // call https functions to add leaves
      const addOT = FirebaseFunctions.httpsCallable("ot-addLeaveByDocid");
      this.awaitServerResponse++;
      addOT(leaveData)
        .then(() => {
          this.awaitServerResponse--;
          this.applicationList = [];
          this.fetchAllOTRecords();
        })
        .catch((error) => {
          console.log(error.message);
        });
    },
    async fetchAllOTRecords() {
      this.OTHistory = [];
      const OTRecords = await OTCollection.where("uid", "==", this.uid)
        .where("status", "!=", "拒絕")
        .get();

      OTRecords.forEach((doc) => {
        this.OTHistory.push(qdate.formatDate(doc.data().date, "YYYY-MM-DD"));
      });
    },
  },
  async mounted() {
    await this.fetchAllOTRecords();
  },
  computed: {
    waitingAsync() {
      return this.awaitServerResponse > 0 ? true : false;
    },
  },
  setup() {
    const $store = useStore();

    return {
      uid: computed(() => $store.getters["userModule/getUID"]),
      username: computed(() => $store.getters["userModule/getUsername"]),
      ot_balance: computed(() => $store.getters["userModule/getOTBalance"]),
    };
  },
});
</script>

<style lang="scss" scoped>
.gridCard {
  font-size: 4vw;
}
</style>
