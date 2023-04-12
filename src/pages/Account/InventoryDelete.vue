<template>
<q-page style="margin-top: 70px;">
  <q-card>
    <q-card-section>
      <InventorySelection v-model="searchID" label="物資編號"/>
    </q-card-section>
    <q-card-section v-if="Object.keys(inventoryData).length > 0">
      物資名稱：{{ inventoryData.c_name }}
      購買日期：{{ inventoryData.d_purchase }}
      型號：{{ inventoryData.c_model }}
      位置：{{ inventoryData.c_location }}
      數量：{{ inventoryData.i_qty }}
    </q-card-section>
    <q-card-section v-if="Object.keys(inventoryData).length > 0">
      <q-btn label="新增報銷紀錄" icon="add" class="bg-primary text-white" @click="destroyRecords.push({ d_destroy: '', c_destroy_reason: '', i_qty: 1, b_confirm: false})"/>
      <q-btn v-if="destroyRecords.length > 0" label="儲存" icon="save" class="bg-positive text-white" @click="save"/>
      <div v-for="(record, index) in allDestroyRecords" class="row">
        <div class="col-2"><DateComponent v-model="allDestroyRecords[index].d_destroy" label="報銷日期"/></div>
        <div class="col-2"><q-input type="text" v-model="allDestroyRecords[index].c_destroy_reason" label="報銷原因"/></div>
        <div class="col-2"><q-input type="number" v-model="allDestroyRecords[index].i_qty" label="報銷數量"/></div>
        <q-btn icon="delete" label="刪除" class="bg-negative text-white" @click="destroyRecords.splice(index, 1)"/>
      </div>
      {{ destroyRecords }}
    </q-card-section>
  </q-card>

</q-page>
</template>

<script setup>
import { useQuery, useMutation, useSubscription } from "@vue/apollo-composable"
import InventoryLocation from "components/Inventory/LocationSelection.vue"
import { ref, computed } from "vue"
import gql from "graphql-tag";
import { useQuasar, date as qdate } from "quasar";
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
      d_destroy_reason
      uuid
    }
  }
}`, () => ({
  ID: searchID.value? searchID.value: ""
}))

const { mutate: updateInventoryStat, onDone: updateInventoryStat_Completed } = useMutation(gql`
  mutation updateInventoryStat(
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
// computed
const username = computed(() => $store.getters["userModule/getUsername"])
// const serverStat = computed(() => LocationResult.value?.Inventory??[])
const isSystemAdmin = computed(() => $store.getters["userModule/getSystemAdmin"])
const inventoryData = computed(() => result.value?.Inventory_by_pk??{})
const allDestroyRecords = computed(() => [...destroyRecords.value, ...inventoryData.value.Inventory_to_Destroy])
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

    InventoryData.value.forEach((data) => {
      if (data.ID) {
        saveObject.push({
          ID: data.ID.trim(),
          c_name: data.c_name? data.c_name.trim(): "",
          c_model: data.c_model? data.c_model.trim(): "",
          c_location: data.c_location? data.c_location.trim(): "",
          d_purchase: data.d_purchase? qdate.formatDate(data.d_purchase, "YYYY-MM-DDT00:00:00"): null,
          f_cost: data.f_cost? data.f_cost: 0,
          c_funding: data.c_funding? data.c_funding.trim(): "",
          i_qty: data.i_qty? data.i_qty: 0,
        })
      } else {
        $q.notify({ message: "沒有填寫物資編號！", icon: 'error', color: 'negative', textColor: 'white' })
        valid = false
      }

    })

    if (valid) {
      updateInventoryStat({
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
updateInventoryStat_Completed((result) => {
  refetch()
  $q.notify({
    message: "儲存成功！"
  })
})
</script>

<style lang="scss" scoped>
.invalid {
  border: 1px solid red;
}
</style>
