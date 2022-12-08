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
  "新增活動": true,
  "報名活動": true,
  "列印收據": true,
  "修改活動資料": true,
  "刪除活動": true,
  "計劃/檢討": true,
  "審批計劃/檢討": false,
  "統計報表": false,
  "活動進行中": true,
  "搜尋活動": true,
  "我的活動": true,
  "Dashboard": false,
  "活動退款": false,
})
</script>