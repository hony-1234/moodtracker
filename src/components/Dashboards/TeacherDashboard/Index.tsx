import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Shield, Sliders, Trash2, AlertCircle, CheckCircle, 
  AlertTriangle, FileText, Activity, Key, Clock, 
  Download, Upload, Bell, Sparkles, BookOpen, Users
} from 'lucide-react';



// Child components
import { ReportList } from './ReportList';
import { Analytics } from './Analytics';
import { Passwords } from './Passwords';
import { AuditLogs } from './AuditLogs';
import { PushNotificationPanel } from './PushNotificationPanel';
import { DiaryHub } from './DiaryHub/Index';
import { StudentProfiles } from './StudentProfiles';
import { DualTrackStudentReportModal } from '../../Reports/DualTrackStudentReportModal';
import { testSparkleAutonomousDispatch, getRecentSparkleDispatches, getSparkleEmailConfig, saveSparkleEmailConfig, SparkleDispatchRecord } from '../../../services/sparkleEmailService';
import { SparkleAlertCenter } from './SparkleAlertCenter';

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
  activeTab: 'REPORTS' | 'ANALYTICS' | 'DIARIES' | 'PROFILES' | 'PASSWORDS' | 'LOGS' | 'ALL_COMMENTS' | 'PUSH_NOTIFICATIONS' | 'GEMINI_REPORT' | 'SPARKLE_ALERTS';
  setActiveTab: (tab: any) => void;
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
  cachedAccessToken,
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
  const [comprehensiveReportStudent, setComprehensiveReportStudent] = useState<string | null>(null);

  // Sparkle Autonomous Email States
  const [isTestingSparkle, setIsTestingSparkle] = useState(false);
  const [sparkleTestStatus, setSparkleTestStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [recentDispatches, setRecentDispatches] = useState<SparkleDispatchRecord[]>([]);
  const [sparkleWebhookUrl, setSparkleWebhookUrl] = useState('');
  const [showGasGuide, setShowGasGuide] = useState(false);
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const refreshDispatches = async () => {
    try {
      const records = await getRecentSparkleDispatches(5);
      setRecentDispatches(records);
    } catch (e) {
      console.warn('Failed to fetch recent dispatches:', e);
    }
  };

  useEffect(() => {
    refreshDispatches();
    getSparkleEmailConfig().then(cfg => {
      if (cfg.webhookUrl) setSparkleWebhookUrl(cfg.webhookUrl);
    });
  }, []);

  const handleSaveSparkleWebhook = async () => {
    setIsSavingWebhook(true);
    try {
      await saveSparkleEmailConfig({ webhookUrl: sparkleWebhookUrl.trim() });
      alert('✅ Sparkle 雲端發信中繼網址已成功儲存！');
      setSparkleTestStatus({
        message: '✅ 發信中繼網址已更新，現在可點擊「測試 Sparkle 自動發信」進行實體郵件連通測試！',
        type: 'success'
      });
    } catch (err: any) {
      alert('❌ 儲存失敗：' + (err?.message || String(err)));
    } finally {
      setIsSavingWebhook(false);
    }
  };

  const handleCopyGasScript = () => {
    const gasCode = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var to = Array.isArray(data.to) ? data.to.join(', ') : data.to;
    MailApp.sendEmail({
      to: to,
      subject: data.subject,
      htmlBody: data.html || data.htmlBody
    });
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
    navigator.clipboard.writeText(gasCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const handleTestSparkle = async () => {
    const targetEmail = alertEmails.split(',')[0]?.trim() || 'counselor@mail.gccps.edu.hk';
    setIsTestingSparkle(true);
    setSparkleTestStatus(null);
    try {
      const res = await testSparkleAutonomousDispatch(targetEmail, cachedAccessToken);
      setSparkleTestStatus({
        message: res.message,
        type: res.success ? 'success' : 'error'
      });
      await refreshDispatches();
    } catch (err: any) {
      setSparkleTestStatus({
        message: `❌ 發送測試時發生錯誤: ${err?.message || String(err)}`,
        type: 'error'
      });
    } finally {
      setIsTestingSparkle(false);
    }
  };

  // Sync inputs with gmailCredentials prop when loaded
  useEffect(() => {
    if (gmailCredentials) {
      setOauthClientId(gmailCredentials.client_id || '');
      setOauthClientSecret(gmailCredentials.client_secret || '');
    }
  }, [gmailCredentials]);

  return (
    <motion.div
      key="teacher_dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6 max-w-7xl mx-auto px-4 md:px-6"
    >
      {/* === SPARKLE AUTONOMOUS MONITOR STATUS BANNER === */}
      {selectedClass === 'GCCPS' && (
        <div className="bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-blue-50/80 border border-indigo-200/70 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 font-sans text-indigo-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-indigo-950">✨ Sparkle 智能自動郵件警報全時守護中</h4>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded-full font-bold">免手動登入</span>
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] rounded-full font-bold">24小時自動監控</span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                當學生出現高危言論、連續低分或情緒急降時，Sparkle 智能引擎將全自動於雲端生成專業輔導卡並自動發信，全程免人工登入。
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500 font-medium bg-white/80 px-3 py-1.5 rounded-xl border border-indigo-100 shadow-2xs">
              每日晨報自動派發：<strong className="text-indigo-700">08:30（上課日）</strong>
            </span>
            <button
              onClick={() => setActiveTab('SPARKLE_ALERTS')}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              進入警報中心
            </button>
          </div>
        </div>
      )}

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
      <div className="bg-white border border-[#E2E8F0] p-3 sm:p-4 rounded-2xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 font-sans">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full lg:w-auto py-1">
          <button
            onClick={() => setActiveTab('REPORTS')}
            className={`px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'REPORTS' ? 'bg-[#1E293B] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            心情報告清單
          </button>
          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'ANALYTICS' ? 'bg-[#1E293B] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-4 h-4" />
            圖表趨勢分析
          </button>
          <button
            onClick={() => setActiveTab('DIARIES')}
            className={`px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'DIARIES' ? 'bg-[#1E293B] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-500" />
            📚 心靈日記管理
          </button>
          <button
            onClick={() => setActiveTab('PROFILES')}
            className={`px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'PROFILES' ? 'bg-[#1E293B] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-500" />
            👤 學生檔案 ({selectedClass === 'GCCPS' ? '全校名冊' : '本班名冊'})
          </button>
          {selectedClass === 'GCCPS' && (
            <>
              <button
                onClick={() => setActiveTab('ALL_COMMENTS')}
                className={`px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeTab === 'ALL_COMMENTS' ? 'bg-[#1E293B] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4 text-indigo-600" />
                💬 全校留言一覽
              </button>
              <button
                onClick={() => setActiveTab('PASSWORDS')}
                className={`px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeTab === 'PASSWORDS' ? 'bg-[#1E293B] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Key className="w-4 h-4" />
                密碼安全管理
              </button>
              <button
                onClick={() => setActiveTab('LOGS')}
                className={`px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeTab === 'LOGS' ? 'bg-[#1E293B] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-4 h-4" />
                登入安全日誌
              </button>
            </>
          )}
          <button
            onClick={() => setActiveTab('SPARKLE_ALERTS')}
            className={`px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              (activeTab === 'SPARKLE_ALERTS' || activeTab === 'PUSH_NOTIFICATIONS') ? 'bg-[#1E293B] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            Sparkle 智能自動郵件警報中心
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

        {activeTab === 'DIARIES' && (
          <motion.div
            key="diaries_hub"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <DiaryHub
              selectedClass={selectedClass}
              currentUser={currentUser}
              onOpenStudentReport={(studentNo) => setComprehensiveReportStudent(studentNo)}
            />
          </motion.div>
        )}

        {activeTab === 'PROFILES' && (
          <motion.div
            key="profiles"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <StudentProfiles
              selectedClass={selectedClass}
              reports={reports}
              todayStr={todayStr}
              onOpenStudentReport={(studentNo) => setComprehensiveReportStudent(studentNo)}
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

        {(activeTab === 'SPARKLE_ALERTS' || activeTab === 'PUSH_NOTIFICATIONS') && (
          <motion.div
            key="sparkle_alert_center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <SparkleAlertCenter
              selectedClass={selectedClass}
              reports={reports}
              alertEmails={alertEmails}
              setAlertEmails={setAlertEmails}
              handleSaveAlertSettings={handleSaveAlertSettings}
              currentUser={currentUser}
              cachedAccessToken={cachedAccessToken}
              gmailCredentials={gmailCredentials}
              handleGoogleLogin={handleGoogleLogin}
              handleSaveOAuthCredentials={handleSaveOAuthCredentials}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comprehensive Dual-Track Student Report Modal */}
      {comprehensiveReportStudent && (
        <DualTrackStudentReportModal
          visible={!!comprehensiveReportStudent}
          onClose={() => setComprehensiveReportStudent(null)}
          studentNumber={comprehensiveReportStudent}
          studentClass={selectedClass === 'GCCPS' ? comprehensiveReportStudent.substring(0, 2) : selectedClass}
          studentName={`學生 (${comprehensiveReportStudent})`}
          dailyMoodLogs={reports.filter((r) => String(r.studentNumber || r.學號 || '').includes(comprehensiveReportStudent))}
        />
      )}
    </motion.div>
  );
};
export default TeacherDashboard;
