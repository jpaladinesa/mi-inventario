// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDS30PUZwXJyaPZbtSdmppzhOpeQJoNDUs",
  authDomain: "inventrack-56fe9.firebaseapp.com",
  projectId: "inventrack-56fe9",
  storageBucket: "inventrack-56fe9.firebasestorage.app",
  messagingSenderId: "209210182467",
  appId: "1:209210182467:web:ce12fabf79476e0fd33df6",
  measurementId: "G-0RBJTCYEFZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const analytics = getAnalytics(app);