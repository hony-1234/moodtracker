import React, { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  User, 
  LogOut, 
  ArrowRight, 
  Sparkles, 
  GraduationCap, 
  AlertTriangle,
  ClipboardList,
  Home,
  Info,
  Volume2,
  VolumeX,
  FastForward,
  Compass,
  MapPin,
  ChevronDown
} from 'lucide-react';
import { auth } from '../../firebase/config';
import { loginWithGoogle, logoutUser, formatAuthErrorMessage } from '../../firebase/services';
import { getPublicAssetUrl, getWebpUrl } from '../../utils/assetHelper';
import { getSharedAudioContext } from '../../utils/audioHelper';
import { getActiveCostume, MascotCostume } from '../../utils/mascotCostumes';
import { User as FirebaseUser } from 'firebase/auth';
import { findStudentByGoogleEmail, getStudentsByClass, StudentRecord } from '../../data/studentsRoster';
import { useDevice } from '../../hooks/useDevice';

interface StudentLoginProps {
  ALL_CLASSES: string[];
  selectedClass: string;
  setSelectedClass: (val: string) => void;
  studentNoInput: string;
  setStudentNoInput: (val: string) => void;
  loginPassword: string;
  setLoginPassword: (val: string) => void;
  rememberMe: boolean;
  setRememberMe: (val: boolean) => void;
  loading: boolean;
  handleStudentLoginSubmit: (e?: FormEvent, overrideClass?: string, overrideStudentNo?: string) => void;
  setViewState: (view: 'LANDING' | 'STUDENT_LOGIN' | 'STUDENT_DASHBOARD' | 'TEACHER_LOGIN' | 'TEACHER_DASHBOARD' | 'TEACHER_P1_3_BATCH') => void;
}

