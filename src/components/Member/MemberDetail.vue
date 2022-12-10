<template>
  <!-- renew modal -->
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

    <q-card>
      <q-card-section class="bg-primary text-white text-h6">
        <div class="row">
          <div class="col-*">
            <span v-if="member.c_mem_id != null">{{ member.c_mem_id }} - </span>
            <span v-if="member.c_name != null">{{member.c_name}}</span>
            <span v-if="member.c_name_other != ''">({{member.c_name_other}})</span>
            <span v-if="member.c_sex != null">[{{member.c_sex}}]</span>
          </div>
          <q-space/>
          <q-btn class="col-shrink" dense flat icon="close" v-close-popup>
            <q-tooltip class="bg-white text-primary">關閉</q-tooltip>
          </q-btn>
        </div>

        <div class="row">
          <q-btn v-if="!editState" class="text-white q-mr-none" rounded flat icon="edit" @click="editState = true">
            <q-tooltip class="text-white">修改</q-tooltip>  
          </q-btn>
          <q-btn v-if="editState" class="text-white q-mr-none" rounded flat icon="save" @click="saveRecord(member.c_mem_id)">
            <q-tooltip class="text-white">儲存</q-tooltip>  
          </q-btn>
          <q-btn v-if="editState" class="text-white q-mr-none" rounded flat icon="replay" @click="edit_member = member">
            <q-tooltip class="text-white">重置</q-tooltip>  
          </q-btn>
          <q-btn v-if="editState" class="text-white q-mr-none" rounded flat icon="cancel" @click="edit_member = member; editState = false">
            <q-tooltip class="text-white">取消</q-tooltip>  
          </q-btn>
          <q-btn v-if="isSystemAdmin || isCenterIC" class="bg-white bg-red" dense flat icon="delete" label="刪除" @click="confirmDeleteModal = true"/>
          <q-fab
            v-if="member.b_mem_type1" 
            v-model="Membershipfab"
            label="會籍"
            dense
            padding="xs"
            square
            label-position="left"
            color="purple"
            icon="keyboard_arrow_right"
            direction="right"
            class="q-ml-xs"
          >
            <q-btn-dropdown v-if="member.c_udf_1 != '永久會員'" color="positive" icon="mail" label="續會" >
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
            <q-fab-action square color="negative" @click="quitMember(member.c_mem_id)" icon="alarm" label="退會" />
          </q-fab>
          <q-space/>
        </div>
      </q-card-section>
      <q-card-section class="bg-blue-1 row text-h6" style="border: 1px solid lightgrey;">
        <div class="q-pa-sm col-12 bg-blue-2 text-black text-h5">個人資料</div>
        <div class="col-12 row"><span class="col-3">中文姓名:</span><span v-if="editState" class="col-9"><q-input filled v-model="edit_member.c_name"/></span><span v-else>{{member.c_name}}</span></div>
        <div class="col-12 row"><span class="col-3">英文姓名:</span><span v-if="editState" class="col-9"><q-input filled v-model="edit_member.c_name_other"/></span><span v-else>{{member.c_name_other}}</span></div>
        <div class="col-12 row"><span class="col-3">性別:</span>
          <span v-if="editState" class="col-9">
            <q-btn-toggle
              v-model="edit_member.c_sex"
              toggle-color="primary"
              :options="[
                { label: '男', value: '男' },
                { label: '女', value: '女' },
              ]"
            />
          </span><span v-else>{{member.c_sex}}</span></div>
        <div class="col-12 row"><span class="col-3">出生日期: </span>
          <span v-if="editState" class="col-9">
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
          <span v-else class="col-9">{{qdate.formatDate(member.d_birth, "YYYY年MM月DD日")}}</span></div>
        <div class="col-12 row"><span class="col-3">年齡: </span><span v-if="editState" class="col-9">{{ageUtil.calculateAge(edit_member.d_birth)}}</span><span v-else>{{ageUtil.calculateAge(member.d_birth)}}</span></div>
        <div class="col-12 row"><span class="col-3">手提電話: </span><span v-if="editState" class="col-9"><q-input filled v-model="edit_member.c_mobile" mask="########"/></span><span v-else>{{member.c_mobile}}</span></div>
        <div class="col-12 row"><span class="col-3">家居電話: </span><span v-if="editState" class="col-9"><q-input filled v-model="edit_member.c_tel" mask="########"/></span><span v-else>{{member.c_tel}}</span></div>
        <div class="col-12 row"><span class="col-3">地址:</span><span v-if="editState" class="col-9"><q-input filled v-model="edit_member.m_addscom"/></span><span v-else>{{member.m_addscom}}</span></div>
        <div class="col-12 row"><span class="col-3">電郵:</span><span v-if="editState" class="col-9"><q-input filled v-model="edit_member.c_email"/></span><span v-else>{{member.c_email}}</span></div>
      </q-card-section>
      <q-card-section class="bg-yellow-1 row text-h6" style="border: 1px solid lightgrey;">
        <div class="q-pa-sm col-12 bg-yellow-3 text-black text-h5">緊急聯絡人資料</div>
        <div class="col-12 row"><span class="col-4">緊急聯絡人: </span><span v-if="editState" class="col-8"><q-input filled v-model="edit_member.c_emer_name"/></span><span v-else>{{member.c_emer_name}}</span></div>
        <div class="col-12 row"><span class="col-4">關係: </span><span v-if="editState" class="col-8"><q-input filled v-model="edit_member.c_emer_rel"/></span><span v-else>{{member.c_emer_rel}}</span></div>
        <div class="col-12 row"><span class="col-4">電話: </span><span v-if="editState" class="col-8"><q-input filled v-model="edit_member.c_emer_tel1_1" mask="########"/></span><span v-else>{{member.c_emer_tel1_1}}</span></div>
      </q-card-section>
      <q-card-section class="bg-green-1 row text-h6" style="border: 1px solid lightgrey;">
        <div class="q-pa-sm col-12 bg-green-2 text-black text-h5">會籍資料</div>
        <div class="col-2 col-xs-12">會籍: {{member.c_udf_1}}
          (<q-icon v-if="member.b_mem_type1" color="positive" name="check"/>
          <q-icon v-else color="negative" name="cancel"/>)
        </div>
        <div class="col-2 col-xs-12">入會日期: {{qdate.formatDate(member.d_enter_1, "YYYY年MM月DD日")}}</div>
        <div class="col-2 col-xs-12">屆滿日期: {{qdate.formatDate(member.d_expired_1, "YYYY年MM月DD日") == "3000年01月01日"? "永久":qdate.formatDate(member.d_expired_1, "YYYY年MM月DD日")}}</div>
        <div class="col-2 col-xs-12">續會日期: {{qdate.formatDate(member.d_renew_1, "YYYY年MM月DD日")}}</div>
        <div class="col-2 col-xs-12">退會日期: {{qdate.formatDate(member.d_exit_1, "YYYY年MM月DD日")}}</div>
        <div class="col-1 col-xs-12">青年家人: 
          <q-icon v-if="member.b_mem_type10" color="positive" name="check"/>
          <q-icon v-else color="negative" name="cancel"/>
        </div>
      </q-card-section>
      <q-card-section class="bg-teal-1 row text-h6" style="border: 1px solid lightgrey;">
        <div class="q-pa-sm col-12 bg-teal-2 text-black text-h5">
          <span>關聯會員</span>
          <q-btn
            v-if="editState"
            square
            class="col-1 col-xs-1 text-white bg-primary"
            icon="add"
            @click="
              edit_relationTable.push({
                c_mem_id: '',
                name: '',
                relation: '',
              })
            "
            />
        </div>
        <div v-if="editState" class="full-width row">
          <div class="full-width row">
            <span class="col-2 col-xs-2 col-md-2 col-sm-2 q-mr-md-md q-mr-sm-sm q-mr-xs-none">編號</span>
            <span class="col-3 col-xs-3 col-md-3 col-sm-3 q-mr-md-md q-mr-sm-sm q-mr-xs-none">關係</span>
            <span class="col-3 col-xs-3 col-md-3 col-sm-3 q-mr-md-md q-mr-sm-sm q-mr-xs-none">姓名</span>
            <span class="col-1 col-xs-1 col-md-1 col-sm-1 q-mr-md-md q-mr-sm-sm q-mr-xs-none">&nbsp;</span>
          </div>
          
          <div v-for="(relation, index) in edit_relationTable" :key="index">
            <div v-if="relation.delete != true" class="full-width row">
              <div class="col-2 col-xs-2 col-md-2 col-sm-2">
                <q-input
                  dense
                  filled
                  debounce="500"
                  type="text"
                  mask="####"
                  @update:model-value="(value) => getNameFromMemberID(value, index)"
                  v-model="edit_relationTable[index].c_mem_id"
                />
              </div>
              <div class="col-3 col-xs-3 col-md-3 col-sm-3">
                <q-select
                  dense
                  filled
                  v-model="edit_relationTable[index].relation"
                  :options="relationOptions"
                />
              </div>
              <div class="col-3 col-xs-3">
                {{ edit_relationTable[index].name }}
                <span v-if="edit_relationTable[index].age != null">({{edit_relationTable[index].age}})</span>
              </div>
              <div class="col-1 col-xs-1">
                <q-icon
                  v-if="edit_relationTable[index].b_mem_type1"
                  color="positive"
                  name="check"
                />
                <q-icon v-if="edit_relationTable[index].b_mem_type1 == false" color="negative" name="cancel" />
              </div>
              <q-btn
                v-if="index <= edit_relationTable.length - 1"
                square
                class="col-1 col-xs-1 text-white bg-negative"
                icon="remove"
                @click="edit_relationTable[index].delete = true"
              />
            </div>
          </div>
        </div>
        <div v-else>
          <div v-for="(member, index) in relationTable" :key="index" class="col-12 col-xs-12">
            <div v-if="member.b_mem_type1 && member.delete != true">[{{member?.c_mem_id}}] {{member.name}} ({{member.age}}) - {{member.relation}}</div>
          </div>
        </div>
      </q-card-section>
      <q-card-section class="bg-grey-1 row text-caption justify-end q-pa-none" style="border: 1px solid lightgrey;">
        <div class="col-shrink q-ma-md">更新日期: {{qdate.formatDate(member.d_update, "YYYY年MM月DD日")}}</div>
        <div class="col-shrink q-ma-md">更新職員: {{member.c_update_user}}</div>
      </q-card-section>
    </q-card>
