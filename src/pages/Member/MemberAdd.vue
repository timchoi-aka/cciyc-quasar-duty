<!-- TODO 咁你出D提醒，令同事知道已經有同名有效會員-->
<template class="q-mb-md">
  <!-- loading dialog -->
  <q-dialog v-model="waitingAsync" position="bottom">
    <LoadingDialog message="處理中" />
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
          debounce="500"
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
                  v-model="personalInfo.d_birth"
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
        {{ age }}
      </div>

      <div class="q-pa-xs-xs q-pa-sm-sm q-pa-md-md col-xs-12">
        地址<q-input filled v-model="personalInfo.m_addscom" />
      </div>

      <div class="q-pa-xs-xs q-pa-sm-sm q-pa-md-md col-xs-12">
        電郵地址<q-input filled v-model="personalInfo.c_email" type="email" />
      </div>
    </q-card-section>
  </q-card>

  <!-- emergency -->
  <q-card class="q-ma-md-md q-ma-xs-none q-ma-sm-sm">
    <q-card-section class="q-pa-xs-xs q-pa-sm-sm q-pa-md-md text-h6 bg-red-1">
      緊急聯絡人資料
    </q-card-section>
    <q-card-section class="q-pa-xs-xs q-pa-sm-sm q-pa-md-md">
      <div class="col-12 row"><span class="col-4">緊急聯絡人: </span><span class="col-8"><q-input filled v-model="personalInfo.c_emer_name"/></span></div>
      <div class="col-12 row"><span class="col-4">關係: </span><span class="col-8"><q-input filled v-model="personalInfo.c_emer_rel"/></span></div>
      <div class="col-12 row"><span class="col-4">電話: </span><span class="col-8"><q-input filled v-model="personalInfo.c_emer_tel1_1" mask="########"/></span></div>
    </q-card-section>
  </q-card>

  <!-- related member -->
  <q-card class="q-ma-md-md q-ma-xs-none q-ma-sm-sm">
    <q-card-section class="q-pa-xs-xs q-pa-sm-sm q-pa-md-md text-h6 bg-yellow-1">
      關聯會員
      <q-btn
          square
          class="col-1 col-xs-1 text-white bg-primary"
          icon="add"
          @click="
            relationTable.push({
              
              c_mem_id_1: latestMemberID,
              c_mem_id_2: '',
              relation: '',
              name: '',
              age: 0,
              d_birth: '',
              b_mem_type1: false,
              uuid: '',
              delete: false,
            })
          "
        />
      <q-btn
        v-if="relationTable.length > 1"
        square
        class="col-1 text-white bg-negative"
        icon="remove"
        @click="relationTable.splice(relationTable.length -1, 1) && updateType1Expire()"
      />
    </q-card-section>
    <q-card-section class="q-pa-xs-xs q-pa-sm-sm q-pa-md-md">
      <div class="row">
        <span class="col-3 col-xs-3 q-mr-md-md q-mr-sm-sm q-mr-xs-none">編號</span>
        <span class="col-3 col-xs-3 q-mr-md-md q-mr-sm-sm q-mr-xs-none">關係</span>
        <span class="col-3 col-xs-3 q-mr-md-md q-mr-sm-sm q-mr-xs-none">姓名</span>
        <span class="col-1 col-xs-1 q-mr-md-md q-mr-sm-sm q-mr-xs-none">會藉</span>
        <q-space/>
      </div>
      
      <div v-for="(relation, index) in relationTable" :key="index" class="row fit">
        <MemberRelated :key="latestMemberID" v-model="relationTable[index]" :MemberID="latestMemberID" class="row fit"/>
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
          :option-disable="opt => Object(opt) === opt ? opt.inactive === true : true"
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
        <div>{{ expiryDate }}</div>
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
import { date as qdate, is, useQuasar } from "quasar";
import LoadingDialog from "components/LoadingDialog.vue"
import MemberRelated from "components/Member/MemberRelated.vue"
import PrintReceipt from "components/Account/PrintReceipt.vue"
import { LATEST_MEMBER_ID, LATEST_RECEIPT_NO } from "/src/graphQueries/Member/query.js";
import {
  ADD_MEMBER_FROM_ID,
  ADD_MEMBER_FROM_ID_WITH_PAYMENT,
  ADD_MEMBER_AND_RELATION_FROM_ID,
  ADD_MEMBER_AND_RELATION_FROM_ID_WITH_PAYMENT,
  ADD_MEMBER_AND_RELATION_FROM_ID_UPDATE_RELATED_YOUTH_STATUS,
  ADD_MEMBER_AND_RELATION_FROM_ID_UPDATE_RELATED_YOUTH_STATUS_WITH_PAYMENT
} from "/src/graphQueries/Member/mutation.js";
import { useSubscription, useMutation } from "@vue/apollo-composable"
import ageUtil from "src/lib/calculateAge.js"

