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

      <div class="q-ma-none q-pa-none">
        <DutyCalendar
          :renderDate="renderDate"
          :allowModify="false"
          :printOnly="true"
          :key="renderDate"
        />
      </div>
      
      <div class="q-ma-none q-pa-none">
        <ActivityCalendar
          :renderDate="renderDate"
          :printHeader="false"
          :key="renderDate"
        />
      </div>

      <div class="q-mt-none q-py-none q-mb-lg">
        <Footer
          :renderDate="renderDate"
          :key="renderDate"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import DutyCalendar from "components/Duty/DutyCalendar"
import ActivityCalendar from "components/Duty/ActivityCalendar"
import Footer from "components/Duty/Footer"
import { date as qdate } from "quasar"
import { ref } from "vue"

// variables
const renderDate = ref(new Date())
const printObj = ref({
  id: "printMe",
  preview: true,
  previewTitle: "列印預覽", // The title of the preview window. The default is 打印预览
  popTitle: "CCIYC Duty Table",
})

// function
function changeRenderDate(days) {
  renderDate.value = qdate.addToDate(renderDate.value, { days: days });
}
</script>

<script>
import print from "vue3-print-nb";
export default {
  directives: {
    print
  }
}
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
