<template>
  <q-page>
    <div class="row q-mx-xs justify-center">
      <ALApply v-bind:renderDate="renderDate" :key="renderDate" />
    </div>
  </q-page>
</template>

<script>
import ALApply from "components/ALApply";
import { defineComponent } from "vue";

export default defineComponent({
  name: "ALApplyPage",
  components: {
    ALApply,
  },
  data() {
    return {
      renderDate: new Date(),
    };
  },
  methods: {},
  mounted() {},
});
</script>

<style scoped></style>
