<template>
  <q-select
    clearable
    use-input
    input-debounce="0"
    filled
    @new-value="newWeek"
    :options="week"
    :model-value="props.modelValue"
    @update:model-value="(value) => emit('update:modelValue', value? value: null)"/>
</template>

<script setup>
import { onMounted, ref } from "vue";
import User from "components/class/user";

const props = defineProps({
  modelValue: String,
})

const emit = defineEmits(["update:modelValue"])
const week = ref([
  '一', '二', '三', '四', '五', '六', '日', '一三五', '二四六'
])

function newWeek(val, done) {
  if (val.length > 0) {
    if (!week.value.includes(val)) {
      week.value.push(val)
    }
    done(val, 'toggle')
  }
}
</script>
