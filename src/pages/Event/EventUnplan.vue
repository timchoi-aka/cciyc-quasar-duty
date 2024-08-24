<template>
  <LoadingDialog :model-value="loading" message="儲存資料中" />
  <q-table
    class="q-mt-sm col-12"
    flat
    bordered
    @row-click="showDetail"
    row-key="c_act_code"
    :rows="tableData"
    :selection="isCenterIC ? 'multiple' : 'none'"
    v-model:selected="selectedRow"
    :pagination="pagination"
    :columns="CoreEventColumns"
  >
    <!-- top row -->
    <template v-slot:top v-if="isCenterIC">
      <q-btn
        v-if="selectedRow.length > 0"
        label="豁免計劃檢討"
        class="bg-primary text-white"
        flat
        @click="markHardcopy"
      />
    </template>

    <!-- applicationInProcess template -->
    <template v-slot:body-cell-plan_submit="props">
      <q-td :props="props">
        <q-icon class="text-positive" v-if="props.value" name="check" />
        <q-icon v-else name="cancel" class="text-negative" />
      </q-td>
    </template>
    <template v-slot:body-cell-eval_submit="props">
      <q-td :props="props">
        <q-icon class="text-positive" v-if="props.value" name="check" />
        <q-icon v-else name="cancel" class="text-negative" />
      </q-td>
    </template>
    <template v-slot:body-cell-isRejected="props">
      <q-td :props="props">
        <q-icon class="text-red" v-if="props.value" name="warning" />
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { computed, ref } from "vue";
import { useMutation } from "@vue/apollo-composable";
import { useStore } from "vuex";
import LoadingDialog from "components/LoadingDialog.vue";
import { gql } from "graphql-tag";
import { date, useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { useEventPlanEvalProvider } from "src/providers/eventPlanEval";

const $q = useQuasar();
const router = useRouter();
const $store = useStore();
const loading = ref(0);
const username = computed(() => $store.getters["userModule/getUsername"]);
const isCenterIC = computed(() => $store.getters["userModule/getCenterIC"]);
const selectedRow = ref([]);

const { result: CoreEventList } = useEventPlanEvalProvider({
  c_respon: isCenterIC ? ref(null) : username,
});

const pagination = ref({
  rowsPerPage: 20,
  descending: true,
  sortBy: "c_act_code",
});

const CoreEventColumns = ref([
  {
    name: "c_act_code",
    label: "編號",
    field: "c_act_code",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    sortable: true,
  },
  {
    name: "c_act_name",
    label: "名稱",
    field: "c_act_name",
    style: "border-top: 1px solid; text-align: center; width: 5%;",
    headerStyle: "text-align: center; width: 5%;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_nature",
    label: "性質",
    field: "c_nature",
    style: "border-top: 1px solid; text-align: center; width: 5%;",
    headerStyle: "text-align: center; width: 5%;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_respon",
    label: "負責人",
    field: "c_respon",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    sortable: true,
  },
  {
    name: "d_date_from",
    label: "開始",
    field: "d_date_from",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    sortable: true,
  },
  {
    name: "d_date_to",
    label: "結束",
    field: "d_date_to",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    sortable: true,
  },
]);

const {
  mutate: markHardCopyMutation,
  onDone: markHardCopyMutation_Completed,
  onError: markHardCopyMutation_Error,
} = useMutation(gql`
  mutation update_HTX_Event_MarkHardcopy(
    $logObject: Log_insert_input! = {}
    $c_act_code: [String!] = ""
  ) {
    update_HTX_Event(
      where: { c_act_code: { _in: $c_act_code } }
      _set: { b_hardcopy: true }
    ) {
      affected_rows
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }
`);

const tableData = computed(() => {
  if (isCenterIC.value) {
    return CoreEventList.value?.filter((x) => !x.plan_submit) ?? [];
  } else {
    return (
      CoreEventList.value?.filter(
        (x) => !x.plan_submit && x.c_respon == username.value
      ) ?? []
    );
  }
});

function showDetail(evt, row, index) {
  router.push({
    path: "/event/detail/" + row.c_act_code.trim() + "/content",
  });
}

function markHardcopy() {
  let c_act_code = selectedRow.value.map((x) => x.c_act_code);
  const logObject = ref({
    username: username,
    datetime: date.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    module: "活動系統",
    action: "標示活動: " + c_act_code.join(",") + "為豁免計劃檢討表。",
  });

  loading.value++;
  markHardCopyMutation({
    logObject: logObject.value,
    c_act_code: c_act_code,
  });
}

// callbacks
markHardCopyMutation_Completed((result) => {
  selectedRow.value = [];
  loading.value--;
  $q.notify({
    message: "已修改了" + result.data.update_HTX_Event.affected_rows + "項記錄",
  });
});
</script>
