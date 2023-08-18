<template>
  <div class="row q-ma-md-none q-pa-md-none bg-grey-3 justify-center">
    <div class="bg-primary row col-12 justify-left" style="min-height: 50px; max-height: 50px;">
      <q-btn icon="print" flat class="bg-primary text-white col-shrink" v-print="printObj">
        <q-tooltip class="bg-white text-primary">列印</q-tooltip>  
      </q-btn>
      <!--
      <div v-if="!Receipt.b_delete && isFinance"><q-btn label="刪除" icon="delete" class="bg-negative text-white q-mx-sm" flat @click="deleteDialog = true"/></div>
      <div v-if="!Receipt.b_refund && isFinance"><q-btn label="退款" icon="currency_exchange" class="bg-negative text-white q-mx-sm" flat @click="refundDialog = true"/></div>
      -->
      <q-space/>
      <q-btn icon="close" flat dense class="bg-primary text-white col-shrink" v-close-popup align="right">
        <q-tooltip class="bg-white text-primary">關閉</q-tooltip>  
      </q-btn>
    </div>
    
    <div id="printVoucher" class="print-area bg-white items-start">
      <div class="row col-12 justify-center">
        <div class="row col-12 justify-center text-bold q-my-none highlight_1">長洲鄉事委員會青年綜合服務中心</div>
        <div class="row col-12 justify-center text-bold q-my-none highlight_3">CHEUNG CHAU RURAL COMMITTEE INTEGRATED YOUTH CENTRE</div>
        <div class="row col-12 justify-center text-bold highlight_2">領款書 VOUCHER</div>
      </div>
      <div v-if="props.type == '醫療'" class="row col-12 justify-left q-ml-lg">
        <div class="col-12 q-my-md highlight_2">商鋪/受款人：{{ props.data.username }}</div>
        <div class="col-12 q-my-md highlight_2">祈付：員工醫療（{{ qdate.formatDate(props.data.date, "YYYY年M月D日") }}）</div>
        <div class="col-12 q-my-md highlight_2">金額：{{ convertToChinese(props.data.amount) }}</div>
        <div class="col-6 q-my-md highlight_2">港幣：HK${{ props.data.amount }}</div>
        <div class="col-6 q-my-md highlight_2">支票號碼：</div>
        <div class="col-6 q-my-md highlight_2">中心主任：</div>
        <div class="col-6 q-my-md highlight_2">收款人/經手人：</div>
        <div class="col-6 q-my-md highlight_2">日期：</div>
        <div class="col-6 q-my-md highlight_2">日期：</div>
      </div>
      <div v-if="props.type == '預支'" class="row col-12 justify-left q-ml-lg">
        <div class="col-12 q-my-md highlight_2">商鋪/受款人：{{ props.data.recipient }}</div>
        <div class="col-12 q-my-md highlight_2">祈付：{{ props.data.c_act_code }}活動預支</div>
        <div class="col-12 q-my-md highlight_2">金額：{{ convertToChinese(props.data.amount) }}</div>
        <div class="col-6 q-my-md highlight_2">港幣：HK${{ props.data.amount }}</div>
        <div class="col-6 q-my-md highlight_2">支票號碼：</div>
        <div class="col-6 q-my-md highlight_2">中心主任：</div>
        <div class="col-6 q-my-md highlight_2">收款人/經手人：</div>
        <div class="col-6 q-my-md highlight_2">日期：</div>
        <div class="col-6 q-my-md highlight_2">日期：</div>
      </div>
      <div v-if="props.type == '餘款'" class="row col-12 justify-left q-ml-lg">
        <div class="col-12 q-my-md highlight_2">商鋪/受款人：{{ props.data.recipient }}</div>
        <div class="col-12 q-my-md highlight_2">祈付：{{ props.data.c_act_code }}活動餘款</div>
        <div class="col-12 q-my-md highlight_2">金額：{{ convertToChinese(props.data.amount) }}</div>
        <div class="col-6 q-my-md highlight_2">港幣：HK${{ props.data.amount }}</div>
        <div class="col-6 q-my-md highlight_2">支票號碼：</div>
        <div class="col-6 q-my-md highlight_2">中心主任：</div>
        <div class="col-6 q-my-md highlight_2">收款人/經手人：</div>
        <div class="col-6 q-my-md highlight_2">日期：</div>
        <div class="col-6 q-my-md highlight_2">日期：</div>
      </div>
    </div>
  </div>
</template>
  
<script setup>
import { computed, ref } from "vue"
import { date as qdate, useQuasar } from "quasar"
import { useStore } from "vuex";

// props
const props = defineProps({
  data: Object,
  type: {
    type: String,
    required: true,
  }
})

const $q = useQuasar()
const $store = useStore();
const isFinance = computed(() => $store.getters["userModule/getFinance"])

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
    if (thousand + tenThousand > 0) {
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
  @page {
    margin: 0;
    overflow: hidden;
    scale: 50%;
  }
  .print-area { 
    border: none;
  }
  .highlight_1 {
    font-size: 1.2rem;
  }

  .highlight_2 {
    font-size: 1rem;
  }

  .highlight_3 {
    font-size: 0.6rem;
  }
}
</style>