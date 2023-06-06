<template>
  <q-dialog v-model="display" position="bottom">
    <q-card style="width: 200px">
      <q-card-section class="row">
        <q-circular-progress
          indeterminate
          show-value
          size="100px"
          :thickness="0.4"
          font-size="10px"
          color="lime"
          track-color="grey-3"
          center-color="grey-3"
          class="q-ma-md col float-right vertical-middle"
          >{{ props.message }}</q-circular-progress
        >
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { watch, computed } from "vue"
const props = defineProps({
  message: String,
  modelValue: {
    type: Number,
    default: 0
  }
})
const emit = defineEmits(["update:modelValue"])

let timeoutID = null

// watcher
watch(() => props.modelValue, (newValue, oldValue)  => { 
  if (newValue > 0) {
    timeoutID = setTimeout(timeout, 10000)
  } else {
    clearTimeout(timeoutID)
    timeoutID = null
  }

  function timeout() {
    emit('update:modelValue', 0)
    $q.notify({ message: "系統沒有回應 - 請聯絡系統管理員", icon: 'error', color: 'negative', textColor: 'white' })
  }
})

// computed
const display = computed(() => props.modelValue > 0 && timeoutID? true: false)
</script>
