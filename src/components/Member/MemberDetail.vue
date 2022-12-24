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
        <div>會藉: {{renewObject.c_udf_1}}</div>
        <div>現時屆滿日期: {{qdate.formatDate(renewObject.d_expired_1, "YYYY年MM月DD日")}}</div>
      </q-card-section>
      <q-card-section class="bg-yellow-1 text-h6">
        <div>新屆滿日期: {{qdate.formatDate(renewObject.new_expired_1, "YYYY年MM月DD日")}}</div>
        <div>費用: {{renewObject.renewFee}}</div>
      </q-card-section>
      <q-card-actions class="row justify-end">
        <q-btn icon="cancel" class="bg-negative text-white" label="取消" v-close-popup/>
        <q-btn icon="check" class="bg-secondary text-white" label="確定" v-close-popup="-1" @click="renewMember(renewObject)"/>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- loading dialog -->
  <q-dialog v-model="waitingAsync" position="bottom">
    <LoadingDialog message="處理中"/>
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
      <div class="row">
        <div class="col-*">
          <span v-if="member.c_mem_id != null">{{ member.c_mem_id }} - </span>
          <span v-if="member.c_name != null">{{member.c_name}}</span>
          <span v-if="member.c_name_other">({{member.c_name_other}})</span>
          <span v-if="member.c_sex != null">[{{member.c_sex}}]</span>
        </div>
        <q-btn v-if="!editState" class="text-white q-mr-none" rounded flat icon="edit" @click="startEdit">
          <q-tooltip class="text-white">修改</q-tooltip>  
        </q-btn>
        <q-space/>
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
        <div class="col-12 col-xs-12 row"><span class="col-5 col-xs-5">中文姓名:</span><span v-if="editState" class="col-7 col-xs-7"><q-input filled v-model="edit_member.c_name"/></span><span v-else class="col-7 col-xs-7">{{member.c_name}}</span></div>
        <div class="col-12 col-xs-12 row"><span class="col-5 col-xs-5">英文姓名:</span><span v-if="editState" class="col-7 col-xs-7"><q-input filled v-model="edit_member.c_name_other"/></span><span v-else class="col-7 col-xs-7">{{member.c_name_other}}</span></div>
        <div class="col-12 col-xs-12 row"><span class="col-5 col-xs-5">性別:</span>
          <span v-if="editState" class="col-7 col-xs-7">
            <q-btn-toggle
              v-model="edit_member.c_sex"
              toggle-color="primary"
              :options="[
                { label: '男', value: '男' },
                { label: '女', value: '女' },
              ]"
            />
          </span><span v-else>{{member.c_sex}}</span></div>
        <div class="col-12 row"><span class="col-5 col-xs-5">出生日期: </span>
          <span v-if="editState" class="col-7 col-xs-7">
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
          <span v-else class="col-7 col-xs-7">{{qdate.formatDate(member.d_birth, "YYYY年MM月DD日")}}</span></div>
        <div class="col-12 row"><span class="col-5 col-xs-5">年齡: </span><span v-if="editState" class="col-7 col-xs-7">{{ageUtil.calculateAge(edit_member.d_birth)}}</span><span v-else class="col-7 col-xs-7">{{ageUtil.calculateAge(member.d_birth)}}</span></div>
        <div class="col-12 row"><span class="col-5 col-xs-5">手提電話: </span><span v-if="editState" class="col-7 col-xs-7"><q-input filled v-model="edit_member.c_mobile" mask="########"/></span><span v-else class="col-7 col-xs-7">{{member.c_mobile}}</span></div>
        <div class="col-12 row"><span class="col-5 col-xs-5">家居電話: </span><span v-if="editState" class="col-7 col-xs-7"><q-input filled v-model="edit_member.c_tel" mask="########"/></span><span v-else class="col-7 col-xs-7">{{member.c_tel}}</span></div>
        <div class="col-12 row"><span class="col-5 col-xs-5">地址:</span><span v-if="editState" class="col-7 col-xs-7"><q-input filled v-model="edit_member.m_addscom"/></span><span v-else class="col-7 col-xs-7">{{member.m_addscom}}</span></div>
        <div class="col-12 row"><span class="col-5 col-xs-5">電郵:</span><span v-if="editState" class="col-7 col-xs-7"><q-input filled v-model="edit_member.c_email"/></span><span v-else class="col-7 col-xs-7">{{member.c_email}}</span></div>
      </div>
    </q-card-section>
    <q-card-section class="bg-yellow-1 row q-pa-none" style="border: 1px solid lightgrey;">
      <div class="q-pa-sm col-12 col-xs-12 bg-yellow-3 text-black text-h5">緊急聯絡人資料</div>
      <div :class="[ $q.screen.lt.md? 'q-pa-xs text-body1' : 'q-pa-sm text-h6', 'col-12', 'col-xs-12']">
        <div class="col-12 row"><span class="col-5 col-xs-5">緊急聯絡人: </span><span v-if="editState" class="col-7 col-xs-7"><q-input filled v-model="edit_member.c_emer_name"/></span><span v-else class="col-7 col-xs-7">{{member.c_emer_name}}</span></div>
        <div class="col-12 row"><span class="col-5 col-xs-5">關係: </span><span v-if="editState" class="col-7 col-xs-7"><q-input filled v-model="edit_member.c_emer_rel"/></span><span v-else class="col-7 col-xs-7">{{member.c_emer_rel}}</span></div>
        <div class="col-12 row"><span class="col-5 col-xs-5">電話: </span><span v-if="editState" class="col-7 col-xs-7"><q-input filled v-model="edit_member.c_emer_tel1_1" mask="########"/></span><span v-else class="col-7 col-xs-7">{{member.c_emer_tel1_1}}</span></div>
      </div>
    </q-card-section>
    <q-card-section class="bg-green-1 row q-pa-none" style="border: 1px solid lightgrey;">
      <div class="q-pa-sm col-12 col-xs-12 bg-green-2 text-black text-h5">會籍資料</div>
      <div :class="[ $q.screen.lt.md? 'q-pa-xs text-body1' : 'q-pa-sm text-h6', 'col-12', 'col-xs-12']">
        <div class="col-12 col-xs-12">會籍: {{member.c_udf_1}}
          (<q-icon v-if="member.b_mem_type1" color="positive" name="check"/>
          <q-icon v-else color="negative" name="cancel"/>)
        </div>
        <div class="col-12 col-xs-12">入會日期: {{qdate.formatDate(member.d_enter_1, "YYYY年MM月DD日")}}</div>
        <div class="col-12 col-xs-12">屆滿日期: {{qdate.formatDate(member.d_expired_1, "YYYY年MM月DD日") == "3000年01月01日"? "永久":qdate.formatDate(member.d_expired_1, "YYYY年MM月DD日")}}</div>
        <div class="col-12 col-xs-12">續會日期: {{qdate.formatDate(member.d_renew_1, "YYYY年MM月DD日")}}</div>
        <div class="col-12 col-xs-12">退會日期: {{qdate.formatDate(member.d_exit_1, "YYYY年MM月DD日")}}</div>
        <div class="col-1 col-xs-12">青年家人: 
          <q-icon v-if="member.b_mem_type10" color="positive" name="check"/>
          <q-icon v-else color="negative" name="cancel"/>
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
              name: '沒有此會員',
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
              <MemberRelated :key="props.modelValue" v-model="edit_relationTable[index]" class="row fit" :MemberID="props.modelValue"  @update-member="(value) => updateRelationTable(index, value)"/>
            </span>
          </div>
        </div>
        <div v-else>
          <div v-for="(relation, index) in relationTable" :key="index" class="col-12 col-xs-12">
            <div v-if="relation.b_mem_type1 && !relation.delete">[{{relation.c_mem_id_1 == props.modelValue? relation.c_mem_id_2: relation.c_mem_id_1}}] {{relation.name}} ({{relation.age}}) - {{relation.relation}}</div>
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
import { computed, ref } from "vue";
import { useStore } from "vuex";
import LoadingDialog from "components/LoadingDialog.vue"
import { date as qdate, is, useQuasar, uid} from "quasar";
import { DELETE_MEMBER_BY_ID, UPDATE_RELATED_YOUTH_MEMBER_STATUS, QUIT_MEMBER_BY_ID, UPDATE_MEMBER_BY_ID, INSERT_RELATION, UPDATE_RELATION, DELETE_RELATION, RENEW_MEMBER_FROM_ID_WITH_PAYMENT } from "/src/graphQueries/Member/mutation.js"
import { GET_RELATED_MEMBER_FROM_ID, LATEST_RECEIPT_NO, GET_MEM_DETAIL_AND_RELATION_BY_PK } from "/src/graphQueries/Member/query.js"
import ageUtil from "src/lib/calculateAge.js"
import { useQuery, useSubscription, useMutation } from "@vue/apollo-composable"
import MemberRelated from "components/Member/MemberRelated.vue"

