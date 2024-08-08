<template>
  <!-- Main container -->
  <LoadingDialog
    :model-value="loading || loadApplicant ? 1 : 0"
    message="處理中"
  />
  <div class="row items-center q-pa-md">
    <!-- Event date selection -->
    <div class="col-md-3 col-sm-6 col-xs-6 row">
      <div class="text-h6 col-grow">活動點名日期</div>
      <div class="row col-12 items-center">
        <q-select
          use-input
          new-value-mode="add-unique"
          v-model="eventDate"
          @new-value="addDate"
          :options="eventDateOptions"
          class="col-9 text-h6"
        />
        <q-btn round flat icon="event" size="lg" color="primary">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <!-- Date picker -->
            <q-date
              :model-value="qdate.formatDate(eventDate, 'YYYY/MM/DD')"
              v-on:update:model-value="
                (val) => (eventDate = qdate.formatDate(val, 'YYYY-MM-DD'))
              "
            >
              <!-- Close button for date picker -->
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="關閉" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-btn>
      </div>
    </div>

    <!-- Print button -->
    <div class="col-auto">
      <q-btn
        icon="print"
        label="點名紙"
        class="bg-primary text-white q-ma-sm"
        :to="{ name: 'AttendancePrint', params: { id: route.params.id } }"
      />
    </div>
  </div>

  <!-- Information chip -->
  <div class="row col-12 q-px-md text-body1 items-center">
    <div class="col-xs-8 col-sm-4 col-md-3 q-my-sm">
      <q-chip>每節為4小時</q-chip>
    </div>
    <div class="col-xs-2 col-sm-2 col-md-2 row justify-center">
      <q-chip class="bg-primary text-white">節數-在中心舉行</q-chip>
    </div>
    <div class="col-xs-2 col-sm-2 col-md-2 row justify-center">
      <q-chip class="bg-negative text-white">節數-不在中心舉行</q-chip>
    </div>
  </div>
  <div
    class="row col-12 q-px-md text-body1 items-center bg-positive text-white"
  >
    <div class="col-xs-8 col-sm-4 col-md-3 q-my-sm">活動節數</div>
    <div class="col-xs-2 col-sm-2 col-md-2 row justify-center">
      <q-btn-toggle
        color="blue-1"
        text-color="black"
        clearable
        v-model="inCenterSession"
        :options="[
          { label: '1節', value: 1 },
          { label: '2節', value: 2 },
          { label: '3節', value: 3 },
        ]"
      />
    </div>
    <div class="col-xs-2 col-sm-2 col-md-2 row justify-center">
      <q-btn-toggle
        color="red-1"
        text-color="black"
        toggle-color="negative"
        clearable
        v-model="outCenterSession"
        :options="[
          { label: '1節', value: 1 },
          { label: '2節', value: 2 },
          { label: '3節', value: 3 },
        ]"
      />
    </div>
  </div>
  <!-- List of applicants -->
  <div
    v-for="(app, index) in ApplicantsData"
    :class="[
      'row',
      'col-12',
      'q-px-md',
      'items-center',
      'text-body1',
      index % 2 == 0 ? 'bg-grey-3' : 'bg-grey-0',
    ]"
  >
    <!-- Applicant details -->
    <div class="col-xs-8 col-sm-4 col-md-3 q-my-sm">
      <span>{{ index + 1 }}</span
      ><span>)</span>
      <span
        >{{ app.c_name }}({{ app.c_mem_id }}) - {{ app.i_age }}歲
        <q-chip
          size="sm"
          color="amber"
          v-if="app.MemberData.isYouth(eventDate)"
          label="青年" />
        <q-chip
          color="blue-3"
          size="sm"
          v-else-if="app.MemberData.isYouthFamilyAsOfDate(eventDate)"
          label="青年家人"
      /></span>
    </div>
    <!-- Attendance toggle buttons - in centre -->
    <div class="col-xs-2 col-sm-2 col-md-2 row justify-center">
      <q-btn-toggle
        color="blue-1"
        text-color="black"
        clearable
        v-model="inCenterAttendanceList[app.c_mem_id]"
        :options="inCenterOptions"
      />
    </div>
    <!-- Attendance toggle buttons - out of centre -->
    <div class="col-xs-2 col-sm-2 col-md-2 row justify-center">
      <q-btn-toggle
        color="red-1"
        text-color="black"
        toggle-color="negative"
        clearable
        v-model="outCenterAttendanceList[app.c_mem_id]"
        :options="outCenterOptions"
      />
    </div>
  </div>

  <!-- other attendance - youth -->
  <div class="row col-12 q-px-md text-body1 items-center">
    <div class="col-xs-8 col-sm-4 col-md-3 q-my-sm">
      <div class="text-purple text-body1">
        15-24歲青年出席人次：<q-input
          v-model="youthAttendance"
          type="number"
          dense
        />
      </div>
    </div>
    <div class="col-xs-2 col-sm-2 col-md-2 row justify-center">
      <q-btn-toggle
        color="blue-1"
        toggle-color="blue-7"
        text-color="black"
        clearable
        v-model="inCenterYouthSession"
        :options="inCenterOptions"
      />
    </div>
    <div class="col-xs-2 col-sm-2 col-md-2 row justify-center">
      <q-btn-toggle
        color="red-1"
        toggle-color="red-7"
        text-color="black"
        clearable
        v-model="outCenterYouthSession"
        :options="outCenterOptions"
      />
    </div>
  </div>

  <!-- other attendance - youth family -->
  <div class="row col-12 q-px-md text-body1 items-center">
    <div class="col-xs-8 col-sm-4 col-md-3 q-my-sm">
      <div class="text-orange text-body1">
        15-24歲青年家屬出席人次：<q-input
          v-model="youthFamilyAttendance"
          type="number"
          dense
        />
      </div>
    </div>
    <div class="col-xs-2 col-sm-2 col-md-2 row justify-center">
      <q-btn-toggle
        color="blue-1"
        toggle-color="blue-7"
        text-color="black"
        clearable
        v-model="inCenterYouthFamilySession"
        :options="inCenterOptions"
      />
    </div>
    <div class="col-xs-2 col-sm-2 col-md-2 row justify-center">
      <q-btn-toggle
        color="red-1"
        toggle-color="red-7"
        text-color="black"
        clearable
        v-model="outCenterYouthFamilySession"
        :options="outCenterOptions"
      />
    </div>
  </div>

  <div class="q-pa-md">
    <q-btn
      :label="buttonLabel"
      :class="[
        buttonLabel == '新增' ? 'bg-primary' : 'bg-positive',
        'text-white',
      ]"
      @click="save"
      flat
      :disable="addButtonDisabled"
    />
    <q-btn
      v-if="delButtonDisplay"
      label="刪除"
      class="bg-negative text-white q-mx-md"
      @click="del"
      flat
      :disable="addButtonDisabled"
    />
    <div v-if="addButtonDisabled">
      <q-chip
        color="negative"
        text-color="white"
        label="點名日期已過截止日期，請聯絡中心主任修改"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useStore } from "vuex";
