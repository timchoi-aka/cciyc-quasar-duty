<template>
  <q-select
    dense
    filled
    class="col-3 col-xs-3 q-mr-md-md q-mr-sm-sm q-mr-xs-none items-stretch content-stretch"
    use-input
    :hide-bottom-space="true"
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
                d_date_from: value.d_date_from,
                d_date_to: value.d_date_to,
                c_week: value.c_week,
                d_time_from: value.d_time_from,
                d_time_to: value.d_time_to,
                c_acc_type: value.c_acc_type,
                c_age_control: value.c_age_control,
                i_year_from: value.i_year_from,
                i_year_to: value.i_year_to,
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
            <span v-if="scope.opt.c_age_control">
              (
              <span v-if="scope.opt.i_year_from && scope.opt.i_year_to">
                {{ scope.opt.i_year_from }} - {{ scope.opt.i_year_to }}歲
              </span>
              <span v-else-if="scope.opt.i_year_from && !scope.opt.i_year_to">
                {{ scope.opt.i_year_from }}歲以上
              </span>
              <span v-else-if="!scope.opt.i_year_from && scope.opt.i_year_to">
                {{ scope.opt.i_year_to }}歲以下
              </span>
              )
            </span>
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
        <span v-if="props.modelValue.c_age_control">
          (
          <span
            v-if="props.modelValue.i_year_from && props.modelValue.i_year_to"
          >
            {{ props.modelValue.i_year_from }} -
            {{ props.modelValue.i_year_to }}歲
          </span>
          <span
            v-else-if="
              props.modelValue.i_year_from && !props.modelValue.i_year_to
            "
          >
            {{ props.modelValue.i_year_from }}歲以上
          </span>
          <span
            v-else-if="
              !props.modelValue.i_year_from && props.modelValue.i_year_to
            "
          >
            {{ props.modelValue.i_year_to }}歲以下
          </span>
          )
        </span>
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
        d_date_from
        d_date_to
        d_time_from
        d_time_to
        c_week
        c_age_control
        i_year_from
        i_year_to
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
          d_date_from: d.d_date_from
            ? date.extractDate(d.d_date_from.trim(), "D/M/YYYY")
            : null,
          d_date_to: d.d_date_to
            ? date.extractDate(d.d_date_to.trim(), "D/M/YYYY")
            : null,
          c_week: d.c_week ? d.c_week.trim() : null,
          d_time_from: d.d_time_from ? d.d_time_from.trim() : null,
          d_time_to: d.d_time_from ? d.d_time_to.trim() : null,
          c_acc_type: d.c_acc_type ? d.c_acc_type.trim() : null,
          c_age_control: d.c_age_control ? d.c_age_control.trim() : null,
          i_year_from: d.i_year_from ? d.i_year_from : null,
          i_year_to: d.i_year_to ? d.i_year_to : null,
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
