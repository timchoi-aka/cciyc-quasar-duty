<template>
  <!-- loading dialog -->
  <q-dialog v-model="waitingAsync" position="bottom">
    <LoadingDialog message="處理中" />
  </q-dialog>
  Number of Members: {{ Members.length }}
  <hr />
  <q-btn
    class="q-mt-md q-mx-md"
    :disable="migrated_relations.length == 0"
    @click="startMigrateRelation"
    label="1. Migrate Relation"
  />
  <q-btn
    class="q-mt-md q-mx-md"
    :disable="Members.length == 0"
    @click="consolidateMembership"
    label="2. Consolidate Membership"
  />
  <q-btn
    class="q-mt-md q-mx-md"
    :disable="Members.length == 0"
    @click="updateYouthRelatedMember"
    label="3. Update Youth Relation"
  />
  <q-btn
    class="q-mt-md q-mx-md"
    :disable="Members.length == 0"
    @click="updateMemberStatus4"
    label="4. Update Member Status"
  />
  <div>
    consolidateQueue:
    <div v-for="item in consolidateQueue" :key="item.c_mem_id">
      {{ item.c_mem_id }},
    </div>
  </div>
  <div>
    updateQueue:
    <q-list v-for="item in updateQueue" :key="item"> {{ item }}, </q-list>
  </div>
</template>

<script setup>
import {
  MIGRATE_RELATION,
  GET_RELATION_BY_PK,
} from "/src/graphQueries/Member/query.js";
import { gql } from "graphql-tag";
import LoadingDialog from "components/LoadingDialog.vue";
import { ref, computed, watch } from "vue";
import ageUtil from "src/lib/utils.js";
import { date as qdate } from "quasar";
import { useStore } from "vuex";
import { useQuery, useMutation } from "@vue/apollo-composable";

// variables
const $store = useStore();
const awaitServerResponse = ref(0);
const migrated_relations = ref([]);
const updateQueue = ref([]);
const consolidateQueue = ref([]);
const updateMembershipQueue = ref([]);
const membershipMap = ref({
  個人會員: "個人會員",
  永久會員: "永久會員",
  青年義工會員: "青年義工會員",
  "青年義工會員(15-24歲)": "青年義工會員",
  社工義工會員: "社區義工",
  社區義工: "社區義工",
  社區會員: "社區義工",
  "青年家人義工會員(25歲或以上)": "青年家人義工",
  "青年家人義工會員(14歲或以下)": "青年家人義工",
  "青年義工會員(12-14歲)": "青年義工會員",
  青年家人義工會員: "青年家人義工",
  青年家人義工: "青年家人義工",
  家庭會員: "個人會員",
  "": "",
});

