<template>
  <q-page class="row" style="margin-top: 60px;">
    <!-- loading dialog -->
    <LoadingDialog :model-value="loading? 1: 0" message="處理中"/>

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
      style="min-width: 40vw; width: 40vw; max-width: 40vw;"
      transition-show="slide-up"
      transition-hide="slide-down"
      class="q-pa-none"
    >
      <Receipt :c_receipt_no="showReceiptNo"/>
    </q-dialog>

    <!-- search column-->
    <div class="col-auto" style="border: 1px solid;">
      <q-form
        @submit="refetch"
        @reset="clearSearch"
      >
      <div class="row">
        <q-btn type="submit" class="col-6 bg-secondary text-white" square icon="search" label="搜尋" flat/>
        <q-btn type="reset" class="col-6 bg-negative text-white" square icon="restart_alt" label="重設" flat @click="clearSearch"/>
      </div>
      <div class="column">
        <div class="q-mx-sm"><q-input clearable label="收據編號" v-model="search_c_receipt_no"/></div>
        <div class="q-mx-sm"><MemberSelection label="付款人會員編號" v-model="search_c_mem_id"/></div>
        <div class="q-mx-sm"><q-select clearable label="種類" :options="receiptTypeOptions" v-model="search_i_receipt_type"/></div>
        <div class="q-mx-sm"><q-select label="收據狀態" :options="statusOptions" v-model="search_status"/></div>
        <div class="q-mx-sm"><DateComponent label="開始日期" v-model="search_startDate"/></div>
        <div class="q-mx-sm"><DateComponent label="結束日期" v-model="search_endDate"/></div>
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
import { date as qdate, useQuasar } from "quasar";
import LoadingDialog from "components/LoadingDialog.vue"
import Receipt from "components/Account/Receipt.vue"
import DateComponent from "src/components/Basic/DateComponent.vue";
import MemberSelection from "src/components/Member/MemberSelection.vue"
import { useAccountProvider } from "src/providers/account";

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
    { value: 57, label: '雜項退款' },
    { value: 20, label: '活動(重覆)' }
  ]

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

// variables
const detailModal = ref(false)
const showReceiptNo = ref("")

// search parameters
const search_c_receipt_no = ref("")
const search_c_mem_id = ref("")
const search_i_receipt_type = ref("")
const search_status = ref(statusOptions.value[0])
const search_startDate = ref(null)
const search_endDate = ref(null)


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

// fetch data
const { result, refetch, loading } = useAccountProvider({
  c_receipt_no: search_c_receipt_no,
  c_mem_id: search_c_mem_id,
  i_receipt_type: search_i_receipt_type,
  status: search_status,
  startDate: search_startDate,
  endDate: search_endDate,
})

// computed
const uid = computed(() => $store.getters["userModule/getUID"])
const ReceiptData = computed(() => result.value? result.value.tbl_account: [])

// function
function rowDetail(evt, row, index) {
  if (evt.target.nodeName === 'TD') {
    detailModal.value = true;
    showReceiptNo.value = row.c_receipt_no.trim();
  }
}

function clearSearch() {
  search_c_receipt_no.value = null
  search_c_mem_id.value = null
  search_i_receipt_type.value = null
  search_status.value = statusOptions.value[0]
  search_startDate.value = null
  search_endDate.value = null
  refetch()
}
</script>
