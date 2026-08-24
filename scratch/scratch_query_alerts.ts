import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

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
const auth = getAuth(app);

async function run() {
  console.log("🔐 Signing in anonymously...");
  await signInAnonymously(auth);
  console.log("✅ Authenticated!");

  console.log("📡 Querying recent pending_alerts in Firestore...");
  const q = query(collection(db, "pending_alerts"), orderBy("timestamp", "desc"), limit(5));
  const snapshot = await getDocs(q);
  console.log(`🔍 Total recent alerts found: ${snapshot.size}\n`);

  snapshot.docs.forEach((doc, idx) => {
    const data = doc.data();
    console.log(`[Alert #${idx+1}] ID: ${doc.id}`);
    console.log(`   - Class: ${data.class}`);
    console.log(`   - Student Number: ${data.studentNumber}`);
    console.log(`   - Comment: ${data.comment}`);
    console.log(`   - Status: ${data.status}`);
    console.log(`   - Reason: ${data.reason}`);
    console.log(`   - Error (if any): ${data.error}`);
    console.log(`   - Timestamp: ${data.timestamp?.toDate ? data.timestamp.toDate().toLocaleString() : 'N/A'}`);
    console.log(`   - Sent At: ${data.sentAt?.toDate ? data.sentAt.toDate().toLocaleString() : 'N/A'}`);
    console.log(`----------------------------------------------------\n`);
  });
  
  process.exit(0);
}

run().catch(err => {
  console.error("Error querying alerts:", err);
  process.exit(1);
});
