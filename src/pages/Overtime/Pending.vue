<template>
  <div class="full-width">
    <!-- sticky button at bottom -->
    <q-page-sticky position="bottom-right" :offset="[20, 20]" style="z-index: 1">
      <q-fab
        v-if="selectedRow.length > 0 && !$q.screen.lt.sm"
        label="確定刪除"
        color="red"
        push
        @click="confirmDialog = !confirmDialog"
      />
    </q-page-sticky>

    <!-- confirm delete dialog -->
    <q-dialog v-model="confirmDialog">
      <q-card style="border-radius: 30px">
        <q-card-section>
          <div class="text-h5 text-center" style="border-bottom: 3px solid red">
            確定取消超時補假申請？
          </div>
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div v-for="app in selectedRow">
            <span v-html="qdate.formatDate(app.date, 'YYYY-MM-DD')" /> - {{ app.type }} -
            {{ app.hours }}小時
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn v-close-popup flat color="primary" label="取消" />
          <q-btn
            v-close-popup
            @click="confirmOTRemove"
            flat
            color="red"
            label="確認刪除"
            round
            icon="cancel"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- loading dialog -->
    <q-dialog v-model="waitingAsync" position="bottom">
      <LoadingDialog message="讀取資料中"/>
    </q-dialog>

    <!-- Application Table -->
    <div class="full-width">
      <!-- header row -->
      <q-table
        dense
        flat
        selection="multiple"
        v-model:selected="selectedRow"
        :grid="$q.screen.lt.md"
        :rows="applicationList"
        :columns="columns"
        :pagination="defaultPagination"
        :hide-bottom="true"
        color="primary"
        row-key="docid"
      >
        <!-- remarks cell template -->
        <template v-slot:body-cell-remarks="props">
          <q-td class="q-pa-sm" style="font-size: 1.5vw; text-align: center">
            <div v-for="remark in props.row.remarks">{{ remark }}</div>
          </q-td>
        </template>

        <!-- grid template -->
        <template v-slot:item="props">
          <q-card class="q-pa-xs q-mb-xs col-xs-12 col-sm-12 col-md-12">
            <q-card-section
              ><q-btn
                color="red"
                class="absolute-top-right"
                icon="cancel"
                @click="confirmOTRemoveByDocid(props.row)"
              ></q-btn>
            </q-card-section>
            <q-card-section class="bg-blue-1 text-body1">
              <div class="row">
                <span>日期:</span>
                <span
                  v-html="
                    qdate.formatDate(props.row.date, 'YYYY年MM月DD日(ddd)', {
                      daysShort: ['日', '一', '二', '三', '四', '五', '六'],
                    })
                  "
                />
                <q-space />
                <span>時數:</span><span v-html="props.row.hours" />
                <q-space />
                <span>種類:</span><span v-html="leaveMap[props.row.type]" />
              </div>
            </q-card-section>
            <q-card-section>
              <div class="row">
                <div
                  class="col-xs-10 col-sm-10 col-md-10 text-h6"
                  v-for="remark in applicationList[applicationList.indexOf(props.row)]
                    .remarks"
                >
                  {{ remark }}
                </div>
              </div>
            </q-card-section>
          </q-card>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script setup>
import { FirebaseFunctions, OTCollection } from "boot/firebase";
import { useStore } from "vuex";
import { ref, computed, onMounted } from "vue";
import { date as qdate } from "quasar";
import LoadingDialog from "components/LoadingDialog.vue"
import { getDocs, query, where } from "@firebase/firestore";
import { httpsCallable } from "@firebase/functions";

onMounted(() => {
  fetchAllOTRecords()
})

const $store = useStore();

// computed
const waitingAsync = computed(() => awaitServerResponse.value > 0)
const uid = computed(() => $store.getters["userModule/getUID"])

const confirmDialog = ref(false)
const selectedRow = ref([])
      
const awaitServerResponse = ref(0)
const applicationList = ref([])
      
// table config
const defaultPagination = ref({
  rowsPerPage: 20,
  descending: true,
  sortBy: "date",
})
      
const leaveMap = ref({
  OT: "OT",
  CL: "補OT",
})
      
const columns = ref([
  {
    name: "date",
    label: "日期",
    field: "date",
    style: "font-size: 1.5vw; text-align: center",
    headerStyle: "font-size: 1.5vw; text-align: center; width: 10vw;",
    headerClasses: "bg-grey-2 nameColumn",
    format: (val) => qdate.formatDate(val, "YYYY-MM-DD"),
  },
  {
    name: "type",
    label: "種類",
    field: "type",
    style: "font-size: 1.5vw; text-align: center",
    headerStyle: "font-size: 1.5vw; text-align: center; width: 10vw;",
    headerClasses: "bg-grey-2",
    format: (val) => leaveMap.value[val],
  },
  {
    name: "hours",
    label: "時數",
    field: "hours",
    style: "font-size: 1.5vw; text-align: center",
    headerStyle: "font-size: 1.5vw; text-align: center; width: 10vw;",
    headerClasses: "bg-grey-2",
  },
  {
    name: "remarks",
    label: "備註",
    field: "remarks",
    style: "font-size: 1.5vw; text-align: center",
    headerStyle:
      "font-size: 1.5vw; text-align: center; width: 40vw; min-width: 40vw;",
    headerClasses: "bg-grey-2",
  },
]) 
      
// functions
function fetchAllOTRecords() {
  awaitServerResponse.value++
  applicationList.value = [];
  const OTQuery = query(OTCollection,
    where("uid", "==", uid.value),
    where("status", "==", "未批")
  )

  getDocs(OTQuery).then((OTRecords) => {
    OTRecords.forEach((doc) => {
      applicationList.value.push({
        docid: doc.id,
        ...doc.data(),
      });
    });
    awaitServerResponse.value--
  })
}
    
function confirmOTRemove() {
  // call https functions to add leaves
  const delOT = httpsCallable(FirebaseFunctions, "ot-delLeaveByDocid");
  awaitServerResponse.value++;
  delOT(selectedRow.value)
    .then((result) => {
      for (let i = 0; i < result.data.length; i++) {
        let index = applicationList.value.findIndex(
          (element) => element.docid == result.data[i].docid
        );
        applicationList.value.splice(index, 1);
        selectedRow.value = [];
        awaitServerResponse.value--;
      }
    })
    .catch((error) => {
      console.log(error.message);
    });
}
    
function confirmOTRemoveByDocid(docid) {
  // call https functions to add leaves
  const delOT = httpsCallable(FirebaseFunctions, "ot-delLeaveByDocid");
  awaitServerResponse.value++;
  delOT([docid])
    .then((result) => {
      for (let i = 0; i < result.data.length; i++) {
        let index = applicationList.value.findIndex(
          (element) => element.docid == result.data[i].docid
        );
        applicationList.value.splice(index, 1);
        selectedRow.value = [];
        awaitServerResponse.value--;
      }
    })
    .catch((error) => {
      console.log(error.message);
    });
}
</script>

<style scoped></style>
