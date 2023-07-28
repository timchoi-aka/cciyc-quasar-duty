<template>
  <q-dialog v-model="upload" class="row bg-white">
    <q-card>
      <q-card-section>
        <q-select class="col-12" v-model="imageSize" label="Size" :options="['Large', 'Normal', 'Small']"/>
        <q-uploader
          class="col-12"
          :url="upload_API + '/file-savefiletostorage'"
          color="primary"
          flat
          bordered
          :headers="[
            {name: 'Access-Control-Allow-Origin', value: '*'}, 
            {name: 'Access-Control-Allow-Headers', value: 'Origin, X-Requested-With, Content-Type, Accept'},
          ]"
          @uploaded="updateFilenames"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
  <div class="row">
  <div class="col-12 row items-center"><span>標題（中文）：</span><q-input class="col-6" v-model="webcontent.NewsTitle"/></div>
  <div class="col-12 row items-center"><span>標題（英文）：</span><q-input class="col-6" v-model="webcontent.NewsTitleEN"/></div>
  <q-separator/>
  <div class="col-12 row items-center"><span>副標題（中文）：</span><q-input class="col-6" v-model="webcontent.NewsRemark"/></div>
  <div class="col-12 row items-center"><span>副標題（英文）：</span><q-input class="col-6" v-model="webcontent.NewsRemarkEN"/></div>
  
  <q-chip>中文內容</q-chip>
  <q-editor class="col-12" ref="editor" v-if="Object.keys(webcontent).length > 0" v-model="webcontent.NewsContent" min-height="5rem" 
    :definitions="{
      insert_img: {
        tip: 'Insert Image',
        icon: 'photo',
        handler: handleUpload // handler will call insertImg() method
      }
    }"
    :toolbar="[
      [
        {
          label: $q.lang.editor.align,
          icon: $q.iconSet.editor.align,
          fixedLabel: true,
          list: 'only-icons',
          options: ['left', 'center', 'right', 'justify']
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
          options: [
            'p',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            'code'
          ]
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
            'size-7'
          ]
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
            'verdana'
          ]
        },
        'removeFormat'
      ],
      ['quote', 'unordered', 'ordered', 'outdent', 'indent'],
      ['insert_img'],
      ['select_img'],
      ['undo', 'redo'],
      ['viewsource']
    ]"
    :fonts="{
      arial: 'Arial',
      arial_black: 'Arial Black',
      comic_sans: 'Comic Sans MS',
      courier_new: 'Courier New',
      impact: 'Impact',
      lucida_grande: 'Lucida Grande',
      times_new_roman: 'Times New Roman',
      verdana: 'Verdana'
    }"
    @paste.native="evt => pasteCapture(evt)"
    @drop.native="evt => dropCapture(evt)"
    >
      <template v-slot:select_img>
        <q-btn-dropdown
          dense no-caps
          ref="select_img"
          no-wrap
          unelevated
          color="white"
          text-color="primary"
          label="選擇圖片"
          size="sm"
        >
          <q-list dense>
            <q-item v-for="i in imgList" clickable @click="insertFilenames(i)">
              <q-img :src="i.value"/>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </template>
    </q-editor>
    
  <q-chip>英文內容</q-chip>
  <q-editor class="col-12" ref="editorEN" v-if="Object.keys(webcontent).length > 0" v-model="webcontent.NewsContentEN" min-height="5rem" 
    :definitions="{
      insert_img: {
        tip: 'Insert Image',
        icon: 'photo',
        handler: handleUpload // handler will call insertImg() method
      }
    }"
    :toolbar="[
      [
        {
          label: $q.lang.editor.align,
          icon: $q.iconSet.editor.align,
          fixedLabel: true,
          list: 'only-icons',
          options: ['left', 'center', 'right', 'justify']
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
          options: [
            'p',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            'code'
          ]
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
            'size-7'
          ]
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
            'verdana'
          ]
        },
        'removeFormat'
      ],
      ['quote', 'unordered', 'ordered', 'outdent', 'indent'],
      ['insert_img'],
      ['select_img'],
      ['undo', 'redo'],
      ['viewsource']
    ]"
    :fonts="{
      arial: 'Arial',
      arial_black: 'Arial Black',
      comic_sans: 'Comic Sans MS',
      courier_new: 'Courier New',
      impact: 'Impact',
      lucida_grande: 'Lucida Grande',
      times_new_roman: 'Times New Roman',
      verdana: 'Verdana'
    }"
    @paste.native="evt => pasteCapture(evt)"
    @drop.native="evt => dropCapture(evt)"
    >
      <template v-slot:select_img>
        <q-btn-dropdown
          dense no-caps
          ref="select_img"
          no-wrap
          unelevated
          color="white"
          text-color="primary"
          label="選擇圖片"
          size="sm"
        >
          <q-list dense>
            <q-item v-for="i in imgList" clickable @click="insertFilenames(i)">
              <q-img :src="i.value"/>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </template>
    </q-editor>
    <q-btn size="lg" class="bg-primary text-white q-mt-md" label="儲存" icon="save" @click="save"/>
  </div>
