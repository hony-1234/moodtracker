import React, { useState, useEffect, useMemo, FormEvent, ChangeEvent } from 'react';
import { AnimatePresence } from 'motion/react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, signInAnonymously } from 'firebase/auth';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  where,
  addDoc,
  serverTimestamp,
  writeBatch,
  getDoc,
  setDoc,
  getDocs,
  orderBy,
  limit,
  deleteDoc
} from 'firebase/firestore';

// Core dependencies
import { auth, db, provider } from './firebase/config';
import { handleFirestoreError, sendGmail, refreshGmailAccessToken, exchangeAuthCodeForTokens } from './firebase/services';
import { ALL_CLASSES } from './constants/moodConstants';
import { OperationType } from './types';
import {
  isP1_3,
  getDisplayDate,
  parseDateString,
  getUnixTime,
  formatDateObj,
  getDefaultPass,
  getDefaultStudentPass
} from './utils/dateHelpers';
import { getWarningLevel, getWarningWeight } from './utils/sensitivityEngine';
import { sha256 } from './utils/passwordHashing';

// Components
import Header from './components/Layout/Header';
import MascotWatermarkBackground from './components/Layout/MascotWatermarkBackground';
import Landing from './components/Portals/Landing';
import StudentLogin from './components/Portals/StudentLogin';
import TeacherLogin from './components/Portals/TeacherLogin';
import StudentDashboard from './components/Dashboards/StudentDashboard/Index';
import { TeacherDashboard } from './components/Dashboards/TeacherDashboard/Index';
import { P13BatchGrader } from './components/Dashboards/TeacherDashboard/P13BatchGrader';

// Overlays
import {
  ActionModal,
  PrivacyPolicyModal,
  UpdateSummaryModal,
  SystemGuideModal
} from './components/Common/Modals';

// Module-level caches
let cachedAccessToken: string | null = null;
let cachedUser: User | null = null;
const processingAlertIds = new Set<string>();

