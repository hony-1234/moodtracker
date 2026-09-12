import React, { useState, useEffect } from 'react';
import { 
  Sparkles, CheckCircle, AlertTriangle, Mail, Bell, 
  Send, RefreshCw, FileText, Settings, ShieldAlert, Users, 
  Key, Clock, Activity, Sliders
} from 'lucide-react';
import { 
  testSparkleAutonomousDispatch, 
  getRecentSparkleDispatches, 
  getSparkleEmailConfig, 
  saveSparkleEmailConfig, 
  SparkleDispatchRecord 
} from '../../../services/sparkleEmailService';
import { GeminiDailyReportPanel } from './GeminiDailyReportPanel';
import { PushNotificationPanel } from './PushNotificationPanel';

interface SparkleAlertCenterProps {
  selectedClass: string;
  reports: any[];
  alertEmails: string;
  setAlertEmails: (emails: string) => void;
  handleSaveAlertSettings: () => Promise<void>;
  currentUser: any;
  cachedAccessToken?: string | null;
  gmailCredentials?: any;
  handleGoogleLogin: () => Promise<void>;
  handleSaveOAuthCredentials?: (clientId: string, clientSecret: string) => Promise<void>;
}

export const SparkleAlertCenter: React.FC<SparkleAlertCenterProps> = ({
  selectedClass,
  reports,
  alertEmails,
  setAlertEmails,
  handleSaveAlertSettings,
  currentUser,
  cachedAccessToken,
  gmailCredentials,
  handleGoogleLogin,
  handleSaveOAuthCredentials
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'EMAIL_ALERTS' | 'MORNING_REPORT' | 'PUSH_NOTIF'>('EMAIL_ALERTS');

  // Sparkle Autonomous Email States
  const [isTestingSparkle, setIsTestingSparkle] = useState(false);
  const [sparkleTestStatus, setSparkleTestStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [recentDispatches, setRecentDispatches] = useState<SparkleDispatchRecord[]>([]);
  const [sparkleWebhookUrl, setSparkleWebhookUrl] = useState('');
  const [showGasGuide, setShowGasGuide] = useState(false);
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Advanced IT Settings
  const [oauthClientId, setOauthClientId] = useState('');
  const [oauthClientSecret, setOauthClientSecret] = useState('');
  const [showOauthSettings, setShowOauthSettings] = useState(false);

  const refreshDispatches = async () => {
    try {
      const records = await getRecentSparkleDispatches(8);
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

  useEffect(() => {
    if (gmailCredentials) {
      setOauthClientId(gmailCredentials.client_id || '');
      setOauthClientSecret(gmailCredentials.client_secret || '');
    }
  }, [gmailCredentials]);

  const handleSaveSparkleWebhook = async () => {
    setIsSavingWebhook(true);
    try {
      await saveSparkleEmailConfig({ webhookUrl: sparkleWebhookUrl.trim() });
      setSparkleTestStatus({
        message: '✅ 發信中繼網址已更新，現在可點擊「測試發送晨報範例」進行實體郵件連通測試！',
        type: 'success'
      });
      alert('✅ Sparkle 雲端發信中繼網址已成功儲存！');
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

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner / Navigation */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-sm">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-black text-slate-800">
                  ✨ Sparkle 智能自動郵件警報中心
                </h2>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  全時自動託管 (免手動登入)
                </span>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] rounded-full font-bold">
                  每日 08:30 上課日自動晨報
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                由 Gemini Sparkle 智能自主接管情緒預警發送工作。當檢測到高危危機、連續低分（僅計上課日）或情緒驟降時，全自動於雲端直發信件。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <button
              onClick={handleTestSparkle}
              disabled={isTestingSparkle}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:from-indigo-800 active:to-purple-800 text-white font-extrabold text-xs rounded-xl transition shadow-sm hover:shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 w-full md:w-auto"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isTestingSparkle ? 'animate-spin' : ''}`} />
              {isTestingSparkle ? '晨報發送中...' : '🧪 測試發送晨報範例'}
            </button>
          </div>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => setActiveSubTab('EMAIL_ALERTS')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'EMAIL_ALERTS'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            自動郵件警報與中繼設定
          </button>
          <button
            onClick={() => setActiveSubTab('MORNING_REPORT')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'MORNING_REPORT'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            每日晨報管理與即時產出
          </button>
          <button
            onClick={() => setActiveSubTab('PUSH_NOTIF')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'PUSH_NOTIF'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            網頁推送通知 (Web Push)
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: Email Alerts & Relay Setup */}
      {activeSubTab === 'EMAIL_ALERTS' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          {/* Channel Live Status Badge */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-500">當前實體發信管道狀態：</span>
            {sparkleWebhookUrl ? (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold rounded-full flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Google Apps Script 雲端自主中繼運作中（100% 免手動登入）
              </span>
            ) : cachedAccessToken ? (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 font-extrabold rounded-full flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                當前 Google 登入連線已就緒（測試信件可即時直發）
              </span>
            ) : (
              <span className="px-3 py-1 bg-amber-100 text-amber-900 font-extrabold rounded-full flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                尚未配置免登入發信中繼（請見下方 1 分鐘 Google Apps Script 教學）
              </span>
            )}
          </div>

          {/* Toast / Status banner for test dispatch */}
          {sparkleTestStatus && (
            <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between ${
              sparkleTestStatus.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs' 
                : 'bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs'
            }`}>
              <div className="flex items-center gap-2">
                {sparkleTestStatus.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                <span className="leading-relaxed">{sparkleTestStatus.message}</span>
              </div>
              <button onClick={() => setSparkleTestStatus(null)} className="text-slate-400 hover:text-slate-600 text-xs ml-3 shrink-0">✕</button>
            </div>
          )}

          {/* Google Apps Script Webhook Relay */}
          <div className="bg-gradient-to-br from-indigo-50/70 to-purple-50/70 rounded-2xl p-5 border border-indigo-100 space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h4 className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                  🚀 Google Apps Script 雲端發信中繼（善導小學專用・100% 免登入全時寄信）
                </h4>
                <p className="text-[11px] text-indigo-700/80 mt-0.5">
                  只要貼上由學校 Google 帳戶建立的 Apps Script 網址，Sparkle 便能 24 小時全自動以校方名義發出真實信件，無需任何教師手動登入！
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGasGuide(!showGasGuide)}
                className="text-[11px] font-extrabold text-indigo-600 hover:text-indigo-800 underline cursor-pointer shrink-0"
              >
                {showGasGuide ? '▲ 收合 1 分鐘設定教學' : '📖 展開 1 分鐘設定教學與腳本'}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                value={sparkleWebhookUrl}
                onChange={(e) => setSparkleWebhookUrl(e.target.value)}
                placeholder="貼上以 https://script.google.com/macros/s/.../exec 結尾的網址"
                className="flex-1 px-4 py-2 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-xs font-mono text-slate-800"
              />
              <button
                onClick={handleSaveSparkleWebhook}
                disabled={isSavingWebhook}
                className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {isSavingWebhook ? '儲存中...' : '💾 儲存中繼網址'}
              </button>
            </div>

            {sparkleWebhookUrl.includes('/a/macros/') && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed font-semibold">
                ⚠️ <strong>偵測到組織限定網址（包含 /a/macros/）</strong>：
                這代表此腳本目前的存取權限設為了「善導小學網域內」，外部自動請求會被 Google 攔截（返回 401 抱歉現時無法開啟該檔案）。<br/>
                👉 <strong>快速修正</strong>：請在 Google Apps Script 點擊「部署」➔「管理部署作業」➔ 點擊鉛筆圖示，將「誰可以存取 (Who has access)」改為「<strong>所有人 (Anyone)</strong>」，儲存後複製產生不帶 <code>/a/macros/</code> 的新網址貼回即可！
              </div>
            )}

            {/* Step-by-Step GAS Guide */}
            {showGasGuide && (
              <div className="mt-4 p-4 bg-white/90 rounded-xl border border-indigo-200/80 space-y-3 text-xs text-slate-700 leading-relaxed shadow-2xs">
                <div className="font-extrabold text-indigo-950 flex items-center justify-between">
                  <span>📌 1 分鐘部署教學（僅需操作一次，永久免登入自動發信）：</span>
                  <button
                    onClick={handleCopyGasScript}
                    className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold border border-indigo-200 transition cursor-pointer flex items-center gap-1"
                  >
                    {copySuccess ? '✅ 已複製代碼！' : '📋 複製 5 行腳本代碼'}
                  </button>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-600 font-medium">
                  <li>以學校專用 Google 帳戶前往 <a href="https://script.google.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold underline">script.google.com</a>，點擊左上角「<strong>新專案</strong>」。</li>
                  <li>清空原本內容，點擊上方按鈕複製代碼並貼入編輯器中，按 <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px]">Ctrl + S</kbd> 儲存。</li>
                  <li>點擊右上角「<strong>部署</strong>」&gt;「<strong>新部署</strong>」：
                    <ul className="list-disc list-inside pl-4 mt-0.5 space-y-0.5 text-slate-500">
                      <li>齒輪圖示選擇「<strong>網頁應用程式 (Web App)</strong>」</li>
                      <li>「執行為 (Execute as)」選擇「<strong>我 (Me)</strong>」</li>
                      <li>「誰可以存取 (Who has access)」選擇「<strong>所有人 (Anyone)</strong>」</li>
                    </ul>
                  </li>
                  <li>點擊「<strong>部署</strong>」，授予 Google 發信權限後複製「<strong>網頁應用程式網址</strong>」，貼回上方輸入框並點擊「儲存中繼網址」即可！</li>
                </ol>
              </div>
            )}
          </div>

          {/* Email Receiver List */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                📬 警報與每日晨報收件名單
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">支援多個信箱，半形逗號分隔</span>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
              <input
                type="text"
                value={alertEmails}
                onChange={(e) => setAlertEmails(e.target.value)}
                placeholder="例如: principal@gccps.edu.hk, counselor@gccps.edu.hk"
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 text-xs font-bold text-slate-800"
              />
              <button
                onClick={handleSaveAlertSettings}
                className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer whitespace-nowrap"
              >
                💾 更新名單
              </button>
            </div>
          </div>

          {/* Recent Sparkle Autonomous Dispatches */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                📜 Sparkle 最近自主派送記錄
              </h4>
              <button
                onClick={refreshDispatches}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
              >
                🔄 重新整理記錄
              </button>
            </div>

            {recentDispatches.length === 0 ? (
              <div className="text-center py-5 bg-slate-50/60 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs font-medium">
                目前尚無警報派發記錄。當學生提交低分情緒或上課日 08:30 晨報產出時，Sparkle 會在此自動留下遞送憑證。
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-3.5 py-2">時間</th>
                      <th className="px-3.5 py-2">警報類型</th>
                      <th className="px-3.5 py-2">收件人</th>
                      <th className="px-3.5 py-2">發送通道</th>
                      <th className="px-3.5 py-2">狀態</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {recentDispatches.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50/80 transition">
                        <td className="px-3.5 py-2 text-slate-500 whitespace-nowrap font-mono text-[11px]">{r.timestamp}</td>
                        <td className="px-3.5 py-2 font-bold text-slate-800">
                          {r.alertType === 'CRITICAL_NLP' ? '🚨 危機言論' :
                           r.alertType === 'CONSECUTIVE_LOW' ? '📉 連續低分' :
                           r.alertType === 'MORNING_REPORT' ? '🌅 每日晨報' :
                           r.alertType === 'TEST' ? '🧪 測試發信' : r.alertType}
                        </td>
                        <td className="px-3.5 py-2 text-slate-600 text-[11px] truncate max-w-xs">{r.to.join(', ')}</td>
                        <td className="px-3.5 py-2 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                            {r.channel === 'SPARKLE_RELAY' ? '✨ Sparkle 雲端' :
                             r.channel === 'GMAIL_SILENT' ? '📬 Google 背景' :
                             r.channel === 'CLOUD_WEBHOOK' ? '🌐 Webhook' : r.channel}
                          </span>
                        </td>
                        <td className="px-3.5 py-2 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            r.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {r.status === 'DELIVERED' ? '已送達' : '未送達'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Advanced IT Settings */}
          <div className="border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => setShowOauthSettings(!showOauthSettings)}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer"
            >
              <span>{showOauthSettings ? '▲ 隱藏 IT 進階串接設定' : '▼ 展開 IT 進階串接設定 (自訂 Webhook / 備用金鑰)'}</span>
            </button>

            {showOauthSettings && (
              <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <p className="text-[11px] text-slate-500">
                  一般情況下 Sparkle 已全自動為您在背景處理所有警報發送，無需填寫此處。若學校有專屬之自訂 Webhook 伺服器，可在下方配置。
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-600 block">Google OAuth Client ID (可選備用)</label>
                    <input
                      type="text"
                      value={oauthClientId}
                      onChange={(e) => setOauthClientId(e.target.value)}
                      placeholder="貼上 Client ID (可選)"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-600 block">Google OAuth Client Secret (可選備用)</label>
                    <input
                      type="password"
                      value={oauthClientSecret}
                      onChange={(e) => setOauthClientSecret(e.target.value)}
                      placeholder="貼上 Client Secret (可選)"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-start items-center">
                  <button
                    onClick={() => handleSaveOAuthCredentials?.(oauthClientId, oauthClientSecret)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    💾 儲存備用設定
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Gemini Daily Morning Report Panel */}
      {activeSubTab === 'MORNING_REPORT' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <GeminiDailyReportPanel
            reports={reports}
            gmailCredentials={gmailCredentials}
            cachedAccessToken={cachedAccessToken}
          />
        </div>
      )}

      {/* Sub-Tab 3: Browser Push Notifications Panel */}
      {activeSubTab === 'PUSH_NOTIF' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <PushNotificationPanel
            currentUser={currentUser}
            selectedClass={selectedClass}
          />
        </div>
      )}
    </div>
  );
};
