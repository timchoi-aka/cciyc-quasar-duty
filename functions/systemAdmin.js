/* eslint-disable max-len */
const {functions, FireDB} = require("./fbadmin");
const {formatDate} = require("./utilities");

// upgrade user privilege object
exports.upgradePrivilege = functions.https.onCall(async (data, context) => {
  // only authenticated users can run this
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add requests",
    );
  }

  const users = [];
  const userDoc = await FireDB.collection("users").get();

  userDoc.forEach((doc) => {
    users.push(doc.data());
  });

  const batch = FireDB.batch();
  users.forEach((user) => {
    let newSal = false;
    if (user.sal === undefined) {
      newSal = false;
    } else {
      newSal = user.sal;
    }

    let newScheduleModify = false;
    if (user.admin === undefined) {
      newScheduleModify = false;
    } else {
      newScheduleModify = user.admin;
    }

    let newSystemAdmin = false;
    if (user.hidden === undefined) {
      newSystemAdmin = false;
    } else {
      newSystemAdmin = user.hidden;
    }
    user.privilege = {
      leaveApprove: false,
      leaveManage: false,
      logViewer: false,
      sal: newSal,
      scheduleModify: newScheduleModify,
      systemAdmin: newSystemAdmin,
    };
    delete user.admin;
    delete user.hidden;
    delete user.leaveAdmin;
    delete user.sal;

    const ref = FireDB.collection("users").doc(user.uid);
    batch.set(ref, user);
  });
  batch.commit();
});

// attach holiday to schedule
exports.attachHoliday = functions.https.onCall(async (data, context) => {
  // only authenticated users can run this
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add requests",
    );
  }

  const holidays = [];
  const holidayDoc = await FireDB.collection("leave").get();

  holidayDoc.forEach((doc) => {
    const d = doc.data();
    d.docid = doc.id;
    if (d.status == "批准") {
      holidays.push(d);
    }
  });
  const batch = FireDB.batch();
  let count = 0;
  const scheduleCollection = FireDB.collection("schedule");
  for (const doc of holidays) {
    const scheduleDocid = doc.uid + formatDate(doc.date, "", "YYYYMMDD") + doc.slot;
    const scheduleDoc = await scheduleCollection.doc(scheduleDocid).get();
    const ref = scheduleCollection.doc(scheduleDocid);

    if (scheduleDoc.exists && scheduleDoc.data().type === doc.type) {
      batch.update(ref, {
        leaveDocid: doc.docid,
      });
      count++;
    }
  }
  batch.commit().then(() => {
    console.log("ADMIN-ATTACHHOLIDAY: total approved holidays: " + holidays.length);
    console.log("ADMIN-ATTACHHOLIDAY: total updated schedule: " + count);
    Promise.resolve("Successfully attached holiday to schedules");
  });
});

// migrate old schedule doc to new doc id
exports.migrateSchedule = functions.https.onCall(async (data, context) => {
  // only authenticated users can run this
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add requests",
    );
  }

  const schedule = [];
  const scheduleDoc = await FireDB.collection("schedule").get();

  scheduleDoc.forEach((doc) => {
    const d = doc.data();
    d.docid = doc.id;
    if ("staff" in doc.data()) {
      schedule.push(d);
    }
  });

  console.log("datasize: " + schedule.length);

  // create a batch
  let batch = FireDB.batch();
  for (let i=0; i < schedule.length; i++) {
    // formulate the new document id format
    const dateString = new Date(schedule[i].date.toMillis());
    const newDocid = schedule[i].staff + formatDate(dateString, "", "YYYYMMDD") + schedule[i].slot;

    // delete old record
    const ref = FireDB.collection("schedule").doc(schedule[i].docid);
    batch.delete(ref);

    // if the type is empty, skip making new record
    if (schedule[i].type != "") {
      const ref = FireDB.collection("schedule").doc(newDocid);
      batch.set(ref, {
        date: schedule[i].date,
        slot: schedule[i].slot,
        uid: schedule[i].staff,
        type: schedule[i].type,
      });
    }

    // commit a batch once every 200 items (200 delete + 200 update)
    if ((i + 1) % 199 === 0) {
      await batch.commit();
      batch = FireDB.batch();
    }
  }

  // For committing final batch
  if (!(schedule.length % 499) == 0) {
    await batch.commit();
  }
});

// http callable function (adding an activity)
exports.mergeActivity = functions.https.onCall(async (data, context) => {
  // only authenticated users can run this
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add requests",
    );
  }
  // grab collections & overview pointers
  const activityCollection = FireDB.collection("activity");
  const activityOverviewCollection = FireDB
      .collection("activityOverview");

  const activityDoc = await activityCollection.get();
  const activities = [];
  activityDoc.forEach((doc) => {
    activities.push(doc.id);
  });
  // console.log(activities);
  for (const act of activities) {
    const batch = FireDB.batch();
    const activityOverviewDoc = await activityOverviewCollection
        .where("docid", "==", act)
        .get();
    const customName = [];
    const pendingDelete = [];
    activityOverviewDoc.docs.forEach((doc) => {
      pendingDelete.push(doc.id);
      customName.push({
        date: doc.data().date,
        customName: doc.data().customName,
      });
    });

    const ref = activityCollection.doc(act);
    batch.update(ref, {
      date: customName,
    });

    pendingDelete.forEach((d) => {
      const ref = activityOverviewCollection.doc(d);
      batch.delete(ref);
    });
    batch.commit();
  }
});

