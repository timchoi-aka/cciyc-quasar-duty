<!-- TODO
  add grid view
-->
<template>
  <q-table
    dense
    flat
    :rows="result"
    :columns="columns"
    color="primary"
    row-key="c_act_code"
    :loading="loading"
    :wrap-cells="true"
    :pagination="pagination"
    binary-state-sort
    no-data-label="沒有找到活動"
    @row-click="showDetail"
  >
    <template v-slot:top-left>
      <div class="row items-center">
        <DateComponent
          class="col-sm-5 col-xs-5 col-md-3"
          label="開始報名日期"
          v-model="d_sale_start"
        />
        <DateComponent
          class="col-sm-5 col-xs-5 col-md-3"
          label="活動開始日期"
          v-model="d_date_from"
        />
        <DateComponent
          class="col-sm-5 col-xs-5 col-md-3"
          label="活動結束日期"
          v-model="d_date_to"
        />
        <q-btn
          label="搜尋"
          icon="search"
          color="primary"
          @click="load() || refetch()"
          class="q-mx-md"
        />
      </div>
    </template>
    <template v-slot:top-right>
      <q-btn
        color="primary"
        icon-right="archive"
        label="匯出Excel"
        no-caps
        @click="
          exportExcel(
            result,
            columns,
            '活動查詢-' + date.formatDate(d_sale_start, 'YYYY-MM-DD')
          )
        "
      />
    </template>
  </q-table>
</template>

<script setup>
import { ref } from "vue";
import { useSummerEventProvider } from "src/providers/event.js";
import { useRouter } from "vue-router";
import DateComponent from "src/components/Basic/DateComponent.vue";
import { date, exportFile } from "quasar";
import Excel from "src/lib/exportExcel";

const router = useRouter();
const d_sale_start = ref("");
const d_date_from = ref(""),
  d_date_to = ref("");
const { result, loading, load, refetch } = useSummerEventProvider({
  d_sale_start: d_sale_start,
  d_date_from: d_date_from,
  d_date_to: d_date_to,
});

const pagination = ref({
  rowsPerPage: 100,
  page: 1,
  sortBy: "c_act_code",
  descending: true,
});

const columns = ref([
  {
    name: "c_act_code",
    label: "編號",
    field: "c_act_code",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_act_name",
    label: "名稱",
    field: "c_act_name",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_whojoin",
    label: "對象",
    field: "c_whojoin",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "d_date_from",
    label: "開始日期",
    field: "d_date_from",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "d_date_to",
    label: "結束日期",
    field: "d_date_to",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_week",
    label: "逢星期",
    field: "c_week",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "d_time_from",
    label: "開始時間",
    field: "d_time_from",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "d_time_to",
    label: "結束時間",
    field: "d_time_to",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "Fee",
    label: "收費",
    field: "Event_to_Fee",
    style:
      "border-top: 1px solid; text-align: center; width: 10%; max-width: 10%;",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => {
      return val.map((obj) => `${obj.c_type}: ${obj.u_fee}`).join(", ");
    },
  },
  {
    name: "i_lessons",
    label: "堂數",
    field: "i_lessons",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_respon",
    label: "負責人",
    field: "c_respon",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "d_sale_start",
    label: "開始報名日期",
    field: "d_sale_start",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "d_sale_end",
    label: "結束報名日期",
    field: "d_sale_end",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_nature",
    label: "性質",
    field: "c_nature",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_type",
    label: "類別",
    field: "c_type",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_group1",
    label: "大分類",
    field: "c_group1",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_group2",
    label: "細類",
    field: "c_group2",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_acc_type",
    label: "會計",
    field: "c_acc_type",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
]);

function showDetail(evt, row, index) {
  router.push({
    path: "/event/detail/" + row.c_act_code.trim() + "/content",
  });
}

function exportExcel(datasource, columns, filename) {
  let content = Excel.jsonToXLS(datasource, columns);

  const status = exportFile(filename + ".xls", content, "text/xls");

  if (status !== true) {
    $q.notify({
      message: "瀏覽器阻止下載檔案...",
      color: "negative",
      icon: "warning",
    });
  }
}
</script>
