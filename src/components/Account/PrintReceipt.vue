<template>
  <div class="row">
    <q-table
      :rows="account"
      :loading="loading"
      :columns="columns"
      :pagination="defaultPagination"
      color="primary"
      row-key="c_receipt_no"
      class="col-9"
      @row-click="(event, row, index) => setReceipt(row)"
      />
    
    <div v-if="Object.keys(modalObject).length > 0" class="row q-ma-md-none q-pa-md-none col-3 bg-grey-3 justify-center">
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
        <div class="row self-center text-bold q-my-none">長洲鄉事委員會青年綜合服務中心</div>
        <div class="column q-my-none"><div class="self-center q-my-none">CHEUNG CHAU RURAL COMMITTEE</div><div class="self-center q-my-none">INTEGRATED YOUTH CENTRE</div></div>
        <div class="row self-center q-my-none">
          <div class="q-mr-xs">
            <div>地址:</div>
            <div>Address:</div>
          </div>
          <div>
            <div>長洲東灣道</div>
            <div>Tung Wan Road, Cheung Chau</div>
          </div>
        </div>
        <div class="row"><span class="q-mr-xs"><q-icon name="phone"/>2981 1484</span><span class="q-mr-xs"><q-icon name="email"/>yc@cciyc.com</span><span><q-icon name="public"/>cciyc.com</span></div>
        <div class="row self-center text-bold">正式收據 OFFICIAL RECEIPT</div>
        <div class="row text-left">收據編號 Receipt No: {{modalObject.c_receipt_no}}</div>
        <div class="row"><span class="q-mx-lg text-center">日期 Date: {{qdate.formatDate(modalObject.d_create, "DD/MM/YYYY")}}</span><span class="q-mx-lg text-center">Copy: {{modalObject.i_prints}}</span></div>
        <div class="row col-12">
          <span class="col-4 q-ml-md">
            <div>茲收到</div>
            <div>Received From</div>
          </span>
          <span class="col-7 self-center">{{modalObject.c_name}}</span>
        </div>
        <div class="row col-12">
          <span class="col-6 q-ml-md">
            <div>港幣</div>
            <div>the sum of HK dollars</div>
          </span>
          <span class="col-5 self-center">{{modalObject.u_price_after_discount}}</span>
        </div>
        <div class="row col-12">
          <span class="col-5 q-ml-md">
            <div>支付</div>
            <div>being payment for</div>
          </span>
          <span class="col-6 self-center">{{modalObject.c_desc}}</span>
        </div>
        <div class="row col-12">
          <span class="col-3 q-ml-md">
            <div>經手人</div>
            <div>issued by</div>
          </span>
          <span class="col-8 self-center">{{modalObject.c_user_id}}</span>
        </div>
        <div class="row col-12 q-ml-md">收據字體會退色，若需要保留，請自行影印。</div>
        <div class="row col-12 wrap">The receipt will eventually fade out.  Please make a photocopy for a more lasting document.</div>
        <div class="row col-12 q-ml-md" v-html="showRemark(modalObject.m_remark)"/>
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

<style>
@media screen {
  .print-area {
    width: 80mm; 
    margin: 0; 
    overflow: hidden; 
    border: 1px solid
  }
}

@media print {
  @page {
    size: 80mm 140mm portrait;
    margin: 0;
  }
  .print-area { 
    overflow: hidden;
    border: none;
  }
}
</style>