/* eslint-disable max-len */
const {functions, FireDB, Timestamp} = require("./fbadmin");
const {formatDate} = require("./utilities");

// delete activity
exports.delActivity = functions.region("asia-east2").https.onCall(async (data, context) => {
  // only authenticated users can run this
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add requests",
    );
  }

  // grab collections pointers
  const activityCollection = FireDB.collection("activity");
  const actDoc = await activityCollection.doc(data.docid).get();
  const userDoc = await FireDB.collection("users").doc(context.auth.uid).get();

  console.log(
      userDoc.data().name +
        " deleted activity id " +
        data.id +
        ", name " +
        actDoc.data().name,
  );

  // delete overview records, and then activity record
  return activityCollection.doc(data.docid).delete();
});

// http callable function (modify an activity customName)
exports.editActivityCustomName = functions.region("asia-east2").https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add requests",
    );
  }

  const activityCollection = FireDB.collection("activity");
  const activityDoc = await activityCollection.doc(data.docid).get();
  const userDoc = await FireDB
      .collection("users")
      .doc(context.auth.uid)
      .get();
  const userName = userDoc.data().name;

  const logData = "ACTIVITIES: " +
                  userName +
                  " changed activity docid " +
                  data.docid +
                  ", to customName " +
                  data.customName +
                  " on event dates : " +
                  data.date;

  const dateEntries = activityDoc.data().date;
  const i = dateEntries.findIndex((element) => formatDate(new Date(element.date.toMillis() + 8*60*60*1000), "-", "YYYYMMDD") == formatDate(data.date, "", "YYYYMMDD"));

  dateEntries[i] = {
    date: dateEntries[i].date,
    customName: data.customName,
  };

  return activityCollection.doc(data.docid).update({
    date: dateEntries,
  }).then(()=> {
    console.log(logData);
  });
});

// http callable function (modify an activity)
exports.modifyActivity = functions.region("asia-east2").https.onCall(async (data, context) => {
  // only authenticated users can continue
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add requests",
    );
  }

  // grab function input variables
  const eventDate = [];

  // convert javascript dates to firestore dates
  data.firestoreDate.forEach((d) => {
    const x = Timestamp.fromDate(new Date(d));
    eventDate.push(x);
  });

  // grab collection pointer
  const activityCollection = FireDB.collection("activity");
  const userDoc = await FireDB
      .collection("users")
      .doc(context.auth.uid)
      .get();
  const userName = userDoc.data().name;

  const activityDoc = await activityCollection.doc(data.docid).get();

  if (!activityDoc.exists) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "Activity ID not found",
    );
  }

  const newEventDateMapping = [];
  eventDate.forEach((ed) => {
    const i = activityDoc
        .data()
        .date.findIndex((element) => element.date == ed);
    if (i == -1) {
      newEventDateMapping.push({
        date: ed,
        customName: "",
      });
    } else {
      newEventDateMapping.push({
        date: ed,
        customName: activityDoc.data().date[i].customName,
      });
    }
  });

  // console.log("dateMapping: " + JSON.stringify(newEventDateMapping));

  console.log(
      "ACTIVITIES: " +
      userName +
      " modified activity id " +
      data.id +
      ", name " +
      data.name +
      ", event dates : " +
      JSON.stringify(eventDate),
  );
  return activityCollection.doc(data.docid).set({
    id: data.id,
    name: data.name,
    venue: data.venue,
    active: data.active,
    date: newEventDateMapping,
    uid: context.auth.uid,
    userName: data.userName,
  });
});

// http callable function (modify an activity)
/*
exports.modifyActivity_old = functions.https.onCall(async (data, context) => {
  // only authenticated users can continue
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add requests",
    );
  }

  // grab function input variables
  const id = data.id;
  const firestoreDate = data.firestoreDate;
  const eventDate = [];
  const name = data.name;
  const venue = data.venue;
  const docid = data.docid;
  const userName = context.auth.token.name;
  const uid = context.auth.uid;
  const active = data.active;

  // console.log(JSON.stringify(context.auth));
  // console.log("data: " + JSON.stringify(data));
  // console.log("eventDate: " + Object.values(eventDate));

  // convert javascript dates to firestore dates
  firestoreDate.forEach((d) => {
    const x = Timestamp.fromDate(new Date(d));
    eventDate.push(x);
  });

  // grab collection pointer
  const activityCollection = FireDB.collection("activity");
  const activityOverviewCollection = FireDB
      .collection("activityOverview");

  activityCollection
      .doc(docid)
      .get()
      .then((doc) => {
        if (Object.keys(doc).length) {
          console.log(
              "ACTIVITIES: " +
            userName +
            " modified activity id " +
            id +
            ", name " +
            name +
            ", event dates : " +
            JSON.stringify(eventDate),
          );
          activityCollection.doc(docid).set({
            id: id,
            name: name,
            venue: venue,
            active: active,
            date: eventDate,
            uid: uid,
            userName: userName,
          });
        } else {
          throw new functions.https.HttpsError(
              "failed-precondition",
              "Activity ID not found",
          );
        }
      });
  // prepare additional data for activity overview
  const activityList = [];

  eventDate.forEach((date) => {
    activityList.push({
      date: date,
      name: name,
      venue: venue,
      docid: docid,
      customName: "",
      active: active,
    });
  });

  // console.log("eventDate Count: " + activityList.length + " detail: " + JSON.stringify(activityList));

  // load all existing customName with dates
  // delete all existing objects
  // update all customName of new objects if dates match
  // write all new objects
  activityOverviewCollection
      .where("docid", "==", docid)
      .get()
      .then((activityOverviewDoc) => {
        const customNameMapping = [];
        activityOverviewDoc.forEach((doc) => {
          customNameMapping.push({
            customName: doc.data().customName,
            date: doc.data().date,
            docid: doc.id,
          });
        });
        // console.log("customName Count: " + customNameMapping.length + " detail: " + JSON.stringify(customNameMapping));
        customNameMapping.forEach((map) => {
          activityOverviewCollection
              .doc(map.docid)
              .delete()
              .catch((error) => console.log(error));
        });

        activityList.forEach((act) => {
          customNameMapping.forEach((map) => {
            if (map.date.toMillis() == act.date.toMillis()) {
              act.customName = map.customName;
            }
          });
        });

        // console.log("customNameMapping: " + JSON.stringify(customNameMapping));
        // console.log("activityList: " + JSON.stringify(activityList));

        return activityList.forEach((act) => {
          activityOverviewCollection.add(act);
        });
      });
});

// http callable function (adding an activity)
exports.addActivity_old = functions.https.onCall(async (data, context) => {
  // only authenticated users can run this
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add requests",
    );
  }

  // grab function variables
  const id = data.id;
  const firestoreDate = data.firestoreDate;
  const eventDate = [];
  const name = data.name;
  const venue = data.venue;
  const userName = data.userName;
  const uid = context.auth.uid;
  const active = data.active;

  // console.log(JSON.stringify(context.auth));
  // console.log("data: " + JSON.stringify(data));
  // console.log("eventDate: " + JSON.stringify(eventDate));
  // console.log("firestoreDate: " + JSON.stringify(firestoreDate));
  // convert javascript dates to firestore timestamp
  firestoreDate.forEach((d) => {
    eventDate.push(Timestamp.fromDate(new Date(d)));
  });

  // grab collections pointers
  const activityCollection = FireDB.collection("activity");
  const activityOverviewCollection = FireDB
      .collection("activityOverview");

  console.log(
      "ACTIVITIES: " +
      userName +
      " added activity id " +
      id +
      ", name " +
      name +
      ", event dates : " +
      JSON.stringify(firestoreDate),
  );

  // store activity record to activity collection
  const activityDoc = await activityCollection.add({
    id: id,
    name: name,
    venue: venue,
    active: active,
    date: eventDate,
    uid: uid,
    userName: userName,
  });

  // prepare additional data for activity overview
  const activityList = [];

  eventDate.forEach((date) => {
    activityList.push({
      date: date,
      name: name,
      venue: venue,
      docid: activityDoc.id,
      customName: "",
      active: active,
    });
  });
  // console.log("activityList: " + JSON.stringify(activityList));

  return await activityList.forEach((activity) =>
    activityOverviewCollection.add(activity),
  );
});
*/

// http callable function (adding an activity)
exports.addActivity = functions.region("asia-east2").https.onCall(async (data, context) => {
  // only authenticated users can run this
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add requests",
    );
  }

  // grab function variables
  const eventDate = [];

  data.firestoreDate.forEach((d) => {
    const fsDate = Timestamp.fromDate(new Date(d));
    eventDate.push({
      date: fsDate,
      customName: "",
    });
  });

  // grab collections pointers
  const activityCollection = FireDB.collection("activity");

  console.log(
      "ACTIVITIES: " +
      data.userName +
      " added activity id " +
      data.id +
      ", name " +
      data.name +
      ", event dates : " +
      JSON.stringify(data.firestoreDate),
  );

  // store activity record to activity collection
  return activityCollection.add({
    id: data.id,
    name: data.name,
    venue: data.venue,
    active: data.active,
    date: eventDate,
    uid: context.auth.uid,
    userName: data.userName,
  });
});
