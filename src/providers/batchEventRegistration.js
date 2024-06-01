import { ref, watch, computed } from "vue";
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
  const updateQueue = ref({ length: 0 });
  const result = ref({});
  const awaitNumber = ref(0);

  const loading = computed(() => updateQueue.value.length > 0);
  const message = ref();

  const maxRetries = 3; // Define maximum number of retries
  let retries = ref(0); // Initialize retry count
  let operationStatus = ref(false); // Initialize operation success flag
  const regObject = ref([]);
  const staffName = ref();

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
      $logObject: [Log_insert_input!] = []
      $regObject: [tbl_act_reg_insert_input!] = []
      $accountObject: [tbl_account_insert_input] = []
    ) {
      insert_tbl_act_reg(objects: $regObject) {
        returning {
          ID
          c_name
          c_act_code
        }
      }
      insert_Log(objects: $logObject) {
        returning {
          log_id
          username
        }
      }
      insert_tbl_account(objects: $accountObject) {
        returning {
          c_receipt_no
          u_price_after_discount
        }
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
        latestReceiptNo.value = advanceReceiptNo(
          res.data.tbl_account[0].c_receipt_no,
          1
        );
      }
    }
  });

  function advanceReceiptNo(c_receipt_no, increment) {
    let token = c_receipt_no.split("-");
    let numberPart = parseInt(token[1]);
    numberPart = (numberPart + increment).toString();
    while (numberPart.length < 4) numberPart = "0" + numberPart;
    return token[0] + "-" + numberPart;
  }

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
      result.value = {
        c_receipt_no: res.data.insert_tbl_account.returning.map(
          (x) => x.c_receipt_no
        ),
        id: res.data.insert_tbl_act_reg.returning.map((x) => x.ID),
      };
      updateQueue.value = { length: 0 };
      operationStatus.value = true;
      message.value = "報名成功。";
      setTimeout(() => {
        (message.value = ""), 3000;
      });
      retries.value = 0; // Reset retry count
    }
  });

  onError_BatchRegister((error) => {
    retries.value++; // Increment retry count
    if (retries.value >= maxRetries) {
      message.value = "系統繁忙，請稍後再試。";
      setTimeout(() => {
        (message.value = ""), 3000;
      });
    }
  });

  // delete plan eval
  const batchRegister = async (options) => {
    const { object = ref([]), staff_name = ref() } = options;
    regObject.value = object.value;
    staffName.value = staff_name.value;
    operationStatus.value = false;
    addObjectsToQueue();
  };

  function addObjectsToQueue() {
    let increment = 0;
    let queue = {
      logObjectQueue: [],
      regObjectQueue: [],
      accountObjectQueue: [],
      length: 0,
    };
    updateQueue.value = queue;
    let now = date.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss");

    // build regObject
    regObject.value.forEach((element) => {
      let logObject = {
        username: staffName.value,
        datetime: now,
        module: "活動系統",
        action:
          "會員 (" +
          element.c_mem_id +
          ")" +
          element.c_name +
          " 報名活動 " +
          element.c_act_code +
          (element.u_fee && element.u_fee > 0 ? " 費用: " + element.u_fee : ""),
      };

      let regObj = {
        c_mem_id: element.c_mem_id,
        c_act_code: element.c_act_code,
        c_type: element.c_type ? element.c_type : null,
        c_name: element.c_name,
        c_sex: element.c_sex,
        i_age: element.i_age,
        c_receipt_no: element.u_fee
          ? advanceReceiptNo(latestReceiptNo.value, increment)
          : null,
        c_remarks: "",
        c_bus: null,
        i_bus_no: 0,
        c_tbl: null,
        i_tbl_no: 0,
        d_reg: now,
        c_period: null,
        c_user_id: staffName.value,
        b_refund: false,
        d_refund: null,
      };

      let accountObject =
        element.u_fee && element.u_fee > 0
          ? {
              c_receipt_no: advanceReceiptNo(latestReceiptNo.value, increment),
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
              c_user_id: staffName.value,
              c_name: element.c_name ? element.c_name.trim() : "",
              b_cssa: false,
              b_refund: false,
              b_OtherIncome: false,
              b_clear: false,
              d_clear: now,
              i_prints: 0,
              b_delete: false,
            }
          : {};

      // add objects to queue
      queue.logObjectQueue.push(logObject);
      queue.regObjectQueue.push(regObj);
      if (Object.keys(accountObject).length > 0)
        queue.accountObjectQueue.push(accountObject);
      queue.length++;
      if (element.u_fee && element.u_fee > 0) increment++;
    });

    updateQueue.value = queue;
  }

  watch(updateQueue, async (value) => {
    if (value.length && value.length > 0) trySubmit();
  });

  watch(latestReceiptNo, async (value) => {
    if (updateQueue.value.length && updateQueue.value.length > 0) {
      addObjectsToQueue();
      trySubmit();
    }
  });

  function trySubmit() {
    // Call the EVENT_REGISTRATION mutation
    setTimeout(async () => {
      if (
        awaitNumber.value == 0 &&
        retries.value < maxRetries &&
        operationStatus.value == false
      ) {
        /*
        console.log("trying to register", updateQueue.value);
        console.log("logObject", updateQueue.value.logObjectQueue);
        console.log("regObj", updateQueue.value.regObjectQueue);
        console.log("accountObject", updateQueue.value.accountObjectQueue);
        */
        // Increment the number of pending async operations
        awaitNumber.value++;
        try {
          if (updateQueue.value.accountObjectQueue.length > 0) {
            await BatchRegister({
              logObject: updateQueue.value.logObjectQueue,
              regObject: updateQueue.value.regObjectQueue,
              accountObject: updateQueue.value.accountObjectQueue,
            });
          } else {
            await BatchRegister({
              logObject: updateQueue.value.logObjectQueue,
              regObject: updateQueue.value.regObjectQueue,
            });
          }
          awaitNumber.value--;
        } catch (error) {
          console.log("error", error);
        }
      }
    }, 1000);
  }
  // Return the provided data and functions
  return {
    result,
    latestReceiptNo,
    batchRegister,
    loading,
    message,
  };
}
