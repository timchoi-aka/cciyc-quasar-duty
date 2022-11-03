<!-- TODO set related member type10 -->
<!-- TODO check form before submit -->
<template class="q-mb-md">
  <!-- loading dialog -->
  <q-dialog v-model="waitingAsync" position="bottom">
    <LoadingDialog message="處理中" />
  </q-dialog>

  <!-- personal info qcard -->
  <q-card class="q-ma-md-md q-ma-xs-none q-ma-sm-sm">
    <q-card-section class="q-pa-md-md q-pa-sm-sm q-pa-xs-xs text-h6 bg-blue-1"
      >新會員個人資料<span v-if="!loading">(編號：{{latestMemberID}})</span>
    </q-card-section>
    <q-card-section class="row justify-start items-start q-pa-sm-sm q-pa-xs-xs q-pa-md-md">
      <div class="q-pa-xs-xs q-pa-sm-sm q-pa-md-md col-xs-8">
        姓名<q-input filled v-model="personalInfo.c_name"></q-input>
      </div>

      <div class="q-pa-xs-xs q-pa-sm-sm q-pa-md-md col-xs-4">
        姓別<br />
        <q-btn-toggle
          v-model="personalInfo.c_sex"
          toggle-color="primary"
          :options="[
            { label: '男', value: '男' },
            { label: '女', value: '女' },
          ]"
        />
      </div>

      <div class="q-pa-xs-xs q-pa-sm-sm q-pa-md-md col-xs-12">
        Name<q-input
          filled
          v-model="personalInfo.c_name_other"
          @update:model-value="capitalize"
        ></q-input>
      </div>

      <div class="q-pa-xs-xs q-pa-sm-sm q-pa-md-md col-xs-12">
        手提電話<q-input
          filled
          v-model="personalInfo.c_mobile"
          mask="########"
        />
      </div>

      <div class="q-pa-xs-xs q-pa-sm-sm q-pa-md-md col-xs-12">
        家居電話<q-input filled v-model="personalInfo.c_tel" mask="########" />
      </div>

      <div class="q-pa-xs-xs q-pa-sm-sm q-pa-md-md col-xs-8">
        出生日期
        <q-input
          filled
          v-model="personalInfo.d_birth"
          mask="date"
          hint="YYYY/MM/DD"
          :rules="['date']"
          @update:model-value="(value) => personalInfo.age = calculateAge(value)"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  v-model="personalInfo.d_birth"
                  @update:model-value="(value)=>personalInfo.age = calculateAge(value)"
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <div class="q-pa-xs-xs q-pa-sm-sm q-pa-md-md col-xs-4">
        年齡<br />
        {{ personalInfo.age }}
      </div>

      <div class="q-pa-xs-xs q-pa-sm-sm q-pa-md-md col-xs-12">
        地址<q-input filled v-model="personalInfo.m_addscom" />
      </div>

      <div class="q-pa-xs-xs q-pa-sm-sm q-pa-md-md col-xs-12">
        電郵地址<q-input filled v-model="personalInfo.c_email" type="email" />
      </div>
    </q-card-section>
  </q-card>

  <!-- membership info qcard -->
  <q-card class="q-ma-md-md q-ma-xs-none q-ma-sm-sm">
    <q-card-section class="q-pa-xs-xs q-pa-sm-sm q-pa-md-md text-h6 bg-green-1">會籍</q-card-section>
    <q-card-section class="row justify-start items-start q-pa-xs-xs q-pa-sm-sm q-pa-md-md">
      <div class="q-pa-xs-xs q-pa-sm-sm q-pa-md-md col-2 col-xs-12">
        會籍<q-select
          v-model="memberInfo.c_udf_1"
          :options="udf1List"
          label="選擇會藉"
          @update:model-value="updateType1Expire"
        />
      </div>
      <div class="q-pa-xs-xs q-pa-sm-sm q-pa-md-md col-xs-12">
        入會日期
        <q-input
          filled
          v-model="memberInfo.d_enter_1"
          mask="date"
          hint="YYYY/MM/DD"
          :rules="['date']"
          @update:model-value="updateType1Expire"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  v-model="memberInfo.d_enter_1"
                  @update:model-value="updateType1Expire"
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
      <div class="q-pa-xs-xs q-pa-sm-sm q-pa-md-md col-1 col-xs-12">
        屆滿日期<br />
        <div>{{ memberInfo.d_expired_1 }}</div>
      </div>
    </q-card-section>
  </q-card>

  <!-- related member -->
  <q-card class="q-ma-md-md q-ma-xs-none q-ma-sm-sm">
    <q-card-section class="q-pa-xs-xs q-pa-sm-sm q-pa-md-md text-h6 bg-yellow-1"
      >關聯會員</q-card-section
    >
    <q-card-section class="q-pa-xs-xs q-pa-sm-sm q-pa-md-md">
      <div class="row">
        <span class="col-3 col-xs-3 q-mr-md-md q-mr-sm-sm q-mr-xs-none">編號</span>
        <span class="col-3 col-xs-3 q-mr-md-md q-mr-sm-sm q-mr-xs-none">關係</span>
        <span class="col-3 col-xs-3 q-mr-md-md q-mr-sm-sm q-mr-xs-none">姓名</span>
        <span class="col-1 col-xs-1 q-mr-md-md q-mr-sm-sm q-mr-xs-none">會藉</span>
      </div>

      <div v-for="(relation, index) in relationTable" :key="index" class="row">
        <q-input
          dense
          filled
          class="col-3 col-xs-3 q-mr-md-md q-mr-sm-sm q-mr-xs-none"
          debounce="500"
          type="text"
          mask="####"
          @update:model-value="(value) => getNameFromMemberID(value, index)"
          v-model="relationTable[index].c_mem_id_2"
        />
        <q-select
          dense
          filled
          class="col-3 col-xs-3 q-mr-md-md q-mr-sm-sm q-mr-xs-none"
          v-model="relationTable[index].relation"
          :options="relationOptions"
        />
        <span class="col-3 col-xs-3 q-mr-md-md q-mr-sm-sm q-mr-xs-none">
          {{ relationTable[index].targetName }}
          <span v-if="relationTable[index].age != null">({{relationTable[index].age}})</span>
        </span>
        <span class="col-1 col-xs-1 q-mr-md-md q-mr-sm-sm q-mr-xs-none">
          <q-icon
            v-if="relationTable[index].b_mem_type1"
            color="positive"
            name="check"
          />
          <q-icon v-if="relationTable[index].b_mem_type1 == false" color="negative" name="cancel" />
        </span>
        <q-btn
          v-if="index == relationTable.length - 1"
          square
          class="col-1 col-xs-1 text-white bg-primary"
          icon="add"
          @click="
            relationTable.push({
              c_mem_id_1: '',
              c_mem_id_2: '',
              targetName: '',
              relation: '',
            })
          "
        />
        <q-btn
          v-if="index < relationTable.length - 1"
          square
          class="col-1 text-white bg-negative"
          icon="remove"
          @click="relationTable.splice(index, 1)"
        />
      </div>
    </q-card-section>
  </q-card>

  <div class="q-pa-xs-none q-pa-sm-sm q-pa-md-md col-xs-6 row justify-end">
    <q-btn
      class="q-ma-md q-mb-xl"
      size="lg"
      square
      color="primary"
      icon="add"
      label="新增會員"
      @click="addMember"
    />
  </div>

  <!-- <div class="row justify-start items-start q-pa-sm">
  <div><q-checkbox v-model="memberInfo.b_mem_type2" /></div>
  <div class="q-pa-xs col-2">小於15歲青年家屬</div>
