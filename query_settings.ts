import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';

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
  console.log("=== Loading system_settings/push_notifications ===");
  const pushConfigSnap = await getDoc(doc(db, "system_settings", "push_notifications"));
  if (pushConfigSnap.exists()) {
    console.log(JSON.stringify(pushConfigSnap.data(), null, 2));
  } else {
    console.log("No push_notifications settings found!");
  }

  console.log("\n=== Loading fcm_subscriptions ===");
  const subSnap = await getDocs(collection(db, "fcm_subscriptions"));
  console.log(`Total fcm_subscriptions found: ${subSnap.size}`);
  subSnap.docs.forEach((doc, idx) => {
    console.log(`[#${idx+1}] ID: ${doc.id}`);
    console.log(JSON.stringify(doc.data(), null, 2));
  });

  process.exit(0);
}

run().catch(err => {
  console.error("Error running script:", err);
  process.exit(1);
});
