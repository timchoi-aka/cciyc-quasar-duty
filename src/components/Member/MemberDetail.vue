<template>
    <q-card>
        <q-card-section class="bg-primary text-white row text-h6">
          <div class="col-*">
            {{ member.c_mem_id }} 
            - 
            <span v-if="member.c_name != null">{{member.c_name}}</span>
            <span v-if="member.c_name_other != null">({{member.c_name_other}})</span>
            <span>[{{member.c_sex}}]</span>
          </div>
          <q-space/>
          <q-btn class="col-shrink bg-white text-negative" dense flat icon="delete" label="刪除"/>
          <q-btn class="col-shrink" dense flat icon="close" v-close-popup>
            <q-tooltip class="bg-white text-primary">關閉</q-tooltip>
          </q-btn>
        </q-card-section>
        <q-card-section class="row text-h6">
          <div class="col-2">出生日期<br/>{{qdate.formatDate(member.d_birth, "YYYY年MM月DD日")}}</div>
          <div class="col-1">年齡<br/>{{calculateAge(member.d_birth)}}</div>
          <div class="col-2">手提電話<br/>{{member.c_mobile}}</div>
          <div class="col-2">家居電話<br/>{{member.c_tel}}</div>
          <div class="col-2">地址<br/>{{member.m_addscom}}</div>
          <div class="col-2">電郵<br/>{{member.c_email}}</div>
        </q-card-section>
        <q-card-section class="row text-h6">
          <div class="col-2">緊急聯絡人<br/>{{member.c_emer_name}}</div>
          <div class="col-2">關係<br/>{{member.c_emer_rel}}</div>
          <div class="col-2">電話<br/>{{member.c_emer_tel1_1}}</div>
        </q-card-section>
        <q-card-section class="row text-h6">
          <div class="col-2">會籍<br/>{{member.c_udf_1}}
            (<q-icon v-if="member.b_mem_type1_valid" color="positive" name="check"/>
            <q-icon v-else color="negative" name="cancel"/>)
          </div>
          <div class="col-2">入會日期<br/>{{qdate.formatDate(member.d_enter_1, "YYYY年MM月DD日")}}</div>
          <div class="col-2">屆滿日期<br/>{{qdate.formatDate(member.d_expired_1, "YYYY年MM月DD日") == "3000年01月01日"? "永久":qdate.formatDate(member.d_expired_1, "YYYY年MM月DD日")}}</div>
          <div class="col-2">續會日期<br/>{{qdate.formatDate(member.d_renew_1, "YYYY年MM月DD日")}}</div>
          <div class="col-2">退會日期<br/>{{qdate.formatDate(member.d_exit_1, "YYYY年MM月DD日")}}</div>
          <div class="col-1">青年家人<br/>
            <q-icon v-if="member.b_mem_type_10" color="positive" name="check"/>
            <q-icon v-else color="negative" name="cancel"/>
          </div>
        </q-card-section>
        <q-card-section class="row text-h6">
          <div class="col-2">更新日期<br/>{{qdate.formatDate(member.d_update, "YYYY年MM月DD日")}}</div>
          <div class="col-2">更新職員<br/>{{member.c_update_user}}</div>
        </q-card-section>
      </q-card>
</template>

<script>
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import { FirebaseAuth } from "boot/firebase";
import { date as qdate} from "quasar";

export default defineComponent({
  name: "MemberDetail",
  props: {
    member: Object, 
  },
  data() {
    return {
        qdate: qdate,
    }
  },
  methods: {
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
  }
});
</script>