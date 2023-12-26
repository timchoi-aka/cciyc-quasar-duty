<template>
  <LoadingDialog v-model="awaitServerResponse" message="處理中"/>
  <q-img :ratio="1" :src="props.row.PhotoUrl" class="fit" :style="{ transform: 'rotate(' + props.row.Orientation + 'deg)' }">
    <div v-if="props.row.Obsolete" class="absolute-top-right">
      <q-icon name="warning" outline>
        <q-tooltip>舊網站相片</q-tooltip>
      </q-icon>
    </div>
    <q-tooltip transition-show="rotate" transition-hide="rotate" class="image-tooltip q-pa-none q-ma-none">
      <q-img :src="props.row.PhotoUrl" :style="{ transform: 'rotate(' + props.row.Orientation + 'deg)' }" placeholder-src="~assets/placeholder.jpg" />
    </q-tooltip>
  </q-img>
</template>

<script setup>
import { ref } from "vue";
import { Dialog } from "quasar"
import LoadingDialog from "src/components/LoadingDialog.vue";

const imgKey = ref(0)
const props = defineProps({
  row: {
    type: Object,
    required: true
  }
})
const bucket = ref("cciyc-web");
const awaitServerResponse = ref(0);

const rotateImage = async (fullUrl) => {
  const url = new URL(fullUrl)
  const filename = url.pathname.split("/").pop()
  const path = url.pathname.split("/").slice(2).slice(0, -1).join("/");
  const rotation = ref(90);
  //const ROTATE_IMAGE_API = process.env.NODE_ENV === "development"? "http://localhost:5001/manage-hr/asia-east2/file-rotateImage" : "https://asia-east2-manage-hr.cloudfunctions.net/file-rotateImage"
  const ROTATE_IMAGE_API = "https://asia-east2-manage-hr.cloudfunctions.net/file-rotateImage"
  awaitServerResponse.value++
  try {
    const response = await fetch(ROTATE_IMAGE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // If you have authentication set up, include your authentication headers here
        // 'Authorization': 'Bearer YOUR_TOKEN',
      },
      body: JSON.stringify({
        bucket: bucket.value,
        path: path,
        filename: filename,
        rotation: rotation.value
      })
    });

    if (response.ok) {
      // const result = await response.json();
      //rotationDegree.value = rotationDegree.value + rotation.value
      // imgKey.value++
      awaitServerResponse.value--
      // Handle success
    } else {
      // console.error('Error rotating image:', response.statusText);
      Dialog.create({
        title: '失敗',
        message: `未能旋轉相片: ${response.statusText}`
      });
      awaitServerResponse.value--
    }
  } catch (error) {
    console.error('Network error:', error);
    // Handle network error
  }
};

</script>
<style lang="scss">
.image-tooltip {
  width: 300px;
  height: auto;
}
</style>
