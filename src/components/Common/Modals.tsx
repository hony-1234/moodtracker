import React, { FormEvent } from 'react';
import { Shield, Sliders, HelpCircle } from 'lucide-react';
import { MOOD_EMOJIS, getMoodColor } from '../../constants/moodConstants';

// --- 1. ACTION MODAL (RECONCILE POPUP ACTION LOG MODAL) ---
interface ActionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  actionText: string;
  setActionText: (text: string) => void;
  loading: boolean;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  visible,
  onClose,
  onSubmit,
  actionText,
  setActionText,
  loading,
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-100 shadow-2xl rounded-2xl max-w-lg w-full p-6 space-y-4">
        <div>
          <h3 className="text-lg font-black text-slate-900">記錄跟進處理詳情</h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">請填寫您對於該名學生情緒警示的具體處置作法、會談成果或介入方式：</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <textarea
            placeholder="例如：已安排今天午休安排面談、已協助社工約談，家長亦完全知悉並承诺跟進..."
            className="w-full min-h-[120px] p-3 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-100 text-xs text-slate-700 font-bold"
            value={actionText}
            onChange={(e) => setActionText(e.target.value)}
            autoFocus
            required
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-rose-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              {loading ? "處理中..." : "錄入處置並解除警報"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- 2. PRIVACY POLICY MODAL ---
interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ visible, onClose }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" id="privacy-policy-modal">
      <div className="bg-white border border-slate-100 shadow-2xl rounded-3xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-5 text-white flex justify-between items-center flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-emerald-100" />
            <h3 className="text-base font-black tracking-tight">校園學童個人資料保護與隱私政策</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all text-xs font-bold cursor-pointer"
          >
            ✕ 關閉
          </button>
        </div>

        {/* Modal Content - Scrollable for iPad/Mobile support */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-xs md:text-[13px] leading-relaxed select-text font-medium">
          <div className="border-l-4 border-emerald-500 bg-emerald-50/50 p-3.5 rounded-r-xl">
            <p className="font-bold text-emerald-800">
              為確保天主教善導小學校園輔導之資訊安全與法律合規，平台在架構設計上嚴格遵守香港《個人資料（私隱）條例》（PDPO）核心原則。本平台所載之操作，均旨在以最大程度保障心理健康、防範重度情緒風險同時保護學童私隱。
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5 text-sm mb-1">
                <span className="text-emerald-600">一、</span> 數據收集與去識別化原則
              </h4>
              <p className="text-slate-600">
                本平台僅收集學生之班級、學號（P.4-P.6）及每日心情指數、文字悄悄話留言，旨在提供即時心理危機輔導預警。
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-500 text-xs font-semibold">
                <li><strong>去識別化設計：</strong>數據庫內完全不儲存學生的物理姓名、出生日期或身份證明號碼。僅通過班級與學號進行關聯。</li>
                <li><strong>初小安全代錄碼：</strong>小一至小三學童之心情點數均由教師在學生通道批量代錄，此過程中完全不提交任何學童文字留言，保障年幼學童私隱。</li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5 text-sm mb-1">
                <span className="text-emerald-600">二、</span> 雲端儲存與資訊保安架構
              </h4>
              <p className="text-slate-600">
                所有心情數據與留言直接同步儲存於 Google Cloud Firestore 安全伺服器。
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-500 text-xs font-semibold">
                <li><strong>全程傳輸加密：</strong>數據庫聯機通道使用嚴格的 SSL/TLS 高強度安全加密協定，屏蔽一切外部嗅探。</li>
                <li><strong>安全密碼保護：</strong>高年級（P.4-P.6）除通用的班級密碼外，教師可在管理中心獨立設定與隨機配置「學生個人個別專屬登入密碼」，防止班級內其他學童惡意代登或窥探心情日誌。</li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5 text-sm mb-1">
                <span className="text-emerald-600">三、</span> 資料合理保留期限與安全銷毀
              </h4>
              <p className="text-slate-600">
                我們尊重學童的「被遺忘權」，並實施對應的安全保留週期限制：
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-500 text-xs font-semibold">
                <li>本系統之數據僅於當前學年內保留，以便進行學期末心理健康分析。</li>
                <li>在暑期新舊年級交替接盤前，平台管理者將會同導師配合一鍵安全擦除全校的歷史日誌，做不可逆的銷毀處置。</li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5 text-sm mb-1">
                <span className="text-emerald-600">四、</span> 導師安全權力查閱與稽核
              </h4>
              <p className="text-slate-600">
                系統後台嚴格限定各班導師只能過濾、檢視其專屬班別之學生日誌，完全隔離跨班級越權查看。
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-500 text-xs font-semibold">
                <li>所有教師及管理者的登入行為均由系統自動儲存至一鍵不可人為修改的「安全稽核日誌」模組中。</li>
                <li>每次登入均有記錄其設備資訊（Device Agent）與即時連線時間，確保無非授權的後門存取。</li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5 text-sm mb-1">
                <span className="text-emerald-600">五、</span> 家長與用戶專屬合法權益
              </h4>
              <p className="text-slate-600">
                依據《個人資料（私隱）條例》，家長擁有代表學童提出資料查詢、更正或安全清除之法權。
              </p>
              <p className="text-slate-500 text-xs mt-1 font-semibold">
                如家長希望查詢、修改、或個別要求立刻、永久擦除其孩子在系統中存放的任何心情字眼，請聯絡天主教善導小學專責輔導老師，我們將會指派平台系統管理人員在24小時內完成安全的物理數據抹除。
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-t border-slate-100 flex-shrink-0 font-sans">
          <span className="text-[10px] text-slate-400 font-bold">版本歷史規格: v2.4 (2026/05 更新)</span>
          <button
            type="button"
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-black shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-100 cursor-pointer"
          >
            我已閱讀並完全同意
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 3. TODAY'S UPDATE SUMMARY MODAL (GCCPS) ---
interface TodayReportsByClassSummaryItem {
  cls: string;
  count: number;
  avg: number | null;
  missing: number[];
}

interface UpdateSummaryModalProps {
  visible: boolean;
  onClose: () => void;
  todayStr: string;
  todayReportsByClassSummary: TodayReportsByClassSummaryItem[];
}

export const UpdateSummaryModal: React.FC<UpdateSummaryModalProps> = ({
  visible,
  onClose,
  todayStr,
  todayReportsByClassSummary,
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-100 shadow-2xl rounded-3xl max-w-3xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-5 text-white flex justify-between items-center flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-emerald-100" />
            <h3 className="text-base font-black tracking-tight font-sans">📊 今日全校各班級心情登記進度與統計摘要</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all text-xs font-bold cursor-pointer"
          >
            ✕ 關閉
          </button>
        </div>

        {/* Modal Content - Scrollable Table */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between text-xs font-bold text-slate-700">
            <span>今日日期：{todayStr}</span>
            <span>系統狀態：實時連線（Google Firestore 雲端同步中）</span>
          </div>

          <div className="border border-slate-150 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-extrabold">
                  <th className="px-4 py-3 font-sans">班級名稱</th>
                  <th className="px-4 py-3 font-sans">登記進度與狀態</th>
                  <th className="px-4 py-3 text-center font-sans">今日已填報人數</th>
                  <th className="px-4 py-3 text-left font-sans text-xs">缺交座號</th>
                  <th className="px-4 py-3 text-center font-sans">今日平均情緒分值</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {todayReportsByClassSummary.map(({ cls, count, avg, missing }) => (
                  <tr key={cls} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-black text-slate-800">{cls} 班</td>
                    <td className="px-4 py-3">
                      {count > 0 ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                          ● 已同步登記
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                          ○ 尚未登分更新
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-700">
                      {count} 位學童
                    </td>
                    <td className="px-4 py-3 text-left font-bold text-xs text-rose-500">
                      {missing && missing.length > 0 ? missing.join(", ") : <span className="text-emerald-500">全勤</span>}
                    </td>
                    <td className="px-4 py-3 text-center font-bold">
                      {avg !== null ? (
                        <span 
                          style={{ color: getMoodColor(avg) }}
                          className="font-extrabold"
                        >
                          {avg} 分 ({MOOD_EMOJIS[Math.round(avg)]?.emoji} {MOOD_EMOJIS[Math.round(avg)]?.desc.split(' / ')[0]})
                        </span>
                      ) : (
                        <span className="text-slate-400 italic font-semibold">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-100 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer font-sans"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 4. SYSTEM HOW TO USE GUIDE MODAL ---
interface SystemGuideModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SystemGuideModal: React.FC<SystemGuideModalProps> = ({ visible, onClose }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-100 shadow-2xl rounded-3xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-5 text-white flex justify-between items-center flex-shrink-0">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-amber-100" />
            <h3 className="text-base font-black tracking-tight font-sans">💡 「心情加油站 • 校園版」系統使用指南</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all text-xs font-bold cursor-pointer font-sans"
          >
            ✕ 關閉
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-xs md:text-[13px] leading-relaxed font-semibold font-sans">
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-amber-900 font-bold">
            歡迎使用天主教善導小學「心情加油站」心理健康管理平台。本系統致力於保障學生心聲得到及時且安全的傾聽與對話。以下為各校方、學生、與導師角色的完整操作說明。
          </div>

          <div className="space-y-4">
            {/* Section 1 */}
            <div className="border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-xs md:text-sm flex items-center gap-1.5 text-amber-600 mb-1">
                <span>1.</span> 🎒 學生每日心情登記 (小四至小六適用)
              </h4>
              <p className="text-slate-600 font-medium">
                中高年級同學可以自主查閱及登錄情緒，步驟如下：
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-500 text-xs font-semibold">
                <li><strong>第一步：</strong>在系統登入首頁，選擇「🎒 進入學生個人情緒登記通道」。</li>
                <li><strong>第二步：</strong>下拉選單選擇您的「班別」（如 4A、5C），並輸入您班級的「密鑰」登入。</li>
                <li><strong>第三步：</strong>輸入您在班級的「座號」（座號範圍 1 - 35 或 TEST 測試）。</li>
                <li><strong>第四步：</strong>設定您今天的心情分值：提供 1 至 10 的刻度（1為極度難過，10為完美愉快）。</li>
                <li><strong>第五步：</strong>在悄悄話留言框內，向導師傾訴您的心聲（該段內容僅有您的專任班導師能看見）。</li>
                <li><strong>完成：</strong>點擊「安全儲存並登出」，分數與隱私留言即可極速上傳至雲端。</li>
              </ul>
            </div>

            {/* Section 2 */}
            <div className="border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-xs md:text-sm flex items-center gap-1.5 text-amber-600 mb-1">
                <span>2.</span> 🎒 小一至小三學童 (由導師代錄代填)
              </h4>
              <p className="text-slate-600 font-medium">
                初小年級學童不具備寫字或操作能力，因此系統免除了他們的打字操作：
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-500 text-xs font-semibold">
                <li>初小班級（1A 至 3D）的心情點數由其「班導師」每天於代錄面板中批量代為填入。</li>
                <li>代錄過程不儲存任何文字悄悄話，數據純粹、完全合規，全程保障年幼學童私隱。</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-xs md:text-sm flex items-center gap-1.5 text-amber-600 mb-1">
                <span>3.</span> 🏫 班主任與導師日常控制端 (教師權限)
              </h4>
              <p className="text-slate-600 font-medium">
                導師可以安全查看今日班級登記、或進行初小代錄：
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-500 text-xs font-semibold">
                <li><strong>代錄：</strong>若登入 1A 至 3D，系統將自動開啟 35 個座號的多按鈕交互矩陣。導師只需詢問小朋友心情（1-10分），在對應座號點擊分值，最後點擊「💾 儲存並同步今日全班分數」即可極速本地存檔並傳送到雲端！</li>
                <li><strong>分析與警報：</strong>查看連續 3 天低於 3 分的預警、精準過濾留言，錄下跟進處理細節並在系統標記。</li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-xs md:text-sm flex items-center gap-1.5 text-amber-600 mb-1">
                <span>4.</span> 🛡️ 全校安全監控及班級登分追蹤 (全校安全官)
              </h4>
              <p className="text-slate-600 font-medium">
                利用 <strong>GCCPS 全校安全監控中心</strong>，學校高管、社工或校長能獲取最高全局維度：
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-500 text-xs font-semibold">
                <li><strong>登分追蹤：</strong>即時定位 today 哪些班級尚未填報任何心情點數，以便提示對應班級導師。</li>
                <li><strong>進度綜合彙報：</strong>一鍵點開進度總表，橫向排比 24 個班級的今日登錄人數與全校各班平均心情分。</li>
                <li><strong>敏感言論：</strong>標紅亮燈所有可能包含自殘、霸凌或敏感意識言論的條目，保障全校安全一鍵可控。</li>
              </ul>
            </div>

            {/* Section 5 */}
            <div className="pb-1">
              <h4 className="font-extrabold text-slate-900 text-xs md:text-sm flex items-center gap-1.5 text-amber-600 mb-1">
                <span>5.</span> 🌱 學生專屬「4Rs 心靈充電站」 (心理健康素養)
              </h4>
              <p className="text-slate-600 font-medium">
                配合教育局「4Rs 精神健康約章」，本平台為登記後的學童提供專屬互動調適工具：
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-500 text-xs font-semibold">
                <li><strong>Rest (休息)：</strong>宣導良好的 9-11 小時睡眠作息及建立睡前無螢幕放鬆儀式。</li>
                <li><strong>Relaxation (放鬆)：</strong>提供互動計時「深呼吸放鬆教練」，配合動態縮放圓圈、波紋動畫引導深度減壓。</li>
                <li><strong>Relationship (關係)：</strong>引導日常「小微笑與感恩任務」，建立孩子、同儕、家庭與導師間的正向關懷網。</li>
                <li><strong>Resilience (抗逆)：</strong>設計「正向思維翻翻卡」，模擬學業或社交挫折，點擊卡片 3D 旋轉後即可獲得輔導關懷的建設性重構視角。</li>
                <li><strong>智能偵測：</strong>當心情登記為 4 分或以下，系統會在提交後自動解鎖並展開充電站，給予孩子即時的心靈支持。</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-100 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer font-sans"
          >
            我已了解，開始操作
          </button>
        </div>
      </div>
    </div>
  );
};
