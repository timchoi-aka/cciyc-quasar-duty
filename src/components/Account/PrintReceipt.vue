<template>
  <div class="column">
    <q-table
      :rows="account"
      :loading="loading"
      :columns="columns"
      :pagination="defaultPagination"
      color="primary"
      row-key="c_receipt_no"
      class="col-4"
      @row-click="(event, row, index) => setReceipt(row)"
      />
    
    <div v-if="Object.keys(modalObject).length > 0" class="q-ma-md-none q-pa-md-none col-8" style="font-size: 0.1rem;">
      <div class="bg-primary row">
        <q-btn icon="print" flat class="bg-primary text-white col-shrink" v-print="printObj">
          <q-tooltip class="bg-white text-primary">列印</q-tooltip>  
        </q-btn>
        <q-space/>
        <q-btn class="bg-primary text-white col-shrink" dense flat icon="close" v-close-popup>
          <q-tooltip class="bg-white text-primary">關閉</q-tooltip>
        </q-btn>
      </div>
      
      <div id="printMe" class="row wrap justify-center q-my-none bg-white" style="width: 80mm; margin: 0; overflow: hidden;">
        <div class="row col-12"><span class="text-bold">長洲鄉事委員會青年綜合服務中心</span></div>
        <div class="row col-12">CHEUNG CHAU RURAL COMMITTEE INTEGRATED YOUTH CENTRE</div>
        <div class="row col-12">地址 Address: 長洲東灣道 Tung Wan Road, Cheung Chau</div>
        <div class="row col-12"><span class="q-mx-sm">電話 Tel: 2981 1484</span><span class="q-mx-sm">yc@cciyc.com</span><span class="q-mx-sm">www.cciyc.com</span></div>
        <div class="row col-12"><span class="text-bold">正式收據 OFFICIAL RECEIPT</span></div>
        <div class="row col-12"><span class="text-center"><div>收據編號</div><div>Receipt No:</div></span><span class="col-shrink self-center">{{modalObject.c_receipt_no}}</span></div>
        <div class="row col-12"><span class="q-mx-lg text-center">日期 Date: {{qdate.formatDate(modalObject.d_create, "DD/MM/YYYY")}}</span><span class="q-mx-lg text-center">Copy: {{modalObject.i_prints}}</span></div>
        <div class="row col-12">
          <span class="col-shrink">
            <div>茲收到</div>
            <div>Received From</div>
          </span>
          <span class="col-shrink self-center">{{modalObject.c_name}}</span>
        </div>
        <div class="row col-12">
          <span class="col-shrink">
            <div>港幣</div>
            <div>the sum of HK dollars</div>
          </span>
          <span class="col-shrink self-center">{{modalObject.u_price_after_discount}}</span>
        </div>
        <div class="row col-12">
          <span class="col-shrink">
            <div>支付</div>
            <div>being payment for</div>
          </span>
          <span class="col-shrink self-center">{{modalObject.c_desc}}</span>
        </div>
        <div class="row col-12">
          <span class="col-shrink">
            <div>經手人</div>
            <div>issued by</div>
          </span>
          <span class="col-shrink self-center">{{modalObject.c_user_id}}</span>
        </div>
        <div class="row col-12">收據字體會退色，若需要保留，請自行影印。</div>
        <div class="row col-12 wrap">The receipt will eventually fade out.  Please make a photocopy for a more lasting document.</div>
        <div class="row col-12" v-html="showRemark(modalObject.m_remark)"/>
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
/*
.receipt {
  width: 30mm;
  height: 51mm;
}

@media print {
  @page {
    size: 30mm 50.8mm portrait;
    margin: 1mm;
    zoom: 30%;
  }
} */
</style>