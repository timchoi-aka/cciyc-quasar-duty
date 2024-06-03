<template>
  <q-select label="員工" clearable input-debounce="0" filled multiple :options="UserList" :model-value="user"
    @update:model-value="(value) => save(value)
      ">
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label>
            <q-icon outline v-if="scope.selected" size="sm" color="positive" class="q-mr-sm" name="check" />{{
              scope.opt.label
            }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup>
import { onMounted, ref } from "vue";
import User from "components/class/user";

const props = defineProps({
  modelValue: {
    Type: Array,
    Default: [],
  },
  hint: {
    Type: String,
    Default: "",
  },
  includeTemp: {
    Type: Boolean,
    Default: false,
  },
});
const user = ref([])
const emit = defineEmits(["update:modelValue"]);
const UserList = ref([
  {
    value: "",
    label: "全部",
  },
]);

function save(value) {
  user.value = value
  emit("update:modelValue", value);
}

onMounted(async () => {
  let now = new Date();
  let users = await User.loadPermUsers();
  users.forEach((u) => {
    let userObj = {
      value: u.uid,
      label: u.name,
    };
    UserList.value.push(userObj);
    if (props.modelValue && props.modelValue.includes(u.name)) {
      user.value.push(userObj)
    }
  });
  if (props.includeTemp) {
    users = await User.loadTempUsers();
    users.forEach((u) => {
      if (u.isValidEmployment(now)) {
        UserList.value.push({
          value: u.uid,
          label: u.name,
        });
      }
    });
  }
});
</script>
