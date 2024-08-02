<template>
  <q-page style="margin-top: 70px">
    <q-card>
      <q-card-section>
        <InventorySelection v-model="searchID" label="物資編號" />
      </q-card-section>

      <q-card-section v-if="Object.keys(inventoryData).length > 0" class="row">
        <div class="col-12">
          <q-chip size="lg" class="bg-primary text-white" label="基本資料" />
        </div>
        <div class="col-3">物資名稱：</div>
        <div class="col-3">{{ inventoryData.c_name }}</div>
        <div class="col-3">購買日期：</div>
        <div class="col-3">
          {{ date.formatDate(inventoryData.d_purchase, "YYYY年M月D日") }}
        </div>
        <div class="col-3">型號：</div>
        <div class="col-3">{{ inventoryData.c_model }}</div>
        <div class="col-3">位置：</div>
        <div class="col-3">{{ inventoryData.c_location }}</div>
        <div class="col-3">初始數量：</div>
        <div class="col-3">{{ inventoryData.i_qty }}</div>
        <div class="col-3">現在數量：</div>
        <div class="col-3">{{ remainingInventoryCount }}</div>
      </q-card-section>
      <q-separator inset />
      <q-card-section v-if="Object.keys(inventoryData).length > 0">
        <q-chip size="lg" class="bg-warning text-white" label="報銷記錄" />
        <q-btn
          v-if="remainingInventoryCount > 0"
          label="新增報銷紀錄"
          icon="add"
          class="bg-primary text-white"
          @click="
            destroyRecords.push({
              d_destroy: date.formatDate(Date.now(), 'YYYY/MM/DD'),
              c_destroy_reason: '',
              b_approve: false,
              i_destroy_quantity: 1,
            })
          "
        />
        <q-btn
          v-if="destroyRecords.length > 0"
          label="儲存"
          icon="save"
          class="bg-positive text-white"
          @click="
            save(destroyRecords).then(() => {
              destroyRecords = [];
            })
          "
        />
        <q-card v-if="inventoryData?.Inventory_to_Destroy?.length > 0">
          <q-card-section
            v-for="(record, index) in inventoryData.Inventory_to_Destroy"
            :class="['row', index % 2 ? 'bg-grey-3' : '']"
          >
            <div class="col-10 row" v-if="editRow.uuid == record.uuid">
              <div class="col-3">
                <DateComponent v-model="editRow.d_destroy" label="報銷日期" />
              </div>
              <div class="col-3">
                <q-input
                  type="text"
                  v-model="editRow.c_destroy_reason"
                  label="報銷原因"
                />
              </div>
              <div class="col-3">
                <q-input
                  type="number"
                  v-model="editRow.i_destroy_quantity"
                  label="數量"
                  :rules="[
                    (val) =>
                      (val && val > 0 && val <= remainingInventoryCount) ||
                      '報銷超過物資數量',
                  ]"
                />
              </div>
              <div class="col-3">負責人：{{ username }}</div>
              <div class="col-3">
                輸入日期：{{ date.formatDate(new Date(), "YYYY年M月D日") }}
              </div>
              <div class="col-3">
                已審批：<q-icon
                  name="check"
                  color="positive"
                  v-if="record.b_approve"
                /><q-icon v-else name="cancel" color="negative" />
              </div>
              <div class="col-3">審批人：{{ record.c_approveByUser }}</div>
              <div class="col-3">審批日期：{{ record.c_approveDate }}</div>
            </div>
            <div class="col-10 row" v-else>
              <div class="col-3">
                報銷日期：{{
                  date.formatDate(record.d_destroy, "YYYY年M月D日")
                }}
              </div>
              <div class="col-3">報銷原因：{{ record.c_destroy_reason }}</div>
              <div class="col-3">報銷數量：{{ record.i_destroy_quantity }}</div>
              <div class="col-3">負責人：{{ record.c_createByUser }}</div>
              <div class="col-3">
                輸入日期：{{
                  date.formatDate(record.d_createDate, "YYYY年M月D日")
                }}
              </div>
              <div class="col-3">
                已審批：<q-icon
                  name="check"
                  color="positive"
                  v-if="record.b_approve"
                /><q-icon v-else name="cancel" color="negative" />
              </div>
              <div class="col-3">審批人：{{ record.c_approveByUser }}</div>
              <div class="col-3">審批日期：{{ record.c_approveDate }}</div>
            </div>
            <div class="col-2">
              <q-btn
                v-if="!record.b_approve && editRow.uuid != record.uuid"
                label="修改"
                icon="edit"
                class="bg-primary text-white"
                @click="editRow = extend({}, record)"
              />
              <q-btn
                v-if="!record.b_approve"
                label="刪除"
                icon="delete"
                class="bg-negative text-white"
                @click="deleteRow(record.uuid)"
              />
              <q-btn
                v-if="!record.b_approve && editRow.uuid == record.uuid"
                label="儲存"
                icon="save"
                class="bg-positive text-white"
                @click="saveRow(editRow)"
              />
            </div>
          </q-card-section>
        </q-card>
        <div v-for="(record, index) in destroyRecords" class="row">
          <div class="col-3">
            <DateComponent
              v-model="allDestroyRecords[index].d_destroy"
              label="報銷日期"
            />
          </div>
          <div class="col-3">
            <q-input
              type="text"
              v-model="allDestroyRecords[index].c_destroy_reason"
              label="報銷原因"
            />
          </div>
          <div class="col-3">
            <q-input
              type="number"
              v-model="allDestroyRecords[index].i_destroy_quantity"
              label="數量"
              :rules="[
                (val) =>
                  (val && val > 0 && val <= remainingInventoryCount) ||
                  '報銷超過物資數量',
              ]"
            />
          </div>
          <div class="col-1">
            <q-btn
              icon="delete"
              label="刪除"
              class="bg-negative text-white"
              @click="destroyRecords.splice(index, 1)"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useQuasar, date, extend, uid } from "quasar";
