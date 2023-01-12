import { date as qdate } from 'quasar'

function daysOfWeek(date) {
  let week = ["日", "一", "二", "三", "四", "五", "六"];
  let d = new Date(Date.parse(date));
  let result = "(" + week[d.getDay()] + ")";
  return result;
}

function mergeDateSlot(date, slot) {
  return qdate.formatDate(date, "YYYY-MM-DD") + "|" + slot;
}

function splitDateSlot(dateslot) {
  let s = new String(dateslot)
  return s.split("|");
}

function tConvert(time) {
  // Check correct time format and split into components
  time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
  
  if (time.length > 1) { // If time format correct
    time = time.slice (1);  // Remove full string match value
    time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
    time[0] = +time[0] % 12 || 12; // Adjust hours
  }
  return time.join (''); // return adjusted time or original string
}

function generateTableColumns(renderDate, withSlot = true) {
  // build column headers
  // find offset to sunday
  let columns = [];
  let d = new Date(renderDate)

  var diff = 0 - d.getDay();

  const slot = ["slot_a", "slot_b", "slot_c"];

  // fill up this week's dates
  for (let i = 0; i < 7; i++) {
    let day = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate() + diff + i,
      0,
      0,
      0
    );

    if (i == 6) day.setTime(day.getTime() + 82800000 + 3540000 + 59000); // adjust last date to 23:59:59

    if (withSlot) {
      for (let j = 0; j < 3; j++) {
        columns.push({
          name: mergeDateSlot(day, slot[j]),
          label: mergeDateSlot(day, slot[j]),
          field: mergeDateSlot(day, slot[j]),
        });
      }
    } else {
      columns.push({
        name: qdate.formatDate(day, "YYYY-MM-DD"),
        label: qdate.formatDate(day, "YYYY-MM-DD"),
        field: qdate.formatDate(day, "YYYY-MM-DD"),
      });
    }
  }
  return columns
}

export default {
  formatDate,
  daysOfWeek,
  mergeDateSlot,
  splitDateSlot,
  tConvert,
  generateTableColumns
}
