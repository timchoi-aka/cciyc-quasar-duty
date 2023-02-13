<template>
  <q-page>
    <div class="row fit q-my-sm">
      <q-btn
        size="lg"
        outline
        color="primary"
        icon="keyboard_arrow_left"
        :class="[$q.screen.lt.sm ? 'q-mx-xs q-pa-xs' : 'q-mx-md q-pa-md']"
        v-on:click="changeRenderYear(-1)"
        label="上年"
      >
      </q-btn>
      <q-btn
        size="lg"
        outline
        color="primary"
        icon="keyboard_arrow_right"
        :class="[$q.screen.lt.sm ? 'q-mx-xs q-pa-xs' : 'q-mx-md q-pa-md']"
        v-on:click="changeRenderYear(1)"
        label="下年"
      >
      </q-btn>
      <div class="col-2 col-md-2 col-sm-3 col-xs-4">
        <q-select
          v-model="staffOption"
          hide-bottom-space
          :options="userList"
          label="員工"
          filled
          v-if="isLeaveManage"
          @update:model-value="
            (value) => (SLReportParameters.reportUser = value)
          "
        ></q-select>
      </div>
      
      <q-btn
        size="lg"
        outline
        color="primary"
        :class="[$q.screen.lt.sm ? 'q-mx-xs q-pa-xs' : 'q-mx-md q-pa-md']"
        icon="print"
        v-print="printObj"
      >
      </q-btn>
    </div>
    <div class="q-px-md" id="printMe"><SLReport :key="JSON.stringify(SLReportParameters)" v-bind="SLReportParameters"/></div>
  </q-page>
</template>

<script setup>
import SLReport from "components/Holiday/SLReport";
import { useStore } from "vuex";
import { computed, ref } from "vue";
import { usersCollection } from "boot/firebase";
import { getDocs, query, where, orderBy } from "firebase/firestore";

const $store = useStore();
const staffOption = ref({
  value: "",
  label: "",
})

const printObj = ref({
  id: "printMe",
  preview: true,
  previewTitle: "列印預覽",
  popTitle: "CCIYC 病假結餘總表",
})

const userList = ref([
  {
    value: "",
    label: "",
  },
])

// computed
const isLeaveManage = computed(() => $store.getters["userModule/getLeaveManage"])
const uid = computed(() => $store.getters["userModule/getUID"])
const currentYear = computed(() => (new Date()).getMonth() > 2? (new Date()).getFullYear()+1: (new Date()).getFullYear())

// default renderYear to this year
const SLReportParameters = ref({
  reportUser: {},
  renderYearOffset: 0,
  renderYear: currentYear,
})

// functions
function changeRenderYear(year) {
  if (
    SLReportParameters.value.renderYearOffset +
      SLReportParameters.value.renderYear +
      year <
    2022
  ) {
    return;
  } else SLReportParameters.value.renderYearOffset += year;
}

// query
const userDocQuery = query(usersCollection,
  where("enable", "==", true),
  where("rank", "!=", "tmp"),
  orderBy("rank")
)

getDocs(userDocQuery).then((userDoc) => {
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
    print,
  }
}
</script>
