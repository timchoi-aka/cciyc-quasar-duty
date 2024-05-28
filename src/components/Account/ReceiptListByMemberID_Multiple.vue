<template>
  <div>
    <q-dialog v-model="viewEventModal" persistent full-width transition-show="slide-up" transition-hide="slide-down"
      class="q-pa-none">
      <EventDetail :EventID="viewEventID" @hide-component="viewEventModal = false" />
    </q-dialog>
    <q-table :rows="tableData" :loading="loading" :columns="columns" :pagination="defaultPagination" color="primary"
      row-key="id" selection="multiple" v-model:selected="selected">
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th>
            <q-checkbox v-if="account.length" v-model="props.selected" dense size="sm" />
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

          <q-td v-for="col in props.cols" :key="col.name" :props="props"
            @click="displayEventModel(props.row.c_act_code)">
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
import { useMemoProvider } from "src/providers/memo";
import EventDetail from "src/components/Event/EventDetail.vue";

const viewEventModal = ref(false);
const viewEventID = ref(null);
const props = defineProps({
  MemberID: {
    type: String,
    required: false,
  },
  selectedReceipts: {
    type: Array,
    required: false,
  },
  selectedMemo: {
    type: Array,
    required: false,
  },
});

const emit = defineEmits(["updateReceiptNumber", "updateMemoID"]);
const selected = ref([]);
const isInitializedReceipt = ref(false);
const isInitializedMemo = ref(false);
// variables
const c_mem_id = toRef(props, "MemberID");
const selectedReceipts = toRef(props, "selectedReceipts");
const selectedMemo = toRef(props, "selectedMemo");
const staffNameMapping = {
  lswu: "胡小姐",
  ywho: "何先生",
  mwchan: "陳小姐",
  lsfung: "馮小姐",
  pswong: "黃小姐",
  kyma: "馬姑娘",
  hlng: "吳先生",
  myli: "李姑娘",
};

watch(selected, (val) => {
  emit(
    "updateReceiptNumber",
    Array.from(
      new Set(
        val.filter((x) => x.c_receipt_no != null).map((x) => x.c_receipt_no)
      )
    )
  );
  emit(
    "updateMemoID",
    Array.from(
      new Set(val.filter((x) => x.c_receipt_no == null).map((x) => x.id))
    )
  );
});

watch(selectedReceipts, (val) => {
  if (tableData.value.length === 0) return;
  if (isInitializedReceipt.value) return;
  val.forEach((v) => {
    let i = tableData.value.findIndex((x) => x.c_receipt_no === v);
    if (i >= 0) {
      selected.value.push(tableData.value[i]);
    }
  });
  isInitializedReceipt.value = true;
});

watch(selectedMemo, (val) => {
  if (tableData.value.length === 0) return;
  if (isInitializedMemo.value) return;
  val.forEach((v) => {
    let i = tableData.value.findIndex((x) => x.id === v);
    if (i >= 0) {
      selected.value.push(tableData.value[i]);
    }
  });
  isInitializedMemo.value = true;
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

const { result: memoResult } = useMemoProvider({
  c_mem_id: c_mem_id,
});
// computed
const account = computed(
  () =>
    result.value?.Member_by_pk.MemberAccount.filter((x) => !x.b_delete) ?? []
);

const memo = computed(() => memoResult.value?.tbl_act_reg ?? []);
const tableData = computed(() => {
  let res = [];
  account.value.forEach((v) => {
    res.push({
      id: v.c_receipt_no,
      ...v,
    });
  });
  memo.value.forEach((v) => {
    res.push({
      id: v.ID,
      c_act_code: v.c_act_code,
      d_create: v.d_reg,
      c_desc: v.EventRegistration_to_Event.c_act_name,
      c_receipt_no: null,
      c_user_id: v.c_user_id,
      u_price_after_discount: 0,
      m_remark: v.EventRegistration_to_Event.m_remark,
    });
  });
  return res;
});

watch(tableData, (val) => {
  if (val.length > 0) {
    selected.value = [];
    selectedReceipts.value.forEach((v) => {
      let i = val.findIndex((x) => x.c_receipt_no === v);
      if (i >= 0) {
        selected.value.push(val[i]);
      }
    });
    selectedMemo.value.forEach((v) => {
      let i = val.findIndex((x) => x.id === v);
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
    name: "c_act_code",
    label: "活動編號",
    field: "c_act_code",
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
    name: "c_user_id",
    label: "經手人",
    field: "c_user_id",
    format: (val) => (staffNameMapping[val] ? staffNameMapping[val] : val),
  },
  {
    name: "u_price_after_discount",
    label: "費用",
    field: "u_price_after_discount",
  },
]);

const defaultPagination = ref({
  rowsPerPage: 10,
  sortBy: "d_create",
  descending: true,
});

function displayEventModel(c_act_code) {
  if (c_act_code) {
    viewEventID.value = c_act_code;
    viewEventModal.value = true;
  }
}

</script>
