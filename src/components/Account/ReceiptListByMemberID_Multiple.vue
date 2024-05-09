<template>
  <div>
    <q-table
      :rows="account"
      :loading="loading"
      :columns="columns"
      :pagination="defaultPagination"
      color="primary"
      row-key="c_receipt_no"
      selection="multiple"
      v-model:selected="selected"
    >
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th>
            <q-checkbox
              v-if="account.length"
              v-model="props.selected"
              dense
              size="sm"
            />
          </q-th>

          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td>
            <q-checkbox v-model="props.selected" dense size="sm" />
          </q-td>

          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.value }}
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { useQuery } from "@vue/apollo-composable";
import { computed, ref, toRef, watch } from "vue";
import { GET_MEMBER_RECEIPTS_BY_PK } from "src/graphQueries/Member/query";
import { date as qdate } from "quasar";

const props = defineProps({
  MemberID: {
    type: String,
    required: false,
  },
  selectedReceipts: {
    type: Array,
    required: false,
  },
});

const emit = defineEmits(["updateReceiptNumber"]);
const selected = ref([]);
const isInitialized = ref(false);
// variables
const c_mem_id = toRef(props, "MemberID");
const selectedReceipts = toRef(props, "selectedReceipts");

watch(selected, (val) => {
  emit(
    "updateReceiptNumber",
    Array.from(new Set(val.map((x) => x.c_receipt_no)))
  );
});

watch(selectedReceipts, (val) => {
  if (account.value.length === 0) return;
  if (isInitialized.value) return;
  val.forEach((v) => {
    let i = account.value.findIndex((x) => x.c_receipt_no === v);
    if (i >= 0) {
      selected.value.push(account.value[i]);
    }
  });
  isInitialized.value = true;
});

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

watch(account, (val) => {
  if (val.length > 0) {
    selected.value = [];
    props.selectedReceipts.forEach((v) => {
      let i = val.findIndex((x) => x.c_receipt_no === v);
      if (i >= 0) {
        selected.value.push(val[i]);
      }
    });
  }
});

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
