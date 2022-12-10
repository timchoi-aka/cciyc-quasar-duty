<template>
  <!-- loading dialog -->
  <q-dialog v-model="waitingAsync" position="bottom">
    <LoadingDialog message="處理中" />
  </q-dialog>
  <q-btn class="q-mt-md q-mx-md" :disable="migrated_relations.length == 0" @click="startMigrateRelation" label="Migrate Relation"/>
  <q-btn class="q-mt-md q-mx-md" :disable="Members.length == 0" @click="updateYouthRelatedMember" label="Update Youth Relation"/>
</template>

<script setup>
import { MIGRATE_RELATION, GET_MEMBER_BASIC_AND_RELATED_MEMBER_FROM_IDS, GET_NAME_FROM_IDS } from "/src/graphQueries/Member/query.js";
import { gql } from "graphql-tag"
import LoadingDialog from "components/LoadingDialog.vue";
import { ref, computed } from "vue";
import ageUtil from "src/lib/calculateAge.js"
import { date as qdate } from "quasar";
import { UPDATE_RELATED_YOUTH_MEMBER_STATUS } from "/src/graphQueries/Member/mutation.js"
import { useStore } from "vuex";
import { useQuery, useMutation } from "@vue/apollo-composable"

// variables
const $store = useStore()
const awaitServerResponse = ref(0)
const migrated_relations = ref([])

// query   
const { onResult: onRelationResult } = useQuery(MIGRATE_RELATION)
const { mutate: migrateRelation, onDone: migrateRelation_Completed, onError: migrateRelation_Error } = useMutation(gql`
  mutation migrateRelation(
    $migrated_relations: [Relation_insert_input!] = {}
    ) {
    insert_Relation(objects: $migrated_relations) {
      affected_rows
    }
  }
`)

const { result: activeMembers } = useQuery(gql`
  query getActiveMember {
    Member(where: {b_mem_type1: {_eq: true}}) {
      c_mem_id
    }
  }`)

const { mutate: updateYouthStatus, onDone: updateYouthStatus_Completed, onError: updateYouthStatus_Error } = useMutation(gql`
  mutation updateYouthStatus(
    $memberObjects: [Member_insert_input!] = {},
    $logObject: Log_insert_input! = {}, 
    ) {
    insert_Member(objects: $memberObjects, if_matched: {match_columns: c_mem_id, update_columns: b_mem_type10}) {
      affected_rows
    }
    insert_Log_one(object: $logObject) {
      log_id
    }
  }`)

// computed
const waitingAsync = computed(() => awaitServerResponse.value > 0)
const username = computed(() => $store.getters["userModule/getUsername"])  
const ActiveMembers = computed(() => activeMembers.value?.Member.map(a => a.c_mem_id)??[''])
const Members = ref([])
const Relations = ref([])

const { onResult } = useQuery(GET_MEMBER_BASIC_AND_RELATED_MEMBER_FROM_IDS, 
  () => ({
    c_mem_ids: ActiveMembers.value
  }))

onRelationResult((result) => {
  result.data.Member.forEach((mem) => {
    if (mem.c_mem_relative_memid) {
      migrated_relations.value.push({
        c_mem_id_1: mem.c_mem_id? mem.c_mem_id: "",
        c_mem_id_2: mem.c_mem_relative_memid? mem.c_mem_relative_memid: "",
        relation: mem.c_mem_relation? mem.c_mem_relation: ""
      })
    }
  })
})

// functions
function startMigrateRelation() {
  migrateRelation({
    migrated_relations: migrated_relations.value,
  })   
}
    
function updateYouthRelatedMember() {
  let youthLog = ""
  let memberObject = []
  // loop both members in Relations
  // find their index, and age in Members
  // if both members in Relations are found
  //    calculate their ages
  //    if member is youth, update Members.b_mem_type10 in Relations
  // update Members object to server
  Relations.value.forEach((rel) => {
    let mem1Index = Members.value.findIndex((element) => element.c_mem_id == rel.c_mem_id_1)
    let mem2Index = Members.value.findIndex((element) => element.c_mem_id == rel.c_mem_id_2)
    
    if (mem1Index != -1 && mem2Index != -1) {
      let age1 = ageUtil.calculateAge(Members.value[mem1Index].d_birth)
      let age2 = ageUtil.calculateAge(Members.value[mem2Index].d_birth)
      
      if (age1 >= 15 && age1 <= 24) {
        memberObject.push({
          c_mem_id: Members.value[mem2Index].c_mem_id,
          b_mem_type10: true
        })
        youthLog += Members.value[mem2Index].c_mem_id + ", "
      }

      if (age2 >= 15 && age2 <= 24) {
        memberObject.push({
          c_mem_id: Members.value[mem1Index].c_mem_id,
          b_mem_type10: true
        })
        youthLog += Members.value[mem1Index].c_mem_id + ", "
      }
    }
  })
  
  // remove duplicates
  memberObject = memberObject.filter((value, index, self) =>
    index === self.findIndex((t) => (
      t.c_mem_id === value.c_mem_id && t.b_mem_type10 === value.b_mem_type10
    ))
  )

  const logObject = ref({
    "username": username.value + "(自動系統管理)",
    "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
    "module": "會員系統",
    "action": "以下會員被設定為青年家人會員：" + youthLog
  })
       
  console.log("data length: " + memberObject.length)
  
  awaitServerResponse.value++
  updateYouthStatus({
    memberObjects: memberObject,
    logObject: logObject.value
  })
};
// callback
migrateRelation_Completed((result) => {
  console.log(JSON.stringify(result))
})

migrateRelation_Error((error) => {
  console.log(JSON.stringify(error))
})

updateYouthStatus_Error((error) => {
  awaitServerResponse.value--
  console.log(JSON.stringify(error))
})

updateYouthStatus_Completed((result) => {
  awaitServerResponse.value--
  console.log(result)
})

onResult((result) => {
  Members.value = JSON.parse(JSON.stringify(result.data.Member))
  Relations.value = JSON.parse(JSON.stringify(result.data.Relation))
})
</script>