// variables
const relateObject = ref({})
const awaitServerResponse = ref(0)
const printReceiptModal = ref(false)
const printReceiptMember = ref("")

// save current module
const $store = useStore();
const $q = useQuasar()
$store.dispatch("currentModule/setCurrentModule", "member");

// queries
// load graphql subscription on latest member id
const { result: MemberData, loading } = useSubscription(
  LATEST_MEMBER_ID,
);

// load graphql subscription on latest receipt number
const { result: ReceiptData } = useSubscription(
  LATEST_RECEIPT_NO,
);

const { mutate: addMemberFromID, onDone: addMemberFromID_Completed, onError: addMemberFromID_Error } = useMutation(ADD_MEMBER_FROM_ID)
const { mutate: addMemberFromIDWithPayment, onDone: addMemberFromIDWithPayment_Completed, onError: addMemberFromIDWithPayment_Error} = useMutation(ADD_MEMBER_FROM_ID_WITH_PAYMENT)
const { mutate: addMemberAndRelationFromIDUpdateRelatedYouthStatus, onDone: addMemberAndRelationFromIDUpdateRelatedYouthStatus_Completed, onError: addMemberAndRelationFromIDUpdateRelatedYouthStatus_Error} = useMutation(ADD_MEMBER_AND_RELATION_FROM_ID_UPDATE_RELATED_YOUTH_STATUS)
const { mutate: addMemberAndRelationFromIDUpdateRelatedYouthStatusWithPayment, onDone: addMemberAndRelationFromIDUpdateRelatedYouthStatusWithPayment_Completed, onError: addMemberAndRelationFromIDUpdateRelatedYouthStatusWithPayment_Error} = useMutation(ADD_MEMBER_AND_RELATION_FROM_ID_UPDATE_RELATED_YOUTH_STATUS_WITH_PAYMENT)
const { mutate: addMemberAndRelationFromID, onDone: addMemberAndRelationFromID_Completed, onError: addMemberAndRelationFromID_Error} = useMutation(ADD_MEMBER_AND_RELATION_FROM_ID)
const { mutate: addMemberAndRelationFromIDWithPayment, onDone: addMemberAndRelationFromIDWithPayment_Completed, onError: addMemberAndRelationFromIDWithPayment_Error} = useMutation(ADD_MEMBER_AND_RELATION_FROM_ID_WITH_PAYMENT)

// computed
const waitingAsync = computed(() => awaitServerResponse.value > 0)
const username = computed(() => $store.getters["userModule/getUsername"])
const latestMemberID = computed(() => MemberData.value? (parseInt(MemberData.value.Member[0].c_mem_id)+1).toString(): "")
const latestReceiptNO = computed(() => {
  if (ReceiptData.value) {
    let token = ReceiptData.value.tbl_account[0].c_receipt_no.split("-")
    let receiptNo = parseInt(token[1])
    receiptNo = (receiptNo + 1).toString()
    while (receiptNo.length < 4) receiptNo = "0" + receiptNo
    return token[0] + "-" + receiptNo
  } else return null
})

