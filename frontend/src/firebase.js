import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc,  getDocs, doc , updateDoc, deleteDoc, query, where, getDoc, onSnapshot, setDoc } from "firebase/firestore";

// 🔹 Replace this with your own Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAhyr6h7Gx4VdtWbuRvh8kA9pUhakvJQKY",
    authDomain: "votesys-14c9e.firebaseapp.com",
    projectId: "votesys-14c9e",
    storageBucket: "votesys-14c9e.firebasestorage.app",
    messagingSenderId: "47810621428",
    appId: "1:47810621428:web:c81fc0579e1c4ecdf493a1",
    measurementId: "G-JX7MMS35D3"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc,  getDocs, doc , updateDoc, deleteDoc, query, where, getDoc, setDoc, onSnapshot };
