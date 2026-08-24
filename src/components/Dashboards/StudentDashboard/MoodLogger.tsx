import React, { FormEvent } from 'react';
import { motion } from 'motion/react';
import { Shield } from 'lucide-react';
import { MOOD_EMOJIS } from '../../../constants/moodConstants';
import { formatDateObj } from '../../../utils/dateHelpers';

interface MoodLoggerProps {
  studentMood: number;
  setStudentMood: (m: number) => void;
  studentComment: string;
  setStudentComment: (c: string) => void;
  onSubmit: (e: FormEvent) => void;
  loading: boolean;
}

export const MoodLogger: React.FC<MoodLoggerProps> = ({
  studentMood,
  setStudentMood,
  studentComment,
  setStudentComment,
  onSubmit,
  loading,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl font-sans">
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-white text-center flex items-center justify-between">
        <div className="text-left">
          <span className="text-xs bg-indigo-500 bg-opacity-40 text-indigo-50 px-3 py-1 rounded-full font-bold">每日心情登記 (Auto-Date)</span>
          <h3 className="text-xl font-black mt-1">Hello, 同學！今天過得好嗎？</h3>
        </div>
        <div className="bg-white bg-opacity-15 px-4 py-2 rounded-xl text-right">
          <p className="text-[11px] text-indigo-100 font-bold">登記日期：</p>
          <p className="text-sm font-black text-white">{formatDateObj(new Date())}</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="p-8 space-y-8">
        {/* 10-Point mood rating picker */}
        <div>
          <label className="block text-sm font-black text-[#1E293B] mb-3">
            💡 第一步：請點選你今天的心情指數 (1 為非常低落，10 為超級開心)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => {
              const cell = MOOD_EMOJIS[val];
              const isChosen = studentMood === val;
              return (
                <motion.button
                  whileHover={{ scale: 1.1, rotate: [0, -4, 4, 0] }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  key={val}
                  type="button"
                  onClick={() => setStudentMood(val)}
                  className={`flex flex-col items-center justify-center p-3.5 border rounded-2xl transition-all cursor-pointer relative ${
                    isChosen
                      ? 'border-indigo-600 bg-indigo-50 shadow-md scale-105 ring-2 ring-indigo-300'
                      : 'border-slate-100 bg-white hover:border-indigo-200'
                  }`}
                >
                  <span className="text-3xl">{cell.emoji}</span>
                  <span className={`text-[11px] font-black mt-1 ${isChosen ? 'text-indigo-700' : 'text-slate-500'}`}>
                    {val} 分
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Selected Mood Description Banner */}
          <div className={`mt-4 p-4 rounded-xl border flex items-center gap-3 transition-colors ${MOOD_EMOJIS[studentMood].colorClass}`}>
            <span className="text-3xl">{MOOD_EMOJIS[studentMood].emoji}</span>
            <div>
              <p className={`text-xs font-bold leading-none uppercase tracking-wider text-slate-400`}>心情感受</p>
              <p className={`text-sm font-black mt-1 ${MOOD_EMOJIS[studentMood].textColor}`}>
                {studentMood}分 • {MOOD_EMOJIS[studentMood].desc}
              </p>
            </div>
          </div>
        </div>

        {/* Comment sharing section */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm font-black text-[#1E293B]">
              💬 第二步：有沒有什麼話想跟班導師/社工分享？(非必填)
            </label>
            <span className="text-xs text-slate-400 font-semibold">隨時寫下你的快樂、不開心或小秘密</span>
          </div>
          <textarea
            id="student-comment-textarea"
            placeholder="例如今天考試拿了一百分、或者今天在學校碰到了不開心事情。你寫下的所有字只有老師和社會工作者能看見，請安心寫噢..."
            className="w-full min-h-[140px] p-4 border border-slate-200 rounded-2xl resize-none focus:ring-4 focus:ring-indigo-10 ring-opacity-50 focus:border-indigo-500 focus:outline-none text-sm text-slate-700 leading-relaxed font-bold font-sans"
            value={studentComment}
            onChange={(e) => setStudentComment(e.target.value)}
          />
          <div className="mt-2 bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200 flex items-center gap-2 text-[11px] text-slate-500 font-semibold font-sans">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            本內容受防護。我們內建了校園心理防護演算法，若探測到極度需要輔導傾向，會立即提醒老師。
          </div>
        </div>

        {/* Submission triggers */}
        <div className="pt-2">
          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            id="btn-student-submit-mood"
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-base tracking-widest cursor-pointer shadow-lg hover:shadow-indigo-100 transition-all font-sans"
          >
            {loading ? "極速上傳同步中..." : "📥 確認送出今日心情登記"}
          </motion.button>
        </div>
      </form>
    </div>
  );
};
