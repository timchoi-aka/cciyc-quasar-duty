import { gql } from "graphql-tag"

export const DELETE_MEMBER_FROM_ID = gql`
  mutation deleteMemberFromID($c_mem_id: String!) {
    delete_Member_by_pk(c_mem_id: $c_mem_id) {
      c_mem_id
    },
    delete_Relation(where: {_or: [{c_mem_id_1: {_eq: $c_mem_id}}, {c_mem_id_2: {_eq: $c_mem_id}}]}) {
      affected_rows
    }
  }`

export const ADD_MEMBER_FROM_ID = gql`
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
  }`

  export const ADD_MEMBER_AND_RELATION_FROM_ID = gql`
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
    $relationObjects: [Relation_insert_input!] = {},
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
      },
    insert_Relation(objects: $relationObjects) {
      returning {
        c_mem_id_1
        c_mem_id_2
        relation
      }
    }
  }`