// props
const props = defineProps({
  modelValue: String, 
})

const $store = useStore()
const $q = useQuasar()
const awaitServerResponse = ref(0)

const confirmDeleteModal = ref(false)
const quitDialog = ref(false)
const renewDialog = ref(false)
const relationOptions = ref(["父母子女", "兄弟姐妹", "其他親人"])
const renewObject = ref({})
const queryNameFromID = ref("")
const editState = ref(false)
const edit_relationTable = ref([])
const edit_member = ref({})

// query
const { result: ReceiptData } = useSubscription(LATEST_RECEIPT_NO,);
const { result: GetMemDetailAndRelationByPK, refetch } = useQuery(GET_MEM_DETAIL_AND_RELATION_BY_PK, 
  () => ({
    c_mem_id: props.modelValue
  }))
const { mutate: QuitMember, onDone: QuitMember_Completed, onError: QuitMember_Error } = useMutation(QUIT_MEMBER_BY_ID)
const { mutate: UpdateMember, onDone: UpdateMember_Completed, onError: UpdateMember_Error } = useMutation(UPDATE_MEMBER_BY_ID)

// computed
const waitingAsync = computed((() => awaitServerResponse.value > 0 ))
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
//const NameFromID = computed(() => GetNameFromID.value? GetNameFromID.value.Member[0].c_name? GetNameFromID.value.Member[0].c_name : GetNameFromID.value.Member[0].c_name_other : "沒有此會員")    
//const MemType1FromID = computed(() => GetNameFromID.value? GetNameFromID.value.Member[0].c_mem_type1 : "")   

