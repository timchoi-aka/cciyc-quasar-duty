<template>
  <!-- loading dialog -->
  <q-dialog v-model="waitingAsync" position="bottom">
    <LoadingDialog message="處理中"/>
  </q-dialog>

  <!-- print receipt modal -->
  <q-dialog v-if="$q.screen.gt.md"
    v-model="printReceiptModal"
    full-height
    full-width
    transition-show="slide-up"
    transition-hide="slide-down"
    class="q-pa-none"
    >
    <PrintReceipt :MemberID="printReceiptMember"/>
  </q-dialog>

  <q-dialog v-if="$q.screen.lt.md"
    v-model="printReceiptModal"
    maximized
    full-width
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
    class="q-pa-none"
    >
    <PrintReceipt :MemberID="printReceiptMember"/>
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
    <MemberDetail v-model="showMemberID" />
  </q-dialog>

  <!-- rowDetail modal -->
  <q-dialog v-if="$q.screen.gt.md"
    v-model="detailModal"
    persistent
    full-height
    transition-show="slide-up"
    transition-hide="slide-down"
    class="q-pa-none"
  >
    <MemberDetail v-model="showMemberID" />
  </q-dialog>
  
  <q-table
    class="col"
    dense
    flat
    :rows="MemberData"
    :columns="memberListColumns"
    :filter="filter"
    :filter-method="tableFilter"
    :pagination="defaultPagination"
    color="primary"
    row-key="c_mem_id"
    :loading="loading"
    binary-state-sort
    @row-click="rowDetail"
  >
    <!-- loading -->
    <template v-slot:loading>
      <q-inner-loading showing color="primary" />
    </template>

    <template v-slot:top-row>
      <q-tr style="text-align: center">
        <q-td/>
        <q-td>
          <q-input
            v-model="searchFilter.memberID"
            dense
            debounce="300"
            type="search"
          >
            <template v-slot:append>
              <q-icon v-if="searchFilter.memberID == ''" name="search" />
              <q-icon
                v-else
                name="cancel"
                @click="searchFilter.memberID = ''"
              />
            </template>
          </q-input>
        </q-td>
        <q-td>
          <q-input
            v-model="searchFilter.name"
            dense
            debounce="300"
            type="search"
          >
            <template v-slot:append>
              <q-icon v-if="searchFilter.name == ''" name="search" />
              <q-icon v-else name="cancel" @click="searchFilter.name = ''" />
            </template>
          </q-input>
        </q-td>
        <q-td>
          <q-input
            v-model="searchFilter.nameOther"
            dense
            debounce="300"
            type="search"
          >
            <template v-slot:append>
              <q-icon v-if="searchFilter.nameOther == ''" name="search" />
              <q-icon
                v-else
                name="cancel"
                @click="searchFilter.nameOther = ''"
              />
            </template>
          </q-input>
        </q-td>
        <q-td>
          <q-btn-toggle
            dense
            v-model="searchFilter.sex"
            toggle-color="primary"
            :options="[
              { label: '全部', value: '' },
              { label: '男', value: '男' },
              { label: '女', value: '女' },
            ]"
          />
        </q-td>
        <q-td colspan="2">
          <q-input v-model="searchFilter.mobile_tel" dense debounce="300">
            <template v-slot:append>
              <q-icon v-if="searchFilter.mobile_tel == ''" name="search" />
              <q-icon
                v-else
                name="cancel"
                @click="searchFilter.mobile_tel = ''"
              />
            </template> </q-input
        ></q-td>

        <q-td>
          <q-btn-toggle
            dense
            v-model="searchFilter.mem_type1"
            toggle-color="primary"
            :options="[
              { label: '是', value: 'true' },
              { label: '全部', value: '' },
            ]"
          />
        </q-td>
        <q-td>
          <q-btn-toggle
            dense
            v-model="searchFilter.mem_type10"
            toggle-color="primary"
            :options="[
              { label: '全部', value: '' },
              { label: '是', value: 'true' },
            ]"
          />
        </q-td>
        <q-td>
          <q-select
            v-model="searchFilter.udf_1"
            :options="udf1List"
            label="會藉篩選"
          />
        </q-td>

        <q-td>
          <q-btn label="全部重置" @click="resetFilter" />
        </q-td>
      </q-tr>
    </template>

    <template v-slot:body-cell-b_mem_type1="props">
      <q-td :props="props">
        <q-icon v-if="props.value" color="positive" name="check" />
        <q-icon v-else color="negative" name="cancel" />
      </q-td>
    </template>
    
    <template v-slot:body-cell-b_mem_type10="props">
      <q-td :props="props">
        <q-icon v-if="props.value" color="positive" name="check" />
        <q-icon v-else color="negative" name="cancel" />
      </q-td>
    </template>

    <template v-slot:body-cell-MemberAccount="props">
      <q-td :props="props">
        <q-btn v-if="props.row.MemberAccount.length > 0" icon="print" color="positive" @click="printReceipt(props.key)" size="md" padding="none" outline/>
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { date as qdate } from "quasar";
import MemberDetail from "components/Member/MemberDetail.vue";
import { MEMBER_GET_ALL } from "/src/graphQueries/Member/query.js";
import { useSubscription } from "@vue/apollo-composable"
import LoadingDialog from "components/LoadingDialog.vue"
import PrintReceipt from "components/Account/PrintReceipt.vue"

// save current module
const $store = useStore();
$store.dispatch("currentModule/setCurrentModule", "member");

// variables
const awaitServerResponse = ref(0)
const detailModal = ref(false)
const printReceiptModal = ref(false)
const printReceiptMember = ref("")
const showMemberID = ref("")
const Member = ref([])

