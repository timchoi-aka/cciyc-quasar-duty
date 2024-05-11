<template>
  <LoadingDialog :model-value="loading ? 1 : 0" message="報名中" />
  <q-dialog
    v-model="viewEventModal"
    persistent
    full-width
    transition-show="slide-up"
    transition-hide="slide-down"
    class="q-pa-none"
  >
    <EventDetail
      :EventID="viewEventID"
      @hide-component="viewEventModal = false"
    />
  </q-dialog>

  <q-splitter v-model="verticalModel" class="fit">
    <template v-slot:before>
      <q-splitter horizontal v-model="horizontalModel" class="fit">
        <template v-slot:before>
          <div class="row">
            <div class="row col-12 bg-blue-2 text-left q-pa-sm">
              <div class="col-3">會員號碼</div>
              <div class="col-2 q-pl-md">姓名</div>
              <div class="col-2 q-pl-sm">年齡</div>
              <div class="col-2">會藉</div>
              <div class="col-3 q-pl-md">屆滿日期</div>
            </div>
            <div class="row col-12 items-center text-bold">
              <MemberSelection v-model="MemberObject.c_mem_id" />
              <MemberInfoByID v-model="MemberObject" />
            </div>
            <q-separator />
            <div class="row col-12 items-center">
              <q-btn
                icon="add"
                class="bg-primary text-white q-ma-sm"
                @click="events.push({ c_act_code: '', fee: 0 })"
                label="新增報名活動"
              />
            </div>
            <div class="row col-12">
              <div
                v-for="(item, index) in events"
                :key="item"
                class="q-mx-xs row col-12 items-center q-mb-sm q-px-sm"
              >
                <q-btn
                  icon="delete"
                  class="text-negative"
                  flat
                  @click="events.splice(index, 1)"
                />
                <div class="col-5">
                  <EventBatchApplySelection v-model="events[index]" />
                </div>
                <div class="q-mr-sm col-1">
                  <q-btn
                    label="詳情"
                    icon="description"
                    v-if="events[index].c_act_code"
                    @click="
                      viewEventModal = true;
                      viewEventID = events[index].c_act_code;
                    "
                    outline
                    dense
                    class="text-primary fit"
                  />
                </div>
                <div class="col-3">
                  <EventBatchApplyFeeSelection
                    v-if="events[index]"
                    v-model="events[index]"
                  />
                </div>
                <div class="col-2">
                  <EventBatchApplyQuotaDisplay
                    v-if="events[index]"
                    v-model="events[index].i_quota_left"
                    :event="events[index]"
                    @update-registrants="
                      (val) => (events[index].registrants = val)
                    "
                  />
                </div>
              </div>
            </div>
            <div class="row col-12 q-mt-md items-center">
              <q-btn
                class="q-mx-xs col-2 bg-negative text-white"
                icon="cancel"
                @click="
                  events = [];
                  MemberObject.c_mem_id = '';
                  MemberObject = {};
                  ReceiptNo = [];
                "
                >重置</q-btn
              >
              <q-btn
                class="q-mx-xs col-2 bg-positive text-white"
                icon="check"
                @click="save"
                :disable="!validApplication"
                >報名</q-btn
              >

              <q-chip
                v-for="error in errorMessage"
                :icon="error.level == 'error' ? 'error' : 'warning'"
                :color="error.level == 'error' ? 'negative' : 'warning'"
                text-color="white"
                :label="error.message"
                class="text-bold"
              />
            </div>
          </div>
        </template>
        <template v-slot:after>
          <ReceiptListByMemberID_Multiple
            :MemberID="MemberObject.c_mem_id"
            :key="result + MemberObject.c_mem_id"
            :selectedReceipts="result"
            @updateReceiptNumber="(val) => (ReceiptNo = val)"
          />
        </template>
      </q-splitter>
    </template>

    <template v-slot:after>
      <div>
        <ReceiptBatch :c_receipt_no="ReceiptNo" :key="ReceiptNo" />
      </div>
    </template>
  </q-splitter>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useStore } from "vuex";
