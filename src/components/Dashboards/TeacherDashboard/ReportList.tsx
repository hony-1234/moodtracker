import React from 'react';
import { Shield, Search, AlertCircle, CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import { getWarningLevel, getWarningWeight } from '../../../utils/sensitivityEngine';
import { getMoodColor, MOOD_EMOJIS } from '../../../constants/moodConstants';
import { getDisplayDate } from '../../../utils/dateHelpers';

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
  studentEmail?: string;
  email?: string;
  studentName?: string;
}

interface ReportListProps {
  selectedClass: string;
  activeTab?: string;
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
  hasPermissionError?: boolean;
}

export const ReportList: React.FC<ReportListProps> = ({
  selectedClass,
  activeTab,
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
  hasPermissionError,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start font-sans">
      
      {/* LEFT CONSOLE - SIDE LIST FILTER & STUDENT LIST */}
      <div className="md:col-span-1 space-y-4 font-sans">
        
        {/* SEARCH PINPOINT */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">精準篩選</h4>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="search"
              placeholder="搜尋學生學號..."
              className="w-full h-11 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-200 text-xs font-bold text-slate-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* CHOOSE REGISTERED DATES */}
        {(selectedClass !== 'GCCPS' || activeTab === 'ALL_COMMENTS') && (
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">登記日期篩選</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {uniqueDates.map(d => {
                const isSel = selectedDate === d;
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDate(d)}
                    className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      isSel ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TODAY'S UNSUBMITTED STUDENTS FOR CLASS */}
        {selectedClass !== 'GCCPS' && (
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
            <h4 className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              今日尚未登分學生 (快速追蹤)
            </h4>
            {(() => {
              const missingStudents = missingStudentsToday;

              if (missingStudents.length === 0) {
                return (
                  <div className="bg-emerald-50 text-emerald-700 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    太棒了！全班今日已全數完成登錄。
                  </div>
                );
              }

              return (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {missingStudents.map(num => (
                    <span key={num} className="bg-rose-50 border border-rose-200 text-rose-700 font-extrabold text-[11px] px-2.5 py-1 rounded-lg">
                      {num} 號
                    </span>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* ACTIVE STUDENT DIRECTORY BRIEF */}
        {selectedClass !== 'GCCPS' && (
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">
              全班學生通訊名單 ({studentDirectoryList.length} 人)
            </h4>
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {studentDirectoryList.map(st => (
                <button
                  key={st.studentNo}
                  onClick={() => setDetailStudentId(detailStudentId === st.studentNo ? null : st.studentNo)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
                    detailStudentId === st.studentNo 
                      ? 'bg-slate-100 border-slate-300' 
                      : 'bg-white border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <p className="text-xs font-black text-slate-800">{st.studentNo} 號 同學</p>
                    <p className="text-[10px] text-slate-400">總體心情提交共 {st.totalEntries} 次</p>
                  </div>
                  <span 
                    style={{ backgroundColor: getMoodColor(st.avgScore) }}
                    className="text-white text-[10px] font-black px-2 py-0.5 rounded"
                  >
                    均 {st.avgScore}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* RIGHT CONSOLE - CARD PRESENTATION */}
      <div className="md:col-span-3 space-y-4 font-sans">
        {/* Detailed Student Timeline overlay container if chosen */}
        {detailStudentId && (
          <div className="bg-[#EEF2F6] border-2 border-slate-300 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-slate-800">📊 學號 {detailStudentId} 同學的詳細歷史心軌</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">顯示本班級中該學生的所有登記日程與備註記錄</p>
              </div>
              <button
                onClick={() => setDetailStudentId(null)}
                className="bg-white hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm cursor-pointer"
              >
                關閉詳情
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {detailStudentReports.map(h => {
                const commentText = h.comment || h.有事情想向老師分享 || "";
                const wL = getWarningLevel(commentText);
                const scr = parseInt(String(h.moodScore || h.心情指數 || "5"));
                return (
                  <div key={h.id} className="bg-white p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-black bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {getDisplayDate(h)}
                      </span>
                      <span 
                        style={{ color: getMoodColor(scr) }}
                        className="text-xs font-black"
                      >
                        心情：{scr} / 10
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 italic">
                      「{commentText || "今日無填寫留言內容。"}」
                    </p>
                    {wL !== 'none' && (
                      <span className="block mt-2 text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full w-max">
                        系統標記預警 [{wL.toUpperCase()}]
                      </span>
                    )}
                    {h.actionTaken && (
                      <div className="mt-2 text-[10px] bg-slate-50 p-2 rounded-lg text-slate-500 font-bold">
                        跟進作法：{h.actionTaken}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mood Reports Matrix */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-sm font-black text-[#0F172A] tracking-wider uppercase">
              {selectedClass === 'GCCPS' ? (activeTab === 'ALL_COMMENTS' ? '💬 全校學生心情留言一覽' : '🚨 嚴重預警事件一覽') : '📋 登記心情清單面板'}
            </h4>
            <span className="text-xs font-extrabold text-[#64748B] bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
              目前符合搜尋數據：{filteredData.length} 筆
            </span>
          </div>

          <div className="space-y-4">
            {filteredData.map(item => {
              const score = parseInt(String(item.moodScore || item.心情指數 || "5"));
              const commentText = item.comment || item.有事情想向老師分享 || "";
              const warningLevel = getWarningLevel(commentText);
              const isResolved = item.status === "Resolved";

              // Decide warning visuals
              let warningBadge = null;
              let cardBackground = "bg-white border-slate-200";

              if (!isResolved) {
                if (warningLevel === 'red') {
                  warningBadge = <span className="bg-red-100 text-red-700 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> 嚴重安全隱患警告</span>;
                  cardBackground = "bg-red-50/50 border-red-300";
                } else if (warningLevel === 'yellow') {
                  warningBadge = <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> 疑似不當言論</span>;
                  cardBackground = "bg-amber-50/50 border-amber-300";
                } else if (warningLevel === 'green') {
                  warningBadge = <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1"><Activity className="w-3.5 h-3.5" /> 輕微壓力警示</span>;
                  cardBackground = "bg-emerald-50/50 border-emerald-300";
                }
              }

              return (
                <div 
                  key={item.id}
                  className={`p-5 border-2 rounded-2xl transition-all shadow-sm flex flex-col justify-between ${cardBackground} ${
                    isResolved ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 mb-3 border-b border-dashed border-slate-200">
                    <div>
                      <span className="text-sm font-black text-[#0F172A]">
                        學號：{item.studentNumber || item.學號 || "未知"} 號同學
                        {selectedClass === 'GCCPS' && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full ml-1 font-extrabold">{item.class || item.班別 || "未知"} 班</span>}
                      </span>
                      {(item.studentEmail || item.email) && (
                        <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md ml-1.5 font-mono font-bold inline-flex items-center gap-1" title="學生 Gmail 帳號">
                          📧 {item.studentEmail || item.email}
                        </span>
                      )}
                      <span className="text-xs text-slate-400 font-semibold ml-2 inline-flex items-center gap-1">
                        日期：{getDisplayDate(item)}
                        {item.ipAddress && (
                          <span className="ml-1 px-1.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-500 font-mono tracking-tighter" title="發送來源 IP 位置">
                            IP: {item.ipAddress}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {warningBadge}
                      <span 
                        style={{ backgroundColor: getMoodColor(score) + '22', borderColor: getMoodColor(score), color: getMoodColor(score) }}
                        className="border font-black text-xs px-2.5 py-1 rounded-lg"
                      >
                        得分 {score} / 10
                      </span>
                    </div>
                  </div>

                  <p className="text-sm font-bold text-slate-700 mb-3 leading-relaxed">
                    {commentText ? `「${commentText}」` : <span className="text-slate-400 italic font-medium">該學生今天沒有留下留言。</span>}
                  </p>

                  <div className="bg-slate-50 p-4 rounded-xl flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                    {isResolved ? (
                      <div className="space-y-1">
                        <p className="text-xs font-black text-emerald-700 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          已完成評估與干預處置 (由 {item.resolvedBy || "教師團隊"})
                        </p>
                        {item.actionTaken && (
                          <p className="text-xs font-bold text-slate-600 mt-1">
                            處置方式：{item.actionTaken}
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        <span className="text-xs text-[#64748B] font-semibold">
                          {warningLevel !== 'none' ? '🚨 該案件正在等待教師填寫輔導細節。' : '✅ 正常提交，目前無文字警報。'}
                        </span>
                        {warningLevel !== 'none' && (
                          <button
                            onClick={() => {
                              setActiveReportId(item.id);
                              setActionText('');
                              setActionModalVisible(true);
                            }}
                            className="bg-red-600 hover:bg-rose-700 text-white font-black text-xs px-4 py-2 rounded-xl h-9 cursor-pointer transition-all"
                          >
                            填寫約談/處理進展
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredData.length === 0 && (
              hasPermissionError ? (
                <div className="bg-amber-50/50 border-2 border-amber-250 rounded-2xl p-6 text-center space-y-4 max-w-xl mx-auto font-sans shadow-xs mt-4">
                  <div className="mx-auto w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 animate-pulse">
                    <Shield className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-black text-amber-900">🔒 學生心情報告安全驗證</h4>
                  <p className="text-xs text-amber-700 leading-relaxed font-semibold">
                    為了落實《個人資料（私隱）條例》 (PDPO) 並完整保護學生的留言與個人隱私安全，系統限制未經安全授權的終端機查詢。
                  </p>
                  {selectedClass === 'GCCPS' ? (
                    <>
                      <p className="text-xs text-amber-700 leading-relaxed font-semibold">
                        當前瀏覽器尚未與您的學校 Google 帳戶完成安全身份繫結。
                      </p>
                      <div className="bg-white/80 p-4 rounded-xl border border-amber-200 shadow-3xs text-left">
                        <p className="text-xs text-amber-800 font-extrabold flex items-center gap-1.5 justify-center">
                          💡 如何解鎖：
                        </p>
                        <p className="text-[11.5px] text-slate-600 font-semibold mt-1.5 leading-relaxed text-center">
                          請點擊本頁面上方的 <strong className="text-amber-800 font-black">「🔑 啟用/刷新 Google 授權」</strong> 按鈕，使用您的學校 Google 帳戶登入，即可安全地為您加載此班級的所有留言內容與分析。
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-amber-700 leading-relaxed font-semibold">
                        系統檢測到權限異常，無法加載該班級的心情報告。請聯繫技術支援人員或安全中心管理員進行權限檢查。
                      </p>
                      <div className="bg-white/80 p-4 rounded-xl border border-amber-200 shadow-3xs text-left">
                        <p className="text-xs text-amber-800 font-extrabold flex items-center gap-1.5 justify-center">
                          💡 建議操作：
                        </p>
                        <p className="text-[11.5px] text-slate-600 font-semibold mt-1.5 leading-relaxed text-center">
                          請與系統管理員聯繫，確認班級帳戶權限是否正確配置。普通用戶無需且不應進行 Google 帳戶登入。
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <span className="text-4xl text-slate-200 block mb-4">📂</span>
                  <p className="text-slate-400 font-extrabold text-sm tracking-wider">今日目前無任何學生留言或警示報告！安全極速前行中。</p>
                </div>
              )
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
