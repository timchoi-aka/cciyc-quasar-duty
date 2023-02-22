<template>
  <q-select 
    label="員工" 
    clearable
    input-debounce="0" 
    filled 
    :options="UserList" 
    :model-value="props.modelValue" 
    @update:model-value="(value) => emit('update:modelValue', value? value: null)"/>
</template>

<script setup>
import { usersCollection } from "src/boot/firebase";
import { getDocs, query, where } from "firebase/firestore";
import { ref } from "vue";
const props = defineProps({
  modelValue: String,
})

const emit = defineEmits(["update:modelValue"])

const userDocQuery = query(usersCollection,
  where("privilege.systemAdmin", "==", false),
  where("privilege.tmp", "!=", true),
  where("enable", "==", true)
)

const UserList = ref([])

getDocs(userDocQuery).then((docs) =>
  docs.forEach((doc) => {
    UserList.value.push(doc.data().name)
  })
)
</script>