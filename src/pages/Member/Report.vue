<template>
  <!-- loading dialog -->
  <q-dialog v-model="loading" position="bottom">
    <LoadingDialog message="處理中"/>
  </q-dialog>

  <!-- rowDetail modal -->
  <q-dialog v-if="$q.screen.lt.md"
    v-model="detailModal"
    persistent
    maximized
    full-width
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <MemberDetail v-model="showMemberID"/>
  </q-dialog>

  <q-dialog v-else
    v-model="detailModal"
    persistent
    full-height
    transition-show="slide-up"
    transition-hide="slide-down"
    class="q-pa-none"
  >
    <q-card style="min-width: 70vw; width: 70vw; max-width: 70vw;">
      <MemberDetail v-model="showMemberID"/>
    </q-card>
  </q-dialog>
  <div class="row justify-center">
    
    <div class="row items-center q-mx-md"><q-btn label="上月" @click="reportDate = qdate.formatDate(qdate.endOfDate(qdate.subtractFromDate(reportDate, {month: 1}), 'month'), 'YYYY/MM/DD')" class="bg-primary text-white items-center"/></div>
    
    <div>
      <q-input filled v-model="reportDate" mask="date" :rules="['date']">
        <template v-slot:prepend>
          截數月份：
        </template>
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="reportDate">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="關閉" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>
    
    <div class="row items-center q-mx-md"><q-btn label="下月" @click="reportDate = qdate.formatDate(qdate.endOfDate(qdate.addToDate(reportDate, {month: 1}), 'month'), 'YYYY/MM/DD')" class="bg-primary text-white items-center"/></div>
  </div>
  
  
  <!--<q-date v-model="reportDate" default-view="Months"/>-->
  <q-tabs v-model="activeTab" inline-label align="left" class="desktop-only bg-primary text-white">
    <q-tab name="All" icon="source" :label="'全部('+MemberData.length+'人)'" />
    <q-tab name="Youth" icon="pin_drop" :label="'青年('+YouthData.length+'人)'" />
    <q-tab name="Family_15" icon="pin_drop" :label="'家人(<15)('+Family_15Data.length+'人)'" />
    <q-tab name="Family_24" icon="pin_drop" :label="'家人(>24)('+Family_24Data.length+'人)'" />
    <q-tab name="Quit" icon="pin_drop" :label="'退會('+QuitData.length+'人)'" />
    <q-tab name="Expired" icon="pin_drop" :label="'過期('+ExpiredData.length+'人)'" />
    <q-tab name="Error" icon="error" :label="'錯誤('+ErrorData.length+'人)'" />
  </q-tabs>

  <q-tab-panels
    v-model="activeTab"
    animated
    swipeable
    transition-prev="jump-up"
    transition-next="jump-up"
  >
    <q-tab-panel name="All" class="q-ma-none q-pa-sm text-body1"> 
      <q-table
        dense
        flat
        title="全部會員數據"
        :rows="MemberData"
        :columns="memberListColumns"
        :pagination="defaultPagination"
        color="primary"
        row-key="c_mem_id"
        :loading="loading"
        binary-state-sort
        @row-click="rowDetail"
      >
        <template v-slot:top-right>
          <q-btn
            color="primary"
            icon-right="archive"
            label="匯出Excel"
            no-caps
            @click="exportExcel(MemberData)"
          />
          <!--
          <q-btn
            color="primary"
            icon-right="archive"
            label="下載CSV"
            no-caps
            @click="exportTable(MemberData)"
          />-->
        </template>
      </q-table>
    </q-tab-panel>

    <q-tab-panel name="Quit" class="q-ma-none q-pa-sm text-body1"> 
      <q-table
        dense
        flat
        title="退會會員數據"
        :rows="QuitData"
        :columns="memberListColumns"
        :pagination="defaultPagination"
        color="primary"
        row-key="c_mem_id"
        :loading="loading"
        binary-state-sort
        @row-click="rowDetail"
      >
        <template v-slot:top-right>
          <q-btn
            color="primary"
            icon-right="archive"
            label="匯出Excel"
            no-caps
            @click="exportExcel(QuitData)"
          />
        </template>
      </q-table>
    </q-tab-panel>

    <q-tab-panel name="Youth" class="q-ma-none q-pa-sm text-body1"> 
      <q-table
        dense
        flat
        title="青年會員數據"
        :rows="YouthData"
        :columns="memberListColumns"
        :pagination="defaultPagination"
        color="primary"
        row-key="c_mem_id"
        :loading="loading"
        binary-state-sort
        @row-click="rowDetail"
      >
        <template v-slot:top-right>
          <q-btn
            color="primary"
            icon-right="archive"
            label="匯出Excel"
            no-caps
            @click="exportExcel(YouthData)"
          />
        </template>
      </q-table>
    </q-tab-panel>

    <q-tab-panel name="Family_15" class="q-ma-none q-pa-sm text-body1"> 
      <q-table
        dense
        flat
        title="家人(<15)會員數據"
        :rows="Family_15Data"
        :columns="memberListColumns"
        :pagination="defaultPagination"
        color="primary"
        row-key="c_mem_id"
        :loading="loading"
        binary-state-sort
        @row-click="rowDetail"
      >
        <template v-slot:top-right>
          <q-btn
            color="primary"
            icon-right="archive"
            label="匯出Excel"
            no-caps
            @click="exportExcel(Family_15Data)"
          />
        </template>
      </q-table>
    </q-tab-panel>

    <q-tab-panel name="Family_24" class="q-ma-none q-pa-sm text-body1"> 
      <q-table
        dense
        flat
        title="家人(>24)會員數據"
        :rows="Family_24Data"
        :columns="memberListColumns"
        :pagination="defaultPagination"
        color="primary"
        row-key="c_mem_id"
        :loading="loading"
        binary-state-sort
        @row-click="rowDetail"
      >
        <template v-slot:top-right>
          <q-btn
            color="primary"
            icon-right="archive"
            label="匯出Excel"
            no-caps
            @click="exportExcel(Family_24Data)"
          />
        </template>
      </q-table>
    </q-tab-panel>

    <q-tab-panel name="Expired" class="q-ma-none q-pa-sm text-body1"> 
      <q-table
        dense
        flat
        title="過期會員數據"
        :rows="ExpiredData"
        :columns="memberListColumns"
        :pagination="defaultPagination"
        color="primary"
        row-key="c_mem_id"
        :loading="loading"
        binary-state-sort
        @row-click="rowDetail"
      >
        <template v-slot:top-right>
          <q-btn
            color="primary"
            icon-right="archive"
            label="匯出Excel"
            no-caps
            @click="exportExcel(ExpiredData)"
          />
        </template>
      </q-table>
    </q-tab-panel>

    <q-tab-panel name="Error" class="q-ma-none q-pa-sm text-body1"> 
      <q-table
        dense
        flat
        title="錯誤會員數據"
        :rows="ErrorData"
        :columns="memberListColumns"
        :pagination="defaultPagination"
        color="primary"
        row-key="c_mem_id"
        :loading="loading"
        binary-state-sort
        @row-click="rowDetail"
      >
        <template v-slot:top-right>
          <q-btn
            color="primary"
            icon-right="archive"
            label="匯出Excel"
            no-caps
            @click="exportExcel(ErrorData)"
          />
        </template>
      </q-table>
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup>
import { computed, ref } from "vue";
import { exportFile, date as qdate } from "quasar";
import { useSubscription } from "@vue/apollo-composable"
import { gql } from "graphql-tag"
import MemberDetail from "components/Member/MemberDetail.vue";
import Report from "src/lib/sis"
import LoadingDialog from "components/LoadingDialog.vue"
import dateUtil from "src/lib/calculateAge"


