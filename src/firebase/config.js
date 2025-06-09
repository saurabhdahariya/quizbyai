import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration using environment variables
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyClFD76Ef8HR630uLyUzhbtMp6CCv6sE-k",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "quizbyai-fb550.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "quizbyai-fb550",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "quizbyai-fb550.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "395591648102",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:395591648102:web:13e86d3751ac9cbcb3bea7",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-GX8ZJNDGB6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics if we're in a browser environment
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { auth, db, analytics };
