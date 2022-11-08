<template>
  <!-- loading dialog -->
  <q-dialog v-model="waitingAsync" position="bottom">
    <LoadingDialog message="處理中" />
  </q-dialog>
  <q-btn @click="migrateRelation" label="Migrate Relation"/>
  <q-btn @click="updateRelationState" label="Update Relation State"/>
  <q-list highlight separator dense>
    <q-item clickable v-for="(item, index) in updateYouthRelatedMemberList" :key="index" @click="updateYouthRelatedMember(item)">{{item}}</q-item>
  </q-list>
  <LogViewer/>
</template>

<script>
import { MIGRATE_RELATION, GET_MEMBER_BASIC_AND_RELATED_MEMBER_FROM_IDS, GET_NAME_FROM_IDS } from "/src/graphQueries/Member/query.js";
import { gql } from "graphql-tag"
import LoadingDialog from "components/LoadingDialog.vue";
import LogViewer from "components/Member/LogViewer.vue"
import { ref, computed } from "vue";
import ageUtil from "src/lib/calculateAge.js"
import { date as qdate } from "quasar";
import { UPDATE_RELATED_YOUTH_MEMBER_STATUS } from "/src/graphQueries/Member/mutation.js"
import { useStore } from "vuex";

export default {
  name: "Member Admin Module",
  data() {
    return {
      updateYouthRelatedMemberList: [],
      qdate: qdate,
    }
  },
  computed: {
    waitingAsync() {
      return this.awaitServerResponse > 0 ? true : false;
    },
  },
  components: {
    LoadingDialog, LogViewer
  },
  setup() {
    const $store = useStore();
    
    return {
      username: computed(() => $store.getters["userModule/getUsername"]),
      awaitServerResponse: ref(0),   
    }
  },
  mounted() {
  },  
  methods: {
    async migrateRelation() {
      this.$apollo.query({
        query: MIGRATE_RELATION,
      }).then((data) => {
        const member = data.data.Member;
        let migrated_relations = [];
        member.forEach((mem) => {
          if (mem.c_mem_relative_memid != null) {
            migrated_relations.push({
              c_mem_id_1: mem.c_mem_id? mem.c_mem_id: "",
              c_mem_id_2: mem.c_mem_relative_memid? mem.c_mem_relative_memid: "",
              relation: mem.c_mem_relation? mem.c_mem_relation: ""
            })
          }
        })
        
        this.$apollo.mutate({
          mutation: gql`
            mutation migrateRelation($migrated_relations: [Relation_insert_input!] = {}) {
              insert_Relation(objects: $migrated_relations) {
                affected_rows
              }
            }
          `,
          variables: {
            migrated_relations: migrated_relations,
          }
        }).then((data) => {
          console.log(JSON.stringify(data))
        })
      })
    },
    async updateRelationState() {
      // query active members
      this.$apollo.query({
        query: gql`
          query getActiveMember {
            Member(where: {b_mem_type1: {_eq: true}}) {
              c_mem_id
            }
          }
        `
      }).then((data) => {
        let activeMember = data.data.Member.map(({c_mem_id})=>c_mem_id);
        //this.updateYouthRelatedMemberList = activeMember;
        
        for (const mem of activeMember) {
          //console.log(mem)
          this.updateYouthRelatedMember(mem);  
        }
      })
    },
    async updateYouthRelatedMember(mem_id) {
      // query and update mem_type_10 based on mem_id
      // 1) query mem_info and query related members
      // 2) loop through related members see if there is any youth
      // 3) update this mem_type_10 based on (2)
      
      this.awaitServerResponse++;
      let isYouthRelatedMember = false;

      this.$apollo.query({
        query: GET_MEMBER_BASIC_AND_RELATED_MEMBER_FROM_IDS,
        variables: {
          c_mem_ids: [mem_id],
        },
      }).then((data) => {
        //console.log(JSON.stringify(data))
        const memberResponse = data.data.Member;
        const RelationResponse = data.data.Relation;
        if (RelationResponse.length > 0) {
          let relation = [];
          RelationResponse.forEach((rel) => {
            if (rel.c_mem_id_1 == mem_id) {
              relation.push(rel.c_mem_id_2)
            } else {
              relation.push(rel.c_mem_id_1)
            }
          })
          
          this.$apollo.query({
            query: GET_NAME_FROM_IDS,
            variables: {
              c_mem_ids: relation
            }
          }).then((data) => {
            let memberResponse = data.data.Member;
            let i = memberResponse.findIndex((element) => element.b_mem_type1 && ageUtil.calculateAge(element.d_birth) >= 15 && ageUtil.calculateAge(element.d_birth) <= 24)
            
            i != -1 ? isYouthRelatedMember = true: isYouthRelatedMember = false;
            if (isYouthRelatedMember) {
              this.$apollo.mutate({
                mutation: UPDATE_RELATED_YOUTH_MEMBER_STATUS,
                variables: {
                  "c_mem_ids": [mem_id],
                  "logObject": {
                    "username": this.username + "(自動系統管理)",
                    "datetime": qdate.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss"),
                    "module": "會員系統",
                    "action": "設定 " + mem_id + " 為青年家人會員。"
                  }
                }
              }).then((data) => {
                this.awaitServerResponse--;
              })
            } else {
              this.awaitServerResponse--;
            }
          })
        }  else {
          this.awaitServerResponse--;
        }
      })
    },
  },
};
</script>
