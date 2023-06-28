<template>
<q-page style="margin-top: 70px;">
  <q-card>
    <q-card-section>
      <InventorySelection v-model="searchID" label="物資編號"/>
    </q-card-section>
    <q-card-section v-if="Object.keys(inventoryData).length > 0" class="row">
      <div class="col-12"><q-chip size="lg" class="bg-primary text-white" label="基本資料"/></div>
      <div class="col-3">物資名稱：</div><div class="col-3">{{ inventoryData.c_name }}</div>
      <div class="col-3">購買日期：</div><div class="col-3">{{ qdate.formatDate(inventoryData.d_purchase, "YYYY年M月D日") }}</div>
      <div class="col-3">型號：</div><div class="col-3">{{ inventoryData.c_model }}</div>
      <div class="col-3">位置：</div><div class="col-3">{{ inventoryData.c_location }}</div>
      <div class="col-3">初始數量：</div><div class="col-3">{{ inventoryData.i_qty }}</div>
      <div class="col-3">現在數量：</div><div class="col-3">{{ remainingInventoryCount }}</div>
    </q-card-section>
    <q-separator inset/>
    <q-card-section v-if="Object.keys(inventoryData).length > 0">
      <q-chip size="lg" class="bg-warning text-white" label="報銷記錄"/>
      <q-btn v-if="remainingInventoryCount > 0" label="新增報銷紀錄" icon="add" class="bg-primary text-white" @click="destroyRecords.push({ d_destroy: '', c_destroy_reason: '', i_qty: 1, b_confirm: false})"/>
      <q-btn v-if="destroyRecords.length > 0" label="儲存" icon="save" class="bg-positive text-white" @click="save"/>
      <div v-for="(record, index) in inventoryData.Inventory_to_Destroy" class="row">
        <div class="col-3">報銷日期：{{qdate.formatDate(record.d_destroy, "YYYY年M月D日")}}</div>
        <div class="col-3">報銷原因：{{record.c_destroy_reason}}</div>
        <div class="col-3">報銷數量：{{record.i_qty}}</div>
      </div>
      <div v-for="(record, index) in destroyRecords" class="row">
        <div class="col-3"><DateComponent v-model="allDestroyRecords[index].d_destroy" label="報銷日期"/></div>
        <div class="col-3"><q-input type="text" v-model="allDestroyRecords[index].c_destroy_reason" label="報銷原因"/></div>
        <div class="col-3"><q-input type="number" v-model="allDestroyRecords[index].i_qty" label="報銷數量"/></div>
        <div class="col-1"><q-btn icon="delete" label="刪除" class="bg-negative text-white" @click="destroyRecords.splice(index, 1)"/></div>
      </div>
    </q-card-section>
  </q-card>

</q-page>
</template>

<script setup>
import { useQuery, useMutation } from "@vue/apollo-composable"
import InventoryLocation from "components/Inventory/LocationSelection.vue"
import { ref, computed } from "vue"
import gql from "graphql-tag";
import { useQuasar, date as qdate, uid } from "quasar";
import { useStore } from "vuex";
import InventorySelection from "src/components/Inventory/InventorySelection.vue";
import DateComponent from "src/components/Basic/DateComponent.vue";

