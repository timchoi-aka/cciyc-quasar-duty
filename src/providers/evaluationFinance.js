import { ref, computed } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { gql } from "graphql-tag";
import { date, extend } from "quasar";
import { useNotifier } from "./notifier";
import apolloClient from "src/boot/apollo";
import { provideApolloClient } from "@vue/apollo-composable";
provideApolloClient(apolloClient);

// Function to provide event data
export function useEvaluationFinanceProvider(options = {}) {
  // Destructure parameters from options
  const { eval_uuid = ref() } = options;

  // Ref to keep track of the number of pending async operations
  const awaitNumber = ref(0);

  // Computed property that indicates whether there are any pending async operations
  const loading = computed(() => awaitNumber.value > 0);

  // Ref to store the result of the async operations
  const result = ref([]);

  // returned message to be displayed to client
  const message = ref({});

  // GraphQL query string
  const GET_EVALUATIOIN_FINANCE = gql`
    query GetEvaluationFinance(
      $eval_uuid: uniqueidentifier! = "00000000-0000-0000-0000-000000000000"
    ) {
      Event_Evaluation_Account(where: { eval_uuid: { _eq: $eval_uuid } }) {
        account_uuid
        amount
        c_act_code
        description
        eval_uuid
        planeval
        txn_date
        type
      }
    }
  `;

  const ADD_EVALUATION_FINANCE_BY_UUID = gql`
    mutation addEvaluationAccountFromUUID(
      $objects: [Event_Evaluation_Account_insert_input!] = {}
      $logObject: Log_insert_input! = {}
      $removeRecord: [uniqueidentifier!] = [
        "00000000-0000-0000-0000-000000000000"
      ]
    ) {
      insert_Event_Evaluation_Account(
        objects: $objects
        if_matched: {
          update_columns: [amount, description]
          match_columns: account_uuid
        }
      ) {
        returning {
          account_uuid
          amount
          c_act_code
          description
          eval_uuid
          planeval
          txn_date
          type
        }
      }
      delete_Event_Evaluation_Account(
        where: { account_uuid: { _in: $removeRecord } }
      ) {
        returning {
          account_uuid
        }
      }
      insert_Log_one(object: $logObject) {
        log_id
        username
      }
    }
  `;

  const GET_EVENT = gql`
    query GetEvent($c_act_code: String! = "") {
      HTX_Event_by_pk(c_act_code: $c_act_code) {
        c_act_code
        Event_to_Evaluation {
          uuid
          Evaluation_to_Account {
            account_uuid
            amount
            c_act_code
            description
            eval_uuid
            planeval
            type
            txn_date
          }
        }
      }
    }
  `;

  /***
   * AddFinance: Function to execute the SUBMIT_PLAN mutation.
   * onDone_submitPlan: Callback function that is called when the SUBMIT_PLAN mutation successfully completes.
   * onError_submitPlan: Callback function that is called when an error occurs while executing the SUBMIT_PLAN mutation.
   * ***/
  const {
    mutate: AddFinance,
    onError: onError_AddFinance,
    onDone: onDone_AddFinance,
  } = useMutation(ADD_EVALUATION_FINANCE_BY_UUID, {
    update: (
      cache,
      {
        data: {
          insert_Event_Evaluation_Account,
          delete_Event_Evaluation_Account,
        },
      }
    ) => {
      /* 
      console.log(
        "insert_Event_Evaluation_Account: ",
        insert_Event_Evaluation_Account
      );
      console.log(
        "delete_Event_Evaluation_Account: ",
        delete_Event_Evaluation_Account
      );
      */
      const c_act_code =
        insert_Event_Evaluation_Account &&
        insert_Event_Evaluation_Account.returning &&
        insert_Event_Evaluation_Account.returning.length > 0
          ? insert_Event_Evaluation_Account.returning[0].c_act_code.trim()
          : undefined;
      const eval_uuid =
        insert_Event_Evaluation_Account &&
        insert_Event_Evaluation_Account.returning &&
        insert_Event_Evaluation_Account.returning.length > 0
          ? insert_Event_Evaluation_Account.returning[0].eval_uuid
          : undefined;

      const existing = cache.readQuery({
        query: GET_EVALUATIOIN_FINANCE,
        variables: {
          eval_uuid: eval_uuid,
        },
      });

      // Check if the data is in the cache
      if (existing) {
        let updated = [...existing.Event_Evaluation_Account];

        insert_Event_Evaluation_Account.returning.forEach((ele) => {
          const index = updated.findIndex(
            (item) => item.account_uuid === ele.account_uuid
          );
          if (index > -1) {
            updated[index] = ele;
          } else {
            updated.push(ele);
          }
        });

        // Create an array of account_uuids to delete
        const uuidsToDelete = delete_Event_Evaluation_Account.returning.map(
          (ele) => ele.account_uuid
        );

        // Filter out the records that should be deleted
        updated = updated.filter(
          (item) => !uuidsToDelete.includes(item.account_uuid)
        );

        // Write our data back to the cache.
        cache.writeQuery({
          query: GET_EVALUATIOIN_FINANCE,
          variables: {
            eval_uuid: eval_uuid,
          },
          data: { ...existing, Event_Evaluation_Account: updated },
        });
      }
    },
  });

  onDone_AddFinance((res) => {
    if (res.data) {
      if (process.env.NODE_ENV != "development") {
        // no notification for delete event
        // message return to client
        message.value =
          "成功新填活動財務 - " +
          res.data.insert_Event_Evaluation_Account.returning[0].c_act_code.trim();
      } else {
        // development channel
        const { result } = useNotifier({
          topic: "uqhehdGADfWYglt9jDfaab0LGrC3",
          data: {
            title: "[DEV]更新活動財務",
            body:
              "[" +
              res.data.insert_Log_one.username.trim() +
              "]" +
              "更新了活動財務" +
              res.data.insert_Event_Evaluation_Account.returning[0].c_act_code.trim(),
          },
        });

        result.value
          .then((r) => {
            if (r.data) {
              message.value =
                "成功更新活動財務 - " +
                res.data.insert_Event_Evaluation_Account.returning[0].c_act_code.trim();
            }
          })
          .catch((e) => {
            console.log("error: ", e);
            message.value =
              "更新活動財務" +
              res.data.insert_Event_Evaluation_Account.returning[0].c_act_code.trim() +
              "失敗";
          });
      }
    } else {
      // error
      message.value =
        "更新活動財務" +
        res.data.insert_Event_Evaluation_Account.returning[0].c_act_code.trim() +
        "失敗";
    }
  });

  // Function to execute the query
  const execute = async () => {
    awaitNumber.value++;

    const { onResult } = useQuery(GET_EVALUATIOIN_FINANCE, () => ({
      eval_uuid: eval_uuid.value,
    }));

    onResult((res) => {
      if (res.data) {
        result.value = res.data;
        awaitNumber.value--;
      }
    });
  };

  // Execute the query
  execute();

  // Function to submit event plan / evaluation by id
  const addFinance = async (payload) => {
    const {
      objects = ref(),
      username = ref(),
      c_act_code = ref(),
      removeRecord = ref(["00000000-0000-0000-0000-000000000000"]),
    } = payload;

    // console.log("objects: ", objects.value);
    // console.log("removeRecord: ", removeRecord.value);
    // Increment the number of pending async operations
    awaitNumber.value++;
    try {
      // Call the toggleVisibility mutation
      await AddFinance({
        objects: objects.value,
        removeRecord: removeRecord.value,
        logObject: {
          username: username.value,
          datetime: date.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
          module: "活動系統",
          action:
            "修改活動計劃檢討財務資料：" +
            c_act_code.value +
            "。新增：" +
            JSON.stringify(objects.value) +
            "。刪除：" +
            JSON.stringify(removeRecord.value),
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      // Decrement the number of pending async operations
      awaitNumber.value--;
    }
  };
  // Return the provided data and functions
  return {
    result,
    message,
    loading,
    refetch: execute,
    addFinance,
  };
}
