import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  MessageSquare,
  Users,
  Smile,
  LayoutGrid,
  FileSpreadsheet,
  BatteryCharging,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { MOOD_EMOJIS, getMoodColor } from '../../constants/moodConstants';
import { formatDateObj } from '../../utils/dateHelpers';
import { getPublicAssetUrl } from '../../utils/assetHelper';
import { getStudentsByClass, StudentRecord } from '../../data/studentsRoster';
import { FourRsStation } from '../Dashboards/StudentDashboard/FourRsStation';

export type BatchExperienceTab = 'ROSTER' | 'CHARGING_STATION' | 'ANALYTICS';

export type BatchAnimationPhase = 
  | 'ENTERING_CLASSROOM'
  | 'BOOK_APPEARING'
  | 'RECORDING';

interface ClassroomBatchBookExperienceProps {
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
  onSwitchToStandard: () => void;
  reports?: any[];
}

export const ClassroomBatchBookExperience: React.FC<ClassroomBatchBookExperienceProps> = ({
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
  onSwitchToStandard,
}) => {
  const [activeTab, setActiveTab] = useState<BatchExperienceTab>('ROSTER');
  const [phase, setPhase] = useState<BatchAnimationPhase>('BOOK_APPEARING');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [justStamped, setJustStamped] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const todayStr = formatDateObj(new Date());

  // Safe Web Audio Synthesizer
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playSound = (type: 'page_turn' | 'stamp' | 'chime' | 'pop' | 'book_thud') => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === 'book_thud') {
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
        const bufferSize = ctx.sampleRate * 0.18;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.18);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
      } else if (type === 'stamp') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);

        // Snap sound
        const snap = ctx.createOscillator();
        const snapGain = ctx.createGain();
        snap.type = 'square';
        snap.frequency.setValueAtTime(450, now);
        snapGain.gain.setValueAtTime(0.25, now);
        snapGain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
        snap.connect(snapGain);
        snapGain.connect(ctx.destination);
        snap.start(now);
        snap.stop(now + 0.07);
      } else if (type === 'chime') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.26);
      } else if (type === 'pop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(480, now + 0.08);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    } catch (e) {
      // Audio context might fail on older or restricted browsers
    }
  };

  const handleOpenBook = () => {
    playSound('page_turn');
    setPhase('RECORDING');
  };

  const handleSelectTab = (tab: BatchExperienceTab) => {
    setActiveTab(tab);
    playSound('page_turn');
    if (tab === 'ROSTER' && (phase === 'ENTERING_CLASSROOM' || phase === 'BOOK_APPEARING')) {
      setPhase('RECORDING');
    }
  };

  useEffect(() => {
    playSound('book_thud');
  }, []);

  // Student roster data
  const rosterStudents = useMemo(() => {
    if (!selectedClass) return [];
    return getStudentsByClass(selectedClass);
  }, [selectedClass]);

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

  // Statistics
  const { filledCount, avgScore, alertStudents, moodDistribution } = useMemo(() => {
    let count = 0;
    let sum = 0;
    const alerts: { student: StudentRecord; score: number }[] = [];
    const dist = { low: 0, medium: 0, high: 0, super: 0, na: 0 };

    displayStudents.forEach((st) => {
      const sKey = String(st.number);
      const score = batchScores[sKey]?.moodScore;
      if (score === 'N/A') {
        dist.na++;
      } else if (score !== undefined && score !== null && score !== '' && score !== 0) {
        count++;
        const num = typeof score === 'string' ? parseInt(score) : score;
        if (!isNaN(num)) {
          sum += num;
          if (num <= 3) {
            alerts.push({ student: st, score: num });
            dist.low++;
          } else if (num <= 6) {
            dist.medium++;
          } else if (num <= 8) {
            dist.high++;
          } else {
            dist.super++;
          }
        }
      }
    });

    return {
      filledCount: count,
      avgScore: count > 0 ? (sum / count).toFixed(1) : null,
      alertStudents: alerts,
      moodDistribution: dist
    };
  }, [displayStudents, batchScores]);

  // Quick fill all
  const handleQuickFillAll = (targetScore: number) => {
    playSound('chime');
    displayStudents.forEach((st) => {
      const sKey = String(st.number);
      const existing = batchScores[sKey]?.moodScore;
      if (!existing || existing === 0) {
        handleP13CellGradeChange(sKey, targetScore, batchScores[sKey]?.comment || '');
      }
    });
  };

  // Submit and stamp
  const onSaveClick = () => {
    playSound('stamp');
    setJustStamped(true);
    handleP13BatchSubmit();
    setTimeout(() => {
      playSound('chime');
    }, 450);
  };

  useEffect(() => {
    if (isP13Saved) {
      setJustStamped(true);
    }
  }, [isP13Saved]);

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
          <img
            src={getPublicAssetUrl('/學校圖檔/教室/classroom_cartoon_backdrop.png')}
            alt="天主教善導小學卡通教室全景"
            className="w-full h-full object-cover object-bottom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-amber-900/25 via-amber-100/10 to-sky-300/15 mix-blend-soft-light" />
        </motion.div>

        {/* Ambient floating sunshine particles */}
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

      {/* 2. TOP FLOATING APP BAR */}
      <header className="relative z-30 px-3 py-2 sm:px-6 sm:py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 bg-white/85 backdrop-blur-md border-b border-amber-200/60 shadow-xs">
        {/* Top Tier (Mobile/Tablet) or Left Tier (Desktop): School Crest & Title + Right Controls on Mobile */}
        <div className="flex items-center justify-between w-full lg:w-auto">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white shadow-xs border border-amber-200 p-1 flex items-center justify-center shrink-0">
              <img
                src={getPublicAssetUrl('/學校圖檔/學校logo/school_logo.png')}
                alt="天主教善導小學校徽"
                className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-sm font-black text-amber-950 tracking-tight">
                  天主教善導小學 · 溫暖教室
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 font-bold px-1.5 py-0.2 rounded-full">
                  初小全班代登日記
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-slate-500">
                <span>班級心情花名冊</span>
                <span>•</span>
                <span className="text-indigo-700 font-black">
                  {selectedClass ? `${selectedClass} 班` : '未選班別'} (共 {displayStudents.length} 位同學)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Controls shown on top row for screens < lg */}
          <div className="flex lg:hidden items-center gap-1 sm:gap-1.5 shrink-0">
            {setSelectedClass && ALL_CLASSES && (
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  playSound('pop');
                }}
                className="bg-amber-50 hover:bg-white border-2 border-amber-300 text-amber-950 text-xs font-black rounded-xl px-2 py-1 focus:outline-none cursor-pointer shadow-3xs"
              >
                <optgroup label="初小 (P.1 - P.3)">
                  {['1A', '1B', '1C', '2A', '2B', '2C', '2D', '3A', '3B', '3C', '3D'].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="高小 (P.4 - P.6)">
                  {['4A', '4B', '4C', '4D', '5A', '5B', '5C', '5D', '6A', '6B', '6C', '6D'].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="測試專用">
                  <option value="TEST">TEST</option>
                </optgroup>
              </select>
            )}

            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center transition-all cursor-pointer shadow-3xs"
              title={soundEnabled ? '關閉音效' : '開啟音效'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-700" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            <button
              type="button"
              onClick={onSwitchToStandard}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-black transition-all cursor-pointer shadow-3xs flex items-center gap-1"
              title="切換標準面板"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">切換標準</span>
            </button>

            <button
              type="button"
              onClick={() => (setViewState ? setViewState('STUDENT_LOGIN') : window.history.back())}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-black transition-all cursor-pointer shadow-3xs flex items-center gap-1"
              title="返回登入"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">返回</span>
            </button>
          </div>
        </div>

        {/* Center: Quick Tab Pills */}
        <div className="flex items-center gap-1 sm:gap-1.5 bg-amber-900/10 p-1 rounded-2xl border border-amber-900/15 overflow-x-auto no-scrollbar w-full lg:w-auto justify-start lg:justify-center">
          <button
            type="button"
            data-tab="ROSTER"
            onClick={() => handleSelectTab('ROSTER')}
            className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'ROSTER'
                ? 'bg-amber-500 text-amber-950 shadow-xs'
                : 'text-amber-950/70 hover:bg-white/50'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>📋 全班點名簿</span>
          </button>

          <button
            type="button"
            data-tab="CHARGING_STATION"
            onClick={() => handleSelectTab('CHARGING_STATION')}
            className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'CHARGING_STATION'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-amber-950/70 hover:bg-white/50'
            }`}
          >
            <BatteryCharging className="w-3.5 h-3.5" />
            <span>🔋 4R充電站</span>
          </button>

          <button
            type="button"
            data-tab="ANALYTICS"
            onClick={() => handleSelectTab('ANALYTICS')}
            className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'ANALYTICS'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-amber-950/70 hover:bg-white/50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>📈 班級情緒分佈</span>
          </button>
        </div>

        {/* Desktop Right Controls */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {/* Class switcher pill */}
          {setSelectedClass && ALL_CLASSES && (
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                playSound('pop');
              }}
              className="bg-amber-50 hover:bg-white border-2 border-amber-300 text-amber-950 text-xs font-black rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-amber-400 focus:outline-none cursor-pointer transition-all shadow-3xs"
            >
              <optgroup label="初小 (P.1 - P.3)">
                {['1A', '1B', '1C', '2A', '2B', '2C', '2D', '3A', '3B', '3C', '3D'].map((c) => (
                  <option key={c} value={c}>
                    🏫 {c} 班
                  </option>
                ))}
              </optgroup>
              <optgroup label="高小 (P.4 - P.6)">
                {['4A', '4B', '4C', '4D', '5A', '5B', '5C', '5D', '6A', '6B', '6C', '6D'].map((c) => (
                  <option key={c} value={c}>
                    🏫 {c} 班
                  </option>
                ))}
              </optgroup>
              <optgroup label="測試專用">
                <option value="TEST">🧪 TEST 測試班</option>
              </optgroup>
            </select>
          )}

          {/* Sound toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-8 h-8 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center transition-all cursor-pointer shadow-3xs"
            title={soundEnabled ? '關閉音效' : '開啟音效'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-700" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Switch to standard table */}
          <button
            type="button"
            onClick={onSwitchToStandard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-black transition-all cursor-pointer shadow-3xs"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-indigo-600" />
            <span>切換標準面板</span>
          </button>

          {/* Back to student login */}
          <button
            type="button"
            onClick={() => (setViewState ? setViewState('STUDENT_LOGIN') : window.history.back())}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-black transition-all cursor-pointer shadow-3xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>返回登入</span>
          </button>
        </div>
      </header>

      {/* 3. MAIN STAGE: Wooden Desk & Cartoon Roster Book */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 my-auto w-full">
        {/* CASE A: CLOSED BOOK ON DESK (WHEN ENTERING CLASSROOM OR NOT YET OPENED) */}
        {activeTab === 'ROSTER' && phase === 'BOOK_APPEARING' && (
          <motion.div
            data-role="closed-book-cover"
            initial={{ opacity: 0, y: -30, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 240, damping: 22 }}
            className="flex flex-col items-center cursor-pointer group my-auto py-4 sm:py-8 select-none"
            onClick={handleOpenBook}
          >
            <div className="relative">
              <img
                src={getPublicAssetUrl('/學校圖檔/教室/cartoon_journal_cover.png')}
                alt="精裝心情日記"
                className="w-72 sm:w-88 md:w-96 lg:w-[420px] h-auto drop-shadow-[0_20px_35px_rgba(70,35,10,0.4)] transition-all duration-300 group-hover:scale-103 group-hover:-rotate-1"
              />
              <div className="absolute top-[58%] inset-x-8 text-center bg-amber-950/55 backdrop-blur-xs py-2 px-3 rounded-lg border border-amber-300/40 shadow-inner">
                <p className="text-amber-200 text-xs font-serif font-black tracking-widest">
                  {selectedClass ? `${selectedClass} 班` : '初小班級'} · 班級心情花名冊
                </p>
                <p className="text-white text-sm sm:text-base font-black mt-0.5 tracking-wider">
                  全班心情點名日記
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
              <span>點擊翻開全班日記 📖 (Click to Open)</span>
            </motion.button>
          </motion.div>
        )}

        {/* CASE B: OPENED BOOK / ROSTER SPREAD OR OTHER TABS */}
        {(phase === 'RECORDING' || activeTab !== 'ROSTER') && (
          <motion.div
            data-role="open-batch-journal-spread"
            initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-7xl relative z-20"
          >
            {/* DESK BOOK CONTAINER */}
            <div className="w-full bg-[#FCF9F2] border-4 border-amber-300/80 rounded-3xl md:rounded-[2.5rem] shadow-2xl p-4 sm:p-7 relative flex flex-col gap-6 backdrop-blur-xs">
          
          {/* TAB 1: ROSTER BOOK CONTENT */}
          {activeTab === 'ROSTER' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* TOP BANNER: MASCOT ENEN + STATS + QUICK FILL TOOLS */}
              <div className="bg-gradient-to-r from-amber-100/90 via-orange-50/80 to-amber-100/70 border-2 border-amber-300/70 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-3xs">
                {/* Mascot + Title */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white border-2 border-amber-200 p-1.5 shadow-sm shrink-0 flex items-center justify-center">
                    <img
                      src={getPublicAssetUrl('/學校圖檔/吉祥物/enen_grat_bread_bible.png')}
                      alt="恩恩吉祥物"
                      className="w-full h-full object-contain filter drop-shadow"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base sm:text-lg font-black text-amber-950 tracking-tight">
                        📖 {selectedClass} 班 · 全班每日心情點名簿
                      </span>
                      <span className="bg-amber-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-3xs">
                        今日登記中
                      </span>
                    </div>
                    <p className="text-xs text-amber-900 font-bold mt-1">
                      老師辛苦了！今天一起為全班每位小朋友蓋上元氣心情印章吧～
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-amber-900/90 mt-2 font-bold">
                      <span>📅 日期：<strong>{todayStr}</strong></span>
                      <span>•</span>
                      <span>全班同學：<strong>{displayStudents.length} 位</strong></span>
                      <span>•</span>
                      <span>已填寫：<strong className="text-indigo-700">{filledCount} / {displayStudents.length} 位</strong></span>
                      {avgScore && (
                        <>
                          <span>•</span>
                          <span>班級平均心情：<strong className="text-emerald-700 font-black text-sm">★ {avgScore} 分</strong></span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Fill Helpers */}
                <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-auto justify-end">
                  <div className="text-xs font-black text-amber-900 flex items-center gap-1 mr-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>快捷小幫手：</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickFillAll(5)}
                    className="bg-white hover:bg-amber-100 text-amber-950 font-black text-xs px-3 py-2 rounded-xl border border-amber-300 transition-all cursor-pointer shadow-3xs hover:scale-102 flex items-center gap-1"
                  >
                    <span>😐</span>
                    <span>一鍵填 5 分 (平靜)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFillAll(7)}
                    className="bg-white hover:bg-emerald-100 text-emerald-900 font-black text-xs px-3 py-2 rounded-xl border border-emerald-300 transition-all cursor-pointer shadow-3xs hover:scale-102 flex items-center gap-1"
                  >
                    <span>😊</span>
                    <span>一鍵填 7 分 (開朗)</span>
                  </button>
                </div>
              </div>

              {/* SUCCESS NOTICE / STAMP BANNER (IF ALREADY SAVED) */}
              {isP13Saved && (
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-950 font-bold shadow-3xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-sm font-black text-emerald-900">
                        🎉 太棒了！{selectedClass} 班今日全班心情資料已安全同步至系統！
                      </span>
                      <p className="text-xs text-emerald-800 font-medium mt-0.5">
                        學校報告與班級分析已即時更新，如有需要可隨時調整分數並再次點擊蓋章儲存。
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSelectTab('CHARGING_STATION')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-3 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      🔋 帶領全班放鬆
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectTab('ANALYTICS')}
                      className="bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-black px-3 py-2 rounded-xl shadow-3xs transition-all cursor-pointer"
                    >
                      📈 查看班級走勢
                    </button>
                  </div>
                </div>
              )}

              {/* ROSTER TABLE / STUDENT CARDS */}
              <div className="bg-white border-2 border-amber-200/90 rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-amber-100/60 px-4 py-3 border-b border-amber-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-800" />
                    <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
                      {selectedClass} 班 全體學生心情花名單（共 {displayStudents.length} 位）
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-900/80">
                    點擊 1-10 圓鈕為同學蓋上今日心情
                  </span>
                </div>

                <div className="divide-y divide-amber-100/80 max-h-[58vh] overflow-y-auto">
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
                        className={`p-3 sm:px-4 sm:py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 transition-all ${
                          score === 'N/A'
                            ? 'bg-slate-50/90'
                            : isScoreEntered
                            ? 'bg-amber-50/30 hover:bg-amber-50/60'
                            : 'hover:bg-amber-50/20'
                        }`}
                      >
                        {/* 1. LEFT: STUDENT BADGE & NAME */}
                        <div className="flex items-center gap-3 min-w-[210px]">
                          <span
                            className={`w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl text-xs font-black shadow-3xs transition-transform ${
                              score === 'N/A'
                                ? 'bg-slate-400 text-white'
                                : isScoreEntered
                                ? 'bg-amber-500 text-white scale-105'
                                : 'bg-amber-100 text-amber-900 border border-amber-200'
                            }`}
                          >
                            {sIdxStr.padStart(2, '0')}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-black text-slate-800">{student.chineseName}</span>
                              <span className="text-xs text-slate-500 font-bold">{student.englishName}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-mono font-bold text-amber-900/70 bg-amber-100/60 px-1.5 py-0.2 rounded">
                                {student.studentId}
                              </span>
                              <span
                                className={`text-[10px] font-bold ${
                                  recordExists
                                    ? 'text-emerald-700'
                                    : isScoreEntered
                                    ? 'text-amber-700'
                                    : 'text-slate-400'
                                }`}
                              >
                                {recordExists ? '✓ 今日已存檔' : isScoreEntered ? '● 已點選未儲存' : '○ 尚未登記'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 2. CENTER: 1-10 COLORFUL SCORE BUTTONS */}
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                          {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'N/A'] as const).map((val) => {
                            const isChosen = score === val || String(score) === String(val);
                            const isNAKey = val === 'N/A';
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => {
                                  playSound('pop');
                                  handleP13CellGradeChange(sIdxStr, val, currentComment);
                                }}
                                style={{
                                  backgroundColor: isChosen
                                    ? isNAKey
                                      ? '#94A3B8'
                                      : getMoodColor(val)
                                    : 'transparent',
                                  borderColor: isChosen
                                    ? isNAKey
                                      ? '#94A3B8'
                                      : getMoodColor(val)
                                    : '#F1E6D0',
                                  color: isChosen ? '#FFFFFF' : isNAKey ? '#64748B' : '#475569'
                                }}
                                className={`h-8 flex-shrink-0 flex items-center justify-center rounded-xl text-xs font-black border-2 transition-all cursor-pointer hover:scale-108 active:scale-95 ${
                                  isNAKey ? 'px-2.5 min-w-[42px]' : 'w-8'
                                } ${isChosen ? 'shadow-sm font-black ring-2 ring-amber-300' : 'bg-white hover:bg-amber-50'}`}
                              >
                                {val}
                              </button>
                            );
                          })}
                        </div>

                        {/* 3. RIGHT: SELECTED MOOD BADGE & TEACHER NOTE */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 min-w-[280px] lg:justify-end">
                          {/* Mood summary tag */}
                          <div className="w-[125px] shrink-0 text-right">
                            {score === 'N/A' ? (
                              <div className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg text-[11px] font-bold text-slate-500">
                                <span>🚫</span>
                                <span>缺席/離校</span>
                              </div>
                            ) : isScoreEntered ? (
                              <div className="inline-flex items-center gap-1 bg-white border border-amber-200 px-2.5 py-1 rounded-xl text-[11px] font-black shadow-3xs">
                                <span>{MOOD_EMOJIS[score as number]?.emoji}</span>
                                <span style={{ color: getMoodColor(score as number) }}>
                                  {score}分 • {MOOD_EMOJIS[score as number]?.desc.split(' / ')[0]}
                                </span>
                              </div>
                            ) : (
                              <span className="text-amber-800/40 text-xs italic font-bold">未評分</span>
                            )}
                          </div>

                          {/* Teacher Note Input */}
                          <div className="relative w-full sm:w-56">
                            <MessageSquare className="w-3.5 h-3.5 text-amber-500/70 absolute left-2.5 top-2.5" />
                            <input
                              type="text"
                              placeholder="老師備註或悄悄話 (選填)..."
                              value={currentComment}
                              onChange={(e) => {
                                if (handleP13CellCommentChange) {
                                  handleP13CellCommentChange(sIdxStr, e.target.value);
                                } else {
                                  handleP13CellGradeChange(sIdxStr, score, e.target.value);
                                }
                              }}
                              className="w-full text-xs pl-8 pr-2.5 py-1.5 rounded-xl border border-amber-200 bg-white focus:ring-2 focus:ring-amber-200 focus:border-amber-400 focus:outline-none transition-all placeholder:text-amber-900/30 font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BOTTOM BOOK FOOTER & RED SCHOOL STAMP */}
              <div className="pt-4 border-t-2 border-amber-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-xs text-amber-900/80 font-bold max-w-xl">
                  💡 溫馨提示：點擊「蓋上全班心情印章並同步存檔」後，系統將自動寫入 Firebase 資料庫。若有同學分數為 1-3 分，系統會標示為溫馨關懷對象。
                </div>

                {/* Stamping Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onSaveClick}
                  disabled={loading}
                  className="w-full md:w-auto bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-700 hover:to-amber-700 disabled:from-slate-300 disabled:to-slate-300 text-white font-black text-sm px-8 py-3.5 rounded-2xl transition-all shadow-md hover:shadow-xl cursor-pointer flex items-center justify-center gap-2.5 border-2 border-red-200"
                >
                  <span>{loading ? '正在同步存檔中...' : `💮 蓋上全班心情印章並同步存檔`}</span>
                </motion.button>
              </div>

              {/* RED STAMP ANIMATION */}
              <AnimatePresence>
                {justStamped && (
                  <motion.div
                    initial={{ scale: 2.2, opacity: 0, rotate: -25 }}
                    animate={{ scale: 1, opacity: 1, rotate: -6 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', damping: 14, stiffness: 220 }}
                    className="self-center mx-auto my-2 p-3 sm:p-4 border-4 border-dashed border-red-600 rounded-2xl bg-red-50/90 text-red-700 flex items-center gap-3 shadow-lg select-none"
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-red-600 flex items-center justify-center font-black text-red-600 text-xl">
                      善導
                    </div>
                    <div>
                      <div className="text-xs font-black tracking-widest uppercase">
                        天主教善導小學 · 全班心情已記錄
                      </div>
                      <div className="text-[11px] font-bold text-red-600 mt-0.5">
                        {todayStr} • {selectedClass} 班 全班共 {filledCount} 位同學已蓋章
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* TAB 2: 4R CHARGING STATION (CLASSROOM PROJECTION MODE) */}
          {activeTab === 'CHARGING_STATION' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Header card */}
              <div className="bg-emerald-100/80 border-2 border-emerald-300 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-emerald-200 p-1 flex items-center justify-center shadow-xs shrink-0">
                    <img
                      src={getPublicAssetUrl('/學校圖檔/吉祥物/enen_grat_bread_bible.png')}
                      alt="恩恩"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-emerald-950">
                      🔋 4R 心靈充電站 · 全班課堂舒壓專區
                    </h3>
                    <p className="text-xs text-emerald-900 font-bold mt-0.5">
                      老師可投影此頁面至黑板大螢幕，帶領全班齊做 2 分鐘深呼吸或進行感恩分享！
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectTab('ROSTER')}
                  className="bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-black px-4 py-2 rounded-xl transition-all cursor-pointer shadow-3xs"
                >
                  📋 返回全班點名簿
                </button>
              </div>

              {/* Station content */}
              <div className="bg-white border-2 border-emerald-200/80 rounded-2xl p-5 shadow-xs">
                <FourRsStation initialExpanded={true} />
              </div>
            </motion.div>
          )}

          {/* TAB 3: CLASS ANALYTICS & WELLNESS DISTRIBUTION */}
          {activeTab === 'ANALYTICS' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="bg-sky-100/80 border-2 border-sky-300 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-sky-200 p-1 flex items-center justify-center shadow-xs shrink-0">
                    <img
                      src={getPublicAssetUrl('/學校圖檔/吉祥物/enen_cheer.png')}
                      alt="恩恩"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-sky-950">
                      📈 {selectedClass} 班 · 今日情緒分佈與關懷分析
                    </h3>
                    <p className="text-xs text-sky-900 font-bold mt-0.5">
                      即時解析全班今日心理狀態光譜，掌握需要優先關懷與支持的小朋友。
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectTab('ROSTER')}
                  className="bg-white hover:bg-sky-50 border border-sky-300 text-sky-900 text-xs font-black px-4 py-2 rounded-xl transition-all cursor-pointer shadow-3xs"
                >
                  📋 返回全班點名簿
                </button>
              </div>

              {/* STATS TILES */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="bg-white border-2 border-amber-200 rounded-2xl p-4 shadow-3xs text-center">
                  <span className="text-xs font-bold text-slate-500">已錄入人數</span>
                  <div className="text-2xl font-black text-amber-950 mt-1">
                    {filledCount} <span className="text-xs text-slate-400 font-bold">/ {displayStudents.length}</span>
                  </div>
                </div>

                <div className="bg-white border-2 border-emerald-200 rounded-2xl p-4 shadow-3xs text-center">
                  <span className="text-xs font-bold text-slate-500">班級今日平均</span>
                  <div className="text-2xl font-black text-emerald-700 mt-1">
                    {avgScore ? `${avgScore} 分` : '--'}
                  </div>
                </div>

                <div className="bg-white border-2 border-blue-200 rounded-2xl p-4 shadow-3xs text-center">
                  <span className="text-xs font-bold text-slate-500">活潑元氣同學 (7-10分)</span>
                  <div className="text-2xl font-black text-blue-700 mt-1">
                    {moodDistribution.high + moodDistribution.super} 位
                  </div>
                </div>

                <div className="bg-white border-2 border-rose-200 rounded-2xl p-4 shadow-3xs text-center">
                  <span className="text-xs font-bold text-slate-500">需要溫馨關懷 (≤3分)</span>
                  <div className="text-2xl font-black text-rose-600 mt-1">
                    {alertStudents.length} 位
                  </div>
                </div>
              </div>

              {/* MOOD DISTRIBUTION SPECTRUM */}
              <div className="bg-white border-2 border-sky-200/80 rounded-2xl p-5 shadow-xs space-y-4">
                <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <span>🌈 全班心情四色光譜</span>
                </h4>

                <div className="h-6 w-full rounded-xl overflow-hidden flex shadow-inner bg-slate-100">
                  {moodDistribution.low > 0 && (
                    <div
                      style={{ width: `${(moodDistribution.low / (filledCount || 1)) * 100}%` }}
                      className="bg-rose-500 h-full flex items-center justify-center text-[10px] text-white font-black"
                      title={`需要關懷 (1-3分): ${moodDistribution.low}人`}
                    >
                      {moodDistribution.low}人
                    </div>
                  )}
                  {moodDistribution.medium > 0 && (
                    <div
                      style={{ width: `${(moodDistribution.medium / (filledCount || 1)) * 100}%` }}
                      className="bg-amber-400 h-full flex items-center justify-center text-[10px] text-white font-black"
                      title={`平穩安靜 (4-6分): ${moodDistribution.medium}人`}
                    >
                      {moodDistribution.medium}人
                    </div>
                  )}
                  {moodDistribution.high > 0 && (
                    <div
                      style={{ width: `${(moodDistribution.high / (filledCount || 1)) * 100}%` }}
                      className="bg-emerald-500 h-full flex items-center justify-center text-[10px] text-white font-black"
                      title={`開心積極 (7-8分): ${moodDistribution.high}人`}
                    >
                      {moodDistribution.high}人
                    </div>
                  )}
                  {moodDistribution.super > 0 && (
                    <div
                      style={{ width: `${(moodDistribution.super / (filledCount || 1)) * 100}%` }}
                      className="bg-indigo-500 h-full flex items-center justify-center text-[10px] text-white font-black"
                      title={`極度雀躍 (9-10分): ${moodDistribution.super}人`}
                    >
                      {moodDistribution.super}人
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold pt-2">
                  <span className="flex items-center gap-1.5 text-rose-700">
                    <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                    需要關懷 (1-3分)：{moodDistribution.low} 位
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-800">
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                    平穩安靜 (4-6分)：{moodDistribution.medium} 位
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-800">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                    開心積極 (7-8分)：{moodDistribution.high} 位
                  </span>
                  <span className="flex items-center gap-1.5 text-indigo-800">
                    <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
                    極度雀躍 (9-10分)：{moodDistribution.super} 位
                  </span>
                </div>
              </div>

              {/* PRIORITY CARE LIST */}
              {alertStudents.length > 0 ? (
                <div className="bg-rose-50/80 border-2 border-rose-300 rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-rose-900 font-black text-sm">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>今日建議優先關懷之同學（共 {alertStudents.length} 位）</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {alertStudents.map(({ student, score }) => (
                      <div
                        key={student.number}
                        className="bg-white border border-rose-200 rounded-xl p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 font-black text-xs flex items-center justify-center">
                            {String(student.number).padStart(2, '0')}
                          </span>
                          <div>
                            <span className="text-xs font-black text-slate-800">{student.chineseName}</span>
                            <span className="text-[11px] text-slate-500 font-medium ml-1">({student.englishName})</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg text-xs font-black text-rose-700">
                          <span>{MOOD_EMOJIS[score]?.emoji}</span>
                          <span>{score} 分</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5 text-center text-emerald-900 font-bold text-xs flex items-center justify-center gap-2">
                  <Smile className="w-4 h-4 text-emerald-600" />
                  <span>太棒了！今日 {selectedClass} 班沒有同學處於需要緊急關懷的心情低谷（≤3分）。</span>
                </div>
              )}
            </motion.div>
          )}

            </div>
          </motion.div>
        )}
      </main>

      {/* 4. FOOTER */}
      <footer className="relative z-10 py-3 text-center text-[11px] font-bold text-amber-950/70 bg-white/50 backdrop-blur-xs border-t border-amber-200/50">
        天主教善導小學 · 初小全班代登通道 · 培育愛心與感恩成長 · 守護每一位同學的身心靈健康
      </footer>
    </div>
  );
};
