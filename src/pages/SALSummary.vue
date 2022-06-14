<template>
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
import SpecialAnnualLeave from "/src/components/SAL";

export default {
  name: "SpecialAnnualLeaveView",
  components: {
    SpecialAnnualLeave,
  },
  data() {
    return {
      renderDate: new Date(),
    };
  },
  methods: {
    changeRenderMonth(month) {
      this.renderDate = new Date(
        this.renderDate.getFullYear(),
        this.renderDate.getMonth() + month,
        1
      );
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
