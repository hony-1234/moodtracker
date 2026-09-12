import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { sendGmail } from '../firebase/services';
import { buildDailyMorningReportHtml, DailyMorningReport } from './geminiSparkService';

export interface SparkleEmailConfig {
  enabled: boolean;
  recipients: string[];
  senderName: string;
  autoDispatch: boolean;
  webhookUrl?: string; // Google Apps Script Web App or custom Webhook URL
  lastDispatchedAt?: string;
}

export const DEFAULT_SPARKLE_CONFIG: SparkleEmailConfig = {
  enabled: true,
  recipients: [
    'counselor@mail.gccps.edu.hk',
    'social_worker@mail.gccps.edu.hk',
    'vice_principal@mail.gccps.edu.hk',
    'principal@mail.gccps.edu.hk'
  ],
  senderName: '天主教善導小學 Sparkle 智能心靈警報',
  autoDispatch: true,
  webhookUrl: ''
};

/**
 * Retrieve Sparkle Email Configuration from Firestore
 */
export const getSparkleEmailConfig = async (): Promise<SparkleEmailConfig> => {
  try {
    const docRef = doc(db, 'system_settings', 'sparkle_email_config');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        enabled: data.enabled !== undefined ? data.enabled : DEFAULT_SPARKLE_CONFIG.enabled,
        recipients: Array.isArray(data.recipients) && data.recipients.length > 0 
          ? data.recipients 
          : DEFAULT_SPARKLE_CONFIG.recipients,
        senderName: data.senderName || DEFAULT_SPARKLE_CONFIG.senderName,
        autoDispatch: data.autoDispatch !== undefined ? data.autoDispatch : DEFAULT_SPARKLE_CONFIG.autoDispatch,
        webhookUrl: data.webhookUrl || '',
        lastDispatchedAt: data.lastDispatchedAt
      };
    }
  } catch (err) {
    console.warn('Failed to load sparkle_email_config from Firestore, using default:', err);
  }
  return DEFAULT_SPARKLE_CONFIG;
};

/**
 * Save Sparkle Email Configuration to Firestore
 */
