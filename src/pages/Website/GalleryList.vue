<template>
  <LoadingDialog :model-value="loading? 1: 0" message="載入中..."/>
  <div class="row justify-center">
    <q-table
      class="col-12"
      title="活動花絮"
      :loading="loading"
      :rows="result"
      :grid="true"
      :columns="columns"
      :filter="filter"
      :filter-method="customFilter"
      :pagination="defaultPagination"
      no-results-label="沒有搜尋結果"
      no-data-label="沒有相簿"
      row-key="GalleryID"
    >
      <!-- search bar -->
      <template v-slot:top="props">
        <q-input v-model="searchText" debounce="300" placeholder="搜尋相簿名稱">
          <template v-slot:append>
            <q-btn v-if="searchText" flat icon="cancel" @click="searchText=null" />
            <q-icon name="search" />
          </template>
        </q-input>
        <q-space/>
        <q-input v-model="newGalleryName" debounce="300" placeholder="新增相簿名稱">
          <template v-slot:append>
            <q-btn flat icon="save" @click="addNewGallery(newGalleryName)" />
          </template>
        </q-input>
      </template>

      <template v-slot:item="props">
        <GalleryCover :data="props.row" :type="type"
          @deleteGalleryById="deleteGalleryById"
          @toggleVisibilityById="toggleVisibilityById"
          @renameGalleryById="renameGalleryById"
          @updateCover="updateCoverById"
          />
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { date as qdate } from "quasar";
import { useGalleryProvider } from "src/providers/gallery";
import { useClassGalleryProvider } from "src/providers/classgallery";
import LoadingDialog from "src/components/LoadingDialog.vue";
import GalleryCover from "src/components/Gallery/GalleryCover.vue";
import { useRoute } from 'vue-router'
const route = useRoute()

const type = route.query.type;
const searchText = ref()
const newGalleryName = ref()
const defaultPagination = {
  sortBy: "AddTime",
  descending: true,
  rowsPerPage: 100,
};

const { result, loading, deleteGalleryById, toggleVisibilityById, renameGalleryById, updateCoverById, addNewGallery } = type === 'event' ? useGalleryProvider(): useClassGalleryProvider();
const filter = computed(() => ({
  searchText: searchText.value
}))

const columns = ref([
  {
    name: "GalleryName",
    label: "相簿名稱",
    field: "GalleryName",
    sortable: false,
    filter: true,
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

function customFilter(rows, terms) {
  return rows.filter(
    (row) => terms.searchText && terms.searchText.length > 0? row.GalleryName.toLowerCase().includes(terms.searchText.toLowerCase()) : true
  );
}
</script>
