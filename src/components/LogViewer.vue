<template>
<q-table
  :rows="logdata"
  :columns="columns"
  wrap-cells
  :pagination="pagination"
/>

</template>

<script setup>
import { useSubscription } from "@vue/apollo-composable";
import { computed, ref } from "vue"
import { gql } from "graphql-tag"

// props
const props = defineProps({
  module: String
})

// query
const { result: data } = useSubscription(gql`
  subscription getLog($module: String! = "") {
    Log(order_by: {datetime: desc}, where: {module: {_eq: $module}}) {
      log_id
      action
      datetime
      module
      username
    }
  }`, 
  () => ({
    module: props.module
  }))

  
// computed
const logdata = computed(() => data.value?.Log??[])

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
    style: "font-size: 1vw; text-align: left;",
    headerStyle: "font-size: 1vw; text-align: center; ",
    headerClasses: "bg-grey-2",
  },
]
</script>