// constants
const membershipFee = ref({
  "個人": "$35",
  "永久": "$135",
  "青年義工(<25歲)": "免費",
  "青年家人義工(>25歲)": "免費",
  "社區義工": "免費",
})

let relationTable = ref([
  { 
    c_mem_id_1: latestMemberID,
    c_mem_id_2: "",
    relation: "",
    name: "",
    age: 0,
    d_birth: "",
    b_mem_type1: false,
    uuid: "",
    delete: false,
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
  c_emer_name: "",
  c_emer_rel: "",
  c_emer_tel1_1: "",
})

let memberInfo = ref({
  b_mem_type1: false,
  b_mem_type10: false,
  c_udf_1: "",
  c_update_user: username.value,
  d_enter_1: qdate.formatDate(Date.now(), "YYYY/MM/DD"),
  d_expired_1: "",
  d_update: qdate.formatDate(Date.now(), "YYYY/MM/DD"),
  d_write: qdate.formatDate(Date.now(), "YYYY/MM/DD"),
})

const age = computed(() => personalInfo.value.d_birth ? ageUtil.calculateAge(personalInfo.value.d_birth): 0)
const udf1List = computed(() => [
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
    inactive: age.value >= 25 || age.value == 0,
  },
  {
    label: "青年家人義工(>25歲)",
    value: "青年家人義工",
    inactive: age.value < 25 || age.value == 0,
  },
  {
    label: "社區義工",
    value: "社區義工",
  },
])
const expiryDate = computed(() => {
  if (
    is.object(memberInfo.value.c_udf_1) &&
    qdate.isValid(memberInfo.value.d_enter_1)
  ) {
    switch (memberInfo.value.c_udf_1.value) {
      case "個人會員":
        return qdate.formatDate(
            qdate.addToDate(memberInfo.value.d_enter_1, { years: 1 }),
            "YYYY/MM/DD"
          );
        break;
      case "永久會員":
      case "社區義工":
        return "3000/01/01";
        break;
      case "青年義工會員":
        if (!personalInfo.value.d_birth) {
          return "請輸入出生日期"
        } else {
          if (ageUtil.calculateAge(personalInfo.value.d_birth) >= 25) {
            return "已超過25歲"
          } else {
            return qdate.formatDate(
              qdate.addToDate(personalInfo.value.d_birth, { years: 25 }),
              "YYYY/MM/DD"
            )
          }
        }
        
        break;
      case "青年家人義工":
        if (ageUtil.calculateAge(personalInfo.value.d_birth) <= 25) {
          return "未滿25歲"
        } else {
          // set a temp expiry date, loop all related members
          let expiryDate = 0;
          if (relationTable.value.length > 0) {
            relationTable.value.forEach((data) => {
              if (ageUtil.calculateAge(data.d_birth) <= 24 && ageUtil.calculateAge(data.d_birth) >= 15) {
                let tempExpiryDate = qdate.formatDate(
                                      qdate.addToDate(data.d_birth, { years: 25 }),
                                      "YYYY/MM/DD"
                                    );
                  
                if (expiryDate == 0 || expiryDate < tempExpiryDate) {
                  expiryDate = tempExpiryDate
                }
              }
            })
          }
          return expiryDate == 0? "沒有關聯青年會員": expiryDate
        }
        break;
    }
  } else return "";
}) 

// callback functions
addMemberFromID_Completed((result) => {
  postCallback(result)
})

addMemberFromIDWithPayment_Completed((result) => {
  postCallback(result)
})

addMemberAndRelationFromIDUpdateRelatedYouthStatus_Completed((result) => {
  postCallback(result)
})

addMemberAndRelationFromIDUpdateRelatedYouthStatusWithPayment_Completed((result) => {
  postCallback(result)
})

addMemberAndRelationFromID_Completed((result) => {
  postCallback(result)
})

addMemberAndRelationFromIDWithPayment_Completed((result) => {
  postCallback(result)
})


