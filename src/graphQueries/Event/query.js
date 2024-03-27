import { gql } from "graphql-tag"

export const EVENT_GET_COUNT = gql`
query EVENT_GET_COUNT {
  HTX_Event_aggregate(offset: 1) {
    aggregate {
      count
    }
  }
}`

export const EVENT_GET_LATEST_ACT_CODE = gql`
subscription EVENT_GET_LATEST_ACT_CODE {
  HTX_Event(order_by: {c_act_code: desc}, offset: 0, limit: 1) {
    c_act_code
  }
}`

export const EVENT_GET_ALL_WITH_LIMIT  = gql`
  query getEventWithOffset($offset: Int!, $limit: Int!) {
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

export const EVENT_FEE_BY_ACT_CODE = gql`
  query eventFeeByActCode($c_act_code: String = "") {
    tbl_act_fee(where: {c_act_code: {_eq: $c_act_code}}) {
      c_act_code
      c_type
      u_fee
    }
  }`

export const EVENT_GET_ALL_ACTIVE = gql`
  query getActiveEvent {
    HTX_Event(order_by: {c_act_code: desc}, where: {c_status: {_eq: "未完成"}}) {
      c_act_code
      c_act_name
      c_nature
      c_respon
      c_type
      c_status
      c_group1
      c_group2
      c_acc_type
      b_freeofcharge
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

export const MY_EVENT_FAVOURATE = gql`
  query EventFavourate($c_act_code: String = "", $username: String = "") {
    Event_Favourate_by_pk(c_act_code: $c_act_code, username: $username) {
      username
      c_act_code
    }
  }`

export const MY_FAV = gql`
query MyFav($username: String = "") {
  Event_Favourate(where: {username: {_eq: $username}}) {
    username
    c_act_code
    Favourate_to_Event {
      b_finish
      c_act_code
      c_act_name
      c_act_nameen
      c_acc_type
      c_dest
      c_nature
      c_respon
      c_respon2
      c_type
      c_status
      c_group1
      c_group2
      c_worker
      c_worker2
      d_date_from
      d_date_to
      d_sale_start
      d_sale_end
      d_finish_goal
    }
  }
}`


export const MY_EVENT_SEARCH = gql`
query myEvent($condition: HTX_Event_bool_exp = {c_act_code: {_eq: ""}}) {
  HTX_Event(order_by: {c_act_code: desc}, where: $condition) {
    b_finish
    c_act_code
    c_act_name
    c_act_nameen
    c_acc_type
    c_dest
    c_nature
    c_respon
    c_respon2
    c_type
    c_status
    c_group1
    c_group2
    c_worker
    c_worker2
    d_date_from
    d_date_to
    d_sale_start
    d_sale_end
    d_finish_goal
    Event_to_Evaluation {
      submit_plan_date
      uuid
    }
  }
}`

export const CORE_EVENT_SEARCH = gql`
query coreEvent($condition: HTX_Event_bool_exp = {c_act_code: {_eq: ""}}) {
  HTX_Event(order_by: {c_act_code: desc}, where: $condition) {
    b_finish
    c_act_code
    c_act_name
    c_act_nameen
    c_acc_type
    c_dest
    c_nature
    c_respon
    c_respon2
    c_type
    c_status
    c_group1
    c_group2
    c_worker
    c_worker2
    d_date_from
    d_date_to
    d_sale_start
    d_sale_end
    d_finish_goal
    Event_to_Evaluation {
      submit_plan_date
      submit_eval_date
      ic_plan_date
      ic_eval_date
      uuid
    }
  }
}`

export const EVENT_STAT_BY_PK = gql`
query EVENT_STAT_BY_PK($c_act_code: String) {
  tbl_act_session(where: {c_act_code: {_eq: $c_act_code}}) {
    c_act_code
    i_number
    i_number_a
    i_number_b
    i_number_c
    i_people_count
    i_people_count_a
    i_people_count_b
    i_people_count_c
    d_act
    inCenter
    s_GUID
  }
}`
//
//
export const APPLICANTS_BY_ACT_CODE = gql`
query ApplicantsByActCode($c_act_code: String = "") {
  tbl_act_reg (where: {c_act_code: {_eq: $c_act_code}, b_refund: {_eq: false}}) {
    i_age
    d_reg
    d_refund
    c_type
    c_tel
    c_sex
    c_remarks
    ID
    b_refund
    c_act_code
    c_mem_id
    c_name
    c_receipt_no
  }
}`

export const EVENT_APPLY_BY_ACT_CODE = gql`
query EVENT_APPLY_BY_ACT_CODE($c_act_code: String = "") {
  tbl_act_reg(where: {c_act_code: {_eq: $c_act_code}}) {
    i_age
    d_reg
    d_refund
    c_user_id
    c_type
    c_tel
    c_sex
    c_remarks
    ID
    b_refund
    c_act_code
    c_mem_id
    c_name
    
  }
}`

export const EVENT_APPLY_AND_RECEIPT_BY_ACT_CODE = gql`
query EVENT_APPLY_BY_ACT_CODE($c_act_code: String = "") {
  tbl_act_reg(where: {c_act_code: {_eq: $c_act_code}}) {
    i_age
    d_reg
    d_refund
    c_user_id
    c_type
    c_tel
    c_sex
    c_remarks
    ID
    b_refund
    c_act_code
    c_mem_id
    c_name
    EventRegistration_to_Account_by_MID {
      c_act_code
      c_desc
      c_cash_type
      c_receipt_no
      c_type
      c_user_id
      d_create
      i_prints
      i_receipt_type
      m_remark
      m_remark2
      d_clear
      u_price_after_discount
      c_name
      b_clear
      b_refund
      b_delete
      c_mem_id
    }
  }
}`

export const EVALUATION_UNAPPROVED = gql`
  query EvaluationUnapproved {
    Event_Evaluation(where: 
      {_or: 
        [
          {_and: 
            [
              {ic_plan_date: {_is_null: true}}, 
              {submit_plan_date: {_is_null: false}}
            ]
          }, 
          {_and:
            [
              {ic_eval_date: {_is_null: true}},
              {submit_eval_date: {_is_null: false}}
            ]
          }
        ]
      }
    ) {
      submit_plan_date
      submit_eval_date
      c_act_code
      uuid
      Evaluation_to_Event {
        c_act_code
        c_act_name
        c_status
      }
    }
  }`

export const EVALUATION_ACCOUNT = gql`
  query EvaluationAccount($type: String = "", $planeval: String = "", $eval_uuid: uniqueidentifier = "00000000-0000-0000-0000-000000000000") {
    Event_Evaluation_Account(where: {_and: {type: {_eq: $type}, planeval: {_eq: $planeval}, eval_uuid: {_eq: $eval_uuid}}}) {
      account_uuid
      amount
      c_act_code
      description
      eval_uuid
      planeval
      type
      txn_date
    }
    Event_Evaluation_Account_aggregate(where: {_and: {type: {_eq: $type}, planeval: {_eq: $planeval}, eval_uuid: {_eq: $eval_uuid}}}) {
      aggregate {
        sum {
          amount
        }
      }
    }
  }`

export const EVENT_EVALUATION_BY_ACT_CODE = gql`
query EVENT_EVALUATION_BY_ACT_CODE($c_act_code: String!) {
  HTX_Event_by_pk(c_act_code: $c_act_code) {
    c_act_code
    c_act_name
    c_dest
    c_nature
    c_group1
    c_group2
    c_type
    c_respon2
    c_respon
    d_date_from
    d_date_to
    d_time_from
    d_time_to
    i_lessons
    c_whojoin
    Event_to_Evaluation {
      attendance
      remarks
      c_act_code
      eval_attend_headcount_children
      eval_attend_headcount_others
      eval_attend_headcount_parent
      eval_attend_headcount_youth
      eval_attend_session_children
      eval_attend_session_others
      eval_attend_session_parent
      eval_end_date
      eval_attend_session_youth
      eval_end_time
      eval_sessions
      eval_start_date
      eval_start_time
      eval_volunteer_count
      ic
      ic_plan_date
      ic_eval_date
      objective
      objective_achieved
      objective_achieved_reason
      objective_followup
      objective_detail
      objective_review_method
      plan_attend_headcount_children
      plan_attend_headcount_others
      plan_attend_headcount_parent
      plan_attend_headcount_youth
      plan_attend_session_children
      plan_attend_session_others
      plan_attend_session_parent
      plan_attend_session_youth
      plan_end_date
      plan_end_time
      plan_start_date
      plan_start_time
      plan_sessions
      plan_volunteer_count
      staff_name
      submit_plan_date
      submit_eval_date
      supervisor
      supervisor_date
      uuid
      supervisor_comment
      ic_comment
      tutor_name
      tutor_phone
      partner_agency
      partner_name
      partner_phone
      Evaluation_to_Account {
        account_uuid
        amount
        c_act_code
        description
        eval_uuid
        planeval
        type
        txn_date
      }
    }
  }
}`

export const EVENT_BY_PK = gql`
query Event_by_pk($c_act_code: String!) {
  HTX_Event_by_pk(c_act_code: $c_act_code) {
    c_act_code
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
    poster
  }
}`

export const EVENT_SEARCHINFO_BY_PK = gql`
query EventSearchInfoByPK($c_act_code: String!) {
  HTX_Event_by_pk(c_act_code: $c_act_code) {
    c_act_code
    IsShow
    b_freeofcharge
    b_not_change_price
    b_open_oth
    b_open_own
    c_acc_type
    c_act_name
    c_act_nameen
    c_dest
    c_end_collect
    c_group1
    c_group2
    c_nature
    c_open_other
    c_respon
    c_respon2
    c_start_collect
    c_type
    c_week
    c_whojoin
    c_worker
    c_worker2
    i_lessons
    i_quota_max
    m_remark
    m_remind_content
    d_time_from
    d_time_to
  }
}`
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