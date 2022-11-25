<template>
  <div class="row">
    <div class="col-7">
      <div class="bg-primary row col-12" style="min-height: 50px; max-height: 50px;">
          <q-btn class="bg-primary text-white col-shrink q-mx-md" dense flat icon="close" v-close-popup>
            <q-tooltip class="bg-white text-primary">關閉</q-tooltip>
          </q-btn>
        </div>
      <q-table
        :rows="account"
        :loading="loading"
        :columns="columns"
        :pagination="defaultPagination"
        color="primary"
        row-key="c_receipt_no"
        class="fit"
        @row-click="(event, row, index) => setReceipt(row)"
        />
    </div>
    <div v-if="Object.keys(modalObject).length > 0" class="row q-ma-md-none q-pa-md-none col-5 bg-grey-3 justify-center">
      <div class="bg-primary row col-12" style="min-height: 50px; max-height: 50px;">
        <q-btn icon="print" flat class="bg-primary text-white col-shrink" v-print="printObj">
          <q-tooltip class="bg-white text-primary">列印</q-tooltip>  
        </q-btn>
        <q-space/>
        <q-btn class="bg-primary text-white col-shrink" dense flat icon="close" v-close-popup>
          <q-tooltip class="bg-white text-primary">關閉</q-tooltip>
        </q-btn>
      </div>
      
      <div id="printMe" class="row col-12 justify-center bg-white self-start print-area">
        <div class="row self-center text-bold q-my-none highlight_1">長洲鄉事委員會青年綜合服務中心</div>
        <!-- <div class="column q-my-none"><div class="self-center q-my-none" style="font-size: 1px;">CHEUNG CHAU RURAL COMMITTEE</div><div class="self-center q-my-none">INTEGRATED YOUTH CENTRE</div></div>-->
        <div class="q-my-none" style="font-size: 1px important!">CHEUNG CHAU RURAL COMMITTEE INTEGRATED YOUTH CENTRE</div>
        <div class="row self-center q-my-none">
          <span class="q-mr-xs">地址 Address: 長洲東灣道 Tung Wan Road, Cheung Chau</span>
          <span>電話 Tel: 2981 1484</span>
        </div>
        <div class="row col-12 justify-center text-bold highlight_2">正式收據 OFFICIAL RECEIPT</div>
        <div class="row col-12 justify-center highlight_2">收據編號 Receipt No: {{modalObject.c_receipt_no}}</div>
        <div class="row col-12 justify-center"><span class="q-mr-md highlight_2">日期 Date: {{qdate.formatDate(modalObject.d_create, "DD/MM/YYYY")}}</span><span class="text-right self-end">Copy: {{modalObject.i_prints}}</span></div>
        <div class="row col-12">
          <span class="col-4 q-ml-md self-center">
            <div class="highlight_2">茲收到</div>
            <div>Received From</div>
          </span>
          <span class="col-7 self-center highlight_2">{{modalObject.c_name}}</span>
        </div>
        <div class="row col-12">
          <span class="col-4 q-ml-md">
            <div class="highlight_2">港幣</div>
            <div>the sum of HK dollars</div>
          </span>
          <span class="col-7 self-center highlight_2">HK${{modalObject.u_price_after_discount.toFixed(2)}}</span>
        </div>
        <div class="row col-12">
          <span class="col-4 q-ml-md">
            <div class="highlight_2">支付</div>
            <div>being payment for</div>
          </span>
          <span class="col-7 self-center highlight_2">{{modalObject.c_desc}}</span>
        </div>
        <div class="row col-12">
          <span class="col-4 q-ml-md">
            <div class="highlight_2">經手人</div>
            <div>issued by</div>
          </span>
          <span class="col-7 self-center highlight_2">{{modalObject.c_user_id}}</span>
        </div>
        <div class="row col-12 justify-center q-px-md highlight_3">收據字體會退色，若需要保留，請自行影印。</div>
        <div class="row col-12 q-px-md wrap">The receipt will eventually fade out.  Please make a photocopy for a more lasting document.</div>
        <div class="row col-12 q-px-md highlight_2" v-html="showRemark(modalObject.m_remark)"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useQuery } from "@vue/apollo-composable";
import { computed, ref } from "vue"
import { GET_MEMBER_RECEIPTS_BY_PK } from "src/graphQueries/Member/query"
import { date as qdate } from "quasar"

let modalObject = ref({})
let account = ref([])

const props = defineProps({
  MemberID: String
})

const {result, loading} = useQuery(GET_MEMBER_RECEIPTS_BY_PK, {
  "c_mem_id": props.MemberID
})

account = computed(() => result.value?.Member_by_pk.MemberAccount??[])

const printObj = {
  id: "printMe",
  preview: true,
  previewTitle: "列印預覽", // The title of the preview window. The default is 打印预览
  popTitle: "收據",
}

const columns = [
  {
    name: "d_create",
    label: "日期",
    field: "d_create",
    sortable: true,
    format: (val) => qdate.formatDate(val, "YYYY年M月D日")
  },
  {
    name: "c_desc",
    label: "項目",
    field: "c_desc",
  },
  {
    name: "c_receipt_no",
    label: "收據號碼",
    field: "c_receipt_no",
  },
  {
    name: "u_price_after_discount",
    label: "費用",
    field: "u_price_after_discount",
  },
]

const defaultPagination = {
  rowsPerPage: 5,
  sortBy: "d_create",
  descending: true,
}

function setReceipt(row) {
  modalObject.value = row
}

function showRemark(rem) {
  return rem ? rem.replaceAll("\r\n", "<br/>").replaceAll("\r", "<br/>").replaceAll("\n", "<br/>") : ""
}

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
    width: 136mm; 
    height: 160mm;
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
    font-size: 0.8rem;
  }
}

@media print {
  @page {
    size: 68mm 120mm portrait;
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
    font-size: 0.8rem;
  }
}
</style>