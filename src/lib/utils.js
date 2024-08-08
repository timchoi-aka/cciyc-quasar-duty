import { date as qdate } from "quasar";
import { unref } from "vue";

function calculateAge(dob, targetDate) {
  if (qdate.isValid(dob)) {
    let d = unref(targetDate);
    let now = qdate.isValid(d)
      ? qdate.extractDate(d, "YYYY/MM/DD")
      : new Date();
    let birth = new Date(dob);
    let birthyear = birth.getFullYear();
    birth = qdate.adjustDate(birth, { year: now.getFullYear() });
    let offset = qdate.getDateDiff(now, birth, "days") < 0 ? -1 : 0;

    if (birthyear == now.getFullYear()) {
      return 0;
    } else {
      return qdate.getDateDiff(now, dob, "years") + offset;
    }
  }
}

function getObjectDifference(obj1, obj2) {
  let diff = {};

  // Check for differences in obj1 compared to obj2
  for (let key in obj1) {
    if (obj1.hasOwnProperty(key) && obj1[key] !== obj2[key]) {
      diff[key] = { obj1: obj1[key], obj2: obj2[key] };
    }
  }

  // Check for keys in obj2 that are not in obj1
  for (let key in obj2) {
    if (obj2.hasOwnProperty(key) && !(key in obj1)) {
      diff[key] = { obj1: undefined, obj2: obj2[key] };
    }
  }

  return diff;
}

export default { calculateAge, getObjectDifference };
