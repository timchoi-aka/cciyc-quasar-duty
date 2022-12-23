<template>
  <q-page>
    <q-page-sticky style="z-index: 1" position="top" expand>
      <q-tabs
        dense
        class="text-black bg-light-blue-2 fit"
        active-color="brown"
        indicator-color="blue"
        align="justify"
      >
        <q-route-tab to="/user/normal" icon="schedule" label="固定員工" />
        <q-route-tab to="/user/temp" icon="more_time" label="臨時員工" />
      </q-tabs>
    </q-page-sticky>
    <q-separator class="q-mt-xl" />
    <router-view class="q-mt-md q-mb-xl" />
  </q-page>
</template>

<script setup>
</script>

<style scoped></style>