</template>

<script>
import { defineComponent, computed, ref } from "vue";
import { useStore } from "vuex";
import LoadingDialog from "components/LoadingDialog.vue"
import { date as qdate, is} from "quasar";
import { DELETE_MEMBER_BY_ID, UPDATE_RELATED_YOUTH_MEMBER_STATUS, QUIT_MEMBER_BY_ID, UPDATE_MEMBER_BY_ID, INSERT_RELATION, UPDATE_RELATION, DELETE_RELATION, RENEW_MEMBER_FROM_ID_WITH_PAYMENT } from "/src/graphQueries/Member/mutation.js"
import { GET_RELATED_MEMBER_FROM_ID, GET_NAME_FROM_IDS, GET_MEMBER_BASIC_AND_RELATED_MEMBER_FROM_IDS, LATEST_RECEIPT_NO } from "/src/graphQueries/Member/query.js"
import ageUtil from "src/lib/calculateAge.js"
import {useSubscription} from "@vue/apollo-composable"

export default defineComponent({
  name: "MemberDetail",
  components: {
    LoadingDialog,
  },
  props: {
    modalObject: Object, 
  },
  data() {
    return {
      relatedMember: [],
      getNameFromIDs: [],
      relationTable: [],
      edit_relationTable: [],
      editState: false,
      member: JSON.parse(JSON.stringify(this.modalObject)),
      edit_member: JSON.parse(JSON.stringify(this.modalObject)),
      awaitServerResponse: 0,
      qdate: qdate,
      ageUtil: ageUtil,
      relationOptions: ["父母子女", "兄弟姐妹", "其他親人"],
      confirmDeleteModal: false,
    }
  },
  computed: {
    waitingAsync() {
      return this.awaitServerResponse > 0 ? true : false;
    },
  },
  setup() {
    const $store = useStore();
    const isDebug = false;
    const renewDialog = ref(false)
    const renewObject = ref({})
    
    const { result: ReceiptData } = useSubscription(
      LATEST_RECEIPT_NO,
    );
    
    function debug(args) {
      if (isDebug) {
        console.debug(args)
      }
    }
    
    return {
      username: computed(() => $store.getters["userModule/getUsername"]),
      isSystemAdmin: computed(() => $store.getters["userModule/getSystemAdmin"]),
      isCenterIC: computed(() => $store.getters["userModule/getCenterIC"]),
      Membershipfab: ref(false),
      latestReceiptNO: computed(() => {
        if (ReceiptData.value) {
          let token = ReceiptData.value.tbl_account[0].c_receipt_no.split("-")
          let receiptNo = parseInt(token[1])
          receiptNo = (receiptNo + 1).toString()
          while (receiptNo.length < 4) receiptNo = "0" + receiptNo
          return token[0] + "-" + receiptNo
        } else return null
      }),
      debug,
      renewDialog,
      renewObject,
    }
  },
  methods: {
    async getNameFromMemberID(value, index) {
      if (value != "") {
        this.$apollo.query({
          query: GET_NAME_FROM_IDS,
          variables: {
            "c_mem_ids": [value],
          },
          fetchPolicy: 'network-only'
        }).then((data) => {
          const getNameFromID = data.data.Member;
          if (getNameFromID.length > 0) {
          this.edit_relationTable[index].name = getNameFromID[0].c_name
            ? getNameFromID[0].c_name
            : getNameFromID[0].c_name_other;
          this.edit_relationTable[index].b_mem_type1 =
            getNameFromID[0].b_mem_type1;
          this.edit_relationTable[index].age = ageUtil.calculateAge(getNameFromID[0].d_birth)
        } else {
          this.edit_relationTable[index].name = "沒有此會員";
          this.edit_relationTable[index].age = null;
        }
        });
      }
    },
    async saveRecord(c_mem_id) {
      const updateObject = {
        d_update: new Date(),
        c_update_user: this.username,
        c_udf_1: is.object(this.edit_member.c_udf_1)? this.edit_member.c_udf_1.value : this.edit_member.c_udf_1,
        c_name: this.edit_member.c_name,
        c_name_other: this.edit_member.c_name_other,
        c_sex: this.edit_member.c_sex,
        c_tel: this.edit_member.c_tel,
        c_mobile: this.edit_member.c_mobile,
        d_birth: this.edit_member.d_birth,
        b_mem_type1: this.edit_member.b_mem_type1,
        b_mem_type10: this.edit_member.b_mem_type10,
        d_enter_1: this.edit_member.d_enter_1,
        d_expired_1: this.edit_member.d_expired_1,
        m_addscom: this.edit_member.m_addscom,
        c_email: this.edit_member.c_email,
        c_emer_name: this.edit_member.c_emer_name,
        c_emer_rel: this.edit_member.c_emer_rel,
        c_emer_tel1_1: this.edit_member.c_emer_tel1_1
      }      
      
      const oldValue = JSON.parse(JSON.stringify(this.member))
      for (const key in this.member) {
        this.member[key] = updateObject[key] ? updateObject[key] : this.member[key]
      }
      
      const oldRelation = JSON.parse(JSON.stringify(this.relationTable));
      let deleteRelation = []
      let changeRelation = []
      let newRelation = []
      let changedMemid = []
      // console.log("edit_relation:" + JSON.stringify(this.edit_relationTable))
      if (this.edit_relationTable.length > 0) {
        changedMemid = this.edit_relationTable.map(({c_mem_id}) => c_mem_id)
        for (const key in this.edit_relationTable) {
          if (this.edit_relationTable[key].uuid) { // existing record
            if (this.edit_relationTable[key].delete) { // delete it
              deleteRelation.push(this.edit_relationTable[key].uuid)
              // console.log(this.edit_relationTable[key].uuid + " deleted")
            } else { // modify it
              let i = oldRelation.findIndex((element) => element.uuid == this.edit_relationTable[key].uuid)
              if (is.deepEqual(oldRelation[i], this.edit_relationTable[key])) {
                // console.log("unchanged")                
              } else {
                // console.log("old record: " + JSON.stringify(oldRelation[i]));
                // console.log("new record: " + JSON.stringify(this.edit_relationTable[key]))
                // console.log(this.edit_relationTable[key].uuid + " changed")
                changeRelation.push({
                  uuid: this.edit_relationTable[key].uuid,
                  c_mem_id_1: this.member.c_mem_id,
                  c_mem_id_2: this.edit_relationTable[key].c_mem_id,
                  relation: this.edit_relationTable[key].relation,
                })
              }
            }
          } else {  // add new record
            if (!this.edit_relationTable[key].delete) { // new record but deleted, no action
              // console.log("new relation")
              newRelation.push({
                c_mem_id_1: this.member.c_mem_id,
                c_mem_id_2: this.edit_relationTable[key].c_mem_id,
                relation: this.edit_relationTable[key].relation,
              })
            }
          }
        }
      }
      /* debug
      console.log(JSON.stringify("new:" + JSON.stringify(newRelation)));
      console.log(JSON.stringify("change:"+JSON.stringify(changeRelation)));
      console.log(JSON.stringify("delete:"+JSON.stringify(deleteRelation)));
      */
      this.debug("list of related memid: " + changedMemid)

      this.awaitServerResponse++;

      let data = await this.$apollo.mutate({
        mutation: UPDATE_MEMBER_BY_ID, 
        variables: {
          "c_mem_id": c_mem_id,
          "object": updateObject,
          "logObject": {
            "username": this.username,
            "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
            "module": "會員系統",
            "action": c_mem_id + " 資料更新-" + "舊資料:" + JSON.stringify(oldValue) + " 新資料:" + JSON.stringify(updateObject) + " 舊關係:" + JSON.stringify(oldRelation) + " 新關係:" + JSON.stringify(newRelation) + " 更改關係:" + JSON.stringify(changeRelation) + " 刪除關係:" + JSON.stringify(deleteRelation),
          },
        },
      })
      
      const result = data.data.update_Member_by_pk;
      if (result.c_mem_id) {
        this.$q.notify({ message: "編號: " + result.c_mem_id + "更新資料成功." });
      }
      
      await this.updateRelation(newRelation, changeRelation, deleteRelation);
      
      for (const index in changedMemid) {
        this.debug("updating youth on " + changedMemid[index])
        await this.updateYouthRelatedMember(changedMemid[index])
      }
      // update youth status of this member too
      this.debug("updating youth on this member " + c_mem_id)
      await this.updateYouthRelatedMember(c_mem_id)

      this.relationTable = this.edit_relationTable
      this.editState = false;
      this.awaitServerResponse--;
    },
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
       
    
      /*
      let relatedMemberID = [];
      let relatedMemberUUID = [];
      
      const relatedMember = data_GET_RELATED_MEMBER_FROM_ID.data.Relation;
      this.debug("relatedMember: " + JSON.stringify(relatedMember))
      if (relatedMember.length > 0) {
        for (const index in relatedMember) {
          relatedMemberUUID.push(relatedMember[index].uuid)
          if (relatedMember[index].c_mem_id_1 == c_mem_id) {
            relatedMemberID.push(relatedMember[index].c_mem_id_2)
          } else relatedMemberID.push(relatedMember[index].c_mem_id_1)
        }
        
        // update all related member youth status
        
        if (relatedMemberID.length > 0) {
          for (const data of relatedMemberID) {
            this.debug("updating youth status of " + data)
            await this.updateYouthRelatedMember(data, c_mem_id)
          }
        }
      }
      */
      
     
      } catch (e) {
        this.debug("error: " + e)
      }
      
      
      /*
      if (relatedMemberID.length > 0) {
        for (const index in relatedMemberID) {
          console.log("update " + relatedMemberID[index])
          
        }
      }
      */

      // clear modal data and cancel loading screen
      this.member = {}
      this.awaitServerResponse--;     
    },
    async quitMember(c_mem_id) {
      this.awaitServerResponse++
      this.$apollo.mutate({
        mutation: QUIT_MEMBER_BY_ID,
        variables: {
          "c_mem_id": c_mem_id,
          "exitDate": qdate.formatDate(Date.now(), "YYYY-MM-DD"),
          "logObject": {
            "username": this.username,
            "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
            "module": "會員系統",
            "action": c_mem_id + " 退會。"
          }
        },
      }).then((data) => {
        const result = data.data.update_Member
       
        const memberStatus = result.returning[0].b_mem_type1 ? "有效" : "無效"
        this.$q.notify({ message: "會員: " + result.returning[0].c_mem_id + "退會. 會籍狀態：" + memberStatus + " 退會日期：" + qdate.formatDate(result.returning[0].d_exit_1, "YYYY年MM月DD日")});
        this.debug("result:" + JSON.stringify(result.returning[0]))
        this.$apollo.query({
          query: GET_RELATED_MEMBER_FROM_ID,
          variables: {
            "c_mem_id": result.returning[0].c_mem_id
          }
        }).then((data) => {
          this.debug("data:" + JSON.stringify(data.data.Relation))
          const relation = data.data.Relation
          const relationID = []
          this.debug("result:" + JSON.stringify(result.returning[0]))
          relation.forEach((rel) => {
            if (rel.c_mem_id_1 == result.returning[0].c_mem_id) {
              relationID.push(rel.c_mem_id_2)
              this.updateYouthRelatedMember(rel.c_mem_id_2)
            }
            else {
              relationID.push(rel.c_mem_id_1)
              this.updateYouthRelatedMember(rel.c_mem_id_1)
            }
          })
          
          this.debug("relationID: " + relationID)
        })
        this.awaitServerResponse--
      })
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
      /*
      let data_RENEW_MEMBERSHIP = await this.$apollo.mutate({
        mutation: RENEW_MEMBERSHIP,
        variables: {
          "c_mem_id": c_mem_id,
          "d_renew_1": qdate.formatDate(Date.now(), "YYYY年MM月DD日"),
          "d_expired_1": expiry_date
        }
      })*/
      // console.log("data_RENEW_MEMBERSHIP:" + JSON.stringify(data_RENEW_MEMBERSHIP));
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
  async mounted() {
    this.member.d_birth = qdate.formatDate(this.member.d_birth, "YYYY/MM/DD")
    const c_mem_id = this.member.c_mem_id
    
    // get related member information
    let result = await this.$apollo.query({
      query: GET_RELATED_MEMBER_FROM_ID,
      variables: {
        "c_mem_id": c_mem_id,
      },
    })
    let relatedMember = result.data.Relation;
    
    if (relatedMember.length > 0) {
      relatedMember.forEach((data) => {
        if (data.c_mem_id_1 == c_mem_id) {
          this.relationTable.push({
            uuid: data.uuid,
            c_mem_id: data.c_mem_id_2,
            relation: data.relation,
          })
        } else {
          this.relationTable.push({
            uuid: data.uuid,
            c_mem_id: data.c_mem_id_1,
            relation: data.relation,
          })
        }
      })
      // this.debug("this.relationTable:" + JSON.stringify(this.relationTable))
      // this.debug("relationIDList: "+ this.relationTable.map(({c_mem_id})=>c_mem_id))
      // get related member detail
      let result = await this.$apollo.query({
        query: GET_NAME_FROM_IDS,
        variables: {
          "c_mem_ids": this.relationTable.map(({c_mem_id})=>c_mem_id),
        },
      })
      // this.debug("result:" + JSON.stringify(result))
      let getNameFromIDs = result.data.Member
      //console.log("getNameFromIDs: " + JSON.stringify(this.getNameFromIDs))
      if (getNameFromIDs.length > 0) {
        for (const index in this.relationTable) {
          // console.log("index:" + index)
          this.relationTable[index].name = getNameFromIDs[index].c_name? getNameFromIDs[index].c_name : getNameFromIDs[index].c_name_other;
          this.relationTable[index].age = ageUtil.calculateAge(getNameFromIDs[index].d_birth)
          this.relationTable[index].b_mem_type1 = getNameFromIDs[index].b_mem_type1
        }
      }

      this.edit_relationTable = JSON.parse(JSON.stringify(this.relationTable));
      
    } 
  },
});
</script>