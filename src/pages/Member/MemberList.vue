<!-- TODO print receipt increment copy count -->
<template>
  <!-- loading dialog -->
  <q-dialog v-model="waitingAsync" position="bottom">
    <LoadingDialog message="處理中"/>
  </q-dialog>

  <!-- print receipt modal -->
  <q-dialog
    v-model="printReceiptDisplay"
    full-height
    full-width
    transition-show="slide-up"
    transition-hide="slide-down"
    class="q-pa-none"
    >
    <PrintReceipt :MemberID="printReceiptMember"/>
  </q-dialog>
  <!-- rowDetail modal -->
  <q-dialog
    v-model="modalDisplay"
    full-height
    transition-show="slide-up"
    transition-hide="slide-down"
    class="q-pa-none"
  >
    <MemberDetail :modalObject="modalObject" />
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
        <!--
            <q-td>
              <q-btn-toggle
                  dense
                  v-model="searchFilter.mem_type2"
                  toggle-color="primary"
                  :options="[
                      {label: '全部', value: ''},
                      {label: '是', value: 'true'}
                  ]"
                  />
          </q-td>
          <q-td>
              <q-btn-toggle
                  dense
                  v-model="searchFilter.mem_type3"
                  toggle-color="primary"
                  :options="[
                      {label: '全部', value: ''},
                      {label: '是', value: 'true'}
                  ]"
              />
          </q-td>
          <q-td>
              <q-btn-toggle
                  dense
                  v-model="searchFilter.mem_type4"
                  toggle-color="primary"
                  :options="[
                      {label: '全部', value: ''},
                      {label: '是', value: 'true'}
                  ]"
              />
          </q-td>
          -->
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
    <!--
  <template v-slot:body-cell-b_mem_type2_valid="props">
      <q-td :props="props">
          <q-icon v-if="props.value" color="positive" name="check"/>
          <q-icon v-else color="negative" name="cancel"/>
      </q-td>
  </template>

  <template v-slot:body-cell-b_mem_type3_valid="props">
      <q-td :props="props">
          <q-icon v-if="props.value" color="positive" name="check"/>
          <q-icon v-else color="negative" name="cancel"/>
      </q-td>
  </template>

  <template v-slot:body-cell-b_mem_type4_valid="props">
      <q-td :props="props">
          <q-icon v-if="props.value" color="positive" name="check"/>
          <q-icon v-else color="negative" name="cancel"/>
      </q-td>
  </template>
-->
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

<script>
import { computed } from "vue";
import { useStore } from "vuex";
import { date as qdate } from "quasar";
import MemberDetail from "components/Member/MemberDetail.vue";
import { MEMBER_GET_ALL, GET_MEMBER_RECEIPTS_BY_PK } from "/src/graphQueries/Member/query.js";
import { useSubscription } from "@vue/apollo-composable";
import LoadingDialog from "components/LoadingDialog.vue"
import PrintReceipt from "components/Account/PrintReceipt.vue"

