import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCQT-47zfyTcvEVu70OST8td2XwRBzF7lE",
  authDomain: "cinecloud-app.firebaseapp.com",
  projectId: "cinecloud-app",
  storageBucket: "cinecloud-app.firebasestorage.app",
  messagingSenderId: "333617323157",
  appId: "1:333617323157:web:907abf46fb42cbb16a4f9c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // ✅ Use getAuth instead of initializeAuth
const db = getFirestore(app);
export { auth, db };
