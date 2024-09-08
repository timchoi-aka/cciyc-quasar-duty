<template>
  <div class="q-pa-sm">
    <!-- loading dialog -->
    <LoadingDialog v-model="loading" message="儲存中" />

    <!-- add user dialog -->
    <q-dialog v-model="addDialog">
      <q-card bordered>
        <q-card-section>
          <div class="text-h5 bg-blue-3 text-center">新增臨時員工</div>
        </q-card-section>
        <q-card-section class="q-mt-sm">
          <q-input type="text" hint="姓名" v-model="newStaff.name"></q-input>
          <q-input v-model="newStaff.dateOfEntry" type="date" hint="入職日期" />
        </q-card-section>
        <q-card-actions align="center">
          <q-btn
            square
            flat
            v-close-popup
            color="primary"
            icon="add"
            label="新增"
            :disable="Object.keys(newStaff).length < 2"
            @click="
              addStaff(
                new User({
                  name: newStaff.name,
                  employment: [
                    {
                      dateOfEntry: Timestamp.fromMillis(
                        Date.parse(newStaff.dateOfEntry, 'YYYY-MM-DD')
                      ),
                    },
                  ],
                })
              )
            "
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- delete user dialog -->
    <q-dialog v-model="deleteDialog">
      <q-card bordered>
        <q-card-section>
          <div class="text-h5 bg-blue-3 text-center">刪除臨時員工</div>
        </q-card-section>
        <q-card-section class="q-mt-sm">
          <div class="text-h6" v-for="row in selectedRow" :key="row.uid">
            {{ row.name }}
          </div>
        </q-card-section>
        <q-card-section>
          <div class="text-h6 text-red">
            注意：員工的所有編更記錄也會一併刪除！
          </div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn
            square
            flat
            v-close-popup
            color="red"
            icon="cancel"
            label="確認刪除"
            @click="deleteStaff(selectedRow)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- add / remove buttons -->
    <div class="row">
      <q-btn
        :disable="selectedRow.length > 0"
        class="col-1 col-xs-4 col-sm-4 col-md-4"
        square
        text-color="white"
        color="primary"
        icon="add"
        label="新增"
        @click="addDialog = true"
      />

      <q-btn
        :disable="selectedRow.length == 0"
        class="col-1 offset-1 col-xs-4 col-sm-4 col-md-4"
        square
        text-color="white"
        color="red"
        icon="cancel"
        label="刪除"
        v-if="!$q.screen.lt.sm"
        @click="deleteDialog = true"
      />
    </div>
    <q-table
      flat
      selection="multiple"
      :grid="$q.screen.lt.sm"
      v-model:selected="selectedRow"
      :rows="users"
      :columns="tableFields"
      :hide-bottom="true"
      :pagination="pagination"
      color="primary"
      row-key="uid"
    >
      <!-- grid template -->
      <template v-slot:item="props">
        <div class="q-pa-sm col-xs-12 col-sm-6 col-md-4 flex">
          <q-card class="q-pa-none">
            <q-card-section
              class="bg-blue-1 q-mb-md row justify-around items-center"
            >
              <div class="col-sm-5 text-body1">{{ props.row.name }}</div>
              <q-space />
              <div class="col-sm-6 q-mx-sm text-body1">
                排序{{ props.row.order }}
                <q-btn
                  :disable="props.row.order == 1"
                  round
                  size="xs"
                  color="positive"
                  icon="keyboard_arrow_up"
                  @click="changeOrder(props.row, 'UP')"
                />
                <q-btn
                  :disable="props.row.order == users.length"
                  round
                  size="xs"
                  color="negative"
                  icon="keyboard_arrow_down"
                  @click="changeOrder(props.row, 'DOWN')"
                />
              </div>
            </q-card-section>
            <q-card-section
              class="row justify-around items-center q-mb-sm q-pa-none"
            >
              <div class="row justify-center q-mx-xs">
                <div class="text-body1 q-mx-md items-end">帳戶有效</div>
                <q-btn
                  dense
                  :color="props.row.enable ? 'positive' : 'negative'"
                  :label="props.row.enable ? '有' : '沒有'"
                  @click="toggleEnable(props.row)"
                />
              </div>
              <div class="row justify-center q-mx-xs text-body1">
                <div>
                  入職日期：<span
                    v-html="
                      props.row.dateOfEntry
                        ? qdate.formatDate(props.row.dateOfEntry, 'YYYY-MM-DD')
                        : ''
                    "
                  />
                  <q-btn icon="event" round color="primary" class="q-mx-xs">
                    <q-popup-proxy
                      @before-show="
                        proxyDate = props.row.getDateOfEntry()
                          ? qdate.formatDate(
                              props.row.getDateOfEntry(),
                              'YYYY-MM-DD'
                            )
                          : ''
                      "
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date v-model="proxyDate">
                        <div class="row items-center justify-end q-gutter-sm">
                          <q-btn
                            label="取消"
                            color="primary"
                            flat
                            v-close-popup
                          />
                          <q-btn
                            label="確定"
                            color="primary"
                            flat
                            @click="
                              props.row.setDateOfEntry(
                                0,
                                Date.parse(proxyDate, 'YYYY-MM-DD')
                              )
                            "
                            v-close-popup
                          />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-btn>
                </div>
                <div>
                  離職日期：<span
                    v-html="
                      props.row.dateOfExit
                        ? qdate.formatDate(props.row.dateOfExit, 'YYYY-MM-DD')
                        : ''
                    "
                  />
                  <q-btn icon="event" round color="primary" class="q-mx-xs">
                    <q-popup-proxy
                      @before-show="proxyDate = props.row.dateOfExit"
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date v-model="proxyDate">
                        <div class="row items-center justify-end q-gutter-sm">
                          <q-btn
                            label="取消"
                            color="primary"
                            flat
                            v-close-popup
                          />
                          <q-btn
                            label="確定"
                            color="primary"
                            flat
                            @click="setDateOfExit(props.row, proxyDate)"
                            v-close-popup
                          />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-btn>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </template>

      <template v-slot:header-selection="scope">
        <q-checkbox v-model="scope.selected" />
      </template>

      <template v-slot:body-selection="scope">
        <q-checkbox v-model="scope.selected" />
      </template>

      <template v-slot:body-cell-enable="props">
        <q-td :props="props">
          <q-btn
            round
            :color="props.value ? 'positive' : 'negative'"
            :label="props.value ? '有' : '沒有'"
            @click="toggleEnable(props.row)"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-order="props">
        <q-td :props="props" class="content-center">
          <div class="q-mx-sm">
            {{ props.value }}
            <q-btn
              :disable="props.value == 100"
              round
              size="xs"
              color="positive"
              icon="keyboard_arrow_up"
              @click="changeOrder(props.row, 'UP')"
            />
            <q-btn
              :disable="props.value == users.length"
              round
              size="xs"
              color="negative"
              icon="keyboard_arrow_down"
              @click="changeOrder(props.row, 'DOWN')"
            />
          </div>
        </q-td>
      </template>

      <!-- template of column "dateOfEntry" -->
      <template v-slot:body-cell-dateOfEntry="props">
        <q-td :props="props">
          <span
            v-html="
              props.row.getDateOfEntry()
                ? qdate.formatDate(props.row.getDateOfEntry(), 'YYYY-MM-DD')
                : ''
            "
          />
          <q-btn icon="event" round color="primary" class="q-mx-xs">
            <q-popup-proxy
              @before-show="
                proxyDate = props.row.getDateOfEntry()
                  ? qdate.formatDate(props.row.getDateOfEntry(), 'YYYY-MM-DD')
                  : ''
              "
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date v-model="proxyDate">
                <div class="row items-center justify-end q-gutter-sm">
                  <q-btn label="取消" color="primary" flat v-close-popup />
                  <q-btn
                    label="確定"
                    color="primary"
                    flat
                    @click="setDateOfEntry(props.row, proxyDate)"
                    v-close-popup
                  />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-btn>
        </q-td>
      </template>

      <!-- template of column "dateOfExit" -->
      <template v-slot:body-cell-dateOfExit="props">
        <q-td :props="props">
          <span
            v-html="
              props.row.getDateOfExit()
                ? qdate.formatDate(props.row.getDateOfExit(), 'YYYY-MM-DD')
                : ''
            "
          />
          <q-btn icon="event" round color="primary" class="q-mx-xs">
            <q-popup-proxy
              @before-show="
                proxyDate = props.row.getDateOfExit()
                  ? qdate.formatDate(props.row.getDateOfExit(), 'YYYY-MM-DD')
                  : ''
              "
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date v-model="proxyDate">
                <div class="row items-center justify-end q-gutter-sm">
                  <q-btn label="取消" color="primary" flat v-close-popup />
                  <q-btn
                    label="確定"
                    color="primary"
                    flat
                    @click="setDateOfExit(props.row, proxyDate)"
                    v-close-popup
                  />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-btn>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { date as qdate } from "quasar";
