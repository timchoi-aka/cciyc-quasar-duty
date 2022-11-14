<template>
<div class="row">
  <div v-for="(value, key, index) in development" :key="key" class="q-pa-sm">
    <span v-if="value" class="bg-green q-pa-sm">{{key}} - 完成</span><span v-else class="bg-warning q-pa-sm">{{key}} - 未</span>
  </div>
</div>

</template>

<script>
export default {
  name: "Development Status",
  data() {
    return {
      development: {
        "新增會員": true,
        "新增會員-列印收據": false,
        "修改會員資料": true,
        "退會": true,
        "續會": false,
        "續會列印收據": false,
        "刪除會員": true,
        "搜尋會員": true,
      }
    }
  }
}
</script>