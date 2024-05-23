import { ref, computed } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { gql } from "graphql-tag";

// Function to provide memo data
export function useMemoProvider(options = {}) {
  // Destructure parameters from options, default to a new ref if not provided
  const { c_act_code = ref(), c_mem_id = ref() } = options;

  // GraphQL query string
  const GET_MEMO = gql`
    query EventRegistration_ByActCodeAndMemberID(
      $where: tbl_act_reg_bool_exp = {}
    ) {
      tbl_act_reg(where: $where) {
        ID
        c_act_code
        c_mem_id
        c_name
        c_user_id
        c_receipt_no
        d_reg
        EventRegistration_to_Event {
          c_act_code
          c_act_name
          m_remark
          m_remind_content
          d_date_from
          d_date_to
          d_time_from
          d_time_to
          c_week
        }
      }
    }
  `;

  const where = computed(() =>
    c_act_code.value
      ? {
          _and: [
            { c_act_code: { _eq: c_act_code.value } },
            { c_mem_id: { _eq: c_mem_id.value } },
            { b_refund: { _eq: false } },
            {
              _or: [
                { c_receipt_no: { _eq: "" } },
                { c_receipt_no: { _is_null: true } },
              ],
            },
          ],
        }
      : {
          _and: [
            { c_mem_id: { _eq: c_mem_id.value } },
            { b_refund: { _eq: false } },
            {
              _or: [
                { c_receipt_no: { _eq: "" } },
                { c_receipt_no: { _is_null: true } },
              ],
            },
          ],
        }
  );

  const { result, loading } = useQuery(
    GET_MEMO,
    () => ({
      where: where.value,
    }),
    {
      enabled: computed(() => c_mem_id.value != null),
    }
  );

  // Return the provided data and functions
  return { result, loading };
}

export function useMemoByIDProvider(options = {}) {
  // Destructure parameters from options, default to a new ref if not provided
  const { ids = ref([]) } = options;

  // GraphQL query string
  const GET_MEMO_BY_ID = gql`
    query EventRegistration_ByActCodeAndMemberID($ids: [Int!] = [0]) {
      tbl_act_reg(where: { ID: { _in: $ids } }) {
        ID
        c_act_code
        c_mem_id
        c_name
        c_user_id
        c_receipt_no
        d_reg
        EventRegistration_to_Event {
          c_act_code
          c_act_name
          m_remark
          m_remind_content
          d_date_from
          d_date_to
          d_time_from
          d_time_to
          c_week
        }
      }
    }
  `;

  const { result, loading } = useQuery(
    GET_MEMO_BY_ID,
    () => ({
      ids: ids.value,
    }),
    {
      enabled: computed(() => ids.value.length > 0),
    }
  );

  // Return the provided data and functions
  return { result, loading };
}
