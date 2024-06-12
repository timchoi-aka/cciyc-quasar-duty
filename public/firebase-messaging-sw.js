//firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBn3kOruwr2QZlFuecSiPswBdm6ijulxvM",
  authDomain: "manage-hr.firebaseapp.com",
  projectId: "manage-hr",
  storageBucket: "manage-hr.appspot.com",
  messagingSenderId: "40845111899",
  appId: "1:40845111899:web:f5110e9801b0c21704457e",
  measurementId: "G-F6E3JTWW3R"
};
const app = firebase.initializeApp(firebaseConfig)
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  return self.registration.showNotification(payload.data.title, {body: payload.data.body});
});
