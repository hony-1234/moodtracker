import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  RefreshCw, 
  ShieldAlert, 
  Users, 
  Settings, 
  Mail, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Key, 
  Heart, 
  TrendingDown, 
  Clock, 
  FileText 
} from 'lucide-react';
import { 
  DailyMorningReport, 
  generateDailyMorningReport, 
  DEFAULT_GEMINI_CONFIG, 
  GeminiConfig, 
  getActiveGeminiApiKey, 
  buildDailyMorningReportHtml 
} from '../../../services/geminiSparkService';
import { 
  saveDailyReportToFirestore, 
  getDailyReportFromFirestore, 
  getRecentDailyReports, 
  saveGeminiConfig, 
  getGeminiConfig, 
  sendGmail, 
  refreshGmailAccessToken 
} from '../../../firebase/services';

interface GeminiDailyReportPanelProps {
  reports: any[];
  gmailCredentials: any;
  cachedAccessToken?: string | null;
  onRefreshData?: () => void;
}

export const GeminiDailyReportPanel: React.FC<GeminiDailyReportPanelProps> = ({
  reports,
  gmailCredentials,
  cachedAccessToken,
  onRefreshData
}) => {
  const [currentReport, setCurrentReport] = useState<DailyMorningReport | null>(null);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sendingEmail, setSendingEmail] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Configuration state
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [recipientsText, setRecipientsText] = useState<string>('');
  const [autoSend, setAutoSend] = useState<boolean>(true);
  const [sendTime, setSendTime] = useState<string>('08:30');
  const [onlySchoolDays, setOnlySchoolDays] = useState<boolean>(true);
  const [showHtmlPreview, setShowHtmlPreview] = useState<boolean>(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Load configuration and today's existing report on mount
  useEffect(() => {
    const initData = async () => {
      const savedConfig = await getGeminiConfig();
      if (savedConfig) {
        setApiKey(savedConfig.apiKey || getActiveGeminiApiKey());
        setRecipientsText(Array.isArray(savedConfig.recipients) ? savedConfig.recipients.join(', ') : DEFAULT_GEMINI_CONFIG.recipients.join(', '));
        setAutoSend(savedConfig.autoMorningSend !== undefined ? savedConfig.autoMorningSend : true);
        setSendTime(savedConfig.morningSendTime || '08:30');
        setOnlySchoolDays(savedConfig.onlySchoolDays !== undefined ? savedConfig.onlySchoolDays : true);
      } else {
        setApiKey(getActiveGeminiApiKey());
        setRecipientsText(DEFAULT_GEMINI_CONFIG.recipients.join(', '));
      }

      const todayDoc = await getDailyReportFromFirestore(todayStr);
      if (todayDoc) {
        setCurrentReport(todayDoc as DailyMorningReport);
      }

      const recents = await getRecentDailyReports(7);
      setRecentReports(recents);
    };

    initData();
  }, [todayStr]);

  const handleSaveSettings = async () => {
    const recipientsList = recipientsText
      .split(',')
      .map(e => e.trim())
      .filter(e => e.length > 0 && e.includes('@'));

    const newConfig: GeminiConfig = {
      apiKey: apiKey.trim(),
      modelName: 'gemini-2.5-flash',
      autoMorningSend: autoSend,
      morningSendTime: sendTime,
      onlySchoolDays: onlySchoolDays,
      recipients: recipientsList.length > 0 ? recipientsList : DEFAULT_GEMINI_CONFIG.recipients
    };

    const ok = await saveGeminiConfig(newConfig);
    if (ok) {
      setStatusMessage({ text: '✅ Gemini Spark 配置與收件名單已成功儲存至雲端！', type: 'success' });
      setTimeout(() => setStatusMessage(null), 4000);
      setShowSettings(false);
    } else {
      setStatusMessage({ text: '❌ 儲存配置失敗，請檢查權限或網絡連線。', type: 'error' });
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    setStatusMessage({ text: '🤖 Gemini Spark 正在進行全校情緒聚合與 4Rs 心理健康分析...', type: 'info' });

    try {
      const generated = await generateDailyMorningReport(reports, todayStr);
      setCurrentReport(generated);
      await saveDailyReportToFirestore(generated);

      setStatusMessage({ text: `🎉 今日晨報已由 Gemini Spark 順利生成！共檢視 ${generated.totalSubmissions} 筆學生紀錄。`, type: 'success' });
      setTimeout(() => setStatusMessage(null), 5000);

      const recents = await getRecentDailyReports(7);
      setRecentReports(recents);
    } catch (err: any) {
      console.error('Report generation error:', err);
      setStatusMessage({ text: `❌ 生成晨報時發生錯誤: ${err.message || String(err)}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!currentReport) {
      setStatusMessage({ text: '請先生成今日晨報再進行寄發。', type: 'error' });
      return;
    }

    const recipientsList = recipientsText
      .split(',')
      .map(e => e.trim())
      .filter(e => e.length > 0 && e.includes('@'));

    if (recipientsList.length === 0) {
      setStatusMessage({ text: '請在設定中填寫至少一個有效的收件教職員電郵。', type: 'error' });
      return;
    }

    setSendingEmail(true);
    setStatusMessage({ text: '✨ Sparkle 智能自主發信引擎正在派發高規格晨間情報...', type: 'info' });

    try {
      let token = cachedAccessToken;
      if (!token && gmailCredentials?.client_id && gmailCredentials?.client_secret && gmailCredentials?.refresh_token) {
        try {
          const refreshRes = await refreshGmailAccessToken(
            gmailCredentials.client_id,
            gmailCredentials.client_secret,
            gmailCredentials.refresh_token
          );
          token = refreshRes.accessToken;
        } catch {
          // Fall back gracefully to Sparkle autonomous dispatch
        }
      }

      const emailHtml = buildDailyMorningReportHtml(currentReport);
      const subject = `[晨間情報] 天主教善導小學 — 全校心靈健康與 4Rs 每日晨報 (${currentReport.reportDate})`;

      const toHeader = recipientsList.join(', ');
      const dispatchRes = await dispatchSparkleAlertEmail({
        to: toHeader,
        subject,
        htmlBody: emailHtml,
        alertType: 'MORNING_REPORT',
        metadata: { reportId: currentReport.reportId },
        gmailToken: token
      });

      if (!dispatchRes.success && dispatchRes.error) {
        throw new Error(dispatchRes.error);
      }

      const updatedReport: DailyMorningReport = {
        ...currentReport,
        status: 'sent',
        sentTo: recipientsList,
        sentAt: new Date().toISOString()
      };
      setCurrentReport(updatedReport);
      await saveDailyReportToFirestore(updatedReport);

      setStatusMessage({ 
        text: `✉️ 每日晨報已順利發送至 ${recipientsList.length} 位重要教職員信箱！`, 
        type: 'success' 
      });
      setTimeout(() => setStatusMessage(null), 6000);
    } catch (sendErr: any) {
      console.error('Email dispatch error:', sendErr);
      setStatusMessage({ text: `❌ 發送郵件失敗: ${sendErr.message || String(sendErr)}`, type: 'error' });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 font-sans">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Gemini Spark 晨報與智能監控中心
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Gemini 2.5 Flash
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                全校 24 班每日早晨心靈健康情報聚合 • NLP 高危即時預警 • 每日清晨自動寄發校長及輔導主管
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-600" />
            {showSettings ? '收起設定' : '系統與名單設定'}
          </button>

          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="px-4 py-2 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 rounded-xl transition-all shadow-md shadow-indigo-200 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'AI 分析生成中...' : '⚡ 立即由 Gemini Spark 產生今日晨報'}
          </button>

          {currentReport && (
            <button
              onClick={handleSendEmail}
              disabled={sendingEmail}
              className="px-4 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 rounded-xl transition-all shadow-md shadow-emerald-200 flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {sendingEmail ? '發送中...' : '📧 立即發送晨報給指定人員'}
            </button>
          )}
        </div>
      </div>

      {/* Status Notice */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold transition-all animate-in fade-in duration-200 ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : statusMessage.type === 'error'
            ? 'bg-rose-50 text-rose-800 border border-rose-200'
            : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Settings Panel (Collapsible) */}
      {showSettings && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-600" />
              Gemini Spark 智能服務與晨報寄發名單設定
            </h3>
            <span className="text-[11px] font-bold text-slate-500">雲端即時同步</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 flex items-center justify-between">
                <span>Gemini API Key (Google AI Studio)</span>
                <span className="text-[10px] text-indigo-600 font-semibold">支援 gemini-2.5-flash</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="輸入 AIzaSy... 開頭之 API 金鑰"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                可隨時在學校 Google Cloud 或 Google AI Studio 申請專屬金鑰，更新後自動加密儲存。
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 flex items-center justify-between">
                <span>每日晨間自動發送 (Automated Daily Morning Dispatch)</span>
                <span className="text-[10px] text-emerald-600 font-bold">每日定時觸發</span>
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    checked={autoSend}
                    onChange={(e) => setAutoSend(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>啟用每日晨間自動排程發送</span>
                </label>
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="time"
                    value={sendTime}
                    onChange={(e) => setSendTime(e.target.value)}
                    className="text-xs font-bold text-slate-800 bg-transparent border-none focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    checked={onlySchoolDays}
                    onChange={(e) => setOnlySchoolDays(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>僅於上課日發送（週一至週五，排除週末假日）</span>
                </label>
              </div>
              <p className="text-[11px] text-slate-400">
                當教職員於清晨開啟系統或後台常駐時，系統將自動比對時間與當日是否已寄發，無須手動按鈕。
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-600" />
              重要教職員收件名冊 (Important Personnel Email List)
            </label>
            <input
              type="text"
              value={recipientsText}
              onChange={(e) => setRecipientsText(e.target.value)}
              placeholder="例如: principal@mail.gccps.edu.hk, counselor@mail.gccps.edu.hk, social_worker@mail.gccps.edu.hk"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <p className="text-[11px] text-slate-400">
              請輸入接收每日晨報的主管與專業人員信箱（校長、副校長、輔導主任、社工等，多筆請用逗號分開）。
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveSettings}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
            >
              儲存設定並套用
            </button>
          </div>
        </div>
      )}

      {/* Main Content: Current Report View */}
      {currentReport ? (
        <div className="space-y-6">

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">全校平均幸福感</span>
              <div className="text-2xl sm:text-3xl font-black text-indigo-950 mt-1 flex items-baseline gap-1">
                {currentReport.overallSchoolAvgMood}
                <span className="text-xs font-bold text-indigo-500">/ 5.0 分</span>
              </div>
              <span className="text-[10.5px] text-indigo-600 font-semibold mt-1">
                {currentReport.overallSchoolAvgMood >= 4.0 ? '🌟 校園整體心靈高昂陽光' : '需加強 4Rs 調適'}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">今日/近期填報總數</span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 flex items-baseline gap-1">
                {currentReport.totalSubmissions}
                <span className="text-xs font-bold text-slate-400">人次</span>
              </div>
              <span className="text-[10.5px] text-slate-500 font-semibold mt-1">涵蓋 P.1 ~ P.6 跨學制班級</span>
            </div>

            <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                🚨 紅色高危警報
              </span>
              <div className="text-2xl sm:text-3xl font-black text-rose-900 mt-1 flex items-baseline gap-1">
                {currentReport.highRiskCount}
                <span className="text-xs font-bold text-rose-500">位同學</span>
              </div>
              <span className="text-[10.5px] text-rose-600 font-bold mt-1">需晨讀/第一小息前實體介入</span>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
                ⚠️ 連續低分關注
              </span>
              <div className="text-2xl sm:text-3xl font-black text-amber-950 mt-1 flex items-baseline gap-1">
                {currentReport.consecutiveLowCount}
                <span className="text-xs font-bold text-amber-600">位同學</span>
              </div>
              <span className="text-[10.5px] text-amber-700 font-bold mt-1">連續 3 天低落或情緒驟降</span>
            </div>
          </div>

          {/* Gemini AI Executive Summary Box */}
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-indigo-800/60 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                <h3 className="text-sm font-extrabold text-indigo-100 tracking-wide uppercase">
                  Gemini Spark 晨間校園宏觀總評 (Executive Briefing)
                </h3>
              </div>
              <span className="text-[11px] text-indigo-300 font-mono">
                {currentReport.reportDate} • {currentReport.status === 'sent' ? '✅ 已寄發重要主管' : '待寄發'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed font-sans font-medium">
              {currentReport.executiveSummary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                <h4 className="text-xs font-bold text-cyan-300 mb-2 flex items-center gap-1.5">
                  📌 重點觀察指標 (Key Observations)
                </h4>
                <ul className="space-y-1.5 text-[11.5px] text-slate-200">
                  {currentReport.keyObservations.map((obs, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                <h4 className="text-xs font-bold text-emerald-300 mb-2 flex items-center gap-1.5">
                  🛡️ 今日輔導處置行動指引 (Action Items)
                </h4>
                <ul className="space-y-1.5 text-[11.5px] text-slate-200">
                  {currentReport.priorityInterventions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* High-Risk & Consecutive Low Mood Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                今日優先關懷學生清單 ({currentReport.priorityStudents.length} 位同學)
              </h3>
              <span className="text-[11px] text-slate-400 font-semibold">
                依急迫性與連續低落天數智慧排序
              </span>
            </div>

            {currentReport.priorityStudents.length === 0 ? (
              <div className="p-8 text-center text-emerald-700 bg-emerald-50/50 text-xs font-bold">
                🎉 太棒了！今日全校學生填報均無高危字詞，亦無連續 3 天低於 3 分之個案。
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 font-extrabold uppercase text-[10.5px]">
                      <th className="px-4 py-2.5">班級 / 座號</th>
                      <th className="px-4 py-2.5">學生姓名</th>
                      <th className="px-4 py-2.5">風險等級</th>
                      <th className="px-4 py-2.5">心情指數</th>
                      <th className="px-4 py-2.5">觸發原因與留言</th>
                      <th className="px-4 py-2.5">Gemini 輔導建議</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {currentReport.priorityStudents.map((st, idx) => (
                      <tr key={idx} className={`hover:bg-slate-50/80 transition-colors ${st.urgency === 'CRITICAL' ? 'bg-rose-50/30' : ''}`}>
                        <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                          {st.class} 班 ({st.studentNo}號)
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                          {st.chineseName}
                          {st.englishName && <span className="block text-[10px] text-slate-400 font-normal">{st.englishName}</span>}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-md text-[10.5px] font-black ${
                            st.urgency === 'CRITICAL' 
                              ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {st.urgency === 'CRITICAL' ? '🚨 緊急介入' : '⚠️ 持續關注'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-extrabold text-rose-600 text-sm">{st.currentMood}</span>
                          <span className="text-[10px] text-slate-400"> / 5 分</span>
                          {st.recentScores && st.recentScores.length > 1 && (
                            <span className="block text-[10px] text-slate-400 mt-0.5">
                              近期: {st.recentScores.join(' → ')}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-700 max-w-xs">
                          <div className="font-bold text-[11px] text-slate-900">{st.reason}</div>
                          {st.studentComment && (
                            <div className="text-[11px] text-slate-500 italic mt-0.5 bg-white p-1.5 rounded border border-slate-100">
                              「{st.studentComment}」
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-indigo-700 font-semibold text-[11px]">
                          {st.aiSuggestedAction}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Morning Assembly Warm Tip */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Heart className="w-5 h-5" />
            </div>
            <div className="space-y-1 min-w-0">
              <h4 className="text-xs font-black text-amber-900 uppercase tracking-wide">
                💡 今日早會廣播 / 班主任晨光關懷小錦囊 (4Rs & 愛德正向金句)
              </h4>
              <p className="text-xs text-amber-800 font-semibold italic leading-relaxed">
                「{currentReport.morningAssemblyTip}」
              </p>
            </div>
          </div>

          {/* HTML Preview Trigger */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setShowHtmlPreview(!showHtmlPreview)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              {showHtmlPreview ? '隱藏電子郵件 HTML 預覽' : '預覽即將發送的 HTML 晨報郵件'}
            </button>
            <span className="text-[11px] text-slate-400">
              報告識別號: {currentReport.reportId}
            </span>
          </div>

          {/* HTML Preview Box */}
          {showHtmlPreview && (
            <div className="border border-slate-300 rounded-2xl p-4 bg-slate-100 animate-in fade-in duration-200">
              <div className="text-xs font-bold text-slate-600 mb-2">HTML 郵件實際渲染畫面 (即收件人看到之外觀)：</div>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-inner max-h-[500px] overflow-y-auto">
                <iframe
                  title="Daily Report Preview"
                  srcDoc={buildDailyMorningReportHtml(currentReport)}
                  className="w-full h-[480px] border-none"
                />
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Empty State */
        <div className="border-2 border-dashed border-indigo-200 rounded-3xl p-10 text-center space-y-4 bg-indigo-50/20">
          <div className="w-16 h-16 rounded-3xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-black text-slate-900">今日晨報尚未生成</h3>
            <p className="text-xs text-slate-500 font-semibold mt-1 leading-relaxed">
              點擊下方按鈕，由 Gemini Spark 自動調度全校 24 班最新填報數據，即時完成全校宏觀心靈健康評估、提煉高危個案並生成今日早會關愛錦囊。
            </p>
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-indigo-200 inline-flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? '正在分析全校心靈大數據...' : '⚡ 即刻由 Gemini Spark 產生今日晨報'}
          </button>
        </div>
      )}

      {/* Past Reports Archive Drawer */}
      {recentReports.length > 0 && (
        <div className="border-t border-slate-100 pt-6">
          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-3">
            <Calendar className="w-4 h-4 text-slate-400" />
            過往晨報歷史存檔 (Past Briefings Archive)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {recentReports.map((rec) => (
              <button
                key={rec.reportDate}
                onClick={() => setCurrentReport(rec)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  currentReport?.reportDate === rec.reportDate 
                    ? 'border-indigo-500 bg-indigo-50/50 shadow-xs' 
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="text-[11px] font-black text-slate-800">{rec.reportDate}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">均分: {rec.overallSchoolAvgMood || '-'}</div>
                <div className="text-[9.5px] text-rose-600 font-bold mt-0.5">高危: {rec.highRiskCount || 0} 人</div>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};