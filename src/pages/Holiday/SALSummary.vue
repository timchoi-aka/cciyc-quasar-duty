<template>
  <q-page>
    <div class="row q-my-sm">
      <q-btn
        size="lg"
        outline
        color="primary"
        class="q-mx-md"
        icon="keyboard_arrow_left"
        v-on:click="changeRenderMonth(-12)"
      >
        上年
      </q-btn>
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
        size="lg"
        outline
        color="primary"
        class="q-mx-md"
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

<script>
import SpecialAnnualLeave from "components/Holiday/SAL";
import { date as qdate } from "quasar";

export default {
  name: "SpecialAnnualLeaveView",
  components: {
    SpecialAnnualLeave,
  },
  data() {
    return {
      qdate: qdate,
      renderDate: new Date(),
    };
  },
  methods: {
    changeRenderMonth(month) {
      let targetDate = qdate.addToDate(this.renderDate, { months: month });
      if (targetDate < new Date("2021/04/01")) {
        this.renderDate = new Date("2021/04/01"); //system begin
      } else {
        this.renderDate = targetDate;
      }
    },
  },
  mounted() {},
};
</script>

<style scoped>
.home {
  margin-top: 30px;
}
</style>
