<template>
  <AddEventContent :c_act_code="getCode"/>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { useSubscription } from "@vue/apollo-composable";
import AddEventContent from "components/Event/AddEventContent.vue"
import { EVENT_GET_LATEST_ACT_CODE } from "/src/graphQueries/Event/query.js"


// variables
const $store = useStore();

// queries
const { result: eventActCode } = useSubscription(EVENT_GET_LATEST_ACT_CODE)

// computed
const username = computed(() => $store.getters["userModule/getUsername"])
const latestActCode = computed(() => eventActCode.value?.HTX_Event[0].c_act_code??[])
const getCode = computed(() => {
  const thisYear = ((new Date()).getFullYear())
  let year = latestActCode.value.length > 0? latestActCode.value.split("-")[0] : ""
  let currentCode = latestActCode.value.length > 0? parseInt(latestActCode.value.split("-")[1]) : ""
  let code = (currentCode + 1).toString()
  while (code.length < 4) code = "0" + code
  if (year != thisYear) {
    year = thisYear
    code = "0001"
  }
  if (year && code)
    return year + "-" + code
  else return null
})
</script>