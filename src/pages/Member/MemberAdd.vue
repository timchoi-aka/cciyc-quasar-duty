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
        性別<br />
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
          @update:model-value="(value) => updateType1Expire().then(personalInfo.age = ageUtil.calculateAge(value)) "
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
                  @update:model-value="(value) => updateType1Expire().then(personalInfo.age = ageUtil.calculateAge(value)) "
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
          @click="relationTable.splice(index, 1) && updateType1Expire()"
        />
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

  <div class="q-pa-xs-none q-pa-sm-sm q-pa-md-md col-xs-6 row justify-end">   
    <div v-if="memberInfo.c_udf_1 != ''" class="text-h6 self-end q-ma-md">
      <span>應收會費: {{memberInfo.c_udf_1.label? membershipFee[memberInfo.c_udf_1.label] : ''}}</span> 
    </div>
    <div>
      <q-btn
        class="q-ma-md self-end"
        size="lg"
        square
        color="primary"
        icon="add"
        label="新增會員"
        @click="addMember"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { date as qdate, is } from "quasar";
import LoadingDialog from "components/LoadingDialog.vue";
import { GET_NAME_FROM_IDS, LATEST_MEMBER_ID, LATEST_RECEIPT_NO } from "/src/graphQueries/Member/query.js";
import {
  ADD_MEMBER_FROM_ID,
  ADD_MEMBER_FROM_ID_WITH_PAYMENT,
  ADD_MEMBER_AND_RELATION_FROM_ID,
  ADD_MEMBER_AND_RELATION_FROM_ID_WITH_PAYMENT,
  ADD_MEMBER_AND_RELATION_FROM_ID_UPDATE_RELATED_YOUTH_STATUS,
  ADD_MEMBER_AND_RELATION_FROM_ID_UPDATE_RELATED_YOUTH_STATUS_WITH_PAYMENT
} from "/src/graphQueries/Member/mutation.js";
import {useSubscription, useQuery} from "@vue/apollo-composable"
import ageUtil from "src/lib/calculateAge.js"

let awaitServerResponse = ref(0)
const waitingAsync = computed(() => awaitServerResponse > 0 ? true : false)

// save current module
const $store = useStore();
$store.dispatch("currentModule/setCurrentModule", "member");

// load graphql subscription on latest member id
const { result: MemberData, loading } = useSubscription(
  LATEST_MEMBER_ID,
);

// load graphql subscription on latest receipt number
const { result: ReceiptData } = useSubscription(
  LATEST_RECEIPT_NO,
);

let GET_NAME_FROM_IDS_variables = ref([])
const { result: MemberName, onResult: GET_NAME_FROM_IDS_onResult } = useQuery(
  GET_NAME_FROM_IDS,
  () => ({
    c_mem_ids: GET_NAME_FROM_IDS_variables.value
  })
)

const username = computed(() => $store.getters["userModule/getUsername"])
const latestMemberID = computed(() => MemberData.value? parseInt(MemberData.value.Member[0].c_mem_id)+1: [])
// const MemberFromID = computed(() => MemberName.value && MemberName.value.Member.length > 0? MemberName.value.Member : [])

const latestReceiptNO = computed(() => {
  if (ReceiptData.value) {
    let token = ReceiptData.value.tbl_account[0].c_receipt_no.split("-")
    let receiptNo = parseInt(token[1])
    receiptNo = (receiptNo + 1).toString()
    while (receiptNo.length < 4) receiptNo = "0" + receiptNo
    return token[0] + "-" + receiptNo
  } else return null
})

const membershipFee = ref({
  "個人": "$60",
  "永久": "$100",
  "青年義工(<25歲)": "免費",
  "青年家人義工(>25歲)": "免費",
  "社區義工": "免費",
})

const relationOptions = ["父母子女", "兄弟姐妹", "其他親人"]
const udf1List = [
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
]

let relationTable = ref([
  {
    c_mem_id_1: "",
    c_mem_id_2: "",
    targetName: "",
    relation: "",
  },
])

let personalInfo = ref({
  c_name: "",
  c_name_other: "",
  c_sex: "",
  c_tel: "",
  c_mobile: "",
  d_birth: "",
  c_email: "",
  m_addscom: "",
  age: "",
})

