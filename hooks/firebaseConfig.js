// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Tu nueva configuración de Firebase para disenoMobile
const firebaseConfig = {
  apiKey: "AIzaSyAnRsPYRicb1babBn08iHENDyhP0_HZ-iI",
  authDomain: "disenomobile.firebaseapp.com",
  projectId: "disenomobile",
  storageBucket: "disenomobile.firebasestorage.app",
  messagingSenderId: "850462410219",
  appId: "1:850462410219:web:473b0be3e7c7577fb7c5ae",
  measurementId: "G-2FZHK0DSLK"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Inicializa Auth y Firestore
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
