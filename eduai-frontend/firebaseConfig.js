// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA4EjORxw30ho03l7q5L-mFBpGd1C9kkGA",
  authDomain: "eduai-d0566.firebaseapp.com",
  projectId: "eduai-d0566",
  storageBucket: "eduai-d0566.firebasestorage.app",
  messagingSenderId: "602911718640",
  appId: "1:602911718640:web:75b2fc37b2f06d5449d635",
  measurementId: "G-HXQ44KNRHY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);