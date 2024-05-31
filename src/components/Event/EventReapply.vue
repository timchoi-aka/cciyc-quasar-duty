<template>
  <!-- reregister button -->
  <q-btn outline class="bg-positive text-white" dense flat icon="redo" @click="reregistrationModal = true">
    <q-tooltip class="bg-white text-primary"> 重覆收費 </q-tooltip>
  </q-btn>

  <!-- loading dialog -->
  <LoadingDialog v-model="loading" message="處理中" />

  <!-- reregister dialog -->
  <q-dialog v-model="reregistrationModal">
    <q-card class="q-ma-none q-pa-none">
      <q-card-section class="bg-primary q-py-sm row">
        <div class="text-h6 text-white">確定重覆收費？</div>
        <q-space />
        <q-btn v-close-popup icon="close" class="bg-primary text-white" dense flat>
          <q-tooltip class="bg-white text-primary"> 關閉 </q-tooltip>
        </q-btn>
      </q-card-section>
      <q-card-section class="row q-ma-none q-py-none q-px-none">
        <div class="col-12 text-h6 bg-blue-3 q-px-sm">活動資料</div>
        <div class="col-12 q-px-sm">活動編號：{{ props.c_act_code }}</div>
        <div class="col-12 q-px-sm">活動名稱：{{ props.c_act_name }}</div>
        <div class="col-12 q-px-sm">會計類別：{{ props.c_acc_type }}</div>
        <div class="col-12 q-px-sm">
          活動日期：{{
            qdate.formatDate(
              qdate.extractDate(props.d_date_from, "D/M/YYYY"),
              "YYYY年M月D日"
            ) +
            " 至 " +
            qdate.formatDate(
              qdate.extractDate(props.d_date_to, "D/M/YYYY"),
              "YYYY年M月D日"
            )
          }}
        </div>
        <div class="col-12 q-px-sm">
          活動時間：{{ props.d_time_from + " 至 " + props.d_time_to }}
        </div>
        <div class="col-12 q-px-sm">逢星期：{{ props.c_week }}</div>
      </q-card-section>
      <q-card-section class="row q-ma-none q-py-none q-px-none">
        <div class="col-12 text-h6 bg-red-3 q-px-sm">會員資料</div>
        <div class="col-12 q-px-sm">會員編號：{{ props.c_mem_id }}</div>
        <div class="col-12 q-px-sm">姓名：{{ props.c_name }}</div>
      </q-card-section>
      <q-card-actions class="row">
        <q-form class="col-12 row" @submit="submitApplication">
          <div class="col-12 row">
            <div class="text-h6 text-primary">收費：</div>
            <q-input label="請輸入收費..." outlined lazy-rules :rules="[(val) => (val && val > 0) || '收費要大於0']"
              v-model.number="u_fee" type="number" dense />
            <q-space />
            <div class="text-h6 text-primary">原因：</div>
            <q-input label="請輸入原因..." outlined lazy-rules :rules="[(val) => (val && val.length > 0) || '請輸入原因...']"
              v-model="remark2" type="text" dense />
          </div>
          <div class="col-12 row">
            <q-space />
            <div>
              <q-btn label="取消" class="bg-negative text-white q-mr-md" icon="cancel" v-close-popup />
            </div>
            <div>
              <q-btn label="確認" class="bg-positive text-white" icon="check" type="submit" />
            </div>
          </div>
        </q-form>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { useQuasar, date as qdate } from "quasar";
import { LATEST_RECEIPT_NO } from "/src/graphQueries/Member/query.js";
import { EVENT_REREGISTRATION } from "/src/graphQueries/Event/mutation.js";
import { useMutation, useSubscription } from "@vue/apollo-composable";
import LoadingDialog from "components/LoadingDialog.vue";
import { useAccountProvider } from "src/providers/account";

// props
const props = defineProps({
  c_act_code: {
    type: String,
    required: true,
  },
  c_act_name: {
    type: String,
    required: true,
  },
  c_mem_id: {
    type: String,
    required: true,
  },
  c_name: {
    type: String,
    required: true,
  },
  c_acc_type: {
    type: String,
    required: true,
  },
  d_date_from: {
    type: String,
    required: true,
  },
  d_date_to: {
    type: String,
    required: true,
  },
  c_week: {
    type: String,
    required: false,
  },
  d_time_from: {
    type: String,
    required: false,
  },
  d_time_to: {
    type: String,
    required: false,
  },
});

