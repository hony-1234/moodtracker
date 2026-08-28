import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Shield, Sliders, Trash2, AlertCircle, CheckCircle, 
  AlertTriangle, FileText, Activity, Key, Clock, 
  Download, Upload, Bell, Sparkles
} from 'lucide-react';
import { getPublicAssetUrl } from '../../../utils/assetHelper';
import { getActiveMascot, setActiveMascot, subscribeActiveMascot, MascotId } from '../../../firebase/services';

// Child components
import { ReportList } from './ReportList';
import { Analytics } from './Analytics';
import { Passwords } from './Passwords';
import { AuditLogs } from './AuditLogs';
import { PushNotificationPanel } from './PushNotificationPanel';

// Constants
import { getMoodColor } from '../../../constants/moodConstants';

interface StudentDirectoryItem {
  studentNo: string;
  totalEntries: number;
  avgScore: string;
}

interface ReportListItem {
  id: string;
  studentNumber?: string;
  學號?: string;
  class?: string;
  班別?: string;
  moodScore?: number | 'N/A';
  心情指數?: number | 'N/A';
  comment?: string;
  有事情想向老師分享?: string;
  status?: string;
  resolvedBy?: string;
  actionTaken?: string;
  ipAddress?: string;
}

interface TeacherDashboardProps {
  selectedClass: string;
  reports: any[];
  analyticsData: any;
  activeTab: 'REPORTS' | 'ANALYTICS' | 'PASSWORDS' | 'LOGS' | 'ALL_COMMENTS' | 'PUSH_NOTIFICATIONS';
  setActiveTab: (tab: 'REPORTS' | 'ANALYTICS' | 'PASSWORDS' | 'LOGS' | 'ALL_COMMENTS' | 'PUSH_NOTIFICATIONS') => void;
  alertEmails: string;
  setAlertEmails: (emails: string) => void;
  handleSaveAlertSettings: () => Promise<void>;
  currentUser: any;
  handleGoogleLogin: () => Promise<void>;
  handleGoogleLogout: () => Promise<void>;
  isLoggingIn: boolean;
  threatCount: number;
  consecutiveLowMoodStudents: any[];
  exportStartDate: string;
  setExportStartDate: (d: string) => void;
  exportEndDate: string;
  setExportEndDate: (d: string) => void;
  handleCSVExport: () => Promise<void> | void;
  isExporting: boolean;
  handleCSVUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void> | void;
  uploadProgress: { current: number; total: number };
  handleClearTestData: () => Promise<void>;
  setUpdateSummaryVisible: (v: boolean) => void;
  todayStr: string;
  uncompletedList: string[];

  // ReportList child props
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  uniqueDates: string[];
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  missingStudentsToday: number[];
  studentDirectoryList: StudentDirectoryItem[];
  detailStudentId: string | null;
  setDetailStudentId: (id: string | null) => void;
  detailStudentReports: ReportListItem[];
  filteredData: ReportListItem[];
  setActiveReportId: (id: string) => void;
  setActionText: (text: string) => void;
  setActionModalVisible: (v: boolean) => void;

  // Passwords child props
  passwordsData: Record<string, string>;
  setPasswordsData: (data: Record<string, string>) => void;
  editingStudentPasswords: Record<string, string>;
  setEditingStudentPasswords: (data: Record<string, string>) => void;
  currentEditClass: string;
  setCurrentEditClass: (cls: string) => void;
  handleSavePasswords: () => Promise<void>;
  handleSaveStudentPasswords: () => Promise<void>;
  isSavingPass: boolean;

  // AuditLogs child props
  loginHistory: any[];
  handleRefreshLogs?: () => void;

  tokenExpiryTime?: number | null;
  hasPendingUndispatchedAlerts?: boolean;
  hasPermissionError?: boolean;

