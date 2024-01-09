<template>
  <q-splitter
    v-model="verticalModel"
    class="fit">
    <template v-slot:before>
      <div class="row items-center text-bold">
        <MemberSelection v-model="MemberObject.c_mem_id"/>
        <MemberInfoByID v-model="MemberObject"/>
      </div>
      <q-separator/>
      <div class="row items-center">
        <q-select
          :options="EventOptions"

          use-input
          fill-input
          menu-self="bottom end"
          class="col-7"
          @filter="eventFilter"
          v-model="c_act_codes">
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
            {{ scope.opt.c_act_code }} - {{ scope.opt.c_act_name }}
              <div v-if="scope.opt.b_freeofcharge">(免費)</div>
            </q-item>
          </template>
          <template v-slot:selected>
            <q-item class="q-mx-none q-my-none" v-for="item in c_act_codes"><q-chip class="q-mx-none q-my-none">{{ item.c_act_code }}</q-chip></q-item>
          </template>
        </q-select>
        <q-space/>
        <q-btn class="q-mx-xs col-2 bg-negative text-white" icon="cancel" @click="c_act_codes = []; MemberObject = {}">重置</q-btn>
        <q-btn class="q-mx-xs col-2 bg-positive text-white" icon="check" @click="save">報名</q-btn>
      </div>
    </template>
    <template v-slot:after>
      <q-splitter
        horizontal
        v-model="horizontalModel"
        class="fit">
          <template v-slot:before>
            top right
          </template>
          <template v-slot:after>
            bot right
          </template>
      </q-splitter>
    </template>
  </q-splitter>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { useQuasar, date as qdate} from "quasar";
import { EVENT_GET_ALL_ACTIVE, EVENT_APPLY_BY_ACT_CODE, EVENT_BY_PK, EVENT_FEE_BY_ACT_CODE } from "/src/graphQueries/Event/query.js"
import { EVENT_REGISTRATION, FREE_EVENT_REGISTRATION, EVENT_UNREGISTRATION, FREE_EVENT_UNREGISTRATION } from "/src/graphQueries/Event/mutation.js"
import { useQuery, useMutation } from "@vue/apollo-composable"
import Receipt from "components/Account/Receipt.vue"
import MemberInfoByID from "src/components/Member/MemberInfoByID.vue"
import MemberSelection from "components/Member/MemberSelection.vue"
import { useAccountProvider } from "src/providers/account";

// variables
const $q = useQuasar()
const $store = useStore();
const printReceiptDisplay = ref(false)
const printReceiptNumber = ref("")
const ApplicationQueue = ref([])
const validateDisplay = ref(false)
const unregisterDisplay = ref(false)
const unregisterItem = ref({})
const verticalModel = ref(50)
const horizontalModel = ref(50)
const MemberObject = ref({})
const c_act_codes = ref([])
const EventOptions = ref([])
const OriginalEventOptions = ref([])

// query
const { onResult: activeEvents, loading: loadingEvents, onError: activeEventsError } = useQuery(EVENT_GET_ALL_ACTIVE, {}, {pollInterval: 3000});

activeEvents((result) => {
  if (result.data) {
    EventOptions.value = result.data.HTX_Event
    OriginalEventOptions.value = EventOptions.value
  }
})

/*
const { result: EventData, onError: EventDataError } = useQuery(
  EVENT_BY_PK,
  () => ({
    c_act_code: props.c_act_code
  }));

const { onResult: EventFee_Completed, onError: EventFeeError } = useQuery(
  EVENT_FEE_BY_ACT_CODE,
  () => ({
    c_act_code: props.c_act_code
  }));

const { onResult: onApplyResult, onError: EventApplyError } = useQuery(
  EVENT_APPLY_BY_ACT_CODE,
  () => ({
    c_act_code: props.c_act_code,
  }), {
    pollInterval: 5000
  });
*/


const { latestReceiptNo } = useAccountProvider()
const { mutate: eventRegistration, onDone: eventRegistration_Completed, onError: eventRegistration_Error } = useMutation(EVENT_REGISTRATION)
const { mutate: freeEventRegistration, onDone: freeEventRegistration_Completed, onError: freeEventRegistration_Error } = useMutation(FREE_EVENT_REGISTRATION)

const { mutate: eventUnregistration, onDone: eventUnregistration_Completed, onError: eventUnregistration_Error } = useMutation(EVENT_UNREGISTRATION)
const { mutate: freeEventUnregistration, onDone: freeEventUnregistration_Completed, onError: freeEventUnregistration_Error } = useMutation(FREE_EVENT_UNREGISTRATION)

// computed
const username = computed(() => $store.getters["userModule/getUsername"])
const isCenterIC = computed(() => $store.getters["userModule/getCenterIC"])
const isFinance = computed(() => $store.getters["userModule/getFinance"])
const ApplyHistory = ref([])
// const Event = computed(() => EventData.value?.HTX_Event_by_pk??[])
const Fee = ref([])
const userProfileLogout = () => $store.dispatch("userModule/logout")




