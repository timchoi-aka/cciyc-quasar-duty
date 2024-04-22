<template>
  <q-btn
    v-if="!isFavourate"
    icon="favorite_outline"
    flat
    class="bg-blue-10 text-white"
    @click="add"
  >
    <q-tooltip class="bg-white text-primary">收藏</q-tooltip>
  </q-btn>
  <q-btn
    v-else
    icon="favorite"
    flat
    class="bg-blue-10 text-white"
    @click="remove"
  >
    <q-tooltip class="bg-white text-primary">取消收藏</q-tooltip>
  </q-btn>
</template>
<script setup>
import { computed } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { MY_EVENT_FAVOURATE } from "/src/graphQueries/Event/query.js";
import {
  ADD_FAVOURATE,
  REMOVE_FAVOURATE,
} from "/src/graphQueries/Event/mutation.js";

// props
const props = defineProps({
  username: String,
  c_act_code: String,
});

// queries
const { result, refetch } = useQuery(MY_EVENT_FAVOURATE, () => ({
  c_act_code: props.c_act_code,
  username: props.username,
}));
const { mutate: addFav, onDone: addFav_Completed } = useMutation(ADD_FAVOURATE);
const { mutate: removeFav, onDone: removeFav_Completed } =
  useMutation(REMOVE_FAVOURATE);

const isFavourate = computed(() =>
  result.value ? (result.value.Event_Favourate_by_pk ? true : false) : false
);

function add() {
  addFav({
    c_act_code: props.c_act_code,
    username: props.username,
  });
}

function remove() {
  removeFav({
    c_act_code: props.c_act_code,
    username: props.username,
  });
}

// callback
addFav_Completed((result) => {
  refetch();
});

removeFav_Completed((result) => {
  refetch();
});
</script>
