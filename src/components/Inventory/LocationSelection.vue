<template>
  <q-dialog v-model="deleteModal">
    <q-card>
      <q-card-section>
        確定刪除地點 - {{  props.modelValue }} ？
      </q-card-section>
      <q-card-actions>
        <q-btn icon="cancel" label="取消" class="bg-yellow-9 text-white" v-close-popup/>
        <q-btn icon="check" label="確定" class="bg-primary text-white" v-close-popup @click="confirmDelete"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
  <!-- @blur="tmpBuffer.length > 0 ? emit('update:modelValue', tmpBuffer): null" -->
  <q-select
    dense
    filled
    class="col-3 col-xs-3 q-mr-md-md q-mr-sm-sm q-mr-xs-none"
    use-input
    clearable
    :label="props.label? props.label: '物資地點'"
    input-debounce="100"
    new-value-mode="add-unique"
    :options="LocationOptions"
    :model-value="props.modelValue"
    @new-value="createValue"
    @update:model-value="(value) => emit('update:modelValue', value? value: null)"
    >
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps" class="items-center">
        {{ scope.opt }}
        <q-btn icon="delete" size="xs" dense flat outline class="text-red col-auto" @click="deleteModal = true"/>      
      </q-item>
    </template>
    <template v-slot:selected>
      <div v-if="props.modelValue" class="row col-12">
        <div class="col-auto">{{ props.modelValue }}</div>
      </div>
    </template>
    <template v-slot:no-option>          
      沒有結果    
    </template>
  </q-select>
</template>

<script setup>
import { ref } from "vue"
import { useQuery, useMutation } from "@vue/apollo-composable"
import { gql } from "graphql-tag"
import { useQuasar } from "quasar"

// props & emits
const props = defineProps({
  modelValue: String,
  label: String,
})
const emit = defineEmits(["update:modelValue"])
const $q = useQuasar()

// variables
const LocationOptions = ref([])
const deleteOptions = ref()
const deleteModal = ref(false)
const OriginalLocationOptions = ref([])

// query
const { onResult: LocationResult } = useQuery(gql`
  query getAllLocation {
    Inventory_Location {
      c_location
    }
  }`)

const { mutate: addLocation, onDone: addLocation_Completed } = useMutation(gql`
mutation addLocation($c_location: String = "") {
  insert_Inventory_Location_one(object: {c_location: $c_location}) {
    c_location
  }
}`)

const { mutate: delLocation, onDone: delLocation_Completed } = useMutation(gql`
mutation delLocation($c_location: String = "") {
  delete_Inventory_Location_by_pk(c_location: $c_location) {
    c_location
  }
}`)

// computed
LocationResult((result) => {
  if (result.data && result.data.Inventory_Location) {
    LocationOptions.value = []
    result.data.Inventory_Location.forEach((data) => {
      LocationOptions.value.push((data.c_location.trim()))
    })
  }
})
  

// function
function createValue (val, done) {
  addLocation({
    c_location: val.trim()
  })

  done(val.trim(), 'add-unique')
}

function confirmDelete() {
  delLocation({
    c_location: props.modelValue
  })
}

// callback
addLocation_Completed((result) => {
  $q.notify({ message: "新增地點-" + result.data.insert_Inventory_Location_one.c_location, icon: 'check', color: 'positive', textColor: 'white' })
})

delLocation_Completed((result) => {
  $q.notify({ message: "已刪除地點-" + result.data.delete_Inventory_Location_by_pk.c_location, icon: 'error', color: 'negative', textColor: 'white' })
  emit('update:modelValue', null)
})
</script>