<template>
  <q-card class="row">
    <q-card-section class="row bg-primary text-white col-12">
      <div class="text-h6">修改物資記錄</div>
      <q-space />
      <q-btn flat icon="close" v-close-popup class="bg-primary text-white" />
    </q-card-section>

    <q-card-section class="row items-center col-12">
      <q-form
        @submit="save"
        @reset="editObject = extend({}, props.inventoryObject)"
        class="row col-12 q-pa-sm items-center"
      >
        <div class="col-3 q-my-xs">編號：</div>
        <div class="col-9 q-my-xs">{{ editObject.ID }}</div>
        <div class="col-3 q-my-xs">類型：</div>
        <div class="col-9 q-my-xs">
          <q-input type="text" v-model="editObject.c_name" />
        </div>
        <div class="col-3 q-my-xs">型號：</div>
        <div class="col-9 q-my-xs">
          <q-input type="text" v-model="editObject.c_model" />
        </div>
        <div class="col-3 q-my-xs">地點：</div>
        <div class="col-9 q-my-xs">
          <InventoryLocation label="位置" v-model="editObject.c_location" />
        </div>
        <div class="col-3 q-my-xs">購買日期：</div>
        <div class="col-9 q-my-xs">
          <DateComponent label="購買日期" v-model="editObject.d_purchase" />
        </div>
        <div class="col-3 q-my-xs">金額：</div>
        <div class="col-9 q-my-xs">
          <q-input
            v-model="editObject.f_cost"
            lazy-rules
            :rules="[
              (val) => (val !== null && val !== '') || '請輸入資產價值',
              (val) => parseFloat(val) > 0 || '價值不能少於0',
            ]"
          />
        </div>
        <div class="col-3 q-my-xs">經費來源：</div>
        <div class="col-9 q-my-xs">
          <q-select
            label="經費來源"
            :options="sourceOfFund"
            v-model="editObject.c_funding"
          />
        </div>
        <div class="col-3 q-my-xs">數量：</div>
        <div class="col-9 q-my-xs">
          <q-input
            type="number"
            v-model="editObject.i_qty"
            lazy-rules
            :rules="[
              (val) => (val !== null && val !== '') || '請輸入資產數量',
              (val) => parseInt(val) > 0 || '數量不能少於0',
            ]"
          />
        </div>
        <q-separator inset />
        <div class="row col-12">
          <q-space />
          <q-btn
            class="bg-negative text-white text-right q-mx-sm"
            flat
            label="取消"
            v-close-popup
          />
          <q-btn
            class="bg-warning text-white text-right q-mx-sm"
            flat
            label="重置"
            type="reset"
          />
          <q-btn
            class="bg-primary text-white text-right q-mx-sm"
            flat
            label="儲存"
            type="submit"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, watch, computed, onMounted } from "vue";
import { useQuasar, date, extend } from "quasar";
import DateComponent from "src/components/Basic/DateComponent.vue";
import InventoryLocation from "components/Inventory/LocationSelection.vue";
import { useStore } from "vuex";
import { useInventoryProvider } from "src/providers/inventory";
import { sourceOfFund } from "src/pages/Inventory/inventoryConfig";

const editObject = ref({});
const $store = useStore();
const $q = useQuasar();
const username = computed(() => $store.getters["userModule/getUsername"]);

const props = defineProps({
  inventoryObject: {
    type: Object,
    required: true,
  },
  locationList: {
    type: Array,
    required: true,
  },
});

const { upsertInventory, message, loading } = useInventoryProvider({
  ID: props.inventoryObject.ID,
});

const emit = defineEmits(["editDialog"]);

function save() {
  const logObject = ref({
    username: username.value,
    datetime: date.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    module: "會計系統",
    action: "修改物資記錄：" + JSON.stringify(editObject.value),
  });

  const saveObjects = ref([]);
  saveObjects.value.push({
    ID: editObject.value.ID.trim(),
    f_cost: editObject.value.f_cost ? parseFloat(editObject.value.f_cost) : 0,
    d_purchase: editObject.value.d_purchase
      ? date.formatDate(
          date.extractDate(editObject.value.d_purchase, "YYYY/MM/DD"),
          "YYYY-MM-DDT00:00:00"
        )
      : null,
    c_name: editObject.value.c_name?.trim() ?? "",
    c_model: editObject.value.c_model?.trim() ?? "",
    c_location: editObject.value.c_location?.trim() ?? "",
    c_funding: editObject.value.c_funding?.trim() ?? "",
    i_qty: editObject.value.i_qty ? parseInt(editObject.value.i_qty) : 0,
    c_createdByUser: editObject.value.c_createdByUser?.trim(),
    d_createDate: editObject.value.d_createDate,
    b_approve: editObject.value.b_approve,
    c_approvedByUser: editObject.value.c_approvedByUser?.trim() ?? null,
    d_approveDate: editObject.value.d_approveDate
      ? date.formatDate(
          date.extractDate(editObject.value.d_approveDate, "YYYY/MM/DD"),
          "YYYY-MM-DDT00:00:00"
        )
      : null,
  });

  upsertInventory({
    objects: saveObjects,
    logObject: logObject,
  }).then(() => {
    emit("editDialog", false);
  });
}

onMounted(() => {
  editObject.value = extend({}, props.inventoryObject);
});

// display result message to user
watch(message, (newMessage) => {
  if (newMessage) {
    $q.notify({
      message: newMessage,
    });
  }
});
</script>
