<template>
  <q-page>
    <b-modal
      v-model="salSummaryModalShow"
      size="xl"
      centered
      title="特別年假總結"
      content-class="shadow"
    >
      <b-table
        striped
        responsive
        hover
        foot-clone
        foot-variant="light"
        :items="SALHolidaySummary"
        :fields="SALHolidaySummaryField"
        primary-key="leaveDocid"
      >
        <template #cell(date)="data">
          {{ data.value ? formatDate(data.value) : "" }}
        </template>
        <template #foot()="data">
          <span>{{ SALRemains(data.column) }}</span>
        </template>
      </b-table>
    </b-modal>
    <b-modal
      v-model="alSummaryModalShow"
      size="xl"
      centered
      title="年假總結"
      content-class="shadow"
    >
      <!-- <b-table :items="holidayRemains" :fields="holidayRemainsField">
    <template #cell(date)="data">
        {{ data.value ? formatDate(data.value) : "" }}
      </template>
      <template #cell(result)="data">
        {{data.value }}
      </template>
    </b-table> -->

      <b-row>
        <b-col class="mr-auto">
          <b-button
            size="lg"
            variant="outline-primary"
            class="light mx-2"
            v-on:click="changeRenderYear(-1)"
          >
            上年
          </b-button>
          <b-button
            size="lg"
            variant="outline-primary"
            class="light mx-2"
            v-on:click="changeRenderYear(1)"
          >
            下年
          </b-button>
        </b-col>
      </b-row>
      <table class="table">
        <caption>
          {{
            getReportYear
          }}年
        </caption>
        <thead>
          <tr>
            <th>月份</th>
            <th>累積</th>
            <th>獲得</th>
            <th style="width: 200px">放取</th>
            <th>結餘</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>三月</th>
            <th>-</th>
            <th>-</th>
            <th>-</th>
            <th>{{ getHolidaySummaryLastYear() }}</th>
          </tr>
          <tr v-for="item in holidaySummary" v-bind:key="item.date">
            <th>{{ getMonth(item.date) }}</th>
            <td>
              {{ item.al_monthStart }}
            </td>
            <td>
              {{ item.perMonthGain }}
            </td>
            <td>
              {{ item.leaveRecord.total }}
              <span class="mx-1">
                <b-button
                  v-if="item.leaveRecord.total != 0"
                  v-b-toggle
                  :href="'#id' + DateToSerial(item.date)"
                  variant="primary"
                  @click.prevent
                  >詳情</b-button
                >
              </span>
              <div style="width: 200px">
                <b-collapse :id="'id' + DateToSerial(item.date)">
                  <b-card>
                    <div
                      v-for="(leaveItem, key) in item.leaveRecord.details"
                      v-bind:key="key"
                    >
                      {{ formatDate(leaveItem.date) }}{{ leaveItem.slot }}
                    </div>
                  </b-card>
                </b-collapse>
              </div>
            </td>
            <td>
              {{ item.al_monthEnd }}
            </td>
          </tr>
        </tbody>
      </table>
    </b-modal>
    <b-modal
      v-model="modifyLeaveModalShow"
      @ok="modifyLeave()"
      centered
      title="修改假期"
      content-class="shadow"
    >
      <b-col>
        <b-row>
          <b-col cols="3">放假日期：</b-col>
          <b-col>
            <m-date-picker
              style="width: 100%"
              v-model="modify_leave.date"
              :multi="multi"
              :format="formatDate"
            />
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="3">時段：</b-col>
          <b-col
            ><b-form-select
              v-model="modify_leave.slot"
              :options="slotOptions"
            ></b-form-select
          ></b-col>
        </b-row>
        <b-row>
          <b-col cols="3">種類：</b-col>
          <b-col
            ><b-form-select
              v-if="modify_leave.sal == false"
              v-model="modify_leave.type"
              :options="leaveType"
            ></b-form-select>
            <b-form-select v-else v-model="modify_leave.type" :options="salLeaveType">
            </b-form-select>
          </b-col>
        </b-row>
      </b-col>
    </b-modal>
    <b-modal
      v-model="addLeaveModalShow"
      @ok="addLeave()"
      centered
      title="申請假期"
      content-class="shadow"
    >
      <b-col>
        <b-row>
          <b-col cols="3">放假日期：</b-col>
          <b-col>
            <m-date-picker
              style="width: 100%"
              v-model="new_leave.date"
              :multi="multi"
              :format="formatDate"
            />
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="3">時段：</b-col>
          <b-col
            ><b-form-select
              v-model="new_leave.slot"
              :options="slotOptions"
            ></b-form-select
          ></b-col>
        </b-row>
        <b-row>
          <b-col cols="3">種類：</b-col>
          <b-col
            ><b-form-select
              v-if="userProfile.privilege.sal == false"
              v-model="new_leave.type"
              :options="leaveType"
            ></b-form-select>
            <b-form-select v-else v-model="new_leave.type" :options="salLeaveType">
            </b-form-select>
          </b-col>
        </b-row>
        <b-row>附註（如有）：</b-row>
        <b-row>
          <b-form-input
            v-model="new_leave.this_remarks"
            placeholder="請輸入附註內容（如有）"
          ></b-form-input>
        </b-row>
      </b-col>
    </b-modal>
    <b-toast id="modified_leave" title="已修改放假申請" variant="success" solid>
      <b-spinner variant="success" type="grow" small />已修改放假申請！<b-spinner
        variant="success"
        type="grow"
        small
      />
    </b-toast>
    <b-toast id="added_leave" title="已遞交放假申請" variant="success" solid>
      <b-spinner variant="success" type="grow" small />已遞交放假申請！<b-spinner
        variant="success"
        type="grow"
        small
      />
    </b-toast>
    <b-toast id="deleted_leave" title="已取消放假申請" variant="warning" solid>
      <b-spinner variant="warning" type="grow" small />已取消放假申請！<b-spinner
        variant="warning"
        type="grow"
        small
      />
    </b-toast>
    <b-toast id="duplicate_date" title="重覆日期" variant="danger" solid>
      <b-spinner
        variant="danger"
        type="grow"
        small
      />這日期和時段已經申請了假期！<b-spinner variant="danger" type="grow" small />
    </b-toast>
    <b-toast id="empty_date" title="沒有日期" variant="danger" solid>
      <b-spinner variant="danger" type="grow" small />請輸入放假日期！<b-spinner
        variant="danger"
        type="grow"
        small
      />
    </b-toast>
    <b-toast id="empty_slot" title="沒有時段" variant="danger" solid>
      <b-spinner variant="danger" type="grow" small />請輸入放假時段！<b-spinner
        variant="danger"
        type="grow"
        small
      />
    </b-toast>
    <b-toast id="empty_type" title="沒有假期種類" variant="danger" solid>
      <b-spinner variant="danger" type="grow" small />請輸入假期種類！<b-spinner
        variant="danger"
        type="grow"
        small
      />
    </b-toast>
    <b-row>
      <b-col cols="2" class="my-1">
        <b-form-group
          label="狀態："
          label-for="status-filter"
          label-size="sm"
          label-cols-sm="3"
          label-cols-md="3"
          label-cols-lg="3"
          class="mb-0"
        >
          <b-form-select
            v-model="statusFilter"
            id="status-filter"
            :options="statusFilterOptions"
            size="sm"
            label-cols-sm="2"
            label-cols-md="2"
            label-cols-lg="2"
          ></b-form-select>
        </b-form-group>
      </b-col>
      <b-col cols="2" class="my-1">
        <b-form-group
          label="每頁："
          label-for="per-page-select"
          label-size="sm"
          label-cols-sm="3"
          label-cols-md="3"
          label-cols-lg="3"
          class="mb-0"
        >
          <b-form-select
            id="per-page-select"
            v-model="perPage"
            :options="perPageOptions"
            size="sm"
            label-cols-sm="1"
            label-cols-md="1"
            label-cols-lg="1"
          ></b-form-select>
        </b-form-group>
      </b-col>
      <b-col cols="1" class="my-1">
        <b-button
          label-cols-sm="1"
          label-cols-md="1"
          label-cols-lg="1"
          class="mb-0"
          variant="success"
          @click="addLeaveModalShow = !addLeaveModalShow"
          >新申請</b-button
        >
      </b-col>
      <b-col cols="2" sm="2" md="2" class="my-1">
        <b-button class="mx-1" @click="showALSummary()"
          >年假結餘：{{ alRemains }}</b-button
        >
      </b-col>
      <b-col v-if="userProfile.privilege.sal" cols="2" sm="2" md="2" class="my-1">
        <b-button class="mx-1" @click="showSALSummary()"
          >特別年假：{{ salRemains }}</b-button
        >
      </b-col>
      <b-col cols="3" sm="3" md="3" class="my-1 col-auto ml-auto">
        <b-pagination
          v-model="currentPage"
          :total-rows="totalRows"
          :per-page="perPage"
          align="fill"
          size="sm"
          class="my-0"
        ></b-pagination>
      </b-col>
    </b-row>
    <b-table
      striped
      responsive
      hover
      :items="bTable"
      :fields="bField"
      :current-page="currentPage"
      :per-page="perPage"
      :filter="statusFilter"
      ref="table"
      primary-key="docid"
    >
      <template v-slot:table-colgroup>
        <col style="width: 8%; min-width: 50px" />
        <col style="width: 10%; min-width: 60px" />
        <col style="width: 6%; min-width: 40px" />
        <col style="width: 6%; min-width: 40px" />
        <col style="width: 6%; min-width: 40px" />
        <col style="width: 58%; min-width: 300px" />
        <col style="width: 6%; min-width: 40px" />
      </template>
      <template #cell(date)="data">
        {{ data.value ? formatDate(data.value) : "" }}
      </template>
      <template #cell(slot)="data">
        {{ formatSlot(data.value) }}
      </template>
      <template #cell(type)="data">
        {{ formatType(data.value) }}
      </template>
      <template #cell(remarks)="data">
        {{ data.value.join(" | ") }}
        <div v-if="userProfile.privilege.leaveApprove && data.item.status == '未批'">
          <b-form-input
            v-model="data.item.this_remarks"
            placeholder="請輸入附註內容（如有）"
          ></b-form-input>
        </div>
      </template>
      <template #cell(action)="data">
        <span v-if="userProfile.privilege.leaveApprove && data.item.status == '未批'">
          <b-icon-check-square
            class="h3"
            variant="success"
            @click="confirmApproveModal(data.item.docid, data.item.this_remarks)"
          />
          <b-icon-x-square
            class="h3"
            variant="danger"
            @click="confirmRejectModal(data.item.docid, data.item.this_remarks)"
          />
        </span>
        <span v-if="userProfile.privilege.leaveApprove && data.item.status != '未批'">
          <b-icon-pencil-square
            @click="confirmChangeModal(data.item.docid)"
            class="h3"
            variant="success"
          />
        </span>
        <span v-if="!userProfile.privilege.leaveApprove && data.item.status == '未批'">
          <b-icon-dash-square
            class="h3"
            variant="danger"
            @click="confirmDeleteModal(data.item.docid)"
          />
        </span>
      </template>
    </b-table>
  </q-page>
