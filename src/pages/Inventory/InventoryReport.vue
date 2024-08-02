<template>
  <q-page style="margin-top: 70px">
    <q-table v-if="isSystemAdmin" :rows="InventoryData" />
    <div v-else>開發中</div>
  </q-page>
</template>

<script setup>
import { ref, computed } from "vue";
import { useInventoryProvider } from "src/providers/inventory";
import { useStore } from "vuex";

const $store = useStore();
// query
const { result, loading } = useInventoryProvider();
const isSystemAdmin = computed(
  () => $store.getters["userModule/getSystemAdmin"]
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
</script>
