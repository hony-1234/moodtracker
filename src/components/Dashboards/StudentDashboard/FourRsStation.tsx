import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Moon, Heart, Smile, Compass, AlertCircle, ArrowRight, RotateCcw,
  CheckCircle2, Award, Zap, Coffee
} from 'lucide-react';
import { getPublicAssetUrl } from '../../../utils/assetHelper';

interface FourRsStationProps {
  initialExpanded?: boolean;
  embeddedInClassroom?: boolean;
}

// Gentle Web Audio Sound Synthesizer for Station Interactions
const playStationSound = (type: 'pop' | 'breathe_in' | 'breathe_out' | 'chime' | 'flip') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;
    if (type === 'pop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(550, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.07);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'chime') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.09);
        gain.gain.setValueAtTime(0.12, now + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.55);
      });
    } else if (type === 'breathe_in') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 1.2);
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.6);
      gain.gain.linearRampToValueAtTime(0.01, now + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.25);
    } else if (type === 'breathe_out') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 1.2);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.25);
    } else if (type === 'flip') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.11);
    }
  } catch (e) {
    // Ignore audio errors
  }
};

export const FourRsStation: React.FC<FourRsStationProps> = ({ 
  initialExpanded = false,
  embeddedInClassroom = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded || embeddedInClassroom);
  const [activeTab, setActiveTab] = useState<'REST' | 'RELAX' | 'RELATION' | 'RESILIENCE'>('REST');
  const [soundEnabled] = useState(true);

  // --- 1. REST PANEL STATES ---
  const [bedtimeChoice, setBedtimeChoice] = useState<'21:00' | '21:30' | '22:00' | '22:30'>('21:00');

  // --- 2. RELAX BREATHING COACH STATES ---
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingPhase, setBreathingState] = useState<'READY' | 'INHALE' | 'HOLD' | 'EXHALE'>('READY');
  const [breathingSeconds, setBreathingSeconds] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);
  const [showCheerCelebration, setShowCheerCelebration] = useState(false);

  // --- 3. RELATION PANEL STATES (GRATITUDE BUBBLE GARDEN) ---
  const [poppedBubbles, setPoppedBubbles] = useState<Record<number, boolean>>({});
  const [completedChallenges, setCompletedChallenges] = useState<Record<number, boolean>>({});

  // --- 4. RESILIENCE FLIP CARD & ENERGY STATES ---
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [showResilienceBadge, setShowResilienceBadge] = useState(false);

  // Synchronize initialExpanded
  useEffect(() => {
    if (initialExpanded || embeddedInClassroom) {
      setIsExpanded(true);
    }
  }, [initialExpanded, embeddedInClassroom]);

  // Breathing Coach Timer Loop
  useEffect(() => {
    let interval: any = null;
    if (isBreathing) {
      interval = setInterval(() => {
        setBreathingSeconds((prev) => {
          if (prev <= 1) {
            // Transition phase
            setBreathingState((currentPhase) => {
              if (currentPhase === 'READY' || currentPhase === 'EXHALE') {
                if (soundEnabled) playStationSound('breathe_in');
                return 'INHALE';
              } else if (currentPhase === 'INHALE') {
                return 'HOLD';
              } else if (currentPhase === 'HOLD') {
                if (soundEnabled) playStationSound('breathe_out');
                // Completed one full cycle
                setCycleCount((c) => {
                  const nextCount = c + 1;
                  if (nextCount >= 2) {
                    setShowCheerCelebration(true);
                    if (soundEnabled) playStationSound('chime');
                  }
                  return nextCount;
                });
                return 'EXHALE';
              }
              return 'INHALE';
            });
            return 4; // 4 seconds per phase
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreathingState('READY');
      setBreathingSeconds(4);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBreathing, soundEnabled]);

  // Handle manual tab change - reset states
  const handleTabChange = (tab: 'REST' | 'RELAX' | 'RELATION' | 'RESILIENCE') => {
    setActiveTab(tab);
    setIsBreathing(false);
    if (soundEnabled) playStationSound('pop');
  };

  // Resilience flip card toggling
  const toggleFlipCard = (index: number) => {
    if (soundEnabled) playStationSound('flip');
    setFlippedCards(prev => {
      const next = { ...prev, [index]: !prev[index] };
      const flippedCount = Object.values(next).filter(Boolean).length;
      if (flippedCount >= 3) {
        setShowResilienceBadge(true);
        if (soundEnabled) playStationSound('chime');
      }
      return next;
    });
  };

  // Pop gratitude bubble
  const handlePopBubble = (index: number) => {
    if (poppedBubbles[index]) return;
    if (soundEnabled) playStationSound('pop');
    setPoppedBubbles(prev => {
      const next = { ...prev, [index]: true };
      const count = Object.values(next).filter(Boolean).length;
      if (count === 5 && soundEnabled) {
        setTimeout(() => playStationSound('chime'), 200);
      }
      return next;
    });
  };

  // Toggle challenge card
  const toggleChallenge = (index: number) => {
    if (soundEnabled) playStationSound('pop');
    setCompletedChallenges(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const getPhaseText = () => {
    switch (breathingPhase) {
      case 'INHALE': return '慢慢吸氣... 🌬️ 吸入愛與平靜';
      case 'HOLD': return '屏住呼吸... 🌸 感受內在安詳';
      case 'EXHALE': return '緩緩呼氣... 🍃 吐出煩惱與疲勞';
      default: return '準備好和恩恩一起深呼吸了嗎？';
    }
  };

  // Gratitude bubbles definition
  const gratitudeBubbles = [
    { id: 0, icon: '🍎', target: '謝謝老師', desc: '耐心的教導與關心', color: 'bg-rose-50 border-rose-300 text-rose-900', balloon: 'bg-rose-400' },
    { id: 1, icon: '🥞', target: '謝謝爸媽', desc: '準備溫暖美味的早餐', color: 'bg-amber-50 border-amber-300 text-amber-900', balloon: 'bg-amber-400' },
    { id: 2, icon: '🤝', target: '謝謝朋友', desc: '下課陪伴我一起歡笑', color: 'bg-sky-50 border-sky-300 text-sky-900', balloon: 'bg-sky-400' },
    { id: 3, icon: '🧹', target: '謝謝工友', desc: '把校園打掃得乾乾淨淨', color: 'bg-emerald-50 border-emerald-300 text-emerald-900', balloon: 'bg-emerald-400' },
    { id: 4, icon: '🕊️', target: '謝謝同學', desc: '借我文具、熱心分享', color: 'bg-purple-50 border-purple-300 text-purple-900', balloon: 'bg-purple-400' },
  ];

  const poppedCount = Object.values(poppedBubbles).filter(Boolean).length;
  const flippedCount = Object.values(flippedCards).filter(Boolean).length;

  return (
    <div className={`transition-all ${embeddedInClassroom ? 'w-full' : 'mt-8 bg-white border border-indigo-100 rounded-3xl overflow-hidden shadow-lg'}`}>
      {/* 4Rs Banner Header (Only when not embedded in classroom or when user wants accordion) */}
      {!embeddedInClassroom && (
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border-b border-indigo-100/60 p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:opacity-95 transition-all select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white p-1 border border-emerald-200 shadow-sm flex items-center justify-center shrink-0">
              <img
                src={getPublicAssetUrl('/學校圖檔/吉祥物/enen_grat_bread_bible.png')}
                alt="吉祥物恩恩"
                className="w-10 h-10 object-contain"
              />
            </div>
            <div className="text-left">
              <h4 className="text-base font-black text-slate-800 flex items-center gap-1.5">
                4Rs 心靈充電站
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-extrabold border border-emerald-200">
                  香港教育局精神健康約章 🌱
                </span>
              </h4>
              <p className="text-xs text-slate-500 font-semibold">
                Rest 休息 · Relax 放鬆 · Relation 關係 · Resilience 抗逆 • 守護學生身心健康
              </p>
            </div>
          </div>
          <button 
            type="button"
            className="text-xs font-black text-emerald-800 bg-white/90 border border-emerald-200 px-3.5 py-1.5 rounded-xl hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs"
          >
            {isExpanded ? '收起充電面板 🔼' : '立即展開充電 🔽'}
          </button>
        </div>
      )}

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {/* 4Rs CARTOON MASCOT NAVIGATION TABS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-emerald-100 bg-emerald-50/40 p-2 sm:p-2.5 gap-2 select-none">
              {[
                { 
                  id: 'REST', 
                  title: 'Rest 休息', 
                  subtitle: '充足睡眠 大腦充電',
                  icon: Moon, 
                  mascotImg: '/學校圖檔/吉祥物/enen_warm_tea.png',
                  activeColor: 'bg-gradient-to-r from-sky-50 to-blue-50 text-sky-950 border-sky-300 shadow-md',
                  badgeColor: 'bg-sky-500 text-white'
                },
                { 
                  id: 'RELAX', 
                  title: 'Relax 放鬆', 
                  subtitle: '互動減壓 呼吸教練',
                  icon: Compass, 
                  mascotImg: '/學校圖檔/吉祥物/enen_hearts.png',
                  activeColor: 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-950 border-indigo-300 shadow-md',
                  badgeColor: 'bg-indigo-500 text-white'
                },
                { 
                  id: 'RELATION', 
                  title: 'Relation 關係', 
                  subtitle: '感恩連結 溫暖人心',
                  icon: Heart, 
                  mascotImg: '/學校圖檔/吉祥物/enen_gift.png',
                  activeColor: 'bg-gradient-to-r from-pink-50 to-rose-50 text-rose-950 border-pink-300 shadow-md',
                  badgeColor: 'bg-rose-500 text-white'
                },
                { 
                  id: 'RESILIENCE', 
                  title: 'Resilience 抗逆', 
                  subtitle: '堅堅小勇士 翻翻卡',
                  icon: Smile, 
                  mascotImg: '/學校圖檔/吉祥物/堅堅-06.png',
                  activeColor: 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-950 border-emerald-300 shadow-md',
                  badgeColor: 'bg-emerald-600 text-white'
                },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id as any)}
                    className={`flex items-center gap-2.5 p-2 sm:p-2.5 rounded-2xl text-left transition-all duration-200 cursor-pointer border ${
                      isActive 
                        ? `${tab.activeColor} scale-[1.02]` 
                        : 'bg-white/80 border-slate-200/70 hover:bg-white hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    {/* Mascot Thumbnail Avatar with Ring */}
                    <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white p-0.5 shrink-0 shadow-xs border border-slate-200 flex items-center justify-center">
                      <img
                        src={getPublicAssetUrl(tab.mascotImg)}
                        alt={tab.title}
                        className="w-full h-full object-contain"
                      />
                      {isActive && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-xs sm:text-sm font-black truncate">{tab.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium truncate hidden sm:block">
                        {tab.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENTS CONTAINER */}
            <div className="p-3 sm:p-6 text-left relative bg-white/95">
              
              {/* ======================================================== */}
              {/* 1. REST PANEL (星空晚安夢境島 & 睡眠充能計算器)         */}
              {/* ======================================================== */}
              {activeTab === 'REST' && (
                <div className="space-y-6">
                  {/* Top Intro with Mascot Art & Steaming Tea Animation */}
                  <div className="bg-gradient-to-r from-sky-50 via-indigo-50/50 to-blue-50 border-2 border-sky-100 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden shadow-xs">
                    {/* Background Soft Stars & Moon */}
                    <div className="absolute top-2 right-6 text-2xl opacity-20 select-none">🌙 ✨ 💤</div>

                    <div className="flex items-center gap-4">
                      {/* Enen with Steaming Tea Animation */}
                      <div className="relative shrink-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-3xl p-1.5 shadow-md border-2 border-sky-200 flex items-center justify-center relative overflow-visible">
                          <img 
                            src={getPublicAssetUrl('/學校圖檔/吉祥物/enen_warm_tea.png')} 
                            alt="恩恩喝溫茶" 
                            className="w-full h-full object-contain select-none"
                          />
                          {/* Animated Sinusoidal Tea Steam Rising from Cup */}
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute -top-2 left-[58%] text-xs pointer-events-none select-none"
                              initial={{ y: 0, opacity: 0, scale: 0.6 }}
                              animate={{ 
                                y: [-4, -26], 
                                x: [0, (i % 2 === 0 ? 6 : -6), 0], 
                                opacity: [0, 0.8, 0],
                                scale: [0.6, 1.2, 0.8] 
                              }}
                              transition={{ 
                                duration: 2.2, 
                                repeat: Infinity, 
                                ease: 'easeInOut', 
                                delay: i * 0.7 
                              }}
                            >
                              ☕💭
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🌙</span>
                          <h5 className="text-base sm:text-lg font-black text-sky-950">
                            Rest 休息：充足睡眠，大腦黃金充電站
                          </h5>
                        </div>
                        <p className="text-xs text-sky-900/80 font-semibold mt-1 leading-relaxed max-w-xl">
                          小學階段的孩子每天需要 <b>9 至 11 小時</b> 的優質睡眠。睡眠充足時，大腦能自動整理記憶、修復細胞，讓你明天上課思路敏捷、活力充沛！
                        </p>
                      </div>
                    </div>

                    {/* Secondary Mascot: Enen Reading before bed */}
                    <div className="hidden lg:flex items-center gap-2.5 bg-white/90 border border-sky-200 py-2 px-3 rounded-2xl shadow-2xs shrink-0">
                      <div className="relative w-12 h-12">
                        <img 
                          src={getPublicAssetUrl('/學校圖檔/吉祥物/enen_reading.png')} 
                          alt="恩恩睡前讀書" 
                          className="w-full h-full object-contain"
                        />
                        {/* Floating Sleep Zzz */}
                        <motion.span 
                          animate={{ y: [0, -18], opacity: [0, 1, 0], scale: [0.7, 1.2] }}
                          transition={{ duration: 2.0, repeat: Infinity }}
                          className="absolute -top-1 -right-1 text-xs font-black text-sky-600 pointer-events-none"
                        >
                          Zzz
                        </motion.span>
                      </div>
                      <div className="text-left text-xs">
                        <p className="font-black text-sky-950">恩恩睡前悄悄話 📖</p>
                        <p className="text-[11px] text-slate-500 font-semibold">「聽輕音樂或讀本好書，睡得特別甜！」</p>
                      </div>
                    </div>
                  </div>

                  {/* INTERACTIVE SLEEP CALCULATOR & BATTERY CHARGING WIDGET */}
                  <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-4 sm:p-6 shadow-xl border-2 border-indigo-900/80 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-5 relative z-10">
                      <div className="text-left w-full md:w-auto">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-yellow-400/20 text-yellow-300 rounded-xl">⚡</span>
                          <h6 className="text-sm font-black text-white">我的今晚睡眠充能計算器</h6>
                        </div>
                        <p className="text-xs text-indigo-200 font-medium mt-1">
                          點選你今晚預計就寢的時間，看看明天的「大腦電量」能充到多少！
                        </p>

                        {/* Bedtime Choice Buttons */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                          {[
                            { time: '21:00', percent: 100, label: '晚上 9:00', status: '黃金充能 100% 滿格！', color: 'from-emerald-500 to-teal-400' },
                            { time: '21:30', percent: 90, label: '晚上 9:30', status: '優質充能 90% 充沛！', color: 'from-emerald-400 to-cyan-400' },
                            { time: '22:00', percent: 75, label: '晚上 10:00', status: '良好充能 75% 穩定！', color: 'from-amber-400 to-yellow-400' },
                            { time: '22:30', percent: 60, label: '晚上 10:30', status: '勉強充能 60% 容易疲倦！', color: 'from-rose-500 to-amber-500' },
                          ].map((b) => (
                            <button
                              key={b.time}
                              type="button"
                              onClick={() => {
                                setBedtimeChoice(b.time as any);
                                if (soundEnabled) playStationSound('pop');
                              }}
                              className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer border text-center ${
                                bedtimeChoice === b.time
                                  ? 'bg-yellow-400 text-slate-950 border-yellow-300 shadow-md scale-103'
                                  : 'bg-white/10 text-indigo-100 border-white/10 hover:bg-white/20'
                              }`}
                            >
                              <span>{b.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Animated Battery Graphic */}
                      <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center gap-4 w-full md:w-auto shrink-0 justify-center">
                        <div className="relative w-28 sm:w-36 h-12 bg-slate-800 rounded-xl border-2 border-white/30 p-1 flex items-center overflow-hidden shadow-inner">
                          {/* Battery Nipple */}
                          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-5 bg-white/40 rounded-r-md" />
                          {/* Animated Liquid Battery Fill */}
                          <motion.div 
                            className={`h-full rounded-lg bg-gradient-to-r ${
                              bedtimeChoice === '21:00' ? 'from-emerald-500 to-teal-400' :
                              bedtimeChoice === '21:30' ? 'from-emerald-400 to-cyan-400' :
                              bedtimeChoice === '22:00' ? 'from-amber-400 to-yellow-400' :
                              'from-rose-500 to-amber-500'
                            }`}
                            initial={{ width: '0%' }}
                            animate={{ 
                              width: bedtimeChoice === '21:00' ? '100%' :
                                     bedtimeChoice === '21:30' ? '90%' :
                                     bedtimeChoice === '22:00' ? '75%' : '60%'
                            }}
                            transition={{ duration: 0.6, type: 'spring', stiffness: 180 }}
                          />
                          <span className="absolute inset-0 flex items-center justify-center font-black text-xs text-white drop-shadow-md">
                            {bedtimeChoice === '21:00' ? '100% 滿格' :
                             bedtimeChoice === '21:30' ? '90% 充沛' :
                             bedtimeChoice === '22:00' ? '75% 良好' : '60% 偏低'}
                          </span>
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-black text-yellow-300">
                            {bedtimeChoice === '21:00' ? '🌟 黃金大腦作息' :
                             bedtimeChoice === '21:30' ? '👍 活力充沛保證' :
                             bedtimeChoice === '22:00' ? '⏰ 記得提早刷牙' : '⚠️ 早上可能賴床哦'}
                          </p>
                          <p className="text-[10px] text-indigo-200 mt-0.5">預計獲得優質深層睡眠</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3 Golden Sleep Habits Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <motion.div 
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="p-4 bg-gradient-to-b from-sky-50 to-blue-50 border border-sky-200/80 rounded-2xl flex flex-col justify-between shadow-2xs"
                    >
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-sky-200/70 flex items-center justify-center text-xl mb-2">
                          💤
                        </div>
                        <h6 className="font-extrabold text-xs text-sky-950">1. 黃金睡眠 9-11 小時</h6>
                        <p className="text-slate-600 text-xs mt-1.5 font-medium leading-relaxed">
                          小學生的生長激素在熟睡時分泌最旺盛。充足睡眠是長高、長壯、不生病的重要秘訣！
                        </p>
                      </div>
                      <div className="mt-3 text-[10px] font-bold text-sky-700 bg-sky-100/80 px-2 py-1 rounded-lg w-fit">
                        🌱 健康成長小幫手
                      </div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="p-4 bg-gradient-to-b from-indigo-50 to-purple-50 border border-indigo-200/80 rounded-2xl flex flex-col justify-between shadow-2xs"
                    >
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-indigo-200/70 flex items-center justify-center text-xl mb-2">
                          📱
                        </div>
                        <h6 className="font-extrabold text-xs text-indigo-950">2. 睡前半小時不看螢幕</h6>
                        <p className="text-slate-600 text-xs mt-1.5 font-medium leading-relaxed">
                          平板與手機螢幕的藍光會欺騙大腦以為是白天。睡前半小時收起電子產品，眼睛放鬆更好睡！
                        </p>
                      </div>
                      <div className="mt-3 text-[10px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-1 rounded-lg w-fit">
                        📖 換成看故事書
                      </div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="p-4 bg-gradient-to-b from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl flex flex-col justify-between shadow-2xs"
                    >
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-200/70 flex items-center justify-center text-xl mb-2">
                          ⏰
                        </div>
                        <h6 className="font-extrabold text-xs text-emerald-950">3. 週末也保持規律作息</h6>
                        <p className="text-slate-600 text-xs mt-1.5 font-medium leading-relaxed">
                          每天在固定的時間睡覺與起床，即使是週六日也不賴床太久，能保護大腦平穩的生理時鐘！
                        </p>
                      </div>
                      <div className="mt-3 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-1 rounded-lg w-fit">
                        ⏰ 大腦生理時鐘
                      </div>
                    </motion.div>
                  </div>

                  {/* Teacher & Social Worker Loving Care Box */}
                  <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 text-xs text-amber-900 font-semibold flex items-start gap-3 shadow-2xs">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-black text-amber-950">班導師及學校社工溫暖提醒：</p>
                      <p className="text-amber-900/90 leading-relaxed font-medium">
                        親愛的同學，如果最近經常難以入睡、做噩夢，或者早上醒來仍然覺得疲倦無力，請隨時在今日心情日記的「心聲悄悄話」中告訴老師。我們會陪伴你一起找出舒緩身心、安穩入眠的好方法！
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* 2. RELAXATION PANEL - BREATHING BALLOON WITH ENEN      */}
              {/* ======================================================== */}
              {activeTab === 'RELAX' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🌬️</span>
                      <h5 className="text-base sm:text-lg font-black text-indigo-950">
                        Relax 放鬆：恩恩互動呼吸氣球教練
                      </h5>
                    </div>
                    {cycleCount > 0 && (
                      <span className="bg-indigo-100 text-indigo-800 text-xs font-black px-3 py-1 rounded-full border border-indigo-200">
                        已完成 {cycleCount} 輪循環 🌟
                      </span>
                    )}
                  </div>

                  {/* Main Coach Arena */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-3 text-center">
                      <div className="bg-gradient-to-b from-indigo-50/70 via-purple-50/40 to-white border-2 border-indigo-100/80 p-6 sm:p-8 rounded-3xl flex flex-col items-center justify-center relative min-h-[320px] overflow-hidden shadow-sm">
                        
                        {/* Background Floating Confetti when Celebrated */}
                        {showCheerCelebration && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-slate-900 font-black text-xs px-4 py-1.5 rounded-full shadow-lg border border-yellow-300 z-30 flex items-center gap-1.5"
                          >
                            <Sparkles className="w-4 h-4 text-amber-900" />
                            <span>太棒了！心靈充滿了寧靜與愛！獲得「平靜小達人」勳章 🏅</span>
                          </motion.div>
                        )}

                        {/* Interactive Mascot Balloon Breathing Ring */}
                        <div className="relative flex items-center justify-center w-52 h-52 sm:w-60 sm:h-60 select-none my-2">
                          
                          {/* Radiant Halo waves during Inhale */}
                          {isBreathing && breathingPhase === 'INHALE' && (
                            <motion.div 
                              className="absolute inset-0 bg-gradient-to-r from-pink-300/40 to-indigo-300/40 rounded-full blur-md"
                              animate={{ scale: [1, 1.35, 1.45], opacity: [0.3, 0.7, 0] }}
                              transition={{ duration: 4, repeat: Infinity, ease: "easeOut" }}
                            />
                          )}

                          {/* Orbiting 3D Love Hearts during HOLD phase */}
                          {isBreathing && breathingPhase === 'HOLD' && (
                            <motion.div 
                              className="absolute inset-0 pointer-events-none"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                            >
                              <span className="absolute top-0 left-1/2 -translate-x-1/2 text-xl drop-shadow-md">💖</span>
                              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xl drop-shadow-md">✨</span>
                              <span className="absolute top-1/2 left-0 -translate-y-1/2 text-xl drop-shadow-md">🌸</span>
                            </motion.div>
                          )}

                          {/* Exhale soothing breeze rings */}
                          {isBreathing && breathingPhase === 'EXHALE' && (
                            <motion.div 
                              className="absolute inset-0 border-2 border-dashed border-sky-300/60 rounded-full"
                              animate={{ scale: [1.3, 0.9], opacity: [0.8, 0.2] }}
                              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            />
                          )}

                          {/* Outer breathing ring container */}
                          <motion.div
                            className={`rounded-full flex flex-col items-center justify-center border-4 shadow-xl z-10 transition-colors p-4 relative ${
                              breathingPhase === 'INHALE' ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-300 text-white shadow-indigo-300/50' :
                              breathingPhase === 'HOLD' ? 'bg-gradient-to-br from-pink-500 to-rose-500 border-pink-300 text-white shadow-pink-300/50' :
                              breathingPhase === 'EXHALE' ? 'bg-gradient-to-br from-sky-500 to-teal-500 border-sky-300 text-white shadow-sky-300/50' :
                              'bg-gradient-to-br from-indigo-100 to-purple-100 border-indigo-200 text-indigo-900'
                            }`}
                            animate={{
                              scale: 
                                breathingPhase === 'INHALE' ? 1.25 :
                                breathingPhase === 'HOLD' ? 1.25 :
                                breathingPhase === 'EXHALE' ? 0.92 : 
                                1.0
                            }}
                            transition={{ 
                              duration: breathingPhase === 'READY' ? 0.4 : 4,
                              ease: "easeInOut"
                            }}
                            style={{ width: '150px', height: '150px' }}
                          >
                            {/* Mascot Enen Inside Center */}
                            <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center">
                              <motion.img 
                                src={
                                  showCheerCelebration 
                                    ? getPublicAssetUrl('/學校圖檔/吉祥物/enen_cheer.png')
                                    : getPublicAssetUrl('/學校圖檔/吉祥物/enen_hearts.png')
                                } 
                                alt="吉祥物恩恩深呼吸"
                                className="w-full h-full object-contain filter drop-shadow-md select-none pointer-events-none"
                                animate={{
                                  scale: breathingPhase === 'INHALE' ? [1, 1.1] : breathingPhase === 'EXHALE' ? [1.1, 0.95] : 1
                                }}
                                transition={{ duration: 4, ease: "easeInOut" }}
                              />
                            </div>

                            {/* Seconds Counter Pill */}
                            {isBreathing ? (
                              <div className="mt-1 bg-black/30 backdrop-blur-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <span className="text-sm font-black tracking-wider">{breathingSeconds}</span>
                                <span className="text-[10px] font-bold">秒</span>
                              </div>
                            ) : (
                              <div className="mt-1 bg-indigo-600/10 text-indigo-800 px-2 py-0.5 rounded-full text-[10px] font-black">
                                點擊開始
                              </div>
                            )}
                          </motion.div>
                        </div>

                        {/* Instructive Subtitle */}
                        <div className="mt-3 h-8 flex items-center justify-center">
                          <p className="text-sm sm:text-base font-black text-slate-800 transition-all duration-300">
                            {getPhaseText()}
                          </p>
                        </div>

                        {/* Start/Stop Button & Controls */}
                        <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5">
                          {!isBreathing ? (
                            <button
                              type="button"
                              onClick={() => {
                                setIsBreathing(true);
                                setBreathingState('INHALE');
                                setBreathingSeconds(4);
                                setShowCheerCelebration(false);
                                if (soundEnabled) playStationSound('breathe_in');
                              }}
                              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs sm:text-sm px-7 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                            >
                              <Compass className="w-4 h-4 animate-spin-slow" />
                              <span>開始 2 分鐘深呼吸練習 🌬️</span>
                            </button>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsBreathing(false);
                                  if (soundEnabled) playStationSound('pop');
                                }}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-black text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                              >
                                暫停放鬆 ⏸️
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setBreathingState('INHALE');
                                  setBreathingSeconds(4);
                                  setCycleCount(0);
                                  setShowCheerCelebration(false);
                                  if (soundEnabled) playStationSound('breathe_in');
                                }}
                                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-black text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                重新開始
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Side Mascot Cheer & Instruction Column */}
                    <div className="bg-gradient-to-b from-indigo-50 to-purple-50 border-2 border-indigo-100/90 rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-between text-center shadow-xs">
                      <div className="w-full flex flex-col items-center">
                        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center border-2 border-indigo-200 shadow-sm overflow-hidden mb-3 p-1">
                          <img 
                            src={getPublicAssetUrl('/學校圖檔/吉祥物/enen_cheer.png')} 
                            alt="吉祥物恩恩歡呼" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <h6 className="font-black text-sm text-indigo-950">「恩恩」愛心悄悄話</h6>
                        <p className="text-slate-600 text-xs mt-2 font-medium leading-relaxed">
                          「吸氣時，想像吸入溫暖與勇氣；呼氣時，把緊繃與煩惱全都吹走！只要 4 次深呼吸，心跳就會平穩下來哦！💖」
                        </p>
                      </div>

                      <div className="w-full mt-4 bg-white/90 border border-indigo-200/80 rounded-2xl p-3 text-left">
                        <p className="text-[11px] font-black text-indigo-900 flex items-center gap-1">
                          <span>💡</span> 深呼吸減壓小秘訣
                        </p>
                        <ul className="text-[11px] text-slate-600 font-medium mt-1 space-y-1 list-disc list-inside">
                          <li>背部挺直，肩膀放輕鬆</li>
                          <li>吸氣用鼻子，肚子像氣球鼓起</li>
                          <li>呼氣用嘴巴，像吹生日蠟燭</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* 3. RELATION PANEL (感恩愛心泡泡花園 & 正向善行任務)      */}
              {/* ======================================================== */}
              {activeTab === 'RELATION' && (
                <div className="space-y-6">
                  {/* Top Intro with Mascots */}
                  <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-orange-50 border-2 border-pink-100 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden shadow-xs">
                    <div className="flex items-center gap-4">
                      {/* Enen with Gift & Prayer */}
                      <div className="relative shrink-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-3xl p-1 shadow-md border-2 border-pink-200 flex items-center justify-center">
                          <img 
                            src={getPublicAssetUrl('/學校圖檔/吉祥物/enen_gift.png')} 
                            alt="恩恩送禮物" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">❤️</span>
                          <h5 className="text-base sm:text-lg font-black text-rose-950">
                            Relation 關係：感恩愛心泡泡花園，溫暖你我
                          </h5>
                        </div>
                        <p className="text-xs text-rose-900/80 font-semibold mt-1 leading-relaxed max-w-xl">
                          人與人之間的真誠關懷與感恩，是心靈最強大的保護網！在善導小學，我們重視「仁愛與尊重」。點擊戳破下方的感恩泡泡，把感謝送給身邊的人吧！
                        </p>
                      </div>
                    </div>

                    {/* School Mascots: Xiexie (些些) & Respect Bird (尊重鳥) */}
                    <div className="hidden lg:flex items-center gap-3 bg-white/95 border border-pink-200 py-2 px-3 rounded-2xl shadow-2xs shrink-0">
                      <div className="flex -space-x-2">
                        <div className="w-12 h-12 rounded-2xl bg-pink-50 border-2 border-white shadow-xs p-1 flex items-center justify-center overflow-hidden">
                          <img 
                            src={getPublicAssetUrl('/學校圖檔/吉祥物/些些-03-03.png')} 
                            alt="些些" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="w-14 h-12 rounded-2xl bg-amber-50 border-2 border-white shadow-xs p-1 flex items-center justify-center overflow-hidden">
                          <img 
                            src={getPublicAssetUrl('/學校圖檔/吉祥物/尊重鳥圖 (1).png')} 
                            alt="尊重鳥" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                      <div className="text-left text-xs">
                        <p className="font-black text-rose-950">「些些」與「尊重鳥」</p>
                        <p className="text-[10px] text-slate-500 font-semibold">常說謝謝，尊重彼此！🕊️</p>
                      </div>
                    </div>
                  </div>

                  {/* INTERACTIVE GRATITUDE BUBBLE GARDEN */}
                  <div className="bg-gradient-to-br from-pink-500/10 via-rose-500/5 to-amber-500/10 border-2 border-pink-200 rounded-3xl p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h6 className="text-sm font-black text-rose-950 flex items-center gap-2">
                          <span>🎈</span> 戳破感恩愛心泡泡（已感恩：{poppedCount} / 5）
                        </h6>
                        <p className="text-xs text-slate-600 font-medium">
                          輕輕點擊你想感謝的對象，戳破氣泡感受內心的溫暖！
                        </p>
                      </div>
                      {poppedCount === 5 && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-rose-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1"
                        >
                          <span>💖</span> 感恩小天使勳章達成！
                        </motion.div>
                      )}
                    </div>

                    {/* 5 Floating Gratitude Bubbles */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 pb-1">
                      {gratitudeBubbles.map((bubble) => {
                        const isPopped = !!poppedBubbles[bubble.id];
                        return (
                          <motion.button
                            key={bubble.id}
                            type="button"
                            onClick={() => handlePopBubble(bubble.id)}
                            whileHover={{ scale: isPopped ? 1.0 : 1.06 }}
                            whileTap={{ scale: 0.92 }}
                            animate={{
                              y: isPopped ? 0 : [0, -6, 0],
                            }}
                            transition={{
                              duration: 2.5 + bubble.id * 0.3,
                              repeat: Infinity,
                              ease: 'easeInOut'
                            }}
                            className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer relative overflow-hidden flex flex-col items-center justify-center ${
                              isPopped 
                                ? 'bg-white/60 border-slate-200 text-slate-400 opacity-80' 
                                : `${bubble.color} shadow-sm hover:shadow-md hover:border-rose-400`
                            }`}
                          >
                            {/* Popped Sparkle Flash */}
                            {isPopped && (
                              <div className="absolute top-1 right-1 text-xs">✨</div>
                            )}

                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-1.5 transition-transform ${
                              isPopped ? 'scale-90 opacity-60' : 'scale-100'
                            }`}>
                              {isPopped ? '💖' : bubble.icon}
                            </div>
                            <span className="font-black text-xs block">
                              {bubble.target}
                            </span>
                            <span className="text-[10px] mt-0.5 font-semibold text-slate-500 leading-tight">
                              {bubble.desc}
                            </span>

                            <div className="mt-2 text-[9px] font-black px-2 py-0.5 rounded-full border">
                              {isPopped ? '已感恩 ❤️' : '點我戳破 🎈'}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3 CHECKABLE CONNECTION CHALLENGE CARDS */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        id: 0,
                        icon: '💌',
                        title: '1. 傳遞溫馨感謝',
                        desc: '向今天教導你的老師，或陪伴你吃飯玩耍的 1 位同學，誠懇說聲「謝謝你！」。',
                        badge: '難度 ⭐',
                        color: 'from-rose-50 to-pink-50 border-rose-200 text-rose-950',
                      },
                      {
                        id: 1,
                        icon: '💬',
                        title: '2. 分享小秘密與心聲',
                        desc: '心情低落時別悶著。在日記中留言，或找爸爸媽媽、班導師及學校社工聊一聊！',
                        badge: '難度 ⭐⭐',
                        color: 'from-indigo-50 to-purple-50 border-indigo-200 text-indigo-950',
                      },
                      {
                        id: 2,
                        icon: '😊',
                        title: '3. 鏡子微笑挑戰',
                        desc: '對著鏡子裡的自己展示大大的微笑，並對自己說：「你今天很棒，繼續加油！」',
                        badge: '難度 ⭐',
                        color: 'from-emerald-50 to-teal-50 border-emerald-200 text-emerald-950',
                      },
                    ].map((task) => {
                      const isDone = !!completedChallenges[task.id];
                      return (
                        <div 
                          key={task.id}
                          onClick={() => toggleChallenge(task.id)}
                          className={`p-4 bg-gradient-to-b ${task.color} border-2 rounded-2xl flex flex-col justify-between shadow-2xs cursor-pointer hover:shadow-md transition-all`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-2xl">{task.icon}</span>
                              <button 
                                type="button"
                                className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                                  isDone 
                                    ? 'bg-emerald-500 border-emerald-600 text-white' 
                                    : 'bg-white border-slate-300 text-transparent hover:border-slate-400'
                                }`}
                              >
                                <CheckCircle2 className="w-4 h-4 fill-current" />
                              </button>
                            </div>
                            <h6 className="font-extrabold text-xs">{task.title}</h6>
                            <p className="text-slate-600 text-xs mt-1.5 font-medium leading-relaxed">
                              {task.desc}
                            </p>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 font-bold bg-white/80 py-0.5 px-2 rounded-md border border-slate-200">
                              {task.badge}
                            </span>
                            <span className={`text-[10px] font-black ${isDone ? 'text-emerald-700' : 'text-slate-400'}`}>
                              {isDone ? '已完成挑戰 🎉' : '點擊標記完成'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* 4. RESILIENCE PANEL (堅堅抗逆小勇士 & 3D 彈力翻翻卡)     */}
              {/* ======================================================== */}
              {activeTab === 'RESILIENCE' && (
                <div className="space-y-6">
                  {/* Top Intro with Official Resilience Mascot Jianjian (堅堅) */}
                  <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-2 border-emerald-200/80 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden shadow-xs">
                    <div className="flex items-center gap-4">
                      {/* Official Jianjian Mascot Avatar */}
                      <div className="relative shrink-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-3xl p-1 shadow-md border-2 border-emerald-300 flex items-center justify-center">
                          <img 
                            src={getPublicAssetUrl('/學校圖檔/吉祥物/堅堅-06.png')} 
                            alt="抗逆吉祥物堅堅" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🌱</span>
                          <h5 className="text-base sm:text-lg font-black text-emerald-950">
                            Resilience 抗逆：堅堅小勇士 · 3D 正向轉念翻翻卡
                          </h5>
                        </div>
                        <p className="text-xs text-emerald-900/80 font-semibold mt-1 leading-relaxed max-w-xl">
                          「抗逆力」就像心靈的彈力球，無論遇到多大打擊都能頑強彈回！學校官方抗逆吉祥物「堅堅」與「信信」陪伴你，把困難化為成長的養分！
                        </p>
                      </div>
                    </div>

                    {/* Secondary Mascot: Xinxin (信信) & Enen Treadmill */}
                    <div className="hidden lg:flex items-center gap-3 bg-white/90 border border-emerald-200 py-2 px-3 rounded-2xl shadow-2xs shrink-0">
                      <div className="flex -space-x-3">
                        <div className="w-11 h-11 rounded-full bg-emerald-50 border-2 border-white shadow-xs p-0.5 flex items-center justify-center">
                          <img 
                            src={getPublicAssetUrl('/學校圖檔/吉祥物/信信-01.png')} 
                            alt="信信" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="w-11 h-11 rounded-full bg-amber-50 border-2 border-white shadow-xs p-0.5 flex items-center justify-center">
                          <img 
                            src={getPublicAssetUrl('/學校圖檔/吉祥物/enen_treadmill.png')} 
                            alt="恩恩跑步" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                      <div className="text-left text-xs">
                        <p className="font-black text-emerald-950">「信信」堅定信心</p>
                        <p className="text-[10px] text-slate-500 font-semibold">持守信念，永不言棄！💪</p>
                      </div>
                    </div>
                  </div>

                  {/* RESILIENCE ENERGY POWER METER */}
                  <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 border-2 border-emerald-500/40 shadow-lg relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-left w-full sm:w-auto">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-emerald-400" />
                          <h6 className="text-xs sm:text-sm font-black text-white">
                            堅毅抗逆能量儀（已解鎖轉念：{flippedCount} / 3）
                          </h6>
                        </div>
                        <p className="text-[11px] text-emerald-200/80 font-medium mt-0.5">
                          翻開下方 3 張煩惱卡片，學習正向轉念技巧，蓄滿你的抗逆能量！
                        </p>
                      </div>

                      {/* Animated Progress Meter */}
                      <div className="w-full sm:w-64 bg-slate-800 rounded-xl h-6 p-1 border border-white/20 relative flex items-center overflow-hidden">
                        <motion.div
                          className="h-full rounded-lg bg-gradient-to-r from-teal-400 via-emerald-400 to-green-300"
                          initial={{ width: 0 }}
                          animate={{ width: `${(flippedCount / 3) * 100}%` }}
                          transition={{ duration: 0.5, type: 'spring' }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white drop-shadow">
                          {flippedCount === 0 ? '0% 尚未啟動' :
                           flippedCount === 1 ? '33% 轉念蓄能中' :
                           flippedCount === 2 ? '66% 信心大增！' : '100% 滿格能量！🌟'}
                        </span>
                      </div>
                    </div>

                    {/* Unlocked Badge Notification Banner */}
                    {showResilienceBadge && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="mt-4 p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-between shadow-md"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 bg-yellow-400 rounded-xl flex items-center justify-center text-lg text-slate-900 shadow-sm shrink-0">
                            🏅
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-black text-white">🌟 恭喜你獲得「善導抗逆小勇士」榮譽勳章！</p>
                            <p className="text-[10px] text-emerald-100 font-semibold">校訓精神已融會貫通：仁愛 · 忍耐 · 堅毅！</p>
                          </div>
                        </div>
                        <span className="text-xs bg-white text-emerald-800 font-extrabold px-3 py-1 rounded-xl shadow-xs">
                          已達成
                        </span>
                      </motion.div>
                    )}
                  </div>

                  {/* 3D SPRINGY FLIP CARDS */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[
                      {
                        idx: 0,
                        title: "✍️ 功課與成績挑戰",
                        mascot: "堅堅指引 🛡️",
                        front: "這次考試成績很不理想，我肯定很笨，不論怎麼努力都沒用了...",
                        back: "分數只代表我這次某些概念還沒弄懂。我可以請教老師與同學！每一點微小的進步都值得肯定。善導的同學不怕慢，只怕站！",
                        quote: "堅堅教我：失敗是成功的實習期 🌱",
                        frontColor: "from-rose-50 to-orange-50 border-rose-300",
                        backColor: "from-emerald-50 to-teal-50 border-emerald-300",
                      },
                      {
                        idx: 1,
                        title: "👥 人際相處與溝通",
                        mascot: "恩恩提醒 💖",
                        front: "今天下課時同學好像故意不理我，是不是大家都討厭我？好難過...",
                        back: "大家可能只是當下玩得太投入，或同學自己心情有點累。我可以大方地主動問：『我可以一起玩嗎？』或邀請另一位同學，這不是我的錯！",
                        quote: "恩恩教我：以愛待人，多點理解與微笑 🌸",
                        frontColor: "from-purple-50 to-pink-50 border-purple-300",
                        backColor: "from-sky-50 to-indigo-50 border-sky-300",
                      },
                      {
                        idx: 2,
                        title: "🤯 壓力與情緒調適",
                        mascot: "信信鼓舞 ✨",
                        front: "事情太多、活動好擠，我快應付不來了，好想放棄一切，太累了...",
                        back: "感到有壓力是正常的信號！我可以把事情寫在紙上排優先順序，一次只專心做好一件事。完成一小步就給自己鼓掌，並向老師尋求支持！",
                        quote: "信信教我：一步一步走，終能抵達山頂 🏔️",
                        frontColor: "from-amber-50 to-yellow-50 border-amber-300",
                        backColor: "from-teal-50 to-emerald-50 border-teal-300",
                      }
                    ].map((card) => {
                      const isFlipped = !!flippedCards[card.idx];
                      return (
                        <div 
                          key={card.idx} 
                          data-role="resilience-card"
                          data-card-index={card.idx}
                          data-card-flipped={isFlipped ? "true" : "false"}
                          onClick={() => toggleFlipCard(card.idx)}
                          className="group min-h-[250px] cursor-pointer select-none"
                          style={{ perspective: '1200px' }}
                        >
                          <motion.div 
                            className="relative w-full h-full min-h-[250px] rounded-3xl"
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                            style={{ 
                              transformStyle: 'preserve-3d',
                            }}
                            whileHover={{ scale: 1.02 }}
                          >
                            {/* Card FRONT (Worry Situation) */}
                            <div 
                              className={`absolute inset-0 bg-gradient-to-b ${card.frontColor} border-2 rounded-3xl p-5 flex flex-col justify-between shadow-sm transition-opacity duration-200 ${
                                isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'
                              }`}
                              style={{ 
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                zIndex: isFlipped ? 0 : 20
                              }}
                            >
                              <div>
                                <div className="flex items-center justify-between">
                                  <h6 className="font-black text-xs text-slate-800">
                                    {card.title}
                                  </h6>
                                  <span className="text-[10px] bg-rose-200/80 text-rose-800 px-2 py-0.5 rounded-full font-black">
                                    點擊翻轉 🔄
                                  </span>
                                </div>
                                <div className="mt-3 bg-white/75 backdrop-blur-xs p-3 rounded-2xl border border-rose-200/50 shadow-2xs">
                                  <p className="text-slate-700 text-xs font-semibold leading-relaxed">
                                    「 {card.front} 」
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                                <span>換個角度想一想</span>
                                <span className="flex items-center gap-1 text-rose-600 font-black">
                                  翻轉看正向力量 <ArrowRight className="w-3.5 h-3.5" />
                                </span>
                              </div>
                            </div>

                            {/* Card BACK (Constructive Growth Mindset Reframing) */}
                            <div 
                              className={`absolute inset-0 bg-gradient-to-b ${card.backColor} border-2 rounded-3xl p-5 flex flex-col justify-between shadow-md transition-opacity duration-200 ${
                                isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'
                              }`}
                              style={{ 
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)',
                                zIndex: isFlipped ? 20 : 0
                              }}
                            >
                              <div>
                                <div className="flex items-center justify-between">
                                  <h6 className="font-black text-xs text-emerald-900 flex items-center gap-1.5">
                                    <span>🌈</span>
                                    <span>正向轉念秘笈</span>
                                  </h6>
                                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-black">
                                    {card.mascot}
                                  </span>
                                </div>
                                <div className="mt-2.5 bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-emerald-300 shadow-xs">
                                  <p className="text-emerald-950 text-xs font-black leading-relaxed">
                                    {card.back}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-emerald-800 font-bold pt-1">
                                <span className="italic font-bold">{card.quote}</span>
                                <span className="flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-black">
                                  點擊翻回正面 ↩️
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
