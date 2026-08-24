import React from 'react';
import { motion } from 'motion/react';
import { Clock, CheckCircle } from 'lucide-react';
import { MOOD_EMOJIS, getMoodColor } from '../../../constants/moodConstants';
import { formatDateObj } from '../../../utils/dateHelpers';

interface P13BatchGraderProps {
  selectedClass: string;
  batchScores: Record<string, { id?: string; moodScore: number | 'N/A' }>;
  handleP13CellGradeChange: (studentNo: string, val: number | 'N/A') => void;
  handleP13BatchSubmit: () => void;
  isP13Saved: boolean;
  loading: boolean;
}

export const P13BatchGrader: React.FC<P13BatchGraderProps> = ({
  selectedClass,
  batchScores,
  handleP13CellGradeChange,
  handleP13BatchSubmit,
  isP13Saved,
  loading,
}) => {
  return (
    <motion.div 
      key="teacher_p1_3_batch"
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 1.02 }} 
      transition={{ duration: 0.2 }}
      className="space-y-6 font-sans"
    >
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-700 px-3 py-1 text-xs font-bold rounded-full">
              小一至小三 (單一帳號快速錄入)
            </span>
            <span className="bg-slate-100 px-2 py-1 text-xs text-slate-500 font-bold rounded">
              無留言功能
            </span>
          </div>
          <h3 className="text-2xl font-black text-[#0F172A] mt-2 font-sans">
            {selectedClass} 班 · 每日心情快速批次錄入
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            目前操作鎖定今日：<span className="text-slate-700 font-bold">{formatDateObj(new Date())}</span>。全班學制學生自動套用日期，減少負擔。
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleP13BatchSubmit}
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm px-5 py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-105 cursor-pointer font-sans"
          >
            {loading ? "正極速與 Firestore 保存中..." : "💾 儲存並同步今日全班分數"}
          </button>
        </div>
      </div>

      {isP13Saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-2 text-sm font-bold font-sans">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          恭喜！{selectedClass} 班級在今日（{formatDateObj(new Date())}）的最新分數資料已完美存入 Firebase！
        </div>
      )}

      {/* Matrix of students from 1 to 30 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h4 className="text-sm font-black text-[#1E293B] mb-4 flex items-center justify-between font-sans">
          <span>學生快速登分板 (座號 1 - 30)</span>
          <span className="text-xs font-semibold text-[#64748B]">單行緊湊登分，點擊快速變更分數。相容多螢幕縮放。</span>
        </h4>

        <div className="divide-y divide-slate-100">
          {Array.from({ length: 30 }).map((_, idx) => {
            const sIdxStr = String(idx + 1);
            const score = batchScores[sIdxStr]?.moodScore || 0;
            const recordExists = !!batchScores[sIdxStr]?.id;

            return (
              <div 
                key={sIdxStr}
                className={`py-2 px-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-all rounded-lg font-sans ${
                  score === 'N/A' ? 'bg-slate-100/40' : score > 0 ? 'bg-amber-100/20' : 'hover:bg-slate-50'
                }`}
              >
                {/* Left side: Student seat info */}
                <div className="flex items-center gap-3 min-w-[120px]">
                  <span className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-xs font-black ${
                    score === 'N/A' ? 'bg-slate-400 text-white' : score > 0 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {sIdxStr.padStart(2, '0')}
                  </span>
                  <div>
                    <div className="text-xs font-black text-slate-800 font-sans">座號 {sIdxStr}</div>
                    <div className={`text-[9px] font-bold font-sans ${recordExists ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {recordExists ? '✓ 已登記存檔' : '○ 尚未登記'}
                    </div>
                  </div>
                </div>

                {/* Middle: score button rows (1-10 + N/A) single-line */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'N/A'] as const).map(val => {
                    const isChosen = score === val;
                    const isNAKey = val === 'N/A';
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleP13CellGradeChange(sIdxStr, val)}
                        style={{
                          backgroundColor: isChosen ? (isNAKey ? '#94A3B8' : getMoodColor(val)) : 'transparent',
                          borderColor: isChosen ? (isNAKey ? '#94A3B8' : getMoodColor(val)) : '#E2E8F0',
                          color: isChosen ? '#FFFFFF' : (isNAKey ? '#64748B' : '#475569')
                        }}
                        className={`h-8 flex-shrink-0 flex items-center justify-center rounded-lg text-xs font-black border-2 transition-all cursor-pointer hover:border-slate-400 active:scale-95 ${isNAKey ? 'px-2 min-w-[36px]' : 'w-8'}`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>

                {/* Right: Selected mood & emoji label */}
                <div className="min-w-[150px] text-right flex items-center justify-end gap-2 font-sans">
                  {score === 'N/A' ? (
                    <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-black shadow-3xs text-slate-500">
                      <span>🚫</span>
                      <span>不適用 (缺席/離校)</span>
                    </div>
                  ) : score > 0 ? (
                    <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-black shadow-3xs">
                      <span>{MOOD_EMOJIS[score as number]?.emoji}</span>
                      <span style={{ color: getMoodColor(score) }}>
                        {score}分 • {MOOD_EMOJIS[score as number]?.desc.split(' / ')[0]}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-300 text-xs italic font-semibold font-sans">點選分數直接登記</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between gap-4 items-center font-sans">
          <p className="text-xs text-slate-400 font-semibold max-w-xl">
            ⚠️ 注意：本介面資料格式與本系統的整體心情監控架構 100% 重複相容。您的寫入結果將可在全校分析看板 (GCCPS) 中及時反應、整合分析！
          </p>
          <button
            onClick={handleP13BatchSubmit}
            disabled={loading}
            className="w-full md:w-auto bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm px-6 py-3.5 rounded-xl transition-all shadow cursor-pointer font-sans"
          >
            確認並極速同步存本地
          </button>
        </div>
      </div>
    </motion.div>
  );
};
