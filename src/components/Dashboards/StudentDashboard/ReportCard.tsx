import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Flame, 
  Sparkles, 
  Award, 
  Heart, 
  Smile, 
  X, 
  TrendingUp, 
  CheckCircle2, 
  MessageCircle,
  HelpCircle
} from 'lucide-react';
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
import { getActiveCostume, getRandomCostume, MascotCostume } from '../../../utils/mascotCostumes';
import { getPublicAssetUrl, getWebpUrl } from '../../../utils/assetHelper';
import { getSharedAudioContext } from '../../../utils/audioHelper';

interface ReportCardProps {
  reports: any[];
  selectedClass: string;
  activeStudentNumber: string | number;
  showStudentReport: boolean;
  setShowStudentReport: (s: boolean) => void;
  hideToggleButton?: boolean;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  reports,
  selectedClass,
  activeStudentNumber,
  showStudentReport,
  setShowStudentReport,
  hideToggleButton = false,
}) => {
  // Calendar View Month State (Defaults automatically to current year & month)
  const [viewDate, setViewDate] = useState<Date>(() => new Date());
  
  // Selected day record for inspection modal
  const [selectedDayRecord, setSelectedDayRecord] = useState<any | null>(null);

  // Mascot costume state (randomizes on load and on click)
  const [currentCostume, setCurrentCostume] = useState<MascotCostume>(() => getRandomCostume());
  const [mascotBounce, setMascotBounce] = useState(false);

  // View mode toggle: 'CALENDAR' | 'TREND'
  const [subView, setSubView] = useState<'CALENDAR' | 'TREND'>('CALENDAR');

  const playSound = (freq = 600, duration = 0.1) => {
    try {
      const ctx = getSharedAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {}
  };

  // Switch costume when clicking mascot
  const handleMascotClick = () => {
    playSound(880, 0.12);
    setMascotBounce(true);
    setTimeout(() => setMascotBounce(false), 600);
    const next = getRandomCostume(currentCostume.id);
    setCurrentCostume(next);
  };

  // Filter personal mood logs
  const personalReports = useMemo(() => {
    return reports.filter((r: any) => {
      const rClass = (r.class || r.班別 || '').toUpperCase();
      const rStudentNo = String(r.studentNumber || r.學號 || '');
      return rClass === selectedClass.toUpperCase() && rStudentNo === String(activeStudentNumber);
    });
  }, [reports, selectedClass, activeStudentNumber]);

  // Index reports by formatted display date (YYYY/M/D) for O(1) calendar lookups
  const recordsByDate = useMemo(() => {
    const map = new Map<string, any>();
    personalReports.forEach((r: any) => {
      const dStr = getDisplayDate(r);
      if (dStr && dStr !== 'INVALID_DATE') {
        map.set(dStr, r);
      }
    });
    return map;
  }, [personalReports]);

  // Calendar Geometry for currently viewed month
  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth() + 1; // 1-12
  const daysInCurrentMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 is Sunday

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === currentYear && (today.getMonth() + 1) === currentMonth;
  const todayDateNum = today.getDate();

  // Streak Calculation
  const { currentStreak, totalMonthlyCount, avgRecentMood } = useMemo(() => {
    let streak = 0;
    const checkDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayKey = `${checkDate.getFullYear()}/${checkDate.getMonth() + 1}/${checkDate.getDate()}`;
    
    // If not filled in today yet, check starting from yesterday to preserve streak
    if (!recordsByDate.has(todayKey)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const key = `${checkDate.getFullYear()}/${checkDate.getMonth() + 1}/${checkDate.getDate()}`;
      if (recordsByDate.has(key)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Monthly recorded count
    let monthCount = 0;
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const key = `${currentYear}/${currentMonth}/${d}`;
      if (recordsByDate.has(key)) {
        monthCount++;
      }
    }

    // Average recent mood (last 7 logs)
    const sortedDesc = [...personalReports].sort((a, b) => getUnixTime(b) - getUnixTime(a));
    const recentScores = sortedDesc
      .slice(0, 7)
      .map(r => parseInt(r.moodScore || r.心情指數 || '5'))
      .filter(n => !isNaN(n) && n > 0);
    const avg = recentScores.length > 0
      ? (recentScores.reduce((acc, s) => acc + s, 0) / recentScores.length).toFixed(1)
      : '5.0';

    return {
      currentStreak: streak,
      totalMonthlyCount: monthCount,
      avgRecentMood: parseFloat(avg),
    };
  }, [recordsByDate, personalReports, currentYear, currentMonth, daysInCurrentMonth, today]);

  // Dynamic Encouragement Text depending on recent scores
  const speechBubbleText = useMemo(() => {
    if (personalReports.length === 0) {
      return `哈囉！我是${currentCostume.name}恩恩！每天記錄心情就像在心靈花園種下一顆小種子，快來蓋上你專屬的心情印章吧！✨🎒`;
    }
    if (avgRecentMood >= 7.5) {
      return `哇！最近你笑容滿面、充滿自信！恩恩看到你這麼棒也跟著活力滿滿！要繼續發光發熱喔！🌟🌻`;
    }
    if (avgRecentMood >= 6.0) {
      return `做得很棒！近期心情晴朗平穩。放學後別忘了多深呼吸、看看綠樹，好好享受校園生活喔！☀️🎒`;
    }
    if (avgRecentMood >= 4.0) {
      return `今天辛苦啦！每一天都是獨一無二的經歷，無論開心或有一點累，恩恩和老師都在這裡陪伴你～🍵🍪`;
    }
    return `抱抱你～別把煩惱藏在心底，恩恩和老師永遠在這裡關心你、守護你。給自己一個溫柔的擁抱，明天太陽依然會為你升起！💖🌈`;
  }, [personalReports.length, avgRecentMood, currentCostume.name]);

  const handlePrevMonth = () => {
    playSound(520, 0.08);
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    playSound(680, 0.08);
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleResetToCurrentMonth = () => {
    playSound(800, 0.1);
    setViewDate(new Date());
  };

  return (
    <div className={`${hideToggleButton ? 'mt-2 pt-0' : 'mt-8 pt-6 border-t border-slate-100'} text-left font-sans`}>
      {!hideToggleButton && (
        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={() => setShowStudentReport(!showStudentReport)}
            className="bg-amber-50 hover:bg-amber-100 text-amber-800 border-2 border-amber-300 px-6 py-3 rounded-2xl font-black text-sm tracking-wide transition-all shadow-md cursor-pointer flex items-center gap-2"
          >
            <CalendarIcon className="w-4 h-4 text-amber-600" />
            <span>{showStudentReport ? "🙈 收起個人心情月曆報告" : "📅 查看個人情緒月曆 & 心聲打卡"}</span>
          </button>
        </div>
      )}

      {(showStudentReport || hideToggleButton) && (
        <div className="space-y-6">
          {/* ========================================================================= */}
          {/* 1. CARTOON STREAK & ENCOURAGEMENT BANNER                                 */}
          {/* ========================================================================= */}
          <div className="bg-gradient-to-r from-amber-100/90 via-orange-50/90 to-amber-100/90 border-3 border-amber-300 rounded-3xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
            {/* Background sparkle accents */}
            <div className="absolute top-2 right-4 text-amber-400/40 pointer-events-none text-4xl select-none">✨</div>
            <div className="absolute bottom-1 right-24 text-orange-300/30 pointer-events-none text-3xl select-none">🌸</div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-amber-300 text-amber-900 font-black text-xs shadow-xs">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>天主教善導小學 · 心靈打卡站</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-amber-950 flex items-center gap-2">
                  <span>{selectedClass} 班 {activeStudentNumber} 號的心情成長月曆</span>
                  <span className="text-base">🎒</span>
                </h3>
                <p className="text-xs font-bold text-amber-800 leading-relaxed max-w-xl">
                  記錄心情就像給心靈花園澆水，堅持打卡能讓你更了解自己，每一天你都在茁壯成長！🌱
                </p>
              </div>

              {/* Streak Counters */}
              <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 w-full sm:w-auto">
                {/* Consecutive Streak Badge */}
                <div className="flex-1 sm:flex-none flex items-center gap-2 px-3.5 py-2.5 bg-white/95 rounded-2xl border-2 border-orange-300 shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <Flame className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-orange-800 uppercase tracking-tight">連續打卡</div>
                    <div className="text-base sm:text-lg font-black text-orange-600 font-mono leading-none">
                      {currentStreak} <span className="text-xs font-sans text-orange-700">天</span>
                    </div>
                  </div>
                </div>

                {/* Monthly Total Badge */}
                <div className="flex-1 sm:flex-none flex items-center gap-2 px-3.5 py-2.5 bg-white/95 rounded-2xl border-2 border-emerald-300 shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-emerald-800 uppercase tracking-tight">本月累積</div>
                    <div className="text-base sm:text-lg font-black text-emerald-600 font-mono leading-none">
                      {totalMonthlyCount} <span className="text-xs font-sans text-emerald-700">次</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. CARTOON MONTHLY CALENDAR VIEW                                          */}
          {/* ========================================================================= */}
          <div className="bg-white/90 backdrop-blur-md border-3 border-amber-200 rounded-3xl p-4 sm:p-6 shadow-xl relative">
            {/* Calendar Controls & Month Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b-2 border-amber-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-2 sm:p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-amber-900 transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
                  title="查看上個月記錄"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <div className="px-4 py-1.5 rounded-2xl bg-amber-50/80 border-2 border-amber-200 flex items-center gap-2 shadow-inner">
                  <CalendarIcon className="w-4 h-4 text-amber-600" />
                  <span className="font-black text-base sm:text-lg text-slate-800 tracking-wide">
                    {currentYear} 年 {currentMonth} 月
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-2 sm:p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-amber-900 transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
                  title="查看下個月記錄"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {!isCurrentMonth && (
                  <button
                    type="button"
                    onClick={handleResetToCurrentMonth}
                    className="text-xs font-black text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs ml-1"
                  >
                    返回本月
                  </button>
                )}
              </div>

              {/* Sub-view switcher: Calendar vs Trend Curve */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSubView('CALENDAR')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    subView === 'CALENDAR'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>打卡月曆</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSubView('TREND')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    subView === 'TREND'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>走勢圖</span>
                </button>
              </div>
            </div>

            {subView === 'CALENDAR' ? (
              <div className="space-y-3">
                {/* Weekday Header */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-black select-none">
                  <div className="py-2 text-rose-500 bg-rose-50/70 rounded-xl border border-rose-200/50">週日</div>
                  <div className="py-2 text-slate-700 bg-slate-50/70 rounded-xl border border-slate-200/50">週一</div>
                  <div className="py-2 text-slate-700 bg-slate-50/70 rounded-xl border border-slate-200/50">週二</div>
                  <div className="py-2 text-slate-700 bg-slate-50/70 rounded-xl border border-slate-200/50">週三</div>
                  <div className="py-2 text-slate-700 bg-slate-50/70 rounded-xl border border-slate-200/50">週四</div>
                  <div className="py-2 text-slate-700 bg-slate-50/70 rounded-xl border border-slate-200/50">週五</div>
                  <div className="py-2 text-blue-600 bg-blue-50/70 rounded-xl border border-blue-200/50">週六</div>
                </div>

                {/* Days of Month Grid */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {/* Empty slots for days before 1st of month */}
                  {[...Array(firstDayOfWeek)].map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="min-h-[70px] sm:min-h-[92px] rounded-2xl bg-slate-50/40 border border-dashed border-slate-200/50"
                    />
                  ))}

                  {/* Day Cells */}
                  {[...Array(daysInCurrentMonth)].map((_, i) => {
                    const dayNum = i + 1;
                    const dateKey = `${currentYear}/${currentMonth}/${dayNum}`;
                    const record = recordsByDate.get(dateKey);
                    const isToday = isCurrentMonth && dayNum === todayDateNum;
                    const isFuture = isCurrentMonth && dayNum > todayDateNum;
                    
                    const moodVal = record ? parseInt(record.moodScore || record.心情指數 || '5') : null;
                    const moodItem = moodVal ? MOOD_EMOJIS[moodVal] : null;

                    return (
                      <motion.div
                        key={`day-${dayNum}`}
                        whileHover={record ? { scale: 1.03 } : {}}
                        whileTap={record ? { scale: 0.98 } : {}}
                        onClick={() => {
                          if (record) {
                            playSound(750, 0.1);
                            setSelectedDayRecord({ ...record, dateKey });
                          }
                        }}
                        className={`min-h-[70px] sm:min-h-[92px] rounded-2xl p-1.5 sm:p-2 border-2 transition-all flex flex-col justify-between relative overflow-hidden ${
                          record
                            ? 'bg-gradient-to-b from-amber-50 to-orange-50/60 border-amber-300 shadow-xs hover:shadow-md cursor-pointer'
                            : isToday
                              ? 'bg-amber-100/50 border-dashed border-amber-400 shadow-inner'
                              : isFuture
                                ? 'bg-slate-50/40 border-slate-200/60 opacity-60'
                                : 'bg-slate-50/60 border-slate-200/80'
                        }`}
                      >
                        {/* Day Number Header */}
                        <div className="flex items-center justify-between text-xs font-black">
                          <span
                            className={`px-1.5 py-0.5 rounded-lg ${
                              isToday
                                ? 'bg-amber-500 text-white font-mono shadow-xs'
                                : 'text-slate-700'
                            }`}
                          >
                            {dayNum}
                          </span>
                          {record && (
                            <span className="text-[10px] text-amber-700 font-black hidden sm:inline">
                              {moodVal}分
                            </span>
                          )}
                        </div>

                        {/* Cell Body: Stamped Postmark vs Empty State */}
                        <div className="flex-1 flex items-center justify-center py-1">
                          {record && moodItem ? (
                            /* CARTOON REWARD STAMP (印章效果) */
                            <div className="relative flex flex-col items-center">
                              <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-dashed border-emerald-500 bg-emerald-50/90 p-0.5 flex flex-col items-center justify-center shadow-xs rotate-[-4deg] group-hover:rotate-0 transition-transform"
                              >
                                <span className="text-base sm:text-xl drop-shadow-xs leading-none">
                                  {moodItem.emoji}
                                </span>
                                <span className="text-[8px] font-black text-emerald-800 font-mono leading-none mt-0.5">
                                  已蓋章
                                </span>
                              </motion.div>
                            </div>
                          ) : isToday ? (
                            <div className="text-center">
                              <span className="text-xs sm:text-sm animate-bounce inline-block">✏️</span>
                              <div className="text-[9px] font-black text-amber-700 leading-tight hidden sm:block">
                                今日待記錄
                              </div>
                            </div>
                          ) : isFuture ? (
                            <div className="text-[10px] text-slate-300 font-bold">未來</div>
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-slate-200" />
                          )}
                        </div>

                        {/* Comment Indicator Dot */}
                        {record && (record.comment || record.有事情想向老師分享) && (
                          <div className="flex justify-center">
                            <span className="text-[9px] text-amber-700 bg-amber-200/80 px-1 rounded font-bold truncate max-w-full">
                              💬 悄悄話
                            </span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* ========================================================================= */
              /* SUB-VIEW B: 30-DAY MOOD TREND CURVE                                       */
              /* ========================================================================= */
              <div className="space-y-4">
                <div className="h-56 bg-slate-50/80 p-4 rounded-2xl border-2 border-slate-200">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={personalReports
                        .sort((a, b) => getUnixTime(a) - getUnixTime(b))
                        .map((e: any) => ({
                          date: getDisplayDate(e).split('/').slice(1).join('/'),
                          mood: parseInt(e.moodScore || e.心情指數 || '5'),
                        }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} fontStyle="bold" />
                      <YAxis domain={[0, 10]} stroke="#94a3b8" fontSize={11} />
                      <Tooltip contentStyle={{ borderRadius: '14px', fontSize: '12px', fontWeight: 'bold' }} />
                      <Line
                        type="monotone"
                        dataKey="mood"
                        stroke="#059669"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#059669' }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 3. MASCOT COMPANION ON LEFT BOTTOM CORNER WITH SPEECH BUBBLE               */}
            {/* ========================================================================= */}
            <div className="mt-8 pt-5 border-t-2 border-amber-100 flex flex-col md:flex-row items-center md:items-end justify-between gap-4">
              <div className="flex items-center sm:items-end gap-3 sm:gap-4 w-full md:w-auto">
                {/* Bouncy Mascot Sprite */}
                <div className="relative shrink-0 flex flex-col items-center">
                  <motion.div
                    animate={
                      mascotBounce
                        ? { y: [0, -22, 0, -10, 0], scale: [1, 1.15, 0.95, 1.05, 1] }
                        : { y: [0, -8, 0], rotate: [-2, 2, -2] }
                    }
                    transition={{
                      duration: mascotBounce ? 0.6 : 2.4,
                      repeat: mascotBounce ? 0 : Infinity,
                      ease: 'easeInOut',
                    }}
                    onClick={handleMascotClick}
                    className="cursor-pointer group relative"
                    title="點我換造型喔！"
                  >
                    {/* Glow aura */}
                    <div className="absolute inset-0 bg-amber-300/40 rounded-full blur-lg group-hover:scale-125 transition-transform" />
                    
                    <picture>
                      <source srcSet={getWebpUrl(currentCostume.imagePath)} type="image/webp" />
                      <img
                        src={getPublicAssetUrl(currentCostume.imagePath)}
                        alt={currentCostume.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md relative z-10 select-none group-hover:scale-110 transition-transform"
                      />
                    </picture>

                    {/* Change costume quick indicator */}
                    <span className="absolute -bottom-1 -right-1 z-20 text-[10px] bg-white border border-amber-300 text-amber-900 font-black px-1.5 py-0.2 rounded-full shadow-xs">
                      換裝👗
                    </span>
                  </motion.div>
                </div>

                {/* Animated Speech Bubble (Word Box) */}
                <motion.div
                  key={currentCostume.id}
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative flex-1 bg-amber-50 border-2 border-amber-300 rounded-2xl p-3 sm:p-3.5 shadow-md max-w-xl text-left"
                >
                  {/* Bubble tail pointing to the mascot */}
                  <div className="hidden sm:block absolute -left-2.5 bottom-5 w-0 h-0 border-t-6 border-t-transparent border-r-8 border-r-amber-300 border-b-6 border-b-transparent" />
                  <div className="hidden sm:block absolute -left-2 bottom-5 w-0 h-0 border-t-5 border-t-transparent border-r-7 border-r-amber-50 border-b-5 border-b-transparent" />

                  <div className="flex items-center gap-1.5 mb-1 text-[11px] font-black text-amber-900">
                    <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-950 font-black text-[10px]">
                      {currentCostume.name} 恩恩叮嚀
                    </span>
                    <span className="text-amber-600 font-bold">（點恩恩換造型喔！）</span>
                  </div>
                  <p className="text-xs sm:text-[13px] font-bold text-slate-700 leading-relaxed">
                    {speechBubbleText}
                  </p>
                </motion.div>
              </div>

              {/* Average score indicator */}
              <div className="text-right shrink-0 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-600 w-full md:w-auto flex md:flex-col justify-between items-center md:items-end">
                <span>近期 7 次平均心情</span>
                <span className="text-base font-black text-emerald-700 font-mono">
                  {avgRecentMood} / 10 分
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. DETAIL RECORD INSPECTION POPUP MODAL                                     */}
          {/* ========================================================================= */}
          <AnimatePresence>
            {selectedDayRecord && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
                onClick={() => setSelectedDayRecord(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 15 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 15 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white border-3 border-amber-300 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl relative text-left"
                >
                  {/* Close button */}
                  <button
                    type="button"
                    onClick={() => setSelectedDayRecord(null)}
                    className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">📅</span>
                    <div>
                      <h4 className="font-black text-slate-800 text-base">
                        {selectedDayRecord.dateKey} 的心情記錄
                      </h4>
                      <p className="text-[11px] font-bold text-slate-500">
                        {selectedClass} 班 {activeStudentNumber} 號
                      </p>
                    </div>
                  </div>

                  {/* Stamp Badge Showcase */}
                  <div className="my-4 p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full border-2 border-dashed border-emerald-500 bg-white flex flex-col items-center justify-center shadow-xs">
                      <span className="text-2xl">
                        {MOOD_EMOJIS[parseInt(selectedDayRecord.moodScore || selectedDayRecord.心情指數 || '5')]?.emoji || '😊'}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-black text-emerald-800">
                        當天心情指數：{selectedDayRecord.moodScore || selectedDayRecord.心情指數 || '5'} 分
                      </div>
                      <div className="text-[11px] font-bold text-slate-600 mt-0.5">
                        {MOOD_EMOJIS[parseInt(selectedDayRecord.moodScore || selectedDayRecord.心情指數 || '5')]?.desc || '平靜溫暖'}
                      </div>
                    </div>
                  </div>

                  {/* Comment / 悄悄話 */}
                  <div className="space-y-1 mb-5">
                    <div className="text-xs font-black text-slate-700 flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>給老師的悄悄話：</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold leading-relaxed">
                      {(selectedDayRecord.comment || selectedDayRecord.有事情想向老師分享 || '').trim() 
                        ? `「 ${selectedDayRecord.comment || selectedDayRecord.有事情想向老師分享} 」`
                        : '當天沒有填寫額外悄悄話，記錄一切順利正常喔！'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedDayRecord(null)}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                  >
                    關閉查看
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ReportCard;
