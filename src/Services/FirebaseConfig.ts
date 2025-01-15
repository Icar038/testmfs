import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { onAuthStateChanged } from "firebase/auth";
import {  addDoc, deleteDoc, getDoc, updateDoc, getFirestore, getDocs, collection, query, where, doc, setDoc } from "firebase/firestore";



const app = initializeApp({
  apiKey: "AIzaSyC6bg9MMAxJiXEK9UJZ9me7qyalSyJwkMg",
  authDomain: "painel-adv.firebaseapp.com",
  projectId: "painel-adv",
  storageBucket: "painel-adv.firebasestorage.app",
  messagingSenderId: "443002704643",
  appId: "1:443002704643:web:5b291d0e670003d6e08f36",
  measurementId: "G-GD5ESWBCBT"
});


const analytics = getAnalytics(app);
const auth= getAuth(app);
export const db = getFirestore(app);

export { auth, getAnalytics, addDoc,getDoc, setDoc, deleteDoc, updateDoc, onAuthStateChanged, getFirestore, getDocs, collection, initializeApp, query, where, doc, app};
