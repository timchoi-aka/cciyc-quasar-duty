<template>
    <q-card>
      <q-card-section class="bg-primary text-white row">
        <q-btn icon="print" flat v-print="printObj"/>
        <q-space/>
        <q-btn icon="close" flat align="right" v-close-popup/>
      </q-card-section>
      <!-- printout -->
      
      <q-card-section id="printMe" class="print-area">
        <div class="col-12 row items-center">
          <img src="~assets/cciyc_logo.svg" style="width: 90px; height: 90px;" class="col-1"/>
          <div class="print-title col-7 row q-mx-md items-center">
            <div class="col-12">長洲鄉事委員會青年綜合服務中心</div>
            <div class="col-12">Cheung Chau Rural Committee Integrated Youth Centre</div>
          </div>
        </div>
        <div class="col-12 text-body row justify-around q-py-none q-mt-none q-mb-lg text-bold highlight_1" style="text-decoration: underline">工作計劃表</div>
        <div class="col-12 text-body row justify-around q-py-none q-my-none">
          <div class="col-1">名稱：</div><div class="col-5" style="border-bottom: 1px solid;">{{props.modelValue.c_act_name}} ({{ props.modelValue.c_act_code }})</div><div class="col-1">類別：</div><div class="col-5" style="border-bottom: 1px solid;">{{props.modelValue.c_type}}</div>
          <div class="col-1">性質：</div><div class="col-11" style="border-bottom: 1px solid;">{{props.modelValue.c_nature}}</div>
          <div class="col-1">大類：</div><div class="col-5" style="border-bottom: 1px solid;">{{props.modelValue.c_group1}}</div><div class="col-1">細類：</div><div class="col-5" style="border-bottom: 1px solid;">{{props.modelValue.c_group2}}</div>
        </div>
        <q-separator class="q-mt-md"/>
        <div class="col-12 text-body row justify-around q-py-none q-my-none">
          <div class="col-12 row q-mt-md">
            <div class="highlight_2">舉辦日期</div>
            <div class="col-12" style="border-bottom: 1px solid;">計劃：{{ props.modelValue.Event_to_Evaluation[0].plan_start_date }} 至 {{  props.modelValue.Event_to_Evaluation[0].plan_end_date }} {{ props.modelValue.Event_to_Evaluation[0].plan_start_time }} - {{ props.modelValue.Event_to_Evaluation[0].plan_end_time }} (共{{ props.modelValue.Event_to_Evaluation[0].plan_sessions }}節)</div>
          </div>
          <div class="col-1">地點：</div><div class="col-5" style="border-bottom: 1px solid;">{{props.modelValue.c_dest}}</div><div class="col-1">對象：</div><div class="col-5" style="border-bottom: 1px solid;">{{props.modelValue.c_whojoin}}</div>
          <div class="col-6 row q-pr-md">
            <div>工作目的：</div><div class="col" style="border-bottom: 1px solid;">{{props.modelValue.Event_to_Evaluation[0].objective}}</div>
          </div>
          <div class="col-6 row">
            <div>工作內容：</div><div class="col" style="border-bottom: 1px solid;">{{props.modelValue.Event_to_Evaluation[0].objective_detail}}</div>
          </div>
          <div class="col-1">合辦：</div><div class="col-5" style="border-bottom: 1px solid;">{{props.modelValue.Event_to_Evaluation[0].partner_agency}}</div><div class="col-2">合辦聯絡人：</div><div class="col-4" style="border-bottom: 1px solid;">{{props.modelValue.Event_to_Evaluation[0].partner_name}} - {{props.modelValue.Event_to_Evaluation[0].partner_phone}}</div>
          <div class="col-1">導師：</div><div class="col-5" style="border-bottom: 1px solid;">{{props.modelValue.Event_to_Evaluation[0].tutor_name}}</div><div class="col-2">導師電話：</div><div class="col-4" style="border-bottom: 1px solid;">{{props.modelValue.Event_to_Evaluation[0].tutor_phone}}</div>
          <div class="col-2">協助義工：</div><div class="col-10" style="border-bottom: 1px solid;">{{props.modelValue.Event_to_Evaluation[0].eval_volunteer_count}}</div>
          <div class="col-2">青年節數：</div><div class="col-4" style="border-bottom: 1px solid;">計劃：{{props.modelValue.Event_to_Evaluation[0].plan_attend_session_youth}}</div><div class="col-2">青年人次：</div><div class="col-4" style="border-bottom: 1px solid;">計劃：{{props.modelValue.Event_to_Evaluation[0].plan_attend_headcount_youth}}</div>
        </div>
        <q-separator class="q-mt-md"/>
        <div class="col-12 text-body row justify-around q-py-none q-my-none">
          <div class="col-12 highlight_2 q-mt-md">財務狀況</div>
          <q-table 
            class="col-5"
            title="收入"
            title-class="text-body"
            dense
            flat
            bordered
            :hide-bottom="true"
            color="primary"
            row-key="account_uuid"
            :rows="IncomeAccount"
            :columns="columns">
            <!-- bottom total row -->
            <template v-slot:bottom-row="props">
              <q-tr style="text-align: center; font-size: 0.4rem;">
                <q-td
                  v-for="index in props.cols.length"
                >
                  {{ IncomeAccount.reduce((a,v) => v[props.cols[index-1].name]? is.number(v[props.cols[index-1].name])? a += v[props.cols[index-1].name]: '總數' : a += 0,0) }}
                </q-td>
              </q-tr>
            </template>
          </q-table>
          <q-space/>
          <q-table 
            class="col-5"
            title="支出"
            title-class="text-body"
            dense
            flat
            bordered
            :hide-bottom="true"
            color="primary"
            row-key="account_uuid"
            :rows="ExpenseAccount"
            :columns="columns">
            <!-- bottom total row -->
            <template v-slot:bottom-row="props">
              <q-tr style="text-align: center; font-size: 0.4rem;">
                <q-td
                  v-for="index in props.cols.length"
                >
                  {{ ExpenseAccount.reduce((a,v) => v[props.cols[index-1].name]? is.number(v[props.cols[index-1].name])? a += v[props.cols[index-1].name]: '總數' : a += 0,0) }}
                </q-td>
              </q-tr>
            </template>  
          </q-table>
        </div>
        <q-separator class="q-my-md"/>
        <div class="col-12 text-body row justify-around q-py-none q-my-none">
          <div class="col-12 highlight_2 q-mt-md row"><span class="col-2">備註：</span><span class="col-9" style="display: block; border-bottom: 1px solid;">{{ props.modelValue.remarks }}</span></div>
          <div class="col-12 highlight_2 q-mt-md">簽署</div>
          <div class="col-12 row">
            <div class="col-12 row q-my-md">
              <div>負責職員簽署：</div>
              <div class="col-2" style="display: block; border-bottom: 1px solid;"></div>
              <div>（{{props.modelValue.c_respon}}）</div>
              <div class="q-ml-md">日期：</div>
              <div class="col-2" style="display: block; border-bottom: 1px solid;"></div>
              
            </div>
            <div class="col-12 row q-my-md">
              <div>中心主任審閱：</div>
              <div class="col-2" style="display: block; border-bottom: 1px solid;"></div>
              <div>（{{props.modelValue.Event_to_Evaluation[0].ic}}）</div>
              <div class="q-ml-md">日期：</div>
              <div class="col-2" style="display: block; border-bottom: 1px solid;"></div>
            </div>
          </div>
        </div>  
      </q-card-section>
    </q-card>
  </template>
  
  <script setup>
  import print from "vue3-print-nb";
  import { ref, computed } from "vue"
  import { is } from "quasar"
  const printObj = ref({
    id: "printMe",
    preview: false,
  })
  
  const props = defineProps({
    modelValue: {
      type: Object,
      Required: true,
    }
  })
  
  const IncomeAccount = computed(() => {
    if (props.modelValue && props.modelValue.Event_to_Evaluation[0].Evaluation_to_Account) {
      let res = []
      props.modelValue.Event_to_Evaluation[0].Evaluation_to_Account.filter((v) => v.type.trim() == "收入").forEach((e) => {
        let i = res.findIndex((element) => element.description == e.description.trim())
        if (i < 0) {
          res.push({
            description: e.description.trim(),
            [e.planeval.trim()]: e.amount
          })
        } else {
          res[i][e.planeval.trim()] = res[i][e.planeval.trim()]? res[i][e.planeval.trim()] + e.amount: e.amount
        }
      })
      return res
     } else return []
  })
  
  const ExpenseAccount = computed(() => {
    if (props.modelValue && props.modelValue.Event_to_Evaluation[0].Evaluation_to_Account) {
      let res = []
      props.modelValue.Event_to_Evaluation[0].Evaluation_to_Account.filter((v) => v.type.trim() == "支出").forEach((e) => {
        let i = res.findIndex((element) => element.description == e.description.trim())
        if (i < 0) {
          res.push({
            description: e.description.trim(),
            [e.planeval.trim()]: e.amount
          })
        } else {
          res[i][e.planeval.trim()] = res[i][e.planeval.trim()]? res[i][e.planeval.trim()] + e.amount: e.amount
        }
      })
      return res
     } else return []
  })
  
  const columns = [
    {
      name: "description",
      label: "項目",
      field: "description",
      style: "text-align: center;",
      headerClasses: "headerClass text-body",
      headerStyle: "text-align: center;",
      classes: "text-body"
    },
    {
      name: "計劃",
      label: "計劃",
      field: "計劃",
      style: "text-align: center;",
      headerClasses: "headerClass text-body",
      headerStyle: "text-align: center;",
      classes: "text-body",
      format: (val) => val? val: 0
    },
  ]
  </script>
  
  <script>
  import print from "vue3-print-nb";
  
  export default {
    name: "PrintPlanEvaluation",
    directives: {
      print,
    },
  }
  </script>
  
  <style lang="scss" scoped>
  @media screen {
    div {
      line-height: 2rem;
    }
    .hideOnScreen {
      display: none
    }
  
    .print-area {
      font-size: 1rem;
    }
  
    .highlight_1 {
      font-size: 2rem;
    }
  
    .headerClass {
      font-weight: bold; 
    }

    .table-title {
      font-size: 10px;
      color: red;
    }
  }
  
  @media print {
    @page {
      size: landscape;
    }
    
    div {
      line-height: 0.6rem;
    }
    .hideOnPrint {
      display: none
    }
    .print-area { 
      margin: 30px;
      border: none;
    }
    .print-title {
      font-size: 0.4rem;
      line-height: 25px;
    }
  
    .highlight_1 {
      font-size: 0.6rem;
    }
  
    .headerClass {
      font-weight: bold; 
    }
   
  }
  </style>