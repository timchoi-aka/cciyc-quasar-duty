<template>
  <!-- Main container -->
  <LoadingDialog
    :model-value="loading || loadApplicant ? 1 : 0"
    message="處理中"
  />
  <div class="row items-center q-pa-md">
    <div v-if="debug" class="row col-12">
      <div class="col-12">attendanceResult: {{ attendanceResult }}</div>
      <div class="col-12">original: {{ originalAttendanceList }}</div>
      <div class="col-12">attendanceList: {{ attendanceList }}</div>
      <div class="col-12">
        inCenterAttendanceList {{ inCenterAttendanceList }}
      </div>
      <div class="col-12">
        outCenterAttendanceList {{ outCenterAttendanceList }}
      </div>
      <div class="col-12">inCentreSession {{ inCenterSession }}</div>
      <div class="col-12">outCenterSession {{ outCenterSession }}</div>
      <div class="col-12">inCenterYouthSession{{ inCenterYouthSession }}</div>
      <div class="col-12">
        inCenterYouthFamilySession {{ inCenterYouthFamilySession }}
      </div>
      <div class="col-12">youthAttendance {{ youthAttendance }}</div>
      <div class="col-12">
        youthFamilyAttendance {{ youthFamilyAttendance }}
      </div>
      <div class="col-12">ApplicantsData {{ ApplicantsData }}</div>
    </div>
    <!-- Event date selection -->
    <div class="col-md-3 col-sm-6 col-xs-6 row">
      <div class="text-h6 col-grow">活動點名日期</div>
      <q-select
        use-input
        new-value-mode="add-unique"
        v-model="eventDate"
        @new-value="addDate"
        :options="eventDateOptions"
        class="col-auto text-h6"
      >
        <!-- Date picker icon and popup -->
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
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
          </q-icon>
        </template>
      </q-select>
      <!--
      <q-input
        type="number"
        v-model="session"
        label="活動節數"
        class="col-auto text-h6"
      />
      -->
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
          color="amber"
          v-if="app.MemberData.isYouth(eventDate)"
          label="青年" /><q-chip
          color="blue-3"
          v-if="app.MemberData.b_mem_type10"
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
        color="purple-1"
        toggle-color="purple-7"
        text-color="black"
        clearable
        v-model="inCenterYouthSession"
        :options="inCenterOptions"
      />
    </div>
    <!--
    <div class="col-xs-2 col-sm-2 col-md-2 row justify-center">
      <q-btn-toggle
        color="purple-1"
        toggle-color="purple-7"
        text-color="black"
        clearable
        v-model="outCenterYouthSession"
        :options="outCenterOptions"
      />
    </div>-->
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
        color="orange-1"
        toggle-color="orange-7"
        text-color="black"
        clearable
        v-model="inCenterYouthFamilySession"
        :options="inCenterOptions"
      />
    </div>
    <!--
    <div class="col-xs-2 col-sm-2 col-md-2 row justify-center">
      <q-btn-toggle
        color="orange-1"
        toggle-color="orange-7"
        text-color="black"
        clearable
        v-model="outCenterYouthFamilySession"
        :options="outCenterOptions"
      />
    </div>-->
  </div>

  <div class="q-pa-md">
    <q-btn label="提交" class="bg-positive text-white" @click="save" flat />
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useStore } from "vuex";
import { date as qdate, useQuasar, is } from "quasar";
import { useAttendanceProvider } from "src/providers/attendance";
import { useApplicantProvider } from "src/providers/applicant";
import { useRoute } from "vue-router";
import LoadingDialog from "components/LoadingDialog.vue";

// variables
const debug = ref(false);
const route = useRoute();
const c_act_code = ref(route.params.id);
const $q = useQuasar();
const $store = useStore();
const attendanceList = ref({});
const originalAttendanceList = ref({});
const eventDateOptions = ref([]);
const eventDate = ref(qdate.formatDate(new Date(), "YYYY-MM-DD"));
const inCenterSession = ref();
const outCenterSession = ref();
const inCenterAttendanceList = ref({});
const outCenterAttendanceList = ref({});
const inCenterYouthSession = ref({});
const inCenterYouthFamilySession = ref({});
const youthAttendance = ref(0);
const youthFamilyAttendance = ref(0);
const inCenterOptions = ref([]);
const outCenterOptions = ref([]);
const sessionOptions = [
  { label: "1節", value: 1 },
  { label: "2節", value: 2 },
  { label: "3節", value: 3 },
];

watch(inCenterSession, (newValue) => {
  inCenterOptions.value = [];
  for (let i = 0; i < newValue; i++) {
    inCenterOptions.value.push(sessionOptions[i]);
  }
  // loop through inCenterAttendanceList and remove those that exceed the new session
  Object.entries(inCenterAttendanceList.value).forEach(([c_mem_id, att]) => {
    if (newValue < att) {
      delete inCenterAttendanceList.value[c_mem_id];
    }
  });
});

watch(outCenterSession, (newValue) => {
  outCenterOptions.value = [];
  for (let i = 0; i < newValue; i++) {
    outCenterOptions.value.push(sessionOptions[i]);
  }
  // loop through outCenterAttendanceList and remove those that exceed the new session
  Object.entries(outCenterAttendanceList.value).forEach(([c_mem_id, att]) => {
    if (newValue < att) {
      delete outCenterAttendanceList.value[c_mem_id];
    }
  });
});

// queries
const {
  result: attendanceResult,
  loading,
  message,
  addAttendance,
} = useAttendanceProvider({ c_act_code: c_act_code });

const { result: applicantResult, loading: loadApplicant } =
  useApplicantProvider({ c_act_code: c_act_code });

const ApplicantsData = computed(() =>
  applicantResult.value
    ? applicantResult.value.sort((a, b) => a.c_mem_id - b.c_mem_id)
    : []
);

// display result message
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
    youthAttendance.value = 0;
    youthFamilyAttendance.value = 0;

    if (
      attendanceResult.value &&
      attendanceResult.value.Attendance &&
      attendanceResult.value.Attendance.filter(
        (attendance) =>
          qdate.formatDate(attendance.d_date, "YYYY-MM-DD") == newEventDate
      ).length > 0
    ) {
      if (attendanceResult.value.Attendance) {
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
        youthAttendance.value =
          newResult.AttendanceNonRegistrant[i].i_youth_count;
        youthFamilyAttendance.value =
          newResult.AttendanceNonRegistrant[i].i_youth_family_count;

        inCenterAttendanceList.value = {};
        outCenterAttendanceList.value = {};
      }

      // build up date options and attendance lists
      newResult.Attendance.forEach((att) => {
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
      // sort eventDateOptions in ascending order
      eventDateOptions.value.sort(
        (a, b) =>
          qdate.extractDate(a, "YYYY-MM-DD") -
          qdate.extractDate(b, "YYYY-MM-DD")
      );
    }
  },
  { immediate: true }
);

// computed
const username = computed(() => $store.getters["userModule/getUsername"]);

// functions
function save() {
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
      b_is_youth_family:
        ApplicantsData.value.find((app) => app.c_mem_id == c_mem_id).MemberData
          .b_mem_type10 &&
        ApplicantsData.value.find((app) => app.c_mem_id == c_mem_id).MemberData
          .b_mem_type10 != ""
          ? true
          : false,
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
    i_youth_family_session: inCenterYouthFamilySession.value
      ? parseInt(inCenterYouthFamilySession.value)
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
