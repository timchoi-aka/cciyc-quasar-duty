import { date } from "quasar";

class Member {
  constructor(o = {}) {
    // assign the following fields to the object
    if (o) {
      this.b_birth_InHK = o.b_birth_InHK ? o.b_birth_InHK : "";
      this.b_cssa = o.b_cssa ? o.b_cssa : "";
      this.b_emailcontact = o.b_emailcontact ? o.b_emailcontact : "";
      this.b_estimate = o.b_estimate ? o.b_estimate : "";
      this.b_family = o.b_family ? o.b_family : "";
      this.b_finish = o.b_finish ? o.b_finish : "";
      this.b_getElderCard = o.b_getElderCard ? o.b_getElderCard : "";
      this.b_getsafebell = o.b_getsafebell ? o.b_getsafebell : "";
      this.b_instructor = o.b_instructor ? o.b_instructor : "";
      this.b_lib_user = o.b_lib_user ? o.b_lib_user : "";
      this.b_mem_type1 = o.b_mem_type1 ? o.b_mem_type1 : "";
      this.b_mem_type10 = o.b_mem_type10 ? o.b_mem_type10 : "";
      this.b_mem_type11 = o.b_mem_type11 ? o.b_mem_type11 : "";
      this.b_mem_type12 = o.b_mem_type12 ? o.b_mem_type12 : "";
      this.b_mem_type13 = o.b_mem_type13 ? o.b_mem_type13 : "";
      this.b_mem_type2 = o.b_mem_type2 ? o.b_mem_type2 : "";
      this.b_mem_type3 = o.b_mem_type3 ? o.b_mem_type3 : "";
      this.b_mem_type4 = o.b_mem_type4 ? o.b_mem_type4 : "";
      this.b_mem_type5 = o.b_mem_type5 ? o.b_mem_type5 : "";
      this.b_mem_type6 = o.b_mem_type6 ? o.b_mem_type6 : "";
      this.b_mem_type7 = o.b_mem_type7 ? o.b_mem_type7 : "";
      this.b_mem_type8 = o.b_mem_type8 ? o.b_mem_type8 : "";
      this.b_mem_type9 = o.b_mem_type9 ? o.b_mem_type9 : "";
      this.b_memcard = o.b_memcard ? o.b_memcard : "";
      this.b_missed = o.b_missed ? o.b_missed : "";
      this.b_notcheckdata = o.b_notcheckdata ? o.b_notcheckdata : "";
      this.b_receive_publish = o.b_receive_publish ? o.b_receive_publish : "";
      this.b_single_family = o.b_single_family ? o.b_single_family : "";
      this.b_teamcontact = o.b_teamcontact ? o.b_teamcontact : "";
      this.b_udf_1 = o.b_udf_1 ? o.b_udf_1 : "";
      this.b_visit = o.b_visit ? o.b_visit : "";
      this.c_HAD = o.c_HAD ? o.c_HAD : "";
      this.c_HKID = o.c_HKID ? o.c_HKID : "";
      this.c_adds_Bdt = o.c_adds_Bdt ? o.c_adds_Bdt : "";
      this.c_adds_RM = o.c_adds_RM ? o.c_adds_RM : "";
      this.c_adds_area = o.c_adds_area ? o.c_adds_area : "";
      this.c_adds_block = o.c_adds_block ? o.c_adds_block : "";
      this.c_adds_district = o.c_adds_district ? o.c_adds_district : "";
      this.c_adds_est = o.c_adds_est ? o.c_adds_est : "";
      this.c_adds_floor = o.c_adds_floor ? o.c_adds_floor : "";
      this.c_adds_street = o.c_adds_street ? o.c_adds_street : "";
      this.c_barcode = o.c_barcode ? o.c_barcode : "";
      this.c_card_remarks = o.c_card_remarks ? o.c_card_remarks : "";
      this.c_care = o.c_care ? o.c_care : "";
      this.c_cat = o.c_cat ? o.c_cat : "";
      this.c_centre_id = o.c_centre_id ? o.c_centre_id : "";
      this.c_cis_id = o.c_cis_id ? o.c_cis_id : "";
      this.c_comefrom = o.c_comefrom ? o.c_comefrom : "";
      this.c_couse_centre = o.c_couse_centre ? o.c_couse_centre : "";
      this.c_couse_id = o.c_couse_id ? o.c_couse_id : "";
      this.c_cssa_no = o.c_cssa_no ? o.c_cssa_no : "";
      this.c_direct_code = o.c_direct_code ? o.c_direct_code : "";
      this.c_edu = o.c_edu ? o.c_edu : "";
      this.c_email = o.c_email ? o.c_email : "";
      this.c_emer_address = o.c_emer_address ? o.c_emer_address : "";
      this.c_emer_address2 = o.c_emer_address2 ? o.c_emer_address2 : "";
      this.c_emer_address3 = o.c_emer_address3 ? o.c_emer_address3 : "";
      this.c_emer_name = o.c_emer_name ? o.c_emer_name : "";
      this.c_emer_name2 = o.c_emer_name2 ? o.c_emer_name2 : "";
      this.c_emer_name3 = o.c_emer_name3 ? o.c_emer_name3 : "";
      this.c_emer_re2 = o.c_emer_re2 ? o.c_emer_re2 : "";
      this.c_emer_rel = o.c_emer_rel ? o.c_emer_rel : "";
      this.c_emer_rel3 = o.c_emer_rel3 ? o.c_emer_rel3 : "";
      this.c_emer_rem = o.c_emer_rem ? o.c_emer_rem : "";
      this.c_emer_rem2 = o.c_emer_rem2 ? o.c_emer_rem2 : "";
      this.c_emer_rem3 = o.c_emer_rem3 ? o.c_emer_rem3 : "";
      this.c_emer_tel1_1 = o.c_emer_tel1_1 ? o.c_emer_tel1_1 : "";
      this.c_emer_tel1_2 = o.c_emer_tel1_2 ? o.c_emer_tel1_2 : "";
      this.c_emer_tel2_1 = o.c_emer_tel2_1 ? o.c_emer_tel2_1 : "";
      this.c_emer_tel2_2 = o.c_emer_tel2_2 ? o.c_emer_tel2_2 : "";
      this.c_emer_tel3_1 = o.c_emer_tel3_1 ? o.c_emer_tel3_1 : "";
      this.c_emer_tel3_2 = o.c_emer_tel3_2 ? o.c_emer_tel3_2 : "";
      this.c_fax = o.c_fax ? o.c_fax : "";
      this.c_fileno_1 = o.c_fileno_1 ? o.c_fileno_1 : "";
      this.c_fileno_2 = o.c_fileno_2 ? o.c_fileno_2 : "";
      this.c_fileno_3 = o.c_fileno_3 ? o.c_fileno_3 : "";
      this.c_fileno_4 = o.c_fileno_4 ? o.c_fileno_4 : "";
      this.c_fileno_5 = o.c_fileno_5 ? o.c_fileno_5 : "";
      this.c_fill_name = o.c_fill_name ? o.c_fill_name : "";
      this.c_group = o.c_group ? o.c_group : "";
      this.c_intro_source = o.c_intro_source ? o.c_intro_source : "";
      this.c_introsource = o.c_introsource ? o.c_introsource : "";
      this.c_job = o.c_job ? o.c_job : "";
      this.c_job_bef_retire = o.c_job_bef_retire ? o.c_job_bef_retire : "";
      this.c_job_title = o.c_job_title ? o.c_job_title : "";
      this.c_lib_position = o.c_lib_position ? o.c_lib_position : "";
      this.c_lossjob_year = o.c_lossjob_year ? o.c_lossjob_year : "";
      this.c_mar_stat = o.c_mar_stat ? o.c_mar_stat : "";
      this.c_mem_fee_1 = o.c_mem_fee_1 ? o.c_mem_fee_1 : "";
      this.c_mem_fee_2 = o.c_mem_fee_2 ? o.c_mem_fee_2 : "";
      this.c_mem_fee_3 = o.c_mem_fee_3 ? o.c_mem_fee_3 : "";
      this.c_mem_fee_4 = o.c_mem_fee_4 ? o.c_mem_fee_4 : "";
      this.c_mem_fee_5 = o.c_mem_fee_5 ? o.c_mem_fee_5 : "";
      this.c_mem_relation = o.c_mem_relation ? o.c_mem_relation : "";
      this.c_mem_relative_mem_name = o.c_mem_relative_mem_name
        ? o.c_mem_relative_mem_name
        : "";
      this.c_mem_relative_memid = o.c_mem_relative_memid
        ? o.c_mem_relative_memid
        : "";
      this.c_mem_rep_name1 = o.c_mem_rep_name1 ? o.c_mem_rep_name1 : "";
      this.c_mem_rep_name10 = o.c_mem_rep_name10 ? o.c_mem_rep_name10 : "";
      this.c_mem_rep_name11 = o.c_mem_rep_name11 ? o.c_mem_rep_name11 : "";
      this.c_mem_rep_name12 = o.c_mem_rep_name12 ? o.c_mem_rep_name12 : "";
      this.c_mem_rep_name13 = o.c_mem_rep_name13 ? o.c_mem_rep_name13 : "";
      this.c_mem_rep_name2 = o.c_mem_rep_name2 ? o.c_mem_rep_name2 : "";
      this.c_mem_rep_name3 = o.c_mem_rep_name3 ? o.c_mem_rep_name3 : "";
      this.c_mem_rep_name4 = o.c_mem_rep_name4 ? o.c_mem_rep_name4 : "";
      this.c_mem_rep_name5 = o.c_mem_rep_name5 ? o.c_mem_rep_name5 : "";
      this.c_mem_rep_name6 = o.c_mem_rep_name6 ? o.c_mem_rep_name6 : "";
      this.c_mem_rep_name7 = o.c_mem_rep_name7 ? o.c_mem_rep_name7 : "";
      this.c_mem_rep_name8 = o.c_mem_rep_name8 ? o.c_mem_rep_name8 : "";
      this.c_mem_rep_name9 = o.c_mem_rep_name9 ? o.c_mem_rep_name9 : "";
      this.c_mo_tongue = o.c_mo_tongue ? o.c_mo_tongue : "";
      this.c_mobile = o.c_mobile ? o.c_mobile : "";
      this.c_name = o.c_name ? o.c_name : "";
      this.c_name_other = o.c_name_other ? o.c_name_other : "";
      this.c_pager = o.c_pager ? o.c_pager : "";
      this.c_photo_path = o.c_photo_path ? o.c_photo_path : "";
      this.c_refno = o.c_refno ? o.c_refno : "";
      this.c_relative_memid = o.c_relative_memid ? o.c_relative_memid : "";
      this.c_religion = o.c_religion ? o.c_religion : "";
      this.c_res_class = o.c_res_class ? o.c_res_class : "";
      this.c_res_nat = o.c_res_nat ? o.c_res_nat : "";
      this.c_sex = o.c_sex ? o.c_sex : "";
      this.c_status_1 = o.c_status_1 ? o.c_status_1 : "";
      this.c_status_2 = o.c_status_2 ? o.c_status_2 : "";
      this.c_status_3 = o.c_status_3 ? o.c_status_3 : "";
      this.c_status_4 = o.c_status_4 ? o.c_status_4 : "";
      this.c_status_5 = o.c_status_5 ? o.c_status_5 : "";
      this.c_tel = o.c_tel ? o.c_tel : "";
      this.c_tel_com = o.c_tel_com ? o.c_tel_com : "";
      this.c_udf_1 = o.c_udf_1 ? o.c_udf_1 : "";
      this.c_udf_2 = o.c_udf_2 ? o.c_udf_2 : "";
      this.c_udf_3 = o.c_udf_3 ? o.c_udf_3 : "";
      this.c_udf_4 = o.c_udf_4 ? o.c_udf_4 : "";
      this.c_udf_5 = o.c_udf_5 ? o.c_udf_5 : "";
      this.c_udf_6 = o.c_udf_6 ? o.c_udf_6 : "";
      this.c_update_user = o.c_update_user ? o.c_update_user : "";
      this.c_user_id = o.c_user_id ? o.c_user_id : "";
      this.c_vol_ID = o.c_vol_ID ? o.c_vol_ID : "";
      this.c_vol_group = o.c_vol_group ? o.c_vol_group : "";
      this.c_vol_had_price = o.c_vol_had_price ? o.c_vol_had_price : "";
      this.c_vol_had_service = o.c_vol_had_service ? o.c_vol_had_service : "";
      this.c_vol_price = o.c_vol_price ? o.c_vol_price : "";
      this.c_vol_price_frist = o.c_vol_price_frist ? o.c_vol_price_frist : "";
      this.c_vol_price_year = o.c_vol_price_year ? o.c_vol_price_year : "";
      this.c_vol_price_year_frist = o.c_vol_price_year_frist
        ? o.c_vol_price_year_frist
        : "";
      this.c_vol_ser_unit = o.c_vol_ser_unit ? o.c_vol_ser_unit : "";
      this.c_vol_service_health = o.c_vol_service_health
        ? o.c_vol_service_health
        : "";
      this.c_vol_service_social = o.c_vol_service_social
        ? o.c_vol_service_social
        : "";
      this.c_vol_service_support = o.c_vol_service_support
        ? o.c_vol_service_support
        : "";
      this.c_vol_service_time = o.c_vol_service_time
        ? o.c_vol_service_time
        : "";
      this.c_vol_skill_act = o.c_vol_skill_act ? o.c_vol_skill_act : "";
      this.c_vol_skill_arts = o.c_vol_skill_arts ? o.c_vol_skill_arts : "";
      this.c_vol_skill_culture = o.c_vol_skill_culture
        ? o.c_vol_skill_culture
        : "";
      this.c_vol_skill_music = o.c_vol_skill_music ? o.c_vol_skill_music : "";
      this.c_vol_skill_other = o.c_vol_skill_other ? o.c_vol_skill_other : "";
      this.c_vol_training = o.c_vol_training ? o.c_vol_training : "";
      this.d__estimate_date = o.d__estimate_date ? o.d__estimate_date : "";
      this.d_birth = o.d_birth ? o.d_birth : "";
      this.d_come_HK = o.d_come_HK ? o.d_come_HK : "";
      this.d_couse_regdate = o.d_couse_regdate ? o.d_couse_regdate : "";
      this.d_cssa_expire = o.d_cssa_expire ? o.d_cssa_expire : "";
      this.d_enter_1 = o.d_enter_1 ? o.d_enter_1 : "";
      this.d_enter_2 = o.d_enter_2 ? o.d_enter_2 : "";
      this.d_enter_3 = o.d_enter_3 ? o.d_enter_3 : "";
      this.d_enter_4 = o.d_enter_4 ? o.d_enter_4 : "";
      this.d_enter_5 = o.d_enter_5 ? o.d_enter_5 : "";
      this.d_exit_1 = o.d_exit_1 ? o.d_exit_1 : "";
      this.d_exit_2 = o.d_exit_2 ? o.d_exit_2 : "";
      this.d_exit_3 = o.d_exit_3 ? o.d_exit_3 : "";
      this.d_exit_4 = o.d_exit_4 ? o.d_exit_4 : "";
      this.d_exit_5 = o.d_exit_5 ? o.d_exit_5 : "";
      this.d_expired_1 = o.d_expired_1 ? o.d_expired_1 : "";
      this.d_expired_2 = o.d_expired_2 ? o.d_expired_2 : "";
      this.d_expired_3 = o.d_expired_3 ? o.d_expired_3 : "";
      this.d_expired_4 = o.d_expired_4 ? o.d_expired_4 : "";
      this.d_expired_5 = o.d_expired_5 ? o.d_expired_5 : "";
      this.d_lossjobDate = o.d_lossjobDate ? o.d_lossjobDate : "";
      this.d_renew_1 = o.d_renew_1 ? o.d_renew_1 : "";
      this.d_renew_2 = o.d_renew_2 ? o.d_renew_2 : "";
      this.d_renew_3 = o.d_renew_3 ? o.d_renew_3 : "";
      this.d_renew_4 = o.d_renew_4 ? o.d_renew_4 : "";
      this.d_renew_5 = o.d_renew_5 ? o.d_renew_5 : "";
      this.d_udf_1 = o.d_udf_1 ? o.d_udf_1 : "";
      this.d_update = o.d_update ? o.d_update : "";
      this.d_write = o.d_write ? o.d_write : "";
      this.i_arrival_yrs = o.i_arrival_yrs ? o.i_arrival_yrs : "";
      this.i_boys_inchi = o.i_boys_inchi ? o.i_boys_inchi : "";
      this.i_boys_inhk = o.i_boys_inhk ? o.i_boys_inhk : "";
      this.i_edu_yrs = o.i_edu_yrs ? o.i_edu_yrs : "";
      this.i_girls_inchi = o.i_girls_inchi ? o.i_girls_inchi : "";
      this.i_girls_inhk = o.i_girls_inhk ? o.i_girls_inhk : "";
      this.i_total_China = o.i_total_China ? o.i_total_China : "";
      this.i_total_HK = o.i_total_HK ? o.i_total_HK : "";
      this.i_udf_1 = o.i_udf_1 ? o.i_udf_1 : "";
      this.i_udf_2 = o.i_udf_2 ? o.i_udf_2 : "";
      this.i_used_checkout_quota = o.i_used_checkout_quota
        ? o.i_used_checkout_quota
        : "";
      this.i_used_reserve_quota = o.i_used_reserve_quota
        ? o.i_used_reserve_quota
        : "";
      this.i_vol_experience = o.i_vol_experience ? o.i_vol_experience : "";
      this.m_act = o.m_act ? o.m_act : "";
      this.m_addscom = o.m_addscom ? o.m_addscom : "";
      this.m_contact = o.m_contact ? o.m_contact : "";
      this.m_dis = o.m_dis ? o.m_dis : "";
      this.m_econ = o.m_econ ? o.m_econ : "";
      this.m_job_want = o.m_job_want ? o.m_job_want : "";
      this.m_md = o.m_md ? o.m_md : "";
      this.m_remarks = o.m_remarks ? o.m_remarks : "";
      this.m_res_env = o.m_res_env ? o.m_res_env : "";
      this.m_res_stat = o.m_res_stat ? o.m_res_stat : "";
      this.m_ser = o.m_ser ? o.m_ser : "";
      this.m_spec = o.m_spec ? o.m_spec : "";
      this.m_udf_1 = o.m_udf_1 ? o.m_udf_1 : "";
      this.m_vol_remarks = o.m_vol_remarks ? o.m_vol_remarks : "";
      this.o_photo = o.o_photo ? o.o_photo : "";
      this.u_income = o.u_income ? o.u_income : "";
      this.u_rent = o.u_rent ? o.u_rent : "";
      this.u_udf_1 = o.u_udf_1 ? o.u_udf_1 : "";
      this.c_mem_id = o.c_mem_id ? o.c_mem_id : "";
      this.MemberRelation1 = o.MemberRelation1 ? o.MemberRelation1 : [];
      this.MemberRelation2 = o.MemberRelation2 ? o.MemberRelation2 : [];
    }
  }

