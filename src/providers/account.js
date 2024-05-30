import { ref } from "vue";
import {
  useLazyQuery,
  useQuery,
  useMutation,
  useSubscription,
} from "@vue/apollo-composable";
import { gql } from "graphql-tag";
import { is, date } from "quasar";

// Function to provide attendance data
export function useAccountProvider(options = {}) {
  // Destructure galleryID from options, default to a new ref if not provided
  const {
    c_receipt_no = ref(),
    c_mem_id = ref(),
    i_receipt_type = ref(),
    status = ref(),
    startDate = ref(),
    endDate = ref(),
  } = options;

  const condition = ref([]);

  // result of latestReceiptNo
  const latestReceiptNo = ref("");

  // GraphQL query string
  const LATEST_RECEIPT_NO = gql`
    subscription getLatestReceiptNo {
      tbl_account(
        limit: 1
        order_by: { c_receipt_no: desc }
        where: { c_receipt_no: { _lt: "M" } }
      ) {
        c_receipt_no
        d_create
      }
    }
  `;

  // subscribe to latest receipt number
  const { onResult: subscriptionResult } = useSubscription(LATEST_RECEIPT_NO);

  // call back
  subscriptionResult((res) => {
    if (res.data) {
      let lastReceiptDate = date.extractDate(
        res.data.tbl_account[0].d_create,
        "YYYY-MM-DDTHH:mm:ss"
      );
      let today = new Date();
      // test case
      // let today = date.extractDate("2024-04-01T00:00:00", "YYYY-MM-DDTHH:mm:ss")

      let newFinancialYear =
        lastReceiptDate.getMonth() < 3 && today.getMonth() >= 3;
      let token = res.data.tbl_account[0].c_receipt_no.split("-");

      /** receipt number format: YYYY-0001
          financial year is April to March
          reset receipt number to 0001 if new financial year **/
      if (newFinancialYear) {
        latestReceiptNo.value = today.getFullYear().toString() + "-0001";
      } else {
        let receiptNo = parseInt(token[1]);
        receiptNo = (receiptNo + 1).toString();
        while (receiptNo.length < 4) receiptNo = "0" + receiptNo;
        latestReceiptNo.value = token[0] + "-" + receiptNo;
      }
    }
  });

  const GET_ACCOUNT = gql`
    query Account_getAllReceipt(
      $condition: tbl_account_bool_exp = { c_receipt_no: { _eq: "" } }
    ) {
      tbl_account(order_by: { c_receipt_no: desc }, where: $condition) {
        c_receipt_no
        b_OtherIncome
        b_refund
        c_act_code
        c_desc
        c_mem_id
        c_name
        c_type
        c_user_id
        d_clear
        d_create
        i_receipt_type
        i_prints
        u_price_after_discount
        b_delete
        m_remark
        Account_to_Event {
          c_act_code
          m_remind_content
        }
      }
    }
  `;

  const {
    result,
    load,
    loading,
    refetch: refetchReceipt,
  } = useLazyQuery(GET_ACCOUNT, () => ({
    condition: condition.value,
  }));

  const refetch = async () => {
    buildParam();
    if (!load()) refetchReceipt();
  };

  // Function to build query
  function buildParam() {
    condition.value = {
      _and: [],
    };

    if (c_receipt_no.value)
      condition.value["_and"].push({
        c_receipt_no: { _eq: c_receipt_no.value },
      });
    if (c_mem_id.value)
      condition.value["_and"].push({ c_mem_id: { _eq: c_mem_id.value } });
    if (i_receipt_type.value && is.number(i_receipt_type.value.value))
      condition.value["_and"].push({
        i_receipt_type: { _eq: i_receipt_type.value.value },
      });
    if (status.value) {
      switch (status.value.value) {
        case "refund":
          condition.value["_and"].push({ b_refund: { _eq: true } });
          break;
        case "delete":
          condition.value["_and"].push({ b_delete: { _eq: true } });
          break;
        case "normal":
        case "all":
        default:
          break;
      }
    }

    if (startDate.value) {
      condition.value["_and"].push({
        d_create: {
          _gte: date.formatDate(
            date.startOfDate(
              date.extractDate(startDate.value, "YYYY/MM/DD"),
              "day"
            ),
            "YYYY-MM-DDTHH:mm:ss"
          ),
        },
      });
    }

    if (endDate.value) {
      condition.value["_and"].push({
        d_create: {
          _lte: date.formatDate(
            date.endOfDate(
              date.extractDate(endDate.value, "YYYY/MM/DD"),
              "day"
            ),
            "YYYY-MM-DDTHH:mm:ss"
          ),
        },
      });
    }
  }

  // Return the provided data and functions
  return { result, latestReceiptNo, refetch, loading };
}

export function useAccountTypeProvider(options = {}) {
  const { loadDisabled = ref(false) } = options;

  const GET_ACCOUNT_TYPE = gql`
    query getAccountType($b_enable: Boolean!) {
      tbl_sel_acc_type(
        order_by: { i_No: asc }
        where: { b_enable: { _eq: $b_enable } }
      ) {
        c_type
        b_enable
      }
    }
  `;

  const { result, loading } = useQuery(GET_ACCOUNT_TYPE, () => ({
    b_enable: !loadDisabled.value,
  }));

  return { result, loading };
}
