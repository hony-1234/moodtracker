import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  LayoutDashboard, 
  LogOut, 
  ShieldCheck, 
  TrendingUp, 
  BookOpen, 
  Calendar, 
  Sun, 
  Cloud, 
  CloudRain, 
  RotateCcw,
  BatteryCharging,
  Heart,
  Smile,
  Compass
} from 'lucide-react';
import { getPublicAssetUrl, getWebpUrl } from '../../utils/assetHelper';
import { getSharedAudioContext } from '../../utils/audioHelper';
import { formatDateObj } from '../../utils/dateHelpers';
import { MOOD_EMOJIS } from '../../constants/moodConstants';
import { findStudentByClassAndNumber, findStudentByGoogleEmail } from '../../data/studentsRoster';
import { auth } from '../../firebase/config';
import { FourRsStation } from '../Dashboards/StudentDashboard/FourRsStation';
import { ReportCard } from '../Dashboards/StudentDashboard/ReportCard';
import { StudentDiariesTab } from '../Dashboards/StudentDashboard/StudentDiariesTab';

interface ClassroomBookExperienceProps {
  selectedClass: string;
  activeStudentNumber: string | number;
  studentMood: number;
  setStudentMood: (m: number) => void;
  studentComment: string;
  setStudentComment: (c: string) => void;
  studentSuccessMessage: boolean;
  setStudentSuccessMessage: (val: boolean) => void;
  handleStudentReportSubmit: (e: FormEvent) => void;
  loading: boolean;
  handleLogout: () => void;
  onSwitchToDashboard: (tab?: 'MOOD' | 'REPORT' | 'DIARIES') => void;
  reports?: any[];
  showStudentReport?: boolean;
  setShowStudentReport?: (s: boolean) => void;
}

export type CartoonExperienceTab = 'MOOD' | 'CHARGING_STATION' | 'REPORT' | 'DIARIES';

type AnimationPhase = 
  | 'ENTERING_CLASSROOM'
  | 'BOOK_APPEARING'
  | 'BOOK_OPENING'
  | 'RECORDING'
  | 'STAMPING';

