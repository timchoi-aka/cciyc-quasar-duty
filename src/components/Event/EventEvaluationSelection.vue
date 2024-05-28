<template>
  <q-select dense filled class="col-3 col-xs-3 q-mr-md-md q-mr-sm-sm q-mr-xs-none" use-input label="活動編號"
    input-debounce="0" :options="EventOptions" :model-value="props.modelValue" @filter="eventFilter"
    @update:model-value="(value) => emit('update:modelValue', value ? value.value.trim() : null)
      ">
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label>
            {{ scope.opt.value }} -
            {{ scope.opt.c_act_name }}
            <q-chip v-if="
              scope.opt.c_status && scope.opt.c_status.trim() == '完成達標'
            " size="sm" class="bg-primary text-white">{{ scope.opt.c_status }}</q-chip>
            <q-chip v-if="scope.opt.c_status && scope.opt.c_status.trim() == '未完成'" size="sm"
              class="bg-warning text-white">{{ scope.opt.c_status }}</q-chip>
            <q-chip v-if="scope.opt.c_status && scope.opt.c_status.trim() == '取消'" size="sm"
              class="bg-teal text-white">{{ scope.opt.c_status }}</q-chip>
            <q-chip v-if="
              scope.opt.c_status && scope.opt.c_status.trim() == '完成不達標'
            " size="sm" class="bg-black text-white">{{ scope.opt.c_status }}</q-chip>
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:selected>
      <div v-if="props.modelValue">
        {{ props.modelValue }} -
        <span v-if="EventOptions.length > 0">
          {{
            EventOptions.find((x) => x.value.trim() == props.modelValue) && EventOptions.find((x) => x.value.trim() ==
              props.modelValue).c_act_name
          }}
        </span>
      </div>
    </template>
    <template v-slot:no-option> 沒有結果 </template>
  </q-select>
</template>

<script setup>
import { ref, watch } from "vue";
import { useEventIDProvider } from "src/providers/event";

// props & emits
const props = defineProps({
  modelValue: String,
});
const emit = defineEmits(["update:modelValue"]);

// variables
const EventOptions = ref([]);
const OriginalEventOptions = ref([]);

// query
const { result } = useEventIDProvider();

watch(result, (newValue) => {
  if (newValue.HTX_Event) {
    newValue.HTX_Event.forEach((d) => {
      EventOptions.value.push({
        value: d.c_act_code,
        c_act_name: d.c_act_name,
        c_status: d.c_status,
      });
    });
    EventOptions.value.sort((a, b) => b.value.localeCompare(a.value));
    OriginalEventOptions.value = EventOptions.value;
  }
});

// function
function eventFilter(val, update) {
  if (val === "") {
    update(() => {
      EventOptions.value = OriginalEventOptions.value;
    });
    return;
  }

  update(() => {
    EventOptions.value = OriginalEventOptions.value;
    EventOptions.value = EventOptions.value.filter(
      (v) =>
        (v.value ? v.value.indexOf(val) > -1 : false) ||
        (v.c_act_name
          ? v.c_act_name.toLowerCase().indexOf(val.toLowerCase()) > -1
          : false)
    );
  });
}
</script>
