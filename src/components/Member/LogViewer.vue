<template>
  data: {{data}}
<q-table
  :rows="logdata"
  :columns="columns"
  wrap-cells
  :pagination="pagination"
/>

</template>

<script setup>
import { useQuery } from "@vue/apollo-composable";
import {ref } from "vue"
import { gql } from "graphql-tag"
// import { GET_LOG } from "/src/graphQueries/Log/query.js"

// props
const props = defineProps({
  module: String
})

// query
const {onResult: data} = useQuery(gql`
  query Member_getLog($module: String! = "") {
    Log(order_by: {datetime: desc}, where: {module: {_eq: $module}}) {
      action
      datetime
      module
      username
    }
  }`, 
//const {result: data} = useQuery(GET_LOG, 
  () => ({
    module: props.module
  }), {
    pollInterval: 1000
  })

// computed
const logdata = ref([])

// table config
const pagination = ref({
  rowsPerPage: 100,
})

const columns = [
  {
    name: "datetime",
    label: "日期",
    field: "datetime",
    style: "font-size: 1vw; text-align: center; min-width: 100px; max-width: 100px",
    headerStyle: "font-size: 1vw; text-align: center; min-width: 100px; max-width: 100px",
    headerClasses: "bg-grey-2",
  },
  {
    name: "username",
    label: "使用者",
    field: "username",
    style: "font-size: 1vw; text-align: center; min-width: 100px; max-width: 100px",
    headerStyle: "font-size: 1vw; text-align: center; width: 10vw; min-width: 100px; max-width: 100px",
    headerClasses: "bg-grey-2",
  },
  {
    name: "action",
    label: "動作",
    field: "action",
    style: "font-size: 1vw; text-align: left;",
    headerStyle: "font-size: 1vw; text-align: center; width: 10vw; ",
    headerClasses: "bg-grey-2",
  },
]

data((result) => {
  if (result.data) logdata.value = result.data.Log
})
</script>