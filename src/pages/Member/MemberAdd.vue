<template class="q-mb-md">
<div class="q-pa-md text-h6">新會員個人資料</div>
<div class="row justify-start items-start q-pa-sm">
    <div class="q-pa-xs col-xs-8">姓名<q-input filled v-model="personalInfo.c_name"></q-input></div>
    
    <div class="q-pa-xs col-xs-4">姓別<br/>
      <q-btn-toggle
        v-model="personalInfo.c_sex"
        toggle-color="primary"
        :options="[
            {label: '男', value: '男'},
            {label: '女', value: '女'}
        ]"
      />
    </div>

    <div class="q-pa-xs col-xs-12">Name<q-input filled v-model="personalInfo.c_name_other" @update:model-value="capitalize"></q-input></div>
    
    
    
    <div class="q-pa-xs col-xs-12">手提電話<q-input filled v-model="personalInfo.c_mobile" mask="########"/></div>
    
    <div class="q-pa-xs col-xs-12">家居電話<q-input filled v-model="personalInfo.c_tel" mask="########"/></div>
    
    <div class="q-pa-xs col-xs-8">出生日期
      <q-input filled v-model="personalInfo.d_birth" mask="date" hint="YYYY/MM/DD" :rules="['date']" @update:model-value="calculateAge">
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="personalInfo.d_birth" @update:model-value="calculateAge">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>

    <div class="q-pa-xs col-xs-4">年齡<br/>
      {{personalInfo.age}}
    </div>

    <div class="q-pa-xs col-xs-12">地址<q-input filled v-model="personalInfo.m_addscom"/></div>
    
    <div class="q-pa-xs col-xs-12">電郵地址<q-input filled v-model="personalInfo.c_email" type="email"/></div>
</div>
<div class="q-pa-md text-h6">會籍</div>
<div class="row justify-start items-start q-pa-sm">
  <!-- <div><q-checkbox v-model="memberInfo.b_mem_type1" /></div> -->
  <div class="q-pa-xs col-2 col-xs-12">會籍<q-select v-model="memberInfo.c_udf_1" :options="udf1List" label="選擇會藉" @update:model-value="updateType1Expire"/></div>
  <div class="q-pa-xs col-xs-12">入會日期
    <q-input filled v-model="memberInfo.d_enter_1" mask="date" hint="YYYY/MM/DD" :rules="['date']" @update:model-value="updateType1Expire">
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date v-model="memberInfo.d_enter_1" @update:model-value="updateType1Expire">
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
  </div>
  <div class="q-pa-xs col-1 col-xs-12">屆滿日期<br/>{{memberInfo.d_expired_1}}</div>
  <div class="q-pa-xs col-xs-6">
    <q-btn square color="primary" icon="add" label="新增會員" @click="addMember"/>
  </div>
</div>

<!-- <div class="row justify-start items-start q-pa-sm">
  <div><q-checkbox v-model="memberInfo.b_mem_type2" /></div>
  <div class="q-pa-xs col-2">小於15歲青年家屬</div>
</div>-->
</template>

<script>
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import { FirebaseAuth } from "boot/firebase";
import { date as qdate, is} from "quasar";

