<template>
  <!-- renew dialog -->
  <q-dialog v-model="renewDialog">
    <q-card>
      <q-card-section class="bg-primary text-white text-h6">
        {{renewObject.c_mem_id}} - 續會 <span v-if="renewObject.duration == 1">(1年)</span><span v-else>(永久)</span>
      </q-card-section>
      <q-card-section class="bg-blue-1 text-h6">
        <div>姓名: {{renewObject.c_name}}</div>
        <div>年齡: {{ageUtil.calculateAge(renewObject.d_birth)}}</div>
        <div>現時會藉: {{renewObject.old_c_udf_1}}</div>
        <div>現時屆滿日期: {{qdate.formatDate(renewObject.d_expired_1, "YYYY年MM月DD日")}}</div>
      </q-card-section>
      <q-card-section class="bg-yellow-1 text-h6">
        <div>新會藉: {{ renewObject.c_udf_1 }}</div>
        <div>新屆滿日期: {{qdate.formatDate(renewObject.new_expired_1, "YYYY年MM月DD日")}}</div>
        <div>費用: {{renewObject.renewFee}}</div>
      </q-card-section>
      <q-card-actions class="row justify-end">
        <q-btn icon="cancel" class="bg-negative text-white" label="取消" v-close-popup/>
        <q-btn icon="check" class="bg-secondary text-white" label="確定" v-close-popup @click="renewMember(renewObject)"/>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- loading dialog -->
  <q-dialog v-model="waitingAsync" position="bottom">
    <LoadingDialog message="處理中"/>
  </q-dialog>

  <!-- print receipt modal -->
  <q-dialog v-if="$q.screen.gt.md"
    v-model="printReceiptModal"
    full-height
    full-width
    transition-show="slide-up"
    transition-hide="slide-down"
    class="q-pa-none"
    >
    <PrintReceipt :MemberID="printReceiptMember"/>
  </q-dialog>

  <q-dialog v-if="$q.screen.lt.md"
    v-model="printReceiptModal"
    maximized
    full-width
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
    class="q-pa-none"
    >
    <PrintReceipt :MemberID="printReceiptMember"/>
  </q-dialog>

  <!-- confirm delete dialog -->
  <q-dialog v-model="confirmDeleteModal">
    <q-card style="border-radius: 30px">
      <q-card-section>
        <div class="text-h5 text-center" style="border-bottom: 3px solid red">
          確定刪除會員 {{member.c_mem_id}}？
        </div>
      </q-card-section>

      <q-card-section class="q-pa-md text-negative">
        警告：這會永久刪除會員，並不可回復！
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn v-close-popup flat color="primary" label="取消" />
        <q-btn
          v-close-popup="-1"
          @click="confirmUserRemove"
          flat
          color="red"
          label="確認刪除"
          round
          icon="cancel"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
    
  <!-- quit member dialog -->
  <q-dialog v-model="quitDialog">
    <q-card>
      <q-card-section class="bg-primary text-white">
        {{member.c_mem_id}} - 退會申請
      </q-card-section>
      <q-card-section>
        是否確定退會？退出後要使用中心服務只能重新入會。
      </q-card-section>
      <q-card-actions align="right">
        <q-btn v-close-popup flat color="primary" label="取消" />
        <q-btn
          v-close-popup="-1"
          @click="quitMember"
          flat
          color="red"
          label="確認退會"
          round
          icon="cancel"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
    
  <q-card>
    <q-card-section class="bg-primary text-white text-h6">
      <!-- mobile UI -->
      <div class="row" v-if="$q.screen.lt.sm">
        <div class="col-md-10 col-sm-10 col-xs-8 row">
          <span v-if="member.c_mem_id != null"><MemberSelection class="text-white" :model-value="props.modelValue" @update:model-value="(value) => $emit('update:modelValue', value? value: props.modelValue)"/></span>
        </div>
        <q-btn v-if="!editState" class="text-white q-mr-none col-shrink" rounded flat icon="edit" @click="startEdit">
          <q-tooltip class="text-white">修改</q-tooltip>  
        </q-btn>
        <q-space/>
        <q-btn class="col-shrink" dense flat icon="close" v-close-popup>
          <q-tooltip class="bg-white text-primary">關閉</q-tooltip>
        </q-btn>
      </div>
      <!-- desktop UI -->
      <div class="row" v-else>
        <div class="col-*">
          <span v-if="member.c_mem_id != null">{{member.c_mem_id}} - </span>
          <span v-if="member.c_name != null" class="col-4">{{member.c_name}}</span>
          <span v-if="member.c_name_other" class="col-1">({{member.c_name_other}})</span>
          <span v-if="member.c_sex != null" class="col-1">[{{member.c_sex}}]</span>
        </div>
        <q-btn v-if="!editState" class="text-white q-mr-none col-shrink" rounded flat icon="edit" @click="startEdit">
          <q-tooltip class="text-white">修改</q-tooltip>  
        </q-btn>
        <q-space/>
        <MemberSelection class="text-white" :model-value="props.modelValue" @update:model-value="(value) => $emit('update:modelValue', value? value: props.modelValue)"/>
        <q-btn class="col-shrink" dense flat icon="close" v-close-popup>
          <q-tooltip class="bg-white text-primary">關閉</q-tooltip>
        </q-btn>
      </div>
      
      <div class="row">
        <div class="row col-xs-12">
          <q-btn v-if="editState" class="text-white q-mr-none" rounded flat icon="save" @click="saveRecord">
            <q-tooltip class="text-white">儲存</q-tooltip>  
          </q-btn>
          <q-btn v-if="editState" class="text-white q-mr-none" rounded flat icon="replay" @click="resetEdit">
            <q-tooltip class="text-white">重置</q-tooltip>  
          </q-btn>
          <q-btn v-if="editState" class="text-white q-mr-none" rounded flat icon="cancel" @click="cancelEdit">
            <q-tooltip class="text-white">取消</q-tooltip>  
          </q-btn>
        </div>
        <div class="row col-xs-12">
          <q-btn v-if="isSystemAdmin || isCenterIC" class="bg-white bg-red" dense flat icon="delete" label="刪除" @click="confirmDeleteModal = true"/>
          
          <q-btn-dropdown unelevated class="q-mx-sm" v-if="member.c_udf_1 != '永久會員' && !member.d_exit_1" color="positive" icon="mail" label="續會" >
            <q-list>
              <q-item clickable v-close-popup @click="renewMemberModal(member, 1)">
                <q-item-section>
                  <q-item-label>一年</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="renewMemberModal(member, 999)">
                <q-item-section>
                  <q-item-label>永久</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <q-btn v-if="!member.d_exit_1" unelevated class="q-mx-sm" square color="negative" @click="quitDialog = true" icon="alarm" label="退會" />
        
          <q-space/>
        </div>
      </div>
    </q-card-section>
    
    <q-card-section class="bg-blue-1 row q-pa-none" style="border: 1px solid lightgrey;">
      <div class="q-pa-sm col-12 col-xs-12 bg-blue-2 text-black text-h5">個人資料</div>
      <div :class="[ $q.screen.lt.md? 'q-pa-xs text-body1' : 'q-pa-sm text-h6', 'col-12', 'col-xs-12']">
        <div class="col-12 col-xs-12 row"><span class="col-md-2 col-sm-2 col-xs-4">中文姓名:</span><span v-if="editState" class="col-md-10 col-sm-10 col-xs-8"><q-input filled v-model="edit_member.c_name"/></span><span v-else class="col-md-10 col-sm-10 col-xs-8">{{member.c_name}}</span></div>
        <div class="col-12 col-xs-12 row"><span class="col-md-2 col-sm-2 col-xs-4">英文姓名:</span><span v-if="editState" class="col-md-10 col-sm-10 col-xs-8"><q-input filled v-model="edit_member.c_name_other"/></span><span v-else class="col-md-10 col-sm-10 col-xs-8">{{member.c_name_other}}</span></div>
        <div class="col-12 col-xs-12 row"><span class="col-md-2 col-sm-2 col-xs-4">性別:</span>
          <span v-if="editState" class="col-md-10 col-sm-10 col-xs-8">
            <q-btn-toggle
              v-model="edit_member.c_sex"
              toggle-color="primary"
              :options="[
                { label: '男', value: '男' },
                { label: '女', value: '女' },
              ]"
            />
          </span><span v-else>{{member.c_sex}}</span></div>
        <div class="col-12 row"><span class="col-md-2 col-sm-2 col-xs-4">出生日期: </span>
          <span v-if="editState" class="col-md-10 col-sm-10 col-xs-8">
            <q-input filled v-model="edit_member.d_birth" mask="date" hint="YYYY/MM/DD" :rules="['date']">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="edit_member.d_birth">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Close" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </span>
          <span v-else class="col-md-10 col-sm-10 col-xs-8">{{qdate.formatDate(member.d_birth, "YYYY年MM月DD日")}}</span></div>
        <div class="col-12 row"><span class="col-md-2 col-sm-2 col-xs-4">年齡: </span><span v-if="editState" class="col-md-10 col-sm-10 col-xs-8">{{ageUtil.calculateAge(edit_member.d_birth)}}</span><span v-else class="col-md-10 col-sm-10 col-xs-8">{{ageUtil.calculateAge(member.d_birth)}}</span></div>
        <div class="col-12 row"><span class="col-md-2 col-sm-2 col-xs-4">手提電話: </span><span v-if="editState" class="col-md-10 col-sm-10 col-xs-8"><q-input filled v-model="edit_member.c_mobile" mask="########"/></span><span v-else class="col-md-10 col-sm-10 col-xs-8">{{member.c_mobile}}</span></div>
        <div class="col-12 row"><span class="col-md-2 col-sm-2 col-xs-4">家居電話: </span><span v-if="editState" class="col-md-10 col-sm-10 col-xs-8"><q-input filled v-model="edit_member.c_tel" mask="########"/></span><span v-else class="col-md-10 col-sm-10 col-xs-8">{{member.c_tel}}</span></div>
        <div class="col-12 row"><span class="col-md-2 col-sm-2 col-xs-4">地址:</span><span v-if="editState" class="col-md-10 col-sm-10 col-xs-8"><q-input filled v-model="edit_member.m_addscom"/></span><span v-else class="col-md-10 col-sm-10 col-xs-8">{{member.m_addscom}}</span></div>
        <div class="col-12 row"><span class="col-md-2 col-sm-2 col-xs-4">電郵:</span><span v-if="editState" class="col-md-10 col-sm-10 col-xs-8"><q-input filled v-model="edit_member.c_email"/></span><span v-else class="col-md-10 col-sm-10 col-xs-8">{{member.c_email}}</span></div>
      </div>
    </q-card-section>
    <q-card-section class="bg-yellow-1 row q-pa-none" style="border: 1px solid lightgrey;">
      <div class="q-pa-sm col-12 col-xs-12 bg-yellow-3 text-black text-h5">緊急聯絡人資料</div>
      <div :class="[ $q.screen.lt.md? 'q-pa-xs text-body1' : 'q-pa-sm text-h6', 'col-12', 'col-xs-12']">
        <div class="col-12 row"><span class="col-md-2 col-sm-2 col-xs-4">緊急聯絡人: </span><span v-if="editState" class="col-md-10 col-sm-10 col-xs-8"><q-input filled v-model="edit_member.c_emer_name"/></span><span v-else class="col-md-10 col-sm-10 col-xs-8">{{member.c_emer_name}}</span></div>
        <div class="col-12 row"><span class="col-md-2 col-sm-2 col-xs-4">關係: </span><span v-if="editState" class="col-md-10 col-sm-10 col-xs-8"><q-input filled v-model="edit_member.c_emer_rel"/></span><span v-else class="col-md-10 col-sm-10 col-xs-8">{{member.c_emer_rel}}</span></div>
        <div class="col-12 row"><span class="col-md-2 col-sm-2 col-xs-4">電話: </span><span v-if="editState" class="col-md-10 col-sm-10 col-xs-8"><q-input filled v-model="edit_member.c_emer_tel1_1" mask="########"/></span><span v-else class="col-md-10 col-sm-10 col-xs-8">{{member.c_emer_tel1_1}}</span></div>
      </div>
    </q-card-section>
    <q-card-section class="bg-green-1 row q-pa-none" style="border: 1px solid lightgrey;">
      <div class="q-pa-sm col-12 col-xs-12 bg-green-2 text-black text-h5">會籍資料</div>
      <div :class="[ $q.screen.lt.md? 'q-pa-xs text-body1' : 'q-pa-sm text-h6', 'col-12', 'col-xs-12']">
        <div class="col-12 row">
          <span class="col-md-2 col-sm-2 col-xs-4">會籍:</span>
          <span v-if="editState" class="col-md-10 col-sm-10 col-xs-8">
            <q-select
              v-model="edit_member.c_udf_1"
              :options="udf1List"
              label="選擇會藉"
            />
          </span>
          <span v-else class="col-md-10 col-sm-10 col-xs-8">{{member.c_udf_1}}(<q-icon v-if="member.b_mem_type1" color="positive" name="check"/>
            <q-icon v-else color="negative" name="cancel"/>)
          </span>
        </div>
        <div class="col-12 row">
          <span class="col-md-2 col-sm-2 col-xs-4">入會日期:</span>
          <span v-if="editState" class="col-md-10 col-sm-10 col-xs-8">
            <q-input
              filled
              v-model="edit_member.d_enter_1"
              mask="date"
              hint="YYYY/MM/DD"
              :rules="['date']"
              
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      v-model="edit_member.d_enter_1"
                      
                    >
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Close" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </span>
          <span v-else>{{qdate.formatDate(member.d_enter_1, "YYYY年MM月DD日")}}</span>
        </div>
        <div class="col-12 row">
          <span class="col-md-2 col-sm-2 col-xs-4">屆滿日期:</span><span class="col-md-10 col-sm-10 col-xs-8">{{qdate.formatDate(member.d_expired_1, "YYYY年MM月DD日") == "3000年01月01日"? "永久":qdate.formatDate(member.d_expired_1, "YYYY年MM月DD日")}}</span>
          <span class="col-md-2 col-sm-2 col-xs-4">續會日期:</span><span class="col-md-10 col-sm-10 col-xs-8">{{qdate.formatDate(member.d_renew_1, "YYYY年MM月DD日")}}</span>
          <span class="col-md-2 col-sm-2 col-xs-4">退會日期:</span><span class="col-md-10 col-sm-10 col-xs-8">{{qdate.formatDate(member.d_exit_1, "YYYY年MM月DD日")}}</span>
          <span class="col-md-2 col-sm-2 col-xs-4">青年家人:</span><span class="col-md-10 col-sm-10 col-xs-8">
            <q-icon v-if="member.b_mem_type10" color="positive" name="check"/>
            <q-icon v-else color="negative" name="cancel"/>
          </span>
        </div>
      </div>
    </q-card-section>
    <q-card-section class="bg-teal-1 row q-pa-none" style="border: 1px solid lightgrey;">      
      <div class="q-pa-sm col-12 bg-teal-2 text-black text-h5">
        關聯會員
        <q-btn
          v-if="editState"
          square
          class="col-1 col-xs-1 text-white bg-primary"
          icon="add"
          @click="
            edit_relationTable.push({ 
              c_mem_id_1: currentMemberID,
              c_mem_id_2: '',
              relation: '',
              name: '無此人',
              age: 0,
              d_birth: '',
              b_mem_type1: false,
              uuid: '',
              delete: false,
            })"
          />
        </div>
      <div :class="[ $q.screen.lt.md? 'q-pa-xs text-body1' : 'q-pa-sm text-h6', 'col-12', 'col-xs-12']">
        <div v-if="editState" class="full-width row">
          <div class="full-width row">
            <span class="col-3 q-mr-md-md q-mr-sm-sm q-mr-xs-none">編號</span>
            <span class="col-3 q-mr-md-md q-mr-sm-sm q-mr-xs-none">關係</span>
            <span class="col-3 q-mr-md-md q-mr-sm-sm q-mr-xs-none">姓名</span>
            <span class="col-1 q-mr-md-md q-mr-sm-sm q-mr-xs-none">&nbsp;</span>
            <span class="col-1 q-mr-md-md q-mr-sm-sm q-mr-xs-none">&nbsp;</span>
          </div>
          <div class="row col-12" v-for="(relation, index) in edit_relationTable" :key="index">
            <span v-if="!relation.delete" class="col-12">
              <MemberRelated :key="props.modelValue" v-model="edit_relationTable[index]" class="row fit" :MemberID="props.modelValue"/>
            </span>
          </div>
        </div>
        <div v-else>
          <div v-for="(relation, index) in relationTable" :key="index" class="col-12 col-xs-12">
            <q-btn v-if="$q.screen.lt.sm" outline class="q-mr-sm" icon="person_search" @click="changeMember(relation.c_mem_id_1 == props.modelValue? relation.c_mem_id_2: relation.c_mem_id_1)"/>
            <q-btn v-else outline class="q-mr-md" icon="person_search" @click="changeMember(relation.c_mem_id_1 == props.modelValue? relation.c_mem_id_2: relation.c_mem_id_1)" label="檢視會員"/>
            <span v-if="relation.b_mem_type1 && !relation.delete">[{{relation.c_mem_id_1 == props.modelValue? relation.c_mem_id_2: relation.c_mem_id_1}}] {{relation.name}} ({{relation.age}}) - {{relation.relation}}</span>
          </div>
        </div>
      </div>
    </q-card-section>
    <q-card-section class="bg-grey-1 row text-caption justify-end q-pa-none" style="border: 1px solid lightgrey;">
      <div class="col-shrink q-ma-md">更新日期: {{qdate.formatDate(member.d_update, "YYYY年MM月DD日")}}</div>
      <div class="col-shrink q-ma-md">更新職員: {{member.c_update_user}}</div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useStore } from "vuex";