  /* determine if the member is a youth in the month of the asOfDate
   * youth = aged between 15 - 24
   */
  isYouth(asOfDate) {
    return date.isBetweenDates(
      date.extractDate(this.d_birth, "YYYY-MM-DD"),
      date.startOfDate(date.subtractFromDate(asOfDate, { years: 25 }), "month"),
      date.endOfDate(date.subtractFromDate(asOfDate, { years: 15 }), "month"),
      {
        inclusiveFrom: true,
        inclusiveTo: true,
      }
    );
  }

  /* determine if the member is a youth at asOfDate
   * youth = aged between 15 - 24
   */
  isYouthAsOfDate(asOfDate) {
    return date.isBetweenDates(
      date.extractDate(this.d_birth, "YYYY-MM-DD"),
      date.subtractFromDate(asOfDate, { years: 25 }),
      date.subtractFromDate(asOfDate, { years: 15 }),
      {
        inclusiveFrom: true,
        inclusiveTo: true,
      }
    );
  }

  /* determine if the member is a youth family in the month of the asOfDate
   * youth family = a family member of a youth
   */
  isYouthFamily(asOfDate) {
    let isYouthFamily = false;
    let combinedRelation = [...this.MemberRelation1, ...this.MemberRelation2];
    combinedRelation.forEach((relation) => {
      let relatedMember = null;
      if (this.c_mem_id == relation.c_mem_id_1) {
        // if the member is the first person in the relation
        relatedMember = new Member(relation.RelationMember2);
      } else if (this.c_mem_id == relation.c_mem_id_2) {
        // if the member is the second person in the relation
        relatedMember = new Member(relation.RelationMember1);
      }

      if (
        relatedMember.isYouth(asOfDate) &&
        relatedMember.isActive(asOfDate) &&
        date.getDateDiff(relation.d_effective, asOfDate) <= 0
      ) {
        isYouthFamily = true;
      }
    });
    return isYouthFamily;
  }

