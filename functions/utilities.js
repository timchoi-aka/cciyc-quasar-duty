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

  if (format == "YYYYMMDD") return [year + twoDigitMonth + day].join(delim);

  if (format === "MDDYYYY") return [month + day + year].join(delim);

  if (format === "DDMMYYYY") return [day + "/" + twoDigitMonth + "/" + year];
};

module.exports = {formatDate};
