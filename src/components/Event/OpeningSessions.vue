<template>
  <q-card style="min-width: 50vw; width: 50vw; max-width: 50vw; height: 50vh; min-height: 50vh; max-height: 50vh;">
    <q-card-section class="bg-primary text-white row">
      <div class="text-body1">開放節數</div>
      <q-btn flat icon="print" v-print="printObj"/>
      <q-space/>
      <q-btn icon="close" flat v-close-popup/>
    </q-card-section>
    <q-card-section>
      <div id="printOpeningSessions" class="print-area">
        <div class="text-body1">開始日期：{{ qdate.formatDate(props.reportStartDate, "YYYY年M月D日") }}</div>
        <div class="text-body1">結束日期：{{ qdate.formatDate(props.reportEndDate, "YYYY年M月D日") }}</div>
        <div class="text-body1">開放節數：{{ props.numberOfSessions }} </div>
        
        <q-table
          dense
          flat
          :rows="props.data"
          :columns="Columns"
          :pagination="Pagination"
          color="primary"
          row-key="date"
          separator="cell"
          virtual-scroll
          binary-state-sort
        >
          <template v-slot:body-cell-slot_a="props">
            <q-td :props="props" :class="[props.value? 'bg-green': 'red']">
            </q-td>
          </template>
          <template v-slot:body-cell-slot_b="props">
            <q-td :props="props" :class="[props.value? 'bg-green': 'red']">
            </q-td>
          </template>
          <template v-slot:body-cell-slot_c="props">
            <q-td :props="props" :class="[props.value? 'bg-green': 'red']">
            </q-td>
          </template>
        </q-table>
      
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed, ref, watch, onMounted } from "vue";
import { exportFile, date as qdate, is } from "quasar";
import print from "vue3-print-nb";

const props = defineProps({
  data: {
    required: true,
    type: Object,
    default: {},
  },
  reportStartDate: { 
    required: true,
    type: Date,
    default: "1970/01/01 00:00:00",
  },
  reportEndDate: { 
    required: true,
    type: Date,
    default: "1970/01/01 00:00:00",
  },
  numberOfSessions: {
    required: true,
    type: Number,
    default: 0,
  }
}) 

const Pagination = ref({
  rowsPerPage: 40,
})

const Columns = ref([
  {
    name: "date",
    label: "日期",
    field: "date",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => qdate.formatDate(val, "YYYY年M月D日(ddd)", {
                  daysShort: ['日', '一', '二', '三', '四', '五', '六'],
                })
  },
  {
    name: "slot_a",
    label: "早",
    field: "slot_a",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "slot_b",
    label: "午",
    field: "slot_b",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "slot_c",
    label: "晚",
    field: "slot_c",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  }
])

const printObj = ref({
  id: "printOpeningSessions",
  preview: false,
})
</script>

<script>
import print from "vue3-print-nb";

export default {
  name: "PrintOpeningSessions",
  directives: {
    print,
  },
}
</script>

<style lang="scss" scoped>
@media screen {
  .red {
    background: red;
  }
}
@media print {
  @page {
    size: portrait !important;
    width: 21cm;
    height: 29.7cm;
    margin: 3mm;
    overflow: hidden;
    scale: 100%;
  }
  .print-area { 
    border: none;
  }

  .text-body1 {
    font-size: 0.6rem;
    line-height: 100%;
  }
  .red {
    background: white;
  }
  
}
</style>