<template>
  <q-page class="row" style="margin-top: 60px;">
    <!-- loading dialog -->
    <q-dialog v-model="waitingAsync" position="bottom">
      <LoadingDialog message="處理中"/>
    </q-dialog>

    <!-- rowDetail modal -->
    <q-dialog v-if="$q.screen.lt.md"
      v-model="detailModal"
      persistent
      maximized
      full-width
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <Receipt :c_receipt_no="showReceiptNo"/>
    </q-dialog>

    <q-dialog v-else
      v-model="detailModal"
      persistent
      full-height
      transition-show="slide-up"
      transition-hide="slide-down"
      class="q-pa-none"
    >
      <q-card style="min-width: 70vw; width: 70vw; max-width: 70vw;">
        <Receipt :c_receipt_no="showReceiptNo"/>
      </q-card>
    </q-dialog>
    
    <!-- search column-->
    <div class="col-auto" style="border: 1px solid;">
      <q-form
        @submit="submitSearch"
        @reset="clearSearch"
      >
      <div class="row">
        <q-btn type="submit" class="col-6 bg-secondary text-white" square icon="search" label="搜尋" flat @click="submitSearch"/>
        <q-btn type="reset" class="col-6 bg-negative text-white" square icon="restart_alt" label="重設" flat @click="clearSearch"/>
      </div>
      <div class="column">
        <div class="q-mx-sm"><q-input clearable label="收據編號" v-model="search.c_receipt_no"/></div>
        <div class="q-mx-sm"><MemberSelection label="付款人會員編號" v-model="search.c_mem_id"/></div>
        <div class="q-mx-sm"><q-select clearable label="種類" :options="receiptTypeOptions" v-model="search.i_receipt_type"/></div>
        <div class="q-mx-sm"><q-select label="收據狀態" :options="statusOptions" v-model="search.status"/></div>
        <div class="q-mx-sm"><DateComponent label="開始日期" v-model="search.startDate"/></div>
        <div class="q-mx-sm"><DateComponent label="結束日期" v-model="search.endDate"/></div>
      </div>
      </q-form>
    </div>
   
    <q-table
      class="col-grow"
      dense
      flat
      :rows="ReceiptData"
      :columns="receiptListColumns"
      :pagination="defaultPagination"
      color="primary"
      row-key="c_receipt_no"
      :loading="loading"
      binary-state-sort
      @row-click="rowDetail"
    >
    <!-- 
      <template v-slot:top-right>
        <q-btn
          color="primary"
          icon-right="archive"
          label="匯出Excel"
          no-caps
          @click="exportExcel(ReceiptData, receiptListColumns, '收據' + search.startDate + '-' + search.endDate)"
        />
      </template>
    -->
      <!-- loading -->
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>
      
      <template v-slot:body-cell-c_status="props">
        <q-td :props="props">
          <q-icon v-if="props.row.b_refund" size="sm" color="negative" name="currency_exchange">
            <q-tooltip>已退款</q-tooltip>
          </q-icon>
          <q-icon v-if="props.row.b_delete" size="sm" color="negative" name="delete">
            <q-tooltip>已刪除</q-tooltip>
          </q-icon>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { date as qdate, is, exportFile, useQuasar } from "quasar";
import { useSubscription } from "@vue/apollo-composable"
import LoadingDialog from "components/LoadingDialog.vue"
import PrintReceipt from "components/Account/PrintReceipt.vue"
import Receipt from "components/Account/Receipt.vue"
import { gql } from "graphql-tag"
import DateComponent from "src/components/Basic/DateComponent.vue";
import MemberSelection from "src/components/Member/MemberSelection.vue"
import Excel from "src/lib/exportExcel"

// save current module
const $store = useStore();
const $q = useQuasar()
// $q.localStorage.set("module", "account");
const receiptTypeOptions = 
  [
    { value: 1, label: '會員' },
    { value: 2, label: '活動' },
    { value: 3, label: '食堂' } ,
    { value: 4, label: '洗衣' },
    { value: 5, label: '罰款' },
    { value: 6, label: '捐款' },
    { value: 7, label: '雜項' },
    { value: 51, label: '會員退款' },
    { value: 52, label: '活動退款' },
    { value: 53, label: '食堂退款' },
    { value: 54, label: '洗衣退款' },
    { value: 55, label: '罰款退款' },
    { value: 56, label: '捐款退款' },
    { value: 57, label: '雜項退款' }
  ]

// variables
const awaitServerResponse = ref(0)
const detailModal = ref(false)
const printReceiptModal = ref(false)
const printReceiptMember = ref("")
const showReceiptNo = ref("")

const statusOptions = ref([
  {
    value: "normal",
    label: "正常收據"
  },
  { value: "delete",
    label: "刪除收據",
  },
  {
    value: "refund",
    label: "退款收據",
  },
  {
    value: "all",
    label: "全部",
  },
])

