import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDZuE19TxdljI90G54O-Lv4Ce4WouQIO8Q",
  authDomain: "mema-uz.firebaseapp.com",
  projectId: "mema-uz",
  storageBucket: "mema-uz.firebasestorage.app",
  messagingSenderId: "771416899748",
  appId: "1:771416899748:web:87c26e22099dbdb80fa631",
  measurementId: "G-1K4BDD7S4E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Cloud Firestore and Cloud Storage
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
