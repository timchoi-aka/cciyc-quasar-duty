/* eslint-disable max-len */
const {functions, FireDB, Timestamp} = require("./fbadmin");
const {formatDate} = require("./utilities");


// http callable function (managing schedule)
exports.updateSchedule = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can update schedules",
    );
  }

  for (const req of data) {
    const firebaseDate = Timestamp.fromDate(new Date(req.date));
    // get user and schedule buckets
    const userDoc = FireDB
        .collection("users")
        .doc(req.uid);
    const user = await userDoc.get();

    // generate docid based on uid, date and slot
    const docid = req.uid+formatDate(req.date, "", "YYYYMMDD")+req.slot;
    const scheduleDoc = FireDB.collection("schedule").doc(docid);
    const schedule = await scheduleDoc.get();

    if (!schedule.exists) { // no record found
      if (req.type != "") { // only if the new schedule is not empty
        await scheduleDoc.set({ // create a new schedule
          date: firebaseDate,
          slot: req.slot,
          uid: req.uid,
          type: req.type,
        }).then(() => {
          console.log(
              "SCHEDULE: " +
              user.data().name +
              " 新增了 " +
              formatDate(req.date, "-", "YYYYMMDD") +
              ":" +
              req.slot +
              "(" +
              req.type + ")",
          );
        });
      }
    } else { // if existing record found
      if (req.type == "") { // delete if it changes to empty
        await scheduleDoc.delete().then(()=> {
          console.log(
              "SCHEDULE: " +
              user.data().name +
              " 刪除了 " +
              formatDate(req.date, "-", "YYYYMMDD") +
              ":" +
              req.slot,
          );
        });
      } else { // update new value if old schedule found
        await scheduleDoc.update({
          type: req.type,
        }).then(()=>{
          console.log(
              "SCHEDULE: " +
                user.data().name +
                " 修改了 " +
                formatDate(req.date, "-", "YYYYMMDD") +
                ":" +
                req.slot +
                "(" +
                req.type + ")",
          );
        });
      }
    }
  }
  return Promise.resolve("更表已經更新");
});
