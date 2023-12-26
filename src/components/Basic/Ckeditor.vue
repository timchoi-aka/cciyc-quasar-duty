<template>
  <div ref="editorContainer"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import Editor from '/ckeditor/build/ckeditor'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  newsID: {
    type: Number,
    required: true,
  }
});

const emit = defineEmits(['update:modelValue']);
const editorContainer = ref(null);
let editorInstance;

onMounted(async () => {
  editorInstance = await Editor.create(editorContainer.value, {
    // CKEditor configuration
    // plugins: [ SimpleUploadAdapter, /* ... */ ],

    simpleUpload: {
      uploadUrl: 'https://asia-east2-manage-hr.cloudfunctions.net/file-savefiletostorage',
      // withCredentials: true,
      headers: {
        'path': 'News/'+props.newsID,
        'Access-Control-Allow-Origin': '*',
      }
    }

  });

  editorInstance.model.document.on('change:data', () => {
    emit('update:modelValue', editorInstance.getData());
  });

  if (props.modelValue) {
    editorInstance.setData(props.modelValue);
  }
});

watch(() => props.modelValue, (newValue) => {
  if (editorInstance && editorInstance.getData() !== newValue) {
    editorInstance.setData(newValue);
  }
});

onBeforeUnmount(() => {
  if (editorInstance) {
    editorInstance.destroy();
  }
});
</script>
