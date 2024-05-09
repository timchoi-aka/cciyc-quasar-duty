<template>
  <q-table
    :rows="account"
    :loading="loading"
    :columns="columns"
    :pagination="defaultPagination"
    color="primary"
    row-key="c_receipt_no"
    @row-click="
      (event, row, index) => emit('updateReceiptNumber', row.c_receipt_no)
    "
  />
</template>

<script setup>
import { useQuery } from "@vue/apollo-composable";
import { computed, ref, toRef } from "vue";
import { GET_MEMBER_RECEIPTS_BY_PK } from "src/graphQueries/Member/query";
import { date as qdate } from "quasar";

const props = defineProps({
  MemberID: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["updateReceiptNumber"]);

// variables
const c_mem_id = toRef(props, "MemberID");

// query
const { result, loading, refetch } = useQuery(
  GET_MEMBER_RECEIPTS_BY_PK,
  {
    c_mem_id: c_mem_id,
  },
  {
    enabled: computed(() => c_mem_id.value != null),
  }
);

// computed
const account = computed(
  () =>
    result.value?.Member_by_pk.MemberAccount.filter((x) => !x.b_delete) ?? []
);

// table settings
const columns = ref([
  {
    name: "d_create",
    label: "日期",
    field: "d_create",
    sortable: true,
    format: (val) => qdate.formatDate(val, "YYYY年M月D日"),
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
  {
    name: "i_prints",
    label: "列印次數",
    field: "i_prints",
  },
]);

const defaultPagination = ref({
  rowsPerPage: 10,
  sortBy: "d_create",
  descending: true,
});
</script>
