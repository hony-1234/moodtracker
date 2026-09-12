import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart } from 'lucide-react';
import { getPublicAssetUrl, getWebpUrl } from '../../utils/assetHelper';
import { useDevice } from '../../hooks/useDevice';

export interface WalkingSceneTransitionOverlayProps {
  /**
   * Whether the transition overlay is actively displayed
   */
  isVisible: boolean;
  /**
   * Optional controlled progress (0 to 100). If omitted, an automatic smooth progress simulation is run.
   */
  progress?: number;
  /**
   * Custom descriptive message shown under the progress bar
   */
  message?: string;
  /**
   * Character pair combination to display on the walking track
   */
  characterPair?: 'student-and-teacher' | 'students-pair' | 'student-and-mascot';
  /**
   * Callback fired once transition animation finishes
   */
  onComplete?: () => void;
  /**
   * Total duration of the walking transition in milliseconds (default 2200ms for a gentle, relaxed walking pace)
   */
  minDuration?: number;
}

export const WalkingSceneTransitionOverlay: React.FC<WalkingSceneTransitionOverlayProps> = ({
  isVisible,
  progress: controlledProgress,
  message = '正在背著書包漫步走進校園...',
  characterPair = 'student-and-teacher',
  onComplete,
  minDuration = 2200,
}) => {
  const { isMobile } = useDevice();
  const [internalProgress, setInternalProgress] = useState(0);
  const animRef = useRef<number | null>(null);
  const completeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Smooth, frame-by-frame progress animation when uncontrolled
  useEffect(() => {
    if (!isVisible) {
      setInternalProgress(0);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
      return;
    }

    if (controlledProgress !== undefined) {
      setInternalProgress(controlledProgress);
      return;
    }

    const startTime = performance.now();
    const duration = Math.max(800, minDuration);

    const easeProgress = (t: number): number => {
      return 1 - Math.pow(1 - t, 3);
    };

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const calculated = easeProgress(t) * 100;
      setInternalProgress(calculated);

      if (t < 1) {
        animRef.current = requestAnimationFrame(frame);
      } else {
        setInternalProgress(100);
        completeTimerRef.current = setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, 220);
      }
    };

    animRef.current = requestAnimationFrame(frame);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    };
  }, [isVisible, controlledProgress, minDuration, onComplete]);

  const activeProgress = controlledProgress !== undefined ? controlledProgress : internalProgress;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="walking-scene-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] overflow-hidden select-none flex flex-col justify-between font-sans pointer-events-auto"
          style={{
            background: 'linear-gradient(180deg, #BAE6FD 0%, #E0F2FE 35%, #FEF3C7 75%, #F0FDF4 100%)',
          }}
        >
          {/* ========================================================================= */}
          {/* 1. SKY AMBIANCE & WARM SUN RAYS (Prevents bare webpage flash)            */}
          {/* ========================================================================= */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {/* Top sunlight corona */}
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-radial from-amber-200/50 via-yellow-100/25 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Drifting cartoon clouds */}
            <motion.div
              animate={{ x: [-30, 30, -30] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-10 left-[8%] w-44 h-16 bg-white/70 rounded-full blur-[1px]"
            />
            <motion.div
              animate={{ x: [40, -40, 40] }}
              transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-24 right-[12%] w-56 h-20 bg-white/60 rounded-full blur-[1px]"
            />
            <motion.div
              animate={{ x: [-20, 20, -20] }}
              transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-48 left-[35%] w-36 h-12 bg-white/50 rounded-full blur-[1px]"
            />

            {/* Ambient floating sunshine particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-amber-300/60 blur-[0.6px]"
                style={{
                  left: `${10 + i * 11}%`,
                  top: `${20 + (i % 4) * 16}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.3, 0.9, 0.3],
                  scale: [0.8, 1.3, 0.8],
                }}
                transition={{
                  duration: 2.5 + (i % 3) * 0.7,
                  repeat: Infinity,
                  delay: i * 0.25,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          {/* ========================================================================= */}
          {/* 2. CENTER WELCOME BADGE & SCHOOL IDENTITY                                  */}
          {/* ========================================================================= */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center">
            <motion.div
              initial={{ scale: 0.85, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="flex flex-col items-center gap-3.5 max-w-md"
            >
              {/* School Emblem Badge with Gentle Bobbing */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="relative"
              >
                <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-xl scale-125" />
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/90 shadow-xl border-3 border-amber-300 p-2.5 flex items-center justify-center relative z-10 backdrop-blur-xs">
                  <picture>
                    <source srcSet={getWebpUrl('/學校圖檔/學校logo/school_logo.png')} type="image/webp" />
                    <img
                      src={getPublicAssetUrl('/學校圖檔/學校logo/school_logo.png')}
                      alt="天主教善導小學校徽"
                      className="w-full h-full object-contain"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </picture>
                </div>
              </motion.div>

              {/* Title & Slogan */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-amber-200/80 shadow-xs text-amber-900 font-black text-xs md:text-sm">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>天主教善導小學 · 心情加油站</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-wide drop-shadow-xs">
                  校園心情空間載入中
                </h2>
                <p className="text-xs md:text-sm font-bold text-slate-600">
                  陽光灑滿走廊，老師和恩恩正在教室等你喔！✨
                </p>
              </div>
            </motion.div>
          </div>

          {/* ========================================================================= */}
          {/* 3. BOTTOM WALKING CHARACTER LOADING BAR                                    */}
          {/* ========================================================================= */}
          <div className="relative z-20 pb-6 md:pb-8 px-4 sm:px-8 max-w-3xl w-full mx-auto">
            {/* The Walking Track Wrapper */}
            <div className="relative w-full">
              {/* Walking Characters Sprite Group */}
              <div
                className="absolute -top-16 sm:-top-20 z-30 pointer-events-none transition-all duration-300 ease-out"
                style={{
                  left: `clamp(10px, calc(${activeProgress}% - ${isMobile ? 42 : 55}px), calc(100% - ${isMobile ? 85 : 110}px))`,
                  willChange: 'left',
                }}
              >
                <div className="flex items-end gap-1 sm:gap-2">
                  {/* Mascot 恩恩 Floating Companion */}
                  <motion.div
                    animate={{
                      y: [0, -8, 0],
                      rotate: [-4, 4, -4],
                    }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="shrink-0 -mr-2 mb-4 relative z-20"
                  >
                    <picture>
                      <source srcSet={getWebpUrl('/學校圖檔/吉祥物/enen_cheer.png')} type="image/webp" />
                      <img
                        src={getPublicAssetUrl('/學校圖檔/吉祥物/enen_cheer.png')}
                        alt="恩恩陪伴"
                        className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-md"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </picture>
                  </motion.div>

                  {/* Character A: Student Walking with Backpack Bobbing */}
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={{
                        y: [0, -6, 0, -6, 0],
                        rotate: [-3, 3, -3, 3, -3],
                      }}
                      transition={{
                        duration: 0.65,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="relative z-10"
                    >
                      <picture>
                        <source srcSet={getWebpUrl('/學校圖檔/學生/chibi_student_boy.png')} type="image/webp" />
                        <img
                          src={getPublicAssetUrl('/學校圖檔/學生/chibi_student_boy.png')}
                          alt="小學生走路"
                          className="h-14 sm:h-18 w-auto object-contain drop-shadow-lg"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </picture>
                    </motion.div>
                    {/* Footstep contact shadow */}
                    <motion.div
                      animate={{
                        scaleX: [1, 0.7, 1, 0.7, 1],
                        opacity: [0.6, 0.25, 0.6, 0.25, 0.6],
                      }}
                      transition={{
                        duration: 0.65,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="w-8 sm:w-10 h-1.5 bg-black/20 rounded-full blur-[1px] -mt-1"
                    />
                  </div>

                  {/* Character B: Teacher Walking Alongside */}
                  {(characterPair === 'student-and-teacher' || !isMobile) && (
                    <div className="flex flex-col items-center -ml-1">
                      <motion.div
                        animate={{
                          y: [0, -5, 0, -5, 0],
                          rotate: [2.5, -2.5, 2.5, -2.5, 2.5],
                        }}
                        transition={{
                          duration: 0.75,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: 0.15,
                        }}
                        className="relative z-10"
                      >
                        <picture>
                          <source srcSet={getWebpUrl('/學校圖檔/教師/teacher_female.png')} type="image/webp" />
                          <img
                            src={getPublicAssetUrl('/學校圖檔/教師/teacher_female.png')}
                            alt="老師陪伴走動"
                            className="h-16 sm:h-20 w-auto object-contain drop-shadow-lg"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        </picture>
                      </motion.div>
                      {/* Teacher contact shadow */}
                      <motion.div
                        animate={{
                          scaleX: [1, 0.75, 1, 0.75, 1],
                          opacity: [0.55, 0.25, 0.55, 0.25, 0.55],
                        }}
                        transition={{
                          duration: 0.75,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: 0.15,
                        }}
                        className="w-9 sm:w-11 h-1.5 bg-black/20 rounded-full blur-[1px] -mt-1"
                      />
                    </div>
                  )}

                  {/* Trailing Footstep Dust / Sparkles */}
                  <motion.div
                    animate={{
                      opacity: [0.2, 0.8, 0.2],
                      scale: [0.7, 1.2, 0.7],
                    }}
                    transition={{ duration: 0.55, repeat: Infinity }}
                    className="mb-2 -ml-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  </motion.div>
                </div>
              </div>

              {/* The Progress Bar Outer Track */}
              <div className="relative w-full h-5 sm:h-6 bg-white/90 backdrop-blur-md rounded-full p-1 border-2 border-emerald-400 shadow-lg shadow-emerald-900/10 overflow-hidden">
                {/* Background Track Striping */}
                <div 
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, #059669 0, #059669 8px, transparent 8px, transparent 16px)'
                  }}
                />

                {/* Animated Gradient Progress Fill */}
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 relative overflow-hidden transition-all duration-300 ease-out"
                  style={{
                    width: `${Math.min(100, Math.max(3, activeProgress))}%`,
                    willChange: 'width',
                  }}
                >
                  {/* Moving shimmer light wave on the bar */}
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/55 to-transparent skew-x-12"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Status Information & Percentage Pill */}
            <div className="mt-2.5 flex items-center justify-between text-xs sm:text-sm font-black text-slate-700 px-1">
              <div className="flex items-center gap-1.5 text-emerald-800">
                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
                <span>{message}</span>
              </div>
              <div className="font-mono bg-white/90 border border-emerald-300 text-emerald-700 px-2 py-0.5 rounded-full shadow-xs text-xs font-black">
                {Math.round(activeProgress)}%
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WalkingSceneTransitionOverlay;
