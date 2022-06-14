<template>
  <q-page>
    <q-tabs
      dense
      class="text-white bg-light-blue-6"
      active-color="white"
      indicator-color="black"
      align="justify"
    >
      <q-route-tab to="/holiday/al-view" icon="celebration" label="年假表" />
      <q-route-tab to="/holiday/sal-view" icon="local_activity" label="特別年假表" />
      <q-route-tab to="/holiday/al-apply" icon="edit_calendar" label="申請假期" />
      <q-route-tab to="/holiday/holiday-pending" icon="hourglass_empty" label="待審批">
        <q-badge color="red" floating>{{ pendingCount }}</q-badge>
      </q-route-tab>
      <q-route-tab
        v-if="isLeaveApprove"
        to="/holiday/holiday-approve"
        icon="approval"
        label="批核假期"
      >
        <q-badge color="red" floating>{{ pendingALApprovalCount }}</q-badge>
      </q-route-tab>
    </q-tabs>

    <router-view class="q-mt-md q-mb-xl" />
  </q-page>
</template>

<script>
import { useStore } from "vuex";
import { leaveCollection, dashboardCollection } from "boot/firebase";
import { defineComponent, computed } from "vue";

export default defineComponent({
  name: "Holiday",
  data() {
    return {
      pendingALApprovalCount: 0,
      pendingCount: 0,
      renderDate: new Date(),
    };
  },
  async mounted() {
    leaveCollection
      .where("uid", "==", this.uid)
      .where("status", "==", "未批")
      .onSnapshot((snapshot) => {
        this.pendingCount = Object.keys(snapshot.docs).length;
      });
    dashboardCollection.doc("notification").onSnapshot((snapshot) => {
      this.pendingALApprovalCount = snapshot.data().leave_waitingForApproval;
    });
  },
  setup() {
    const $store = useStore();

    return {
      uid: computed(() => $store.getters["userModule/getUID"]),
      isLeaveManage: computed(() => $store.getters["userModule/getLeaveManage"]),
      isLeaveApprove: computed(() => $store.getters["userModule/getLeaveApprove"]),
    };
  },
});
</script>

<style scoped></style>
