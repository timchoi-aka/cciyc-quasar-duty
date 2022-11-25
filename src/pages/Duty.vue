<template>
  <q-page>
    <router-view style="margin-top: 70px;"/>
    <q-page-sticky position="top" expand>
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
    $store.dispatch("currentModule/setCurrentModule", "duty");

    return {
      isTmp: computed(() => $store.getters["userModule/getTmp"]),
    };
  },
});
</script>

