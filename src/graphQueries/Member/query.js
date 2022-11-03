import { gql } from "graphql-tag"

export const LATEST_MEMBER_ID = gql`
  subscription getLatestMemberID {
    Member(limit: 1, order_by: {c_mem_id: desc}, offset: 1) {
      c_mem_id
    }
  }`

export const MEMBER_GET_ALL = gql`
  subscription getMember {
    Member {
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
      c_update_user
      d_birth
      d_enter_1
      d_exit_1
      d_expired_1
      d_renew_1
      d_update
      d_write
      m_addscom
    }
  }`

export const GET_MEMBER_NAME_FROM_ID = gql`
  query getMemberNameFromID($c_mem_id_2: String) {
    Member(where: {c_mem_id: {_eq: $c_mem_id_2}}) {
      c_mem_id,
      b_mem_type1,
      d_birth,
      c_name,
      c_name_other,
    }
  }`

export const GET_RELATED_MEMBER_FROM_ID = gql`
  query getRelatedMemberFromID($c_mem_id: String) {
    Relation(where: {_or: [{c_mem_id_1: {_eq: $c_mem_id}} {c_mem_id_2: {_eq: $c_mem_id}}]}) {
      c_mem_id_1
      c_mem_id_2
      relation
    }
  }`

export const GET_NAME_FROM_IDS = gql`
  query getNameFromIDs($c_mem_ids: [String!]) {
    Member(where: {c_mem_id: {_in: $c_mem_ids}}) {
      c_mem_id,
      d_birth,
      b_mem_type1,
      c_name,
      c_name_other,
    }
  }`

