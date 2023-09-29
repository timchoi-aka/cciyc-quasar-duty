<template>
  <div>
    <!-- loading dialog -->
    <LoadingDialog v-model="loading" message="儲存中"/>

    <q-table
      flat
      :grid="$q.screen.lt.sm"
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
            <q-card-section class="bg-blue-1 q-mb-md row justify-around items-center">
              <div class="col-sm-6 text-body1">{{ props.row.name }}</div>
              <q-space />
              <div class="col-sm-6 q-mx-sm text-body1">
                排序{{ props.row.order }}
                <q-btn
                  :disable="props.row.order == 1"
                  round
                  size="xs"
                  color="positive"
                  icon="keyboard_arrow_up"
                  @click="changeOrder(props.key, 'UP')"
                />
                <q-btn
                  :disable="props.row.order == users.length"
                  round
                  size="xs"
                  color="negative"
                  icon="keyboard_arrow_down"
                  @click="changeOrder(props.key, 'DOWN')"
                />
              </div>
            </q-card-section>
            <q-card-section style="font-size: 1vw" class="row justify-around q-pa-none">
              <div class="col-xs-3 justify-center" style="text-align: center">
                <div class="text-caption">帳戶有效</div>
                <q-btn
                  round
                  :color="props.row.enable ? 'positive' : 'negative'"
                  :label="props.row.enable ? '有' : '沒有'"
                  @click="changeEnable(props.key)"
                />
              </div>
              <div class="col-xs-3 justify-center" style="text-align: center">
                <div class="text-caption">批核假期</div>
                <q-btn
                  round
                  :color="props.row.privilege_leaveApprove ? 'positive' : 'negative'"
                  :label="props.row.privilege_leaveApprove ? '有' : '沒有'"
                  @click="changeLeaveApprove(props.key)"
                />
              </div>
              <div class="col-xs-3 justify-center" style="text-align: center">
                <div class="text-caption">檢視假期</div>
                <q-btn
                  round
                  :color="props.row.privilege_leaveManage ? 'positive' : 'negative'"
                  :label="props.row.privilege_leaveManage ? '有' : '沒有'"
                  @click="changeLeaveManage(props.key)"
                />
              </div>
              <div class="col-xs-3 justify-center" style="text-align: center">
                <div class="text-caption">特別年假</div>
                <q-btn
                  round
                  :color="props.row.privilege_sal ? 'positive' : 'negative'"
                  :label="props.row.privilege_sal ? '有' : '沒有'"
                  @click="changeSal(props.key)"
                />
              </div>
              <div class="col-xs-3 justify-center" style="text-align: center">
                <div class="text-caption">修改更表</div>
                <q-btn
                  round
                  :color="props.row.privilege_scheduleModify ? 'positive' : 'negative'"
                  :label="props.row.privilege_scheduleModify ? '有' : '沒有'"
                  @click="changeScheduleModify(props.key)"
                />
              </div>
              <div class="col-xs-3 justify-center" style="text-align: center">
                <div class="text-caption">用戶管理</div>
                <q-btn
                  round
                  :color="props.row.privilege_userManagement ? 'positive' : 'negative'"
                  :label="props.row.privilege_userManagement ? '有' : '沒有'"
                  @click="changeUserManagement(props.key)"
                />
              </div>
              <div class="col-xs-3 justify-center" style="text-align: center">
                <div class="text-caption">試用</div>
                <q-btn
                  round
                  :color="props.row.privilege_probation ? 'positive' : 'negative'"
                  :label="props.row.privilege_probation ? '有' : '沒有'"
                  @click="changeProbation(props.key)"
                />
              </div>
              <div class="col-xs-3 justify-center" style="text-align: center">
                <div class="text-caption">財務</div>
                <q-btn
                  round
                  :color="props.row.privilege_finance ? 'positive' : 'negative'"
                  :label="props.row.privilege_finance ? '有' : '沒有'"
                  @click="changeFinance(props.key)"
                />
              </div>
              <div class="col-xs-3 justify-center" style="text-align: center">
                <div class="text-caption">活動管理</div>
                <q-btn
                  round
                  :color="props.row.privilege_eventManagement ? 'positive' : 'negative'"
                  :label="props.row.privilege_eventManagement ? '有' : '沒有'"
                  @click="changeEventManagement(props.key)"
                />
              </div>
              <div class="col-xs-3 justify-center" style="text-align: center">
                <div class="text-caption">審批醫療</div>
                <q-btn
                  round
                  :color="props.row.privilege_healthapprove ? 'positive' : 'negative'"
                  :label="props.row.privilege_healthapprove ? '有' : '沒有'"
                  @click="changeHealthApprove(props.key)"
                />
              </div>
            </q-card-section>
            <q-separator inet class="q-mt-sm" />
            <q-card-section
              class="q-pa-none q-pb-sm"
            >
              <q-chip size="lg" class="bg-primary text-white" label="受聘記錄"/>
                  <q-btn v-if="!editEmployment" label="修改" icon="edit" class="bg-primary text-white q-my-md" @click="startEditEmployment(props.key)"/>
                  <q-btn v-if="editEmployment" label="新增" icon="add" class="bg-primary text-white q-my-md" @click="newEmploymentRecord.push({dateOfEntry: null, dateOfExit: null, rank: null})"/>
                  <q-btn v-if="editEmployment" label="取消" icon="cancel" class="bg-negative text-white q-my-md" @click="cancelEmploymentRecordChange"/>
                  <q-btn v-if="editEmployment && JSON.stringify(newEmploymentRecord) != JSON.stringify(props.row.employment)" label="儲存" icon="save" class="bg-positive text-white q-my-md" @click="saveEmploymentRecord(props.key)"/>
                  <div v-if="!editEmployment" v-for="employ in props.row.employment" class="row text-h6">
                    <div class="col-4">入職日期：</div>
                    <div class="col-8">{{ qdate.formatDate(employ.dateOfEntry, "YYYY年M月D日")}}</div>
                    <div class="col-4">離職日期：</div>
                    <div class="col-8">{{ qdate.formatDate(employ.dateOfExit, "YYYY年M月D日")}}</div>
                    <div class="col-4">職級：</div>
                    <div class="col-8">{{ rankInputReverseMap[employ.rank]}}</div>
                  </div>
                  <div v-else v-for="(employ, index) in newEmploymentRecord" class="row">
                    <div class="col-4">入職日期：</div>
                    <div class="col-8"><DateComponent v-model="employ.dateOfEntry" label="人職日期"/></div>
                    <div class="col-4">離職日期：</div>
                    <div class="col-8"><DateComponent v-model="employ.dateOfExit" label="離職日期"/></div>
                    <div class="col-4">職級：</div>
                    <div class="col-4">
                      <q-select
                        :label="rankInputReverseMap[newEmploymentRecord[index].rank]"
                        hide-bottom-space
                        v-model="newEmploymentRecord[index].rank"
                        :options="rankInputOptions"
                      />
                    </div>
                    <q-btn v-if="index > 0" class="bg-negative text-white" label="刪除" icon="delete" @click="newEmploymentRecord.splice(index, 1)"/>
                  </div>
               </q-card-section>
               <q-card-section
                  class="row justify-around items-center q-pa-none q-pb-sm"
                ><q-chip size="lg" class="bg-primary text-white" label="預設更表"/>
                  <div class="col-12 row">
                    <span class="text-center column col-2" v-for="(item, index) in props.row.defaultSchedule">
                      <div>{{ scheduleIndex[index] }}</div>
                      <div>
                        <q-chip :label="item">
                          <q-popup-edit filled v-model="props.row.defaultSchedule[index]" :title="scheduleIndex[index]" auto-save v-slot="scope">
                            <q-input type="number" v-model="scope.value"/>
                          </q-popup-edit>
                        </q-chip>
                      </div>
                    </span>
                    <q-btn class="bg-primary text-white" label="儲存" @click="saveSchedule(props.key)"/>
                  </div>
            </q-card-section>
          </q-card>
        </div>
      </template>

      <!-- row template -->
      <template v-slot:body="props">
        <q-tr :props="props">
          <!-- name -->
          <q-td style="font-size: 1.2vw; text-align: center; width: 3vw;">
            {{ props.row.name }}
          </q-td>
          <!-- enable? -->
          <q-td style="font-size: 1.2vw; text-align: center; width: 3vw;">
            <q-btn
              round
              :color="props.row.enable ? 'positive' : 'negative'"
              :label="props.row.enable ? '有' : '沒有'"
              @click="changeEnable(props.key)"
            />
          </q-td>

          <!-- leaveApprove? -->
          <q-td style="font-size: 1.2vw; text-align: center; width: 3vw;">
            <q-btn
              round
              :color="props.row.privilege_leaveApprove ? 'positive' : 'negative'"
              :label="props.row.privilege_leaveApprove ? '有' : '沒有'"
              @click="changeLeaveApprove(props.key)"
            />
          </q-td>

          <!-- leaveManage? -->
          <q-td style="font-size: 1.2vw; text-align: center; width: 3vw;">
            <q-btn
              round
              :color="props.row.privilege_leaveManage ? 'positive' : 'negative'"
              :label="props.row.privilege_leaveManage ? '有' : '沒有'"
              @click="changeLeaveManage(props.key)"
            />
          </q-td>

          <!-- sal? -->
          <q-td style="font-size: 1.2vw; text-align: center; width: 3vw;">
            <q-btn
              round
              :color="props.row.privilege_sal ? 'positive' : 'negative'"
              :label="props.row.privilege_sal ? '有' : '沒有'"
              @click="changeSal(props.key)"
            />
          </q-td>

          <!-- scheduleModify? -->
          <q-td style="font-size: 1.2vw; text-align: center; width: 3vw;">
            <q-btn
              round
              :color="props.row.privilege_scheduleModify ? 'positive' : 'negative'"
              :label="props.row.privilege_scheduleModify ? '有' : '沒有'"
              @click="changeScheduleModify(props.key)"
            />
          </q-td>

          <!-- userManagement? -->
          <q-td style="font-size: 1.2vw; text-align: center; width: 3vw;">
            <q-btn
              round
              :color="props.row.privilege_userManagement ? 'positive' : 'negative'"
              :label="props.row.privilege_userManagement ? '有' : '沒有'"
              @click="changeUserManagement(props.key)"
            />
          </q-td>

          <!-- probation? -->
          <q-td style="font-size: 1.2vw; text-align: center; width: 3vw;">
            <q-btn
              round
              :color="props.row.privilege_probation ? 'positive' : 'negative'"
              :label="props.row.privilege_probation ? '有' : '沒有'"
              @click="changeProbation(props.key)"
            />
          </q-td>

           <!-- finance? -->
           <q-td style="font-size: 1.2vw; text-align: center; width: 3vw;">
            <q-btn
              round
              :color="props.row.privilege_finance ? 'positive' : 'negative'"
              :label="props.row.privilege_finance ? '有' : '沒有'"
              @click="changeFinance(props.key)"
            />
          </q-td>

          <!-- event management?? -->
          <q-td style="font-size: 1.2vw; text-align: center; width: 3vw;">
            <q-btn
              round
              :color="props.row.privilege_eventManagement ? 'positive' : 'negative'"
              :label="props.row.privilege_eventManagement ? '有' : '沒有'"
              @click="changeEventManagement(props.key)"
            />
          </q-td>

          <!-- health approve?? -->
          <q-td style="font-size: 1.2vw; text-align: center; width: 3vw;">
            <q-btn
              round
              :color="props.row.privilege_healthapprove ? 'positive' : 'negative'"
              :label="props.row.privilege_healthapprove ? '有' : '沒有'"
              @click="changeHealthApprove(props.key)"
            />
          </q-td>

          <!-- order? -->
          <q-td style="font-size: 1.2vw; text-align: center; width: 3vw;">
            <div class="q-mx-sm">
              {{ props.row.order }}
              <q-btn
                :disable="props.row.order == 1"
                round
                size="xs"
                color="positive"
                icon="keyboard_arrow_up"
                @click="changeOrder(props.key, 'UP')"
              />
              <q-btn
                :disable="props.row.order == users.length"
                round
                size="xs"
                color="negative"
                icon="keyboard_arrow_down"
                @click="changeOrder(props.key, 'DOWN')"
              />
            </div>
          </q-td>

          <!-- extra info button -->
          <q-td style="font-size: 1.2vw; text-align: center; width: 3vw;">
            <q-btn color="primary" round dense @click="props.expand = !props.expand" :icon="props.expand ? 'remove' : 'add'" />
          </q-td>
        </q-tr>

        <!-- expanding row-->
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%">
            <q-tabs v-model="activeTab" inline-label align="left" class="bg-warning text-black">
              <q-tab name="employment" icon="source" label="受聘記錄" />
              <q-tab name="schedule" icon="event" label="預設更表" />
            </q-tabs>

            <q-tab-panels
              v-model="activeTab"
              animated
              swipeable
              transition-prev="jump-up"
              transition-next="jump-up"
            >
              <q-tab-panel name="employment" class="q-ma-none q-pa-sm text-body1">
                <q-btn v-if="!editEmployment" label="修改" icon="edit" class="bg-primary text-white q-my-md" @click="startEditEmployment(props.key)"/>
                <q-btn v-if="editEmployment" label="新增受聘記錄" icon="add" class="bg-primary text-white q-my-md" @click="newEmploymentRecord.push({dateOfEntry: null, dateOfExit: null, rank: null})"/>
                <q-btn v-if="editEmployment" label="取消修改" icon="cancel" class="bg-negative text-white q-my-md" @click="cancelEmploymentRecordChange"/>
                <q-btn v-if="editEmployment && JSON.stringify(newEmploymentRecord) != JSON.stringify(props.row.employment)" label="儲存" icon="save" class="bg-positive text-white q-my-md" @click="saveEmploymentRecord(props.key)"/>
                <div v-if="!editEmployment" v-for="employ in props.row.employment" class="row">
                  <div class="col-1">入職日期：</div>
                  <div class="col-2">{{ qdate.formatDate(employ.dateOfEntry, "YYYY年M月D日")}}</div>
                  <div class="q-ml-md col-1">離職日期：</div>
                  <div class="col-2">{{ qdate.formatDate(employ.dateOfExit, "YYYY年M月D日")}}</div>
                  <div class="q-ml-md col-1">職級：</div>
                  <div class="col-1">{{ rankInputReverseMap[employ.rank]}}</div>
                </div>
                <div v-else v-for="(employ, index) in newEmploymentRecord" class="row">
                  <div class="col-1">入職日期：</div>
                  <div class="col-2"><DateComponent v-model="employ.dateOfEntry" label="人職日期"/></div>
                  <div class="q-ml-md col-1">離職日期：</div>
                  <div class="col-2"><DateComponent v-model="employ.dateOfExit" label="離職日期"/></div>
                  <div class="q-ml-md col-1">職級：</div>
                  <div class="col-1">
                    <q-select
                      :label="rankInputReverseMap[newEmploymentRecord[index].rank]"
                      hide-bottom-space
                      v-model="newEmploymentRecord[index].rank"
                      :options="rankInputOptions"
                    />
                  </div>
                  <q-btn v-if="index > 0" class="bg-negative text-white" label="刪除" icon="delete" @click="newEmploymentRecord.splice(index, 1)"/>
                </div>
              </q-tab-panel>
              <q-tab-panel name="schedule" class="q-ma-none q-pa-sm text-body1 row">
                <div class="col-12 row">
                  <span class="text-center column col" v-for="(item, index) in props.row.defaultSchedule">
                    <div>{{ scheduleIndex[index] }}</div>
                    <div>
                      <q-chip :label="item">
                        <q-popup-edit filled v-model="props.row.defaultSchedule[index]" :title="scheduleIndex[index]" auto-save v-slot="scope">
                          <q-input type="number" v-model="scope.value"/>
                        </q-popup-edit>
                      </q-chip>
                    </div>
                  </span>
                  <q-btn class="bg-primary text-white" label="儲存" @click="saveSchedule(props.key)"/>
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </q-td>
        </q-tr>
      </template>

      <!-- template of column "rank" -->
      <template v-slot:body-cell-rank="props">
        <q-td :props="props">
          <q-select
            :label="rankInputReverseMap[props.row.rank]"
            hide-bottom-space
            v-model="props.newRank"
            :options="rankInputOptions"
            @update:model-value="
              (val) => {
                changeRank(props.key, val);
              }
            "
          />
        </q-td>
      </template>

      <!-- template of column "dateOfEntry" -->
      <template v-slot:body-cell-dateOfEntry="props">
        <q-td :props="props">
          <span
            v-html="
              props.row.dateOfEntry
                ? qdate.formatDate(props.row.dateOfEntry, 'YYYY-MM-DD')
                : ''
            "
          />
          <q-btn icon="event" round color="primary" class="q-mx-xs">
            <q-popup-proxy
              @before-show="proxyDate = props.row.dateOfEntry"
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
                    @click="changeDateOfEntry(props.row.uid, proxyDate)"
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
                  <q-btn label="取消" color="primary" flat v-close-popup />
                  <q-btn
                    label="確定"
                    color="primary"
                    flat
                    @click="changeDateOfExit(props.row.uid, proxyDate)"
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
import { usersCollection, FirebaseFunctions } from "boot/firebase";
import { date as qdate, useQuasar } from "quasar";
import LoadingDialog from "components/LoadingDialog.vue"
import { httpsCallable } from "@firebase/functions";
import { ref, computed } from "vue"
import { query, where, getDocs } from "firebase/firestore"
import DateComponent from "src/components/Basic/DateComponent.vue";


