<template>
  <q-dialog v-model="display" position="bottom">
    <q-card style="width: 200px">
      <q-card-section class="row justify-center items-center">
        <q-spinner-hourglass class="on-left text-primary" size="md" />
        <div class="text-body1 text-primary">{{ props.message }}</div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { watch, computed } from "vue";
import { useQuasar } from "quasar";

const $q = useQuasar();
const props = defineProps({
  message: {
    Type: String,
    Default: "讀取中...",
  },
  modelValue: {
    type: Number,
    default: 0,
  },
});
const emit = defineEmits(["update:modelValue"]);

let timeoutID = null;

// watcher
watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    if (newValue > 0) {
      timeoutID = setTimeout(timeout, 10000);
    } else {
      clearTimeout(timeoutID);
      timeoutID = null;
    }

    function timeout() {
      emit("update:modelValue", 0);
      $q.notify({
        message: "系統沒有回應 - 請聯絡系統管理員",
        icon: "error",
        color: "negative",
        textColor: "white",
      });
    }
  }
);

// computed
const display = computed(() =>
  props.modelValue > 0 && timeoutID ? true : false
);
</script>
