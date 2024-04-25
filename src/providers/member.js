import { ref, computed } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { gql } from "graphql-tag";
import Member from "src/components/class/member";

// Function to provide gallery data
export function useMemberProvider(options = {}) {
  // Destructure galleryID from options, default to a new ref if not provided
  // const { c_mem_id = ref() } = options;

  // Ref to keep track of the number of pending async operations
  const awaitNumber = ref(0);

  // Computed property that indicates whether there are any pending async operations
  const loading = computed(() => awaitNumber.value > 0);

  // GraphQL query string
  let GET_MEMBER = gql`
    query GetAllMember {
      Member {
        c_mem_id
        c_name
        c_name_other
        c_sex
        c_udf_1
        b_mem_type1
        b_mem_type10
        d_birth
        d_enter_1
        d_expired_1
        d_renew_1
        d_exit_1
      }
    }
  `;

  const { result: MemberResult } = useQuery(GET_MEMBER);

  const result = computed(() => {
    let res = [];

    if (MemberResult.value) {
      MemberResult.value.Member.forEach((item) => {
        res.push(new Member(item));
      });
    }
    return res;
  });

  // Return the provided data and functions
  return { result, loading };
}