// variables
const $q = useQuasar()
const loading = ref(0)
const proxyDate = ref("")
const users = ref([])
const activeTab = ref("employment")
const rankInputOptions = ref(["ASWO", "SWA", "WW", "OA", "CA", "PA", "GA", "GW", "GA_PT", "TMP"])
const scheduleIndex = ref([
  "日早", "日午", "日晚",
  "一早", "一午", "一晚",
  "二早", "二午", "二晚",
  "三早", "三午", "三晚",
  "四早", "四午", "四晚",
  "五早", "五午", "五晚",
  "六早", "六午", "六晚",
])
const rankInputMap = ref({
  ASWO: "aswo",
  SWA: "swa",
  WW: "ww",
  OA: "oa",
  CA: "ca",
  PA: "pa",
  GA: "ga",
  GW: "gw",
  GA_PT: "ga_pt",
  TMP: "tmp",
})
const editEmployment = ref(false)
const newEmploymentRecord = ref()

const rankInputReverseMap = ref({
  aswo: "ASWO",
  swa: "SWA",
  ww: "WW",
  oa: "OA",
  ca: "CA",
  pa: "PA",
  ga: "GA",
  gw: "GW",
  ga_pt: "GA_PT",
  tmp: "TMP",
})

// table config
const pagination = ref({
  sortBy: "order",
  rowsPerPage: 0,
})

