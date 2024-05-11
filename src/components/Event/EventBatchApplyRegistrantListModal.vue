<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card
      class="q-dialog-plugin"
      style="min-width: 80vw; width: 80vw; max-width: 80vw"
    >
      <q-card>
        <q-card-section
          class="row text-caption bg-primary text-white text-bold items-center q-ma-none q-pa-sm"
          >已報名人士
          <q-space />
          <q-input
            v-model="search"
            outlined
            dense
            input-debounce="300"
            class="q-mr-sm text-white"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="white" />
            </template>
          </q-input>
          <q-btn flat round dense icon="close" @click="onDialogHide" />
        </q-card-section>
        <q-card-section>
          <q-btn
            v-for="(r, index) in props.registrants.filter(
              (x) => x.c_name.includes(search) || x.c_mem_id.includes(search)
            )"
            :key="index"
            class="q-my-sm text-primary q-ma-sm"
            @click="
              showMemberID = r.c_mem_id;
              memberDetailModal = true;
            "
            outline
            >{{ index + 1 }}. ({{ r.c_mem_id }}) - {{ r.c_name }}
          </q-btn>
        </q-card-section>
        <q-card-section v-if="memberDetailModal">
          <!-- memberDetail modal -->
          <q-card style="min-width: 70vw; width: 70vw; max-width: 70vw">
            <MemberDetail v-model="showMemberID" />
          </q-card>
        </q-card-section>
      </q-card>
      <q-card-actions align="right">
        <q-btn color="primary" label="OK" @click="onOKClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from "vue";
import { useDialogPluginComponent } from "quasar";
import MemberDetail from "../Member/MemberDetail.vue";
const props = defineProps({
  registrants: {
    type: Object,
    required: true,
  },
});
const memberDetailModal = ref(false);
const showMemberID = ref("");
const search = ref("");
defineEmits([
  // REQUIRED; need to specify some events that your
  // component will emit through useDialogPluginComponent()
  ...useDialogPluginComponent.emits,
]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
// dialogRef      - Vue ref to be applied to QDialog
// onDialogHide   - Function to be used as handler for @hide on QDialog
// onDialogOK     - Function to call to settle dialog with "ok" outcome
//                    example: onDialogOK() - no payload
//                    example: onDialogOK({ /*...*/ }) - with payload
// onDialogCancel - Function to call to settle dialog with "cancel" outcome

// this is part of our example (so not required)
function onOKClick() {
  // on OK, it is REQUIRED to
  // call onDialogOK (with optional payload)
  onDialogOK();
  // or with payload: onDialogOK({ ... })
  // ...and it will also hide the dialog automatically
}
</script>