import { date as qdate, useQuasar } from "quasar";
import { useAttendanceProvider } from "src/providers/attendance";
import { useApplicantProvider } from "src/providers/applicant";
import { useRoute } from "vue-router";
import LoadingDialog from "components/LoadingDialog.vue";

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
const eventDateOptions = ref([]);
const eventDate = ref(qdate.formatDate(new Date(), "YYYY-MM-DD"));
const inCenterSession = ref();
const outCenterSession = ref();
const inCenterAttendanceList = ref({});
const outCenterAttendanceList = ref({});
const inCenterYouthSession = ref({});
const inCenterYouthFamilySession = ref({});
const outCenterYouthSession = ref({});
const outCenterYouthFamilySession = ref({});
const youthAttendance = ref(0);
const youthFamilyAttendance = ref(0);
const inCenterOptions = ref([]);
const outCenterOptions = ref([]);
const sessionOptions = [
  { label: "1節", value: 1 },
  { label: "2節", value: 2 },
  { label: "3節", value: 3 },
];

// watch inCenterSession to update inCenterOptions
watch(inCenterSession, (newValue) => {
  inCenterOptions.value = [];
  for (let i = 0; i < newValue; i++) {
    inCenterOptions.value.push(sessionOptions[i]);
  }
  // loop through inCenterAttendanceList and remove those that exceed the new session
  Object.entries(inCenterAttendanceList.value).forEach(([c_mem_id, att]) => {
    if (newValue < att) {
      inCenterAttendanceList.value[c_mem_id] = 0;
    }
  });

  if (newValue < inCenterYouthSession.value) {
    inCenterYouthSession.value = 0;
  }
});

