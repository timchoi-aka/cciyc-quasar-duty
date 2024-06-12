<template>
  <div class="row">
    <div class="col-2" v-if="relatedMember.c_mem_id_1 == props.MemberID">
      <MemberSelection :key="props.MemberID" :MemberID="props.MemberID" v-model="relatedMember.c_mem_id_2"
        @update:model-value="(value) => getNameFromMemberID(value)" />
    </div>
    <div class="col-2" v-else>
      <MemberSelection :key="props.MemberID" :MemberID="props.MemberID" v-model="relatedMember.c_mem_id_1"
        @update:model-value="(value) => getNameFromMemberID(value)" />
    </div>

    <q-select dense filled class="col-2 col-xs-2 q-mr-md-md q-mr-sm-sm q-mr-xs-none" v-model="relatedMember.relation"
      :options="relationOptions" @update:model-value="$emit('update:modelValue', relatedMember)" />

    <span class="col-2 col-xs-2 q-mr-md-md q-mr-sm-sm q-mr-xs-none">
      {{ relatedMember.name }}
      <span v-if="relatedMember.age != null">({{ relatedMember.age }})</span>
    </span>

    <span class="col-1 col-xs-1 q-mr-md-md q-mr-sm-sm q-mr-xs-none">
      <q-icon v-if="relatedMember.b_mem_type1" color="positive" name="check" />
      <q-icon v-else color="negative" name="cancel" />
    </span>

    <span class="col-2 col-xs-2 q-mr-md-md q-mr-sm-sm q-mr-xs-none">
      {{ qdate.formatDate(relatedMember.d_effective, "YYYY年M月D日") }}
    </span>

    <span class="col-1 col-xs-1 q-mr-md-none q-mr-sm-none q-mr-xs-none">
      <q-btn square flat class="text-negative" icon="replay" @click="reset">
        <q-tooltip class="bg-white text-red">重置</q-tooltip>
      </q-btn>
    </span>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { GET_NAME_FROM_ID } from "/src/graphQueries/Member/query.js";
import ageUtil from "src/lib/calculateAge.js";
import MemberSelection from "components/Member/MemberSelection.vue";
import { useQuery } from "@vue/apollo-composable";
import { is, date as qdate } from "quasar";
import Member from "src/components/class/member";

// props and emits
const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  MemberID: String,
  modelValue: Object,
});

// variables
const relatedMember = ref({
  c_mem_id_1: props.modelValue.c_mem_id_1 ? props.modelValue.c_mem_id_1 : "",
  c_mem_id_2: props.modelValue.c_mem_id_2 ? props.modelValue.c_mem_id_2 : "",
  relation: props.modelValue.relation ? props.modelValue.relation : "",
  delete: props.modelValue.delete ? props.modelValue.delete : false,
  name: props.modelValue.name ? props.modelValue.name : "",
  age: props.modelValue.age ? props.modelValue.age : null,
  d_birth: props.modelValue.d_birth ? props.modelValue.d_birth : null,
  b_mem_type1: props.modelValue.b_mem_type1
    ? props.modelValue.b_mem_type1
    : false,
  uuid: props.modelValue.uuid ? props.modelValue.uuid : "",
  d_exit_1: props.modelValue.d_exit_1 ? props.modelValue.d_exit_1 : null,
  d_expired_1: props.modelValue.d_expired_1
    ? props.modelValue.d_expired_1
    : null,
  d_effective: props.modelValue.d_effective
});
const originalValue = ref({});

const relationOptions = ["父母子女", "兄弟姐妹", "其他親人"];
const variables =
  props.modelValue.c_mem_id_1 == props.MemberID
    ? ref(props.modelValue.c_mem_id_2)
    : props.modelValue.c_mem_id_2 == props.MemberID
      ? ref(props.modelValue.c_mem_id_1)
      : ref("");

// query
const { onResult } = useQuery(GET_NAME_FROM_ID, () => ({
  c_mem_id: variables.value,
}));

// query callback
onResult((data) => {
  const result = data.data ? data.data.Member_by_pk : null;

  if (!is.object(result)) {
    relatedMember.value.c_mem_id_1 =
      relatedMember.value.c_mem_id_1 == props.MemberID.trim()
        ? props.MemberID.trim()
        : "";
    relatedMember.value.c_mem_id_2 =
      relatedMember.value.c_mem_id_2 == props.MemberID.trim()
        ? props.MemberID.trim()
        : "";
    relatedMember.value.name = "無此人";
    relatedMember.value.b_mem_type1 = false;
    relatedMember.value.age = null;
    relatedMember.value.d_birth = null;
    relatedMember.value.d_exit_1 = null;
    relatedMember.value.d_expired_1 = null;

    return;
  }

  if (result.c_mem_id != props.MemberID) {
    relatedMember.value.c_mem_id_1 =
      relatedMember.value.c_mem_id_1.trim() == props.MemberID.trim()
        ? props.MemberID.trim()
        : result.c_mem_id;
    relatedMember.value.c_mem_id_2 =
      relatedMember.value.c_mem_id_2.trim() == props.MemberID.trim()
        ? props.MemberID.trim()
        : result.c_mem_id;
    relatedMember.value.name = result.c_name
      ? result.c_name
      : result.c_name_other;
    relatedMember.value.b_mem_type1 =
      result.b_mem_type1 &&
      !result.d_exit_1 &&
      result.d_expired_1 &&
      qdate.getDateDiff(Date.now(), result.d_expired_1) < 0;
    relatedMember.value.age = ageUtil.calculateAge(result.d_birth);
    relatedMember.value.d_birth = result.d_birth;
    relatedMember.value.d_exit_1 = result.d_exit_1;
    relatedMember.value.d_expired_1 = result.d_expired_1;
    relatedMember.value.d_effective = relatedMember.value.d_effective
      ? relatedMember.value.d_effective
      : qdate.startOfDate(new Date(), 'day');
  } else {
    relatedMember.value.c_mem_id_1 =
      relatedMember.value.c_mem_id_1 == props.MemberID.trim()
        ? props.MemberID.trim()
        : "";
    relatedMember.value.c_mem_id_2 =
      relatedMember.value.c_mem_id_2 == props.MemberID.trim()
        ? props.MemberID.trim()
        : "";
    relatedMember.value.name = "無此人";
    relatedMember.value.b_mem_type1 = false;
    relatedMember.value.age = null;
    relatedMember.value.d_birth = null;
    relatedMember.value.d_exit_1 = null;
    relatedMember.value.d_expired_1 = null;
    relatedMember.value.d_effective = qdate.startOfDate(new Date(), 'day');
  }

  if (Object.keys(originalValue.value).length == 0) {
    originalValue.value = JSON.parse(JSON.stringify(relatedMember.value));
  }

  emit("update:modelValue", relatedMember.value);
});

// function
function reset() {
  relatedMember.value = JSON.parse(JSON.stringify(originalValue.value));
  emit("update:modelValue", relatedMember.value);
}

function getNameFromMemberID(c_mem_id) {
  if (c_mem_id) variables.value = c_mem_id;
  else variables.value = "";
}
</script>
