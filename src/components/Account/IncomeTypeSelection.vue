<template>
  <q-select
    dense
    filled
    class="col-3 col-xs-3 q-mr-md-md q-mr-sm-sm q-mr-xs-none"
    use-input
    clearable
    @filter="incomeFilter"
    label="收入類別"
    input-debounce="0"
    :options="IncomeOptions"
    :model-value="props.modelValue"
    @update:model-value="(value) => emit('update:modelValue', value? value: null)"
    >
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label>
            {{ scope.opt.c_type_no }} -
            {{scope.opt.value }}
            ({{ scope.opt.c_acc_type }}) - ${{ scope.opt.u_fee }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:selected>
      <div v-if="props.modelValue">{{ props.modelValue.value }} - ${{ props.modelValue.u_fee }}</div>
    </template>
    <template v-slot:no-option>
      沒有結果
    </template>
  </q-select>

</template>

<script setup>
import { ref } from "vue"
import { useQuery } from "@vue/apollo-composable"
import { gql } from "graphql-tag"

// props & emits
const props = defineProps({
  modelValue: Object,
})
const emit = defineEmits(["update:modelValue"])

// variables
const IncomeOptions = ref([])
const OriginalIncomeOptions = ref([])

// query
const { onResult } = useQuery(gql`
query getIncomeType {
  tbl_sel_acc_Income_type(where: {b_disable: {_eq: false}}, order_by: {i_No: asc}) {
    b_fixed
    c_acc_type
    c_type
    c_type_no
    u_fee
  }
}`)

// callback
onResult((result) => {
  if (result.data) {
    result.data.tbl_sel_acc_Income_type.forEach((res) => {
      IncomeOptions.value.push({
        value: res.c_type,
        c_type_no: res.c_type_no,
        u_fee: res.u_fee,
        b_fixed: res.b_fixed,
        c_acc_type: res.c_acc_type
      })
    })

    OriginalIncomeOptions.value = IncomeOptions.value
  }
})


// function
function incomeFilter(val, update) {
  if (val === '') {
    update(() => {
      IncomeOptions.value = OriginalIncomeOptions.value
    })
    return
  }

  update(() => {
    IncomeOptions.value = OriginalIncomeOptions.value
    IncomeOptions.value = IncomeOptions.value.filter(v =>
      (v.value? v.value.indexOf(val) > -1 : false) ||
      (v.c_type? v.c_type.toLowerCase().indexOf(val.toLowerCase()) > -1 : false) ||
      (v.c_type_no? v.c_type_no.toLowerCase().indexOf(val.toLowerCase()) > -1 : false)
    )
  })
}
</script>
