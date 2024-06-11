//firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/8.2.7/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/8.2.7/firebase-messaging.js')

const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG)
const app = firebase.initializeApp(firebaseConfig)
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  return self.registration.showNotification(payload.data.title, {body: payload.data.body});
});
