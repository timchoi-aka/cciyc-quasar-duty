<template>
  <q-page class="q-mt-xl">
    <q-dialog v-model="editModal">
      <InventoryEditModal
        :locationList="LocationList"
        :inventoryObject="selectedRow[0]"
        @editDialog="(value) => closeDialog(value)"
      />
    </q-dialog>

    <q-table
      :rows="InventoryData"
      :columns="InventoryColumn"
      no-data-label="沒有物資記錄"
      :pagination="pagination"
      row-key="ID"
      selection="multiple"
      v-model:selected="selectedRow"
      :loading="loading"
    >
      <!-- add data button -->
      <template v-slot:top>
        <q-btn
          class="q-ml-md"
          v-if="selectedRow.length == 1"
          color="positive"
          icon="edit"
          label="修改"
          @click="editModal = true"
        />
        <q-btn
          class="q-ml-md"
          v-if="selectedRow.length > 0 && (isSystemAdmin || isCenterIC)"
          color="negative"
          icon="delete"
          label="刪除"
          @click="deleteInv"
        />
      </template>

      <template v-slot:body-cell-b_approve="props">
        <q-td :props="props">
          <q-icon v-if="props.value" color="positive" size="sm" name="check" />
          <q-icon v-else color="negative" size="sm" name="cancel" />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useQuasar, date as qdate } from "quasar";
import InventoryEditModal from "src/components/Inventory/InventoryEditModal.vue";
import { useStore } from "vuex";
import { useInventoryProvider } from "src/providers/inventory";
import { pagination, InventoryColumn } from "./inventoryConfig";
// variables
const $q = useQuasar();
const $store = useStore();
const username = computed(() => $store.getters["userModule/getUsername"]);
const selectedRow = ref([]);
const editModal = ref(false);

const { result, loading, deleteInventory, message } = useInventoryProvider();

// computed
const isSystemAdmin = computed(
  () => $store.getters["userModule/getSystemAdmin"]
);
const isCenterIC = computed(() => $store.getters["userModule/getCenterIC"]);
const LocationList = computed(
  () => result.value?.Inventory_Location.map((x) => x.c_location.trim()) ?? []
);
const InventoryData = computed(() => {
  let res = [];
  if (result.value) {
    result.value.Inventory.forEach((x) => {
      res.push({
        ID: x.ID,
        f_cost: x.f_cost,
        d_purchase: x.d_purchase,
        c_name: x.c_name,
        c_model: x.c_model,
        c_location: x.c_location,
        c_funding: x.c_funding,
        i_qty: x.i_qty,
        i_destroy_quantity: x.Inventory_to_Destroy.filter(
          (x) => x.b_approve
        ).reduce((a, v) => a + v.i_destroy_quantity, 0),
        i_remaining_quantity:
          x.i_qty -
          x.Inventory_to_Destroy.filter((x) => x.b_approve).reduce(
            (a, v) => a + v.i_destroy_quantity,
            0
          ),
        c_createdByUser: x.c_createdByUser,
        d_createDate: x.d_createDate,
        b_approve: x.b_approve,
        c_approvedByUser: x.c_approvedByUser,
        d_approveDate: x.d_approveDate,
      });
    });
  }
  return res;
});

// functions
function deleteInv() {
  if (selectedRow.value.length > 0) {
    const logObject = ref({
      username: username,
      datetime: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      module: "會計系統",
      action: "刪除物資記錄：" + JSON.stringify(selectedRow.value),
    });

    deleteInventory({
      ID: ref(selectedRow.value.map((x) => x.ID)),
      logObject: logObject,
    });
  }
}

function closeDialog(value) {
  editModal.value = value;
  selectedRow.value = [];
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

<style lang="scss" scoped>
.invalid {
  border: 1px solid red;
}
</style>
