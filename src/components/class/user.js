import {
  FireDB,
  FirebaseFunctions,
  usersCollection,
  leaveConfig,
} from "boot/firebase";
import { httpsCallable } from "@firebase/functions";
import {
  getDoc,
  doc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { date } from "quasar";

class User {
  constructor(o = {}) {
    this.leaveConfig = o.leaveConfig ? o.leaveConfig : undefined;
    this.balance = o.balance
      ? o.balance
      : {
          al: 0,
          sal: 0,
          ot: 0,
        };
    this.defaultSchedule = o.defaultSchedule
      ? o.defaultSchedule
      : [
          "",
          "",
          "",
          "",
          "",
          "1",
          "",
          "2",
          "3",
          "",
          "",
          "4",
          "",
          "5",
          "6",
          "",
          "7",
          "8",
          "9",
          "10",
          "11",
        ];
    this.email = o.email ? o.email : "n/a";
    this.employment = [];
    if (o.employment) {
      o.employment.forEach((e) => {
        let dateOfEntry, dateOfExit;
        if (
          e.dateOfEntry.seconds !== undefined &&
          e.dateOfEntry.nanoseconds !== undefined
        ) {
          dateOfEntry = e.dateOfEntry;
          dateOfExit =
            e.dateOfExit?.seconds !== undefined &&
            e.dateOfExit?.nanoseconds !== undefined
              ? e.dateOfExit
              : null;
        } else if (
          e.dateOfEntry._seconds !== undefined &&
          e.dateOfEntry._nanoseconds !== undefined
        ) {
          dateOfEntry = Timestamp.fromMillis(
            e.dateOfEntry._seconds * 1000 + e.dateOfEntry._nanoseconds / 1000000
          );
          dateOfExit = e.dateOfExit
            ? Timestamp.fromMillis(
                e.dateOfExit._seconds * 1000 +
                  e.dateOfExit._nanoseconds / 1000000
              )
            : null;
        } else {
          dateOfEntry = e.dateOfEntry
            ? Timestamp.fromDate(e.dateOfEntry)
            : new Timestamp();
          dateOfExit = e.dateOfExit ? Timestamp.fromDate(e.dateOfExit) : null;
        }

        this.employment.push({
          dateOfEntry: dateOfEntry,
          dateOfExit: dateOfExit,
          rank: e.rank ? e.rank : "tmp",
        });
      });
    } else {
      this.employment = [
        {
          dateOfEntry: Timestamp.fromDate(new Date()),
          dateOfExit: null,
          rank: "tmp",
        },
      ];
    }

    this.enable = o.hasOwnProperty("enable") ? o.enable : true;
    this.name = o.name ? o.name : "";
    this.order = o.order ? o.order : 0;
    this.privilege = o.privilege
      ? o.privilege
      : {
          scheduleModify: false,
          leaveManage: false,
          leaveApprove: false,
          logViewer: false,
          systemAdmin: false,
          sal: false,
          userManagement: false,
          tmp: true,
        };
    this.rank = o.rank ? o.rank : "tmp";
    this.uid = o.uid ? o.uid : "";
  }

  isValidEmployment(currentDate) {
    if (!this.enable) return false;
    if (!this.employment) return false;
    if (
      date.startOfDate(currentDate, "day") <
      date.startOfDate(this.getDateOfEntry(), "day")
    )
      return false;
    if (!this.employment[this.employment.length - 1].dateOfExit) return true;
    return date.getDateDiff(this.getDateOfExit(), currentDate, "day") > 0;
  }

  yearServed(currentDate) {
    let dateOfEntry = this.getDateOfEntry();

    return (
      date.getDateDiff(
        date.endOfDate(currentDate, "month"),
        dateOfEntry,
        "month"
      ) / 12
    );
  }

  getDateOfEntry() {
    return this.employment[0].dateOfEntry
      ? this.employment[0].dateOfEntry.toDate()
      : null;
  }

  getDateOfExit() {
    return this.employment[this.employment.length - 1].dateOfExit
      ? this.employment[this.employment.length - 1].dateOfExit.toDate()
      : null;
  }

  getEmploymentStatus(currentDate) {
    const isValidEmployment = this.isValidEmployment(currentDate);
    const dateOfEntry = this.getDateOfEntry();
    const dateOfExit = this.getDateOfExit();
    const yearServed = this.yearServed(currentDate);
    let rank;
    this.employment.forEach((e) => {
      if (
        date.getDateDiff(e.dateOfEntry.toDate(), currentDate) <= 0 &&
        (!e.dateOfExit ||
          date.getDateDiff(e.dateOfExit.toDate(), currentDate) > 0)
      ) {
        rank = e.rank;
      }
    });
    const status = {
      dateOfEntry: dateOfEntry,
      dateOfExit: dateOfExit,
      yearServed: yearServed,
      rank: rank,
    };
    return { isValidEmployment, status };
  }

  async setDateOfEntry(index, date) {
    const serverFunction = httpsCallable(
      FirebaseFunctions,
      "user-changeDateOfEntry"
    );
    return serverFunction({
      uid: this.uid,
      index: index,
      dateOfEntry: date,
    }).then((result) => {
      this.employment[index].dateOfEntry = new Timestamp(
        result.data.dateOfEntry._seconds,
        result.data.dateOfEntry._nanoseconds
      );
      return result;
    });
  }

  async setDateOfExit(index, date) {
    const serverFunction = httpsCallable(
      FirebaseFunctions,
      "user-changeDateOfExit"
    );
    return serverFunction({
      uid: this.uid,
      index: index,
      dateOfExit: date,
    }).then((result) => {
      this.employment[index].dateOfExit = new Timestamp(
        result.data.dateOfExit._seconds,
        result.data.dateOfExit._nanoseconds
      );
      return result;
    });
  }

  async delete() {
    const serverFunction = httpsCallable(FirebaseFunctions, "user-delete");
    return serverFunction({ uid: this.uid }).then((result) => {
      return result;
    });
  }

  async add() {
    const serverFunction = httpsCallable(
      FirebaseFunctions,
      "user-addTempStaff"
    );
    return serverFunction(this).then((result) => {
      return result;
    });
  }

  async setOrder(dir) {
    const serverFunction = httpsCallable(FirebaseFunctions, "user-changeOrder");
    return serverFunction({ uid: this.uid, dir: dir }).then((result) => {
      this.order = result.data.order;
      return result;
    });
  }

  async toggleEnable() {
    const serverFunction = httpsCallable(
      FirebaseFunctions,
      "user-toggleEnable"
    );
    return serverFunction({ uid: this.uid }).then((result) => {
      this.enable = result?.data ?? this.enable;
      return result;
    });
  }

  static async loadTempUsers() {
    let users = [];
    // get tmp users

    const userQuery = query(
      usersCollection,
      where("privilege.systemAdmin", "==", false),
      where("privilege.tmp", "==", true)
    );

    let userDoc = await getDocs(userQuery);

    userDoc.forEach((user) => {
      users.push(new User(user.data()));
    });

    return Promise.resolve(users);
  }

  static async loadPermUsers() {
    let users = [];
    // get tmp users

    const userQuery = query(
      usersCollection,
      where("privilege.systemAdmin", "==", false),
      where("privilege.tmp", "!=", true)
    );

    let userDoc = await getDocs(userQuery);

    userDoc.forEach((user) => {
      users.push(new User(user.data()));
    });

    return Promise.resolve(users);
  }

  static async loadUserByID(uid) {
    let d = (await getDoc(doc(FireDB, "users", uid))).data();
    if (d.employment[0].dateOfEntry != undefined) {
      d.employment[0].dateOfEntry = new Date(
        d.employment[0].dateOfEntry.toDate()
      );
    } else {
      d.employment[0].dateOfEntry = new Date();
    }

    if (d.employment[0].dateOfExit != undefined) {
      d.employment[0].dateOfExit = new Date(
        d.employment[0].dateOfExit.toDate()
      );
    } else {
      d.employment[0].dateOfExit = "";
    }

    let leaveConfigDoc = await getDoc(query(leaveConfig));
    const leaveData = leaveConfigDoc.data();
    const newStaff = typeof leaveData[d.uid][0].date == "string";

    let leaveConfigData = {
      rank: leaveData[d.rank],
      initialHoliday: {
        date: newStaff
          ? new Date(leaveData[d.uid][0].date)
          : leaveData[d.uid][0].date.toDate(),
        al: newStaff ? 0 : leaveData[d.uid][0].al,
        sal: newStaff
          ? 0
          : leaveData[d.uid][0].sal
          ? leaveData[d.uid][0].sal
          : undefined,
      },
    };

    return Promise.resolve(
      new User({
        ...d,
        leaveConfig: leaveConfigData,
      })
    );
  }

  static async loadUserByName(name) {
    const userQuery = query(usersCollection, where("name", "==", name));
    let userDoc = await getDocs(userQuery);
    let leaveConfigDoc = await getDoc(query(leaveConfig));

    let result = [];
    userDoc.forEach((user) => {
      let d = user.data();
      if (d.employment[0].dateOfEntry != undefined) {
        d.employment[0].dateOfEntry = new Date(
          d.employment[0].dateOfEntry.toDate()
        );
      } else {
        d.employment[0].dateOfEntry = new Date();
      }

      if (d.employment[0].dateOfExit != undefined) {
        d.employment[0].dateOfExit = new Date(
          d.employment[0].dateOfExit.toDate()
        );
      } else {
        d.employment[0].dateOfExit = "";
      }

      let leaveConfigData = {
        rank: leaveConfigDoc.data()[d.rank],
        initialHoliday: {
          date: leaveConfigDoc.data()[d.uid][0].date.toDate(),
          al: leaveConfigDoc.data()[d.uid][0].al,
          sal: leaveConfigDoc.data()[d.uid][0].sal
            ? leaveConfigDoc.data()[d.uid][0].sal
            : undefined,
        },
      };
      result.push(new User({ ...d, leaveConfig: leaveConfigData }));
    });

    if (result.length == 1) {
      return Promise.resolve(result[0]);
    } else return Promise.resolve(undefined);
  }
}

export default User;