import LoadingDialog from "components/LoadingDialog.vue"
import { date as qdate, is, useQuasar, uid} from "quasar";
import { DELETE_MEMBER_BY_ID, UPDATE_RELATED_YOUTH_MEMBER_STATUS, QUIT_MEMBER_BY_ID, UPDATE_MEMBER_BY_ID, UPDATE_YOUTH_MEMBER_STATUS, INSERT_RELATION, UPDATE_RELATION, DELETE_RELATION, RENEW_MEMBER_FROM_ID_WITH_PAYMENT } from "/src/graphQueries/Member/mutation.js"
import { GET_RELATED_MEMBER_FROM_ID, LATEST_RECEIPT_NO, GET_MEM_DETAIL_AND_RELATION_BY_PK, GET_RELATION_BY_PK,  } from "/src/graphQueries/Member/query.js"
import ageUtil from "src/lib/calculateAge.js"
import { useQuery, useSubscription, useMutation } from "@vue/apollo-composable"
import MemberRelated from "components/Member/MemberRelated.vue"
import MemberSelection from "components/Member/MemberSelection.vue"
import PrintReceipt from "components/Account/PrintReceipt.vue"

// props
const props = defineProps({
  modelValue: String, 
})
// emits
const emit = defineEmits(["update:modelValue"])

