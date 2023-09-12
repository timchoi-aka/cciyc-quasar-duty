<template>
<q-table
  :rows="data"
  :columns="columns"
  wrap-cells
  :pagination="pagination"
/>

</template>

<script setup>
import { useQuery } from "@vue/apollo-composable";
import { ref } from "vue"
import { gql } from "graphql-tag"

// props
const props = defineProps({
  module: String
})

// query
const { onResult: onData } = useQuery(gql`
  query Component_getLog($module: String! = "") {
    Log(order_by: {datetime: desc}, where: {module: {_eq: $module}}) {
      log_id
      action
      datetime
      module
      username
    }
  }`, 
  () => ({
    module: props.module,
  }), {
    pollInterval: 5000
  })

  
// computed
const data = ref([])

// table config
const pagination = ref({
  rowsPerPage: 100,
})

const columns = [
  {
    name: "datetime",
    label: "日期",
    field: "datetime",
    style: "font-size: 1vw; text-align: center; min-width: 100px; max-width: 100px; width: 100px",
    headerStyle: "font-size: 1vw; text-align: center; min-width: 100px; max-width: 100px; width: 100px",
    headerClasses: "bg-grey-2",
  },
  {
    name: "username",
    label: "使用者",
    field: "username",
    style: "font-size: 1vw; text-align: center; min-width: 100px; max-width: 100px; width: 100px",
    headerStyle: "font-size: 1vw; text-align: center; min-width: 100px; max-width: 100px; width: 100px",
    headerClasses: "bg-grey-2",
  },
  {
    name: "action",
    label: "動作",
    field: "action",
    style: "font-size: 1vw; text-align: left; max-width: 500px;",
    headerStyle: "font-size: 1vw; text-align: center; max-width: 500px; ",
    headerClasses: "bg-grey-2",
  },
]

onData((result) => {
  if (result.data) {
    data.value = result.data.Log
  }
})
</script>