export default function StudentLogin({
  ALL_CLASSES,
  selectedClass,
  setSelectedClass,
  studentNoInput,
  setStudentNoInput,
  rememberMe,
  setRememberMe,
  loading: parentLoading,
  handleStudentLoginSubmit,
  setViewState,
}: StudentLoginProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [matchedStudent, setMatchedStudent] = useState<StudentRecord | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Mascot dynamic costume
  const [currentCostume, setCurrentCostume] = useState<MascotCostume>(() => getActiveCostume());

  useEffect(() => {
    const handleCostume = (e: Event) => {
      const customEvent = e as CustomEvent<MascotCostume>;
      if (customEvent.detail) setCurrentCostume(customEvent.detail);
    };
    window.addEventListener('gccps:costume-changed', handleCostume);
    return () => window.removeEventListener('gccps:costume-changed', handleCostume);
  }, []);

  // Transition Animation Phases:
  // 1. 'GATE_OPENING': School main gate doors swing open outward with sunshine rays
  // 2. 'ENTERING_CAMPUS': Camera rushes forward along the cobblestone path into the campus
  // 3. 'MAP_VIEW': Camera lands and zooms onto the cartoon school map (the login page)
  const [phase, setPhase] = useState<'GATE_OPENING' | 'ENTERING_CAMPUS' | 'MAP_VIEW'>('GATE_OPENING');
  const [gateDoorOpen, setGateDoorOpen] = useState(false);

  // Mode Selection on the Map: 'STUDENT_LOGIN' vs 'TEACHER_INSERT'
  const [activeOption, setActiveOption] = useState<'STUDENT_LOGIN' | 'TEACHER_INSERT'>('STUDENT_LOGIN');

  // Web Audio Synthesizer for rich cartoon sound effects
  const playSound = (type: 'gate' | 'enter' | 'pop' | 'chime') => {
    if (!soundEnabled) return;
    try {
      const ctx = getSharedAudioContext();
      if (!ctx) return;

      if (type === 'gate') {
        // Grand warm welcoming chord arpeggio
        [392, 523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
          gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.85);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.1);
          osc.stop(ctx.currentTime + idx * 0.1 + 0.85);
        });
      } else if (type === 'enter') {
        // High sparkling cascade
        [880, 1046.5, 1318.5, 1567.98].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.4);
        });
      } else if (type === 'pop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      }
    } catch {
      // Audio blocked or unavailable
    }
  };

  // Run the entrance animation sequence upon mounting
  useEffect(() => {
    // 1. Open the gate after a short dramatic pause
    const t1 = setTimeout(() => {
      setGateDoorOpen(true);
      playSound('gate');
    }, 150);

    // 2. Camera rushes forward through the open gates
    const t2 = setTimeout(() => {
      setPhase('ENTERING_CAMPUS');
      playSound('enter');
    }, 1300);

    // 3. Zoom down onto the School Map
    const t3 = setTimeout(() => {
      setPhase('MAP_VIEW');
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Quick skip function
  const handleSkipAnimation = () => {
    setGateDoorOpen(true);
    setPhase('MAP_VIEW');
    playSound('pop');
  };

  // Sync auth state and identify student from official GCCPS roster
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user && user.email) {
        const student = findStudentByGoogleEmail(user.email);
        if (student) {
          setMatchedStudent(student);
          setSelectedClass(student.class);
          setStudentNoInput(String(student.number));
        } else {
          setMatchedStudent(null);
        }
      } else {
        setMatchedStudent(null);
      }
    });
    return () => unsub();
  }, [setSelectedClass, setStudentNoInput]);

  const handleGoogleSignIn = async () => {
    setLocalLoading(true);
    setAuthError(null);
    playSound('pop');
    try {
      const result = await loginWithGoogle();
      setCurrentUser(result.user);
      if (result.user.email) {
        const student = findStudentByGoogleEmail(result.user.email);
        if (student) {
          setMatchedStudent(student);
          setSelectedClass(student.class);
          setStudentNoInput(String(student.number));
        }
      }
    } catch (err: any) {
      console.error('Student Google Auth Error:', err);
      setAuthError(formatAuthErrorMessage(err));
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSwitchAccount = async () => {
    setLocalLoading(true);
    playSound('pop');
    try {
      await logoutUser();
      setCurrentUser(null);
      setMatchedStudent(null);
      setSelectedClass('');
      setStudentNoInput('');
    } catch (err: any) {
      console.error('Logout error:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleEnterTeacherBatch = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedClass) {
      alert("請先選擇要代登分的班別！");
      return;
    }
    playSound('pop');
    setStudentNoInput(''); // Empty seat number signals batch grader mode
    handleStudentLoginSubmit(e);
  };

  const loading = parentLoading || localLoading;
  const classStudents = selectedClass ? getStudentsByClass(selectedClass) : [];

  // Device & responsive metrics
  const {
    deviceType,
    isMobile,
    isTablet,
    isDesktop,
    isPortrait,
    isLandscape,
    width: windowWidth,
    height: windowHeight,
    uiScale
  } = useDevice();

  // Calculate cover geometry for the 16:9 gate scene (native ratio: 1.777)
  const gateImgAspect = 16 / 9;
  const screenAspect = (windowWidth || 1440) / (windowHeight || 900);
  let gateStageW: number;
  let gateStageH: number;
  if (screenAspect > gateImgAspect) {
    gateStageW = windowWidth;
    gateStageH = windowWidth / gateImgAspect;
  } else {
    gateStageH = windowHeight;
    gateStageW = windowHeight * gateImgAspect;
  }

  return (
    <div className="fixed inset-0 z-40 overflow-hidden select-none bg-sky-100 flex items-center justify-center font-sans">

      {/* ========================================================================= */}
      {/* PHASE 1 & 2: SCHOOL GATE OPENING & CAMPUS ENTRANCE TRANSITION            */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {phase !== 'MAP_VIEW' && (
          <motion.div
            key="gate-sequence"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute inset-0 z-50 overflow-hidden bg-sky-200"
            style={{ perspective: 1200 }}
          >
            {/* Centered Device-Adaptive Gate Stage Container */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                width: gateStageW,
                height: gateStageH,
                perspective: 1200
              }}
            >
              {/* Background view behind the gate: sunlit campus walkway */}
              <motion.div 
                className="absolute inset-0 transform-gpu"
                animate={phase === 'ENTERING_CAMPUS' ? { scale: 2.2, opacity: 0.3 } : { scale: 1, opacity: 1 }}
                transition={{ duration: 1.1, ease: 'easeIn' }}
              >
                <picture>
                  <source srcSet={getWebpUrl('/學校圖檔/school_main_gate.png')} type="image/webp" />
                  <img
                    src={getPublicAssetUrl('/學校圖檔/school_main_gate.png')}
                    alt="天主教善導小學校門"
                    decoding="async"
                    loading="eager"
                    className="w-full h-full object-cover object-center"
                  />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-amber-100/10 pointer-events-none" />
              </motion.div>

              {/* Left Gate Door - 3D swinging outward open */}
              <motion.div
                className="absolute top-0 bottom-0 left-[21.5%] w-[28.5%] z-20 pointer-events-none origin-left transform-gpu will-change-transform"
                animate={gateDoorOpen ? { rotateY: -80, opacity: 0.15 } : { rotateY: 0, opacity: 1 }}
                transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
                style={{
                  backgroundImage: `url(${getWebpUrl('/學校圖檔/school_main_gate.png')})`,
                  backgroundPosition: '21.5% center',
                  backgroundSize: `${100 / 0.285}% 100%`,
                  backgroundRepeat: 'no-repeat',
                  transformStyle: 'preserve-3d',
                  boxShadow: gateDoorOpen ? 'none' : 'inset -10px 0 20px rgba(0,0,0,0.3)'
                }}
              />

              {/* Right Gate Door - 3D swinging outward open */}
              <motion.div
                className="absolute top-0 bottom-0 right-[21.5%] w-[28.5%] z-20 pointer-events-none origin-right transform-gpu will-change-transform"
                animate={gateDoorOpen ? { rotateY: 80, opacity: 0.15 } : { rotateY: 0, opacity: 1 }}
                transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
                style={{
                  backgroundImage: `url(${getWebpUrl('/學校圖檔/school_main_gate.png')})`,
                  backgroundPosition: '78.5% center',
                  backgroundSize: `${100 / 0.285}% 100%`,
                  backgroundRepeat: 'no-repeat',
                  transformStyle: 'preserve-3d',
                  boxShadow: gateDoorOpen ? 'none' : 'inset 10px 0 20px rgba(0,0,0,0.3)'
                }}
              />
            </div>

            {/* Burst of morning sunlight rays as gates open */}
            <AnimatePresence>
              {gateDoorOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: [0, 0.9, 0.4], scale: [0.6, 1.8, 2.2] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center transform-gpu"
                >
                  <div className="w-[80vw] h-[80vh] bg-gradient-to-r from-amber-200/60 via-yellow-100/90 to-amber-200/60 rounded-full blur-3xl" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Welcoming Banner as gates open */}
            <AnimatePresence>
              {gateDoorOpen && (
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="absolute bottom-8 sm:bottom-12 md:bottom-14 left-1/2 -translate-x-1/2 z-40 pointer-events-none px-4 max-w-full transform-gpu"
                >
                  <div className="bg-white/95 backdrop-blur-md px-4 py-2 sm:px-7 sm:py-3 rounded-full shadow-2xl border-2 sm:border-3 border-amber-400 text-amber-950 font-black text-xs sm:text-base md:text-xl flex items-center gap-2 sm:gap-2.5 whitespace-nowrap">
                    <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-amber-500 animate-spin" />
                    <span>歡迎進入天主教善導小學校園 🌟</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Skip Button during Gate Transition */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-40">
              <button
                type="button"
                onClick={handleSkipAnimation}
                className="flex items-center gap-1.5 bg-black/50 hover:bg-black/75 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer border border-white/20 shadow-md"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>跳過動畫</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* PHASE 3: THE CARTOON SCHOOL MAP (LOGIN INTERFACE)                        */}
      {/* ========================================================================= */}
      <motion.div
        key="school-map-container"
        initial={{ scale: 1.15, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative w-full h-full flex flex-col justify-between overflow-hidden"
      >
        {/* Full-Screen Cartoon Campus Map Backdrop */}
        <div className="absolute inset-0 z-0">
          <picture>
            <source srcSet={getWebpUrl('/學校圖檔/school_cartoon_map.png')} type="image/webp" />
            <img
              src={getPublicAssetUrl('/學校圖檔/school_cartoon_map.png')}
              alt="天主教善導小學校園探索地圖"
              decoding="async"
              loading="eager"
              className="w-full h-full object-cover object-center filter saturate-[1.08] contrast-[1.02]"
            />
          </picture>
          {/* Subtle parchment vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-amber-900/15 via-transparent to-amber-950/10 pointer-events-none" />
          <div className="absolute inset-0 bg-amber-100/10 mix-blend-overlay pointer-events-none" />
        </div>

        {/* Ambient Drifting Clouds over the Map */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          <motion.div
            animate={{ x: ['-20%', '115%'] }}
            transition={{ duration: 55, repeat: Infinity, ease: 'linear' }}
            className="absolute top-4 left-0 opacity-70 transform-gpu will-change-transform"
          >
            <div className="w-48 h-14 bg-white/80 rounded-full blur-[2px]" />
          </motion.div>
          <motion.div
            animate={{ x: ['-10%', '120%'] }}
            transition={{ duration: 70, repeat: Infinity, ease: 'linear', delay: 10 }}
            className="absolute top-12 left-0 opacity-60 transform-gpu will-change-transform"
          >
            <div className="w-64 h-16 bg-white/70 rounded-full blur-[3px]" />
          </motion.div>
        </div>

        {/* Interactive Map Landmark Pins (Device-Aware Positioning) */}
        {isMobile ? (
          <div className="absolute inset-0 pointer-events-none z-15">
            {/* Top Pin above the login card */}
            <div className="absolute top-[11%] left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full shadow-sm border border-emerald-400 text-[10px] font-black text-emerald-900 whitespace-nowrap">
              <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>主教學樓 · 心情花園</span>
            </div>
            {/* Bottom Left Pin */}
            <div className="absolute bottom-[4.5%] left-3 flex items-center gap-1 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full shadow-sm border border-indigo-400 text-[10px] font-black text-indigo-900 whitespace-nowrap">
              <MapPin className="w-2.5 h-2.5 text-indigo-600 shrink-0" />
              <span>活力球場</span>
            </div>
            {/* Bottom Right Pin */}
            <div className="absolute bottom-[4.5%] right-3 flex items-center gap-1 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full shadow-sm border border-amber-400 text-[10px] font-black text-amber-900 whitespace-nowrap">
              <MapPin className="w-2.5 h-2.5 text-amber-600 shrink-0" />
              <span>聖堂加油站</span>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 pointer-events-none z-15">
            {/* Pin 1: Main Academic Building */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[18%] left-[48%] flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-emerald-400 text-xs font-black text-emerald-900"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>主教學樓 · 心情花園</span>
            </motion.div>

            {/* Pin 2: Chapel of St. Lawrence */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              className="absolute top-[48%] right-[16%] lg:right-[22%] flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-amber-400 text-xs font-black text-amber-900"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>聖堂 · 心靈加油站</span>
            </motion.div>

            {/* Pin 3: Sports Playground */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
              className="absolute bottom-[36%] left-[10%] lg:left-[16%] flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-indigo-400 text-xs font-black text-indigo-900"
            >
              <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>活力球場 · 快樂奔跑</span>
            </motion.div>
          </div>
        )}

        {/* TOP NAVBAR / SCHOOL CREST & CONTROLS */}
        <header className="relative z-30 px-3 sm:px-6 md:px-8 py-2.5 sm:py-3.5 flex items-center justify-between pointer-events-auto">
          {/* School Badge & Map Title */}
          <div className="flex items-center gap-2 sm:gap-3 bg-white/90 backdrop-blur-md px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl shadow-md border-2 border-amber-200">
            <img
              src={getPublicAssetUrl('/學校圖檔/學校logo/school_logo.png')}
              alt="天主教善導小學校徽"
              className="w-7 h-7 sm:w-9 sm:h-9 object-contain drop-shadow"
            />
            <div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                <h1 className="text-xs sm:text-sm md:text-base font-black text-slate-800 tracking-tight whitespace-nowrap">
                  善導校園心靈地圖
                </h1>
              </div>
              <p className="text-[9px] sm:text-[10px] md:text-[11px] font-bold text-emerald-700 whitespace-nowrap">
                天主教善導小學 · 學生空間
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                playSound('pop');
              }}
              className="bg-white/90 hover:bg-white text-slate-700 p-2 sm:p-2.5 rounded-full shadow-md border border-amber-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title={soundEnabled ? '音效已開啟' : '音效已關閉'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Info / Help Popover Modal */}
            <button
              type="button"
              onClick={() => {
                setShowInfoModal(true);
                playSound('pop');
              }}
              className="bg-white/90 hover:bg-white text-slate-700 p-2 sm:p-2.5 rounded-full shadow-md border border-amber-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="登入說明"
            >
              <Info className="w-4 h-4 text-indigo-600" />
            </button>

            {/* Back to School Gate (Landing) */}
            <button
              type="button"
              onClick={() => {
                playSound('pop');
                setViewState('LANDING');
              }}
              data-role="back-to-landing-btn"
              className="flex items-center gap-1 sm:gap-1.5 bg-white/95 hover:bg-white text-slate-800 hover:text-emerald-700 font-black px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl shadow-md border-2 border-emerald-300 transition-all hover:scale-105 active:scale-95 text-xs sm:text-sm cursor-pointer whitespace-nowrap"
            >
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
              <span>{isMobile ? '校門' : '返回校門'}</span>
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* CENTER STAGE: SIMPLISTIC CARTOON MAP LOGIN HUB                            */}
        {/* ========================================================================= */}
        <main className="relative z-25 flex-1 flex items-center justify-center p-2.5 sm:p-4 md:p-6 pointer-events-auto">
          <div className="relative w-full max-w-[94vw] sm:max-w-md">
            {/* Top Cartoon Pin / Header Ribbon */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-black text-xs px-5 py-1 rounded-full shadow-md border-2 border-white flex items-center gap-1 whitespace-nowrap pointer-events-none">
              <span>🌟 GCCPS 心情空間入口</span>
            </div>

            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="w-full max-h-[calc(100vh-80px)] overflow-y-auto bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border-4 border-amber-300/80 p-4 sm:p-6 pt-5"
            >
              {/* Mascot Avatar & Speech Bubble */}
              <div className="flex items-center gap-3.5 mb-4 mt-1">
              <motion.div
                animate={{ rotate: [-3, 3, -3] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-16 h-16 md:w-18 md:h-18 bg-gradient-to-tr from-emerald-100 to-amber-100 rounded-2xl p-1.5 shadow-md border-2 border-amber-200 shrink-0 flex items-center justify-center overflow-hidden"
              >
                <picture className="w-full h-full flex items-center justify-center">
                  <source srcSet={getWebpUrl(activeOption === 'STUDENT_LOGIN' ? currentCostume.imagePath : '/學校圖檔/吉祥物/enen_reading.png')} type="image/webp" />
                  <img
                    src={getPublicAssetUrl(activeOption === 'STUDENT_LOGIN' ? currentCostume.imagePath : '/學校圖檔/吉祥物/enen_reading.png')}
                    alt={`吉祥物恩恩 (${currentCostume.name})`}
                    className="w-full h-full object-contain filter drop-shadow"
                  />
                </picture>
              </motion.div>

              {/* Welcoming Speech Bubble */}
              <div className="relative bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-2.5 shadow-xs flex-1">
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-6 border-t-transparent border-r-8 border-r-amber-200 border-b-6 border-b-transparent" />
                <p className="text-xs md:text-sm font-black text-amber-950 leading-snug">
                  {activeOption === 'STUDENT_LOGIN'
                    ? `「${currentCostume.name}恩恩：早安！歡迎回到善導校園，開始今日的心情探索吧！${currentCostume.sparkleEmoji}」`
                    : '「老師與班長由此進入，翻開全班心情日記 📖」'}
                </p>
              </div>
            </div>


            {/* SIMPLISTIC WOODEN MODE SWITCHER TABS */}
            <div className="grid grid-cols-2 gap-2 bg-amber-100/70 p-1.5 rounded-2xl mb-4 border border-amber-200">
              {/* TAB 1: 學生個人登入 */}
              <button
                type="button"
                onClick={() => {
                  setActiveOption('STUDENT_LOGIN');
                  playSound('pop');
                }}
                className={`py-2.5 px-3 rounded-xl font-black text-xs md:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeOption === 'STUDENT_LOGIN'
                    ? 'bg-white text-indigo-950 shadow-md border-2 border-indigo-400 scale-[1.02]'
                    : 'text-amber-900/70 hover:text-amber-950 hover:bg-white/50'
                }`}
              >
                <GraduationCap className={`w-4 h-4 ${activeOption === 'STUDENT_LOGIN' ? 'text-indigo-600' : 'text-amber-700'}`} />
                <span>🎒 學生個人登入</span>
              </button>

              {/* TAB 2: 初小全班代登 */}
              <button
                type="button"
                onClick={() => {
                  setActiveOption('TEACHER_INSERT');
                  if (!selectedClass) setSelectedClass('1A');
                  setStudentNoInput('');
                  playSound('pop');
                }}
                className={`py-2.5 px-3 rounded-xl font-black text-xs md:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeOption === 'TEACHER_INSERT'
                    ? 'bg-white text-amber-950 shadow-md border-2 border-amber-500 scale-[1.02]'
                    : 'text-amber-900/70 hover:text-amber-950 hover:bg-white/50'
                }`}
              >
                <ClipboardList className={`w-4 h-4 ${activeOption === 'TEACHER_INSERT' ? 'text-amber-600' : 'text-amber-700'}`} />
                <span>📖 初小全班代登</span>
              </button>
            </div>

            {/* AUTH ERROR ALERT IF ANY */}
            {authError && (
              <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                <span className="flex-1">{authError}</span>
              </div>
            )}

            {/* ========================================================================= */}
            {/* OPTION 1 CONTENT: SIMPLISTIC STUDENT GOOGLE LOGIN                        */}
            {/* ========================================================================= */}
            {activeOption === 'STUDENT_LOGIN' && (
              <div className="space-y-3.5">
                {/* CASE A: NOT LOGGED IN */}
                {!currentUser && (
                  <div className="space-y-3">
                    {/* Primary Big Google Login Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      className="w-full py-4 px-4 bg-white hover:bg-slate-50 border-3 border-indigo-400 hover:border-indigo-600 text-slate-800 rounded-2xl font-black text-sm md:text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer group"
                    >
                      <svg className="w-6 h-6 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93z"
                        />
                      </svg>
                      <span>{loading ? "連線登入中..." : "使用學校 Google 帳號登入"}</span>
                      <ArrowRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </div>
                )}

                {/* CASE B: ALREADY LOGGED IN */}
                {currentUser && (
                  <form onSubmit={handleStudentLoginSubmit} className="space-y-3.5">
                    {/* Student Identity Card */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        {currentUser.photoURL ? (
                          <img
                            src={currentUser.photoURL}
                            alt="Student"
                            className="w-12 h-12 rounded-full border-2 border-emerald-500 object-cover shrink-0 shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm">
                            <User className="w-6 h-6" />
                          </div>
                        )}
                        <div className="truncate">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="font-black text-sm md:text-base">
                              {matchedStudent 
                                ? `${matchedStudent.class} 班 ${matchedStudent.number} 號 ${matchedStudent.chineseName}`
                                : (currentUser.displayName || 'Google 帳號同學')}
                            </span>
                          </div>
                          <div className="text-[11px] text-emerald-700 truncate font-mono mt-0.5">
                            {matchedStudent ? `學號：${matchedStudent.studentId}` : currentUser.email}
                          </div>
                        </div>
                      </div>

                      {/* Switch Account */}
                      <button
                        type="button"
                        onClick={handleSwitchAccount}
                        className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-white bg-slate-100 border border-slate-200 cursor-pointer shrink-0 ml-2"
                        title="切換其他帳號"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>切換</span>
                      </button>
                    </div>

                    {/* Special Testing Switcher for Hony */}
                    {currentUser?.email?.toLowerCase().trim() === 'hony@mail.gccps.edu.hk' && (
                      <div className="bg-purple-50/90 border border-purple-200 rounded-xl p-2.5 flex items-center gap-2 text-xs">
                        <span className="font-bold text-purple-900 shrink-0">切換測試班級：</span>
                        <select
                          className="flex-1 text-xs border border-purple-300 rounded-lg p-1 font-bold bg-white text-purple-950"
                          value={selectedClass}
                          onChange={(e) => {
                            const newClass = e.target.value;
                            setSelectedClass(newClass);
                            setStudentNoInput(newClass === '4C' ? '24' : '1');
                          }}
                        >
                          <option value="4C">4C 班 (24號 謝佩澄)</option>
                          <option value="TEST">TEST 班 (1號)</option>
                          <option value="1A">1A 班</option>
                        </select>
                      </div>
                    )}

                    {/* Remember me checkbox */}
                    <div className="flex items-center gap-2 px-1">
                      <input
                        type="checkbox"
                        id="student-remember"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                      <label htmlFor="student-remember" className="text-xs font-bold text-slate-600 cursor-pointer select-none">
                        記住我的登入 (下次免重複認證)
                      </label>
                    </div>

                    {/* Big Action Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading || !selectedClass || !studentNoInput.trim()}
                      className="w-full h-13 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-black text-sm md:text-base tracking-wide transition-all cursor-pointer shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-5 h-5 text-amber-300" />
                      <span>
                        {loading 
                          ? "進入中..." 
                          : matchedStudent
                            ? `🚀 進入 ${matchedStudent.chineseName} 的心情花園`
                            : `🚀 確認並進入心情空間`}
                      </span>
                      {!loading && <ArrowRight className="w-4 h-4" />}
                    </motion.button>
                  </form>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* OPTION 2 CONTENT: SIMPLISTIC TEACHER BATCH CLASS SELECTOR                */}
            {/* ========================================================================= */}
            {activeOption === 'TEACHER_INSERT' && (
              <form onSubmit={handleEnterTeacherBatch} className="space-y-4">
                <div className="bg-amber-50/80 border-2 border-amber-200 rounded-2xl p-3.5 space-y-2">
                  <label className="block text-xs font-black text-amber-950 uppercase tracking-wide">
                    請選擇今日要點名錄入的班別
                  </label>

                  <div className="relative">
                    <select
                      id="teacher-batch-class-select"
                      className="w-full h-12 px-3.5 border-2 border-amber-300 focus:border-amber-600 rounded-xl font-black text-slate-800 bg-white focus:ring-2 focus:ring-amber-200 text-sm cursor-pointer appearance-none"
                      value={selectedClass}
                      onChange={(e) => {
                        setSelectedClass(e.target.value);
                        setStudentNoInput('');
                        playSound('pop');
                      }}
                      required
                    >
                      <option value="">-- 請選擇班別 --</option>
                      <optgroup label="初小 (P.1 - P.3) 班級">
                        {['1A','1B','1C','2A','2B','2C','2D','3A','3B','3C','3D'].map(c => (
                          <option key={c} value={c}>{c} 班</option>
                        ))}
                      </optgroup>
                      <optgroup label="高小 (P.4 - P.6) 班級">
                        {['4A','4B','4C','4D','5A','5B','5C','5D','6A','6B','6C','6D'].map(c => (
                          <option key={c} value={c}>{c} 班</option>
                        ))}
                      </optgroup>
                      <optgroup label="測試專用">
                        <option value="TEST">TEST 測試班級</option>
                      </optgroup>
                    </select>
                    <ChevronDown className="w-5 h-5 text-amber-600 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {selectedClass && (
                    <div className="text-[11px] font-bold text-amber-800 flex items-center justify-between pt-1">
                      <span>🏫 已選擇：<strong>{selectedClass} 班</strong></span>
                      <span className="bg-white px-2 py-0.5 rounded-md border border-amber-200 text-amber-900">
                        共 {classStudents.length || 30} 位同學
                      </span>
                    </div>
                  )}
                </div>

                {/* Big Action Submit Button for Batch */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || !selectedClass}
                  className="w-full h-13 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-slate-300 disabled:to-slate-300 text-white rounded-2xl font-black text-sm md:text-base tracking-wide transition-all cursor-pointer shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <span>
                    {loading 
                      ? "正在翻開日記..." 
                      : `🎨 翻開 ${selectedClass ? selectedClass + ' 班 ' : ''}全班心情日記`}
                  </span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </motion.button>
              </form>
            )}
          </motion.div>
          </div>
        </main>

        {/* BOTTOM HELPER FOOTER */}
        <footer className="relative z-30 px-4 py-2.5 text-center text-[11px] font-bold text-amber-950/70 pointer-events-auto">
          <span>天主教善導小學 · 仁愛、忍耐 🕊️</span>
        </footer>
      </motion.div>

      {/* ========================================================================= */}
      {/* COLLAPSIBLE INFO MODAL (ZERO SCREEN CLUTTER)                              */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showInfoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-4 border-amber-300 relative space-y-4 text-slate-800"
            >
              <div className="flex items-center gap-2 text-indigo-900 font-black text-base border-b border-slate-100 pb-2">
                <Info className="w-5 h-5 text-indigo-600" />
                <span>善導小學 登入說明指南</span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed font-medium">
                <p>
                  🎒 <strong>學生個人登入</strong>：全校小一至小六同學，可使用學校派發的 Google 帳號（例如 <code className="bg-indigo-50 px-1 py-0.5 rounded text-indigo-900 font-mono font-bold">sXXXXXX@mail.gccps.edu.hk</code>）一鍵登入。
                </p>
                <p>
                  📖 <strong>初小全班代登</strong>：老師或班長可選擇班級，翻開全班心情日記進行批次心情點名。
                </p>
                <p className="text-[11px] text-slate-500 pt-1">
                  如在登入時遇到問題，請聯繫班主任或校務處資訊科技組。
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs cursor-pointer shadow-md transition-all"
              >
                我知道了，返回地圖
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
