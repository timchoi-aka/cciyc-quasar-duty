import Duty from "components/class/duty";
import User from "components/class/user";
import { ref, computed, watch } from "vue";
import { date } from "quasar";
import { leaveConfig, scheduleCollection } from "boot/firebase";
import { getDoc, getDocs, where, query, doc } from "firebase/firestore";

// retrieve duty of all PermUsers between startDate and endDate
export function useAnnualLeaveProvider(options = {}) {
  const awaitServer = ref(0);
  const systemStart = date.startOfDate(new Date(2021, 3, 1), "month");
  const tiersConfig = [0, 5, 8, 10, 12];

  // const loading = ref(false);
  const loading = computed(() => awaitServer.value > 0);
  const {
    queryStartDate = ref(),
    queryEndDate = ref(),
    userid = ref(),
  } = options;

  watch(userid, () => execute());

  const result = ref([]);
  const user = ref({});
  const history = ref([]);

  async function execute() {
    result.value = [];
    history.value = [];

    // load server data
    awaitServer.value++;

    user.value = await User.loadUserByID(userid.value);
    // queries
    const alScheduleQuery = query(
      scheduleCollection,
      where("uid", "==", user.value.uid),
      where("type", "==", "AL")
    );
    const alScheduleDocs = await getDocs(alScheduleQuery);
    const leaveConfigData = await getDoc(leaveConfig);

    // sort tiers
    let sortedTiers = Object.entries(
      leaveConfigData.data()[user.value.rank]
    ).sort((a, b) => a[0].localeCompare(b[0]));

    // load schedules to result

    alScheduleDocs.forEach((alScheduleDoc) => {
      let alSchedule = alScheduleDoc.data();
      alSchedule.date = alSchedule.date.toDate();
      result.value.push(alSchedule);
    });

    // build AL history

    let monthLoop = systemStart;

    // build month array
    while (monthLoop <= queryEndDate.value) {
      let tierIndex = tiersConfig.reduce((acc, curr, i, arr) => {
        return curr <= user.value.yearServed(monthLoop) &&
          (i === arr.length - 1 ||
            arr[i + 1] > user.value.yearServed(monthLoop))
          ? i
          : acc;
      }, -1);

      history.value.push({
        date: date.formatDate(monthLoop, "MM/YYYY"),
        monthlyRecord: [],
        alGain: sortedTiers[tierIndex][1] / 12,
      });
      monthLoop = date.addToDate(monthLoop, { month: 1 });
    }

    // add leave record to month array
    result.value.forEach((leave) => {
      let index = history.value.findIndex(
        (x) => x.date == date.formatDate(leave.date, "MM/YYYY")
      );

      if (index >= 0) {
        history.value[index].monthlyRecord.push({
          date: leave.date,
          slot: leave.slot,
        });
      }
    });

    // set alTaken
    history.value.forEach((month) => {
      month.alTaken = month.monthlyRecord.length / 2;
    });

    awaitServer.value--;
    console.log(history.value);
  }

  execute();

  return { result, user, history, loading, refetch: execute };
}
