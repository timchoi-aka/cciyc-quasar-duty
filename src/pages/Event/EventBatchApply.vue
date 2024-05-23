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
                  <div>
                    <EventBatchApplySelection
                      v-model="events[index]"
                      :class="checkAgeRange(MemberObject, events[index])"
                    />
                    <q-tooltip
                      v-if="checkAgeRange(MemberObject, events[index]) != ''"
                    >
                      {{
                        checkAgeRange(MemberObject, events[index]) != "ageMatch"
                          ? "年齡不符合"
                          : "年齡符合"
                      }}
                    </q-tooltip>
                  </div>
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
                class="q-mx-xs col-2 bg-grey text-white"
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
            :key="JSON.stringify(result) + MemberObject.c_mem_id"
            :selectedReceipts="result?.c_receipt_no ?? []"
            :selectedMemo="result?.id ?? []"
            @updateReceiptNumber="(val) => (ReceiptNo = val)"
            @updateMemoID="(val) => (MemoID = val)"
          />
        </template>
      </q-splitter>
    </template>

    <template v-slot:after>
      <div>
        <ReceiptBatch
          :c_receipt_no="ReceiptNo"
          :memoID="MemoID"
          :key="ReceiptNo + MemoID"
        />
      </div>
    </template>
  </q-splitter>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useStore } from "vuex";
import { useQuasar, date as qdate } from "quasar";
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
const verticalModel = ref(70);
const horizontalModel = ref(50);
const MemberObject = ref({});
const events = ref([]);
const now = new Date();
const ReceiptNo = ref([]);
const MemoID = ref([]);
const viewEventModal = ref(false);
const viewEventID = ref("");

// query
const { batchRegister, result, loading, message, updateQueue } =
  useBatchEventRegistrationProvider();

watch(message, (val) => {
  if (val) {
    $q.notify({
      message: val,
    });
  }
});

// computed
const username = computed(() => $store.getters["userModule/getUsername"]);

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

// functions
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
    if (e.d_time_from && e.d_time_to) {
      let startDatetime = qdate.extractDate(
        qdate.formatDate(e.d_date_from, "D/M/YYYY") +
          " " +
          e.d_time_from.trim(),
        "D/M/YYYY h:mm:ss A"
      );

      let endDatetime = qdate.extractDate(
        qdate.formatDate(e.d_date_to, "D/M/YYYY") + " " + e.d_time_to.trim(),
        "D/M/YYYY h:mm:ss A"
      );

      remark +=
        "時間 Time：" +
        qdate.formatDate(startDatetime, "h:mm A") +
        " - " +
        qdate.formatDate(endDatetime, "h:mm A");
    }

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
      c_acc_type: e.c_acc_type,
    });
  });

  batchRegister({
    staff_name: username,
    object: regObject,
  }).then(() => {
    events.value = [];
  });
}

function checkAgeRange(person, event) {
  if (!person.c_mem_id || !event.c_act_code) return "";
  let mismatch = false;
  if (event.c_act_code && event.c_age_control) {
    if (
      (event.i_year_from && person.i_age < event.i_year_from) ||
      (event.i_year_to && person.i_age > event.i_year_to)
    ) {
      mismatch = true;
    }
    if (mismatch) {
      return event.c_age_control.trim() == "才可報名"
        ? "ageMismatchError"
        : "ageMismatchWarning";
    }
  }
  return "ageMatch";
}
</script>

<style lang="scss" scoped>
.ageMismatchWarning {
  display: block;
  background-color: $yellow;
}

.ageMismatchError {
  display: block;
  background-color: rgb(246, 198, 198);
}

.ageMatch {
  display: block;
  background-color: rgb(193, 245, 193);
}
</style>