const $store = useStore()
const $q = useQuasar()
const awaitServerResponse = ref(0)
const confirmDeleteModal = ref(false)
const quitDialog = ref(false)
const renewDialog = ref(false)
const renewObject = ref({})
const printReceiptModal = ref(false)
const printReceiptMember = ref("")
const queryNameFromID = ref("")
const editState = ref(false)
const edit_relationTable = ref([])
const edit_member = ref({})
const updateQueue = ref([])
const searchMemberID = ref("")
const udf1List = [
  {
    label: "青年義工(<25歲)",
    value: "青年義工會員",
  },
  {
    label: "青年家人義工(>25歲)",
    value: "青年家人義工",
  },
  {
    label: "社區義工",
    value: "社區義工",
  },
]

// query
const { result: ReceiptData } = useSubscription(LATEST_RECEIPT_NO);
const { result: GetMemDetailAndRelationByPK, refetch } = useQuery(GET_MEM_DETAIL_AND_RELATION_BY_PK, 
  () => ({
    c_mem_id: props.modelValue
  }))
const { mutate: QuitMember, onDone: QuitMember_Completed, onError: QuitMember_Error } = useMutation(QUIT_MEMBER_BY_ID, { errorPolicy: 'all' })
const { mutate: UpdateMember, onDone: UpdateMember_Completed, onError: UpdateMember_Error } = useMutation(UPDATE_MEMBER_BY_ID)
const { mutate: UpdateYouthMemberStatus, onDone: UpdateYouthMemberStatus_Completed, onError: UpdateYouthMemberStatus_Error } = useMutation(UPDATE_YOUTH_MEMBER_STATUS)
const { onResult: GetRelationByPK_Completed, variables: updateYouthMemberStatusByMemberID, loading: updatingYouthMemberStatus } = useQuery(GET_RELATION_BY_PK, 
  {
    c_mem_id: ""
  }, {
    fetchPolicy: 'network-only'
  })
