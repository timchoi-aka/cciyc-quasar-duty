<template></template>

<script setup>
import { ref, watch, inject, onUnmounted, onDeactivated } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";

const router = useRouter();
const bus = inject("bus");
const pendingPlans = ref([]);
const pendingEvals = ref([]);

bus.on("pendingPlan", (data) => {
  pendingPlans.value = data;
});

bus.on("pendingEval", (data) => {
  pendingEvals.value = data;
});

const $q = useQuasar();
const dismissPlans = ref();
const dismissEvals = ref();

watch(pendingPlans, (val) => {
  if (val.length > 0) {
    let actions = [
      {
        label: "隱藏",
        color: "red",
        size: "md",
        handler: () => {},
      },
    ];
    val.forEach((act) => {
      actions.push({
        label: act.c_act_code + " - " + act.c_act_name,
        color: "black",
        size: "sm",
        outline: true,
        handler: () => {
          router.push("/event/detail/" + act.c_act_code + "/evaluation/edit");
        },
      });
    });

    if (dismissPlans.value) dismissPlans.value();

    dismissPlans.value = $q.notify({
      type: "warning",
      color: "yellow-2",
      message: "你有逾期未完成的活動計劃！",
      icon: "warning",
      timeout: 0,
      position: "bottom-right",
      actions: actions,
    });
  }
});

watch(pendingEvals, (val) => {
  if (val.length > 0) {
    let actions = [
      {
        label: "隱藏",
        color: "red",
        size: "md",
        handler: () => {},
      },
    ];
    val.forEach((act) => {
      actions.push({
        label: act.c_act_code + " - " + act.c_act_name,
        color: "black",
        size: "sm",
        handler: () => {
          router.push("/event/detail/" + act.c_act_code + "/evaluation/edit");
        },
      });
    });

    if (dismissEvals.value) dismissEvals.value();

    dismissEvals.value = $q.notify({
      type: "warning",
      color: "teal-2",
      message: "你有逾期未完成的活動檢討！",
      icon: "warning",
      timeout: 0,
      position: "bottom-right",
      actions: actions,
    });
  }
});

onUnmounted(() => {
  if (dismissPlans.value) dismissPlans.value();
  if (dismissEvals.value) dismissEvals.value();
});

onDeactivated(() => {
  if (dismissPlans.value) dismissPlans.value();
  if (dismissEvals.value) dismissEvals.value();
});
</script>
