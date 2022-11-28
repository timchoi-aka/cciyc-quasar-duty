import { gql } from "graphql-tag"

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

