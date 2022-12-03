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
    $c_act_code: String = "", 
    $c_type: String = ""
    ) {
    delete_tbl_act_fee_by_pk(c_act_code: $c_act_code, c_type: $c_type) {
      c_type
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

