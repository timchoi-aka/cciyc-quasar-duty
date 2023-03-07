<template>
This is a test page for development
options: {{ displayOptions }}
<q-input v-model="memberID" label="c_mem_id"/>
<q-input v-model="mobile" label="mobile"/>
<q-toggle v-model="displayOptions.loadReceipt" label="顯示收據"/>
<q-toggle v-model="displayOptions.loadDetailReceipt" label="詳細收據"/>
<q-toggle v-model="displayOptions.loadMembership" label="顯示會藉"/>
<q-toggle v-model="displayOptions.loadDetail" label="詳細資料"/>
<q-toggle v-model="displayOptions.loadHousekeep" label="輔助資料"/>
<q-toggle v-model="displayOptions.loadRelation" label="關聯會員"/>
<q-btn label="搜尋" @click="search"/>
{{ memberData }}
</template>

<script setup>
import { computed, ref, reactive } from "vue";
import useMember from "components/Member/MemberData"

const memberID = ref("")
const mobile= ref("")
const displayOptions = ref({})
const searchCriteria = ref({})

const { members, loadMember } = useMember(searchCriteria, displayOptions)

// computed
const memberData = computed(() => members.value? members.value: [])

async function search() {
  if (memberID.value) {
    searchCriteria.value.c_mem_id = {
      compare: "_eq",
      value: memberID.value
    } 
  } else delete searchCriteria.value.c_mem_id
  
  if (mobile.value) {
    searchCriteria.value.c_tel = {
      compare: "_like",
      value: "%"+mobile.value+"%"
    }
  } else delete searchCriteria.value.c_tel

  await loadMember()
}
</script>