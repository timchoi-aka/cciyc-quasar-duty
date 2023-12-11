import { FireDB, FirebaseFunctions, healthcareCollection } from "boot/firebase";
import { httpsCallable } from "@firebase/functions";
import { getDoc, doc, getDocs, query, where, Timestamp } from "firebase/firestore";

class Healthcare {
  constructor(o = {}) {
    this.amount = o.amount? o.amount: 0
    this.date = o.date? o.date: null
    this.remarks = o.remarks? o.remarks: []
    this.status = o.status? o.status: null
    this.uid = o.uid? o.uid: null
    this.username = o.username? o.username: null
  }

  getDate() {
    return this.date? this.date.toDate(): null
  }

  setDate(date) {
    this.date = Timestamp.fromDate(date)
  }

  static async loadApproved(uid, periodStart, periodEnd) {
    let HCQuery;
    let start = Timestamp.fromDate(periodStart)
    let end = Timestamp.fromDate(periodEnd)
    if (uid) {
      HCQuery = query(healthcareCollection,
        where("uid", "==", uid.value),
        where("date", ">=", start),
        where("date", "<=", end),
        where("status", "==", "批准"),
      )
    } else {
      HCQuery = query(healthcareCollection,
        where("date", ">=", start),
        where("date", "<=", end),
        where("status", "==", "批准"),
      )
    }

    return new Promise((resolve, reject) => {
      getDocs(HCQuery).then((docs) => {
        let result = []
        docs.forEach((doc) => {
          if (doc.id != "config") {
           result.push(new Healthcare(doc.data()))
          }
        })
        resolve(result)
      })
    })
  }
}

export default Healthcare
