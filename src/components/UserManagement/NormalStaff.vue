<template>
  <div>
    <!-- loading dialog -->
    <q-dialog v-model="waitingAsync" position="bottom">
      <LoadingDialog message="儲存中"/>
    </q-dialog>

    <q-table
      flat
      :grid="$q.screen.lt.sm"
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
            <q-card-section style="font-size: 1vw" class="row justify-around q-pa-none">
              <div class="col-xs-2 justify-center" style="text-align: center">
                <div class="text-caption">帳戶有效</div>
                <q-btn
                  round
                  :color="props.row.enable ? 'positive' : 'negative'"
                  :label="props.row.enable ? '有' : '沒有'"
                  @click="changeEnable(props.key)"
                />
              </div>
              <div class="col-xs-2 justify-center" style="text-align: center">
                <div class="text-caption">批核假期</div>
                <q-btn
                  round
                  :color="props.row.privilege_leaveApprove ? 'positive' : 'negative'"
                  :label="props.row.privilege_leaveApprove ? '有' : '沒有'"
                  @click="changeLeaveApprove(props.key)"
                />
              </div>
              <div class="col-xs-2 justify-center" style="text-align: center">
                <div class="text-caption">檢視假期</div>
                <q-btn
                  round
                  :color="props.row.privilege_leaveManage ? 'positive' : 'negative'"
                  :label="props.row.privilege_leaveManage ? '有' : '沒有'"
                  @click="changeLeaveManage(props.key)"
                />
              </div>
              <div class="col-xs-2 justify-center" style="text-align: center">
                <div class="text-caption">特別年假</div>
                <q-btn
                  round
                  :color="props.row.privilege_sal ? 'positive' : 'negative'"
                  :label="props.row.privilege_sal ? '有' : '沒有'"
                  @click="changeSal(props.key)"
                />
              </div>
              <div class="col-xs-2 justify-center" style="text-align: center">
                <div class="text-caption">修改更表</div>
                <q-btn
                  round
                  :color="props.row.privilege_scheduleModify ? 'positive' : 'negative'"
                  :label="props.row.privilege_scheduleModify ? '有' : '沒有'"
                  @click="changeScheduleModify(props.key)"
                />
              </div>
              <div class="col-xs-2 justify-center" style="text-align: center">
                <div class="text-caption">用戶管理</div>
                <q-btn
                  round
                  :color="props.row.privilege_userManagement ? 'positive' : 'negative'"
                  :label="props.row.privilege_userManagement ? '有' : '沒有'"
                  @click="changeUserManagement(props.key)"
                />
              </div>
            </q-card-section>
            <q-separator inet class="q-mt-sm" />
            <q-card-section
              style="font-size: 1vw"
              class="row justify-around items-center q-pa-none"
            >
              <div class="col-xs-8 justify-center q-mx-xs text-body2">
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
              <div class="col-xs-3 justify-center q-mx-xs">
                <q-select
                  :label="rankInputReverseMap[props.row.rank]"
                  hide-bottom-space
                  hint="職級"
                  v-model="props.newRank"
                  :options="rankInputOptions"
                  @update:model-value="
                    (val) => {
                      changeRank(props.key, val);
                    }
                  "
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </template>

      <!-- template of column "enable" -->
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

      <!-- template of column "leaveApprove" -->
      <template v-slot:body-cell-privilege_leaveApprove="props">
        <q-td :props="props">
          <q-btn
            round
            :color="props.value ? 'positive' : 'negative'"
            :label="props.value ? '有' : '沒有'"
            @click="changeLeaveApprove(props.key)"
          />
        </q-td>
      </template>

      <!-- template of column "leaveManage" -->
      <template v-slot:body-cell-privilege_leaveManage="props">
        <q-td :props="props">
          <q-btn
            round
            :color="props.value ? 'positive' : 'negative'"
            :label="props.value ? '有' : '沒有'"
            @click="changeLeaveManage(props.key)"
          />
        </q-td>
      </template>

      <!-- template of column "sal" -->
      <template v-slot:body-cell-privilege_sal="props">
        <q-td :props="props">
          <q-btn
            round
            :color="props.value ? 'positive' : 'negative'"
            :label="props.value ? '有' : '沒有'"
            @click="changeSal(props.key)"
          />
        </q-td>
      </template>

      <!-- template of column "scheduleModify" -->
      <template v-slot:body-cell-privilege_scheduleModify="props">
        <q-td :props="props">
          <q-btn
            round
            :color="props.value ? 'positive' : 'negative'"
            :label="props.value ? '有' : '沒有'"
            @click="changeScheduleModify(props.key)"
          />
        </q-td>
      </template>

      <!-- template of column "userManagement" -->
      <template v-slot:body-cell-privilege_userManagement="props">
        <q-td :props="props">
          <q-btn
            round
            :color="props.value ? 'positive' : 'negative'"
            :label="props.value ? '有' : '沒有'"
            @click="changeUserManagement(props.key)"
          />
        </q-td>
      </template>

      <!-- template of column "probation" -->
      <template v-slot:body-cell-privilege_probation="props">
        <q-td :props="props">
          <q-btn
            round
            :color="props.value ? 'positive' : 'negative'"
            :label="props.value ? '有' : '沒有'"
            @click="changeProbation(props.key)"
          />
        </q-td>
      </template>

      <!-- template of column "rank" -->
      <template v-slot:body-cell-rank="props">
        <q-td :props="props">
          <q-select
            :label="rankInputReverseMap[props.row.rank]"
            hide-bottom-space
            v-model="props.newRank"
            :options="rankInputOptions"
            @update:model-value="
              (val) => {
                changeRank(props.key, val);
              }
            "
          />
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

      <!-- template of column "order" -->
      <template v-slot:body-cell-order="props">
        <q-td :props="props" class="content-center">
          <div class="q-mx-sm">
            {{ props.value }}
            <q-btn
              :disable="props.value == 1"
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
    </q-table>
  </div>
