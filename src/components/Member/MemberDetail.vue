<template>
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
            <span v-if="member.c_name_other != null">({{member.c_name_other}})</span>
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
          <q-btn v-if="editState" class="text-white q-mr-none" rounded flat icon="save" @click="saveRecord">
            <q-tooltip class="text-white">儲存</q-tooltip>  
          </q-btn>
          <q-btn v-if="editState" class="text-white q-mr-none" rounded flat icon="replay" @click="edit_member = member">
            <q-tooltip class="text-white">重置</q-tooltip>  
          </q-btn>
          <q-btn v-if="editState" class="text-white q-mr-none" rounded flat icon="cancel" @click="edit_member = member; editState = false">
            <q-tooltip class="text-white">取消</q-tooltip>  
          </q-btn>
          
          <q-btn class="col-shrink bg-white bg-red" dense flat icon="delete" label="刪除" @click="confirmDeleteModal = true"/>
        </div>
      </q-card-section>
      <q-card-section class="bg-blue-1 row text-h6" style="border: 1px solid lightgrey;">
        <div class="q-pa-sm col-12 bg-blue-2 text-black text-h5">個人資料</div>
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
        <div class="col-12 row"><span class="col-3">年齡: </span><span v-if="editState" class="col-9">{{calculateAge(edit_member.d_birth)}}</span><span v-else>{{calculateAge(member.d_birth)}}</span></div>
        <div class="col-12 row"><span class="col-3">手提電話: </span><span v-if="editState" class="col-9"><q-input filled v-model="edit_member.c_mobile" mask="########"/></span><span v-else>{{member.c_mobile}}</span></div>
        <div class="col-12 row"><span class="col-3">家居電話: </span><span v-if="editState" class="col-9"><q-input filled v-model="edit_member.c_tel" mask="########"/></span><span v-else>{{member.c_tel}}</span></div>
        <div class="col-12 row"><span class="col-3">地址:</span><span v-if="editState" class="col-9"><q-input filled v-model="edit_member.m_addscom"/></span><span v-else>{{member.m_addscom}}</span></div>
        <div class="col-12 row"><span class="col-3">電郵:</span><span v-if="editState" class="col-9"><q-input filled v-model="edit_member.c_email"/></span><span v-else>{{member.c_email}}</span></div>
      </q-card-section>
      <q-card-section class="bg-yellow-1 row text-h6" style="border: 1px solid lightgrey;">
        <div class="q-pa-sm col-12 bg-yellow-3 text-black text-h5">緊急聯絡人資料</div>
        <div class="col-2 col-xs-12">緊急聯絡人: {{member.c_emer_name}}</div>
        <div class="col-2 col-xs-12">關係: {{member.c_emer_rel}}</div>
        <div class="col-2 col-xs-12">電話: {{member.c_emer_tel1_1}}</div>
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
          <q-icon v-if="member.b_mem_type_10" color="positive" name="check"/>
          <q-icon v-else color="negative" name="cancel"/>
        </div>
      </q-card-section>
      <q-card-section v-if="relatedMemberResult.length > 0" class="bg-teal-1 row text-h6" style="border: 1px solid lightgrey;">
        <div class="q-pa-sm col-12 bg-teal-2 text-black text-h5">關聯會員</div>
        <div v-for="(member, index) in relatedMemberResult" :key="index" class="col-2 col-xs-12">
          <div v-if="member.b_mem_type1">[{{member.c_mem_id}}] {{member.name}} ({{member.age}}) - {{member.relation}}</div>
        </div>
      </q-card-section>
      <q-card-section class="bg-grey-1 row text-caption justify-end q-pa-none" style="border: 1px solid lightgrey;">
        <div class="col-shrink q-ma-md">更新日期: {{qdate.formatDate(member.d_update, "YYYY年MM月DD日")}}</div>
        <div class="col-shrink q-ma-md">更新職員: {{member.c_update_user}}</div>
      </q-card-section>
    </q-card>
</template>

<script>
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import LoadingDialog from "components/LoadingDialog.vue"
import { date as qdate} from "quasar";
import { DELETE_MEMBER_FROM_ID } from "/src/graphQueries/Member/mutation.js"
import { GET_RELATED_MEMBER_FROM_ID, GET_NAME_FROM_IDS } from "/src/graphQueries/Member/query.js"

