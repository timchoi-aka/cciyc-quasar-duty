import { date as qdate } from "quasar"
import { unref } from "vue"

function calculateAge(dob, targetDate) {
  if (qdate.isValid(dob)) {
    let d = unref(targetDate)
    let now = qdate.isValid(d)? qdate.extractDate(d, 'YYYY/MM/DD'): new Date();
    let birth = new Date(dob);
    let birthyear = birth.getFullYear();
    birth = qdate.adjustDate(birth, {year: now.getFullYear()})
    let offset = qdate.getDateDiff(now, birth, "days") < 0? -1: 0

    if (birthyear == now.getFullYear()) {
      return 0
    } else {
      return qdate.getDateDiff(now, dob, "years") + offset;
    }
  }
}

  export default { calculateAge };
