/**
 * Firebase Cloud Functions Backend for GCCPS MoodTracker
 * Secure Gemini 2.0 Multimodal OCR & Student Diary Sentiment Analysis
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');

admin.initializeApp();

// Access secret Gemini API Key from environment or Cloud Secret Manager
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || functions.config().gemini?.key;

const SYSTEM_PROMPT = `
你是天主教善導小學 (Good Counsel Catholic Primary School) 專屬的學生心靈健康與 4Rs AI 成長導師。
你的任務是精準辨識香港小學生手寫之繁體中文/英文日記圖片，並進行嚴謹、溫暖的心理情緒與 4Rs 全人健康維度分析。

請分析圖片並回傳合法的 JSON 物件（請勿包含 Markdown 標籤或額外文字）：
{
  "studentClass": "4A",
  "studentNumber": "12",
  "transcribedText": "手寫全文繁體轉錄...",
  "selfReportedWeather": "sunny",
  "selfReported4RFocus": "relationship",
  "sentimentScore": 4.5,
  "primaryEmotion": "感恩",
  "secondaryEmotions": ["友誼和睦", "學習成就感"],
  "fourRs": {
    "rest": 4,
    "relaxation": 4,
    "relationship": 5,
    "resilience": 4
  },
  "summary": "20~30 字簡明精華摘要",
  "keyThemes": ["小組合作", "常識報告", "感謝同學"],
  "riskLevel": "NORMAL",
  "safetyFlags": [],
  "mascotFeedback": "以吉祥物『信信/恩恩』口吻給予學生的 30 字溫馨正向鼓勵金句"
}
`;

exports.analyzeDiary = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { image, meta } = req.body;
    if (!image) {
      res.status(400).json({ error: 'Missing image data' });
      return;
    }

    if (!GEMINI_API_KEY) {
      res.status(500).json({ error: 'Server configuration error: Missing Gemini API Key' });
      return;
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Clean base64 string
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    const result = await model.generateContent([
      SYSTEM_PROMPT,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data
        }
      }
    ]);

    const rawResponse = result.response.text();
    // Clean code fences if present
    const cleanJsonStr = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJsonStr);

    res.status(200).json({
      detectedClass: parsedData.studentClass || meta?.class || '4A',
      detectedStudentNo: parsedData.studentNumber || meta?.studentNo || '01',
      transcribedText: parsedData.transcribedText || '',
      selfReportedWeather: parsedData.selfReportedWeather || 'sunny',
      selfReported4RFocus: parsedData.selfReported4RFocus || 'relationship',
      analysis: {
        sentimentScore: parsedData.sentimentScore || 4.0,
        primaryEmotion: parsedData.primaryEmotion || '平靜',
        secondaryEmotions: parsedData.secondaryEmotions || [],
        fourRs: parsedData.fourRs || { rest: 4, relaxation: 4, relationship: 4, resilience: 4 },
        summary: parsedData.summary || '',
        keyThemes: parsedData.keyThemes || [],
        riskLevel: parsedData.riskLevel || 'NORMAL',
        safetyFlags: parsedData.safetyFlags || [],
        mascotFeedback: parsedData.mascotFeedback || '信信與恩恩隨時陪伴著你，天天都有新收穫！',
        analyzedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error analyzing diary image:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze diary image' });
  }
});
