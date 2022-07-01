<template>
  <q-page>
    <!-- loading dialog -->
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

    <!-- add user dialog -->
    <q-dialog v-model="addDialog">
      <q-card bordered>
        <q-card-section>
          <div class="text-h5 bg-blue-3 text-center">新增臨時員工</div>
        </q-card-section>
        <q-card-section class="q-mt-sm">
          <q-input type="text" hint="姓名" v-model="newStaff.name"></q-input>
          <q-input v-model="newStaff.dateOfEntry" type="date" hint="入職日期" />
        </q-card-section>
        <q-card-actions align="center">
          <q-btn
            square
            flat
            v-close-popup
            color="primary"
            icon="add"
            label="新增"
            @click="addTempStaff"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- delete user dialog -->
    <q-dialog v-model="deleteDialog">
      <q-card bordered>
        <q-card-section>
          <div class="text-h5 bg-blue-3 text-center">刪除臨時員工</div>
        </q-card-section>
        <q-card-section class="q-mt-sm">
          <div class="text-h6" v-for="row in selectedRow" :key="row.uid">
            {{ row.name }}
          </div>
        </q-card-section>
        <q-card-section>
          <div class="text-h6 text-red">注意：員工的所有編更記錄也會一併刪除！</div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn
            square
            flat
            v-close-popup
            color="red"
            icon="cancel"
            label="確認刪除"
            @click="deleteTempStaff"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- add / remove buttons -->
    <div class="row">
      <q-btn
        :disable="selectedRow.length > 0"
        class="col-1 col-xs-4 col-sm-4 col-md-4"
        square
        text-color="white"
        color="primary"
        icon="add"
        label="新增"
        @click="addDialog = true"
      />

      <q-btn
        :disable="selectedRow.length == 0"
        class="col-1 offset-1 col-xs-4 col-sm-4 col-md-4"
        square
        text-color="white"
        color="red"
        icon="cancel"
        label="刪除"
        v-if="!$q.screen.lt.sm"
        @click="deleteDialog = true"
      />
    </div>
    <q-table
      flat
      selection="multiple"
      :grid="$q.screen.lt.sm"
      v-model:selected="selectedRow"
      :rows="users"
      :columns="tableFields"
      :hide-bottom="true"
      :pagination="pagination"
      color="primary"
      row-key="uid"
    >
      <!-- grid template -->
      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4 flex">
          <q-card style="width: 95%; margin: auto; margin-top: 10px" class="q-pa-md">
            <q-card-section class="bg-blue-1 q-my-md row justify-around items-center">
              <div class="col-sm-6 text-h5">{{ props.row.name }}</div>
              <q-space />
              <div class="col-sm-6 q-mx-sm text-h5">
                排序{{ props.row.order }}
                <q-btn
                  :disable="props.row.order == 1"
                  round
                  size="xs"
                  color="positive"
                  icon="keyboard_arrow_up"
                  @click="changeOrder(props.key, 'UP')"
                />
                <q-btn
                  :disable="props.row.order == this.users.length"
                  round
                  size="xs"
                  color="negative"
                  icon="keyboard_arrow_down"
                  @click="changeOrder(props.key, 'DOWN')"
                />
              </div>
            </q-card-section>
            <q-card-section
              style="font-size: 1vw"
              class="row justify-around items-center"
            >
              <div class="col-xs-2 justify-center q-mx-xs">
                <div class="text-body1">帳戶有效</div>
                <q-btn
                  round
                  :color="props.row.enable ? 'positive' : 'negative'"
                  :label="props.row.enable ? '有' : '沒有'"
                  @click="changeEnable(props.key)"
                />
              </div>
              <div class="col-xs-5 justify-center q-mx-xs text-body2">
                <div>
                  入職日期：
                  <span v-html="qdate.formatDate(props.row.dateOfEntry, 'YYYY-MM-DD')" />
                </div>
                <div>
                  離職日期：<span
                    v-html="
                      props.row.dateOfExit
                        ? qdate.formatDate(props.row.dateOfExit, 'YYYY-MM-DD')
                        : ''
                    "
                  />
                  <q-btn icon="event" round color="primary" class="q-mx-xs">
                    <q-popup-proxy
                      @before-show="proxyDate = props.row.dateOfExit"
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date v-model="proxyDate">
                        <div class="row items-center justify-end q-gutter-sm">
                          <q-btn label="取消" color="primary" flat v-close-popup />
                          <q-btn
                            label="確定"
                            color="primary"
                            flat
                            @click="changeDateOfExit(props.row.uid, proxyDate)"
                            v-close-popup
                          />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-btn>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </template>

      <template v-slot:header-selection="scope">
        <q-checkbox v-model="scope.selected" />
      </template>

      <template v-slot:body-selection="scope">
        <q-checkbox v-model="scope.selected" />
      </template>

      <template v-slot:body-cell-enable="props">
        <q-td :props="props">
          <q-btn
            round
            :color="props.value ? 'positive' : 'negative'"
            :label="props.value ? '有' : '沒有'"
            @click="changeEnable(props.key)"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-order="props">
        <q-td :props="props" class="content-center">
          <div class="q-mx-sm">
            {{ props.value }}
            <q-btn
              :disable="props.value == 100"
              round
              size="xs"
              color="positive"
              icon="keyboard_arrow_up"
              @click="changeOrder(props.key, 'UP')"
            />
            <q-btn
              :disable="props.value == this.users.length"
              round
              size="xs"
              color="negative"
              icon="keyboard_arrow_down"
              @click="changeOrder(props.key, 'DOWN')"
            />
          </div>
        </q-td>
      </template>

      <!-- template of column "dateOfExit" -->
      <template v-slot:body-cell-dateOfExit="props">
        <q-td :props="props">
          <span
            v-html="
              props.row.dateOfExit
                ? qdate.formatDate(props.row.dateOfExit, 'YYYY-MM-DD')
                : ''
            "
          />
          <q-btn icon="event" round color="primary" class="q-mx-xs">
            <q-popup-proxy
              @before-show="proxyDate = props.row.dateOfExit"
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date v-model="proxyDate">
                <div class="row items-center justify-end q-gutter-sm">
                  <q-btn label="取消" color="primary" flat v-close-popup />
                  <q-btn
                    label="確定"
                    color="primary"
                    flat
                    @click="changeDateOfExit(props.row.uid, proxyDate)"
                    v-close-popup
                  />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-btn>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import { usersCollection, FirebaseFunctions } from "boot/firebase";
