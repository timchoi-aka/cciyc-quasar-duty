import { gql } from "graphql-tag"

export const EVENT_GET_COUNT = gql`
subscription EVENT_GET_COUNT {
  HTX_Event_aggregate(offset: 1) {
    aggregate {
      count
    }
  }
}`

export const EVENT_GET_ALL_WITH_LIMIT  = gql`
  query getEvent($offset: Int!, $limit: Int!) {
    HTX_Event(order_by: {c_act_code: desc}, offset: $offset, limit: $limit) {
      c_act_code
    }
  }`

export const EVENT_GET_ALL = gql`
  query getEvent {
    HTX_Event(order_by: {c_act_code: desc}, offset: 1) {
      c_act_code
      c_act_name
      c_nature
      c_respon
      c_type
      c_status
      c_group1
      c_group2
      c_acc_type
    }
  }`

export const EVENT_GET_ALL_ACTIVE = gql`
  query getEvent {
    HTX_Event(order_by: {c_act_code: desc}, offset: 1, where: {c_status: {_eq: "未完成"}}) {
      c_act_code
      c_act_name
      c_nature
      c_respon
      c_type
      c_status
      c_group1
      c_group2
      c_acc_type
    }
  }`


export const EVENT_SEARCH = gql`
query Event($condition: HTX_Event_bool_exp = {c_act_code: {_eq: ""}}) {
  HTX_Event(order_by: {c_act_code: desc}, where: $condition) {
    c_act_code
    c_act_name
    c_nature
    c_respon
    c_type
    c_status
    c_group1
    c_group2
    c_acc_type
  }
}`

export const EVENT_FEE_BY_PK = gql`
query EVENT_FEE_BY_PK($c_act_code: String) {
  tbl_act_fee(where: {c_act_code: {_eq: $c_act_code}}) {
    c_act_code
    c_type
    u_fee
  }
}`

export const EVENT_STAT_BY_PK = gql`
query EVENT_STAT_BY_PK($c_act_code: String) {
  tbl_act_session(where: {c_act_code: {_eq: $c_act_code}}) {
    i_number
    i_number_a
    i_number_b
    i_number_c
    i_people_count
    i_people_count_a
    i_people_count_b
    i_people_count_c
    d_act
  }
}
`

export const EVENT_BY_PK = gql`
query Event($c_act_code: String!) {
  HTX_Event_by_pk(c_act_code: $c_act_code) {
    EventClassID
    Gen_m_remark
    IsShow
    b_can_repeat_reg
    b_course
    b_finish
    b_freeofcharge
    b_not_change_price
    b_open_oth
    b_open_own
    b_print_age
    b_print_birth
    b_print_no_period
    b_print_other
    b_print_time
    c_acc_type
    c_act_name
    c_act_nameen
    c_acttype_control
    c_acttype_together
    c_age_control
    c_apply_code
    c_appraises
    c_centre_id
    c_check_acttype
    c_check_memtype
    c_checksex
    c_corwithmember
    c_course_level
    c_course_no
    c_course_tutor
    c_course_tutor2
    c_course_tutor3
    c_course_tutor4
    c_course_type
    c_dest
    c_end_collect
    c_finish_goal
    c_group1
    c_group2
    c_memtype_control
    c_nature
    c_open_other
    c_ref
    c_remind_header
    c_respon
    c_respon2
    c_sex_control
    c_start_collect
    c_status
    c_subsidizes
    c_type
    c_user_id
    c_vol_level_1
    c_vol_level_2
    c_vol_level_3
    c_week
    c_whojoin
    c_worker
    c_worker2
    d_close
    d_date_from
    d_date_to
    d_finish_goal
    d_open
    d_sale_end
    d_sale_start
    d_time_from
    d_time_to
    i_course_credit1
    i_course_credit2
    i_course_credit3
    i_course_credit4
    i_course_credit5
    i_lessons
    i_lessons_attend1
    i_lessons_attend2
    i_lessons_attend3
    i_lessons_attend4
    i_lessons_attend5
    i_quota_cssa_max
    i_quota_max
    i_success_percent
    i_year_from
    i_year_to
    m_appraises_rem
    m_content
    m_evaluation_rem
    m_other_rem
    m_remark
    m_remind_content
    s_GUID
    s_Generation
    s_Lineage
    u_income
    u_tutor_pay
  }
}
`
  /*
order_by: {c_act_code: desc},
   c_status: {_eq: $c_status},
      c_respon: {_eq: $c_respon},
  EventClassID
      EventID
      Gen_m_remark
      IsShow
      b_can_repeat_reg
      b_course
      b_finish
      b_freeofcharge
      b_not_change_price
      b_open_oth
      b_open_own
      b_print_birth
      b_print_age
      b_print_no_period
      b_print_other
      b_print_time
      c_acc_type
      c_act_code
      c_act_name
      c_act_nameen
      c_acttype_control
      c_acttype_together
      c_age_control
      c_apply_code
      c_appraises
      c_centre_id
      c_check_acttype
      c_check_memtype
      c_checksex
      c_corwithmember
      c_course_level
      c_course_no
      c_course_tutor
      c_course_tutor2
      c_course_tutor3
      c_course_tutor4
      c_course_type
      c_dest
      c_end_collect
      c_finish_goal
      c_group1
      c_group2
      c_memtype_control
      c_nature
      c_open_other
      c_ref
      c_remind_header
      c_respon
      c_respon2
      c_start_collect
      c_status
      c_subsidizes
      c_type
      c_user_id
      c_vol_level_2
      c_vol_level_1
      c_vol_level_3
      c_week
      c_whojoin
      c_worker
      c_worker2
      d_close
      d_date_from
      d_date_to
      d_open
      d_sale_end
      d_sale_start
      d_time_from
      d_time_to
      i_lessons
      i_lessons_attend1
      i_lessons_attend2
      i_lessons_attend3
      i_lessons_attend5
      i_lessons_attend4
      i_quota_cssa_max
      i_quota_max
      i_success_percent
      i_year_from
      i_year_to
      m_appraises_rem
      m_content
      m_evaluation_rem
      m_other_rem
      m_remark
      m_remind_content
      */