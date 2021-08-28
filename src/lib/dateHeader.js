import dateHeader from 'src/lib/date.js'

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
          name: dateHeader.mergeDateSlot(day, slot[j]),
          label: dateHeader.mergeDateSlot(day, slot[j]),
          field: dateHeader.mergeDateSlot(day, slot[j]),
        });
      }
    } else {
      columns.push({
        name: dateHeader.formatDate(day, "-", "YYYYMMDD"),
        label: dateHeader.formatDate(day, "-", "YYYYMMDD"),
        field: dateHeader.formatDate(day, "-", "YYYYMMDD"),
      });
    }
  }
  return columns
}

export default {
  generateTableColumns,
}