import { date as qdate } from "quasar";

export default {
  name: "TempStaff",
  computed: {
    waitingAsync() {
      return this.awaitServerResponse > 0 ? true : false;
    },
  },
  data() {
    return {
      qdate: qdate,
      selectedRow: [],
      addDialog: false,
      deleteDialog: false,
      awaitServerResponse: 0,
      newStaff: {
        name: "",
        dateOfEntry: new Date(),
        email: "n/a",
        uid: "",
        order: 0,
        enable: true,
        privilege: {
          scheduleModify: false,
          leaveManage: false,
          leaveApprove: false,
          logViewer: false,
          systemAdmin: false,
          sal: false,
          userManagement: false,
          tmp: true,
        },
        balance: {
          al: 0,
          sal: 0,
          ot: 0,
        },
        rank: "tmp",
        defaultSchedule: [
          "",
          "",
          "",
          "",
          "1",
          "2",
          "",
          "3",
          "4",
          "",
          "5",
          "6",
          "",
          "7",
          "8",
          "",
          "9",
          "10",
          "11",
          "",
          "",
        ],
      },
      users: [],
      pagination: {
        sortBy: "order",
        rowsPerPage: 0,
      },
      tableFields: [
        {
          name: "name",
          label: "姓名",
          field: "name",
          headerStyle: "font-size: 1.5vw; text-align: center;",
          style: "font-size: 1.2vw; text-align: center;",
        },
        {
          name: "enable",
          label: "帳戶有效",
          field: "enable",
          headerStyle: "font-size: 1.5vw; text-align: center;",
          style: "font-size: 1.2vw; text-align: center;",
        },
        {
          name: "order",
          label: "排序",
          field: "order",
          sortOrder: "ad",
          sort: (a, b, rowA, rowB) => parseInt(a, 10) - parseInt(b, 10),
          sortable: true,
          headerStyle: "font-size: 1.5vw; text-align: center;",
          style: "font-size: 1.2vw; text-align: center;",
        },
        {
          name: "dateOfEntry",
          label: "入職日期",
          field: "dateOfEntry",
          format: (value) => (value ? this.formatDate(value) : ""),
          headerStyle: "font-size: 1.5vw; text-align: center;",
          style: "font-size: 1.2vw; text-align: center;",
        },
        {
          name: "dateOfExit",
          label: "離職日期",
          field: "dateOfExit",
          format: (value) => (value ? this.formatDate(value) : ""),
          headerStyle: "font-size: 1.5vw; text-align: center;",
          style: "font-size: 1.2vw; text-align: center;",
        },
      ],
    };
  },
  methods: {
    async changeDateOfExit(uid, date) {
      const changeDateOfExit = FirebaseFunctions.httpsCallable("user-changeDateOfExit");
      changeDateOfExit({ uid: uid, dateOfExit: new Date(date) }).then((result) => {
        this.users[
          this.users.findIndex((value) => value.uid == result.data.uid)
        ].dateOfExit = result.data.dateOfExit;
      });
    },
    initializeNewStaffObject() {
      this.newStaff = {
        name: "",
        dateOfEntry: new Date(),
        email: "n/a",
        uid: "",
        order: 0,
        enable: true,
        privilege: {
          scheduleModify: false,
          leaveManage: false,
          leaveApprove: false,
          logViewer: false,
          systemAdmin: false,
          sal: false,
          userManagement: false,
          tmp: true,
        },
        balance: {
          al: 0,
          sal: 0,
          ot: 0,
        },
        rank: "tmp",
        defaultSchedule: [
          "",
          "",
          "",
          "",
          "1",
          "2",
          "",
          "3",
          "4",
          "",
          "5",
          "6",
          "",
          "7",
          "8",
          "",
          "9",
          "10",
          "11",
          "",
          "",
        ],
      };
    },
    async deleteTempStaff() {
      const delTmp = FirebaseFunctions.httpsCallable("user-delTempStaff");
      this.awaitServerResponse++;
      delTmp(this.selectedRow)
        .then((result) => {
          this.awaitServerResponse--;
          this.selectedRow = [];
          this.updateTempUserTable();
        })
        .catch((err) => {
          console.err(JSON.stringify(err));
        });
    },
    async addTempStaff() {
      const addTmp = FirebaseFunctions.httpsCallable("user-addTempStaff");
      this.awaitServerResponse++;
      addTmp(this.newStaff)
        .then((result) => {
          this.awaitServerResponse--;
          this.initializeNewStaffObject();
          this.updateTempUserTable();
        })
        .catch((err) => {
          console.err(JSON.stringify(err));
        });
    },
    async changeOrder(uid, dir) {
      // call https functions to change leaveApprove privilege
      const changeOrder = FirebaseFunctions.httpsCallable("user-changeOrder");
      changeOrder({ uid: uid, dir: dir }).then((result) => {
        this.users[this.users.findIndex((value) => value.uid == result.data.uid1)].order =
          result.data.order1;
        this.users[this.users.findIndex((value) => value.uid == result.data.uid2)].order =
          result.data.order2;
      });
    },
    async changeEnable(uid) {
      // call https functions to change leaveApprove privilege
      const toggleEnable = FirebaseFunctions.httpsCallable("user-toggleEnable");
      toggleEnable(uid).then((result) => {
        this.users[this.users.findIndex((value) => value.uid == uid)].enable =
          result.data;
      });
    },
    formatDate(date) {
      if (typeof date === "function") return;
      const data = new Date(date);
      const number = ["日", "一", "二", "三", "四", "五", "六"];
      const year = data.getFullYear();
      // const returnYear = number[year[0]] + number[year[1]] + number[year[2]] + number[year[3]];
      const month = data.getMonth() + 1;
      // const returnMonth = number[month];
      const day = data.getDate();
      // const returnDay = number[day];
      // const result = year + "年" + month + "月" + day + "日";
      const result = year + "-" + month + "-" + day + "(" + number[data.getDay()] + ")";
      // return date.toDateString();
      return result;
    },
    async updateTempUserTable() {
      this.users = [];
      // get tmp users
      const userDoc = await usersCollection
        .where("privilege.systemAdmin", "==", false)
        .where("privilege.tmp", "==", true)
        .get();

      userDoc.forEach((user) => {
        let d = user.data();
        if (d.dateOfEntry != undefined) {
          d.dateOfEntry = new Date(d.dateOfEntry.toDate());
        } else {
          d.dateOfEntry = new Date();
        }

        if (d.dateOfExit != undefined) {
          d.dateOfExit = new Date(d.dateOfExit.toDate());
        } else {
          d.dateOfExit = "";
        }

        this.users.push({
          name: d.name,
          enable: "enable" in d ? d.enable : true,
          uid: d.uid,
          order: d.order,
          dateOfEntry: d.dateOfEntry,
          dateOfExit: d.dateOfExit,
        });
      });
    },
  },
  async mounted() {
    this.updateTempUserTable();
  },
};
</script>

<style scoped></style>
