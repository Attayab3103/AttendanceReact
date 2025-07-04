// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyB4rlZt2D13jDhZIzPUhQR1C5HKbpdqE1w",
  authDomain: "attendancereact-87c71.firebaseapp.com",
  databaseURL: "https://attendancereact-87c71-default-rtdb.firebaseio.com/", // ✅ this is crucial
  projectId: "attendancereact-87c71",
  storageBucket: "attendancereact-87c71.appspot.com",
  messagingSenderId: "283703686538",
  appId: "1:283703686538:web:56a8d972a752c3ed358473"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the Realtime Database instance
export const db = getDatabase(app);
