<template>
<div class="row">
  <div v-for="(value, key, index) in development" :key="key" class="q-pa-sm">
    <span v-if="value" class="bg-green q-pa-sm">{{key}} - 完成</span><span v-else class="bg-warning q-pa-sm">{{key}} - 未</span>
  </div>
</div>

</template>

<script setup>
import { ref } from "vue"

const development = ref({
  "新增活動": false,
  "報名活動": false,
  "列印收據": false,
  "修改活動資料": false,
  "刪除活動": false,
  "計劃/檢討": false,
  "統計報表": false,
  "活動進行中": true,
  "搜尋活動": true,
})
</script>