const tableFields = ref([
  {
    name: "name",
    label: "姓名",
    field: "name",
    headerStyle:
      "font-size: 1.5vw; text-align: center; width: 3vw;  max-width: 3vw;",
    style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
  },
  {
    name: "enable",
    label: "帳戶有效",
    field: "enable",
    headerStyle:
      "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 3vw;",
    style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
  },
  {
    name: "privilege_leaveApprove",
    label: "批核假期",
    field: "privilege_leaveApprove",
    headerStyle:
      "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 3vw;",
    style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
  },
  {
    name: "privilege_leaveManage",
    label: "檢視假期",
    field: "privilege_leaveManage",
    headerStyle:
      "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 3vw;",
    style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
  },
  {
    name: "privilege_sal",
    label: "特別年假",
    field: "privilege_sal",
    headerStyle:
      "font-size: 1.5vw; text-align: center;  width: 3vw; max-width: 3vw;",
    style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
  },
  {
    name: "privilege_scheduleModify",
    label: "修改更表",
    field: "privilege_scheduleModify",
    headerStyle:
      "font-size: 1.5vw; text-align: center;  width: 3vw; max-width: 3vw;",
    style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
  },
  {
    name: "privilege_userManagement",
    label: "用戶管理",
    field: "privilege_userManagement",
    headerStyle:
      "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 3vw;",
    style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
  },
  {
    name: "privilege_probation",
    label: "試用",
    field: "privilege_probation",
    headerStyle:
      "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 3vw;",
    style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
  },
  {
    name: "privilege_finance",
    label: "財務",
    field: "privilege_finance",
    headerStyle:
      "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 3vw;",
    style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
  },
  {
    name: "privilege_eventManagement",
    label: "活動管理",
    field: "privilege_eventManagement",
    headerStyle:
      "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 3vw;",
    style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
  },
  {
    name: "privilege_healthapprove",
    label: "審批醫療",
    field: "privilege_healthapprove",
    headerStyle:
      "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 3vw;",
    style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 3vw;",
  },
  {
    name: "order",
    label: "排序",
    field: "order",
    sortOrder: "ad",
    sort: (a, b, rowA, rowB) => parseInt(a, 10) - parseInt(b, 10),
    sortable: true,
    headerStyle:
      "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 5vw;",
    style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 5vw;",
  },
  {
    name: "others",
    label: "其他",
    field: "others",
    headerStyle:
      "font-size: 1.5vw; text-align: center; width: 3vw; max-width: 5vw;",
    style: "font-size: 1.2vw; text-align: center; width: 3vw; max-width: 5vw;",
  },
])

