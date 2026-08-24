import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getWarningLevel } from '../src/utils/sensitivityEngine';
import * as fs from 'fs';
import * as path from 'path';

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
  console.log("Fetching mood_reports...");
  const snapshot = await getDocs(collection(db, "mood_reports"));
  console.log(`Total documents: ${snapshot.size}`);

  const records: { id: string; date: string; class: string; num: string; score: string; comment: string; level: string }[] = [];

  snapshot.docs.forEach(doc => {
    const data = doc.data();
    const comment = (data.comment || data.有事情想向老師分享 || "").trim();
    if (!comment) return;

    // Ignore mere comma lists or spaces
    if (/^[,\s]+$/.test(comment)) return;

    const level = getWarningLevel(comment);
    records.push({
      id: doc.id,
      date: data.日期 || data.date || "N/A",
      class: data.class || data.班別 || "N/A",
      num: data.studentNumber || data.學號 || "N/A",
      score: data.moodScore || data.心情指數 || "N/A",
      comment,
      level
    });
  });

  // Group by level
  const grouped: Record<string, typeof records> = {
    red: [],
    yellow: [],
    green: [],
    none: []
  };

  records.forEach(r => {
    grouped[r.level].push(r);
  });

  let outputText = `GCCPS COMMENT DATABASE SENSITIVITY REVIEW\n`;
  outputText += `Total Comments Extracted: ${records.length}\n`;
  outputText += `======================================================================\n\n`;

  for (const level of ['red', 'yellow', 'green', 'none']) {
    const list = grouped[level];
    outputText += `======================================================================\n`;
    outputText += `LEVEL: ${level.toUpperCase()} (Total: ${list.length})\n`;
    outputText += `======================================================================\n`;
    
    list.forEach((r, idx) => {
      outputText += `${idx + 1}. DocID: ${r.id} | Date: ${r.date} | Class: ${r.class} | No: ${r.num} | Score: ${r.score}\n`;
      outputText += `   Comment: "${r.comment}"\n`;
      outputText += `----------------------------------------------------------------------\n`;
    });
    outputText += `\n\n`;
  }

  const scratchDir = path.join(process.cwd(), 'scratch');
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }

  const outputPath = path.join(scratchDir, 'full_comments_review.txt');
  fs.writeFileSync(outputPath, outputText, 'utf-8');
  console.log(`Saved full report to ${outputPath}`);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
