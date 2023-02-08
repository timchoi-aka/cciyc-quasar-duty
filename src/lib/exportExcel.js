// export to xls functions
// mime type [xls, csv]
const type = "xls"

// Json to download
const data = null
    
// fields inside the Json Object that you want to export
// if no given, all the properties in the Json are exported
const fields = () => null
    
// this prop is used to fix the problem with other components that use the
// variable fields, like vee-validate. exportFields works exactly like fields
const exportFields = () => null

// Use as fallback when the row has no field values
const defaultValue = ""

// Title(s) for the data, could be a string or an array of strings (multiple titles)
const header = null

// Footer(s) for the data, could be a string or an array of strings (multiple footers)
const footer = null

// filename to export
const name = "data.xls"
 
const meta = () => []
 
const worksheet = "Sheet1"
    
// Determine if CSV Data should be escaped
const escapeCsv = true

// long number stringify
const stringifyLongNum = true

function jsonToXLS(data, columns) {
  let xlsTemp =
    '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta name=ProgId content=Excel.Sheet> <meta name=Generator content="Microsoft Excel 11"><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><style>br {mso-data-placement: same-cell;}</style></head><body><table>${table}</table></body></html>';
  let xlsData = "<thead>";
  const colspan = Object.keys(data[0]).length;
  //Header
  if (header) {
    xlsData += parseExtraData(
      header,
      '<tr><th colspan="' + colspan + '">${data}</th></tr>'
    );
  }
  
  //Fields
  xlsData += "<tr>";
  let tableHeader = columns.map(col => wrapCsvValue(col.label))
  for (let key of tableHeader) {
    xlsData += "<th>" + key + "</th>";
  }
  xlsData += "</tr>";
  xlsData += "</thead>";
  
  //Data
  xlsData += "<tbody>";
  let tableFieldData = data.map(row => columns.map(col => wrapCsvValue(
                        typeof col.field === 'function'
                          ? col.field(row)
                          : row[ col.field === void 0 ? col.name : col.field ],
                        col.format,
                        row
                      )))
  
  
  for (const row of tableFieldData) {
    xlsData += "<tr>"
    for (const item of row) {
      xlsData +=
        "<td>" +
        preprocessLongNum(
          valueReformattedForMultilines(item)
        ) +
        "</td>";
    }
    xlsData += "</tr>";
  }
  xlsData += "</tbody>";
  
  //Footer
  if (footer != null) {
    xlsData += "<tfoot>";
    xlsData += parseExtraData(
      footer,
      '<tr><td colspan="' + colspan + '">${data}</td></tr>'
    );
    xlsData += "</tfoot>";
  }
  
  return xlsTemp
    .replace("${table}", xlsData)
    .replace("${worksheet}", worksheet);
}
 
/*
jsonToCSV
---------------
Transform json data into an CSV file.
*/
function jsonToCSV(data) {
  var csvData = [];
  //Header
  // const header = this.header || this.$attrs.title;
  if (header) {
    csvData.push(parseExtraData(header, "${data}\r\n"));
  }
  //Fields
  for (let key in data[0]) {
    csvData.push(key);
    csvData.push(",");
  }
  csvData.pop();
  csvData.push("\r\n");
  //Data
  data.map(function (item) {
    for (let key in item) {
      let escapedCSV = item[key] + "";
      // Escaped CSV data to string to avoid problems with numbers or other types of values
      // this is controlled by the prop escapeCsv
      if (escapeCsv) {
        escapedCSV = '="' + escapedCSV + '"'; // cast Numbers to string
        if (escapedCSV.match(/[,"\n]/)) {
          escapedCSV = '"' + escapedCSV.replace(/\"/g, '""') + '"';
        }
      }
      csvData.push(escapedCSV);
      csvData.push(",");
    }
    csvData.pop();
    csvData.push("\r\n");
  });
  //Footer
  if (footer != null) {
    csvData.push(parseExtraData(footer, "${data}\r\n"));
  }
  return csvData.join("");
}

/*
getProcessedJson
---------------
Get only the data to export, if no fields are set return all the data
*/
function getProcessedJson(data, header) {
  let keys = getKeys(data, header);
  let newData = [];
  data.map(function (item, index) {
    let newItem = {};
    for (let label in keys) {
      let property = keys[label];
      newItem[label] = getValue(property, item);
    }
    newData.push(newItem);
  });
  return newData;
}

function getKeys(data, header) {
  if (header) {
    return header;
  }
  let keys = {};
  for (let key in data[0]) {
    keys[key] = key;
  }
  return keys;
}

/*
parseExtraData
---------------
Parse title and footer attribute to the csv format
*/
function parseExtraData(extraData, format) {
  let parseData = "";
  if (Array.isArray(extraData)) {
    for (var i = 0; i < extraData.length; i++) {
      if (extraData[i])
        parseData += format.replace("${data}", extraData[i]);
    }
  } else {
    parseData += format.replace("${data}", extraData);
  }
  return parseData;
}

function getValue(key, item) {
  const field = typeof key !== "object" ? key : key.field;
  let indexes = typeof field !== "string" ? [] : field.split(".");
  let value = defaultValue;
  if (!field) value = item;
  else if (indexes.length > 1)
    value = getValueFromNestedItem(item, indexes);
  else value = parseValue(item[field]);
  if (key.hasOwnProperty("callback"))
    value = getValueFromCallback(value, key.callback);
  return value;
}

/*
convert values with newline \n characters into <br/>
*/
function valueReformattedForMultilines(value) {
  if (typeof value == "string") return value.replace(/\n/gi, "<br/>");
  else return value;
}

function preprocessLongNum(value) {
  if (stringifyLongNum) {
    if (String(value).startsWith("0x")) {
      return value;
    }
    if (!isNaN(value) && value != "") {
      if (value > 99999999999 || value < 0.0000000000001) {
        return '="' + value + '"';
      }
    }
  }
  return value;
}
    
function getValueFromNestedItem(item, indexes) {
  let nestedItem = item;
  for (let index of indexes) {
    if (nestedItem) nestedItem = nestedItem[index];
  }
  return parseValue(nestedItem);
}
  
function getValueFromCallback(item, callback) {
  if (typeof callback !== "function") return defaultValue;
  const value = callback(item);
  return parseValue(value);
}
   
function parseValue(value) {
  return value || value === 0 || typeof value === "boolean"
    ? value
    : defaultValue;
}

function base64ToBlob(data, mime) {
  let base64 = window.btoa(window.unescape(encodeURIComponent(data)));
  let bstr = atob(base64);
  let n = bstr.length;
  let u8arr = new Uint8ClampedArray(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

function wrapCsvValue (val, formatFn, row) {
  let formatted = formatFn !== void 0
    ? formatFn(val, row)
    : val

  formatted = formatted === void 0 || formatted === null
    ? ''
    : String(formatted)

  formatted = formatted.split('"').join('""')
  /**
   * Excel accepts \n and \r in strings, but some other CSV parsers do not
   * Uncomment the next two lines to escape new lines
   */
  // .split('\n').join('\\n')
  // .split('\r').join('\\r')

  //return `"${formatted}"`
  return `${formatted}`
}

export default {
  jsonToXLS,
  jsonToCSV,
  getProcessedJson
}