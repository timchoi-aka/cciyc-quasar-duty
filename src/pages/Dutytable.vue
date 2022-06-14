<template>
  <q-page>
    <div class="row q-my-sm q-mx-xs">
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
    </div>

    <div class="row q-mx-xs justify-center">
      <DutyCalendar
        v-bind:renderDate="renderDate"
        :allowModify="true"
        :key="renderDate.getDate()"
      />
    </div>
  </q-page>
</template>

<script>
import DutyCalendar from "components/DutyCalendar";
import { defineComponent } from "vue";

export default defineComponent({
  name: "Dutytable",
  components: {
    DutyCalendar,
  },
  computed: {
    //...mapState(["userProfile"]),
  },
  data() {
    return {
      renderDate: new Date(Number(Date.now())),
    };
  },
  methods: {
    changeRenderDate(days) {
      var result = new Date(Number(Date.parse(this.renderDate)));
      result.setDate(result.getDate() + days);
      this.renderDate = result;
    },
  },
  mounted() {},
});
</script>

<style scoped></style>