// function
function changeDateOfExit(uid, date) {
  const changeDateOfExit = httpsCallable(FirebaseFunctions, "user-changeDateOfExit");
  loading.value++;
  changeDateOfExit({ uid: uid, dateOfExit: new Date(date) }).then((result) => {
    users.value[
      users.value.findIndex((value) => value.uid == result.data.uid)
    ].dateOfExit = result.data.dateOfExit;
    loading.value--;
  });
}

function changeDateOfEntry(uid, date) {
  const changeDateOfEntry = httpsCallable(FirebaseFunctions, "user-changeDateOfEntry");
  loading.value++;
  changeDateOfEntry({ uid: uid, dateOfEntry: new Date(date) }).then((result) => {
    users.value[
      users.value.findIndex((value) => value.uid == result.data.uid)
    ].dateOfEntry = result.data.dateOfEntry;
    loading.value--;
  });
}

function changeRank(uid, rank) {
  const changeRank = httpsCallable(FirebaseFunctions, "user-changeRank");
  loading.value++;
  changeRank({ uid: uid, rank: rankInputMap.value[rank] }).then((result) => {
    users.value[users.value.findIndex((value) => value.uid == result.data.uid)].rank =
      result.data.rank;
    loading.value--;
  });
}

function changeOrder(uid, dir) {
  // call https functions to change leaveApprove privilege
  const changeOrder = httpsCallable(FirebaseFunctions, "user-changeOrder");
  loading.value++;
  changeOrder({ uid: uid, dir: dir }).then((result) => {
    if (result.data.uid1) {
      users.value[users.value.findIndex((value) => value.uid == result.data.uid1)].order =
        result.data.order1;
    }

    if (result.data.uid2) {
      users.value[users.value.findIndex((value) => value.uid == result.data.uid2)].order =
        result.data.order2;
    }
    loading.value--;
  });
}

