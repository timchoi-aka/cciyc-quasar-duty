<template>
  <!-- print receipt modal -->
  <q-dialog v-if="$q.screen.lt.md" v-model="printReceiptDisplay" persistent maximized full-width
    transition-show="slide-up" transition-hide="slide-down">
    <Receipt :c_receipt_no="printReceiptNumber" />
  </q-dialog>

  <q-dialog v-else v-model="printReceiptDisplay" persistent full-height
    style="min-width: 40vw; width: 40vw; max-width: 40vw" transition-show="slide-up" transition-hide="slide-down">
    <!-- <q-card style="min-width: 70vw; width: 70vw; max-width: 70vw;">-->
    <Receipt :c_receipt_no="printReceiptNumber" />
    <!--</q-card>-->
  </q-dialog>

  <!-- print memo modal -->
  <PrintMemo :model-value="printMemoModal" :printMemo="printMemoData"
    @update:model-value="(val) => (printMemoModal = val)" />

  <!-- print participant model -->
  <q-dialog v-model="printParticipantModel" full-width full-height transition-show="slide-up"
    transition-hide="slide-down">
    <q-card style="min-width: 70vw; width: 70vw; max-width: 70vw">
      <q-card-section class="bg-primary text-white row">
        <q-space />
        <q-btn flat icon="close" v-close-popup>
          <q-tooltip class="bg-white text-primary">
            <div>關閉</div>
          </q-tooltip>
        </q-btn>
      </q-card-section>
      <q-card-section>
        <EventParticipantPrint :EventID="c_act_code" />
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- validation -->
  <q-dialog v-model="validateDisplay" class="q-pa-none">
    <q-card>
      <q-card-section class="bg-primary text-white text-h6">
        確定報名？
      </q-card-section>
      <q-card-section class="text-h6">
        <div v-if="
          ApplyHistory.filter((v) => !v.b_refund)
            .map((v) => v.c_mem_id)
            .includes(ApplicationQueue[0].c_mem_id)
        ">
          {{ ApplicationQueue[0].c_mem_id }}已經報名！
        </div>
        <div v-if="
          qdate.getDateDiff(Date.now(), ApplicationQueue[0].d_expired_1) > 0
        ">
          {{ ApplicationQueue[0].c_mem_id }}會藉已過期！
        </div>
      </q-card-section>
      <q-card-actions>
        <q-space />
        <q-btn v-close-popup @click="submitApplication" label="儲存" dense icon="save"
          class="q-ml-md bg-primary text-white" size="lg">
        </q-btn>
        <q-btn v-close-popup label="取消" dense icon="replay" class="q-ml-md bg-negative text-white" size="lg" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- unregister confirm -->
  <q-dialog v-model="unregisterDisplay" class="q-pa-none">
    <q-card>
      <q-card-section class="bg-primary text-white text-h6">
        確定取消報名？
      </q-card-section>
      <q-card-section>
        <div>會員編號：{{ unregisterItem.c_mem_id }}</div>
        <div>姓名：{{ unregisterItem.c_name }}</div>
        <div>活動編號：{{ unregisterItem.c_act_code }}</div>
      </q-card-section>
      <q-card-section v-if="!Event.b_freeofcharge">
        <div class="text-negative text-center">
          注意：這會員的所有活動收據將會變成刪除狀態！
        </div>
      </q-card-section>
      <q-card-actions>
        <q-space />
        <q-btn v-close-popup label="取消" dense icon="replay" class="q-ml-md bg-negative text-white" size="lg" />
        <q-btn v-close-popup @click="unregister" label="儲存" dense icon="save" class="q-ml-md bg-positive text-white"
          size="lg" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- add new user form -->
  <q-form autocorrect="off" autocapitalize="off" autocomplete="off" spellcheck="false" @submit="startValidation"
    @reset="ApplicationQueue.splice(0, 1)">
    <div class="row fit items-center">
      <q-chip size="lg" class="bg-yellow">報名期限：{{ Event.d_sale_start }} - {{ Event.d_sale_end }}</q-chip>
      <q-btn @click="
        ApplicationQueue.push({
          c_mem_id: '',
          u_fee: 0,
          c_name: '',
          remark: '',
          c_sex: '',
          i_age: '',
          c_tel: '',
          d_expired_1: '',
        })
        " label="新增報名" dense icon="celebration" class="q-ml-md bg-positive text-white" size="lg"
        :disable="quotaLeft <= 0" v-if="
          qdate.isBetweenDates(
            Date.now(),
            qdate.extractDate(Event.d_sale_start, 'D/M/YYYY'),
            qdate.extractDate(Event.d_sale_end, 'D/M/YYYY'),
            { inclusiveFrom: true, inclusiveTo: true }
          ) && ApplicationQueue.length == 0
        ">
        <q-tooltip v-if="quotaLeft <= 0">已滿額</q-tooltip>
      </q-btn>
      <q-btn type="submit" label="儲存" dense icon="save" class="q-ml-md bg-primary text-white" size="lg"
        v-if="ApplicationQueue.length > 0" />
      <q-btn type="reset" label="取消" dense icon="replay" class="q-ml-md bg-negative text-white" size="lg"
        v-if="ApplicationQueue.length > 0" />
      <div class="q-ml-md">剩餘名額：{{ quotaLeft }}</div>
      <q-btn flat icon="print" class="bg-white text-primary" @click="printParticipantModel = true">
        <q-tooltip>
          <div class="text-white">列印參加者名單</div>
        </q-tooltip>
      </q-btn>
      <q-chip v-if="Event.c_age_control" :class="Event.c_age_control && Event.c_age_control.trim() == '報名提示'
        ? ['bg-warning', 'text-black']
        : ['bg-negative', 'text-white']
        ">
        <q-icon :name="Event.c_age_control && Event.c_age_control.trim() == '報名提示'
          ? 'warning'
          : 'error'
          " />
        報名限制：
        <span v-if="Event.i_year_from && Event.i_year_to" class="text-bold">{{ Event.i_year_from }}歲至{{ Event.i_year_to
          }}歲</span>
        <span v-else-if="Event.i_year_from && !Event.i_year_to" class="text-bold">{{ Event.i_year_from }}歲以上</span>
        <span v-else-if="!Event.i_year_from && Event.i_year_to" class="text-bold">{{ Event.i_year_to }}歲以下</span>
        <span v-if="Event.c_age_control && Event.c_age_control.trim() == '才可報名'">才可報名</span>
      </q-chip>
    </div>
    <div v-if="ApplicationQueue.length > 0">
      <div class="row bg-blue-2">
        <div class="col-2">會員號碼</div>
        <div v-if="!Event.b_freeofcharge" class="col-1">收費</div>
        <div class="col-3">備註</div>
        <div class="col-1">姓名</div>
        <div class="col-1">年齡</div>
        <div class="col-2">會藉</div>
        <div class="col-2">屆滿日期</div>
      </div>
      <div v-for="(item, index) in ApplicationQueue" class="row">
        <div class="col-2">
          <MemberSelection v-model="item.c_mem_id" />
        </div>
        <q-select v-if="!Event.b_freeofcharge" use-input input-debounce="0" :options="Fee" class="col-1"
          v-model="item.u_fee" :display-value="`${item.u_fee ? item.u_fee.label + ' - ' + item.u_fee.value : ''
            }`" @new-value="newFee">
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{ scope.opt.label }} - {{ scope.opt.value }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
        <q-input class="col-3" type="text" v-model="item.remark" />
        <div :class="highlightAge(ApplicationQueue[index])">
          <MemberInfoByID v-model="ApplicationQueue[index]" />
        </div>
      </div>
    </div>
  </q-form>
  <q-table :rows="ApplyHistory.filter((v) => (displayRefund ? true : !v.b_refund))" :columns="columns"
    :pagination="pagination" :wrap-cells="true" :visible-columns="visibleColumns" :loading="loading">
    <template v-slot:top>
      <div class="q-ma-none q-pa-none row col-12">
        <q-space />
        <q-toggle flat label="顯示已取消報名會員" v-model="displayRefund" class="bg-white text-primary" />
      </div>
    </template>
    <template v-slot:body-cell-c_receipt_no="props">
      <q-td :props="props">
        <div v-for="data in props.row.c_receipt_no">
          <q-btn v-if="data.c_receipt_no && !data.b_refund && !data.reregister" icon="print" color="positive"
            @click="printReceipt(data.c_receipt_no)" size="md" padding="none" outline>
            <q-tooltip class="bg-white text-positive">列印收據</q-tooltip>
          </q-btn>
          <q-btn v-if="data.c_receipt_no && !data.b_refund && data.reregister" icon="print" color="warning"
            @click="printReceipt(data.c_receipt_no)" size="md" padding="none" outline>
            <q-tooltip class="bg-white text-positive">列印重覆收費收據</q-tooltip>
          </q-btn>
          <q-btn v-if="data.c_receipt_no && data.b_refund" icon="print" color="negative"
            @click="printReceipt(data.c_receipt_no)" size="md" padding="none" outline>
            <q-tooltip class="bg-white text-negative">列印已退款收據</q-tooltip>
          </q-btn>
          {{ data.c_receipt_no }}
        </div>
      </q-td>
    </template>
    <template v-slot:body-cell-event_memo="props">
      <q-td :props="props">
        <q-btn icon="receipt_long" color="positive" @click="printMemo(props.row.c_mem_id, props.row.c_act_code)"
          size="md" padding="none" outline>
          <q-tooltip class="bg-white text-positive">列印備忘</q-tooltip>
        </q-btn>
      </q-td>
    </template>
    <template v-slot:body-cell-c_name="props">
      <q-td :props="props">
        {{ props.row.c_name }}
        <EventReregistration v-if="!Event.b_freeofcharge && !props.row.b_refund"
          :c_act_code="Event.c_act_code ? Event.c_act_code.trim() : ''"
          :c_act_name="Event.c_act_name ? Event.c_act_name.trim() : ''"
          :c_acc_type="Event.c_acc_type ? Event.c_acc_type.trim() : ''"
          :d_date_from="Event.d_date_from ? Event.d_date_from.trim() : ''"
          :d_date_to="Event.d_date_to ? Event.d_date_to.trim() : ''" :c_week="Event.c_week ? Event.c_week.trim() : ''"
          :d_time_from="Event.d_time_from ? Event.d_time_from.trim() : ''"
          :d_time_to="Event.d_time_to ? Event.d_time_to.trim() : ''"
          :c_mem_id="props.row.c_mem_id ? props.row.c_mem_id.trim() : ''"
          :c_name="props.row.c_name ? props.row.c_name.trim() : ''" />
      </q-td>
    </template>
    <template v-slot:body-cell-b_refund="props">
      <q-td :props="props">
        <div v-if="!props.row.b_refund">
          <q-btn v-if="isCenterIC || isFinance" icon="undo" color="negative" @click="confirmUnregister(props.row)"
            size="md" padding="none" outline />
        </div>
        <div v-else>已退出</div>
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { computed, ref, defineAsyncComponent } from "vue";
import { useStore } from "vuex";
import { useQuasar, date as qdate } from "quasar";
import {
  EVENT_APPLY_AND_RECEIPT_BY_ACT_CODE,
  EVENT_BY_PK,
  EVENT_FEE_BY_ACT_CODE,
} from "/src/graphQueries/Event/query.js";
import { LATEST_RECEIPT_NO } from "/src/graphQueries/Member/query.js";
import {
  EVENT_REGISTRATION,
  FREE_EVENT_REGISTRATION,
  EVENT_UNREGISTRATION,
  FREE_EVENT_UNREGISTRATION,
} from "/src/graphQueries/Event/mutation.js";
import { useQuery, useMutation, useSubscription } from "@vue/apollo-composable";
import { useAccountProvider } from "src/providers/account";
import Receipt from "components/Account/Receipt.vue";
import MemberInfoByID from "src/components/Member/MemberInfoByID.vue";
import MemberSelection from "components/Member/MemberSelection.vue";
import { useRoute } from "vue-router";
import PrintMemo from "components/Event/Modals/PrintMemo.vue";
import Apply from "src/pages/HealthCare/Apply.vue";

const EventParticipantPrint = defineAsyncComponent(() =>
  import("components/Event/Participants.vue")
);

const EventReregistration = defineAsyncComponent(() =>
  import("components/Event/EventReapply.vue")
);

// variables
const displayRefund = ref(false);
const props = defineProps({
  c_act_code: {
    type: String,
    required: false,
  },
});
const route = useRoute();
const c_act_code = computed(() =>
  route.params.id ? route.params.id : props.c_act_code
);
const $q = useQuasar();
const $store = useStore();
const printReceiptDisplay = ref(false);
const printReceiptNumber = ref("");
const printMemoModal = ref(false);
const printMemoData = ref({});
const ApplicationQueue = ref([]);
const validateDisplay = ref(false);
const unregisterDisplay = ref(false);
const unregisterItem = ref({});
const printParticipantModel = ref(false);
const loading = ref(false);

// query
const { result: EventData, onError: EventDataError } = useQuery(
  EVENT_BY_PK,
  () => ({
    c_act_code: c_act_code.value,
  })
);

const { onResult: EventFee_Completed, onError: EventFeeError } = useQuery(
  EVENT_FEE_BY_ACT_CODE,
  () => ({
    c_act_code: c_act_code.value,
  })
);

const { onResult: onApplyResult, onError: EventApplyError } = useQuery(
  EVENT_APPLY_AND_RECEIPT_BY_ACT_CODE,
  () => ({
    c_act_code: c_act_code.value,
  }),
  {
    pollInterval: 5000,
  }
);

/*
const { result: ReceiptData } = useSubscription(
    LATEST_RECEIPT_NO,
  );
*/
const { latestReceiptNo } = useAccountProvider();

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
const isCenterIC = computed(() => $store.getters["userModule/getCenterIC"]);
const isFinance = computed(() => $store.getters["userModule/getFinance"]);
const ApplyHistory = ref([]);
const Event = computed(() => EventData.value?.HTX_Event_by_pk ?? []);
const Fee = ref([]);
const userProfileLogout = () => $store.dispatch("userModule/logout");
const quotaLeft = computed(
  () =>
    parseInt(Event.value.i_quota_max) -
    ApplyHistory.value.filter((v) => !v.b_refund).length
);
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
    name: "event_memo",
    label: "備忘",
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
    style:
      "border-top: 1px solid; text-align: center; width: 20%; max-width: 20%",
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
    label: "費用類別",
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

const visibleColumns = computed(() =>
  Event.value.b_freeofcharge
    ? columns.value
      .filter((col) => col.name !== "c_receipt_no")
      .map((x) => x.name)
    : columns.value
      .filter((col) => col.name !== "event_memo")
      .map((x) => x.name)
);
// functions
/*
服務資料 Service Detail
日期 Date：24/08/2022
時間 Time：18:15 - 19:15
*/
function submitApplication() {
  let remark = "";
  ApplicationQueue.value.forEach((item) => {
    remark = "服務資料 Service Detail\r\n";
    if (Event.value.d_date_from && Event.value.d_date_to)
      if (e.d_date_from && e.d_date_to) {
        if (qdate.getDateDiff(e.d_date_from, e.d_date_to) == 0) {
          remark += "日期 Date：" + qdate.formatDate(e.d_date_from, "YYYY年M月D日");
        } else {
          remark +=
            "日期 Date：" +
            qdate.formatDate(e.d_date_from, "YYYY年M月D日") +
            " 至 " +
            qdate.formatDate(e.d_date_to, "YYYY年M月D日");
        }
      }
    if (Event.value.c_week) remark += " 逢星期" + Event.value.c_week;
    remark += "\r\n";
    if (Event.value.d_time_from && Event.value.d_time_to) {
      let startDatetime = qdate.extractDate(
        Event.value.d_date_from.trim() + " " + Event.value.d_time_from.trim(),
        "D/M/YYYY h:mm:ss A"
      );

      let endDatetime = qdate.extractDate(
        Event.value.d_date_to.trim() + " " + Event.value.d_time_to.trim(),
        "D/M/YYYY h:mm:ss A"
      );
      remark +=
        "時間 Time：" +
        qdate.formatDate(startDatetime, "h:mm A") +
        " - " +
        qdate.formatDate(endDatetime, "h:mm A");
    }

    const logObject = ref({
      username: username,
      datetime: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      module: "活動系統",
      action:
        "會員" +
          item.c_mem_id +
          " 報名活動 " +
          c_act_code.value.trim() +
          Event.value.b_freeofcharge
          ? ""
          : " 費用: " + item.u_fee.value,
    });

    const accountObject = ref({
      c_receipt_no: latestReceiptNo.value,
      d_create: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      i_receipt_type: 2, //type 2 = activity fee
      c_desc: Event.value.c_act_name ? Event.value.c_act_name.trim() : "",
      c_act_code: c_act_code.value.trim(),
      c_type: Event.value.c_acc_type ? Event.value.c_acc_type.trim() : "",
      u_discount: 0,
      u_price_after_discount: parseFloat(item.u_fee.value),
      c_cash_type: "Cash",
      c_cheque_no: "",
      m_remark: remark,
      c_mem_id: item.c_mem_id ? item.c_mem_id.trim() : "",
      c_user_id: username,
      c_name: item.c_name ? item.c_name.trim() : "",
      b_cssa: false,
      b_refund: false,
      b_OtherIncome: false,
      b_clear: false,
      d_clear: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      i_prints: 0,
      b_delete: false,
    });
    const regObject = ref({
      c_mem_id: item.c_mem_id,
      c_act_code: c_act_code.value.trim(),
      c_receipt_no: Event.value.b_freeofcharge ? null : latestReceiptNo.value,
      c_type: Event.value.b_freeofcharge ? null : item.u_fee.label,
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
      c_name: item.c_name ? item.c_name.trim() : "",
      c_sex: item.c_sex,
      i_age: item.i_age,
      c_tel: item.c_tel,
    });
    /*
    console.log("remark:" + remark)
    console.log("logObject:" + JSON.stringify(logObject.value))
    console.log("accountObject:" + JSON.stringify(accountObject.value))
    console.log("regObject: " + JSON.stringify(regObject.value))
    */
    if (Event.value.b_freeofcharge) {
      freeEventRegistration({
        logObject: logObject.value,
        regObject: regObject.value,
      });
    } else {
      eventRegistration({
        logObject: logObject.value,
        regObject: regObject.value,
        accountObject: accountObject.value,
      });
    }
  });
}

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

  /*
  console.log("Event: " + JSON.stringify(Event.value))
  console.log("logObject: " + JSON.stringify(logObject.value))
  console.log("unregObject: " + JSON.stringify(unregObject.value))
  */

  if (Event.value.b_freeofcharge) {
    freeEventUnregistration({
      logObject: logObject.value,
      unregObject: unregObject.value,
      ID: unregisterItem.value.ID,
    });
  } else {
    //unregisterItem.value.c_receipt_no.forEach(receipt => {
    eventUnregistration({
      logObject: logObject.value,
      unregObject: unregObject.value,
      //c_receipt_no: receipt.c_receipt_no,
      ID: unregisterItem.value.ID,
    });
    //})
  }
}

function printReceipt(c_receipt_no) {
  printReceiptDisplay.value = true;
  printReceiptNumber.value = c_receipt_no;
}

function printMemo(c_mem_id, c_act_code) {
  printMemoModal.value = true;
  printMemoData.value = {
    c_mem_id: c_mem_id,
    c_act_code: c_act_code,
  };
}

// callbacks success
EventFee_Completed((result) => {
  if (result.data) {
    result.data.tbl_act_fee.forEach((item) => {
      Fee.value.push({
        label: item.c_type,
        value: parseInt(item.u_fee),
      });
    });
  }
});

onApplyResult((result) => {
  // hide refunded record
  if (result.data) {
    ApplyHistory.value = [];

    // unregister from event if all receipt is refunded
    result.data.tbl_act_reg.forEach((d) => {
      if (!d.b_refund && !Event.value.b_freeofcharge) {
        let autoUnregisterEvent = false;
        d.EventRegistration_to_Account_by_MID.filter(
          (x) => !x.b_refund && !x.b_delete
        ).length == 0
          ? (autoUnregisterEvent = true)
          : (autoUnregisterEvent = false);

        if (autoUnregisterEvent) {
          loading.value = true;
          eventUnregistration({
            logObject: {
              username: username.value,
              datetime: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
              module: "活動系統",
              action:
                "會員" +
                d.c_mem_id +
                "(" +
                d.c_name +
                ") 因退款/刪除收據而取消報名活動 " +
                d.c_act_code,
            },
            unregObject: {
              b_refund: true,
              d_refund: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
            },
            ID: d.ID,
          });
        }
      }

      ApplyHistory.value.push({
        ...d,
        c_receipt_no: d.EventRegistration_to_Account_by_MID.map(
          ({ c_receipt_no, i_receipt_type, b_refund }) => ({
            c_receipt_no: c_receipt_no,
            reregister: i_receipt_type == 20,
            b_refund: b_refund,
          })
        ),
      });
    });
  }

  // console.log(JSON.stringify(ApplyHistory.value))
  // ApplyHistory.value = result.data.tbl_act_reg.filter(x => !x.b_refund)

  // all record including those refund
  // if (result.data) ApplyHistory.value = result.data.tbl_act_reg
});

eventRegistration_Completed((result) => {
  $q.notify({
    message:
      "會員: " +
      result.data.insert_tbl_act_reg_one.c_name +
      "報名活動" +
      result.data.insert_tbl_act_reg_one.c_act_code +
      "成功。收費 HK$" +
      result.data.insert_tbl_account_one.u_price_after_discount,
  });
  ApplicationQueue.value.splice(0, 1);
});

freeEventRegistration_Completed((result) => {
  $q.notify({
    message:
      "會員: " +
      result.data.insert_tbl_act_reg_one.c_name +
      "報名活動" +
      result.data.insert_tbl_act_reg_one.c_act_code +
      "成功。",
  });
  ApplicationQueue.value.splice(0, 1);
});

eventUnregistration_Completed((result) => {
  loading.value = false;
  unregisterItem.value = {};
  $q.notify({
    message:
      "會員: " +
      result.data.update_tbl_act_reg_by_pk.c_mem_id +
      "(" +
      result.data.update_tbl_act_reg_by_pk.c_name +
      ")" +
      "取消報名活動" +
      result.data.update_tbl_act_reg_by_pk.c_act_code +
      "成功。",
  });
});

freeEventUnregistration_Completed((result) => {
  unregisterItem.value = {};
  $q.notify({
    message:
      "會員: " +
      result.data.update_tbl_act_reg_by_pk.c_mem_id +
      "(" +
      result.data.update_tbl_act_reg_by_pk.c_name +
      ")" +
      "取消報名活動" +
      result.data.update_tbl_act_reg_by_pk.c_act_code +
      "成功。",
  });
});

// callbacks error
EventFeeError((error) => {
  notifyClientError(error);
});

EventDataError((error) => {
  notifyClientError(error);
});

EventApplyError((error) => {
  notifyClientError(error);
});

eventUnregistration_Error((error) => {
  notifyClientError(error);
});

eventRegistration_Error((error) => {
  notifyClientError(error);
});

freeEventRegistration_Error((error) => {
  notifyClientError(error);
});

freeEventUnregistration_Error((error) => {
  notifyClientError(error);
});

// UI function
function notifyClientError(error) {
  $q.notify({ message: "系統錯誤，請重新登入." });
  console.log("error", error);
}

function highlightAge(data) {
  if (data.c_mem_id && Event.value.c_age_control) {
    let outOfRange = false;

    if (Event.value.i_year_from && data.i_age < Event.value.i_year_from) {
      outOfRange = true;
    }
    if (Event.value.i_year_to && data.i_age > Event.value.i_year_to) {
      outOfRange = true;
    }
    if (outOfRange) {
      if (Event.value.c_age_control.trim() == "報名提示") {
        return "bg-warning text-black row col-7";
      } else if (Event.value.c_age_control.trim() == "才可報名") {
        return "bg-negative text-white row col-7";
      }
    }
  }
  return "row col-7";
}
</script>
