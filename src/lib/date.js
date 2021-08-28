function formatDate(date, delim, format) {
  const d = new Date(Date.parse(date));
  const month = "" + (d.getMonth() + 1);
  let day = "" + d.getDate();
  const year = d.getFullYear();
  let twoDigitMonth;

  if (month.length < 2) twoDigitMonth = "0" + month;
  else twoDigitMonth = month;
  if (day.length < 2) day = "0" + day;

  if (format == "月日") return month + "月" + day + "日";
  if (format == "年月日") return year + "年" + month + "月" + day + "日";
  if (format == "YYYYMMDD") return [year, twoDigitMonth, day].join(delim);

  if (format === "MDDYYYY") return [month, day, year].join(delim);

  if (format === "DDMMYYYY") return [day, twoDigitMonth, year].join(delim);
}

function daysOfWeek(date) {
  let week = ["日", "一", "二", "三", "四", "五", "六"];
  let d = new Date(Date.parse(date));
  let result = "(" + week[d.getDay()] + ")";
  return result;
}

function mergeDateSlot(date, slot) {
  return this.formatDate(date, "-", "YYYYMMDD") + "|" + slot;
}

function splitDateSlot(dateslot) {
  let s = new String(dateslot)
  return s.split("|");
}

export default {
  formatDate,
  daysOfWeek,
  mergeDateSlot,
  splitDateSlot,
}
