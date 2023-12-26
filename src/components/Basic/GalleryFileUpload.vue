<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section class="bg-primary text-white q-pa-md q-ma-none">
        上載相片
      </q-card-section>
      <q-card-section class="q-mt-md row">
        <FileUpload class="col-12" :mode="props.mode" :path="props.path" @onDone="(val) => filename.push(val.files[0].name)"/>
      </q-card-section>

      <q-card-actions align="right">
        <q-form
          @submit="onOKClick"
          @reset="onDialogCancel"
          >
          <CancelButton/>
          <OKButton :disabled="filename.length == 0"/>
        </q-form>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import FileUpload from 'src/components/Basic/FileUpload.vue'
import CancelButton from 'src/components/Basic/CancelButton.vue'
import OKButton from 'src/components/Basic/OKButton.vue'

const props = defineProps({
  path: {
    type: String,
    required: true
  },
  mode: {
    type: String,
    /*
    * single: only one file can be uploaded
    * multiple: multiple files can be uploaded
    */
    default: 'multiple'
  }
})
const filename = ref([])

defineEmits([
  // REQUIRED; need to specify some events that your
  // component will emit through useDialogPluginComponent()
  ...useDialogPluginComponent.emits
])

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()
// dialogRef      - Vue ref to be applied to QDialog
// onDialogHide   - Function to be used as handler for @hide on QDialog
// onDialogOK     - Function to call to settle dialog with "ok" outcome
//                    example: onDialogOK() - no payload
//                    example: onDialogOK({ /*...*/ }) - with payload
// onDialogCancel - Function to call to settle dialog with "cancel" outcome

// this is part of our example (so not required)
function onOKClick () {
  // on OK, it is REQUIRED to
  // call onDialogOK (with optional payload)
  onDialogOK(filename)
  // or with payload: onDialogOK({ ... })
  // ...and it will also hide the dialog automatically
}
</script>
