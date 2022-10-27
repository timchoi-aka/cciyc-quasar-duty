<template>
  <!-- rowDetail modal -->
  <q-dialog v-model="modalDisplay"
            full-height 
            full-width
            transition-show="slide-up"
            transition-hide="slide-down"
            class="q-pa-none">
      <MemberDetail :member="modalObject"/>
  </q-dialog>

  <q-table
      class="col"
      dense
      flat
      :rows="memberList"
      :columns="memberListColumns"
      :pagination="defaultPagination"
      :filter="filter"
      :filter-method="tableFilter"
      color="primary"
      :loading="loadingState"
      row-key="c_mem_id"
      @row-click="rowDetail"
  >
  <template v-slot:top-row>
      <q-tr style="text-align: center;">
          <q-td>
              <q-input
                  v-model="searchFilter.memberID"
                  dense
                  debounce="300"
                  type="search"
                  >
                  <template v-slot:append>
                      <q-icon v-if="searchFilter.memberID == ''" name="search"/>
                      <q-icon v-else name="cancel" @click="searchFilter.memberID = ''"/>
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
                      <q-icon v-if="searchFilter.name == ''" name="search"/>
                      <q-icon v-else name="cancel" @click="searchFilter.name = ''"/>
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
                      <q-icon v-if="searchFilter.nameOther == ''" name="search"/>
                      <q-icon v-else name="cancel" @click="searchFilter.nameOther = ''"/>
                  </template>
              </q-input>
          </q-td>
          <q-td>
              <q-btn-toggle
                  dense
                  v-model="searchFilter.sex"
                  toggle-color="primary"
                  :options="[
                      {label: '全部', value: ''},
                      {label: '男', value: '男'},
                      {label: '女', value: '女'}
                  ]"
                  />
          </q-td>
          <q-td colspan="2">
              <q-input
                  v-model="searchFilter.mobile_tel"
                  dense
                  debounce="300"
                  >
                  <template v-slot:append>
                      <q-icon v-if="searchFilter.mobile_tel == ''" name="search"/>
                      <q-icon v-else name="cancel" @click="searchFilter.mobile_tel = ''"/>
                  </template>
              </q-input></q-td>
              
          <q-td>
              <q-btn-toggle
                  dense
                  v-model="searchFilter.mem_type1"
                  toggle-color="primary"
                  :options="[
                      {label: '是', value: 'true'},
                      {label: '全部', value: ''}
                  ]"
                  />
          </q-td>
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
          
          <q-td>
              <q-select v-model="searchFilter.udf_1" :options="udf1List" label="會藉篩選" />
          </q-td>
              
          <q-td>
              <q-btn label="全部重置" @click="resetFilter"/>
          </q-td>
      </q-tr>
  </template>
  
  <template v-slot:body-cell-b_mem_type1_valid="props">
      <q-td :props="props">
          <q-icon v-if="props.value" color="positive" name="check"/>
          <q-icon v-else color="negative" name="cancel"/>
      </q-td>
  </template>

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

  </q-table>

</template>

<script>
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import { FirebaseAuth } from "boot/firebase";
import { date as qdate} from "quasar";
import MemberDetail from "components/Member/MemberDetail.vue"

