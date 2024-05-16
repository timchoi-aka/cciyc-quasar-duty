<template>
  <q-select
    filled
    class="col-3 col-xs-3 q-mr-md-md q-mr-sm-sm q-mr-xs-none"
    use-input
    clearable
    label="會計類別"
    input-debounce="0"
    :options="AccountOptions"
    :model-value="props.modelValue"
    @update:model-value="
      (value) => emit('update:modelValue', value ? value : null)
    "
  />
</template>

<script setup>
import { useAccountTypeProvider } from "src/providers/account";
import { computed } from "vue";

// props & emits
const props = defineProps({
  modelValue: String,
});
const emit = defineEmits(["update:modelValue"]);

// query
const { result } = useAccountTypeProvider();

// variables
const AccountOptions = computed(() =>
  result.value?.tbl_sel_acc_type.map((x) => x.c_type)
);
</script>
