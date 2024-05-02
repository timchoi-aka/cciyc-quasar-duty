<template>
  <q-select
    use-input
    filled
    type="text"
    :options="reviewMethodOptions"
    :model-value="props.modelValue"
    @new-value="newMethod"
    @update:model-value="
      (value) => (value ? emit('update:modelValue', value) : null)
    "
  />
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    required: false,
  },
});
const emit = defineEmits(["update:modelValue"]);
const reviewMethodOptions = ref(["問卷", "工作員觀察", "工作員提問", "其他"]);
function newMethod(val, done) {
  if (reviewMethodOptions.value.length > 0) {
    if (!reviewMethodOptions.value.includes(val)) {
      reviewMethodOptions.value.push(val);
    }
    done(val, "toggle");
  }
}
</script>
