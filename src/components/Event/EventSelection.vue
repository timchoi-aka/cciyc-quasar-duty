<template>
  <q-select
    dense
    filled
    class="col-3 col-xs-3 q-mr-md-md q-mr-sm-sm q-mr-xs-none"
    use-input
    clearable
    label="活動編號"
    input-debounce="0"
    :options="EventOptions"
    :model-value="props.modelValue"
    @filter="eventFilter"
    @update:model-value="(value) => emit('update:modelValue', value? value.value: null)"
    >
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label>
            {{ scope.opt.value }} - 
            {{ scope.opt.c_act_name }}
            <q-chip v-if="scope.opt.c_status && scope.opt.c_status.trim() == '完成達標'" size="sm" class="bg-primary text-white">{{scope.opt.c_status}}</q-chip>
            <q-chip v-if="scope.opt.c_status && scope.opt.c_status.trim() == '未完成'" size="sm" class="bg-warning text-white">{{scope.opt.c_status}}</q-chip>
            <q-chip v-if="scope.opt.c_status && scope.opt.c_status.trim() == '取消'" size="sm" class="bg-teal text-white">{{scope.opt.c_status}}</q-chip>
            <q-chip v-if="scope.opt.c_status && scope.opt.c_status.trim() == '完成不達標'" size="sm" class="bg-black text-white">{{scope.opt.c_status}}</q-chip>
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:selected>
      <div v-if="props.modelValue">{{ props.modelValue }} - {{ EventOptions.filter((x) => x.value == props.modelValue).length? EventOptions.filter((x) => x.value == props.modelValue)[0].c_act_name: ''}}</div>
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
  modelValue: String,
})
const emit = defineEmits(["update:modelValue"])

// variables
const EventOptions = ref([])
const OriginalEventOptions = ref([])

// query
const { onResult: NameResult } = useQuery(gql`
  query getAllEvent {
    HTX_Event(order_by: {c_act_code: desc}, offset: 1) {
      c_act_code
      c_act_name
      c_status
    }
  }`
  , {},
  {
    pollInterval: 1000
  })

// callback
NameResult((result) => {
  if (result.data) {
    result.data.HTX_Event.forEach((d) => {
      EventOptions.value.push({
        value: d.c_act_code,
        c_act_name: d.c_act_name,
        c_status: d.c_status,
      })
    })

    OriginalEventOptions.value = EventOptions.value
  }
})

// function
function eventFilter(val, update) {
  if (val === '') {
    update(() => {
      EventOptions.value = OriginalEventOptions.value
    })
    return
  }

  update(() => {
    EventOptions.value = OriginalEventOptions.value
    EventOptions.value = EventOptions.value.filter(v => 
      (v.value? v.value.indexOf(val) > -1 : false) ||
      (v.c_act_name? v.c_act_name.toLowerCase().indexOf(val.toLowerCase()) > -1 : false)
    )
  })
}
</script>