export default function ClassroomBookExperience({
  selectedClass,
  activeStudentNumber,
  studentMood,
  setStudentMood,
  studentComment,
  setStudentComment,
  studentSuccessMessage,
  setStudentSuccessMessage,
  handleStudentReportSubmit,
  loading,
  handleLogout,
  onSwitchToDashboard,
  reports = [],
  showStudentReport = true,
  setShowStudentReport
}: ClassroomBookExperienceProps) {
  const [cartoonTab, setCartoonTab] = useState<CartoonExperienceTab>('MOOD');
  const [phase, setPhase] = useState<AnimationPhase>(
    studentSuccessMessage ? 'STAMPING' : 'BOOK_APPEARING'
  );
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedWeather, setSelectedWeather] = useState<'SUNNY' | 'CLOUDY' | 'RAINY' | 'RAINBOW'>('SUNNY');
  const [stampLanded, setStampLanded] = useState(studentSuccessMessage);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const currentUser = auth.currentUser;
  const studentProfile = findStudentByClassAndNumber(selectedClass, activeStudentNumber) || 
    (currentUser?.email ? findStudentByGoogleEmail(currentUser.email) : undefined);

  const studentDisplayName = studentProfile 
    ? `${studentProfile.chineseName}` 
    : `${selectedClass} 班 ${activeStudentNumber} 號同學`;

  const studentFormattedNumber = `${selectedClass}${String(activeStudentNumber).padStart(2, '0')}`;

  const playSound = (type: 'chime' | 'book_thud' | 'page_turn' | 'pop' | 'stamp') => {
    if (!soundEnabled) return;
    try {
      const ctx = getSharedAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      if (type === 'chime') {
        const freqs = [523.25, 659.25, 783.99, 1046.5];
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.15);
          gain.gain.setValueAtTime(0.08, now + idx * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.15);
          osc.stop(now + idx * 0.15 + 0.65);
        });
      } else if (type === 'book_thud') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.22);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.23);
      } else if (type === 'page_turn') {
        const bufferSize = ctx.sampleRate * 0.35;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.3);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + 0.35);
      } else if (type === 'pop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'stamp') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);

        [880, 1318.5, 1760].forEach((f, i) => {
          const sOsc = ctx.createOscillator();
          const sGain = ctx.createGain();
          sOsc.type = 'sine';
          sOsc.frequency.setValueAtTime(f, now + 0.08 + i * 0.06);
          sGain.gain.setValueAtTime(0.1, now + 0.08 + i * 0.06);
          sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08 + i * 0.06 + 0.5);
          sOsc.connect(sGain);
          sGain.connect(ctx.destination);
          sOsc.start(now + 0.08 + i * 0.06);
          sOsc.stop(now + 0.08 + i * 0.06 + 0.55);
        });
      }
    } catch (e) {}
  };

  const handleOpenBook = () => {
    playSound('page_turn');
    setPhase('RECORDING');
  };

  useEffect(() => {
    if (studentSuccessMessage) {
      setPhase('STAMPING');
      setStampLanded(true);
      return;
    }

    playSound('book_thud');
    // Remain at BOOK_APPEARING so the student clicks to open the book!
  }, []);

  useEffect(() => {
    if (studentSuccessMessage) {
      setPhase('STAMPING');
      playSound('stamp');
      const stampTimer = setTimeout(() => {
        setStampLanded(true);
      }, 350);
      return () => clearTimeout(stampTimer);
    }
  }, [studentSuccessMessage]);

  const handleMoodSelect = (val: number) => {
    setStudentMood(val);
    playSound('pop');
  };

  const handleQuickTagClick = (tagText: string) => {
    playSound('pop');
    const trimmed = (studentComment || '').trim();
    if (!trimmed) {
      setStudentComment(tagText);
    } else if (!trimmed.includes(tagText)) {
      setStudentComment(`${trimmed}，${tagText}`);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    playSound('stamp');
    handleStudentReportSubmit(e);
  };

  const handleResetForEdit = () => {
    setStudentSuccessMessage(false);
    setStampLanded(false);
    setPhase('RECORDING');
    playSound('page_turn');
  };

  const handleSelectTab = (tab: CartoonExperienceTab) => {
    setCartoonTab(tab);
    playSound('page_turn');
    if (tab === 'MOOD' && (phase === 'ENTERING_CLASSROOM' || phase === 'BOOK_APPEARING')) {
      setPhase('RECORDING');
    }
  };

  const quickTags = [
    { label: '🌈 今天學到新知識', desc: '學習收穫' },
    { label: '⚽ 操場玩得好開心', desc: '課外運動' },
    { label: '🍱 午餐美味大滿足', desc: '生活感恩' },
    { label: '🎨 視藝手作好有成就', desc: '美勞創作' },
    { label: '😴 今天感覺有些疲倦', desc: '需要休息' },
    { label: '💭 心裡有事想告訴老師', desc: '悄悄話' },
  ];

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto overflow-x-hidden select-none bg-amber-50 font-sans flex flex-col justify-between">
      {/* 1. CLASSROOM BACKGROUND & AMBIANCE */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          initial={{ scale: 1.25, opacity: 0.8 }}
          animate={{
            scale: phase === 'ENTERING_CLASSROOM' ? [1.25, 1.08, 1.0] : 1.0,
            opacity: 1,
            y: phase === 'ENTERING_CLASSROOM' ? [25, 5, 0] : 0,
          }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 w-full h-full"
        >
          <picture>
            <source srcSet={getWebpUrl('/學校圖檔/教室/classroom_cartoon_backdrop.png')} type="image/webp" />
            <img
              src={getPublicAssetUrl('/學校圖檔/教室/classroom_cartoon_backdrop.png')}
              alt="天主教善導小學卡通教室全景"
              className="w-full h-full object-cover object-bottom"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-amber-900/25 via-amber-100/10 to-sky-300/15 mix-blend-soft-light" />
        </motion.div>

        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2.5 h-2.5 rounded-full bg-amber-300/50 blur-[0.8px]"
              style={{
                left: `${15 + i * 15}%`,
                top: `${30 + (i % 3) * 18}%`,
              }}
              animate={{
                y: [0, -35, 0],
                x: [0, (i % 2 === 0 ? 12 : -12), 0],
                opacity: [0.2, 0.7, 0.2],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 4.5 + i * 0.8,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.4,
              }}
            />
          ))}
        </div>
      </div>

      {/* 2. TOP FLOATING UTILITY BAR */}
      <header className="relative z-30 px-3 py-2 sm:px-6 sm:py-3 bg-white/85 backdrop-blur-md border-b border-amber-200/60 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        {/* Top Tier (Mobile/Tablet) or Left Tier (Desktop): School Info + Quick Action Buttons on Mobile */}
        <div className="flex items-center justify-between w-full lg:w-auto">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-xl shadow-xs p-1 flex items-center justify-center border border-amber-200 shrink-0">
              <img
                src={getPublicAssetUrl('/學校圖檔/學校logo/school_logo.png')}
                alt="校徽"
                className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-sm font-black text-slate-800">
                  天主教善導小學 · 溫暖教室
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full border border-amber-200">
                  4Rs 心靈空間
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-semibold">
                歡迎你，{selectedClass} 班 {activeStudentNumber} 號 {studentDisplayName}
              </p>
            </div>
          </div>

          {/* Quick Controls shown on top row for screens < lg */}
          <div className="flex lg:hidden items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                window.dispatchEvent(new CustomEvent('gccps:toggle-bgm'));
              }}
              className="p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200 transition-colors cursor-pointer shadow-xs"
              title={soundEnabled ? '音效與音樂已開啟 (點擊關閉)' : '音效與音樂已關閉 (點擊開啟)'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            </button>
            <button
              type="button"
              data-role="switch-to-dashboard-btn"
              onClick={() => onSwitchToDashboard('MOOD')}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-700 bg-white/80 hover:bg-white border border-slate-200 transition-all cursor-pointer shadow-xs flex items-center gap-1"
              title="切換至標準條列儀表板"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">切換標準面板</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-red-600 bg-white/80 hover:bg-white border border-slate-200 transition-all cursor-pointer shadow-xs flex items-center gap-1"
              title="登出帳號"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">登出</span>
            </button>
          </div>
        </div>

        {/* CARTOON VIEW QUICK TABS: Horizontally scrollable on mobile/tablet */}
        <div className="flex items-center gap-1 sm:gap-1.5 bg-amber-900/10 p-1 rounded-2xl border border-amber-900/15 overflow-x-auto no-scrollbar w-full lg:w-auto justify-start lg:justify-center">
          <button
            type="button"
            data-tab="MOOD"
            onClick={() => handleSelectTab('MOOD')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
              cartoonTab === 'MOOD'
                ? 'bg-amber-500 text-amber-950 shadow-xs'
                : 'text-amber-950/70 hover:bg-white/50'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-800" />
            <span>☀️ 今日心情日記</span>
          </button>
          <button
            type="button"
            data-tab="CHARGING_STATION"
            onClick={() => handleSelectTab('CHARGING_STATION')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
              cartoonTab === 'CHARGING_STATION'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-amber-950/70 hover:bg-white/50'
            }`}
          >
            <BatteryCharging className="w-3.5 h-3.5" />
            <span>🔋 4R充電站</span>
          </button>
          <button
            type="button"
            data-tab="REPORT"
            onClick={() => handleSelectTab('REPORT')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
              cartoonTab === 'REPORT'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-amber-950/70 hover:bg-white/50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>📈 情緒報告</span>
          </button>
          <button
            type="button"
            data-tab="DIARIES"
            onClick={() => {
              alert("🚧 4Rs 心靈日記正在精心籌備中 (In Development)，即將正式開放，敬請期待喔！✨");
            }}
            className="relative px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-not-allowed text-slate-500 bg-slate-100/80 hover:bg-slate-200/80 border border-slate-300 shadow-3xs shrink-0 select-none group"
            title="4Rs 心靈日記正在籌備中 (In Development)"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>📖 心靈日記</span>
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-950 uppercase tracking-tight shadow-3xs flex items-center gap-0.5">
              <span>🚧</span>
              <span>籌備中</span>
            </span>
          </button>
        </div>

        {/* Desktop-only action controls */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              window.dispatchEvent(new CustomEvent('gccps:toggle-bgm'));
            }}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200 transition-colors cursor-pointer shadow-xs"
            title={soundEnabled ? '音效與音樂已開啟 (點擊關閉)' : '音效與音樂已關閉 (點擊開啟)'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          <button
            type="button"
            data-role="switch-to-dashboard-btn"
            onClick={() => onSwitchToDashboard('MOOD')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-700 bg-white/80 hover:bg-white border border-slate-200 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
            title="切換至標準條列儀表板"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600" />
            <span>切換標準面板</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-red-600 bg-white/80 hover:bg-white border border-slate-200 transition-all cursor-pointer shadow-xs flex items-center gap-1"
            title="登出帳號"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>登出</span>
          </button>
        </div>
      </header>

      {/* 3. CENTERSTAGE: WOODEN DESK & 3D UNFOLDING JOURNAL */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 my-auto w-full">
        {/* Phase A & B & C & D: When cartoonTab === 'MOOD' */}
        {cartoonTab === 'MOOD' && (
          <>
            {/* Phase B: CLOSED BOOK ON DESK - CLICK TO OPEN */}
            {phase === 'BOOK_APPEARING' && (
              <motion.div
                data-role="closed-book-cover"
                initial={{ opacity: 0, y: -30, scale: 0.9, rotate: -2 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                className="flex flex-col items-center cursor-pointer group my-auto py-4 select-none"
                onClick={handleOpenBook}
              >
                <div className="relative">
                  <picture>
                    <source srcSet={getWebpUrl('/學校圖檔/教室/cartoon_journal_cover.png')} type="image/webp" />
                    <img
                      src={getPublicAssetUrl('/學校圖檔/教室/cartoon_journal_cover.png')}
                      alt="精裝心情日記"
                      className="w-72 sm:w-88 md:w-96 lg:w-[420px] h-auto drop-shadow-[0_20px_35px_rgba(70,35,10,0.4)] transition-all duration-300 group-hover:scale-103 group-hover:-rotate-1"
                    />
                  </picture>
                  <div className="absolute top-[58%] inset-x-8 text-center bg-amber-950/55 backdrop-blur-xs py-2 px-3 rounded-lg border border-amber-300/40 shadow-inner">
                    <p className="text-amber-200 text-xs font-serif font-black tracking-widest">
                      {selectedClass} 班 {activeStudentNumber} 號
                    </p>
                    <p className="text-white text-sm sm:text-base font-black mt-0.5 tracking-wider">
                      {studentDisplayName} 的心情日記
                    </p>
                  </div>
                </div>
                <motion.button
                  type="button"
                  data-role="click-to-open-btn"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
                  className="mt-6 text-sm font-black text-amber-950 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 px-6 py-2.5 rounded-full shadow-lg border-2 border-amber-400 flex items-center gap-2 cursor-pointer group-hover:scale-105 transition-transform"
                >
                  <Sparkles className="w-5 h-5 text-amber-700 animate-spin" />
                  <span>點擊翻開日記本 📖 (Click to Open)</span>
                </motion.button>
              </motion.div>
            )}

        {/* Phase C & D: OPEN JOURNAL SPREAD (DOUBLE PAGE) */}
        {(phase === 'BOOK_OPENING' || phase === 'RECORDING' || phase === 'STAMPING') && (
          <motion.div
            data-role="open-journal-spread"
            initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-5xl"
          >
            <div className="relative bg-[#FBF7EE] border-4 border-[#5A3825] rounded-3xl md:rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(60,30,10,0.45)] overflow-hidden">
              
              {/* Center Spine Fold */}
              <div className="hidden md:block absolute inset-y-0 left-1/2 w-10 -ml-5 z-20 pointer-events-none bg-gradient-to-r from-black/15 via-black/5 to-black/15" />
              <div className="hidden md:block absolute inset-y-0 left-1/2 w-1 -ml-0.5 z-20 pointer-events-none bg-[#784A30]/30 shadow-sm" />

              {/* Bookmark Ribbon */}
              <div className="absolute top-0 left-1/2 -ml-3 w-6 h-12 z-30 pointer-events-none bg-gradient-to-b from-amber-600 to-amber-500 rounded-b-md shadow-md border-x border-b border-amber-700/40">
                <div className="w-full h-full flex items-end justify-center pb-1">
                  <div className="w-2 h-2 bg-amber-400 rotate-45" />
                </div>
              </div>

              {/* TWO OPEN PAGES GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-amber-200/80">
                
                {/* LEFT PAGE: MOOD SCORES (1 - 10) & WEATHER STAMP */}
                <div className="p-5 sm:p-7 md:p-8 flex flex-col justify-between relative bg-[#FCF9F2]">
                  <div className="absolute -top-1 left-6 w-24 h-6 bg-amber-200/80 rotate-[-3deg] shadow-xs border-x border-amber-300/60 rounded-xs pointer-events-none" />

                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-amber-200 mb-4">
                      <div>
                        <div className="flex items-center gap-1.5 text-amber-900 font-black text-sm">
                          <Calendar className="w-4 h-4 text-amber-600" />
                          <span>{formatDateObj(new Date())}</span>
                        </div>
                        <p className="text-[11px] font-bold text-amber-700/80 mt-0.5">
                          {selectedClass} 班 {activeStudentNumber} 號 · {studentDisplayName}
                        </p>
                      </div>

                      {/* Weather Picker */}
                      <div className="flex items-center gap-1 bg-amber-100/70 p-1 rounded-xl border border-amber-200">
                        <button
                          type="button"
                          onClick={() => { setSelectedWeather('SUNNY'); playSound('pop'); }}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            selectedWeather === 'SUNNY' ? 'bg-white shadow-xs text-amber-500' : 'text-slate-400 hover:text-slate-600'
                          }`}
                          title="晴天"
                        >
                          <Sun className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => { setSelectedWeather('CLOUDY'); playSound('pop'); }}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            selectedWeather === 'CLOUDY' ? 'bg-white shadow-xs text-sky-500' : 'text-slate-400 hover:text-slate-600'
                          }`}
                          title="多雲"
                        >
                          <Cloud className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => { setSelectedWeather('RAINY'); playSound('pop'); }}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            selectedWeather === 'RAINY' ? 'bg-white shadow-xs text-blue-500' : 'text-slate-400 hover:text-slate-600'
                          }`}
                          title="微雨"
                        >
                          <CloudRain className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => { setSelectedWeather('RAINBOW'); playSound('pop'); }}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                            selectedWeather === 'RAINBOW' ? 'bg-white shadow-xs' : 'opacity-50 hover:opacity-100'
                          }`}
                          title="彩虹"
                        >
                          🌈
                        </button>
                      </div>
                    </div>

                    {/* Mascot Greeting */}
                    <div className="flex items-center gap-3 bg-amber-100/50 p-2.5 rounded-2xl border border-amber-200/70 mb-4">
                      <div className="w-12 h-12 bg-white rounded-xl p-1 shrink-0 shadow-xs border border-amber-200 flex items-center justify-center">
                        <img
                          src={getPublicAssetUrl('/學校圖檔/吉祥物/enen_grat_bread_bible.png')}
                          alt="恩恩"
                          className="w-10 h-10 object-contain"
                        />
                      </div>
                      <div className="text-xs">
                        <span className="font-black text-amber-950">恩恩問問你：今天的心情如何呢？</span>
                        <p className="text-[11px] text-amber-800 font-medium">
                          點選下方 1 至 10 分，記錄今天真實的感受噢！
                        </p>
                      </div>
                    </div>

                    {/* 10-Point Mascot Style Mood Buttons */}
                    <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => {
                        const item = MOOD_EMOJIS[val];
                        const isChosen = studentMood === val;
                        return (
                          <motion.button
                            key={val}
                            type="button"
                            data-mood-val={val}
                            whileHover={{ scale: 1.08, y: -2 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => handleMoodSelect(val)}
                            className={`p-2.5 sm:p-3 rounded-2xl flex flex-col items-center justify-center border-2 transition-all cursor-pointer relative ${
                              isChosen
                                ? 'border-[#5A3825] bg-amber-100 shadow-md ring-3 ring-amber-400/50 scale-105'
                                : 'border-amber-200/70 bg-white/90 hover:border-amber-400 hover:bg-white'
                            }`}
                          >
                            <span className="text-2xl sm:text-3xl filter drop-shadow-xs">{item.emoji}</span>
                            <span className={`text-[11px] sm:text-xs font-black mt-1 ${
                              isChosen ? 'text-[#5A3825]' : 'text-slate-600'
                            }`}>
                              {val} 分
                            </span>
                            {isChosen && (
                              <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-xs">
                                ✓
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Mood Description Banner */}
                  <div className={`mt-4 p-3.5 rounded-2xl border-2 border-dashed flex items-center gap-3 ${
                    MOOD_EMOJIS[studentMood].colorClass
                  }`}>
                    <span className="text-3xl sm:text-4xl">{MOOD_EMOJIS[studentMood].emoji}</span>
                    <div className="truncate">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                        今日選擇的心情
                      </div>
                      <div className={`text-sm sm:text-base font-black ${MOOD_EMOJIS[studentMood].textColor}`}>
                        {studentMood} 分 · {MOOD_EMOJIS[studentMood].desc}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT PAGE: NOTEBOOK COMMENT & STAMP SUBMIT */}
                <div className="p-5 sm:p-7 md:p-8 flex flex-col justify-between relative bg-[#FAF6EE]">
                  <div className="absolute -top-1 right-6 w-24 h-6 bg-sky-200/80 rotate-[3deg] shadow-xs border-x border-sky-300/60 rounded-xs pointer-events-none" />

                  <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between pb-2 border-b-2 border-dashed border-amber-200 mb-3">
                        <div className="flex items-center gap-1.5 text-amber-900 font-black text-sm">
                          <span>📝 心聲悄悄話</span>
                          <span className="text-[11px] text-amber-700/70 font-normal">(選填)</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 font-bold">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>班導師及社工專屬保密</span>
                        </div>
                      </div>

                      {/* Quick Tag Stickers */}
                      <div className="mb-3">
                        <p className="text-[11px] font-bold text-amber-900/80 mb-1.5 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>靈感貼紙（點擊快速加入）：</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {quickTags.map((tag, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleQuickTagClick(tag.label)}
                              className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-white hover:bg-amber-100/80 border border-amber-200/80 text-amber-950 transition-all cursor-pointer shadow-2xs hover:scale-102"
                            >
                              {tag.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Handwritten Ruled Notebook Textarea */}
                      <div className="relative">
                        <textarea
                          id="book-student-comment"
                          rows={4}
                          value={studentComment}
                          onChange={(e) => setStudentComment(e.target.value)}
                          placeholder="親愛的同學，今天有什麼令你難忘、高興，或心裡有想向班導師、社工傾訴的話嗎？放心寫下來吧，這裡只有老師能看到..."
                          className="w-full p-3.5 rounded-2xl border-2 border-amber-300/80 bg-white/95 focus:bg-white text-slate-800 placeholder-slate-400 font-medium text-xs sm:text-sm leading-relaxed resize-none focus:outline-none focus:border-amber-600 focus:ring-3 focus:ring-amber-200 transition-all shadow-inner"
                        />
                      </div>
                    </div>

                    {/* SUBMIT BUTTON OR STAMPED SUCCESS BADGE */}
                    <div className="pt-2">
                      {!studentSuccessMessage ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          data-role="stamp-submit-btn"
                          type="submit"
                          disabled={loading}
                          className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-700 hover:to-amber-700 text-white rounded-2xl font-black text-sm tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 border-2 border-amber-700/30"
                        >
                          <span className="text-lg">✍️</span>
                          <span>{loading ? "正在蓋章記錄中..." : "蓋上心情印章 · 確認送出"}</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </motion.button>
                      ) : (
                        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-amber-50 border-2 border-emerald-300 rounded-2xl p-4 text-center shadow-md">
                          <motion.div
                            initial={{ scale: 2.2, rotate: -25, opacity: 0 }}
                            animate={{ 
                              scale: stampLanded ? 1 : 1.1, 
                              rotate: stampLanded ? -8 : -12, 
                              opacity: 1 
                            }}
                            transition={{ type: 'spring', stiffness: 350, damping: 15 }}
                            className="inline-flex flex-col items-center justify-center p-3 rounded-full border-4 border-dashed border-red-700/80 text-red-700 bg-red-100/40 shadow-inner mb-2"
                          >
                            <span className="text-[10px] font-black tracking-widest uppercase">天主教善導小學</span>
                            <span className="text-sm font-black flex items-center gap-1 my-0.5">
                              <span>🌟 恩恩已收到心情</span>
                            </span>
                            <span className="text-[10px] font-bold font-mono">
                              {formatDateObj(new Date())} · 登錄成功
                            </span>
                          </motion.div>

                          <p className="text-xs font-bold text-emerald-900 mb-3">
                            太棒了！你的心情日記已成功安全送達，老師會持續守護陪伴你！
                          </p>

                          <div className="flex flex-wrap items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSelectTab('CHARGING_STATION')}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <BatteryCharging className="w-3.5 h-3.5" />
                              <span>🔋 前往 4R 心靈充電站</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSelectTab('REPORT')}
                              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span>📈 查看情緒走勢圖</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                alert("🚧 4Rs 心靈日記正在精心籌備中 (In Development)，即將正式開放，敬請期待喔！✨");
                              }}
                              className="relative px-3.5 py-2 rounded-xl bg-slate-200 text-slate-500 font-black text-xs shadow-xs transition-all cursor-not-allowed flex items-center gap-1.5 opacity-80"
                              title="4Rs 心靈日記正在籌備中 (In Development)"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                              <span>📖 4Rs 心靈日記</span>
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-950 shadow-3xs">
                                籌備中
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={handleResetForEdit}
                              className="px-3.5 py-2 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>✍️ 修改填報</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        )}
          </>
        )}

        {/* TAB 2: 4R 心靈充電站 */}
        {cartoonTab === 'CHARGING_STATION' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-5xl"
          >
            <div className="bg-[#FBF7EE] border-4 border-[#2D6A4F] rounded-3xl md:rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(20,60,30,0.35)] p-4 sm:p-6 md:p-8 backdrop-blur-md relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-emerald-200/80">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl p-1.5 shadow-sm border border-emerald-200 shrink-0 flex items-center justify-center">
                    <img
                      src={getPublicAssetUrl('/學校圖檔/吉祥物/enen_grat_bread_bible.png')}
                      alt="恩恩吉祥物"
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-xl font-black text-emerald-950">
                        🔋 4R 心靈充電站
                      </h2>
                      <span className="hidden sm:inline-block text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                        Rest · Relaxation · Relationship · Resilience
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800/90 font-semibold mt-0.5">
                      歡迎來到課室心靈充電角！跟隨恩恩一起深呼吸放鬆身心、學習優質作息、人際感恩與成長抗逆力！
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectTab('MOOD')}
                  className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs border border-amber-300 shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Sun className="w-4 h-4 text-amber-600" />
                  <span>☀️ 返回今日心情日記</span>
                </button>
              </div>

              <FourRsStation initialExpanded={true} embeddedInClassroom={true} />
            </div>
          </motion.div>
        )}

        {/* TAB 3: 個人情緒進度與報告 */}
        {cartoonTab === 'REPORT' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-5xl"
          >
            <div className="bg-[#FBF7EE] border-4 border-[#1D4ED8] rounded-3xl md:rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(20,40,90,0.35)] p-4 sm:p-6 md:p-8 backdrop-blur-md relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-blue-200/80">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl p-1.5 shadow-sm border border-blue-200 shrink-0 flex items-center justify-center">
                    <img
                      src={getPublicAssetUrl('/學校圖檔/吉祥物/enen_cheer.png')}
                      alt="恩恩吉祥物"
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-xl font-black text-blue-950">
                        📈 {studentDisplayName} 的個人情緒進度與報告
                      </h2>
                      <span className="hidden sm:inline-block text-[11px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                        {selectedClass} 班 {activeStudentNumber} 號
                      </span>
                    </div>
                    <p className="text-xs text-blue-800/90 font-semibold mt-0.5">
                      持續覺察自己的心情變化，回顧近期心情走勢曲線與老師的陪伴鼓勵！
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectTab('MOOD')}
                  className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs border border-amber-300 shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Sun className="w-4 h-4 text-amber-600" />
                  <span>☀️ 返回今日心情日記</span>
                </button>
              </div>

              <ReportCard
                reports={reports || []}
                selectedClass={selectedClass}
                activeStudentNumber={activeStudentNumber}
                showStudentReport={true}
                setShowStudentReport={() => {}}
                hideToggleButton={true}
              />
            </div>
          </motion.div>
        )}

        {/* TAB 4: 我的 4Rs 心靈日記 */}
        {cartoonTab === 'DIARIES' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-5xl"
          >
            <div className="bg-[#FBF7EE] border-4 border-[#4338CA] rounded-3xl md:rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(40,20,90,0.35)] p-4 sm:p-6 md:p-8 backdrop-blur-md relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-indigo-200/80">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl p-1.5 shadow-sm border border-indigo-200 shrink-0 flex items-center justify-center">
                    <img
                      src={getPublicAssetUrl('/學校圖檔/吉祥物/enen_grat_bread_bible.png')}
                      alt="恩恩吉祥物"
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-xl font-black text-indigo-950">
                        📖 {studentDisplayName} 的 4Rs 心靈日記簿
                      </h2>
                      <span className="hidden sm:inline-block text-[11px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full border border-indigo-200">
                        {selectedClass} 班 {activeStudentNumber} 號
                      </span>
                    </div>
                    <p className="text-xs text-indigo-800/90 font-semibold mt-0.5">
                      翻開雙週心靈成長足跡，查看手寫筆記與恩恩與老師為你寫下的愛心祝福！
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectTab('MOOD')}
                  className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs border border-amber-300 shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Sun className="w-4 h-4 text-amber-600" />
                  <span>☀️ 返回今日心情日記</span>
                </button>
              </div>

              <StudentDiariesTab
                studentNumber={studentFormattedNumber}
                studentName={studentDisplayName}
                activeMascot="enen"
              />
            </div>
          </motion.div>
        )}
      </main>

      {/* 4. FOOTER NOTE */}
      <footer className="relative z-30 py-2.5 px-4 text-center bg-white/60 backdrop-blur-xs border-t border-amber-200/40 text-[11px] text-slate-500 font-medium">
        天主教善導小學 · 培育愛心與感恩成長 · 守護每一位同學的身心靈健康
      </footer>
    </div>
  );
}
