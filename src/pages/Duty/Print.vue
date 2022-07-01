<template>
  <q-page>
    <div class="q-my-sm row no-wrap justify-left">
      <div class="col-10">
        <q-btn
          class="q-mx-sm"
          size="lg"
          icon="keyboard_double_arrow_left"
          outline
          color="primary"
          v-on:click="changeRenderDate(-364)"
        >
          上年
        </q-btn>
        <q-btn
          class="q-mx-sm"
          size="lg"
          outline
          color="primary"
          v-on:click="changeRenderDate(-7)"
        >
          上周
        </q-btn>
        <q-btn
          class="q-mx-sm"
          size="lg"
          outline
          color="primary"
          v-on:click="changeRenderDate(7)"
        >
          下周
        </q-btn>
        <q-btn
          class="q-mx-sm"
          size="lg"
          icon="keyboard_double_arrow_right"
          outline
          color="primary"
          v-on:click="changeRenderDate(364)"
        >
          下年
        </q-btn>
      </div>
      <div class="col-1">
        <q-btn outline color="primary" size="lg" icon="print" v-print="printObj" />
      </div>
    </div>
    <div id="printMe" class="q-ml-xs row justify-left q-pa-none">
      <div class="col-12 text-center text-h5">CCIYC - STAFF DUTY SCHEDULE</div>

      <DutyCalendar
        class="q-ma-none q-pa-none"
        v-bind:renderDate="renderDate"
        :allowModify="false"
        :printOnly="true"
        :key="renderDate.getTime()"
      />

      <ActivityCalendar
        class="q-ma-none q-pa-none"
        v-bind:renderDate="renderDate"
        v-bind:printHeader="false"
        :key="renderDate.getDate()"
      />

      <Footer
        class="q-mt-none q-py-none q-mb-lg"
        v-bind:renderDate="renderDate"
        :key="renderDate.getTime() + renderDate.getDate()"
      />
    </div>
  </q-page>
</template>

<script>
import ActivityCalendar from "components/Duty/ActivityCalendar";
import DutyCalendar from "components/Duty/DutyCalendar";
import print from "vue3-print-nb";
import Footer from "components/Duty/Footer";
import { date as qdate } from "quasar";

export default {
  name: "Print",
  components: {
    ActivityCalendar,
    DutyCalendar,
    Footer,
  },
  directives: {
    print,
  },
  data() {
    return {
      qdate: qdate,
      renderDate: new Date(Number(Date.now())),
      printObj: {
        id: "printMe",
        preview: true,
        previewTitle: "列印預覽", // The title of the preview window. The default is 打印预览
        popTitle: "CCIYC Duty Table",
        extraCss:
          "https://cdn.bootcdn.net/ajax/libs/animate.css/4.1.1/animate.compat.css, https://cdn.bootcdn.net/ajax/libs/hover.css/2.3.1/css/hover-min.css,",
        extraHead: '<meta http-equiv="Content-Language" content="en"/>',
      },
    };
  },
  methods: {
    changeRenderDate(days) {
      this.renderDate = qdate.addToDate(this.renderDate, { days: days });
    },
  },
};
</script>

<style scoped>
@media screen {
  #printme {
    display: none;
  }
}

@media print {
  @page {
    size: landscape;
  }
}
</style>