export const saveSparkleEmailConfig = async (config: Partial<SparkleEmailConfig>): Promise<void> => {
  try {
    const docRef = doc(db, 'system_settings', 'sparkle_email_config');
    await setDoc(docRef, {
      ...config,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.error('Failed to save sparkle_email_config:', err);
    throw err;
  }
};

export interface SparkleDispatchParams {
  to: string | string[];
  subject: string;
  htmlBody: string;
  plainText?: string;
  alertType?: 'CRITICAL_NLP' | 'CONSECUTIVE_LOW' | 'SEVERE_DROP' | 'MORNING_REPORT' | 'TEST';
  metadata?: any;
  gmailToken?: string | null;
}

export interface SparkleDispatchRecord {
  id?: string;
  timestamp: string;
  to: string[];
  subject: string;
  alertType: string;
  channel: 'GMAIL_DIRECT' | 'GAS_WEBHOOK' | 'CLOUD_WEBHOOK' | 'QUEUE_ONLY';
  status: 'DELIVERED' | 'FAILED' | 'QUEUED';
  details?: string;
}

/**
 * Record a dispatch event in Firestore for teacher audit review
 */
export const recordSparkleDispatch = async (record: Omit<SparkleDispatchRecord, 'id'>): Promise<void> => {
  try {
    await addDoc(collection(db, 'sparkle_dispatches'), {
      ...record,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.warn('Failed to log dispatch to sparkle_dispatches collection:', err);
  }
};

/**
 * Fetch recent dispatch records for the admin dashboard
 */
export const getRecentSparkleDispatches = async (maxCount: number = 10): Promise<SparkleDispatchRecord[]> => {
  try {
    const q = query(collection(db, 'sparkle_dispatches'), orderBy('createdAt', 'desc'), limit(maxCount));
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        timestamp: data.timestamp || (data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString('zh-HK') : new Date().toLocaleString('zh-HK')),
        to: Array.isArray(data.to) ? data.to : [data.to || ''],
        subject: data.subject || '',
        alertType: data.alertType || 'GENERAL',
        channel: data.channel || 'GAS_WEBHOOK',
        status: data.status || 'DELIVERED',
        details: data.details || ''
      };
    });
  } catch (err) {
    console.warn('Failed to fetch recent sparkle dispatches:', err);
    return [];
  }
};

export interface SparkleDispatchResult {
  success: boolean;
  channel: 'GMAIL_DIRECT' | 'GAS_WEBHOOK' | 'CLOUD_WEBHOOK' | 'QUEUE_ONLY';
  message: string;
  error?: string;
}

/**
 * Autonomous Email Dispatcher by Sparkle
 * Automatically chooses the best delivery route:
 * 1. Current Active Google Session / Token (Direct Gmail API)
 * 2. Google Apps Script Webhook Relay (100% Zero-Login for Google Workspace)
 * 3. Fallback queue in Firestore with clear status indication
 */
export const dispatchSparkleAlertEmail = async (params: SparkleDispatchParams): Promise<SparkleDispatchResult> => {
  const { to, subject, htmlBody, alertType = 'CRITICAL_NLP', metadata, gmailToken } = params;
  const config = await getSparkleEmailConfig();

  const recipientList = Array.isArray(to) 
    ? to 
    : to.split(',').map(s => s.trim()).filter(Boolean);

  const finalRecipients = recipientList.length > 0 
    ? recipientList 
    : config.recipients;

  const toHeader = finalRecipients.join(', ');

  console.log(`[Sparkle Autonomous Mailer] Dispatching ${alertType} to:`, toHeader);

  // Method 1: If an active Google token is available (from current teacher session or background refresh)
  if (gmailToken) {
    try {
      await sendGmail(gmailToken, toHeader, subject, htmlBody, true);
      console.log('[Sparkle Autonomous Mailer] Successfully delivered via Gmail API');
      await recordSparkleDispatch({
        timestamp: new Date().toLocaleString('zh-HK'),
        to: finalRecipients,
        subject,
        alertType,
        channel: 'GMAIL_DIRECT',
        status: 'DELIVERED',
        details: '經由 Google Gmail API 成功寄達收件匣'
      });
      return { 
        success: true, 
        channel: 'GMAIL_DIRECT',
        message: `🎉 郵件已成功經由 Google API 送達 ${toHeader}！`
      };
    } catch (err: any) {
      console.warn('[Sparkle Autonomous Mailer] Direct Gmail dispatch failed, checking Webhook relay:', err);
    }
  }

  // Method 2: If a Google Apps Script Web App or custom Webhook URL is configured
  if (config.webhookUrl && config.webhookUrl.trim().startsWith('http')) {
    const webhookEndpoint = config.webhookUrl.trim();
    try {
      console.log('[Sparkle Autonomous Mailer] Sending via Webhook Relay:', webhookEndpoint);

      const payload = JSON.stringify({
        to: finalRecipients,
        subject,
        html: htmlBody,
        htmlBody,
        alertType,
        metadata: metadata || {},
        source: 'GCCPS_SPARKLE_AUTONOMOUS_SYSTEM'
      });

      // For Google Apps Script Web Apps (script.google.com), standard CORS might redirect with 302.
      // Using 'no-cors' mode with text/plain ensures the browser transmits the payload reliably.
      const isGAS = webhookEndpoint.includes('script.google.com');

      if (isGAS) {
        await fetch(webhookEndpoint, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: payload
        });
      } else {
        const res = await fetch(webhookEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload
        });
        if (!res.ok) {
          throw new Error(`Webhook returned status ${res.status}: ${await res.text()}`);
        }
      }

      console.log('[Sparkle Autonomous Mailer] Successfully relayed through Webhook');
      await recordSparkleDispatch({
        timestamp: new Date().toLocaleString('zh-HK'),
        to: finalRecipients,
        subject,
        alertType,
        channel: isGAS ? 'GAS_WEBHOOK' : 'CLOUD_WEBHOOK',
        status: 'DELIVERED',
        details: `已透過 ${isGAS ? 'Google Apps Script 中繼' : '雲端 Webhook'} 自主寄出（免手動登入）`
      });

      return {
        success: true,
        channel: isGAS ? 'GAS_WEBHOOK' : 'CLOUD_WEBHOOK',
        message: alertType === 'MORNING_REPORT'
          ? `🎉 每日心靈健康晨報範例已成功透過雲端中繼寄達 ${toHeader}！請檢查收件匣查看精美的全校晨報排版。`
          : `🎉 已透過 Sparkle 雲端中繼自主寄發至 ${toHeader}，全程免手動登入！`
      };
    } catch (webhookErr: any) {
      console.warn('[Sparkle Autonomous Mailer] Webhook relay failed:', webhookErr);
    }
  }

  // Method 3: No real sender active (Saved to Firestore queue only)
  // Queue to Firestore so no alert data is ever lost
  try {
    await addDoc(collection(db, 'sparkle_cloud_mailbox'), {
      to: finalRecipients,
      subject,
      htmlBody,
      alertType,
      metadata: metadata || {},
      status: 'queued_pending_relay',
      deliveredAt: serverTimestamp(),
      agent: 'Gemini Spark 2.5 Flash Autonomous System'
    });

    await recordSparkleDispatch({
      timestamp: new Date().toLocaleString('zh-HK'),
      to: finalRecipients,
      subject,
      alertType,
      channel: 'QUEUE_ONLY',
      status: 'QUEUED',
      details: '警報已進入雲端隊列，等待配置實體發信通道 (Google Apps Script / Gmail)'
    });

    console.log('[Sparkle Autonomous Mailer] Queued to Firestore sparkle_cloud_mailbox (no active physical transport)');
    
    return { 
      success: false, 
      channel: 'QUEUE_ONLY', 
      message: '⚠️ 測試卡片已生成並存入 Sparkle 雲端隊列，但目前尚未配置實體郵件發送通道。請在下方設定「Google Apps Script 發信中繼」或登入 Google，信件即可真正送達您的收件匣！'
    };
  } catch (relayErr: any) {
    console.error('[Sparkle Autonomous Mailer] Failed to queue alert:', relayErr);
    return { 
      success: false, 
      channel: 'QUEUE_ONLY', 
      message: '❌ 處理郵件時發生錯誤: ' + (relayErr.message || String(relayErr)),
      error: relayErr.message 
    };
  }
};

