<template>
  <q-page>
    <q-dialog v-model="alSummaryModalShow" full-height full-width>
      <q-card class="q-pa-md">
        <q-card-section class="text-h4 bg-primary text-white q-px-md row">
          <div class="col-shrink">職員放取年假紀錄</div>
          <q-space />
          <div class="col-shrink">
            <q-btn
              icon="cancel"
              flat
              text-color="white"
              @click="alSummaryModalShow = !alSummaryModalShow"
            />
          </div>
        </q-card-section>

        <div class="row q-my-sm q-pa-md">
          <div class="col-3 col-xs-6 col-sm-6 col-md-4">
            <q-btn
              class="q-mr-md q-pa-sm"
              size="1.4vw"
              outline
              color="primary"
              v-on:click="changeRenderYear(-1)"
            >
              上年
            </q-btn>
            <q-btn
              class="q-mr-md q-pa-sm"
              size="1.4vw"
              outline
              color="primary"
              v-on:click="changeRenderYear(1)"
            >
              下年
            </q-btn>
            <q-btn
              class="q-mr-md q-pa-sm"
              size="1.4vw"
              outline
              color="primary"
              icon="print"
              v-print="printObj"
              >列印
            </q-btn>
          </div>
          <q-space />
          <div class="col-2 col-md-2 col-sm-3 col-xs-4">
            <q-select
              v-model="staffOption"
              hide-bottom-space
              :options="userList"
              label="員工"
              filled
              v-if="isLeaveManage"
              @update:model-value="
                (value) => (this.ALReportParameters.reportUser = value)
              "
            ></q-select>
          </div>
        </div>

        <div id="printMe" class="q-mt-md row q-pa-md">
          <ALReport
            :key="ALReportKey"
            v-bind="ALReportParameters"
            class="col-grow justify-center"
          />
        </div>
      </q-card>
    </q-dialog>

    <div class="row fit q-my-sm">
      <q-btn
        size="lg"
        outline
        color="primary"
        icon="keyboard_arrow_left"
        :class="[$q.screen.lt.sm ? 'q-mx-xs q-pa-xs' : 'q-mx-md q-pa-md']"
        v-on:click="changeRenderMonth(-12)"
        label="上年"
      >
      </q-btn>
      <q-btn
        size="lg"
        outline
        color="primary"
        :class="[$q.screen.lt.sm ? 'q-mx-xs q-pa-xs' : 'q-mx-md q-pa-md']"
        v-on:click="changeRenderMonth(-1)"
        label="上月"
      >
      </q-btn>
      <q-btn
        size="lg"
        outline
        color="primary"
        :class="[$q.screen.lt.sm ? 'q-mx-xs q-pa-xs' : 'q-mx-md q-pa-md']"
        v-on:click="changeRenderMonth(1)"
        label="下月"
      >
      </q-btn>
      <q-btn
        size="lg"
        outline
        color="primary"
        icon="keyboard_arrow_right"
        :class="[$q.screen.lt.sm ? 'q-mx-xs q-pa-xs' : 'q-mx-md q-pa-md']"
        v-on:click="changeRenderMonth(12)"
        label="下年"
      >
      </q-btn>

      <q-btn
        size="lg"
        outline
        color="primary"
        :class="[$q.screen.lt.sm ? 'q-mx-xs q-pa-xs' : 'q-mx-md q-pa-md']"
        icon="print"
        v-on:click="alSummaryModalShow = !alSummaryModalShow"
      >
      </q-btn>
    </div>
    <AnnualLeave v-bind:renderDate="renderDate" :key="renderDate.toDateString()" />
  </q-page>
</template>

<script>
import AnnualLeave from "components/Holiday/AL";
import ALReport from "components/Holiday/ALReport";
import print from "vue3-print-nb";
import { useStore } from "vuex";
import { computed, ref } from "vue";
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
      staffOption: {
        value: "",
        label: "",
      },
      ALReportParameters: {
        reportUser: {},
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
      userList: [
        {
          value: "",
          label: "",
        },
      ],
      renderDate: new Date(),
      alSummaryModalShow: false,
    };
  },
  methods: {
    changeRenderYear(year) {
      if (
        this.ALReportParameters.renderYearOffset +
          this.ALReportParameters.renderYear +
          year <
        2021
      ) {
        return;
      } else this.ALReportParameters.renderYearOffset += year;
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
    // this.ALReportParameters.renderYear = this.getCalendarYear;
    // default start from 2021 where system launch
    // this.ALReportParameters.renderYear = 2021;
    const now = new Date();
    this.ALReportParameters.renderYear = now.getFullYear();

    const userDoc = await usersCollection
      .where("enable", "==", true)
      .where("rank", "!=", "tmp")
      .orderBy("rank")
      .get();
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

<style scoped></style>
