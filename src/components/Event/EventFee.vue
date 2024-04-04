<template>
  <div class="row">
    <q-chip class="bg-positive text-white text-h6" label="收費模式" />
    <q-btn
      v-if="!edit"
      icon="edit"
      class="text-primary"
      flat
      @click="startEdit"
    >
      <q-tooltip class="bg-white text-primary">修改</q-tooltip>
    </q-btn>
    <q-btn v-if="edit || newitem.length > 0" icon="save" flat @click="save">
      <q-tooltip class="bg-white text-primary">儲存</q-tooltip>
    </q-btn>
    <q-btn v-if="edit" icon="cancel" flat @click="edit = false">
      <q-tooltip class="bg-white text-primary">取消</q-tooltip>
    </q-btn>
    <q-btn
      v-if="edit"
      icon="add"
      class="text-primary"
      flat
      @click="newitem.push({ c_type: '', u_fee: 0 })"
    >
      <q-tooltip class="bg-white text-primary">新增</q-tooltip>
    </q-btn>
  </div>
  <div v-if="!edit">
    <div v-for="item in Fee" class="text-h6">
      <q-chip size="lg" class="bg-warning">{{ item.c_type }}</q-chip> HK${{
        item.u_fee
      }}
    </div>
    <div v-if="Fee.length == 0" class="text-h6">沒有記錄</div>
  </div>
  <div v-if="edit && editItem.length > 0" class="text-h6">
    <div v-for="(value, index) in editItem">
      <div v-if="!editItem[index].delete" class="row q-gutter-md">
        <q-select
          use-input
          class="col-3"
          filled
          label="類別"
          type="text"
          :options="options"
          @newValue="newOptions"
          v-model="editItem[index].c_type"
          @update:modelValue="editItem[index].modified = true"
        />
        <q-input
          class="col-3"
          filled
          label="費用"
          type="number(2)"
          v-model="editItem[index].u_fee"
          @update:modelValue="editItem[index].modified = true"
        />
        <q-btn
          icon="delete"
          flat
          class="text-negative"
          @click="deleteRow(index)"
        />
      </div>
    </div>
  </div>
  <div v-if="newitem.length > 0" class="text-h6">
    <div v-for="(value, index) in newitem" class="row q-gutter-md">
      <q-select
        use-input
        class="col-3"
        filled
        label="類別"
        type="text"
        @newValue="newOptions"
        :options="options"
        v-model="newitem[index].c_type"
      />
      <q-input
        class="col-3"
        filled
        label="費用"
        type="number(2)"
        v-model="newitem[index].u_fee"
      />
    </div>
  </div>
  <div v-if="edit && newitem.length + editItem.length == 0" class="text-h6">
    沒有記錄
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useStore } from "vuex";
import { useQuasar } from "quasar";
import { useRoute } from "vue-router";
import { useEventProvider } from "src/providers/event.js";

// variables
const route = useRoute();
const $q = useQuasar();
const c_act_code = ref(route.params.id);
const $store = useStore();
const edit = ref(false);
const newitem = ref([]);
const editItem = ref([]);
const deleteItem = ref([]);
let options = ["活動收費", "學費", "按金"];

// query
const { result, updateEventFeeById, deleteEventFeeById, message } =
  useEventProvider({
    c_act_code: c_act_code,
    loadFee: ref(true),
  });

watch(message, (value) => {
  if (value) {
    $q.notify({ message: value });
  }
});

// computed
const username = computed(() => $store.getters["userModule/getUsername"]);
const Fee = computed(() =>
  result.value && result.value.HTX_Event_by_pk
    ? result.value.HTX_Event_by_pk.Event_to_Fee
    : []
);

// functions
function startEdit() {
  Fee.value.forEach((item) => {
    editItem.value.push({
      c_act_code: item.c_act_code.trim(),
      c_type: item.c_type.trim(),
      u_fee: item.u_fee,
      b_cssa: item.b_cssa,
    });
  });
  edit.value = true;
}

function save() {
  const updateObject = [];
  if (editItem.value.length > 0) {
    editItem.value.forEach((item) => {
      if (item.modified) {
        updateObject.push({
          c_act_code: item.c_act_code.trim(),
          c_type: item.c_type.trim(),
          u_fee: parseFloat(item.u_fee),
        });
      }
    });
  }

  if (newitem.value.length > 0) {
    newitem.value.forEach((item) => {
      updateObject.push({
        c_act_code: c_act_code.value.trim(),
        c_type: item.c_type,
        u_fee: parseFloat(item.u_fee),
        b_cssa: false,
      });
    });
  }

  if (updateObject.length > 0) {
    updateEventFeeById({
      c_act_code: c_act_code.value,
      staff_name: username.value,
      feeObject: updateObject,
    }).then(() => {
      editItem.value = [];
      newitem.value = [];
      edit.value = false;
    });
  }

  if (deleteItem.value.length > 0) {
    deleteEventFeeById({
      c_act_code: c_act_code.value,
      staff_name: username.value,
      feeObject: deleteItem.value.map((a) => a.c_type),
    }).then(() => {
      deleteItem.value = [];
      editItem.value = [];
      newitem.value = [];
      edit.value = false;
    });
  }
}

function deleteRow(index) {
  deleteItem.value.push(editItem.value[index]);
  editItem.value[index].delete = true;
}

function newOptions(val, done) {
  if (options.length > 0) {
    if (!options.includes(val)) {
      options.push(val);
    }
    done(val, "toggle");
  }
}
</script>
