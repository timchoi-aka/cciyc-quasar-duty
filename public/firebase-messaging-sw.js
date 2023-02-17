//firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/8.2.7/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/8.2.7/firebase-messaging.js')

const firebaseConfig = {
  apiKey: "AIzaSyBn3kOruwr2QZlFuecSiPswBdm6ijulxvM",
  authDomain: "manage-hr.firebaseapp.com",
  projectId: "manage-hr",
  storageBucket: "manage-hr.appspot.com",
  messagingSenderId: "40845111899",
  appId: "1:40845111899:web:f5110e9801b0c21704457e"
};

const app = firebase.initializeApp(firebaseConfig)
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: payload.data.image
  };
  
  self.registration.showNotification(notificationTitle,
    notificationOptions);
});
