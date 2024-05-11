<template>
  <q-table
    :rows="StatData"
    :columns="statTableColumn"
    no-data-label="沒有統計數據"
    :pagination="pagination"
    :loading="loading"
  >
    <!-- add data button -->
    <template v-slot:top>
      <q-btn
        v-if="!isEdit"
        color="primary"
        icon="add"
        :disable="loading"
        label="新增"
        @click="addRow"
      />
      <q-btn
        class="q-mx-md"
        v-if="JSON.stringify(StatData) != JSON.stringify(originalData)"
        color="warning"
        icon="undo"
        :disable="loading"
        label="全部重置"
        @click="StatData = JSON.parse(JSON.stringify(originalData))"
      />
    </template>

    <!-- popup edit on body cell -->
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td key="action" :props="props">
          <q-btn
            dense
            v-if="
              eventMonthValidation(props.row.d_act) &&
              props.row.isEdit &&
              isEdit
            "
            icon="delete"
            class="text-negative"
            flat
            @click="deleteRow(props.row.s_GUID)"
          />
          <q-btn
            dense
            v-if="props.row.s_GUID && !props.row.isEdit && !isEdit"
            icon="edit"
            class="text-primary"
            flat
            @click="modifyRow(props.row.s_GUID)"
          />
          <q-btn
            dense
            v-if="props.row.isEdit"
            icon="save"
            class="text-primary"
            flat
            @click="saveRow(props.row.s_GUID)"
          />
          <q-btn
            dense
            v-if="props.row.isEdit"
            icon="undo"
            class="text-warning"
            flat
            @click="restoreRow(props.row.s_GUID)"
          />
        </q-td>
        <q-td key="inCenter" :props="props">
          <div v-if="props.row.isEdit">
            <q-btn-toggle
              rounded
              push
              v-if="eventMonthValidation(props.row.d_act)"
              v-model="props.row.inCenter"
              toggle-color="primary"
              :options="[
                { label: '是', value: true },
                { label: '否', value: false },
              ]"
            />
          </div>
          <div v-else>
            <q-icon
              v-if="props.row.inCenter == null"
              name="question_mark"
              color="warning"
            />
            <q-icon
              v-if="props.row.inCenter == true"
              name="check"
              color="positive"
            />
            <q-icon
              v-if="props.row.inCenter == false"
              name="close"
              color="negative"
            />
          </div>
        </q-td>
        <q-td key="d_act" :props="props">
          {{ props.row.d_act }}
          <q-popup-edit
            v-if="!props.row.d_act && props.row.isEdit"
            filled
            v-model="props.row.d_act"
            title="活動月份"
            auto-save
            v-slot="scope"
            :validate="eventMonthValidation"
            @hide="eventMonthValidation"
          >
            <q-input
              v-model="scope.value"
              mask="##/####"
              hint="MM/YYYY"
              dense
              autofocus
              counter
              @keyup.enter="scope.set"
              :error="errorDate"
              :error-message="errorMessageDate"
            />
          </q-popup-edit>
        </q-td>
        <q-td key="i_number" :props="props">
          {{ props.row.i_number }}
          <q-popup-edit
            v-if="eventMonthValidation(props.row.d_act) && props.row.isEdit"
            v-model.number="props.row.i_number"
            auto-save
            v-slot="scope"
          >
            <q-input
              type="number"
              v-model.number="scope.value"
              dense
              autofocus
              @keyup.enter="scope.set"
            />
          </q-popup-edit>
        </q-td>
        <q-td key="i_people_count" :props="props">
          {{ props.row.i_people_count }}
          <q-popup-edit
            v-if="eventMonthValidation(props.row.d_act) && props.row.isEdit"
            v-model.number="props.row.i_people_count"
            auto-save
            v-slot="scope"
          >
            <q-input
              type="number"
              v-model.number="scope.value"
              dense
              autofocus
              @keyup.enter="scope.set"
            />
          </q-popup-edit>
        </q-td>
        <q-td key="i_number_a" :props="props">
          {{ props.row.i_number_a }}
          <q-popup-edit
            v-if="eventMonthValidation(props.row.d_act) && props.row.isEdit"
            v-model.number="props.row.i_number_a"
            auto-save
            v-slot="scope"
          >
            <q-input
              type="number"
              v-model.number="scope.value"
              dense
              autofocus
              @keyup.enter="scope.set"
            />
          </q-popup-edit>
        </q-td>
        <q-td key="i_people_count_a" :props="props">
          {{ props.row.i_people_count_a }}
          <q-popup-edit
            v-if="eventMonthValidation(props.row.d_act) && props.row.isEdit"
            v-model.number="props.row.i_people_count_a"
            auto-save
            v-slot="scope"
          >
            <q-input
              type="number"
              v-model.number="scope.value"
              dense
              autofocus
              @keyup.enter="scope.set"
            />
          </q-popup-edit>
        </q-td>
        <q-td key="i_number_b" :props="props">
          {{ props.row.i_number_b }}
          <q-popup-edit
            v-if="eventMonthValidation(props.row.d_act) && props.row.isEdit"
            v-model.number="props.row.i_number_b"
            auto-save
            v-slot="scope"
          >
            <q-input
              type="number"
              v-model.number="scope.value"
              dense
              autofocus
              @keyup.enter="scope.set"
            />
          </q-popup-edit>
        </q-td>
        <q-td key="i_people_count_b" :props="props">
          {{ props.row.i_people_count_b }}
          <q-popup-edit
            v-if="eventMonthValidation(props.row.d_act) && props.row.isEdit"
            v-model.number="props.row.i_people_count_b"
            auto-save
            v-slot="scope"
          >
            <q-input
              type="number"
              v-model.number="scope.value"
              dense
              autofocus
              @keyup.enter="scope.set"
            />
          </q-popup-edit>
        </q-td>
        <q-td key="i_number_c" :props="props">
          {{ props.row.i_number_c }}
          <q-popup-edit
            v-if="eventMonthValidation(props.row.d_act) && props.row.isEdit"
            v-model.number="props.row.i_number_c"
            auto-save
            v-slot="scope"
          >
            <q-input
              type="number"
              v-model.number="scope.value"
              dense
              autofocus
              @keyup.enter="scope.set"
            />
          </q-popup-edit>
        </q-td>
        <q-td key="i_people_count_c" :props="props">
          {{ props.row.i_people_count_c }}
          <q-popup-edit
            v-if="eventMonthValidation(props.row.d_act) && props.row.isEdit"
            v-model.number="props.row.i_people_count_c"
            auto-save
            v-slot="scope"
          >
            <q-input
              type="number"
              v-model.number="scope.value"
              dense
              autofocus
              @keyup.enter="scope.set"
            />
          </q-popup-edit>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script setup>
