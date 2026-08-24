import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCiVyiPSlSAdfHsWGbKqxoK-ZFTBdPqsNs",
  authDomain: "moodtracker-app-d6b42.firebaseapp.com",
  projectId: "moodtracker-app-d6b42",
  storageBucket: "moodtracker-app-d6b42.firebasestorage.app",
  messagingSenderId: "57804525083",
  appId: "1:57804525083:web:3ff42e4d46e95a81d572be",
  measurementId: "G-CF3FE737NF"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function inspectDoc() {
  console.log("Reading system_settings/push_notifications document...");
  const snap = await getDoc(doc(db, "system_settings", "push_notifications"));
  if (snap.exists()) {
    console.log("Document data:", JSON.stringify(snap.data(), null, 2));
  } else {
    console.log("Document does not exist!");
  }
}

inspectDoc().catch(console.error);