const columns = ref([
  {
    name: "c_receipt_no",
    label: "收據",
    field: "c_receipt_no",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_mem_id",
    label: "會員號碼",
    field: "c_mem_id",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_name",
    label: "姓名",
    field: "c_name",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_sex",
    label: "性別",
    field: "c_sex",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_tel",
    label: "電話",
    field: "c_tel",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "i_age",
    label: "年齡",
    field: "i_age",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_type",
    label: "收費類別",
    field: "c_type",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_user_id",
    label: "經手人",
    field: "c_user_id",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "d_reg",
    label: "報名日期",
    field: "d_reg",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => qdate.formatDate(val, "YYYY年M月D日", {
                  daysShort: ['日', '一', '二', '三', '四', '五', '六'],
                })
  },
  {
    name: "b_refund",
    label: "取消報名",
    field: "b_refund",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "d_refund",
    label: "取消日期",
    field: "d_refund",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => qdate.formatDate(val, "YYYY年M月D日", {
                  daysShort: ['日', '一', '二', '三', '四', '五', '六'],
                })
  },
])

const pagination = ref({
  rowsPerPage: 30,
  sortBy: "d_act",
  descending: true,
})

// functions
/*
服務資料 Service Detail
日期 Date：24/08/2022
時間 Time：18:15 - 19:15
*/
/*
function submitApplication() {
  let remark = ""
  ApplicationQueue.value.forEach((item) => {
    remark = "服務資料 Service Detail\r\n"
    if (Event.value.d_date_from && Event.value.d_date_to) remark += "日期 Date：" + qdate.formatDate(qdate.extractDate(Event.value.d_date_from, "D/M/YYYY"), "YYYY年M月D日") + " 至 " + qdate.formatDate(qdate.extractDate(Event.value.d_date_to, "D/M/YYYY"), "YYYY年M月D日")
    if (Event.value.c_week) remark += " 逢星期" + Event.value.c_week
    remark += "\r\n"
    if (Event.value.d_time_from && Event.value.d_time_to) remark += "時間 Time：" + Event.value.d_time_from.trim() + " - " + Event.value.d_time_to.trim()

    const logObject = ref({
      "username": username,
      "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      "module": "活動系統",
      "action": "會員" + item.c_mem_id + " 報名活動 " + props.c_act_code.trim() + Event.value.b_freeofcharge? "": " 費用: " + item.u_fee.value,
    })

    const accountObject = ref({
      c_receipt_no: latestReceiptNo.value,
      d_create: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      i_receipt_type: 2, //type 2 = activity fee
      c_desc: Event.value.c_act_name? Event.value.c_act_name.trim() :"",
      c_act_code: props.c_act_code.trim(),
      c_type: Event.value.c_type? Event.value.c_type.trim(): "",
      u_discount: 0,
      u_price_after_discount: parseFloat(item.u_fee.value),
      c_cash_type: "Cash",
      c_cheque_no: "",
      m_remark: remark,
      c_mem_id: item.c_mem_id? item.c_mem_id.trim(): "",
      c_user_id: username,
      c_name: item.c_name? item.c_name.trim(): "",
      b_cssa: false,
      b_refund: false,
      b_OtherIncome: false,
      b_clear: false,
      d_clear: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      i_prints: 0,
      b_delete: false,
    })
    const regObject = ref({
      c_mem_id: item.c_mem_id,
      c_act_code: props.c_act_code.trim(),
      c_receipt_no: Event.value.b_freeofcharge? null: latestReceiptNo.value,
      c_type: Event.value.b_freeofcharge? null: item.u_fee.label,
      c_remarks: item.remarks,
      c_bus: null,
      i_bus_no: 0,
      c_tbl: null,
      i_tbl_no: 0,
      d_reg: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      c_period: null,
      c_user_id: username,
      b_refund: false,
      d_refund: null,
      c_name: item.c_name,
      c_sex: item.c_sex,
      i_age: item.i_age,
      c_tel: item.c_tel,
    })
    */
    /*
    console.log("remark:" + remark)
    console.log("logObject:" + JSON.stringify(logObject.value))
    console.log("accountObject:" + JSON.stringify(accountObject.value))
    console.log("regObject: " + JSON.stringify(regObject.value))
    */
   /*
    if (Event.value.b_freeofcharge) {
      freeEventRegistration({
        logObject: logObject.value,
        regObject: regObject.value,
      })
    } else {
      eventRegistration({
        logObject: logObject.value,
        regObject: regObject.value,
        accountObject: accountObject.value
      })
    }
  })
}
*/