import { useQuasar, date as qdate } from "quasar";
import {
  EVENT_GET_ALL_ACTIVE,
  EVENT_APPLY_BY_ACT_CODE,
  EVENT_BY_PK,
  EVENT_FEE_BY_ACT_CODE,
} from "/src/graphQueries/Event/query.js";
import {
  EVENT_REGISTRATION,
  FREE_EVENT_REGISTRATION,
  EVENT_UNREGISTRATION,
  FREE_EVENT_UNREGISTRATION,
} from "/src/graphQueries/Event/mutation.js";
import { useQuery, useMutation } from "@vue/apollo-composable";
import Receipt from "components/Account/Receipt.vue";
import MemberInfoByID from "src/components/Member/MemberInfoByID.vue";
import MemberSelection from "components/Member/MemberSelection.vue";
import { useBatchEventRegistrationProvider } from "src/providers/batchEventRegistration";
import EventBatchApplySelection from "components/Event/EventBatchApplySelection.vue";
import EventBatchApplyFeeSelection from "components/Event/EventBatchApplyFeeSelection.vue";
import EventBatchApplyQuotaDisplay from "components/Event/EventBatchApplyQuotaDisplay.vue";
import LoadingDialog from "components/LoadingDialog.vue";
import ReceiptListByMemberID_Multiple from "components/Account/ReceiptListByMemberID_Multiple.vue";
import ReceiptBatch from "components/Account/ReceiptBatch.vue";
import EventDetail from "src/components/Event/EventDetail.vue";
// variables
const $q = useQuasar();
const $store = useStore();
const printReceiptDisplay = ref(false);
const printReceiptNumber = ref("");
const ApplicationQueue = ref([]);
const validateDisplay = ref(false);
const unregisterDisplay = ref(false);
const unregisterItem = ref({});
const verticalModel = ref(70);
const horizontalModel = ref(50);
const MemberObject = ref({});
const events = ref([]);
const EventOptions = ref([]);
const OriginalEventOptions = ref([]);
const now = new Date();
const ReceiptNo = ref([]);
const viewEventModal = ref(false);
const viewEventID = ref("");

// query
const { batchRegister, result, loading, message, updateQueue } =
  useBatchEventRegistrationProvider();
const {
  mutate: eventRegistration,
  onDone: eventRegistration_Completed,
  onError: eventRegistration_Error,
} = useMutation(EVENT_REGISTRATION);
const {
  mutate: freeEventRegistration,
  onDone: freeEventRegistration_Completed,
  onError: freeEventRegistration_Error,
} = useMutation(FREE_EVENT_REGISTRATION);

watch(message, (val) => {
  if (val) {
    $q.notify({
      message: val,
    });
  }
});

const {
  mutate: eventUnregistration,
  onDone: eventUnregistration_Completed,
  onError: eventUnregistration_Error,
} = useMutation(EVENT_UNREGISTRATION);
const {
  mutate: freeEventUnregistration,
  onDone: freeEventUnregistration_Completed,
  onError: freeEventUnregistration_Error,
} = useMutation(FREE_EVENT_UNREGISTRATION);

// computed
const username = computed(() => $store.getters["userModule/getUsername"]);
const Fee = ref([]);

// validApplication return false if events is empty or duplicated c_act_code found in events
const errorMessage = ref([]);
const validApplication = computed(() => {
  errorMessage.value = [];

  if (
    MemberObject.value.c_mem_id == "" ||
    MemberObject.value.c_mem_id == null
  ) {
    errorMessage.value.push({
      message: "請輸入會員號碼",
      level: "error",
    });
    return false;
  }

  if (qdate.getDateDiff(MemberObject.value.d_expired_1, now) < 0) {
    errorMessage.value.push({
      message: "注意：會藉已過期",
      level: "warning",
    });
  }

  // First, check if the events array is empty
  if (events.value.length === 0) {
    errorMessage.value.push({
      message: "請新增報名活動",
      level: "error",
    });
    return false; // Invalid if empty
  }

  // if user didn't input any c_act_code, don't allow application
  if (events.value.filter((ele) => ele.c_act_code != "").length == 0) {
    errorMessage.value.push({
      message: "請輸入報名活動",
      level: "error",
    });
  }

  // Extract c_act_code values from events and create a Set to remove duplicates
  const cActCodes = new Set(events.value.map((event) => event.c_act_code));

  // Compare the length of the Set to the original events array
  // If they are different, it means there were duplicates
  if (cActCodes.size !== events.value.length) {
    errorMessage.value.push({
      message: "請勿重複報名活動",
      level: "error",
    });
    return false; // Invalid if duplicates found
  }

  // check if user has already registered before
  if (events.value.length > 0) {
    let alreadyExists = false;
    events.value.forEach((e) => {
      if (e.registrants && e.registrants.length > 0) {
        if (e.registrants.includes(MemberObject.value.c_mem_id)) {
          alreadyExists = true;
          errorMessage.value.push({
            message: `這會員已經報名活動 ${e.c_act_code}`,
            level: "error",
          });
        }
      }
    });
    if (alreadyExists) return false;
  }

  // return false if event is not free but didn't have a charge input
  let validRecord = true;
  events.value.forEach((e) => {
    if (
      e.c_act_code != "" &&
      !e.b_freeofcharge &&
      (e.u_fee <= 0 || e.u_fee == "" || e.u_fee == null)
    ) {
      errorMessage.value.push({
        message: `請輸入正確收費`,
        level: "error",
      });
      validRecord = false;
    }

    if (e.i_quota_left <= 0) {
      errorMessage.value.push({
        message: `${e.c_act_code} 報名人數已滿`,
        level: "error",
      });
      validRecord = false;
    }
  });
  if (!validRecord) return false;

  return true;
});

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
    format: (val) =>
      qdate.formatDate(val, "YYYY年M月D日", {
        daysShort: ["日", "一", "二", "三", "四", "五", "六"],
      }),
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
    format: (val) =>
      qdate.formatDate(val, "YYYY年M月D日", {
        daysShort: ["日", "一", "二", "三", "四", "五", "六"],
      }),
  },
]);