const { mutate: RemoveMember, onDone: RemoveMember_Completed, onError: RemoveMember_Error } = useMutation(DELETE_MEMBER_BY_ID)
const { mutate: RenewMember, onDone: RenewMember_Completed, onError: RenewMember_Error } = useMutation(RENEW_MEMBER_FROM_ID_WITH_PAYMENT)

// watcher
watch(updateQueue.value, (newQueue, oldQueue)  => { 
  if (newQueue.length > 0) {
    updateYouthMemberStatusByMemberID.value = { c_mem_id: newQueue[0] }
  } 
})

// computed
const waitingAsync = computed(() => awaitServerResponse.value > 0)
const latestReceiptNO = computed(() => {
  if (ReceiptData.value) {
    let token = ReceiptData.value.tbl_account[0].c_receipt_no.split("-")
    let receiptNo = parseInt(token[1])
    receiptNo = (receiptNo + 1).toString()
    while (receiptNo.length < 4) receiptNo = "0" + receiptNo
    return token[0] + "-" + receiptNo
  } else return null
})
const username = computed(() => $store.getters["userModule/getUsername"])
const isSystemAdmin = computed(() => $store.getters["userModule/getSystemAdmin"])
const isCenterIC = computed(() => $store.getters["userModule/getCenterIC"])
const member = computed(() => GetMemDetailAndRelationByPK.value?.Member_by_pk??{})
const currentMemberID = computed(() => props.modelValue? props.modelValue.trim(): "")
//const NameFromID = computed(() => GetNameFromID.value? GetNameFromID.value.Member[0].c_name? GetNameFromID.value.Member[0].c_name : GetNameFromID.value.Member[0].c_name_other : "無此人")    
//const MemType1FromID = computed(() => GetNameFromID.value? GetNameFromID.value.Member[0].c_mem_type1 : "")   