</template>

<script setup>
import { useStore } from "vuex";
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@vue/apollo-composable';
import { ref, computed } from 'vue';
import { date as qdate, useQuasar } from "quasar"
const test = ref("")
const imageSize = ref("")
const upload_API = process.env.NODE_ENV === "development"? "http://localhost:5001/manage-hr/asia-east2" : "https://asia-east2-manage-hr.cloudfunctions.net"
// const upload_API = "http://localhost:5001/manage-hr/asia-east2"
const $store = useStore();
const $q = useQuasar()
const editor = ref(null)
const webcontent = ref({})
const upload = ref(false)
const imgList = ref([])
const props = defineProps({
  newsID: {
    type: Number,
    required: true,
  }
})
const editorComputed = computed(() => editor.value.editor)
const { onResult, loading: loadingNews, refetch } = useQuery(gql`
query getNews(
  $newsID: Int = 0,
) {
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
}`, () => ({
  newsID: props.newsID
}))

onResult((result) => {
  if (result.data) {
    // console.log("result.data: " + JSON.stringify(result.data))
    let s = JSON.parse(JSON.stringify(result.data.HTX_News_by_pk))
    // console.log("s.NewsContent: " + s.NewsContent)
    s.NewsContent = s.NewsContent.replace(/[\r\n\t]/gm, '').replace(/\\"/g, '"').replace(/\/UPFILE/g, "https://www2.cciyc.com/UPFILE")
    s.NewsContentEN = s.NewsContentEN.replace(/[\r\n\t]/gm, '').replace(/\\"/g, '"').replace(/\/UPFILE/g, "https://www2.cciyc.com/UPFILE")
    // console.log("s.NewsContent: " + s.NewsContent)
    // let eng = s.NewsContentEN? s.NewsContentEN.replace(/[\r\n\t]/gm, '').replace(/\\"/g, '"'): ""
    // console.log(chi)
    webcontent.value = s
  }
})

const imgNames = computed(() => imgList.value? imgList.value.map(x=>x.name):[])

function pasteCapture(e) {
  console.log(e)
}

function dropCapture(e) {
  console.log(e)
}

function handleUpload(...params) {
  // caret.value = params[2]
  // console.log(caret.value)
  upload.value = true
}
function updateFilenames(filename) {
  const size = {
    "Large": "80%",
    "Normal": "50%",
    "Small": "30%"
  }
  
  imgList.value.push({
    size: size[imageSize.value],
    name: filename.files[0].name,
    value: "https://storage.googleapis.com/cciyc-web/" + filename.files[0].name
  })
}  
  
function insertFilenames(filename) { 
  // console.log(filename.value)
  let insertTag = "<img src='" + filename.value + "' style='max-width: " + filename.size + ";'/>"
  // console.log("insertTag:" + insertTag)
  editor.value.caret.restore()
  editor.value.focus()    
  editor.value.runCmd('insertHTML', insertTag)
}

function save() {
  console.log("save")
}
</script>