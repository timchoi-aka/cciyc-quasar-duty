<!-- TODO print receipt-->
<!-- TODO check form before submit -->
<template class="q-mb-md">
  <!-- loading dialog -->
  <q-dialog v-model="waitingAsync" position="bottom">
    <LoadingDialog message="處理中" />
  </q-dialog>

  <q-dialog v-model="receipt" class="q-ma-md-none q-pa-md-none">
    <q-card class="receipt q-ma-md-none q-pa-md-none">
      <q-card-section class="bg-primary row">
        <q-space/>
        <q-btn icon="print" flat class="bg-primary text-white" v-print="printObj">
          <q-tooltip class="bg-white text-primary">列印</q-tooltip>  
        </q-btn>
      </q-card-section>
      <!--<q-card-section class="row wrap justify-center q-my-none"> -->
      <div id="printMe" class="row wrap justify-center q-my-none" style="font-size: 3px;">
        <div class="row col-12"><span class="text-bold">長洲鄉事委員會青年綜合服務中心</span></div>
        <div class="row col-12">CHEUNG CHAU RURAL COMMITTEE INTEGRATED YOUTH CENTRE</div>
        <div class="row col-12">地址 Address: 長洲東灣道 Tung Wan Road, Cheung Chau</div>
        <div class="row col-12"><span class="q-mx-sm">電話 Tel: 2981 1484</span><span class="q-mx-sm">yc@cciyc.com</span><span class="q-mx-sm">www.cciyc.com</span></div>
        <div class="row col-12"><span class="text-bold">正式收據 OFFICIAL RECEIPT</span></div>
        <div class="row col-12"><span class="text-center q-mx-lg">收據編號 Receipt No:</span></div>
        <div class="row col-12"><span class="q-mx-lg text-center">日期 Date:</span><span class="q-mx-lg text-center">Copy:</span></div>
        <div class="row col-12">
          <span class="col-shrink">
            <div>茲收到</div>
            <div>Received From</div>
          </span>
          <span class="col-shrink">Username</span>
        </div>
        <div class="row col-12">
          <span class="col-shrink">
            <div>港幣</div>
            <div>the sum of HK dollars</div>
          </span>
          <span class="col-shrink">Amount</span>
        </div>
        <div class="row col-12">
          <span class="col-shrink">
            <div>支付</div>
            <div>being payment for</div>
          </span>
          <span class="col-shrink">Item</span>
        </div>
        <div class="row col-12">
          <span class="col-shrink">
            <div>經手人</div>
            <div>issued by</div>
          </span>
          <span class="col-shrink">Item</span>
        </div>
        <div class="row col-12">收據字體會退色，若需要保留，請自行影印。</div>
        <div class="row col-12 wrap">The receipt will eventually fade out.  Please make a photocopy for a more lasting document.</div>
        <div class="row col-12">繳付：itemname</div>
        <div class="row col-12">會員類別：membertype</div>
        <div class="row col-12">屆滿日期：expirydate</div>
      <!--</q-card-section> -->
      </div>
    </q-card>
  
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
      color="secondary"
      icon="money"
      label="列印收據"
      :disable="memberInfo.c_udf_1 && !['個人','永久'].includes(memberInfo.c_udf_1.label)"
      @click="printReceipt"
    />
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
import { ref, computed } from "vue";
import print from "vue3-print-nb";
import { useStore } from "vuex";
import { date as qdate, is } from "quasar";
import LoadingDialog from "components/LoadingDialog.vue";
import { GET_NAME_FROM_IDS, LATEST_MEMBER_ID } from "/src/graphQueries/Member/query.js";
import {
  ADD_MEMBER_FROM_ID,
  ADD_MEMBER_AND_RELATION_FROM_ID,
  ADD_MEMBER_AND_RELATION_FROM_ID_UPDATE_RELATED_YOUTH_STATUS
} from "/src/graphQueries/Member/mutation.js";
import {useSubscription} from "@vue/apollo-composable"

export default {
  name: "MemberAdd",
  computed: {
    waitingAsync() {
      return this.awaitServerResponse > 0 ? true : false;
    },
  },
  directives: {
    print,
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

    const personalInfo = ref({
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

    function capitalize() {
      if (personalInfo.value.c_name_other != "") {
        const arr = personalInfo.value.c_name_other.split(" ");
        for (var i = 0; i < arr.length; i++) {
          arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
        }
        personalInfo.value.c_name_other = arr.join(" ");
      }
    }

    function calculateAge(value) {
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
    }

    return {
      username: computed(() => $store.getters["userModule/getUsername"]),
      latestMemberID: computed(() => result.value? parseInt(result.value.Member[0].c_mem_id)+1: []),
      loading,
      capitalize,
      calculateAge,
      personalInfo,
      awaitServerResponse: ref(0),
      relationOptions: ["父母子女", "兄弟姐妹", "其他親人"],
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
      relationTable: ref([
        {
          c_mem_id_1: "",
          c_mem_id_2: "",
          targetName: "",
          relation: "",
        },
      ]),
    };
  },
  methods: {
    printReceipt() {
      this.receipt = true
    },
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
          this.relationTable[index].age = this.calculateAge(getNameFromID[0].d_birth)
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
        if (this.relationTable.findIndex((element) => element.age >= 15 && element.age <= 24 && element.b_mem_type1) != -1) {
          this.memberInfo.b_mem_type10 = true;
        }

        if (this.personalInfo.age >= 15 && this.personalInfo.age <= 24) {
          queryString = ADD_MEMBER_AND_RELATION_FROM_ID_UPDATE_RELATED_YOUTH_STATUS
        } else {
          queryString = ADD_MEMBER_AND_RELATION_FROM_ID;
        }
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
            b_mem_type10: this.memberInfo.b_mem_type10,
            c_udf_1: this.memberInfo.c_udf_1.value,
            c_update_user: this.memberInfo.c_update_user,
            d_enter_1: this.memberInfo.d_enter_1,
            d_expired_1: this.memberInfo.d_expired_1,
            d_update: this.memberInfo.d_update,
            d_write: this.memberInfo.d_write,
            relationObjects: memberRelation,
            related_ids: memberRelation.map(({c_mem_id_2})=>c_mem_id_2),
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
            b_mem_type10: false,
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
      qdate: qdate,
      receipt: true,
      printObj: {
        id: "printMe",
        preview: true,
        previewTitle: "列印預覽", // The title of the preview window. The default is 打印预览
        popTitle: "收據",
        extraCss:
          "https://cdn.bootcdn.net/ajax/libs/animate.css/4.1.1/animate.compat.css, https://cdn.bootcdn.net/ajax/libs/hover.css/2.3.1/css/hover-min.css,",
        extraHead: '<meta http-equiv="Content-Language" content="en"/>',
      },
      memberInfo: {
        b_mem_type1: false,
        b_mem_type10: false,
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

<style>
.receipt {
  width: 90mm;
  height: 153mm;
}


  @page {
    size: 30mm 50.8mm portrait;
    margin: 0;
    zoom: 50%;
  }




</style>