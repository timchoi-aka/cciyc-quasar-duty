import { ref, computed } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { gql } from "graphql-tag"

// Function to provide attendance data
export function useAttendanceProvider(options = {}) {
  // Destructure galleryID from options, default to a new ref if not provided
  const { c_act_code = ref() } = options

  // Ref to keep track of the number of pending async operations
  const awaitNumber = ref(0);

  // Computed property that indicates whether there are any pending async operations
  const loading = computed(() => awaitNumber.value > 0);

  // Ref to store the result of the async operations
  const result = ref([]);

  // GraphQL query string
  let GET_ATTENDANCE = gql`
  query Event_AttendancesByActCode(
    $c_act_code: String! = ""
    ) {
    Attendance {
      b_attend
      b_is_youth
      c_act_code
      c_mem_id
      c_name
      c_slot
      c_user_id
      d_date
      d_updatetime
      uuid
    }
    AttendanceOthers {
      c_act_code
      c_slot
      c_updateuser
      d_date
      d_updatetime
      i_count
    }
  }`;

  /*
  const ADD_ATTENDANCE = gql`
    mutation AddAttendance(
      $objects: [tbl_act_attend_insert_input!] = {},
      ) {
    insert_tbl_act_attend(
      objects: $objects,
      if_matched: {match_columns: [c_mem_id, c_act_code, d_date, i_marks, c_act_detail], update_columns: [c_name, c_user_id, d_datetime]}) {
      affected_rows
    }
  }`
  */
  const ADD_ATTENDANCE = gql`
    mutation AddAttendance(
      $objects: [Attendance_insert_input!] = {},
      ) {
    insert_Attendance(
      objects: $objects,
      if_matched: {match_columns: [c_mem_id, c_act_code, d_date, c_slot], update_columns: [c_name, c_user_id, d_updatetime, b_attend, b_is_youth]}) {
      returning {
        b_attend
        b_is_youth
        c_act_code
        c_mem_id
        c_name
        c_slot
        c_user_id
        d_date
        d_updatetime
        uuid
      }
    }
  }`

  const { mutate: AddAttendance, onError: onError_addAttendance } = useMutation(ADD_ATTENDANCE, {
    update: (cache, { data: { insert_Attendance } }) => {
      // Read the data from our cache for this query.
      const existingAttendance = cache.readQuery({ query: GET_ATTENDANCE });

      // Check if the data is in the cache
      if (existingAttendance) {
        let updatedAttendance = [...existingAttendance.Attendance]
        // if existingAttendance.Attendance contains data from insert_Attendance.returning, update it
        // else, add insert_Attendance.returning to existingAttendance.Attendance
        insert_Attendance.returning.forEach((element) => {
          const index = updatedAttendance.findIndex((item) => item.uuid == element.uuid)
          if (index > -1) {
            updatedAttendance[index] = element
          } else {
            updatedAttendance.push(element)
          }
        })

        // Write our data back to the cache.
        cache.writeQuery({ query: GET_ATTENDANCE, data: {
          Attendance: updatedAttendance
        }});
        result.value = updatedAttendance
      }
    }
  });

  /*
  // Mutation for toggling visibility
  const TOGGLE_VISIBILITY_MUTATION = gql`
    mutation toggleVisibility($IsShow: Int!, $GalleryID: Int!) {
      update_HTX_ClassGallery_by_pk(pk_columns: { GalleryID: $GalleryID }, _set: { IsShow: $IsShow }) {
        GalleryID
        IsShow
      }
    }`;

  const DELETE_GALLERY_MUTATION = gql`
    mutation delGallery($GalleryID: Int!) {
      delete_HTX_ClassGallery_by_pk(GalleryID: $GalleryID) {
        GalleryID
      }
    }`

  // Define the renameGallery mutation
  const RENAME_GALLERY_MUTATION = gql`
    mutation RenameGallery($GalleryID: Int!, $GalleryName: String!) {
      update_HTX_ClassGallery_by_pk(pk_columns: {GalleryID: $GalleryID}, _set: {GalleryName: $GalleryName}) {
        GalleryID
        GalleryName
      }
    }
    `;

  // Define the updateCover mutation
  const UPDATE_COVER_MUTATION = gql`
    mutation UpdateCover($GalleryID: Int!, $CoverPic: String!) {
      update_HTX_ClassGallery_by_pk(pk_columns: {GalleryID: $GalleryID}, _set: {CoverPic: $CoverPic}) {
        GalleryID
        CoverPic
      }
    }`;

  // Define the addGallery mutation
  const ADD_GALLERY = gql`
    mutation AddGallery($GalleryName: String!, $GalleryNameEN: String!) {
      insert_HTX_ClassGallery_one(object: { GalleryName: $GalleryName, GalleryNameEN: $GalleryNameEN }) {
        GalleryID
        GalleryName
      }
    }
  `;
    */

  /*
  // Use the useMutation hook to create a deleteGallery mutation
  const { mutate: deleteGallery, onError: onError_deleteGallery } = useMutation(DELETE_GALLERY_MUTATION, {
    update: (cache, { data: { delete_HTX_ClassGallery_by_pk } }) => {
      // Read the data from our cache for this query.
      const existingData = cache.readQuery({
        query: GET_GALLERIES,
        variables: galleryID.value ? { galleryID: galleryID.value } : {}
      });

      if (existingData) {
        // Filter out the deleted gallery
        const updatedGalleries = existingData.HTX_ClassGallery.filter(
          gallery => gallery.GalleryID !== delete_HTX_ClassGallery_by_pk.GalleryID
        );

        // Write our data back to the cache.
        cache.writeQuery({
          query: GET_GALLERIES,
          variables: galleryID.value ? { galleryID: galleryID.value } : {},
          data: {
            ...existingData,
            HTX_ClassGallery: updatedGalleries
          },
        });
      }
    },
  });

  // Use the useMutation hook to create an addGallery mutation
  const { mutate: addGallery, onError: onError_addGallery } = useMutation(ADD_GALLERY, {
    // Update function to modify the cache after the mutation
    update: (cache, { data: { insert_HTX_ClassGallery_one } }) => {
      // Read the data from our cache for this query.
      const existingGalleries = cache.readQuery({ query: GET_GALLERIES });

      // Check if the data is in the cache
      if (existingGalleries) {
        // Add the new gallery to the cache
        const updatedGalleries = [...existingGalleries.HTX_ClassGallery, insert_HTX_ClassGallery_one];

        // Write our data back to the cache.
        cache.writeQuery({
          query: GET_GALLERIES,
          data: {
            HTX_ClassGallery: updatedGalleries
          },
        });
      }
    },
  });

  // Use the useMutation hook to create an updateCover mutation
  const { mutate: updateCover, onError: onError_updateCover } = useMutation(UPDATE_COVER_MUTATION, {
    // Update function to modify the cache after the mutation
    update: (cache, { data: { update_HTX_ClassGallery_by_pk } }) => {
      // Read the data from our cache for this query.
      const existingGalleries = cache.readQuery({ query: GET_GALLERIES });

      // Check if the data is in the cache
      if (existingGalleries) {
        // Find the gallery we just updated
        const galleryIndex = existingGalleries.HTX_ClassGallery.findIndex(gallery => gallery.GalleryID === update_HTX_ClassGallery_by_pk.GalleryID);

        if (galleryIndex > -1) {
          // Update its CoverPic property
          const updatedGalleries = [...existingGalleries.HTX_ClassGallery];
          updatedGalleries[galleryIndex].CoverPic = update_HTX_ClassGallery_by_pk.CoverPic;

          // Write our data back to the cache.
          cache.writeQuery({
            query: GET_GALLERIES,
            data: { ...existingGalleries, HTX_ClassGallery: updatedGalleries },
          });
        }
      }
    },
  });

  // Use the useMutation hook to create a renameGallery mutation
  const { mutate: renameGallery, onError: onError_renameGallery } = useMutation(RENAME_GALLERY_MUTATION, {
    // Update function to modify the cache after the mutation
    update: (cache, { data: { update_HTX_ClassGallery_by_pk } }) => {
      // Read the data from our cache for this query.
      const existingGalleries = cache.readQuery({ query: GET_GALLERIES });

      // Check if the data is in the cache
      if (existingGalleries) {
        // Find the gallery we just updated
        const galleryIndex = existingGalleries.HTX_ClassGallery.findIndex(gallery => gallery.GalleryID === update_HTX_ClassGallery_by_pk.GalleryID);

        if (galleryIndex > -1) {
          // Update its GalleryName property
          const updatedGalleries = [...existingGalleries.HTX_ClassGallery];
          updatedGalleries[galleryIndex].GalleryName = update_HTX_ClassGallery_by_pk.GalleryName;

          // Write our data back to the cache.
          cache.writeQuery({
            query: GET_GALLERIES,
            data: { ...existingGalleries, HTX_ClassGallery: updatedGalleries },
          });
        }
      }
    },
  });

  // Update function to modify the cache after the mutation
  const { mutate: toggleVisibility, onError: onError_toggleVisibility } = useMutation(TOGGLE_VISIBILITY_MUTATION, {
      update: (cache, { data: { update_HTX_ClassGallery_by_pk } }) => {
        const existingGalleries = cache.readQuery({ query: GET_GALLERIES });

        // Check if the data is in the cache
        if (existingGalleries) {
          // Find the gallery we just updated
          const galleryIndex = existingGalleries.HTX_ClassGallery.findIndex(gallery => gallery.GalleryID === update_HTX_ClassGallery_by_pk.GalleryID);

          if (galleryIndex > -1) {
            // Update its IsShow property
            const updatedGalleries = [...existingGalleries.HTX_ClassGallery];
            updatedGalleries[galleryIndex].IsShow = update_HTX_ClassGallery_by_pk.IsShow;

            // Write our data back to the cache.
            cache.writeQuery({
              query: GET_GALLERIES,
              data: { ...existingGalleries, HTX_ClassGallery: updatedGalleries },
            });
          }
        }
      },
    });

  // Function to delete a gallery by its ID
  const deleteGalleryById = async (galleryID) => {
    // Increment the number of pending async operations
    awaitNumber.value++;
    try {
      const coverResponse = await axios.delete(baseURL, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'path': 'ClassGalleryCover/'+galleryID
        }})
      const response = await axios.delete(baseURL, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          path: 'ClassGalleryPhotos/'+galleryID
        }})

      // Call the deleteGallery mutation
      await deleteGallery({
        GalleryID: galleryID
      });
    } catch (error) {
      console.error(error);
    } finally {
      // Decrement the number of pending async operations
      awaitNumber.value--;
    }
  };

  // Function to toggle the visibility of a gallery
  const toggleVisibilityById = async (galleryID) => {
    // Increment the number of pending async operations
    awaitNumber.value++;
    try {
      // Call the toggleVisibility mutation
      await toggleVisibility({
        GalleryID: galleryID,
        IsShow: result.value.find((element) => element.GalleryID == galleryID).IsShow == 1? 0: 1
      });
    } catch (error) {
      console.error(error);
    } finally {
      // Decrement the number of pending async operations
      awaitNumber.value--;
    }
  };

  // Function to toggle the visibility of a gallery
  const renameGalleryById = async (options) => {
    const { GalleryID, GalleryName } = options;
    // Increment the number of pending async operations
    awaitNumber.value++;
    try {
      // Call the toggleVisibility mutation
      await renameGallery({
        GalleryID: GalleryID,
        GalleryName: GalleryName
      });
    } catch (error) {
      console.error(error);
    } finally {
      // Decrement the number of pending async operations
      awaitNumber.value--;
    }
  };

  // Function to toggle the visibility of a gallery
  const updateCoverById = async (options) => {
    const { GalleryID, CoverPic } = options;
    // Increment the number of pending async operations
    awaitNumber.value++;
    try {
      // Call the toggleVisibility mutation
      await updateCover({
        GalleryID: GalleryID,
        CoverPic: CoverPic
      });
    } catch (error) {
      console.error(error);
    } finally {
      // Decrement the number of pending async operations
      awaitNumber.value--;
    }
  };
  */

  // Function to add a new attendance
  const addAttendance = async (objects) => {
    // Increment the number of pending async operations
    awaitNumber.value++;
    try {
      // Call the addAttendance mutation
      await AddAttendance({
        objects: objects
      });
    } catch (error) {
      console.error(error);
    } finally {
      // Decrement the number of pending async operations
      awaitNumber.value--;
    }
  };
  /*
  onError_deleteGallery((error) => {
    // Handle error
    console.error("刪除相薄失敗", error)
  });

  onError_toggleVisibility((error) => {
    // Handle error
    console.error("隱藏顯示相簿失敗", error)
  });

  // Handle error for renameGallery
  onError_renameGallery((error) => {
    // Handle error
    console.error("Renaming gallery failed", error)
  });

  // Handle error for updateCover
  onError_updateCover((error) => {
    // Handle error
    console.error("Updating cover failed", error)
  });
  */
  // Handle error for addGallery
  onError_addAttendance((error) => {
    // Handle error
    console.error("Adding attendance failed", error)
  });

  // Function to execute the query
  const execute = async () => {
    const { onResult } = useQuery(GET_ATTENDANCE,
      () => ({
        c_act_code: c_act_code,
      }));

    onResult((res) => {
      if (res.data) {
        result.value = res.data
        awaitNumber.value--;
      }
    })
  }

  // Execute the query
  execute();

  // Return the provided data and functions
  //return { result, loading, deleteGalleryById, toggleVisibilityById, refetch: execute, renameGalleryById, updateCoverById, addNewGallery };
  return { result, loading, addAttendance };
}
