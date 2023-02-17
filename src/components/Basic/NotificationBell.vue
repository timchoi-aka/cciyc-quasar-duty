<template>
  <q-btn v-if="messageQueue.filter(x => !x.read).length" icon="notifications_active" flat dense @click="showUnreadNoti">
    <q-badge color="red" floating>
      {{messageQueue.filter(x => !x.read).length}}
    </q-badge>
  </q-btn>
  <q-btn v-if="messageQueue.filter(x => !x.read).length == 0" icon="notifications" flat dense @click="showReadModal = !showReadModal"/>

  <q-page-sticky
    v-if="showReadModal"
    position="right"
    :offset="[10, 0]"
    style="z-index: 1"
    >
    <q-card>
      <q-card-section class="q-pa-none q-ma-none bg-blue-3 text-black row items-center">
        <div class="col-auto caption text-bold q-ml-md">已讀訊息</div>
        <div class="col-auto caption text-bold q-ml-md"><q-btn icon="delete" label="清除" class="bg-negative text-white" @click="clearNoti"/></div>
        <q-space/>
        <div class="col-auto"><q-btn icon="cancel" dense flat @click="showReadModal = false"/></div>
      </q-card-section>
      <q-card-section class="bg-blue-2 text-black">
        <div v-if="messageQueue.filter(x => x.read).length == 0">沒有已讀訊息</div>
        <div v-for="(msg, index) in messageQueue.filter(x => x.read)">
          <div v-if="currentPage == Math.floor(index/5)+1">
            <div class="caption text-bold"><q-chip class="bg-blue-4">{{index+1}}</q-chip> {{ msg.title }}</div>
            <div class="caption">{{ msg.body }}</div>
            <div class="text-right">{{ msg.datetime }}</div>
            <q-separator/>
          </div>
        </div>
        <q-pagination v-if="messageQueue.filter(x => x.read).length > 0" v-model="currentPage" :max="Math.floor(messageQueue.filter(x => x.read).length/5)+1"/>
      </q-card-section>
    </q-card>
  </q-page-sticky>
  
</template>

<script setup>
import { onMessage } from "firebase/messaging";
import { ref, computed, inject } from "vue";
import { useQuasar } from 'quasar'

const $q = useQuasar()
const messaging = inject('messaging')
const messageQueue = ref($q.localStorage.getItem("notification")?$q.localStorage.getItem("notification"):[])
const showReadModal = ref(false)
const currentPage = ref(1)

onMessage(messaging, (payload) => {
  messageQueue.value.push({
    title: payload.data.title,
    body: payload.data.body,
    datetime: payload.data.datetime,
    read: false
  })
  $q.localStorage.set("notification", messageQueue.value)
});

// functions
function clearNoti() {
  messageQueue.value = []
  $q.localStorage.set("notification", messageQueue.value)
}

function showUnreadNoti() {
  messageQueue.value.forEach((msg) => {
    if (!msg.read) {
      $q.notify({
        color: "teal",
        message: msg.title + " - " + msg.body,
        position: "top",
        timeout: 5000
      })
      msg.read = true
    }
  })
  $q.localStorage.set("notification", messageQueue.value)
}

function showReadNoti() {
  showReadModal.value = true
}
</script>