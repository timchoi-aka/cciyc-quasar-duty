import {
  scheduleCollection,
  leaveCollection,
  FirebaseFunctions,
  usersCollection,
  sessionCollection,
} from "boot/firebase";
import { httpsCallable } from "@firebase/functions";
import {
  getDoc,
  doc,
  getDocs,
  query,
  where,
  Timestamp,
  onSnapshot,
} from "@firebase/firestore";
import User from "components/class/user.js";
import { unref, ref } from "vue";
import { date as qdate } from "quasar";

class Duty {
  constructor(o = {}) {
    (this.uid = o.uid ? ref(o.uid) : ref(null)),
      (this.name = o.name ? ref(o.name) : ref(null)),
      (this.defaultSchedule = o.defaultSchedule
        ? ref(o.defaultSchedule)
        : ref([]));
    this.schedule = ref([]);
    //this.tableResult = ref([])
    /* schedule array format
    {
      date: Date,   // Timestamp.toDate()
      slot: String, // slot_a, slot_b, slot_c
      type: String, // 1,2,3,4,5,6,7,8,9,10,11,AL,SL,OT, or others
    }
    */
  }

  setSchedule(s) {
    this.schedule.value = s;
  }

  async loadDuty(startDate, endDate) {
    let schedule = [];
    //let tableResult = []
    const scheduleDocQuery = query(
      scheduleCollection,
      where("date", ">=", startDate),
      where("date", "<=", endDate),
      where("uid", "==", this.uid.value)
    );

    return getDocs(scheduleDocQuery).then((scheduleDoc) => {
      scheduleDoc.forEach((s) => {
        schedule.push({
          [qdate.formatDate(s.data().date.toDate(), "YYYY-MM-DD") +
          "|" +
          s.data().slot]: s.data().type,
        });
      });

      this.setSchedule(schedule);
      //console.log("this: " + JSON.stringify(this))
      /*this.setTableResult({
        uid: this.uid.value,
        name: this.name.value,
        defaultSchedule: this.defaultSchedule.value,
        ...schedule.reduce)
        */
      return Promise.resolve(this);
    });
  }

  /*
  async setDateOfEntry(index, date) {
    const serverFunction = httpsCallable(FirebaseFunctions, "user-changeDateOfEntry")
    return serverFunction({ uid: this.uid, index: index, dateOfEntry: date }).then((result) => {
      this.employment[index].dateOfEntry = new Timestamp(result.data.dateOfEntry._seconds, result.data.dateOfEntry._nanoseconds)
      return result
    });
  }

  async setDateOfExit(index, date) {
    const serverFunction = httpsCallable(FirebaseFunctions, "user-changeDateOfExit")
    return serverFunction({ uid: this.uid, index: index, dateOfExit: date }).then((result) => {
      this.employment[index].dateOfExit = new Timestamp(result.data.dateOfExit._seconds, result.data.dateOfExit._nanoseconds)
      return result
    });
  }
  */

  static async deleteSchedule(docid) {
    const serverFunction = httpsCallable(
      FirebaseFunctions,
      "schedule-updateSchedule"
    );
    return serverFunction({
      uid: this.uid,
      //date: scheduleDate[0],
      //slot: scheduleDate[1],
      //type: editingRow.value[obj.name],
    }).then((result) => {
      return result;
    });
  }

  static async updateSchedule(payload) {
    const serverFunction = httpsCallable(
      FirebaseFunctions,
      "schedule-updateSchedule"
    );
    return serverFunction(payload).then((result) => {
      return result;
    });
  }
  /*
  async add() {
    const serverFunction = httpsCallable(FirebaseFunctions, "user-addTempStaff")
    return serverFunction(this).then((result) => {
      return result
    });
  }

  async setOrder(dir) {
    const serverFunction = httpsCallable(FirebaseFunctions, "user-changeOrder")
    return serverFunction({ uid: this.uid, dir: dir }).then((result) => {
      this.order = result.data.order
      return result
    });
  }

  async toggleEnable() {
    const serverFunction = httpsCallable(FirebaseFunctions, "user-toggleEnable")
    return serverFunction({ uid: this.uid }).then((result) => {
      this.enable =!this.enable
      return result
    });
  }

  async load(uid) {
    getDoc(doc(FireDB, "users", uid)).then((user) => {
      let d = user.data();
      if (d.employment[0].dateOfEntry != undefined) {
        d.employment[0].dateOfEntry = new Date(d.employment[0].dateOfEntry.toDate());
      } else {
        d.employment[0].dateOfEntry = new Date();
      }

      if (d.employment[0].dateOfExit != undefined) {
        d.employment[0].dateOfExit = new Date(d.employment[0].dateOfExit.toDate());
      } else {
        d.employment[0].dateOfExit = "";
      }

      this.name = d.name
      this.email = d.email
      this.uid = d.uid
      this.order = d.order
      this.privilege = d.privilege
      this.balance = d.balance
      this.rank = d.rank
      this.enable = d.enable
      this.employment = d.employment
      this.defaultSchedule = d.defaultSchedule
      this.salDeadline = d.salDeadline? d.salDeadline.toDate(): undefined

      return Promise.resolve(this)
    })
  }

  static async loadTempUsers() {
    let users = [];
    // get tmp users

    const userQuery = query(usersCollection,
      where("privilege.systemAdmin", "==", false),
      where("privilege.tmp", "==", true)
    )

    let userDoc = await getDocs(userQuery)

    userDoc.forEach((user) => {
      users.push(new User(user.data()));
    })

    return Promise.resolve(users)
  }

  static async loadPermUsers() {
    let users = [];
    // get tmp users

    const userQuery = query(usersCollection,
      where("privilege.systemAdmin", "==", false),
      where("privilege.tmp", "!=", true)
    )

    let userDoc = await getDocs(userQuery)

    userDoc.forEach((user) => {
      users.push(new User(user.data()));
    })

    return Promise.resolve(users)
  }
  */
}

export default Duty;
