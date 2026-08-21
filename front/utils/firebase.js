// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "ankai-2fcf2.firebaseapp.com",
  projectId: "ankai-2fcf2",
  storageBucket: "ankai-2fcf2.firebasestorage.app",
  messagingSenderId: "375366154318",
  appId: "1:375366154318:web:19ffb2abe310d1cd706b1f",
  measurementId: "G-V1J2PXM6FJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth=getAuth(app)
export const googleProvider=new GoogleAuthProvider()