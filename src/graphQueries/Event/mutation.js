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