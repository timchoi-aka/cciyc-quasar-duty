import { ref, computed } from "vue";
import { useQuery, useMutation, useSubscription } from "@vue/apollo-composable";
import { gql } from "graphql-tag";
import Member from "src/components/class/member";

// Function to provide member data
export function useAllMemberProvider() {
  // GraphQL query string
  const GET_MEMBER = gql`
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

  // latest member id subscription
  const GET_LATEST_MEMBER_ID = gql`
    subscription Member_getLatestMemberID {
      Member(limit: 1, order_by: { c_mem_id: desc }, offset: 1) {
        c_mem_id
      }
    }
  `;

  // query to get all member id, refresh every 5 sec
  const { result: MemberResult } = useQuery(GET_MEMBER, null, {
    pollInterval: 5000, // Poll every 5000 milliseconds (5 seconds)
  });

  // subscription to get latest member id
  const { result: latestMemberID_Result } =
    useSubscription(GET_LATEST_MEMBER_ID);

  const result = computed(() => {
    let res = [];

    if (MemberResult.value) {
      MemberResult.value.Member.forEach((item) => {
        res.push(new Member(item));
      });
    }
    return res;
  });

  const latestMemberID = computed(() =>
    latestMemberID_Result.value && latestMemberID_Result.value.Member.length > 0
      ? parseInt(latestMemberID_Result.value.Member[0].c_mem_id)
      : -1
  );

  // Return the provided data and functions
  return { result, latestMemberID };
}

export function useMemberProvider(options = {}) {
  const {
    c_mem_id = ref(null),
    loadDetailReceipt = ref(false),
    loadDetail = ref(false),
    loadMembership = ref(false),
    loadReceipt = ref(false),
    loadHousekeep = ref(false),
    loadRelation = ref(false),
  } = options;

  // Ref to keep track of the number of pending async operations
  const awaitNumber = ref(0);

  // Computed property that indicates whether there are any pending async operations
  const loading = computed(() => awaitNumber.value > 0 || loadingEvent);

  // returned message to be displayed to client
  const message = ref({});

  // GraphQL query string
  const GET_MEMBER = gql`
    fragment BasicInfo on Member {
      c_mem_id
      b_mem_type1
      b_mem_type10
      d_birth
      c_name
      c_name_other
      c_sex
    }
    fragment ReceiptInfo on Member {
      MemberAccount {
        c_receipt_no
        ...DetailReceiptInfo @include(if: $loadDetailReceipt)
      }
    }
    fragment DetailReceiptInfo on tbl_account {
      c_act_code
      c_desc
      c_cash_type
      c_receipt_no
      c_type
      c_user_id
      d_create
      i_prints
      i_receipt_type
      m_remark
      d_clear
      u_price_after_discount
      c_name
      b_clear
    }
    fragment DetailInfo on Member {
      c_mobile
      c_email
      c_tel
      c_emer_name
      c_emer_rel
      c_emer_tel1_1
    }
    fragment HousekeepInfo on Member {
      c_update_user
      d_update
      d_write
      m_addscom
    }
    fragment MembershipInfo on Member {
      c_udf_1
      d_enter_1
      d_exit_1
      d_expired_1
      d_renew_1
    }
    fragment RelationInfo on Member {
      MemberRelation1 {
        c_mem_id_1
        c_mem_id_2
        relation
        uuid
        d_effective
        RelationMember1 {
          c_mem_id
          d_birth
          b_mem_type1
          c_name
          c_name_other
          d_expired_1
          d_exit_1
          c_udf_1
        }
        RelationMember2 {
          c_mem_id
          d_birth
          b_mem_type1
          c_name
          c_name_other
          d_expired_1
          d_exit_1
          c_udf_1
        }
      }
      MemberRelation2 {
        c_mem_id_1
        c_mem_id_2
        relation
        uuid
        d_effective
        RelationMember1 {
          c_mem_id
          d_birth
          b_mem_type1
          c_name
          c_name_other
          d_expired_1
          d_exit_1
          c_udf_1
        }
        RelationMember2 {
          c_mem_id
          d_birth
          b_mem_type1
          c_name
          c_name_other
          d_expired_1
          d_exit_1
          c_udf_1
        }
      }
    }
    query MemberData_getMember(
      $c_mem_id: String = ""
      $loadDetailReceipt: Boolean! = false
      $loadDetail: Boolean! = false
      $loadMembership: Boolean! = false
      $loadReceipt: Boolean! = false
      $loadHousekeep: Boolean! = false
      $loadRelation: Boolean! = false
    ) {
      Member_by_pk(c_mem_id: $c_mem_id) {
        ...BasicInfo
        ...DetailInfo @include(if: $loadDetail)
        ...MembershipInfo @include(if: $loadMembership)
        ...ReceiptInfo @include(if: $loadReceipt)
        ...HousekeepInfo @include(if: $loadHousekeep)
        ...RelationInfo @include(if: $loadRelation)
      }
    }
  `;

  // Return the provided data and functions
  const {
    result: MemberResult,
    onResult,
    refetch,
  } = useQuery(
    GET_MEMBER,
    () => ({
      c_mem_id: c_mem_id.value,
      loadDetailReceipt: loadDetailReceipt.value,
      loadDetail: loadDetail.value,
      loadMembership: loadMembership.value,
      loadReceipt: loadReceipt.value,
      loadHousekeep: loadHousekeep.value,
      loadRelation: loadRelation.value,
    }),
    {
      enabled: computed(() => c_mem_id.value != null),
    }
  );

  const result = computed(() =>
    MemberResult.value && MemberResult.value.Member_by_pk
      ? new Member(MemberResult.value.Member_by_pk)
      : //MemberResult.value.Member_by_pk
        null
  );

  // Return the provided data and functions
  return {
    result,
    message,
    loading,
    refetch,
    onResult,
  };
}
