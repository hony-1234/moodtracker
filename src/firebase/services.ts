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
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { OperationType, FirestoreErrorInfo } from '../types';

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
export const sendGmail = async (accessToken: string, to: string, subject: string, body: string) => {
  const emailLines = [
    `To: ${to}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    "Content-Type: text/plain; charset=utf-8",
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