import { useStore } from "vuex";
import InventorySelection from "src/components/Inventory/InventorySelection.vue";
import DateComponent from "src/components/Basic/DateComponent.vue";
import { useInventoryProvider } from "src/providers/inventory";

// variables
const $q = useQuasar();
const $store = useStore();
const searchID = ref("");
const destroyRecords = ref([]);
const editRow = ref({});

// query
const { result, loading, message, destroyInventory, undestroyInventory } =
  useInventoryProvider({
    ID: searchID,
  });

// computed
const username = computed(() => $store.getters["userModule/getUsername"]);
// const serverStat = computed(() => LocationResult.value?.Inventory??[])
const isSystemAdmin = computed(
  () => $store.getters["userModule/getSystemAdmin"]
);
const inventoryData = computed(() =>
  result.value?.__typename == "Inventory" ? result.value : {}
);

const allDestroyRecords = computed(() => [
  ...destroyRecords.value,
  ...(inventoryData.value?.Inventory_to_Destroy ?? []),
]);
const remainingInventoryCount = computed(
  () =>
    inventoryData.value.i_qty -
    inventoryData.value.Inventory_to_Destroy?.reduce(
      (acc, cur) => acc + cur.i_destroy_quantity,
      0
    )
);

// functions
async function save(records) {
  const saveObject = ref([]);
  let valid = true;
  if (records.length > 0) {
    const logObject = ref({
      username: username.value,
      datetime: date.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      module: "會計系統",
      action:
        "報銷物資 - 編號：" +
        searchID.value +
        "。報銷記錄：" +
        JSON.stringify(records),
    });

    records.forEach((data) => {
      if (data.d_destroy) {
        saveObject.value.push({
          uuid: data.uuid ? data.uuid : uid(),
          ID: inventoryData.value.ID.trim(),
          d_destroy: data.d_destroy
            ? date.formatDate(
                date.extractDate(data.d_destroy, "YYYY/MM/DD"),
                "YYYY-MM-DDT00:00:00"
              )
            : null,
          c_destroy_reason: data.c_destroy_reason?.trim() ?? "",
          i_destroy_quantity: data.i_destroy_quantity
            ? parseInt(data.i_destroy_quantity)
            : 0,
          b_approve: false,
          c_createByUser: username.value,
          d_createDate: date.formatDate(new Date(), "YYYY-MM-DDTHH:mm:ss"),
          d_approve: null,
          c_approveByUser: null,
        });
      } else {
        $q.notify({
          message: "沒有填寫報銷日期！",
          icon: "error",
          color: "negative",
          textColor: "white",
        });
        valid = false;
      }
    });

    if (valid) {
      return await destroyInventory({
        objects: saveObject,
        logObject: logObject,
      });
    }
  }
}

function deleteRow(uuid) {
  $q.dialog({
    title: "刪除報銷記錄",
    message: "確定要刪除這筆報銷記錄嗎？",
    ok: {
      label: "確定",
      push: true,
      color: "negative",
    },
    cancel: {
      label: "取消",
      push: true,
      color: "primary",
    },
  }).onOk(() => {
    if (uuid) {
      let i = allDestroyRecords.value.findIndex(
        (element) => element.uuid == uuid
      );
      const logObject = ref({
        username: username.value,
        datetime: date.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
        module: "會計系統",
        action:
          "刪除報銷物資記錄 - 物資編號：" +
          searchID.value +
          "。報銷記錄：" +
          JSON.stringify(allDestroyRecords.value[i]),
      });

      undestroyInventory({
        uuid: ref(uuid),
        logObject: logObject,
      });
    }
  });
}

function approveRow(uuid) {
  let i = allDestroyRecords.value.findIndex((element) => element.uuid == uuid);
  allDestroyRecords.value[i].b_approve = true;
  allDestroyRecords.value[i].c_approveByUser = username.value;
  allDestroyRecords.value[i].c_approveDate = date.formatDate(
    new Date(),
    "YYYY-MM-DDTHH:mm:ss"
  );
}

function saveRow(record) {
  let saveRecords = [];
  saveRecords.push(record);
  save(saveRecords).then(() => {
    editRow.value = {};
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

<style lang="scss" scoped>
.invalid {
  border: 1px solid red;
}
</style>