const relationTable = computed(() => {
  let result = []
  if (GetMemDetailAndRelationByPK.value) {
    for (const rel of [...GetMemDetailAndRelationByPK.value.Member_by_pk.MemberRelation1, ...GetMemDetailAndRelationByPK.value.Member_by_pk.MemberRelation2]) {
      if (Object.keys(rel).length > 0) {
        if (rel.c_mem_id_1 == currentMemberID.value && rel.RelationMember2) { // c_mem_id_2 is the related member
          result.push({
            c_mem_id_1: rel.c_mem_id_1,
            c_mem_id_2: rel.c_mem_id_2,
            relation: rel.relation,
            name: rel.RelationMember2? rel.RelationMember2.c_name? rel.RelationMember2.c_name : rel.RelationMember2.c_name_other: "",
            age: rel.RelationMember2? ageUtil.calculateAge(rel.RelationMember2.d_birth): 0,
            d_birth: rel.RelationMember2? rel.RelationMember2.d_birth: "",
            b_mem_type1: rel.RelationMember2? rel.RelationMember2.b_mem_type1: false,
            uuid: rel.uuid,
            delete: false,
          })
        } else if (rel.c_mem_id_2 == currentMemberID.value && rel.RelationMember1) { //c_mem_id_1 is the related member
          result.push({
            c_mem_id_1: rel.c_mem_id_1,
            c_mem_id_2: rel.c_mem_id_2,
            relation: rel.relation,
            name: rel.RelationMember1? rel.RelationMember1.c_name? rel.RelationMember1.c_name : rel.RelationMember1.c_name_other: "",
            age: rel.RelationMember1? ageUtil.calculateAge(rel.RelationMember1.d_birth): 0,
            d_birth: rel.RelationMember1? rel.RelationMember1.d_birth: "",
            b_mem_type1: rel.RelationMember1? rel.RelationMember1.b_mem_type1: false,
            uuid: rel.uuid,
            delete: false,
          })
        }
      }
    }
    return result
  } else {
    return []
  }
})

// functions
function changeMember(mem_id) {
  emit('update:modelValue', mem_id)
}
function getNameFromMemberID(value, index) {
  queryNameFromID.value = value
} 

function startEdit() {
  edit_member.value = JSON.parse(JSON.stringify(member.value))
  edit_relationTable.value = JSON.parse(JSON.stringify(relationTable.value))
  editState.value = true
}

function resetEdit() {
  edit_member.value = JSON.parse(JSON.stringify(member.value))
  edit_relationTable.value = JSON.parse(JSON.stringify(relationTable.value))
}

function cancelEdit() {
  edit_member.value = JSON.parse(JSON.stringify(member.value))
  edit_relationTable.value = JSON.parse(JSON.stringify(relationTable.value))
  editState.value = false
}

async function quitMember() {
  awaitServerResponse.value++
  const logObject = ref({
    "username": username.value,
    "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    "module": "會員系統",
    "action": props.modelValue + " 退會。"
  })
  const quitDate = qdate.formatDate(new Date(), "YYYY-MM-DDTHH:mm:ss")
  
  QuitMember({
    c_mem_id: props.modelValue,
    exitDate: quitDate,
    logObject: logObject.value
  })
}

