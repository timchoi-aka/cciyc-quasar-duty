<template>
  <q-page style="margin-top: 70px">
    {{ allInventory }}
    <q-dialog v-model="editModal">
      <InventoryEditModal
        :serverStat="serverStat"
        :inventoryObject="selectedRow[0]"
        @refetch="refetch"
        @editDialog="(value) => (editModal = value)"
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
          color="primary"
          icon="add"
          :disable="loading"
          label="新增"
          @click="addModal = true"
        />
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
          v-if="selectedRow.length > 0"
          color="negative"
          icon="delete"
          label="刪除"
          @click="deleteInventory"
        />
      </template>

      <template v-slot:ID="props">
        <div
          :class="[
            props.row.ID.length > 0 && checkOccurance(props.row.ID) == 1
              ? 'valid'
              : 'invalid',
          ]"
        >
          {{ props.row.ID }}
        </div>
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
import { useQuery, useMutation } from "@vue/apollo-composable";
import { ref, computed } from "vue";
import gql from "graphql-tag";
import { useQuasar, date as qdate } from "quasar";
import InventoryEditModal from "src/components/Inventory/InventoryEditModal.vue";
import { useStore } from "vuex";
import { useAllInventoryProvider } from "src/providers/inventory";

// variables
const $q = useQuasar();
const $store = useStore();
const username = computed(() => $store.getters["userModule/getUsername"]);
const InventoryData = ref([]);
const deleteData = ref([]);
const pagination = ref({
  rowsPerPage: 30,
});
const selectedRow = ref([]);
const addModal = ref(false);
const editModal = ref(false);

const { result } = useAllInventoryProvider();
const allInventory = computed(() => {
  let res = [];
  if (result.value) {
    result.value.Inventory.forEach((x) => {
      res.push({
        ID: x.ID,
        c_name: x.c_name,
        c_model: x.c_model,
        c_location: x.c_location,
        d_purchase: x.d_purchase,
        f_cost: x.f_cost,
        c_funding: x.c_funding,
        i_qty: x.i_qty,
        i_deleted_qty: x.Inventory_to_Destroy.filter((x) => x.b_confirm).reduce(
          (a, v) => a + v.i_destroy_quantity,
          0
        ),
        i_remaining_qty:
          x.i_qty -
          x.Inventory_to_Destroy.filter((x) => x.b_confirm).reduce(
            (a, v) => a + v.i_destroy_quantity,
            0
          ),
        c_createdByUser: x.c_createdByUser,
        b_approve: x.b_approve,
      });
    });
  }
  return res;
});

const InventoryColumn = ref([
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
    format: (val) => (val ? qdate.formatDate(val, "YYYY/MM/DD") : null),
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
    label: "購入數量",
    field: "i_qty",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "i_deleted_qty",
    label: "報銷數量",
    name: "i_deleted_qty",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "i_remaining_qty",
    label: "剩餘數量",
    field: "i_remaining_qty",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_createdByUser",
    label: "建立人",
    field: "c_createdByUser",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "b_approve",
    label: "批核",
    field: "b_approve",
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
]);

const {
  mutate: deleteInventoryMutation,
  onDone: deleteInventoryMutation_Completed,
} = useMutation(gql`
  mutation deleteInventory(
    $logObject: Log_insert_input! = {}
    $ID: [String!] = ""
  ) {
    delete_Inventory(where: { ID: { _in: $ID } }) {
      affected_rows
    }
    delete_Inventory_Destroy(where: { ID: { _in: $ID } }) {
      affected_rows
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }
`);

const { mutate: updateInventoryStat, onDone: updateInventoryStat_Completed } =
  useMutation(gql`
    mutation Account_updateInventoryStat(
      $logObject: Log_insert_input! = {}
      $objects: [Inventory_insert_input!] = {}
    ) {
      insert_Inventory(
        objects: $objects
        if_matched: {
          match_columns: ID
          update_columns: [
            f_cost
            d_purchase
            c_name
            c_model
            c_location
            c_funding
            i_qty
          ]
        }
      ) {
        affected_rows
      }
      insert_Log_one(object: $logObject) {
        log_id
      }
    }
  `);
// computed
const serverStat = computed(() => LocationResult.value?.Inventory ?? []);
const isSystemAdmin = computed(
  () => $store.getters["userModule/getSystemAdmin"]
);

// functions
function checkOccurance(val) {
  return InventoryData.value
    ? InventoryData.value
        .map((x) => x.ID)
        .reduce(function (acc, curr) {
          return acc[curr] ? ++acc[curr] : (acc[curr] = 1), acc;
        }, {})[val]
    : 0;
}

/*
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
*/

function deleteInventory() {
  if (selectedRow.value.length > 0) {
    const logObject = ref({
      username: username,
      datetime: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      module: "會計系統",
      action: "刪除物資記錄：" + JSON.stringify(selectedRow.value),
    });

    deleteInventoryMutation({
      ID: selectedRow.value.map((x) => x.ID),
      logObject: logObject.value,
    });
  }
}

function deleteRow(ID) {
  let i = InventoryData.value.findIndex((element) => element.ID == ID);
  deleteData.value.push(InventoryData.value[i]);
  InventoryData.value.splice(i, 1);
}

deleteInventoryMutation_Completed((result) => {
  refetch();
  selectedRow.value = [];
  $q.notify({
    message: "刪除成功！",
  });
});

updateInventoryStat_Completed((result) => {
  refetch();
  inventoryObject.value = {};
  $q.notify({
    message: "儲存成功！",
  });
});
</script>

<style lang="scss" scoped>
.invalid {
  border: 1px solid red;
}
</style>