export default defineComponent({
  name: "MemberList",
  components: {
    MemberDetail,
  },
  data() {
    return {
        modalDisplay: false,
        modalObject: {},
        qdate: qdate,
        loadingState: false,
        searchFilter: {
            memberID: "",
            name: "",
            nameOther: "",
            sex: "",
            mobile_tel: "",
            mem_type1: "true",
            mem_type2: "",
            mem_type3: "",
            mem_type4: "",
            udf_1: "",
        },
        memberList: [],
        defaultPagination: {
            rowsPerPage: 400,
        },
        memberListColumns: [
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
          name: "b_mem_type1_valid",
          label: "會員",
          field: "b_mem_type1_valid",
          style: "border-top: 1px solid; text-align: center",
          headerStyle: "text-align: center;",
          headerClasses: "bg-grey-2",
        },
        {
          name: "b_mem_type2_valid",
          label: "<15青年家屬",
          field: "b_mem_type2_valid",
          style: "border-top: 1px solid; text-align: center",
          headerStyle: "text-align: center;",
          headerClasses: "bg-grey-2",
        },
        {
          name: "b_mem_type3_valid",
          label: "義工",
          field: "b_mem_type3_valid",
          style: "border-top: 1px solid; text-align: center",
          headerStyle: "text-align: center;",
          headerClasses: "bg-grey-2",
        },
        {
          name: "b_mem_type4_valid",
          label: "25+青年家屬",
          field: "b_mem_type4_valid",
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
        /*
        {
          name: "d_enter_1",
          label: "入會日期",
          field: "d_enter_1",
          style: "border-top: 1px solid; text-align: center",
          headerStyle: "text-align: center;",
          headerClasses: "bg-grey-2",
          format: (val) =>
            qdate.formatDate(val, "YYYY年M月D日", {
              daysShort: ["日", "一", "二", "三", "四", "五", "六"],
            }),
        },*/
        {
          name: "d_expired_1",
          label: "屆滿日期",
          field: "d_expired_1",
          style: "border-top: 1px solid; text-align: center",
          headerStyle: "text-align: center;",
          headerClasses: "bg-grey-2",
          format: (val) =>
            qdate.formatDate(val, "YYYY年M月D日") == "3000年1月1日"? "永久": qdate.formatDate(val, "YYYY年M月D日")
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
        memType2Filter: this.searchFilter.mem_type2,
        memType3Filter: this.searchFilter.mem_type3,
        memType4Filter: this.searchFilter.mem_type4,
        udf1Filter: this.searchFilter.udf_1,
      };
    },
  },
  setup() {
    const $store = useStore();
    $store.dispatch("currentModule/setCurrentModule", "member");
    
    return {
        uid: computed(() => $store.getters["userModule/getUID"]),
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
          label: "青年義工15-24",
          value: "青年義工會員(15-24歲)",
        },
        {
          label: "青年義工12-14",
          value: "青年義工會員(12-14歲)",
        },
        {
          label: "家人義工25+",
          value: "青年家人義工會員(25歲或以上)",
        },
        {
          label: "家人義工14-",
          value: "青年家人義工會員(14歲或以下)",
        },
        ],
    };
  },
  methods: {
    rowDetail(evt, row, index) {
      // console.log("evt:" +evt);
      // console.log("row:" + row);
      // console.log("index:" + index);
      this.modalDisplay = true;
      this.modalObject = row;
    },
    resetFilter() {
        this.searchFilter = {
            memberID: "",
            name: "",
            nameOther: "",
            sex: "",
            mobile_tel: "",
            mem_type1: "true",
            mem_type2: "",
            mem_type3: "",
            mem_type4: "",
            udf_1: "",
        }
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
        let c2 = this.memType2Filter == terms.memType2Filter;
        let c3 = this.memType3Filter == terms.memType3Filter;
        let c4 = this.memType4Filter == terms.memType4Filter;

        if (row.b_mem_type1_valid) {
            c1 = true;
        } else {
            if (terms.memType1Filter == "") c1 = true;
        }

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

        //Gather search condition
        //Assume true in case there is no search
        let s1 = terms.memberIDFilter == "";
        let s2 = terms.nameFilter == "";
        let s3 = terms.nameOtherFilter == "";
        let s4 = terms.mobileTelFilter == "";
        let s5 = terms.sexFilter == "";
        let s6 = terms.udf1Filter == "";
        
        if (terms.memberIDFilter != "" && row.c_mem_id != null && row.c_mem_id.includes(terms.memberIDFilter)) {
          s1 = true;
        }
       
        if (terms.nameFilter != "" && row.c_name != null && row.c_name.includes(terms.nameFilter)) {
          s2 = true;
        }

        if (terms.nameOtherFilter != "" && row.c_name_other != null && row.c_name_other.toLowerCase().includes(terms.nameOtherFilter.toLowerCase())) {
          s3 = true;
        }

        if (terms.mobileTelFilter != "" && row.c_mobile != null && row.c_mobile.includes(terms.mobileTelFilter) || 
            terms.mobileTelFilter != "" && row.c_tel != null && row.c_tel.includes(terms.mobileTelFilter)) {
          s4 = true;
        }

        if (terms.sexFilter != "" && row.c_sex != null && row.c_sex == terms.sexFilter) {
          s5 = true;
        }
        
        if (terms.udf1Filter != "" && row.c_udf_1 != null && row.c_udf_1.includes(terms.udf1Filter.value)) { 
          s6 = true;
        }

        //check if any of the conditions match
        if (c1 && c2 && c3 && c4 && s1 && s2 && s3 && s4 && s5 && s6) {
          ans = true;
        }

        return ans;
      });

      return filteredRows;
    },
  },
  async mounted() {
    this.loadingState = true;
    const today = new Date();
    try {
      const graphqlQuery = {
        operationName: "getMember",
        query: `query getMember {
                    Member {
                        b_birth_InHK
                        b_cssa
                        b_emailcontact
                        b_estimate
                        b_family
                        b_finish
                        b_getElderCard
                        b_getsafebell
                        b_instructor
                        b_lib_user
                        b_mem_type1
                        b_mem_type10
                        b_mem_type11
                        b_mem_type12
                        b_mem_type13
                        b_mem_type2
                        b_mem_type3
                        b_mem_type4
                        b_mem_type5
                        b_mem_type6
                        b_mem_type7
                        b_mem_type8
                        b_mem_type9
                        b_memcard
                        b_missed
                        b_notcheckdata
                        b_receive_publish
                        b_single_family
                        b_teamcontact
                        b_udf_1
                        b_visit
                        c_HAD
                        c_HKID
                        c_adds_Bdt
                        c_adds_RM
                        c_adds_area
                        c_adds_block
                        c_adds_district
                        c_adds_est
                        c_adds_floor
                        c_adds_street
                        c_barcode
                        c_card_remarks
                        c_care
                        c_cat
                        c_centre_id
                        c_cis_id
                        c_comefrom
                        c_couse_centre
                        c_couse_id
                        c_cssa_no
                        c_direct_code
                        c_edu
                        c_email
                        c_emer_address
                        c_emer_address2
                        c_emer_address3
                        c_emer_name
                        c_emer_name2
                        c_emer_name3
                        c_emer_re2
                        c_emer_rel
                        c_emer_rel3
                        c_emer_rem
                        c_emer_rem2
                        c_emer_rem3
                        c_emer_tel1_1
                        c_emer_tel1_2
                        c_emer_tel2_1
                        c_emer_tel2_2
                        c_emer_tel3_1
                        c_emer_tel3_2
                        c_fax
                        c_fileno_1
                        c_fileno_2
                        c_fileno_3
                        c_fileno_4
                        c_fileno_5
                        c_fill_name
                        c_group
                        c_intro_source
                        c_introsource
                        c_job
                        c_job_bef_retire
                        c_job_title
                        c_lib_position
                        c_lossjob_year
                        c_mar_stat
                        c_mem_fee_1
                        c_mem_fee_2
                        c_mem_fee_3
                        c_mem_fee_4
                        c_mem_fee_5
                        c_mem_relation
                        c_mem_relative_mem_name
                        c_mem_relative_memid
                        c_mem_rep_name1
                        c_mem_rep_name10
                        c_mem_rep_name11
                        c_mem_rep_name12
                        c_mem_rep_name13
                        c_mem_rep_name2
                        c_mem_rep_name3
                        c_mem_rep_name4
                        c_mem_rep_name5
                        c_mem_rep_name6
                        c_mem_rep_name7
                        c_mem_rep_name8
                        c_mem_rep_name9
                        c_mo_tongue
                        c_mobile
                        c_name
                        c_name_other
                        c_pager
                        c_photo_path
                        c_refno
                        c_relative_memid
                        c_religion
                        c_res_class
                        c_res_nat
                        c_sex
                        c_status_1
                        c_status_2
                        c_status_3
                        c_status_4
                        c_status_5
                        c_tel
                        c_tel_com
                        c_udf_1
                        c_udf_2
                        c_udf_3
                        c_udf_4
                        c_udf_5
                        c_udf_6
                        c_update_user
                        c_user_id
                        c_vol_ID
                        c_vol_group
                        c_vol_had_price
                        c_vol_had_service
                        c_vol_price
                        c_vol_price_frist
                        c_vol_price_year
                        c_vol_price_year_frist
                        c_vol_ser_unit
                        c_vol_service_health
                        c_vol_service_social
                        c_vol_service_support
                        c_vol_service_time
                        c_vol_skill_act
                        c_vol_skill_arts
                        c_vol_skill_culture
                        c_vol_skill_music
                        c_vol_skill_other
                        c_vol_training
                        d__estimate_date
                        d_birth
                        d_come_HK
                        d_couse_regdate
                        d_cssa_expire
                        d_enter_1
                        d_enter_2
                        d_enter_3
                        d_enter_4
                        d_enter_5
                        d_exit_1
                        d_exit_2
                        d_exit_3
                        d_exit_4
                        d_exit_5
                        d_expired_1
                        d_expired_2
                        d_expired_3
                        d_expired_4
                        d_expired_5
                        d_lossjobDate
                        d_renew_1
                        d_renew_2
                        d_renew_3
                        d_renew_4
                        d_renew_5
                        d_udf_1
                        d_update
                        d_write
                        i_arrival_yrs
                        i_boys_inchi
                        i_boys_inhk
                        i_edu_yrs
                        i_girls_inchi
                        i_girls_inhk
                        i_total_China
                        i_total_HK
                        i_udf_1
                        i_udf_2
                        i_used_checkout_quota
                        i_used_reserve_quota
                        i_vol_experience
                        m_act
                        m_addscom
                        m_contact
                        m_dis
                        m_econ
                        m_job_want
                        m_md
                        m_remarks
                        m_res_env
                        m_res_stat
                        m_ser
                        m_spec
                        m_udf_1
                        m_vol_remarks
                        o_photo
                        u_income
                        u_rent
                        u_udf_1
                        c_mem_id
                    }
                }`,
        variables: {},
      };
      
      var token = await FirebaseAuth.currentUser.getIdToken();
      this.$api.defaults.headers.common['Authorization'] = "Bearer " + token;
      /*
      this.$api.defaults.headers.common = {
        "content-type": "application/json",
      }
      */

      const memberResponse = await this.$api({
        method: "post",
        data: graphqlQuery,
      });

      //this.memberList = memberResponse.data.data.Member;
      memberResponse.data.data.Member.forEach((record) => {
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
  },
});
</script>

<style>
</style>