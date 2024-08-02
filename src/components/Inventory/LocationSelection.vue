<template>
  <q-dialog v-model="deleteModal">
    <q-card>
      <q-card-section>
        確定刪除地點 - {{ props.modelValue }} ？
      </q-card-section>
      <q-card-actions>
        <q-btn
          icon="cancel"
          label="取消"
          class="bg-yellow-9 text-white"
          v-close-popup
        />
        <q-btn
          icon="check"
          label="確定"
          class="bg-primary text-white"
          v-close-popup
          @click="confirmDelete"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- @blur="tmpBuffer.length > 0 ? emit('update:modelValue', tmpBuffer): null" -->
  <q-select
    dense
    filled
    class="col-3 col-xs-3 q-mr-md-md q-mr-sm-sm q-mr-xs-none"
    use-input
    clearable
    :label="props.label ? props.label : '資產地點'"
    input-debounce="100"
    new-value-mode="add-unique"
    :options="LocationOptions"
    :model-value="props.modelValue"
    @new-value="createValue"
    @update:model-value="
      (value) => emit('update:modelValue', value ? value : null)
    "
  >
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps" class="items-center">
        {{ scope.opt }}
        <q-btn
          icon="delete"
          size="xs"
          dense
          flat
          outline
          class="text-red col-auto"
          @click="deleteModal = true"
        />
      </q-item>
    </template>
    <template v-slot:selected>
      <div v-if="props.modelValue" class="row col-12">
        <div class="col-auto">{{ props.modelValue }}</div>
      </div>
    </template>
    <template v-slot:no-option> 沒有結果 </template>
  </q-select>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useQuasar } from "quasar";
import { useInventoryProvider } from "src/providers/inventory";

// props & emits
const props = defineProps({
  modelValue: String,
  label: String,
});
const emit = defineEmits(["update:modelValue"]);
const $q = useQuasar();

// variables
const deleteModal = ref(false);

// query
const LocationOptions = computed(
  () => result.value?.Inventory_Location?.map((x) => x.c_location?.trim()) ?? []
);
const { result, message, addLocation, deleteLocation } = useInventoryProvider();

// function
function createValue(val, done) {
  addLocation({
    c_location: ref(val.trim()),
  }).then(() => {
    emit("update:modelValue", val.trim());
    done(val.trim(), "add-unique");
  });
}

function confirmDelete() {
  deleteLocation({
    c_location: ref(props.modelValue),
  }).then(() => {
    emit("update:modelValue", null);
  });
}

// display result message to user
watch(message, (newMessage) => {
  if (newMessage) {
    $q.notify({
      message: newMessage,
    });
  }
});
</script>
