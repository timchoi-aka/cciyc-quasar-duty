<template>
  <q-page>
    <!-- loading dialog -->
    <LoadingDialog :model-value="loading ? 1 : 0" message="處理中" />

    <div
      v-if="$q.screen.gt.sm"
      class="row fit items-center"
      style="margin-top: 70px"
    >
      <div class="q-mx-sm">
        <div>日期由：</div>
        <DateComponent v-model="searchOptions.startDate" />
      </div>
      <div class="q-mx-sm">
        <div>至</div>
        <DateComponent v-model="searchOptions.endDate" />
      </div>
      <div class="q-mx-sm col-2">
        計算標準：<q-select :options="reportTypeOptions" v-model="reportType" />
      </div>
      <div class="q-mx-sm">
        <q-btn
          icon="search"
          class="bg-primary text-white"
          label="搜尋"
          @click="search"
        />
      </div>
      <div class="q-mx-sm">
        <q-btn
          class="bg-primary text-white"
          label="顯示全部記錄"
          @click="showAll"
        />
      </div>
    </div>

    <div v-else class="row fit" style="margin-top: 70px">
      <div class="col-12">日期由：</div>
      <div class="col-12">
        <DateComponent v-model="searchOptions.startDate" />
      </div>
      <div class="col-12">至</div>
      <div class="col-12">
        <DateComponent v-model="searchOptions.startDate" />
      </div>
      <div class="col-12">
        計算標準：<q-select :options="reportTypeOptions" v-model="reportType" />
      </div>
      <div class="col-3 q-my-sm">
        <q-btn
          icon="search"
          class="bg-primary text-white"
          label="搜尋"
          @click="refetch"
        />
      </div>
      <div class="col-3 q-my-sm">
        <q-btn
          class="bg-primary text-white"
          label="顯示全部記錄"
          @click="showAll"
        />
      </div>
    </div>

    <q-table
      dense
      flat
      title="義工記錄"
      :rows="volunteerData"
      :columns="VolunteerTableColumns"
      :pagination="defaultPagination"
      color="primary"
      row-key="uuid"
      :loading="loading"
      no-data-label="沒有資料"
      selection="multiple"
      v-model:selected="selectedRow"
    >
      <template v-slot:top-right>
        <q-btn
          color="primary"
          icon-right="archive"
          label="匯出Excel"
          no-caps
          @click="
            exportExcel(
              volunteerData,
              VolunteerTableColumns,
              '義工記錄_' +
                qdate.formatDate(queryFilter.startDate, 'YYYY-MM') +
                '-' +
                qdate.formatDate(queryFilter.endDate, 'YYYY-MM')
            )
          "
        />
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, computed } from "vue";
import DateComponent from "components/Basic/DateComponent.vue";
import { useQuery } from "@vue/apollo-composable";
import { gql } from "graphql-tag";
import { date as qdate, useQuasar, exportFile } from "quasar";
import LoadingDialog from "components/LoadingDialog.vue";
import Excel from "src/lib/exportExcel";
import dateUtil from "src/lib/utils";

// variables
const $q = useQuasar();
const searchOptions = ref({
  startDate: "",
  endDate: "",
});
const reportTypeOptions = ref([
  {
    label: "中心標準",
    value: [
      {
        hours: 0,
        prize: "參與獎",
      },
      {
        hours: 20,
        prize: "銅獎",
      },
      {
        hours: 50,
        prize: "銀獎",
      },
      {
        hours: 80,
        prize: "金獎",
      },
    ],
  },
  {
    label: "社署標準",
    value: [
      {
        hours: 20,
        prize: "銅獎",
      },
      {
        hours: 50,
        prize: "銀獎",
      },
      {
        hours: 100,
        prize: "金獎",
      },
    ],
  },
]);
const reportType = ref(reportTypeOptions.value[0]);

