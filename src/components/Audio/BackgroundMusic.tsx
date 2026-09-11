import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Music, Volume2, VolumeX, Disc } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPublicAssetUrl } from '../../utils/assetHelper';

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load preferences from localStorage
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    return localStorage.getItem('gccps_bgm_muted') === 'true';
  });

  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem('gccps_bgm_volume');
    return saved !== null ? Math.min(1, Math.max(0, parseFloat(saved))) : 0.35;
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Sync volume & mute state with <audio> element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [isMuted, volume]);

  // Attempt play with modern browser autoplay policy handling
  const attemptPlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || isMuted) return;

    audio.volume = volume;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Autoplay policy prevented playback until user interaction
          setIsPlaying(false);
        });
    }
  }, [isMuted, volume]);

  // Handle first user interaction to start BGM if blocked by browser policy
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set loop attribute directly on element
    audio.loop = true;

    // Try auto-playing immediately
    attemptPlay();

    // Listen for any user gesture anywhere on window to unlock audio
    const unlockAudio = () => {
      if (audioRef.current && !isMuted) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {});
      }
      removeListeners();
    };

    const removeListeners = () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };

    window.addEventListener('pointerdown', unlockAudio, { once: true, passive: true });
    window.addEventListener('click', unlockAudio, { once: true, passive: true });
    window.addEventListener('keydown', unlockAudio, { once: true, passive: true });
    window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });

    // Listen for global custom events
    const handleGlobalToggle = () => {
      togglePlayPause();
    };
    window.addEventListener('gccps:toggle-bgm', handleGlobalToggle);

    return () => {
      removeListeners();
      window.removeEventListener('gccps:toggle-bgm', handleGlobalToggle);
    };
  }, [attemptPlay, isMuted]);

  // Toggle play/pause or mute/unmute
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && !isMuted) {
      audio.pause();
      setIsPlaying(false);
      setIsMuted(true);
      localStorage.setItem('gccps_bgm_muted', 'true');
    } else {
      setIsMuted(false);
      localStorage.setItem('gccps_bgm_muted', 'false');
      audio.volume = volume;
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn('Playback request failed:', e);
      });
    }
  };

  // Change volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    localStorage.setItem('gccps_bgm_volume', newVol.toString());
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
      localStorage.setItem('gccps_bgm_muted', 'false');
      if (audioRef.current) {
        audioRef.current.volume = newVol;
        if (!isPlaying) {
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }
    } else if (newVol === 0 && !isMuted) {
      setIsMuted(true);
      localStorage.setItem('gccps_bgm_muted', 'true');
    }
  };

  const bgmSrc = getPublicAssetUrl('/audio/bgm.mp3');

  return (
    <>
      {/* 
        Native HTML5 Audio element placed at root level.
        Never unmounts during page transitions, ensuring 100% continuous uninterrupted looping!
      */}
      <audio
        ref={audioRef}
        src={bgmSrc}
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={(e) => console.warn('BGM audio load error:', e)}
      />

      {/* Floating Animated BGM Control Widget */}
      <div 
        data-role="bgm-controller"
        className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-[70] select-none flex items-center gap-2 pointer-events-auto"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 15, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-amber-200/80 px-3 py-2 flex items-center gap-2.5 text-xs text-slate-700"
            >
              <div className="flex items-center gap-1.5 font-bold text-amber-800 whitespace-nowrap">
                <Music className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>校園背景音樂</span>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-amber-100">
                <button
                  type="button"
                  onClick={togglePlayPause}
                  className="text-slate-600 hover:text-amber-700 transition-colors p-1 rounded-md hover:bg-amber-50 cursor-pointer"
                  title={isPlaying && !isMuted ? '暫停音樂' : '播放音樂'}
                >
                  {isMuted || !isPlaying ? (
                    <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 sm:w-20 h-1.5 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  title={`音量: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                />
                <span className="text-[10px] text-slate-500 font-mono w-7 text-right">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Disc / Music Button */}
        <motion.button
          type="button"
          onClick={togglePlayPause}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className={`relative group flex items-center justify-center p-2.5 sm:p-3 rounded-full shadow-lg transition-all cursor-pointer border ${
            isPlaying && !isMuted
              ? 'bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 text-amber-950 border-amber-300/80 shadow-amber-300/40 ring-2 ring-amber-200/50'
              : 'bg-white/90 backdrop-blur-md text-slate-500 border-slate-200 shadow-slate-300/30 hover:bg-white'
          }`}
          title={isPlaying && !isMuted ? '校園音樂播放中 (點擊靜音/暫停)' : '校園音樂已靜音 (點擊播放)'}
          aria-label="背景音樂開關"
        >
          {/* Animated vinyl rotation when playing */}
          <motion.div
            animate={isPlaying && !isMuted ? { rotate: 360 } : { rotate: 0 }}
            transition={isPlaying && !isMuted ? { duration: 4.5, repeat: Infinity, ease: 'linear' } : { duration: 0.3 }}
            className="flex items-center justify-center"
          >
            {isPlaying && !isMuted ? (
              <Disc className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-amber-900" />
            ) : (
              <VolumeX className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-slate-400" />
            )}
          </motion.div>

          {/* Floating musical note spark when active */}
          {isPlaying && !isMuted && (
            <motion.span
              animate={{
                y: [-2, -8, -2],
                opacity: [0.6, 1, 0.6],
                scale: [0.9, 1.15, 0.9]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-1 -right-1 text-xs"
            >
              🎵
            </motion.span>
          )}
        </motion.button>
      </div>
    </>
  );
}
