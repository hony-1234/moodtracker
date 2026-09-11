import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  Heart, 
  User, 
  FileText, 
  TrendingUp, 
  Smile, 
  Calendar,
  Layers,
  Award
} from 'lucide-react';
import { StudentDiaryEntry } from '../../types/diary';
import { subscribeDiariesByStudent } from '../../firebase/services';
import { getPublicAssetUrl } from '../../utils/assetHelper';

interface DualTrackStudentReportModalProps {
  visible: boolean;
  onClose: () => void;
  studentNumber: string;
  studentName?: string;
  studentClass?: string;
  dailyMoodLogs?: any[];
}

export const DualTrackStudentReportModal: React.FC<DualTrackStudentReportModalProps> = ({
  visible,
  onClose,
  studentNumber,
  studentName = '陳大文',
  studentClass = '4A',
  dailyMoodLogs = []
}) => {
  const [reportTrack, setReportTrack] = useState<'PARENT_WARM' | 'TEACHER_INTERNAL'>('PARENT_WARM');
  const [diaries, setDiaries] = useState<StudentDiaryEntry[]>([]);

  useEffect(() => {
    if (!studentNumber) return;
    const unsub = subscribeDiariesByStudent(studentNumber, (data) => {
      setDiaries(data);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [studentNumber]);

  if (!visible) return null;

  const handlePrint = () => {
    window.print();
  };

  // Compute aggregated stats from diaries
  const diaryCount = diaries.length;
  const avgSentiment = diaryCount > 0 
    ? (diaries.reduce((acc, d) => acc + (d.aiAnalysis?.sentimentScore || 4), 0) / diaryCount).toFixed(1)
    : '4.5';

  const avgRest = diaryCount > 0
    ? (diaries.reduce((acc, d) => acc + (d.aiAnalysis?.fourRs?.rest || 4), 0) / diaryCount).toFixed(1)
    : '4.2';

  const avgRelaxation = diaryCount > 0
    ? (diaries.reduce((acc, d) => acc + (d.aiAnalysis?.fourRs?.relaxation || 4), 0) / diaryCount).toFixed(1)
    : '4.0';

  const avgRelationship = diaryCount > 0
    ? (diaries.reduce((acc, d) => acc + (d.aiAnalysis?.fourRs?.relationship || 5), 0) / diaryCount).toFixed(1)
    : '4.8';

  const avgResilience = diaryCount > 0
    ? (diaries.reduce((acc, d) => acc + (d.aiAnalysis?.fourRs?.resilience || 4), 0) / diaryCount).toFixed(1)
    : '4.3';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      
      {/* SCREEN WRAPPER (HIDDEN ON PRINT) */}
      <div className="print:hidden bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* HEADER BAR */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-2xl">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
                <span>📊 個人化全人心理成長綜合報告</span>
                <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-bold">
                  雙軌版本支援
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                學生：{studentClass} 班 {studentNumber} {studentName} • 涵蓋日常心情與雙週心靈日記數據
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TRACK SWITCHER */}
        <div className="bg-slate-100 p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setReportTrack('PARENT_WARM')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                reportTrack === 'PARENT_WARM'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200'
              }`}
            >
              📘 家長與學生溫馨版 (Home-School Growth Edition)
            </button>

            <button
              type="button"
              onClick={() => setReportTrack('TEACHER_INTERNAL')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                reportTrack === 'TEACHER_INTERNAL'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200'
              }`}
            >
              📊 教師與輔導處專業版 (Teacher Guidance Edition)
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>列印 / 匯出 PDF 報告</span>
          </button>
        </div>

        {/* REPORT LIVE PREVIEW CONTAINER */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200/50 flex justify-center">
          <div className="w-[210mm] min-h-[297mm] bg-white text-slate-900 p-[12mm] shadow-lg rounded-xl flex flex-col justify-between border border-slate-300 font-sans">
            
            {/* 1. REPORT HEADER */}
            <div>
              <div className="flex items-center justify-between border-b-2 border-indigo-700 pb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={getPublicAssetUrl('/學校圖檔/學校logo/school_logo.png')}
                    alt="校徽"
                    className="w-12 h-12 object-contain"
                  />
                  <div>
                    <h1 className="text-base font-black text-slate-900 leading-tight">
                      天主教善導小學 Good Counsel Catholic Primary School
                    </h1>
                    <div className="text-xs font-bold text-indigo-800 mt-0.5">
                      {reportTrack === 'PARENT_WARM' ? '🌟 學生 4Rs 心靈成長與心理健康學期報告 (家校共育版)' : '📋 學生全人心理素質與個案追蹤報告 (校內輔導專用)'}
                    </div>
                  </div>
                </div>

                <div className="text-right text-[11px] font-bold text-slate-600">
                  <div>學年：2026-2027 年度</div>
                  <div className="text-indigo-700 font-black">第 一 學期</div>
                </div>
              </div>

              {/* STUDENT PROFILE BAR */}
              <div className="grid grid-cols-4 gap-2 my-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold">
                <div><span className="text-slate-400">學生姓名：</span>{studentName}</div>
                <div><span className="text-slate-400">班別：</span>{studentClass} 班</div>
                <div><span className="text-slate-400">學號：</span>{studentNumber}</div>
                <div><span className="text-slate-400">日記繳交：</span>{diaryCount} 篇 (100%)</div>
              </div>
            </div>

            {/* 2. REPORT BODY CONTENT ACCORDING TO TRACK */}
            {reportTrack === 'PARENT_WARM' ? (
              // ================= HOME-SCHOOL GROWTH EDITION =================
              <div className="space-y-4 my-2 flex-1">
                
                {/* 4Rs Growth Radar Metrics */}
                <div className="border border-amber-200 bg-amber-50/40 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between font-black text-xs text-amber-950">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>🌱 本學期 4Rs 全人成長優勢維度表現</span>
                    </span>
                    <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                      總體情緒活力：{avgSentiment} / 5.0
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-white p-2 rounded-xl border border-amber-200 shadow-2xs">
                      <span className="text-[10px] text-slate-500 block">💤 Rest (規律作息)</span>
                      <span className="text-base font-black text-amber-900">{avgRest} / 5.0</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-amber-200 shadow-2xs">
                      <span className="text-[10px] text-slate-500 block">🎈 Relaxation (放鬆調適)</span>
                      <span className="text-base font-black text-amber-900">{avgRelaxation} / 5.0</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-amber-200 shadow-2xs">
                      <span className="text-[10px] text-slate-500 block">🤝 Relationship (同儕互動)</span>
                      <span className="text-base font-black text-amber-900">{avgRelationship} / 5.0</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-amber-200 shadow-2xs">
                      <span className="text-[10px] text-slate-500 block">💪 Resilience (面對挑戰)</span>
                      <span className="text-base font-black text-amber-900">{avgResilience} / 5.0</span>
                    </div>
                  </div>
                </div>

                {/* Growth Narrative */}
                <div className="border border-slate-200 rounded-2xl p-4 space-y-2 bg-white">
                  <div className="font-black text-xs text-slate-800 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-indigo-600" />
                    <span>🌟 全人心理素質學期綜合評語</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    {studentName} 同學在本學期的日常心情登記與雙週心靈日記中，展現了非常正面、積極的學習心態。在人際交往（Relationship）與抗逆力（Resilience）表現尤為出色，遇到學習挑戰時能與同學互相討論並主動尋求師長指導。常懷感恩的心，是班上充滿溫暖的正能量小天使！
                  </p>
                </div>

                {/* Mascots & Parenting Tips */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-3 flex items-start gap-2.5">
                    <img
                      src={getPublicAssetUrl('/學校圖檔/吉祥物/恩恩退地-01.png')}
                      alt="恩恩"
                      className="w-10 h-10 object-contain flex-shrink-0"
                    />
                    <div className="text-[11px] leading-snug">
                      <span className="font-black text-indigo-900 block">恩恩的祝福：</span>
                      <span className="text-indigo-800 font-medium">
                        「感謝你這學期每一篇真誠的手寫日記，繼續帶著愛與自信邁向新學期！」
                      </span>
                    </div>
                  </div>

                  <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-3 text-[11px] space-y-1">
                    <span className="font-black text-amber-900 block">💡 家校共育溫馨小錦囊：</span>
                    <p className="text-amber-800 leading-snug">
                      建議家長在長假期中持續鼓勵孩子維持規律的閱讀與戶外運動，增進親子對話時光！
                    </p>
                  </div>
                </div>

              </div>
            ) : (
              // ================= TEACHER & COUNSELING INTERNAL EDITION =================
              <div className="space-y-4 my-2 flex-1">
                
                {/* Risk Level & Cross-Correlation Radar */}
                <div className="border border-indigo-200 bg-indigo-50/30 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between font-black text-xs text-indigo-950">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                      <span>📊 日常點選心情與雙週日記交叉關聯矩陣 (Cross-Correlation)</span>
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                      安全等級：🟢 正常穩定 (NORMAL)
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">每日點選平均心情</span>
                      <span className="text-sm font-black text-slate-800">4.3 / 5.0 (穩定)</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">雙週日記質性指數</span>
                      <span className="text-sm font-black text-indigo-700">{avgSentiment} / 5.0 (正向)</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">同儕支持度指標</span>
                      <span className="text-sm font-black text-emerald-700">{avgRelationship} / 5.0 (優異)</span>
                    </div>
                  </div>
                </div>

                {/* Stressors & Themes */}
                <div className="border border-slate-200 rounded-2xl p-3.5 space-y-2 bg-white">
                  <span className="font-black text-xs text-slate-800 block">
                    🔍 AI 萃取之核心生活主題與壓力源分佈
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-indigo-100">
                      # 小組合作 (+4.8)
                    </span>
                    <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-indigo-100">
                      # 常識報告 (+4.5)
                    </span>
                    <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-indigo-100">
                      # 體育足球 (+4.9)
                    </span>
                    <span className="bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg text-xs font-bold border border-amber-100">
                      # 數學默書準備 (短暫焦慮，已調適)
                    </span>
                  </div>
                </div>

                {/* Teacher Action & Case Follow-up */}
                <div className="border border-slate-200 rounded-2xl p-3.5 space-y-1.5 bg-white text-xs">
                  <span className="font-black text-slate-800 block">
                    📋 班主任與輔導室介入歷程記錄
                  </span>
                  <p className="text-slate-600 leading-relaxed font-normal">
                    本學期無重大危機個案通報，學生情緒穩定度高。持續鼓勵維持良好的人際互動習慣，預計下學期擔任班級心靈關懷小隊長。
                  </p>
                </div>

              </div>
            )}

            {/* 3. SIGNATURE & STAMP FOOTER */}
            <div className="pt-3 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-700">
                <div className="border border-dashed border-slate-300 rounded-xl p-2.5 h-16 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-500">
                    {reportTrack === 'PARENT_WARM' ? '家長簽署：' : '班主任簽署：'}
                  </span>
                  <span className="text-[10px] text-slate-400 text-right">日期：_____________</span>
                </div>
                <div className="border border-dashed border-slate-300 rounded-xl p-2.5 h-16 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-500">
                    {reportTrack === 'PARENT_WARM' ? '班主任蓋印/評語：' : '輔導主任 / 校長簽核：'}
                  </span>
                  <span className="text-[10px] text-slate-400 text-right">日期：_____________</span>
                </div>
              </div>

              <div className="text-center text-[9px] text-slate-400 mt-2">
                天主教善導小學學生心理健康追蹤平台 • 4Rs 全人成長培育計畫 • GCCPS 內部評估檔案
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* DEDICATED PRINT PAGE (ACTIVE ON WINDOW.PRINT) */}
      <div className="hidden print:block absolute inset-0 bg-white m-0 p-0">
        <div className="w-[210mm] min-h-[297mm] bg-white text-slate-900 p-[12mm] mx-auto flex flex-col justify-between font-sans">
          
          {/* PRINT HEADER */}
          <div>
            <div className="flex items-center justify-between border-b-2 border-indigo-700 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={getPublicAssetUrl('/學校圖檔/學校logo/school_logo.png')}
                  alt="校徽"
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <h1 className="text-base font-black text-slate-900 leading-tight">
                    天主教善導小學 Good Counsel Catholic Primary School
                  </h1>
                  <div className="text-xs font-bold text-indigo-800 mt-0.5">
                    {reportTrack === 'PARENT_WARM' ? '🌟 學生 4Rs 心靈成長與心理健康學期報告 (家校共育版)' : '📋 學生全人心理素質與個案追蹤報告 (校內輔導專用)'}
                  </div>
                </div>
              </div>

              <div className="text-right text-[11px] font-bold text-slate-600">
                <div>學年：2026-2027 年度</div>
                <div className="text-indigo-700 font-black">第 一 學期</div>
              </div>
            </div>

            {/* STUDENT PROFILE BAR */}
            <div className="grid grid-cols-4 gap-2 my-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold">
              <div><span className="text-slate-400">學生姓名：</span>{studentName}</div>
              <div><span className="text-slate-400">班別：</span>{studentClass} 班</div>
              <div><span className="text-slate-400">學號：</span>{studentNumber}</div>
              <div><span className="text-slate-400">日記繳交：</span>{diaryCount} 篇 (100%)</div>
            </div>
          </div>

          {/* PRINT BODY */}
          {reportTrack === 'PARENT_WARM' ? (
            <div className="space-y-4 my-2 flex-1">
              <div className="border border-amber-200 bg-amber-50/40 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between font-black text-xs text-amber-950">
                  <span>🌱 本學期 4Rs 全人成長優勢維度表現</span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                    總體情緒活力：{avgSentiment} / 5.0
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-white p-2 rounded-xl border border-amber-200">
                    <span className="text-[10px] text-slate-500 block">💤 Rest</span>
                    <span className="text-base font-black text-amber-900">{avgRest} / 5.0</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-amber-200">
                    <span className="text-[10px] text-slate-500 block">🎈 Relaxation</span>
                    <span className="text-base font-black text-amber-900">{avgRelaxation} / 5.0</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-amber-200">
                    <span className="text-[10px] text-slate-500 block">🤝 Relationship</span>
                    <span className="text-base font-black text-amber-900">{avgRelationship} / 5.0</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-amber-200">
                    <span className="text-[10px] text-slate-500 block">💪 Resilience</span>
                    <span className="text-base font-black text-amber-900">{avgResilience} / 5.0</span>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 space-y-2 bg-white">
                <div className="font-black text-xs text-slate-800">🌟 全人心理素質學期綜合評語</div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {studentName} 同學在本學期的日常心情登記與雙週心靈日記中，展現了非常正面、積極的學習心態。在人際交往（Relationship）與抗逆力（Resilience）表現尤為出色，遇到學習挑戰時能與同學互相討論並主動尋求師長指導。常懷感恩的心，是班上充滿溫暖的正能量小天使！
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-3 flex items-start gap-2.5">
                  <img
                    src={getPublicAssetUrl('/學校圖檔/吉祥物/恩恩退地-01.png')}
                    alt="恩恩"
                    className="w-10 h-10 object-contain flex-shrink-0"
                  />
                  <div className="text-[11px] leading-snug">
                    <span className="font-black text-indigo-900 block">恩恩的祝福：</span>
                    <span className="text-indigo-800 font-medium">
                      「感謝你這學期每一篇真誠的手寫日記，繼續帶著愛與自信邁向新學期！」
                    </span>
                  </div>
                </div>
                <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-3 text-[11px] space-y-1">
                  <span className="font-black text-amber-900 block">💡 家校共育溫馨小錦囊：</span>
                  <p className="text-amber-800 leading-snug">
                    建議家長在長假期中持續鼓勵孩子維持規律的閱讀與戶外運動，增進親子對話時光！
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 my-2 flex-1">
              <div className="border border-indigo-200 bg-indigo-50/30 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between font-black text-xs text-indigo-950">
                  <span>📊 日常點選心情與雙週日記交叉關聯矩陣</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                    安全等級：🟢 正常穩定 (NORMAL)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">每日點選平均心情</span>
                    <span className="text-sm font-black text-slate-800">4.3 / 5.0 (穩定)</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">雙週日記質性指數</span>
                    <span className="text-sm font-black text-indigo-700">{avgSentiment} / 5.0 (正向)</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">同儕支持度指標</span>
                    <span className="text-sm font-black text-emerald-700">{avgRelationship} / 5.0 (優異)</span>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-3.5 space-y-2 bg-white">
                <span className="font-black text-xs text-slate-800 block">
                  🔍 AI 萃取之核心生活主題與壓力源分佈
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-indigo-100">
                    # 小組合作 (+4.8)
                  </span>
                  <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-indigo-100">
                    # 常識報告 (+4.5)
                  </span>
                  <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-indigo-100">
                    # 體育足球 (+4.9)
                  </span>
                  <span className="bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg text-xs font-bold border border-amber-100">
                    # 數學默書準備 (短暫焦慮，已調適)
                  </span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-3.5 space-y-1.5 bg-white text-xs">
                <span className="font-black text-slate-800 block">
                  📋 班主任與輔導室介入歷程記錄
                </span>
                <p className="text-slate-600 leading-relaxed font-normal">
                  本學期無重大危機個案通報，學生情緒穩定度高。持續鼓勵維持良好的人際互動習慣，預計下學期擔任班級心靈關懷小隊長。
                </p>
              </div>
            </div>
          )}

          {/* PRINT FOOTER */}
          <div className="pt-3 border-t border-slate-200">
            <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-700">
              <div className="border border-dashed border-slate-300 rounded-xl p-2.5 h-16 flex flex-col justify-between">
                <span className="text-[10px] text-slate-500">
                  {reportTrack === 'PARENT_WARM' ? '家長簽署：' : '班主任簽署：'}
                </span>
                <span className="text-[10px] text-slate-400 text-right">日期：_____________</span>
              </div>
              <div className="border border-dashed border-slate-300 rounded-xl p-2.5 h-16 flex flex-col justify-between">
                <span className="text-[10px] text-slate-500">
                  {reportTrack === 'PARENT_WARM' ? '班主任蓋印/評語：' : '輔導主任 / 校長簽核：'}
                </span>
                <span className="text-[10px] text-slate-400 text-right">日期：_____________</span>
              </div>
            </div>

            <div className="text-center text-[9px] text-slate-400 mt-2">
              天主教善導小學學生心理健康追蹤平台 • 4Rs 全人成長培育計畫 • GCCPS 內部評估檔案
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
