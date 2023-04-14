<template>
<q-page style="margin-top: 70px;">
  <q-table
    :rows="InventoryData"
    :columns="InventoryColumn"
    no-data-label="沒有物資記錄"
    :pagination="pagination"
    :loading="loading">
      <!-- add data button -->
      <template v-slot:top>
        <q-btn color="primary" icon="add" :disable="loading" label="新增" @click="addRow" />
        <q-btn class="q-ml-md" color="positive" icon="save" :disable="(JSON.stringify(InventoryData) == JSON.stringify(serverStat)) || InventoryData.map(x => x.ID).length != (new Set(InventoryData.map(x => x.ID))).size" label="儲存" @click="save" />
      </template>

      <!-- popup edit on body cell -->
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="status" :props="props">
            <q-icon name="check" color="positive" v-if="!props.row.status && JSON.stringify(InventoryData[props.rowIndex]) == JSON.stringify(serverStat[props.rowIndex])"/>
            <q-icon name="edit" color="primary" v-if="!props.row.status && JSON.stringify(InventoryData[props.rowIndex]) != JSON.stringify(serverStat[props.rowIndex])"/>
            <q-btn icon="delete" color="negative" flat dense v-if="props.row.status == 'new'" @click="InventoryData.splice(props.rowIndex, 1)"/>
          </q-td>
          <q-td key="ID" :props="props" :class="[ props.row.ID.length > 0 && checkOccurance(props.row.ID) == 1? 'valid': 'invalid' ]">
            {{ props.row.ID }}
            <q-popup-edit filled v-model="props.row.ID"  auto-save v-slot="scope">
              <q-input type="text" label="編號" v-model="scope.value" dense autofocus @keyup.enter="scope.set" />
            </q-popup-edit>
          </q-td>
          <q-td key="c_name" :props="props" :class="[ props.row.c_name.length > 0? 'valid': 'invalid' ]">
            {{ props.row.c_name }}
            <q-popup-edit v-model="props.row.c_name" auto-save v-slot="scope"  >
              <q-input type="text" label="類型" v-model="scope.value" dense autofocus @keyup.enter="scope.set" />
            </q-popup-edit>
          </q-td>
          <q-td key="c_model" :props="props">
            {{ props.row.c_model }}
            <q-popup-edit v-model="props.row.c_model" auto-save v-slot="scope" >
              <q-input type="text" label="型號" v-model="scope.value" dense autofocus @keyup.enter="scope.set" />
            </q-popup-edit>
          </q-td>
          <q-td key="c_location" :props="props">
            {{ props.row.c_location }}
            <q-popup-edit v-model="props.row.c_location" auto-save v-slot="scope">
              <InventoryLocation label="位置" v-model="scope.value" />
            </q-popup-edit>
          </q-td>
          <q-td key="d_purchase" :props="props">
            {{ props.row.d_purchase? qdate.formatDate(props.row.d_purchase, "YYYY/MM/DD"): null }}
            <q-popup-edit v-model.date="props.row.d_purchase" auto-save v-slot="scope">
              <DateComponent label="購買日期" v-model="scope.value" @keyup.enter="scope.set" />
            </q-popup-edit>
          </q-td>
          <q-td key="f_cost" :props="props">
            HK$ {{ props.row.f_cost }}
            <q-popup-edit v-model.number="props.row.f_cost" auto-save v-slot="scope" class="row items-center">
              <span class="col-auto q-mx-md">HK$</span><q-input class="col-auto" type="number" v-model.number="scope.value" dense autofocus @keyup.enter="scope.set" />
            </q-popup-edit>
          </q-td>
          <q-td key="c_funding" :props="props">
            {{ props.row.c_funding }}
            <q-popup-edit v-model="props.row.c_funding" auto-save v-slot="scope">
              <q-select label="經費來源" :options="sourceOfFund" v-model="scope.value" dense autofocus @keyup.enter="scope.set" />
            </q-popup-edit>
          </q-td>
          <q-td key="i_qty" :props="props">
            {{ props.row.i_qty }}
            <q-popup-edit v-model="props.row.i_qty" auto-save v-slot="scope">
              <q-input label="數量" type="number" v-model="scope.value" dense autofocus @keyup.enter="scope.set" />
            </q-popup-edit>
          </q-td>
          <!--
          <q-td key="d_destroy" :props="props">
            {{ props.row.d_destroy? qdate.formatDate(props.row.d_destroy, "YYYY/MM/DD"): null }}
            <q-popup-edit v-model="props.row.d_destroy" auto-save v-slot="scope">
              <DateComponent label="廢棄日期" v-model="scope.value" @keyup.enter="scope.set" />
            </q-popup-edit>
          </q-td>
          <q-td key="c_destroy_reason" :props="props">
            {{ props.row.c_destroy_reason }}
            <q-popup-edit v-model="props.row.c_destroy_reason" auto-save v-slot="scope">
              <q-input type="text" label="理由" v-model="scope.value" dense autofocus @keyup.enter="scope.set" />
            </q-popup-edit>
          </q-td>
          <q-td key="b_confirm" :props="props">
            <q-btn label="批核" v-if="isCenterIC"/>
            <q-icon v-if="props.row.b_confirm" name="check" color="green"/>
            <q-icon v-else name="cancel" color="red"/>
          </q-td>
          -->
        </q-tr>
      </template>
  </q-table>
</q-page>
</template>

<script setup>
import { useQuery, useMutation, useSubscription } from "@vue/apollo-composable"
import InventoryLocation from "components/Inventory/LocationSelection.vue"
import { ref, computed } from "vue"
import gql from "graphql-tag";
import { useQuasar, date as qdate } from "quasar";
import { useStore } from "vuex";
import DateComponent from "src/components/Basic/DateComponent.vue";

// variables
const $q = useQuasar()
const $store = useStore();
const InventoryData = ref([])
const deleteData = ref([])
const sourceOfFund = ref(['S','BG','D','NS','SWDF'])
const pagination = ref({
  rowsPerPage: 30,
})

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
const { result: LocationResult, loading, refetch, onResult } = useQuery(gql`
query AllInventory {
  Inventory(order_by: {ID: asc}) {
    f_cost
    d_purchase
    c_name
    c_model
    c_location
    c_funding
    ID
    i_qty
  }
}`)

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
// computed
const username = computed(() => $store.getters["userModule/getUsername"])
const serverStat = computed(() => LocationResult.value?.Inventory??[])
const isSystemAdmin = computed(() => $store.getters["userModule/getSystemAdmin"])

// functions
function checkOccurance(val) {
  return InventoryData.value? InventoryData.value.map(x => x.ID).reduce(function (acc, curr) { return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc}, {})[val]: 0
}

function addRow() {
  InventoryData.value.push({
    status: "new",
    ID: "",
    c_name: "",
    c_model: "",
    c_location: null,
    d_purchase: qdate.formatDate(new Date(), "YYYY/MM/DD"),
    f_cost: 0,
    c_funding: "",
    i_qty: 1,
  })
}

function save() {
  const saveObject = []
  let valid = true
  if (InventoryData.value.length > 0) {
    const logObject = ref({
      "username": username,
      "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      "module": "會計系統",
      "action": "修改物資記錄 - 舊資料：" + JSON.stringify(serverStat.value) + "。新資料：" + JSON.stringify(InventoryData.value)
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
onResult((result) => {
  InventoryData.value = result.data? JSON.parse(JSON.stringify(result.data.Inventory)): []
})

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
