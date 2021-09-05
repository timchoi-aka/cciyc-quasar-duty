<template>
  <q-page>
    <div class="row q-my-sm">
      <q-btn
        class="q-mx-md"
        size="lg"
        outline
        color="primary"
        v-on:click="changeRenderDate(-7)"
      >
        上周
      </q-btn>
      <q-separator></q-separator>
      <q-btn
        class="q-mx-md"
        size="lg"
        outline
        color="primary"
        v-on:click="changeRenderDate(7)"
      >
        下周
      </q-btn>
      <q-btn class="q-mx-md" outline color="primary" icon="print" v-print="printObj" />
    </div>
    <div id="printMe" class="q-mx-xs">
      <div class="text-center text-h5">CCIYC - STAFF DUTY SCHEDULE</div>
      <div class="q-my-none q-py-none flex">
        <q-space />
        <DutyCalendar
          v-bind:renderDate="renderDate"
          :allowModify="false"
          :key="renderDate.getTime()"
        />
        <q-space />
      </div>
      <div class="q-my-none q-py-none flex">
        <q-space />
        <ActivityCalendar
          v-bind:renderDate="renderDate"
          v-bind:printHeader="false"
          :key="renderDate.getDate()"
        />
        <q-space />
      </div>
      <div class="q-mt-none q-py-none q-mb-lg flex">
        <q-space />
        <Footer
          v-bind:renderDate="renderDate"
          :key="renderDate.getTime() + renderDate.getDate()"
        />
        <q-space />
      </div>
    </div>
  </q-page>
</template>

<script>
import ActivityCalendar from "components/ActivityCalendar";
import DutyCalendar from "components/DutyCalendar";
import print from "vue3-print-nb";
import Footer from "components/Footer";

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
      var result = new Date(Number(Date.parse(this.renderDate)));
      result.setDate(result.getDate() + days);
      this.renderDate = result;
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
  table {
    border: 0.5px solid black;
  }

  table th,
  td {
    border: 0.5px solid black;
  }
}

#printMe {
  page: landscape;
}

.q-space {
  display: none;
}
</style>
