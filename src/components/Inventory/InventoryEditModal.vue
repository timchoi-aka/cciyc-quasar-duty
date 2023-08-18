<template>
  <q-card class="row">
    <q-card-section class="row bg-primary text-white col-12">
      <div class="text-h6">修改物資記錄</div>
      <q-space/>
      <q-btn flat icon="close" v-close-popup class="bg-primary text-white"/>
    </q-card-section>
    
    <q-card-section class="row items-center col-12">
      <q-form @submit="save" @reset="editObject = JSON.parse(JSON.stringify(props.inventoryObject))" class="row col-12 q-pa-sm">
        <div class="col-3 q-my-xs">編號：</div><div class="col-9 q-my-xs">{{editObject.ID}}</div>
        <div class="col-3 q-my-xs">類型：</div><div class="col-9 q-my-xs"><q-input type="text" v-model="editObject.c_name"/></div>
        <div class="col-3 q-my-xs">型號：</div><div class="col-9 q-my-xs"><q-input type="text" v-model="editObject.c_model"/></div>
        <div class="col-3 q-my-xs">地點：</div><div class="col-9 q-my-xs"><InventoryLocation label="位置" v-model="editObject.c_location" /></div>
        <div class="col-3 q-my-xs">購買日期：</div><div class="col-9 q-my-xs"><DateComponent label="購買日期" v-model="editObject.d_purchase"/></div>
        <div class="col-3 q-my-xs">金額：</div><div class="col-9 q-my-xs"><q-input type="number" v-model="editObject.f_cost"/></div>
        <div class="col-3 q-my-xs">經費來源：</div><div class="col-9 q-my-xs"><q-select label="經費來源" :options="sourceOfFund" v-model="editObject.c_funding" /></div>
        <div class="col-3 q-my-xs">數量：</div><div class="col-9 q-my-xs"><q-input type="number" v-model="editObject.i_qty"/></div>
        <q-separator inset/>
        <div class="row col-12">
          <q-space/>
          <q-btn class="bg-negative text-white text-right q-mx-sm" flat label="取消" v-close-popup/>
          <q-btn class="bg-warning text-white text-right q-mx-sm" flat label="重置" type="reset"/>
          <q-btn class="bg-primary text-white text-right q-mx-sm" flat label="儲存" type="submit"/>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { useQuery, useMutation } from "@vue/apollo-composable"
import gql from "graphql-tag";
import InventoryLocation from "components/Inventory/LocationSelection.vue"
import { ref, computed, onMounted }  from "vue"
import { useQuasar, date as qdate } from "quasar"
import DateComponent from "src/components/Basic/DateComponent.vue";
import { useStore } from "vuex";

const editObject = ref({})
// queries
const { mutate: saveEdit, onDone: saveEdit_Completed } = useMutation(gql`
  mutation Account_updateInventoryStat(
    $logObject: Log_insert_input! = {},
    $ID: String = "",
    $object: Inventory_set_input = {}) {
    update_Inventory_by_pk(pk_columns: {ID: $ID}, _set: $object) {
      ID
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }`)

const $store = useStore();
const $q = useQuasar()
const username = computed(() => $store.getters["userModule/getUsername"])

const sourceOfFund = ref(['S','BG','D','NS','SWDF'])

const props = defineProps({
  inventoryObject: {
    type: Object,
    required: true,
  },
  serverStat: {
    type: Object,
    required: true,
  }
})
const emit = defineEmits(["refetch", "editDialog"])

function save() {
  const logObject = ref({
    "username": username,
    "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    "module": "會計系統",
    "action": "修改物資記錄：" + JSON.stringify(editObject.value)
  })
    
  const saveObject = {
    ID: editObject.value.ID.trim(),
    c_name: editObject.value.c_name? editObject.value.c_name.trim(): "",
    c_model: editObject.value.c_model? editObject.value.c_model.trim(): "",
    c_location: editObject.value.c_location? editObject.value.c_location.trim(): "",
    d_purchase: editObject.value.d_purchase? qdate.formatDate(editObject.value.d_purchase, "YYYY-MM-DDT00:00:00"): null,
    f_cost: editObject.value.f_cost? parseFloat(editObject.value.f_cost): 0,
    c_funding: editObject.value.c_funding? editObject.value.c_funding.trim(): "",
    i_qty: editObject.value.i_qty? parseInt(editObject.value.i_qty): 0,
  }

  saveEdit({
    object: saveObject,
    ID: editObject.value.ID,
    logObject: logObject.value,
  })
    
}

onMounted(() => {
  editObject.value = JSON.parse(JSON.stringify(props.inventoryObject))
})

saveEdit_Completed((result) => {
  editObject.value = ref({})
  $q.notify({
    message: "修改成功！"
  })
  emit("refetch")
  emit("editDialog", false)
})
</script>