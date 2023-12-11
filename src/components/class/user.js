import { FireDB, FirebaseFunctions, usersCollection } from "boot/firebase";
import { httpsCallable } from "@firebase/functions";
import { getDoc, doc, getDocs, query, where, Timestamp } from "firebase/firestore";

class User {
  constructor(o = {}) {
    this.balance = o.balance? o.balance: {
      al: 0,
      sal: 0,
      ot: 0
    }
    this.defaultSchedule = o.defaultSchedule? o.defaultSchedule: [
      "", "", "", "", "", "1", "", "2", "3", "", "", "4", "", "5", "6", "", "7", "8", "9", "10", "11",
    ]
    this.email = o.email? o.email: "n/a"
    this.employment = []
    if (o.employment) {
      o.employment.forEach((e) => {
        this.employment.push({
          dateOfEntry: e.dateOfEntry? e.dateOfEntry._seconds? new Timestamp(e.dateOfEntry._seconds, e.dateOfEntry._nanoseconds): e.dateOfEntry: new Timestamp(),
          dateOfExit: e.dateOfExit? e.dateOfExit._seconds? new Timestamp(e.dateOfExit._seconds, e.dateOfExit._nanoseconds): e.dateOfExit: null,
          rank: e.rank? e.rank: "tmp"
        })
      })
    } else {
      this.employment = [{
        dateOfEntry: Timestamp.fromDate(new Date()),
        dateOfExit: null,
        rank: "tmp"
      }]
    }

    this.enable = o.enable? o.enable: true
    this.name = o.name? o.name: ""
    this.order = o.order? o.order: 0
    this.privilege = o.privilege? o.privilege: {
      scheduleModify: false,
      leaveManage: false,
      leaveApprove: false,
      logViewer: false,
      systemAdmin: false,
      sal: false,
      userManagement: false,
      tmp: true,
    }
    this.rank = o.rank? o.rank: "tmp"
    this.uid = o.uid? o.uid: ""
  }

  isValidEmployment() {
    if (!this.enable) return false
    if (!this.employment) return false
    if (!this.employment[this.employment.length-1].dateOfExit) return true

    return this.employment[this.employment.length-1].dateOfExit.toDate() > new Date()
  }

  getDateOfEntry() {
    return this.employment[this.employment.length-1].dateOfEntry.toDate()
  }

  getDateOfExit() {
    return this.employment[this.employment.length-1].dateOfExit? this.employment[this.employment.length-1].dateOfExit.toDate(): undefined
  }

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

  async delete() {
    const serverFunction = httpsCallable(FirebaseFunctions, "user-delete")
    return serverFunction({ uid: this.uid }).then((result) => {
      return result
    });
  }

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
}

export default User
