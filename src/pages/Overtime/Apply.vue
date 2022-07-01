<template>
  <q-page>
    <div class="row q-mx-xs justify-center">
      <OTApply />
    </div>
  </q-page>
</template>

<script>
import OTApply from "components/Overtime/OTApply";
import { defineComponent } from "vue";

export default defineComponent({
  name: "OTApplyPage",
  components: {
    OTApply,
  },
});
</script>

<style scoped></style>
