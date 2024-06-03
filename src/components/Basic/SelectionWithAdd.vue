<template>
  <q-select clearable filled :options="options" :model-value="props.modelValue"
    @update:model-value="(val) => emit('update:modelValue', val ? val : null)">
    <template v-slot:append>
      <q-btn @click="e => AddButtonClick(e)" icon="add" flat round />
    </template>
    <q-dialog v-model="inputDialog" position="bottom">
      <q-card>
        <q-form @submit="saveBuffer(textBuffer)">
          <q-card-section class="bg-primary text-white text-caption q-pa-sm">新增資料</q-card-section>
          <q-card-section>
            <q-input v-model="textBuffer" autofocus />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn label="取消" color="negative" v-close-popup />
            <q-btn label="確定" color="positive" type="submit" v-close-popup />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-select>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    required: false,
  },
  options: {
    type: Array,
    required: true,
  },
})

const textBuffer = ref("")
const emit = defineEmits(["update:modelValue"])
const options = ref([...props.options, props.modelValue])
const inputDialog = ref(false)

function saveBuffer(buf) {
  if (buf.length > 0 && !options.value.includes(buf)) {
    options.value.push(buf)
    emit('update:modelValue', buf)
  }
}

function AddButtonClick(event) {
  if (event.target.tagName != "I") return

  event.stopPropagation()
  textBuffer.value = ""
  inputDialog.value = true
}
</script>