exports.moveLeaveConfig = functions.https.onCall(async (data, context) => {
  const oldLeaveConfigDoc = FireDB.collection("leave").doc("config");
  const oldLeaveConfig = await oldLeaveConfigDoc.get();
  const oldLeaveConfigData = oldLeaveConfig.data();
  const newLeaveConfigDoc = FireDB.collection("dashboard").doc("leaveConfig");
  return await newLeaveConfigDoc.set({...oldLeaveConfigData}).then(() => {
    oldLeaveConfigDoc.delete();
  });
});

// manual administration function
exports.adminFunc = functions.https.onCall(async (data, context) => {
  const oldUID = data.oldUID;
  const newUID = data.newUID;
  console.log("converting " + oldUID + " to " + newUID);
  const batch = FireDB.batch();
  const userCollection = FireDB.collection("users");

  const scheduleDoc = FireDB.collection("schedule");
  let docCount = 0;
  const docList = [];
  scheduleDoc
      .where("uid", "==", oldUID)
      .get()
      .then((doc) => {
        doc.forEach((d) => {
          docCount++;
          docList.push(d);
        });

        docList.forEach((d) => {
          const ref = scheduleDoc.doc(d.id);
          batch.update(ref, {
            uid: newUID,
          });
        });

        if (batch._writes.length > 0) {
          batch.commit().then(() => {
            console.log(
                "AdminFunc UID " +
              oldUID +
              " has " +
              docCount +
              " schedules coverted to new UID " +
              newUID,
            );
          });
        }
      });

  const activityBatch = FireDB.batch();
  const activityCollection = FireDB.collection("activity");
  let actCount = 0;
  const actList = [];
  activityCollection
      .where("uid", "==", oldUID)
      .get()
      .then((doc) => {
        doc.forEach((d) => {
          actCount++;
          actList.push(d);
        });

        actList.forEach((d) => {
          const ref = scheduleDoc.doc(d.id);
          activityBatch.update(ref, {
            uid: newUID,
          });
        });

        if (actCount > 0) {
          activityBatch.commit().then(() => {
            console.log(
                "AdminFunc UID " +
            oldUID +
            " has " +
            actCount +
            " activities records coverted to new UID " +
            newUID,
            );
            userCollection.doc(oldUID).delete();
            console.log("Cleaning up oldUID account: " + oldUID);
          });
        }
      });
});

// used during system migration
exports.convertNewSystem = functions.https.onCall(async (data, context) => {
  const oldUID = data.oldUID;
  const newUID = data.newUID;

  const userCollection = FireDB.collection("users");
  console.log("auto migrating " + oldUID + " to " + newUID);
  const userDoc = await userCollection.where("uid", "==", oldUID).get();
  console.log("userCount: " + userDoc.size);
  let userObject;
  userDoc.forEach((d) => {
    if (d.data().uid == oldUID) {
      userObject = {
        admin: d.data().admin,
        defaultSchedule: d.data().defaultSchedule,
        email: d.data().email,
        hidden: d.data().hidden,
        name: d.data().name,
        order: d.data().order,
        sal: d.data().sal,
        uid: newUID,
      };
    }
  });
  await userCollection.doc(newUID).set(userObject);

  const scheduleBatch = FireDB.batch();
  const scheduleCollection = FireDB.collection("schedule");

  const scheduleDoc = await scheduleCollection.where("uid", "==", oldUID).get();
  console.log("scheduleSize: " + scheduleDoc.size);
  scheduleDoc.forEach((d) => {
    const ref = scheduleCollection.doc(d.id);
    scheduleBatch.update(ref, {
      uid: newUID,
    });
  });
  scheduleBatch.commit().then(() => {
    console.log(
        "UID " +
    oldUID +
    " has " +
    scheduleDoc.size +
    " schedules coverted to new UID " +
    newUID,
    );
  });

  const activityBatch = FireDB.batch();
  const activityCollection = FireDB.collection("activity");

  const activityDoc = await activityCollection.where("uid", "==", oldUID).get();
  activityDoc.forEach((d) => {
    const ref = activityCollection.doc(d.id);
    activityBatch.update(ref, {
      uid: newUID,
    });
  });

  activityBatch.commit().then(() => {
    console.log(
        "UID " +
    oldUID +
    " has " +
    activityDoc.size +
    " activities records coverted to new UID " +
    newUID,
    );
    userCollection.doc(oldUID).delete();
    console.log("Cleaning up oldUID account: " + oldUID);
  });
});
