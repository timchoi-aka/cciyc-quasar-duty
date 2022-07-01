<template>
  <q-page>
    <div class="row q-mx-xs justify-center">
      <HolidayApprove />
    </div>
  </q-page>
</template>

<script>
import HolidayApprove from "components/Holiday/HolidayApprove";
import { defineComponent, computed } from "vue";

export default defineComponent({
  name: "HolidayApprovePage",
  components: {
    HolidayApprove,
  },
  methods: {},
  mounted() {},
});
</script>

<style scoped></style>