function saveRecord() {
  const updateObject = ref({
    d_update: new Date(),
    c_update_user: username.value,
    c_udf_1: is.object(edit_member.value.c_udf_1)? edit_member.value.c_udf_1.value : edit_member.value.c_udf_1,
    c_name: edit_member.value.c_name,
    c_name_other: edit_member.value.c_name_other,
    c_sex: edit_member.value.c_sex,
    c_tel: edit_member.value.c_tel,
    c_mobile: edit_member.value.c_mobile,
    d_birth: edit_member.value.d_birth,
    b_mem_type1: edit_member.value.b_mem_type1,
    b_mem_type10: edit_member.value.b_mem_type10,
    d_enter_1: edit_member.value.d_enter_1,
    d_expired_1: edit_member.value.d_expired_1,
    m_addscom: edit_member.value.m_addscom,
    c_email: edit_member.value.c_email,
    c_emer_name: edit_member.value.c_emer_name,
    c_emer_rel: edit_member.value.c_emer_rel,
    c_emer_tel1_1: edit_member.value.c_emer_tel1_1
  })      
  
  let deleteRelation = []
  let changeRelation = []
  let newRelation = []
  
  if (edit_relationTable.value.length > 0) {
    for (const key in edit_relationTable.value) {
      if (edit_relationTable.value[key].uuid) { // existing record
        if (edit_relationTable.value[key].delete || edit_relationTable.value[key].name == "無此人") { // delete it
          deleteRelation.push(edit_relationTable.value[key].uuid)
          // console.log(this.edit_relationTable[key].uuid + " deleted")
        } else { // modify it
          let i = relationTable.value.findIndex((element) => element.uuid == edit_relationTable.value[key].uuid)
          if (!is.deepEqual(relationTable.value[i], edit_relationTable.value[key])) { // change detected
            changeRelation.push({
              uuid: edit_relationTable.value[key].uuid,
              c_mem_id_1: edit_relationTable.value[key].c_mem_id_1,
              c_mem_id_2: edit_relationTable.value[key].c_mem_id_2,
              relation: edit_relationTable.value[key].relation,
            })
          }
        }
      } else {  // add new record
        if (!edit_relationTable.value[key].delete && edit_relationTable.value[key].name != "無此人") { // new record but deleted or invalid member number, no action
          if (edit_relationTable.value[key].relation) {
            newRelation.push({
              uuid: uid(),
              c_mem_id_1: edit_relationTable.value[key].c_mem_id_1,
              c_mem_id_2: edit_relationTable.value[key].c_mem_id_2,
              relation: edit_relationTable.value[key].relation,
            })
          } else {
            $q.notify({ message: "請填上關聯關係！", icon: "error", textColor: "white", color: "negative"})
            return
          }
        }
      }
    }
  }
  
  const logObject = ref({
    "username": username.value,
    "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    "module": "會員系統",
    "action": props.modelValue + " 資料更新-" + "舊資料:" + JSON.stringify(member.value) + " 新資料:" + JSON.stringify(updateObject.value) + " 舊關係:" + JSON.stringify(relationTable.value) + " 新關係:" + JSON.stringify(newRelation) + " 更改關係:" + JSON.stringify(changeRelation) + " 刪除關係:" + JSON.stringify(deleteRelation),
  })
  /*
  console.log("update:" + JSON.stringify(updateObject.value))
  console.log("log:" + JSON.stringify(logObject.value))
  console.log("delete:" + JSON.stringify(deleteRelation))
  console.log("change:" + JSON.stringify(changeRelation))
  console.log("new:" + JSON.stringify(newRelation))
  console.log("upsert: " + JSON.stringify([...newRelation, ...changeRelation]))
  */

  
  awaitServerResponse.value++

  // determine if there's relation to delete and upsert
  let parameters = {
    c_mem_id: currentMemberID.value,
    object: updateObject.value,
    logObject: logObject.value,
  }
  if (deleteRelation.length > 0) parameters.deleteObjects = deleteRelation
  if ([...newRelation, ...changeRelation].length > 0) parameters.upsertObjects = [...newRelation, ...changeRelation]
  
  UpdateMember(parameters) 
}

function logErrorMessage(error) {
  $q.notify({
    message: error,
  })
}

function renewMemberModal(member, duration) {
  let renewFee = 0
  let new_memberType = ""
  let expiryDate = ""
  switch (member.c_udf_1) {
    case "個人會員":
      if (duration == 1) {
        renewFee = 35
        new_memberType = member.c_udf_1
        expiryDate = qdate.addToDate(member.d_expired_1, { years: 1, hours: 8 })
      } else {
        renewFee = 100
        new_memberType = "永久會員"
        expiryDate = qdate.formatDate(new Date("3000/01/01"), "YYYY-MM-DDTHH:mm:ss")
      }
      break;
    case "永久會員":
      $q.notify({messages: "己經是永久會員"})
      return
    case "社區義工":
      if (duration == 1) {
        renewFee = 35
        new_memberType = "個人會員"
        expiryDate = qdate.addToDate(Date.now(), { years: 1, hours: 8 })
      } else {
        renewFee = 135
        new_memberType = "永久會員"
        expiryDate = qdate.formatDate(new Date("3000/01/01"), "YYYY-MM-DDTHH:mm:ss")
      }
      break;
    case "青年義工會員":
      if (duration == 1) {
        renewFee = 35
        new_memberType = "個人會員"
        expiryDate = qdate.addToDate(Date.now(), { years: 1, hours: 8 })
      } else {
        renewFee = 135
        new_memberType = "永久會員"
        expiryDate = qdate.formatDate(new Date("3000/01/01"), "YYYY-MM-DDTHH:mm:ss")
      }
      break;
    case "青年家人義工":
      if (duration == 1) {
        renewFee = 35
        new_memberType = "個人會員"
        expiryDate = qdate.addToDate(Date.now(), { years: 1, hours: 8 })
      } else {
        renewFee = 135
        new_memberType = "永久會員"
        expiryDate = qdate.formatDate(new Date("3000/01/01"), "YYYY-MM-DDTHH:mm:ss")
      }
      break;
  }

  renewObject.value = {
    c_mem_id: member.c_mem_id,
    duration: duration,
    c_name: member.c_name,
    d_birth: member.d_birth,
    old_c_udf_1: member.c_udf_1,
    c_udf_1: new_memberType,
    d_expired_1: member.d_expired_1,
    new_expired_1: expiryDate,
    renewFee: renewFee
  }
  renewDialog.value = true;
}

function confirmUserRemove() {
  // start loading screen
  awaitServerResponse.value++;
  // console.log("start removing user:" + props.modelValue)
  
  const logObject = ref({
    "username": username.value,
    "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    "module": "會員系統",
    "action": props.modelValue + " 被刪除。"
  })

  RemoveMember({
    c_mem_id: props.modelValue,
    logObject: logObject.value
  })
}

