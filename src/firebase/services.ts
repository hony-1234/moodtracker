import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth';
import { auth, db } from './config';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { OperationType, FirestoreErrorInfo } from '../types';
import { StudentDiaryEntry } from '../types/diary';

export type MascotId = 'xinxin' | 'enen';

export interface CampusMascotSettings {
  activeMascot: MascotId;
  updatedAt: string;
  updatedBy?: string;
}

/**
 * Get currently active campus mascot from Firestore / localStorage
 */
export const getActiveMascot = async (): Promise<MascotId> => {
  try {
    const docRef = doc(db, 'systemSettings', 'campusMascot');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as CampusMascotSettings;
      if (data.activeMascot === 'xinxin' || data.activeMascot === 'enen') {
        localStorage.setItem('gccps_active_mascot', data.activeMascot);
        return data.activeMascot;
      }
    }
  } catch (err) {
    console.warn('Could not fetch mascot from Firestore, using local fallback:', err);
  }
  const local = localStorage.getItem('gccps_active_mascot');
  return (local === 'xinxin' || local === 'enen') ? (local as MascotId) : 'enen';
};

/**
 * Set currently active campus mascot in Firestore and localStorage
 */
export const setActiveMascot = async (mascotId: MascotId, userEmail?: string): Promise<void> => {
  localStorage.setItem('gccps_active_mascot', mascotId);
  try {
    const docRef = doc(db, 'systemSettings', 'campusMascot');
    await setDoc(docRef, {
      activeMascot: mascotId,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail || auth.currentUser?.email || 'Teacher'
    }, { merge: true });
  } catch (err) {
    console.error('Failed to update active mascot in Firestore:', err);
  }
};

/**
 * Subscribe in real-time to active campus mascot updates
 */
export const subscribeActiveMascot = (callback: (mascotId: MascotId) => void) => {
  try {
    const docRef = doc(db, 'systemSettings', 'campusMascot');
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as CampusMascotSettings;
        if (data.activeMascot === 'xinxin' || data.activeMascot === 'enen') {
          localStorage.setItem('gccps_active_mascot', data.activeMascot);
          callback(data.activeMascot);
        }
      }
    }, (err) => {
      console.warn('Mascot subscription error, falling back to local storage:', err);
      const local = localStorage.getItem('gccps_active_mascot');
      callback((local === 'xinxin' || local === 'enen') ? (local as MascotId) : 'enen');
    });
  } catch (e) {
    const local = localStorage.getItem('gccps_active_mascot');
    callback((local === 'xinxin' || local === 'enen') ? (local as MascotId) : 'enen');
    return () => {};
  }
};


/**
 * Maps Firebase Auth error codes to user-friendly messages in Traditional Chinese.
 */
export const formatAuthErrorMessage = (error: any): string => {
  const code = error?.code || '';
  switch (code) {
    case 'auth/configuration-not-found':
      return 'Firebase 尚未在控制台啟用此驗證方式！請至 Firebase Console > Authentication > 登入方式 (Sign-in method)，點擊「開始使用」並啟用「Google」或「電子郵件/密碼」提供者。';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return '電郵或密碼不正確，請重新檢查後再試。';
    case 'auth/user-not-found':
      return '找不到此電郵帳號，請確認帳號或先進行註冊。';
    case 'auth/email-already-in-use':
      return '此電郵地址已由其他帳號註冊，請直接登入。';
    case 'auth/weak-password':
      return '密碼強度不足，請設定至少 6 位字元的密碼。';
    case 'auth/invalid-email':
      return '請輸入有效的電子郵件地址格式。';
    case 'auth/user-disabled':
      return '此帳號已被管理員停用，請聯繫學校管理員。';
    case 'auth/too-many-requests':
      return '登入失敗次數過多，系統已暫時鎖定，請稍後再試。';
    case 'auth/network-request-failed':
      return '網路連線失敗，請檢查網路狀態。';
    case 'auth/popup-closed-by-user':
      return 'Google 登入視窗已關閉，請重新點擊進行驗證。';
    case 'auth/cancelled-popup-request':
      return '已取消先前的登入請求。';
    case 'auth/unauthorized-domain':
      return '此網域尚未在 Firebase 授權網域清單中，請在 Firebase Console > Authentication > 設定 > 授權網域中加入 localhost。';
    default:
      return error?.message || '身份驗證失敗，請重試。';
  }
};

/**
 * Sign in using Google / Gmail OAuth Popup
 */
export const loginWithGoogle = async (): Promise<UserCredential> => {
  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
  return await signInWithPopup(auth, googleProvider);
};

/**
 * Sign in using Firebase Email/Password Authentication
 */
export const loginWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  return await signInWithEmailAndPassword(auth, email.trim(), password);
};

/**
 * Register a new user using Firebase Email/Password Authentication
 */
export const registerWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  return await createUserWithEmailAndPassword(auth, email.trim(), password);
};

/**
 * Sign out current authenticated user
 */
export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

/**
 * Send password reset email
 */
export const resetUserPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email.trim());
};

