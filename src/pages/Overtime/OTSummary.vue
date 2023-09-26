<template>
  <q-page>
    <div v-if="isLeaveApprove" class="row q-my-sm">
      <div class="col-1 col-xs-4 col-sm-2 col-md-2">
        <q-btn
          size="lg"
          outline
          color="primary"
          class="q-mx-md q-pa-sm"
          v-print="printObj"
          >列印</q-btn
        >
      </div>
      <q-select
        class="offset-1 col-1 col-xs-4 col-sm-3 col-md-2"
        :options="userList"
        v-model="selectedUser"
        label="員工"
        hide-bottom-space
        @update:model-value="
          (val) => {
            reportUID = val.value;
            reportName = val.label;
          }
        "
      />
    </div>
    <div id="printMe">
      <OT v-bind:renderUID="reportUID" v-bind:renderName="reportName" :key="reportUID" />
    </div>
  </q-page>
</template>

<script setup>
import OT from "components/Overtime/OTSummary";
import { useStore } from "vuex";
import { computed, ref } from "vue";
import { usersCollection } from "boot/firebase";
import { query, where, orderBy, getDocs } from "firebase/firestore"

// variables
const $store = useStore();
const selectedUser = ref([])

const staffOption = ref({
  value: "",
  label: "",
})
      
const printObj = ref({
  id: "printMe",
  preview: true,
  previewTitle: "列印預覽",
  popTitle: "CCIYC 超時補假結餘總表"
})

const userList = ref([
  {
    value: "",
    label: "",
  },
])

// computed
const isLeaveManage = computed(() => $store.getters["userModule/getLeaveManage"])
const isLeaveApprove = computed(() => $store.getters["userModule/getLeaveApprove"])
const uid = computed(() => $store.getters["userModule/getUID"])
const username = computed(() => $store.getters["userModule/getUsername"])
  
const reportUID = ref(uid.value)
const reportName = ref(username.value)

const userQuery = query(usersCollection,
  where("enable", "==", true),
  where("privilege.tmp", "==", false),
  where("enable", "==", true),
  orderBy("order")
)
   
getDocs(userQuery).then((userDoc) => {
  userDoc.forEach((user) => {
    if (!user.data().privilege.systemAdmin) {
      userList.value.push({
        value: user.data().uid,
        label: user.data().name,
      });
    }
  });
})
</script>

<script>
import print from "vue3-print-nb";

export default {
  directives: {
    print
  }
}
</script>
