<template>
  <div class="row col-12 items-center text-center">
    <div class="col-6 row">
      <div class="col-12">剩餘名額</div>
      <div class="col-12">
        <div v-if="!props.event.c_act_code">請選擇活動</div>
        <div v-else-if="props.event.c_act_code && !props.event.i_quota_max">
          無限制
        </div>
        <div v-else-if="loading">讀取中</div>
        <div v-else>
          {{ quotaLeft > 0 ? quotaLeft : "已滿" }}
        </div>
      </div>
    </div>
    <div class="col-6 row">
      <q-btn
        dense
        square
        color="primary"
        text-color="white"
        icon="list"
        label="詳情"
        @click="showRegistrants"
      >
        <q-tooltip>
          <q-list dense>
            <div>已報名人士</div>
            <q-item v-for="r in registrants" :key="r.c_mem_id">
              <q-item-section class="text-caption"
                >({{ r.c_mem_id }}) - {{ r.c_name }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { gql } from "graphql-tag";
import { useQuasar } from "quasar";
import EventBatchApplyRegistrantListModal from "./EventBatchApplyRegistrantListModal.vue";

// props & emits
const $q = useQuasar();
const props = defineProps({
  modelValue: {
    type: Number,
    required: false,
  },
  event: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["update:modelValue", "updateRegistrants"]);
const c_act_code = ref(props.event.c_act_code);

const EVENT_APPLY_AND_RECEIPT_BY_ACT_CODE = gql`
  query EVENT_APPLY_BY_ACT_CODE($c_act_code: String = "") {
    tbl_act_reg(
      where: {
        _and: [
          { c_act_code: { _eq: $c_act_code } }
          { b_refund: { _eq: false } }
        ]
      }
    ) {
      i_age
      d_reg
      d_refund
      c_user_id
      c_type
      c_tel
      c_sex
      c_remarks
      ID
      b_refund
      c_act_code
      c_mem_id
      c_name
      EventRegistration_to_Account_by_MID {
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
        m_remark2
        d_clear
        u_price_after_discount
        c_name
        b_clear
        b_refund
        b_delete
        c_mem_id
      }
    }
  }
`;

const { result, loading } = useQuery(
  EVENT_APPLY_AND_RECEIPT_BY_ACT_CODE,
  () => ({
    c_act_code: c_act_code.value,
  }),
  {
    pollInterval: 1000,
  }
);

const registrants = computed(() =>
  result.value && result.value.tbl_act_reg
    ? result.value.tbl_act_reg.map((r) => ({
        c_mem_id: r.c_mem_id,
        c_name: r.c_name,
      }))
    : []
);

const quotaLeft = computed(() => {
  return props.event.i_quota_max
    ? parseInt(props.event.i_quota_max) - registrants.value.length
    : "無限制";
});

watch(registrants, (newVal) => {
  if (newVal && newVal.length > 0) {
    props.event.i_quota_max
      ? emit(
          "update:modelValue",
          parseInt(props.event.i_quota_max) - newVal.length
        )
      : emit("update:modelValue", 9999);
    emit(
      "updateRegistrants",
      Array.from(new Set(newVal.map((r) => r.c_mem_id)))
    );
  }
});

function showRegistrants() {
  $q.dialog({
    component: EventBatchApplyRegistrantListModal,
    // props forwarded to your custom component
    componentProps: {
      registrants: registrants.value,
    },
  });
}
</script>
