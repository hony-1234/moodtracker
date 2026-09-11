import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart } from 'lucide-react';
import { getPublicAssetUrl } from '../../utils/assetHelper';
import { useDevice } from '../../hooks/useDevice';

interface StudentBookClosingAnimationProps {
  selectedClass: string;
  activeStudentNumber: string | number;
  studentDisplayName: string;
  onComplete: () => void;
  soundEnabled?: boolean;
}

export const StudentBookClosingAnimation: React.FC<StudentBookClosingAnimationProps> = ({
  selectedClass,
  activeStudentNumber,
  studentDisplayName,
  onComplete,
  soundEnabled = true,
}) => {
  const { isMobile, isTablet } = useDevice();
  // Phase 1: OPEN_SPREAD -> Phase 2: FOLDING -> Phase 3: CLOSED_IMPACT
  const [phase, setPhase] = useState<'OPEN_SPREAD' | 'FOLDING' | 'CLOSED_IMPACT'>('OPEN_SPREAD');
  const [showFarewell, setShowFarewell] = useState(false);

  // Play synthesized audio: page turn -> thud -> gentle chime
  useEffect(() => {
    if (soundEnabled) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          if (ctx.state === 'suspended') {
            ctx.resume();
          }
          const now = ctx.currentTime;

          // 1. Page turn swoosh (paper friction)
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
          filter.frequency.setValueAtTime(1400, now);
          filter.frequency.exponentialRampToValueAtTime(320, now + 0.32);
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.16, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          noise.start(now);
          noise.stop(now + 0.35);

          // 2. Book thud on impact (around 500ms when cover snaps shut)
          const thudTime = now + 0.52;
          const osc = ctx.createOscillator();
          const thudGain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(160, thudTime);
          osc.frequency.exponentialRampToValueAtTime(36, thudTime + 0.25);
          thudGain.gain.setValueAtTime(0.32, thudTime);
          thudGain.gain.exponentialRampToValueAtTime(0.001, thudTime + 0.26);
          osc.connect(thudGain);
          thudGain.connect(ctx.destination);
          osc.start(thudTime);
          osc.stop(thudTime + 0.28);

          // 3. Cheerful angelic chime (C5, E5, G5, C6)
          const chimeTime = now + 0.58;
          const freqs = [523.25, 659.25, 783.99, 1046.5];
          freqs.forEach((f, idx) => {
            const cOsc = ctx.createOscillator();
            const cGain = ctx.createGain();
            cOsc.type = 'sine';
            cOsc.frequency.setValueAtTime(f, chimeTime + idx * 0.09);
            cGain.gain.setValueAtTime(0.09, chimeTime + idx * 0.09);
            cGain.gain.exponentialRampToValueAtTime(0.001, chimeTime + idx * 0.09 + 0.45);
            cOsc.connect(cGain);
            cGain.connect(ctx.destination);
            cOsc.start(chimeTime + idx * 0.09);
            cOsc.stop(chimeTime + idx * 0.09 + 0.5);
          });
        }
      } catch (err) {
        console.warn('Audio synthesis note:', err);
      }
    }

    // Phase transition schedule
    const foldTimer = setTimeout(() => {
      setPhase('FOLDING');
    }, 100);

    const closeTimer = setTimeout(() => {
      setPhase('CLOSED_IMPACT');
      setShowFarewell(true);
    }, 520);

    const finishTimer = setTimeout(() => {
      onComplete();
    }, 2400);

    return () => {
      clearTimeout(foldTimer);
      clearTimeout(closeTimer);
      clearTimeout(finishTimer);
    };
  }, [soundEnabled, onComplete]);

  // Responsive dimensions
  const openWidth = isMobile ? 320 : isTablet ? 520 : 640;
  const openHeight = isMobile ? 220 : isTablet ? 340 : 400;

  return (
    <motion.div
      data-role="student-book-closing-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-black/75 backdrop-blur-md p-4 select-none cursor-pointer"
      onClick={onComplete}
      title="點擊可立即跳過並登出"
    >
      {/* Ambient Classroom Lighting */}
      <div className="absolute inset-0 bg-radial from-amber-600/25 via-black/40 to-black/80 pointer-events-none" />

      {/* Floating Sparkles & Blessing Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: `${(i * 5.8 + 2)}%`,
              y: '100%',
              opacity: 0,
              scale: Math.random() * 0.5 + 0.6
            }}
            animate={{
              y: '-20%',
              opacity: [0, 0.9, 0],
              rotate: Math.random() * 360
            }}
            transition={{
              duration: 2.0 + Math.random() * 1.5,
              repeat: Infinity,
              delay: (i * 0.1) % 1.4,
              ease: 'easeOut'
            }}
            className="absolute text-yellow-300 text-sm sm:text-lg"
          >
            {i % 3 === 0 ? '✨' : i % 3 === 1 ? '💛' : '⭐'}
          </motion.div>
        ))}
      </div>

      {/* 3D DESK & BOOK CLOSING STAGE */}
      <div
        className="relative flex flex-col items-center justify-center"
        style={{ perspective: '1600px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Desk Contact Shadow */}
        <div
          className="absolute -bottom-8 rounded-full bg-black/50 blur-xl pointer-events-none transition-all duration-400"
          style={{
            width: phase === 'CLOSED_IMPACT' ? '300px' : `${openWidth * 0.95}px`,
            height: '32px'
          }}
        />

        {/* 1. STAGE A: OPEN JOURNAL FOLDING SHUT (0ms - 520ms) */}
        {phase !== 'CLOSED_IMPACT' && (
          <motion.div
            className="relative flex items-stretch rounded-3xl"
            style={{
              width: `${openWidth}px`,
              height: `${openHeight}px`,
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Left Page (Folds up toward spine) */}
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{ rotateY: phase === 'FOLDING' ? 75 : 0 }}
              transition={{ duration: 0.42, ease: [0.4, 0, 0.2, 1] }}
              className="relative w-1/2 h-full bg-[#FCF9F2] border-4 border-r-0 border-[#5A3825] rounded-l-2xl sm:rounded-l-3xl shadow-2xl overflow-hidden p-4 sm:p-6 flex flex-col justify-between origin-right"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b-2 border-dashed border-amber-200">
                  <span className="text-[11px] sm:text-xs font-black text-amber-900 flex items-center gap-1">
                    📅 今日心情日記
                  </span>
                  <span className="text-amber-500 text-xs">✨</span>
                </div>
                <p className="text-[10px] sm:text-xs font-bold text-amber-700/80 mt-1.5">
                  {selectedClass} 班 {activeStudentNumber} 號 · {studentDisplayName}
                </p>
              </div>

              {/* Middle Stamp Decoration */}
              <div className="my-auto text-center py-2">
                <div className="inline-block p-2 rounded-2xl bg-amber-100/60 border border-amber-300/80 text-amber-900">
                  <p className="text-xs sm:text-sm font-black">天天感恩・心靈富足</p>
                  <p className="text-[10px] sm:text-xs text-amber-700 mt-0.5">天主教善導小學</p>
                </div>
              </div>

              {/* Left Page Bottom ruling lines */}
              <div className="space-y-1.5 opacity-40">
                <div className="h-0.5 bg-amber-300 w-full rounded-full" />
                <div className="h-0.5 bg-amber-300 w-4/5 rounded-full" />
              </div>

              {/* Shadow darkening */}
              <motion.div
                animate={{ opacity: phase === 'FOLDING' ? 0.45 : 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 bg-black pointer-events-none"
              />
            </motion.div>

            {/* Right Page (Flips over toward left) */}
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{ rotateY: phase === 'FOLDING' ? -95 : 0 }}
              transition={{ duration: 0.42, ease: [0.4, 0, 0.2, 1] }}
              className="relative w-1/2 h-full bg-[#FCF9F2] border-4 border-l-0 border-[#5A3825] rounded-r-2xl sm:rounded-r-3xl shadow-xl p-4 sm:p-6 flex flex-col justify-between overflow-hidden origin-left"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b-2 border-dashed border-amber-200">
                  <span className="text-[11px] sm:text-xs font-black text-amber-800">
                    💖 成長印記
                  </span>
                  <span className="text-xs">🌟</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-900 font-bold">
                  <span>完成打卡：</span>
                  <span className="text-emerald-600 font-black">已蓋章封存 ✓</span>
                </div>
              </div>

              {/* Verified Big Stamp */}
              <div className="my-auto flex items-center justify-center">
                <div className="border-4 border-amber-500/80 rounded-2xl p-2.5 sm:p-3 rotate-[-6deg] bg-amber-50 shadow-md text-center">
                  <span className="text-xl sm:text-2xl">💮</span>
                  <p className="text-[10px] sm:text-xs font-black text-amber-900">天主保佑</p>
                  <p className="text-[9px] font-bold text-amber-700">善導好孩子</p>
                </div>
              </div>

              {/* Bottom lines */}
              <div className="space-y-1.5 opacity-40">
                <div className="h-0.5 bg-amber-300 w-full rounded-full" />
                <div className="h-0.5 bg-amber-300 w-5/6 rounded-full" />
              </div>

              {/* Shadow darkening */}
              <motion.div
                animate={{ opacity: phase === 'FOLDING' ? 0.45 : 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 bg-black pointer-events-none"
              />
            </motion.div>

            {/* Center Spine & Ribbon */}
            <div className="absolute inset-y-0 left-1/2 -ml-2.5 w-5 pointer-events-none z-30 flex flex-col items-center">
              <div className="w-full h-full bg-gradient-to-r from-black/20 via-transparent to-black/20" />
              <div className="absolute top-0 w-4 h-10 bg-gradient-to-b from-amber-600 to-amber-500 rounded-b-md shadow-md border-x border-b border-amber-700/50 flex items-end justify-center pb-1">
                <div className="w-2 h-2 bg-yellow-300 rotate-45" />
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. STAGE B: CLOSED JOURNAL WITH STUDENT NAMEPLATE (520ms - 2400ms) */}
        {phase === 'CLOSED_IMPACT' && (
          <motion.div
            initial={{ scale: 0.85, y: -25, rotate: -3 }}
            animate={{
              scale: [0.85, 1.06, 0.98, 1],
              y: [-25, 6, -2, 0],
              rotate: [-3, 1, 0]
            }}
            transition={{
              duration: 0.45,
              ease: [0.34, 1.3, 0.64, 1]
            }}
            className="relative select-none"
          >
            {/* Hardcover Graphic */}
            <img
              src={getPublicAssetUrl('/學校圖檔/教室/cartoon_journal_cover.png')}
              alt="已封存的心情日記本封面"
              className="w-64 sm:w-80 md:w-92 h-auto drop-shadow-[0_25px_45px_rgba(50,20,5,0.6)] rounded-2xl"
            />

            {/* Glowing Golden Ring Pulse */}
            <div className="absolute inset-0 border-4 border-yellow-300/80 rounded-2xl animate-pulse pointer-events-none shadow-[0_0_25px_rgba(253,224,71,0.5)]" />

            {/* Student Nameplate Label */}
            <div className="absolute bottom-[16%] inset-x-6 sm:inset-x-8 text-center bg-amber-950/75 backdrop-blur-xs py-2 px-3 rounded-xl border border-amber-300/60 shadow-xl">
              <p className="text-amber-200 text-xs font-serif font-black tracking-widest">
                {selectedClass} 班 {activeStudentNumber} 號
              </p>
              <p className="text-white text-sm sm:text-base font-black mt-0.5 tracking-wider truncate">
                {studentDisplayName} 的心情日記
              </p>
            </div>

            {/* "已封存" Golden Seal Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -25 }}
              animate={{ scale: 1, rotate: -12 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 350, damping: 18 }}
              className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-amber-950 px-3 py-1 rounded-full font-black text-xs shadow-lg border-2 border-white flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-900" />
              <span>今日已封存 ✓</span>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* 3. MASCOT 恩恩 FAREWELL BANNER */}
      <AnimatePresence>
        {showFarewell && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
            className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 max-w-lg mx-auto z-50 px-4 text-center sm:text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mascot 恩恩 Cheering / Waving */}
            <motion.div
              animate={{ rotate: [-4, 4, -4], y: [0, -5, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="relative shrink-0"
            >
              <div className="absolute inset-0 bg-yellow-300/40 rounded-full blur-xl scale-125" />
              <img
                src={getPublicAssetUrl('/學校圖檔/吉祥物/enen_cheer.png')}
                alt="恩恩揮手道別"
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-xl relative z-10"
              />
            </motion.div>

            {/* Speech Bubble */}
            <div className="bg-white/95 backdrop-blur-md px-5 py-3.5 rounded-2xl sm:rounded-3xl border-2 border-amber-300 shadow-2xl relative">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-amber-900 font-black text-sm sm:text-base">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>今天的心情日記已好好收藏！</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-700 mt-1">
                恩恩與善導小學陪伴你成長，明天見囉～ 👋
              </p>
              <div className="mt-2 flex items-center justify-center sm:justify-start gap-1 text-[11px] font-bold text-amber-600">
                <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
                <span>正在安全登出返回校園... (點擊可立即跳過)</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StudentBookClosingAnimation;