// error handling
addMemberFromID_Error((error) => {
  logErrorMessage(error)
})

addMemberFromIDWithPayment_Error((error) => {
  logErrorMessage(error)
})

addMemberAndRelationFromIDUpdateRelatedYouthStatus_Error((error) => {
  logErrorMessage(error)
})

addMemberAndRelationFromIDUpdateRelatedYouthStatusWithPayment_Error((error) => {
  logErrorMessage(error)
})

addMemberAndRelationFromID_Error((error) => {
  logErrorMessage(error)
})

addMemberAndRelationFromIDWithPayment_Error((error) => {
  logErrorMessage(error)
})

function logErrorMessage(error) {
  $q.notify({
    message: "新增失敗，輸入的資料出錯！",
  })
}


// other functions
function postCallback(data) {
  const memberResponse = data.data.insert_Member_one;
  const relationResponse = data.data.insert_Relation
    ? data.data.insert_Relation.returning
    : [];
  const receiptNumber = data.data.insert_tbl_account_one?.c_receipt_no??""

  if (memberResponse.c_mem_id) {
    if (relationResponse.length > 0) {
      if (receiptNumber) {
        $q.notify({
          progress: true,
          message:
            "新增會員編號: " +
            memberResponse.c_mem_id +
            " 成功， " +
            relationResponse.length +
            "個關聯會員。",
          actions: [
            { label: '列印收據', color: 'yellow', handler: () => { printReceiptMember.value = memberResponse.c_mem_id; printReceiptModal.value = true } },
            { label: '關閉', color: 'white', handler: () => {  } }
          ]
        }, 5000)
      } else {
        $q.notify({
          message:
            "新增會員編號: " +
            memberResponse.c_mem_id +
            " 成功， " +
            relationResponse.length +
            "個關聯會員。",
        });
      }
    } else {
      if (receiptNumber) {
        $q.notify({
          progress: true,
          message: "新增會員編號: " + memberResponse.c_mem_id + " 成功.",
          actions: [
            { label: '列印收據', color: 'yellow', handler: () => { printReceiptMember.value = memberResponse.c_mem_id; printReceiptModal.value = true } },
            { label: '關閉', color: 'white', handler: () => {  } }
          ]
        }, 5000)
      } else {
        $q.notify({
          message: "新增會員編號: " + memberResponse.c_mem_id + " 成功.",
        });
      }
    }
  }

  // initialize data
  personalInfo.value = {
    c_name: "",
    c_name_other: "",
    c_sex: "",
    c_tel: "",
    c_mobile: "",
    d_birth: "",
    c_email: "",
    m_addscom: "",
    age: "",
    c_emer_name: "",
    c_emer_rel: "",
    c_emer_tel1_1: "",
  }

  memberInfo.value = {
    b_mem_type1: false,
    b_mem_type10: false,
    c_udf_1: "",
    c_update_user: username.value,
    d_enter_1: qdate.formatDate(Date.now(), "YYYY/MM/DD"),
    d_expired_1: "",
    d_update: qdate.formatDate(Date.now(), "YYYY/MM/DD"),
    d_write: qdate.formatDate(Date.now(), "YYYY/MM/DD"),
  }

  relationTable.value = [
    { 
      c_mem_id_1: latestMemberID,
      c_mem_id_2: "",
      relation: "",
      name: "",
      age: 0,
      d_birth: "",
      b_mem_type1: false,
      uuid: "",
      delete: false,
    },
  ]
  awaitServerResponse.value--;
}

function capitalize() {
  if (personalInfo.value.c_name_other != "") {
    const arr = personalInfo.value.c_name_other.split(" ");
    for (var i = 0; i < arr.length; i++) {
      arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
    }
    personalInfo.value.c_name_other = arr.join(" ");
  }
}

