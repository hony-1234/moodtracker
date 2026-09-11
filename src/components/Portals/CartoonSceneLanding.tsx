import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'motion/react';
import { Heart, GraduationCap, BookOpen, ArrowRight, RefreshCw, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { getPublicAssetUrl } from '../../utils/assetHelper';
import { SkeletalEnEn, EyeState } from './SkeletalEnEn';
import { useDevice } from '../../hooks/useDevice';
import { getActiveCostume, getRandomCostume, setActiveCostume, MascotCostume } from '../../utils/mascotCostumes';

interface CartoonSceneLandingProps {
  setViewState: (view: 'LANDING' | 'STUDENT_LOGIN' | 'STUDENT_DASHBOARD' | 'TEACHER_LOGIN' | 'TEACHER_DASHBOARD' | 'TEACHER_P1_3_BATCH') => void;
  setPrivacyModalVisible: (visible: boolean) => void;
  onSwitchToClassic: () => void;
}

export const CartoonSceneLanding: React.FC<CartoonSceneLandingProps> = ({
  setViewState,
  setPrivacyModalVisible,
  onSwitchToClassic
}) => {
  // Device & viewport detection
  const {
    deviceType,
    isMobile,
    isTablet,
    isDesktop,
    isPortrait,
    isLandscape,
    width: windowWidth,
    height: windowHeight
  } = useDevice();

  // Navigation entrance animation states: null | 'STUDENT' | 'TEACHER'
  const [enteringRole, setEnteringRole] = useState<'STUDENT' | 'TEACHER' | null>(null);
  const [mascotWiggle, setMascotWiggle] = useState(false);
  const [mascotHearts, setMascotHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [hoveredRole, setHoveredRole] = useState<'STUDENT' | 'TEACHER' | 'MASCOT' | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Mascot dynamic costume (randomized upon entering the website)
  const [currentCostume, setCurrentCostume] = useState<MascotCostume>(() => getActiveCostume());

  useEffect(() => {
    const handleCostumeUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<MascotCostume>;
      if (customEvent.detail) {
        setCurrentCostume(customEvent.detail);
      }
    };
    window.addEventListener('gccps:costume-changed', handleCostumeUpdate);
    return () => window.removeEventListener('gccps:costume-changed', handleCostumeUpdate);
  }, []);

  // Automatically switch costume periodically while lingering on the landing page (every 20s when idle)
  useEffect(() => {
    const timer = setInterval(() => {
      if (hoveredRole !== 'MASCOT' && !mascotWiggle) {
        const next = getRandomCostume(currentCostume.id);
        setCurrentCostume(next);
        setActiveCostume(next);
      }
    }, 20000);
    return () => clearInterval(timer);
  }, [currentCostume.id, hoveredRole, mascotWiggle]);

  // Motion values for subtle cursor tracking in Live2D mascots
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Eye states for the two flying Live2D mascots
  const [flyEye1, setFlyEye1] = useState<EyeState>('happy');
  const [flyEye2, setFlyEye2] = useState<EyeState>('wink_happy');

  // Periodically cycle flying mascots eye expressions
  useEffect(() => {
    const eyeList: EyeState[] = ['normal', 'happy', 'wink_left', 'wink_right', 'look_down', 'surprised', 'star', 'love'];
    const interval = setInterval(() => {
      const randomEye1 = eyeList[Math.floor(Math.random() * eyeList.length)];
      const randomEye2 = eyeList[Math.floor(Math.random() * eyeList.length)];
      setFlyEye1(randomEye1);
      setFlyEye2(randomEye2);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Mouse move handler for Live2D parallax
  const handleMouseMove = (e: React.MouseEvent) => {
    const { innerWidth, innerHeight } = window;
    mouseX.set((e.clientX / innerWidth) - 0.5);
    mouseY.set((e.clientY / innerHeight) - 0.5);
  };

  // Play gentle synthesized chime / entrance sound via Web Audio API
  const playSoundEffect = (type: 'student' | 'teacher' | 'mascot') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'student') {
        // Cheerful ascending arpeggio (C5, E5, G5, C6)
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
          gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.09);
          osc.stop(ctx.currentTime + idx * 0.09 + 0.35);
        });
      } else if (type === 'teacher') {
        // Warm harmonious chime (F4, A4, C5, F5)
        [349.23, 440.00, 523.25, 698.46].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
          gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.45);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.1);
          osc.stop(ctx.currentTime + idx * 0.1 + 0.45);
        });
      } else {
        // Mascot cute pop / sparkle
        [880, 1174.66, 1396.91].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
          gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.07);
          osc.stop(ctx.currentTime + idx * 0.07 + 0.25);
        });
      }
    } catch {
      // AudioContext unavailable or blocked
    }
  };

  // Trigger student entrance animation and navigation
  const handleStudentClick = () => {
    if (enteringRole) return;
    playSoundEffect('student');
    setEnteringRole('STUDENT');
    setTimeout(() => {
      setViewState('STUDENT_LOGIN');
    }, 550);
  };

  // Trigger teacher entrance animation and navigation
  const handleTeacherClick = () => {
    if (enteringRole) return;
    playSoundEffect('teacher');
    setEnteringRole('TEACHER');
    setTimeout(() => {
      setViewState('TEACHER_LOGIN');
    }, 1350);
  };

  // Click mascot: wiggle, burst hearts & navigate to student points system
  const handleMascotClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSoundEffect('mascot');
    setMascotWiggle(true);
    setTimeout(() => setMascotWiggle(false), 900);

    const newHearts = Array.from({ length: 5 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 80,
      y: -20 - Math.random() * 60
    }));
    setMascotHearts(prev => [...prev.slice(-10), ...newHearts]);

    try {
      window.open('https://hony-1234.github.io/student-points-system/', '_blank', 'noopener,noreferrer');
    } catch {
      window.location.href = 'https://hony-1234.github.io/student-points-system/';
    }
  };

  // Quick costume reroll
  const handleRandomizeCostume = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSoundEffect('mascot');
    const next = getRandomCostume(currentCostume.id);
    setCurrentCostume(next);
    setActiveCostume(next);
  };


  return (
    <div 
      className="fixed inset-0 z-40 overflow-hidden select-none bg-sky-200"
      onMouseMove={handleMouseMove}
    >
      {/* 1. Full-Screen Cartoon School Campus Backdrop */}
      <div className="absolute inset-0 z-0">
        <img
          src={getPublicAssetUrl('/學校圖檔/school_cartoon_backdrop.png')}
          alt="天主教善導小學校園全景"
          className="w-full h-full object-cover object-bottom"
        />
        {/* Soft atmospheric sunlight gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-amber-100/15 pointer-events-none" />
      </div>

      {/* 2. Ambient Drifting Clouds in the Sky */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        <motion.div
          animate={{ x: ['-20%', '115%'] }}
          transition={{ duration: 65, repeat: Infinity, ease: 'linear' }}
          className="absolute top-6 left-0 opacity-80"
        >
          <div className="w-56 h-16 bg-white/75 rounded-full blur-[2px] shadow-sm" />
        </motion.div>
        <motion.div
          animate={{ x: ['-15%', '120%'] }}
          transition={{ duration: 85, repeat: Infinity, ease: 'linear', delay: 15 }}
          className="absolute top-16 left-0 opacity-60"
        >
          <div className="w-72 h-20 bg-white/60 rounded-full blur-[3px]" />
        </motion.div>
      </div>

      {/* 3. Two Flying Live-2D 恩恩 Mascots in the Sky (Device-Scale Aware) */}
      {/* Flying Mascot 1: Upper Left / Center Sky */}
      <motion.div
        className="absolute top-[14%] sm:top-[8%] left-[4%] sm:left-[10%] md:left-[18%] z-15 pointer-events-none"
        animate={{
          x: [0, 50, 90, 40, 0],
          y: [0, -20, 8, -10, 0],
          rotate: [-4, 6, -3, 5, -4]
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <div className="relative w-16 h-20 sm:w-28 sm:h-32 md:w-36 md:h-40 filter drop-shadow-md">
          <SkeletalEnEn
            width="100%"
            height="100%"
            className="mb-0"
            isWiggling={false}
            mascotX={0}
            mascotY={0}
            mouseX={mouseX}
            mouseY={mouseY}
            isHovered={false}
            eyeState={flyEye1}
          />
          <motion.div
            animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="absolute -top-2 -right-2 text-yellow-300 text-xs sm:text-base"
          >
            ✨
          </motion.div>
        </div>
      </motion.div>

      {/* Flying Mascot 2: Upper Right Sky (shown on wider screens or scaled down) */}
      {(!isMobile || isLandscape) && (
        <motion.div
          className="absolute top-[10%] sm:top-[12%] right-[5%] sm:right-[10%] md:right-[16%] z-15 pointer-events-none"
          animate={{
            x: [0, -50, -80, -30, 0],
            y: [0, 16, -12, 10, 0],
            rotate: [4, -5, 3, -4, 4]
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2
          }}
        >
          <div className="relative w-18 h-22 sm:w-24 sm:h-28 md:w-32 md:h-36 filter drop-shadow-md">
            <SkeletalEnEn
              width="100%"
              height="100%"
              className="mb-0"
              isWiggling={false}
              mascotX={0}
              mascotY={0}
              mouseX={mouseX}
              mouseY={mouseY}
              isHovered={false}
              eyeState={flyEye2}
            />
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.3, 0.9] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: 0.8 }}
              className="absolute -top-1 -left-2 text-amber-300 text-xs sm:text-base"
            >
              ⭐
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* 4. School Gate / Entrance Golden Glow when someone is entering */}
      <AnimatePresence>
        {enteringRole && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 1, 1], scale: [0.8, 1.25, 1.1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute left-[47%] bottom-[25%] md:bottom-[28%] -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center"
          >
            <div className="w-48 h-60 sm:w-56 sm:h-72 md:w-72 md:h-88 bg-gradient-to-t from-yellow-300/80 via-amber-200/50 to-transparent rounded-full blur-2xl" />
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute -top-8 bg-amber-400 text-amber-950 font-black text-xs md:text-sm px-4 py-1.5 rounded-full shadow-xl border-2 border-white flex items-center gap-1.5 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-amber-900 animate-spin" />
              <span>歡迎進入校園 🌟</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Top School Header & Controls Bar */}
      <header className="absolute top-0 inset-x-0 z-30 px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between pointer-events-auto bg-gradient-to-b from-black/40 via-black/10 to-transparent">
        {/* School Crest & Title */}
        <div className="flex items-center gap-2 sm:gap-3 bg-white/90 backdrop-blur-md px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl shadow-lg border border-white/60">
          <img
            src={getPublicAssetUrl('/學校圖檔/學校logo/school_logo.png')}
            alt="天主教善導小學校徽"
            className="w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 object-contain drop-shadow"
          />
          <div>
            <h1 className="text-xs sm:text-base md:text-lg font-black text-slate-800 tracking-tight leading-tight whitespace-nowrap">
              天主教善導小學
            </h1>
            <p className="text-[9px] sm:text-[11px] md:text-xs font-semibold text-emerald-700 whitespace-nowrap hidden sm:block">
              Good Counsel Catholic Primary School
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Sound & Music Toggle */}
          <button
            type="button"
            data-role="sound-toggle-btn"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              window.dispatchEvent(new CustomEvent('gccps:toggle-bgm'));
            }}
            className="bg-white/90 hover:bg-white text-slate-700 p-2 sm:p-2.5 rounded-full shadow-md border border-white/60 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title={soundEnabled ? '音效與音樂已開啟 (點擊關閉)' : '音效與音樂已關閉 (點擊開啟)'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />}
          </button>

          {/* Reversibility Switch: Toggle back to Classic Landing */}
          <button
            type="button"
            data-role="switch-classic-btn"
            onClick={onSwitchToClassic}
            className="flex items-center gap-1.5 sm:gap-2 bg-white/90 hover:bg-white text-slate-800 hover:text-indigo-600 font-bold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl shadow-md border border-white/60 transition-all hover:scale-105 active:scale-95 text-xs sm:text-sm cursor-pointer whitespace-nowrap"
            title="切換回經典登入頁面"
          >
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
            <span className="hidden sm:inline">切換經典版面</span>
          </button>
        </div>
      </header>

      {/* 6. Main Interactive Stage (Bottom Area - Adaptive Grounding Height) */}
      <div className={`absolute inset-x-0 bottom-0 z-25 ${isPortrait ? (isMobile ? 'h-[46%]' : 'h-[50%]') : 'h-[58%] md:h-[64%]'} flex items-end justify-between px-2 sm:px-6 md:px-12 lg:px-20 pb-5 sm:pb-6 md:pb-8 pointer-events-none`}>

        {/* ======================================================== */}
        {/* LEFT SIDE: BOY & GIRL STUDENTS (STUDENT PORTAL)         */}
        {/* ======================================================== */}
        <div 
          data-role="student-portal-group"
          className="relative flex-1 flex flex-col items-center justify-end pointer-events-auto max-w-[32%] md:max-w-[28%]"
        >
          {/* Floating Action Badge */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-2 cursor-pointer"
            onClick={handleStudentClick}
            onMouseEnter={() => setHoveredRole('STUDENT')}
            onMouseLeave={() => setHoveredRole(null)}
          >
            <button
              type="button"
              data-role="student-portal-btn"
              onClick={handleStudentClick}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black px-2.5 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-full shadow-xl border-2 border-white/80 flex items-center justify-center gap-1 sm:gap-2 transition-transform hover:scale-108 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-300 shrink-0" />
              <span className="text-[11px] sm:text-xs md:text-sm font-black tracking-wide whitespace-nowrap">學生心情空間</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300 shrink-0 hidden sm:inline" />
            </button>
            {/* Interactive Speech Bubble */}
            <AnimatePresence>
              {hoveredRole === 'STUDENT' && !enteringRole && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.9 }}
                  className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-blue-900 font-bold text-xs md:text-sm px-3.5 py-1.5 rounded-xl shadow-lg border border-blue-200 whitespace-nowrap pointer-events-none flex items-center gap-1.5"
                >
                  <span>🎒</span>
                  <span>點擊我們進入學生登入！</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Student Characters (Boy & Girl) */}
          <motion.div
            data-role="student-characters"
            className="relative flex items-end justify-center cursor-pointer group"
            onClick={handleStudentClick}
            onMouseEnter={() => setHoveredRole('STUDENT')}
            onMouseLeave={() => setHoveredRole(null)}
            animate={
              enteringRole === 'STUDENT'
                ? {
                    // Running & entering school animation: scales down into perspective depth and moves to school door
                    x: ['0vw', '10vw', '20vw', '28vw'],
                    y: ['0vh', '-4vh', '-11vh', '-16vh'],
                    scale: [1, 0.8, 0.45, 0.15],
                    rotate: [0, -6, 6, -3, 0],
                    opacity: [1, 1, 0.85, 0]
                  }
                : {
                    scale: hoveredRole === 'STUDENT' ? 1.05 : 1,
                    y: hoveredRole === 'STUDENT' ? -4 : 0
                  }
            }
            transition={
              enteringRole === 'STUDENT'
                ? { duration: 1.3, ease: 'easeInOut' }
                : { duration: 0.25 }
            }
          >
            {/* Ground Shadow */}
            <div className="absolute -bottom-2 w-[85%] h-5 bg-black/30 rounded-full blur-md" />

            {/* Boy Student (Left) - In Mascot Art Style */}
            <img
              src={getPublicAssetUrl('/學校圖檔/學生/chibi_student_boy.png')}
              alt="善導小學男學生"
              className="h-28 sm:h-40 md:h-52 lg:h-64 xl:h-72 max-h-[25vh] sm:max-h-[34vh] md:max-h-[40vh] w-auto object-contain drop-shadow-xl select-none -mr-3 md:-mr-5 z-10 transition-transform group-hover:-translate-y-1"
            />
            {/* Girl Student (Right) - In Mascot Art Style */}
            <img
              src={getPublicAssetUrl('/學校圖檔/學生/chibi_student_girl.png')}
              alt="善導小學女學生"
              className="h-28 sm:h-40 md:h-52 lg:h-64 xl:h-72 max-h-[25vh] sm:max-h-[34vh] md:max-h-[40vh] w-auto object-contain drop-shadow-xl select-none z-10 transition-transform group-hover:-translate-y-1"
            />
          </motion.div>
        </div>


        {/* ======================================================== */}
        {/* CENTER: AUTHENTIC SCHOOL MASCOT 恩恩                     */}
        {/* ======================================================== */}
        <div 
          data-role="mascot-portal-group"
          className="relative flex-1 flex flex-col items-center justify-end pointer-events-auto max-w-[34%] md:max-w-[30%] pb-1 md:pb-2"
        >
          {/* Floating Gratitude Hearts */}
          <div className="absolute inset-0 pointer-events-none">
            {mascotHearts.map(heart => (
              <motion.div
                key={heart.id}
                initial={{ opacity: 1, scale: 0.5, x: heart.x, y: 0 }}
                animate={{ opacity: 0, scale: 1.6, y: heart.y }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
                className="absolute left-1/2 bottom-32 -translate-x-1/2 text-rose-500 font-bold flex items-center gap-1"
              >
                <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
              </motion.div>
            ))}
          </div>

          {/* School Motto Banner */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-2 text-center select-none pointer-events-none"
          >
            <div className="bg-white/95 backdrop-blur-md px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full shadow-lg border border-amber-200 inline-flex items-center gap-1 sm:gap-1.5 whitespace-nowrap">
              <span className="text-amber-500 font-bold text-xs">💛</span>
              <span className="text-[9.5px] sm:text-xs md:text-sm font-black text-amber-900 tracking-wide whitespace-nowrap">
                感恩・忠信・關愛
              </span>
            </div>
          </motion.div>

          {/* Official Mascot 恩恩 Figure */}
          <motion.div
            data-role="mascot-figure"
            className="relative cursor-pointer group flex flex-col items-center"
            onClick={handleMascotClick}
            title={`${currentCostume.name} - 點擊前往學生積點獎勵系統`}
            onMouseEnter={() => setHoveredRole('MASCOT')}
            onMouseLeave={() => setHoveredRole(null)}
            animate={{
              y: mascotWiggle ? [0, -14, 0, -8, 0] : [0, -6, 0],
              scale: mascotWiggle ? [1, 1.12, 0.95, 1.06, 1] : (hoveredRole === 'MASCOT' ? 1.08 : 1),
              rotate: mascotWiggle ? [0, -6, 6, -3, 0] : 0
            }}
            transition={{
              y: { duration: mascotWiggle ? 0.8 : 3.5, repeat: mascotWiggle ? 0 : Infinity, ease: 'easeInOut' },
              scale: { duration: 0.3 },
              rotate: { duration: 0.8 }
            }}
          >
            {/* Ground Shadow */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[70%] h-4 bg-black/25 rounded-full blur-md" />

            {/* Radiant Angelic Glow behind 恩恩 */}
            <div className={`absolute inset-0 ${currentCostume.accentGlow} rounded-full blur-xl scale-95 group-hover:scale-110 transition-transform duration-500 -z-10`} />

            {/* Dynamic Costume Mascot */}
            <motion.img
              key={currentCostume.id}
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              src={getPublicAssetUrl(currentCostume.imagePath)}
              alt={`天主教善導小學校園吉祥物 恩恩 (${currentCostume.name}) - 點擊前往學生積點獎勵系統`}
              className="h-28 sm:h-40 md:h-52 lg:h-64 xl:h-72 max-h-[25vh] sm:max-h-[34vh] md:max-h-[40vh] w-auto object-contain drop-shadow-2xl select-none"
            />

            {/* Costume Badge & Quick Re-roll Dice underneath */}
            <div className="relative -mt-2.5 sm:-mt-3 z-20 flex items-center gap-1.5 opacity-95 group-hover:opacity-100 transition-opacity">
              <span className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[11px] md:text-xs font-black shadow-md border border-white/60 flex items-center gap-1 ${currentCostume.badgeBg}`}>
                <span>{currentCostume.sparkleEmoji}</span>
                <span>{currentCostume.name}</span>
              </span>
              <button
                type="button"
                onClick={handleRandomizeCostume}
                className="p-1 rounded-full bg-white/90 hover:bg-white text-amber-800 shadow-md border border-amber-200 transition-all hover:rotate-180 hover:scale-110 active:scale-95"
                title="隨機換裝 (點擊切換不同造型)"
              >
                <RefreshCw className="w-3 h-3 text-amber-700" />
              </button>
            </div>

            {/* Mascot Interactive Speech on Hover */}
            <AnimatePresence>
              {hoveredRole === 'MASCOT' && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.9 }}
                  className="absolute -top-14 left-1/2 -translate-x-1/2 bg-amber-500 text-white font-bold text-xs md:text-sm px-3.5 py-1.5 rounded-xl shadow-xl border-2 border-white whitespace-nowrap pointer-events-none flex items-center gap-1.5 z-20"
                >
                  <span>{currentCostume.sparkleEmoji}</span>
                  <span>{currentCostume.speech}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </div>


        {/* ======================================================== */}
        {/* RIGHT SIDE: MALE & FEMALE TEACHERS (TEACHER PORTAL)     */}
        {/* ======================================================== */}
        <div 
          data-role="teacher-portal-group"
          className="relative flex-1 flex flex-col items-center justify-end pointer-events-auto max-w-[32%] md:max-w-[28%]"
        >
          {/* Floating Action Badge */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            className="mb-2 cursor-pointer"
            onClick={handleTeacherClick}
            onMouseEnter={() => setHoveredRole('TEACHER')}
            onMouseLeave={() => setHoveredRole(null)}
          >
            <button
              type="button"
              data-role="teacher-portal-btn"
              onClick={handleTeacherClick}
              className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black px-2.5 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-full shadow-xl border-2 border-white/80 flex items-center justify-center gap-1 sm:gap-2 transition-transform hover:scale-108 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-amber-300 shrink-0" />
              <span className="text-[11px] sm:text-xs md:text-sm font-black tracking-wide whitespace-nowrap">
                {isMobile ? '教師終端' : '教師及管理終端'}
              </span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-amber-300 shrink-0 hidden sm:inline" />
            </button>
            {/* Interactive Speech Bubble */}
            <AnimatePresence>
              {hoveredRole === 'TEACHER' && !enteringRole && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.9 }}
                  className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-emerald-900 font-bold text-xs md:text-sm px-3.5 py-1.5 rounded-xl shadow-lg border border-emerald-200 whitespace-nowrap pointer-events-none flex items-center gap-1.5"
                >
                  <span>📚</span>
                  <span>點擊我們進入教師終端！</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Teacher Characters (Male & Female) */}
          <motion.div
            data-role="teacher-characters"
            className="relative flex items-end justify-center cursor-pointer group"
            onClick={handleTeacherClick}
            onMouseEnter={() => setHoveredRole('TEACHER')}
            onMouseLeave={() => setHoveredRole(null)}
            animate={
              enteringRole === 'TEACHER'
                ? {
                    // Running & entering school animation: scales down into perspective depth and moves to school door
                    x: ['0vw', '-10vw', '-20vw', '-26vw'],
                    y: ['0vh', '-4vh', '-11vh', '-16vh'],
                    scale: [1, 0.8, 0.45, 0.15],
                    rotate: [0, 6, -6, 3, 0],
                    opacity: [1, 1, 0.85, 0]
                  }
                : {
                    scale: hoveredRole === 'TEACHER' ? 1.05 : 1,
                    y: hoveredRole === 'TEACHER' ? -4 : 0
                  }
            }
            transition={
              enteringRole === 'TEACHER'
                ? { duration: 1.3, ease: 'easeInOut' }
                : { duration: 0.25 }
            }
          >
            {/* Ground Shadow */}
            <div className="absolute -bottom-2 w-[85%] h-5 bg-black/30 rounded-full blur-md" />

            {/* Male Teacher (Left) */}
            <img
              src={getPublicAssetUrl('/學校圖檔/教師/teacher_male.png')}
              alt="善導小學男教師"
              className="h-32 sm:h-44 md:h-56 lg:h-68 xl:h-76 max-h-[28vh] sm:max-h-[37vh] md:max-h-[43vh] w-auto object-contain drop-shadow-xl select-none -mr-3 md:-mr-5 z-10 transition-transform group-hover:-translate-y-1"
            />
            {/* Female Teacher (Right) */}
            <img
              src={getPublicAssetUrl('/學校圖檔/教師/teacher_female.png')}
              alt="善導小學女教師"
              className="h-30 sm:h-42 md:h-54 lg:h-66 xl:h-74 max-h-[26vh] sm:max-h-[35vh] md:max-h-[41vh] w-auto object-contain drop-shadow-xl select-none z-10 transition-transform group-hover:-translate-y-1"
            />
          </motion.div>
        </div>

      </div>

      {/* 7. Bottom Ground Info Bar */}
      <footer className="absolute bottom-1 sm:bottom-1.5 inset-x-0 z-30 px-3 sm:px-6 py-1 flex items-center justify-between text-[10px] sm:text-[11px] md:text-xs text-white/90 drop-shadow pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={() => setPrivacyModalVisible(true)}
            className="hover:underline hover:text-white transition-colors cursor-pointer"
          >
            個人資料私隱政策
          </button>
          <span>•</span>
          <span>© 2026 天主教善導小學 版權所有</span>
        </div>
        <div className="hidden sm:block">
          <span>深水埗廣利道9號 • 培育愛心與感恩成長</span>
        </div>
      </footer>

      {/* 8. Full-screen Cinematic Flash Overlay during entrance */}
      <AnimatePresence>
        {enteringRole && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.2, 0.9] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.3, times: [0, 0.65, 1], ease: 'easeInOut' }}
            className="fixed inset-0 bg-white z-50 pointer-events-none flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="flex flex-col items-center gap-3 text-slate-800"
            >
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-3xl shadow-lg border-2 border-amber-300 animate-bounce">
                {enteringRole === 'STUDENT' ? '🎒' : '📚'}
              </div>
              <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-wide">
                {enteringRole === 'STUDENT' ? '歡迎進入學生心情空間...' : '歡迎進入教師及管理終端...'}
              </h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