const queryFilter = ref({
  startDate: "",
  endDate: "",
});
const defaultPagination = ref({
  rowsPerPage: 40,
  sortBy: "c_mem_id",
  // descending: true,
});
const selectedRow = ref([]);

const VolunteerTableColumns = ref([
  {
    name: "c_mem_id",
    label: "會員編號",
    field: "c_mem_id",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => String(val),
  },
  {
    name: "c_name",
    label: "中文姓名",
    field: "c_name",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_name_other",
    label: "英文姓名",
    field: "c_name_other",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_sex",
    label: "性別",
    field: "c_sex",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "age",
    label: "年齡",
    field: "age",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "age_group",
    label: "年齡組別",
    field: "age_group",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "hours",
    label: "服務時數",
    field: "hours",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "prize",
    label: "獎項",
    field: "prize",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
]);
// query
const { result, refetch, loading } = useQuery(
  gql`
    query GetVolunteerBetweenDates(
      $startDate: datetime2 = ""
      $endDate: datetime2 = ""
    ) {
      Volunteer(
        where: {
          _and: { event_date: { _gte: $startDate } }
          event_date: { _lte: $endDate }
        }
      ) {
        c_act_code
        c_mem_id
        event_date
        hours
        uuid
        Volunteer_to_Event {
          c_act_code
          c_act_name
        }
        Volunteer_to_Member {
          c_mem_id
          c_name
          c_name_other
          c_sex
          d_birth
        }
      }
    }
  `,
  () => queryFilter.value,
  {
    fetchPolicy: "network-only",
  }
);

// computed
const volunteerData = computed(() => {
  let res = [];
  if (result.value) {
    result.value.Volunteer.forEach((record) => {
      let i = res.findIndex(
        (x) =>
          x.c_mem_id ==
          String(parseInt(record.c_mem_id.trim())).padStart(4, "0")
      );

      if (i == -1) {
        let age = dateUtil.calculateAge(record.Volunteer_to_Member.d_birth);
        let ageGroup = "";

        if (reportType.value.label == "社署標準") {
          ageGroup =
            age >= 60
              ? "D (60歲或以上)"
              : age >= 26
              ? "C (26歲或以上)"
              : age >= 13
              ? "B (13歲或以上)"
              : "A (12歲或以下)";
        } else {
          ageGroup =
            age >= 25 ? "25歲或以上" : age >= 15 ? "15-24歲" : "14歲或以下";
        }
        res.push({
          c_mem_id: String(parseInt(record.c_mem_id.trim())).padStart(4, "0"),
          c_name: record.Volunteer_to_Member.c_name,
          c_name_other: record.Volunteer_to_Member.c_name_other,
          c_sex: record.Volunteer_to_Member.c_sex,
          age: age,
          age_group: ageGroup,
          hours: record.hours,
        });
      } else {
        res[i].hours += record.hours;
      }
    });

    res.forEach((record) => {
      reportType.value.value.forEach((rank) => {
        if (record.hours >= rank.hours) record.prize = rank.prize;
      });
    });
  }
  return res.filter((x) => x.prize);
});

// functions
function exportExcel(datasource, columns, filename) {
  let content = Excel.jsonToXLS(datasource, columns);

  const status = exportFile(
    filename + ".xls",
    content,
    //'text/xls'
    "application/vnd.ms-excel"
  );

  if (status !== true) {
    $q.notify({
      message: "瀏覽器阻止下載檔案...",
      color: "negative",
      icon: "warning",
    });
  }
}

function search() {
  queryFilter.value = {
    startDate: qdate.startOfDate(
      qdate.extractDate(searchOptions.value.startDate, "YYYY/MM/DD"),
      "day"
    ),
    endDate: qdate.endOfDate(
      qdate.extractDate(searchOptions.value.endDate, "YYYY/MM/DD"),
      "day"
    ),
  };
  refetch();
}

function showAll() {
  queryFilter.value = {
    startDate: new Date("1970-01-01"),
    endDate: new Date("3000-01-01"),
  };
  refetch();
}
</script>