function updateType1Expire() {
  if (
    is.object(memberInfo.value.c_udf_1) &&
    qdate.isValid(memberInfo.value.d_enter_1)
  ) {
    switch (memberInfo.value.c_udf_1.value) {
      case "個人會員":
        memberInfo.value.d_expired_1 = qdate.formatDate(
            qdate.addToDate(memberInfo.value.d_enter_1, { years: 1 }),
            "YYYY/MM/DD"
          );
        break;
      case "永久會員":
      case "社區義工":
        memberInfo.value.d_expired_1 = "3000/01/01";
        break;
      case "青年義工會員":
        if (!personalInfo.value.d_birth) {
          memberInfo.value.d_expired_1 = "請輸入出生日期"
        } else {
          if (ageUtil.calculateAge(personalInfo.value.d_birth) >= 25) {
            memberInfo.value.d_expired_1 = "已超過25歲"
          } else {
            memberInfo.value.d_expired_1 = qdate.formatDate(
              qdate.addToDate(personalInfo.value.d_birth, { years: 25 }),
              "YYYY/MM/DD"
            )
          }
        }
        
        break;
      case "青年家人義工":
        if (ageUtil.calculateAge(personalInfo.value.d_birth) <= 25) {
          memberInfo.value.d_expired_1 = "未滿25歲"
        } else {
          // set a temp expiry date, loop all related members
          let expiryDate = 0;
          if (relationTable.value.length > 0) {
            relationTable.value.forEach((data) => {
              if (ageUtil.calculateAge(data.d_birth) <= 24 && ageUtil.calculateAge(data.d_birth) >= 15) {
                let tempExpiryDate = qdate.formatDate(
                                      qdate.addToDate(data.d_birth, { years: 25 }),
                                      "YYYY/MM/DD"
                                    );
                  
                if (expiryDate == 0 || expiryDate < tempExpiryDate) {
                  expiryDate = tempExpiryDate
                }
              }
            })
          }
          memberInfo.value.d_expired_1 = expiryDate == 0? "沒有關聯青年會員": expiryDate
        }
        break;
    }
  } else memberInfo.value.d_expired_1 = "";
}

