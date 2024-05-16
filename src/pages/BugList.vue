<template>
  <div>
    <!-- loading dialog -->
    <LoadingDialog v-model="loading" message="儲存中" />

    <q-dialog
      v-model="bugDetailDialog"
      persistent
      maximized
      full-width
      full-height
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card>
        <q-card-section class="row bg-primary text-white">
          <div class="col-grow">
            {{ bugDetail.docid }}<br />
            {{ bugDetail.message }}
          </div>

          <div v-if="bugDetail.filenames.length > 0">
            <div v-for="(url, index) in bugDetail.filenames" :key="index">
              <q-img :src="url" />
            </div>
          </div>
          <q-space />
          <q-btn icon="close" flat v-close-popup />
        </q-card-section>
        <q-card-section class="row">
          <div class="col-6 text-h6 text-bold">
            {{ bugDetail.username }} @
            {{ qdate.formatDate(bugDetail.date, "YYYY年M月D日") }}
          </div>
          <div class="col-6 row text-h6 text-bold">
            <span class="col-4">狀態：</span
            ><q-select
              class="col-8"
              :options="bugStatus"
              v-model="bugDetail.status"
              @update:model-value="updateStatus"
            />
          </div>
          <q-separator inset class="q-py-md" />
          <q-img
            v-for="(url, index) in bugDetail.filenames"
            :src="url"
            class="q-py-md"
            fit="scale-down"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-table
      flat
      :wrap-cells="true"
      :grid="$q.screen.lt.sm"
      :rows="bugs"
      :columns="tableFields"
      :hide-bottom="true"
      :pagination="pagination"
      color="primary"
      row-key="docid"
      :filter="filter"
      :filter-method="customFilter"
      @row-click="showDetail"
    >
      <template v-slot:top-right>
        <q-btn-group flat bordered>
          <q-btn bordered label="未解決" @click="showAll = false" />
          <q-btn bordered label="全部" @click="showAll = true" />
        </q-btn-group>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { bugsCollection, FirebaseFunctions } from "boot/firebase";
import { date as qdate, useQuasar } from "quasar";
import LoadingDialog from "components/LoadingDialog.vue";
import { httpsCallable } from "@firebase/functions";
import { ref, computed } from "vue";
import { query, where, getDocs } from "firebase/firestore";

// variables
const $q = useQuasar();
const bugs = ref([]);
const loading = ref(0);
const bugDetail = ref();
const bugDetailDialog = ref(false);
const filter = computed(() => ({
  showAll: showAll.value,
}));
const showAll = ref(false);
const bugStatus = ref(["未解決", "工作中", "已解決"]);
// table config
const pagination = ref({
  sortBy: "order",
  rowsPerPage: 0,
});

const tableFields = ref([
  {
    name: "docid",
    label: "ID",
    field: "docid",
    headerStyle:
      "font-size: 1.5vw; text-align: center; width: 3vw;  max-width: 3vw;",
    style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
  },
  {
    name: "username",
    label: "回報用戶",
    field: "username",
    headerStyle:
      "font-size: 1.5vw; text-align: center; width: 3vw;  max-width: 3vw;",
    style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
  },
  {
    name: "date",
    label: "錯誤日期",
    field: "date",
    headerStyle:
      "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 3vw;",
    style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
    format: (val) => qdate.formatDate(val, "YYYY年M月D日"),
  },
  {
    name: "message",
    label: "錯誤內容",
    field: "message",
    headerStyle:
      "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 3vw;",
    style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
  },
  {
    name: "status",
    label: "狀態",
    field: "status",
    headerStyle:
      "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 3vw;",
    style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
  },
]);

function customFilter(rows, terms) {
  return terms.showAll ? rows : rows.filter((row) => row.status !== "已解決");
}

// module logic
const bugsQuery = query(bugsCollection);

getDocs(bugsQuery).then((bugDoc) => {
  bugDoc.forEach((bug) => {
    const prefixBase = process.env.STORAGE_PREFIX;
    const prefixBucket = bug.data().path ? bug.data().path + "/" : "";
    const prefix = prefixBase + prefixBucket;
    let d = {
      docid: bug.data().docid,
      uid: bug.data().uid,
      username: bug.data().username,
      status: bug.data().status,
      date: bug.data().date,
      message: bug.data().message,
      filenames: [],
    };

    bug.data().filenames.forEach((f) => {
      d.filenames.push(prefix + f);
    });
    bugs.value.push(d);
  });
});

function showDetail(evt, row, index) {
  bugDetailDialog.value = true;
  bugDetail.value = row;
}

function updateStatus(val) {
  loading.value++;
  const updateBugStatus = httpsCallable(
    FirebaseFunctions,
    "systemAdmin-updateBugStatus"
  );
  return updateBugStatus({ docid: bugDetail.value.docid, status: val }).then(
    (result) => {
      loading.value--;
      return result;
    }
  );
}
</script>
