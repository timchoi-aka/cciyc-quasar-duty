/*
import { gql } from "graphql-tag"

export const GET_LOG = gql`
  subscription Log_getLog($module: String! = "") {
    Log(order_by: {datetime: desc}, where: {module: {_eq: $module}}) {
      log_id
      action
      datetime
      module
      username
    }
  }`
  */