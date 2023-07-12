<template>
  <q-select 
    label="員工" 
    clearable
    input-debounce="0" 
    filled 
    :bottom-slots="props.hint && props.hint.length > 0"
    multiple
    :options="UserList" 
    :model-value="props.modelValue" 
    @update:model-value="(value) => emit('update:modelValue', value? value: null)">
    <template v-slot:hint>
      {{ props.hint }}
    </template>
  </q-select>
</template>

<script setup>
import { onMounted, ref } from "vue";
import User from "components/class/user";

const props = defineProps({
  modelValue: {
   Type: Array,
   Default: []
  },
  hint: {
    Type: String,
    Default: ""
  }
})

const emit = defineEmits(["update:modelValue"])
const UserList = ref([
  {
  value: '',
  label: '全部'
  }
])

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