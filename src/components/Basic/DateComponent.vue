<template>
  <!-- hint="YYYY/MM/DD" -->
  <q-input mask="date" :label="props.label ? props.label : ''" filled :model-value="props.modelValue" hint="YYYY/MM/DD"
    :clearable="props.clearable" hide-bottom-space @update:model-value="(value) => $emit('update:modelValue', value)">
    <template v-slot:append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date :model-value="date.formatDate(props.modelValue, 'YYYY/MM/DD')" :today-btn="true"
            @update:model-value="(value) => $emit('update:modelValue', value)" :locale="{
              days: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
              daysShort: ['日', '一', '二', '三', '四', '五', '六'],
              months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
              monthsShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
            }">
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
import { date } from "quasar"
const emit = defineEmits(["update:modelValue"])
const props = defineProps({
  // format YYYY-MM-DD
  modelValue: String,
  label: String,
  clearable: {
    type: Boolean,
    default: true
  }
})
</script>