function newFee(val, done) {
  if (val.length > 0) {
    let i = Fee.value.findIndex((element) => element.value == val)
    if (i == -1) {
      if (val <= 0) {
        $q.notify({message: "收費必須大於0！", icon: 'error', color: 'negative', textColor: 'white' })
      } else {
        Fee.value.push({
          label: "特別收費",
          value: val
        })
        done(Fee.value[Fee.value.length -1], 'toggle')
      }
    } else {
      done(Fee.value[i], 'toggle')
    }

  }
}
function startValidation() {
  if (!ApplicationQueue.value[0].c_mem_id) {
    $q.notify({ message: "請輸入會員號碼！", icon: 'error', color: 'negative', textColor: 'white' })
    return
  }

  if (ApplicationQueue.value[0].c_name == "無此人") {
    $q.notify({ message: "請輸入正確會員號碼！", icon: 'error', color: 'negative', textColor: 'white' })
    return
  }

  if (!Event.value.b_freeofcharge && !ApplicationQueue.value[0].u_fee.value) {
    $q.notify({ message: "請輸入正確收費！", icon: 'error', color: 'negative', textColor: 'white' })
    return
  }

  validateDisplay.value = true
}

function confirmUnregister(object) {
  unregisterItem.value = object
  unregisterDisplay.value = true
}

function unregister() {
  const logObject = ref({
    "username": username,
    "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    "module": "活動系統",
    "action": "會員" + unregisterItem.value.c_mem_id + "(" + unregisterItem.value.c_name + ") 取消報名活動 " + unregisterItem.value.c_act_code
  })

  const unregObject = ref({
    b_refund: true,
    d_refund: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss")
  })

  if (Event.value.b_freeofcharge) {
      freeEventUnregistration({
        logObject: logObject.value,
        unregObject: unregObject.value,
        ID: unregisterItem.value.ID
      })
    } else {
      eventUnregistration({
        logObject: logObject.value,
        unregObject: unregObject.value,
        c_receipt_no: unregisterItem.value.c_receipt_no,
        ID: unregisterItem.value.ID
      })
    }

}

function printReceipt(c_receipt_no) {
  printReceiptDisplay.value = true;
  printReceiptNumber.value = c_receipt_no;
}
// callbacks success
/*
EventFee_Completed((result) => {
  if (result.data) {
    result.data.tbl_act_fee.forEach((item) => {
      Fee.value.push({
        label: item.c_type,
        value: parseInt(item.u_fee)
      })
    })
  }
})
*/
/*

onApplyResult((result) => {
  // hide refunded record
  if (result.data) ApplyHistory.value = result.data.tbl_act_reg.filter(x => !x.b_refund)

  // all record including those refund
  // if (result.data) ApplyHistory.value = result.data.tbl_act_reg
})

eventRegistration_Completed((result) => {
  $q.notify({ message: "會員: " + result.data.insert_tbl_act_reg_one.c_name + "報名活動" + result.data.insert_tbl_act_reg_one.c_act_code + "成功。收費 HK$" + result.data.insert_tbl_account_one.u_price_after_discount });
  ApplicationQueue.value.splice(0,1)
})

freeEventRegistration_Completed((result) => {
  $q.notify({ message: "會員: " + result.data.insert_tbl_act_reg_one.c_name + "報名活動" + result.data.insert_tbl_act_reg_one.c_act_code + "成功。" });
  ApplicationQueue.value.splice(0,1)
})

eventUnregistration_Completed((result) => {
  unregisterItem.value = {}
  $q.notify({ message: "會員: " + result.data.update_tbl_act_reg_by_pk.c_mem_id + "(" + result.data.update_tbl_act_reg_by_pk.c_name + ")" + "取消報名活動" + result.data.update_tbl_act_reg_by_pk.c_act_code + "成功。"})
})

freeEventUnregistration_Completed((result) => {
  unregisterItem.value = {}
  $q.notify({ message: "會員: " + result.data.update_tbl_act_reg_by_pk.c_mem_id + "(" + result.data.update_tbl_act_reg_by_pk.c_name + ")" + "取消報名活動" + result.data.update_tbl_act_reg_by_pk.c_act_code + "成功。"})
})

// callbacks error
EventFeeError((error) => {
  notifyClientError(error)
})

EventDataError((error) => {
  notifyClientError(error)
})

EventApplyError((error) => {
  notifyClientError(error)
})

eventUnregistration_Error((error) => {
  notifyClientError(error)
})

eventRegistration_Error((error) => {
  notifyClientError(error)
})

freeEventRegistration_Error((error) => {
  notifyClientError(error)
})

freeEventUnregistration_Error((error) => {
  notifyClientError(error)
})
*/
// UI function
function notifyClientError(error) {
  $q.notify({ message: "系統錯誤，請重新登入." });
  console.log("error", error)
}

function eventFilter(val, update) {
  if (val === '') {
    update(() => {
      EventOptions.value = OriginalEventOptions.value
    })
    return
  }

  update(() => {
    EventOptions.value = OriginalEventOptions.value
    EventOptions.value = EventOptions.value.filter(v =>
      (v.c_act_code? v.c_act_code.indexOf(val) > -1 : false) ||
      (v.c_act_name? v.c_act_name.toLowerCase().indexOf(val.toLowerCase()) > -1 : false)
    )
  })
}

function save() {
  console.log(JSON.stringify(MemberObject.value))
  console.log(JSON.stringify(c_act_codes.value))
}
</script>
