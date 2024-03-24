import Duty from "components/class/duty";
import User from "components/class/user";
import { ref, computed, onUnmounted } from "vue";

// retrieve duty of all PermUsers between startDate and endDate
export function useDutyProvider(options = {}) {
  const loadingCounter = ref(0);
  // const loading = ref(false);
  const loading = computed(() => loadingCounter.value > 0);
  const {
    queryStartDate = ref(),
    queryEndDate = ref(),
    pollInterval = ref(),
  } = options;
  const userList = ref([]);
  const result = ref([]);
  const intervalId = ref();

  onUnmounted(() => {
    if (intervalId.value) clearInterval(intervalId.value);
  });

  async function refetch() {
    if (queryStartDate.value && queryEndDate.value) {
      loadingCounter.value++;

      if (userList.value.length == 0)
        userList.value = await User.loadPermUsers();
      for (let user in userList.value) {
        if (
          userList.value[user].isValidEmployment(queryStartDate.value) ||
          userList.value[user].isValidEmployment(queryEndDate.value)
        ) {
          // load the duty of each user and generate desired result
          let duty = new Duty({
            uid: userList.value[user].uid,
            name: userList.value[user].name,
            defaultSchedule: userList.value[user].defaultSchedule,
          });

          duty
            .loadDuty(queryStartDate.value, queryEndDate.value)
            .then((response) => {
              let i = result.value.findIndex(
                (element) => element.uid == userList.value[user].uid
              );
              if (i >= 0) {
                if (result.value[i] != duty) result.value[i] = duty;
              } else result.value.push(duty);
              loadingCounter.value--;
            });
        }
      }
    }
  }

  // auto refetch if pollInterval is set
  if (pollInterval > 0) {
    refetch();
    intervalId.value = setInterval(() => {
      refetch();
    }, pollInterval);
  } else {
    refetch();
  }

  // payload format { uid (String), date (String), slot (String), type (String) }
  async function updateDutySchedule(payload) {
    loadingCounter.value++;
    return Promise.resolve(
      Duty.updateSchedule(payload)
        .then((response) => {
          refetch();
          loadingCounter.value--;
        })
        .catch((error) => {
          console.log(error.message);
        })
    );
  }

  return { result, loading, refetch, updateDutySchedule };
}

export function useDutyConsumer(options) {
  const loading = ref(false);
  const {
    queryStartDate = ref(),
    queryEndDate = ref(),
    pollInterval = ref(),
  } = options;
  const userList = ref([]);
  const result = ref([]);
  const intervalId = ref();

  async function refetch() {
    if (queryStartDate.value && queryEndDate.value) {
      loading.value = true;

      if (userList.value.length == 0)
        userList.value = await User.loadPermUsers();
      for (let user in userList.value) {
        if (
          userList.value[user].isValidEmployment(queryStartDate.value) ||
          userList.value[user].isValidEmployment(queryEndDate.value)
        ) {
          // load the duty of each user and generate desired result
          let duty = new Duty({
            uid: userList.value[user].uid,
            name: userList.value[user].name,
            defaultSchedule: userList.value[user].defaultSchedule,
          });

          await duty.loadDuty(queryStartDate.value, queryEndDate.value);
          let i = result.value.findIndex(
            (element) => element.uid == userList.value[user].uid
          );
          if (i >= 0) {
            if (result.value[i] != duty) result.value[i] = duty;
          } else result.value.push(duty);
        }
      }

      loading.value = false;
    }
  }

  // auto refetch if pollInterval is set
  if (pollInterval > 0) {
    refetch();
    intervalId.value = setInterval(() => {
      refetch();
    }, pollInterval);
  } else {
    refetch();
  }

  return { result, loading, refetch };
}
