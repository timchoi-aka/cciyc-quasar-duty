<template>
  <q-select 
    label="員工" 
    clearable
    input-debounce="0" 
    filled 
    multiple
    :options="UserList" 
    :model-value="props.modelValue" 
    @update:model-value="(value) => emit('update:modelValue', value? value: null)"/>
</template>

<script setup>
import { onMounted, ref } from "vue";
import User from "components/class/user";

const props = defineProps({
  modelValue: {
   Type: Array,
   Default: []
  }
})

const emit = defineEmits(["update:modelValue"])
const UserList = ref([])

onMounted(async() => {
  let users = await User.loadPermUsers()
  users.forEach((u) => {
    UserList.value.push({
      value: u.uid,
      label: u.name
    })
  })
})
</script>