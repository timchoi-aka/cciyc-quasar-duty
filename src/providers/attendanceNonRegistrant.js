import { ref, computed } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { gql } from "graphql-tag";

// Function to provide attendance data
export function useAttendanceNonRegistrantProvider(options = {}) {
  // Destructure galleryID from options, default to a new ref if not provided
  const { c_act_code = ref(), d_date = ref() } = options;

  // Ref to keep track of the number of pending async operations
  const awaitNumber = ref(0);

  // Computed property that indicates whether there are any pending async operations
  const loading = computed(() => awaitNumber.value > 0);

  // Ref to store the result of the async operations
  const result = ref([]);

  // GraphQL query string
  let GET_ATTENDANCE = gql`
    query Event_AttendancesNonRegistrantByActCode(
      $c_act_code: String! = ""
      $c_slot: String = ""
      $d_date: date = ""
    ) {
      AttendanceNonRegistrant {
        c_act_code
        d_date
        i_youth_session
        i_youth_family_session
        i_youth_count
        i_youth_family_count
        c_updateuser
        d_updatetime
        i_youth_session_out_center
        i_youth_family_session_out_center
      }
    }
  `;

  const ADD_ATTENDANCE = gql`
    mutation AddAttendanceNonRegistrant(
      $objects: [AttendanceNonRegistrant_insert_input!] = {}
    ) {
      insert_AttendanceNonRegistrant(
        objects: $objects
        if_matched: {
          match_columns: [c_act_code, d_date]
          update_columns: [
            i_youth_session
            i_youth_family_session
            i_youth_count
            i_youth_family_count
            c_updateuser
            d_updatetime
            i_youth_session_out_center
            i_youth_family_session_out_center
          ]
        }
      ) {
        returning {
          c_act_code
          d_date
          i_youth_session
          i_youth_family_session
          i_youth_count
          i_youth_family_count
          c_updateuser
          d_updatetime
          i_youth_session_out_center
          i_youth_family_session_out_center
        }
      }
    }
  `;

  const {
    mutate: AddAttendanceNonRegistrant,
    onError: onError_addAttendanceNonRegistrant,
  } = useMutation(ADD_ATTENDANCE, {
    update: (cache, { data: { insert_AttendanceNonRegistrant } }) => {
      // Read the data from our cache for this query.
      const existingAttendance = cache.readQuery({ query: GET_ATTENDANCE });
      // Check if the data is in the cache
      if (existingAttendance) {
        let updatedAttendance = [...existingAttendance.AttendanceNonRegistrant];
        // if existingAttendance.Attendance contains data from insert_Attendance.returning, update it
        // else, add insert_Attendance.returning to existingAttendance.Attendance
        insert_AttendanceNonRegistrant.returning.forEach((element) => {
          const index = updatedAttendance.findIndex(
            (item) =>
              item.c_act_code == element.c_act_code &&
              item.d_date == element.d_date
          );
          if (index > -1) {
            updatedAttendance[index] = element;
          } else {
            updatedAttendance.push(element);
          }
        });

        // Write our data back to the cache.
        cache.writeQuery({
          query: GET_ATTENDANCE,
          data: {
            AttendanceNonRegistrant: updatedAttendance,
          },
        });
        result.value = updatedAttendance;
      }
    },
  });

  // Function to add a new attendance
  const addAttendanceNonRegistrant = async (objects) => {
    // Increment the number of pending async operations
    awaitNumber.value++;
    try {
      // Call the addAttendance mutation
      await AddAttendanceNonRegistrant({
        objects: objects,
      });
    } catch (error) {
      console.error(error);
    } finally {
      // Decrement the number of pending async operations
      awaitNumber.value--;
    }
  };

  // Handle error for addAttendance
  onError_addAttendanceNonRegistrant((error) => {
    // Handle error
    console.error("修改非報名點名失敗", error);
  });

  // Function to execute the query
  const execute = async () => {
    const { onResult } = useQuery(GET_ATTENDANCE, () => ({
      c_act_code: c_act_code.value,
      d_date: d_date.value,
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
  return { result, loading, addAttendanceNonRegistrant };
}