const search = ref({
  c_receipt_no: "",
  c_mem_id: "",
  i_receipt_type: "",
  status: statusOptions.value[0],
  startDate: null,
  endDate: null,
  // startDate: null,
  // endDate: null,
})

const searchCondition = ref({
  condition: {
    c_receipt_no: {"_eq": "xxxx-xxxx"}
  }
})

// table parameters
const defaultPagination = ref({
  rowsPerPage: 30,
  sortBy: "c_receipt_no",
  descending: true,
})

const receiptListColumns = ref([
  {
    name: "c_status",
    label: "狀態",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_receipt_no",
    label: "收據",
    field: "c_receipt_no",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "d_clear",
    label: "日期",
    field: "d_clear",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    sortable: true,
    format: (val) => qdate.formatDate(val, "YYYY年M月D日")
  },
  {
    name: "i_receipt_type",
    label: "種類",
    field: "i_receipt_type",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => receiptTypeOptions[receiptTypeOptions.findIndex((x) => x.value == val)].label
  },
  {
    name: "c_type",
    label: "會計類別",
    field: "c_type",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    sortable: true,
  },
  {
    name: "c_name",
    label: "付款人",
    field: "c_name",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_desc",
    label: "收費項目",
    field: "c_desc",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "u_price_after_discount",
    label: "金額(HKD)",
    field: "u_price_after_discount",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
])

 // query - load graphql subscription on account list
 const { result, loading, } = useSubscription(gql`
 subscription getAllReceipt ($condition: tbl_account_bool_exp = {c_receipt_no: {_eq: ""}}) {
  tbl_account(order_by: {c_receipt_no: desc}, where: $condition) {
    c_receipt_no
    b_OtherIncome
    b_refund
    c_act_code
    c_desc
    c_mem_id
    c_name
    c_type
    d_clear
    d_create
    i_receipt_type
    u_price_after_discount
    b_delete
  }
}`, searchCondition.value);
      
// computed  
const waitingAsync = computed(() => awaitServerResponse.value > 0)
const uid = computed(() => $store.getters["userModule/getUID"])
const ReceiptData = computed(() => result.value?.tbl_account??[])

// function
function rowDetail(evt, row, index) {
  if (evt.target.nodeName === 'TD') {
    detailModal.value = true;
    showReceiptNo.value = row.c_receipt_no.trim();
  }
}

function clearSearch() {
  search.value = {
    c_receipt_no: "",
    c_mem_id: "",
    i_receipt_type: "",
    status: statusOptions.value[0],
    startDate: null,
    endDate: null,
  }
  searchCondition.value.condition = {
    c_receipt_no: {"_eq": "xxxx-xxxx"}
  }
  // refetch()
}

function submitSearch() {
  searchCondition.value.condition = {
    "_and": []
  }
  // if (search.value.c_act_name) searchCondition.value.condition.c_act_name = {"_like" : "%"+search.value.c_act_name+"%"} 
  if (search.value.c_receipt_no) searchCondition.value.condition["_and"].push({c_receipt_no: {"_eq" : search.value.c_receipt_no}})
  if (search.value.c_mem_id) searchCondition.value.condition["_and"].push({c_mem_id: {"_eq" : search.value.c_mem_id}})
  if (search.value.i_receipt_type && is.number(search.value.i_receipt_type.value)) searchCondition.value.condition["_and"].push({i_receipt_type: {"_eq" : search.value.i_receipt_type.value}})
  
  switch (search.value.status.value) {
    case "refund":
      searchCondition.value.condition["_and"].push({b_refund: {"_eq" : true}})
      break;
    case "delete":
      searchCondition.value.condition["_and"].push({b_delete: {"_eq" : true}})
      break;
    case "normal":
    case "all":
    default:
      break;    
  }
  if (search.value.startDate) {
    searchCondition.value.condition["_and"].push(
      {d_create: {"_gte" : qdate.formatDate(qdate.startOfDate(qdate.extractDate(search.value.startDate, "YYYY/MM/DD"), "day"), "YYYY-MM-DDTHH:mm:ss")}}
    )
  }
  
  if (search.value.endDate) {
    searchCondition.value.condition["_and"].push(
      {d_create: {"_lte" : qdate.formatDate(qdate.endOfDate(qdate.extractDate(search.value.endDate, "YYYY/MM/DD"), "day"), "YYYY-MM-DDTHH:mm:ss")}}
    )
  }
}

// functions
function exportExcel(datasource, columns, filename) {
  let content = Excel.jsonToXLS(datasource, columns)
  
  const status = exportFile(
    filename + '.xls',
    content,
    'text/xls'
  )

  if (status !== true) {
    $q.notify({
      message: '瀏覽器阻止下載檔案...',
      color: 'negative',
      icon: 'warning'
    })
  }  
}
</script>
