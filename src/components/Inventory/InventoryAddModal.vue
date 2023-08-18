<template>
  <q-card class="row">
    <q-card-section class="row bg-primary text-white col-12">
      <div class="text-h6">新增物資</div>
      <q-space/>
      <q-btn flat icon="close" v-close-popup class="bg-primary text-white"/>
    </q-card-section>
    <q-card-section class="row items-center col-12">
      <q-form @submit="save" @reset="inventoryObject = {}" class="row col-12 q-pa-sm">
        <div class="col-3 q-my-xs">編號：</div><div class="col-9 q-my-xs"><q-input type="text" v-model="inventoryObject.ID"/></div>
        <div class="col-3 q-my-xs">類型：</div><div class="col-9 q-my-xs"><q-input type="text" v-model="inventoryObject.c_name"/></div>
        <div class="col-3 q-my-xs">型號：</div><div class="col-9 q-my-xs"><q-input type="text" v-model="inventoryObject.c_model"/></div>
        <div class="col-3 q-my-xs">地點：</div><div class="col-9 q-my-xs"><InventoryLocation label="位置" v-model="inventoryObject.c_location" /></div>
        <div class="col-3 q-my-xs">購買日期：</div><div class="col-9 q-my-xs"><DateComponent label="購買日期" v-model="inventoryObject.d_purchase"/></div>
        <div class="col-3 q-my-xs">金額：</div><div class="col-9 q-my-xs"><q-input type="number" v-model="inventoryObject.f_cost"/></div>
        <div class="col-3 q-my-xs">經費來源：</div><div class="col-9 q-my-xs"><q-select label="經費來源" :options="sourceOfFund" v-model="inventoryObject.c_funding" /></div>
        <div class="col-3 q-my-xs">數量：</div><div class="col-9 q-my-xs"><q-input type="number" v-model="inventoryObject.i_qty"/></div>
        <q-separator inset/>
        <div class="row col-12">
          <q-space/>
          <q-btn class="bg-negative text-white text-right q-mx-sm" flat label="取消" type="reset" v-close-popup/>
          <q-btn class="bg-primary text-white text-right q-mx-sm" flat label="新增" type="submit"/>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { useQuery, useMutation } from "@vue/apollo-composable"
import gql from "graphql-tag";
import InventoryLocation from "components/Inventory/LocationSelection.vue"
import { ref, computed }  from "vue"
import { useQuasar, date as qdate } from "quasar"
import DateComponent from "src/components/Basic/DateComponent.vue";
import { useStore } from "vuex";

// queries
const { mutate: updateInventoryStat, onDone: updateInventoryStat_Completed } = useMutation(gql`
  mutation Account_updateInventoryStat(
    $logObject: Log_insert_input! = {},
    $objects: [Inventory_insert_input!] = {}) {
    insert_Inventory(
      objects: $objects,
      if_matched: {
        match_columns: ID,
        update_columns: [f_cost, d_purchase, c_name, c_model, c_location, c_funding, i_qty]
      }) {
      affected_rows
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }`)

const $store = useStore();
const $q = useQuasar()
const username = computed(() => $store.getters["userModule/getUsername"])

const sourceOfFund = ref(['S','BG','D','NS','SWDF'])
const inventoryObject = ref({
  ID: "",
  c_name: "",
  c_model: "",
  c_location: "",
  d_purchase: qdate.formatDate(new Date(), "YYYY/MM/DD"),
  f_cost: 0,
  c_funding: "",
  i_qty: 0,
  status: "",
})

const props = defineProps({
 
  serverStat: {
    type: Object,
    required: true,
  }
})
const emit = defineEmits(["refetch", "addDialog"])

function save() {
  const saveObject = []
  let valid = true
  
  if (inventoryObject.value.ID) {
    const logObject = ref({
      "username": username,
      "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      "module": "會計系統",
      "action": "新增物資記錄：" + JSON.stringify(inventoryObject.value)
    })
    // console.log("data:" + JSON.stringify(inventoryObject.value))
    saveObject.push({
      ID: inventoryObject.value.ID.trim(),
      c_name: inventoryObject.value.c_name? inventoryObject.value.c_name.trim(): "",
      c_model: inventoryObject.value.c_model? inventoryObject.value.c_model.trim(): "",
      c_location: inventoryObject.value.c_location? inventoryObject.value.c_location.trim(): "",
      d_purchase: inventoryObject.value.d_purchase? qdate.formatDate(inventoryObject.value.d_purchase, "YYYY-MM-DDT00:00:00"): null,
      f_cost: inventoryObject.value.f_cost? parseFloat(inventoryObject.value.f_cost): 0,
      c_funding: inventoryObject.value.c_funding? inventoryObject.value.c_funding.trim(): "",
      i_qty: inventoryObject.value.i_qty? parseInt(inventoryObject.value.i_qty): 0,
    })

    if (valid) {
      updateInventoryStat({
        objects: saveObject,
        logObject: logObject.value,
      })
    }
  } else {
    $q.notify({ message: "沒有填寫物資編號！", icon: 'error', color: 'negative', textColor: 'white' })
    valid = false
  }  
}

updateInventoryStat_Completed((result) => {
  inventoryObject.value = {}
  $q.notify({
    message: "儲存成功！"
  })
  emit("refetch")
  emit("addDialog", false)
})
</script>