// watch outCenterSession to update outCenterOptions
watch(outCenterSession, (newValue) => {
  outCenterOptions.value = [];
  for (let i = 0; i < newValue; i++) {
    outCenterOptions.value.push(sessionOptions[i]);
  }
  // loop through outCenterAttendanceList and remove those that exceed the new session
  Object.entries(outCenterAttendanceList.value).forEach(([c_mem_id, att]) => {
    if (newValue < att) {
      outCenterAttendanceList.value[c_mem_id] = 0;
    }
  });

  if (newValue < outCenterYouthSession.value) {
    outCenterYouthSession.value = 0;
  }
});

// queries
const {
  result: attendanceResult,
  loading,
  message,
  addAttendance,
  delAttendance,
} = useAttendanceProvider({ c_act_code: c_act_code });

// get applicant list from provider
const { result: applicantResult, loading: loadApplicant } =
  useApplicantProvider({ c_act_code: c_act_code });

// display result message to user
watch(message, (newMessage) => {
  if (newMessage) {
    $q.notify({
      message: newMessage,
    });
  }
});

// update attendance list when event date or attendance result changes
watch(
  eventDate,
  (newEventDate) => {
    // initialize default values
    inCenterAttendanceList.value = {};
    outCenterAttendanceList.value = {};
    inCenterSession.value = 0;
    outCenterSession.value = 0;
    inCenterYouthSession.value = 0;
    inCenterYouthFamilySession.value = 0;
    outCenterYouthSession.value = 0;
    outCenterYouthFamilySession.value = 0;
    youthAttendance.value = 0;
    youthFamilyAttendance.value = 0;

    if (
      attendanceResult.value &&
      attendanceResult.value.AttendanceNonRegistrant &&
      attendanceResult.value.AttendanceNonRegistrant.filter(
        (attendance) =>
          qdate.formatDate(attendance.d_date, "YYYY-MM-DD") == newEventDate
      ).length > 0
    ) {
      if (
        attendanceResult.value.Attendance &&
        attendanceResult.value.Attendance.length > 0
      ) {
        attendanceResult.value.Attendance.forEach((att) => {
          if (qdate.formatDate(att.d_date, "YYYY-MM-DD") == newEventDate) {
            if (att.i_in_center_session) {
              inCenterAttendanceList.value[att.c_mem_id] =
                att.i_in_center_session;
            } else inCenterAttendanceList.value[att.c_mem_id] = 0;

            if (att.i_out_center_session) {
              outCenterAttendanceList.value[att.c_mem_id] =
                att.i_out_center_session;
            } else outCenterAttendanceList.value[att.c_mem_id] = 0;
          }
        });
      }

      if (attendanceResult.value.AttendanceNonRegistrant.length > 0) {
        let i = attendanceResult.value.AttendanceNonRegistrant.findIndex(
          (att) => qdate.formatDate(att.d_date, "YYYY-MM-DD") == newEventDate
        );
        if (i >= 0) {
          inCenterSession.value =
            attendanceResult.value.AttendanceNonRegistrant[
              i
            ].i_in_center_sessions;
          outCenterSession.value =
            attendanceResult.value.AttendanceNonRegistrant[
              i
            ].i_out_center_sessions;
          inCenterYouthSession.value =
            attendanceResult.value.AttendanceNonRegistrant[i].i_youth_session;
          inCenterYouthFamilySession.value =
            attendanceResult.value.AttendanceNonRegistrant[
              i
            ].i_youth_family_session;
          outCenterYouthSession.value =
            attendanceResult.value.AttendanceNonRegistrant[
              i
            ].i_youth_session_out_center;
          outCenterYouthFamilySession.value =
            attendanceResult.value.AttendanceNonRegistrant[
              i
            ].i_youth_family_session_out_center;
          youthAttendance.value =
            attendanceResult.value.AttendanceNonRegistrant[i].i_youth_count;
          youthFamilyAttendance.value =
            attendanceResult.value.AttendanceNonRegistrant[
              i
            ].i_youth_family_count;
        }
      }
    }
  },
  { immediate: true }
);

