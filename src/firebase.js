
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXQRUp5qE602GKLsrtxcMXYsOIqzBTndU",
  authDomain: "campus-companion-mits.firebaseapp.com",
  projectId: "campus-companion-mits",
  storageBucket: "campus-companion-mits.firebasestorage.app",
  messagingSenderId: "1004937645230",
  appId: "1:1004937645230:web:13eeb997b6b19e0020b13f",
  measurementId: "G-3JQCLYG7TR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
export const auth = getAuth(app);

// Initialize Firestore Database
export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

export default app;
