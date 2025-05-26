// backend/firebaseConfig.js
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAnRsPYRicb1babBn08iHENDyhP0_HZ-iI",
  authDomain: "disenomobile.firebaseapp.com",
  projectId: "disenomobile",
  storageBucket: "disenomobile.firebasestorage.app",
  messagingSenderId: "850462410219",
  appId: "1:850462410219:web:473b0be3e7c7577fb7c5ae",
  measurementId: "G-2FZHK0DSLK"
};

// Inicializa Firebase sólo una vez
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Exporta los servicios
const auth = firebase.auth();
const db   = firebase.firestore();

export { firebase, auth, db };
