<template>
  <q-select
    dense
    filled
    class="col-3 col-xs-3 q-mr-md-md q-mr-sm-sm q-mr-xs-none"
    use-input
    clearable
    label="收入類別"
    input-debounce="0"
    :options="AccountOptions"
    :model-value="props.modelValue"
    @update:model-value="(value) => emit('update:modelValue', value? value: null)"
    />
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useQuery } from "@vue/apollo-composable"
import { gql } from "graphql-tag"
import { date as qdate } from "quasar"

// props & emits
const props = defineProps({
  modelValue: String,
})
const emit = defineEmits(["update:modelValue"])

// variables
const AccountOptions = ref([])

// query
const { onResult } = useQuery(gql`
query getAccountType {
  tbl_sel_acc_type(order_by: {i_No: asc}) {
    c_type
  }
}`)

// callback
onResult((result) => {
  AccountOptions.value = result.data.tbl_sel_acc_type.map(x=>x.c_type)
})


// function
function nameFilter(val, update) {
  if (val === '') {
    update(() => {
      NameOptions.value = OriginalNameOptions.value
    })
    return
  }

  update(() => {
    NameOptions.value = OriginalNameOptions.value
    NameOptions.value = NameOptions.value.filter(v => 
      (v.value? v.value.indexOf(val) > -1 : false) ||
      (v.c_name? v.c_name.toLowerCase().indexOf(val.toLowerCase()) > -1 : false) ||
      (v.c_name_other? v.c_name_other.toLowerCase().indexOf(val.toLowerCase()) > -1 : false)
    )
  })
}
</script>