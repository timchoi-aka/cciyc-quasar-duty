import { gql } from "graphql-tag"

export const GET_RELATION_BY_PK = gql`
query GetRelationByPK($c_mem_id: String = "") {
  Member_by_pk(c_mem_id: $c_mem_id)
  {
    c_mem_id
    b_mem_type1
    b_mem_type10
    d_birth
    d_enter_1
    d_exit_1
    d_renew_1
    d_expired_1
    c_udf_1
    MemberRelation1 {
      c_mem_id_1
      c_mem_id_2
      relation
      uuid
      d_effective
      RelationMember1 {
        c_mem_id,
        d_birth,
        b_mem_type1,
        d_expired_1,
        d_exit_1,
        c_udf_1
      }
      RelationMember2 {
        c_mem_id,
        d_birth,
        b_mem_type1,
        d_expired_1,
        d_exit_1,
        c_udf_1
      }
    }
    MemberRelation2 {
      c_mem_id_1
      c_mem_id_2
      relation
      uuid
      d_effective
      RelationMember1 {
        c_mem_id,
        d_birth,
        b_mem_type1,
        d_expired_1,
        d_exit_1,
        c_udf_1
      }
      RelationMember2 {
        c_mem_id,
        d_birth,
        b_mem_type1,
        d_expired_1,
        d_exit_1,
        c_udf_1
      }
    }
  }
}
`

export const GET_MEM_DETAIL_AND_RELATION_BY_PK = gql`
query GetMemDetailAndRelationByPK($c_mem_id: String = "") {
  Member_by_pk(c_mem_id: $c_mem_id)
  {
    c_mem_id
    b_mem_type1
    b_mem_type10
    c_email
    c_emer_name
    c_emer_rel
    c_emer_tel1_1
    c_mobile
    c_name
    c_name_other
    c_sex
    c_tel
    c_udf_1
    d_birth
    d_enter_1
    d_exit_1
    d_expired_1
    d_renew_1
    c_update_user
    d_update
    d_write
    m_addscom
    MemberRelation1 {
      c_mem_id_1
      c_mem_id_2
      relation
      uuid
      RelationMember1 {
        c_mem_id,
        d_birth,
        b_mem_type1,
        c_name,
        c_name_other,
      }
      RelationMember2 {
        c_mem_id,
        d_birth,
        b_mem_type1,
        c_name,
        c_name_other,
      }
    }
    MemberRelation2 {
      c_mem_id_1
      c_mem_id_2
      relation
      uuid
      RelationMember1 {
        c_mem_id,
        d_birth,
        b_mem_type1,
        c_name,
        c_name_other,
      }
      RelationMember2 {
        c_mem_id,
        d_birth,
        b_mem_type1,
        c_name,
        c_name_other,
      }
    }
  }
}
`

export const LATEST_MEMBER_ID = gql`
  subscription getLatestMemberID {
    Member(limit: 1, order_by: {c_mem_id: desc}, offset: 1) {
      c_mem_id
    }
  }`

export const LATEST_RECEIPT_NO = gql`
  subscription getLatestReceiptNo {
    tbl_account(limit: 1, order_by: {c_receipt_no: desc}, where: {c_receipt_no: {_lt: "M"}}) {
      c_receipt_no
      d_create
    }
  }`

export const LATEST_MRECEIPT_NO = gql`
  subscription getLatestMReceiptNo {
    tbl_account(limit: 1, order_by: {c_receipt_no: desc}, where: {c_receipt_no: {_lt: "R"}}) {
      c_receipt_no
    }
  }`

export const MEMBER_GET_ALL = gql`
  query getMember {
    Member {
      c_mem_id
      b_mem_type1
      b_mem_type10
      c_mobile
      c_name
      c_name_other
      c_sex
      c_tel
      c_udf_1
      d_birth
      d_expired_1
      d_exit_1
      d_renew_1
      MemberAccount {
        c_receipt_no
      }
    }
  }`

export const GET_MEMBER_BASIC_AND_RELATED_MEMBER_FROM_IDS = gql`
  query getMemberNameFromID($c_mem_ids: [String!]) {
    Member(where: {c_mem_id: {_in: $c_mem_ids}}) {
      c_mem_id,
      b_mem_type1,
      b_mem_type10,
      d_birth,
      c_name,
      c_name_other,
    }
    Relation(where: {_or: [{c_mem_id_1: {_in: $c_mem_ids}} {c_mem_id_2: {_in: $c_mem_ids}}]}) {
      uuid
      c_mem_id_1
      c_mem_id_2
      relation
    }
  }`

export const GET_RELATED_MEMBER_FROM_ID = gql`
  query getRelatedMemberFromID($c_mem_id: String) {
    Relation(where: {_or: [{c_mem_id_1: {_eq: $c_mem_id}} {c_mem_id_2: {_eq: $c_mem_id}}]}) {
      uuid
      c_mem_id_1
      c_mem_id_2
      relation
    }
  }`

export const GET_NAME_FROM_ID = gql`
  query getNameFromID($c_mem_id: String!) {
    Member_by_pk(c_mem_id: $c_mem_id) {
      c_mem_id,
      d_birth,
      b_mem_type1,
      c_name,
      c_name_other,
      d_exit_1,
      d_expired_1
    }
  }`

export const MIGRATE_RELATION = gql`
  query getMemberRelation {
    Member {
      c_mem_id
      c_mem_relative_memid
      c_mem_relation
    }
  }
`

export const GET_MEMBER_RECEIPTS_BY_PK = gql`
  query getMemberReceiptsByPK($c_mem_id: String!) {
    Member_by_pk(c_mem_id: $c_mem_id) {
      c_mem_id
      MemberAccount {
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
        d_clear
        u_price_after_discount
        c_name
        b_clear
        b_delete
      }
    }
  }
`
