import { reactive, toRefs, toRef, unref, ref, computed } from "vue";
import gql from "graphql-tag";
import { useSubscription, useLazyQuery, useQuery } from "@vue/apollo-composable";
// import { provideApolloClient, DefaultApolloClient } from "@vue/apollo-composable";
// provideApolloClient(DefaultApolloClient)

export default function useMember(param, displayOptions) {
  const state = ref({
    members: [],
    latestMemberID: "",
  });

  const defaultParam = ref({})
  
  function buildParam() {
    let res = {}
    res.loadReceipt = displayOptions.value.loadReceipt? displayOptions.value.loadReceipt: false
    res.loadDetailReceipt = displayOptions.value.loadDetailReceipt? displayOptions.value.loadDetailReceipt: false
    res.loadDetail = displayOptions.value.loadDetail? displayOptions.value.loadDetail: false
    res.loadMembership = displayOptions.value.loadMembership? displayOptions.value.loadMembership: false
    res.loadHousekeep = displayOptions.value.loadHousekeep? displayOptions.value.loadHousekeep: false
    res.loadRelation = displayOptions.value.loadRelation? displayOptions.value.loadRelation: false
    res.where = {
      "_and": []
    }

    Object.keys(param.value).forEach((e) => {
      if (param.value[e]["value"]) {
        res.where["_and"].push({ [e]: {[param.value[e]["compare"]]: param.value[e]["value"]}})
      } 
    })
    
    return res
  }
  
  const { onResult: latestMemberID_Result } = useSubscription(gql`
    subscription getLatestMemberID {
      Member(limit: 1, order_by: {c_mem_id: desc}, offset: 1) {
        c_mem_id
      }
    }`)
  
  const { onResult: MemberInfo_Result, load, loading } = useSubscription(gql`
    fragment BasicInfo on Member {
      c_mem_id,
      b_mem_type1,
      b_mem_type10,
      d_birth,
      c_name,
      c_name_other,
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
        RelationMember1 {
          c_mem_id,
          d_birth,
          b_mem_type1,
          c_name,
          c_name_other,
        }
        RelationMember2 {
          c_mem_id,
          d_birth,
          b_mem_type1,
          c_name,
          c_name_other,
        }
      }
      MemberRelation2 {
        c_mem_id_1
        c_mem_id_2
        relation
        uuid
        RelationMember1 {
          c_mem_id,
          d_birth,
          b_mem_type1,
          c_name,
          c_name_other,
        }
        RelationMember2 {
          c_mem_id,
          d_birth,
          b_mem_type1,
          c_name,
          c_name_other,
        }
      }
    }
    subscription getMember(
      $where: Member_bool_exp = {},
      $loadDetailReceipt: Boolean! = false,
      $loadDetail: Boolean! = false,
      $loadMembership: Boolean! = false,
      $loadReceipt: Boolean! = false,
      $loadHousekeep: Boolean! = false,
      $loadRelation: Boolean! = false,
      ) {
      Member (where: $where){
        ...BasicInfo
        ...DetailInfo @include(if: $loadDetail)
        ...MembershipInfo @include(if: $loadMembership)
        ...ReceiptInfo @include(if: $loadReceipt)
        ...HousekeepInfo @include(if: $loadHousekeep)
        ...RelationInfo @include(if: $loadRelation)
      }
    }`, defaultParam)

  MemberInfo_Result((result) => {
    state.value.members = []
    result.data.Member.forEach((mem) => {
      state.value.members.push(mem)
    })
  })

  latestMemberID_Result((result) => {
    state.value.latestMemberID = result.data.Member[0].c_mem_id
  })

  const loadMember = () => {
    defaultParam.value = buildParam()
    // load()
  }

  return {...toRefs(state.value), loadMember, loading}
}