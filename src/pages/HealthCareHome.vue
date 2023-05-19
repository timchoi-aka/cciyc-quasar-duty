<template>
  <q-page>
    <router-view style="margin-top: 55px;"/>
    <q-page-sticky position="top" expand>
      <q-tabs
        dense
        class="text-black bg-light-blue-2 fit"
        active-color="brown"
        indicator-color="blue"
        align="justify"
      >
        <q-route-tab to="/healthcare/apply" icon="calendar_month" label="申請" />
        <q-route-tab to="/healthcare/balance" icon="event" label="結餘" />
        <q-route-tab
          v-if="isCenterIC"
          to="/healthcare/approve"
          icon="approval"
          label="審批醫療"
        >
          <q-badge v-if="$q.screen.gt.xs" color="red" floating>{{ pendingHCApprovalCount }}</q-badge>
          <q-badge v-else color="red">{{ pendingHCApprovalCount }}</q-badge>
        </q-route-tab>
      </q-tabs>
    </q-page-sticky>
  </q-page>
</template>

<script setup>
import { useStore } from "vuex";
import { computed, ref, onUnmounted } from "vue";
import { useQuasar } from "quasar";
import { onSnapshot, doc } from "firebase/firestore"
import { dashboardCollection } from "boot/firebase";

const $store = useStore();
const $q = useQuasar()

$store.dispatch("userModule/switchModule", "duty");
const dashboardListener = ref()
const pendingHCApprovalCount = ref(0)

// hook listener
const dashboardQuery = doc(dashboardCollection, "notification")
dashboardListener.value = onSnapshot(dashboardQuery, (snapshot) => {
  pendingHCApprovalCount.value = snapshot.data().healthcare_waitingForApproval;
});

// unregister listeners
onUnmounted(() => {
  dashboardListener.value();
})

const isCenterIC = computed(() => $store.getters["userModule/getCenterIC"]) 
</script>
  
  