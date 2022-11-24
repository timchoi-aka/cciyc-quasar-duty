<template>
<q-table
  :rows="logdata"
  :columns="columns"
  wrap-cells
  :pagination="pagination"
/>

</template>

<script setup>
import { gql } from "graphql-tag"
import { useSubscription } from "@vue/apollo-composable";
import { computed, ref } from "vue"

const {result: data} = useSubscription(
  gql`
    subscription getLog {
      Log(order_by: {datetime: desc}, where: {module: {_eq: "活動系統"}}) {
        action
        datetime
        module
        username
      }
    }`
)
     
const logdata = computed(() => data.value?.Log??[])
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
    headerStyle: "font-size: 1vw; text-align: center;",
    headerClasses: "bg-grey-2",
  },
]
</script>