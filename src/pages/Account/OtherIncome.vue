<template>
  <q-page class="row q-pa-sm">
    <div class="col-3"><MemberSelection v-model="MemberObject.c_mem_id"/></div>
    <div class="col-2">
      <q-card>
        <q-card-section>
          <MemberInfoByID v-model="MemberObject"/>
        </q-card-section>
      </q-card>
    </div>
    <AccountTypeSelection v-model="accountType"/>
  </q-page>
</template>

<script setup>
import { ref } from "vue"
import MemberSelection from "components/Member/MemberSelection.vue"
import MemberInfoByID from "components/Member/MemberInfoByID.vue"
import AccountTypeSelection from "components/Account/AccounTypeSelection.vue"

const MemberObject = ref({})
const accountType = ref()
</script>