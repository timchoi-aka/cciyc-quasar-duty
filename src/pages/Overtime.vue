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
        <q-route-tab to="/overtime/ot-view" icon="celebration" label="超時結餘" />
        <q-route-tab to="/overtime/ot-apply" icon="edit_calendar" label="申請超時補假">
          <q-badge color="red" floating>{{ otBalance }}</q-badge>
        </q-route-tab>
        <q-route-tab to="/overtime/ot-pending" icon="hourglass_empty" label="待審批">
          <q-badge color="red" floating>{{ pendingCount }}</q-badge>
        </q-route-tab>
        <q-route-tab
          v-if="isLeaveApprove"
          to="/overtime/ot-approve"
          icon="approval"
          label="批核補假"
        >
          <q-badge color="red" floating>{{ pendingOTApprovalCount }}</q-badge>
        </q-route-tab>
      </q-tabs>
    </q-page-sticky>
    <q-separator class="q-mt-xl" />
    <router-view class="q-mt-md q-mb-xl" />
  </q-page>
</template>

<script>
import { useStore } from "vuex";
import { OTCollection, dashboardCollection } from "boot/firebase";
import { defineComponent, computed } from "vue";

export default defineComponent({
  name: "Holiday",
  data() {
    return {
      OTListener: Function(),
      dashboardListener: Function(),
      pendingOTApprovalCount: 0,
      pendingCount: 0,
    };
  },
  async unmounted() {
    this.OTListener();
    this.dashboardListener();
  },
  async mounted() {
    this.OTListener = OTCollection.where("uid", "==", this.uid)
      .where("status", "==", "未批")
      .onSnapshot((snapshot) => {
        this.pendingCount = Object.keys(snapshot.docs).length;
      });
    this.dashboardListener = dashboardCollection
      .doc("notification")
      .onSnapshot((snapshot) => {
        this.pendingOTApprovalCount = snapshot.data().ot_waitingForApproval;
      });
    this.$router.push("/overtime/ot-view").catch(() => {});
  },
  setup() {
    const $store = useStore();

    return {
      uid: computed(() => $store.getters["userModule/getUID"]),
      isLeaveManage: computed(() => $store.getters["userModule/getLeaveManage"]),
      isLeaveApprove: computed(() => $store.getters["userModule/getLeaveApprove"]),
      otBalance: computed(() => $store.getters["userModule/getOTBalance"]),
    };
  },
});
</script>

<style scoped></style>
