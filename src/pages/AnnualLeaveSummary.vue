<template>
  <q-dialog v-model="alSummaryModalShow" full-height full-width title="職員放取年假紀錄">
    <q-card class="q-pa-md">
      <div class="row">
        <div class="col">
          <q-btn
            class="q-mx-md"
            size="lg"
            outline
            color="primary"
            v-on:click="changeRenderYear(-1)"
          >
            上年
          </q-btn>
          <q-btn
            class="q-mx-md"
            size="lg"
            outline
            color="primary"
            v-on:click="changeRenderYear(1)"
          >
            下年
          </q-btn>
          <q-btn
            class="q-mx-md"
            size="lg"
            outline
            color="primary"
            icon="print"
            v-print="printObj"
          />
        </div>
        <div class="col-3">
          <q-select
            v-model="ALReportParameters.reportUser"
            :options="userList"
            id="userList"
            label="員工"
            filled
            @update:model-value="(val) => setUsername(val)"
          ></q-select>
        </div>
      </div>
      <div id="printMe" style="margin-top: 20px">
        <ALReport :key="ALReportKey" v-bind="ALReportParameters" />
      </div>
    </q-card>
  </q-dialog>

  <q-page>
    <div class="row q-my-sm">
      <q-btn
        size="lg"
        outline
        color="primary"
        class="q-mx-md"
        v-on:click="changeRenderMonth(-1)"
      >
        上月
      </q-btn>
      <q-btn
        size="lg"
        outline
        color="primary"
        class="q-mx-md"
        v-on:click="changeRenderMonth(1)"
      >
        下月
      </q-btn>
      <q-btn
        v-if="isLeaveManage"
        size="lg"
        outline
        color="primary"
        class="q-mx-md"
        v-on:click="alSummaryModalShow = !alSummaryModalShow"
      >
        列印
      </q-btn>
    </div>
    <AnnualLeave v-bind:renderDate="renderDate" :key="renderDate.toDateString()" />
  </q-page>
</template>

<script>
import AnnualLeave from "components/AnnualLeaveSummary";
import ALReport from "components/AnnualLeaveReport";
import print from "vue3-print-nb";
import { useStore } from "vuex";
import { computed } from "vue";
import { usersCollection } from "boot/firebase";

export default {
  name: "AnnualLeaveView",
  components: {
    AnnualLeave,
    ALReport,
  },
  directives: {
    print,
  },
  data() {
    return {
      ALReportParameters: {
        reportUser: "",
        renderYearOffset: 0,
        renderYear: 0,
      },
      printObj: {
        id: "printMe",
        preview: true,
        previewTitle: "列印預覽",
        popTitle: "CCIYC 年假結餘總表",
        extraCss:
          "https://cdn.bootcdn.net/ajax/libs/animate.css/4.1.1/animate.compat.css, https://cdn.bootcdn.net/ajax/libs/hover.css/2.3.1/css/hover-min.css,",
        extraHead: '<meta http-equiv="Content-Language" content="en"/>',
      },
      userList: [{ value: "", label: "" }],
      renderDate: new Date(Number(Date.now())),
      alSummaryModalShow: false,
    };
  },
  methods: {
    changeRenderYear(year) {
      this.ALReportParameters.renderYearOffset += year;
      if (this.ALReportParameters.renderYearOffset < 0) {
        this.ALReportParameters.renderYearOffset = 0;
      }
      // await this.renderALTable();
    },
    setUsername(arg) {
      this.ALReportParameters.reportUser = arg.value;
      this.ALReportParameters.renderYearOffset = 0;
    },
    changeRenderMonth(month) {
      this.renderDate = new Date(
        this.renderDate.getFullYear(),
        this.renderDate.getMonth() + month,
        1
      );
    },
  },
  computed: {
    ALReportKey() {
      return JSON.stringify(this.ALReportParameters);
    },
    getCalendarYear: function () {
      let date = new Date();
      return date.getMonth() > 2 ? date.getFullYear() : date.getFullYear() - 1;
    },
  },
  async mounted() {
    this.ALReportParameters.renderYear = this.getCalendarYear;

    const userDoc = await usersCollection.get();
    userDoc.forEach((user) => {
      if (!user.data().privilege.systemAdmin) {
        this.userList.push({
          value: user.data().uid,
          label: user.data().name,
        });
      }
    });
  },
  setup() {
    const $store = useStore();

    return {
      isLeaveManage: computed(() => $store.getters["userModule/getLeaveManage"]),
    };
  },
};
</script>

<style scoped>
.home {
  margin-top: 30px;
}
</style>