/**
 * Listen to Firebase Auth state changes
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

// Gmail sending utility
// Gmail sending utility (Supports both Plain Text & Rich Responsive HTML)
export const sendGmail = async (accessToken: string, to: string, subject: string, body: string, isHtml: boolean = false) => {
  const isHtmlBody = isHtml || body.trim().startsWith('<') || body.includes('<!DOCTYPE') || body.includes('<div') || body.includes('<html');
  const contentType = isHtmlBody ? "Content-Type: text/html; charset=utf-8" : "Content-Type: text/plain; charset=utf-8";

  const emailLines = [
    `To: ${to}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    contentType,
    "",
    body
  ];
  const emailStr = emailLines.join('\r\n');
  const base64url = btoa(unescape(encodeURIComponent(emailStr))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: base64url }),
  });
  if (!res.ok) {
    throw new Error('Failed to send email: ' + await res.text());
  }
};

// Helper to refresh Gmail Access Token using client_id, client_secret, and refresh_token
export const refreshGmailAccessToken = async (clientId: string, clientSecret: string, refreshToken: string) => {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to refresh access token: ' + await res.text());
  }

  const data = await res.json();
  return {
    accessToken: data.access_token as string,
    expiresIn: data.expires_in as number // in seconds
  };
};

// Helper to exchange authorization code for refresh_token and initial access_token
export const exchangeAuthCodeForTokens = async (clientId: string, clientSecret: string, authCode: string, redirectUri: string) => {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code: authCode,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to exchange auth code: ' + await res.text());
  }

  const data = await res.json();
  return {
    accessToken: data.access_token as string,
    refreshToken: data.refresh_token as string,
    expiresIn: data.expires_in as number
  };
};

/**
 * ============================================================================
 * 4Rs 心靈成長日記 (STUDENT DIARY SERVICES)
 * ============================================================================
 */

/**
 * 儲存或更新單篇學生心靈日記 (Auto-saves to Firestore)
 */
export const saveStudentDiaryEntry = async (entry: StudentDiaryEntry): Promise<void> => {
  try {
    const docRef = doc(db, 'studentDiaries', entry.id);
    await setDoc(docRef, entry, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `studentDiaries/${entry.id}`);
  }
};

/**
 * 批次儲存多篇心靈日記
 */
export const batchSaveStudentDiaries = async (entries: StudentDiaryEntry[]): Promise<void> => {
  try {
    await Promise.all(entries.map(entry => saveStudentDiaryEntry(entry)));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'studentDiaries/batch');
  }
};

/**
 * 依班級即時監聽心靈日記列表 (Teacher View)
 */
export const subscribeDiariesByClass = (
  className: string,
  callback: (diaries: StudentDiaryEntry[]) => void
) => {
  try {
    const q = className === 'ALL' || !className
      ? collection(db, 'studentDiaries')
      : query(collection(db, 'studentDiaries'), where('class', '==', className));

    return onSnapshot(q, (snapshot) => {
      const items: StudentDiaryEntry[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as StudentDiaryEntry);
      });
      // Sort by submissionDate descending
      items.sort((a, b) => (b.submissionDate || '').localeCompare(a.submissionDate || ''));
      callback(items);
    }, (error) => {
      console.error('Error subscribing to class diaries:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Failed to setup class diaries listener:', error);
    return () => {};
  }
};

/**
 * 依學生學號即時監聽心靈日記列表 (Student View)
 */
export const subscribeDiariesByStudent = (
  studentNumber: string,
  callback: (diaries: StudentDiaryEntry[]) => void
) => {
  try {
    const q = query(
      collection(db, 'studentDiaries'),
      where('studentNumber', '==', studentNumber)
    );

    return onSnapshot(q, (snapshot) => {
      const items: StudentDiaryEntry[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as StudentDiaryEntry);
      });
      items.sort((a, b) => (b.submissionDate || '').localeCompare(a.submissionDate || ''));
      callback(items);
    }, (error) => {
      console.error('Error subscribing to student diaries:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Failed to setup student diaries listener:', error);
    return () => {};
  }
};

/**
 * 刪除單篇日記
 */
export const deleteStudentDiaryEntry = async (diaryId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'studentDiaries', diaryId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `studentDiaries/${diaryId}`);
  }
};

export interface StudentAlertEmailParams {
  alertType: 'CRITICAL_NLP' | 'CONSECUTIVE_LOW' | 'EMOTIONAL_DROP';
  studentClass: string;
  studentNumber: string;
  studentName?: string;
  studentId?: string;
  studentEmail?: string;
  moodScore: number;
  reason: string;
  comment?: string;
  dates?: string[];
  scores?: number[];
  aiInsight?: string;
  recommendedAction?: string;
}

