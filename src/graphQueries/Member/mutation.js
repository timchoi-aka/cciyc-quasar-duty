import { gql } from "graphql-tag"

export const DELETE_MEMBER_BY_ID = gql`
  mutation deleteMemberFromID($c_mem_id: String!, $logObject: Log_insert_input! = {}) {
    delete_Member_by_pk(c_mem_id: $c_mem_id) {
      c_mem_id
    },
    delete_Relation(where: {_or: [{c_mem_id_1: {_eq: $c_mem_id}}, {c_mem_id_2: {_eq: $c_mem_id}}]}) {
      affected_rows
      returning {
        uuid
        c_mem_id_1
        c_mem_id_2
        relation
      }
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }`

export const ADD_MEMBER_FROM_ID = gql`
  mutation addMemberFromID (
    $logObject: Log_insert_input! = {},
    $memberObject: Member_insert_input = {}
  )
  {
    insert_Member_one(object: $memberObject)
      {
        c_mem_id
      }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }`

export const ADD_MEMBER_FROM_ID_WITH_PAYMENT = gql`
  mutation addMemberFromIDWithPayment (
    $logObject: Log_insert_input! = {},
    $memberObject: Member_insert_input = {},
    $accountObject: tbl_account_insert_input = {}
  )
  {
    insert_Member_one(object: $memberObject) {
        c_mem_id
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
    insert_tbl_account_one(object: $accountObject) {
      c_receipt_no
    }
  }`

  export const RENEW_MEMBER_FROM_ID_WITH_PAYMENT = gql`
    mutation renewMemberFromIDWithPayment (
      $c_mem_id: String!
      $logObject: Log_insert_input! = {},
      $memberObject:  Member_set_input = {},
      $accountObject: tbl_account_insert_input = {}
    )
    {
      update_Member_by_pk(pk_columns: {c_mem_id: $c_mem_id}, _set: $memberObject) {
        c_mem_id
      }
      insert_Log_one(object: $logObject) {
        log_id
      }
      insert_tbl_account_one(object: $accountObject) {
        c_receipt_no
      }
    }`

  export const ADD_MEMBER_AND_RELATION_FROM_ID = gql`
    mutation addMemberAndRelationFromID (
      $logObject: Log_insert_input! = {},
      $memberObject: Member_insert_input = {}
      $relationObjects: [Relation_insert_input!] = {},
    )
    {
      insert_Member_one(object: $memberObject) {
        c_mem_id
      }
      insert_Log_one(object: $logObject) {
        log_id
      }
      insert_Relation(objects: $relationObjects) {
        returning {
          c_mem_id_1
          c_mem_id_2
          relation
        }
      }
    }`

export const ADD_MEMBER_AND_RELATION_FROM_ID_WITH_PAYMENT = gql`
  mutation addMemberAndRelationFromIDWithPayment (
    $logObject: Log_insert_input! = {},
    $memberObject: Member_insert_input = {}
    $relationObjects: [Relation_insert_input!] = {},
    $accountObject: tbl_account_insert_input = {}
  )
  {
    insert_Member_one(object: $memberObject) {
      c_mem_id
    }
    insert_Relation(objects: $relationObjects) {
      returning {
        c_mem_id_1
        c_mem_id_2
        relation
      }
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
    insert_tbl_account_one(object: $accountObject) {
      c_receipt_no
    }
  }`

export const UPDATE_YOUTH_MEMBER_STATUS = gql`
  mutation updateYouthMemberStatus(
    $c_mem_id: String = "",
    $b_mem_type10: Boolean = false,
    $d_expired_1: datetime2,
    $logObject: Log_insert_input! = {},
    ) {
    update_Member_by_pk(pk_columns: {c_mem_id: $c_mem_id}, _set: {b_mem_type10: $b_mem_type10, d_expired_1: $d_expired_1}) {
      c_mem_id
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }
`
export const ADD_MEMBER_AND_RELATION_FROM_ID_UPDATE_RELATED_YOUTH_STATUS = gql`
  mutation addMemberAndRelationFromIDUpdateRelatedYouthStatus (
    $logObject: Log_insert_input! = {},
    $memberObject: Member_insert_input = {}
    $relationObjects: [Relation_insert_input!] = {},
    $related_ids: [String] = [],
  )
  {
    insert_Member_one(object: $memberObject) {
      c_mem_id
    }
    insert_Relation(objects: $relationObjects) {
      returning {
        c_mem_id_1
        c_mem_id_2
        relation
      }
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
    update_Member(where: {c_mem_id: {_in: $related_ids}}, _set: {b_mem_type10: true}) {
      affected_rows
    }
  }`

  export const ADD_MEMBER_AND_RELATION_FROM_ID_UPDATE_RELATED_YOUTH_STATUS_WITH_PAYMENT = gql`
    mutation addMemberAndRelationFromIDUpdateRelatedYouthStatusWithPayment (
      $logObject: Log_insert_input! = {},
      $memberObject: Member_insert_input = {}
      $relationObjects: [Relation_insert_input!] = {},
      $related_ids: [String!] = [],
      $accountObject: tbl_account_insert_input = {}
    )
    {
      insert_Member_one(object: $memberObject) {
        c_mem_id
      }
      insert_Relation(objects: $relationObjects) {
        returning {
          c_mem_id_1
          c_mem_id_2
          relation
        }
      }
      update_Member(where: {c_mem_id: {_in: $related_ids}}, _set: {b_mem_type10: true}) {
        affected_rows
      }
      insert_Log_one(object: $logObject) {
        log_id
      }
      insert_tbl_account_one(object: $accountObject) {
        c_receipt_no
      }
    }`

