<template>
  <div v-if="!props.modelValue.c_act_code || loading"></div>
  <q-select
    v-else-if="feeList.length > 0"
    key="non-free-event"
    use-input
    filled
    dense
    input-debounce="0"
    :options="feeList"
    :model-value="event"
    label="收費類型"
    @new-value="newFee"
    @update:model-value="
      (value) =>
        emit('update:modelValue', {
          ...event,
          c_type: value.c_type,
          u_fee: parseInt(value.u_fee),
        })
    "
  >
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label
            >{{ scope.opt.c_type }} - ${{ scope.opt.u_fee }}</q-item-label
          >
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:selected>
      <div v-if="event.c_type">{{ event.c_type }} - ${{ event.u_fee }}</div>
    </template>
  </q-select>
  <div v-else><q-chip label="免費活動" /></div>
</template>

<script setup>
import { ref, toRef, computed } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { gql } from "graphql-tag";
import { useQuasar } from "quasar";

const $q = useQuasar();
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["update:modelValue"]);
const event = toRef(props, "modelValue");
const feeList = ref([]);

const EVENT_FEE_BY_ACT_CODE = gql`
  query eventFeeByActCode($c_act_code: String = "") {
    tbl_act_fee(where: { c_act_code: { _eq: $c_act_code } }) {
      c_act_code
      c_type
      u_fee
    }
  }
`;
const { onResult, loading } = useQuery(
  EVENT_FEE_BY_ACT_CODE,
  () => ({
    c_act_code: event.value && event.value.c_act_code,
  }),
  {
    enabled: computed(() => event.value && event.value.c_act_code != null),
  }
);

onResult((result) => {
  if (result.data) {
    feeList.value = JSON.parse(JSON.stringify(result.data.tbl_act_fee));
  }
});

function newFee(val, done) {
  if (val.length > 0) {
    let i = feeList.value.findIndex((element) => element.value == val);
    if (i == -1) {
      if (val <= 0) {
        $q.notify({
          message: "收費必須大於0！",
          icon: "error",
          color: "negative",
          textColor: "white",
        });
      } else {
        feeList.value.push({
          c_type: "特別收費",
          u_fee: val,
        });
        done(feeList.value[feeList.value.length - 1], "toggle");
      }
    } else {
      done(feeList.value[i], "toggle");
    }
  }
}
</script>
