<template>
  <AddEventContent v-model="eventCode"/>
</template>

<script setup>
import { ref } from "vue";
import { useSubscription } from "@vue/apollo-composable";
import AddEventContent from "components/Event/AddEventContent.vue"
import { EVENT_GET_LATEST_ACT_CODE } from "/src/graphQueries/Event/query.js"

// variables
const eventCode = ref("")

// queries
const { onResult } = useSubscription(EVENT_GET_LATEST_ACT_CODE)

// callback
onResult((result) => {
  const thisYear = ((new Date()).getFullYear())
  let year = result.data.HTX_Event[0].c_act_code.split("-")[0]
  let currentCode = parseInt(result.data.HTX_Event[0].c_act_code.split("-")[1])
  let code = (currentCode + 1).toString()
  while (code.length < 4) code = "0" + code
  if (year != thisYear) {
    year = thisYear
    code = "0001"
  }
  if (year && code)
    eventCode.value = year + "-" + code
  else return eventCode.value = ""
})
</script>