</template>

<script>
import { usersCollection, FirebaseFunctions } from "boot/firebase";
import { date as qdate } from "quasar";
import LoadingDialog from "components/LoadingDialog.vue"

export default {
  name: "NormalStaff",
  components: {
    LoadingDialog,
  },
  data() {
    return {
      qdate: qdate,
      awaitServerResponse: 0,
      proxyDate: "",
      users: [],
      rankInputOptions: ["IC", "SWA", "WW", "OA", "WM2", "GA", "TMP"],
      rankInputMap: {
        IC: "ic",
        SWA: "swa",
        WW: "ww",
        OA: "oa",
        WM2: "wm2",
        GA: "ga",
        TMP: "tmp",
      },
      rankInputReverseMap: {
        ic: "IC",
        swa: "SWA",
        ww: "WW",
        oa: "OA",
        wm2: "WM2",
        ga: "GA",
        tmp: "TMP",
      },
      pagination: {
        sortBy: "order",
        rowsPerPage: 0,
      },
      tableFields: [
        {
          name: "name",
          label: "姓名",
          field: "name",
          headerStyle:
            "font-size: 1.5vw; text-align: center; width: 3vw;  max-width: 3vw;",
          style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
        },
        {
          name: "enable",
          label: "帳戶有效",
          field: "enable",
          headerStyle:
            "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 3vw;",
          style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
        },
        {
          name: "privilege_leaveApprove",
          label: "批核假期",
          field: "privilege_leaveApprove",
          headerStyle:
            "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 3vw;",
          style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
        },
        {
          name: "privilege_leaveManage",
          label: "檢視假期",
          field: "privilege_leaveManage",
          headerStyle:
            "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 3vw;",
          style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
        },
        {
          name: "privilege_sal",
          label: "特別年假",
          field: "privilege_sal",
          headerStyle:
            "font-size: 1.5vw; text-align: center;  width: 3vw; max-width: 3vw;",
          style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
        },
        {
          name: "privilege_scheduleModify",
          label: "修改更表",
          field: "privilege_scheduleModify",
          headerStyle:
            "font-size: 1.5vw; text-align: center;  width: 3vw; max-width: 3vw;",
          style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
        },
        {
          name: "privilege_userManagement",
          label: "用戶管理",
          field: "privilege_userManagement",
          headerStyle:
            "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 3vw;",
          style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
        },
        {
          name: "privilege_probation",
          label: "試用",
          field: "privilege_probation",
          headerStyle:
            "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 3vw;",
          style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
        },
        {
          name: "order",
          label: "排序",
          field: "order",
          sortOrder: "ad",
          sort: (a, b, rowA, rowB) => parseInt(a, 10) - parseInt(b, 10),
          sortable: true,
          headerStyle:
            "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 5vw;",
          style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 5vw;",
        },
        {
          name: "dateOfEntry",
          label: "入職日期",
          field: "dateOfEntry",
          format: (value) => (value ? this.formatDate(value) : ""),
          headerStyle:
            "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 5vw;",
          style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 5vw;",
        },
        {
          name: "dateOfExit",
          label: "離職日期",
          field: "dateOfExit",
          format: (value) => (value ? this.formatDate(value) : ""),
          headerStyle:
            "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 5vw;",
          style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 5vw;",
        },
        {
          name: "rank",
          label: "職級",
          field: "rank",
          headerStyle:
            "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 5vw;",
          style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 5vw;",
        },
      ],
    };
  },
  computed: {
    waitingAsync() {
      return this.awaitServerResponse > 0 ? true : false;
    },
  },
  methods: {
    async changeDateOfExit(uid, date) {
      const changeDateOfExit = FirebaseFunctions.httpsCallable("user-changeDateOfExit");
      this.awaitServerResponse++;
      changeDateOfExit({ uid: uid, dateOfExit: new Date(date) }).then((result) => {
        this.users[
          this.users.findIndex((value) => value.uid == result.data.uid)
        ].dateOfExit = result.data.dateOfExit;
        this.awaitServerResponse--;
      });
    },
    async changeRank(uid, rank) {
      const changeRank = FirebaseFunctions.httpsCallable("user-changeRank");
      this.awaitServerResponse++;
      changeRank({ uid: uid, rank: this.rankInputMap[rank] }).then((result) => {
        this.users[this.users.findIndex((value) => value.uid == result.data.uid)].rank =
          result.data.rank;
        this.awaitServerResponse--;
      });
    },
    async changeOrder(uid, dir) {
      // call https functions to change leaveApprove privilege
      const changeOrder = FirebaseFunctions.httpsCallable("user-changeOrder");
      this.awaitServerResponse++;
      changeOrder({ uid: uid, dir: dir }).then((result) => {
        this.users[this.users.findIndex((value) => value.uid == result.data.uid1)].order =
          result.data.order1;
        this.users[this.users.findIndex((value) => value.uid == result.data.uid2)].order =
          result.data.order2;
        this.awaitServerResponse--;
      });
    },
    async changeEnable(uid) {
      // call https functions to change leaveApprove privilege
      const toggleEnable = FirebaseFunctions.httpsCallable("user-toggleEnable");
      this.awaitServerResponse++;
      toggleEnable(uid).then((result) => {
        this.users[this.users.findIndex((value) => value.uid == uid)].enable =
          result.data;
        this.awaitServerResponse--;
      });
    },
    async changeLeaveApprove(uid) {
      // call https functions to change leaveApprove privilege
      const toggleLeaveApprove = FirebaseFunctions.httpsCallable(
        "user-toggleLeaveApprove"
      );
      this.awaitServerResponse++;
      toggleLeaveApprove(uid).then((result) => {
        this.users[
          this.users.findIndex((value) => value.uid == uid)
        ].privilege_leaveApprove = result.data;
        this.awaitServerResponse--;
      });
    },
    async changeLeaveManage(uid) {
      // call https functions to change leaveApprove privilege
      const toggleLeaveManage = FirebaseFunctions.httpsCallable("user-toggleLeaveManage");
      this.awaitServerResponse++;
      toggleLeaveManage(uid).then((result) => {
        this.users[
          this.users.findIndex((value) => value.uid == uid)
        ].privilege_leaveManage = result.data;
        this.awaitServerResponse--;
      });
    },
    async changeUserManagement(uid) {
      // call https functions to change leaveApprove privilege
      const toggleUserManagement = FirebaseFunctions.httpsCallable(
        "user-toggleUserManagement"
      );
      this.awaitServerResponse++;
      toggleUserManagement(uid).then((result) => {
        this.users[
          this.users.findIndex((value) => value.uid == uid)
        ].privilege_userManagement = result.data;
        this.awaitServerResponse--;
      });
    },
    async changeProbation(uid) {
      // call https functions to change leaveApprove privilege
      const toggleProbation = FirebaseFunctions.httpsCallable(
        "user-toggleProbation"
      );
      this.awaitServerResponse++;
      toggleProbation(uid).then((result) => {
        this.users[
          this.users.findIndex((value) => value.uid == uid)
        ].privilege_probation = result.data;
        this.awaitServerResponse--;
      });
    },
    async changeSal(uid) {
      // call https functions to change sal privilege
      const toggleSal = FirebaseFunctions.httpsCallable("user-toggleSal");
      this.awaitServerResponse++;
      toggleSal(uid).then((result) => {
        this.users[this.users.findIndex((value) => value.uid == uid)].privilege_sal =
          result.data;
        this.awaitServerResponse--;
      });
    },
    async changeScheduleModify(uid) {
      // call https functions to change scheduleModify privilege
      const toggleScheduleModify = FirebaseFunctions.httpsCallable(
        "user-toggleScheduleModify"
      );
      this.awaitServerResponse++;
      toggleScheduleModify(uid).then((result) => {
        this.users[
          this.users.findIndex((value) => value.uid == uid)
        ].privilege_scheduleModify = result.data;
        this.awaitServerResponse--;
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
  },
  async mounted() {
    const userDoc = await usersCollection
      .where("privilege.systemAdmin", "==", false)
      .where("privilege.tmp", "!=", true)
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
        privilege_leaveApprove: d.privilege.leaveApprove,
        privilege_leaveManage: d.privilege.leaveManage,
        privilege_sal: d.privilege.sal,
        privilege_scheduleModify: d.privilege.scheduleModify,
        privilege_userManagement: d.privilege.userManagement,
        privilege_probation: d.privilege.probation? d.privilege.probation: false,
        order: d.order,
        dateOfEntry: d.dateOfEntry,
        dateOfExit: d.dateOfExit,
        rank: d.rank,
      });
    });
  },
};
</script>

<style scoped></style>
