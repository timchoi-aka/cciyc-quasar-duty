<template>
  <q-dialog 
    v-model="detailModal"
    maximized
    full-width
    full-height
    transition-show="slide-up"
    transition-hide="slide-down">
    <q-card>
      <q-card-section class="bg-primary text-white row">
        <q-space/>
        <q-btn flat align="right" icon="close" v-close-popup/>
      </q-card-section>
      <q-card-section>
        <WebEditor :newsID="showNewsID"/>
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- loading dialog -->
  <LoadingDialog v-model="loading" message="處理資料中"/>
  <LoadingDialog :model-value="loadingNews? 1: 0" message="處理資料中"/>

  <q-table
    dense
    flat
    :rows="NewsData"
    :columns="NewsColumns"
    :pagination="defaultPagination"
    color="primary"
    row-key="NewsID"
    :loading="loadingNews"
    binary-state-sort
    class="q-mt-sm"
    @row-click="rowDetail"
  >
  <template v-slot:body-cell-IsShow="props">
      <q-td :props="props" class="q-pa-none">
        <q-btn flat color="positive" v-if="props.row.IsShow == 1" icon="visibility" @click="toggleIsShow(props.key)"/>
        <q-btn flat color="negative" v-if="props.row.IsShow == 0" icon="disabled_visible" @click="toggleIsShow(props.key)"/>
      </q-td>
    </template>
  </q-table>
  <!--
  <q-item v-for="item in NewsData">
    <q-chip>{{ item.NewsSort }}</q-chip>
    <span class="title">{{ item.NewsTitle }}</span>
    <span>{{ qdate.formatDate(item.UpdateTime, "YYYY年M月D日 HH:mm") }}</span>
  </q-item>
  -->



</template>
<script setup>
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@vue/apollo-composable';
import { ref, computed } from 'vue';
import { date as qdate, useQuasar } from "quasar"
import { useStore } from "vuex";
import LoadingDialog from 'src/components/LoadingDialog.vue';
import WebEditor from "src/components/Website/WebEditor.vue"

const $q = useQuasar()
const loading = ref(0)
const showNewsID = ref(0)
const detailModal = ref(false)
const defaultPagination = ref({
  rowsPerPage: 10,
  sortBy: "NewsSort",
})
const $store = useStore();

const { mutate: toggleVisible, onDone: toggleVisible_Done } = useMutation(gql`
mutation toggleNewsVisible (
  $logObject: Log_insert_input! = {},
  $NewsID: Int = 0,
  $IsShow: Int = 0,
  $UpdateTime: smalldatetime = ""
)
{
  insert_Log_one(object: $logObject) {
    log_id
  }
  update_HTX_News_by_pk(
    pk_columns: {NewsID: $NewsID},
    _set: {
      IsShow: $IsShow,
      UpdateTime: $UpdateTime
    }) {
    NewsID
  }
}`)

const { result, loading: loadingNews, refetch } = useQuery(gql`
query getNews {
  HTX_News(order_by: {NewsSort: asc}) {
    IsShow
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
    NewsID
  }
}`)
const NewsColumns = ref([
  {
    name: "NewsSort",
    label: "顯示次序",
    field: "NewsSort",
    sortable: true,
    headerStyle: {
      textAlign: "center",
      lineHeight: "10px",
    },
    headerClasses: "bg-blue-2",
    style: {
      borderTop: '1px solid',
      textAlign: 'center',
      lineHeight: "10px",
    },
  },
  {
    name: "IsShow",
    label: "顯示",
    field: "IsShow",
    sortable: true,
    headerStyle: {
      textAlign: "center",
      lineHeight: "10px",
    },
    headerClasses: "bg-blue-2",
    style: {
      borderTop: '1px solid',
      textAlign: 'center',
      lineHeight: "10px",
    },
  },
  {
    name: "UpdateTime",
    label: "日期",
    field: "UpdateTime",
    sortable: true,
    headerStyle: {
      textAlign: "center",
      lineHeight: "10px",
    },
    headerClasses: "bg-blue-2",
    style: {
      borderTop: '1px solid',
      textAlign: 'center',
      lineHeight: "10px",
    },
    format: (val) => qdate.formatDate(val, "YYYY年M月D日 HH:mm"),
  },
  {
    name: "NewsTitle",
    label: "標題",
    field: "NewsTitle",
    headerStyle: {
      textAlign: "center",
      lineHeight: "10px",
    },
    headerClasses: "bg-blue-2",
    style: {
      borderTop: '1px solid',
      textAlign: 'center',
      lineHeight: "10px",
    },
  },
])
// computed
const NewsData = computed(() => result.value?.HTX_News??[])
const username = computed(() => $store.getters["userModule/getUsername"])

function rowDetail(evt, row, index) {
  if (evt.target.nodeName === 'TD') {
    detailModal.value = true;
    showNewsID.value = parseInt(row.NewsID);
  }
}

function toggleIsShow(id) {
  let i = NewsData.value.findIndex((e) => e.NewsID == id)

  const logObject = {
    "username": username.value,
    "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    "module": "網站系統",
    "action": `最新消息ID: ${id} 設定為 ${NewsData.value[i].IsShow == 1? '隱藏': '顯示'}`
  }

  loading.value++
  toggleVisible({
    logObject: logObject,
    NewsID: id,
    IsShow: NewsData.value[i].IsShow == 1? 0: 1,
    UpdateTime: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss")
  })
}

toggleVisible_Done((result) => {
  loading.value--
  $q.notify({
    message: "操作完成",
  })
  refetch()
})
</script>
