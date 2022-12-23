<template>
  <q-page>
    <div class="row q-my-sm">
      <q-btn
        size="md"
        outline
        color="primary"
        class="q-mx-sm"
        icon="keyboard_arrow_left"
        v-on:click="changeRenderMonth(-12)"
      >
        上年
      </q-btn>
      <q-btn
        size="md"
        outline
        color="primary"
        class="q-mx-sm"
        v-on:click="changeRenderMonth(-1)"
      >
        上月
      </q-btn>

      <q-btn
        size="md"
        outline
        color="primary"
        class="q-mx-sm"
        v-on:click="changeRenderMonth(1)"
      >
        下月
      </q-btn>
      <q-btn
        size="md"
        outline
        color="primary"
        class="q-mx-sm"
        icon="keyboard_arrow_right"
        v-on:click="changeRenderMonth(12)"
      >
        下年
      </q-btn>
    </div>
    <div>
      <SpecialAnnualLeave
        v-bind:renderDate="renderDate"
        :key="renderDate.toDateString()"
      />
    </div>
  </q-page>
</template>

<script setup>
import SpecialAnnualLeave from "components/Holiday/SAL";
import { date as qdate } from "quasar";

// variable
const renderDate = ref(new Date())
   
// function
function changeRenderMonth(month) {
  let targetDate = qdate.addToDate(renderDate.value, { months: month });
  if (targetDate < new Date("2021/04/01")) {
    renderDate.value = new Date("2021/04/01"); //system begin
  } else {
    renderDate.value = targetDate;
  }
}
</script>

<style scoped>
.home {
  margin-top: 30px;
}
</style>
