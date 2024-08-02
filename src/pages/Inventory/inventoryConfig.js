import { ref } from "vue";
import { date } from "quasar";

export const blankInventoryObject = ref({
  ID: "",
  f_cost: 0,
  d_purchase: date.formatDate(new Date(), "YYYY/MM/DD"),
  c_name: "",
  c_model: "",
  c_location: "",
  c_funding: "",
  i_qty: 1,
  c_createdByUser: "",
  d_createDate: date.formatDate(new Date(), "YYYY/MM/DD"),
  b_approve: false,
  c_approvedByUser: null,
  d_approveDate: null,
});

export const sourceOfFund = ref([
  "整筆撥款",
  "獎券基金",
  "捐贈",
  "其他資助",
  "SWDF",
]);

export const pagination = ref({
  rowsPerPage: 30,
});

export const InventoryColumn = ref([
  {
    name: "ID",
    label: "編號",
    field: "ID",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_name",
    label: "類型",
    field: "c_name",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_model",
    label: "型號",
    field: "c_model",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_location",
    label: "位置",
    field: "c_location",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "d_purchase",
    label: "購買日期",
    field: "d_purchase",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => (val ? date.formatDate(val, "YYYY/MM/DD") : null),
  },
  {
    name: "f_cost",
    label: "金額",
    field: "f_cost",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_funding",
    label: "經費來源",
    field: "c_funding",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "i_qty",
    label: "購入數量",
    field: "i_qty",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "i_destroy_quantity",
    label: "報銷數量",
    field: "i_destroy_quantity",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "i_remaining_quantity",
    label: "剩餘數量",
    field: "i_remaining_quantity",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "c_createdByUser",
    label: "建立人",
    field: "c_createdByUser",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "b_approve",
    label: "批核",
    field: "b_approve",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  /*
  {
    name: "d_destroy",
    label: "廢棄日期",
    field: "d_destroy",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
    format: (val) => val? date.formatDate(val, "YYYY/MM/DD"): null
  },
  {
    name: "c_destroy_reason",
    label: "理由",
    field: "c_destroy_reason",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "b_confirm",
    label: "主任批核",
    field: "b_confirm",
    style: "border-top: 1px solid; text-align: center",
    headerStyle: "text-align: center;",
    headerClasses: "bg-grey-2",
  },
  */
]);