// update UI display when attendance result changes
watch(
  attendanceResult,
  (newResult) => {
    if (
      eventDate.value &&
      newResult &&
      newResult.Attendance &&
      newResult.AttendanceNonRegistrant
    ) {
      let i = newResult.AttendanceNonRegistrant.findIndex(
        (att) => qdate.formatDate(att.d_date, "YYYY-MM-DD") == eventDate.value
      );

      if (i >= 0) {
        // event related sessions
        inCenterSession.value =
          newResult.AttendanceNonRegistrant[i].i_in_center_sessions;
        outCenterSession.value =
          newResult.AttendanceNonRegistrant[i].i_out_center_sessions;
        inCenterYouthSession.value =
          newResult.AttendanceNonRegistrant[i].i_youth_session;
        inCenterYouthFamilySession.value =
          newResult.AttendanceNonRegistrant[i].i_youth_family_session;
        outCenterYouthSession.value =
          newResult.AttendanceNonRegistrant[i].i_youth_session_out_center;
        outCenterYouthFamilySession.value =
          newResult.AttendanceNonRegistrant[
            i
          ].i_youth_family_session_out_center;
        youthAttendance.value =
          newResult.AttendanceNonRegistrant[i].i_youth_count;
        youthFamilyAttendance.value =
          newResult.AttendanceNonRegistrant[i].i_youth_family_count;

        inCenterAttendanceList.value = {};
        outCenterAttendanceList.value = {};
      }

      // build up date options based on nonRegistrants
      newResult.AttendanceNonRegistrant.filter(
        (e) => e.c_act_code == c_act_code.value
      ).forEach((att) => {
        // add att.d_date to eventDates if not exist
        if (
          !eventDateOptions.value.includes(
            qdate.formatDate(att.d_date, "YYYY-MM-DD")
          )
        ) {
          eventDateOptions.value.push(
            qdate.formatDate(att.d_date, "YYYY-MM-DD")
          );
        }
      });

      // build up attendance list
      newResult.Attendance.forEach((att) => {
        if (qdate.formatDate(att.d_date, "YYYY-MM-DD") == eventDate.value) {
          if (att.i_in_center_session)
            inCenterAttendanceList.value[att.c_mem_id] =
              att.i_in_center_session;
          else inCenterAttendanceList.value[att.c_mem_id] = 0;

          if (att.i_out_center_session)
            outCenterAttendanceList.value[att.c_mem_id] =
              att.i_out_center_session;
          else outCenterAttendanceList.value[att.c_mem_id] = 0;
        }
      });
      // sort eventDateOptions in descending order
      eventDateOptions.value.sort(
        (a, b) =>
          qdate.extractDate(b, "YYYY-MM-DD") -
          qdate.extractDate(a, "YYYY-MM-DD")
      );
    }
  },
  { immediate: true }
);

