import { gql } from "graphql-tag"

export const ADD_EVENT = gql`
  mutation addEvent(
    $logObject: Log_insert_input! = {}, 
    $object: HTX_Event_insert_input = {}
    ) {
    insert_HTX_Event_one(object: $object) {
      c_act_code
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }`
 
export const DELETE_EVENT_STAT = gql`
  mutation deleteEventStat(
    $delete_cActCode: [String!] = "", 
    $delete_dAct: [String!] = "",
    $logObject: Log_insert_input! = {}, 
  ) {
    delete_tbl_act_session(where: {c_act_code: {_in: $delete_cActCode}, d_act: {_in: $delete_dAct}}) {
      affected_rows
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }
`
export const UPDATE_EVENT_STAT_BY_PK = gql`
  mutation updateEventStatByPK(
    $logObject: Log_insert_input! = {}, 
    $objects: [tbl_act_session_insert_input!] = {}
    ) {
    insert_tbl_act_session(
      objects: $objects, if_matched: {match_columns: [c_act_code, d_act], update_columns: [i_number, i_number_a, i_number_b, i_number_c, i_people_count, i_people_count_a, i_people_count_b, i_people_count_c]}) {
      affected_rows
      returning {
        c_act_code
      }
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }`

export const UPDATE_EVENT_BY_PK = gql`
  mutation updateEventByPK(
    $logObject: Log_insert_input! = {}, 
    $c_act_code: String = "", 
    $object: HTX_Event_set_input = {}
    ) {
    update_HTX_Event_by_pk(pk_columns: {c_act_code: $c_act_code}, _set: $object) {
      c_act_code
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }`

export const UPDATE_EVENT_FEE = gql`
  mutation updateEventFee(
    $logObject: Log_insert_input! = {}, 
    $objects: [tbl_act_fee_insert_input!] = {}
    ) {
    insert_tbl_act_fee(objects: $objects, if_matched: {match_columns: [c_type, c_act_code], update_columns: [u_fee]}) {
      affected_rows
      returning {
        c_type
        u_fee
      }
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }`
  
export const DELETE_EVENT_FEE = gql`
  mutation deleteEventFee(
    $logObject: Log_insert_input! = {}, 
    $c_act_code: [String!] = "", 
    $c_type: [String!] = ""
    ) {
    delete_tbl_act_fee(where: {c_act_code: {_in: $c_act_code}, c_type: {_in: $c_type}}) {
      returning {
        c_type
        u_fee
      }
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }`

export const DELETE_EVENT_BY_PK = gql`
  mutation delEventByPK(
    $logObject: Log_insert_input! = {}, 
    $c_act_code: String = "",
    ) {
    delete_HTX_Event_by_pk(c_act_code: $c_act_code) {
      c_act_code
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }`

export const ADD_EVALUATION_FROM_ACT_CODE = gql`
  mutation addEvaluationFromActCode (
    $logObject: Log_insert_input! = {}, 
    $evaluationObject: Event_Evaluation_insert_input = {}
  ) 
  {
    insert_Event_Evaluation_one(object: $evaluationObject)
      {
        c_act_code
      }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }`

export const UPDATE_EVALUATION_FROM_PK = gql`
mutation updateEvaluationFromPK(
  $uuid: uniqueidentifier = "", 
  $evaluationObject: Event_Evaluation_set_input = {},
  $logObject: Log_insert_input! = {}
  ) {
  update_Event_Evaluation_by_pk(pk_columns: {uuid: $uuid}, _set: $evaluationObject) {
    c_act_code
  }
  insert_Log_one(object: $logObject) {
    log_id
  }
}`

export const ADD_EVALUATION_ACCOUNT_FROM_UUID = gql`
mutation addEvaluationAccountFromUUID(
  $objects: [Event_Evaluation_Account_insert_input!] = {},
  $logObject: Log_insert_input! = {},
  $removeRecord: [uniqueidentifier!] = ""
  ) {
  insert_Event_Evaluation_Account(
    objects: $objects, 
    if_matched: {update_columns: [amount, description], match_columns: account_uuid}
  ) {
    affected_rows 
    returning {
      c_act_code
    }
  }
  delete_Event_Evaluation_Account(where: {account_uuid: {_in: $removeRecord}}) {
    affected_rows
  }
  insert_Log_one(object: $logObject) {
    log_id
  }
}`

export const SUBMIT_EVALUATION = gql`
mutation submitEvaluationFromUUID(
  $uuid: uniqueidentifier = "", 
  $staff_name: String = "", 
  $submit_date: smalldatetime = "",
  $logObject: Log_insert_input! = {}
  ) {
  update_Event_Evaluation_by_pk(
    pk_columns: {uuid: $uuid}, 
    _set: {
      staff_name: $staff_name, 
      submit_date: $submit_date
    }) {
    c_act_code
  }
  insert_Log_one(object: $logObject) {
    log_id
  }
}`