// variables
const reportDate = ref(qdate.formatDate(qdate.endOfDate(qdate.subtractFromDate(Date.now(), {month: 1}), 'month'), "YYYY/MM/DD"))
const detailModal = ref(false)
const showMemberID = ref("")
const activeTab = ref("All")

const defaultPagination = ref({
  rowsPerPage: 30,
  sortBy: "c_mem_id",
})
const memberListColumns = ref([
  {
    name: "c_mem_id",
    label: "會員編號",
    field: "c_mem_id",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    sortable: true,
  },
  {
    name: "c_name",
    label: "姓名",
    field: "c_name",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_name_other",
    label: "英文姓名",
    field: "c_name_other",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_sex",
    label: "性別",
    field: "c_sex",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_udf_1",
    label: "會籍",
    field: "c_udf_1",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "d_birth",
    label: "出生日期",
    field: "d_birth",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => val? qdate.formatDate(val, "YYYY年M月D日") : '錯誤'
  },
  {
    name: "age",
    label: "年齡(至截數日)",
    field: "d_birth",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => val? dateUtil.calculateAge(val, reportDate) : '錯誤'
  },
  //
  {
    name: "d_enter_1",
    label: "入會日期",
    field: "d_enter_1",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => val? qdate.formatDate(val, "YYYY年M月D日") : '錯誤'
  },
  {
    name: "d_renew_1",
    label: "續會日期",
    field: "d_renew_1",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => val? qdate.formatDate(val, "YYYY年M月D日") : ''
  },
  {
    name: "d_exit_1",
    label: "退會日期",
    field: "d_exit_1",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => val? qdate.formatDate(val, "YYYY年M月D日") : ''
  },
  {
    name: "d_expired_1",
    label: "屆滿日期",
    field: "d_expired_1",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) =>
      qdate.formatDate(val, "YYYY年M月D日") == "3000年1月1日"
        ? "永久"
        : qdate.formatDate(val, "YYYY年M月D日"),
  },
  {
    name: "isYouthFamily",
    label: "青年家人",
    field: "isYouthFamily",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => val? '是': ''
  },
  {
    name: "youthMemberName",
    label: "青年家人姓名",
    field: "youthMemberName",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => [...val]
  },
])

