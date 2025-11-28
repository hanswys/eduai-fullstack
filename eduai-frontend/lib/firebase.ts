import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyA4EjORxw30ho03l7q5L-mFBpGd1C9kkGA",
  authDomain: "eduai-d0566.firebaseapp.com",
  projectId: "eduai-d0566",
  storageBucket: "eduai-d0566.firebasestorage.app",
  messagingSenderId: "602911718640",
  appId: "1:602911718640:web:75b2fc37b2f06d5449d635",
  measurementId: "G-HXQ44KNRHY"
};

// Singleton pattern to prevent multiple initializations in Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app); // Ready for your database needs later
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };