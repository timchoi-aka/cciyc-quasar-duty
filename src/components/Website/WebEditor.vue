<template>
  <!-- file upload dialog -->
  <q-dialog v-model="upload" position="bottom">
    <FileUpload
      style="width: 300px"
      class="col-12"
      mode="multiple"
      :path="'News/' + props.newsID"
      @onDone="
        (val) =>
          filename.push(
            fileprefix + 'News/' + props.newsID + '/' + val.files[0].name
          )
      "
    />
  </q-dialog>

  <!-- insert image dialog -->
  <q-dialog
    v-model="imgSelector"
    position="bottom"
    style="width: 100%; overflow: auto"
  >
    <q-carousel
      animated
      v-model="selectedImage"
      swipeable
      thumbnails
      style="width: 100%"
    >
      <template v-for="(i, index) in filename">
        <q-carousel-slide :name="index" :img-src="i">
          <div class="absolute-top-right text-subtitle2">
            <q-btn
              icon="add"
              label="插入圖片"
              class="bg-grey-3"
              outline
              @click="insertFilenames(i, imageSize)"
            />
          </div>
          <div class="absolute-top-left text-subtitle2">
            <q-btn-toggle
              v-model="imageSize"
              push
              outline
              class="bg-grey-3"
              toggle-color="negative"
              :options="[
                { label: '最小', value: '10' },
                { label: '小', value: '30' },
                { label: '中', value: '50' },
                { label: '大', value: '80' },
                { label: '原本大小', value: '100' },
              ]"
            />
          </div>
        </q-carousel-slide>
      </template>
    </q-carousel>
  </q-dialog>

  <div class="q-pa-md">
    <div class="row">
      <div class="col-12 row items-center">
        <span>標題（中文）：</span
        ><q-input class="col-6" v-model="webcontent.NewsTitle" />
      </div>
      <div class="col-12 row items-center">
        <span>標題（英文）：</span
        ><q-input class="col-6" v-model="webcontent.NewsTitleEN" />
      </div>
      <q-separator />
      <div class="col-12 row items-center">
        <span>副標題（中文）：</span
        ><q-input class="col-6" v-model="webcontent.NewsRemark" />
      </div>
      <div class="col-12 row items-center">
        <span>副標題（英文）：</span
        ><q-input class="col-6" v-model="webcontent.NewsRemarkEN" />
      </div>

      <q-chip>中文內容</q-chip>
      <q-editor
        class="col-12"
        ref="editor"
        v-if="Object.keys(webcontent).length > 0"
        v-model="webcontent.NewsContent"
        min-height="5rem"
        :definitions="{
          upload_img: {
            tip: '上載相片',
            icon: 'photo',
            label: '上載相片',
            handler: handleUpload, // handler will call insertImg() method
          },
          insert_img: {
            tip: '插入相片',
            icon: 'add',
            label: '插入相片',
            handler: () => (imgSelector = true), // handler will call insertImg() method
          },
          save: {
            tip: '儲存',
            icon: 'save',
            label: '儲存',
            handler: saveWork,
          },
        }"
        :toolbar="[
          [
            {
              label: $q.lang.editor.align,
              icon: $q.iconSet.editor.align,
              fixedLabel: true,
              list: 'only-icons',
              options: ['left', 'center', 'right', 'justify'],
            },
          ],
          ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
          ['token', 'hr', 'link', 'custom_btn'],
          ['print', 'fullscreen'],
          ['table'],
          [
            {
              label: $q.lang.editor.formatting,
              icon: $q.iconSet.editor.formatting,
              list: 'no-icons',
              options: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code'],
            },
            {
              label: $q.lang.editor.fontSize,
              icon: $q.iconSet.editor.fontSize,
              fixedLabel: true,
              fixedIcon: true,
              list: 'no-icons',
              options: [
                'size-1',
                'size-2',
                'size-3',
                'size-4',
                'size-5',
                'size-6',
                'size-7',
              ],
            },
            {
              label: $q.lang.editor.defaultFont,
              icon: $q.iconSet.editor.font,
              fixedIcon: true,
              list: 'no-icons',
              options: [
                'default_font',
                'arial',
                'arial_black',
                'comic_sans',
                'courier_new',
                'impact',
                'lucida_grande',
                'times_new_roman',
                'verdana',
              ],
            },
            'removeFormat',
          ],
          ['quote', 'unordered', 'ordered', 'outdent', 'indent'],
          ['upload_img'],
          ['insert_img'],
          ['undo', 'redo'],
          ['viewsource'],
          ['save'],
        ]"
        :fonts="{
          arial: 'Arial',
          arial_black: 'Arial Black',
          comic_sans: 'Comic Sans MS',
          courier_new: 'Courier New',
          impact: 'Impact',
          lucida_grande: 'Lucida Grande',
          times_new_roman: 'Times New Roman',
          verdana: 'Verdana',
        }"
        @paste.native="(evt) => pasteCapture(evt)"
        @drop.native="(evt) => dropCapture(evt)"
      >
        <!--<template v-slot:select_img>
          <q-btn
            dense no-caps
            ref="select_img"
            no-wrap
            unelevated
            color="white"
            text-color="primary"
            label="插入圖片"
            size="md"
            @click="imgSelector = true">

            </q-btn>
        </template>-->
      </q-editor>

      <q-chip>英文內容</q-chip>
      <q-editor
        class="col-12"
        ref="editorEN"
        v-if="Object.keys(webcontent).length > 0"
        v-model="webcontent.NewsContentEN"
        min-height="5rem"
        :definitions="{
          insert_img: {
            tip: 'Insert Image',
            icon: 'photo',
            handler: handleUpload, // handler will call insertImg() method
          },
        }"
        :toolbar="[
          [
            {
              label: $q.lang.editor.align,
              icon: $q.iconSet.editor.align,
              fixedLabel: true,
              list: 'only-icons',
              options: ['left', 'center', 'right', 'justify'],
            },
          ],
          ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
          ['token', 'hr', 'link', 'custom_btn'],
          ['print', 'fullscreen'],
          [
            {
              label: $q.lang.editor.formatting,
              icon: $q.iconSet.editor.formatting,
              list: 'no-icons',
              options: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code'],
            },
            {
              label: $q.lang.editor.fontSize,
              icon: $q.iconSet.editor.fontSize,
              fixedLabel: true,
              fixedIcon: true,
              list: 'no-icons',
              options: [
                'size-1',
                'size-2',
                'size-3',
                'size-4',
                'size-5',
                'size-6',
                'size-7',
              ],
            },
            {
              label: $q.lang.editor.defaultFont,
              icon: $q.iconSet.editor.font,
              fixedIcon: true,
              list: 'no-icons',
              options: [
                'default_font',
                'arial',
                'arial_black',
                'comic_sans',
                'courier_new',
                'impact',
                'lucida_grande',
                'times_new_roman',
                'verdana',
              ],
            },
            'removeFormat',
          ],
          ['quote', 'unordered', 'ordered', 'outdent', 'indent'],
          ['insert_img'],
          ['select_img'],
          ['undo', 'redo'],
          ['viewsource'],
        ]"
        :fonts="{
          arial: 'Arial',
          arial_black: 'Arial Black',
          comic_sans: 'Comic Sans MS',
          courier_new: 'Courier New',
          impact: 'Impact',
          lucida_grande: 'Lucida Grande',
          times_new_roman: 'Times New Roman',
          verdana: 'Verdana',
        }"
        @paste.native="(evt) => pasteCapture(evt)"
        @drop.native="(evt) => dropCapture(evt)"
      >
        <template v-slot:select_img>
          <q-btn-dropdown
            dense
            no-caps
            ref="select_img"
            no-wrap
            unelevated
            color="white"
            text-color="primary"
            label="選擇圖片"
            size="sm"
          >
            <q-list dense>
              <q-item
                v-for="i in imgList"
                clickable
                @click="insertFilenames(i)"
              >
                <q-img :src="i.value" />
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </template>
      </q-editor>
    </div>
  </div>
</template>

<script setup>
import gql from "graphql-tag";
import { useQuery } from "@vue/apollo-composable";
import { ref } from "vue";
import { useQuasar } from "quasar";
import FileUpload from "src/components/Basic/FileUpload.vue";
import { useRoute } from "vue-router";
import axios from "axios";

const route = useRoute();
const filename = ref([]);
const imageSize = ref("100");
const selectedImage = ref(1);
const $q = useQuasar();
const editor = ref(null);
const webcontent = ref({});
const upload = ref(false);
const imgList = ref([]);
const props = defineProps({
  newsID: {
    type: Number,
    required: true,
  },
});
const imgSelector = ref(false);
const fileprefix = "https://storage.googleapis.com/cciyc-web/";
const baseURL = "https://asia-east2-manage-hr.cloudfunctions.net/file-getFiles";
axios
  .get(baseURL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      path: "News/" + route.params.id,
    },
  })
  .then((response) => {
    response.data.fileNames.forEach((item) => {
      filename.value.push(fileprefix + item);
    });
  })
  .catch((error) => {
    console.log(error);
  });

const {
  onResult,
  loading: loadingNews,
  refetch,
} = useQuery(
  gql`
    query getNews($newsID: Int = 0) {
      HTX_News_by_pk(NewsID: $newsID) {
        IsShow
        NewsID
        NewsContent
        NewsContent2
        NewsContentEN
        NewsContentEN2
        NewsRemark
        NewsRemarkEN
        NewsSort
        NewsTitle
        NewsTitleEN
        UpdateTime
      }
    }
  `,
  () => ({
    newsID: props.newsID,
  })
);

onResult((result) => {
  if (result.data) {
    // console.log("result.data: " + JSON.stringify(result.data))
    let s = JSON.parse(JSON.stringify(result.data.HTX_News_by_pk));
    // console.log("s.NewsContent: " + s.NewsContent)
    s.NewsContent = s.NewsContent.replace(/[\r\n\t]/gm, "")
      .replace(/\\"/g, '"')
      .replace(/\/UPFILE/g, "https://www2.cciyc.com/UPFILE");
    s.NewsContentEN = s.NewsContentEN.replace(/[\r\n\t]/gm, "")
      .replace(/\\"/g, '"')
      .replace(/\/UPFILE/g, "https://www2.cciyc.com/UPFILE");
    // console.log("s.NewsContent: " + s.NewsContent)
    // let eng = s.NewsContentEN? s.NewsContentEN.replace(/[\r\n\t]/gm, '').replace(/\\"/g, '"'): ""
    // console.log(chi)
    webcontent.value = s;
  }
});

function pasteCapture(e) {
  console.log(e);
}

function dropCapture(e) {
  console.log(e);
}

function handleUpload(...params) {
  // caret.value = params[2]
  // console.log(caret.value)
  upload.value = true;
}

function insertFilenames(filename, size) {
  let insertTag =
    "<img src='" +
    filename +
    "' style='max-width: 800px; width: " +
    size +
    "%;'/>";
  editor.value.caret.restore();
  editor.value.focus();
  editor.value.runCmd("insertHTML", insertTag);
}

function saveWork() {
  console.log("save");
}
</script>
<style lang="scss" scoped>
/* Add custom CSS for table appearance */
.ql-editor table {
  border-collapse: collapse;
  width: 100%;
}
.ql-editor table,
.ql-editor th,
.ql-editor td {
  border: 1px solid black;
}
.ql-editor th,
.ql-editor td {
  padding: 8px;
  text-align: left;
}
</style>
