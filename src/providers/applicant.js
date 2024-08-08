import { ref, computed } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { gql } from "graphql-tag";
import Member from "components/class/member.js";

/* TODO
 * add Member class, assign Event_Registrations to user class
 */
// Function to provide attendance data
export function useApplicantProvider(options = {}) {
  // Destructure galleryID from options, default to a new ref if not provided
  const { c_act_code = ref() } = options;

  // Ref to keep track of the number of pending async operations
  const awaitNumber = ref(0);

  // Computed property that indicates whether there are any pending async operations
  const loading = computed(() => awaitNumber.value > 0);

  // Ref to store the result of the async operations
  const result = ref([]);

  // GraphQL query string
  let GET_APPLICANT = gql`
    query Event_ApplicantsByActCode($c_act_code: String! = "") {
      tbl_act_reg(
        where: {
          c_act_code: { _eq: $c_act_code }
          b_refund: { _eq: false }
          c_mem_id: { _neq: "9999" }
        }
      ) {
        ID
        b_refund
        c_act_code
        c_mem_id
        c_bus
        c_period
        c_name
        c_receipt_no
        c_remarks
        c_sex
        c_tbl
        c_tel
        c_type
        c_user_id
        d_refund
        d_reg
        i_age
        i_bus_no
        i_tbl_no
        EventRegistration_to_Member {
          ID
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
          c_adds_RM
          c_adds_Bdt
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
          c_edu
          c_direct_code
          c_email
          c_emer_address
          c_emer_address2
          c_emer_name
          c_emer_address3
          c_emer_name3
          c_emer_name2
          c_emer_re2
          c_emer_rel
          c_emer_rel3
          c_emer_rem
          c_emer_rem2
          c_emer_rem3
          c_emer_tel1_1
          c_emer_tel1_2
          c_emer_tel2_1
          c_emer_tel3_1
          c_emer_tel2_2
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
          c_mar_stat
          c_lossjob_year
          c_mem_fee_1
          c_mem_fee_2
          c_mem_fee_4
          c_mem_fee_3
          c_mem_fee_5
          c_mem_id
          c_mem_relation
          c_mem_relative_mem_name
          c_mem_relative_memid
          c_mem_rep_name1
          c_mem_rep_name10
          c_mem_rep_name11
          c_mem_rep_name12
          c_mem_rep_name13
          c_mem_rep_name4
          c_mem_rep_name2
          c_mem_rep_name3
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
          c_status_2
          c_status_1
          c_status_3
          c_status_5
          c_status_4
          c_tel
          c_tel_com
          c_udf_1
          c_udf_3
          c_udf_2
          c_udf_4
          c_udf_5
          c_udf_6
          c_update_user
          c_user_id
          c_vol_ID
          c_vol_group
          c_vol_had_service
          c_vol_had_price
          c_vol_price_year
          c_vol_price_frist
          c_vol_price
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
          d_enter_3
          d_enter_2
          d_enter_1
          d_cssa_expire
          d_couse_regdate
          d_come_HK
          d_birth
          d__estimate_date
          c_vol_training
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
          i_boys_inchi
          i_arrival_yrs
          d_update
          d_write
          d_udf_1
          d_renew_5
          d_renew_4
          d_renew_3
          d_renew_2
          d_renew_1
          i_boys_inhk
          i_edu_yrs
          i_used_reserve_quota
          i_used_checkout_quota
          i_udf_2
          i_udf_1
          i_total_HK
          i_total_China
          i_girls_inhk
          i_girls_inchi
          u_udf_1
          u_rent
          u_income
          o_photo
          m_vol_remarks
          m_udf_1
          m_spec
          m_ser
          m_res_stat
          m_res_env
          m_remarks
          m_md
          m_job_want
          m_econ
          m_dis
          m_contact
          m_addscom
          m_act
          i_vol_experience
          MemberRelation1 {
            c_mem_id_1
            c_mem_id_2
            d_effective
            relation
            uuid
            RelationMember1 {
              ID
              SSMA_TimeStamp
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
              c_cat
              c_care
              c_direct_code
              c_cssa_no
              c_couse_id
              c_couse_centre
              c_comefrom
              c_cis_id
              c_centre_id
              c_email
              c_edu
              c_emer_rel
              c_emer_re2
              c_emer_name3
              c_emer_name2
              c_emer_name
              c_emer_address3
              c_emer_address
              c_emer_address2
              c_emer_tel2_2
              c_emer_tel2_1
              c_emer_tel1_2
              c_emer_tel1_1
              c_emer_rem3
              c_emer_rel3
              c_emer_rem
              c_emer_rem2
              c_fill_name
              c_fileno_5
              c_fileno_4
              c_fileno_3
              c_fileno_1
              c_fax
              c_emer_tel3_2
              c_emer_tel3_1
              c_fileno_2
              c_lossjob_year
              c_job_title
              c_lib_position
              c_job_bef_retire
              c_job
              c_introsource
              c_intro_source
              c_group
              c_mem_relative_mem_name
              c_mem_relation
              c_mem_id
              c_mem_fee_5
              c_mem_fee_4
              c_mem_fee_3
              c_mem_fee_2
              c_mem_fee_1
              c_mar_stat
              c_mem_rep_name4
              c_mem_rep_name3
              c_mem_rep_name2
              c_mem_rep_name13
              c_mem_rep_name12
              c_mem_rep_name11
              c_mem_rep_name1
              c_mem_relative_memid
              c_mem_rep_name10
              c_pager
              c_name_other
              c_name
              c_mobile
              c_mo_tongue
              c_mem_rep_name9
              c_mem_rep_name8
              c_mem_rep_name7
              c_mem_rep_name6
              c_mem_rep_name5
              c_udf_1
              c_tel_com
              c_tel
              c_status_5
              c_status_4
              c_status_3
              c_status_2
              c_status_1
              c_res_nat
              c_sex
              c_res_class
              c_religion
              c_relative_memid
              c_refno
              c_photo_path
              c_vol_price
              c_vol_had_service
              c_vol_had_price
              c_vol_group
              c_vol_ID
              c_user_id
              c_update_user
              c_udf_6
              c_udf_5
              c_udf_4
              c_udf_3
              c_udf_2
              c_vol_skill_act
              c_vol_service_time
              c_vol_price_frist
              c_vol_price_year
              c_vol_price_year_frist
              c_vol_ser_unit
              c_vol_service_health
              c_vol_service_social
              c_vol_service_support
              d_enter_1
              d_cssa_expire
              d_couse_regdate
              d_come_HK
              d_birth
              d__estimate_date
              c_vol_training
              c_vol_skill_other
              c_vol_skill_music
              c_vol_skill_culture
              c_vol_skill_arts
              d_expired_3
              d_expired_2
              d_expired_1
              d_exit_5
              d_exit_4
              d_exit_3
              d_exit_2
              d_exit_1
              d_enter_5
              d_enter_4
              d_enter_3
              d_enter_2
              m_addscom
              m_act
              i_vol_experience
              i_used_reserve_quota
              i_used_checkout_quota
              i_udf_2
              i_total_HK
              i_udf_1
              i_total_China
              i_girls_inhk
              i_girls_inchi
              i_boys_inhk
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
              m_contact
              m_dis
              m_job_want
              m_econ
              m_md
              m_remarks
              m_res_env
              m_ser
              m_spec
              u_udf_1
              u_income
              u_rent
              m_udf_1
              m_vol_remarks
              o_photo
              m_res_stat
              i_edu_yrs
            }
            RelationMember2 {
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
              ID
              SSMA_TimeStamp
              c_mem_id
            }
          }
          MemberRelation2 {
            c_mem_id_1
            c_mem_id_2
            d_effective
            relation
            uuid
            RelationMember1 {
              ID
              SSMA_TimeStamp
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
              c_cat
              c_care
              c_direct_code
              c_cssa_no
              c_couse_id
              c_couse_centre
              c_comefrom
              c_cis_id
              c_centre_id
              c_email
              c_edu
              c_emer_rel
              c_emer_re2
              c_emer_name3
              c_emer_name2
              c_emer_name
              c_emer_address3
              c_emer_address
              c_emer_address2
              c_emer_tel2_2
              c_emer_tel2_1
              c_emer_tel1_2
              c_emer_tel1_1
              c_emer_rem3
              c_emer_rel3
              c_emer_rem
              c_emer_rem2
              c_fill_name
              c_fileno_5
              c_fileno_4
              c_fileno_3
              c_fileno_1
              c_fax
              c_emer_tel3_2
              c_emer_tel3_1
              c_fileno_2
              c_lossjob_year
              c_job_title
              c_lib_position
              c_job_bef_retire
              c_job
              c_introsource
              c_intro_source
              c_group
              c_mem_relative_mem_name
              c_mem_relation
              c_mem_id
              c_mem_fee_5
              c_mem_fee_4
              c_mem_fee_3
              c_mem_fee_2
              c_mem_fee_1
              c_mar_stat
              c_mem_rep_name4
              c_mem_rep_name3
              c_mem_rep_name2
              c_mem_rep_name13
              c_mem_rep_name12
              c_mem_rep_name11
              c_mem_rep_name1
              c_mem_relative_memid
              c_mem_rep_name10
              c_pager
              c_name_other
              c_name
              c_mobile
              c_mo_tongue
              c_mem_rep_name9
              c_mem_rep_name8
              c_mem_rep_name7
              c_mem_rep_name6
              c_mem_rep_name5
              c_udf_1
              c_tel_com
              c_tel
              c_status_5
              c_status_4
              c_status_3
              c_status_2
              c_status_1
              c_res_nat
              c_sex
              c_res_class
              c_religion
              c_relative_memid
              c_refno
              c_photo_path
              c_vol_price
              c_vol_had_service
              c_vol_had_price
              c_vol_group
              c_vol_ID
              c_user_id
              c_update_user
              c_udf_6
              c_udf_5
              c_udf_4
              c_udf_3
              c_udf_2
              c_vol_skill_act
              c_vol_service_time
              c_vol_price_frist
              c_vol_price_year
              c_vol_price_year_frist
              c_vol_ser_unit
              c_vol_service_health
              c_vol_service_social
              c_vol_service_support
              d_enter_1
              d_cssa_expire
              d_couse_regdate
              d_come_HK
              d_birth
              d__estimate_date
              c_vol_training
              c_vol_skill_other
              c_vol_skill_music
              c_vol_skill_culture
              c_vol_skill_arts
              d_expired_3
              d_expired_2
              d_expired_1
              d_exit_5
              d_exit_4
              d_exit_3
              d_exit_2
              d_exit_1
              d_enter_5
              d_enter_4
              d_enter_3
              d_enter_2
              m_addscom
              m_act
              i_vol_experience
              i_used_reserve_quota
              i_used_checkout_quota
              i_udf_2
              i_total_HK
              i_udf_1
              i_total_China
              i_girls_inhk
              i_girls_inchi
              i_boys_inhk
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
              m_contact
              m_dis
              m_job_want
              m_econ
              m_md
              m_remarks
              m_res_env
              m_ser
              m_spec
              u_udf_1
              u_income
              u_rent
              m_udf_1
              m_vol_remarks
              o_photo
              m_res_stat
              i_edu_yrs
            }
            RelationMember2 {
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
              ID
              SSMA_TimeStamp
              c_mem_id
            }
          }
        }
      }
    }
  `;

  /*
  // Mutation for toggling visibility
  const TOGGLE_VISIBILITY_MUTATION = gql`
    mutation toggleVisibility($IsShow: Int!, $GalleryID: Int!) {
      update_HTX_ClassGallery_by_pk(pk_columns: { GalleryID: $GalleryID }, _set: { IsShow: $IsShow }) {
        GalleryID
        IsShow
      }
    }`;

  const DELETE_GALLERY_MUTATION = gql`
    mutation delGallery($GalleryID: Int!) {
      delete_HTX_ClassGallery_by_pk(GalleryID: $GalleryID) {
        GalleryID
      }
    }`

  // Define the renameGallery mutation
  const RENAME_GALLERY_MUTATION = gql`
    mutation RenameGallery($GalleryID: Int!, $GalleryName: String!) {
      update_HTX_ClassGallery_by_pk(pk_columns: {GalleryID: $GalleryID}, _set: {GalleryName: $GalleryName}) {
        GalleryID
        GalleryName
      }
    }
    `;

  // Define the updateCover mutation
  const UPDATE_COVER_MUTATION = gql`
    mutation UpdateCover($GalleryID: Int!, $CoverPic: String!) {
      update_HTX_ClassGallery_by_pk(pk_columns: {GalleryID: $GalleryID}, _set: {CoverPic: $CoverPic}) {
        GalleryID
        CoverPic
      }
    }`;

  // Define the addGallery mutation
  const ADD_GALLERY = gql`
    mutation AddGallery($GalleryName: String!, $GalleryNameEN: String!) {
      insert_HTX_ClassGallery_one(object: { GalleryName: $GalleryName, GalleryNameEN: $GalleryNameEN }) {
        GalleryID
        GalleryName
      }
    }
  `;
    */

  /*
  // Use the useMutation hook to create a deleteGallery mutation
  const { mutate: deleteGallery, onError: onError_deleteGallery } = useMutation(DELETE_GALLERY_MUTATION, {
    update: (cache, { data: { delete_HTX_ClassGallery_by_pk } }) => {
      // Read the data from our cache for this query.
      const existingData = cache.readQuery({
        query: GET_GALLERIES,
        variables: galleryID.value ? { galleryID: galleryID.value } : {}
      });

      if (existingData) {
        // Filter out the deleted gallery
        const updatedGalleries = existingData.HTX_ClassGallery.filter(
          gallery => gallery.GalleryID !== delete_HTX_ClassGallery_by_pk.GalleryID
        );

        // Write our data back to the cache.
        cache.writeQuery({
          query: GET_GALLERIES,
          variables: galleryID.value ? { galleryID: galleryID.value } : {},
          data: {
            ...existingData,
            HTX_ClassGallery: updatedGalleries
          },
        });
      }
    },
  });

  // Use the useMutation hook to create an addGallery mutation
  const { mutate: addGallery, onError: onError_addGallery } = useMutation(ADD_GALLERY, {
    // Update function to modify the cache after the mutation
    update: (cache, { data: { insert_HTX_ClassGallery_one } }) => {
      // Read the data from our cache for this query.
      const existingGalleries = cache.readQuery({ query: GET_GALLERIES });

      // Check if the data is in the cache
      if (existingGalleries) {
        // Add the new gallery to the cache
        const updatedGalleries = [...existingGalleries.HTX_ClassGallery, insert_HTX_ClassGallery_one];

        // Write our data back to the cache.
        cache.writeQuery({
          query: GET_GALLERIES,
          data: {
            HTX_ClassGallery: updatedGalleries
          },
        });
      }
    },
  });

  // Use the useMutation hook to create an updateCover mutation
  const { mutate: updateCover, onError: onError_updateCover } = useMutation(UPDATE_COVER_MUTATION, {
    // Update function to modify the cache after the mutation
    update: (cache, { data: { update_HTX_ClassGallery_by_pk } }) => {
      // Read the data from our cache for this query.
      const existingGalleries = cache.readQuery({ query: GET_GALLERIES });

      // Check if the data is in the cache
      if (existingGalleries) {
        // Find the gallery we just updated
        const galleryIndex = existingGalleries.HTX_ClassGallery.findIndex(gallery => gallery.GalleryID === update_HTX_ClassGallery_by_pk.GalleryID);

        if (galleryIndex > -1) {
          // Update its CoverPic property
          const updatedGalleries = [...existingGalleries.HTX_ClassGallery];
          updatedGalleries[galleryIndex].CoverPic = update_HTX_ClassGallery_by_pk.CoverPic;

          // Write our data back to the cache.
          cache.writeQuery({
            query: GET_GALLERIES,
            data: { ...existingGalleries, HTX_ClassGallery: updatedGalleries },
          });
        }
      }
    },
  });

  // Use the useMutation hook to create a renameGallery mutation
  const { mutate: renameGallery, onError: onError_renameGallery } = useMutation(RENAME_GALLERY_MUTATION, {
    // Update function to modify the cache after the mutation
    update: (cache, { data: { update_HTX_ClassGallery_by_pk } }) => {
      // Read the data from our cache for this query.
      const existingGalleries = cache.readQuery({ query: GET_GALLERIES });

      // Check if the data is in the cache
      if (existingGalleries) {
        // Find the gallery we just updated
        const galleryIndex = existingGalleries.HTX_ClassGallery.findIndex(gallery => gallery.GalleryID === update_HTX_ClassGallery_by_pk.GalleryID);

        if (galleryIndex > -1) {
          // Update its GalleryName property
          const updatedGalleries = [...existingGalleries.HTX_ClassGallery];
          updatedGalleries[galleryIndex].GalleryName = update_HTX_ClassGallery_by_pk.GalleryName;

          // Write our data back to the cache.
          cache.writeQuery({
            query: GET_GALLERIES,
            data: { ...existingGalleries, HTX_ClassGallery: updatedGalleries },
          });
        }
      }
    },
  });

  // Update function to modify the cache after the mutation
  const { mutate: toggleVisibility, onError: onError_toggleVisibility } = useMutation(TOGGLE_VISIBILITY_MUTATION, {
      update: (cache, { data: { update_HTX_ClassGallery_by_pk } }) => {
        const existingGalleries = cache.readQuery({ query: GET_GALLERIES });

        // Check if the data is in the cache
        if (existingGalleries) {
          // Find the gallery we just updated
          const galleryIndex = existingGalleries.HTX_ClassGallery.findIndex(gallery => gallery.GalleryID === update_HTX_ClassGallery_by_pk.GalleryID);

          if (galleryIndex > -1) {
            // Update its IsShow property
            const updatedGalleries = [...existingGalleries.HTX_ClassGallery];
            updatedGalleries[galleryIndex].IsShow = update_HTX_ClassGallery_by_pk.IsShow;

            // Write our data back to the cache.
            cache.writeQuery({
              query: GET_GALLERIES,
              data: { ...existingGalleries, HTX_ClassGallery: updatedGalleries },
            });
          }
        }
      },
    });

  // Function to delete a gallery by its ID
  const deleteGalleryById = async (galleryID) => {
    // Increment the number of pending async operations
    awaitNumber.value++;
    try {
      const coverResponse = await axios.delete(baseURL, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'path': 'ClassGalleryCover/'+galleryID
        }})
      const response = await axios.delete(baseURL, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          path: 'ClassGalleryPhotos/'+galleryID
        }})

      // Call the deleteGallery mutation
      await deleteGallery({
        GalleryID: galleryID
      });
    } catch (error) {
      console.error(error);
    } finally {
      // Decrement the number of pending async operations
      awaitNumber.value--;
    }
  };

  // Function to toggle the visibility of a gallery
  const toggleVisibilityById = async (galleryID) => {
    // Increment the number of pending async operations
    awaitNumber.value++;
    try {
      // Call the toggleVisibility mutation
      await toggleVisibility({
        GalleryID: galleryID,
        IsShow: result.value.find((element) => element.GalleryID == galleryID).IsShow == 1? 0: 1
      });
    } catch (error) {
      console.error(error);
    } finally {
      // Decrement the number of pending async operations
      awaitNumber.value--;
    }
  };

  // Function to toggle the visibility of a gallery
  const renameGalleryById = async (options) => {
    const { GalleryID, GalleryName } = options;
    // Increment the number of pending async operations
    awaitNumber.value++;
    try {
      // Call the toggleVisibility mutation
      await renameGallery({
        GalleryID: GalleryID,
        GalleryName: GalleryName
      });
    } catch (error) {
      console.error(error);
    } finally {
      // Decrement the number of pending async operations
      awaitNumber.value--;
    }
  };

  // Function to toggle the visibility of a gallery
  const updateCoverById = async (options) => {
    const { GalleryID, CoverPic } = options;
    // Increment the number of pending async operations
    awaitNumber.value++;
    try {
      // Call the toggleVisibility mutation
      await updateCover({
        GalleryID: GalleryID,
        CoverPic: CoverPic
      });
    } catch (error) {
      console.error(error);
    } finally {
      // Decrement the number of pending async operations
      awaitNumber.value--;
    }
  };

  // Function to toggle the visibility of a gallery
  const addNewGallery = async (GalleryName) => {
    //const { GalleryName } = options;
    // Increment the number of pending async operations
    awaitNumber.value++;
    try {
      // Call the toggleVisibility mutation
      await addGallery({
        GalleryName: GalleryName,
        GalleryNameEN: GalleryName,
      });
    } catch (error) {
      console.error(error);
    } finally {
      // Decrement the number of pending async operations
      awaitNumber.value--;
    }
  };

  onError_deleteGallery((error) => {
    // Handle error
    console.error("刪除相薄失敗", error)
  });

  onError_toggleVisibility((error) => {
    // Handle error
    console.error("隱藏顯示相簿失敗", error)
  });

  // Handle error for renameGallery
  onError_renameGallery((error) => {
    // Handle error
    console.error("Renaming gallery failed", error)
  });

  // Handle error for updateCover
  onError_updateCover((error) => {
    // Handle error
    console.error("Updating cover failed", error)
  });

  // Handle error for addGallery
  onError_addGallery((error) => {
    // Handle error
    console.error("Adding gallery failed", error)
  });
  */
  // Function to execute the query
  const execute = async () => {
    // console.log(c_act_code)
    awaitNumber.value++;
    const { onResult } = useQuery(GET_APPLICANT, () => ({
      c_act_code: c_act_code.value,
    }));

    onResult((res) => {
      if (res.data) {
        result.value = [];
        res.data.tbl_act_reg.forEach((data) => {
          const m = new Member(data.EventRegistration_to_Member);

          result.value.push({
            ID: data.ID,
            b_refund: data.b_refund,
            c_act_code: data.c_act_code,
            c_mem_id: data.c_mem_id,
            c_bus: data.c_bus,
            c_period: data.c_period,
            c_name: data.c_name,
            c_receipt_no: data.c_receipt_no,
            c_remarks: data.c_remarks,
            c_sex: data.c_sex,
            c_tbl: data.c_tbl,
            c_tel: data.c_tel,
            c_type: data.c_type,
            c_user_id: data.c_user_id,
            d_refund: data.d_refund,
            d_reg: data.d_reg,
            i_age: data.i_age,
            i_bus_no: data.i_bus_no,
            i_tbl_no: data.i_tbl_no,
            MemberData: m,
          });
        });
        awaitNumber.value--;
      }
    });
  };

  // Execute the query
  execute();

  // Return the provided data and functions
  //return { result, loading, deleteGalleryById, toggleVisibilityById, refetch: execute, renameGalleryById, updateCoverById, addNewGallery };
  return { result, loading };
}