// computed properties
const username = computed(() => $store.getters["userModule/getUsername"]);
const isCenterIC = computed(() => $store.getters["userModule/getCenterIC"]);
const isEventManagement = computed(
  () => $store.getters["userModule/getEventManagement"]
);
const buttonLabel = computed(() => {
  if (
    attendanceResult.value &&
    attendanceResult.value.AttendanceNonRegistrant &&
    attendanceResult.value.AttendanceNonRegistrant.filter(
      (attendance) =>
        qdate.formatDate(attendance.d_date, "YYYY-MM-DD") == eventDate.value
    ).length > 0
  ) {
    return "修改";
  } else {
    return "新增";
  }
});
// check if event date is before deadline
const addButtonDisabled = computed(
  () =>
    !(isCenterIC.value || isEventManagement.value) &&
    qdate.extractDate(eventDate.value, "YYYY-MM-DD") < deadline.value
);
const delButtonDisplay = computed(
  () =>
    attendanceResult.value &&
    attendanceResult.value.AttendanceNonRegistrant &&
    attendanceResult.value.AttendanceNonRegistrant.filter(
      (attendance) =>
        qdate.formatDate(attendance.d_date, "YYYY-MM-DD") == eventDate.value
    ).length > 0
);

const ApplicantsData = computed(() =>
  applicantResult.value
    ? applicantResult.value.sort(
        (a, b) => new Date(a.d_reg) - new Date(b.d_reg)
      )
    : []
);

const deadline = computed(() => {
  let d = qdate.addToDate(new Date(), { hours: 8 });
  if (d.getDate() > 10) return qdate.startOfDate(d, "month");
  else
    return qdate.startOfDate(qdate.subtractFromDate(d, { month: 1 }), "month");
});

// functions
function del() {
  // delete attendance
  delAttendance({
    username: username,
    c_act_code: c_act_code,
    d_date: ref(qdate.formatDate(eventDate.value, "YYYY-MM-DDTHH:mm:ss")),
  });
}

