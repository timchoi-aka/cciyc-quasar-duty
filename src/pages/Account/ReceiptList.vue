<template>
  <router-view style="margin-top: 70px;"/>
  <q-page-sticky position="top" expand>
    <q-tabs
      dense
      class="text-black bg-light-blue-2 fit"
      active-color="brown"
      indicator-color="blue"
      align="justify"
    >
      <q-route-tab to="/account/" icon="add" label="新增記錄" />
      <q-route-tab to="/volunteer/edit" icon="edit" label="修改記錄" />
      <q-route-tab to="/volunteer/report" icon="leaderboard" label="報表" />
    </q-tabs>
  </q-page-sticky>
</template>

<script setup>

</script>