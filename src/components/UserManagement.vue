<template>
  <q-table
    flat
    :rows="users"
    :columns="tableFields"
    :hide-bottom="true"
    :pagination="pagination"
    color="primary"
    row-key="uid"
  >
    <template v-slot:body-cell-privilege_leaveApprove="props">
      <q-td :props="props">
        <q-btn
          round
          :color="props.value ? 'positive' : 'negative'"
          :label="props.value ? '有' : '沒有'"
          @click="changeLeaveApprove(props.key)"
        />
      </q-td>
    </template>
    <template v-slot:body-cell-privilege_sal="props">
      <q-td :props="props">
        <q-btn
          round
          :color="props.value ? 'positive' : 'negative'"
          :label="props.value ? '有' : '沒有'"
          @click="changeSal(props.key)"
        />
      </q-td>
    </template>
    <template v-slot:body-cell-privilege_scheduleModify="props">
      <q-td :props="props">
        <q-btn
          round
          :color="props.value ? 'positive' : 'negative'"
          :label="props.value ? '有' : '沒有'"
          @click="changeScheduleModify(props.key)"
        />
      </q-td>
    </template>
    <template v-slot:body-cell-privilege_userManagement="props">
      <q-td :props="props">
        <q-btn
          round
          :color="props.value ? 'positive' : 'negative'"
          :label="props.value ? '有' : '沒有'"
          @click="changeUserManagement(props.key)"
        />
      </q-td>
    </template>
    <template v-slot:body-cell-order="props">
      <q-td :props="props" class="content-center">
        <div class="q-mx-sm">
          {{ props.value }}
          <q-btn
            :disable="props.value == 1"
            round
            size="xs"
            color="positive"
            icon="keyboard_arrow_up"
            @click="changeOrder(props.key, 'UP')"
          />
          <q-btn
            :disable="props.value == this.users.length"
            round
            size="xs"
            color="negative"
            icon="keyboard_arrow_down"
            @click="changeOrder(props.key, 'DOWN')"
          />
        </div>
      </q-td>
    </template>
  </q-table>
</template>

<script>
import { usersCollection, FirebaseFunctions } from "boot/firebase";

export default {
  name: "UserManagement",
  data() {
    return {
      users: [],
      pagination: {
        sortBy: "order",
        rowsPerPage: 0,
      },
      tableFields: [
        {
          name: "name",
          label: "顯示名稱",
          field: "name",
          headerStyle: "font-size: 1.5vw;",
          style: "font-size: 1.2vw;",
        },
        {
          name: "privilege_leaveApprove",
          label: "批核假期",
          field: "privilege_leaveApprove",
          headerStyle: "font-size: 1.5vw;",
          style: "font-size: 1.2vw;",
        },
        {
          name: "privilege_sal",
          label: "特別年假",
          field: "privilege_sal",
          headerStyle: "font-size: 1.5vw;",
          style: "font-size: 1.2vw;",
        },
        {
          name: "privilege_scheduleModify",
          label: "修改更表",
          field: "privilege_scheduleModify",
          headerStyle: "font-size: 1.5vw;",
          style: "font-size: 1.2vw;",
        },
        {
          name: "privilege_userManagement",
          label: "用戶管理",
          field: "privilege_userManagement",
          headerStyle: "font-size: 1.5vw;",
          style: "font-size: 1.2vw;",
        },
        {
          name: "order",
          label: "排序",
          field: "order",
          sortOrder: "ad",
          sort: (a, b, rowA, rowB) => parseInt(a, 10) - parseInt(b, 10),
          sortable: true,
          headerStyle: "font-size: 1.5vw;",
          style: "font-size: 1.2vw;",
        },
        {
          name: "dateOfEntry",
          label: "入職日期",
          field: "dateOfEntry",
          format: (value) => (value ? this.formatDate(value) : ""),
          headerStyle: "font-size: 1.5vw;",
          style: "font-size: 1.2vw;",
        },
        {
          name: "actions",
          label: "預設更表",
          headerStyle: "font-size: 1.5vw;",
          style: "font-size: 1.2vw;",
        },
      ],
    };
  },
  methods: {
    async changeOrder(uid, dir) {
      // call https functions to change leaveApprove privilege
      const changeOrder = FirebaseFunctions.httpsCallable("user-changeOrder");
      changeOrder({ uid: uid, dir: dir }).then((result) => {
        this.users[this.users.findIndex((value) => value.uid == result.data.uid1)].order =
          result.data.order1;
        this.users[this.users.findIndex((value) => value.uid == result.data.uid2)].order =
          result.data.order2;
      });
    },
    async changeLeaveApprove(uid) {
      // call https functions to change leaveApprove privilege
      const toggleLeaveApprove = FirebaseFunctions.httpsCallable(
        "user-toggleLeaveApprove"
      );
      toggleLeaveApprove(uid).then((result) => {
        this.users[
          this.users.findIndex((value) => value.uid == uid)
        ].privilege_leaveApprove = result.data;
      });
    },
    async changeUserManagement(uid) {
      // call https functions to change leaveApprove privilege
      const toggleUserManagement = FirebaseFunctions.httpsCallable(
        "user-toggleUserManagement"
      );
      toggleUserManagement(uid).then((result) => {
        this.users[
          this.users.findIndex((value) => value.uid == uid)
        ].privilege_userManagement = result.data;
      });
    },
    async changeSal(uid) {
      // call https functions to change sal privilege
      const toggleSal = FirebaseFunctions.httpsCallable("user-toggleSal");
      toggleSal(uid).then((result) => {
        this.users[this.users.findIndex((value) => value.uid == uid)].privilege_sal =
          result.data;
      });
    },
    async changeScheduleModify(uid) {
      // call https functions to change scheduleModify privilege
      const toggleScheduleModify = FirebaseFunctions.httpsCallable(
        "user-toggleScheduleModify"
      );
      toggleScheduleModify(uid).then((result) => {
        this.users[
          this.users.findIndex((value) => value.uid == uid)
        ].privilege_scheduleModify = result.data;
      });
    },
    formatDate(date) {
      if (typeof date === "function") return;
      const data = new Date(date);
      const number = ["日", "一", "二", "三", "四", "五", "六"];
      const year = data.getFullYear();
      // const returnYear = number[year[0]] + number[year[1]] + number[year[2]] + number[year[3]];
      const month = data.getMonth() + 1;
      // const returnMonth = number[month];
      const day = data.getDate();
      // const returnDay = number[day];
      // const result = year + "年" + month + "月" + day + "日";
      const result = year + "-" + month + "-" + day + "(" + number[data.getDay()] + ")";
      // return date.toDateString();
      return result;
    },
  },
  async mounted() {
    const userDoc = await usersCollection
      .where("privilege.systemAdmin", "==", false)
      .get();
    userDoc.forEach((user) => {
      let d = user.data();
      if (d.dateOfEntry != undefined) {
        d.dateOfEntry = new Date(d.dateOfEntry.toDate());
      } else {
        d.dateOfEntry = new Date();
      }

      this.users.push({
        name: d.name,
        uid: d.uid,
        privilege_leaveApprove: d.privilege.leaveApprove,
        privilege_sal: d.privilege.sal,
        privilege_scheduleModify: d.privilege.scheduleModify,
        privilege_userManagement: d.privilege.userManagement,
        order: d.order,
        dateOfEntry: d.dateOfEntry,
      });
    });
  },
};
</script>

<style scoped>
th {
  text-align: center;
}
</style>
