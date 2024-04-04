import { ref, computed } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import { gql } from "graphql-tag";
import { date, extend } from "quasar";
import { useNotifier } from "./notifier";
import { apolloClient } from "src/boot/apollo";
import { provideApolloClient } from "@vue/apollo-composable";
provideApolloClient(apolloClient);

// Function to provide event data
export function useEventProvider(options = {}) {
  // Destructure parameters from options
  const {
    c_act_code = ref(),
    loadEvaluation = ref(false),
    loadSession = ref(false),
    loadFullDetail = ref(false),
    loadWeb = ref(false),
    loadFee = ref(false),
  } = options;

  // Ref to keep track of the number of pending async operations
  const awaitNumber = ref(0);

  // Computed property that indicates whether there are any pending async operations
  const loading = computed(() => awaitNumber.value > 0);

  // Ref to store the result of the async operations
  const result = ref([]);

  // returned message to be displayed to client
  const message = ref({});

  // GraphQL query string
  const GET_EVENT = gql`
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
        plan_volunteer_count
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
        i_number_a
        i_people_count_a
        i_number_b
        i_people_count_b
        i_number_c
        i_people_count_c
        inCenter
        s_GUID
      }
    }
    fragment IncludeFee on HTX_Event {
      Event_to_Fee {
        c_act_code
        c_type
        u_fee
      }
    }
    query GetEvent(
      $c_act_code: String! = ""
      $loadEvaluation: Boolean! = false
      $loadSession: Boolean! = false
      $loadFullDetail: Boolean! = false
      $loadWeb: Boolean! = false
      $loadAccount: Boolean! = false
      $loadFee: Boolean! = false
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
        ...IncludeFee @include(if: $loadFee)
      }
    }
  `;

  // Mutation for submitting plan
  const SUBMIT_PLAN = gql`
    mutation submitPlanFromUUID(
      $uuid: uniqueidentifier = ""
      $staff_name: String = ""
      $submit_plan_date: smalldatetime = ""
      $logObject: Log_insert_input! = {}
    ) {
      update_Event_Evaluation_by_pk(
        pk_columns: { uuid: $uuid }
        _set: {
          staff_name: $staff_name
          submit_plan_date: $submit_plan_date
          ic_plan_date: null
        }
      ) {
        uuid
        c_act_code
        submit_plan_date
        staff_name
      }
      insert_Log_one(object: $logObject) {
        log_id
      }
    }
  `;

  // Mutation for deleting an event
  const DELETE_EVENT_BY_PK = gql`
    mutation delEventByPK(
      $logObject: Log_insert_input! = {}
      $c_act_code: String = ""
    ) {
      delete_HTX_Event_by_pk(c_act_code: $c_act_code) {
        c_act_code
      }
      insert_Log_one(object: $logObject) {
        log_id
        username
      }
    }
  `;

  // Mutation for updating an event
  const UPDATE_EVENT_BY_PK = gql`
    mutation updateEventByPK(
      $logObject: Log_insert_input! = {}
      $c_act_code: String = ""
      $object: HTX_Event_set_input = {}
    ) {
      update_HTX_Event_by_pk(
        pk_columns: { c_act_code: $c_act_code }
        _set: $object
      ) {
        Gen_m_remark
        IsShow
        b_can_repeat_reg
        b_course
        b_finish
        b_freeofcharge
        b_hardcopy
        b_not_change_price
        b_open_oth
        b_open_own
        b_print_age
        b_print_birth
        b_print_no_period
        b_print_other
        b_print_time
        c_acc_type
        c_act_code
        c_act_name
        c_act_nameen
        c_acttype_control
        c_acttype_together
        c_age_control
        c_apply_code
        c_appraises
        c_centre_id
        c_check_acttype
        c_check_memtype
        c_checksex
        c_corwithmember
        c_course_level
        c_course_no
        c_course_tutor
        c_course_tutor2
        c_course_tutor3
        c_course_tutor4
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
        c_subsidizes
        c_type
        c_user_id
        c_vol_level_1
        c_vol_level_2
        c_vol_level_3
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
        i_course_credit1
        i_course_credit2
        i_course_credit3
        i_course_credit4
        i_course_credit5
        i_lessons
        i_lessons_attend1
        i_lessons_attend2
        i_lessons_attend3
        i_lessons_attend4
        i_lessons_attend5
        i_quota_cssa_max
        i_quota_max
        i_success_percent
        i_year_from
        i_year_to
        m_appraises_rem
        m_content
        m_evaluation_rem
        m_other_rem
        m_remark
        m_remind_content
        poster
        s_GUID
        s_Generation
        s_Lineage
        u_income
        u_tutor_pay
      }
      insert_Log_one(object: $logObject) {
        log_id
        username
      }
    }
  `;

  // Mutation for updating event fee
  const UPDATE_EVENT_FEE = gql`
    mutation updateEventFee(
      $logObject: Log_insert_input! = {}
      $objects: [tbl_act_fee_insert_input!] = {}
    ) {
      insert_tbl_act_fee(
        objects: $objects
        if_matched: {
          match_columns: [c_type, c_act_code]
          update_columns: [u_fee]
        }
      ) {
        affected_rows
        returning {
          c_act_code
          c_type
          u_fee
        }
      }
      insert_Log_one(object: $logObject) {
        log_id
        username
      }
    }
  `;

  // Mutation for deleting event fee
  const DELETE_EVENT_FEE = gql`
    mutation deleteEventFee(
      $logObject: Log_insert_input! = {}
      $c_act_code: [String!] = ""
      $c_type: [String!] = ""
    ) {
      delete_tbl_act_fee(
        where: { c_act_code: { _in: $c_act_code }, c_type: { _in: $c_type } }
      ) {
        returning {
          c_act_code
          c_type
          u_fee
        }
      }
      insert_Log_one(object: $logObject) {
        log_id
        username
      }
    }
  `;

  const UPDATE_EVENT_STAT_BY_PK = gql`
    mutation updateEventStatByPK(
      $logObject: Log_insert_input! = {}
      $objects: [tbl_act_session_insert_input!] = {}
    ) {
      insert_tbl_act_session(
        objects: $objects
        if_matched: {
          match_columns: [s_GUID]
          update_columns: [
            inCenter
            d_act
            i_number
            i_number_a
            i_number_b
            i_number_c
            i_people_count
            i_people_count_a
            i_people_count_b
            i_people_count_c
          ]
        }
      ) {
        affected_rows
        returning {
          c_act_code
          d_act
          inCenter
          s_GUID
        }
      }
      insert_Log_one(object: $logObject) {
        log_id
        username
      }
    }
  `;
  /***
   * submitPlan: Function to execute the SUBMIT_PLAN mutation.
   * onDone_submitPlan: Callback function that is called when the SUBMIT_PLAN mutation successfully completes.
   * onError_submitPlan: Callback function that is called when an error occurs while executing the SUBMIT_PLAN mutation.
   * ***/
  const {
    mutate: submitPlan,
    onError: onError_submitPlan,
    onDone: onDone_submitPlan,
  } = useMutation(SUBMIT_PLAN, {
    update: (cache, { data: { update_Event_Evaluation_by_pk } }) => {
      const existingEvent = cache.readQuery({
        query: GET_EVENT,
        variables: {
          c_act_code: update_Event_Evaluation_by_pk.c_act_code.trim(),
          loadEvaluation: true,
        },
      });
      // Check if the data is in the cache
      if (existingEvent) {
        // Update its submit_plan_date
        let updatedEvent = {};
        extend(true, updatedEvent, existingEvent.HTX_Event_by_pk);
        updatedEvent.Event_to_Evaluation[0].submit_plan_date =
          update_Event_Evaluation_by_pk.submit_plan_date;
        // Write our data back to the cache.
        cache.writeQuery({
          query: GET_EVENT,
          variables: {
            c_act_code: update_Event_Evaluation_by_pk.c_act_code.trim(),
            loadEvaluation: true,
          },
          data: { ...existingEvent, HTX_Event_by_pk: updatedEvent },
        });
      }
    },
  });

  onDone_submitPlan((res) => {
    if (res.data) {
      if (process.env.NODE_ENV != "development") {
        const { result } = useNotifier({
          topic: "eventApprove",
          data: {
            title: "提交活動計劃",
            body:
              "[" +
              res.data.update_Event_Evaluation_by_pk.staff_name.trim() +
              "]" +
              "提交了活動計劃" +
              res.data.update_Event_Evaluation_by_pk.c_act_code,
          },
        });

        result.value
          .then((r) => {
            if (r.data) {
              message.value =
                "成功提交了活動計劃 - " +
                res.data.update_Event_Evaluation_by_pk.c_act_code;
            }
          })
          .catch((error) => {
            message.value = "提交活動計劃失敗";
          });
      } else {
        // development channel
        const { result } = useNotifier({
          topic: "uqhehdGADfWYglt9jDfaab0LGrC3",
          data: {
            title: "[DEV]提交活動計劃",
            body:
              "[" +
              res.data.update_Event_Evaluation_by_pk.staff_name.trim() +
              "]" +
              "提交了活動計劃" +
              res.data.update_Event_Evaluation_by_pk.c_act_code,
          },
        });

        result.value
          .then((r) => {
            if (r.data) {
              message.value =
                "成功提交了活動計劃 - " +
                res.data.update_Event_Evaluation_by_pk.c_act_code;
            }
          })
          .catch((e) => {
            console.log("error: ", e);
            message.value = "提交活動計劃失敗";
          });
      }
    }
  });

  onError_submitPlan((error) => {
    message.value = "操作失敗，請聯絡系統管理員。";
  });

  /***
   * deleteEvent: Function to execute the DELETE_EVENT mutation.
   * onDone_deleteEvent: Callback function that is called when the DELETE_EVENT mutation successfully completes.
   * It modifies the cache to remove the deleted event from the events list.
   * onError_deleteEvent: Callback function that is called when an error occurs while executing the DELETE_EVENT mutation.
   * ***/
  const {
    mutate: deleteEvent,
    onError: onError_deleteEvent,
    onDone: onDone_deleteEvent,
  } = useMutation(DELETE_EVENT_BY_PK, {
    update: (cache, { data: { delete_HTX_Event_by_pk } }) => {
      // Evict the event from the cache
      cache.evict({
        c_act_code: cache.identify({
          __typename: "HTX_Event",
          c_act_code: delete_HTX_Event_by_pk.c_act_code,
        }),
      });
      cache.gc();
    },
  });

  onDone_deleteEvent((res) => {
    if (res.data) {
      if (process.env.NODE_ENV != "development") {
        // no notification for delete event
        // message return to client
        message.value =
          "成功刪除活動 - " + res.data.delete_HTX_Event_by_pk.c_act_code.trim();
      } else {
        // development channel
        const { result } = useNotifier({
          topic: "uqhehdGADfWYglt9jDfaab0LGrC3",
          data: {
            title: "[DEV]刪除活動",
            body:
              "[" +
              res.data.insert_Log_one.username.trim() +
              "]" +
              "刪除了活動" +
              res.data.delete_HTX_Event_by_pk.c_act_code.trim(),
          },
        });

        result.value
          .then((r) => {
            if (r.data) {
              message.value =
                "成功刪除活動 - " +
                res.data.delete_HTX_Event_by_pk.c_act_code.trim();
            }
          })
          .catch((e) => {
            console.log("error: ", e);
            message.value =
              "刪除活動" +
              res.data.delete_HTX_Event_by_pk.c_act_code.trim() +
              "失敗";
          });
      }
    } else {
      // error
      message.value =
        "刪除活動" + res.data.delete_HTX_Event_by_pk.c_act_code.trim() + "失敗";
    }
  });

  onError_deleteEvent((error) => {
    message.value = "操作失敗，請聯絡系統管理員。";
  });

  const {
    mutate: updateEvent,
    onError: onError_updateEvent,
    onDone: onDone_updateEvent,
  } = useMutation(UPDATE_EVENT_BY_PK, {
    update: (cache, { data: { update_HTX_Event_by_pk } }) => {
      // console.log("update_HTX_Event_by_pk", update_HTX_Event_by_pk)
      // update the cache
      const existingEvent = cache.readQuery({
        query: GET_EVENT,
        variables: { c_act_code: update_HTX_Event_by_pk.c_act_code.trim() },
      });
      // Check if the data is in the cache
      if (existingEvent) {
        // Update its submit_plan_date
        let updatedEvent = {};
        extend(true, updatedEvent, existingEvent.HTX_Event_by_pk);
        extend(true, updatedEvent, update_HTX_Event_by_pk);
        // Write our data back to the cache.
        cache.writeQuery({
          query: GET_EVENT,
          variables: { c_act_code: update_HTX_Event_by_pk.c_act_code.trim() },
          data: { ...existingEvent, HTX_Event_by_pk: updatedEvent },
        });
      }
    },
  });

  onDone_updateEvent((res) => {
    if (res.data) {
      if (process.env.NODE_ENV != "development") {
        // no notification for delete event
        // message return to client
        message.value =
          "成功更新活動 - " + res.data.update_HTX_Event_by_pk.c_act_code.trim();
      } else {
        // development channel
        const { result } = useNotifier({
          topic: "uqhehdGADfWYglt9jDfaab0LGrC3",
          data: {
            title: "[DEV]更新活動",
            body:
              "[" +
              res.data.insert_Log_one.username.trim() +
              "]" +
              "更新了活動" +
              res.data.update_HTX_Event_by_pk.c_act_code.trim(),
          },
        });

        result.value
          .then((r) => {
            if (r.data) {
              message.value =
                "成功更新活動 - " +
                res.data.update_HTX_Event_by_pk.c_act_code.trim();
            }
          })
          .catch((e) => {
            console.log("error: ", e);
            message.value =
              "更新活動" +
              res.data.update_HTX_Event_by_pk.c_act_code.trim() +
              "失敗";
          });
      }
    } else {
      // error
      message.value =
        "更新活動" + res.data.update_HTX_Event_by_pk.c_act_code.trim() + "失敗";
    }
  });

  /***
   * updateEventFee: Function to execute the UPDATE_EVENT_FEE mutation.
   * onDone_updateEventFee: Callback function that is called when the UPDATE_EVENT_FEE mutation successfully completes.
   * It modifies the cache to update the event fee.
   * onError_updateEventFee: Callback function that is called when an error occurs while executing the UPDATE_EVENT_FEE mutation.
   * ***/
  const {
    mutate: updateEventFee,
    onError: onError_updateEventFee,
    onDone: onDone_updateEventFee,
  } = useMutation(UPDATE_EVENT_FEE, {
    update: (cache, { data: { insert_tbl_act_fee } }) => {
      // console.log("insert_tbl_act_fee", insert_tbl_act_fee);
      const existingEvent = cache.readQuery({
        query: GET_EVENT,
        variables: {
          c_act_code: insert_tbl_act_fee.returning[0].c_act_code.trim(),
          loadFee: true,
        },
      });
      // Check if the data is in the cache
      if (existingEvent) {
        // Update its submit_plan_date
        let updatedEvent = {};
        extend(true, updatedEvent, existingEvent.HTX_Event_by_pk);
        insert_tbl_act_fee.returning.forEach((fee, index) => {
          if (
            updatedEvent.Event_to_Fee.map((f) => f.c_type.trim()).includes(
              fee.c_type.trim()
            )
          ) {
            updatedEvent.Event_to_Fee[index].u_fee =
              insert_tbl_act_fee.returning.filter(
                (f) => f.c_type.trim() == fee.c_type.trim()
              )[0].u_fee;
          } else {
            updatedEvent.Event_to_Fee.push({
              c_act_code: insert_tbl_act_fee.returning[0].c_act_code.trim(),
              c_type: insert_tbl_act_fee.returning[0].c_type.trim(),
              u_fee: insert_tbl_act_fee.returning[0].u_fee,
            });
          }
        });

        // Write our data back to the cache.
        cache.writeQuery({
          query: GET_EVENT,
          variables: {
            c_act_code: insert_tbl_act_fee.returning[0].c_act_code.trim(),
            loadFee: true,
          },
          data: { ...existingEvent, HTX_Event_by_pk: updatedEvent },
        });
      }
    },
  });

  onDone_updateEventFee((res) => {
    if (res.data) {
      if (process.env.NODE_ENV != "development") {
        // no notification for delete event
        // message return to client
        message.value =
          "成功更新活動收費 - " +
          res.data.insert_tbl_act_fee.returning[0].c_act_code.trim();
      } else {
        // development channel
        const { result } = useNotifier({
          topic: "uqhehdGADfWYglt9jDfaab0LGrC3",
          data: {
            title: "[DEV]更新活動收費",
            body:
              "[" +
              res.data.insert_Log_one.username.trim() +
              "]" +
              "更新了活動收費" +
              res.data.insert_tbl_act_fee.returning[0].c_act_code.trim(),
          },
        });

        result.value
          .then((r) => {
            if (r.data) {
              message.value =
                "成功更新活動收費 - " +
                res.data.insert_tbl_act_fee.returning[0].c_act_code.trim();
            }
          })
          .catch((e) => {
            console.log("error: ", e);
            message.value =
              "更新活動收費" +
              res.data.insert_tbl_act_fee.returning[0].c_act_code.trim() +
              "失敗";
          });
      }
    } else {
      // error
      message.value =
        "更新活動收費" +
        res.data.insert_tbl_act_fee.returning[0].c_act_code.trim() +
        "失敗";
    }
  });

  onError_updateEventFee((error) => {
    message.value = "更新活動收費失敗，請聯絡系統管理員。";
  });

  const {
    mutate: deleteEventFee,
    onError: onError_deleteEventFee,
    onDone: onDone_deleteEventFee,
  } = useMutation(DELETE_EVENT_FEE, {
    update: (cache, { data: { delete_tbl_act_fee } }) => {
      const existingEvent = cache.readQuery({
        query: GET_EVENT,
        variables: {
          c_act_code: delete_tbl_act_fee.returning[0].c_act_code.trim(),
          loadFee: true,
        },
      });
      // Check if the data is in the cache
      if (existingEvent?.HTX_Event_by_pk) {
        // Update its submit_plan_date
        let updatedEvent = {};
        extend(true, updatedEvent, existingEvent.HTX_Event_by_pk);

        // Filter out the deleted fees from the Event_to_Fee array.
        updatedEvent.Event_to_Fee = updatedEvent.Event_to_Fee.filter(
          (fee) =>
            !delete_tbl_act_fee.returning.some(
              (delFee) => delFee.c_type === fee.c_type
            )
        );

        // Write our data back to the cache.
        cache.writeQuery({
          query: GET_EVENT,
          variables: {
            c_act_code: delete_tbl_act_fee.returning[0].c_act_code.trim(),
            loadFee: true,
          },
          data: { ...existingEvent, HTX_Event_by_pk: updatedEvent },
        });
      }
    },
  });

  onDone_deleteEventFee((res) => {
    if (res.data) {
      if (process.env.NODE_ENV != "development") {
        // no notification for delete event
        // message return to client
        message.value =
          "成功刪除活動收費 - " +
          res.data.delete_tbl_act_fee.returning[0].c_act_code.trim() +
          " - " +
          res.data.delete_tbl_act_fee.returning[0].c_type.trim();
      } else {
        // development channel
        const { result } = useNotifier({
          topic: "uqhehdGADfWYglt9jDfaab0LGrC3",
          data: {
            title: "[DEV]刪除活動收費",
            body:
              "[" +
              res.data.insert_Log_one.username.trim() +
              "]" +
              "刪除了活動收費" +
              res.data.delete_tbl_act_fee.returning[0].c_act_code.trim(),
          },
        });

        result.value
          .then((r) => {
            if (r.data) {
              message.value =
                "成功刪除活動收費 - " +
                res.data.delete_tbl_act_fee.returning[0].c_act_code.trim() +
                " - " +
                res.data.delete_tbl_act_fee.returning[0].c_type.trim();
            }
          })
          .catch((e) => {
            console.log("error: ", e);
            message.value =
              "刪除活動收費" +
              res.data.delete_tbl_act_fee.returning[0].c_act_code.trim() +
              "失敗";
          });
      }
    } else {
      // error
      message.value =
        "刪除活動收費" +
        res.data.delete_tbl_act_fee.returning[0].c_act_code.trim() +
        "失敗";
    }
  });

  onError_updateEventFee((error) => {
    message.value = "刪除活動收費失敗，請聯絡系統管理員。";
  });

  const {
    mutate: updateEventStat,
    onError: onError_updateEventStat,
    onDone: onDone_updateEventStat,
  } = useMutation(UPDATE_EVENT_STAT_BY_PK, {
    update: (cache, { data: { insert_tbl_act_session } }) => {
      const existingEvent = cache.readQuery({
        query: GET_EVENT,
        variables: {
          c_act_code: insert_tbl_act_session.returning[0].c_act_code.trim(),
          loadSession: true,
        },
      });
      // Check if the data is in the cache
      if (existingEvent) {
        console.log("existingEvent", existingEvent);
        // Update its submit_plan_date
        /* 
        let updatedEvent = {};
        extend(true, updatedEvent, existingEvent.HTX_Event_by_pk);
        updatedEvent.Event_to_Evaluation[0].submit_plan_date =
          update_Event_Evaluation_by_pk.submit_plan_date;
        // Write our data back to the cache.
        cache.writeQuery({
          query: GET_EVENT,
          variables: {
            c_act_code: update_Event_Evaluation_by_pk.c_act_code.trim(),
            loadEvaluation: true,
          },
          data: { ...existingEvent, HTX_Event_by_pk: updatedEvent },
        }); */
      }
    },
  });

  onDone_updateEventStat((res) => {
    if (res.data) {
      if (process.env.NODE_ENV != "development") {
        // no notification for delete event
        // message return to client
        message.value =
          "成功更新活動統計 - " +
          res.data.insert_tbl_act_session.returning[0].c_act_code.trim();
      } else {
        // development channel
        const { result } = useNotifier({
          topic: "uqhehdGADfWYglt9jDfaab0LGrC3",
          data: {
            title: "[DEV]更新活動統計",
            body:
              "[" +
              res.data.insert_Log_one.username.trim() +
              "]" +
              "更新了活動統計" +
              res.data.delete_tbl_act_fee.returning[0].c_act_code.trim(),
          },
        });

        result.value
          .then((r) => {
            if (r.data) {
              message.value =
                "成功更新活動統計 - " +
                res.data.insert_tbl_act_session.returning[0].c_act_code.trim();
            }
          })
          .catch((e) => {
            console.log("error: ", e);
            message.value =
              "更新活動統計" +
              res.data.insert_tbl_act_session.returning[0].c_act_code.trim() +
              "失敗";
          });
      }
    } else {
      // error
      message.value =
        "更新活動統計" +
        res.data.insert_tbl_act_session.returning[0].c_act_code.trim() +
        "失敗";
    }
  });

  onError_updateEventStat((error) => {
    message.value = "更新活動統計失敗，請聯絡系統管理員。";
  });

  // Function to submit event plan / evaluation by id
  const submitPlanById = async (payload) => {
    const { uuid, staff_name, c_act_code } = payload;
    // console.log("submitPlanById", payload)
    // Increment the number of pending async operations
    awaitNumber.value++;
    try {
      // Call the toggleVisibility mutation
      await submitPlan({
        uuid: uuid,
        staff_name: staff_name,
        submit_plan_date: date.formatDate(new Date(), "YYYY-MM-DDTHH:mm:ss"),
        logObject: {
          username: staff_name,
          datetime: date.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
          module: "活動系統",
          action: "提交活動計劃: " + c_act_code,
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      // Decrement the number of pending async operations
      awaitNumber.value--;
    }
  };

  // delete event
  const deleteEventById = async (payload) => {
    const { eventContent, staff_name, c_act_code } = payload;
    // Increment the number of pending async operations
    awaitNumber.value++;
    try {
      // Call the deleteEvent mutation
      await deleteEvent({
        c_act_code: c_act_code,
        logObject: {
          username: staff_name,
          datetime: date.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
          module: "活動系統",
          action:
            "刪除活動: " +
            c_act_code +
            "。最後資料:" +
            JSON.stringify(eventContent, null, 2),
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      // Decrement the number of pending async operations
      awaitNumber.value--;
    }
  };

  // update event
  const updateEventById = async (payload) => {
    const { eventContent, staff_name, c_act_code } = payload;
    // console.log("payload", payload)
    // Increment the number of pending async operations
    awaitNumber.value++;
    try {
      // Call the deleteEvent mutation
      await updateEvent({
        c_act_code: c_act_code,
        logObject: {
          username: staff_name,
          datetime: date.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
          module: "活動系統",
          action:
            "修改活動: " +
            c_act_code +
            "。新資料:" +
            JSON.stringify(eventContent, null, 2),
        },
        object: eventContent,
      });
    } catch (error) {
      console.error(error);
    } finally {
      // Decrement the number of pending async operations
      awaitNumber.value--;
    }
  };

  // update event fee
  const updateEventFeeById = async (payload) => {
    const { feeObject, staff_name, c_act_code } = payload;
    // console.log("payload", payload)
    // Increment the number of pending async operations
    awaitNumber.value++;
    try {
      // Call the deleteEvent mutation
      await updateEventFee({
        c_act_code: c_act_code,
        logObject: {
          username: staff_name,
          datetime: date.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
          module: "活動系統",
          action:
            "修改活動" +
            c_act_code +
            "收費。資料:" +
            JSON.stringify(feeObject, null, 2),
        },
        objects: feeObject,
      });
    } catch (error) {
      console.error(error);
    } finally {
      // Decrement the number of pending async operations
      awaitNumber.value--;
    }
  };

  const deleteEventFeeById = async (payload) => {
    const { feeObject, staff_name, c_act_code } = payload;
    // console.log("payload", payload)
    // Increment the number of pending async operations
    awaitNumber.value++;
    try {
      // Call the deleteEvent mutation
      await deleteEventFee({
        c_act_code: c_act_code,
        logObject: {
          username: staff_name,
          datetime: date.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
          module: "活動系統",
          action:
            "刪除活動" +
            c_act_code +
            "收費。資料:" +
            JSON.stringify(feeObject, null, 2),
        },
        c_type: feeObject,
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

    const { onResult } = useQuery(GET_EVENT, () => ({
      c_act_code: c_act_code.value,
      loadEvaluation: loadEvaluation.value,
      loadSession: loadSession.value,
      loadFullDetail: loadFullDetail.value,
      loadWeb: loadWeb.value,
      loadFee: loadFee.value,
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
  return {
    result,
    message,
    loading,
    submitPlanById,
    refetch: execute,
    deleteEventById,
    updateEventById,
    updateEventFeeById,
    deleteEventFeeById,
  };
}
