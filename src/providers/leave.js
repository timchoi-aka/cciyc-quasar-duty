import Duty from "components/class/duty";
import User from "components/class/user";
import { ref, computed, watch } from "vue";
import { date } from "quasar";
import { leaveConfig, scheduleCollection } from "boot/firebase";
import { getDoc, getDocs, where, query, doc } from "firebase/firestore";

// retrieve duty of all PermUsers between startDate and endDate
export function useAnnualLeaveProvider(options = {}) {
  const { queryEndDate = ref(), userid = ref() } = options;

  const awaitServer = ref(0);
  const systemStartData = ref();
  const tiersConfig = [0, 5, 8, 10, 12];
  const leaveConfigDoc = ref();

  // const loading = ref(false);
  const loading = computed(() => awaitServer.value > 0);

  const queryResult = ref([]);
  const user = ref();
  const result = computed(() => {
    let res = [];
    // build AL history
    let systemStartDate = date.startOfDate(new Date(2021, 3, 1), "month");
    // systemStart at 1/4/2021
    let monthLoop = systemStartDate;

    // push carry over data before system start
    res.push({
      date: date.subtractFromDate(date.startOfDate(systemStartDate, "month"), {
        month: 1,
      }),
      monthlyRecord: [],
      alGain: 0,
      alTaken: 0,
      balance: systemStartData.value ? systemStartData.value.al : 0,
    });
    // build month array
    while (monthLoop <= queryEndDate.value) {
      if (!user.value) break;

      const { isValidEmployment, status } =
        user.value.getEmploymentStatus(monthLoop);

      // get tierIndex
      let tierIndex = tiersConfig.reduce((acc, curr, i, arr) => {
        return curr <= status.yearServed &&
          (i === arr.length - 1 || arr[i + 1] > status.yearServed)
          ? i
          : acc;
      }, -1);

      // only get alGain if work for a full month at the dateOfExit
      // no gain if end of employment is less than 1 full month
      let alGain = 0;

      if (leaveConfigDoc.value && status.rank) {
        const sortedTiers = Object.entries(
          leaveConfigDoc.value[status.rank]
        ).sort((a, b) => a[0].localeCompare(b[0]));

        if (
          (isValidEmployment && tierIndex >= 0 && !status.dateOfExit) ||
          date.getDateDiff(status.dateOfExit, monthLoop) >=
            date.daysInMonth(monthLoop)
        ) {
          alGain = sortedTiers[tierIndex][1] / 12;
        }
      }

      res.push({
        date: date.startOfDate(monthLoop, "month"),
        monthlyRecord: [],
        alGain: alGain,
      });

      monthLoop = date.addToDate(monthLoop, { month: 1 });
    }

    // add leave record to month array
    queryResult.value.forEach((leave) => {
      let index = res.findIndex((x) =>
        date.isSameDate(x.date, date.startOfDate(leave.date, "month"))
      );

      if (index >= 0) {
        res[index].monthlyRecord.push({
          date: leave.date,
          slot: leave.slot,
        });
      }
    });

    // set alTaken
    res.forEach((month) => {
      month.alTaken = month.monthlyRecord.length / 2;
    });

    // set balance
    for (let i = 1; i < res.length; i++) {
      res[i].balance = res[i - 1].balance + res[i].alGain - res[i].alTaken;
    }

    return res;
  });

  async function execute() {
    if (!userid.value) return;
    queryResult.value = [];

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
    leaveConfigDoc.value = await leaveConfigData.data();
    systemStartData.value = leaveConfigDoc.value[user.value.uid][0];

    // load schedules to result
    alScheduleDocs.forEach((alScheduleDoc) => {
      let alSchedule = alScheduleDoc.data();
      alSchedule.date = alSchedule.date.toDate();
      queryResult.value.push(alSchedule);
    });

    awaitServer.value--;
  }

  execute();

  return { result, user, loading, refetch: execute };
}