const relationTable = computed(() => {
  let result = []
  if (GetMemDetailAndRelationByPK.value) {
    for (const rel of [...GetMemDetailAndRelationByPK.value.Member_by_pk.MemberRelation1, ...GetMemDetailAndRelationByPK.value.Member_by_pk.MemberRelation2]) {
      if (Object.keys(rel).length > 0) {
        if (rel.c_mem_id_1 == currentMemberID.value) { // c_mem_id_2 is the related member
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
        } else if (rel.c_mem_id_2 == currentMemberID.value) { //c_mem_id_1 is the related member
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


const relatedMember = computed(() => {
  let mem = []
  if (props.modelValue.MemberRelation1.length > 0) {
    props.modelValue.MemberRelation1.forEach((rel) => {
      if (rel.c_mem_id_1 == props.modelValue.c_mem_id) {
        mem.push(rel.c_mem_id_2)
      }
      if (rel.c_mem_id_2 == props.modelValue.c_mem_id) {
        mem.push(rel.c_mem_id_1)
      }
    })
  }
  if (props.modelValue.MemberRelation2.length > 0) {
    props.modelValue.MemberRelation2.forEach((rel) => {
      if (rel.c_mem_id_1 == props.modelValue.c_mem_id) {
        mem.push(rel.c_mem_id_2)
      }
      if (rel.c_mem_id_2 == props.modelValue.c_mem_id) {
        mem.push(rel.c_mem_id_1)
      }
    })
  }
  return mem
})

// functions
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

function quitMember() {
  awaitServerResponse.value++
  const logObject = ref({
    "username": username.value,
    "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    "module": "會員系統",
    "action": props.modelValue.c_mem_id + " 退會。"
  })

  QuitMember({
    c_mem_id: props.modelValue.c_mem_id,
    exitDate: qdate.formatDate(Date.now(), "YYYY-MM-DD"),
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
        if (edit_relationTable.value[key].delete || edit_relationTable.value[key].name == "沒有此會員") { // delete it
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
        if (!edit_relationTable.value[key].delete && edit_relationTable.value[key].name != "沒有此會員") { // new record but deleted or invalid member number, no action
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

  awaitServerResponse.value++;

  // determine if there's relation to delete and upsert
  let parameters = {
    c_mem_id: currentMemberID.value,
    object: updateObject.value,
    logObject: logObject.value,
  }
  if (deleteRelation.length > 0)  parameters.deleteObjects = deleteRelation
  if ([...newRelation, ...changeRelation].length > 0) parameters.upsertObjects = [...newRelation, ...changeRelation]
  
  UpdateMember(parameters)
}

function updateRelationTable(index, value) {
  console.log(index + ":" + JSON.stringify(value))
  edit_relationTable.value[index] = value
  updateType1Expire()
}

function updateType1Expire() {
  if (
    is.object(edit_member.value.c_udf_1) &&
    qdate.isValid(edit_member.value.d_enter_1)
  ) {
    switch (edit_member.value.c_udf_1.value) {
      case "個人會員":
        edit_member.value.d_expired_1 = qdate.formatDate(
            qdate.addToDate(edit_member.value.d_enter_1, { years: 1 }),
            "YYYY/MM/DD"
          );
        break;
      case "永久會員":
      case "社區義工":
        edit_member.value.d_expired_1 = "3000/01/01";
        break;
      case "青年義工會員":
        if (!edit_member.value.d_birth) {
          edit_member.value.d_expired_1 = "請輸入出生日期"
        } else {
          if (ageUtil.calculateAge(edit_member.value.d_birth) >= 25) {
            edit_member.value.d_expired_1 = "已超過25歲"
          } else {
            edit_member.value.d_expired_1 = qdate.formatDate(
              qdate.addToDate(edit_member.value.d_birth, { years: 25 }),
              "YYYY/MM/DD"
            )
          }
        }
        
        break;
      case "青年家人義工":
        if (ageUtil.calculateAge(edit.member.value.d_birth) <= 25) {
          edit_member.value.d_expired_1 = "未滿25歲"
        } else {
          // set a temp expiry date, loop all related members
          let expiryDate = 0;
          if (edit_relationTable.value.length > 0) {
            edit_relationTable.value.forEach((data) => {
              if (!edit_relationTable.value.delete && ageUtil.calculateAge(data.d_birth) <= 24 && ageUtil.calculateAge(data.d_birth) >= 15) {
                let tempExpiryDate = qdate.formatDate(qdate.addToDate(data.d_birth, { years: 25 }),"YYYY/MM/DD");
                  
                if (expiryDate == 0 || expiryDate < tempExpiryDate) {
                  expiryDate = tempExpiryDate
                }
              }
            })
          }
          edit_member.value.d_expired_1 = expiryDate == 0? "沒有關聯青年會員": expiryDate
        }
        break;
    }
  } else edit_member.value.d_expired_1 = "";
}
 
  


// callback
QuitMember_Completed((result) => {
  refetch()
  awaitServerResponse.value--
  $q.notify({ message: "會員: " + result.data.returning[0].c_mem_id + "退會. 會籍狀態：" + result.data.returning[0].b_mem_type1 ? "有效" : "無效" + " 退會日期：" + qdate.formatDate(result.returning[0].d_exit_1, "YYYY年MM月DD日")});
  if (relatedMember.value.length > 0) {
    relatedMember.value.forEach((rel) => {
      updateYouthRelatedMember(rel)
    })
  }
})
    
UpdateMember_Completed((result) => {
  refetch()
  if (result.data.update_Member_by_pk.c_mem_id) {
    $q.notify({ message: "編號: " + result.data.update_Member_by_pk.c_mem_id + "更新資料成功." });
  }
  editState.value = false;
  awaitServerResponse.value--;
  //changedMemid = edit_relationTable.value.map(a => a.c_mem_id)
  /*
  await this.updateRelation(newRelation, changeRelation, deleteRelation);
  
  for (const index in changedMemid) {
    this.debug("updating youth on " + changedMemid[index])
    await this.updateYouthRelatedMember(changedMemid[index])
  }
  // update youth status of this member too
  this.debug("updating youth on this member " + c_mem_id)
  await this.updateYouthRelatedMember(c_mem_id)

  this.relationTable = this.edit_relationTable
  */
})
   
    
  

 /*     this.edit_relationTable[index].b_mem_type1 =
        getNameFromID[0].b_mem_type1;
      this.edit_relationTable[index].age = ageUtil.calculateAge(getNameFromID[0].d_birth)
    } else {
      this.edit_relationTable[index].name = "沒有此會員";
      this.edit_relationTable[index].age = null;
    }
    });
  }
}
*/

    
    /*
    async updateRelation(newRelation, changeRelation, deleteRelation) {
      // add relation
      if (newRelation.length > 0) {
        let relatedMemberID = ""
        newRelation.forEach((data) => {
          relatedMemberID = relatedMemberID + data.c_mem_id_2 + " "
        })
        const logObject = {
          "username": this.username,
          "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
          "module": "會員系統",
          "action": "新增 " + this.member.c_mem_id + " 關聯會員-" + relatedMemberID
        }
        
        await this.$apollo.mutate({
          mutation: INSERT_RELATION,
          variables: {
            "newObjects": newRelation,
            logObject: logObject,
          },
        })
      }
      
      // change relation
      if (changeRelation.length > 0) {
        for (const index in changeRelation) {
          const logObject = {
            "username": this.username,
            "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
            "module": "會員系統",
            "action": "修改 " + this.member.c_mem_id + " 關聯會員-" + changeRelation[index].c_mem_id_2 + "(" + changeRelation[index].relation + ")"
          }
          const uuid = changeRelation[index].uuid
          const object = {
            c_mem_id_1: changeRelation[index].c_mem_id_1,
            c_mem_id_2: changeRelation[index].c_mem_id_2,
            relation: changeRelation[index].relation,
          }

          await this.$apollo.mutate({
            mutation: UPDATE_RELATION,
            variables: {
              uuid: uuid,
              changeObject: object,
              logObject: logObject,
            },
          })
        }
      }

      // delete relation
      if (deleteRelation.length > 0) {
        let removeMemberID = ""
        deleteRelation.forEach((rel) => {
          let i = this.relationTable.findIndex((element) => element.uuid == rel)
          removeMemberID = removeMemberID + this.relationTable[i].c_mem_id + " "
        })
        
        const logObject = {
          "username": this.username,
          "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
          "module": "會員系統",
          "action": "刪除 " + this.member.c_mem_id + " 的關聯會員-" + removeMemberID
        }
        await this.$apollo.mutate({
          mutation: DELETE_RELATION,
          variables: {
            deleteObjects: deleteRelation,
            logObject: logObject,
          },
        })
      }
    },
    async confirmUserRemove() {
      // start loading screen
      this.awaitServerResponse++;
      const c_mem_id = this.member.c_mem_id;
      
      this.debug("start removing user:" + c_mem_id)
      
      try {
        this.$apollo.mutate({
            mutation: DELETE_MEMBER_BY_ID,
            variables: {
              "c_mem_id": c_mem_id,
              "logObject": {
                "username": this.username,
                "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
                "module": "會員系統",
                "action": c_mem_id + " 被刪除。"
              }
            },
          }).then((data_DELETE_MEMBER_BY_ID) => {
            const deleteMember = data_DELETE_MEMBER_BY_ID.data.delete_Member_by_pk;
            const deleteRelateMember = data_DELETE_MEMBER_BY_ID.data.delete_Relation;
            // this.debug("deleteMember: " + JSON.stringify(deleteMember))
            // this.debug("deleteRelateMember: " + JSON.stringify(deleteRelateMember))
            if (deleteRelateMember.returning.length > 0) {
              this.$q.notify({ message: "刪除會員編號: " + deleteMember.c_mem_id + " 成功，" + deleteRelateMember.returning.length + "個關聯關係已刪除。"});
              let relatedMemberID = [];
              let deletedData = deleteRelateMember.returning
              this.debug("deletedData:" + JSON.stringify(deletedData))
              deletedData.forEach((mem) => {
                if (mem.c_mem_id_1 == deleteMember.c_mem_id) {
                  relatedMemberID.push(mem.c_mem_id_2)
                } else relatedMemberID.push(mem.c_mem_id_1)
              })
              this.debug("relatedMemberID:" + relatedMemberID)
              if (relatedMemberID.length > 0) {
                relatedMemberID.forEach((id) => {
                  this.updateYouthRelatedMember(id)
                })
              }
            } else {
              this.$q.notify({ message: "刪除會員編號: " + deleteMember.c_mem_id + " 成功."});
            }
            
            
            
          })
       
    
      
      
     
      } catch (e) {
        this.debug("error: " + e)
      }
      
      
    

      // clear modal data and cancel loading screen
      this.member = {}
      this.awaitServerResponse--;     
    },
    
    async renewMember(renewObject) {
      const remark = renewObject.duration == 1? "繳 付：至" + qdate.formatDate(renewObject.new_expired_1, "YYYY年MM月") + "之會費\r\n屆滿日期:" + qdate.formatDate(renewObject.new_expired_1, "DD/MM/YYYY") : "繳 付：永久會員會費"
      const renewDuration = renewObject.duration == 1? "(1年) " : "(永久) "
      const logObject = {
        "username": this.username,
        "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
        "module": "會員系統",
        "action": "會員續會" + renewDuration + renewObject.c_mem_id + " 會藉: " + renewObject.c_udf_1 + " 新屆滿日期: " + qdate.formatDate(renewObject.new_expired_1, "YYYY年MM月DD日") + " 費用: " + renewObject.renewFee,
      }
      const accountObject = {
        c_receipt_no: this.latestReceiptNO,
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
        c_user_id: this.username,
        c_name: renewObject.c_name,
        b_cssa: false,
        b_refund: false,
        b_OtherIncome: false,
        b_clear: false,
        d_clear: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
        i_prints: 0,
      }
      const memberObject = {
        c_udf_1: renewObject.duration == 1? renewObject.c_udf_1 : "永久會員",
        d_expired_1: renewObject.new_expired_1,
        c_update_user: this.username,
        d_update: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
        d_write: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      }
      this.$apollo.mutate({
        mutation: RENEW_MEMBER_FROM_ID_WITH_PAYMENT, 
        variables: {
          c_mem_id: renewObject.c_mem_id,
          logObject: logObject,
          memberObject: memberObject,
          accountObject: accountObject,
        }
      }).then((data) => {
        this.$q.notify({ message: "會員: " + data.data.update_Member_by_pk.c_mem_id + "續會成功. 續會日期：" + qdate.formatDate(Date.now(), "YYYY年MM月DD日")});
      })
    
      
    },
    renewMemberModal(member, duration) {
      this.renewDialog = true;
      // assume renew for 1 year
      const expiryDateOneYear = qdate.subtractFromDate(
          qdate.addToDate(member.d_expired_1, { years: 1 }),
          { days: 1 }
        )
        
      this.renewObject = ref({
        c_mem_id: member.c_mem_id,
        duration: duration,
        c_name: member.c_name,
        d_birth: member.d_birth,
        c_udf_1: member.c_udf_1,
        d_expired_1: member.d_expired_1,
        new_expired_1: duration == 1? expiryDateOneYear : qdate.formatDate(new Date("3000/01/01"), "YYYY-MM-DDTHH:mm:ss"),
        renewFee: duration == 1? 35 : 100
      })
    },
    async updateYouthRelatedMember(mem_id, excluded_mem_id = "") {
      // query and update mem_type_10 based on mem_id
      // 1) query mem_info and query related members
      // 2) loop through related members see if there is any youth
      // 3) update this mem_type_10 based on (2)
      
      this.awaitServerResponse++;
      let isYouthRelatedMember = false;

      // get mem_info
      // result: isYouthRelatedMember (boolean)
      this.debug("checking related of: " + mem_id + " excluding " + excluded_mem_id)
      try {
        let data_GET_RELATED_MEMBER_FROM_ID = await this.$apollo.query({
          //query: GET_MEMBER_BASIC_AND_RELATED_MEMBER_FROM_IDS,
          query: GET_RELATED_MEMBER_FROM_ID,
          variables: {
            "c_mem_id": mem_id
          },
          fetchPolicy: 'network-only'
        })
        this.debug("data_GET_RELATED_MEMBER_FROM_ID: " + JSON.stringify(data_GET_RELATED_MEMBER_FROM_ID))
        const RelationResponse = data_GET_RELATED_MEMBER_FROM_ID.data.Relation;
      
        let relation = [];
        if (RelationResponse.length > 0) {
          RelationResponse.forEach((rel) => {
            this.debug("processing rel: " + JSON.stringify(rel))
            if (rel.c_mem_id_1 == mem_id) {
              if (rel.c_mem_id_2 != excluded_mem_id) {
                this.debug("adding to relation:" + rel.c_mem_id_2)
                relation.push(rel.c_mem_id_2)
              }
            } else {
              if (rel.c_mem_id_1 != excluded_mem_id) {
                this.debug("adding to relation:" + rel.c_mem_id_1)
                relation.push(rel.c_mem_id_1)
              }
            }
          })
        }

        this.debug("found relation id:" + relation)
        if (relation.length > 0) {
          let data_GET_NAME_FROM_IDS = await this.$apollo.query({
            query: GET_NAME_FROM_IDS,
            variables: {
              c_mem_ids: relation
            },
            fetchPolicy: 'network-only'
          })
          let memberResponse = data_GET_NAME_FROM_IDS.data.Member;
          let i = memberResponse.findIndex((element) => element.b_mem_type1 && ageUtil.calculateAge(element.d_birth) >= 15 && ageUtil.calculateAge(element.d_birth) <= 24)
          i != -1 ? isYouthRelatedMember = true: isYouthRelatedMember = false;
        }
      } catch (e) {
        this.debug("error:" +e)
      }
              
      this.debug("mem_id:" + mem_id + "is Youth? "+ isYouthRelatedMember)
      
      // update status, + system log
      // console.log("this.apollo5: " + this.$apollo)
      try {
        await this.$apollo.mutate({
          mutation: UPDATE_RELATED_YOUTH_MEMBER_STATUS,
          variables: {
            "c_mem_ids": [mem_id],
            "b_mem_type10": isYouthRelatedMember,
            "logObject": {
              "username": this.username + "(自動系統管理)",
              "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
              "module": "會員系統",
              "action": "設定 " + mem_id + " 的青年家人會員狀態-" + isYouthRelatedMember
            }
          },
        })
      } catch (e) {
        this.debug("error: " + e)
      }
      
      this.awaitServerResponse--;
    },
  },
  
  }*/
</script>