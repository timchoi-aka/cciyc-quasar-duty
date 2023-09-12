<template>
  <div class="row q-ma-md-none q-pa-md-none bg-grey-3 justify-center">
    <div class="bg-primary row col-12 justify-left" style="min-height: 50px; max-height: 50px;">
      <q-btn icon="print" flat class="bg-primary text-white col-shrink" v-print="printObj">
        <q-tooltip class="bg-white text-primary">列印</q-tooltip>  
      </q-btn>
      <q-space/>
      <q-btn icon="close" flat dense class="bg-primary text-white col-shrink" v-close-popup align="right">
        <q-tooltip class="bg-white text-primary">關閉</q-tooltip>  
      </q-btn>
    </div>
    
    <div id="printVoucher" class="print-area bg-white items-start">
      <div class="row col-12 justify-center">
        <div class="row col-12 justify-center text-bold q-my-none highlight_1">長洲鄉事委員會青年綜合服務中心</div>
        <div class="row col-12 justify-center text-bold q-my-none highlight_3">CHEUNG CHAU RURAL COMMITTEE INTEGRATED YOUTH CENTRE</div>
        <div class="row col-12 justify-center text-bold highlight_2">活動餘款申請表</div>
      </div>
      
      <div class="row col-12 justify-left q-ml-lg">
        
        <div class="col-12 q-my-md highlight_3">活動名稱：{{ Event.c_act_name }}</div>
        <div class="col-12 q-my-md highlight_3 row">
          <div class="col-4">有否曾申請預支：<span v-if="prepaidResult.length > 0">有</span><span v-else>沒有</span></div>
          <div class="col-4">預支金額：${{  prepaidResult.reduce((a,v) => a+v.amount, 0) }}</div>
          <div class="col-4">預支日期：{{ prepaidResult.length > 0? qdate.formatDate(prepaidResult[0].apply_date, "YYYY-MM-DD"): "" }}</div>
        </div>
        <div class="col-12 q-my-md highlight_3">活動總支出： ${{ ExpenseTotal }}</div>
        
        <div class="col-11 q-my-none highlight_3 row">
          <div class="col-4 header">支票抬頭</div>
          <div class="col-4 header">金額</div>
          <div class="col-4 header">簽收</div>
        </div>
        <div v-for="data in props.data" class="col-11 q-my-none highlight_3 row">
          <div class="col-4 table-cell">{{data.recipient? data.recipient.trim(): data.apply_user.trim()}}</div>
          <div class="col-4 table-cell">${{data.amount? data.amount: ""}}</div>
          <div class="col-4 table-cell"></div>
        </div>

        <div class="col-12 q-my-md highlight_2 text-bold">申請餘款總金額：${{ props.data.reduce((a,v) => a + v.amount, 0) }}</div>
        <!--
        <div class="col-12 q-my-md highlight_2">商鋪/受款人：{{ props.data.recipient? props.data.recipient.trim(): props.data.apply_user.trim()  }}</div>
        <div class="col-12 q-my-md highlight_2">祈付：{{ props.data.c_act_code }}活動餘款</div>
        <div class="col-12 q-my-md highlight_2">金額：{{ convertToChinese(props.data.amount) }}</div>
        <div class="col-6 q-my-md highlight_2">港幣：HK${{ props.data.amount }}</div>
        -->
        
        <div class="col-7 q-my-lg highlight_4 row no-wrap"><span class="col-3">負責職員簽署：</span><span class="col-6" style="display: block; border-bottom: 1px solid;">&nbsp;</span><span class="col-2">(&nbsp;</span>)</div>
        <div class="col-5 q-my-lg highlight_4 row"><span class="col-3">日期：</span><span class="col-8" style="display: block; border-bottom: 1px solid;">&nbsp;</span></div>
        <div class="col-7 q-my-lg highlight_4 row"><span class="col-3">中心主任簽署：</span><span class="col-8" style="display: block; border-bottom: 1px solid;">&nbsp;</span></div>
        <div class="col-5 q-my-lg highlight_4 row"><span class="col-3">日期：</span><span class="col-8" style="display: block; border-bottom: 1px solid;">&nbsp;</span></div>
      </div>
    </div>
  </div>
</template>
    
<script setup>
import { gql } from "graphql-tag"
import { computed, ref } from "vue"
import { date as qdate, useQuasar } from "quasar"
import { useStore } from "vuex";
import { EVENT_EVALUATION_BY_ACT_CODE } from "/src/graphQueries/Event/query.js"
import { useQuery } from "@vue/apollo-composable"

// props
const props = defineProps({
  data: Array,
  eval_uuid: String,
  c_act_code: String,
})

const { result: EvaluationResult } = useQuery(gql`
  query Remain_GetExpenseByEvalUUID(
    $eval_uuid: uniqueidentifier = "00000000-0000-0000-0000-000000000000",
    ) {
    Event_Evaluation_Account(where: {
      eval_uuid: {_eq: $eval_uuid}, 
      planeval: {_eq: "檢討"},
      type: {_eq: "支出"}
    }) {
      account_uuid
      type
      amount
    }
  }`, () => ({
    eval_uuid: props.eval_uuid,
  }));

const { result: EventEvaluation, refetch: refetchEvaluation } = useQuery(
  EVENT_EVALUATION_BY_ACT_CODE,
  () => ({
    c_act_code: props.c_act_code
  }));

