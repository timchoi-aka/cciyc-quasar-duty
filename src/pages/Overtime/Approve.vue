<template>
  <q-page>
    <div class="row q-mx-xs justify-center">
      <OTApprove />
    </div>
  </q-page>
</template>

<script>
import OTApprove from "components/Overtime/OTApprove";
import { defineComponent, computed } from "vue";

export default defineComponent({
  name: "OTApprovePage",
  components: {
    OTApprove,
  },
  methods: {},
  mounted() {},
});
</script>

<style scoped></style>
