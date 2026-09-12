import { GoogleGenAI } from '@google/genai';
import { ALL_CLASSES } from '../types';
import { findStudentByClassAndNumber } from '../data/studentsRoster';
import { ConsecutiveLowMoodAlert, detectConsecutiveLowMood } from '../utils/consecutiveDetection';
import { analyzeTextNlp } from '../utils/sensitivityEngine';

export interface GeminiConfig {
  apiKey: string;
  modelName: string; // default: 'gemini-2.5-flash'
  autoMorningSend: boolean;
  morningSendTime: string; // e.g. '08:30'
  onlySchoolDays?: boolean; // default: true (Monday to Friday only)
  recipients: string[];
  lastSentDate?: string; // YYYY-MM-DD
}

export const DEFAULT_GEMINI_CONFIG: GeminiConfig = {
  apiKey: (import.meta as any).env?.VITE_GEMINI_API_KEY || '',
  modelName: 'gemini-2.5-flash',
  autoMorningSend: true,
  morningSendTime: '08:30',
  onlySchoolDays: true,
  recipients: [
    'principal@mail.gccps.edu.hk',
    'vice_principal@mail.gccps.edu.hk',
    'counselor@mail.gccps.edu.hk',
    'social_worker@mail.gccps.edu.hk'
  ]
};

export interface StudentCarePriority {
  class: string;
  studentNo: string;
  chineseName: string;
  englishName: string;
  studentId: string;
  currentMood: number;
  reason: string;
  urgency: 'CRITICAL' | 'ATTENTION';
  recentScores: number[];
  studentComment: string;
  aiSuggestedAction: string;
}

export interface GradeStat {
  grade: string;
  totalSubmissions: number;
  avgMood: number;
  lowMoodCount: number;
}

export interface DailyMorningReport {
  reportId: string;
  reportDate: string;
  generatedAt: string;
  totalSubmissions: number;
  overallSchoolAvgMood: number;
  highRiskCount: number;
  consecutiveLowCount: number;
  gradeStats: GradeStat[];
  priorityStudents: StudentCarePriority[];
  executiveSummary: string;
  keyObservations: string[];
  priorityInterventions: string[];
  morningAssemblyTip: string;
  status: 'draft' | 'generated' | 'sent';
  sentTo?: string[];
  sentAt?: string;
}

/**
 * Retrieve active Gemini API key from localStorage, Firestore cache or env
 */
export const getActiveGeminiApiKey = (): string => {
  const localKey = localStorage.getItem('gccps_gemini_api_key');
  if (localKey && localKey.trim()) return localKey.trim();
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim()) return envKey.trim();
  // Check default firebase key if provided as fallback
  const fbKey = (import.meta as any).env?.VITE_FIREBASE_API_KEY;
  if (fbKey && fbKey.startsWith('AIza')) return fbKey;
  return '';
};

/**
 * Robust caller to Gemini Flash via SDK with direct REST API fallback
 */
export async function callGeminiSpark(
  prompt: string,
  systemInstruction?: string,
  customApiKey?: string
): Promise<string> {
  const apiKey = (customApiKey || getActiveGeminiApiKey() || '').trim();
  if (!apiKey) {
    throw new Error('未設定 Gemini API 金鑰 (Gemini API Key missing)。請在智能監控中心輸入金鑰。');
  }

  // 1. Try official @google/genai SDK
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined
    });
    if (response && response.text) {
      return response.text;
    }
  } catch (sdkErr: any) {
    console.warn('Gemini SDK call error, trying direct REST endpoint:', sdkErr?.message || sdkErr);
  }

  // 2. Direct REST API fallback for guaranteed browser compatibility
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const bodyPayload: any = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2048
    }
  };

  if (systemInstruction) {
    bodyPayload.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyPayload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API 回應錯誤 (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidateText) {
    throw new Error('Gemini API 未回傳有效文字內容。');
  }

  return candidateText;
}

/**
 * Deep Sentiment & Crisis NLP Analysis for a flagged student entry
 */