export default defineComponent({
  name: "MemberDetail",
  components: {
    LoadingDialog,
  },
  apollo: {
    relatedMember: {
      query: GET_RELATED_MEMBER_FROM_ID,
      update: data => data.Relation, 
      variables() {
        return {
          "c_mem_id": this.member.c_mem_id,
        }
      },
      skip() {
        return true
      }
    },
    getNameFromIDs: {
      query: GET_NAME_FROM_IDS,
      update: data => data.Member, 
      variables() {
        return {
          "c_mem_ids": this.relatedMemberResult.map(({c_mem_id})=>c_mem_id),
        }
      },
      skip() {
        return true
      }
    },
  },
  props: {
    modalObject: Object, 
  },
  data() {
    return {
      relatedMember: [],
      getNameFromIDs: [],
      relatedMemberResult: [],
      editState: false,
      member: JSON.parse(JSON.stringify(this.modalObject)),
      edit_member: JSON.parse(JSON.stringify(this.modalObject)),
      awaitServerResponse: 0,
      qdate: qdate,
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
    
    return {
      username: computed(() => $store.getters["userModule/getUsername"]),
    }
  },
  methods: {
    async saveRecord() {
      this.member.d_update = new Date();
      this.member.c_update_user = this.username;
      //is.object(this.edit_member.c_udf_1)? this.member.c_udf_1 = this.edit_member.c_udf_1.value : this.member.c_udf_1 = this.edit_member.c_udf_1;
      this.member.c_udf_1 = this.edit_member.c_udf_1;
      this.member.c_name = this.edit_member.c_name;
      this.member.c_name_other = this.edit_member.c_name_other;
      this.member.c_sex = this.edit_member.c_sex;
      this.member.c_tel = this.edit_member.c_tel;
      this.member.c_mobile = this.edit_member.c_mobile;
      this.member.d_birth = this.edit_member.d_birth;
      this.member.b_mem_type1 = this.edit_member.b_mem_type1;
      this.member.b_mem_type10 = this.edit_member.b_mem_type10;
      this.member.d_enter_1 = this.edit_member.d_enter_1;
      this.member.d_expired_1 = this.edit_member.d_expired_1;
      this.member.m_addscom = this.edit_member.m_addscom;
      this.member.c_email = this.edit_member.c_email;
      this.member.c_emer_name = this.edit_member.c_emer_name;
      this.member.c_emer_rel = this.edit_member.c_emer_rel;
      this.member.c_emer_tel1_1 = this.edit_member.c_emer_tel1_1;
                

      this.editState = false;
      
      this.awaitServerResponse++;
      try {
        const graphqlQuery = {
          operationName: "updateMember",
          query: `mutation updateMember(
                $c_mem_id: String!,
                $c_name: String
                $c_name_other: String,
                $c_sex: String,
                $c_tel: String,
                $c_mobile: String,
                $d_birth: datetime2,
                $b_mem_type1: Boolean,
                $b_mem_type10: Boolean,
                $c_udf_1: String,
                $c_update_user: String,
                $d_enter_1: datetime2,
                $d_expired_1: datetime2,
                $d_update: datetime2,
                $m_addscom: String,
                $c_email: String,
                $c_emer_name: String,
                $c_emer_rel: String,
                $c_emer_tel1_1: String,
              ) {
                update_Member_by_pk(
                  pk_columns: {
                    c_mem_id: $c_mem_id
                  }, 
                  _set: {
                    c_name: $c_name,
                    c_name_other: $c_name_other,
                    c_sex: $c_sex,
                    c_tel: $c_tel,
                    c_mobile: $c_mobile,
                    d_birth: $d_birth,
                    b_mem_type1: $b_mem_type1,
                    b_mem_type10: $b_mem_type10,
                    c_udf_1: $c_udf_1,
                    c_update_user: $c_update_user,
                    d_enter_1: $d_enter_1,
                    d_expired_1: $d_expired_1,
                    d_update: $d_update,
                    m_addscom: $m_addscom,
                    c_email: $c_email,
                    c_emer_name: $c_emer_name,
                    c_emer_rel: $c_emer_rel,
                    c_emer_tel1_1: $c_emer_tel1_1,
                  }
                ) {
                    c_mem_id
                  }
              }`,
          variables: {
            c_mem_id: this.member.c_mem_id,
            c_name: this.member.c_name,
            c_name_other: this.member.c_name_other,
            c_sex: this.member.c_sex,
            c_tel: this.member.c_tel,
            c_mobile: this.member.c_mobile,
            m_addscom: this.member.m_addscom,
            c_email: this.member.c_email,
            d_birth: this.member.d_birth,
            b_mem_type1: this.member.b_mem_type1,
            b_mem_type10: this.member.b_mem_type10,
            c_udf_1: this.member.c_udf_1,
            c_update_user: this.member.c_update_user,
            d_enter_1: this.member.d_enter_1,
            d_expired_1: this.member.d_expired_1,
            d_update: this.member.d_update,
          },
        };
        
        const memberResponse = await this.$api({
          method: "post",
          data: graphqlQuery,
        });
        
        this.awaitServerResponse--;
        if (memberResponse.status == "200") {
          this.$q.notify({ message: "編號: " + memberResponse.data.data.delete_Member_by_pk.c_mem_id + "更新資料成功." });
        }
      } catch (error) {
        this.error = error;
      }
      
    },
    calculateAge(dob) {
      if (qdate.isValid(dob)) { 
        let now = new Date();
        let birth = new Date(dob);
        let birthyear = birth.getFullYear();
        birth = qdate.adjustDate(birth, {year: now.getFullYear()})
        let offset = qdate.getDateDiff(now, birth, "days") < 0? -1: 0
        if (birthyear == now.getFullYear()) {
          return 0
        } else {
          return qdate.getDateDiff(now, dob, "years") + offset;
        }
      }
    },
    async confirmUserRemove() {
      this.awaitServerResponse++;

      this.$apollo.mutate({
        mutation: DELETE_MEMBER_FROM_ID,
        variables: {
          c_mem_id: this.member.c_mem_id,
        },
      }).then((data) => {
        const deleteMember = data.data.delete_Member_by_pk;
        const deleteRelateMember = data.data.delete_Relation;
        if (deleteMember.c_mem_id == this.member.c_mem_id) {
          if (deleteRelateMember.affected_rows > 0) {
            this.$q.notify({ message: "刪除會員編號: " + deleteMember.c_mem_id + " 成功，" + deleteRelateMember.affected_rows + "個關聯關係已刪除。"});
          } else {
            this.$q.notify({ message: "刪除會員編號: " + deleteMember.c_mem_id + " 成功."});
          }
        }
        this.member = {}
      })

      this.awaitServerResponse--;     
    },
  },
  async mounted() {
    this.member.d_birth = qdate.formatDate(this.member.d_birth, "YYYY/MM/DD")
    
    // get related member information
    this.$apollo.queries.relatedMember.skip = false;
    await this.$apollo.queries.relatedMember.refetch();
    
    if (this.relatedMember.length > 0) {
      this.relatedMember.forEach((data) => {
        if (data.c_mem_id_1 == this.member.c_mem_id) {
          this.relatedMemberResult.push({
            c_mem_id: data.c_mem_id_2,
            relation: data.relation,
          })
        } else {
          this.relatedMemberResult.push({
            c_mem_id: data.c_mem_id_1,
            relation: data.relation,
          })
        }
      })

      // get related member detail
      this.$apollo.queries.getNameFromIDs.skip = false;
      await this.$apollo.queries.getNameFromIDs.refetch();
      if (this.getNameFromIDs.length > 0) {
        for (const index in this.relatedMemberResult) {
          this.relatedMemberResult[index].name = this.getNameFromIDs[index].c_name? this.getNameFromIDs[index].c_name : this.getNameFromIDs[index].c_name_other;
          this.relatedMemberResult[index].age = this.calculateAge(this.getNameFromIDs[index].d_birth)
          this.relatedMemberResult[index].b_mem_type1 = this.getNameFromIDs[index].b_mem_type1
        }
      }
    }    
  },
});
</script>