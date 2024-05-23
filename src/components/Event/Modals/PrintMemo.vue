<template>
  <q-dialog
    v-if="$q.screen.lt.md"
    :model-value="props.modelValue"
    persistent
    maximized
    full-width
  >
    <q-card flat class="q-pa-none flex" style="min-height: 100%; height: 100%">
      <q-card-section class="bg-primary text-white row">
        <q-space />
        <q-btn
          flat
          dense
          icon="close"
          @click="emit('update:modelValue', false)"
          aria-label="Close"
        />
      </q-card-section>
      <q-card-section><MemoPDF :printMemo="props.printMemo" /></q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog
    v-else
    :model-value="props.modelValue"
    persistent
    full-height
    style="min-width: 50vw; width: 50vw; max-width: 50vw"
  >
    <q-card flat class="q-pa-none" style="min-height: 100%; height: 100%">
      <q-card-section class="bg-primary text-white row q-pa-xs">
        <q-space />
        <q-btn
          flat
          dense
          icon="close"
          @click="emit('update:modelValue', false)"
          aria-label="Close"
        />
      </q-card-section>
      <q-card-section style="min-height: 80vh; height: 80vh">
        <MemoPDF :printMemo="props.printMemo" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useQuasar } from "quasar";
import MemoPDF from "components/Event/MemoPDF.vue";

const $q = useQuasar();
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  printMemo: {
    type: Object,
    default: { c_mem_id: "", c_act_code: "" },
  },
});
const emit = defineEmits(["update:modelValue"]);
</script>
