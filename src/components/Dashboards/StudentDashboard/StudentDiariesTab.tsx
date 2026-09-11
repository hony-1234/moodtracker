import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Sparkles, Heart, Calendar, FileText, CheckCircle2, ChevronRight, Eye } from 'lucide-react';
import { StudentDiaryEntry } from '../../../types/diary';
import { subscribeDiariesByStudent } from '../../../firebase/services';
import { getPublicAssetUrl } from '../../../utils/assetHelper';

interface StudentDiariesTabProps {
  studentNumber: string;
  studentName?: string;
  activeMascot?: 'xinxin' | 'enen';
}

export const StudentDiariesTab: React.FC<StudentDiariesTabProps> = ({
  studentNumber,
  studentName = '同學',
  activeMascot = 'enen'
}) => {
  const [diaries, setDiaries] = useState<StudentDiaryEntry[]>([]);
  const [selectedDiary, setSelectedDiary] = useState<StudentDiaryEntry | null>(null);

  useEffect(() => {
    if (!studentNumber) return;
    const unsub = subscribeDiariesByStudent(studentNumber, (data) => {
      setDiaries(data);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [studentNumber]);

  return (
    <div className="space-y-6">
      
      {/* 1. WELCOME HERO BANNER */}
      <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 rounded-3xl p-6 md:p-8 shadow-xl border border-amber-300 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-black text-amber-950 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>4Rs 心靈成長時光機</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            📖 {studentName} 的雙週成長日記簿
          </h2>
          <p className="text-xs md:text-sm text-amber-950/80 font-medium max-w-md">
            在這裡可以回顧你每期手寫的心靈日記、看見自己的成長足跡，以及校園大使為你送上的專屬加油祝福！
          </p>
        </div>

        {/* Mascot Greeting Avatar */}
        <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-white/60 z-10">
          <img
            src={getPublicAssetUrl('/學校圖檔/吉祥物/enen_reading.png')}
            alt="校園大使恩恩"
            className="w-14 h-14 object-contain animate-bounce"
          />
          <div className="text-xs">
            <span className="font-black text-slate-900 block">
              恩恩 伴你成長：
            </span>
            <span className="text-slate-600 text-[11px] font-bold">
              「每一次認真反思，都是你最珍貴的收穫！」
            </span>
          </div>
        </div>
      </div>

      {/* 2. DIARY ENTRIES TIMELINE / GRID */}
      {diaries.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8 opacity-60" />
          </div>
          <div>
            <h4 className="text-base font-black text-slate-800">目前尚無已上傳的心靈日記</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              完成每兩循環週的實體日記紙並交給老師掃描後，你的手寫原稿與專屬回饋就會自動出現在這裡喔！
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {diaries.map((diary) => (
            <motion.div
              key={diary.id}
              whileHover={{ y: -4 }}
              className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-amber-400 shadow-sm transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-slate-900">
                      {diary.cycleLabel || `第 ${diary.cycleNumber * 2 - 1}-${diary.cycleNumber * 2} 循環週`}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">
                      ({diary.submissionDate})
                    </span>
                  </div>
                  <span className="bg-amber-100 text-amber-900 font-black text-[10px] px-2.5 py-0.5 rounded-full">
                    ✨ {diary.aiAnalysis?.primaryEmotion || '感恩'}
                  </span>
                </div>

                {/* Transcribed Text */}
                <div className="my-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed font-medium">
                  {diary.transcribedText}
                </div>

                {/* Mascot Encouragement */}
                <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-3 flex items-start gap-2.5">
                  <Heart className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-[11px] text-amber-950 font-bold leading-relaxed">
                    <span className="text-amber-800 font-black">校園大使回饋：</span>
                    {diary.aiAnalysis?.mascotFeedback || '只要相信自己，你就是最棒的！'}
                  </div>
                </div>

                {/* Teacher's Note (if any) */}
                {diary.teacherNotes && (
                  <div className="mt-2 bg-indigo-50/70 border border-indigo-200/70 rounded-2xl p-3 text-[11px] text-indigo-950 font-bold">
                    <span className="text-indigo-800 font-black">班主任心語：</span>
                    {diary.teacherNotes}
                  </div>
                )}
              </div>

              {/* View original scan action */}
              {diary.scanImageUrl && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedDiary(diary)}
                    className="inline-flex items-center gap-1 text-xs font-black text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>查看我的手寫原稿</span>
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* 3. ORIGINAL SCAN POPUP MODAL */}
      {selectedDiary && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                📄 {selectedDiary.cycleLabel} • 手寫原稿回顧
              </h3>
              <button
                type="button"
                onClick={() => setSelectedDiary(null)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto rounded-2xl border border-slate-200 p-2 bg-slate-50 flex items-center justify-center">
              <img
                src={selectedDiary.scanImageUrl}
                alt="手寫原稿"
                className="max-w-full h-auto object-contain rounded-xl"
              />
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => setSelectedDiary(null)}
                className="bg-slate-900 text-white text-xs font-black px-5 py-2.5 rounded-xl cursor-pointer"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