let memberInfo = ref({
  b_mem_type1: false,
  b_mem_type10: false,
  c_udf_1: "",
  c_update_user: username,
  d_enter_1: qdate.formatDate(Date.now(), "YYYY/MM/DD"),
  d_expired_1: "",
  d_update: qdate.formatDate(Date.now(), "YYYY/MM/DD"),
  d_write: qdate.formatDate(Date.now(), "YYYY/MM/DD"),
})

// functions
function capitalize() {
  if (personalInfo.value.c_name_other != "") {
    const arr = personalInfo.value.c_name_other.split(" ");
    for (var i = 0; i < arr.length; i++) {
      arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
    }
    personalInfo.value.c_name_other = arr.join(" ");
  }
}

/*
async function getNameFromMemberID(c_mem_ids, index) {
  if (c_mem_ids != "") {
    GET_NAME_FROM_IDS_variables.value = [c_mem_ids]
    GET_NAME_FROM_IDS_onResult((result) => {
      
      console.log("index: " + index + " c_mem_ids: " + c_mem_ids + " result: " + JSON.stringify(result.data.Member))
      const getNameFromID = result.data.Member

      if (getNameFromID.length > 0) {
        this.relationTable[index].targetName = getNameFromID[0].c_name
          ? getNameFromID[index].c_name
          : getNameFromID[index].c_name_other;
        this.relationTable[index].b_mem_type1 = getNameFromID[0].b_mem_type1;
        this.relationTable[index].age = ageUtil.calculateAge(getNameFromID[0].d_birth)
      } else {
        this.relationTable[index].targetName = "沒有此會員";
        this.relationTable[index].age = null;
      }
    })
  }
}
*/
</script>

<script>