  gmailCredentials?: {
    client_id: string;
    client_secret: string;
    refresh_token: string;
    authorized_email: string;
  } | null;
  handleSaveOAuthCredentials?: (clientId: string, clientSecret: string) => Promise<void>;
  handleDisconnectGmail?: () => Promise<void>;
  handleStartGoogleOAuth?: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  selectedClass,
  reports,
  analyticsData,
  activeTab,
  setActiveTab,
  alertEmails,
  setAlertEmails,
  handleSaveAlertSettings,
  currentUser,
  handleGoogleLogin,
  tokenExpiryTime,
  hasPendingUndispatchedAlerts,
  hasPermissionError,
  handleGoogleLogout,
  gmailCredentials,
  handleSaveOAuthCredentials,
  handleDisconnectGmail,
  handleStartGoogleOAuth,
  isLoggingIn,
  threatCount,
  consecutiveLowMoodStudents,
  exportStartDate,
  setExportStartDate,
  exportEndDate,
  setExportEndDate,
  handleCSVExport,
  isExporting,
  handleCSVUpload,
  uploadProgress,
  handleClearTestData,
  setUpdateSummaryVisible,
  todayStr,
  uncompletedList,

  // ReportList child props
  searchQuery,
  setSearchQuery,
  uniqueDates,
  selectedDate,
  setSelectedDate,
  missingStudentsToday,
  studentDirectoryList,
  detailStudentId,
  setDetailStudentId,
  detailStudentReports,
  filteredData,
  setActiveReportId,
  setActionText,
  setActionModalVisible,

  // Passwords child props
  passwordsData,
  setPasswordsData,
  editingStudentPasswords,
  setEditingStudentPasswords,
  currentEditClass,
  setCurrentEditClass,
  handleSavePasswords,
  handleSaveStudentPasswords,
  isSavingPass,

