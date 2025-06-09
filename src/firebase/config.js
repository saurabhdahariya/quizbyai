import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyClFD76Ef8HR630uLyUzhbtMp6CCv6sE-k",
  authDomain: "quizbyai-fb550.firebaseapp.com",
  projectId: "quizbyai-fb550",
  storageBucket: "quizbyai-fb550.appspot.com",
  messagingSenderId: "395591648102",
  appId: "1:395591648102:web:13e86d3751ac9cbcb3bea7",
  measurementId: "G-GX8ZJNDGB6"
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
