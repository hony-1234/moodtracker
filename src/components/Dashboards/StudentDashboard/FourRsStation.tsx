import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Moon, Heart, Smile, Compass, AlertCircle, ArrowRight, RotateCcw } from 'lucide-react';

interface FourRsStationProps {
  initialExpanded?: boolean;
}

export const FourRsStation: React.FC<FourRsStationProps> = ({ initialExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [activeTab, setActiveTab] = useState<'REST' | 'RELAX' | 'RELATION' | 'RESILIENCE'>('RELAX');

  // --- BREATHING COACH STATES ---
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingPhase, setBreathingState] = useState<'READY' | 'INHALE' | 'HOLD' | 'EXHALE'>('READY');
  const [breathingSeconds, setBreathingSeconds] = useState(4);

  // --- FLIP CARD STATES ---
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  // Trigger expanded state if parent forces initialExpanded
  useEffect(() => {
    if (initialExpanded) {
      setIsExpanded(true);
    }
  }, [initialExpanded]);

  // Breathing Coach Timer Loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isBreathing) {
      interval = setInterval(() => {
        setBreathingSeconds((prev) => {
          if (prev <= 1) {
            // Transition phase
            setBreathingState((currentPhase) => {
              switch (currentPhase) {
                case 'READY':
                case 'EXHALE':
                  return 'INHALE';
                case 'INHALE':
                  return 'HOLD';
                case 'HOLD':
                  return 'EXHALE';
                default:
                  return 'INHALE';
              }
            });
            return 4; // Reset to 4 seconds for the next phase
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
  }, [isBreathing]);

  // Handle manual tab change - reset states
  const handleTabChange = (tab: 'REST' | 'RELAX' | 'RELATION' | 'RESILIENCE') => {
    setActiveTab(tab);
    setIsBreathing(false);
  };

  // Resilience flip card toggling
  const toggleFlipCard = (index: number) => {
    setFlippedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getPhaseText = () => {
    switch (breathingPhase) {
      case 'INHALE': return '慢慢吸氣... 🌬️';
      case 'HOLD': return '屏住呼吸... 🌸';
      case 'EXHALE': return '緩緩呼氣... 🍃';
      default: return '準備好開始了嗎？';
    }
  };

  return (
    <div className="mt-8 bg-white border border-indigo-100 rounded-3xl overflow-hidden shadow-lg transition-all">
      {/* 4Rs Banner Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-indigo-50 border-b border-indigo-100/60 p-5 flex items-center justify-between cursor-pointer hover:bg-indigo-100/50 transition-all select-none"
      >
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2.5 rounded-2xl shadow-sm flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="text-base font-black text-[#0F172A] flex items-center gap-1.5">
              4Rs 心靈充電站
              <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">約章指引</span>
            </h4>
            <p className="text-xs text-[#64748B] font-semibold">依據香港教育局 4Rs 精神健康約章設計 • 給你的心靈綠洲 🌱</p>
          </div>
        </div>
        <button className="text-xs font-black text-indigo-700 bg-indigo-100 px-3.5 py-1.5 rounded-xl hover:bg-indigo-200 transition-all cursor-pointer">
          {isExpanded ? '收起面板 🔼' : '立即開啟 🔽'}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {/* Nav tabs */}
            <div className="grid grid-cols-4 border-b border-slate-100 bg-slate-50/50 p-2 gap-1.5">
              {[
                { id: 'REST', name: 'Rest 休息', icon: Moon, color: 'text-sky-600 bg-sky-50' },
                { id: 'RELAX', name: 'Relax 放鬆', icon: Compass, color: 'text-indigo-600 bg-indigo-50' },
                { id: 'RELATION', name: 'Relation 關係', icon: Heart, color: 'text-pink-600 bg-pink-50' },
                { id: 'RESILIENCE', name: 'Resilience 抗逆', icon: Smile, color: 'text-emerald-600 bg-emerald-50' },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id as any)}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      isActive 
                        ? `${tab.color} shadow-sm border border-slate-200/50 scale-[1.02]` 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>
                      <span className="hidden sm:inline">{tab.name.split(' ')[0]} </span>
                      <span>{tab.name.split(' ')[1]}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="p-6 text-left">
              
              {/* 1. REST PANEL */}
              {activeTab === 'REST' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🌙</span>
                    <h5 className="text-sm font-black text-slate-800">Rest 休息：充足睡眠，大腦充電</h5>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-3 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-sky-50/60 border border-sky-100 rounded-2xl flex flex-col justify-between">
                          <div>
                            <span className="text-2xl">💤</span>
                            <h6 className="font-extrabold text-xs text-sky-900 mt-2">黃金睡眠時間</h6>
                            <p className="text-slate-500 text-[11px] mt-1 font-semibold leading-relaxed">
                              小學階段的孩子每天需要 <b>9 至 11 小時</b> 的優質睡眠。充足睡眠能幫助大腦整理記憶、讓身體充滿力量！
                            </p>
                          </div>
                        </div>
                        <div className="p-4 bg-indigo-50/40 border border-indigo-100/50 rounded-2xl flex flex-col justify-between">
                          <div>
                            <span className="text-2xl">📱</span>
                            <h6 className="font-extrabold text-xs text-indigo-900 mt-2">睡前不看螢幕</h6>
                            <p className="text-slate-500 text-[11px] mt-1 font-semibold leading-relaxed">
                              電子產品的藍光會阻礙褪黑激素分泌。<b>睡前半小時</b> 關掉平板與手機，換成看故事書，能睡得更香甜哦！
                            </p>
                          </div>
                        </div>
                        <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex flex-col justify-between">
                          <div>
                            <span className="text-2xl">⏰</span>
                            <h6 className="font-extrabold text-xs text-emerald-900 mt-2">建立規律作息</h6>
                            <p className="text-slate-500 text-[11px] mt-1 font-semibold leading-relaxed">
                              每天在<b>固定的時間</b>睡覺與起床，即使是週末也儘量保持一致，讓大腦建立規律的「生理時鐘」。
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 text-xs text-amber-800 font-semibold flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>
                          <b>老師溫馨提醒：</b>如果最近經常失眠、做噩夢或早上起床後覺得很累，可以隨時在「心情加油站」留言告訴班導師或社工，讓我們一起找出好眠的方法！
                        </span>
                      </div>
                    </div>

                    {/* School Mascot column */}
                    <div className="bg-sky-50 border border-sky-100/70 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-2xs">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-2 border-sky-200 overflow-hidden mb-3 p-1">
                        <img 
                          src={encodeURI("/學校圖檔/吉祥物/些些_correct.png")} 
                          alt="吉祥物些些" 
                          className="w-16 h-16 object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                            const parent = (e.target as HTMLElement).parentElement;
                            if (parent) {
                              parent.innerHTML = `<span class="text-4xl">🧸</span>`;
                            }
                          }}
                        />
                      </div>
                      <h6 className="font-black text-xs text-sky-950">「些些」悄悄話</h6>
                      <p className="text-slate-600 text-[10px] mt-1 font-semibold leading-relaxed">
                        「充足的睡眠能讓我每天都神采奕奕！今晚早點關掉平板，和我一起進入甜美的夢鄉吧！🌙💤」
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. RELAXATION PANEL - BREATHING COACH */}
              {activeTab === 'RELAX' && (
                <div className="space-y-5">
                  <div className="text-left flex items-center gap-2 mb-1">
                    <span className="text-xl">🌬️</span>
                    <h5 className="text-sm font-black text-slate-800">Relax 放鬆：互動減壓呼吸教練</h5>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-3 text-center">
                      <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl flex flex-col items-center justify-center relative min-h-[260px] overflow-hidden">
                        
                        {/* Breathing circle indicator */}
                        <div className="relative flex items-center justify-center w-40 h-40">
                          
                          {/* Ripple waves during active breathing */}
                          {isBreathing && breathingPhase === 'INHALE' && (
                            <motion.div 
                              className="absolute inset-0 bg-indigo-500/20 rounded-full"
                              animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                              transition={{ duration: 4, repeat: Infinity, ease: "easeOut" }}
                            />
                          )}
                          {isBreathing && breathingPhase === 'EXHALE' && (
                            <motion.div 
                              className="absolute inset-0 bg-sky-400/20 rounded-full"
                              animate={{ scale: [1.8, 1], opacity: [0.1, 0.5] }}
                              transition={{ duration: 4, repeat: Infinity, ease: "easeIn" }}
                            />
                          )}

                          {/* Main pulsing circle */}
                          <motion.div
                            className={`rounded-full flex flex-col items-center justify-center text-white border-4 shadow-lg z-10 transition-colors ${
                              breathingPhase === 'INHALE' ? 'bg-indigo-600 border-indigo-400' :
                              breathingPhase === 'HOLD' ? 'bg-pink-600 border-pink-400' :
                              breathingPhase === 'EXHALE' ? 'bg-sky-600 border-sky-400' :
                              'bg-slate-400 border-slate-300'
                            }`}
                            animate={{
                              scale: 
                                breathingPhase === 'INHALE' ? 1.4 :
                                breathingPhase === 'HOLD' ? 1.4 :
                                breathingPhase === 'EXHALE' ? 0.95 : 
                                1.0
                            }}
                            transition={{ 
                              duration: breathingPhase === 'READY' ? 0.3 : 4,
                              ease: "easeInOut"
                            }}
                            style={{ width: '110px', height: '110px' }}
                          >
                            {isBreathing ? (
                              <>
                                <span className="text-3xl font-black">{breathingSeconds}</span>
                                <span className="text-[10px] font-extrabold uppercase tracking-widest mt-0.5">秒</span>
                              </>
                            ) : (
                              <Compass className="w-10 h-10 animate-spin-slow" />
                            )}
                          </motion.div>
                        </div>

                        {/* Instructive subtitle */}
                        <div className="mt-5 h-8">
                          <p className="text-sm font-black text-slate-800 transition-all duration-300">
                            {getPhaseText()}
                          </p>
                        </div>

                        {/* Start/Stop Button */}
                        <div className="mt-4">
                          {!isBreathing ? (
                            <button
                              type="button"
                              onClick={() => {
                                setIsBreathing(true);
                                setBreathingState('INHALE');
                                setBreathingSeconds(4);
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-6 py-2.5 rounded-full shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <Compass className="w-4 h-4" />
                              <span>開始 2 分鐘深呼吸放鬆</span>
                            </button>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsBreathing(false);
                                }}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs px-5 py-2.5 rounded-full transition-all cursor-pointer"
                              >
                                暫停放鬆
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setBreathingState('INHALE');
                                  setBreathingSeconds(4);
                                }}
                                className="bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 font-bold text-xs px-3 py-2.5 rounded-full transition-all cursor-pointer flex items-center gap-1"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                重新開始
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* School Mascot column */}
                    <div className="bg-indigo-50 border border-indigo-100/70 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-2xs">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-2 border-indigo-200 overflow-hidden mb-3 p-1">
                        <img 
                          src={encodeURI("/學校圖檔/吉祥物/尊重鳥圖(5).png")} 
                          alt="吉祥物尊尊重重" 
                          className="w-16 h-16 object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                            const parent = (e.target as HTMLElement).parentElement;
                            if (parent) {
                              parent.innerHTML = `<span class="text-4xl">🕊️</span>`;
                            }
                          }}
                        />
                      </div>
                      <h6 className="font-black text-xs text-indigo-950">「尊尊重重」悄悄話</h6>
                      <p className="text-slate-600 text-[10px] mt-1 font-semibold leading-relaxed">
                        「當你覺得緊張或累了，跟我一起做深呼吸。吸入滿滿的平靜，呼出所有的不開心。放鬆一下吧！🕊️🌬️」
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed text-center lg:text-left">
                    💡 <b>小技巧：</b>跟著圓圈的「膨脹」與「縮小」呼吸。吸氣時想像吸入溫暖與平靜，呼氣時輕輕吐出心裡的煩惱與緊繃。重複幾次，心靈會感到非常安靜舒適哦。
                  </p>
                </div>
              )}

              {/* 3. RELATION PANEL */}
              {activeTab === 'RELATION' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">❤️</span>
                    <h5 className="text-sm font-black text-slate-800">Relation 關係：正向連結，溫暖人心</h5>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-4">
                    人與人之間的關懷，是心靈最強大的保護網。今天試試挑戰以下一項「正向連結任務」吧：
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-rose-50/40 border border-rose-100/50 rounded-2xl flex flex-col justify-between">
                          <div>
                            <span className="text-xl">💌</span>
                            <h6 className="font-extrabold text-xs text-rose-900 mt-2">1. 傳遞溫馨感謝</h6>
                            <p className="text-slate-500 text-[11px] mt-1 font-semibold leading-relaxed">
                              向今天教導你的老師，或者陪伴你吃飯、玩的 1 位同學，誠懇地說一聲「謝謝」，傳達你對他們的感謝與喜愛。
                            </p>
                          </div>
                          <div className="mt-3 text-[10px] text-rose-700 bg-rose-50/70 py-1 px-2.5 rounded-lg font-black w-fit">
                            難度 ⭐
                          </div>
                        </div>

                        <div className="p-4 bg-indigo-50/40 border border-indigo-100/50 rounded-2xl flex flex-col justify-between">
                          <div>
                            <span className="text-xl">💬</span>
                            <h6 className="font-extrabold text-xs text-indigo-900 mt-2">2. 分享小秘密與心聲</h6>
                            <p className="text-slate-500 text-[11px] mt-1 font-semibold leading-relaxed">
                              心情低落時，別悶著。在「心情加油站」留言，或找爸爸媽媽、班導師及學校社工聊一聊。傾訴是減輕重擔最有效的第一步！
                            </p>
                          </div>
                          <div className="mt-3 text-[10px] text-indigo-700 bg-indigo-50 py-1 px-2.5 rounded-lg font-black w-fit">
                            難度 ⭐⭐
                          </div>
                        </div>

                        <div className="p-4 bg-emerald-50/40 border border-emerald-100/50 rounded-2xl flex flex-col justify-between">
                          <div>
                            <span className="text-xl">😊</span>
                            <h6 className="font-extrabold text-xs text-emerald-900 mt-2">3. 鏡子微笑挑戰</h6>
                            <p className="text-slate-500 text-[11px] mt-1 font-semibold leading-relaxed">
                              清晨起床刷牙時，對著鏡子裡的自己展示一個大大的微笑，並輕聲對自己說：「你今天很棒，加油！」對同學也給予溫暖的微笑吧！
                            </p>
                          </div>
                          <div className="mt-3 text-[10px] text-emerald-700 bg-emerald-50 py-1 px-2.5 rounded-lg font-black w-fit">
                            難度 ⭐
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* School Mascot column */}
                    <div className="bg-pink-50 border border-pink-100/70 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-2xs">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-2 border-pink-200 overflow-hidden mb-3 p-1">
                        <img 
                          src={encodeURI("/學校圖檔/吉祥物/恩恩退地-01.png")} 
                          alt="吉祥物恩恩" 
                          className="w-16 h-16 object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                            const parent = (e.target as HTMLElement).parentElement;
                            if (parent) {
                              parent.innerHTML = `<span class="text-4xl">💝</span>`;
                            }
                          }}
                        />
                      </div>
                      <h6 className="font-black text-xs text-pink-950">「恩恩」悄悄話</h6>
                      <p className="text-slate-600 text-[10px] mt-1 font-semibold leading-relaxed">
                        「懂得感恩和關懷，身邊的世界會變得更溫暖哦！今天試著完成一項任務，向大家傳遞愛吧！💖💌」
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. RESILIENCE PANEL - INTERACTIVE FLIP CARDS */}
              {activeTab === 'RESILIENCE' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🌱</span>
                    <h5 className="text-sm font-black text-slate-800">Resilience 抗逆：正向思維翻翻卡</h5>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-4">
                    「抗逆力」就像是心靈的橡皮筋，即使遇到拉扯和打擊，也能重新彈回！點擊以下卡片，看看如何換個角度想一想（正面為煩惱，背面為正向思維）：
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          {
                            title: "✍️ 功課與成績煩惱",
                            front: "這次考試成績考得很不理想，我肯定很笨，不論怎麼努力都沒用了...",
                            back: "分數只代表我這次某些地方沒弄懂。我可以請教老師和同學，每一點微小的進步都值得肯定！我很有耐心，慢慢來一定能學會！"
                          },
                          {
                            title: "👥 同儕相處煩惱",
                            front: "今天下課時，同學好像故意不想理我、不想和我玩，他們是不是都很討厭我...",
                            back: "大家可能只是當下玩得太投入，或者心情有點累。我可以大方地主動問：『我可以一起玩嗎？』或邀請另一位同學，這不是我的錯。"
                          },
                          {
                            title: "🤯 壓力與情緒煩惱",
                            front: "最近要做的事情太多，功課好多、活動好擠，我快應付不來了，好想放棄一切...",
                            back: "感到有壓力是完全正常的！我可以把事情分出優先順序，一次只專心做好一件事。完成一小步就給自己點個讚，也可以向老師求助減壓！"
                          }
                        ].map((card, idx) => {
                          const isFlipped = !!flippedCards[idx];
                          return (
                            <div 
                              key={idx} 
                              onClick={() => toggleFlipCard(idx)}
                              className="group h-[190px] cursor-pointer"
                              style={{ perspective: '1000px' }}
                            >
                              <div 
                                className="relative w-full h-full duration-500 transition-all rounded-2xl"
                                style={{ 
                                  transformStyle: 'preserve-3d',
                                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                                }}
                              >
                                {/* Card FRONT (Worry) */}
                                <div 
                                  className="absolute inset-0 bg-rose-50 border border-rose-100 rounded-2xl p-4 flex flex-col justify-between select-none"
                                  style={{ backfaceVisibility: 'hidden' }}
                                >
                                  <div>
                                    <h6 className="font-extrabold text-[11px] text-rose-800 flex items-center justify-between">
                                      <span>{card.title}</span>
                                      <span className="text-[9px] bg-rose-100 px-1.5 py-0.5 rounded font-black">點擊翻轉</span>
                                    </h6>
                                    <p className="text-slate-600 text-xs mt-3 font-semibold leading-relaxed">
                                      「 {card.front} 」
                                    </p>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-0.5 justify-end">
                                    點我看建議 <ArrowRight className="w-3 h-3" />
                                  </span>
                                </div>

                                {/* Card BACK (Constructive Reframing) */}
                                <div 
                                  className="absolute inset-0 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-col justify-between select-none"
                                  style={{ 
                                    backfaceVisibility: 'hidden',
                                    transform: 'rotateY(180deg)'
                                  }}
                                >
                                  <div>
                                    <h6 className="font-extrabold text-[11px] text-emerald-800 flex items-center justify-between">
                                      <span>🌈 心靈正向重構</span>
                                      <span className="text-[9px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded font-black">正向思維</span>
                                    </h6>
                                    <p className="text-slate-700 text-xs mt-3 font-extrabold leading-relaxed">
                                      {card.back}
                                    </p>
                                  </div>
                                  <span className="text-[9px] text-emerald-600 font-bold text-right italic">
                                    校訓精神：仁愛、忍耐 🌱
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* School Mascot column */}
                    <div className="bg-emerald-50 border border-emerald-100/70 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-2xs">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-2 border-emerald-200 overflow-hidden mb-3 p-1">
                        <img 
                          src={encodeURI("/學校圖檔/吉祥物/堅堅_correct.png")} 
                          alt="吉祥物堅堅" 
                          className="w-16 h-16 object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                            const parent = (e.target as HTMLElement).parentElement;
                            if (parent) {
                              parent.innerHTML = `<span class="text-4xl">🛡️</span>`;
                            }
                          }}
                        />
                      </div>
                      <h6 className="font-black text-xs text-emerald-950">「堅堅」正能量</h6>
                      <p className="text-slate-600 text-[10px] mt-1 font-semibold leading-relaxed">
                        「我們善導小學的同學是最有毅力的！遇到困難不放棄，換個角度看問題，我們就能像橡皮筋一樣彈得更高！🛡️💪」
                      </p>
                    </div>
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
