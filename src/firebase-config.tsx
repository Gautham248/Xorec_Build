// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDwAz-wCnQOcIBveS1WAVRpun_1nK1Dlac",
  authDomain: "xorec-f99ec.firebaseapp.com",
  projectId: "xorec-f99ec",
  storageBucket: "xorec-f99ec.firebasestorage.app",
  messagingSenderId: "767489559526",
  appId: "1:767489559526:web:6fd1b50cd1c92b35c16427"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db=getFirestore(app);