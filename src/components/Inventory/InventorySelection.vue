<template>
  <q-select
    dense
    filled
    class="col-3 col-xs-3 q-mr-md-md q-mr-sm-sm q-mr-xs-none"
    use-input
    clearable
    :label="props.label? props.label: '物資編號'"
    input-debounce="0"
    :options="InventoryOptions"
    :model-value="props.modelValue"
    @filter="inventoryFilter"
    @update:model-value="(value) => emit('update:modelValue', value? value.value: null)"
    >
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label>
            {{ scope.opt.value }} -
            {{scope.opt.c_name}}
            ({{scope.opt.c_location}})
            <!-- show remaining count TBC
            <div v-if="scope.opt.d_exit_1" class="text-teal">已退會</div>
            <div v-else>
              <div v-if="(!scope.opt.d_expired_1 || qdate.getDateDiff(Date.now(), scope.opt.d_expired_1) > 0)" class="text-red">會藉過期</div>
              <div v-else class="text-primary">會藉有效</div>
            </div>
            -->
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
import { useQuery } from "@vue/apollo-composable"
import { gql } from "graphql-tag"

// props & emits
const props = defineProps({
  modelValue: String,
  InventoryID: String,
  label: String,
})
const emit = defineEmits(["update:modelValue"])

// variables
const InventoryOptions = ref([])
const OriginalInventoryOptions = ref([])

// query
const { onResult: InventoryResult } = useQuery(gql`
  query allInventory {
    Inventory {
      f_cost
      d_purchase
      c_name
      c_model
      c_location
      c_funding
      ID
      i_qty
    }
  }`
  )

// callback
InventoryResult((result) => {
  if (result.data) {
    result.data.Inventory.forEach((d) => {
      if (
        d.ID != props.InventoryID
      ) {
        InventoryOptions.value.push({
          value: d.ID,
          c_name: d.c_name,
          f_cost: d.f_cost,
          d_purchase: d.d_purchase,
          c_model: d.c_model,
          c_location: d.c_location,
          c_funding: d.c_funding
        })
      }
    })

    OriginalInventoryOptions.value = InventoryOptions.value
  }
})

// function
function inventoryFilter(val, update) {
  if (val === '') {
    update(() => {
      InventoryOptions.value = OriginalInventoryOptions.value
    })
    return
  }

  update(() => {
    InventoryOptions.value = OriginalInventoryOptions.value
    InventoryOptions.value = InventoryOptions.value.filter(v =>
      (v.value? v.value.indexOf(val) > -1 : false) ||
      (v.c_name? v.c_name.toLowerCase().indexOf(val.toLowerCase()) > -1 : false)
    )
  })
}
</script>
