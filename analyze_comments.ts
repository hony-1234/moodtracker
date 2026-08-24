import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getWarningLevel } from './src/utils/sensitivityEngine';

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
  console.log("Fetching mood_reports comments to analyze language detection...");
  const snapshot = await getDocs(collection(db, "mood_reports"));
  console.log(`Total documents: ${snapshot.size}`);

  const counts = { red: 0, yellow: 0, green: 0, none: 0 };
  const samplesByLevel: Record<string, { id: string, comment: string }[]> = {
    red: [],
    yellow: [],
    green: [],
    none: []
  };

  snapshot.docs.forEach(doc => {
    const data = doc.data();
    const comment = (data.comment || data.有事情想向老師分享 || "").trim();
    if (!comment) return;

    // Ignore placeholder comments like ",,,,,,,,,,,,,,,,,,,"
    if (/^[,\s]+$/.test(comment)) return;

    const level = getWarningLevel(comment);
    counts[level]++;

    if (samplesByLevel[level].length < 30) {
      samplesByLevel[level].push({ id: doc.id, comment });
    }
  });

  console.log("\n====================================");
  console.log("CLASSIFICATION BREAKDOWN:");
  console.log(`RED (Urgent/Safety Alert): ${counts.red}`);
  console.log(`YELLOW (Bullying/Profanity): ${counts.yellow}`);
  console.log(`GREEN (Sadness/Stress/Non-urgent): ${counts.green}`);
  console.log(`NONE (Normal or unrecognized comments): ${counts.none}`);
  console.log("====================================\n");

  console.log("RED SAMPLES (first 30):");
  samplesByLevel.red.forEach((s, idx) => console.log(`${idx + 1}. [${s.id}] "${s.comment}"`));

  console.log("\nYELLOW SAMPLES (first 30):");
  samplesByLevel.yellow.forEach((s, idx) => console.log(`${idx + 1}. [${s.id}] "${s.comment}"`));

  console.log("\nGREEN SAMPLES (first 30):");
  samplesByLevel.green.forEach((s, idx) => console.log(`${idx + 1}. [${s.id}] "${s.comment}"`));

  console.log("\nNONE SAMPLES (first 30 - these are not classified. Let's see if some need to be):");
  samplesByLevel.none.forEach((s, idx) => console.log(`${idx + 1}. [${s.id}] "${s.comment}"`));

  process.exit(0);
}

run().catch(err => {
  console.error("Error running script:", err);
  process.exit(1);
});
