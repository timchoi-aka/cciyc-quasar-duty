<!--
  * @Description: Event Evaluation Review Block Objective Achieved Selection

  * @Input Props:
  *   - modelValue: The current value of the review block, used for v-model binding.

  * @Output Emits:
  *   - update:modelValue: Emits updates to the modelValue when changes occur within the component.

  * @New Value Emits:
  *   - newValue: Emits a new value when the user enters a new value in the selection.

  * @Options:
  *   - options: The list of options available for selection.
-->
<template>
  <q-select
    use-input
    filled
    type="text"
    :options="options"
    :model-value="props.modelValue"
    @new-value="newValue"
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
const options = ref([
  "完成達標",
  "完成未能達標",
  "未能完成",
  "*是次課堂之目標成效與上期相同",
]);
function newValue(val, done) {
  if (options.value.length > 0) {
    if (!options.value.includes(val)) {
      options.value.push(val);
    }
    done(val, "toggle");
  }
}
</script>