</div>-->
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";
import { date as qdate, is } from "quasar";
import LoadingDialog from "components/LoadingDialog.vue";
import { GET_MEMBER_NAME_FROM_ID, LATEST_MEMBER_ID } from "/src/graphQueries/Member/query.js";
import { MEMBER_GET_ALL } from "/src/graphQueries/Member/query.js"
import {
  ADD_MEMBER_FROM_ID,
  ADD_MEMBER_AND_RELATION_FROM_ID,
} from "/src/graphQueries/Member/mutation.js";
import {useSubscription} from "@vue/apollo-composable"

export default {
  name: "MemberAdd",
  computed: {
    waitingAsync() {
      return this.awaitServerResponse > 0 ? true : false;
    },
  },
  components: {
    LoadingDialog,
  },
  setup() {
    // save current module
    const $store = useStore();
    $store.dispatch("currentModule/setCurrentModule", "member");

    // load graphql subscription on latest member id
    const { result, loading } = useSubscription(
      LATEST_MEMBER_ID,
    );
    
    return {
      username: computed(() => $store.getters["userModule/getUsername"]),
      latestMemberID: computed(() => result.value? parseInt(result.value.Member[0].c_mem_id)+1: []),
      loading,
      relationOptions: ["父母子女", "兄弟姐妹", "其他親人"],
    };
  },
  methods: {
    async getNameFromMemberID(value, index) {
      if (value != "") {
        this.queryMemberID = value;
        this.$apollo.query({
          query: GET_MEMBER_NAME_FROM_ID,
          variables: {
            "c_mem_id_2": this.queryMemberID,
          }
        }).then((data) => {
          const getNameFromID = data.data.Member;
          if (getNameFromID.length > 0) {
          this.relationTable[index].targetName = getNameFromID[0].c_name
            ? getNameFromID[0].c_name
            : getNameFromID[0].c_name_other;
          this.relationTable[index].b_mem_type1 =
            getNameFromID[0].b_mem_type1;
          this.relationTable[index].age = this.calculateAge(getNameFromID[0].d_birth)
        } else {
          this.relationTable[index].targetName = "沒有此會員";
        }
        });
      }
    },
    async addMember() {
      this.awaitServerResponse++;

      let queryString;
      let memberRelation = [];
      this.relationTable.forEach((rel) => {
        if (rel.targetName != "" && rel.targetName != "沒有此會員") {
          memberRelation.push({
            c_mem_id_1: this.latestMemberID.toString(),
            c_mem_id_2: rel.c_mem_id_2,
            relation: rel.relation,
          });
        }
      });
      
      if (memberRelation.length == 0) {
        queryString = ADD_MEMBER_FROM_ID;
      } else {
        queryString = ADD_MEMBER_AND_RELATION_FROM_ID;
        console.log(this.relationTable.findIndex((element) => element.age >= 15 && element.age <= 24));
      }

      this.$apollo
        .mutate({
          mutation: queryString,
          variables: {
            c_mem_id: this.latestMemberID.toString(),
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
            relationObjects: memberRelation,
          },
        })
        .then((data) => {
          const memberResponse = data.data.insert_Member_one;
          const relationResponse = data.data.insert_Relation
            ? data.data.insert_Relation.returning
            : [];

          if (memberResponse.c_mem_id == this.latestMemberID.toString()) {
            if (relationResponse.length > 0) {
              this.$q.notify({
                message:
                  "新增會員編號: " +
                  memberResponse.c_mem_id +
                  " 成功， " +
                  relationResponse.length +
                  "個關聯會員。",
              });
            } else {
              this.$q.notify({
                message: "新增會員編號: " + memberResponse.c_mem_id + " 成功.",
              });
            }
          }

          // initialize data
          this.personalInfo = {
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
          };

          this.relationTable = [
            {
              c_mem_id_1: "",
              c_mem_id_2: "",
              targetName: "",
              relation: "",
            },
          ];
        });
      this.awaitServerResponse--;
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
    calculateAge(value) {
      if (qdate.isValid(value)) {
        let now = new Date();
        let birth = new Date(value);
        let birthyear = birth.getFullYear();
        birth = qdate.adjustDate(birth, { year: now.getFullYear() });
        let offset = qdate.getDateDiff(now, birth, "days") < 0 ? -1 : 0;
        if (birthyear == now.getFullYear()) {
          return 0;
        } else {
          return qdate.getDateDiff(now, value, "years") + offset;
        }
      }
    },
    updateType1Expire() {
      // console.log(this.memberInfo.d_enter_1 + ":" + qdate.isValid(this.memberInfo.d_enter_1))
      if (
        is.object(this.memberInfo.c_udf_1) &&
        qdate.isValid(this.memberInfo.d_enter_1)
      ) {
        switch (this.memberInfo.c_udf_1.value) {
          case "個人會員":
            this.memberInfo.d_expired_1 = qdate.formatDate(
              qdate.subtractFromDate(
                qdate.addToDate(this.memberInfo.d_enter_1, { years: 1 }),
                { days: 1 }
              ),
              "YYYY/MM/DD"
            );
            break;
          case "永久會員":
          case "社區義工":
            this.memberInfo.d_expired_1 = "3000/01/01";
            break;
          case "青年義工會員":
            this.memberInfo.d_expired_1 = qdate.formatDate(
              qdate.subtractFromDate(
                qdate.addToDate(this.personalInfo.d_birth, { years: 25 }),
                { days: 1 }
              ),
              "YYYY/MM/DD"
            );
            break;
          case "青年家人義工":
            // to be updated after membership relation
            this.memberInfo.d_expired_1 = qdate.formatDate(
              qdate.subtractFromDate(
                qdate.addToDate(this.personalInfo.d_birth, { years: 14 }),
                { days: 1 }
              ),
              "YYYY/MM/DD"
            );
            break;
        }
      } else this.memberInfo.d_expired_1 = "";
    },
  },
  data() {
    return {
      queryMemberID: "",
      relationTable: [
        {
          c_mem_id_1: "",
          c_mem_id_2: "",
          targetName: "",
          relation: "",
        },
      ],
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
      },
    };
  },
};
</script>
