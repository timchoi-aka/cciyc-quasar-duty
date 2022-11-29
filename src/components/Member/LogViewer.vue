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
import { GET_LOG } from "/src/graphQueries/Log/query.js"

const {result: data} = useSubscription(GET_LOG, 
  {
    module: "會員系統"
  })
     
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
    headerStyle: "font-size: 1vw; text-align: center; width: 10vw; ",
    headerClasses: "bg-grey-2",
  },
]
</script>