import LoadingDialog from "components/LoadingDialog.vue";
import { ref, onMounted } from "vue";
import { Timestamp } from "firebase/firestore";
import User from "components/class/user";

const selectedRow = ref([]);
const proxyDate = ref();
const addDialog = ref(false);
const deleteDialog = ref(false);
const loading = ref(0);
const newStaff = ref({});

const users = ref([]);
const pagination = ref({
  sortBy: "order",
  rowsPerPage: 0,
});

const tableFields = ref([
  {
    name: "name",
    label: "姓名",
    field: "name",
    headerStyle: "font-size: 1.5vw; text-align: center;",
    style: "font-size: 1.2vw; text-align: center;",
  },
  {
    name: "enable",
    label: "帳戶有效",
    field: "enable",
    headerStyle: "font-size: 1.5vw; text-align: center;",
    style: "font-size: 1.2vw; text-align: center;",
  },
  {
    name: "order",
    label: "排序",
    field: "order",
    sortOrder: "ad",
    sort: (a, b, rowA, rowB) => parseInt(a, 10) - parseInt(b, 10),
    sortable: true,
    headerStyle: "font-size: 1.5vw; text-align: center;",
    style: "font-size: 1.2vw; text-align: center;",
  },
  {
    name: "dateOfEntry",
    label: "入職日期",
    field: "employment",
    headerStyle: "font-size: 1.5vw; text-align: center;",
    style: "font-size: 1.2vw; text-align: center;",
  },
  {
    name: "dateOfExit",
    label: "離職日期",
    field: "employment",
    headerStyle: "font-size: 1.5vw; text-align: center;",
    style: "font-size: 1.2vw; text-align: center;",
  },
]);