// variables
const $q = useQuasar()
const $store = useStore();
const InventoryData = ref({})
const deleteData = ref([])
const sourceOfFund = ref(['S','BG','D','NS','SWDF'])
const pagination = ref({
  rowsPerPage: 30,
})
const searchID = ref("")
const destroyRecords = ref([])
const InventoryColumn = ref([
  {
    name: "status",
    label: "狀態",
    field: "status",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "ID",
    label: "編號",
    field: "ID",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_name",
    label: "類型",
    field: "c_name",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_model",
    label: "型號",
    field: "c_model",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_location",
    label: "位置",
    field: "c_location",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "d_purchase",
    label: "購買日期",
    field: "d_purchase",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => val? qdate.formatDate(val, "YYYY/MM/DD"): null
  },
  {
    name: "f_cost",
    label: "金額",
    field: "f_cost",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_funding",
    label: "經費來源",
    field: "c_funding",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "i_qty",
    label: "數量",
    field: "i_qty",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  /*
  {
    name: "d_destroy",
    label: "廢棄日期",
    field: "d_destroy",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => val? qdate.formatDate(val, "YYYY/MM/DD"): null
  },
  {
    name: "c_destroy_reason",
    label: "理由",
    field: "c_destroy_reason",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "b_confirm",
    label: "主任批核",
    field: "b_confirm",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  */
])

// query
const { result, loading, refetch } = useQuery(gql`
query InventoryByID($ID: String = "") {
  Inventory_by_pk(ID: $ID) {
    f_cost
    d_purchase
    c_name
    c_model
    c_location
    c_funding
    ID
    i_qty
    Inventory_to_Destroy {
      ID
      b_confirm
      d_destroy
      c_destroy_reason
      uuid
      i_qty
    }
  }
}`, () => ({
  ID: searchID.value? searchID.value: ""
}))

const { mutate: deleteInventory, onDone: deleteInventory_Completed } = useMutation(gql`
  mutation InventoryDelete_insertInventoryDelete(
    $logObject: Log_insert_input! = {},
    $objects: [Inventory_Destroy_insert_input!] = {}) {
    insert_Inventory_Destroy(
      objects: $objects,
    ) {
      affected_rows
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }`)
// computed
const username = computed(() => $store.getters["userModule/getUsername"])
// const serverStat = computed(() => LocationResult.value?.Inventory??[])
const isSystemAdmin = computed(() => $store.getters["userModule/getSystemAdmin"])
const inventoryData = computed(() => result.value?.Inventory_by_pk??{})
const allDestroyRecords = computed(() => [...destroyRecords.value, ...inventoryData.value.Inventory_to_Destroy])
const remainingInventoryCount = computed(() => inventoryData.value.i_qty - inventoryData.value.Inventory_to_Destroy.reduce((a,b) => a+b.i_qty, 0))

// functions
function checkOccurance(val) {
  return InventoryData.value? InventoryData.value.map(x => x.ID).reduce(function (acc, curr) { return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc}, {})[val]: 0
}


function save() {
  const saveObject = []
  let valid = true
  if (destroyRecords.value.length > 0) {
    let destroyLog
    destroyRecords.value.forEach((record) => {
      destroyLog += "報銷日期"
    })
    const logObject = ref({
      "username": username,
      "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      "module": "會計系統",
      "action": "報銷物資 - 編號：" + searchID.value + "。報銷記錄：" + JSON.stringify(destroyRecords.value)
    })

    destroyRecords.value.forEach((data) => {
      if (data.d_destroy) {
        saveObject.push({
          uuid: uid(),
          ID: inventoryData.value.ID.trim(),
          d_destroy: data.d_destroy? qdate.formatDate(data.d_destroy, "YYYY-MM-DDT00:00:00"): null,
          c_destroy_reason: data.c_destroy_reason? data.c_destroy_reason.trim():"",
          i_qty: data.i_qty? data.i_qty: 0,
          b_confirm: false,
        })
      } else {
        $q.notify({ message: "沒有填寫報銷日期！", icon: 'error', color: 'negative', textColor: 'white' })
        valid = false
      }
    })

    if (valid) {
      
      deleteInventory({
        objects: saveObject,
        logObject: logObject.value,
      })
      
     
    }
  }
}

function deleteRow(ID) {
  let i = InventoryData.value.findIndex((element) => element.ID == ID)
  deleteData.value.push(InventoryData.value[i])
  InventoryData.value.splice(i, 1)
}

// callback
deleteInventory_Completed((result) => {
  refetch()
  $q.notify({
    message: "報銷成功！"
  })
})
</script>

<style lang="scss" scoped>
.invalid {
  border: 1px solid red;
}
</style>