function changeEnable(uid) {
  // call https functions to change leaveApprove privilege
  const toggleEnable = httpsCallable(FirebaseFunctions, "user-toggleEnable");
  loading.value++;
  toggleEnable(uid).then((result) => {
    users.value[users.value.findIndex((value) => value.uid == uid)].enable =
      result.data;
    loading.value--;
  });
}

function changeLeaveApprove(uid) {
  // call https functions to change leaveApprove privilege
  const toggleLeaveApprove = httpsCallable(FirebaseFunctions,
    "user-toggleLeaveApprove"
  );
  loading.value++;
  toggleLeaveApprove(uid).then((result) => {
    users.value[
      users.value.findIndex((value) => value.uid == uid)
    ].privilege_leaveApprove = result.data;
    loading.value--;
  });
}

function changeFinance(uid) {
  // call https functions to change leaveApprove privilege
  const toggleFinance = httpsCallable(FirebaseFunctions,
    "user-toggleFinance"
  );
  loading.value++;
  toggleFinance(uid).then((result) => {
    users.value[
      users.value.findIndex((value) => value.uid == uid)
    ].privilege_finance = result.data;
    loading.value--;
  });
}

function changeLeaveManage(uid) {
  // call https functions to change leaveApprove privilege
  const toggleLeaveManage = httpsCallable(FirebaseFunctions, "user-toggleLeaveManage");
  loading.value++;
  toggleLeaveManage(uid).then((result) => {
    users.value[
      users.value.findIndex((value) => value.uid == uid)
    ].privilege_leaveManage = result.data;
    loading.value--;
  });
}

