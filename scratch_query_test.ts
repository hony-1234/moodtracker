import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

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

async function run() {
  console.log("Querying class == 'TEST'...");
  const qClass = query(collection(db, "mood_reports"), where("class", "==", "TEST"));
  const snapClass = await getDocs(qClass);
  console.log(`Found ${snapClass.size} documents with class == 'TEST'`);
  snapClass.docs.forEach(doc => {
    console.log(`Doc ID: ${doc.id}, fields:`, Object.keys(doc.data()));
  });

  console.log("\nQuerying 班別 == 'TEST'...");
  const qBanbie = query(collection(db, "mood_reports"), where("班別", "==", "TEST"));
  const snapBanbie = await getDocs(qBanbie);
  console.log(`Found ${snapBanbie.size} documents with 班別 == 'TEST'`);
  snapBanbie.docs.forEach(doc => {
    console.log(`Doc ID: ${doc.id}, fields:`, Object.keys(doc.data()));
  });
  
  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
