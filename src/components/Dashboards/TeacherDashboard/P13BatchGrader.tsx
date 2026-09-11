import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Clock, CheckCircle, ArrowLeft, Users, Sparkles, MessageSquare, Palette } from 'lucide-react';
import { MOOD_EMOJIS, getMoodColor } from '../../../constants/moodConstants';
import { formatDateObj } from '../../../utils/dateHelpers';
import { getPublicAssetUrl } from '../../../utils/assetHelper';
import { getStudentsByClass, StudentRecord } from '../../../data/studentsRoster';
import { ClassroomBatchBookExperience } from '../../Portals/ClassroomBatchBookExperience';

interface P13BatchGraderProps {
  selectedClass: string;
  setSelectedClass?: (val: string) => void;
  ALL_CLASSES?: string[];
  batchScores: Record<string, { id?: string; moodScore: number | string; comment?: string }>;
  handleP13CellGradeChange: (studentNo: string, val: number | 'N/A', comment?: string) => void;
  handleP13CellCommentChange?: (studentNo: string, comment: string) => void;
  handleP13BatchSubmit: () => void;
  isP13Saved: boolean;
  loading: boolean;
  setViewState?: (view: any) => void;
  reports?: any[];
}

export const P13BatchGrader: React.FC<P13BatchGraderProps> = ({
  selectedClass,
  setSelectedClass,
  ALL_CLASSES,
  batchScores,
  handleP13CellGradeChange,
  handleP13CellCommentChange,
  handleP13BatchSubmit,
  isP13Saved,
  loading,
  setViewState,
  reports,
}) => {
  const [displayMode, setDisplayMode] = useState<'CARTOON' | 'STANDARD'>(() => {
    const saved = localStorage.getItem('gccps_batch_display_mode');
    return saved === 'STANDARD' ? 'STANDARD' : 'CARTOON';
  });

  const handleSwitchMode = (mode: 'CARTOON' | 'STANDARD') => {
    setDisplayMode(mode);
    localStorage.setItem('gccps_batch_display_mode', mode);
  };

  if (displayMode === 'CARTOON') {
    return (
      <ClassroomBatchBookExperience
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        ALL_CLASSES={ALL_CLASSES}
        batchScores={batchScores}
        handleP13CellGradeChange={handleP13CellGradeChange}
        handleP13CellCommentChange={handleP13CellCommentChange}
        handleP13BatchSubmit={handleP13BatchSubmit}
        isP13Saved={isP13Saved}
        loading={loading}
        setViewState={setViewState}
        onSwitchToStandard={() => handleSwitchMode('STANDARD')}
        reports={reports}
      />
    );
  }

  const todayStr = formatDateObj(new Date());

  // Retrieve actual student records from the official GCCPS roster
  const rosterStudents = useMemo(() => {
    if (!selectedClass) return [];
    return getStudentsByClass(selectedClass);
  }, [selectedClass]);

  // Fallback if class has no static roster (e.g. TEST class)
  const displayStudents: StudentRecord[] = useMemo(() => {
    if (rosterStudents.length > 0) return rosterStudents;
    return Array.from({ length: 30 }, (_, idx) => ({
      class: selectedClass || 'TEST',
      number: idx + 1,
      chineseName: `學生 ${idx + 1}`,
      englishName: `Student ${idx + 1}`,
      studentId: `s${selectedClass || '00'}${String(idx + 1).padStart(2, '0')}`,
      googleAppEmail: `s${selectedClass || '00'}${String(idx + 1).padStart(2, '0')}@mail.gccps.edu.hk`
    }));
  }, [rosterStudents, selectedClass]);

  // Calculate live statistics
  const { filledCount, avgScore } = useMemo(() => {
    let count = 0;
    let sum = 0;
    displayStudents.forEach(st => {
      const sKey = String(st.number);
      const score = batchScores[sKey]?.moodScore;
      if (score !== undefined && score !== null && score !== '' && score !== 0) {
        count++;
        const num = typeof score === 'string' ? parseInt(score) : score;
        if (!isNaN(num)) sum += num;
      }
    });
    return {
      filledCount: count,
      avgScore: count > 0 ? (sum / count).toFixed(1) : null
    };
  }, [displayStudents, batchScores]);

  // Quick batch fill helpers
  const handleQuickFillAll = (targetScore: number) => {
    displayStudents.forEach(st => {
      const sKey = String(st.number);
      const existing = batchScores[sKey]?.moodScore;
      if (!existing || existing === 0) {
        handleP13CellGradeChange(sKey, targetScore, batchScores[sKey]?.comment || '');
      }
    });
  };

  return (
    <motion.div 
      key="teacher_batch_insert"
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 1.02 }} 
      transition={{ duration: 0.2 }}
      className="space-y-6 font-sans max-w-6xl mx-auto"
    >
      {/* NAVIGATION BAR */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewState ? setViewState('STUDENT_LOGIN') : window.history.back()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回學生終端 (Student Terminal)</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleSwitchMode('CARTOON')}
            className="inline-flex items-center gap-1.5 text-xs font-black text-amber-900 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <span>🎨</span>
            <span>切換卡通日記模式</span>
          </button>
          <div className="text-xs font-semibold text-slate-500">
            天主教善導小學 · 學生身心健康追蹤平台
          </div>
        </div>
      </div>

      {/* HEADER CARD */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 p-2 shrink-0 flex items-center justify-center shadow-xs">
            <img 
              src={getPublicAssetUrl('/學校圖檔/吉祥物/enen_reading.png')} 
              alt="恩恩吉祥物" 
              className="w-full h-full object-contain filter drop-shadow" 
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 text-xs font-black rounded-full flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                選項 2：小一至小六 (P.1 - P.6) 老師全班代登記 (Teacher Insert)
              </span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold rounded-full">
                單一頁面快速輸入全班分數與備註
              </span>
            </div>

            <div className="flex items-center gap-3 mt-2.5">
              <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">
                {selectedClass} 班 · 每日心情快速批次錄入
              </h3>

            {/* CLASS SELECTOR IN HEADER */}
            {setSelectedClass && ALL_CLASSES && (
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-indigo-50 border border-indigo-200 text-indigo-900 text-sm font-black rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-indigo-300 focus:outline-none cursor-pointer"
              >
                <optgroup label="初小 (P.1 - P.3)">
                  {['1A','1B','1C','2A','2B','2C','2D','3A','3B','3C','3D'].map(c => (
                    <option key={c} value={c}>切換班別：{c} 班</option>
                  ))}
                </optgroup>
                <optgroup label="高小 (P.4 - P.6)">
                  {['4A','4B','4C','4D','5A','5B','5C','5D','6A','6B','6C','6D'].map(c => (
                    <option key={c} value={c}>切換班別：{c} 班</option>
                  ))}
                </optgroup>
                <optgroup label="測試">
                  <option value="TEST">TEST 測試班級</option>
                </optgroup>
              </select>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              登記日期：<strong className="text-slate-800">{todayStr}</strong>
            </span>
            <span>•</span>
            <span>全班學生：<strong className="text-slate-800">{displayStudents.length} 位</strong></span>
            <span>•</span>
            <span>已輸入：<strong className="text-indigo-600">{filledCount} / {displayStudents.length} 位</strong></span>
            {avgScore && (
              <>
                <span>•</span>
                <span>班級今日平均心情：<strong className="text-emerald-600 font-black">{avgScore} 分</strong></span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* TOP ACTION BUTTONS */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={handleP13BatchSubmit}
            disabled={loading}
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black text-sm px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-102 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{loading ? "正在保存中..." : `💾 儲存並同步 ${selectedClass} 班分數與留言`}</span>
          </button>
        </div>
      </div>

      {/* QUICK BATCH HELPERS */}
      <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-indigo-900 font-bold">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>⚡ 快捷輸入工具（為尚未打分的同學填入）：</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleQuickFillAll(5)}
            className="bg-white hover:bg-indigo-100 text-slate-700 font-bold px-3 py-1.5 rounded-lg border border-indigo-200 transition-all cursor-pointer shadow-3xs"
          >
            😐 一鍵填 5 分 (普通平靜)
          </button>
          <button
            type="button"
            onClick={() => handleQuickFillAll(7)}
            className="bg-white hover:bg-indigo-100 text-emerald-700 font-bold px-3 py-1.5 rounded-lg border border-indigo-200 transition-all cursor-pointer shadow-3xs"
          >
            😊 一鍵填 7 分 (開心積極)
          </button>
        </div>
      </div>

      {/* SUCCESS BANNER */}
      {isP13Saved && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-2.5 text-sm font-bold shadow-xs"
        >
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>恭喜！{selectedClass} 班在今日（{todayStr}）的全班分數與留言已完美同步存入 Firebase 資料庫！可在全校心情報告中即時查看。</span>
        </motion.div>
      )}

      {/* STUDENT MATRIX (SINGLE PAGE FOR ALL STUDENTS OF THE CLASS) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4 mb-4">
          <h4 className="text-base font-black text-[#1E293B] flex items-center gap-2">
            <span>{selectedClass} 班 全體學生登分清單</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
              共 {displayStudents.length} 名
            </span>
          </h4>
          <span className="text-xs text-slate-400 font-medium">
            點擊對應 1-10 分數按鈕即可即時打分，亦可在右側輸入備註或學生留言。
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {displayStudents.map((student) => {
            const sIdxStr = String(student.number);
            const scoreItem = batchScores[sIdxStr];
            const score = scoreItem?.moodScore || 0;
            const currentComment = scoreItem?.comment || '';
            const recordExists = !!scoreItem?.id;
            const isScoreEntered = score !== 0 && score !== undefined && score !== '';

            return (
              <div 
                key={sIdxStr}
                className={`py-3 px-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 transition-all rounded-xl font-sans ${
                  score === 'N/A' 
                    ? 'bg-slate-50/80' 
                    : isScoreEntered 
                      ? 'bg-indigo-50/20 hover:bg-indigo-50/30' 
                      : 'hover:bg-slate-50'
                }`}
              >
                {/* 1. LEFT: STUDENT INFO */}
                <div className="flex items-center gap-3 min-w-[200px]">
                  <span className={`w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl text-xs font-black shadow-3xs ${
                    score === 'N/A' 
                      ? 'bg-slate-400 text-white' 
                      : isScoreEntered 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {sIdxStr.padStart(2, '0')}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black text-slate-800">{student.chineseName}</span>
                      <span className="text-xs text-slate-500 font-semibold">{student.englishName}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                        {student.studentId}
                      </span>
                      <span className={`text-[10px] font-bold ${recordExists ? 'text-emerald-600' : isScoreEntered ? 'text-indigo-600' : 'text-slate-400'}`}>
                        {recordExists ? '✓ 今日已存檔' : isScoreEntered ? '● 已點選未儲存' : '○ 尚未登記'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. CENTER: SCORE BUTTONS (1-10 + N/A) */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'N/A'] as const).map(val => {
                    const isChosen = score === val || String(score) === String(val);
                    const isNAKey = val === 'N/A';
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleP13CellGradeChange(sIdxStr, val, currentComment)}
                        style={{
                          backgroundColor: isChosen ? (isNAKey ? '#94A3B8' : getMoodColor(val)) : 'transparent',
                          borderColor: isChosen ? (isNAKey ? '#94A3B8' : getMoodColor(val)) : '#E2E8F0',
                          color: isChosen ? '#FFFFFF' : (isNAKey ? '#64748B' : '#475569')
                        }}
                        className={`h-8 flex-shrink-0 flex items-center justify-center rounded-lg text-xs font-black border-2 transition-all cursor-pointer hover:border-slate-400 active:scale-95 ${
                          isNAKey ? 'px-2.5 min-w-[42px]' : 'w-8'
                        } ${isChosen ? 'shadow-xs font-black ring-2 ring-indigo-200' : ''}`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>

                {/* 3. RIGHT: SELECTED MOOD BADGE & QUICK COMMENT INPUT */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 min-w-[280px] lg:justify-end">
                  {/* Mood summary tag */}
                  <div className="w-[125px] shrink-0 text-right">
                    {score === 'N/A' ? (
                      <div className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg text-[11px] font-bold text-slate-500">
                        <span>🚫</span>
                        <span>缺席/離校</span>
                      </div>
                    ) : isScoreEntered ? (
                      <div className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-lg text-[11px] font-bold shadow-3xs">
                        <span>{MOOD_EMOJIS[score as number]?.emoji}</span>
                        <span style={{ color: getMoodColor(score as number) }}>
                          {score}分 • {MOOD_EMOJIS[score as number]?.desc.split(' / ')[0]}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs italic font-semibold">未評分</span>
                    )}
                  </div>

                  {/* Comment / Teacher Observation input */}
                  <div className="relative w-full sm:w-56">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="填寫備註或留言 (選填)..."
                      value={currentComment}
                      onChange={(e) => {
                        if (handleP13CellCommentChange) {
                          handleP13CellCommentChange(sIdxStr, e.target.value);
                        } else {
                          handleP13CellGradeChange(sIdxStr, score, e.target.value);
                        }
                      }}
                      className="w-full text-xs pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 focus:outline-none transition-all placeholder:text-slate-300 font-medium"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM SAVE BAR */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between gap-4 items-center font-sans">
          <p className="text-xs text-slate-400 font-medium max-w-xl">
            💡 提示：點擊「儲存並同步」後，所有已評分學生的最新心情分數與留言將即時寫入系統。若分數低於或等於 3 分，系統會啟動關懷預警機制。
          </p>
          <button
            type="button"
            onClick={handleP13BatchSubmit}
            disabled={loading}
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black text-sm px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            {loading ? "正在保存至 Firebase..." : `💾 確認並同步儲存 ${selectedClass} 班分數`}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
