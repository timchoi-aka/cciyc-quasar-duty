<template>
  <q-select
    dense
    filled
    menu-self="bottom end"
    class="col-3 col-xs-3 q-mr-md-md q-mr-sm-sm q-mr-xs-none"
    use-input
    :clearable="props.clearable"
    :label="props.label ? props.label : '會員編號'"
    input-debounce="0"
    @filter="nameFilter"
    :options="NameOptions"
    :model-value="props.modelValue"
    @update:model-value="
      (value) =>
        emit(
          'update:modelValue',
          value ? (value.value ? value.value : value) : null
        )
    "
  >
    <!-- @input-value="(value) => emit('update:modelValue', value? value.value? value.value: value : null)" -->
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label>
            {{ scope.opt.value }} -
            {{ scope.opt.c_name ? scope.opt.c_name : scope.opt.c_name_other }}
            ({{ scope.opt.age }}歲 - {{ scope.opt.c_sex }})
            <q-icon
              v-if="scope.opt.isActive"
              key="active_member"
              name="check_circle"
              color="positive"
            >
              <q-tooltip>會藉有效</q-tooltip>
            </q-icon>
            <q-icon v-else key="inactive_member" name="cancel" color="negative">
              <q-tooltip>會藉無效</q-tooltip>
            </q-icon>
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:selected>
      <div v-if="props.modelValue">{{ props.modelValue }}</div>
      <div v-if="props.showName">
        {{
          NameOptions.findIndex((e) => e.value == props.modelValue) >= 0
            ? " - " +
              NameOptions[
                NameOptions.findIndex((e) => e.value == props.modelValue)
              ].c_name
            : ""
        }}
      </div>
    </template>
    <template v-slot:no-option>沒有結果</template>
  </q-select>
</template>

<script setup>
import { ref, watch } from "vue";
import { useMemberProvider } from "src/providers/member.js";

// props & emits
const props = defineProps({
  modelValue: String,
  MemberID: String,
  label: String,
  showName: {
    type: Boolean,
    default: false,
  },
  clearable: {
    type: Boolean,
    default: true,
  },
  includeExpired: {
    type: Boolean,
    default: true,
  },
  includeCustomer: {
    type: Boolean,
    default: true,
  },
});
const emit = defineEmits(["update:modelValue"]);

// variables
const NameOptions = ref([]);
const OriginalNameOptions = ref([]);

const { result } = useMemberProvider();

watch(result, (data) => {
  let now = new Date();
  NameOptions.value = [];
  data.forEach((d) => {
    if (d.c_mem_id != props.MemberID) {
      if (props.includeExpired) {
        NameOptions.value.push({
          value: d.c_mem_id,
          c_name: d.c_name,
          c_name_other: d.c_name_other,
          age: d.getAge(now),
          c_sex: d.c_sex,
          isActive: d.isActive(now),
        });
      } else {
        if (d.isActive(now)) {
          NameOptions.value.push({
            value: d.c_mem_id,
            c_name: d.c_name,
            c_name_other: d.c_name_other,
            age: d.getAge(now),
            c_sex: d.c_sex,
            isActive: d.isActive(now),
          });
        }
      }
    }
  });
  OriginalNameOptions.value = NameOptions.value;
});

// function
function nameFilter(val, update) {
  if (val === "") {
    update(() => {
      NameOptions.value = OriginalNameOptions.value;
    });
    return;
  }

  update(() => {
    NameOptions.value = OriginalNameOptions.value;
    NameOptions.value = NameOptions.value.filter(
      (v) =>
        (v.value ? v.value.indexOf(val) > -1 : false) ||
        (v.c_name
          ? v.c_name.toLowerCase().indexOf(val.toLowerCase()) > -1
          : false) ||
        (v.c_name_other
          ? v.c_name_other.toLowerCase().indexOf(val.toLowerCase()) > -1
          : false)
    );

    if (NameOptions.value.length == 1) {
      emit("update:modelValue", NameOptions.value[0].value);
    }
  });
}
</script>