function renewMember(renewObject) {
  const remark = renewObject.duration == 1? "繳 付：至" + qdate.formatDate(renewObject.new_expired_1, "YYYY年MM月") + "之會費\r\n屆滿日期:" + qdate.formatDate(renewObject.new_expired_1, "DD/MM/YYYY") : "繳 付：永久會員會費"
  const renewDuration = renewObject.duration == 1? "(1年) " : "(永久) "
  const logObject = ref({
    "username": username.value,
    "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    "module": "會員系統",
    "action": "會員續會" + renewDuration + renewObject.c_mem_id + " 會藉: " + renewObject.c_udf_1 + " 新屆滿日期: " + qdate.formatDate(renewObject.new_expired_1, "YYYY年MM月DD日") + " 費用: " + renewObject.renewFee,
  })

  const accountObject = ref({
    c_receipt_no: latestReceiptNO.value,
    d_create: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    i_receipt_type: 1, //type 1 = membership fee
    c_desc: renewObject.duration == 1? "會員續會費" : "永久會員(會員升級)續會費",
    c_type: "續會員費",
    u_discount: 0,
    u_price_after_discount: renewObject.renewFee,
    c_cash_type: "Cash",
    c_cheque_no: "",
    m_remark: remark,
    c_mem_id: renewObject.c_mem_id,
    c_user_id: username.value,
    c_name: renewObject.c_name,
    b_cssa: false,
    b_refund: false,
    b_OtherIncome: false,
    b_clear: false,
    d_clear: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    i_prints: 0,
  })

  const memberObject = ref({
    c_udf_1: renewObject.duration == 1? renewObject.c_udf_1 : "永久會員",
    d_expired_1: renewObject.new_expired_1,
    c_update_user: username.value,
    d_update: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    d_write: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
  })

  awaitServerResponse.value++
  RenewMember({
    c_mem_id: renewObject.c_mem_id,
    logObject: logObject.value,
    memberObject: memberObject.value,
    accountObject: accountObject.value,
  })
}

// callback functions
RenewMember_Completed((result) => {
  awaitServerResponse.value--
  if (result.data.insert_tbl_account_one) {
    $q.notify({ 
      progress: true,
      message: "會員: " + result.data.update_Member_by_pk.c_mem_id + "續會成功. 續會日期：" + qdate.formatDate(Date.now(), "YYYY年MM月DD日"),
      actions: [
        { label: '列印收據', color: 'yellow', handler: () => { printReceiptMember.value = result.data.update_Member_by_pk.c_mem_id; printReceiptModal.value = true } },
        { label: '關閉', color: 'white', handler: () => {  } }
      ]
    }, 5000);
  } else {
    $q.notify({ message: "會員: " + result.data.update_Member_by_pk.c_mem_id + "續會成功. 續會日期：" + qdate.formatDate(Date.now(), "YYYY年MM月DD日")});
  }
})

RemoveMember_Completed((result) => {
  awaitServerResponse.value--;
  const deleteMember = result.data.delete_Member_by_pk;
  const deleteRelateMember = result.data.delete_Relation;
        
  // console.log("deleteMember: " + JSON.stringify(deleteMember))
  // console.log("deleteRelateMember: " + JSON.stringify(deleteRelateMember))
        
  if (deleteRelateMember.returning.length > 0) {
    $q.notify({ message: "刪除會員編號: " + deleteMember.c_mem_id + " 成功，" + deleteRelateMember.returning.length + "個關聯關係已刪除。"});
    let deletedData = deleteRelateMember.returning
    // console.log("deletedData:" + JSON.stringify(deletedData))
    deletedData.forEach((mem) => {
      if (mem.c_mem_id_1 == deleteMember.c_mem_id) {
        updateQueue.value.push(mem.c_mem_id_2)
      } else updateQueue.value.push(mem.c_mem_id_1)
    })
  } else {
    $q.notify({ message: "刪除會員編號: " + deleteMember.c_mem_id + " 成功."});
  }
})