  // AuditLogs child props
  loginHistory,
  handleRefreshLogs,
}) => {
  const [oauthClientId, setOauthClientId] = useState('');
  const [oauthClientSecret, setOauthClientSecret] = useState('');
  const [showOauthSettings, setShowOauthSettings] = useState(false);

  // Sync inputs with gmailCredentials prop when loaded
  useEffect(() => {
    if (gmailCredentials) {
      setOauthClientId(gmailCredentials.client_id || '');
      setOauthClientSecret(gmailCredentials.client_secret || '');
    }
  }, [gmailCredentials]);

  // Mascot state
  const [currentMascot, setCurrentMascot] = useState<MascotId>('enen');
  const [mascotUpdateMsg, setMascotUpdateMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeActiveMascot((m) => {
      setCurrentMascot(m);
    });
    return () => unsubscribe();
  }, []);

  const handleSelectMascot = async (mascotId: MascotId) => {
    setCurrentMascot(mascotId);
    await setActiveMascot(mascotId, currentUser?.email || 'Teacher');
    setMascotUpdateMsg(mascotId === 'enen' ? '✨ 已成功切換今日校園大使為「恩恩天使」！全校首頁即時生效' : '🔥 已成功切換今日校園大使為「信信火焰」！全校首頁即時生效');
    setTimeout(() => setMascotUpdateMsg(null), 4000);
  };

  return (
    <motion.div
      key="teacher_dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6 max-w-7xl mx-auto px-4 md:px-6"
    >
      {/* === SECURITY & GMAIL API STATUS BANNERS === */}
      {(() => {
        if (selectedClass !== 'GCCPS') return null;

        const hasStoredRefreshToken = !!(gmailCredentials?.refresh_token && gmailCredentials?.client_id && gmailCredentials?.client_secret);
        if (hasStoredRefreshToken) return null; // No warning needed for Scheme C persistent background auth

        const isExpired = tokenExpiryTime ? Date.now() >= tokenExpiryTime : true;
        const needsReauth = !currentUser || !tokenExpiryTime || isExpired;

        if (needsReauth && hasPendingUndispatchedAlerts) {
          return (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 font-sans text-red-900"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-xl text-red-600 animate-pulse">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base">📧 系統偵測到未發送的高危表情警報！</h4>
                  <p className="text-sm text-red-700 font-medium">您的 Google 郵件授權已失效/過期，導致自動警告通知無法發送。請立即登入以補發警報信件給輔導團隊。</p>
                </div>
              </div>
              <button
                onClick={handleGoogleLogin}
                className="w-full md:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold text-sm rounded-xl transition shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer"
              >
                🔑 立即驗證 Google 帳戶並補發
              </button>
            </motion.div>
          );
        }

        if (needsReauth) {
          return (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 font-sans text-amber-950"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-sm font-semibold">
                  Google 郵件警報授權已到期（每小時安全重置）。請點擊右側按鈕進行授權刷新，以確保後續的即時情緒信件通知能正常由您的帳戶發送。
                </p>
              </div>
              <button
                onClick={handleGoogleLogin}
                className="w-full md:w-auto px-5 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs rounded-lg transition shrink-0 cursor-pointer"
              >
                🔑 啟用/刷新 Google 授權
              </button>
            </motion.div>
          );
        }

        return null;
      })()}

      {/* === GCCPS SAFETY MONITOR: TODAY'S TRACKING & CAMPUS MASCOT (全校心情登記追蹤及安全中心) === */}
      {selectedClass === 'GCCPS' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 font-sans">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                👑 全校心情登記追蹤及安全中心 (今日：{todayStr})
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-semibold">
                實時排查今日尚無登記心情記錄的班別，以提醒導師跟進登錄，並管理校園全局設定。
              </p>
            </div>
            
            {/* Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setUpdateSummaryVisible(true)}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-black min-h-[38px] px-4 rounded-xl border border-emerald-250 cursor-pointer transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Sliders className="w-3.5 h-3.5" />
                📊 查看今日登記進度綜合彙報
              </button>
              <button
                onClick={handleClearTestData}
                className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-black min-h-[38px] px-4 rounded-xl border border-red-200 cursor-pointer transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                🗑️ 清除 'TEST' 測試數據
              </button>
            </div>
          </div>

          {uncompletedList.length > 0 ? (
            <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-black text-amber-800">
                  今日未完成登記的班級：尚有 {uncompletedList.length} 個班級未同步今日數據 (P.1-P.3 可由導師快速批量代錄分數)
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {uncompletedList.map(cls => (
                  <span 
                    key={cls}
                    className="bg-white border border-amber-250 text-amber-800 font-extrabold text-[11px] px-2.5 py-1 rounded-lg shadow-3xs"
                  >
                    ⚠️ {cls} 班
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-2 text-xs font-bold shadow-3xs">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              完美！全校 24 個學制班級今日均已順利、全員完成心情登記同步！
            </div>
          )}

          {/* Integrated Campus Mascot Controller inside Safety Centre */}
          <div className="border-t border-slate-150 pt-5 space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-600 animate-pulse" />
                  🌟 今日校園大使選擇與設定 (Campus Live 2D Mascot)
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">
                  全校管理端可在此即時切換學生登入首頁展示的 Live 2.5D 動態校園大使角色。
                </p>
              </div>
              {mascotUpdateMsg && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full animate-fade-in shadow-3xs">
                  {mascotUpdateMsg}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              {/* Mascot Option 1: 恩恩天使 */}
              <div className={`p-3.5 rounded-2xl border-2 transition-all flex items-center gap-3.5 ${
                currentMascot === 'enen' 
                  ? 'border-pink-500 bg-pink-50/60 shadow-sm ring-2 ring-pink-400/20' 
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}>
                <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-1 shrink-0 overflow-hidden flex items-center justify-center shadow-2xs">
                  <img 
                    src={getPublicAssetUrl("/學校圖檔/吉祥物/enen_full.png")} 
                    alt="恩恩天使" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h5 className="text-xs font-black text-slate-800">恩恩 (EnEn) - 善導恩寵天使</h5>
                    {currentMascot === 'enen' && (
                      <span className="bg-pink-600 text-white text-[9.5px] font-black px-2 py-0.5 rounded-full">
                        當前上線中
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 font-medium">
                    ✨ 靈動天使拍翼、麵包聖體光芒守護、靈巧眨眼與歡快搖擺，象徵愛德與感恩。
                  </p>
                  <div className="mt-2">
                    {currentMascot === 'enen' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-pink-100 text-pink-800 border border-pink-200 shadow-3xs">
                        <CheckCircle className="w-3 h-3 text-pink-600" /> 已設為校園大使
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSelectMascot('enen')}
                        className="text-[11px] font-bold px-3 py-1 rounded-lg bg-white hover:bg-pink-50 text-pink-700 border border-pink-300 hover:border-pink-400 transition cursor-pointer active:scale-95 shadow-3xs flex items-center gap-1.5"
                      >
                        <span>🔄 切換為此大使</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Mascot Option 2: 信信火焰 */}
              <div className={`p-3.5 rounded-2xl border-2 transition-all flex items-center gap-3.5 ${
                currentMascot === 'xinxin' 
                  ? 'border-amber-500 bg-amber-50/60 shadow-sm ring-2 ring-amber-400/20' 
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}>
                <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-1 shrink-0 overflow-hidden flex items-center justify-center shadow-2xs">
                  <img 
                    src={getPublicAssetUrl("/學校圖檔/吉祥物/信信-01.png")} 
                    alt="信信火焰" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h5 className="text-xs font-black text-slate-800">信信 (XinXin) - 堅毅信念火焰</h5>
                    {currentMascot === 'xinxin' && (
                      <span className="bg-amber-600 text-white text-[9.5px] font-black px-2 py-0.5 rounded-full">
                        當前上線中
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 font-medium">
                    🔥 堅毅信念之火、手部互動肢體、立體重力感應眼神，象徵信德與勇氣。
                  </p>
                  <div className="mt-2">
                    {currentMascot === 'xinxin' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-200 shadow-3xs">
                        <CheckCircle className="w-3 h-3 text-amber-600" /> 已設為校園大使
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSelectMascot('xinxin')}
                        className="text-[11px] font-bold px-3 py-1 rounded-lg bg-white hover:bg-amber-50 text-amber-700 border border-amber-300 hover:border-amber-400 transition cursor-pointer active:scale-95 shadow-3xs flex items-center gap-1.5"
                      >
                        <span>🔄 切換為此大使</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === GCCPS AUTOMATED ALERTS SETTINGS === */}
      {selectedClass === 'GCCPS' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 font-sans">
          {/* Section Header */}
          <div>
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              自動電子郵件警報設定 (Gmail API v1)
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-semibold leading-relaxed">
              當系統檢測到高危言論或學生連續三天情緒低落時，將在背景自動發送預警信件予指定的教職員。
            </p>
          </div>

          {/* Sub-card 1: Email Receiver List */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              📬 警報收件名單設定
            </h4>
            <p className="text-[11px] text-slate-500">
              在此輸入接收警示信件的教職員信箱（若有多個，請使用半形逗號分開）。
            </p>
            <div className="flex items-center gap-3 w-full max-w-2xl">
              <input
                type="text"
                value={alertEmails}
                onChange={(e) => setAlertEmails(e.target.value)}
                placeholder="例如: counselor@school.edu, teacher@school.edu"
                className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 text-xs font-bold text-slate-800 animate-pulse-short"
              />
              <button
                onClick={handleSaveAlertSettings}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-sm cursor-pointer"
              >
                更新名單
              </button>
            </div>
          </div>

          {/* Sub-card 2: Google OAuth Background Token Setup */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                🔑 Gmail API 永久背景發信授權 (OAuth Refresh Token)
              </h4>
              <button
                type="button"
                onClick={() => setShowOauthSettings(!showOauthSettings)}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
              >
                {showOauthSettings ? '▲ 隱藏 IT API 金鑰設定' : '▼ 顯示 IT API 金鑰設定'}
              </button>
            </div>

            {/* Current Auth Status Banner */}
            {gmailCredentials?.refresh_token && gmailCredentials?.authorized_email ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-800">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    已啟用背景 Gmail 永久自動發信授權
                  </div>
                  <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                    - 已綁定之 Google 發信信箱：<strong className="text-emerald-700">{gmailCredentials.authorized_email}</strong><br />
                    - 運作狀態：系統目前正處於實時自動發信狀態。此後任何學生觸發的情緒預警信，均會完全默默、免人工登入地在背景透過此帳號自動安全發出。
                  </p>
                </div>
                <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end">
                  <button
                    onClick={handleDisconnectGmail}
                    className="px-3 py-1.5 border border-red-200 bg-white hover:bg-red-50 text-red-700 font-bold text-xs rounded-lg transition cursor-pointer"
                  >
                    斷開 Gmail 聯結
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 leading-relaxed font-semibold text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-amber-800 font-black">
                  <AlertCircle className="w-4 h-4" />
                  目前未啟用背景 Gmail 永久自動發信授權
                </div>
                <p className="text-[11px] leading-relaxed">
                  系統目前缺少有效的 Google 授權憑證，無法在背景默默為您自動代發郵件。請參考下方說明填寫 Client ID 與 Client Secret 後完成一次性永久認證。
                </p>
              </div>
            )}

            {/* Step-by-Step IT Guide & OAuth Inputs */}
            {(showOauthSettings || !gmailCredentials?.refresh_token) && (
              <div className="space-y-4 pt-3 border-t border-slate-200">

                {/* API Key Form Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-600 block">Google OAuth Client ID</label>
                    <input
                      type="text"
                      value={oauthClientId}
                      onChange={(e) => setOauthClientId(e.target.value)}
                      placeholder="貼上以 .apps.googleusercontent.com 結尾的 Client ID"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-600 block">Google OAuth Client Secret</label>
                    <input
                      type="password"
                      value={oauthClientSecret}
                      onChange={(e) => setOauthClientSecret(e.target.value)}
                      placeholder="貼上 Client Secret (用戶端密鑰)"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-start items-center">
                  <button
                    onClick={() => handleSaveOAuthCredentials?.(oauthClientId, oauthClientSecret)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    💾 儲存 API 金鑰設定
                  </button>

                  {gmailCredentials?.client_id && gmailCredentials?.client_secret && (
                    <button
                      onClick={handleStartGoogleOAuth}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer"
                    >
                      🔑 開始永久背景發信授權 (綁定 Google 帳戶)
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ALERT BOX if any danger warnings are detected */}
      {threatCount > 0 && (
        <div className="bg-[#FFF1F2] border border-[#FDA4AF] border-l-4 border-l-[#F43F5E] p-4 rounded-xl text-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-pulse-short font-sans">
          <div className="flex gap-3">
            <div className="bg-[#F43F5E] text-white p-2.5 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">🚨 學生敏感言論預警 ({threatCount} 筆未跟進處理)</h4>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                系統在最近的回應留言中，探測到嚴厲言論或安全隱患字樣。請教師儘快確認並實施約談干預。
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDate('全部日期');
              setActiveTab('REPORTS');
            }}
            className="bg-[#F43F5E] hover:bg-rose-700 text-white font-black text-xs px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap"
          >
            點擊快速過濾警示報告
          </button>
        </div>
      )}

      {/* CONSECUTIVE LOW MOOD WARNINGS */}
      {consecutiveLowMoodStudents.filter(st => selectedClass === 'GCCPS' || st.class === selectedClass).length > 0 && (
        <div className="bg-[#FEF3C7] border border-[#FCD34D] border-l-4 border-l-[#D97706] p-4 rounded-xl text-slate-800 shadow-sm font-sans">
          <div className="flex gap-3">
            <div className="bg-[#D97706] text-white p-2.5 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-extrabold text-slate-900 text-sm">
                ⚠️ 情緒低落預警：連續 3 天心情少於 3 分 ({consecutiveLowMoodStudents.filter(st => selectedClass === 'GCCPS' || st.class === selectedClass).length} 位同學)
              </h4>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                系統偵測到下列學生在最近 3 次心情填報中，心情指數皆低於 3 分，顯示可能存在持續的精神情緒壓力。請導師儘速進行實體關懷：
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {consecutiveLowMoodStudents.filter(st => selectedClass === 'GCCPS' || st.class === selectedClass).map((st, idx) => (
                  <div key={idx} className="bg-white px-3 py-2 rounded-lg border border-amber-200 text-xs font-semibold shadow-xs">
                    <span className="text-slate-800 font-bold block">
                      {st.studentNo}號同學 {selectedClass === 'GCCPS' && `(${st.class}班)`}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      日期: {st.dates.join(', ')}
                    </span>
                    <span className="text-[10.5px] text-rose-600 font-bold block mt-1">
                      心情指數: {st.scores.join('分 → ')}分
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Control Buttons */}
      <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-4 font-sans">
        <div className="flex flex-wrap justify-center sm:justify-start gap-1">
          <button
            onClick={() => setActiveTab('REPORTS')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'REPORTS' ? 'bg-[#1E293B] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            心情報告清單
          </button>
          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ANALYTICS' ? 'bg-[#1E293B] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-4 h-4" />
            圖表趨勢分析
          </button>
          {selectedClass === 'GCCPS' && (
            <>
              <button
                onClick={() => setActiveTab('ALL_COMMENTS')}
                className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'ALL_COMMENTS' ? 'bg-[#1E293B] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4 text-indigo-600" />
                💬 全校留言一覽
              </button>
              <button
                onClick={() => setActiveTab('PASSWORDS')}
                className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'PASSWORDS' ? 'bg-[#1E293B] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Key className="w-4 h-4" />
                密碼安全管理
              </button>
              <button
                onClick={() => setActiveTab('LOGS')}
                className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'LOGS' ? 'bg-[#1E293B] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-4 h-4" />
                登入安全日誌
              </button>
            </>
          )}
          <button
            onClick={() => setActiveTab('PUSH_NOTIFICATIONS')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'PUSH_NOTIFICATIONS' ? 'bg-[#1E293B] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Bell className="w-4 h-4 text-indigo-500 animate-pulse" />
            推送通知設定
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          
          {/* Export Interface */}
          <div className="border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50 flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">日期區間:</span>
              <input
                type="date"
                className="bg-transparent border-0 text-xs text-slate-700 font-bold focus:outline-none w-28 sm:w-auto"
                value={exportStartDate}
                onChange={(e) => setExportStartDate(e.target.value)}
              />
              <span className="text-[11px] font-bold text-slate-400">至</span>
              <input
                type="date"
                className="bg-transparent border-0 text-xs text-slate-700 font-bold focus:outline-none w-28 sm:w-auto"
                value={exportEndDate}
                onChange={(e) => setExportEndDate(e.target.value)}
              />
            </div>
            <button
              onClick={handleCSVExport}
              disabled={isExporting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer disabled:bg-slate-350 w-full sm:w-auto"
            >
              <Download className="w-3.5 h-3.5" />
              {isExporting ? "匯出中" : " CSV 匯出"}
            </button>
          </div>

          {/* Import CSV tool */}
          {selectedClass === 'GCCPS' && (
            <label className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl cursor-pointer flex items-center justify-center gap-1 shadow hover:scale-105 transition-all w-full sm:w-auto text-center">
              <Upload className="w-3.5 h-3.5" />
              <span>批次匯入 CSV</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
            </label>
          )}

        </div>
      </div>

      {/* CSV Import Progress Bar */}
      {uploadProgress.total > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-2 font-sans">
          <div className="flex justify-between text-xs font-black text-blue-700">
            <span>正在與 GCP Firestore 安全同步中...</span>
            <span>{uploadProgress.current} / {uploadProgress.total} 筆已完成</span>
          </div>
          <div className="w-full bg-blue-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-150" 
              style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Render selected active Tab */}
      <AnimatePresence mode="wait">
        {(activeTab === 'REPORTS' || activeTab === 'ALL_COMMENTS') && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <ReportList
              selectedClass={selectedClass}
              activeTab={activeTab}
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
              hasPermissionError={hasPermissionError}
            />
          </motion.div>
        )}

        {activeTab === 'ANALYTICS' && analyticsData && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <Analytics
              reports={reports}
              analyticsData={analyticsData}
            />
          </motion.div>
        )}

        {activeTab === 'PASSWORDS' && selectedClass === 'GCCPS' && (
          <Passwords
            passwordsData={passwordsData}
            setPasswordsData={setPasswordsData}
            editingStudentPasswords={editingStudentPasswords}
            setEditingStudentPasswords={setEditingStudentPasswords}
            currentEditClass={currentEditClass}
            setCurrentEditClass={setCurrentEditClass}
            handleSavePasswords={handleSavePasswords}
            handleSaveStudentPasswords={handleSaveStudentPasswords}
            isSavingPass={isSavingPass}
          />
        )}

        {activeTab === 'LOGS' && selectedClass === 'GCCPS' && (
          <AuditLogs
            loginHistory={loginHistory}
            onRefresh={handleRefreshLogs}
          />
        )}

        {activeTab === 'PUSH_NOTIFICATIONS' && (
          <PushNotificationPanel
            currentUser={currentUser}
            selectedClass={selectedClass}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
export default TeacherDashboard;