const upsertCount = ref(1000);
const updateMembershipUpsertCount = ref(1000);
// watcher
watch(
  [updateQueue.value, consolidateQueue.value, updateMembershipQueue.value],
  (
    [newUpdateQueue, newConsolidateQueue, newUpdateMembershipQueue],
    [oldUpdateQueue, oldConsolidateQueue, oldUpdateMembershipQueue]
  ) => {
    if (newUpdateQueue.length > 0) {
      console.log("updating: " + newUpdateQueue[0]);
      awaitServerResponse.value++;
      updateYouthMemberStatusByMemberID.value = { c_mem_id: newUpdateQueue[0] };
    }

    if (newConsolidateQueue.length > 0) {
      //console.log("newConsolidateQueue:" + JSON.stringify(newConsolidateQueue))
      if (newConsolidateQueue.length < upsertCount.value)
        upsertCount.value = newConsolidateQueue.length;
      console.log(
        "consolidating records: " +
          newConsolidateQueue[0].c_mem_id +
          "-" +
          newConsolidateQueue[upsertCount.value - 1].c_mem_id
      );

      // upsertObject
      //
      let upsertObjects = [];
      for (let i = 0; i < upsertCount.value; i++) {
        upsertObjects = [...upsertObjects, newConsolidateQueue[i]];
      }
      updateMembership({
        upsertObjects: upsertObjects,
      });
      //
      /* per record
    updateMembership({
      c_mem_id: newConsolidateQueue[0].c_mem_id,
      b_mem_type1: newConsolidateQueue[0].b_mem_type1,
      c_udf_1: newConsolidateQueue[0].c_udf_1,
      d_enter_1: newConsolidateQueue[0].d_enter_1,
      d_exit_1: newConsolidateQueue[0].d_exit_1,
      d_renew_1: newConsolidateQueue[0].d_renew_1,
      d_expired_1: newConsolidateQueue[0].d_expired_1
    })
    */
    }

    if (newUpdateMembershipQueue.length > 0) {
      //console.log("newConsolidateQueue:" + JSON.stringify(newConsolidateQueue))
      if (newUpdateMembershipQueue.length < updateMembershipUpsertCount.value)
        updateMembershipUpsertCount.value = newUpdateMembershipQueue.length;
      console.log(
        "updating membership: " +
          newUpdateMembershipQueue[0].c_mem_id +
          "-" +
          newUpdateMembershipQueue[updateMembershipUpsertCount.value - 1]
            .c_mem_id
      );

      let upsertObjects = [];
      for (let i = 0; i < updateMembershipUpsertCount.value; i++) {
        upsertObjects = [...upsertObjects, newUpdateMembershipQueue[i]];
      }
      updateMemberStatus({
        upsertObjects: upsertObjects,
      });
    }
  }
);

// query
const { mutate: UpdateYouthMemberStatus } = useMutation(gql`
  mutation MemberAdmin_updateYouthMemberStatus(
    $c_mem_id: String = ""
    $c_udf_1: String = ""
    $b_mem_type1: Boolean = false
    $d_enter_1: datetime2
    $d_renew_1: datetime2
    $d_exit_1: datetime2
    $b_mem_type10: Boolean = false
    $d_expired_1: datetime2
    $logObject: Log_insert_input! = {}
  ) {
    update_Member_by_pk(
      pk_columns: { c_mem_id: $c_mem_id }
      _set: { b_mem_type10: $b_mem_type10, d_expired_1: $d_expired_1 }
    ) {
      c_mem_id
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }
`);

const { mutate: updateMemberStatus, onDone: updateMemberStatus_Completed } =
  useMutation(gql`
    mutation updateMemberStatus($upsertObjects: [Member_insert_input!] = []) {
      insert_Member(
        objects: $upsertObjects
        if_matched: { match_columns: c_mem_id, update_columns: [b_mem_type1] }
      ) {
        affected_rows
      }
    }
  `);
// per upsertObject, should be less transsaction but not working, maybe data size too large
const { mutate: updateMembership, onDone: updateMembership_Completed } =
  useMutation(gql`
    mutation updateMembership($upsertObjects: [Member_insert_input!] = []) {
      insert_Member(
        objects: $upsertObjects
        if_matched: {
          match_columns: c_mem_id
          update_columns: [c_udf_1, d_enter_1, d_renew_1, d_exit_1, d_expired_1]
        }
      ) {
        affected_rows
      }
    }
  `);

/* per record, small transactions but too many transactions
const { mutate: updateMembership, onDone: updateMembership_Completed } = useMutation(gql`
  mutation perRecord_updateMembership(
    $c_mem_id: String = "",
    $c_udf_1: String = "",
    $b_mem_type1: Boolean = false,
    $d_enter_1: datetime2,
    $d_renew_1: datetime2,
    $d_exit_1: datetime2,
    $d_expired_1: datetime2,
    ) {
    update_Member_by_pk(pk_columns: {c_mem_id: $c_mem_id},
      _set: {
        c_udf_1: $c_udf_1,
        b_mem_type1: $b_mem_type1
        d_enter_1: $d_enter_1,
        d_renew_1: $d_renew_1,
        d_exit_1: $d_exit_1,
        d_expired_1: $d_expired_1,
      }) {
      c_mem_id
    }
  }
`)
*/