// query - load graphql subscription on member list
const { result, loading } = useSubscription(gql`
  subscription getMember {
    Member(order_by: {c_mem_id: desc}, offset: 1) {
      c_mem_id
      b_mem_type1
      b_mem_type10
      c_name
      c_name_other
      c_sex
      c_udf_1
      d_birth
      d_expired_1
      d_exit_1
      d_renew_1
      d_enter_1
      MemberRelation1 {
        c_mem_id_1
        c_mem_id_2
        relation
        uuid
      }
      MemberRelation2 {
        c_mem_id_1
        c_mem_id_2
        relation
        uuid
      }
    }
  }`);

const tableHeader = {
  c_mem_id: "會員號碼",
  b_mem_type1: "會藉有效",
  b_mem_type10: "青年家人",
  c_name: "姓名",
  c_name_other: "英文姓名",
  c_sex: "性別",
  c_udf_1: "會藉",
  d_birth: "出生日期",
  d_expired_1: "屆滿日期",
  d_exit_1: "退會日期",
  d_renew_1: "續會日期",
  d_enter_1: "人會日期",
  isYouthFamily: "青年家人",
  youthMemberName: "青年家人姓名"
}

// computed
const MemberData = computed(() => {
  let res = []
  if (result.value) {
    result.value.Member.forEach((x) => {
      res.push({
        ...x,
        ...Report.isYouthFamily(reportDate, result.value.Member, x.c_mem_id)
      })
    })
  }
  return res
})
const QuitData = computed(() => MemberData.value? MemberData.value.filter((x) => x.d_exit_1 != null): [])
const YouthData = computed(() => MemberData.value? 
  MemberData.value.filter((x) => Report.sisFilter(reportDate, 'youth', x)
) : [])

const Family_15Data = computed(() => MemberData.value? MemberData.value.filter((x) => 
  Report.sisFilter(reportDate, 'child', x)
) : [])

const Family_24Data = computed(() => MemberData.value? MemberData.value.filter((x) => 
  Report.sisFilter(reportDate, 'family', x)
): [])