export default {
  name: "MemberAdd",
  methods: {
    async getNameFromMemberID(value, index) {
      if (value != "") {
        this.$apollo.query({
          query: GET_NAME_FROM_IDS,
          variables: {
            "c_mem_ids": [value],
          }
        }).then((data) => {
          const getNameFromID = data.data.Member;
          if (getNameFromID.length > 0) {
            this.relationTable[index].targetName = getNameFromID[0].c_name
              ? getNameFromID[0].c_name
              : getNameFromID[0].c_name_other;
            this.relationTable[index].b_mem_type1 =
              getNameFromID[0].b_mem_type1;
            this.relationTable[index].age = ageUtil.calculateAge(getNameFromID[0].d_birth)
            this.relationTable[index].d_birth = getNameFromID[0].d_birth
            this.updateType1Expire();
          } else {
            this.relationTable[index].targetName = "沒有此會員";
            this.relationTable[index].age = null;
          }
        });
      }
    },
    
    async addMember() {
      this.awaitServerResponse++;

      let queryString;
      let memberRelation = [];
      let receiptDescription = ""
      let price = 0
      let remark = ""
      switch(this.memberInfo.c_udf_1.value) {
        case "永久會員":
          receiptDescription = "永久會員會費"
          price = 135
          remark = "繳 付：永久會員會費"
          break
        case "個人會員":
          receiptDescription = "會員會費"
          price = 35
          remark = "繳 付：至" + qdate.formatDate(this.memberInfo.d_expired_1, "YYYY年MM月") + "之會費\r\n屆滿日期:" + qdate.formatDate(this.memberInfo.d_expired_1, "DD/MM/YYYY")
          break
      }

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
        if (price == 0) {
          queryString = ADD_MEMBER_FROM_ID;
        } else {
          queryString = ADD_MEMBER_FROM_ID_WITH_PAYMENT;
        }
      } else {
        if (this.relationTable.findIndex((element) => element.age >= 15 && element.age <= 24 && element.b_mem_type1) != -1) {
          this.memberInfo.b_mem_type10 = true;
        }

        if (this.personalInfo.age >= 15 && this.personalInfo.age <= 24) {
          if (price == 0) {
            queryString = ADD_MEMBER_AND_RELATION_FROM_ID_UPDATE_RELATED_YOUTH_STATUS
          } else {
            queryString = ADD_MEMBER_AND_RELATION_FROM_ID_UPDATE_RELATED_YOUTH_STATUS_WITH_PAYMENT
          }
        } else {
          if (price == 0) {
            queryString = ADD_MEMBER_AND_RELATION_FROM_ID;
          } else {
            queryString = ADD_MEMBER_AND_RELATION_FROM_ID_WITH_PAYMENT;
          }
        }
      }

      let updateObject = {
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
        b_mem_type10: this.memberInfo.b_mem_type10,
        c_udf_1: this.memberInfo.c_udf_1.value,
        c_update_user: this.memberInfo.c_update_user,
        d_enter_1: this.memberInfo.d_enter_1,
        d_expired_1: this.memberInfo.d_expired_1,
        d_update: this.memberInfo.d_update,
        d_write: this.memberInfo.d_write,
      }

      this.$apollo
        .mutate({
          mutation: queryString,
          variables: {
            memberObject: updateObject,
            relationObjects: memberRelation,
            related_ids: memberRelation.map(({c_mem_id_2})=>c_mem_id_2),
            logObject: {
              "username": this.username,
              "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
              "module": "會員系統",
              "action": "新增會員 " + this.latestMemberID.toString(),
            },
            accountObject: {
              c_receipt_no: this.latestReceiptNO,
              d_create: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
              i_receipt_type: 1, //type 1 = membership fee
              c_desc: receiptDescription,
              c_type: "新會員費",
              u_discount: 0,
              u_price_after_discount: price,
              c_cash_type: "Cash",
              c_cheque_no: "",
              m_remark: remark,
              c_mem_id: this.latestMemberID.toString(),
              c_user_id: this.username,
              c_name: this.personalInfo.c_name,
              b_cssa: false,
              b_refund: false,
              b_OtherIncome: false,
              b_clear: false,
              d_clear: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
              i_prints: 0,
            }
          },
        })
        .then((data) => {
          const memberResponse = data.data.insert_Member_one;
          const relationResponse = data.data.insert_Relation
            ? data.data.insert_Relation.returning
            : [];
          //const updateMemberResponse = data.data.update_Member ? data.data.update_Member : [];

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
          this.personalInfo = ({
            c_name: "",
            c_name_other: "",
            c_sex: "",
            c_tel: "",
            c_mobile: "",
            d_birth: "",
            c_email: "",
            m_addscom: "",
            age: "",
          });

          this.memberInfo = ref({
            b_mem_type1: false,
            b_mem_type10: false,
            c_udf_1: "",
            c_update_user: this.username,
            d_enter_1: qdate.formatDate(Date.now(), "YYYY/MM/DD"),
            d_expired_1: "",
            d_update: qdate.formatDate(Date.now(), "YYYY/MM/DD"),
            d_write: qdate.formatDate(Date.now(), "YYYY/MM/DD"),
          });

          this.relationTable = ref([
            {
              c_mem_id_1: "",
              c_mem_id_2: "",
              targetName: "",
              relation: "",
            },
          ]);
        });
      this.awaitServerResponse--;
    },
    async updateType1Expire() {
      // console.log(this.memberInfo.d_enter_1 + ":" + qdate.isValid(this.memberInfo.d_enter_1))
      console.log("udf_1:" + this.memberInfo.value.c_udf_1)
      if (
        is.object(this.memberInfo.c_udf_1.value) &&
        qdate.isValid(this.memberInfo.value.d_enter_1)
      ) {
        switch (this.memberInfo.value.c_udf_1.value) {
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
            if (!this.personalInfo.d_birth) {
              this.memberInfo.d_expired_1 = "請輸入出生日期"
            } else {
              if (ageUtil.calculateAge(this.personalInfo.d_birth) >= 25) {
                this.memberInfo.d_expired_1 = "已超過25歲"
              } else {
                this.memberInfo.d_expired_1 = qdate.formatDate(
                  qdate.subtractFromDate(
                    qdate.addToDate(this.personalInfo.d_birth, { years: 25 }),
                    { days: 1 }
                  ),
                  "YYYY/MM/DD"
                )
              }
            }
            
            break;
          case "青年家人義工":
            // set a temp expiry date, loop all related members
            let expiryDate = 0;

            if (this.relationTable.length > 0) {
              this.relationTable.forEach((data) => {
                if (ageUtil.calculateAge(data.d_birth) <= 24 && ageUtil.calculateAge(data.d_birth) >= 15) {
                  let tempExpiryDate = qdate.formatDate(
                                        qdate.subtractFromDate(
                                          qdate.addToDate(data.d_birth, { years: 25 }),
                                          { days: 1 }
                                        ),
                                        "YYYY/MM/DD"
                                      );
                    
                  if (expiryDate == 0 || expiryDate < tempExpiryDate) {
                    expiryDate = tempExpiryDate
                  }
                }
              })
            }
           
            this.memberInfo.d_expired_1 = expiryDate == 0? "沒有關聯青年會員": expiryDate
            break;
        }
      } else this.memberInfo.d_expired_1 = "";
    },
  },
};
</script>