export default {
  name: "MemberList",
  components: {
    MemberDetail, LoadingDialog, PrintReceipt,
  },
  data() {
    return {
      awaitServerResponse: 0,
      dataSize: 0,
      Member: [],
      MemberData: [],
      modalDisplay: false,
      modalObject: {},
      qdate: qdate,
      loadingState: false,
      printReceiptMember: "",
      printReceiptDisplay: false,
      searchFilter: {
        memberID: "",
        name: "",
        nameOther: "",
        sex: "",
        mobile_tel: "",
        mem_type1: "true",
        mem_type10: "",
        udf_1: "",
      },
      defaultPagination: {
        rowsPerPage: 30,
        sortBy: "c_mem_id",
        descending: true,
      },
      memberListColumns: [
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
      ],
    };
  },
  computed: {
    filter() {
      return {
        memberIDFilter: this.searchFilter.memberID,
        nameFilter: this.searchFilter.name,
        nameOtherFilter: this.searchFilter.nameOther,
        mobileTelFilter: this.searchFilter.mobile_tel,
        sexFilter: this.searchFilter.sex,
        memType1Filter: this.searchFilter.mem_type1,
        memType10Filter: this.searchFilter.mem_type10,
        udf1Filter: this.searchFilter.udf_1,
      };
    },
    waitingAsync() {
      return this.awaitServerResponse > 0 ? true : false;
    },
  },
  setup() {
    // save current module
    const $store = useStore();
    $store.dispatch("currentModule/setCurrentModule", "member");

    // load graphql subscription on member list
    const { result, loading } = useSubscription(MEMBER_GET_ALL);

    return {
      uid: computed(() => $store.getters["userModule/getUID"]),
      loading,
      MemberData: computed(() => result.value?.Member ?? []),
      udf1List: [
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
      ],
    };
  },
  methods: {
    onRequest(props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination;
      const filter = props.filter;
      pagination.value.rowsNumber = 2298;
    },
    rowDetail(evt, row, index) {
      if (evt.target.nodeName === 'TD') {
        this.modalDisplay = true;
        this.modalObject = row;
      }
    },
    async printReceipt(mem_id) {
      this.printReceiptDisplay = true;
      this.printReceiptMember = mem_id;
    },
    resetFilter() {
      this.searchFilter = {
        memberID: "",
        name: "",
        nameOther: "",
        sex: "",
        mobile_tel: "",
        mem_type1: "true",
        mem_type10: "",
        udf_1: "",
      };
    },
    tableFilter(rows, terms) {
      // rows contain the entire data
      // terms contains whatever you have as filter
      // console.log(terms,rows)
      // let lowerSearch = terms.search ? terms.search.toLowerCase() : ""

      const filteredRows = rows.filter((row, i) => {
        //assume row doesn't match
        let ans = false;

        //Gather toggle conditions - on/off condition
        let c1 = this.memType1Filter == terms.memType1Filter;
        //let c2 = this.memType2Filter == terms.memType2Filter;
        // let c3 = this.memType3Filter == terms.memType3Filter;
        // let c4 = this.memType4Filter == terms.memType4Filter;
        let c5 = this.memType10Filter == terms.memType10Filter;

        if (row.b_mem_type1) {
          c1 = true;
        } else {
          if (terms.memType1Filter == "") c1 = true;
        }
        /*
        if (row.b_mem_type2_valid) {
            c2 = true;
        } else {
            if (terms.memType2Filter == "") c2 = true;
        }

        if (row.b_mem_type3_valid) {
            c3 = true;
        } else {
            if (terms.memType3Filter == "") c3 = true;
        }

        if (row.b_mem_type4_valid) {
            c4 = true;
        } else {
            if (terms.memType4Filter == "") c4 = true;
        }
        */
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
          //if (c1 && c5) {
          ans = true;
        }

        return ans;
      });

      return filteredRows;
    },
  },
  async mounted() {
    /* const observer = await this.$apollo.subscribe({
      query: MEMBER_GET_ALL,
    })
    
    //this.MemberData = observer.data.Member;
    observer.subscribe({
      next (data) {
        console.log(data)
      },
      error (error) {
        console.error(error)
      },
    })
    */
    /*
    this.loadingState = true;
    const today = new Date();
    
    try {
      const graphqlQuery = {
        operationName: "getMember",
        query: `query getMember {
                  Member {
                    c_mem_id
                    b_mem_type1
                    b_mem_type10
                    c_email
                    c_emer_name
                    c_emer_rel
                    c_emer_tel1_1
                    c_mobile
                    c_name
                    c_name_other
                    c_sex
                    c_tel
                    c_udf_1
                    c_update_user
                    d_birth
                    d_enter_1
                    d_exit_1
                    d_expired_1
                    d_renew_1
                    d_update
                    d_write
                    m_addscom
                  }
                }`,
        variables: {},
      };
      
      const memberResponse = await this.$api({
        method: "post",
        data: graphqlQuery,
      });

      //this.memberList = memberResponse.data.data.Member;
      //memberResponse.data.data.Member.forEach((record) => {
        
      this.gqlMemberList.forEach((record) => {
        qdate.getDateDiff(today, record.d_expired_1) < 0 ? record.b_mem_type1_valid = true : record.b_mem_type1_valid = false;
        qdate.getDateDiff(today, record.d_expired_2) < 0 ? record.b_mem_type2_valid = true : record.b_mem_type2_valid = false;
        qdate.getDateDiff(today, record.d_expired_3) < 0 ? record.b_mem_type3_valid = true : record.b_mem_type3_valid = false;
        qdate.getDateDiff(today, record.d_expired_4) < 0 ? record.b_mem_type4_valid = true : record.b_mem_type4_valid = false;
        this.memberList.push(record)
      })
      
      this.loadingState = false;
    } catch (error) {
      this.error = error;
    }
    */
  },
};
</script>

<style></style>
