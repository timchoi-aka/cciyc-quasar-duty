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
    </div>

    <div class="q-mx-sm">
      <DutyCalendar
        :renderDate="renderDate"
        :allowModify="true"
        :printOnly="false"
        :key="renderDate"
      />
    </div>
  </q-page>
</template>

<script setup>
import DutyCalendar from "components/Duty/DutyCalendar";
import { date as qdate } from "quasar";
import { ref } from "vue"

// variables
const renderDate = ref(new Date())

// function
function changeRenderDate(days) {
  renderDate.value = qdate.addToDate(renderDate.value, { days: days });
}
</script>
