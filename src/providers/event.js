import { ref, computed } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { gql } from "graphql-tag"

// Function to provide attendance data
export function useEventProvider(options = {}) {
  // Destructure galleryID from options, default to a new ref if not provided
  const {
    c_act_code = ref(),
    loadEvaluation = ref(false),
    loadSession = ref(false),
    loadFullDetail = ref(false),
    loadWeb = ref(false),
  } = options

  // Ref to keep track of the number of pending async operations
  const awaitNumber = ref(0);

  // Computed property that indicates whether there are any pending async operations
  const loading = computed(() => awaitNumber.value > 0);

  // Ref to store the result of the async operations
  const result = ref([]);

  // GraphQL query string
  let GET_EVENT = gql`
  fragment IncludeFullDetail on HTX_Event {
    s_GUID
    s_Generation
    s_Lineage
    u_income
    u_tutor_pay
    i_success_percent
    i_year_from
    i_year_to
    c_vol_level_1
    c_vol_level_2
    c_vol_level_3
    i_course_credit1
    i_course_credit2
    i_course_credit3
    i_course_credit4
    i_course_credit5
    i_lessons_attend1
    i_lessons_attend2
    i_lessons_attend3
    i_lessons_attend4
    i_lessons_attend5
    c_subsidizes
    c_course_tutor2
    c_course_tutor3
    c_course_tutor4
    c_centre_id
    c_check_acttype
    c_check_memtype
    c_checksex
    c_corwithmember
    c_course_level
    c_acttype_control
    c_acttype_together
    c_age_control
    c_apply_code
    c_appraises
    b_print_age
    b_print_birth
    b_print_no_period
    b_print_other
    b_print_time
    b_hardcopy
  }
  fragment IncludeWeb on HTX_Event {
    EventContent
    EventContentEN
  }
  fragment IncludeEvaluation on HTX_Event {
    Event_to_Evaluation {
      attendance
      remarks
      c_act_code
      eval_attend_headcount_children
      eval_attend_headcount_others
      eval_attend_headcount_parent
      eval_attend_headcount_youth
      eval_attend_session_children
      eval_attend_session_others
      eval_attend_session_parent
      eval_end_date
      eval_attend_session_youth
      eval_end_time
      eval_sessions
      eval_start_date
      eval_start_time
      eval_volunteer_count
      ic
      ic_plan_date
      ic_eval_date
      objective
      objective_achieved
      objective_achieved_reason
      objective_followup
      objective_detail
      objective_review_method
      plan_attend_headcount_children
      plan_attend_headcount_others
      plan_attend_headcount_parent
      plan_attend_headcount_youth
      plan_attend_session_children
      plan_attend_session_others
      plan_attend_session_parent
      plan_attend_session_youth
      plan_end_date
      plan_end_time
      plan_start_date
      plan_start_time
      plan_sessions
      staff_name
      submit_plan_date
      submit_eval_date
      supervisor
      supervisor_date
      uuid
      supervisor_comment
      ic_comment
      tutor_name
      tutor_phone
      partner_agency
      partner_name
      partner_phone
      Evaluation_to_Account {
        account_uuid
        amount
        c_act_code
        description
        eval_uuid
        planeval
        type
        txn_date
      }
    }
  }
  fragment IncludeSession on HTX_Event {
    Event_to_Session {
      c_act_code
      d_act
      i_number
      i_people_count
      inCenter
      s_GUID
    }
  }
  query GetEvent(
    $c_act_code: String! = "",
    $loadEvaluation: Boolean! = false,
    $loadSession: Boolean! = false,
    $loadFullDetail: Boolean! = false,
    $loadWeb: Boolean! = false,
    $loadAccount: Boolean! = false
  ) {
    HTX_Event_by_pk(c_act_code: $c_act_code) {
      EventClassID
      Gen_m_remark
      IsShow
      b_can_repeat_reg
      b_course
      b_finish
      b_freeofcharge
      b_not_change_price
      b_open_oth
      b_open_own
      c_act_code
      c_acc_type
      c_act_name
      c_act_nameen
      c_course_no
      c_course_tutor
      c_course_type
      c_dest
      c_end_collect
      c_finish_goal
      c_group1
      c_group2
      c_memtype_control
      c_nature
      c_open_other
      c_ref
      c_remind_header
      c_respon
      c_respon2
      c_sex_control
      c_start_collect
      c_status
      c_type
      c_user_id
      c_week
      c_whojoin
      c_worker
      c_worker2
      d_close
      d_date_from
      d_date_to
      d_finish_goal
      d_open
      d_sale_end
      d_sale_start
      d_time_from
      d_time_to
      i_lessons
      i_quota_cssa_max
      i_quota_max
      m_appraises_rem
      m_content
      m_evaluation_rem
      m_other_rem
      m_remark
      m_remind_content
      poster
      ...IncludeWeb @include(if: $loadWeb)
      ...IncludeFullDetail @include(if: $loadFullDetail)
      ...IncludeEvaluation @include(if: $loadEvaluation)
      ...IncludeSession @include(if: $loadSession)
    }
  }`;

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

  // Function to toggle the visibility of a gallery
  const addNewGallery = async (GalleryName) => {
    //const { GalleryName } = options;
    // Increment the number of pending async operations
    awaitNumber.value++;
    try {
      // Call the toggleVisibility mutation
      await addGallery({
        GalleryName: GalleryName,
        GalleryNameEN: GalleryName,
      });
    } catch (error) {
      console.error(error);
    } finally {
      // Decrement the number of pending async operations
      awaitNumber.value--;
    }
  };

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

  // Handle error for addGallery
  onError_addGallery((error) => {
    // Handle error
    console.error("Adding gallery failed", error)
  });
  */
  // Function to execute the query
  const execute = async () => {
    const { onResult } = useQuery(GET_EVENT,
      () => ({
        c_act_code: c_act_code.value,
        loadEvaluation: loadEvaluation.value,
        loadSession: loadSession.value,
        loadFullDetail: loadFullDetail.value,
        loadWeb: loadWeb.value,
      }));

    onResult((res) => {
      if (res.data) {
        result.value = res.data
        /*
        res.data.HTX_ClassGallery.forEach((data) => {
          result.value.push({
            AddTime: new Date(data.AddTime),
            CoverPic: data.CoverPic? (data.CoverPic.includes("googleapis")? data.CoverPic: eventGalleryServerPath + data.CoverPic): null,
            GalleryName: data.GalleryName,
            GalleryNameEN: data.GalleryNameEN,
            IsShow: data.IsShow,
            Obsolete: data.CoverPic? !data.CoverPic.includes("googleapis"): false,
            GalleryID: data.GalleryID,
          })
        })*/
        awaitNumber.value--;
      }
    })
  }

  // Execute the query
  execute();

  // Return the provided data and functions
  //return { result, loading, deleteGalleryById, toggleVisibilityById, refetch: execute, renameGalleryById, updateCoverById, addNewGallery };
  return { result, loading };
}
