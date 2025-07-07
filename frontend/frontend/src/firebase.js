// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "firebase/auth";

// 🔐 Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAIQmn7i4ONrJ1KVw7qeio8eSg4L5ZXfuE",
  authDomain: "reely-auth.firebaseapp.com",
  projectId: "reely-auth",
  storageBucket: "reely-auth.firebasestorage.app",
  messagingSenderId: "379386756563",
  appId: "1:379386756563:web:809a7ce376cdefc54b4326",
  measurementId: "G-Q8GEQB9SEF"
};

// ✅ Initialize Firebase app
const app = initializeApp(firebaseConfig);

// ✅ Set up auth
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut };
