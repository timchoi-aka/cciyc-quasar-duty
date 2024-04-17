import { ref, computed } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { gql } from "graphql-tag";
import { date, extend } from "quasar";
import { useNotifier } from "./notifier";

// Function to provide attendance data
export function useAttendanceProvider(options = {}) {
  // Destructure galleryID from options, default to a new ref if not provided
  const { c_act_code = ref() } = options;

  // Ref to keep track of the number of pending async operations
  const awaitNumber = ref(0);

  // Computed property that indicates whether there are any pending async operations
  const loading = computed(() => awaitNumber.value > 0);

  // returned message to be displayed to client
  const message = ref({});

  // Ref to store the result of the async operations
  const result = ref([]);

  // GraphQL query string
  let GET_ATTENDANCE = gql`
    query Event_AttendancesByActCode($c_act_code: String = "") {
      Attendance(where: { c_act_code: { _eq: $c_act_code } }) {
        b_is_youth
        b_is_youth_family
        c_act_code
        c_mem_id
        c_name
        c_user_id
        d_date
        d_updatetime
        i_in_center_session
        i_out_center_session
        uuid
      }
      AttendanceNonRegistrant(where: { c_act_code: { _eq: $c_act_code } }) {
        uuid
        d_date
        c_act_code
        i_youth_session
        i_youth_count
        i_youth_family_session
        i_youth_family_count
        c_updateuser
        d_updatetime
        i_in_center_sessions
        i_out_center_sessions
      }
    }
  `;

  /** Attendance data structure
   * uuid - uniqueidentifier
    c_mem_id - nvarchar
    c_act_code- nvarchar
    d_date - smalldatetime
    c_name - nvarchar
    c_user_id - nvarchar
    d_updatetime - smalldatetime
    b_is_youth - bit
    i_in_center_session - smallint
    i_out_center_session - smallint
    b_is_youth_family - bit
  **/

  /** AttendanceNonRegistrants data structure
    uuid - uniqueidentifier
    d_date- smalldatetime
    c_act_code- nvarchar
    i_youth_session- smallint
    i_youth_family_session- smallint
    i_youth_count- smallint
    i_youth_family_count- smallint
    c_updateuser- nvarchar, nullable
    d_updatetime- smalldatetime
  **/
  const ADD_ATTENDANCE = gql`
    mutation AddAttendance(
      $registrantsObjects: [Attendance_insert_input!] = []
      $nonRegistrantsObjects: AttendanceNonRegistrant_insert_input! = {}
      $logObject: Log_insert_input! = {}
    ) {
      insert_Attendance(
        objects: $registrantsObjects
        if_matched: {
          match_columns: [c_mem_id, c_act_code, d_date]
          update_columns: [
            c_name
            c_user_id
            d_updatetime
            b_is_youth
            b_is_youth_family
            i_in_center_session
            i_out_center_session
          ]
        }
      ) {
        returning {
          b_is_youth
          b_is_youth_family
          c_act_code
          c_mem_id
          c_name
          c_user_id
          d_date
          d_updatetime
          i_in_center_session
          i_out_center_session
          uuid
        }
      }
      insert_AttendanceNonRegistrant_one(
        object: $nonRegistrantsObjects
        if_matched: {
          match_columns: [c_act_code, d_date]
          update_columns: [
            i_youth_session
            i_youth_family_session
            i_youth_count
            i_youth_family_count
            c_updateuser
            d_updatetime
            i_in_center_sessions
            i_out_center_sessions
          ]
        }
      ) {
        uuid
        c_act_code
        d_date
        i_youth_session
        i_youth_family_session
        i_youth_count
        i_youth_family_count
        c_updateuser
        d_updatetime
        i_in_center_sessions
        i_out_center_sessions
      }
      insert_Log_one(object: $logObject) {
        log_id
        username
      }
    }
  `;

  const DELETE_ATTENDANCE = gql`
    mutation DelAttendance(
      $c_act_code: String = ""
      $d_date: smalldatetime = ""
      $logObject: Log_insert_input! = {}
    ) {
      delete_Attendance(
        where: {
          _and: { c_act_code: { _eq: $c_act_code }, d_date: { _eq: $d_date } }
        }
      ) {
        affected_rows
      }
      delete_AttendanceNonRegistrant_by_pk(
        c_act_code: $c_act_code
        d_date: $d_date
      ) {
        d_date
        c_act_code
      }
      insert_Log_one(object: $logObject) {
        log_id
        username
      }
    }
  `;

  const {
    mutate: AddAttendance,
    onDone: onDone_AddAttendance,
    onError: onError_AddAttendance,
  } = useMutation(ADD_ATTENDANCE, {
    update: (cache, { data }) => {
      // console.log("data returned: ", JSON.stringify(data));
      // Read the data from our cache for this query.
      const existingAttendance = cache.readQuery({
        query: GET_ATTENDANCE,
        variables: {
          c_act_code: data.insert_AttendanceNonRegistrant_one.c_act_code.trim(),
        },
      });
      // Check if the data is in the cache
      if (existingAttendance) {
        let updatedAttendance = {};
        extend(true, updatedAttendance, existingAttendance);
        // if existingAttendance.Attendance contains data from insert_Attendance.returning, update it
        // else, add insert_Attendance.returning to existingAttendance.Attendance
        data.insert_Attendance.returning.forEach((element) => {
          const index = updatedAttendance.Attendance.findIndex(
            (item) => item.uuid == element.uuid
          );
          if (index >= 0) {
            updatedAttendance.Attendance[index] = element;
          } else {
            updatedAttendance.Attendance.push(element);
          }
        });

        if (data.insert_AttendanceNonRegistrant_one) {
          let j = updatedAttendance.AttendanceNonRegistrant.findIndex(
            (item) => item.uuid == data.insert_AttendanceNonRegistrant_one.uuid
          );
          if (j >= 0) {
            updatedAttendance.AttendanceNonRegistrant[j] =
              data.insert_AttendanceNonRegistrant_one;
          } else {
            updatedAttendance.AttendanceNonRegistrant.push(
              data.insert_AttendanceNonRegistrant_one
            );
          }
        }

        // Write our data back to the cache.
        cache.writeQuery({
          query: GET_ATTENDANCE,
          variables: {
            c_act_code:
              data.insert_AttendanceNonRegistrant_one.c_act_code.trim(),
          },
          data: updatedAttendance,
        });
        result.value = updatedAttendance;
      }
    },
  });

  onDone_AddAttendance((res) => {
    if (res.data) {
      if (process.env.NODE_ENV != "development") {
        // no notification for delete event
        // message return to client
        message.value =
          "活動" +
          res.data.insert_AttendanceNonRegistrant_one.c_act_code.trim() +
          "點名成功";
      } else {
        // development channel
        const { result } = useNotifier({
          topic: "uqhehdGADfWYglt9jDfaab0LGrC3",
          data: {
            title: "[DEV]活動點名成功",
            body:
              "[" +
              res.data.insert_AttendanceNonRegistrant_one.c_updateuser.trim() +
              "]" +
              "提交了活動" +
              res.data.insert_AttendanceNonRegistrant_one.c_act_code.trim() +
              "點名，活動日期：" +
              date.formatDate(
                res.data.insert_AttendanceNonRegistrant_one.d_date,
                "YYYY-MM-DD"
              ),
          },
        });

        result.value
          .then((r) => {
            if (r.data) {
              message.value =
                "成功提交了活動點名 - " +
                res.data.insert_AttendanceNonRegistrant_one.c_act_code.trim();
            }
          })
          .catch((e) => {
            console.log("error: ", e);
            message.value = "提交活動點名失敗";
          });
      }
    }
  });

  // Handle error for addAttendance
  onError_AddAttendance((error) => {
    // Handle error
    console.error("Adding attendance failed", error);
  });

  const {
    mutate: DelAttendance,
    onDone: onDone_DelAttendance,
    onError: onError_DelAttendance,
  } = useMutation(DELETE_ATTENDANCE, {
    update: (cache, { data: { delete_AttendanceNonRegistrant_by_pk } }) => {
      // Evict the event from the cache
      cache.evict({
        c_act_code: cache.identify({
          __typename: "AttendanceNonRegistrant",
          c_act_code: delete_AttendanceNonRegistrant_by_pk.c_act_code,
          d_date: delete_AttendanceNonRegistrant_by_pk.d_date,
        }),
      });
      cache.gc();
    },
  });

  onDone_DelAttendance((res) => {
    if (res.data) {
      if (process.env.NODE_ENV != "development") {
        // no notification for delete event
        // message return to client
        (message.value =
          "活動" +
          res.data.delete_AttendanceNonRegistrant_by_pk.c_act_code.trim() +
          "刪除點名" +
          date.formatDate(
            res.data.delete_AttendanceNonRegistrant_by_pk.d_date,
            "YYYY-MM-DD"
          )) + "成功";
      } else {
        // development channel
        const { result } = useNotifier({
          topic: "uqhehdGADfWYglt9jDfaab0LGrC3",
          data: {
            title: "[DEV]刪除活動點名成功",
            body:
              "[" +
              res.data.insert_Log_one.username.trim() +
              "]" +
              "刪除了活動" +
              res.data.delete_AttendanceNonRegistrant_by_pk.c_act_code.trim() +
              "點名，活動日期：" +
              date.formatDate(
                res.data.delete_AttendanceNonRegistrant_by_pk.d_date,
                "YYYY-MM-DD"
              ),
          },
        });

        result.value
          .then((r) => {
            if (r.data) {
              message.value =
                "成功刪除了活動點名 - " +
                res.data.delete_AttendanceNonRegistrant_by_pk.c_act_code.trim();
            }
          })
          .catch((e) => {
            console.log("error: ", e);
            message.value = "刪除活動點名失敗";
          });
      }
    }
  });

  // Handle error for addAttendance
  onError_DelAttendance((error) => {
    // Handle error
    console.error("Adding attendance failed", error);
  });

  // Function to add a new attendance
  const addAttendance = async (param) => {
    const { username, d_date, registrantsObjects, nonRegistrantsObjects } =
      param;

    let logObject = ref({
      username: username.value,
      datetime: date.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      module: "活動系統",
      action:
        "活動點名: " +
        c_act_code.value +
        "。日期：" +
        date.formatDate(d_date.value, "YYYY-MM-DD") +
        "。出席會員：" +
        registrantsObjects.value
          .map(
            (item) =>
              `${item.c_name} (${item.c_mem_id}) - 中心內: ${
                item.i_in_center_session ? item.i_in_center_session : 0
              }, 中心外: ${
                item.i_out_center_session ? item.i_out_center_session : 0
              }`
          )
          .join(", "),
    });
    /* 
    console.log("username: ", username.value);
    console.log("d_date: ", d_date.value);
    console.log("registrantsObjects: ", registrantsObjects.value);
    console.log("nonRegistrantsObjects: ", nonRegistrantsObjects.value);
    console.log("logObject: ", logObject.value);
    */
    // Increment the number of pending async operations
    awaitNumber.value++;

    try {
      // Call the addAttendance mutation
      await AddAttendance({
        registrantsObjects: registrantsObjects.value,
        nonRegistrantsObjects: nonRegistrantsObjects.value,
        logObject: logObject.value,
      });
    } catch (error) {
      console.error(error);
    } finally {
      // Decrement the number of pending async operations
      awaitNumber.value--;
    }
  };

  // Function to delete a new attendance
  const delAttendance = async (param) => {
    const { username, d_date, c_act_code } = param;

    let logObject = ref({
      username: username.value,
      datetime: date.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      module: "活動系統",
      action:
        "刪除活動點名: " +
        c_act_code.value +
        "。日期：" +
        date.formatDate(d_date.value, "YYYY-MM-DD") +
        "。",
    });
    /* 
    console.log("username: ", username.value);
    console.log("d_date: ", d_date.value);
    console.log("registrantsObjects: ", registrantsObjects.value);
    console.log("nonRegistrantsObjects: ", nonRegistrantsObjects.value);
    console.log("logObject: ", logObject.value);
    */
    // Increment the number of pending async operations
    awaitNumber.value++;

    try {
      // Call the addAttendance mutation
      await DelAttendance({
        c_act_code: c_act_code.value,
        d_date: d_date.value,
        logObject: logObject.value,
      });
    } catch (error) {
      console.error(error);
    } finally {
      // Decrement the number of pending async operations
      awaitNumber.value--;
    }
  };

  // Function to execute the query
  const execute = async () => {
    awaitNumber.value++;
    const { onResult } = useQuery(GET_ATTENDANCE, () => ({
      c_act_code: c_act_code.value,
    }));

    onResult((res) => {
      if (res.data) {
        result.value = res.data;
        awaitNumber.value--;
      }
    });
  };

  // Execute the query
  execute();

  // Return the provided data and functions
  //return { result, loading, deleteGalleryById, toggleVisibilityById, refetch: execute, renameGalleryById, updateCoverById, addNewGallery };
  return { result, loading, message, addAttendance, delAttendance };
}