</template>

<script>
import { mapState } from "vuex";
// import moment from "moment";
import {
  FirebaseFunctions,
  leaveCollection,
  leaveConfig,
  scheduleCollection,
} from "boot/firebase";

export default {
  name: "ApplyAL",
  created() {},
  data() {
    return {
      renderYearOffset: 0,
      addLeaveModalShow: false,
      modifyLeaveModalShow: false,
      alSummaryModalShow: false,
      salSummaryModalShow: false,
      modifyDocid: "",
      SALHolidaySummary: [],
      SALHolidaySummaryField: [
        {
          key: "status",
          label: "狀態",
        },
        {
          key: "date",
          label: "日期",
        },
        {
          key: "result",
          label: "結餘",
        },
      ],
      holidaySummary: [],
      holidaySummaryLastYear: [],
      holidayRemainsField: [
        {
          key: "date",
          label: "月份",
        },
        {
          key: "perMonthGain",
          label: "獲得",
        },
        {
          key: "result",
          label: "結餘",
        },
      ],
      currentPage: 1,
      perPage: 3,
      perPageOptions: [3, 6, 10, { value: 100, text: "全部" }],
      totalRows: 0,
      alRemains: 0,
      salRemains: 0,
      bTable: [],
      bField: [
        {
          key: "name",
          label: "員工",
          sortable: true,
          thClass: "name",
        },
        {
          key: "date",
          label: "日期",
          sortable: true,
          thClass: "date",
        },
        {
          key: "slot",
          label: "時段",
          thClass: "slot",
        },
        {
          key: "type",
          label: "種類",
          thClass: "type",
        },
        {
          key: "status",
          label: "狀態",
          thClass: "status",
        },
        {
          key: "remarks",
          label: "附註",
          thClass: "remarks",
        },
        {
          key: "action",
          label: "動作",
          thClass: "action",
        },
      ],
      multi: false,
      table: [],
      statusFilter: "未批",
      // struct { docid, application_id, validity, uid, name, date, slot, type, status, this_remarks, remarks[]}
      new_leave: {
        validity: true,
        uid: "",
        name: "",
        date: "",
        slot: "",
        type: "",
        status: "",
        this_remarks: "",
        remarks: [],
      },
      modify_leave: {
        docid: "",
        id: 1,
        validity: true,
        uid: "",
        name: "",
        date: "",
        slot: "",
        type: "",
        status: "",
        this_remarks: "",
        remarks: [],
      },
      slotOptions: [
        { value: "", text: "選擇時段" },
        { value: "slot_a", text: "早" },
        { value: "slot_b", text: "午" },
        { value: "slot_c", text: "晚" },
      ],
      leaveType: [
        { value: "", text: "假期種類" },
        { value: "AL", text: "年假" },
        { value: "SL", text: "病假" },
        { value: "SSL", text: "特別病假" },
      ],
      salLeaveType: [
        { value: "", text: "假期種類" },
        { value: "AL", text: "年假" },
        { value: "SL", text: "病假" },
        { value: "SAL", text: "特別年假" },
        { value: "SSL", text: "特別病假" },
      ],
      statusFilterOptions: [
        { value: "未批", text: "未批" },
        { value: "批准", text: "批准" },
        { value: "拒絕", text: "拒絕" },
        { value: "", text: "全部" },
      ],
    };
  },
  methods: {
    SALRemains(name) {
      if (name == "status") return "總結餘";
      if (name == "date") return "";
      if (this.SALHolidaySummary.length == 0) return "";
      let sum = this.SALHolidaySummary.reduce((a, b) => ({
        result: a.result + b.result,
      }));
      return sum.result;
    },
    checkDuplicate(data) {
      const leaveDate = new Date(data.date);
      const leaveDateString = leaveDate.toISOString();
      let duplicate = false;
      this.bTable.forEach((row) => {
        /*
        console.log("rowDate: " + row.date);
        console.log("leaveDateString: " + leaveDateString);
        console.log("rowSlot: " + row.slot);
        console.log("data.slot: " + data.slot);
        */
        if (row.date == leaveDateString && row.slot == data.slot && row.uid == data.uid) {
          duplicate = true;
        }
      });
      return duplicate;
    },
    confirmChangeModal(docid) {
      let i = this.bTable.findIndex((element) => element.docid == docid);
      if (i == -1) return;
      this.modify_leave = { ...this.bTable[i] };
      this.modifyLeaveModalShow = !this.modifyLeaveModalShow;
    },
    confirmAddModal() {
      this.$bvModal
        .msgBoxConfirm("確認申請假期？", {
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
          if (value) {
            this.addLeave();
          }
        })
        .catch((err) => {
          console.log(err);
          // An error occurred
        });
    },
    confirmApproveModal(docid, this_remarks) {
      this.$bvModal
        .msgBoxConfirm("確認批准假期？", {
          title: "請確認",
          size: "sm",
          buttonSize: "sm",
          okVariant: "success",
          okTitle: "確認",
          cancelTitle: "取消",
          footerClass: "p-2",
          hideHeaderClose: false,
          centered: true,
        })
        .then((value) => {
          if (value) {
            this.approveLeave(docid, this_remarks);
          }
        })
        .catch((err) => {
          console.log(err);
          // An error occurred
        });
    },
    confirmRejectModal(docid, this_remarks) {
      this.$bvModal
        .msgBoxConfirm("確認拒絕假期？", {
          title: "請確認",
          size: "sm",
          buttonSize: "sm",
          okVariant: "warning",
          okTitle: "確認",
          cancelTitle: "取消",
          footerClass: "p-2",
          hideHeaderClose: false,
          centered: true,
        })
        .then((value) => {
          if (value) {
            this.rejectLeave(docid, this_remarks);
          }
        })
        .catch((err) => {
          console.log(err);
          // An error occurred
        });
    },
    confirmDeleteModal(docid) {
      this.$bvModal
        .msgBoxConfirm("確認刪除假期申請？", {
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
          if (value) this.delLeave(docid);
        })
        .catch((err) => {
          console.log(err);
          // An error occurred
        });
    },
    formatSlot(slot) {
      const slotMap = {
        slot_a: "早",
        slot_b: "午",
        slot_c: "晚",
      };
      return slotMap[slot];
    },
    formatType(type) {
      const leaveMap = {
        AL: "年假",
        SL: "病假",
        SAL: "特別年假",
        SSL: "特別病假",
      };
      return leaveMap[type];
    },
    DateToSerial(date) {
      const d = new Date(date);
      return d.getTime();
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
    getMonth(date) {
      if (typeof date === "function") return;
      moment.locale("zh-HK");
      const data = moment.utc(new Date(date));
      return data.format("MMMM");
    },
    addLeave() {
      // default values
      if (this.new_leave.date.length == 0) {
        this.$bvToast.show("empty_date");
        return;
      }

      if (this.new_leave.slot.length == 0) {
        this.$bvToast.show("empty_slot");
        return;
      }

      if (this.new_leave.type.length == 0) {
        this.$bvToast.show("empty_type");
        return;
      }

      if (this.checkDuplicate(this.new_leave)) {
        this.$bvToast.show("duplicate_date");
        return;
      }

      const leaveDate = new Date(this.new_leave.date);
      this.new_leave.date = leaveDate.toISOString();
      this.new_leave.uid = this.userProfile.uid;
      this.new_leave.name = this.userProfile.name;
      this.new_leave.validity = true;
      this.new_leave.status = "未批";

      // load up remarks
      const currentDate = new Date();
      if (this.new_leave.this_remarks.length > 0) {
        this.new_leave.remarks.push(this.new_leave.this_remarks);
      }
      delete this.new_leave.this_remarks;
      const options = { year: "numeric", month: "numeric", day: "numeric" };
      this.new_leave.remarks.push(
        "申請：" + currentDate.toLocaleDateString(undefined, options)
      );

      // call https functions to write data
      const addLeave = FirebaseFunctions.httpsCallable("holiday-addLeave");
      addLeave(this.new_leave)
        .then(() => {
          this.new_leave = {
            validity: true,
            uid: "",
            name: "",
            date: "",
            slot: "",
            type: "",
            status: "新申請",
            remarks: [],
            this_remarks: "",
          };
          this.$bvToast.show("added_leave");
          this.$refs.table.refresh();
          this.getHolidayReport();
          this.getSALHolidayReport();
        })
        .catch((error) => {
          //showNotification(error.message);
          console.log(error.message);
        });
    },
    modifyLeave() {
      // default values
      if (this.modify_leave.date.length == 0) {
        this.$bvToast.show("empty_date");
        return;
      }

      if (this.modify_leave.slot.length == 0) {
        this.$bvToast.show("empty_slot");
        return;
      }

      if (this.modify_leave.type.length == 0) {
        this.$bvToast.show("empty_type");
        return;
      }

      if (this.checkDuplicate(this.modify_leave)) {
        this.$bvToast.show("duplicate_date");
        return;
      }

      const leaveDate = new Date(this.modify_leave.date);
      this.modify_leave.date = leaveDate.toISOString();

      // load up remarks
      const currentDate = new Date();
      this.modify_leave.remarks.push("修改：" + currentDate.toLocaleDateString("HK"));

      if (this.modify_leave.status == "拒絕") {
        this.modify_leave.status = "未批";
      }

      // call https functions to write data
      const modifyLeave = FirebaseFunctions.httpsCallable("holiday-modifyLeave");
      modifyLeave(this.modify_leave)
        .then(() => {
          this.modify_leave = {
            docid: "",
            id: 1,
            validity: true,
            uid: "",
            name: "",
            date: "",
            slot: "",
            type: "",
            status: "新申請",
            remarks: [],
            this_remarks: "",
          };
          this.$bvToast.show("modified_leave");
          this.$refs.table.refresh();
          this.getHolidayReport();
          this.getSALHolidayReport();
        })
        .catch((error) => {
          //showNotification(error.message);
          console.log(error.message);
        });
    },
    delLeave(docid) {
      const delLeave = FirebaseFunctions.httpsCallable("holiday-delLeave");
      delLeave(docid).then(() => {
        this.$bvToast.show("deleted_leave");
        this.$refs.table.refresh();
        this.getHolidayReport();
        this.getSALHolidayReport();
      });
    },
    approveLeave(docid, remarks) {
      const approveLeave = FirebaseFunctions.httpsCallable("holiday-approveLeave");
      approveLeave({
        docid: docid,
        remarks: remarks,
      }).then(() => {
        this.$refs.table.refresh();
        this.getHolidayReport();
        this.getSALHolidayReport();
      });
    },
    rejectLeave(docid, remarks) {
      const rejectLeave = FirebaseFunctions.httpsCallable("holiday-rejectLeave");
      rejectLeave({
        docid: docid,
        remarks: remarks,
      }).then(() => {
        this.$refs.table.refresh();
        this.getHolidayReport();
        this.getSALHolidayReport();
      });
    },
    showALSummary() {
      this.getHolidayReport();
      this.alSummaryModalShow = !this.alSummaryModalShow;
    },
    showSALSummary() {
      this.getSALHolidayReport();
      this.salSummaryModalShow = !this.salSummaryModalShow;
    },
    async getSALHolidayReport() {
      this.SALHolidaySummary = [];
      const leaveConfigDoc = await leaveConfig.get();
      const leaveConfigData = leaveConfigDoc.data();

      const thisYearStart = moment([2021, 2, 31]).endOf("month");

      const sal_monthEnd = leaveConfigData[this.userProfile.uid][0].sal; // carry over from Mar 2021

      // pushing last year carry over
      this.SALHolidaySummary.push({
        docid: 0,
        status: "結餘",
        date: thisYearStart.toString(),
        result: sal_monthEnd, // year carry over, for example 28
      });

      // get all AL record of this user
      const salScheduleDoc = await scheduleCollection
        .where("uid", "==", this.userProfile.uid)
        .where("type", "==", "SAL")
        .get();
      let salSchedule = [];
      salScheduleDoc.forEach((doc) => {
        let d = doc.data();
        d.date = moment.utc(d.date.toMillis());
        salSchedule.push(d);
        let i = this.SALHolidaySummary.findIndex(
          (element) => element.date.toString() == d.date.toString()
        );

        if (i == -1) {
          this.SALHolidaySummary.push({
            docid: d.leaveDocid,
            status: "放取",
            date: d.date,
            result: -0.5,
          });
        } else this.SALHolidaySummary[i].result = this.SALHolidaySummary[i].result - 0.5;
      });
      /*
      // loop for this year and add holiday to holidayRemains
      for (let i = 0; i < 12; i++) {
        // console.log("looping i: " + i);
        // console.log("monthLoop: " + monthLoop.toString());
        // console.log("alSchedule:" + JSON.stringify(alSchedule));
        // temporary date sturcture to store leave of current looping month
        let monthlyLeaveData = {
          monthlyTotal: 0,
          monthlyRecord: [],
        };
        for (const leave of alSchedule) {
          // loop all al schedules, find those within this month and update this month record
          if (leave.date.year() == monthLoop.year() && leave.date.month() == monthLoop.month()) {
            monthlyLeaveData.monthlyTotal += 0.5;
            let slot;
            switch (leave.slot) {
              case "slot_a":
                slot = "（早）";
                break;
              case "slot_b":
                slot = "（午）";
                break;
              case "slot_c":
                slot = "（晚）";
                break;
            }
            monthlyLeaveData.monthlyRecord.push({
              date: leave.date,
              slot: slot,
            });
          }
        }

      */

      this.salRemains = this.SALHolidaySummary[0].result;
      for (let j = 1; j < this.SALHolidaySummary.length; j++) {
        this.salRemains += this.SALHolidaySummary[j].result;
      }
    },
    async getHolidayReport() {
      this.holidaySummary = [];
      const leaveConfigDoc = await leaveConfig.get();
      const leaveConfigData = leaveConfigDoc.data();
      const tiers = leaveConfigData[this.userProfile.rank];
      const now = moment();

      // determine yearly start (31/3 of every year)
      let thisYearStart;
      //if (now.month() >= 3) {
      // thisYearStart = moment([now.year() + this.renderYearOffset, 2, 31]).endOf("month");
      thisYearStart = moment([2021 + this.renderYearOffset, 2, 31]).endOf("month");
      //} else {
      // thisYearStart = moment([now.year()-1 + this.renderYearOffset, 2, 31]).endOf("month");
      //thisYearStart = moment([2021-1 + this.renderYearOffset, 2, 31]).endOf("month");
      //}
      const thisYearEnd = moment([thisYearStart.year() + 1, 2, 31]).endOf("month");
      const dateOfEntry = moment(this.userProfile.dateOfEntry.toDate());

      const tiersConfig = [0, 5, 8, 10, 12];

      let al_monthEnd;
      if (this.renderYearOffset == 0) {
        al_monthEnd = leaveConfigData[this.userProfile.uid][0].al; // carry over from last year
      } else {
        al_monthEnd = this.holidaySummaryLastYear[this.renderYearOffset].al_monthEnd;
      }
      // this.holidayRemains = [];
      let monthLoop = thisYearStart;

      // pushing last year carry over
      //this.holidayRemains.push({
      if (this.renderYearOffset == 0) {
        this.holidaySummaryLastYear[this.renderYearOffset] = {
          date: monthLoop.toString(),
          al_monthEnd: al_monthEnd, // year carry over, for example 28
        };
      }
      monthLoop.add(1, "M");
      // get all AL record of this user
      const alScheduleDoc = await scheduleCollection
        .where("uid", "==", this.userProfile.uid)
        .where("type", "==", "AL")
        // .where("date", ">", thisYearStart.utc().toDate())
        // .where("date", "<=", thisYearEnd.utc().toDate())
        .get();
      let alSchedule = [];
      alScheduleDoc.forEach((doc) => {
        let d = doc.data();
        d.date = moment.utc(doc.data().date.toMillis());
        alSchedule.push(d);
      });

      //console.log("start monthLoop 1:" + monthLoop.toString());
      // console.log("start monthLoop 2:" + monthLoop.toString());

      // loop for this year and add holiday to holidayRemains
      for (let i = 0; i < 12; i++) {
        // console.log("looping i: " + i);
        // console.log("monthLoop: " + monthLoop.toString());
        // console.log("alSchedule:" + JSON.stringify(alSchedule));
        // temporary date sturcture to store leave of current looping month
        let monthlyLeaveData = {
          monthlyTotal: 0,
          monthlyRecord: [],
        };
        for (const leave of alSchedule) {
          // loop all al schedules, find those within this month and update this month record
          if (
            leave.date.year() == monthLoop.year() &&
            leave.date.month() == monthLoop.month()
          ) {
            monthlyLeaveData.monthlyTotal += 0.5;
            let slot;
            switch (leave.slot) {
              case "slot_a":
                slot = "（早）";
                break;
              case "slot_b":
                slot = "（午）";
                break;
              case "slot_c":
                slot = "（晚）";
                break;
            }
            monthlyLeaveData.monthlyRecord.push({
              date: leave.date,
              slot: slot,
            });
          }
        }

        // update yearServed based on current month and get al entitied
        const yearServed = monthLoop.endOf("month").diff(dateOfEntry, "years");
        let tier = 0;
        for (let j = tiersConfig.length; j > 0; j--) {
          if (yearServed >= tiersConfig[j - 1]) {
            tier = tiers["t" + j];
            break;
          }
        }
        const perMonthGain = tier / 12;

        // set up month start and month end data
        const al_monthStart = al_monthEnd;
        al_monthEnd = al_monthStart - monthlyLeaveData.monthlyTotal + perMonthGain;

        this.holidaySummary.push({
          date: monthLoop.endOf("month").toString(),
          al_monthStart: al_monthStart,
          perMonthGain: perMonthGain,
          leaveRecord: {
            total: monthlyLeaveData.monthlyTotal,
            details: monthlyLeaveData.monthlyRecord,
          },
          al_monthEnd: al_monthEnd,
        });
        // skip anything in future
        // console.log("monthLoop: " + monthLoop.toString());
        // console.log("thisYearEnd: " + thisYearEnd.toString());
        if (monthLoop.isAfter(thisYearEnd)) break;
        monthLoop.add(1, "M");
      }
      this.holidaySummaryLastYear[this.renderYearOffset + 1] = {
        date: this.holidaySummary[11].date,
        al_monthEnd: this.holidaySummary[11].al_monthEnd,
      };
      const alCutOffDate = now.subtract(1, "months").endOf("month").toString();

      let i = this.holidaySummary.findIndex((element) => element.date == alCutOffDate);
      if (i == -1) return;
      else {
        this.alRemains = this.holidaySummary[i].al_monthEnd;
        for (let j = i + 1; j < 12; j++) {
          this.alRemains -= this.holidaySummary[j].leaveRecord.total;
        }
      }
    },
    async changeRenderYear(year) {
      this.renderYearOffset += year;
      if (this.renderYearOffset < 0) {
        this.renderYearOffset = 0;
      } else {
        await this.getHolidayReport();
      }
    },
    getHolidaySummaryLastYear() {
      // console.log("this.holidaySummaryLastYear.length:" + this.holidaySummaryLastYear.length);
      if (this.holidaySummaryLastYear.length > 0) {
        return this.holidaySummaryLastYear[this.renderYearOffset].al_monthEnd;
      } else return 0;
    },
  },
  async mounted() {
    // prepare holiday application list
    const uid = this.userProfile.uid;
    // if (!uid) return;
    let leaveDocString;
    if (this.userProfile.privilege.leaveApprove) leaveDocString = leaveCollection;
    else leaveDocString = leaveCollection.where("uid", "==", uid);

    // listen to data change and update holiday application table
    leaveDocString.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type == "added") {
          let d = change.doc.data();
          d.docid = change.doc.id;
          if (change.doc.id != "config") {
            this.bTable.push(d);
            this.totalRows++;
          }
        }
        if (change.type === "modified") {
          let d = change.doc.data();
          d.docid = change.doc.id;
          if (change.doc.id != "config") {
            let i = this.bTable.findIndex((element) => element.docid == d.docid);
            this.bTable.splice(i, 1, d);
          }
        }
        if (change.type === "removed") {
          let d = change.doc.data();
          d.docid = change.doc.id;
          if (change.doc.id != "config") {
            let i = this.bTable.findIndex((element) => element.docid == d.docid);
            this.bTable.splice(i, 1);
          }
        }
      });
    });
    await this.getHolidayReport();
    await this.getSALHolidayReport();

    // shift to current year
    let now = moment();
    let thisYear;
    if (now.month() >= 3) {
      thisYear = now.year();
    } else {
      thisYear = now.year() - 1;
    }
    for (let i = 0; i < thisYear - 2021; i++) {
      await this.changeRenderYear(1);
    }
    /*
    // prepare holiday summary table
    // grab holiday config
    const leaveConfigDoc = await leaveConfig.get();
    const leaveConfigData = leaveConfigDoc.data();
    const tiers = leaveConfigData.[this.userProfile.rank];
    const now = moment();

    // determine yearly start (31/3 of every year)
    let thisYearStart;
    if (now.month() >= 3) {
      thisYearStart = moment([now.year(), 2, 31]).endOf("month");
    } else {
      thisYearStart = moment([now.year()-1, 2, 31]).endOf("month");
    }
    const dateOfEntry =  moment(this.userProfile.dateOfEntry.toDate());

    // fixed tier requirement for all staff
    const tiersConfig = [0,5,8,10,12];

    let al_monthEnd = leaveConfigData.[this.userProfile.uid].[0].al; // carry over from last year
    this.holidaySummary = [];
    let monthLoop = thisYearStart;

    // pushing last year carry over
    this.holidaySummaryLastYear.push({
      date: monthLoop.toString(),
      al_monthEnd: al_monthEnd,  // year carry over, for example 28
    });

    // loop for this year build table structure
    for (let i = 0; i < 12; i++) {
      monthLoop.add(1, "months");
      // update yearServed based on current month and get al entitied
      const yearServed = monthLoop.endOf("month").diff(dateOfEntry, "years");
      let tier = 0;
      for (let i = tiersConfig.length; i > 0; i--) {
        if (yearServed >= tiersConfig[i-1]) {
          tier = tiers.['t'+i];
          break;
        }
      }
      const perMonthGain = tier / 12;

      // set up month start and month end data
      const al_monthStart = al_monthEnd;

      this.holidaySummary.push({
        date: monthLoop.endOf("month").toString(),
        al_monthStart: al_monthStart,
        al_monthEnd: 0,
        yearServed: yearServed,
        perMonthGain: perMonthGain,
        leaveRecord: {
          total: 0,
          details: [],
        },
      })
    }

    for (let i = 0; i < 12; i++) {
      if (i > 0) {
        this.holidaySummary[i].al_monthStart = this.holidaySummary[i-1].al_monthEnd;
      }
      this.holidaySummary[i].al_monthEnd = this.holidaySummary[i].al_monthStart - this.holidaySummary[i].leaveRecord.total + this.holidaySummary[i].perMonthGain;

    }

    // build up this year table frame first
    // get all AL record of this user
    scheduleCollection
            .where("uid", "==", this.userProfile.uid)
            .where("type", "==", "AL")
            .onSnapshot((snapshot) => {
              snapshot.docChanges().forEach((change) => {
                if (change.type == "added") {
                  let d = change.doc.data();
                  console.log("d.date: " + d.date);
                  d.docid = change.doc.id;
                  d.date = moment.utc(change.doc.data().date.toMillis());
                  let i = this.holidaySummary.findIndex((element) => element.date == d.date.endOf("month").toString());
                  this.holidaySummary[i].leaveRecord.total += 0.5;
                  let slot;
                  switch (d.slot) {
                    case "slot_a":
                      slot = "（早）";
                      break;
                    case "slot_b":
                      slot = "（午）";
                      break;
                    case "slot_c":
                      slot = "（晚）";
                      break;
                  }
                  this.holidaySummary[i].leaveRecord.details.push({
                    date: d.date,
                    slot: slot,
                  });

                  for (let j = 0; j < (12-i); j++) {
                    this.holidaySummary[i+j].al_monthEnd = this.holidaySummary[i+j].al_monthStart - this.holidaySummary[i+j].monthlyLeaveData.monthlyTotal + this.holidaySummary[i+j].perMonthGain;
                    if ((i+j) < 11) {
                      this.holidaySummary[i+j+1].al_monthStart = this.holidaySummary[i+j].al_monthEnd;
                    }
                  }
                } else {
                  console.log("change is not add");
                }
              });
            })

      const alCutOffDate = now.subtract(1, "months").endOf("month").toString();
      let i = this.holidaySummary.findIndex((element) => element.date == alCutOffDate);
      console.log(i);
      if (i == -1) this.alRemains = al_monthEnd;
      else this.alRemains = this.holidaySummary[i].al_monthEnd;
      */
  },
  computed: {
    ...mapState(["userProfile"]),
    filteredTable() {
      // console.log(this.statusFilter);
      return this.bTable.filter((row) => {
        return row.status.includes(this.statusFilter);
      });
    },
    getReportYear() {
      return 2021 + this.renderYearOffset;
    },
  },
};
</script>
<style scoped>
caption {
  caption-side: top;
  font-size: 1.2em;
}
</style>
