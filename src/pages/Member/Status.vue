<template>
<div class="row">
  <div v-for="(value, key, index) in development" :key="key" class="q-pa-sm">
    <span v-if="value" class="bg-green q-pa-sm">{{key}} - 完成</span><span v-else class="bg-warning q-pa-sm">{{key}} - 未</span>
  </div>
</div>

</template>

<script setup>
import { ref } from 'vue'

const development = ref({
  "新增會員": true,
  "新增會員-列印收據": true,
  "修改會員資料": true,
  "退會": true,
  "續會": true,
  "續會列印收據": true,
  "刪除會員": true,
  "搜尋會員": true,
  "會員 - 報表": true,
  "義工記錄 - 新增": true,
  "義工記錄 - 修改": true,
  "義工記錄 - 報表": true,
})
</script>