function changeUserManagement(uid) {
  // call https functions to change leaveApprove privilege
  const toggleUserManagement = httpsCallable(FirebaseFunctions,
    "user-toggleUserManagement"
  );
  loading.value++;
  toggleUserManagement(uid).then((result) => {
    users.value[
      users.value.findIndex((value) => value.uid == uid)
    ].privilege_userManagement = result.data;
    loading.value--;
  });
}

function changeProbation(uid) {
  // call https functions to change leaveApprove privilege
  const toggleProbation = httpsCallable(FirebaseFunctions,
    "user-toggleProbation"
  );
  loading.value++;
  toggleProbation(uid).then((result) => {
    users.value[
      users.value.findIndex((value) => value.uid == uid)
    ].privilege_probation = result.data;
    loading.value--;
  });
}

function changeParttime(uid) {
  // call https functions to change leaveApprove privilege
  const toggleParttime = httpsCallable(FirebaseFunctions,
    "user-toggleParttime"
  );
  loading.value++;
  toggleParttime(uid).then((result) => {
    users.value[
      users.value.findIndex((value) => value.uid == uid)
    ].parttime = result.data;
    loading.value--;
  });
}

function changeSal(uid) {
  // call https functions to change sal privilege
  const toggleSal = httpsCallable(FirebaseFunctions, "user-toggleSal");
  loading.value++;
  toggleSal(uid).then((result) => {
    users.value[users.value.findIndex((value) => value.uid == uid)].privilege_sal =
      result.data;
    loading.value--;
  });
}

