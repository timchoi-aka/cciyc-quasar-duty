<template>
  <q-page>
    <div class="row q-mb-sm q-mx-xs justify-left fit" v-if="!$q.screen.lt.sm">
      <div class="col-1 col-md-2 col-lg-1 col-xs-3 col-sm-2 row justify-start">
        <q-btn
          size="md"
          outline
          icon="keyboard_double_arrow_left"
          color="primary"
          v-on:click="changeRenderDate(-364)"
          label="上年"
        />
      </div>
      <div class="col-1 col-md-2 col-lg-1 col-xs-2 col-sm-2 row justify-start">
        <q-btn
          size="md"
          outline
          icon="keyboard_arrow_left"
          color="primary"
          v-on:click="changeRenderDate(-28)"
          label="上月"
        />
      </div>
      <div class="col-1 col-md-1 col-lg-1 col-xs-1 col-sm-1 row justify-start">
        <q-btn
          size="md"
          outline
          color="primary"
          v-on:click="changeRenderDate(-7)"
          label="上周"
        />
      </div>
      <div class="col-1 col-md-1 col-lg-1 col-xs-1 col-sm-1 row justify-end">
        <q-btn
          size="md"
          outline
          color="primary"
          v-on:click="changeRenderDate(7)"
          label="下周"
        />
      </div>
      <div class="col-1 col-md-2 col-lg-1 col-xs-2 col-sm-2 row justify-end">
        <q-btn
          size="md"
          outline
          icon="keyboard_arrow_right"
          color="primary"
          v-on:click="changeRenderDate(28)"
          label="下月"
        />
      </div>
      <div class="col-1 col-md-2 col-lg-1 col-xs-3 col-sm-2 row justify-end">
        <q-btn
          size="md"
          outline
          icon="keyboard_double_arrow_right"
          color="primary"
          v-on:click="changeRenderDate(364)"
          label="下年"
        />
      </div>
      <q-space />
      <div class="col-1">
        <q-btn outline color="primary" size="lg" icon="print" v-print="printObj" />
      </div>
    </div>

    <div class="q-mb-sm q-mx-xs justify-center fit" v-if="$q.screen.lt.sm">
      <q-btn
        class="q-mx-xs q-pa-sm"
        size="md"
        outline
        color="primary"
        v-on:click="changeRenderDate(-364)"
        label="上年"
      /><q-btn
        class="q-mx-xs q-pa-sm"
        size="md"
        outline
        color="primary"
        v-on:click="changeRenderDate(-28)"
        label="上月"
      /><q-btn
        class="q-mx-xs q-pa-sm"
        size="md"
        outline
        color="primary"
        v-on:click="changeRenderDate(-7)"
        label="上周"
      /><q-btn
        class="q-mx-xs q-pa-sm"
        size="md"
        outline
        color="primary"
        v-on:click="changeRenderDate(7)"
        label="下周"
      /><q-btn
        class="q-mx-xs q-pa-sm"
        size="md"
        outline
        color="primary"
        v-on:click="changeRenderDate(28)"
        label="下月"
      /><q-btn
        class="q-mx-xs q-pa-xs"
        size="md"
        outline
        color="primary"
        v-on:click="changeRenderDate(364)"
        label="下年"
      />
      <q-btn outline color="primary" size="md" icon="print" v-print="printObj" />
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
