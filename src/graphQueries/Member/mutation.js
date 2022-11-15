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
  mutation addMemberFromID ($logObject: Log_insert_input! = {}, $memberObject: Member_insert_input = {}) 
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
  mutation addMemberFromID ($logObject: Log_insert_input! = {}, $memberObject: Member_insert_input = {}, $accountObject: tbl_account_insert_input = {}) 
  {
    insert_Member_one(object: $memberObject)
      {
        c_mem_id
      }
    insert_Log_one(object: $logObject) {
      log_id
    }
    insert_tbl_account_one(object: $accountObject) {
      c_receipt_no
    }
  }`
  /*
   mutation addMemberFromID (
    $c_mem_id: String!,
    $c_name: String
    $c_name_other: String,
    $c_sex: String,
    $c_tel: String,
    $c_mobile: String,
    $c_user_id: String
    $d_birth: datetime2,
    $b_mem_type1: Boolean,
    $c_udf_1: String,
    $c_update_user: String,
    $d_enter_1: datetime2,
    $d_expired_1: datetime2,
    $d_update: datetime2,
    $d_write: datetime2,
    $m_addscom: String,
    $c_email: String,
  ) 
  {
    insert_Member_one(object: {
      c_mem_id: $c_mem_id,
      c_name: $c_name,
      c_name_other: $c_name_other,
      c_sex: $c_sex,
      c_tel: $c_tel,
      c_mobile: $c_mobile,
      m_addscom: $m_addscom,
      c_email: $c_email,
      d_birth: $d_birth,
      b_mem_type1: $b_mem_type1,
      c_udf_1: $c_udf_1,
      c_update_user: $c_update_user,
      d_enter_1: $d_enter_1,
      d_expired_1: $d_expired_1,
      d_update: $d_update,
      d_write: $d_write,
    })
      {
        c_mem_id
      }
  }*/
  export const ADD_MEMBER_AND_RELATION_FROM_ID = gql`
    mutation addMemberFromID (
      $memberObject: Member_insert_input = {}
      $relationObjects: [Relation_insert_input!] = {},
    ) 
    {
      insert_Member_one(object: $memberObject)
        {
          c_mem_id
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
  mutation addMemberFromID (
    $memberObject: Member_insert_input = {}
    $relationObjects: [Relation_insert_input!] = {},
    $accountObject: tbl_account_insert_input = {}
  ) 
  {
    insert_Member_one(object: $memberObject)
      {
        c_mem_id
      }
    insert_Relation(objects: $relationObjects) {
      returning {
        c_mem_id_1
        c_mem_id_2
        relation
      }
    }
    insert_tbl_account_one(object: $accountObject) {
      c_receipt_no
    }
  }`

export const ADD_MEMBER_AND_RELATION_FROM_ID_UPDATE_RELATED_YOUTH_STATUS = gql`
  mutation addMemberFromID (
    $memberObject: Member_insert_input = {}
    $relationObjects: [Relation_insert_input!] = {},
    $related_ids: [String!] = [],
  ) 
  {
    insert_Member_one(object: $memberObject)
      {
        c_mem_id
      }
    insert_Relation(objects: $relationObjects) {
      returning {
        c_mem_id_1
        c_mem_id_2
        relation
      }
    },
    update_Member(where: {c_mem_id: {_in: $related_ids}}, _set: {b_mem_type10: true}) {
      affected_rows
    }
  }`

  export const ADD_MEMBER_AND_RELATION_FROM_ID_UPDATE_RELATED_YOUTH_STATUS_WITH_PAYMENT = gql`
    mutation addMemberFromID (
      $memberObject: Member_insert_input = {}
      $relationObjects: [Relation_insert_input!] = {},
      $related_ids: [String!] = [],
      $accountObject: tbl_account_insert_input = {}
    ) 
    {
      insert_Member_one(object: $memberObject)
        {
          c_mem_id
        }
      insert_Relation(objects: $relationObjects) {
        returning {
          c_mem_id_1
          c_mem_id_2
          relation
        }
      },
      update_Member(where: {c_mem_id: {_in: $related_ids}}, _set: {b_mem_type10: true}) {
        affected_rows
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
  }
`
/*
 MemberRelation1 {
          c_mem_id_1
          RelationMember1 {
            b_mem_type1
            c_mem_id
            d_birth
          }
          c_mem_id_2
          RelationMember2 {
            b_mem_type1
            c_mem_id
            d_birth
          }
        }
        MemberRelation2 {
          c_mem_id_1
          RelationMember1 {
            b_mem_type1
            c_mem_id
            d_birth
          }
          c_mem_id_2
          RelationMember2 {
            b_mem_type1
            c_mem_id
            d_birth
          }
        }
        */
export const QUIT_MEMBER_BY_ID = gql`
  mutation quitMemberByID ($c_mem_id: String, $logObject: Log_insert_input! = {}, $exitDate: datetime2) {
    update_Member(where: {c_mem_id: {_eq: $c_mem_id}}, _set: {b_mem_type1: false, d_exit_1: $exitDate}) {
      returning {
        c_mem_id
        b_mem_type1
        d_exit_1
      }
    }
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
  }
`

export const UPDATE_MEMBER_BY_ID = gql`
  mutation updateMember($c_mem_id: String!, $object: Member_set_input = {}, $logObject: Log_insert_input! = {}, $relationObjects: [Relation_insert_input!] = {}) {
    update_Member_by_pk(pk_columns: {c_mem_id: $c_mem_id}, _set: $object) {
      c_mem_id
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }
  `

export const INSERT_RELATION = gql`
  mutation updateMember($newObjects: [Relation_insert_input] = {}) {
    insert_Relation(
      objects: $newObjects,
    ) {
      affected_rows
    }
  }`

export const UPDATE_RELATION = gql`
  mutation updateMember($uuid: uniqueidentifier!, $changeObject: Relation_set_input = {}) {
    update_Relation_by_pk(pk_columns: {uuid: $uuid}, _set: $changeObject) {
      uuid
    }
  }`
  
export const DELETE_RELATION = gql`
  mutation updateMember($deleteObjects: [uniqueidentifier!]) {
    delete_Relation(where: {uuid: {_in: $deleteObjects}}) {
      affected_rows
    }
  }`