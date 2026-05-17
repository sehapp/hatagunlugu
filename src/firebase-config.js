// src/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs, deleteDoc, doc, onSnapshot, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCLlaENT8FdtQQ50TLWX4yZXMrYq9qQYVI",
  authDomain: "hatadefteri-2b239.firebaseapp.com",
  projectId: "hatadefteri-2b239",
  storageBucket: "hatadefteri-2b239.firebasestorage.app",
  messagingSenderId: "1094679263814",
  appId: "1:1094679263814:web:7d784f081d58c75cb66847"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { 
    auth, db, storage, googleProvider,
    signInWithPopup, signOut, onAuthStateChanged,
    collection, addDoc, query, where, getDocs, deleteDoc, doc, onSnapshot, orderBy,
    ref, uploadBytes, getDownloadURL
};
