<template>
  <q-dialog v-model="alSummaryModalShow" title="職員放取年假紀錄">
    <div class="row">
      <div class="col">
        <q-btn
          size="lg"
          variant="outline-primary"
          class="light mx-2"
          v-on:click="changeRenderYear(-1)"
        >
          上年
        </q-btn>
        <q-btn
          size="lg"
          variant="outline-primary"
          class="light mx-2"
          v-on:click="changeRenderYear(1)"
        >
          下年
        </q-btn>
      </div>
      <div class="col">
        <q-btn class="q-mx-md" outline color="primary" icon="print" v-print="printObj" />
      </div>
      <div class="col-3">
        員工：<q-select
          v-model="ALReportParameters.reportUserID"
          :options="userList"
          id="userList"
          @change="setUsername"
        ></q-select>
      </div>
    </div>
    <div id="printMe" style="margin-top: 20px">
      <!-- <ALReport :key="ALReportKey" v-bind="ALReportParameters"/> -->
    </div>
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
import date from "src/lib/date.js";
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
        reportUserID: "",
        reportUsername: "",
        renderYearOffset: 0,
        renderYear: 0,
      },
      printObj: {
        id: "printMe",
        preview: true,
        previewTitle: "列印預覽", // The title of the preview window. The default is 打印预览
        popTitle: "CCIYC 年假結餘總表",
        extraCss:
          "https://cdn.bootcdn.net/ajax/libs/animate.css/4.1.1/animate.compat.css, https://cdn.bootcdn.net/ajax/libs/hover.css/2.3.1/css/hover-min.css,",
        extraHead: '<meta http-equiv="Content-Language" content="en"/>',
        /*        previewBeforeOpenCallback() {console.log("preview before open")},
        previewOpenCallback() {console.log("preview open")},
        beforeOpenCallback() {console.log("before open")},
        openCallback() {console.log("open")},
        closeCallback() {console.log("close"); this.$forceUpdate()}, */
      },
      userList: [{ value: "", text: "" }],
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
      if (arg != "") {
        this.ALReportParameters.reportUsername = this.userList[
          this.userList.findIndex((element) => element.value == arg)
        ].text;
        this.ALReportParameters.renderYearOffset = 0;
      } else {
        this.ALReportParameters.reportUsername = "";
        this.ALReportParameters.renderYearOffset = 0;
      }
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
  },
  async mounted() {
    this.ALReportParameters.renderYear = 2021;

    const userDoc = await usersCollection.get();
    userDoc.forEach((user) => {
      if (!user.data().privilege.systemAdmin) {
        this.userList.push({
          value: user.data().uid,
          text: user.data().name,
        });
      }
    });
  },
  setup() {
    const $store = useStore();

    return {
      uid: computed(() => $store.getters["userModule/getUID"]),
      isLeaveManage: computed(() => $store.getters["userModule/getLeaveManage"]),
    };
  },
  created() {
    this.daysOfWeek = date.daysOfWeek.bind(this);
    this.formatDate = date.formatDate.bind(this);
  },
};
</script>

<style scoped>
.home {
  margin-top: 30px;
}
</style>
