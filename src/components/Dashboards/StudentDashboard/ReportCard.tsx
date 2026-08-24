import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { MOOD_EMOJIS, getMoodColor } from '../../../constants/moodConstants';
import { getUnixTime, getDisplayDate } from '../../../utils/dateHelpers';

interface ReportCardProps {
  reports: any[];
  selectedClass: string;
  activeStudentNumber: string | number;
  showStudentReport: boolean;
  setShowStudentReport: (s: boolean) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  reports,
  selectedClass,
  activeStudentNumber,
  showStudentReport,
  setShowStudentReport,
}) => {
  return (
    <div className="mt-8 pt-6 border-t border-slate-100 text-left font-sans">
      <div className="flex justify-center mb-6">
        <button
          type="button"
          onClick={() => setShowStudentReport(!showStudentReport)}
          className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-6 py-3 rounded-xl font-bold text-sm tracking-wide transition-all shadow-3xs cursor-pointer"
        >
          {showStudentReport ? "🙈 隱藏我的個人心情成長報告" : "📊 查看個人情緒成長報告 & 心聲回顧"}
        </button>
      </div>

      {showStudentReport && (() => {
        const last30Entries = reports
          .filter((r: any) => {
            const rClass = (r.class || r.班別 || '').toUpperCase();
            const rStudentNo = String(r.studentNumber || r.學號 || '');
            const rDate = getUnixTime(r);
            return rClass === selectedClass.toUpperCase() && 
                   rStudentNo === String(activeStudentNumber) &&
                   rDate >= Date.now() - 30 * 24 * 60 * 60 * 1000;
          })
          .sort((a: any, b: any) => getUnixTime(a) - getUnixTime(b));

        const studentComments = last30Entries
          .map((r: any) => ({
            date: getDisplayDate(r),
            comment: String(r.comment || r.有事情想向老師分享 || '').trim(),
            mood: parseInt(r.moodScore || r.心情指數 || '5')
          }))
          .filter(item => item.comment !== '');

        // Calculate average mood
        let avgMood = 0;
        const validLast30 = last30Entries.map((r: any) => {
          const val = r.moodScore || r.心情指數;
          return val === 'N/A' ? null : parseInt(val);
        }).filter((v): v is number => v !== null && !isNaN(v));
        if (validLast30.length > 0) {
          const sum = validLast30.reduce((acc, score) => acc + score, 0);
          avgMood = parseFloat((sum / validLast30.length).toFixed(1));
        }

        return (
          <div className="space-y-6">
            {/* 1. Supportive Comments section */}
            <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-5">
              <h4 className="text-sm font-black text-amber-800 mb-2">💡 溫馨心情絮語</h4>
              <p className="text-xs text-amber-700 leading-relaxed font-semibold">
                {last30Entries.length >= 3 ? (
                  <span>🍎 <b>「做的很好，你已經持續記錄一致的心情！」</b> 一點一滴記下自己的感受是照顧心靈的最佳方式。有些情緒可能微風細雨，有些則狂風暴雨。請記得：每種心情都是合理的，你永遠值得溫柔以待！</span>
                ) : (
                  <span>✨ 感謝你今天的記錄！寫下真實的感受是自我關懷最美好的起步。不管世界如何喧囂，這裡永遠都是你傾訴心聲的安靜港灣。放慢腳步，每一天你都在成長！</span>
                )}
              </p>
              {avgMood > 0 && (
                <div className="mt-3 text-xs font-bold text-amber-800">
                  🏫 最近 7 次登記平均心情高達：<span className="text-emerald-300 bg-emerald-950 px-1.5 py-0.5 rounded font-black">{avgMood} 分</span> (滿分 10 分) 
                  {avgMood >= 6 && " —— 近日心情明媚開朗，繼續保持這份正能量哦！"}
                  {avgMood < 6 && avgMood >= 4 && " —— 內心好像有一點微風掠過，適時做做深呼吸放鬆一下吧。"}
                  {avgMood < 4 && " —— 近期感到有點沉重嗎？老師和社工随時在，我們特別想聽聽你的心聲。"}
                </div>
              )}
            </div>

            {/* 2. 7-Day Trend Visual representation */}
            <div>
              <h4 className="text-sm font-black text-slate-700 mb-2 flex items-center justify-between">
                <span>📈 心情指數走勢 (最近 30 天)</span>
                <span className="text-[10px] text-slate-400 font-semibold font-sans">歷史登記波形</span>
              </h4>
              {last30Entries.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-xl text-xs text-slate-400 font-medium font-semibold font-sans">
                  暫無近 30 日歷史心情紀錄，再次登錄填發後開始累積！
                </div>
              ) : (
                <div className="h-48 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={last30Entries.map((e: any) => ({
                      date: getDisplayDate(e).split('/').slice(1).join('/'),
                      mood: parseInt(e.moodScore || e.心情指數 || '5')
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                      <YAxis domain={[0, 10]} stroke="#94a3b8" fontSize={10} />
                      <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                      <Line type="monotone" dataKey="mood" stroke="#1c5a80" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* 3. Previous comments logs */}
            <div>
              <h4 className="text-sm font-black text-slate-700 mb-2">💬 歷史悄悄話留言備份</h4>
              {studentComments.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-xl text-xs text-slate-400 font-medium italic font-semibold font-sans">
                  最近無向老師提交過悄悄話，不需擔心，每一筆正常登記都記錄完備。
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {studentComments.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs leading-relaxed">
                      <div className="flex justify-between items-center mb-1 font-sans">
                        <span className="font-extrabold text-slate-500">{item.date} 的分享：</span>
                        <span className="font-black text-[10px]" style={{ color: getMoodColor(item.mood) }}>
                          當時心情：{item.mood} 分 {MOOD_EMOJIS[item.mood]?.emoji}
                        </span>
                      </div>
                      <p className="text-slate-700 font-semibold italic font-sans">「 {item.comment} 」</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