export default function App() {
  // --- LAYOUT VIEWS ---
  const [viewState, setViewState] = useState<'LANDING' | 'STUDENT_LOGIN' | 'STUDENT_DASHBOARD' | 'TEACHER_LOGIN' | 'TEACHER_DASHBOARD' | 'TEACHER_P1_3_BATCH'>('LANDING');

  // --- GENERAL STATES ---
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>(() => localStorage.getItem('remember_me') === 'true' ? localStorage.getItem('saved_class') || '' : '');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState<boolean>(() => localStorage.getItem('remember_me') === 'true');

  // --- ALERT SYSTEM STATES ---
  const [alertEmails, setAlertEmails] = useState<string>('counselor@school.edu, homeroom_teacher@school.edu');

  // --- GOOGLE OAUTH SECURITY STATES ---
  const [tokenExpiryTime, setTokenExpiryTime] = useState<number | null>(null);
  const [hasPendingUndispatchedAlerts, setHasPendingUndispatchedAlerts] = useState(false);

  // --- AUTHENTICATION STATES ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [hasPermissionError, setHasPermissionError] = useState(false);

  // --- STUDENT MODE STATES ---
  const [studentNoInput, setStudentNoInput] = useState<string>(() => localStorage.getItem('remember_me') === 'true' ? localStorage.getItem('saved_student_no') || '' : '');
  const [activeStudentNumber, setActiveStudentNumber] = useState('');
  const [studentMood, setStudentMood] = useState<number>(5);
  const [studentComment, setStudentComment] = useState('');
  const [studentSuccessMessage, setStudentSuccessMessage] = useState(false);
  const [showStudentReport, setShowStudentReport] = useState(false);

  // --- TEACHER P.1-3 BATCH ENTRY STATES ---
  const [batchScores, setBatchScores] = useState<Record<string, { moodScore: number | string; id?: string }>>({});
  const [isP13Saved, setIsP13Saved] = useState(false);

  // --- TEACHER STANDARD DASHBOARD STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('全部日期');
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [actionText, setActionText] = useState('');
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [updateSummaryVisible, setUpdateSummaryVisible] = useState(false);
  const [guideModalVisible, setGuideModalVisible] = useState(false);

  const [activeTab, setActiveTab] = useState<'REPORTS' | 'ANALYTICS' | 'PASSWORDS' | 'LOGS' | 'ALL_COMMENTS' | 'PUSH_NOTIFICATIONS'>('REPORTS');
  const [detailStudentId, setDetailStudentId] = useState<string | null>(null);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [passwordsData, setPasswordsData] = useState<Record<string, string>>({});
  const [isSavingPass, setIsSavingPass] = useState(false);
  const [exportStartDate, setExportStartDate] = useState(formatDateObj(new Date()));
  const [exportEndDate, setExportEndDate] = useState(formatDateObj(new Date()));
  const [isExporting, setIsExporting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  // --- GMAIL REFRESH TOKEN STATES ---
  const [gmailCredentials, setGmailCredentials] = useState<{
    client_id: string;
    client_secret: string;
    refresh_token: string;
    authorized_email: string;
  } | null>(null);
  const [isGmailCredentialsLoading, setIsGmailCredentialsLoading] = useState(false);

  const [studentPasswordsData, setStudentPasswordsData] = useState<Record<string, Record<string, string>>>({});
  const [currentEditClass, setCurrentEditClass] = useState('4A');
  const [editingStudentPasswords, setEditingStudentPasswords] = useState<Record<string, string>>({});

  // Persist rememberMe settings
  useEffect(() => {
    if (rememberMe) {
      localStorage.setItem('remember_me', 'true');
      localStorage.setItem('saved_class', selectedClass);
      localStorage.setItem('saved_student_no', studentNoInput);
    } else {
      localStorage.removeItem('remember_me');
      localStorage.removeItem('saved_class');
      localStorage.removeItem('saved_student_no');
    }
  }, [rememberMe, selectedClass, studentNoInput]);

  // Sync edited class in administrative password grid
  useEffect(() => {
    if (studentPasswordsData[currentEditClass]) {
      const fullSet: Record<string, string> = {};
      for (let i = 1; i <= 30; i++) {
        const key = String(i);
        fullSet[key] = studentPasswordsData[currentEditClass][key] || '';
      }
      setEditingStudentPasswords(fullSet);
    } else {
      const empty: Record<string, string> = {};
      for (let i = 1; i <= 30; i++) {
        empty[String(i)] = '';
      }
      setEditingStudentPasswords(empty);
    }
  }, [currentEditClass, studentPasswordsData]);

  // Auth changed subscription
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        cachedUser = user;
        setCurrentUser(user);
      } else {
        cachedUser = null;
        cachedAccessToken = null;
        setCurrentUser(null);
      }
    });
    return () => unsub();
  }, []);

  // Restore session from localStorage
  useEffect(() => {
    const savedTeacher = localStorage.getItem('teacher_token_session');
    if (savedTeacher) {
      try {
        const { cls, view } = JSON.parse(savedTeacher);
        setSelectedClass(cls);
        setViewState(view);
      } catch (err) {}
    } else {
      const savedStudent = localStorage.getItem('student_token_session');
      if (savedStudent) {
        try {
          const { cls, view, studentNo } = JSON.parse(savedStudent);
          setSelectedClass(cls);
          setActiveStudentNumber(studentNo || '');
          setViewState(view);
        } catch (err) {}
      }
    }
  }, []);

  // Handle OAuth code popup callback (方案 C)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    if (code && state === 'gmail_auth') {
      if (window.opener) {
        // Send the code to the parent window and close ourself
        window.opener.postMessage({ type: 'GMAIL_AUTH_CODE', code }, window.location.origin);
        window.close();
      } else {
        console.log("Captured Gmail Auth Code:", code);
      }
    }
  }, []);

  // Listen for Gmail auth code from popup (方案 C)
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'GMAIL_AUTH_CODE') {
        const { code } = event.data;
        if (!code) return;

        setLoading(true);
        try {
          const docRef = doc(db, "gmail_credentials", "google_oauth");
          const snap = await getDoc(docRef);
          if (!snap.exists()) {
            alert("❌ 授權失敗：在進行 Google 授權之前，請先設定並保存您的 Client ID 與 Client Secret！");
            setLoading(false);
            return;
          }
          const { client_id, client_secret } = snap.data();
          if (!client_id || !client_secret) {
            alert("❌ 授權失敗：資料庫中缺少 Client ID 或 Client Secret，請重新確認！");
            setLoading(false);
            return;
          }

          console.log("Exchanging captured code for persistent refresh token...");
          const tokens = await exchangeAuthCodeForTokens(client_id, client_secret, code, window.location.origin);
          
          // Get user profile email
          let email = 'unknown_gmail_account';
          try {
            const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
              headers: { Authorization: `Bearer ${tokens.accessToken}` }
            });
            if (profileRes.ok) {
              const pData = await profileRes.json();
              email = pData.emailAddress || 'unknown_gmail_account';
            }
          } catch (profileErr) {
            console.warn("Failed to fetch Gmail profile email:", profileErr);
          }

          // Save the refresh token and authorized email to Firestore
          await setDoc(docRef, {
            refresh_token: tokens.refreshToken,
            authorized_email: email,
            authorized_at: new Date().toLocaleString()
          }, { merge: true });

          // Cache the initial accessToken in memory
          cachedAccessToken = tokens.accessToken;
          setTokenExpiryTime(Date.now() + (tokens.expiresIn - 100) * 1000);

          alert(`🎉 恭喜！背景 Gmail 永久發信授權成功！\n\n- 已綁定發信信箱：${email}\n- 系統此後將完全自動、永久在背景為您發送情緒預警信件，您無需再頻繁登入 Google。`);
        } catch (err: any) {
          console.error("Failed to exchange tokens:", err);
          alert("❌ 授權失敗：在向 Google 交換永久憑證時發生錯誤，請檢查您的 Client Secret 或 Authorized Redirect URI 是否配置正確。\n\n詳細錯誤：" + err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // --- SYNC FIREBASE REPORTS FOR DASHBOARDS ---
  useEffect(() => {
    if (viewState === 'STUDENT_DASHBOARD') {
      const key = `local_reports_${selectedClass}_${activeStudentNumber}`;
      try {
        const localData = localStorage.getItem(key);
        if (localData) {
          setReports(JSON.parse(localData));
        } else {
          setReports([]);
        }
      } catch (err) {
        console.error("Failed to load local reports:", err);
        setReports([]);
      }
      return;
    }

    if (viewState !== 'TEACHER_DASHBOARD' && viewState !== 'TEACHER_P1_3_BATCH') {
      setReports([]);
      return;
    }

    setLoading(true);
    let unsubClass: () => void = () => {};
    let unsubBanbie: () => void = () => {};
    let unsubGlobal: () => void = () => {};

    const oneYearAgoTime = parseDateString("2026/4/20");
    const tomorrowTime = new Date().getTime() + 86400000;

    if (selectedClass === 'GCCPS') {
      const qGlobal = query(collection(db, "mood_reports"));
      unsubGlobal = onSnapshot(qGlobal, (snapshot) => {
        const dList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((r: any) => parseInt(r.moodScore || r.心情指數 || 5) !== 0);

        const uniqueReports = new Map<string, any>();
        dList.forEach((r: any) => {
          const ds = getDisplayDate(r);
          if (ds === "INVALID_DATE" || ds.includes('0026/') || ds.includes('/0026')) return;

          const itemTime = getUnixTime(r);
          if (itemTime < oneYearAgoTime || itemTime > tomorrowTime) return;

          const sId = String(r.studentNumber || r.學號 || '').trim();
          const key = sId ? `${r.class || r.班別 || ''}_${sId}_${ds}` : r.id;

          if (!uniqueReports.has(key)) {
            uniqueReports.set(key, r);
          } else {
            const existing = uniqueReports.get(key);
            const existingComment = String(existing.comment || existing.有事情想向老師分享 || "").trim();
            const incomingComment = String(r.comment || r.有事情想向老師分享 || "").trim();

            if (!existingComment && incomingComment) {
              uniqueReports.set(key, r);
            } else if (existingComment && !incomingComment) {
              // keep existing
            } else {
              const existingScore = parseInt(existing.moodScore || existing.心情指數 || 5);
              const incomingScore = parseInt(r.moodScore || r.心情指數 || 5);
              if (incomingScore > existingScore) {
                uniqueReports.set(key, r);
              }
            }
          }
        });

        setReports(Array.from(uniqueReports.values()));
        setHasPermissionError(false);
        setLoading(false);
      }, (error) => {
        console.error("Firestore read error:", error);
        setHasPermissionError(true);
        setLoading(false);
      });
    } else {
      const qClass = query(collection(db, "mood_reports"), where("class", "==", selectedClass));
      const qBanbie = query(collection(db, "mood_reports"), where("班別", "==", selectedClass));
      let dataFromClass: any[] = [];
      let dataFromBanbie: any[] = [];

      const updateCombinedState = () => {
        const combined = [...dataFromClass, ...dataFromBanbie];
        const uniqueMap = new Map();

        combined.forEach(item => {
          const ds = getDisplayDate(item);
          if (ds === "INVALID_DATE" || ds.includes('0026/') || ds.includes('/0026')) return;

          const itemTime = getUnixTime(item);
          if (itemTime >= oneYearAgoTime && itemTime <= tomorrowTime) {
            uniqueMap.set(item.id, item);
          }
        });

        const list = Array.from(uniqueMap.values())
          .filter((r: any) => parseInt(r.moodScore || r.心情指數 || 5) !== 0);

        const uniqueDeduplicated = new Map<string, any>();
        list.forEach((r: any) => {
          const sId = String(r.studentNumber || r.學號 || '').trim();
          const ds = getDisplayDate(r);
          const key = sId ? `${sId}_${ds}` : r.id;

          if (!uniqueDeduplicated.has(key)) {
            uniqueDeduplicated.set(key, r);
          } else {
            const existing = uniqueDeduplicated.get(key);
            const existingComment = String(existing.comment || existing.有事情想向老師分享 || "").trim();
            const incomingComment = String(r.comment || r.有事情想向老師分享 || "").trim();

            if (!existingComment && incomingComment) {
              uniqueDeduplicated.set(key, r);
            } else if (existingComment && !incomingComment) {
              // keep existing
            } else {
              const existingScore = parseInt(existing.moodScore || existing.心情指數 || 5);
              const incomingScore = parseInt(r.moodScore || r.心情指數 || 5);
              if (incomingScore > existingScore) {
                uniqueDeduplicated.set(key, r);
              }
            }
          }
        });

        const sortedUnique = Array.from(uniqueDeduplicated.values());

        if (isP1_3(selectedClass)) {
          const todayStr = formatDateObj(new Date());
          const recordsForToday = sortedUnique.filter(r => getDisplayDate(r) === todayStr);
          const mapped: Record<string, { moodScore: number | string; id?: string }> = {};
          recordsForToday.forEach(r => {
            const sNum = parseInt(r.studentNumber || r.學號 || "0");
            if (sNum > 0) {
              const rawScore = r.moodScore || r.心情指數 || "5";
              mapped[String(sNum)] = {
                moodScore: rawScore === 'N/A' ? 'N/A' : (parseInt(rawScore) || 5),
                id: r.id
              };
            }
          });
          setBatchScores(mapped);
        }

        setReports(sortedUnique);
        setHasPermissionError(false);
        setLoading(false);
      };

      unsubClass = onSnapshot(qClass, (s) => {
        dataFromClass = s.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        updateCombinedState();
      }, (error) => {
        console.error("Firestore read error for class:", error);
        setHasPermissionError(true);
        setLoading(false);
      });

      unsubBanbie = onSnapshot(qBanbie, (s) => {
        dataFromBanbie = s.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        updateCombinedState();
      }, (error) => {
        console.error("Firestore read error for banbie:", error);
        setHasPermissionError(true);
        setLoading(false);
      });
    }

    return () => {
      unsubClass();
      unsubBanbie();
      unsubGlobal();
    };
  }, [viewState, selectedClass, currentUser]);

  // --- REAL-TIME ALERTS DISPATCH RELAY (BUG-01) ---
  useEffect(() => {
    if (viewState !== 'TEACHER_DASHBOARD' && viewState !== 'TEACHER_P1_3_BATCH') {
      setHasPendingUndispatchedAlerts(false);
      return;
    }

    const qAlerts = query(collection(db, "pending_alerts"), where("status", "==", "pending"));
    const unsub = onSnapshot(qAlerts, async (snapshot) => {
      if (snapshot.empty) {
        setHasPendingUndispatchedAlerts(false);
        return;
      }

      setHasPendingUndispatchedAlerts(true);

      // Deduplicate: Filter to documents not already being processed by this active session
      const unprocessedDocs = snapshot.docs.filter(doc => !processingAlertIds.has(doc.id));
      if (unprocessedDocs.length === 0) {
        console.log("Alert dispatcher relay: All pending alerts in snapshot are already being processed.");
        return;
      }

      // Lock immediate processing to prevent feedback loops during token refresh/re-renders
      for (const alertDoc of unprocessedDocs) {
        processingAlertIds.add(alertDoc.id);
        console.log(`Alert dispatcher relay: Locked alert ${alertDoc.id} for processing.`);
      }

      // Get or refresh access token
      let activeToken = cachedAccessToken;
      const isExpired = tokenExpiryTime ? Date.now() >= tokenExpiryTime : true;

      if (!activeToken || isExpired) {
        // Check if we can refresh using persistent refresh token
        if (gmailCredentials && gmailCredentials.client_id && gmailCredentials.client_secret && gmailCredentials.refresh_token) {
          console.log("Alert dispatcher relay: Access token expired or missing. Attempting silent refresh...");
          try {
            const refreshRes = await refreshGmailAccessToken(
              gmailCredentials.client_id,
              gmailCredentials.client_secret,
              gmailCredentials.refresh_token
            );
            cachedAccessToken = refreshRes.accessToken;
            const newExpiry = Date.now() + (refreshRes.expiresIn - 100) * 1000;
            setTokenExpiryTime(newExpiry);
            activeToken = refreshRes.accessToken;
            console.log("Alert dispatcher relay: Silent refresh successful. New token expires at: " + new Date(newExpiry).toLocaleTimeString());
          } catch (refreshErr: any) {
            console.error("Alert dispatcher relay: Silent refresh failed:", refreshErr);
            // We set activeToken to null but keep going so FCM push notifications can still be sent!
            activeToken = null;
          }
        } else {
          console.log("Alert dispatcher relay: No valid Gmail credentials found. Gmail dispatch will be skipped, but FCM push notification will proceed.");
          activeToken = null;
        }
      }

      // Process pending alerts
      for (const alertDoc of unprocessedDocs) {
        const data = alertDoc.data();
        const docId = alertDoc.id;

        try {
          // Attempt to dispatch via Gmail API (only if activeToken is valid)
          if (activeToken) {
            console.log(`Relaying pending email alert ${docId} via Teacher Gmail API...`);
            try {
              await sendGmail(activeToken, data.to, data.subject, data.body);
              console.log(`Email alert ${docId} dispatched successfully via Gmail.`);
            } catch (gmailErr: any) {
              console.error(`Gmail dispatch failed for alert ${docId}:`, gmailErr);
              // Do not abort, proceed to FCM push notifications!
            }
          } else {
            console.log(`Gmail API token not available. Skipping email dispatch for alert ${docId}.`);
          }

          // Relay Push Notifications via FCM Web Push API
          try {
            const pushConfigSnap = await getDoc(doc(db, "system_settings", "push_notifications"));
            if (pushConfigSnap.exists()) {
              const pushData = pushConfigSnap.data();
              const serverKey = pushData.fcm_server_key || "BOAMWObDC_aDjW8OmSLiWB_2Y1E_bsSKYEmzLxd9AjPIh2RYOlTG49Vtd7Ocu1G3X4ti1QmzwHVJDbaLKvzFmp0";
              if (serverKey) {
                // Fetch only subscription tokens matching this class or school-wide admins
                const studentClass = data.class; // Class of student triggering the alert
                const subSnap = await getDocs(collection(db, "fcm_subscriptions"));
                const tokens = Array.from(new Set(
                  subSnap.docs
                    .filter(d => {
                      const subData = d.data();
                      const subClass = subData.class || '';
                      return subClass === 'GCCPS' || subClass === '' || subClass === studentClass;
                    })
                    .map(d => d.data().token)
                    .filter(Boolean)
                ));
                
                if (tokens.length > 0) {
                  console.log(`Relaying push alert to ${tokens.length} subscribed devices...`);
                  const pushRes = await fetch('/api/sendPush', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${serverKey}`
                    },
                    body: JSON.stringify({
                      registration_ids: tokens,
                      notification: {
                        title: data.subject || '學生情緒預警',
                        body: data.reason || '學生觸發了高危情緒指標。',
                        icon: '/icon.svg',
                        click_action: window.location.origin
                      }
                    })
                  });
                  if (!pushRes.ok) {
                    console.error("FCM dispatch response not OK:", await pushRes.text());
                  } else {
                    console.log("FCM push alerts dispatched successfully.");
                  }
                }
              }
            }
          } catch (pushErr) {
            console.error("Error during background push alert dispatch:", pushErr);
          }
          
          // Mark as successfully sent in Firestore
          await updateDoc(doc(db, "pending_alerts", docId), {
            status: 'sent',
            sentAt: serverTimestamp()
          });
          console.log(`Email alert ${docId} dispatched and marked as sent.`);
          // Note: We intentionally do NOT delete the docId from processingAlertIds on success.
          // This keeps it locked for the lifetime of this component session, so even if Firestore
          // lags and sends another 'pending' snapshot, it will never trigger a second send.
        } catch (dispatchErr: any) {
          console.error(`Failed to dispatch alert ${docId}:`, dispatchErr);
          try {
            // Mark as failed so we don't spin in an infinite loop
            await updateDoc(doc(db, "pending_alerts", docId), {
              status: 'failed',
              error: dispatchErr.message || String(dispatchErr)
            });
          } catch (dbErr: any) {
            console.error(`Failed to update Firestore status to 'failed' for alert ${docId}:`, dbErr);
            // Release lock if even status update failed, allowing subsequent retries
            processingAlertIds.delete(docId);
          }
        }
      }
    }, (error) => {
      console.error("Firestore pending_alerts subscription error:", error);
    });

    return () => unsub();
  }, [viewState, tokenExpiryTime, currentUser, gmailCredentials]);

  // Load / listen to Gmail credentials
  useEffect(() => {
    if (viewState !== 'TEACHER_DASHBOARD' && viewState !== 'TEACHER_P1_3_BATCH') {
      setGmailCredentials(null);
      return;
    }

    const unsub = onSnapshot(doc(db, "gmail_credentials", "google_oauth"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setGmailCredentials({
          client_id: data.client_id || '',
          client_secret: data.client_secret || '',
          refresh_token: data.refresh_token || '',
          authorized_email: data.authorized_email || ''
        });
      } else {
        setGmailCredentials(null);
      }
    }, (err) => {
      console.error("Failed to load/listen to gmail credentials:", err);
    });

    return () => unsub();
  }, [viewState]);

  // Load alert settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "system_settings", "global_alerts");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAlertEmails(docSnap.data().emails || '');
        }
      } catch (err) {
        console.error("Failed to load alert settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveAlertSettings = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "system_settings", "global_alerts");
      await setDoc(docRef, { emails: alertEmails }, { merge: true });
      alert("自動警報收件名單已成功更新！");
    } catch (err) {
      alert("更新設定失敗。");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOAuthCredentials = async (clientId: string, clientSecret: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, "gmail_credentials", "google_oauth");
      await setDoc(docRef, {
        client_id: clientId.trim(),
        client_secret: clientSecret.trim()
      }, { merge: true });
      alert("Google OAuth API 金鑰設定已成功儲存！");
    } catch (err: any) {
      alert("儲存設定失敗：" + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectGmail = async () => {
    if (!window.confirm("確定要中斷並撤銷背景 Gmail 永久自動發信授權嗎？\n\n系統將停止自動發送情緒警告信件。")) return;
    setLoading(true);
    try {
      const docRef = doc(db, "gmail_credentials", "google_oauth");
      await setDoc(docRef, {
        refresh_token: "",
        authorized_email: "",
        authorized_at: ""
      }, { merge: true });
      cachedAccessToken = null;
      setTokenExpiryTime(null);
      alert("已成功斷開 Gmail 聯結並清除授權！");
    } catch (err: any) {
      alert("斷開聯結失敗：" + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartGoogleOAuth = () => {
    if (!gmailCredentials || !gmailCredentials.client_id) {
      alert("請先儲存 Google OAuth Client ID！");
      return;
    }
    const url = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
      client_id: gmailCredentials.client_id,
      redirect_uri: window.location.origin,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/gmail.send',
      access_type: 'offline',
      prompt: 'consent',
      state: 'gmail_auth'
    }).toString();
    
    const width = 600;
    const height = 650;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(url, 'Google OAuth', `width=${width},height=${height},left=${left},top=${top}`);
  };

  // Load passwords data for Passwords tab
  useEffect(() => {
    if (viewState === 'TEACHER_DASHBOARD' && activeTab === 'PASSWORDS') {
      const fetchPasses = async () => {
        setLoading(true);
        try {
          const snap = await getDocs(collection(db, "class_passwords"));
          const map: Record<string, string> = {};
          const studentMap: Record<string, Record<string, string>> = {};
          ALL_CLASSES.forEach(c => {
            map[c] = getDefaultPass(c);
            studentMap[c] = {};
          });
          snap.forEach(doc => {
            if (map[doc.id] !== undefined) {
              const data = doc.data();
              map[doc.id] = data.password || getDefaultPass(doc.id);
              if (data.student_passwords) {
                studentMap[doc.id] = data.student_passwords;
              }
            }
          });
          setPasswordsData(map);
          setStudentPasswordsData(studentMap);
        } catch (e) {
          console.error(e);
        }
        setLoading(false);
      };
      fetchPasses();
    }
  }, [viewState, activeTab, currentUser]);

  const handleSavePasswords = async () => {
    setIsSavingPass(true);
    try {
      const batch = writeBatch(db);
      for (const cls of Object.keys(passwordsData)) {
        const val = passwordsData[cls];
        const docRef = doc(db, "class_passwords", cls);
        
        if (val.startsWith('sha256:')) {
          // Unchanged hash, preserve as is
          batch.set(docRef, { password: val }, { merge: true });
        } else if (!val || val.trim() === '') {
          // Reset to default hashed pass
          const defaultPass = getDefaultPass(cls);
          const hashed = await sha256(defaultPass);
          batch.set(docRef, { password: `sha256:${hashed}` }, { merge: true });
        } else {
          // Hash new password
          const hashed = await sha256(val.trim());
          batch.set(docRef, { password: `sha256:${hashed}` }, { merge: true });
        }
      }
      await batch.commit();
      alert("密碼庫更新成功！所有班級密碼已生效，個別學生密碼已被安全保留。");
    } catch (err: any) {
      alert("密碼儲存失敗: " + err.message);
    }
    setIsSavingPass(false);
  };

  const handleSaveStudentPasswords = async () => {
    if (!currentEditClass) {
      alert("請先選擇要儲存個別密碼的班級。");
      return;
    }
    setIsSavingPass(true);
    try {
      const updatedPasswords: Record<string, string> = {};
      for (const sNo of Object.keys(editingStudentPasswords)) {
        const val = editingStudentPasswords[sNo];
        if (val.startsWith('sha256:')) {
          updatedPasswords[sNo] = val;
        } else if (val.trim() === '') {
          updatedPasswords[sNo] = '';
        } else {
          const hashed = await sha256(val.trim());
          updatedPasswords[sNo] = `sha256:${hashed}`;
        }
      }

      const docRef = doc(db, "class_passwords", currentEditClass);
      await setDoc(docRef, { student_passwords: updatedPasswords }, { merge: true });
      setStudentPasswordsData(prev => ({
        ...prev,
        [currentEditClass]: { ...updatedPasswords }
      }));
      alert(`🎉 班級 ${currentEditClass} 學生個別密碼單獨存檔完成！Excel 試算表設定已生效。`);
    } catch (err: any) {
      alert("儲存個別密碼失敗: " + err.message);
    }
    setIsSavingPass(false);
  };

  // Load audit history logs
  useEffect(() => {
    if (viewState === 'TEACHER_DASHBOARD' && activeTab === 'LOGS') {
      const getHistory = async () => {
        setLoading(true);
        try {
          const qHistory = query(collection(db, "login_history"), orderBy("timestamp", "desc"), limit(55));
          const snap = await getDocs(qHistory);
          const logs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setLoginHistory(logs);
        } catch (err) {
          console.error("Could not fetch login logs", err);
        }
        setLoading(false);
      };
      getHistory();
    }
  }, [viewState, activeTab, currentUser]);

  // Auth handlers
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;
      const isWhitelisted = email && (
        email === "hony@mail.gccps.edu.hk" ||
        email.endsWith("@mail.gccps.edu.hk") ||
        email.endsWith("@gccps.edu.hk")
      );
      if (!isWhitelisted) {
        await signOut(auth);
        alert(`🔴 授權失敗：您的帳戶 (${email || '無電子郵件'}) 未獲得管理權限。\n請使用學校專用的教師 Google 帳戶（如 hony@mail.gccps.edu.hk）登入。`);
        setIsLoggingIn(false);
        return;
      }

      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
        setTokenExpiryTime(Date.now() + 3500 * 1000); // 58 minutes in milliseconds
      }
      setCurrentUser(result.user);
      cachedUser = result.user;
    } catch (err: any) {
      console.error('Login failed:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        alert('登入視窗已關閉。若您在預覽畫面中無法登入，請點擊右上角在新分頁開啟應用程式後重試。');
      } else if (err?.code === 'auth/unauthorized-domain') {
        alert('🔴 授權登入失敗：當前網域未獲 Firebase 授權！\n\n【排查與解決步驟】\n1. 請登入 Firebase Console（https://console.firebase.google.com）並選擇您的專案。\n2. 前往左側選單的「Build」->「Authentication」->「Settings」標籤。\n3. 在「Authorized domains」（授權網域）清單中，點擊「Add domain」。\n4. 新增您目前使用的網域（例如您的部署網址，或在本地開發測試時使用 localhost）。\n5. 新增完成後，請重新整理網頁並再次嘗試登入。');
      } else {
        alert('授權登入失敗，請重試: ' + err.message);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await signOut(auth);
    cachedAccessToken = null;
    cachedUser = null;
    setCurrentUser(null);
    setTokenExpiryTime(null);
  };

  const handleTeacherLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedClass) {
      alert("請選擇班級或管理權限。");
      return;
    }
    setLoading(true);
    try {
      const docRef = doc(db, "class_passwords", selectedClass);
      const docSnap = await getDoc(docRef);
      const data = docSnap.exists() ? docSnap.data() : null;
      const correctPass = (data && typeof data.password === 'string' && data.password.trim() !== '') ? data.password : getDefaultPass(selectedClass);

      let isTeacherVerified = false;
      const inputPass = loginPassword.trim();

      if (correctPass.startsWith('sha256:')) {
        const inputHash = await sha256(inputPass);
        if (`sha256:${inputHash}` === correctPass.trim()) {
          isTeacherVerified = true;
        }
      } else {
        if (inputPass === correctPass.trim()) {
          isTeacherVerified = true;
        }
      }

      if (!isTeacherVerified) {
        setLoading(false);
        alert("密碼不正確，請重試。");
        return;
      }

      // Try silent anonymous authentication to satisfy request.auth != null Firestore rule
      try {
        await signInAnonymously(auth);
      } catch (authErr) {
        console.warn("Silent anonymous authentication failed (it might be disabled in Firebase Console):", authErr);
      }

      try {
        await addDoc(collection(db, "login_history"), {
          class: selectedClass,
          timestamp: serverTimestamp(),
          device: "Web Browser Agent"
        });
      } catch (logErr) {}

      setLoginPassword('');
      setViewState('TEACHER_DASHBOARD');
      if (rememberMe) {
        localStorage.setItem('teacher_token_session', JSON.stringify({ cls: selectedClass, view: 'TEACHER_DASHBOARD' }));
      } else {
        localStorage.removeItem('teacher_token_session');
      }
    } catch (err: any) {
      console.error("Teacher Login Error:", err);
      try {
        handleFirestoreError(err, OperationType.GET, `class_passwords/${selectedClass}`);
      } catch (logErr) {}
      alert("安全驗證失敗，請檢查網路連線。(" + err.message + ")");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedClass) {
      alert("請選擇班級！");
      return;
    }
    const isJunior = isP1_3(selectedClass);
    if (!isJunior && !studentNoInput.trim()) {
      alert("請輸入學生座號！");
      return;
    }
    setLoading(true);
    try {
      const sNo = studentNoInput.trim();

      if (isJunior && !sNo) {
        // Direct entry to P1-3 Teacher Batch Grader
        if (!auth.currentUser) {
          try {
            await signInAnonymously(auth);
          } catch (anonErr) {
            console.warn("Anonymous auth notice:", anonErr);
          }
        }
        setActiveStudentNumber('');
        setViewState('TEACHER_P1_3_BATCH');

        if (rememberMe) {
          localStorage.setItem('student_token_session', JSON.stringify({ 
            cls: selectedClass, 
            view: 'TEACHER_P1_3_BATCH', 
            studentNo: '',
            email: auth.currentUser?.email || ''
          }));
        } else {
          localStorage.removeItem('student_token_session');
        }
      } else {
        // Individual Student Mood Logging
        setActiveStudentNumber(sNo);
        setViewState('STUDENT_DASHBOARD');

        if (rememberMe) {
          localStorage.setItem('student_token_session', JSON.stringify({ 
            cls: selectedClass, 
            view: 'STUDENT_DASHBOARD', 
            studentNo: sNo,
            email: auth.currentUser?.email || ''
          }));
        } else {
          localStorage.removeItem('student_token_session');
        }
      }

      // Record audit history
      try {
        await addDoc(collection(db, "login_history"), {
          class: selectedClass,
          studentNumber: sNo || 'BATCH',
          email: auth.currentUser?.email || (isJunior ? 'teacher_p1_3_batch' : 'google_authenticated_student'),
          displayName: auth.currentUser?.displayName || '',
          timestamp: serverTimestamp(),
          device: isJunior && !sNo ? "Teacher P.1-3 Batch Grader" : "Student Portal"
        });
      } catch (logErr) {}

      setLoginPassword('');
    } catch (err: any) {
      console.error("Student Login Error:", err);
      alert("登入失敗，請重新嘗試。(" + err.message + ")");
    } finally {
      setLoading(false);
    }
  };

  const handleClearTestData = async () => {
    if (!confirm("確定要清除所有 'TEST' 班級的數據嗎？此操作不可逆，將會刪除所有 'TEST' 班的登記記錄及留言。")) return;
    setLoading(true);
    try {
      const qTEST_class = query(collection(db, "mood_reports"), where("class", "==", "TEST"));
      const qTEST_banbie = query(collection(db, "mood_reports"), where("班別", "==", "TEST"));

      const [snapshotClass, snapshotBanbie] = await Promise.all([getDocs(qTEST_class), getDocs(qTEST_banbie)]);

      // Deduplicate documents by ID to prevent parallel double-deletion errors and report an accurate count
      const uniqueDocs = new Map<string, any>();
      snapshotClass.docs.forEach(doc => uniqueDocs.set(doc.id, doc));
      snapshotBanbie.docs.forEach(doc => uniqueDocs.set(doc.id, doc));

      const deleteTasks = Array.from(uniqueDocs.values()).map(doc => deleteDoc(doc.ref));

      await Promise.all(deleteTasks);
      alert(`已成功清除 ${uniqueDocs.size} 筆數據。`);
    } catch (e: any) {
      alert("清除失敗: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentReportSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let clientIp = 'Unknown';
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipRes.json();
      clientIp = ipData.ip || 'Unknown';
    } catch (ipErr) {
      console.warn("Could not fetch IP address");
    }

    try {
      const todayStr = formatDateObj(new Date());
      const docId = `${selectedClass}_${activeStudentNumber}_${todayStr.replace(/\//g, '_')}`;
      const docRef = doc(db, "mood_reports", docId);

      const studentEmail = auth.currentUser?.email || '';
      const studentName = auth.currentUser?.displayName || '';
      const googleUid = auth.currentUser?.uid || '';

      // Write to Firestore securely using setDoc with merge: true (bypassing collection queries)
      await setDoc(docRef, {
        '日期': todayStr,
        class: selectedClass,
        '班別': selectedClass,
        studentNumber: activeStudentNumber,
        '學號': activeStudentNumber,
        moodScore: String(studentMood),
        '心情指數': String(studentMood),
        comment: studentComment.trim(),
        '有事情想向老師分享': studentComment.trim(),
        email: studentEmail,
        studentEmail: studentEmail,
        '學生電郵': studentEmail,
        studentName: studentName,
        '學生姓名': studentName,
        googleUid: googleUid,
        timestamp: serverTimestamp(),
        ipAddress: clientIp,
        status: getWarningLevel(studentComment) !== 'none' ? "Pending" : "Resolved"
      }, { merge: true });

      // Save to localStorage for Student Dashboard Report Card
      const localKey = `local_reports_${selectedClass}_${activeStudentNumber}`;
      let localList: any[] = [];
      try {
        const existingLocal = localStorage.getItem(localKey);
        localList = existingLocal ? JSON.parse(existingLocal) : [];
        if (!Array.isArray(localList)) localList = [];
        
        // Filter out today's existing entry if any to simulate day-upsert
        localList = localList.filter((r: any) => getDisplayDate(r) !== todayStr);
        
        // Append new report
        localList.push({
          '日期': todayStr,
          class: selectedClass,
          '班別': selectedClass,
          studentNumber: activeStudentNumber,
          '學號': activeStudentNumber,
          moodScore: String(studentMood),
          '心情指數': String(studentMood),
          comment: studentComment.trim(),
          '有事情想向老師分享': studentComment.trim(),
          studentEmail: studentEmail,
          email: studentEmail,
          studentName: studentName,
          timestamp: { seconds: Math.floor(Date.now() / 1000) }
        });
        
        localStorage.setItem(localKey, JSON.stringify(localList));
        setReports(localList); // Update local state so ReportCard renders immediately
      } catch (localErr) {
        console.error("Local storage caching failed:", localErr);
      }

      const warningLvl = getWarningLevel(studentComment);
      const isLowScore = studentMood <= 3;

      if (warningLvl === 'red' || isLowScore) {
        // Sort local history logs to evaluate sequential trends
        const sortedLocalList = [...localList].sort((a, b) => getUnixTime(b) - getUnixTime(a));
        const pastRecords = sortedLocalList.filter(d => getDisplayDate(d) !== todayStr);

        let shouldAlert = false;
        let alertReason = "";

        if (warningLvl === 'red') {
          shouldAlert = true;
          alertReason = "學生提交了高危險層級的內容 (嚴重安全隱患)。";
        } else if (isLowScore) {
          if (pastRecords.length >= 2) {
            const prev1 = pastRecords[0];
            const prev2 = pastRecords[1];
            const prev1Score = parseInt(prev1.moodScore || prev1.心情指數 || "5");
            const prev2Score = parseInt(prev2.moodScore || prev2.心情指數 || "5");

            if (prev1Score <= 3 && prev2Score <= 3) {
              shouldAlert = true;
              alertReason = `學生連續三天情緒指數低落 (先前指數: ${prev2Score}, ${prev1Score}, 這次指數: ${studentMood})。`;
            }
          }
        }

        if (shouldAlert) {
          const subject = `[自動警報] 學生情緒警示 - ${selectedClass}班 ${activeStudentNumber}號`;
          const body = `系統偵測到異常情況：\n\n原因: ${alertReason}\n學生電郵: ${studentEmail || '未綁定'}\n學生姓名: ${studentName || '未填寫'}\n學生留言: ${studentComment.trim()}\n當前情緒指數: ${studentMood}\n\n請盡速跟進處理。`;
          console.log("QUEUED EMAIL ALERT IN FIRESTORE:", { to: alertEmails, subject, body });
          try {
            await addDoc(collection(db, "pending_alerts"), {
              class: selectedClass,
              studentNumber: activeStudentNumber,
              studentEmail: studentEmail,
              studentName: studentName,
              reason: alertReason,
              comment: studentComment.trim(),
              moodScore: studentMood,
              timestamp: serverTimestamp(),
              to: alertEmails,
              subject,
              body,
              status: 'pending',
              sentAt: null
            });
            console.log("Alert queued in Firestore successfully!");
          } catch (dbErr) {
            console.error("Failed to queue alert in Firestore:", dbErr);
          }
        }
      }

      setStudentSuccessMessage(true);
      setStudentComment('');
    } catch (err) {
      console.error("Submission error:", err);
      alert("上傳記錄時發生系統異常。異常資訊已列入記錄。");
    } finally {
      setLoading(false);
    }
  };

  const handleP13CellGradeChange = (studentNo: string, grade: number | string) => {
    setBatchScores(prev => ({
      ...prev,
      [studentNo]: {
        ...prev[studentNo],
        moodScore: grade
      }
    }));
    setIsP13Saved(false);
  };

  const handleP13BatchSubmit = async () => {
    setLoading(true);
    setIsP13Saved(false);
    const todayStr = formatDateObj(new Date());

    try {
      const writeTasks = Object.keys(batchScores).map(async (studentNo) => {
        const item = batchScores[studentNo];
        if (!item.moodScore) return;

        if (item.id) {
          await updateDoc(doc(db, "mood_reports", item.id), {
            moodScore: String(item.moodScore),
            '心情指數': String(item.moodScore),
            timestamp: serverTimestamp()
          });
        } else {
          const addedRef = await addDoc(collection(db, "mood_reports"), {
            '日期': todayStr,
            class: selectedClass,
            '班別': selectedClass,
            studentNumber: String(studentNo),
            '學號': String(studentNo),
            moodScore: String(item.moodScore),
            '心情指數': String(item.moodScore),
            comment: "",
            '有事情想向老師分享': "",
            timestamp: serverTimestamp(),
            status: "Resolved"
          });
          setBatchScores(prev => ({
            ...prev,
            [studentNo]: {
              ...prev[studentNo],
              id: addedRef.id
            }
          }));
        }

        const scoreNum = typeof item.moodScore === "string" ? parseInt(item.moodScore) : item.moodScore;
        if (!isNaN(scoreNum) && scoreNum <= 3) {
          const pastHistory = reports.filter(
            (r: any) =>
              (r.class || r.班別) === selectedClass &&
              String(r.studentNumber || r.學號) === String(studentNo) &&
              getDisplayDate(r) !== todayStr
          ).sort((a, b) => getUnixTime(b) - getUnixTime(a));

          let alertSub = "";
          let alertBod = "";

          if (pastHistory.length >= 2) {
            const prev1 = pastHistory[0];
            const prev2 = pastHistory[1];
            const prev1Score = parseInt(prev1.moodScore || prev1.心情指數 || "5");
            const prev2Score = parseInt(prev2.moodScore || prev2.心情指數 || "5");

            if (prev1Score <= 3 && prev2Score <= 3) {
              alertSub = `[自動警報] 學生情緒警示 (3天) - ${selectedClass}班 ${studentNo}號`;
              alertBod = `系統偵測到異常情況：\n\n原因: 學生連續三天情緒指數低落 (先前: ${prev2Score}, ${prev1Score}, 這次: ${scoreNum})\n\n請盡速跟進處理。`;
            }
          }

          if (alertSub && alertBod) {
            console.log("QUEUED EMAIL ALERT (P1-3 BATCH) IN FIRESTORE:", { to: alertEmails, subject: alertSub, body: alertBod });
            try {
              await addDoc(collection(db, "pending_alerts"), {
                class: selectedClass,
                studentNumber: String(studentNo),
                reason: alertBod,
                comment: "",
                moodScore: scoreNum,
                timestamp: serverTimestamp(),
                to: alertEmails,
                subject: alertSub,
                body: alertBod,
                status: 'pending',
                sentAt: null
              });
              console.log("Batch Alert queued in Firestore successfully!");
            } catch (dbErr) {
              console.error("Failed to queue batch alert in Firestore:", dbErr);
            }
          }
        }
      });

      await Promise.all(writeTasks);
      setIsP13Saved(true);
    } catch (e: any) {
      alert("儲存批次成績時出錯: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherActionSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!actionText.trim()) return alert("請輸入跟進處理詳情！");
    if (!activeReportId) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, "mood_reports", activeReportId), {
        status: "Resolved",
        actionTaken: actionText.trim(),
        resolvedAt: new Date().toLocaleString(),
        resolvedBy: selectedClass || "管理員教師"
      });
      setActionModalVisible(false);
      setActionText('');
    } catch (err: any) {
      alert("更新失敗: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim() !== '');
      if (lines.length === 0) {
        alert("匯入失敗：檔案內容為空。");
        setLoading(false);
        return;
      }

      const startIndex = (lines[0].toLowerCase().includes('日期') || lines[0].toLowerCase().includes('date') || lines[0].toLowerCase().includes('班')) ? 1 : 0;
      const validLines = lines.slice(startIndex).filter(line => {
        const row = line.split(',');
        return row[1]?.trim() && row[2]?.trim();
      });

      if (validLines.length === 0) {
        alert("格式錯誤，找不到有效的學生數據欄位。");
        setLoading(false);
        return;
      }

      setUploadProgress({ current: 0, total: validLines.length });
      let batch = writeBatch(db);
      let importCount = 0;
      let batchCount = 0;

      try {
        const now = Date.now();
        const oneYearAgo = parseDateString("2026/4/20");
        const tomorrow = now + 86400000;
        const existingRecords = new Set(reports.map(r => `${getDisplayDate(r)}_${(r.class || r.班別 || "").toUpperCase()}_${String(r.studentNumber || r.學號 || "0")}`));

        let ignoredDatesCount = 0;
        let duplicatesCount = 0;

        for (let i = 0; i < validLines.length; i++) {
          const rawLine = validLines[i];
          const tokens: string[] = [];
          let currentStr = '';
          let inQuotes = false;
          for (let c of rawLine) {
            if (c === '"') {
              inQuotes = !inQuotes;
            } else if (c === ',' && !inQuotes) {
              tokens.push(currentStr);
              currentStr = '';
            } else {
              currentStr += c;
            }
          }
          tokens.push(currentStr);

          const dateVal = tokens[0]?.trim() || formatDateObj(new Date());
          const targetClass = (tokens[1]?.trim() || "").toUpperCase();
          const studentNo = tokens[2]?.trim() || "1";
          const moodVal = tokens[3]?.trim() || "5";
          const commentVal = tokens.slice(4).join(',').trim().replace(/^"|"$/g, '');

          const normalizedDate = getDisplayDate({ 日期: dateVal });
          const timestamp = parseDateString(normalizedDate);
          if (timestamp === 0 || timestamp > tomorrow || timestamp < oneYearAgo) {
            ignoredDatesCount++;
            if (i % 5 === 0 || i === validLines.length - 1) {
              setUploadProgress({ current: i + 1, total: validLines.length });
              await new Promise(resolve => setTimeout(resolve, 8));
            }
            continue;
          }

          const key = `${normalizedDate}_${targetClass}_${studentNo}`;
          if (existingRecords.has(key)) {
            duplicatesCount++;
            if (i % 5 === 0 || i === validLines.length - 1) {
              setUploadProgress({ current: i + 1, total: validLines.length });
              await new Promise(resolve => setTimeout(resolve, 8));
            }
            continue;
          }
          existingRecords.add(key);

          const docRef = doc(collection(db, "mood_reports"));
          batch.set(docRef, {
            '日期': normalizedDate,
            class: targetClass,
            '班別': targetClass,
            studentNumber: studentNo,
            '學號': studentNo,
            moodScore: moodVal,
            '心情指數': moodVal,
            comment: commentVal,
            '有事情想向老師分享': commentVal,
            timestamp: serverTimestamp(),
            status: "Pending"
          });

          importCount++;
          batchCount++;

          if (batchCount > 0 && (batchCount === 450 || i === validLines.length - 1)) {
            await batch.commit();
            batch = writeBatch(db);
            batchCount = 0;
          }

          if (i % 5 === 0 || i === validLines.length - 1) {
            setUploadProgress({ current: i + 1, total: validLines.length });
            await new Promise(resolve => setTimeout(resolve, 8));
          }
        }
        if (batchCount > 0) {
          await batch.commit();
        }
        alert(`🎉 批次極速匯入成功！\n\n- 成功匯入：${importCount} 筆學生心情\n- 略過過時或無效日期：${ignoredDatesCount} 筆\n- 略過重複數據：${duplicatesCount} 筆\n\n(附註：系統目前僅接收 ${formatDateObj(new Date(oneYearAgo))} 至明天的實時心情記錄。若有疑慮，可以檢查登入身份及 CSV 的日期欄位格式是否為 YYYY/M/D 或 DD/M/YYYY。)`);
      } catch (err: any) {
        console.error("CSV Import Error:", err);
        alert("批次寫入資料庫時發生錯誤：" + err.message + "\n請確認格式相容性。");
      } finally {
        setUploadProgress(prev => ({ ...prev, current: prev.total }));
        await new Promise(resolve => setTimeout(resolve, 800));
        setLoading(false);
        setUploadProgress({ current: 0, total: 0 });
      }
    };
    reader.readAsText(file);
  };

  const handleCSVExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        const startSecs = new Date(exportStartDate).getTime();
        const endSecs = new Date(exportEndDate).getTime() + 86400000;

        if (startSecs > endSecs) {
          alert("日期錯誤：開始日期不能晚於結束日期。");
          setIsExporting(false);
          return;
        }

        const filteredForExport = reports.filter(r => {
          const ds = getDisplayDate(r);
          const mills = parseDateString(ds);
          if (mills === 0) return false;
          return mills >= startSecs && mills <= endSecs;
        });

        if (filteredForExport.length === 0) {
          alert("此日期區間內在資料庫中無任何心情報告數據。");
          setIsExporting(false);
          return;
        }

        filteredForExport.sort((a, b) => {
          const t1 = getUnixTime(a);
          const t2 = getUnixTime(b);
          if (t1 !== t2) return t1 - t2;

          const classA = a.class || a.班別 || '';
          const classB = b.class || b.班別 || '';
          if (classA !== classB) return classA.localeCompare(classB);

          const numA = parseInt(a.studentNumber || a.學號 || '0');
          const numB = parseInt(b.studentNumber || b.學號 || '0');
          return numA - numB;
        });

        let csvString = '\uFEFF';
        csvString += "日期,班別,學號,心情分數,留言分享,處理狀態,跟進措施\n";

        filteredForExport.forEach(item => {
          const date = getDisplayDate(item);
          const cls = item.class || item.班別 || "未知";
          const sNo = item.studentNumber || item.學號 || "1";
          const score = item.moodScore || item.心情指數 || "5";
          const commStr = `"${(item.comment || item.有事情想向老師分享 || "").replace(/"/g, '""')}"`;
          const status = item.status === "Resolved" ? "已跟進" : "未處理";
          const actStr = `"${(item.actionTaken || "").replace(/"/g, '""')}"`;

          csvString += `${date},${cls},${sNo},${score},${commStr},${status},${actStr}\n`;
        });

        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `MoodReport_${exportStartDate}_to_${exportEndDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err: any) {
        alert("資料匯出遭遇未預期問題：" + err.message);
      } finally {
        setIsExporting(false);
      }
    }, 150);
  };

  const handleLogout = () => {
    localStorage.removeItem('teacher_token_session');
    localStorage.removeItem('student_token_session');
    setSelectedClass('');
    setLoginPassword('');
    setActiveStudentNumber('');
    setStudentNoInput('');
    setReports([]);
    setShowStudentReport(false);
    signOut(auth).catch((e) => console.warn("Sign out error:", e));
    setViewState('LANDING');
  };

  // --- ANALYTICS DATA BUILDER ---
  const analyticsData = useMemo(() => {
    if (!reports.length) return null;

    const rawDates = reports.map((r: any) => getDisplayDate(r));
    const allDates = Array.from(new Set(rawDates)).sort((a: string, b: string) => parseDateString(b) - parseDateString(a));
    const recent7Dates = allDates.slice(0, 7).reverse();

    const scoreFreq: Record<number, number> = {};
    for (let i = 1; i <= 10; i++) scoreFreq[i] = 0;

    const classStats: Record<string, { total: number; count: number }> = {};
    const dateStats: Record<string, { total: number; count: number }> = {};

    reports.forEach((r: any) => {
      const score = parseInt(r.moodScore || r.心情指數);
      if (isNaN(score) || score === 0) return;

      scoreFreq[score] = (scoreFreq[score] || 0) + 1;

      const cls = r.class || r.班別 || "未知";
      if (!classStats[cls]) classStats[cls] = { total: 0, count: 0 };
      classStats[cls].total += score;
      classStats[cls].count += 1;

      const dateStr = getDisplayDate(r);
      if (recent7Dates.includes(dateStr)) {
        if (!dateStats[dateStr]) dateStats[dateStr] = { total: 0, count: 0 };
        dateStats[dateStr].total += score;
        dateStats[dateStr].count += 1;
      }
    });

    const processedClass = Object.keys(classStats).map(c => ({
      name: c,
      avg: (classStats[c].total / classStats[c].count).toFixed(1),
      count: classStats[c].count
    })).sort((a, b) => a.name.localeCompare(b.name));

    const processedDates = recent7Dates.map((d: string) => ({
      date: d,
      avg: dateStats[d] ? (dateStats[d].total / dateStats[d].count).toFixed(1) : "0.0",
      count: dateStats[d]?.count || 0
    }));

    let totalRedThreats = 0;
    const activeScores = reports.map((r: any) => {
      if (getWarningLevel(r.comment || r.有事情想向老師分享 || "") === 'red') {
        totalRedThreats++;
      }
      return parseInt(r.moodScore || r.心情指數);
    }).filter(s => s > 0);

    const overallAvg = activeScores.length
      ? (activeScores.reduce((sum, current) => sum + current, 0) / activeScores.length).toFixed(1)
      : "5.0";

    return {
      overallAvg,
      scoreFreq,
      processedClass,
      processedDates,
      totalRedThreats
    };
  }, [reports]);

  // --- QUERY FILTERING ---
  const { filteredData, uniqueDates, threatCount, missingStudentsToday } = useMemo(() => {
    let list = [...reports];
    let alertThreat = 0;

    if (selectedClass === 'GCCPS') {
      alertThreat = reports.filter((r: any) => r.status !== 'Resolved' && getWarningLevel(r.comment || r.有事情想向老師分享 || "") === 'red').length;
      if (activeTab === 'ALL_COMMENTS') {
        list = list.filter((r: any) => (r.comment || r.有事情想向老師分享 || "").trim() !== "");
      } else {
        list = list.filter((r: any) => getWarningLevel(r.comment || r.有事情想向老師分享 || "") === 'red');
      }
    } else {
      alertThreat = reports.filter((r: any) => r.status !== 'Resolved' && getWarningLevel(r.comment || r.有事情想向老師分享 || "") === 'red').length;
    }

    const rawUniqueDates = reports.map((item: any) => getDisplayDate(item));
    const dates = ['全部日期', ...Array.from(new Set(rawUniqueDates))].sort((a: string, b: string) => {
      if (a === '全部日期') return -1;
      if (b === '全部日期') return 1;
      return parseDateString(b) - parseDateString(a);
    });

    let missingStudentsToday: number[] = [];
    if (selectedClass !== 'GCCPS') {
      const todayStr = formatDateObj(new Date());
      const todayReportsForClass = reports.filter(r => getDisplayDate(r) === todayStr && (r.class || r.班別) === selectedClass);
      const enteredStudentNumbers = new Set(todayReportsForClass.map(r => parseInt(r.studentNumber || r.學號 || "0")));
      missingStudentsToday = Array.from({ length: 30 }, (_, i) => i + 1).filter(num => !enteredStudentNumbers.has(num));
    }

    if (selectedDate !== '全部日期') {
      if (selectedClass !== 'GCCPS' || activeTab === 'ALL_COMMENTS') {
        list = list.filter((r: any) => getDisplayDate(r) === selectedDate);
      }
    }

    if (searchQuery.trim()) {
      list = list.filter((r: any) => String(r.studentNumber || r.學號 || "").includes(searchQuery.trim()));
    }

    list.sort((a: any, b: any) => {
      if (a.status === "Resolved" && b.status !== "Resolved") return 1;
      if (a.status !== "Resolved" && b.status === "Resolved") return -1;

      const wA = getWarningWeight(getWarningLevel(a.comment || a.有事情想向老師分享 || ""));
      const wB = getWarningWeight(getWarningLevel(b.comment || b.有事情想向老師分享 || ""));
      if (wA !== wB) return wB - wA;

      const classA = a.class || a.班別 || '';
      const classB = b.class || b.班别 || '';
      if (classA !== classB) return classA.localeCompare(classB);

      return parseInt(a.studentNumber || a.學號 || "0") - parseInt(b.studentNumber || b.學號 || "0");
    });

    return { filteredData: list, uniqueDates: dates, threatCount: alertThreat, missingStudentsToday };
  }, [reports, selectedClass, selectedDate, searchQuery, activeTab]);

  // --- OVERLAY DATA ---
  const detailStudentReports = useMemo(() => {
    if (!detailStudentId) return [];
    return reports.filter((r: any) => (r.studentNumber || r.學號) === detailStudentId)
      .sort((a: any, b: any) => getUnixTime(b) - getUnixTime(a));
  }, [reports, detailStudentId]);

  const studentDirectoryList = useMemo(() => {
    const studentHistoryMap: Record<string, any[]> = {};
    const rawSIds = new Set<string>();

    reports.forEach((r: any) => {
      const sId = String(r.studentNumber || r.學號 || '').trim();
      if (sId) {
        rawSIds.add(sId);
        if (!studentHistoryMap[sId]) studentHistoryMap[sId] = [];
        studentHistoryMap[sId].push(r);
      }
    });

    const sNumbers = Array.from(rawSIds).sort((a: string, b: string) => parseInt(a) - parseInt(b));

    return sNumbers.map((s: string) => {
      const history = studentHistoryMap[s]
        .sort((a: any, b: any) => getUnixTime(b) - getUnixTime(a));
      const recent5 = history.slice(0, 5);
      const valid5Scores = recent5.map((r: any) => {
        const val = r.moodScore || r.心情指數;
        return val === 'N/A' ? null : parseInt(val);
      }).filter((v): v is number => v !== null && !isNaN(v));
      const avg = valid5Scores.length
        ? (valid5Scores.reduce((sum: number, score: number) => sum + score, 0) / valid5Scores.length).toFixed(1)
        : "5.0";

      return {
        studentNo: s,
        avgScore: avg,
        totalEntries: history.length,
        history
      };
    });
  }, [reports]);

  const consecutiveLowMoodStudents = useMemo(() => {
    if (!reports || reports.length === 0) return [];

    const studentMap: Record<string, any[]> = {};
    reports.forEach((r: any) => {
      const cls = r.class || r.班別 || '';
      const sId = String(r.studentNumber || r.學號 || '').trim();
      if (!sId) return;
      const key = `${cls}_${sId}`;
      if (!studentMap[key]) {
        studentMap[key] = [];
      }
      studentMap[key].push(r);
    });

    const flagged: { class: string; studentNo: string; dates: string[]; scores: number[] }[] = [];

    const now = new Date().getTime();
    const stringD1 = formatDateObj(new Date(now));
    const stringD2 = formatDateObj(new Date(now - 86400000));
    const stringD3 = formatDateObj(new Date(now - 2 * 86400000));

    Object.keys(studentMap).forEach(key => {
      const history = studentMap[key];

      const rec1 = history.find(r => getDisplayDate(r) === stringD1);
      const rec2 = history.find(r => getDisplayDate(r) === stringD2);
      const rec3 = history.find(r => getDisplayDate(r) === stringD3);

      if (rec1 && rec2 && rec3) {
        const s1 = parseInt(rec1.moodScore || rec1.心情指數 || "5");
        const s2 = parseInt(rec2.moodScore || rec2.心情指數 || "5");
        const s3 = parseInt(rec3.moodScore || rec3.心情指數 || "5");

        if (s1 > 0 && s1 < 3 && s2 > 0 && s2 < 3 && s3 > 0 && s3 < 3) {
          flagged.push({
            class: rec1.class || rec1.班別 || '',
            studentNo: rec1.studentNumber || rec1.學號 || '',
            dates: [stringD3, stringD2, stringD1],
            scores: [s3, s2, s1]
          });
        }
      }
    });

    return flagged;
  }, [reports]);

  // GCCPS Safety Center Today's tracking
  const { todayStr, todayReportsByClassSummary, uncompletedList } = useMemo(() => {
    const rClasses = ALL_CLASSES.filter(c => c !== 'GCCPS');
    const tStr = formatDateObj(new Date());
    const todayReports = reports.filter(r => getDisplayDate(r) === tStr);

    const todayReportsByClass: Record<string, any[]> = {};
    rClasses.forEach(c => {
      todayReportsByClass[c] = [];
    });
    todayReports.forEach(r => {
      const cls = (r.class || r.班別 || '').toUpperCase();
      if (todayReportsByClass[cls] !== undefined) {
        todayReportsByClass[cls].push(r);
      }
    });

    const uncompleted = rClasses.filter(c => todayReportsByClass[c].length === 0);

    const summaryTableData = rClasses.map(cls => {
      const clsReports = todayReportsByClass[cls] || [];
      const validScores = clsReports.map((r: any) => {
        const val = r.moodScore || r.心情指數;
        return val === 'N/A' ? null : parseInt(val);
      }).filter((v): v is number => v !== null && !isNaN(v));
      const count = clsReports.length;

      const enteredStudentNumbers = new Set(clsReports.map((r: any) => parseInt(r.studentNumber || r.學號 || "0")));
      const missingStudents = Array.from({ length: 30 }, (_, i) => i + 1).filter(num => !enteredStudentNumbers.has(num));

      let avg = 0;
      if (validScores.length > 0) {
        const sum = validScores.reduce((acc, score) => acc + score, 0);
        avg = parseFloat((sum / validScores.length).toFixed(1));
      }
      return {
        cls,
        count,
        avg: validScores.length > 0 ? avg : null,
        missing: missingStudents
      };
    });

    return {
      todayStr: tStr,
      todayReportsByClassSummary: summaryTableData,
      uncompletedList: uncompleted
    };
  }, [reports]);

  return (
    <div className="min-h-screen bg-transparent text-[#1E293B] font-sans">
      {/* GLOBAL MASCOT WATERMARK BACKGROUND */}
      <MascotWatermarkBackground />

      {/* GLOBAL NAVBAR HEADER */}
      <Header
        viewState={viewState}
        selectedClass={selectedClass}
        activeStudentNumber={activeStudentNumber}
        setGuideModalVisible={setGuideModalVisible}
        handleLogout={handleLogout}
      />

      {/* ROUTER AND SWITCHER */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <AnimatePresence mode="wait">
          {viewState === 'LANDING' && (
            <Landing
              setViewState={setViewState}
              setPrivacyModalVisible={setPrivacyModalVisible}
            />
          )}

          {viewState === 'STUDENT_LOGIN' && (
            <StudentLogin
              ALL_CLASSES={ALL_CLASSES}
              selectedClass={selectedClass}
              setSelectedClass={setSelectedClass}
              studentNoInput={studentNoInput}
              setStudentNoInput={setStudentNoInput}
              loginPassword={loginPassword}
              setLoginPassword={setLoginPassword}
              rememberMe={rememberMe}
              setRememberMe={setRememberMe}
              loading={loading}
              handleStudentLoginSubmit={handleStudentLoginSubmit}
              setViewState={setViewState}
            />
          )}

          {viewState === 'TEACHER_LOGIN' && (
            <TeacherLogin
              selectedClass={selectedClass}
              setSelectedClass={setSelectedClass}
              loginPassword={loginPassword}
              setLoginPassword={setLoginPassword}
              rememberMe={rememberMe}
              setRememberMe={setRememberMe}
              loading={loading}
              handleTeacherLoginSubmit={handleTeacherLoginSubmit}
              setViewState={setViewState}
            />
          )}

          {viewState === 'STUDENT_DASHBOARD' && (
            <StudentDashboard
              selectedClass={selectedClass}
              activeStudentNumber={activeStudentNumber}
              studentSuccessMessage={studentSuccessMessage}
              setStudentSuccessMessage={setStudentSuccessMessage}
              studentMood={studentMood}
              setStudentMood={setStudentMood}
              studentComment={studentComment}
              setStudentComment={setStudentComment}
              showStudentReport={showStudentReport}
              setShowStudentReport={setShowStudentReport}
              reports={reports}
              handleLogout={handleLogout}
              handleStudentReportSubmit={handleStudentReportSubmit}
              loading={loading}
            />
          )}

          {viewState === 'TEACHER_P1_3_BATCH' && (
            <P13BatchGrader
              selectedClass={selectedClass}
              batchScores={batchScores}
              handleP13CellGradeChange={handleP13CellGradeChange}
              handleP13BatchSubmit={handleP13BatchSubmit}
              isP13Saved={isP13Saved}
              loading={loading}
            />
          )}

          {viewState === 'TEACHER_DASHBOARD' && (
            <TeacherDashboard
              selectedClass={selectedClass}
              reports={reports}
              analyticsData={analyticsData}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              alertEmails={alertEmails}
              setAlertEmails={setAlertEmails}
              handleSaveAlertSettings={handleSaveAlertSettings}
              currentUser={currentUser}
              handleGoogleLogin={handleGoogleLogin}
              handleGoogleLogout={handleGoogleLogout}
              isLoggingIn={isLoggingIn}
              hasPermissionError={hasPermissionError}
              threatCount={threatCount}
              consecutiveLowMoodStudents={consecutiveLowMoodStudents}
              exportStartDate={exportStartDate}
              setExportStartDate={setExportStartDate}
              exportEndDate={exportEndDate}
              setExportEndDate={setExportEndDate}
              handleCSVExport={handleCSVExport}
              isExporting={isExporting}
              handleCSVUpload={handleCSVUpload}
              uploadProgress={uploadProgress}
              handleClearTestData={handleClearTestData}
              setUpdateSummaryVisible={setUpdateSummaryVisible}
              todayStr={todayStr}
              uncompletedList={uncompletedList}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              uniqueDates={uniqueDates}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              missingStudentsToday={missingStudentsToday}
              studentDirectoryList={studentDirectoryList}
              detailStudentId={detailStudentId}
              setDetailStudentId={setDetailStudentId}
              detailStudentReports={detailStudentReports}
              filteredData={filteredData}
              setActiveReportId={setActiveReportId}
              setActionText={setActionText}
              setActionModalVisible={setActionModalVisible}
              passwordsData={passwordsData}
              setPasswordsData={setPasswordsData}
              editingStudentPasswords={editingStudentPasswords}
              setEditingStudentPasswords={setEditingStudentPasswords}
              currentEditClass={currentEditClass}
              setCurrentEditClass={setCurrentEditClass}
              handleSavePasswords={handleSavePasswords}
              handleSaveStudentPasswords={handleSaveStudentPasswords}
              isSavingPass={isSavingPass}
              loginHistory={loginHistory}
              tokenExpiryTime={tokenExpiryTime}
              hasPendingUndispatchedAlerts={hasPendingUndispatchedAlerts}
              gmailCredentials={gmailCredentials}
              handleSaveOAuthCredentials={handleSaveOAuthCredentials}
              handleDisconnectGmail={handleDisconnectGmail}
              handleStartGoogleOAuth={handleStartGoogleOAuth}
            />
          )}
        </AnimatePresence>
      </main>

      {/* OVERLAY MODALS */}
      <ActionModal
        visible={actionModalVisible}
        onClose={() => setActionModalVisible(false)}
        onSubmit={handleTeacherActionSubmit}
        actionText={actionText}
        setActionText={setActionText}
        loading={loading}
      />

      <PrivacyPolicyModal
        visible={privacyModalVisible}
        onClose={() => setPrivacyModalVisible(false)}
      />

      <UpdateSummaryModal
        visible={updateSummaryVisible}
        onClose={() => setUpdateSummaryVisible(false)}
        todayStr={todayStr}
        todayReportsByClassSummary={todayReportsByClassSummary}
      />

      <SystemGuideModal
        visible={guideModalVisible}
        onClose={() => setGuideModalVisible(false)}
      />
    </div>
  );
}
