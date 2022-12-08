import { gql } from "graphql-tag"

export const RECEIPTS_BY_NO = gql`
  query ReceiptsByNo($c_receipt_no: String!) {
    tbl_account_by_pk(c_receipt_no: $c_receipt_no) {
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
      m_remark2
      d_clear
      u_price_after_discount
      c_name
      b_clear
      b_refund
      c_mem_id
    }
  }
`