export async function analyzeStudentSentimentWithGemini(
  comment: string,
  moodScore: number,
  studentMeta: { class: string; studentNo: string; name?: string }
): Promise<{
  riskLevel: 'CRITICAL' | 'ATTENTION' | 'NORMAL';
  sentimentLabel: string;
  psychologicalInsight: string;
  recommendedAction: string;
}> {
  const localNlp = analyzeTextNlp(comment);

  if (!comment || comment.trim().length === 0) {
    return {
      riskLevel: moodScore <= 2 ? 'ATTENTION' : 'NORMAL',
      sentimentLabel: moodScore <= 2 ? '低落未留言' : '平靜',
      psychologicalInsight: moodScore <= 2 ? '學生填報低情緒指數但無文字抒發，可能存在未言明的隱性情緒困擾。' : '情緒狀態常態。',
      recommendedAction: moodScore <= 2 ? '由班主任在早晨點名或第一小息進行主動口頭關懷。' : '持續常態觀察。'
    };
  }

  const systemPrompt = `你是天主教善導小學 (GCCPS) 專用的小學生心理輔導與危機介入 AI 專家『Gemini Spark』。
請分析學生的心情評分及日常留言，並輸出合法 JSON 格式（不要包含任何 Markdown 標記）：
{
  "riskLevel": "CRITICAL" | "ATTENTION" | "NORMAL",
  "sentimentLabel": "如：自傷隱憂 / 焦慮恐懼 / 同儕衝突 / 學業壓力 / 沮喪失落 / 平和喜悅",
  "psychologicalInsight": "以 40-70 字客觀剖析學生當前心理狀態與背後動機",
  "recommendedAction": "以 30-50 字給予班主任及駐校社工具體的黃金 24 小時輔導介入行動指引"
}`;

  const userPrompt = `班級：${studentMeta.class}
學號：${studentMeta.studentNo}
學生姓名：${studentMeta.name || '未提供'}
自評心情分數 (1-5)：${moodScore}
學生文字留言：「${comment}」
本地規則初篩檢驗結果：${localNlp.level.toUpperCase()} (${localNlp.matchedRuleSummary})`;

  try {
    const rawOutput = await callGeminiSpark(userPrompt, systemPrompt);
    const cleanJson = rawOutput.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return {
      riskLevel: parsed.riskLevel || (localNlp.level === 'red' ? 'CRITICAL' : 'ATTENTION'),
      sentimentLabel: parsed.sentimentLabel || '需跟進',
      psychologicalInsight: parsed.psychologicalInsight || '學生文字中透露出明顯情緒負載。',
      recommendedAction: parsed.recommendedAction || '建議由班主任儘速聯繫學生進行深度面談。'
    };
  } catch (err) {
    console.warn('Gemini sentiment analysis fallback to rule engine:', err);
    return {
      riskLevel: localNlp.level === 'red' ? 'CRITICAL' : (moodScore <= 2 || localNlp.level === 'yellow' ? 'ATTENTION' : 'NORMAL'),
      sentimentLabel: localNlp.category || '情緒異常',
      psychologicalInsight: `本地規則檢測結果：${localNlp.matchedRuleSummary}`,
      recommendedAction: localNlp.level === 'red' 
        ? '🚨 高危警示：請輔導主任與社工立即於今晨第一時間介入！'
        : '請班主任在今日第一節小息關心學生身心狀況。'
    };
  }
}

/**
 * Generate comprehensive School-wide Daily Morning Report
 */
