import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBpxfGd7UmNh9aH7V6fta88OrLpakz7O-8",
  authDomain: "ridelistapp.firebaseapp.com",
  projectId: "ridelistapp",
  storageBucket: "ridelistapp.firebasestorage.app",
  messagingSenderId: "175167409125",
  appId: "1:175167409125:web:872d73c2d01875740e7d0c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