function save() {
  // check data validity
  if (
    youthAttendance.value > 0 &&
    inCenterYouthSession.value == 0 &&
    outCenterYouthSession.value == 0
  ) {
    $q.notify({
      message: "請輸入15-24歲青年出席節數！",
    });
    return;
  }

  if (
    youthFamilyAttendance.value > 0 &&
    inCenterYouthFamilySession.value == 0 &&
    outCenterYouthFamilySession.value == 0
  ) {
    $q.notify({
      message: "請輸入15-24歲青年家屬出席節數！",
    });
    return;
  }

  // build registrantsObjects
  let registrantsObjects = [];
  /** registrantsObjects data structure
    c_mem_id - nvarchar
    c_act_code- nvarchar
    d_date - smalldatetime
    c_name - nvarchar
    c_user_id - nvarchar
    d_updatetime - smalldatetime
    b_is_youth - bit
    i_in_center_session - smallint
    i_out_center_session - smallint
    b_is_youth_family - bit
  **/
  // loop through inCenterAttendanceList and add to registrantsObjects
  Object.keys(inCenterAttendanceList.value).forEach((c_mem_id) => {
    registrantsObjects.push({
      c_mem_id: c_mem_id,
      c_act_code: c_act_code.value,
      d_date: qdate.formatDate(eventDate.value, "YYYY-MM-DDTHH:mm:ss"),
      c_name: ApplicantsData.value.find((app) => app.c_mem_id == c_mem_id)
        .c_name,
      c_user_id: username.value,
      d_updatetime: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      b_is_youth: ApplicantsData.value
        .find((app) => app.c_mem_id == c_mem_id)
        .MemberData.isYouth(eventDate.value),
      i_in_center_session: inCenterAttendanceList.value[c_mem_id]
        ? parseInt(inCenterAttendanceList.value[c_mem_id])
        : 0,
      i_out_center_session: outCenterAttendanceList.value[c_mem_id]
        ? parseInt(outCenterAttendanceList.value[c_mem_id])
        : 0,
      b_is_youth_family: ApplicantsData.value
        .find((app) => app.c_mem_id == c_mem_id)
        .MemberData.isYouthFamilyAsOfDate(eventDate.value),
    });
  });

  // loop through outCenterAttendanceList and add to registrantsObjects
  Object.keys(outCenterAttendanceList.value).forEach((c_mem_id) => {
    let i = registrantsObjects.findIndex((obj) => obj.c_mem_id == c_mem_id);
    if (i < 0) {
      registrantsObjects.push({
        c_mem_id: c_mem_id,
        c_act_code: c_act_code.value,
        d_date: qdate.formatDate(eventDate.value, "YYYY-MM-DDTHH:mm:ss"),
        c_name: ApplicantsData.value.find((app) => app.c_mem_id == c_mem_id)
          .c_name,
        c_user_id: username.value,
        d_updatetime: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
        b_is_youth: ApplicantsData.value
          .find((app) => app.c_mem_id == c_mem_id)
          .MemberData.isYouth(eventDate.value),
        i_in_center_session: inCenterAttendanceList.value[c_mem_id]
          ? parseInt(inCenterAttendanceList.value[c_mem_id])
          : 0,
        i_out_center_session: outCenterAttendanceList.value[c_mem_id]
          ? parseInt(outCenterAttendanceList.value[c_mem_id])
          : 0,
        b_is_youth_family:
          ApplicantsData.value.find((app) => app.c_mem_id == c_mem_id)
            .MemberData.b_mem_type10 &&
          ApplicantsData.value.find((app) => app.c_mem_id == c_mem_id)
            .MemberData.b_mem_type10 != ""
            ? true
            : false,
      });
    } else {
      registrantsObjects[i].i_out_center_session =
        outCenterAttendanceList.value[c_mem_id];
    }
  });

  // build nonRegistrantsObjects
  let nonRegistrantsObjects = {};
  /** nonRegistrantsObjects data structure
    c_act_code - nvarchar
    d_date - smalldatetime
    c_updateuser - nvarchar
    d_updatetime - smalldatetime
    i_youth_session - smallint
    i_youth_family_session - smallint
    i_youth_count - smallint
    i_youth_family_count - smallint
  **/
  nonRegistrantsObjects = {
    c_act_code: c_act_code.value,
    d_date: qdate.formatDate(eventDate.value, "YYYY-MM-DDTHH:mm:ss"),
    c_updateuser: username.value,
    d_updatetime: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    i_youth_session: inCenterYouthSession.value
      ? parseInt(inCenterYouthSession.value)
      : 0,
    i_youth_session_out_center: outCenterYouthSession.value
      ? parseInt(outCenterYouthSession.value)
      : 0,
    i_youth_family_session: inCenterYouthFamilySession.value
      ? parseInt(inCenterYouthFamilySession.value)
      : 0,
    i_youth_family_session_out_center: outCenterYouthFamilySession.value
      ? parseInt(outCenterYouthFamilySession.value)
      : 0,
    i_youth_count: youthAttendance.value ? parseInt(youthAttendance.value) : 0,
    i_youth_family_count: youthFamilyAttendance.value
      ? parseInt(youthFamilyAttendance.value)
      : 0,
    i_in_center_sessions: inCenterSession.value
      ? parseInt(inCenterSession.value)
      : 0,
    i_out_center_sessions: outCenterSession.value
      ? parseInt(outCenterSession.value)
      : 0,
  };

  addAttendance({
    username: username,
    d_date: ref(qdate.formatDate(eventDate.value, "YYYY-MM-DDTHH:mm:ss")),
    registrantsObjects: ref(registrantsObjects),
    nonRegistrantsObjects: ref(nonRegistrantsObjects),
  });
}

function addDate(newValue, done) {
  // Handle the new value
  eventDateOptions.value.push(qdate.formatDate(newValue, "YYYY-MM-DD"));
  // Call done to update the model with the new value
  done(qdate.formatDate(newValue, "YYYY-MM-DD"));
}
</script>
