<template>
  <q-page>
    <div v-if="isLeaveApprove" class="row q-my-sm">
      <div class="col-1 col-xs-4 col-sm-2 col-md-2">
        <q-btn
          size="lg"
          outline
          color="primary"
          class="q-mx-md q-pa-sm"
          v-print="printObj"
          >列印</q-btn
        >
      </div>
      <q-select
        class="offset-1 col-1 col-xs-4 col-sm-3 col-md-2"
        :options="userList"
        v-model="selectedUser"
        label="員工"
        hide-bottom-space
        @update:model-value="
          (val) => {
            reportUID = val.value;
            reportName = val.label;
          }
        "
      />
    </div>
    <div id="printMe">
      <OT v-bind:renderUID="reportUID" v-bind:renderName="reportName" :key="reportUID" />
    </div>
  </q-page>
</template>

<script>
import OT from "components/Overtime/OTSummary";
import print from "vue3-print-nb";
import { useStore } from "vuex";
import { computed, ref } from "vue";
import { usersCollection } from "boot/firebase";

export default {
  name: "OTView",
  components: {
    OT,
  },
  directives: {
    print,
  },
  data() {
    return {
      selectedUser: [],
      reportUID: this.uid,
      reportName: this.username,
      staffOption: {
        value: "",
        label: "",
      },
      printObj: {
        id: "printMe",
        preview: true,
        previewTitle: "列印預覽",
        popTitle: "CCIYC 超時補假結餘總表",
        extraCss:
          "https://cdn.bootcdn.net/ajax/libs/animate.css/4.1.1/animate.compat.css, https://cdn.bootcdn.net/ajax/libs/hover.css/2.3.1/css/hover-min.css,",
        extraHead: '<meta http-equiv="Content-Language" content="en"/>',
      },
      userList: [
        {
          value: "",
          label: "",
        },
      ],
    };
  },
  methods: {},
  computed: {},
  async mounted() {
    const userDoc = await usersCollection
      .where("enable", "==", true)
      .where("rank", "!=", "tmp")
      .orderBy("rank")
      .get();
    userDoc.forEach((user) => {
      if (!user.data().privilege.systemAdmin) {
        this.userList.push({
          value: user.data().uid,
          label: user.data().name,
        });
      }
    });
  },
  setup() {
    const $store = useStore();

    return {
      isLeaveManage: computed(() => $store.getters["userModule/getLeaveManage"]),
      isLeaveApprove: computed(() => $store.getters["userModule/getLeaveApprove"]),
      uid: computed(() => $store.getters["userModule/getUID"]),
      username: computed(() => $store.getters["userModule/getUsername"]),
    };
  },
};
</script>

<style scoped></style>
