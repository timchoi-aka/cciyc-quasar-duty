<template>
  <q-card class="q-pa-xs col-xs-12 col-sm-6 col-md-3 q-mb-xs q-mx-none q-pa-none">
    <q-card-section class="row no-wrap items-center q-px-md q-py-none q-ma-none bg-blue-2 text-body2">
      <div class="col-10 row no-wrap items-center">
        <span class="col-auto" v-if="!edit">{{ props.data.GalleryName }}</span>
        <span class="col-grow" v-else><q-input v-model="editTitle" type="text"/></span>
        <q-btn v-if="!edit" flat icon="edit" dense class="text-primary col-1" @click="editTitle = props.data.GalleryName; edit = !edit">
          <q-tooltip>修改相簿名稱</q-tooltip>
        </q-btn>
        <q-btn v-else flat icon="save" dense class="text-primary col-1" @click="save(editTitle)"/>
      </div>
      <q-space/>
      <ToggleVisibility class="col-1" :state="props.data.IsShow" @click="toggle(props.data.GalleryID)"/>
    </q-card-section>
    <q-card-section class="q-pa-sm q-ma-none">
      <q-img ratio="1" :src="props.data.CoverPic" class="col-12" placeholder-src="~assets/placeholder.jpg" >
        <div v-if="props.data.Obsolete" class="absolute-top-right">
          <q-icon name="warning" outline>
            <q-tooltip>舊網站相片</q-tooltip>
          </q-icon>
        </div>
        <div class="absolute-bottom-right text-subtitle2">
          <q-btn icon="restart_alt" label="更換封面" outline @click="updateCover"/>
        </div>
        <template v-slot:error>
          <!-- This will be displayed if the image fails to load -->
          <div class="absolute-full flex flex-center">
            <q-icon name="report_problem" size="2em" />
            <span class="q-ml-sm">載入失敗
              <q-tooltip>相片網址：{{props.data.CoverPic}}</q-tooltip>
            </span>
            <div class="absolute-bottom-right text-subtitle2">
              <q-btn icon="restart_alt" label="更換封面" outline @click="updateCover"/>
            </div>
          </div>
        </template>
      </q-img>
    </q-card-section>
    <q-space/>
    <q-card-actions class="row q-ma-none q-pa-sm">
      <div class="col-7 text-caption"><q-icon size="sm" color="primary" name="update"/>{{ qdate.formatDate(props.data.AddTime, 'YYYY年M月D日') }}</div>
      <q-space/>
      <q-btn class="col-auto" align="between" dense flat color="primary" icon="photo" :to="{ name: 'GalleryEdit', params: { id: props.data.GalleryID}, query: { type: props.type} }">
        <q-tooltip>相片列表</q-tooltip>
      </q-btn>
      <q-btn class="col-auto" align="between" dense flat color="red" icon="delete" @click="remove(props.data)">
        <q-tooltip>刪除相簿</q-tooltip>
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { date as qdate, useQuasar } from "quasar";
import { ref, computed } from "vue";
import GalleryFileUpload from "/src/components/Basic/GalleryFileUpload.vue";
import ToggleVisibility from "/src/components/Basic/ToggleVisibility.vue";

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(["refetch", 'deleteGalleryById', 'toggleVisibilityById', 'renameGalleryById', 'updateCover']);
const $q = useQuasar()
const edit = ref(false)
const editTitle = ref()
const filepath = computed(() => props.type == 'event'? "GalleryCover/" + props.data.GalleryID: "ClassGalleryCover/" + props.data.GalleryID)
const fileprefix = "https://storage.googleapis.com/cciyc-web/"

function toggle(galleryId) {
  emit('toggleVisibilityById', galleryId)
}

function save(title) {
  $q.dialog({
    title: "修改相簿名稱",
    message: "確定要將相簿命名為" + title + "？",
    cancel: true,
    persistent: true,
  }).onOk(() => {
    emit('renameGalleryById', { GalleryID: props.data.GalleryID, GalleryName: title })
    edit.value = false
  }).onCancel(() => {
    edit.value = false
  });
}

function remove(row) {
  $q.dialog({
    title: row.GalleryName,
    message: "確定要刪除此相簿嗎？",
    cancel: true,
    persistent: true,
  }).onOk(() => {
    emit('deleteGalleryById', row.GalleryID)
  });
}

function updateCover() {
  $q.dialog({
    component: GalleryFileUpload,
    componentProps: {
      path: filepath.value,
      mode: "single",
    },
  }).onOk((filename) => {
    if (filename.value) {
      emit('updateCover', { GalleryID: props.data.GalleryID, CoverPic: fileprefix + filepath.value + "/" + filename.value[0] })
    }
  });
}
</script>