const {
  onResult: GetRelationByPK_Completed,
  variables: updateYouthMemberStatusByMemberID,
  loading: updatingYouthMemberStatus,
} = useQuery(
  GET_RELATION_BY_PK,
  {
    c_mem_id: "",
  },
  {
    fetchPolicy: "network-only",
  }
);

const { onResult: onRelationResult } = useQuery(MIGRATE_RELATION);
const {
  mutate: migrateRelation,
  onDone: migrateRelation_Completed,
  onError: migrateRelation_Error,
} = useMutation(gql`
  mutation migrateRelation($migrated_relations: [Relation_insert_input!] = {}) {
    insert_Relation(objects: $migrated_relations) {
      affected_rows
    }
  }
`);

const { result: activeMembers } = useQuery(gql`
  query getAllMember {
    Member {
      c_mem_id
    }
  }
`);

// computed
const waitingAsync = computed(() => awaitServerResponse.value > 0);
const username = computed(() => $store.getters["userModule/getUsername"]);
const ActiveMembers = computed(
  () => activeMembers.value?.Member.map((a) => a.c_mem_id) ?? [""]
);
const Members = ref([]);
const Relations = ref([]);

const { onResult } = useQuery(
  gql`
    query MemberAdmin_getMemberNameFromID($c_mem_ids: [String!]) {
      Member(where: { c_mem_id: { _in: $c_mem_ids } }) {
        c_mem_id
        b_mem_type1
        b_mem_type2
        b_mem_type3
        b_mem_type4
        c_udf_1
        d_enter_1
        d_exit_1
        d_renew_1
        d_expired_1
        d_enter_2
        d_exit_2
        d_renew_2
        d_expired_2
        d_enter_3
        d_exit_3
        d_renew_3
        d_expired_3
        d_enter_4
        d_exit_4
        d_renew_4
        d_expired_4
        b_mem_type10
        d_birth
        c_name
        c_name_other
      }
      Relation(
        where: {
          _or: [
            { c_mem_id_1: { _in: $c_mem_ids } }
            { c_mem_id_2: { _in: $c_mem_ids } }
          ]
        }
      ) {
        uuid
        c_mem_id_1
        c_mem_id_2
        relation
      }
    }
  `,
  () => ({
    c_mem_ids: ActiveMembers.value,
  })
);

onRelationResult((result) => {
  if (result.data) {
    //if result is returned
    result.data.Member.forEach((mem) => {
      if (mem.c_mem_relative_memid) {
        migrated_relations.value.push({
          c_mem_id_1: mem.c_mem_id ? mem.c_mem_id : "",
          c_mem_id_2: mem.c_mem_relative_memid ? mem.c_mem_relative_memid : "",
          relation: mem.c_mem_relation ? mem.c_mem_relation : "",
        });
      }
    });
  }
});

// functions
function startMigrateRelation() {
  migrateRelation({
    migrated_relations: migrated_relations.value,
  });
}

function updateYouthRelatedMember() {
  let result = [
    ...Relations.value.map((a) => a.c_mem_id_1),
    ...Relations.value.map((a) => a.c_mem_id_2),
  ];
  updateQueue.value.push(...new Set(result)); // unique items only
}