export const UPDATE_RELATED_YOUTH_MEMBER_STATUS = gql`
  mutation updateRelatedYouthMemberStatus ($b_mem_type10: Boolean, $c_mem_ids: [String!] = [], $logObject: Log_insert_input! = {}) {
    update_Member(where: {c_mem_id: {_in: $c_mem_ids}}, _set: {b_mem_type10: $b_mem_type10}) {
      affected_rows
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }`
 /*update_Member_by_pk(pk_columns: {c_mem_id: $c_mem_id}, _set: {b_mem_type1: false, d_exit_1: $exitDate}) {
      c_mem_id
      b_mem_type1
      d_exit_1
    }

 */
export const QUIT_MEMBER_BY_ID = gql`
  mutation quitMemberByID (
    $c_mem_id: String!,
    $exitDate: datetime2,
    $logObject: Log_insert_input! = {}
    ) {
      update_Member_by_pk(pk_columns: {c_mem_id: $c_mem_id}, _set: {b_mem_type1: false, d_exit_1: $exitDate}) {
      c_mem_id
      b_mem_type1
      d_exit_1
    }
    delete_Relation(where: {_or: [{c_mem_id_1: {_eq: $c_mem_id}}, {c_mem_id_2: {_eq: $c_mem_id}}]}) {
      returning {
        uuid
        c_mem_id_1
        c_mem_id_2
        relation
        RelationMember1 {
          c_mem_id
          b_mem_type1
          d_birth
          d_expired_1
          d_exit_1
        }
        RelationMember2 {
          c_mem_id
          b_mem_type1
          d_birth
          d_expired_1
          d_exit_1
        }
      }
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }
`
/*

    */
export const UPDATE_MEMBER_BY_ID = gql`
  mutation updateMemberByID(
    $c_mem_id: String!,
    $object: Member_set_input = {},
    $logObject: Log_insert_input! = {},
    $deleteObjects: [uniqueidentifier!] = ["00000000-0000-0000-0000-000000000000"],
    $upsertObjects: [Relation_insert_input!] = [{
    	uuid: "00000000-0000-0000-0000-000000000000",
    	c_mem_id_1: "",
    	c_mem_id_2: "",
    	relation: "",
      d_effective: "2000-01-01T00:00:00"
  	}]
  ) {
    update_Member_by_pk(pk_columns: {c_mem_id: $c_mem_id}, _set: $object) {
      c_mem_id
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
    insert_Relation(
      objects: $upsertObjects, if_matched: {match_columns: uuid, update_columns: [c_mem_id_1, c_mem_id_2, relation, d_effective]}
    ) {
      affected_rows
      returning {
        uuid
        c_mem_id_1
        c_mem_id_2
        relation
        d_effective
        RelationMember1 {
          c_mem_id
          b_mem_type1
          d_birth
          d_expired_1
          d_exit_1
        }
        RelationMember2 {
          c_mem_id
          b_mem_type1
          d_birth
          d_expired_1
          d_exit_1
        }
      }
    }
    delete_Relation(where: {uuid: {_in: $deleteObjects}}) {
      affected_rows
      returning {
        uuid
        c_mem_id_1
        c_mem_id_2
        relation
        d_effective
        RelationMember1 {
          c_mem_id
          b_mem_type1
          d_birth
          d_expired_1
          d_exit_1
        }
        RelationMember2 {
          c_mem_id
          b_mem_type1
          d_birth
          d_expired_1
          d_exit_1
        }
      }
    }
  }
  `

export const INSERT_RELATION = gql`
  mutation insertRelation(
    $newObjects: [Relation_insert_input] = {},
    $logObject: Log_insert_input! = {}
  ) {
    insert_Relation(
      objects: $newObjects,
    ) {
      affected_rows
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }`

export const UPDATE_RELATION = gql`
  mutation updateRelation(
    $uuid: uniqueidentifier!,
    $changeObject: Relation_set_input = {},
    $logObject: Log_insert_input! = {},
  ) {
    update_Relation_by_pk(pk_columns: {uuid: $uuid}, _set: $changeObject) {
      uuid
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }`

export const DELETE_RELATION = gql`
  mutation deleteRelation(
    $deleteObjects: [uniqueidentifier!],
    $logObject: Log_insert_input! = {}
  ) {
    delete_Relation(where: {uuid: {_in: $deleteObjects}}) {
      affected_rows
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }`
