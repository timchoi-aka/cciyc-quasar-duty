<template>
  <LoadingDialog :model-value="loading? 1: 0" message="載入中..."/>
  <q-table
    :rows="result"
    :grid="true"
    :pagination="defaultPagination"
  >
  <template v-slot:item="props">
    <q-card class="q-pa-xs col-xs-12 col-sm-6 col-md-2 q-mb-xs q-mx-sm">
        <q-card-section class="row">
          {{ props.row.GalleryName }}
        </q-card-section>
        <q-card-section>
          <q-img :src="props.row.CoverPic" class="col-12" />
        </q-card-section>
        <q-space/>
        <q-card-section class="row">
          <div class="col-grow">最後更新：{{ qdate.formatDate(props.row.AddTime, 'YYYY年M月D日') }}</div>
          <div class="col-auto">顯示：<q-icon :name="props.row.IsShow ? 'check' : 'close'" /></div>
        </q-card-section>
    </q-card>
  </template>
  </q-table>
</template>

<script setup>
import { date as qdate } from "quasar";
import { useGalleryProvider } from "src/providers/gallery";
import LoadingDialog from "src/components/LoadingDialog.vue";

const defaultPagination = {
  sortBy: "AddTime",
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
};
const { result, loading } = useGalleryProvider();
</script>