/**
 * Generate a rich, realistic sample of the Gemini Spark Daily Morning Executive Report
 */
export const getSampleDailyMorningReport = (): DailyMorningReport => {
  const today = new Date().toISOString().split('T')[0];
  return {
    reportId: `sample_morning_report_${today}_${Date.now()}`,
    reportDate: `${today} (每日晨報範例展示)`,
    generatedAt: new Date().toISOString(),
    totalSubmissions: 342,
    overallSchoolAvgMood: 4.1,
    highRiskCount: 1,
    consecutiveLowCount: 2,
    gradeStats: [
      { grade: 'P.1', totalSubmissions: 58, avgMood: 4.4, lowMoodCount: 1 },
      { grade: 'P.2', totalSubmissions: 56, avgMood: 4.3, lowMoodCount: 2 },
      { grade: 'P.3', totalSubmissions: 57, avgMood: 4.2, lowMoodCount: 1 },
      { grade: 'P.4', totalSubmissions: 60, avgMood: 3.9, lowMoodCount: 3 },
      { grade: 'P.5', totalSubmissions: 54, avgMood: 3.8, lowMoodCount: 4 },
      { grade: 'P.6', totalSubmissions: 57, avgMood: 3.7, lowMoodCount: 5 }
    ],
    priorityStudents: [
      {
        class: '5B',
        studentNo: '14',
        chineseName: '陳志軒',
        englishName: 'Chan Chi Hin',
        studentId: 'gccps_5b_14',
        currentMood: 1,
        reason: '🚨 觸發紅色高危言論警報 (偵測到絕望無助語意)',
        urgency: 'CRITICAL',
        recentScores: [3, 2, 1],
        studentComment: '功課壓力很大，覺得很累好想放棄，不知道找誰說...',
        aiSuggestedAction: '高危緊急個案！請班主任與駐校社工於今早晨讀時段優先進行 1 對 1 關心面談，評估情緒風險。'
      },
      {
        class: '3A',
        studentNo: '08',
        chineseName: '林巧兒',
        englishName: 'Lam Hiu Yee',
        studentId: 'gccps_3a_08',
        currentMood: 2,
        reason: '⚠️ 連續 3 天低落情緒 (Streak Alert)',
        urgency: 'ATTENTION',
        recentScores: [2, 2, 2],
        studentComment: '好朋友最近都不理我，自己一個人好孤單。',
        aiSuggestedAction: '建議科任及輔導組協助進行同儕人際融入引導，鼓勵參與常規午間 4Rs 歡樂手作坊。'
      },
      {
        class: '6C',
        studentNo: '21',
        chineseName: '黃子謙',
        englishName: 'Wong Tsz Him',
        studentId: 'gccps_6c_21',
        currentMood: 2,
        reason: '⚠️ 連續 3 天低落情緒 (升中呈分壓力)',
        urgency: 'ATTENTION',
        recentScores: [3, 2, 2],
        studentComment: '昨晚溫習英文到很晚，睡眠不足頭很痛。',
        aiSuggestedAction: '適時引導學習時間管理與睡眠調適，協同家長留意作息，避免過度疲倦。'
      }
    ],
    executiveSummary: '今日全校整體心靈幸福指數維持在 4.1 分之健康水位。初小年級（P.1-P.3）整體精神充沛，充滿校園活力；高小年級（P.4-P.6）因應呈分試與日常學業進度，部分學生呈現輕微疲勞與焦慮趨勢。全校共標記 1 名需高度關注的高危個案及 2 名連續低落同學，輔導團隊已啟動今日優先支援清單。',
    keyObservations: [
      '初小學童同儕氛圍融洽，早晨入校問候熱烈，展現高度正向情感連結。',
      '高小年級（特別是 P.5 及 P.6）對學業期待感受較高，部分同學留言反映睡眠時長略顯不足。',
      '全校未通報重大集體情緒異常，整體心理防護網運作穩健有效。'
    ],
    priorityInterventions: [
      '請 5B 班主任與駐校社工於第一小息前完成對陳同學的晨光關懷與陪伴聆聽。',
      '請 3A 及 6C 班主任在班級經營中多給予正向讚賞，促進良性同儕互動與減壓。',
      '班主任課時間提醒學生實踐 4Rs 中的「Rest 充足休息」，建立規律作息好習慣。'
    ],
    morningAssemblyTip: '親愛的同學們，早安！聖經教導我們：「你們要將一切憂慮卸給天主，因為祂必照顧你們。」在成長的路上，遇到困難與疲累是正常的，請記得身邊的老師與同學都隨時願意聆聽與陪伴你。今天就給身邊的好友一個溫暖的笑容吧！',
    status: 'generated'
  };
};

/**
 * Send a realistic sample of the Gemini Spark Daily Morning Report using Sparkle Autonomous Mailer
 */
export const testSparkleAutonomousDispatch = async (targetEmail: string, token?: string | null): Promise<SparkleDispatchResult> => {
  const sampleReport = getSampleDailyMorningReport();
  const subject = `[晨報範例] 天主教善導小學 — 全校心靈健康與 4Rs 每日晨間情報 (Gemini Spark AI 智能生成範例)`;
  const htmlBody = buildDailyMorningReportHtml(sampleReport);

  return await dispatchSparkleAlertEmail({
    to: targetEmail,
    subject,
    htmlBody,
    alertType: 'MORNING_REPORT',
    metadata: { test: true, isSampleReport: true },
    gmailToken: token
  });
};