function addMember() {
  // assign computed value to object
  memberInfo.value.d_expired_1 = expiryDate.value
  personalInfo.value.age = age.value
  
  let queryString;
  let memberRelation = ref([]);
  let receiptDescription = ref("")
  let price = ref(0)
  let remark = ref("")
  const related_ids = ref([])

  // error check before submit
  let valid = true
  relationTable.value.forEach((rel) => {
    if (rel.name != "" && rel.name != "無此人") {
      if (rel.relation) {
        memberRelation.value.push({
          c_mem_id_1: latestMemberID,
          c_mem_id_2: rel.c_mem_id_2,
          relation: rel.relation,
        })
        related_ids.value.push(rel.c_mem_id_2)
      } else {
        $q.notify({
          message: "請輸入關聯會員關係！",
          color: "negative",
          textColor: "white",
          icon: "error"
        })
        valid = false
      }
    }
  }); 

  if(!personalInfo.value.d_birth) {
    $q.notify({
      message: "請輸入出生日期！",
      color: "negative",
      textColor: "white",
      icon: "error"
    })
    valid = false
  }

  if(!memberInfo.value.c_udf_1) {
    $q.notify({
      message: "請輸入會藉！",
      color: "negative",
      textColor: "white",
      icon: "error"
    })
    valid = false
  }

  if(!is.date(expiryDate.value)) {
    $q.notify({
      message: "請選擇正確會藉！",
      color: "negative",
      textColor: "white",
      icon: "error"
    })
    valid = false
  }
  if (!valid) return

  switch(memberInfo.value.c_udf_1.value) {
    case "永久會員":
      receiptDescription.value = "永久會員會費"
      price.value = 135
      remark.value = "繳 付：永久會員會費"
      break
    case "個人會員":
      receiptDescription.value = "會員會費"
      price.value = 35
      remark.value = "繳 付：至" + qdate.formatDate(memberInfo.value.d_expired_1, "YYYY年MM月") + "之會費\r\n屆滿日期:" + qdate.formatDate(memberInfo.value.d_expired_1, "DD/MM/YYYY")
      break
  }

  const updateObject = ref({
    c_mem_id: latestMemberID,
    c_name: personalInfo.value.c_name,
    c_name_other: personalInfo.value.c_name_other,
    c_sex: personalInfo.value.c_sex,
    c_tel: personalInfo.value.c_tel,
    c_mobile: personalInfo.value.c_mobile,
    m_addscom: personalInfo.value.m_addscom,
    c_email: personalInfo.value.c_email,
    d_birth: personalInfo.value.d_birth,
    b_mem_type1: true,
    b_mem_type10: memberInfo.value.b_mem_type10,
    c_udf_1: memberInfo.value.c_udf_1.value,
    c_update_user: memberInfo.value.c_update_user,
    d_enter_1: memberInfo.value.d_enter_1,
    d_expired_1: memberInfo.value.d_expired_1,
    d_update: memberInfo.value.d_update,
    d_write: memberInfo.value.d_write,
    c_emer_name: personalInfo.value.c_emer_name,
    c_emer_rel: personalInfo.value.c_emer_rel,
    c_emer_tel1_1: personalInfo.value.c_emer_tel1_1,
  })

  const logObject = ref({
    "username": username.value,
    "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    "module": "會員系統",
    "action": "新增會員 " + latestMemberID.value,
  })

  const accountObject = ref({
    c_receipt_no: latestReceiptNO,
    d_create: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    i_receipt_type: 1, //type 1 = membership fee
    c_desc: receiptDescription.value,
    c_type: "新會員費",
    u_discount: 0,
    u_price_after_discount: price.value,
    c_cash_type: "Cash",
    c_cheque_no: "",
    m_remark: remark.value,
    c_mem_id: latestMemberID,
    c_user_id: username.value,
    c_name: personalInfo.value.c_name,
    b_cssa: false,
    b_refund: false,
    b_OtherIncome: false,
    b_clear: false,
    d_clear: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    i_prints: 0,
  })
  
  awaitServerResponse.value++;
  if (memberRelation.value.length == 0) { // no related member
    if (price.value == 0) { // free member
      addMemberFromID({
        memberObject: updateObject.value,
        logObject: logObject.value
      })
    } else { // paid member
      addMemberFromIDWithPayment({
        memberObject: updateObject.value,
        accountObject: accountObject.value,
        logObject: logObject.value
      })
    }
  } else { // has related member
    if (relationTable.value.findIndex((element) => element.age >= 15 && element.age <= 24 && element.b_mem_type1) != -1) {
      // if related member is youth, update this member b_mem_type10
      memberInfo.value.b_mem_type10 = true;
      updateObject.value.b_mem_type10 = true;
    }

    if (personalInfo.value.age >= 15 && personalInfo.value.age <= 24) { 
      // if this member is youth, update related member b_mem_type10
      if (price.value == 0) {
        // free member
        addMemberAndRelationFromIDUpdateRelatedYouthStatus({
          memberObject: updateObject.value,
          related_ids: related_ids.value,
          relationObjects: memberRelation.value,
          logObject: logObject.value
        })
      } else {
        // paid member
        addMemberAndRelationFromIDUpdateRelatedYouthStatusWithPayment({
          memberObject: updateObject.value,
          related_ids: related_ids.value,
          relationObjects: memberRelation.value,
          logObject: logObject.value,
          accountObject: accountObject.value,
        })
      }
    } else { // this member is not youth
      if (price.value == 0) {
        // free member
        addMemberAndRelationFromID({
          memberObject: updateObject.value,
          relationObjects: memberRelation.value,
          logObject: logObject.value,
        })
      } else {
        // paid member
        addMemberAndRelationFromIDWithPayment({
          memberObject: updateObject.value,
          relationObjects: memberRelation.value,
          logObject: logObject.value,
          accountObject: accountObject.value,
        })
      }
    }
  }
}
</script>
