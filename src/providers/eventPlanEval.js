import { ref, computed } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { gql } from "graphql-tag";
import { date } from "quasar";
import { useNotifier } from "./notifier";
import dateUtil from "src/lib/date";

// Function to provide event data
export function useEventPlanEvalProvider(options = {}) {
  // Destructure parameters from options

  const { c_respon = ref(), isCenterIC = ref(false) } = options;

  // Ref to keep track of the number of pending async operations
  const awaitNumber = ref(0);

  // Computed property that indicates whether there are any pending async operations
  const loading = computed(() => awaitNumber.value > 0 || loadingEvent.value);

  // returned message to be displayed to client
  const message = ref({});

  // Ref to keep track of the event data
  const result = ref([]);

  // GraphQL query string
  const GET_EVENT_PLAN_EVAL = gql`
    query GET_EVENT_PLAN_EVAL($where: HTX_Event_bool_exp) {
      HTX_Event(where: $where) {
        b_finish
        b_hardcopy
        c_act_code
        c_act_name
        c_act_nameen
        c_acc_type
        c_dest
        c_nature
        c_respon
        c_respon2
        c_type
        c_status
        c_group1
        c_group2
        c_worker
        c_worker2
        d_date_from
        d_date_to
        d_sale_start
        d_sale_end
        d_finish_goal
        Event_to_Evaluation {
          c_act_code
          submit_plan_date
          submit_eval_date
          ic_plan_date
          ic_eval_date
          uuid
        }
      }
    }
  `;

  const where = computed(() =>
    !isCenterIC.value
      ? {
          _and: [
            { c_respon: { _eq: c_respon.value } },
            { b_hardcopy: { _neq: true } },
          ],
        }
      : { b_hardcopy: { _neq: true } }
  );

  // Return the provided data and functions
  const { onResult } = useQuery(GET_EVENT_PLAN_EVAL, () => ({
    where: where.value,
  }));

  onResult((data) => {
    if (data?.data?.HTX_Event) {
      result.value = data.data.HTX_Event.map((x) => ({
        b_finish: x.b_finish,
        c_act_code: x.c_act_code ? x.c_act_code.trim() : "",
        c_act_name: x.c_act_name ? x.c_act_name.trim() : "",
        c_act_nameen: x.c_act_nameen ? x.c_act_nameen.trim() : "",
        c_acc_type: x.c_acc_type ? x.c_acc_type.trim() : "",
        c_dest: x.c_dest ? x.c_dest.trim() : "",
        c_nature: x.c_nature ? x.c_nature.trim() : "",
        c_respon: x.c_respon ? x.c_respon.trim() : "",
        c_type: x.c_type ? x.c_type.trim() : "",
        c_status: x.c_status ? x.c_status.trim() : "",
        c_group1: x.c_group1 ? x.c_group1.trim() : "",
        c_group2: x.c_group2 ? x.c_group2.trim() : "",
        c_worker: x.c_worker ? x.c_worker.trim() : "",
        c_worker2: x.c_worker2 ? x.c_worker2.trim() : "",
        d_date_from: x.d_date_from
          ? date.formatDate(
              date.extractDate(x.d_date_from.trim(), "D/M/YYYY"),
              "YYYY-MM-DD"
            )
          : "",
        d_date_to: x.d_date_to
          ? date.formatDate(
              date.extractDate(x.d_date_to.trim(), "D/M/YYYY"),
              "YYYY-MM-DD"
            )
          : "",
        d_finish_goal: x.d_finish_goal
          ? date.formatDate(
              date.extractDate(x.d_finish_goal.trim(), "D/M/YYYY"),
              "YYYY-MM-DD"
            )
          : "",
        plan_submit:
          x.Event_to_Evaluation &&
          x.Event_to_Evaluation[0] &&
          x.Event_to_Evaluation[0].submit_plan_date
            ? true
            : false,
        eval_submit:
          x.Event_to_Evaluation &&
          x.Event_to_Evaluation[0] &&
          x.Event_to_Evaluation[0].submit_eval_date
            ? true
            : false,
        isRejected:
          (x.Event_to_Evaluation &&
            x.Event_to_Evaluation[0] &&
            !x.Event_to_Evaluation[0].submit_plan_date &&
            x.Event_to_Evaluation &&
            x.Event_to_Evaluation[0] &&
            x.Event_to_Evaluation[0].ic_plan_date) ||
          (x.Event_to_Evaluation &&
            x.Event_to_Evaluation[0] &&
            !x.Event_to_Evaluation[0].submit_eval_date &&
            x.Event_to_Evaluation &&
            x.Event_to_Evaluation[0] &&
            x.Event_to_Evaluation[0].ic_eval_date)
            ? true
            : false,
        isOutstanding:
          x.Event_to_Evaluation.length == 0 ||
          (x.Event_to_Evaluation &&
            x.Event_to_Evaluation[0] &&
            !x.Event_to_Evaluation[0].submit_plan_date) ||
          (x.d_date_to &&
            date.getDateDiff(
              date.extractDate(x.d_date_to.trim(), "D/M/YYYY"),
              new Date()
            ) < 0 &&
            x.Event_to_Evaluation &&
            x.Event_to_Evaluation[0] &&
            !x.Event_to_Evaluation[0].submit_eval_date)
            ? true
            : false,
      }));
    }
  });

  // Return the provided data and functions
  return {
    result,
    message,
    loading,
  };
}
