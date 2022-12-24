<template>
  <div class="row">
    <div :class="[$q.screen.lt.md? 'col-12' : 'col-7']">
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
        @row-click="(event, row, index) => ReceiptNo = row.c_receipt_no"
        />
    </div>
    <div v-if="ReceiptNo" :class="['q-ma-md-none', 'q-pa-md-none', 'bg-grey-3', 'justify-center', $q.screen.lt.md? 'col-12': 'col-5']">
      <Receipt :c_receipt_no="ReceiptNo"/>
    </div>
  </div>
</template>

<script setup>
import { useQuery } from "@vue/apollo-composable";
import { computed, ref } from "vue"
import { GET_MEMBER_RECEIPTS_BY_PK } from "src/graphQueries/Member/query"
import { date as qdate, useQuasar } from "quasar"
import Receipt from "components/Account/Receipt.vue"
import { useStore } from "vuex";

// props
const props = defineProps({
  MemberID: String
})

// variables
const $q = useQuasar()
const $store = useStore();
const username = computed(() => $store.getters["userModule/getUsername"])
const userProfileLogout = () => $store.dispatch("userModule/logout")
const ReceiptNo = ref("")


// query
const {result, loading, refetch} = useQuery(GET_MEMBER_RECEIPTS_BY_PK, {
  "c_mem_id": props.MemberID
})

// computed
const account = computed(() => result.value?.Member_by_pk.MemberAccount??[])

// table settings
const columns = ref([
  {
    name: "d_create",
    label: "日期",
    field: "d_create",
    sortable: true,
    format: (val) => qdate.formatDate(val, "YYYY年M月D日"),
    style: "font-size: 1rem",
    headerStyle: "font-size: 1rem"
  },
  {
    name: "c_desc",
    label: "項目",
    field: "c_desc",
    style: "font-size: 1rem",
    headerStyle: "font-size: 1rem"
  },
  {
    name: "c_receipt_no",
    label: "收據號碼",
    field: "c_receipt_no",
    style: "font-size: 1rem",
    headerStyle: "font-size: 1rem"
  },
  {
    name: "u_price_after_discount",
    label: "費用",
    field: "u_price_after_discount",
    style: "font-size: 1rem",
    headerStyle: "font-size: 1rem"
  },
  {
    name: "i_prints",
    label: "列印次數",
    field: "i_prints",
    style: "font-size: 1rem",
    headerStyle: "font-size: 1rem"
  },
])

const defaultPagination = ref({
  rowsPerPage: 10,
  sortBy: "d_create",
  descending: true,
})

// UI functions
function notifyClientError(error) {
  userProfileLogout()
    .then(() => {
      $q.notify({ message: "系統錯誤，請重新登入." });
    })
    .catch((error) => console.log("error", error));
}
</script>