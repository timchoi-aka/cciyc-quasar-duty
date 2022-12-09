<template>
  <q-select
    dense
    filled
    class="col-3 col-xs-3 q-mr-md-md q-mr-sm-sm q-mr-xs-none"
    use-input
    clearable
    input-debounce="0"
    :options="NameOptions"
    :model-value="props.modelValue"
    @filter="nameFilter"
    @update:model-value="(value) => emit('update:modelValue', value? value.value: null)"
    >
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label>
            {{ scope.opt.value }} - 
            {{scope.opt.c_name? scope.opt.c_name: scope.opt.c_name_other}} 
            ({{ageUtil.calculateAge(scope.opt.d_birth)}}歲 - {{scope.opt.c_sex}})
            <div v-if="(qdate.getDateDiff(Date.now(), scope.opt.d_expired_1) > 0)" class="text-red">會藉過期</div>
            <div v-else class="text-primary">會藉有效</div>
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:selected>
      <div v-if="props.modelValue">{{ props.modelValue }}</div>  
    </template>
    <template v-slot:no-option>          
      沒有結果    
    </template>
  </q-select>
</template>

<script setup>
import { ref } from "vue"
import ageUtil from "src/lib/calculateAge.js"
import { useQuery } from "@vue/apollo-composable"
import { gql } from "graphql-tag"
import { date as qdate } from "quasar"

// props & emits
const props = defineProps({
  modelValue: String,
})
const emit = defineEmits(["update:modelValue"])

// variables
const NameOptions = ref([])
const OriginalNameOptions = ref([])

// query
const { onResult: NameResult } = useQuery(gql`
  query allMemberIDAndName {
    Member {
      c_mem_id
      c_name
      c_name_other
      c_sex
      d_birth
      c_udf_1
      d_expired_1
    }
  }`
  )

// callback
NameResult((data) => {
  data.data.Member.forEach((d) => {
    NameOptions.value.push({
      value: d.c_mem_id,
      c_name: d.c_name,
      c_name_other: d.c_name_other,
      c_sex: d.c_sex,
      d_birth: d.d_birth,
      c_udf_1: d.c_udf_1,
      d_expired_1: d.d_expired_1
    })
  })

  OriginalNameOptions.value = NameOptions.value
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
      (v.c_name? v.c_name.indexOf(val) > -1 : false) ||
      (v.c_name_other? v.c_name_other.indexOf(val) > -1 : false)
    )
  })
}
</script>