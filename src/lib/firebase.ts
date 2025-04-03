import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDXI79k3gyrzbrhWy4P0g3ps6fJaujXzQo",
  authDomain: "fancyemail-b45c7.firebaseapp.com",
  projectId: "fancyemail-b45c7",
  storageBucket: "fancyemail-b45c7.firebasestorage.app",
  messagingSenderId: "957725207780",
  appId: "1:957725207780:web:045bbd5e382e7dab1f10f1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
