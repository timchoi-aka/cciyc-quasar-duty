<template>
  <div v-if="props.modelValue.c_mem_id == '9999'" class="col-grow">
    <q-input
      type="text"
      :model-value="props.modelValue.c_name"
      label="姓名"
      @blur="
        () =>
          emit('update:modelValue', {
            c_mem_id: props.modelValue.c_mem_id,
            u_fee: props.modelValue.u_fee,
            c_name: props.modelValue.c_name,
            c_sex: '',
            c_tel: '',
            i_age: 0,
            d_expired_1: null,
          })
      "
      @update:model-value="
        (val) =>
          emit('update:modelValue', {
            c_mem_id: props.modelValue.c_mem_id,
            u_fee: props.modelValue.u_fee,
            c_name: val,
            c_sex: '',
            c_tel: '',
            i_age: 0,
            d_expired_1: null,
          })
      "
    />
  </div>
  <div v-else class="col-grow">
    {{
      Member.c_name
        ? Member.c_name
        : Member.c_name_other
        ? Member.c_name_other
        : "無此人"
    }}
  </div>
  <div class="col-grow">{{ ageUtil.calculateAge(Member.d_birth) }}</div>
  <div class="col-grow">{{ Member.c_udf_1 }}</div>
  <div class="col-grow">
    {{
      Member.d_expired_1
        ? qdate.getDateDiff(Member.d_expired_1, new Date(3000, 0, 1)) >= 0
          ? "永久"
          : qdate.formatDate(Member.d_expired_1, "YYYY年M月D日")
        : ""
    }}
  </div>
</template>

<script setup>
import { computed } from "vue";
import { date as qdate } from "quasar";
import { gql } from "graphql-tag";
import { useQuery } from "@vue/apollo-composable";
import ageUtil from "src/lib/utils.js";

const props = defineProps({
  modelValue: Object,
});
const emit = defineEmits(["update:modelValue"]);

const { result, onResult } = useQuery(
  gql`
    query Member_getNameFromID($c_mem_id: String = "") {
      Member_by_pk(c_mem_id: $c_mem_id) {
        c_mem_id
        d_birth
        c_udf_1
        b_mem_type1
        c_name
        c_name_other
        d_expired_1
        c_tel
        c_sex
      }
    }
  `,
  () => ({
    c_mem_id: props.modelValue
      ? props.modelValue.c_mem_id
        ? props.modelValue.c_mem_id
        : ""
      : "",
  })
);

const Member = computed(() => result.value?.Member_by_pk ?? {});

onResult((result) => {
  if (result.data && result.data.Member_by_pk) {
    emit("update:modelValue", {
      c_mem_id: props.modelValue.c_mem_id,
      u_fee: props.modelValue.u_fee,
      c_name: result.data.Member_by_pk.c_name
        ? result.data.Member_by_pk.c_name.trim()
        : result.data.Member_by_pk.c_name_other.trim(),
      c_sex: result.data.Member_by_pk.c_sex,
      c_tel: result.data.Member_by_pk.c_tel,
      i_age: ageUtil.calculateAge(result.data.Member_by_pk.d_birth),
      d_expired_1: result.data.Member_by_pk.d_expired_1,
    });
  } else {
    emit("update:modelValue", {
      c_mem_id: props.modelValue.c_mem_id,
      u_fee: props.modelValue.u_fee,
      c_name: "無此人",
      c_sex: "",
      c_tel: "",
      i_age: 0,
      d_expired_1: null,
    });
  }
});
</script>