function changeHealthApprove(uid) {
  // call https functions to change sal privilege
  const toggleHealthApprove = httpsCallable(FirebaseFunctions, "user-toggleHealthApprove");
  loading.value++;
  toggleHealthApprove(uid).then((result) => {
    users.value[users.value.findIndex((value) => value.uid == uid)].privilege_healthapprove =
      result.data;
    loading.value--;
  });
}

function changeEventManagement(uid) {
  // call https functions to change sal privilege
  const toggleEventManagement = httpsCallable(FirebaseFunctions, "user-toggleEventManagement");
  loading.value++;
  toggleEventManagement(uid).then((result) => {
    users.value[users.value.findIndex((value) => value.uid == uid)].privilege_eventManagement =
      result.data;
    loading.value--;
  });
}

function changeScheduleModify(uid) {
  // call https functions to change scheduleModify privilege
  const toggleScheduleModify = httpsCallable(FirebaseFunctions,
    "user-toggleScheduleModify"
  );
  loading.value++;
  toggleScheduleModify(uid).then((result) => {
    users.value[
      users.value.findIndex((value) => value.uid == uid)
    ].privilege_scheduleModify = result.data;
    loading.value--;
  });
}

function saveSchedule(uid) {
  let i = users.value.findIndex((e) => e.uid == uid)

  // call https functions to change scheduleModify privilege
  const updateDefaultSchedule = httpsCallable(FirebaseFunctions,
    "user-updateDefaultSchedule"
  );
  loading.value++;
  updateDefaultSchedule({
    uid: uid,
    schedule: users.value[i].defaultSchedule,
  }).then((result) => {
    users.value[i].defaultSchedule = result.data;
    loading.value--;
    $q.notify({ message: "成功儲存。" })
  });
}

