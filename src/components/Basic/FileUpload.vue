<template>
  <q-uploader
    color="primary"
    flat
    bordered
    multiple
    :url="upload_API"
    :headers="[{name: 'path', value: props.path}]"
    @uploaded="(filename) => emit('onDone', filename)"
  />
</template>

<script setup>
const upload_API = process.env.NODE_ENV === "development"? "http://localhost:5001/manage-hr/asia-east2/file-savefiletostorage" : "https://asia-east2-manage-hr.cloudfunctions.net/file-savefiletostorage"
const props = defineProps({
  path: {
    type: String,
    required: true
  },
})
const emit = defineEmits(['onDone'])
</script>