export default defineComponent({
  name: "MemberAdd",
  computed: {
    waitingAsync() {
      return this.awaitServerResponse > 0 ? true : false;
    },
  },
  setup() {
    const $store = useStore();
    $store.dispatch("currentModule/setCurrentModule", "member");
    
    return {
        username: computed(() => $store.getters["userModule/getUsername"]),
    }
  },
  methods: {
    async addMember() {
      this.awaitServerResponse++;
      try {
        await this.getLastMemberID()
        const graphqlQuery = {
          operationName: "addMember",
          query: `mutation addMember (
                $c_mem_id: String!,
                $c_name: String
                $c_name_other: String,
                $c_sex: String,
                $c_tel: String,
                $c_mobile: String,
                $c_user_id: String
                $d_birth: datetime2,
                $b_mem_type1: Boolean,
                $c_udf_1: String,
                $c_update_user: String,
                $d_enter_1: datetime2,
                $d_expired_1: datetime2,
                $d_update: datetime2,
                $d_write: datetime2,
                $m_addscom: String,
                $c_email: String,
            ) {
                insert_Member_one(object: {
                  c_mem_id: $c_mem_id,
                  c_name: $c_name,
                  c_name_other: $c_name_other,
                  c_sex: $c_sex,
                  c_tel: $c_tel,
                  c_mobile: $c_mobile,
                  m_addscom: $m_addscom,
                  c_email: $c_email,
                  d_birth: $d_birth,
                  b_mem_type1: $b_mem_type1,
                  c_udf_1: $c_udf_1,
                  c_update_user: $c_update_user,
                  d_enter_1: $d_enter_1,
                  d_expired_1: $d_expired_1,
                  d_update: $d_update,
                  d_write: $d_write,
                })
                  {
                    c_mem_id
                  }
              }`,
          variables: {
            c_mem_id: this.personalInfo.c_mem_id.toString(),
            c_name: this.personalInfo.c_name,
            c_name_other: this.personalInfo.c_name_other,
            c_sex: this.personalInfo.c_sex,
            c_tel: this.personalInfo.c_tel,
            c_mobile: this.personalInfo.c_mobile,
            m_addscom: this.personalInfo.m_addscom,
            c_email: this.personalInfo.c_email,
            d_birth: this.personalInfo.d_birth,
            b_mem_type1: true,
            c_udf_1: this.memberInfo.c_udf_1.value,
            c_update_user: this.memberInfo.c_update_user,
            d_enter_1: this.memberInfo.d_enter_1,
            d_expired_1: this.memberInfo.d_expired_1,
            d_update: this.memberInfo.d_update,
            d_write: this.memberInfo.d_write,
          },
        };
        
        var token = await FirebaseAuth.currentUser.getIdToken();
        this.$api.defaults.headers.common['Authorization'] = "Bearer " + token;
        
        const memberResponse = await this.$api({
          method: "post",
          data: graphqlQuery,
        });
        
        // console.log(memberResponse)
        if (memberResponse.status == "200") {
          this.$q.notify({ message: "新增會員編號: " + memberResponse.data.data.insert_Member_one.c_mem_id + " 成功." });
          
          // initialize data
          this.personalInfo = {
            c_mem_id: "",
            c_name: "",
            c_name_other: "",
            c_sex: "",
            c_tel: "",
            c_mobile: "",
            d_birth: "",
            c_email: "",
            m_addscom: "",
            age: "",
          };

          this.memberInfo = {
            b_mem_type1: false,
            c_udf_1: "",
            c_update_user: this.username,
            d_enter_1: qdate.formatDate(Date.now(), "YYYY/MM/DD"),
            d_expired_1: "",
            d_update: qdate.formatDate(Date.now(), "YYYY/MM/DD"),
            d_write: qdate.formatDate(Date.now(), "YYYY/MM/DD"),
          }
        }
        this.awaitServerResponse--;
      } catch (error) {
        this.error = error;
      }
    },
    async getLastMemberID() {
      this.awaitServerResponse++;
      try {
        const graphqlQuery = {
          operationName: "getLatestMemberID",
          query: `query getLatestMemberID {
                    Member(limit: 1, order_by: {c_mem_id: desc}, offset: 1) {
                      c_mem_id
                    }
                  }`,
          variables: {},
        };
        
        var token = await FirebaseAuth.currentUser.getIdToken();
        this.$api.defaults.headers.common['Authorization'] = "Bearer " + token;
        
        const memberResponse = await this.$api({
          method: "post",
          data: graphqlQuery,
        });
        
        this.personalInfo.c_mem_id = parseInt(memberResponse.data.data.Member[0].c_mem_id) + 1;
        this.awaitServerResponse--;
      } catch (error) {
        this.error = error;
      }
    },
    capitalize() {
      if (this.personalInfo.c_name_other != "") {
        const arr = this.personalInfo.c_name_other.split(" ");
        for (var i = 0; i < arr.length; i++) {
          arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
        }
        this.personalInfo.c_name_other = arr.join(" ");
      }
    },
    calculateAge() {
      if (qdate.isValid(this.personalInfo.d_birth)) { 
        let now = new Date();
        let birth = new Date(this.personalInfo.d_birth);
        let birthyear = birth.getFullYear();
        birth = qdate.adjustDate(birth, {year: now.getFullYear()})
        let offset = qdate.getDateDiff(now, birth, "days") < 0? -1: 0
        if (birthyear == now.getFullYear()) {
          this.personalInfo.age = 0
        } else {
          this.personalInfo.age = qdate.getDateDiff(now, this.personalInfo.d_birth, "years") + offset;
        }
      }
    },
    updateType1Expire() {
      // console.log(this.memberInfo.d_enter_1 + ":" + qdate.isValid(this.memberInfo.d_enter_1))
      if (is.object(this.memberInfo.c_udf_1) && qdate.isValid(this.memberInfo.d_enter_1)) {
        switch (this.memberInfo.c_udf_1.value) {
          case "個人會員":
            this.memberInfo.d_expired_1 = qdate.formatDate(qdate.subtractFromDate(qdate.addToDate(this.memberInfo.d_enter_1, {years: 1}), {days: 1}), "YYYY/MM/DD")
            break;
          case "永久會員":
          case "社區義工":
            this.memberInfo.d_expired_1 = "3000/01/01"
            break;
          case "青年義工會員":
            this.memberInfo.d_expired_1 = qdate.formatDate(qdate.subtractFromDate(qdate.addToDate(this.personalInfo.d_birth, {years: 25}), {days: 1}), "YYYY/MM/DD")
            break;
          case "青年家人義工":
            // to be updated after membership relation
            this.memberInfo.d_expired_1 = qdate.formatDate(qdate.subtractFromDate(qdate.addToDate(this.personalInfo.d_birth, {years: 14}), {days: 1}), "YYYY/MM/DD")
            break;
        }
      } else this.memberInfo.d_expired_1 = "";
    },
    
  },
  data() {
    return {
      qdate: qdate,
      udf1List: [
        {
          label: "全部",
          value: "",
        },
        {
          label: "個人",
          value: "個人會員",
        },
        {
          label: "永久",
          value: "永久會員",
        },
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
        ],
      awaitServerResponse: 0,
      personalInfo: {
        c_mem_id: "",
        c_name: "",
        c_name_other: "",
        c_sex: "",
        c_tel: "",
        c_mobile: "",
        d_birth: "",
        c_email: "",
        m_addscom: "",
        age: "",
      },
      memberInfo: {
        b_mem_type1: false,
        c_udf_1: "",
        c_update_user: this.username,
        d_enter_1: qdate.formatDate(Date.now(), "YYYY/MM/DD"),
        d_expired_1: "",
        d_update: qdate.formatDate(Date.now(), "YYYY/MM/DD"),
        d_write: qdate.formatDate(Date.now(), "YYYY/MM/DD"),
      }
    };
  },
  async mounted() {
  }
});
</script>



