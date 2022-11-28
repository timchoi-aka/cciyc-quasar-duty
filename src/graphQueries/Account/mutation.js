import { gql } from "graphql-tag"

export const ADD_RECEIPT_PRINT_COUNT = gql`
mutation addReceiptPrintCount (
  $logObject: Log_insert_input! = {}, 
  $c_receipt_no: String!, 
  $i_prints: Int,
) 
{
  insert_Log_one(object: $logObject) {
    log_id
  }
  update_tbl_account_by_pk(
    pk_columns: {c_receipt_no: $c_receipt_no}, 
    _set: {i_prints: $i_prints}
  ) {
    c_receipt_no
  }
}`