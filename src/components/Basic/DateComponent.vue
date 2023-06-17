<template>
  <!-- hint="YYYY/MM/DD" -->
  <q-input 
    mask="date"
    :label="props.label? props.label: ''"
    filled
    :model-value="props.modelValue"
    hint="YYYY/MM/DD"
    clearable
    hide-bottom-space
    @update:model-value="(value) => $emit('update:modelValue', value)">
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy
            cover
            transition-show="scale"
            transition-hide="scale"
          >
            <q-date
              :model-value="props.modelValue"
              @update:model-value="(value) => $emit('update:modelValue', value)">
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="關閉" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
  </q-input>
</template>

<script setup>
const emit = defineEmits(["update:modelValue"])
const props = defineProps({
  modelValue: String,
  label: String,
})
</script>