import { computed, watch, ref } from "vue";
import { useStore } from "vuex";
import { date as qdate, useQuasar, uid } from "quasar";
import { EVENT_STAT_BY_PK } from "/src/graphQueries/Event/query.js";
import {
  UPDATE_EVENT_STAT_BY_PK,
  DELETE_EVENT_STAT,
} from "/src/graphQueries/Event/mutation.js";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { useRoute } from "vue-router";
import { useEventProvider } from "src/providers/event";

// variables
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
const StatData = ref([]);
const errorDate = ref(false);
const errorMessageDate = ref("未能新增/修改舊記錄");
// const originalData = ref([])
const tempData = ref({});

const statTableColumn = ref([
  {
    name: "action",
    label: "動作",
    field: "action",
    style:
      "border-top: 1px solid; text-align: center; min-width: 10%; width: 10%; max-width: 10%;",
    headerStyle:
      "text-align: center; min-width: 10%; width: 10%; max-width: 10%;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "inCenter",
    label: "中心舉行",
    field: "inCenter",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "d_act",
    label: "月份",
    field: "d_act",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "i_number",
    label: "青年節數",
    field: "i_number",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "i_people_count",
    label: "青年人次",
    field: "i_people_count",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "i_number_a",
    label: "兒童節數",
    field: "i_number_a",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "i_people_count_a",
    label: "兒童人次",
    field: "i_people_count_a",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "i_number_b",
    label: "家長節數",
    field: "i_number_b",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "i_people_count_b",
    label: "家長人次",
    field: "i_people_count_b",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "i_number_c",
    label: "社區人士節數",
    field: "i_number_c",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "i_people_count_c",
    label: "社區人士人次",
    field: "i_people_count_c",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
]);
const pagination = ref({
  rowsPerPage: 30,
  sortBy: "d_act",
  descending: true,
});

// query
const { result, loading, refetch } = useEventProvider({
  c_act_code: c_act_code,
  loadSession: ref(true),
});
const {
  mutate: updateEventStat,
  onDone: updateEventStat_Completed,
  onError: updateEventStat_Error,
} = useMutation(UPDATE_EVENT_STAT_BY_PK);
const {
  mutate: deleteEventStat,
  onDone: deleteEventStat_Completed,
  onError: deleteEventStat_Error,
} = useMutation(DELETE_EVENT_STAT);

const originalData = computed(() =>
  result.value && result.value.HTX_Event_by_pk
    ? result.value.HTX_Event_by_pk.Event_to_Session
    : []
);

watch(originalData, (newValue, oldValue) => {
  StatData.value = JSON.parse(JSON.stringify(newValue));
  StatData.value.forEach((element) => {
    delete element["__typename"];
  });
});

// computed
const username = computed(() => $store.getters["userModule/getUsername"]);
const isCenterIC = computed(() => $store.getters["userModule/getCenterIC"]);
const isEventManagement = computed(
  () => $store.getters["userModule/getEventManagement"]
);
const deadline = computed(() => {
  let d = qdate.addToDate(new Date(), { hours: 8 });
  if (d.getDate() > 10) return qdate.startOfDate(d, "month");
  else
    return qdate.startOfDate(qdate.subtractFromDate(d, { month: 1 }), "month");
});
const isEdit = computed(() => {
  if (StatData.value.length > 0)
    return StatData.value.filter((x) => x.isEdit).length > 0;
  return false;
});

// functions
function addRow() {
  StatData.value.push({
    c_act_code: c_act_code.value.trim(),
    d_act: "",
    i_number: 0,
    i_people_count: 0,
    i_number_a: 0,
    i_people_count_a: 0,
    i_number_b: 0,
    i_people_count_b: 0,
    i_number_c: 0,
    i_people_count_c: 0,
    inCenter: null,
    isEdit: true,
  });
}

function saveRow(s_GUID) {
  let i = StatData.value.findIndex((element) => element.s_GUID == s_GUID);

  // cleanup
  const data = JSON.parse(JSON.stringify(StatData.value[i]));
  delete data.isEdit;
  let j = originalData.value.findIndex((element) => element.s_GUID == s_GUID);

  // error validation
  if (data.inCenter == null) {
    $q.notify({
      message: "必須輸入 - 中心舉行",
      icon: "error",
      color: "negative",
      textColor: "white",
    });
    return;
  }

  if (data.d_act == "") {
    $q.notify({
      message: "必須輸入 - 月份",
      icon: "error",
      color: "negative",
      textColor: "white",
    });
    return;
  }

  // edit existing row
  let logObject = ref(null);
  if (s_GUID) {
    logObject = ref({
      username: username,
      datetime: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      module: "活動系統",
      action:
        "修改活動統計數據: " +
        c_act_code.value +
        "舊資料:" +
        JSON.stringify(originalData.value[j], null, 2) +
        "。新資料:" +
        JSON.stringify(StatData.value[i], null, 2),
    });
  } else {
    // new entry
    logObject = ref({
      username: username,
      datetime: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      module: "活動系統",
      action:
        "新增活動統計數據: " +
        c_act_code.value +
        "。新資料:" +
        JSON.stringify(StatData.value[i], null, 2),
    });
    data.s_GUID = uid();
  }

  // perform actual update
  updateEventStat({
    objects: data,
    logObject: logObject.value,
  });
}

function eventMonthValidation(val) {
  let d = qdate.extractDate(val, "MM/YYYY");
  if (!(isCenterIC.value || isEventManagement.value) && d < deadline.value) {
    errorDate.value = true;
    return false;
  }
  errorDate.value = false;
  return true;
}

function deleteRow(s_GUID) {
  let index = StatData.value.findIndex((element) => element.s_GUID == s_GUID);
  if (s_GUID) {
    $q.dialog({
      title:
        '<div class="bg-negative text-white q-pa-sm q-ma-none text-center">刪除統計記錄？</div>',
      message:
        "<div class='text-body1 q-py-xs'>月份：" +
        StatData.value[index].d_act +
        "</div>",
      html: true,
      cancel: true,
      persistent: true,
      ok: {
        label: "確認",
        textColor: "white",
        color: "primary",
      },
      cancel: {
        label: "取消",
        textColor: "white",
        color: "warning",
      },
    }).onOk(() => {
      const logObject = ref({
        username: username,
        datetime: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
        module: "活動系統",
        action:
          "刪除活動統計數據: " +
          c_act_code.value +
          "。刪除資料:" +
          JSON.stringify(StatData.value[index], null, 2),
      });

      deleteEventStat({
        delete_dAct: StatData.value[index].d_act,
        delete_cActCode: c_act_code.value,
        delete_inCenter: StatData.value[index].inCenter,
        logObject: logObject.value,
      });
    });
  } else {
    StatData.value.splice(index, 1);
  }
}

function modifyRow(s_GUID) {
  let i = StatData.value.findIndex((element) => element.s_GUID == s_GUID);
  tempData.value = JSON.parse(JSON.stringify(StatData.value[i]));
  StatData.value[i].isEdit = true;
}

function restoreRow(s_GUID) {
  let i = StatData.value.findIndex((element) => element.s_GUID == s_GUID);
  if (s_GUID) StatData.value[i] = tempData.value;
  else StatData.value.splice(i, 1);
}

// UI functions
function notifyClientError(error) {
  $q.notify({ message: "資料錯誤或重覆，請重新輸入." });
  //refetch();
  console.log("error: ", error);
}

function notifyClientSuccess(result) {
  refetch();
  $q.notify({
    message: "更新活動統計資料" + c_act_code.value + "完成。",
  });
}

// callback
/*
EventStatError((error) => {
  notifyClientError(error);
});*/

updateEventStat_Error((error) => {
  notifyClientError(error);
});

deleteEventStat_Error((error) => {
  notifyClientError(error);
});

updateEventStat_Completed((result) => {
  //  refetch();
  notifyClientSuccess(result.data.insert_tbl_act_session.returning.c_act_code);
});

deleteEventStat_Completed((result) => {
  notifyClientSuccess(c_act_code.value);
});
</script>
