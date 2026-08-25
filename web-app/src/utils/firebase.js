import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBWvRek1giCGfwpIMRcT4wha80AeUEqcq4",
  authDomain: "hospital-booking-system-4fc02.firebaseapp.com",
  projectId: "hospital-booking-system-4fc02",
  storageBucket: "hospital-booking-system-4fc02.firebasestorage.app",
  messagingSenderId: "597711664039",
  appId: "1:597711664039:web:f3db576a4010fff6eabc82",
  measurementId: "G-XE5RQ94GK4"
};

const app = initializeApp(firebaseConfig);

export let messaging = null;

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (err) {
    console.warn('FCM Messaging initialization notice:', err.message);
  }
}

export { app, firebaseConfig };
