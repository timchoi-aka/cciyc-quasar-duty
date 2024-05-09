import { ref, watch } from "vue";
import {
  useLazyQuery,
  useQuery,
  useMutation,
  useSubscription,
} from "@vue/apollo-composable";
import { gql } from "graphql-tag";
import { is, date } from "quasar";

// Function to provide attendance data
export function useBatchEventRegistrationProvider() {
  const updateQueue = ref([]);
  const result = ref([]);
  const awaitNumber = ref(0);
  const maxRetries = 3; // Define maximum number of retries
  let retries = ref(0); // Initialize retry count
  let operationStatus = ref([]); // Initialize operation success flag

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

  const EVENT_REGISTRATION = gql`
    mutation EventRegistration(
      $logObject: Log_insert_input! = {}
      $regObject: tbl_act_reg_insert_input = {}
      $accountObject: tbl_account_insert_input = {}
    ) {
      insert_tbl_act_reg_one(object: $regObject) {
        ID
        c_name
        c_act_code
      }
      insert_Log_one(object: $logObject) {
        log_id
      }
      insert_tbl_account_one(object: $accountObject) {
        c_receipt_no
        u_price_after_discount
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

      // receipt number format: YYYY-0001
      // financial year is April to March
      // reset receipt number to 0001 if new financial year
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

  /***
   * BatchRegister: Function to execute the EVENT_REGISTRATION mutation.
   * onDone_BatchRegister: Callback function that is called when the EVENT_REGISTRATION mutation successfully completes.
   * onError_BatchRegister: Callback function that is called when an error occurs while executing the EVENT_REGISTRATION mutation.
   * ***/
  const {
    mutate: BatchRegister,
    onError: onError_BatchRegister,
    onDone: onDone_BatchRegister,
  } = useMutation(EVENT_REGISTRATION);

  onDone_BatchRegister((res) => {
    if (res.data) {
      let c_receipt_no = res.data.insert_tbl_account_one.c_receipt_no;
      result.value.push(c_receipt_no);
      let i = updateQueue.value.findIndex(
        (x) => x.accountObject.c_receipt_no == c_receipt_no
      );
      operationStatus.value[i] = true;
      retries.value = 0; // Reset retry count
    }
  });

  onError_BatchRegister((error) => {
    retries.value++; // Increment retry count
    if (retries.value >= maxRetries) {
      console.log("Max retries reached");
    }
  });

  // delete plan eval
  const batchRegister = async (options) => {
    const { object = ref([]), staff_name = ref() } = options;
    // console.log("options", options)
    let queue = [];
    let now = date.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss");
    // build regObject
    object.value.forEach((element) => {
      let logObject = {
        username: staff_name.value,
        datetime: now,
        module: "活動系統",
        action:
          "會員 (" +
          element.c_mem_id +
          ")" +
          element.c_name +
          " 報名活動 " +
          element.c_act_code +
          (element.b_freeofcharge ? "" : " 費用: " + element.u_fee),
      };

      let regObj = {
        c_mem_id: element.c_mem_id,
        c_act_code: element.c_act_code,
        c_type: element.b_freeofcharge ? null : element.c_type,
        c_name: element.c_name,
        c_sex: element.c_sex,
        i_age: element.i_age,
        // c_receipt_no: element.b_freeofcharge ? null : latestReceiptNo.value,
        c_remarks: "",
        c_bus: null,
        i_bus_no: 0,
        c_tbl: null,
        i_tbl_no: 0,
        d_reg: now,
        c_period: null,
        c_user_id: staff_name.value,
        b_refund: false,
        d_refund: null,
      };

      let accountObject = {
        //c_receipt_no: latestReceiptNo.value,
        d_create: now,
        i_receipt_type: 2, //type 2 = activity fee
        c_desc: element.c_act_name,
        c_act_code: element.c_act_code,
        c_type: element.c_acc_type ? element.c_acc_type.trim() : "",
        u_discount: 0,
        u_price_after_discount: element.u_fee,
        c_cash_type: "Cash",
        c_cheque_no: "",
        m_remark: element.remark,
        c_mem_id: element.c_mem_id ? element.c_mem_id.trim() : "",
        c_user_id: staff_name.value,
        c_name: element.c_name ? element.c_name.trim() : "",
        b_cssa: false,
        b_refund: false,
        b_OtherIncome: false,
        b_clear: false,
        d_clear: now,
        i_prints: 0,
        b_delete: false,
      };

      /* 
      console.log("logObject", logObject);
      console.log("regObj", regObj);
      console.log("accountObject", accountObject);
      */
      // add objects to queue
      queue.push({
        logObject: logObject,
        regObject: regObj,
        accountObject: accountObject,
      });
      operationStatus.value.push(false);
    });
    updateQueue.value = queue;
  };

  watch(updateQueue, async (value) => {
    for (let i = 0; i < value.length; i++) {
      let object = value[i];
      do {
        if (awaitNumber.value == 0) {
          console.log("trying to register", object);
          // Increment the number of pending async operations
          awaitNumber.value++;
          object.regObject.c_receipt_no = object.accountObject
            .u_price_after_discount
            ? latestReceiptNo.value
            : null;
          object.accountObject.c_receipt_no = latestReceiptNo.value;

          // Call the EVENT_REGISTRATION mutation
          await BatchRegister({
            logObject: object.logObject,
            regObject: object.regObject,
            accountObject: object.accountObject,
          }).then(() => {
            console.log("finished registering");
            awaitNumber.value--;
          });
        }
      } while (retries.value < maxRetries && operationStatus.value[i] == false);
    }
  });

  // Return the provided data and functions
  return { result, latestReceiptNo, batchRegister, updateQueue };
}
