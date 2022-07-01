<template>
  <q-page>
    <q-page-sticky style="z-index: 1" position="top" expand>
      <q-tabs
        dense
        class="text-black bg-light-blue-2 fit"
        active-color="brown"
        indicator-color="blue"
        align="justify"
      >
        <q-route-tab to="/duty/dutytable" icon="calendar_month" label="更表" />
        <q-route-tab v-if="!isTmp" to="/duty/activity" icon="event" label="活動" />
        <q-route-tab v-if="!isTmp" to="/duty/print" icon="print" label="列印更表" />
      </q-tabs>
    </q-page-sticky>
    <q-separator class="q-mt-xl" />
    <router-view class="q-mt-md q-mb-xl" />
  </q-page>
</template>

<script>
import { useStore } from "vuex";
import { defineComponent, computed } from "vue";

export default defineComponent({
  name: "Holiday",
  data() {
    return {
      renderDate: new Date(),
    };
  },
  async mounted() {
    this.$router.push("/duty/dutytable").catch(() => {});
  },
  setup() {
    const $store = useStore();

    return {
      isTmp: computed(() => $store.getters["userModule/getTmp"]),
    };
  },
});
</script>

<style scoped></style>
