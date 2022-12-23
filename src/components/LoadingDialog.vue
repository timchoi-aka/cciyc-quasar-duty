<template>
  <q-card style="width: 200px">
    <q-card-section class="row">
      <q-circular-progress
        indeterminate
        show-value
        size="100px"
        :thickness="0.4"
        font-size="10px"
        color="lime"
        track-color="grey-3"
        center-color="grey-3"
        class="q-ma-md col float-right vertical-middle"
        >{{ props.message }}</q-circular-progress
      >
    </q-card-section>
  </q-card>
</template>

<script setup>

const props = defineProps({
  message: String,
})
</script>
