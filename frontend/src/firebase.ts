import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBOFq2Lu1geIF0-PkHRV7fXxF1BE_qfvM4",
  authDomain: "team-availability-calend-7025a.firebaseapp.com",
  projectId: "team-availability-calend-7025a",
  storageBucket: "team-availability-calend-7025a.firebasestorage.app",
  messagingSenderId: "46186332023",
  appId: "1:46186332023:web:21269c3e79c9c449e46b72"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
