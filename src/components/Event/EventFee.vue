<template>
  <div class="row">
    <q-chip class="bg-positive text-white text-h6" label="收費模式"/>
    <q-btn v-if="(!edit)" icon="edit" class="text-primary" flat @click="startEdit">
      <q-tooltip class="bg-white text-primary">修改</q-tooltip>
    </q-btn>
    <q-btn v-if="(edit || newitem.length > 0)" icon="save" flat @click="save">
      <q-tooltip class="bg-white text-primary">儲存</q-tooltip>
    </q-btn>
    <q-btn v-if="edit" icon="cancel" flat @click="edit = false">
      <q-tooltip class="bg-white text-primary">取消</q-tooltip>
    </q-btn>
    <q-btn v-if="edit" icon="add" class="text-primary" flat @click="newitem.push({c_type: '', u_fee: 0})">
      <q-tooltip class="bg-white text-primary">新增</q-tooltip>
    </q-btn>
  </div>
  <div v-if="!edit">
    <div v-for="item in Fee" class="text-h6">
      <q-chip size="lg" class="bg-warning">{{item.c_type}}</q-chip> HK${{item.u_fee}}
    </div>
    <div v-if="(Fee.length == 0)" class="text-h6">沒有記錄</div>
  </div>
  <div v-if="(edit && editItem.length > 0)" class="text-h6">
    <div v-for="(value, index) in editItem" class="row q-gutter-md">
      <q-input v-if="!editItem[index].delete" class="col-3" filled label="類別" type="text" v-model="editItem[index].c_type"/>
      <q-input v-if="!editItem[index].delete" class="col-3" filled label="費用" type="number(2)" v-model="editItem[index].u_fee"/>
      <q-btn v-if="!editItem[index].delete" icon="delete" flat class="text-negative" @click="deleteRow(index)"/>
    </div>
  </div>
  <div v-if="(newitem.length > 0)" class="text-h6">
    <div v-for="(value, index) in newitem" class="row q-gutter-md">
      <q-input class="col-3" filled label="類別" type="text" v-model="newitem[index].c_type"/>
      <q-input class="col-3" filled label="費用" type="number(2)" v-model="newitem[index].u_fee"/>
    </div>
  </div>
  <div v-if="edit && (newitem.length + editItem.length == 0)" class="text-h6">沒有記錄</div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { useQuasar, date as qdate} from "quasar";
import { EVENT_FEE_BY_ACT_CODE } from "/src/graphQueries/Event/query.js"
import { UPDATE_EVENT_FEE, DELETE_EVENT_FEE } from "/src/graphQueries/Event/mutation.js"
import { useQuery, useMutation } from "@vue/apollo-composable"

// props
const props = defineProps({
  c_act_code: String, 
})

// variables
const $q = useQuasar()
const $store = useStore();
const edit = ref(false)
const newitem = ref([])
const editItem = ref([])
const deleteItem = ref([])

// query
const { result, onError: EventFeeError, refetch } = useQuery(
  EVENT_FEE_BY_ACT_CODE,
  () => ({
    c_act_code: props.c_act_code
  }));

const { mutate: updateFee, onDone: updateFee_Completed, onError: updateFee_Error } = useMutation(UPDATE_EVENT_FEE)
const { mutate: deleteFee, onDone: deleteFee_Completed, onError: deleteFee_Error } = useMutation(DELETE_EVENT_FEE)

// computed
const username = computed(() => $store.getters["userModule/getUsername"])
const Fee = computed(() => result.value?.tbl_act_fee??[])
const userProfileLogout = () => $store.dispatch("userModule/logout")

// functions
function startEdit() {
  Fee.value.forEach((item) => {
    editItem.value.push({
      c_act_code: item.c_act_code.trim(),
      c_type: item.c_type.trim(),
      u_fee: item.u_fee,
      b_cssa: item.b_cssa
    })
  })
  edit.value = true
}

function save() {
  const updateObject = []
  if (editItem.value.length > 0) {
    editItem.value.forEach((item) => {
      if (item.delete) {
        deleteItem.value.push({
          c_act_code: item.c_act_code.trim(),
          c_type: item.c_type.trim(),
          u_fee: parseFloat(item.u_fee),
        })
      } else {
        updateObject.push({
          c_act_code: item.c_act_code.trim(),
          c_type: item.c_type.trim(),
          u_fee: parseFloat(item.u_fee),
        })
      }
    })
  }

  if (newitem.value.length > 0) {
    newitem.value.forEach((item) => {
      updateObject.push({
        c_act_code: props.c_act_code.trim(),
        c_type: item.c_type,
        u_fee: parseFloat(item.u_fee),
        b_cssa: false
      })
    })
  }
  
  if (updateObject.length > 0) {
    const logObject = ref({
      "username": username,
      "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      "module": "活動系統",
      "action": "修改活動" + props.c_act_code + "收費。資料:" + JSON.stringify(updateObject, null, 2)
    })
    
    updateFee({
      logObject: logObject.value,
      objects: updateObject
    })

    editItem.value = []
    newitem.value = []
    edit.value = false
  }

  if (deleteItem.value.length > 0) {
    const logObject = ref({
      "username": username,
      "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      "module": "活動系統",
      "action": "刪除" + props.c_act_code + " 內容:" + JSON.stringify(deleteItem.value, null, 2)
    })
      
    deleteFee({
      logObject: logObject.value,
      c_act_code: deleteItem.value.map(a => a.c_act_code),
      c_type: deleteItem.value.map(a => a.c_type)
    })
    deleteItem.value = []
    editItem.value = []
    newitem.value = []
    edit.value = false
  }
}

function deleteRow(index) {
  deleteItem.value.push(editItem.value[index])
  editItem.value[index].delete = true
}

// callbacks
updateFee_Completed((result) => {
  refetch()
})

deleteFee_Completed((result) => {
  refetch()
})

updateFee_Error((error) => {
  notifyClientError(error)
})


deleteFee_Error((error) => {
  notifyClientError(error)
})

EventFeeError((error) => {
  notifyClientError(error)
})

// UI function
function notifyClientError(error) {
  /*userProfileLogout()
    .then(() => {
      $q.notify({ message: "系統錯誤，請重新登入." });
    })
    .catch((error) => console.log("error", error));
    */
    console.log("error", error)
}
</script>