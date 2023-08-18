<template>
  <q-page style="margin-top: 70px;">
    {{ InventoryData }}
    <q-table :rows="InventoryData"/>
    
  </q-page>
</template>

<script setup>
import { useQuery } from "@vue/apollo-composable"
import { ref } from "vue"
import gql from "graphql-tag";

const InventoryData = ref([])
// query
const { loading, refetch, onResult } = useQuery(gql`
query AllInventory {
  Inventory {
    ID
    c_funding
    c_location
    c_model
    c_name
    d_purchase
    f_cost
    i_qty
    Inventory_to_Destroy {
      ID
      b_confirm
      d_destroy
      c_destroy_reason
      index
      uuid
    }
  }
}`)

onResult((result) => {
  if (result.data) {
    result.data.Inventory.forEach((d) => {
      //InventoryData.value.push({})
      for (let i = 1; i <= d.i_qty; i++) {
        let destroyData = d.Inventory_to_Destroy.filter((x) => x.index == i)
        console.log("length: " + destroyData.length)
        if (destroyData.length > 0) {
          InventoryData.value.push({
            ID: d.ID + "-" + i,
            d_purchase: d.d_purchase,
            d_destroy: destroyData[0].d_destroy
          })
        } else {
          InventoryData.value.push({
            ID: d.ID + "-" + i,
            d_purchase: d.d_purchase,
            c_funding: d.c_funding,
            c_location: d.c_location,
            c_model: d.c_model,
            c_name: d.c_name,
          })
        }
      }
      // console.log(d)
    })
  }
})
</script>