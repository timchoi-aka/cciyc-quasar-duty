<template>
  <LoadingDialog :model-value="loading? 1: 0" message="載入中..."/>
  <div class="row q-pa-md">
    <span class="col-12 text-h6">相簿名稱（中文）：{{ result.length > 0? result[0].GalleryName: '' }}</span>
    <span class="col-12 text-h6">相簿名稱（英文）：{{ result.length > 0? result[0].GalleryNameEN: '' }}</span>
  </div>
  <q-table
    class="col-12"
    title="相簿內容"
    :loading="loading"
    :rows="photos"
    :grid="true"
    :columns="columns"
    :pagination="defaultPagination"
    no-results-label="沒有搜尋結果"
    no-data-label="沒有相簿"
    row-key="GalleryID"
    >
      <template v-slot:top>
        <q-btn label="上載相片" color="primary" @click="upload"/>
      </template>
      <template v-slot:item="props">
        <q-card class="q-pa-xs col-xs-12 col-sm-6 col-md-2 q-mb-xs q-mx-none">
            <q-card-section class="row items-center">
              <div class="col-10">{{ props.row.PhotoName }}</div>
              <q-space/>

            </q-card-section>
            <q-card-section class="row q-pa-none q-pa-none">
              <GalleryImage :row="props.row"/>
            </q-card-section>
            <q-space/>
            <q-card-actions class="q-mx-none" align="right">
              <q-btn flat class="text-warning" icon="rotate_right" outline @click="updateOrientationById({ PhotoID: props.row.PhotoID, Orientation: props.row.Orientation + 90})">
                <q-tooltip>旋轉</q-tooltip>
              </q-btn>
              <q-btn flat :class="['col-1', props.row.IsShow ? 'text-primary': 'text-negative']" :icon="props.row.IsShow ? 'visibility' : 'visibility_off'" @click="toggleVisibilityById(props.row.PhotoID)">
                <q-tooltip>{{props.row.IsShow ? '隱藏': '顯示'}}</q-tooltip>
              </q-btn>
              <q-btn align="between" flat color="red" icon="delete" @click="remove(props.row)">
                <q-tooltip>刪除</q-tooltip>
              </q-btn>
            </q-card-actions>
        </q-card>
      </template>
  </q-table>
</template>

<script setup>
import { ref, computed } from "vue";
import { date as qdate } from "quasar";
import { useGalleryProvider } from "src/providers/gallery";
import { useClassGalleryProvider } from "src/providers/classgallery";
import { useGalleryPhotoProvider } from "src/providers/galleryphoto";
import { useClassGalleryPhotoProvider } from "src/providers/classgalleryphoto";
import LoadingDialog from "src/components/LoadingDialog.vue";
import { useQuasar } from "quasar";
import { useRoute } from 'vue-router'
import GalleryFileUpload from "/src/components/Basic/GalleryFileUpload.vue";
import GalleryImage from "/src/components/Gallery/GalleryImage.vue";

const route = useRoute()
const $q = useQuasar()

const defaultPagination = {
  sortBy: "AddTime",
  descending: true,
  rowsPerPage: 100,
};
const columns = ref([
  {
    name: "PhotoName",
    label: "相片名稱",
    field: "GalleryName",
    sortable: false,
    filter: true,
  },
  {
    name: "PhotoID",
    label: "相片ID",
    field: "PhotoID",
    display: false,
  },
  {
    name: "AddTime",
    label: "最後更新",
    field: "AddTime",
    sortable: true,
    filter: false,
    format: (val) => qdate.formatDate(val, "YYYY年M月D日"),
  },
  {
    name: "IsShow",
    label: "顯示",
    field: "IsShow",
    sortable: false,
    filter: false,
    format: (val) => val ? "顯示" : "隱藏",
  },
])

const { result, loading: loadingGallery } = route.query.type == 'event'? useGalleryProvider({galleryID: ref(parseInt(route.params.id))}): useClassGalleryProvider({galleryID: ref(parseInt(route.params.id))});;
const { result: photoResult, loading: loadingClassGallery, deleteGalleryPhotoById, addGalleryPhotos, toggleVisibilityById, updateOrientationById } = route.query.type == 'event'? useGalleryPhotoProvider({galleryID: ref(parseInt(route.params.id))}): useClassGalleryPhotoProvider({galleryID: ref(parseInt(route.params.id))});

const photos = computed(() => photoResult.value)
const loading = computed(() => loadingGallery.value || loadingClassGallery.value)

function remove(row) {
  $q.dialog({
    title: "確定要刪除此相片嗎？",
    cancel: true,
    persistent: true,
  }).onOk(() => {
    deleteGalleryPhotoById(row.PhotoID)
  });
}

function upload() {
  $q.dialog({
    component: GalleryFileUpload,
    componentProps: {
      path: route.query.type == 'event'? 'GalleryPhotos/' + route.params.id: 'ClassGalleryPhotos/' + route.params.id,
      mode: "multiple"
    },
  }).onOk((filename) => {
    if (filename.value) {
      let objects = []
      filename.value.forEach((f) => {
        objects.push({
          AddTime: new Date(),
          GalleryID: parseInt(route.params.id),
          IsShow: 1,
          PhotoName: null,
          PhotoUrl: "https://storage.googleapis.com/cciyc-web/" + (route.query.type == 'event'? "GalleryPhotos/": "ClassGalleryPhotos/") + route.params.id + "/" + f,
          Orientation: 0,
        })
      })
      addGalleryPhotos(objects)
    }
  });
}
</script>
