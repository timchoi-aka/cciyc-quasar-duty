<template>
  <q-page class="q-mt-xl">
    <LoadingDialog :loading="loading" message="儲存中..." />

    <q-form
      @submit="save"
      @reset="inventoryObject = {}"
      class="row col-12 q-pa-sm items-center"
    >
      <div class="col-3 q-my-xs">資產編號：</div>
      <div class="col-9 q-my-xs">
        <q-input
          type="text"
          v-model="inventoryObject.ID"
          lazy-rules
          :rules="[
            (val) => (val && val.length > 0) || '請輸入資產編號',
            (val) => !inventoryID.includes(val) || '資產編號重複',
          ]"
        />
      </div>
      <div class="col-3 q-my-xs">資產描述：</div>
      <div class="col-9 q-my-xs">
        <q-input type="text" v-model="inventoryObject.c_name" />
      </div>
      <div class="col-3 q-my-xs">型號：</div>
      <div class="col-9 q-my-xs">
        <q-input type="text" v-model="inventoryObject.c_model" />
      </div>
      <div class="col-3 q-my-xs">地點：</div>
      <div class="col-9 q-my-xs">
        <InventoryLocation v-model="inventoryObject.c_location" />
      </div>
      <div class="col-3 q-my-xs">購買日期：</div>
      <div class="col-9 q-my-xs">
        <DateComponent label="購買日期" v-model="inventoryObject.d_purchase" />
      </div>
      <div class="col-3 q-my-xs">金額：</div>
      <div class="col-9 q-my-xs">
        <q-input
          v-model="inventoryObject.f_cost"
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
          v-model="inventoryObject.c_funding"
        />
      </div>
      <div class="col-3 q-my-xs">數量：</div>
      <div class="col-9 q-my-xs">
        <q-input
          type="number"
          v-model="inventoryObject.i_qty"
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
          type="reset"
          v-close-popup
        />
        <q-btn
          class="bg-primary text-white text-right q-mx-sm"
          flat
          label="新增"
          type="submit"
        />
      </div>
    </q-form>
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useQuasar, date, extend } from "quasar";
import { useStore } from "vuex";
import { useInventoryProvider } from "src/providers/inventory";
import LoadingDialog from "src/components/LoadingDialog.vue";
import DateComponent from "src/components/Basic/DateComponent.vue";
import InventoryLocation from "components/Inventory/LocationSelection.vue";
import { sourceOfFund, blankInventoryObject } from "./inventoryConfig";

const $store = useStore();
const $q = useQuasar();
const username = computed(() => $store.getters["userModule/getUsername"]);
const {
  idList: inventoryID,
  upsertInventory,
  message,
  loading,
} = useInventoryProvider();

const inventoryObject = ref(extend({}, blankInventoryObject.value));

function save() {
  const logObject = ref({
    username: username.value,
    datetime: date.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    module: "會計系統",
    action: "新增物資記錄：" + JSON.stringify(inventoryObject.value),
  });

  const saveObjects = ref([]);
  saveObjects.value.push({
    ID: inventoryObject.value.ID.trim(),
    f_cost: inventoryObject.value.f_cost
      ? parseFloat(inventoryObject.value.f_cost)
      : 0,
    d_purchase: inventoryObject.value.d_purchase
      ? date.formatDate(inventoryObject.value.d_purchase, "YYYY-MM-DDT00:00:00")
      : null,
    c_name: inventoryObject.value.c_name
      ? inventoryObject.value.c_name.trim()
      : "",
    c_model: inventoryObject.value.c_model
      ? inventoryObject.value.c_model.trim()
      : "",
    c_location: inventoryObject.value.c_location
      ? inventoryObject.value.c_location.trim()
      : "",
    c_funding: inventoryObject.value.c_funding
      ? inventoryObject.value.c_funding.trim()
      : "",
    i_qty: inventoryObject.value.i_qty
      ? parseInt(inventoryObject.value.i_qty)
      : 0,
    c_createdByUser: username.value,
    d_createDate: date.formatDate(new Date(), "YYYY-MM-DDTHH:mm:ss"),
    b_approve: false,
    c_approvedByUser: null,
    d_approveDate: null,
  });

  upsertInventory({
    objects: saveObjects,
    logObject: logObject,
  }).then(() => {
    inventoryObject.value = blankInventoryObject.value;
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
