const formatDate = (date, delim, format) => {
  const d = new Date(date);
  const month = "" + (d.getMonth() + 1);
  let day = "" + d.getDate();
  const year = d.getFullYear();
  let twoDigitMonth;

  if (month.length < 2) {
    twoDigitMonth = "0" + month;
  } else {
    twoDigitMonth = month;
  }

  if (day.length < 2) day = "0" + day;

  if (format == "YYYYMMDD") return [year, twoDigitMonth, day].join(delim);

  if (format === "MDDYYYY") return [month, day, year].join(delim);

  if (format === "DDMMYYYY") return [day + "/" + twoDigitMonth + "/" + year];
};


const formatDateTime = (date) => {
  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);
  const hours = `0${date.getHours()+8}`.slice(-2);
  const minutes = `0${date.getMinutes()}`.slice(-2);
  const seconds = `0${date.getSeconds()}`.slice(-2);
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

module.exports = {formatDate, formatDateTime};
