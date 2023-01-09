import { gql } from "graphql-tag"

export const EVENT_REGISTRATION = gql`
  mutation EventRegistration(
    $logObject: Log_insert_input! = {}, 
    $regObject: tbl_act_reg_insert_input = {},
    $accountObject: tbl_account_insert_input = {}
    ) {
      insert_tbl_act_reg_one(object: $regObject) {
        ID
        c_name
        c_act_code
      }
      insert_Log_one(object: $logObject) {
        log_id
      }
      insert_tbl_account_one(object: $accountObject) {
        c_receipt_no
        u_price_after_discount
      }
    }`

export const EVENT_UNREGISTRATION = gql`
  mutation EventUnregistration(
    $logObject: Log_insert_input! = {}, 
    $unregObject: tbl_act_reg_set_input = {},
    $c_receipt_no: String = ""
    $ID: Int = 0, 
    ) {
      update_tbl_act_reg_by_pk(pk_columns: {ID: $ID}, _set: $unregObject) {
        ID
        c_name
        c_mem_id
        c_act_code
      }
      insert_Log_one(object: $logObject) {
        log_id
      }
      update_tbl_account_by_pk(pk_columns: {c_receipt_no: $c_receipt_no}, _set: {b_delete: true}) {
        c_receipt_no
      }
    }`

export const FREE_EVENT_UNREGISTRATION = gql`
  mutation FreeEventUnregistration(
    $logObject: Log_insert_input! = {}, 
    $unregObject: tbl_act_reg_set_input = {},
    $ID: Int = 0, 
    ) {
      update_tbl_act_reg_by_pk(pk_columns: {ID: $ID}, _set: $unregObject) {
        ID
        c_name
        c_mem_id
        c_act_code
      }
      insert_Log_one(object: $logObject) {
        log_id
      }
    }`
export const FREE_EVENT_REGISTRATION = gql`
  mutation FreeEventRegistration(
    $logObject: Log_insert_input! = {}, 
    $regObject: tbl_act_reg_insert_input = {},
    ) {
      insert_tbl_act_reg_one(object: $regObject) {
        ID
        c_name
        c_act_code
      }
      insert_Log_one(object: $logObject) {
        log_id
      }
    }`

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
        d_act
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
        c_act_code
        c_type
        u_fee
      }
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }`

export const ADD_FAVOURATE = gql`
  mutation addFavourate($c_act_code: String = "", $username: String = "") {
    insert_Event_Favourate_one(object: {c_act_code: $c_act_code, username: $username}) {
      username
      c_act_code
    }
  }`

export const REMOVE_FAVOURATE = gql`
  mutation removeFavourate($c_act_code: String = "", $username: String = "") {
    delete_Event_Favourate_by_pk(c_act_code: $c_act_code, username: $username) {
      username
      c_act_code
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
        uuid
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
    uuid
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
      account_uuid
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
      uuid
      c_act_code
  }
  insert_Log_one(object: $logObject) {
    log_id
  }
}`

export const APPROVE_EVALUATION = gql`
mutation approveEvaluationFromUUID(
  $uuid: uniqueidentifier = "", 
  $c_act_code: String = "",
  $ic: String = "", 
  $ic_date: smalldatetime = "",
  $ic_comment: String = "",
  $logObject: Log_insert_input! = {}
  ) {
  update_Event_Evaluation_by_pk(
    pk_columns: {uuid: $uuid}, 
    _set: {
      ic: $ic, 
      ic_date: $ic_date,
      ic_comment: $ic_comment
    }) {
      uuid
      c_act_code
  }
  update_HTX_Event_by_pk(
    pk_columns: {c_act_code: $c_act_code},
    _set: {
      m_evaluation_rem: $ic_comment
    }) {
      c_act_code
      m_evaluation_rem
  }
  insert_Log_one(object: $logObject) {
    log_id
  }
}`