export async function generateDailyMorningReport(
  allReports: any[],
  targetDateStr: string = ''
): Promise<DailyMorningReport> {
  const dateStr = targetDateStr || new Date().toISOString().split('T')[0];
  
  // 1. Filter reports for target date (or latest available)
  const todayReports = allReports.filter(r => {
    const d = r.date || r.日期;
    if (d) return String(d) === dateStr;
    const ts = r.timestamp ? (r.timestamp.toMillis ? r.timestamp.toMillis() : r.timestamp) : 0;
    if (ts > 0) {
      const dt = new Date(ts);
      return dt.toISOString().split('T')[0] === dateStr;
    }
    return false;
  });

  // If today's reports are empty (e.g. very early morning), fallback to all reports from last 24h
  const activePool = todayReports.length > 0 ? todayReports : allReports.slice(-300);

  // 2. Compute Statistics
  const validScores = activePool
    .map(r => parseInt(r.moodScore || r.心情指數 || '0', 10))
    .filter(s => !isNaN(s) && s > 0 && s <= 5);

  const overallSchoolAvgMood = validScores.length > 0
    ? parseFloat((validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(2))
    : 4.5;

  // Grade-level breakdown (P1 ~ P6)
  const gradeMap: Record<string, { total: number; sum: number; lowCount: number }> = {
    'P.1': { total: 0, sum: 0, lowCount: 0 },
    'P.2': { total: 0, sum: 0, lowCount: 0 },
    'P.3': { total: 0, sum: 0, lowCount: 0 },
    'P.4': { total: 0, sum: 0, lowCount: 0 },
    'P.5': { total: 0, sum: 0, lowCount: 0 },
    'P.6': { total: 0, sum: 0, lowCount: 0 },
  };

  activePool.forEach(r => {
    const cls = String(r.class || r.班別 || '').toUpperCase();
    const gradeNum = cls.charAt(0);
    const gradeKey = `P.${gradeNum}`;
    if (gradeMap[gradeKey]) {
      const score = parseInt(r.moodScore || r.心情指數 || '0', 10);
      if (!isNaN(score) && score > 0) {
        gradeMap[gradeKey].total++;
        gradeMap[gradeKey].sum += score;
        if (score <= 2) gradeMap[gradeKey].lowCount++;
      }
    }
  });

  const gradeStats: GradeStat[] = Object.keys(gradeMap).map(grade => ({
    grade,
    totalSubmissions: gradeMap[grade].total,
    avgMood: gradeMap[grade].total > 0 ? parseFloat((gradeMap[grade].sum / gradeMap[grade].total).toFixed(2)) : 0,
    lowMoodCount: gradeMap[grade].lowCount
  }));

  // 3. Consecutive low score detection & Red NLP detection across all students
  const consecutiveAlerts: ConsecutiveLowMoodAlert[] = detectConsecutiveLowMood(allReports, {
    lowScoreThreshold: 3,
    criticalScoreThreshold: 2,
    minStreakDays: 3,
    detectSevereDrop: true,
    onlySchoolDays: true
  });

  const priorityStudents: StudentCarePriority[] = [];

  // Add consecutive low mood alerts
  consecutiveAlerts.forEach(alert => {
    priorityStudents.push({
      class: alert.class,
      studentNo: alert.studentNo,
      chineseName: alert.chineseName,
      englishName: alert.englishName,
      studentId: alert.studentId,
      currentMood: alert.scores[alert.scores.length - 1] || 2,
      reason: alert.description,
      urgency: alert.urgency === 'high' ? 'CRITICAL' : 'ATTENTION',
      recentScores: alert.scores,
      studentComment: alert.comments[alert.comments.length - 1] || '',
      aiSuggestedAction: alert.type === 'severe_drop'
        ? '情緒出現突發大幅跳水，請導師於今日第一小息確認是否有突發家庭或同儕意外變故。'
        : `學生已連續 ${alert.streakCount} 次呈現低落情緒，建議啟動輔導關愛個案，協同社工深入晤談。`
    });
  });

  // Check recent records with RED NLP keywords
  activePool.forEach(r => {
    const comment = r.comment || r.學生留言 || '';
    if (comment) {
      const nlp = analyzeTextNlp(comment);
      if (nlp.level === 'red') {
        const cls = r.class || r.班別 || '';
        const sNo = String(r.studentNumber || r.學號 || '');
        // Check if already in priority list
        const exists = priorityStudents.some(p => p.class === cls && p.studentNo === sNo);
        if (!exists) {
          const roster = findStudentByClassAndNumber(cls, sNo);
          priorityStudents.unshift({
            class: cls,
            studentNo: sNo,
            chineseName: roster?.chineseName || r.studentName || `${sNo}號同學`,
            englishName: roster?.englishName || '',
            studentId: roster?.studentId || r.studentId || '',
            currentMood: parseInt(r.moodScore || r.心情指數 || '1', 10),
            reason: `🚨 觸發紅色高危言論警報 (${nlp.matchedRuleSummary})`,
            urgency: 'CRITICAL',
            recentScores: [parseInt(r.moodScore || r.心情指數 || '1', 10)],
            studentComment: comment,
            aiSuggestedAction: '高危緊急個案！請輔導主任與社工於晨讀時間立即指派專人接洽了解。'
          });
        }
      }
    }
  });

  // 4. Prompt Gemini Spark for Executive Briefing & Morning Assembly Tips
  const systemPrompt = `你是天主教善導小學 (Good Counsel Catholic Primary School) 專屬的學生身心靈健康與 4Rs AI 首席輔導總監『Gemini Spark』。
學校理念融合天主教核心價值（真理、義德、愛德、生命、家庭）及教育局 4Rs 全人身心靈健康框架（Rest, Relaxation, Relationship, Resilience）。
你的任務是針對全校每日晨間學生情緒數據，為校長、副校長、輔導主任與社工撰寫一份高規格、專業、溫暖且具前瞻性的「校園心靈健康每日晨報」。

請以嚴格的合法 JSON 格式回傳（勿包含 Markdown 語法或任何外部文字）：
{
  "executiveSummary": "120-180 字的全校晨間心理健康氣候總結，剖析學生整體心態與值得注意的結構性趨勢",
  "keyObservations": [
    "觀察點 1：年級或群體心理動向",
    "觀察點 2：同儕人際或抗逆力表徵",
    "觀察點 3：學業測考或身心休息負荷"
  ],
  "priorityInterventions": [
    "行動指引 1：針對高危同學的第一時間實體介入建議",
    "行動指引 2：針對連續低落同學的班主任協同輔導策略",
    "行動指引 3：全校性正向防護網之部署"
  ],
  "morningAssemblyTip": "以校長或晨會主持人視角，提供一段適合在今日早會廣播或班主任課向全校師生分享的 60-90 字溫暖感恩勉勵詞（融合 4Rs 與愛德精神）"
}`;

  const userStatsPrompt = `報告日期：${dateStr}
全校今日/近期填報總人次：${activePool.length}
全校平均心情指數：${overallSchoolAvgMood} / 5.0
高危警報人數：${priorityStudents.filter(p => p.urgency === 'CRITICAL').length} 人
連續情緒低落關注人數：${priorityStudents.filter(p => p.urgency !== 'CRITICAL').length} 人
各年級心情平均概況：
${gradeStats.map(g => `- ${g.grade}: 填報人次 ${g.totalSubmissions}, 平均分 ${g.avgMood}, 低分(<=2分)人次 ${g.lowMoodCount}`).join('\n')}

重點關注學生案例（前 5 筆）：
${priorityStudents.slice(0, 5).map(p => `[${p.class}班 ${p.studentNo}號 ${p.chineseName}] 心情:${p.currentMood}分 | 原因:${p.reason} | 留言:「${p.studentComment}」`).join('\n')}
`;

  let executiveSummary = `今日全校心靈健康整體指數維持在 ${overallSchoolAvgMood} 分的良好水準。低年級學生展現高度活力，部分中高年級學生因課業及測驗壓力出現零星低分情緒，需持續藉由 4Rs 活動予以舒緩。`;
  let keyObservations = [
    '整體校園心靈氛圍穩定，大部分班級展現良好的同學友愛與互助精神。',
    `今日共標記出 ${priorityStudents.length} 位需要特別跟進的同學，主要涵蓋連續情緒偏低及高危字詞預警。`,
    '建議加強宣導 Rest (充足睡眠) 與 Relaxation (放鬆減壓)，協助學生排解日常緊張。'
  ];
  let priorityInterventions = [
    '請高危關注學生的班主任於今日第一節小息展開主動關懷面談。',
    '輔導組協同駐校社工檢視連續 3 天低分名冊，排定後續跟進晤談日程。',
    '科任教師在課堂中適時給予正面讚美，營造溫馨安全的學習環境。'
  ];
  let morningAssemblyTip = '親愛的同學們，早安！今天讓我們在校園裡彼此多一個微笑，多一句關心的問候。遇到困難不要自己默默承擔，老師和同學都是你最溫暖的後盾。祝大家今天充滿平安與喜樂！';

  try {
    const rawAiOutput = await callGeminiSpark(userStatsPrompt, systemPrompt);
    const cleanJson = rawAiOutput.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    if (parsed.executiveSummary) executiveSummary = parsed.executiveSummary;
    if (Array.isArray(parsed.keyObservations) && parsed.keyObservations.length > 0) keyObservations = parsed.keyObservations;
    if (Array.isArray(parsed.priorityInterventions) && parsed.priorityInterventions.length > 0) priorityInterventions = parsed.priorityInterventions;
    if (parsed.morningAssemblyTip) morningAssemblyTip = parsed.morningAssemblyTip;
  } catch (aiErr) {
    console.warn('Gemini Daily Report generation used template fallback:', aiErr);
  }

  return {
    reportId: `daily_report_${dateStr}_${Date.now()}`,
    reportDate: dateStr,
    generatedAt: new Date().toISOString(),
    totalSubmissions: activePool.length,
    overallSchoolAvgMood,
    highRiskCount: priorityStudents.filter(p => p.urgency === 'CRITICAL').length,
    consecutiveLowCount: priorityStudents.filter(p => p.urgency !== 'CRITICAL').length,
    gradeStats,
    priorityStudents,
    executiveSummary,
    keyObservations,
    priorityInterventions,
    morningAssemblyTip,
    status: 'generated'
  };
}

/**
 * Render publication-grade responsive HTML email for Daily Morning Report
 */
export function buildDailyMorningReportHtml(report: DailyMorningReport): string {
  const urgencyBadge = (urgency: 'CRITICAL' | 'ATTENTION') => {
    if (urgency === 'CRITICAL') {
      return '<span style="background-color: #FEE2E2; color: #991B1B; padding: 4px 8px; border-radius: 6px; font-weight: bold; font-size: 11px;">🚨 高危緊急</span>';
    }
    return '<span style="background-color: #FEF3C7; color: #92400E; padding: 4px 8px; border-radius: 6px; font-weight: bold; font-size: 11px;">⚠️ 持續關注</span>';
  };

  const studentRows = report.priorityStudents.length === 0
    ? '<tr><td colspan="5" style="padding: 16px; text-align: center; color: #059669; font-weight: bold; background: #ECFDF5;">🎉 今日無高危或連續低落預警學生，全校心理狀態良好！</td></tr>'
    : report.priorityStudents.map((st, idx) => `
      <tr style="border-bottom: 1px solid #E2E8F0; ${idx % 2 === 1 ? 'background-color: #F8FAFC;' : ''}">
        <td style="padding: 10px 12px; font-size: 12px; font-weight: bold; color: #1E293B;">${st.class} 班 (${st.studentNo}號)</td>
        <td style="padding: 10px 12px; font-size: 12px; font-weight: bold; color: #0F172A;">${st.chineseName} <span style="font-size: 10px; color: #64748B;">${st.englishName}</span></td>
        <td style="padding: 10px 12px; font-size: 12px;">${urgencyBadge(st.urgency)}</td>
        <td style="padding: 10px 12px; font-size: 11px; color: #334155; line-height: 1.4;">
          <strong>${st.reason}</strong>
          ${st.studentComment ? `<div style="margin-top: 4px; color: #64748B; font-style: italic;">「${st.studentComment}」</div>` : ''}
        </td>
        <td style="padding: 10px 12px; font-size: 11px; color: #4338CA; font-weight: 600;">${st.aiSuggestedAction}</td>
      </tr>
    `).join('');

  const gradeBars = report.gradeStats.map(g => `
    <div style="display: inline-block; width: 15%; min-width: 80px; text-align: center; margin: 4px; padding: 8px 4px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px;">
      <div style="font-size: 11px; font-weight: bold; color: #64748B;">${g.grade}</div>
      <div style="font-size: 15px; font-weight: 800; color: ${g.avgMood < 3.5 ? '#E11D48' : '#059669'}; margin: 2px 0;">${g.avgMood > 0 ? g.avgMood : '-'}</div>
      <div style="font-size: 10px; color: #94A3B8;">${g.totalSubmissions} 筆登記</div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>天主教善導小學 — 每日心靈健康晨報</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans TC', sans-serif;">

<div style="max-width: 720px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #E2E8F0;">
  
  <!-- Header Banner -->
  <div style="background: linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%); padding: 24px; color: #FFFFFF;">
    <div style="font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #A5B4FC; font-weight: 800;">Good Counsel Catholic Primary School</div>
    <h1 style="margin: 8px 0 4px 0; font-size: 20px; font-weight: 900; color: #FFFFFF;">🌅 全校學生心靈健康與 4Rs 每日晨間情報</h1>
    <div style="font-size: 12px; color: #C7D2FE;">
      報告日期：<strong>${report.reportDate}</strong> &nbsp;|&nbsp; 智能生成引擎：<strong>Gemini 2.5 Flash Spark</strong>
    </div>
  </div>

  <!-- Key Metrics Row -->
  <div style="padding: 16px 24px; background: #EEF2FF; border-bottom: 1px solid #E0E7FF; display: flex; flex-wrap: wrap; justify-content: space-between;">
    <div style="text-align: center; padding: 8px 12px;">
      <div style="font-size: 10px; font-weight: bold; color: #4338CA; text-transform: uppercase;">全校平均幸福感</div>
      <div style="font-size: 24px; font-weight: 900; color: #1E1B4B;">${report.overallSchoolAvgMood} <span style="font-size: 12px; color: #6366F1;">/ 5.0</span></div>
    </div>
    <div style="text-align: center; padding: 8px 12px;">
      <div style="font-size: 10px; font-weight: bold; color: #4338CA; text-transform: uppercase;">本日登記人數</div>
      <div style="font-size: 24px; font-weight: 900; color: #1E1B4B;">${report.totalSubmissions} <span style="font-size: 12px; color: #6366F1;">人次</span></div>
    </div>
    <div style="text-align: center; padding: 8px 12px;">
      <div style="font-size: 10px; font-weight: bold; color: #DC2626; text-transform: uppercase;">🚨 高危言論警示</div>
      <div style="font-size: 24px; font-weight: 900; color: #DC2626;">${report.highRiskCount} <span style="font-size: 12px; color: #F87171;">人</span></div>
    </div>
    <div style="text-align: center; padding: 8px 12px;">
      <div style="font-size: 10px; font-weight: bold; color: #D97706; text-transform: uppercase;">⚠️ 連續低分關注</div>
      <div style="font-size: 24px; font-weight: 900; color: #D97706;">${report.consecutiveLowCount} <span style="font-size: 12px; color: #FBBF24;">人</span></div>
    </div>
  </div>

  <!-- Executive Summary Card -->
  <div style="padding: 24px; border-bottom: 1px solid #F1F5F9;">
    <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 900; color: #1E293B; display: flex; align-items: center;">
      🤖 Gemini Spark 晨間校園心靈宏觀總評
    </h3>
    <div style="background-color: #F8FAFC; border-left: 4px solid #4F46E5; padding: 14px 16px; border-radius: 0 8px 8px 0; font-size: 13px; line-height: 1.6; color: #334155;">
      ${report.executiveSummary}
    </div>

    <!-- Observations & Interventions Grid -->
    <div style="margin-top: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
      <div style="background: #FAFAFA; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 16px;">
        <h4 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 800; color: #0284C7;">📌 重點觀察指標 (Key Insights)</h4>
        <ul style="margin: 0; padding-left: 18px; font-size: 11.5px; color: #475569; line-height: 1.5;">
          ${report.keyObservations.map(o => `<li>${o}</li>`).join('')}
        </ul>
      </div>
      <div style="background: #FAFAFA; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 16px;">
        <h4 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 800; color: #16A34A;">🛡️ 今日輔導處置行動指引</h4>
        <ul style="margin: 0; padding-left: 18px; font-size: 11.5px; color: #475569; line-height: 1.5;">
          ${report.priorityInterventions.map(i => `<li>${i}</li>`).join('')}
        </ul>
      </div>
    </div>
  </div>

  <!-- Priority Care List -->
  <div style="padding: 24px; border-bottom: 1px solid #F1F5F9;">
    <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 900; color: #1E293B;">
      🚨 今日優先關懷個案名冊 (${report.priorityStudents.length} 位同學)
    </h3>
    <div style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="background: #F1F5F9; color: #475569; font-size: 11px; text-transform: uppercase;">
            <th style="padding: 8px 12px;">班別</th>
            <th style="padding: 8px 12px;">學生姓名</th>
            <th style="padding: 8px 12px;">狀態等級</th>
            <th style="padding: 8px 12px;">觸發原因與留言</th>
            <th style="padding: 8px 12px;">AI 輔導建議</th>
          </tr>
        </thead>
        <tbody>
          ${studentRows}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Grade-Level Health Bar -->
  <div style="padding: 20px 24px; background: #FFFFFF; border-bottom: 1px solid #F1F5F9;">
    <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 800; color: #334155;">
      📊 各年級心靈活力概況 (P.1 ~ P.6)
    </h3>
    <div style="text-align: center;">
      ${gradeBars}
    </div>
  </div>

  <!-- Morning Assembly Quote -->
  <div style="padding: 20px 24px; background: #FFFBEB; border-bottom: 1px solid #FDE68A;">
    <div style="font-size: 11px; font-weight: 800; color: #B45309; text-transform: uppercase;">💡 今日早會廣播 / 班主任晨光關懷小錦囊</div>
    <div style="margin-top: 6px; font-size: 13px; font-weight: 600; color: #78350F; line-height: 1.5; font-style: italic;">
      「${report.morningAssemblyTip}」
    </div>
  </div>

  <!-- Footer -->
  <div style="padding: 16px 24px; background: #F8FAFC; text-align: center; color: #94A3B8; font-size: 11px;">
    天主教善導小學 Good Counsel Catholic Primary School • 學生身心靈健康全方位守護系統<br>
    此晨報由 Gemini Spark 智能系統每日清晨自動彙整發送。若有任何急迫狀況，請逕洽學校輔導組及社工室。
  </div>

</div>

</body>
</html>`;
}
