<template>
  <q-select
    dense
    filled
    menu-self="bottom end"
    class="col-3 col-xs-3 q-mr-md-md q-mr-sm-sm q-mr-xs-none"
    use-input    
    :clearable="props.clearable"
    :label="props.label? props.label: '會員編號'"
    input-debounce="0"
    :options="NameOptions"
    :model-value="props.modelValue"
    @filter="nameFilter"
    @update:model-value="(value) => emit('update:modelValue', value? value.value? value.value: value: null)"
    >
    <!-- @input-value="(value) => emit('update:modelValue', value? value.value? value.value: value : null)" -->
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label>
            {{ scope.opt.value }} - 
            {{scope.opt.c_name? scope.opt.c_name: scope.opt.c_name_other}} 
            ({{ageUtil.calculateAge(scope.opt.d_birth)}}歲 - {{scope.opt.c_sex}})
            <div v-if="scope.opt.d_exit_1" class="text-teal">已退會</div>
            <div v-else>
              <div v-if="(!scope.opt.d_expired_1 || qdate.getDateDiff(Date.now(), scope.opt.d_expired_1) > 0)" class="text-red">會藉過期</div>
              <div v-else class="text-primary">會藉有效</div>
            </div>
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:selected>
      <div v-if="props.modelValue">{{ props.modelValue }}</div>
      <div v-if="props.showName">{{ NameOptions.findIndex((e) => e.value == props.modelValue) >= 0?  " - " + NameOptions[NameOptions.findIndex((e) => e.value == props.modelValue)].c_name: "" }}</div>  
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
  MemberID: String,
  label: String,
  showName: {
    type: Boolean,
    default: false,
  },
  clearable: {
    type: Boolean,
    default: true,
  }
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
      d_exit_1
    }
  }`, {}, {
    pollInterval: 1000
  }
  )

// callback
NameResult((result) => {
  if (result.data) {
    result.data.Member.forEach((d) => {
      if (
        d.c_mem_id != props.MemberID &&
        d.c_mem_id != "9999" && // 顧客
        d.d_exit_1 == null &&
        (
          d.d_expired_1 == null || 
          qdate.getDateDiff(Date.now(), d.d_expired_1) < 0
        )
      ) {
        NameOptions.value.push({
          value: d.c_mem_id,
          c_name: d.c_name,
          c_name_other: d.c_name_other,
          c_sex: d.c_sex,
          d_birth: d.d_birth,
          c_udf_1: d.c_udf_1,
          d_expired_1: d.d_expired_1,
          d_exit_1: d.d_exit_1
        })
      }
    })

    OriginalNameOptions.value = NameOptions.value
  }
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

    if (NameOptions.value.length == 1) {
      emit('update:modelValue', NameOptions.value[0].value)
    }
    /*
    if (NameOptions.value.length == 0) {
      NameOptions.value.push({
        value: d.c_mem_id,
        c_name: d.c_name,
        c_name_other: d.c_name_other,
        c_sex: d.c_sex,
        d_birth: d.d_birth,
        c_udf_1: d.c_udf_1,
        d_expired_1: d.d_expired_1,
        d_exit_1: d.d_exit_1
      })
    }
    */
  })
}

/*
function createValue(val, done) {
  // specific logic to eventually call done(...) -- or not
  props.newValue? done(val): null;

  // done callback has two optional parameters:
  //  - the value to be added
  //  - the behavior (same values of new-value-mode prop,
  //    and when it is specified it overrides that prop –
  //    if it is used); default behavior (if not using
  //    new-value-mode) is to add the value even if it would
  //    be a duplicate
}
*/
</script>