const { result: EventPrepaid, refetch: refetchPrepaid } = useQuery(gql`
  query Prepaid_GetPrepaidAmountByEvalUUID(
    $eval_uuid: uniqueidentifier = "00000000-0000-0000-0000-000000000000",
    ) {
    Event_Prepaid(where: {
      eval_uuid: {_eq: $eval_uuid}, 
      type: {_eq: "預支"}
    }) {
      amount
      apply_date
      apply_user
      approve_date
      approve_user
      approved
      c_act_code
      recipient
      eval_uuid
      payment_method
      uuid
      type
    }
  }`, () => ({
    eval_uuid: props.eval_uuid,
  }));

const $q = useQuasar()
const $store = useStore();
const isFinance = computed(() => $store.getters["userModule/getFinance"])
const prepaidResult = computed(() => EventPrepaid.value? EventPrepaid.value.Event_Prepaid:[])
const Event = computed(() => EventEvaluation.value?.HTX_Event_by_pk??[])
const ExpenseTotal = computed(() => EvaluationResult.value? EvaluationResult.value.Event_Evaluation_Account.reduce((a,v) => a + v.amount, 0): 0)

const printObj = ref({
  id: "printVoucher",
  preview: false,
  previewTitle: "列印預覽", // The title of the preview window. The default is 打印预览
  popTitle: "領款書",
})

// function
function convertToChinese(number) {
  if (number >= 100000) return '金額超過上限'
  // Define arrays of characters
  const digits = ['', '壹', '貳', '參', '肆', '伍', '陸', '柒', '捌', '玖'];
  
  // Split the number into portions of before and after decimal
  let units = number.toString().split('.')
  let unit = parseInt(units[0])
  let cent = parseInt(units[1])
  
  // Convert each portion to Chinese characters
  const chineseParts = [];
  const digitsPart = [];
  
  let tenThousand = Math.floor(unit/10000)
  if (tenThousand > 0) digitsPart.push(digits[tenThousand] + '萬');
  unit %= 10000;

  let thousand = Math.floor(unit/1000)
  if (thousand > 0)  digitsPart.push(digits[thousand] + '仟');
  unit %= 1000;

  let hundred = Math.floor(unit/100)
  if (hundred > 0) {
    if (thousand == 0 && tenThousand > 0) {
      digitsPart.push('零');
    }
    digitsPart.push(digits[hundred] + '佰');
  } 
  unit %= 100;
  
  let ten = Math.floor(unit/10)
  if (ten > 0) {
    if (hundred == 0 && (thousand > 0 || tenThousand > 0)) {
      digitsPart.push('零');
    }
    if (ten != 1) {
      digitsPart.push(digits[ten] + '拾');
    } else {
      if (hundred + thousand + tenThousand > 0) {
        digitsPart.push('壹拾');
      } else digitsPart.push('拾')
    }
    unit %= 10;
  }

  if (unit > 0) {
    if ((hundred > 0 || thousand > 0 || tenThousand > 0) && ten == 0)
      digitsPart.push('零' + digits[unit]);  
    else digitsPart.push(digits[unit]);
  } 
  digitsPart.push('圓')

  if (cent > 10) {
    digitsPart.push(digits[Math.floor(cent/10)] + '角')
    let mini = cent % 10
    if (mini > 0) digitsPart.push(digits[mini] + '分')
  } else if (cent > 0) {
    digitsPart.push(digits[cent] + '角')
  } else digitsPart.push('正');
  
  return digitsPart.join('')
}
</script>
  
<script>
import print from "vue3-print-nb";

export default {
  name: "PrintVoucher",
  directives: {
    print,
  },
}
</script>

<style scoped>
@media screen and (min-width: 600px) {
  .header {
    background-color: lightgrey;
    border: 1px solid; 
    display: block;
    text-align: center;
  }
  .table-cell {
    border: 1px solid; 
    display: block;
    text-align: center;
    height: 5vh;
  }
  .print-area {
    width: 80%;
    margin: 0; 
    overflow: hidden; 
    border: 1px solid
  }
  .highlight_1 {
    font-size: 1.2rem;
  }

  .highlight_2 {
    font-size: 1rem;
  }

  .highlight_3 {
    font-size: 0.7rem;
  }
}

@media screen and (max-width: 546px) {
  .header {
    background-color: lightgrey;
    border: 1px solid; 
    display: block;
    text-align: center;
  }
  .table-cell {
    border: 1px solid; 
    display: block;
    text-align: center;
    height: 5vh;
  }
  .print-area {
    width: 100%;
    margin: 0; 
    overflow: hidden; 
    border: 1px solid
  }
  .highlight_1 {
    font-size: 1rem;
  }

  .highlight_2 {
    font-size: 0.8rem;
  }

  .highlight_3 {
    font-size: 0.6rem;
  }
}

@media print {
  .header {
    background-color: lightgrey;
    border: 1px solid; 
    display: block;
    text-align: center;
  }
  .table-cell {
    border: 1px solid; 
    display: block;
    text-align: center;
    height: 5vh;
  }

  @page {
    size: portrait;
    margin: 0;
    overflow: hidden;
    scale: 100%;
  }
  .print-area { 
    border: none;
  }
  .highlight_1 {
    font-size: 1rem;
  }

  .highlight_2 {
    font-size: 0.8rem;
  }

  .highlight_3 {
    font-size: 0.6rem;
  }

  .highlight_4 {
    font-size: 0.4rem;
  }
}
</style>