// after getting relation from mem_id, calculate whether this is a youth relative
// and determine this membership expiry date if it is a youth relative member
GetRelationByPK_Completed((result) => {
  // console.log("result returned: " + JSON.stringify(result))
  if (result.data.Member_by_pk) {
    // only consider "青年家人義工"
    // default is not Youth relative, and membership expire today
    let youthMembership = result.data.Member_by_pk.c_udf_1 == '青年家人義工'
    // console.log("youthMembership:" + youthMembership)
    let isYouth = false
    let currentExpiryDate = Date.now()
  
    // loop through all related members
    let rel = [...result.data.Member_by_pk.MemberRelation1, ...result.data.Member_by_pk.MemberRelation2]
    if (rel.length > 0) {
      // console.log("rel:" + JSON.stringify(rel))
      rel.forEach((rm) => {
        if (rm.c_mem_id_1 == result.data.Member_by_pk.c_mem_id) { // relation member 1 = this member
          // check relation member 2 youth status
          // criterion: b_mem_type1 valid && d_exit_1 invalid && relatedMember membership is not yet expired && relatedMember age is 15-24
          isYouth = rm.RelationMember2.b_mem_type1 && !rm.RelationMember2.d_exit_1 && qdate.getDateDiff(Date.now(), rm.RelationMember2.d_expired_1) < 0 && ageUtil.calculateAge(rm.RelationMember2.d_birth) >= 15 && ageUtil.calculateAge(rm.RelationMember2.d_birth) <= 24
          
          // if target is youth && this member is a youth membership, determine expiry date
          if (isYouth && youthMembership) {
            // determine this member expiry base on relatedMember membership and age
            // console.log("membership:" + rm.RelationMember2.c_udf_1)
            switch (rm.RelationMember2.c_udf_1) {
              case "個人會員":
                if (currentExpiryDate < rm.RelationMember2.d_expired_1) currentExpiryDate = rm.RelationMember2.d_expired_1
                break
              case "永久會員":
              case "青年義工會員":
                if (currentExpiryDate < qdate.addToDate(rm.RelationMember2.d_birth, {years: 25})) currentExpiryDate = qdate.addToDate(rm.RelationMember2.d_birth, {years: 25})
                break
            }
          }
          //console.log("Member2:" + rm.RelationMember2.c_mem_id + " b_mem_type1:" + rm.RelationMember2.b_mem_type1 + " d_exit_1: " + rm.RelationMember2.d_exit_1 + " d_expired_1: " + rm.RelationMember2.d_expired_1 + " age: " + ageUtil.calculateAge(rm.RelationMember2.d_birth) + " isYouth:" + isYouth)
        }
        if (rm.c_mem_id_2 == result.data.Member_by_pk.c_mem_id) { // relation member 2 = this member
          // check relation member 2 youth status
          // criterion: b_mem_type1 valid && d_exit_1 invalid && relatedMember membership is not yet expired && relatedMember age is 15-24
          isYouth = rm.RelationMember1.b_mem_type1 && !rm.RelationMember1.d_exit_1 && qdate.getDateDiff(Date.now(), rm.RelationMember1.d_expired_1) < 0 && ageUtil.calculateAge(rm.RelationMember1.d_birth) >= 15 && ageUtil.calculateAge(rm.RelationMember1.d_birth) <= 24
          
          // if target is youth && this member is a youth membership, determine expiry date
          if (isYouth && youthMembership) {
            // determine this member expiry base on relatedMember membership and age
            // console.log("membership:" + rm.RelationMember2.c_udf_1)
            switch (rm.RelationMember1.c_udf_1) {
              case "個人會員":
                if (currentExpiryDate < rm.RelationMember1.d_expired_1) currentExpiryDate = rm.RelationMember1.d_expired_1
                break
              case "永久會員":
              case "青年義工會員":
                if (currentExpiryDate < qdate.addToDate(rm.RelationMember1.d_birth, {years: 25})) currentExpiryDate = qdate.addToDate(rm.RelationMember1.d_birth, {years: 25})
                break
            }
          }
          //console.log("Member1:" + rm.RelationMember1.c_mem_id + " b_mem_type1:" + rm.RelationMember1.b_mem_type1 + " d_exit_1: " + rm.RelationMember1.d_exit_1 + " d_expired_1: " + rm.RelationMember1.d_expired_1 + " age: " + ageUtil.calculateAge(rm.RelationMember1.d_birth) + " isYouth:" + isYouth)
        }
      })
    }
    
    const logObject = ref({
      "username": username.value,
      "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      "module": "會員系統",
      "action": "系統自動更新:" + result.data.Member_by_pk.c_mem_id + " 青年家人狀態-" + isYouth + " 會藉屆滿日期-" + qdate.formatDate(currentExpiryDate, "YYYY-MM-DD"),
    })
    // console.log("setting " + result.data.Member_by_pk.c_mem_id + " b_mem_type10 to " + isYouth + " expiryDate: " + currentExpiryDate)
    
    if (youthMembership) {
      UpdateYouthMemberStatus({
        c_mem_id: result.data.Member_by_pk.c_mem_id,
        b_mem_type10: isYouth,
        d_expired_1: qdate.formatDate(currentExpiryDate, "YYYY/MM/DD"),
        logObject: logObject.value
      })
    } else {
      UpdateYouthMemberStatus({
        c_mem_id: result.data.Member_by_pk.c_mem_id,
        b_mem_type10: isYouth,
        d_expired_1: result.data.Member_by_pk.d_expired_1,
        logObject: logObject.value
      })
    }
  }
  updateQueue.value.splice(0, 1)
})

QuitMember_Error((error) => {
  logErrorMessage(error)
})

QuitMember_Completed((result) => {
  refetch()
  awaitServerResponse.value--
  let validityResult = result.data.update_Member_by_pk.b_mem_type1 ? "有效" : "無效"
  $q.notify({ message: "會員: " + result.data.update_Member_by_pk.c_mem_id + "退會. 會籍狀態：" + validityResult + " 退會日期：" + qdate.formatDate(result.data.update_Member_by_pk.d_exit_1, "YYYY年MM月DD日")});
  if (relationTable.value.length > 0) {
    relationTable.value.forEach((rel) => {
      if (result.data.update_Member_by_pk.c_mem_id == rel.c_mem_id_1) updateQueue.value.push(rel.c_mem_id_2)
      else updateQueue.value.push(rel.c_mem_id_1)
    })
  }
})

UpdateMember_Completed((result) => {
  // console.log("updatemember_completed: " + JSON.stringify(result.data))
  
  let newRelation = result.data.insert_Relation
  if (newRelation.returning.length > 0) {
    newRelation.returning.forEach((rel) => {
      if (rel.uuid != "00000000-0000-0000-0000-000000000000") { // not the dummy record
        // console.log("modified rel, update youth on " + rel.c_mem_id_1 + " and " + rel.c_mem_id_2)
        if (result.data.update_Member_by_pk.c_mem_id == rel.c_mem_id_1) updateQueue.value.push(rel.c_mem_id_2)
        else updateQueue.value.push(rel.c_mem_id_1)
      }
    })
  }

  let delRelation = result.data.delete_Relation
  if (delRelation.returning.length > 0) {
    delRelation.returning.forEach((rel) => {
      if (rel.uuid != "00000000-0000-0000-0000-000000000000") { // not the dummy record
        // console.log("deleted rel, update youth on " + rel.c_mem_id_1 + " and " + rel.c_mem_id_2)
        if (result.data.update_Member_by_pk.c_mem_id == rel.c_mem_id_1) updateQueue.value.push(rel.c_mem_id_2)
        else updateQueue.value.push(rel.c_mem_id_1)
      }
    })
  }
  refetch()
  if (result.data.update_Member_by_pk.c_mem_id) {
    updateQueue.value.push(result.data.update_Member_by_pk.c_mem_id)
    $q.notify({ message: "編號: " + result.data.update_Member_by_pk.c_mem_id + "更新資料成功." });
  }
  editState.value = false
  awaitServerResponse.value--
})
</script>