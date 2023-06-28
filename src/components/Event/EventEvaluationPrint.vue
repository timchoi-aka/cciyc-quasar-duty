<template>
  <q-card>
    <q-card-section class="bg-primary text-white row">
      <q-btn icon="print" flat v-print="printObj"/>
      <q-chip>開發中</q-chip>
      <q-space/>
      <q-btn icon="close" flat align="right" v-close-popup/>
    </q-card-section>
    <!-- printout -->
    <q-card-section id="printMe" class="print-area">
      {{ props }}
      <div class="col-12 row items-center">
        <img src="~assets/cciyc_logo.svg" style="width: 90px; height: 90px;" class="col-1"/>
        <div class="print-title col-7 row q-mx-md items-center">
          <div class="col-12">長洲鄉事委員會青年綜合服務中心</div>
          <div class="col-12">Cheung Chau Rural Committee Integrated Youth Centre</div>
        </div>
      </div>
      <div class="col-12 text-body row justify-around q-py-none q-my-none text-bold" style="text-decoration: underline">工作計劃檢討表</div>
      <div class="col-12 text-body row justify-around q-py-none q-my-none">
        <div class="col-1">名稱：</div><div class="col-6">{{props.modelValue.c_act_name}}</div><div class="col-1">類別：</div><div class="col-4"></div><div> </div>

      </div>  
    </q-card-section>
  </q-card>
</template>

<script setup>
import print from "vue3-print-nb";
import { ref } from "vue"

const printObj = ref({
  id: "printMe",
  preview: false,
})

const props = defineProps({
  modelValue: {
    type: Object,
    Required: true,
  }
})
</script>

<script>
import print from "vue3-print-nb";

export default {
  name: "PrintPlanEvaluation",
  directives: {
    print,
  },
}
</script>

<style lang="scss" scoped>
@media screen {
  .hideOnScreen {
    display: none
  }
}

@media print {
  .hideOnPrint {
    display: none
  }
  .print-area { 
    margin: 30px;
    border: none;
  }
  .print-title {
    font-size: 0.4rem;
    line-height: 25px;
  }
}
</style>