const ErrorData = computed(() => MemberData.value? MemberData.value.filter((x) => 
  (
    x.d_birth == null || 
    x.d_birth > reportDate.value || 
    x.d_enter_1 == null
  ) &&
  x.c_udf_1 != "社區義工" &&
  (
    (x.d_expired_1 == null) || 
    (x.d_expired_1 && qdate.getDateDiff(x.d_expired_1, reportDate.value) > 0)
  )
  ): [])

const ExpiredData = computed(() => MemberData.value? MemberData.value.filter((x) =>
  !x.d_exit_1 &&
  x.d_expired_1 && qdate.getDateDiff(x.d_expired_1, reportDate.value) < 0
): [])

// functions
function exportExcel(datasource) {
  //console.log(memberListColumns.value.map(col => wrapCsvValue(col.label)))
  /*
  let data = datasource.map(row => memberListColumns.value.map(col => wrapCsvValue(
      typeof col.field === 'function'
        ? col.field(row)
        : row[ col.field === void 0 ? col.name : col.field ],
      col.format,
      row
    )))
  //console.log(data)
  
  for (const row of data) {
    for (const item of row) {
      console.log(item)
    }
  }
  */
  
  let content = jsonToXLS(datasource)
  
  const status = exportFile(
    'CCIYC-Report.xls',
    content,
    'text/xls'
  )

  if (status !== true) {
    $q.notify({
      message: 'Browser denied file download...',
      color: 'negative',
      icon: 'warning'
    })
  }
  
}
function rowDetail(evt, row, index) {
  if (evt.target.nodeName === 'TD') {
    detailModal.value = true;
    showMemberID.value = row.c_mem_id;
  }
}

function exportTable(dataSource) {
  // naive encoding to csv format
  const content = [memberListColumns.value.map(col => wrapCsvValue(col.label))].concat(
    dataSource.map(row => memberListColumns.value.map(col => wrapCsvValue(
      typeof col.field === 'function'
        ? col.field(row)
        : row[ col.field === void 0 ? col.name : col.field ],
      col.format,
      row
    )).join(','))
  ).join('\r\n')

  const status = exportFile(
    'table-export.csv',
    content,
    'text/csv'
  )

  if (status !== true) {
    $q.notify({
      message: 'Browser denied file download...',
      color: 'negative',
      icon: 'warning'
    })
  }
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

function jsonToXLS(data) {
  let xlsTemp =
    '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta name=ProgId content=Excel.Sheet> <meta name=Generator content="Microsoft Excel 11"><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><style>br {mso-data-placement: same-cell;}</style></head><body><table>${table}</table></body></html>';
  let xlsData = "<thead>";
  const colspan = Object.keys(data[0]).length;
  //Header
  // const header = this.header || this.$attrs.title;
  if (header) {
    xlsData += parseExtraData(
      header,
      '<tr><th colspan="' + colspan + '">${data}</th></tr>'
    );
  }
  
  //Fields
  xlsData += "<tr>";
  let tableHeader = memberListColumns.value.map(col => wrapCsvValue(col.label))
  for (let key of tableHeader) {
    xlsData += "<th>" + key + "</th>";
  }
  xlsData += "</tr>";
  xlsData += "</thead>";
  
  
  /*data.map(row => memberListColumns.value.map(col => wrapCsvValue(
      typeof col.field === 'function'
        ? col.field(row)
        : row[ col.field === void 0 ? col.name : col.field ],
      col.format,
      row
    )))*/

  //Data
  xlsData += "<tbody>";

  let tableFieldData = data.map(row => memberListColumns.value.map(col => wrapCsvValue(
                        typeof col.field === 'function'
                          ? col.field(row)
                          : row[ col.field === void 0 ? col.name : col.field ],
                        col.format,
                        row
                      )))
  /*
  data.map(function (item, index) {
    xlsData += "<tr>";
    for (let key in item) {
      xlsData +=
        "<td>" +
        preprocessLongNum(
          valueReformattedForMultilines(item[key])
        ) +
        "</td>";
    }
    xlsData += "</tr>";
  });
  */
  // ableFieldData)
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
</script>