const pagination = ref({
  rowsPerPage: 30,
  sortBy: "d_act",
  descending: true,
});

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
    let i = Fee.value.findIndex((element) => element.value == val);
    if (i == -1) {
      if (val <= 0) {
        $q.notify({
          message: "收費必須大於0！",
          icon: "error",
          color: "negative",
          textColor: "white",
        });
      } else {
        Fee.value.push({
          label: "特別收費",
          value: val,
        });
        done(Fee.value[Fee.value.length - 1], "toggle");
      }
    } else {
      done(Fee.value[i], "toggle");
    }
  }
}
function startValidation() {
  if (!ApplicationQueue.value[0].c_mem_id) {
    $q.notify({
      message: "請輸入會員號碼！",
      icon: "error",
      color: "negative",
      textColor: "white",
    });
    return;
  }

  if (ApplicationQueue.value[0].c_name == "無此人") {
    $q.notify({
      message: "請輸入正確會員號碼！",
      icon: "error",
      color: "negative",
      textColor: "white",
    });
    return;
  }

  if (!Event.value.b_freeofcharge && !ApplicationQueue.value[0].u_fee.value) {
    $q.notify({
      message: "請輸入正確收費！",
      icon: "error",
      color: "negative",
      textColor: "white",
    });
    return;
  }

  validateDisplay.value = true;
}

function confirmUnregister(object) {
  unregisterItem.value = object;
  unregisterDisplay.value = true;
}

function unregister() {
  const logObject = ref({
    username: username,
    datetime: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    module: "活動系統",
    action:
      "會員" +
      unregisterItem.value.c_mem_id +
      "(" +
      unregisterItem.value.c_name +
      ") 取消報名活動 " +
      unregisterItem.value.c_act_code,
  });

  const unregObject = ref({
    b_refund: true,
    d_refund: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
  });

  if (Event.value.b_freeofcharge) {
    freeEventUnregistration({
      logObject: logObject.value,
      unregObject: unregObject.value,
      ID: unregisterItem.value.ID,
    });
  } else {
    eventUnregistration({
      logObject: logObject.value,
      unregObject: unregObject.value,
      c_receipt_no: unregisterItem.value.c_receipt_no,
      ID: unregisterItem.value.ID,
    });
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
  console.log("error", error);
}

function eventFilter(val, update) {
  if (val === "") {
    update(() => {
      EventOptions.value = OriginalEventOptions.value;
    });
    return;
  }

  update(() => {
    EventOptions.value = OriginalEventOptions.value;
    EventOptions.value = EventOptions.value.filter(
      (v) =>
        (v.c_act_code ? v.c_act_code.indexOf(val) > -1 : false) ||
        (v.c_act_name
          ? v.c_act_name.toLowerCase().indexOf(val.toLowerCase()) > -1
          : false)
    );
  });
}

async function save() {
  let regObject = ref([]);
  let remark = "";
  events.value.forEach((e) => {
    remark = "服務資料 Service Detail\r\n";
    if (e.d_date_from && e.d_date_to)
      remark +=
        "日期 Date：" +
        qdate.formatDate(e.d_date_from, "YYYY年M月D日") +
        " 至 " +
        qdate.formatDate(e.d_date_to, "YYYY年M月D日");
    if (e.c_week) remark += " 逢星期" + e.c_week;
    remark += "\r\n";
    if (e.d_time_from && e.d_time_to)
      remark += "時間 Time：" + e.d_time_from + " - " + e.d_time_to;

    regObject.value.push({
      c_mem_id: MemberObject.value.c_mem_id,
      c_name: MemberObject.value.c_name,
      c_act_code: e.c_act_code,
      c_act_name: e.c_act_name,
      c_sex: MemberObject.value.c_sex,
      i_age: MemberObject.value.i_age,
      c_type: e.b_freeofcharge ? null : e.c_type,
      u_fee: e.b_freeofcharge ? null : e.u_fee,
      remark: remark,
    });
  });

  batchRegister({
    staff_name: username,
    object: regObject,
  });
  //console.log(JSON.stringify(MemberObject.value));
  // console.log(JSON.stringify(events.value));
}
</script>
