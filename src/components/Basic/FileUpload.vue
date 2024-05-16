<template>
  <q-uploader
    color="primary"
    flat
    bordered
    :multiple="props.mode === 'multiple'"
    :url="upload_API"
    :headers="[{ name: 'path', value: props.path }]"
    @uploaded="(filename) => emit('onDone', filename)"
  />
</template>

<script setup>
const upload_API = process.env.UPLOAD_URL;
const props = defineProps({
  path: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    /*
     * single: only one file can be uploaded
     * multiple: multiple files can be uploaded
     */
    default: "multiple",
  },
});
const emit = defineEmits(["onDone"]);
</script>