export function buildStudentAlertEmailHtml(params: StudentAlertEmailParams): string {
  const isCritical = params.alertType === 'CRITICAL_NLP';
  const headerBg = isCritical ? 'linear-gradient(135deg, #7F1D1D 0%, #B91C1C 100%)' : 'linear-gradient(135deg, #78350F 0%, #D97706 100%)';
  const badgeTitle = isCritical ? '🚨 學生高危言論緊急預警' : (params.alertType === 'EMOTIONAL_DROP' ? '📉 學生情緒驟降預警' : '⚠️ 學生連續多日低落預警');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${badgeTitle}</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 640px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <div style="background: ${headerBg}; padding: 20px 24px; color: #FFFFFF;">
      <div style="font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; opacity: 0.85;">Good Counsel Catholic Primary School</div>
      <h2 style="margin: 6px 0 0 0; font-size: 18px; font-weight: 900; color: #FFFFFF;">${badgeTitle}</h2>
    </div>
    
    <div style="padding: 24px;">
      <div style="background-color: #F1F5F9; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 4px 0; color: #64748B; width: 110px; font-weight: bold;">班級 / 學號:</td>
            <td style="padding: 4px 0; color: #0F172A; font-weight: 800;">${params.studentClass} 班 ${params.studentNumber} 號</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748B; font-weight: bold;">學生姓名:</td>
            <td style="padding: 4px 0; color: #0F172A; font-weight: 800;">${params.studentName || '未登記'} ${params.studentId ? `(${params.studentId})` : ''}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748B; font-weight: bold;">登記電郵:</td>
            <td style="padding: 4px 0; color: #475569;">${params.studentEmail || '未綁定'}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748B; font-weight: bold;">當前心情指數:</td>
            <td style="padding: 4px 0; color: #E11D48; font-weight: 900; font-size: 15px;">${params.moodScore} / 5 分</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 20px;">
        <div style="font-size: 12px; font-weight: 800; color: #334155; text-transform: uppercase; margin-bottom: 6px;">觸發原因</div>
        <div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 12px 14px; border-radius: 0 8px 8px 0; font-size: 13px; color: #991B1B; font-weight: 700;">
          ${params.reason}
        </div>
      </div>

      ${params.comment ? `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 12px; font-weight: 800; color: #334155; text-transform: uppercase; margin-bottom: 6px;">學生留言內容</div>
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 14px; border-radius: 10px; font-size: 13.5px; color: #1E293B; line-height: 1.5; font-style: italic;">
          「${params.comment}」
        </div>
      </div>` : ''}

      ${params.scores && params.scores.length > 1 ? `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 12px; font-weight: 800; color: #334155; text-transform: uppercase; margin-bottom: 6px;">近期趨勢階梯</div>
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 10px 14px; border-radius: 8px; font-size: 12px; color: #475569;">
          歷史評分：<strong>${params.scores.join('分 → ')}分</strong>
          ${params.dates ? `<div style="margin-top: 4px; font-size: 11px; color: #94A3B8;">日期：${params.dates.join(', ')}</div>` : ''}
        </div>
      </div>` : ''}

      <div style="background: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 10px; padding: 14px;">
        <div style="font-size: 12px; font-weight: 800; color: #4338CA; text-transform: uppercase;">🤖 Gemini Spark 建議介入措施</div>
        <div style="margin-top: 4px; font-size: 12.5px; color: #312E81; line-height: 1.5;">
          ${params.recommendedAction || '請班主任在今日第一節小息主動聯絡學生關心，並通報學校輔導組跟進。'}
        </div>
      </div>
    </div>

    <div style="padding: 14px 24px; background: #F1F5F9; text-align: center; font-size: 11px; color: #94A3B8;">
      天主教善導小學 學生情緒追蹤與安全防護中心 • 系統自動即時發送
    </div>
  </div>
</body>
</html>`;
}

export const saveDailyReportToFirestore = async (report: any) => {
  try {
    const docRef = doc(db, 'daily_morning_reports', report.reportDate);
    await setDoc(docRef, { ...report, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to save daily report to Firestore:', err);
    return false;
  }
};

export const getDailyReportFromFirestore = async (dateStr: string) => {
  try {
    const docRef = doc(db, 'daily_morning_reports', dateStr);
    const snap = await getDoc(docRef);
    if (snap.exists()) return snap.data();
    return null;
  } catch (err) {
    console.error('Failed to get daily report from Firestore:', err);
    return null;
  }
};

export const getRecentDailyReports = async (limitCount: number = 7) => {
  try {
    const snap = await getDocs(collection(db, 'daily_morning_reports'));
    const list: any[] = [];
    snap.forEach(d => list.push(d.data()));
    list.sort((a, b) => (b.reportDate || '').localeCompare(a.reportDate || ''));
    return list.slice(0, limitCount);
  } catch (err) {
    console.error('Failed to list daily reports:', err);
    return [];
  }
};

export const saveGeminiConfig = async (config: any) => {
  try {
    const docRef = doc(db, 'system_settings', 'gemini_config');
    await setDoc(docRef, config, { merge: true });
    if (config.apiKey) {
      localStorage.setItem('gccps_gemini_api_key', config.apiKey);
    }
    return true;
  } catch (err) {
    console.error('Failed to save Gemini config:', err);
    return false;
  }
};

export const getGeminiConfig = async () => {
  try {
    const docRef = doc(db, 'system_settings', 'gemini_config');
    const snap = await getDoc(docRef);
    if (snap.exists()) return snap.data();
    return null;
  } catch (err) {
    console.error('Failed to get Gemini config:', err);
    return null;
  }
};
