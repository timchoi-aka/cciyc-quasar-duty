import { gql } from "graphql-tag"

const ADD_LOG = gql`mutation AddLog($logObject: Log_insert_input! = {}) {}
  insert_Log_one(object: $logObject) {
    log_id
  }
}`;
