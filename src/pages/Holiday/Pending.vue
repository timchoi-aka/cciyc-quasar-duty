<template>
  <q-page>
    <div class="row q-mx-xs justify-center">
      <HolidayPending v-bind:uid="uid" :key="uid" />
    </div>
  </q-page>
</template>

<script>
import HolidayPending from "components/Holiday/HolidayPending";
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "HolidayPendingPage",
  components: {
    HolidayPending,
  },
  methods: {},
  mounted() {},
  setup() {
    const $store = useStore();

    return {
      uid: computed(() => $store.getters["userModule/getUID"]),
    };
  },
});
</script>

<style scoped></style>