  /* determine if the member is a youth family at asOfDate
   * youth family = a family member of a youth
   */
  isYouthFamilyAsOfDate(asOfDate) {
    let isYouthFamily = false;
    let combinedRelation = [...this.MemberRelation1, ...this.MemberRelation2];
    combinedRelation.forEach((relation) => {
      let relatedMember = null;
      if (this.c_mem_id == relation.c_mem_id_1) {
        // if the member is the first person in the relation
        relatedMember = new Member(relation.RelationMember2);
      } else if (this.c_mem_id == relation.c_mem_id_2) {
        // if the member is the second person in the relation
        relatedMember = new Member(relation.RelationMember1);
      }

      if (
        relatedMember.isYouthAsOfDate(asOfDate) &&
        relatedMember.isActive(asOfDate) &&
        date.getDateDiff(relation.d_effective, asOfDate) <= 0
      ) {
        isYouthFamily = true;
      }
    });
    return isYouthFamily;
  }

  getAge(asOfDate) {
    if (!this.d_birth || !date.isValid(this.d_birth) || !date.isValid(asOfDate))
      return 0;
    let birth = date.adjustDate(this.d_birth, { year: asOfDate.getFullYear() });
    let offset = date.getDateDiff(asOfDate, birth, "days") < 0 ? -1 : 0;
    return (
      date.getDateDiff(
        asOfDate,
        date.extractDate(this.d_birth, "YYYY-MM-DD"),
        "years"
      ) + offset
    );
  }

  isActive(asOfDate) {
    return (
      (this.d_exit_1 == null || this.d_exit_1 == "") &&
      (this.d_expired_1 == null ||
        this.d_expired_1 == "" ||
        date.getDateDiff(
          asOfDate,
          date.extractDate(this.d_expired_1, "YYYY-MM-DD")
        ) < 0)
    );
  }
}

export default Member;
