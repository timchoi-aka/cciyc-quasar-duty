<template>
  <div class="row">
    <q-input
      dense
      filled
      class="col-3 col-xs-3 q-mr-md-md q-mr-sm-sm q-mr-xs-none"
      debounce="500"
      type="text"
      mask="####"
      @update:model-value="(value) => getNameFromMemberID(value)"
      v-model="relatedMember.c_mem_id_2"
    />
    <q-select
      dense
      filled
      class="col-3 col-xs-3 q-mr-md-md q-mr-sm-sm q-mr-xs-none"
      v-model="relatedMember.relation"
      :options="relationOptions"
      @update:model-value="$emit('updateMember', relatedMember)"
    />
    <span class="col-3 col-xs-3 q-mr-md-md q-mr-sm-sm q-mr-xs-none">
      {{ relatedMember.targetName }}
      <span v-if="relatedMember.age != null">({{relatedMember.age}})</span>
    </span>
    <span class="col-1 col-xs-1 q-mr-md-md q-mr-sm-sm q-mr-xs-none">
      <q-icon
        v-if="relatedMember.b_mem_type1"
        color="positive"
        name="check"
        />
      <q-icon v-if="relatedMember.b_mem_type1 == false" color="negative" name="cancel" />
    </span>
    <span class="col-1 col-xs-1 q-mr-md-none q-mr-sm-none q-mr-xs-none">
      <q-btn
        square
        flat
        class="text-negative"
        icon="clear"
        @click="reset"
      />
    </span>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { GET_NAME_FROM_IDS } from "/src/graphQueries/Member/query.js";
import ageUtil from "src/lib/calculateAge.js"
import { useQuery } from "@vue/apollo-composable"
import { is } from "quasar";

const emit = defineEmits(['updateMember'])
const props = defineProps({
  MemberID: String,
})

const relatedMember = ref({
  c_mem_id_1: "",
  c_mem_id_2: "",
  relation: "",
  targetName: "",
  age: null,
  d_birth: "",
  b_mem_type1: false,
})

const relationOptions = ["父母子女", "兄弟姐妹", "其他親人"]

let variables = ref([""])
const { onResult } = useQuery(
  GET_NAME_FROM_IDS,
  () => ({
    c_mem_ids: variables.value
  })
)

onResult((data) => {      
  const result = data.data.Member[0]
  if (is.object(result)) {
    relatedMember.value.c_mem_id_1 = props.MemberID
    relatedMember.value.targetName = result.c_name
      ? result.c_name
      : result.c_name_other
    relatedMember.value.b_mem_type1 = result.b_mem_type1
    relatedMember.value.age = ageUtil.calculateAge(result.d_birth)
    relatedMember.value.d_birth = result.d_birth
  } else {
    relatedMember.value.targetName = "沒有此會員"
    relatedMember.value.age = null
    relatedMember.value.d_birth = null
  }
  
  emit("updateMember", relatedMember.value)
})

function reset() {
  relatedMember.value = {
    c_mem_id_2: "",
    relation: "",
    targetName: "",
    age: null,
    d_birth: "",
    b_mem_type1: false,
  }
}
function getNameFromMemberID(c_mem_ids) {
  variables.value = [c_mem_ids]
}
</script>