// variables
const $q = useQuasar();
const $store = useStore();
const reregistrationModal = ref(false);

const { latestReceiptNo } = useAccountProvider();

const {
  mutate: eventReregistration,
  onDone: eventReregistration_Completed,
  onError: eventReregistration_Error,
} = useMutation(EVENT_REREGISTRATION);

// computed
const username = computed(() => $store.getters["userModule/getUsername"]);
const userProfileLogout = () => $store.dispatch("userModule/logout");
const u_fee = ref();
const remark2 = ref();
const loading = ref(0);

// functions
/*
服務資料 Service Detail
日期 Date：24/08/2022
時間 Time：18:15 - 19:15
*/
function submitApplication() {
  let remark = "服務資料 Service Detail\r\n";

  if (props.d_date_from && props.d_date_to) {
    if (qdate.getDateDiff(qdate.extractDate(props.d_date_from.trim(), "D/M/YYYY"), qdate.extractDate(props.d_date_to.trim(), "D/M/YYYY")) == 0) {
      remark += "日期 Date：" + qdate.formatDate(qdate.extractDate(props.d_date_from.trim(), "D/M/YYYY"), "YYYY年M月D日 星期ddd", {
        daysShort: ["日", "一", "二", "三", "四", "五", "六"],
      });
    } else {
      remark +=
        "日期 Date：" +
        qdate.formatDate(qdate.extractDate(props.d_date_from.trim(), "D/M/YYYY"), "YYYY年M月D日") +
        " 至 " +
        qdate.formatDate(qdate.extractDate(props.d_date_to.trim(), "D/M/YYYY"), "YYYY年M月D日");
    }
  }

  if (props.c_week && (qdate.formatDate(props.d_date_from, "YYYYMMDD") != qdate.formatDate(props.d_date_to, "YYYYMMDD"))) remark += " 逢星期" + props.c_week;
  remark += "\r\n";
  if (props.d_time_from && props.d_time_to) {
    let startDatetime = qdate.extractDate(
      props.d_date_from.trim() + " " + props.d_time_from.trim(),
      "D/M/YYYY h:mm:ss A"
    );

    let endDatetime = qdate.extractDate(
      props.d_date_to.trim() + " " + props.d_time_to.trim(),
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
      "會員 " +
      props.c_name.trim() +
      "(" +
      props.c_mem_id.trim() +
      ") (重覆)報名活動 " +
      props.c_act_code.trim() +
      " 費用: " +
      u_fee.value,
  });

  const accountObject = ref({
    c_receipt_no: latestReceiptNo.value,
    d_create: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    i_receipt_type: 20, //type 20 = activity fee (repeat)
    c_desc: props.c_act_name ? props.c_act_name.trim() : "",
    c_act_code: props.c_act_code.trim(),
    c_type: props.c_acc_type ? props.c_acc_type.trim() : "",
    u_discount: 0,
    u_price_after_discount: parseFloat(u_fee.value),
    c_cash_type: "Cash",
    c_cheque_no: "",
    m_remark: remark,
    m_remark2: remark2.value,
    c_mem_id: props.c_mem_id ? props.c_mem_id.trim() : "",
    c_user_id: username,
    c_name: props.c_name ? props.c_name.trim() : "",
    b_cssa: false,
    b_refund: false,
    b_OtherIncome: false,
    b_clear: false,
    d_clear: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    i_prints: 0,
    b_delete: false,
  });

  /*
  console.log("remark:" + remark)
  console.log("logObject:" + JSON.stringify(logObject.value))
  console.log("accountObject:" + JSON.stringify(accountObject.value))
  */
  loading.value++;
  eventReregistration({
    logObject: logObject.value,
    accountObject: accountObject.value,
  });
}

// callbacks success
eventReregistration_Completed((result) => {
  loading.value--;
  $q.notify({
    message:
      "會員: " +
      props.c_name +
      "(重覆)報名活動" +
      props.c_act_code +
      "成功。收費 HK$" +
      result.data.insert_tbl_account_one.u_price_after_discount,
  });
  u_fee.value = 0;
  reregistrationModal.value = false;
});

// callbacks error
eventReregistration_Error((error) => {
  loading.value--;
  notifyClientError(error);
});

// UI function
function notifyClientError(error) {
  $q.notify({ message: "系統錯誤，請重新登入." });
  console.log("error", error);
}
</script>