// table parameters
const searchFilter = ref({
  memberID: "",
  name: "",
  nameOther: "",
  sex: "",
  mobile_tel: "",
  mem_type1: "true",
  mem_type10: "",
  udf_1: "",
})
const defaultPagination = ref({
  rowsPerPage: 30,
  sortBy: "c_mem_id",
  descending: true,
})
const memberListColumns = ref([
  {
    name: "MemberAccount",
    label: "收據",
    field: "MemberAccount",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_mem_id",
    label: "會員編號",
    field: "c_mem_id",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    sortable: true,
  },
  {
    name: "c_name",
    label: "姓名",
    field: "c_name",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_name_other",
    label: "Name",
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
    name: "c_mobile",
    label: "手提電話",
    field: "c_mobile",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_tel",
    label: "電話",
    field: "c_tel",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "b_mem_type1",
    label: "會員",
    field: "b_mem_type1",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "b_mem_type10",
    label: "青年家屬",
    field: "b_mem_type10",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_udf_1",
    label: "會籍",
    field: "c_udf_1",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "d_expired_1",
    label: "屆滿日期",
    field: "d_expired_1",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) =>
      qdate.formatDate(val, "YYYY年M月D日") == "3000年1月1日"
        ? "永久"
        : qdate.formatDate(val, "YYYY年M月D日"),
  },
])

const udf1List = ref([
  {
    label: "全部",
    value: "",
  },
  {
    label: "個人",
    value: "個人會員",
  },
  {
    label: "永久",
    value: "永久會員",
  },
  {
    label: "青年義工<25",
    value: "青年義工",
  },
  {
    label: "家人義工25+",
    value: "家人義工",
  },
])

 // query - load graphql subscription on member list
 const { result, loading } = useSubscription(MEMBER_GET_ALL);
      
// computed  
const filter = computed(() => ({
  memberIDFilter: searchFilter.value.memberID,
  nameFilter: searchFilter.value.name,
  nameOtherFilter: searchFilter.value.nameOther,
  mobileTelFilter: searchFilter.value.mobile_tel,
  sexFilter: searchFilter.value.sex,
  memType1Filter: searchFilter.value.mem_type1,
  memType10Filter: searchFilter.value.mem_type10,
  udf1Filter: searchFilter.value.udf_1,
}))
const waitingAsync = computed(() => awaitServerResponse.value > 0)
const uid = computed(() => $store.getters["userModule/getUID"])
const MemberData = computed(() => result.value?.Member ?? [])

// function
function rowDetail(evt, row, index) {
  if (evt.target.nodeName === 'TD') {
    detailModal.value = true;
    showMemberID.value = row.c_mem_id;
  }
}

function printReceipt(mem_id) {
  printReceiptModal.value = true;
  printReceiptMember.value = mem_id;
}

function resetFilter() {
  searchFilter.value = {
    memberID: "",
    name: "",
    nameOther: "",
    sex: "",
    mobile_tel: "",
    mem_type1: "true",
    mem_type10: "",
    udf_1: "",
  };
}
    
function tableFilter(rows, terms) {
  // rows contain the entire data
  // terms contains whatever you have as filter
  // console.log(terms,rows)
  // let lowerSearch = terms.search ? terms.search.toLowerCase() : ""

  const filteredRows = rows.filter((row, i) => {
    //assume row doesn't match
    let ans = false;
    
    //Gather toggle conditions - on/off condition
    let c1 = false
    let c5 = false

    if (row.b_mem_type1) {
      c1 = true;
    } else {
      if (terms.memType1Filter == "") c1 = true;
    }
    
    if (row.b_mem_type10) {
      c5 = true;
    } else {
      if (terms.memType10Filter == "") c5 = true;
    }

    //Gather search condition
    //Assume true in case there is no search
    let s1 = terms.memberIDFilter == "";
    let s2 = terms.nameFilter == "";
    let s3 = terms.nameOtherFilter == "";
    let s4 = terms.mobileTelFilter == "";
    let s5 = terms.sexFilter == "";
    let s6 = terms.udf1Filter == "";

    if (
      terms.memberIDFilter != "" &&
      row.c_mem_id != null &&
      row.c_mem_id.includes(terms.memberIDFilter)
    ) {
      s1 = true;
    }

    if (
      terms.nameFilter != "" &&
      row.c_name != null &&
      row.c_name.includes(terms.nameFilter)
    ) {
      s2 = true;
    }

    if (
      terms.nameOtherFilter != "" &&
      row.c_name_other != null &&
      row.c_name_other
        .toLowerCase()
        .includes(terms.nameOtherFilter.toLowerCase())
    ) {
      s3 = true;
    }

    if (
      (terms.mobileTelFilter != "" &&
        row.c_mobile != null &&
        row.c_mobile.includes(terms.mobileTelFilter)) ||
      (terms.mobileTelFilter != "" &&
        row.c_tel != null &&
        row.c_tel.includes(terms.mobileTelFilter))
    ) {
      s4 = true;
    }

    if (
      terms.sexFilter != "" &&
      row.c_sex != null &&
      row.c_sex == terms.sexFilter
    ) {
      s5 = true;
    }

    if (
      terms.udf1Filter != "" &&
      row.c_udf_1 != null &&
      row.c_udf_1.includes(terms.udf1Filter.value)
    ) {
      s6 = true;
    }

    //check if any of the conditions match
    if (c1 && c5 && s1 && s2 && s3 && s4 && s5 && s6) {
      ans = true;
    }

    return ans;
  });

  return filteredRows;
}
</script>
