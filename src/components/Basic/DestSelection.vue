<template>
  <q-select
    clearable
    use-input
    input-debounce="0"
    filled
    @blur="textBuffer.length > 0? emit('update:modelValue', textBuffer) : ''"
    @filter="saveBuffer"
    @new-value="newDest"
    :options="dest"
    :model-value="props.modelValue"
    @update:model-value="(val) => emit('update:modelValue', val? val: null)"/>
</template>

<script setup>
import { onMounted, ref } from "vue";
import User from "components/class/user";

const props = defineProps({
  modelValue: String,
})
const textBuffer = ref("")
const emit = defineEmits(["update:modelValue"])
const originalDest = ref([
  '大堂', '活動室(一)', '活動室(二)', '舞蹈室', 'Band房', '電腦室', '會議室', '中心廣場', '星有利球場', '南蛇塘體育館', '海傍街體育館', '長洲碼頭', '中環五號碼頭'
])

const dest = ref([
  '大堂', '活動室(一)', '活動室(二)', '舞蹈室', 'Band房', '電腦室', '會議室', '中心廣場', '星有利球場', '南蛇塘體育館', '海傍街體育館', '長洲碼頭', '中環五號碼頭'
])

function saveBuffer(buf, onDone) {
  textBuffer.value = buf
  if (buf === '') {
    onDone(() => {
      dest.value = originalDest.value
    })
    return
  }

  onDone(() => {
    dest.value = originalDest.value
    dest.value = dest.value.filter(v =>
      v.includes(buf)
    )
  })
}

function newDest(val, done) {
  if (val.length > 0) {
    if (!dest.value.includes(val)) {
      dest.value.push(val)
    }
    done(val, 'toggle')
  }
}
</script>