// function v2
async function setDateOfEntry(user, proxyDate) {
  loading.value++;
  return new Promise((resolve, reject) => {
    user
      .setDateOfEntry(0, Date.parse(proxyDate, "YYYY-MM-DD"))
      .then((result) => {
        loading.value--;
        resolve(result);
      });
  });
}

async function setDateOfExit(user, proxyDate) {
  loading.value++;
  return new Promise((resolve, reject) => {
    user
      .setDateOfExit(0, Date.parse(proxyDate, "YYYY-MM-DD"))
      .then((result) => {
        loading.value--;
        resolve(result);
      });
  });
}

async function deleteStaff(userList) {
  loading.value++;
  return new Promise((resolve, reject) => {
    userList.forEach((user) => {
      user.delete().then((result) => {
        users.value.splice(
          users.value.findIndex((u) => u.uid === user.uid),
          1
        );
        selectedRow.value.splice(
          selectedRow.value.findIndex((u) => u.uid === user.uid),
          1
        );
        loading.value--;
      });
    });
    resolve();
  });
}

async function addStaff(user) {
  loading.value++;
  return new Promise((resolve, reject) => {
    user.add().then((result) => {
      let u = new User(result.data);
      users.value.push(new User(result.data));
      loading.value--;
      resolve(result);
    });
  });
}

async function changeOrder(user, dir) {
  loading.value++;
  return new Promise((resolve, reject) => {
    user.setOrder(dir).then((result) => {
      if (result.data.uid1) {
        users.value[
          users.value.findIndex((value) => value.uid == result.data.uid1)
        ].order = result.data.order1;
      }

      if (result.data.uid2) {
        users.value[
          users.value.findIndex((value) => value.uid == result.data.uid2)
        ].order = result.data.order2;
      }
      loading.value--;
      resolve(result);
    });
  });
}

async function toggleEnable(user) {
  loading.value++;
  return new Promise((resolve, reject) => {
    user.toggleEnable().then((result) => {
      loading.value--;
      resolve(result);
    });
  });
}

onMounted(async () => {
  users.value = await User.loadTempUsers();
});
</script>