function consolidateMembership() {
  let queue = [];
  if (Members.value) {
    Members.value.forEach((member) => {
      if (member.c_mem_id != "9999") {
        let hasChange = false;
        let b_mem_type1 = member.b_mem_type1;
        let c_udf_1 = membershipMap.value[member.c_udf_1];
        let d_exit_1 = member.d_exit_1;
        let d_renew_1 = member.d_renew_1;
        let d_expired_1 = member.d_expired_1;
        let d_enter_1 = member.d_enter_1;

        if (!b_mem_type1) {
          if (
            member.b_mem_type2 &&
            member.d_expired_2 &&
            (member.d_expired_2 > member.d_expired_1 || !member.d_expired_1)
          ) {
            hasChange = true;
            b_mem_type1 = true;
            c_udf_1 = "青年義工會員";
            d_enter_1 = member.d_enter_2;
            d_exit_1 = member.d_exit_2;
            d_renew_1 = member.d_renew_2;
            d_expired_1 = member.d_expired_2;
          } else if (
            member.b_mem_type3 &&
            member.d_expired_3 &&
            (member.d_expired_3 > member.d_expired_1 || !member.d_expired_1)
          ) {
            hasChange = true;
            b_mem_type1 = true;
            c_udf_1 = "社區義工";
            d_enter_1 = member.d_enter_3;
            d_exit_1 = member.d_exit_3;
            d_renew_1 = member.d_renew_3;
            d_expired_1 = member.d_expired_3;
          } else if (
            member.b_mem_type4 &&
            member.d_expired_4 &&
            (member.d_expired_4 > member.d_expired_1 || !member.d_expired_1)
          ) {
            hasChange = true;
            b_mem_type1 = true;
            c_udf_1 = "青年家人義工";
            d_enter_1 = member.d_enter_4;
            d_exit_1 = member.d_exit_4;
            d_renew_1 = member.d_renew_4;
            d_expired_1 = member.d_expired_4;
          }
        }
        if (c_udf_1 == null) c_udf_1 = "";

        // expired or quit, set active member status to false
        if (
          d_exit_1 ||
          (d_expired_1 && qdate.getDateDiff(d_expired_1, Date.now()) < 0)
        )
          b_mem_type1 = false;
        /*
        if (d_expired_1 != member.d_expired_1) {
          console.log(member.c_mem_id + ":" + " b_mem_type1: " + member.b_mem_type1 + " member.d_expired_1:" + member.d_expired_1 +  "b_mem_type2: " + member.b_mem_type2 + " member.d_expired_2: " + member.d_expired_2 + " b_mem_type3: " + member.b_mem_type3 + " member.d_expired_3: " + member.d_expired_3 + " b_mem_type4: " + member.b_mem_type4 + " member.d_expired_4: " + member.d_expired_4 + " d_expired_1: " + d_expired_1)
        }
        */

        queue.push({
          c_mem_id: member.c_mem_id,
          b_mem_type1: b_mem_type1,
          c_udf_1: c_udf_1,
          d_enter_1: d_enter_1,
          d_exit_1: d_exit_1,
          d_renew_1: d_renew_1,
          d_expired_1: d_expired_1,
        });

        /*
        if (queue.length == 100) {
          consolidateQueue.value.push(...queue)
          queue = []
        }
        */
      }
    });

    consolidateQueue.value.push(...queue);
    /*
    updateMembership({
     upsertObjects: queue
    })
    */
  }
}

// callback
migrateRelation_Completed((result) => {
  console.log(JSON.stringify(result));
});

migrateRelation_Error((error) => {
  console.log(JSON.stringify(error));
});

updateMemberStatus_Completed((result) => {
  console.log(JSON.stringify(result));
  awaitServerResponse.value--;
  updateMembershipQueue.value.splice(0, updateMembershipUpsertCount.value);
});

onResult((result) => {
  if (result.data) {
    Members.value = JSON.parse(JSON.stringify(result.data.Member));
    Relations.value = JSON.parse(JSON.stringify(result.data.Relation));
  }
});

updateMembership_Completed((result) => {
  awaitServerResponse.value--;
  consolidateQueue.value.splice(0, upsertCount.value);
});

