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

<script setup>
import { useStore } from "vuex";
import { OTCollection, FireDB } from "boot/firebase";
import { ref, computed, onUnmounted } from "vue";
import { onSnapshot, doc, where, query } from "firebase/firestore";

onUnmounted(() => {
  OTListener.value()
  dashboardListener.value()
})
      
// variables
const $store = useStore();
const pendingOTApprovalCount = ref(0)
const pendingCount = ref(0)

// computed
const uid = computed(() => $store.getters["userModule/getUID"])
const isLeaveApprove = computed(() => $store.getters["userModule/getLeaveApprove"])
const otBalance = computed(() => $store.getters["userModule/getOTBalance"])
const OTListener = ref()
const dashboardListener = ref()

const OTQuery = query(OTCollection, 
  where("uid", "==", uid.value),
  where("status", "==", "未批")
)

OTListener.value = onSnapshot(OTQuery, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    pendingCount.value = Object.keys(snapshot.docs).length;
  })
})

dashboardListener.value = onSnapshot(doc(FireDB, "dashboard", "notification"), (snapshot) => {
  pendingOTApprovalCount.value = snapshot.data().ot_waitingForApproval;
})
</script>

<style scoped></style>
