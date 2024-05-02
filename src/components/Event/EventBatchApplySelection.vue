<template>
  <q-select
    dense
    filled
    class="col-3 col-xs-3 q-mr-md-md q-mr-sm-sm q-mr-xs-none"
    use-input
    label="活動編號"
    input-debounce="0"
    :options="EventOptions"
    :model-value="props.modelValue"
    @filter="eventFilter"
    @update:model-value="
      (value) =>
        emit(
          'update:modelValue',
          value
            ? {
                c_act_code: value.value.trim(),
                c_act_name: value.c_act_name.trim(),
                b_freeofcharge: value.b_freeofcharge,
                i_quota_max: value.i_quota_max,
              }
            : {
                c_act_code: '',
              }
        )
    "
  >
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label>
            {{ scope.opt.value }} -
            {{ scope.opt.c_act_name }}
            <q-chip
              v-if="scope.opt.b_freeofcharge"
              size="sm"
              class="bg-warning text-white"
              >免費</q-chip
            >
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:selected>
      <div v-if="props.modelValue.c_act_code != ''">
        {{ props.modelValue.c_act_code }} -
        {{ props.modelValue.c_act_name }}
      </div>
    </template>
    <template v-slot:no-option> 沒有結果 </template>
  </q-select>
</template>

<script setup>
import { ref } from "vue";
import { useQuery } from "@vue/apollo-composable";
import { gql } from "graphql-tag";
import { date } from "quasar";

// props & emits
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["update:modelValue"]);

// variables
const EventOptions = ref([]);
const OriginalEventOptions = ref([]);

// query
const { onResult: NameResult } = useQuery(
  gql`
    query getActiveEvent {
      HTX_Event(
        order_by: { c_act_code: desc }
        where: { c_status: { _eq: "未完成" } }
      ) {
        c_act_code
        c_act_name
        c_nature
        c_respon
        c_type
        c_status
        c_group1
        c_group2
        c_acc_type
        b_freeofcharge
        d_sale_start
        d_sale_end
        i_quota_max
      }
    }
  `,
  {},
  {
    pollInterval: 5000,
  }
);

// callback
NameResult((result) => {
  if (result.data) {
    EventOptions.value = [];
    let now = new Date();

    result.data.HTX_Event.forEach((d) => {
      if (
        date.isBetweenDates(
          now,
          date.extractDate(d.d_sale_start, "D/M/YYYY"),
          date.extractDate(d.d_sale_end, "D/M/YYYY"),
          {
            inclusiveFrom: true,
            inclusiveTo: true,
            onlyDate: true,
          }
        )
      ) {
        EventOptions.value.push({
          value: d.c_act_code,
          c_act_name: d.c_act_name,
          c_status: d.c_status,
          b_freeofcharge: d.b_freeofcharge,
          i_quota_max: d.i_quota_max,
        });
      }
    });

    OriginalEventOptions.value = EventOptions.value;
  }
});

// function
function eventFilter(val, update) {
  if (val === "") {
    update(() => {
      EventOptions.value = OriginalEventOptions.value;
    });
    return;
  }

  update(() => {
    EventOptions.value = OriginalEventOptions.value;
    EventOptions.value = EventOptions.value.filter(
      (v) =>
        (v.value ? v.value.indexOf(val) > -1 : false) ||
        (v.c_act_name
          ? v.c_act_name.toLowerCase().indexOf(val.toLowerCase()) > -1
          : false)
    );
  });
}
</script>
