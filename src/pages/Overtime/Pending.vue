<template>
  <q-page>
    <div class="row q-mx-xs justify-center">
      <OTPending />
    </div>
  </q-page>
</template>

<script>
import OTPending from "components/Overtime/OTPending";
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "OTPendingPage",
  components: {
    OTPending,
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
