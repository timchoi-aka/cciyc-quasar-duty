<template>
  <q-page>
    <q-dialog v-model="alSummaryModalShow" full-height full-width>
      <q-card class="q-pa-md">
        <q-card-section class="text-h4 bg-primary text-white q-px-md row">
          <div class="col-shrink">職員放取年假紀錄</div>
          <q-space />
          <div class="col-shrink">
            <q-btn
              icon="cancel"
              flat
              text-color="white"
              @click="alSummaryModalShow = !alSummaryModalShow"
            />
          </div>
        </q-card-section>

        <div class="row q-my-sm q-pa-md">
          <div class="col-3 col-xs-6 col-sm-6 col-md-4">
            <q-btn
              class="q-mr-md q-pa-sm"
              size="1.4vw"
              outline
              color="primary"
              v-on:click="changeRenderYear(-1)"
            >
              上年
            </q-btn>
            <q-btn
              class="q-mr-md q-pa-sm"
              size="1.4vw"
              outline
              color="primary"
              v-on:click="changeRenderYear(1)"
            >
              下年
            </q-btn>
            <q-btn
              class="q-mr-md q-pa-sm"
              size="1.4vw"
              outline
              color="primary"
              icon="print"
              v-print="printObj"
              >列印
            </q-btn>
          </div>
          <q-space />
          <div class="col-2 col-md-2 col-sm-3 col-xs-4">
            <q-select
              v-model="staffOption"
              hide-bottom-space
              :options="userList"
              label="員工"
              filled
              v-if="isLeaveManage"
              @update:model-value="
                (value) => (ALReportParameters.reportUser = value)
              "
            ></q-select>
          </div>
        </div>

        <div id="printMe" class="q-mt-md row q-pa-md">
          <div class="col-grow justify-center">
            <ALReport
              :key="JSON.stringify(ALReportParameters)"
              v-bind="ALReportParameters"
            />
          </div>
        </div>
      </q-card>
    </q-dialog>

    <div class="row fit q-my-sm">
      <q-btn
        size="lg"
        outline
        color="primary"
        icon="keyboard_arrow_left"
        :class="[$q.screen.lt.sm ? 'q-mx-xs q-pa-xs' : 'q-mx-md q-pa-md']"
        v-on:click="changeRenderMonth(-12)"
        label="上年"
      >
      </q-btn>
      <q-btn
        size="lg"
        outline
        color="primary"
        :class="[$q.screen.lt.sm ? 'q-mx-xs q-pa-xs' : 'q-mx-md q-pa-md']"
        v-on:click="changeRenderMonth(-1)"
        label="上月"
      >
      </q-btn>
      <q-btn
        size="lg"
        outline
        color="primary"
        :class="[$q.screen.lt.sm ? 'q-mx-xs q-pa-xs' : 'q-mx-md q-pa-md']"
        v-on:click="changeRenderMonth(1)"
        label="下月"
      >
      </q-btn>
      <q-btn
        size="lg"
        outline
        color="primary"
        icon="keyboard_arrow_right"
        :class="[$q.screen.lt.sm ? 'q-mx-xs q-pa-xs' : 'q-mx-md q-pa-md']"
        v-on:click="changeRenderMonth(12)"
        label="下年"
      >
      </q-btn>

      <q-btn
        size="lg"
        outline
        color="primary"
        :class="[$q.screen.lt.sm ? 'q-mx-xs q-pa-xs' : 'q-mx-md q-pa-md']"
        icon="print"
        v-on:click="alSummaryModalShow = !alSummaryModalShow"
      >
      </q-btn>
    </div>
    <AnnualLeave :renderDate="renderDate" :key="renderDate.toDateString()" />
  </q-page>
</template>

<script setup>
import AnnualLeave from "components/Holiday/AL";
import ALReport from "components/Holiday/ALReport";
import { useStore } from "vuex";
import { computed, ref } from "vue";
import { usersCollection } from "boot/firebase";
import { getDocs, query, where, orderBy } from "firebase/firestore";

const $store = useStore();
const staffOption = ref({
  value: "",
  label: "",
})

// default renderYear to this year
const now = new Date();
const ALReportParameters = ref({
  reportUser: {},
  renderYearOffset: 0,
  renderYear: now.getFullYear(),
})
const renderDate = ref(now)

const alSummaryModalShow = ref(false)

const printObj = ref({
  id: "printMe",
  preview: true,
  previewTitle: "列印預覽",
  popTitle: "CCIYC 年假結餘總表",
})

const userList = ref([
  {
    value: "",
    label: "",
  },
])

// computed
const isLeaveManage = computed(() => $store.getters["userModule/getLeaveManage"])
    
// functions
function changeRenderYear(year) {
  if (
    ALReportParameters.value.renderYearOffset +
      ALReportParameters.value.renderYear +
      year <
    2021
  ) {
    return;
  } else ALReportParameters.value.renderYearOffset += year;
}

function changeRenderMonth(month) {
  renderDate.value = new Date(
    renderDate.value.getFullYear(),
    renderDate.value.getMonth() + month,
    1
  );
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