function startEditEmployment(uid) {
  let i = users.value.findIndex((e) => e.uid == uid)
  editEmployment.value = true
  newEmploymentRecord.value = JSON.parse(JSON.stringify(users.value[i].employment))
}

function saveEmploymentRecord(uid) {
  let object = JSON.parse(JSON.stringify(newEmploymentRecord.value))
  object.forEach((entry) => {
    if (!entry.rank) {
      return $q.notify({ message: "請輸入職級！", icon: 'error', color: 'negative', textColor: 'white' })
    }
    entry.dateOfEntry = entry.dateOfEntry? qdate.formatDate(qdate.extractDate(entry.dateOfEntry, "YYYY/MM/DD"), "YYYY-MM-DDT00:00:00"): null
    entry.dateOfExit = entry.dateOfExit? qdate.formatDate(qdate.extractDate(entry.dateOfExit, "YYYY/MM/DD"), "YYYY-MM-DDT00:00:00"): null
    entry.rank = entry.rank? rankInputMap.value[entry.rank]? rankInputMap.value[entry.rank]: entry.rank: null
  })

  // call https functions to update employment record
  const saveEmployment = httpsCallable(FirebaseFunctions, "user-saveEmployment");
  loading.value++;
  saveEmployment({
    uid: uid,
    employment: object
  }).then((result) => {
    // console.log("result:" + JSON.stringify(result))
    users.value[users.value.findIndex((e) => e.uid == uid)].employment = []
    result.data.forEach((data) => {
      users.value[users.value.findIndex((e) => e.uid == uid)].employment.push({
        dateOfEntry: data.dateOfEntry? qdate.formatDate(data.dateOfEntry, "YYYY/MM/DD"): new Date(),
        dateOfExit: data.dateOfExit? qdate.formatDate(data.dateOfExit, "YYYY/MM/DD"): "",
        rank: data.rank
      })
    })

    newEmploymentRecord.value = {}
    editEmployment.value = false
    loading.value--
  });
}

function cancelEmploymentRecordChange() {
  editEmployment.value = false
  newEmploymentRecord.value = {}
}

// module logic
const userQuery = query(usersCollection,
  where("privilege.tmp", "!=", true)
)

getDocs(userQuery).then((userDoc) => {
  userDoc.forEach((user) => {
    let d = user.data();
    let employment = user.data().employment;

    employment.forEach((e) => {
      e.dateOfEntry = e.dateOfEntry? qdate.formatDate(new Date(e.dateOfEntry.toDate().getTime() + 28800000), "YYYY/MM/DD"): new Date();
      e.dateOfExit = e.dateOfExit? qdate.formatDate(new Date(e.dateOfExit.toDate().getTime() + 28800000), "YYYY/MM/DD"): "";
    })
    /*
    if (d.dateOfEntry != undefined) {
      d.dateOfEntry = new Date(d.dateOfEntry.toDate());
    } else {
      d.dateOfEntry = new Date();
    }

    if (d.dateOfExit != undefined) {
      d.dateOfExit = new Date(d.dateOfExit.toDate());
    } else {
      d.dateOfExit = "";
    }
    */

    users.value.push({
      name: d.name,
      enable: "enable" in d ? d.enable : true,
      uid: d.uid,
      privilege_leaveApprove: d.privilege.leaveApprove,
      privilege_leaveManage: d.privilege.leaveManage,
      privilege_sal: d.privilege.sal,
      privilege_scheduleModify: d.privilege.scheduleModify,
      privilege_userManagement: d.privilege.userManagement,
      privilege_probation: d.privilege.probation? d.privilege.probation: false,
      privilege_eventManagement: d.privilege.eventManagement? d.privilege.eventManagement: false,
      parttime: d.parttime? d.parttime: false,
      privilege_finance: d.privilege.finance? d.privilege.finance: false,
      privilege_healthapprove: d.privilege.healthapprove? d.privilege.healthapprove: false,
      order: d.order,
      employment: employment,
      defaultSchedule: d.defaultSchedule,
    });
  });
})
</script>
