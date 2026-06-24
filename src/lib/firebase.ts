import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import firebaseConfigData from "../../firebase-applet-config.json";

const config = (firebaseConfigData || {}) as any;
const firebaseConfig = {
  apiKey: config.apiKey || "AIzaSyAIGz9z2YVIA-6UJWo05d-6nYZycyTnTUA",
  authDomain: config.authDomain || "spheric-library-507pf.firebaseapp.com",
  projectId: config.projectId || "spheric-library-507pf",
  storageBucket: config.storageBucket || "spheric-library-507pf.firebasestorage.app",
  messagingSenderId: config.messagingSenderId || "954624964003",
  appId: config.appId || "1:954624964003:web:ea6727c18a771280aa9616"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, config.firestoreDatabaseId || "ai-studio-cd2d43d9-1f71-4140-81eb-bc46bcfc34cf");

export { 
  db, 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp 
};

