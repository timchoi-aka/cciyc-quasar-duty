<template>
  <q-tabs v-model="activeTab">
    <q-tab name="receipt" icon="receipt" label="收據" />

    <q-tab name="memo" label="備忘" icon="description" />
  </q-tabs>

  <q-tab-panels
    v-model="activeTab"
    animated
    swipeable
    transition-prev="jump-up"
    transition-next="jump-up"
  >
    <q-tab-panel name="receipt" class="q-ma-none q-pa-sm text-body1">
      <ReceiptListByMemberID_Multiple
        :MemberID="props.MemberID"
        :selectedReceipts="props.selectedReceipts"
        @updateReceiptNumber="(val) => emit('updateReceiptNumber', val)"
      />
    </q-tab-panel>
    <q-tab-panel name="memo" class="q-ma-none q-pa-sm text-body1">
      <MemoListByMemberID_Multiple
        :MemberID="props.MemberID"
        :selectedReceipts="props.selectedReceipts"
        @updateReceiptNumber="(val) => emit('updateReceiptNumber', val)"
      />
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup>
import { ref } from "vue";
import ReceiptListByMemberID_Multiple from "components/Account/ReceiptListByMemberID_Multiple.vue";
import MemoListByMemberID_Multiple from "components/Account/MemoListByMemberID_Multiple.vue";

const activeTab = ref("receipt");
const props = defineProps({
  MemberID: {
    type: String,
    required: false,
  },
  selectedReceipts: {
    type: Array,
    required: false,
  },
  selectedMemos: {
    type: Array,
    required: false,
  },
});
const emit = defineEmits(["updateReceiptNumber"]);
</script>
