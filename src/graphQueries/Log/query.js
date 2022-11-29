import { gql } from "graphql-tag"

export const GET_LOG = gql`
  subscription getLog($module: String! = "") {
    Log(order_by: {datetime: desc}, where: {module: {_eq: $module}}) {
      action
      datetime
      module
      username
    }
  }`