// after getting relation from mem_id, calculate whether this is a youth relative
// and determine this membership expiry date if it is a youth relative member
GetRelationByPK_Completed((result) => {
  awaitServerResponse.value--;
  // console.log("result returned: " + JSON.stringify(result))
  if (result.data.Member_by_pk) {
    // only consider "青年家人義工"
    // 2024-07-31: change to consider all membership type
    // let youthMembership = result.data.Member_by_pk.c_udf_1 == '青年家人義工'
    let youthMembership = true;
    // console.log("youthMembership:" + youthMembership)

    // default is not Youth relative, and membership expire today
    let isYouth = false;
    let currentExpiryDate = Date.now();

    // loop through all related members
    let rel = [
      ...result.data.Member_by_pk.MemberRelation1,
      ...result.data.Member_by_pk.MemberRelation2,
    ];
    if (rel.length > 0) {
      // console.log("rel:" + JSON.stringify(rel))
      rel.forEach((rm) => {
        if (rm.c_mem_id_1 == result.data.Member_by_pk.c_mem_id) {
          // relation member 1 = this member
          // check relation member 2 youth status
          // criterion: b_mem_type1 valid && d_exit_1 invalid && relatedMember membership is not yet expired && relatedMember age is 15-24
          if (rm.RelationMember2) {
            // only proceed if relation member exist
            let tempYouth =
              rm.RelationMember2.b_mem_type1 &&
              !rm.RelationMember2.d_exit_1 &&
              qdate.getDateDiff(Date.now(), rm.RelationMember2.d_expired_1) <
                0 &&
              ageUtil.calculateAge(rm.RelationMember2.d_birth) >= 15 &&
              ageUtil.calculateAge(rm.RelationMember2.d_birth) <= 24;
            // is one of the related member is youth, set isYouth to true
            if (tempYouth) isYouth = tempYouth;
            // if target is youth && this member is a youth membership, determine expiry date
            if (tempYouth && youthMembership) {
              // determine this member expiry base on relatedMember membership and age
              // console.log("membership:" + rm.RelationMember2.c_udf_1)
              switch (rm.RelationMember2.c_udf_1) {
                case "個人會員":
                  if (currentExpiryDate < rm.RelationMember2.d_expired_1)
                    currentExpiryDate = rm.RelationMember2.d_expired_1;
                  break;
                // 2024-07-31: change to consider all membership type
                //case "永久會員":
                //case "青年義工會員":
                default:
                  if (
                    currentExpiryDate <
                    qdate.addToDate(rm.RelationMember2.d_birth, { years: 25 })
                  )
                    currentExpiryDate = qdate.addToDate(
                      rm.RelationMember2.d_birth,
                      { years: 25 }
                    );
                  break;
              }
            }
            //console.log("Member2:" + rm.RelationMember2.c_mem_id + " b_mem_type1:" + rm.RelationMember2.b_mem_type1 + " d_exit_1: " + rm.RelationMember2.d_exit_1 + " d_expired_1: " + rm.RelationMember2.d_expired_1 + " age: " + ageUtil.calculateAge(rm.RelationMember2.d_birth) + " isYouth:" + isYouth)
          }
        }
        if (rm.c_mem_id_2 == result.data.Member_by_pk.c_mem_id) {
          // relation member 2 = this member
          // check relation member 2 youth status
          // criterion: b_mem_type1 valid && d_exit_1 invalid && relatedMember membership is not yet expired && relatedMember age is 15-24
          if (rm.RelationMember1) {
            // only proceed if relation member exist
            let tempYouth =
              rm.RelationMember1.b_mem_type1 &&
              !rm.RelationMember1.d_exit_1 &&
              qdate.getDateDiff(Date.now(), rm.RelationMember1.d_expired_1) <
                0 &&
              ageUtil.calculateAge(rm.RelationMember1.d_birth) >= 15 &&
              ageUtil.calculateAge(rm.RelationMember1.d_birth) <= 24;
            // is one of the related member is youth, set isYouth to true
            if (tempYouth) isYouth = tempYouth;
            // if target is youth && this member is a youth membership, determine expiry date
            if (tempYouth && youthMembership) {
              // determine this member expiry base on relatedMember membership and age
              // console.log("membership:" + rm.RelationMember2.c_udf_1)
              switch (rm.RelationMember1.c_udf_1) {
                case "個人會員":
                  if (currentExpiryDate < rm.RelationMember1.d_expired_1)
                    currentExpiryDate = rm.RelationMember1.d_expired_1;
                  break;
                // 2024-07-31: change to consider all membership type
                //case "永久會員":
                //case "青年義工會員":
                default:
                  if (
                    currentExpiryDate <
                    qdate.addToDate(rm.RelationMember1.d_birth, { years: 25 })
                  )
                    currentExpiryDate = qdate.addToDate(
                      rm.RelationMember1.d_birth,
                      { years: 25 }
                    );
                  break;
              }
            }
            //console.log("Member1:" + rm.RelationMember1.c_mem_id + " b_mem_type1:" + rm.RelationMember1.b_mem_type1 + " d_exit_1: " + rm.RelationMember1.d_exit_1 + " d_expired_1: " + rm.RelationMember1.d_expired_1 + " age: " + ageUtil.calculateAge(rm.RelationMember1.d_birth) + " isYouth:" + isYouth)
          }
        }
      });
    }

    const logObject = ref({
      username: username.value,
      datetime: qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
      module: "會員系統",
      action:
        "系統自動更新:" +
        result.data.Member_by_pk.c_mem_id +
        " 青年家人狀態-" +
        isYouth +
        " 會藉屆滿日期-" +
        qdate.formatDate(currentExpiryDate, "YYYY-MM-DD"),
    });

    /*
    if (isYouth && youthMembership) {
      UpdateYouthMemberStatus({
        c_mem_id: result.data.Member_by_pk.c_mem_id,
        b_mem_type10: isYouth,
        d_expired_1: qdate.formatDate(currentExpiryDate, "YYYY-MM-DDTHH:mm:ss"),
        logObject: logObject.value,
      });
      console.log(
        "setting " +
          result.data.Member_by_pk.c_mem_id +
          " b_mem_type10 to " +
          isYouth +
          " expiryDate: " +
          currentExpiryDate
      );
    } else {
      UpdateYouthMemberStatus({
        c_mem_id: result.data.Member_by_pk.c_mem_id,
        b_mem_type10: isYouth,
        d_expired_1: result.data.Member_by_pk.d_expired_1,
        logObject: logObject.value,
      });
      console.log(
        "setting " +
          result.data.Member_by_pk.c_mem_id +
          " b_mem_type10 to " +
          isYouth
      );
    } */
    UpdateYouthMemberStatus({
      c_mem_id: result.data.Member_by_pk.c_mem_id,
      b_mem_type10: isYouth,
      d_expired_1: qdate.formatDate(currentExpiryDate, "YYYY-MM-DDTHH:mm:ss"),
      logObject: logObject.value,
    });
    console.log(
      "setting " +
        result.data.Member_by_pk.c_mem_id +
        " b_mem_type10 to " +
        isYouth +
        " expiryDate: " +
        currentExpiryDate
    );
  }
  updateQueue.value.splice(0, 1);
});

function updateMemberStatus4() {
  if (Members.value) {
    let queue = [];
    Members.value.forEach((member) => {
      if (member.c_mem_id != "9999") {
        let original_b_mem_type1 = member.b_mem_type1;
        let b_mem_type1 = member.b_mem_type1;
        let d_expired_1 = member.d_expired_1;

        if (qdate.getDateDiff(Date.now(), d_expired_1) < 0) {
          b_mem_type1 = true;
        } else b_mem_type1 = false;

        //console.log(member.c_mem_id + ":" + original_b_mem_type1 + ":" + b_mem_type1 + ":" + d_expired_1 + ":" + qdate.getDateDiff(Date.now(), d_expired_1))
        // expired or quit, set active member status to false
        if (b_mem_type1 != original_b_mem_type1) {
          queue.push({
            c_mem_id: member.c_mem_id,
            b_mem_type1: b_mem_type1,
          });
        }
      }
    });
    console.log("datasize: " + queue.length);
    if (queue.length > 0) {
      updateMembershipQueue.value.push(...queue);

      /* controlled by watcher
      updateMemberStatus({
        upsertObjects: queue
      })
      */
    }
  }
}
</script>
