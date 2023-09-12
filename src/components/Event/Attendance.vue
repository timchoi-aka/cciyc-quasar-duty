<template>
  <!-- loading dialog -->
  <q-dialog v-model="waitingAsync" position="bottom">
    <LoadingDialog message="處理中"/>
  </q-dialog>
  
  <q-btn icon="print" flat class="bg-primary text-white col-shrink" v-print="printObj" label="列印"/>
  <div id="printMe" class="print-area q-mx-md">
    <div class="row justify-center" style="border-bottom: 2px solid">
      <div class="row col-12 justify-center highlight_3 text-weight-bold">長洲鄉事委員會青年綜合服務中心 - 活動點名表</div>
      <div class="row col-12 q-my-sm">
        <div class="col-3 normal">活動編號：<span style="border-bottom: 1px solid">{{ Event.c_act_code }}</span></div>
        <div class="col-3 normal">活動名稱：<span style="border-bottom: 1px solid">{{ Event.c_act_name }}</span></div>
        <div class="col-3 normal">性質：<span style="border-bottom: 1px solid">{{ Event.c_nature }}</span></div>
        <div class="col-3 normal">負責同事：<span style="border-bottom: 1px solid">{{ Event.c_respon }}</span></div>
      </div>
      <div class="row col-12 q-my-sm">
        <div class="col-3 normal">開始日期：<span style="border-bottom: 1px solid">{{ Event.d_date_from }}</span></div>
        <div class="col-3 normal">結束日期：<span style="border-bottom: 1px solid">{{ Event.d_date_to }}</span></div>
        <div class="col-3 normal">開始時間：<span style="border-bottom: 1px solid">{{ qdate.formatDate(qdate.extractDate(Event.d_time_from, "h:mm:ss A"), "h:mm A") }}</span></div>
        <div class="col-3 normal">結束時間：<span style="border-bottom: 1px solid">{{ qdate.formatDate(qdate.extractDate(Event.d_time_to, "h:mm:ss A"), "h:mm A") }}</span></div>
      </div>
      <div class="row col-12 q-my-sm">
        <div class="col-6 normal">地點：<span style="border-bottom: 1px solid">{{ Event.c_dest }}</span></div>
        <div class="col-2 normal">逢星期：<span style="border-bottom: 1px solid">{{ Event.c_week }}</span></div>
        <div class="col-2 normal">堂數：<span style="border-bottom: 1px solid">{{ Event.i_lessons }}</span></div>
        <div class="col-2 normal">參加人數：<span style="border-bottom: 1px solid">{{ Applicants.length }}</span></div>
      </div>
    </div>
    <!-- table header -->
    <div class="row col-12 q-mt-sm">
      <div style="border: 1px solid;" class="col-1 text-center normal">編號</div>
      <div style="border: 1px solid;" class="col-2 text-center normal">姓名</div>
      <div style="border: 1px solid;" class="col-1 text-center normal">年齡</div>
      <div style="border: 1px solid;" class="col-6 text-center row">
        <div style="border-bottom: 1px solid;" class="col-12 text-center normal">日期</div>
        <div class="row col-12 text-center justify-center">
          <div class="col-grow normal" style="border: 1px solid; line-height: 200%;" v-for="n in numberOfSlots">&nbsp;</div>
        </div>
      </div>
      <div style="border: 1px solid;" class="col-2 text-center normal">備註</div>
    </div>
    
    <!-- table body -->
    <div class="row col-12 q-mt-none" v-for="(member, index) in Applicants" :key="index">
      <div style="border: 1px solid;" class="col-1 text-center normal">{{ index+1 }}</div>
      <div style="border: 1px solid;" class="col-2 text-center normal">{{ member.c_name }} ({{ member.c_mem_id }})</div>
      <div style="border: 1px solid;" class="col-1 text-center normal">{{ member.i_age }}</div>
      <div style="border: 1px solid;" class="col-6 text-center row">
        <div class="col-grow" style="border-right: 1px solid;" v-for="n in numberOfSlots">&nbsp;</div>
      </div>
      <div style="border: 1px solid;" class="col-2 text-center">&nbsp;</div>
    </div>
    
    <!-- table footer -->
    <div class="row col-12 q-mt-none">
      <div style="border: 1px solid;" class="col-4 text-center normal">出席人數：</div>
      <div style="border: 1px solid;" class="col-6 text-center row">
        <div class="col-grow" style="border-right: 1px solid;" v-for="n in numberOfSlots">&nbsp;</div>
      </div>
      <div style="border: 1px solid;" class="col-2 text-center normal">&nbsp;</div>
    </div>
    <div class="row col-12 q-mt-none">
      <div style="border: 1px solid;" class="col-4 text-center normal">活動節數：</div>
      <div style="border: 1px solid;" class="col-6 text-center row">
        <div class="col-grow" style="border-right: 1px solid;" v-for="n in numberOfSlots">&nbsp;</div>
      </div>
      <div style="border: 1px solid;" class="col-2 text-center normal">&nbsp;</div>
    </div>
    <div class="row col-12 q-mt-none">
      <div style="border: 1px solid;" class="col-4 text-center normal">15-24歲青年人數：</div>
      <div style="border: 1px solid;" class="col-6 text-center row">
        <div class="col-grow" style="border-right: 1px solid;" v-for="n in numberOfSlots">&nbsp;</div>
      </div>
      <div style="border: 1px solid;" class="col-2 text-center normal">&nbsp;</div>
    </div>
  </div> 
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { EVENT_BY_PK, APPLICANTS_BY_ACT_CODE } from "/src/graphQueries/Event/query.js"
import { useQuery } from "@vue/apollo-composable"
import { date as qdate, useQuasar } from "quasar";
import LoadingDialog from "components/LoadingDialog.vue"

// props
const props = defineProps({
  EventID: String, 
})

// variables
const awaitServerResponse = ref(0)
const waitingAsync = computed(() => awaitServerResponse.value > 0)
const $q = useQuasar()
const $store = useStore();
const printObj = ref({
  id: "printMe",
  preview: false,
  previewTitle: "列印預覽",
  popTitle: "點名紙",
})
const numberOfSlots = ref(20)

// queries
const { onResult: EventData } = useQuery(
  EVENT_BY_PK,
  () => ({
    c_act_code: props.EventID
  }));

const { onResult: ApplicantData } = useQuery(
  APPLICANTS_BY_ACT_CODE,
  () => ({
    c_act_code: props.EventID
  }), {
    pollInterval: 5000,
  });

// computed
const Event = ref([])
const Applicants = ref([])

ApplicantData((result) => {
  if (result.data) Applicants.value = result.data.tbl_act_reg
})

EventData((result) => {
  if (result.data) Event.value = result.data.HTX_Event_by_pk
})
</script>

<script>
import print from "vue3-print-nb";

export default {
  name: "PrintReceipt",
  directives: {
    print,
  },
}
</script>

<style scoped>
@media screen {
  .print-area {
    size: landscape;
    width: 29.7cm;
    height: 21cm;
    margin: 3mm; 
    overflow: hidden; 
    border: 1px solid;
  }
  .highlight_3 {
    font-size: 1.4rem;
  }

  .normal {
    font-size: 0.8rem;
  }
}

@media print {
  @page {
    size: landscape !important;
    width: 29.7cm;
    /* height: 21cm; */
    margin: 3mm;
    overflow: hidden;
    scale: 100%;
  }
  .print-area { 
    border: none;
  }

  .highlight_3 {
    font-size: 0.7rem;
  }
  .normal {
    font-size: 0.4rem;
  }
}
</style>