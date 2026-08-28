import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useMotionTemplate } from 'motion/react';
import { Shield, Sparkles, Heart, Volume2, VolumeX } from 'lucide-react';
import { getPublicAssetUrl } from '../../utils/assetHelper';

interface LandingProps {
  setViewState: (view: 'LANDING' | 'STUDENT_LOGIN' | 'STUDENT_DASHBOARD' | 'TEACHER_LOGIN' | 'TEACHER_DASHBOARD' | 'TEACHER_P1_3_BATCH') => void;
  setPrivacyModalVisible: (visible: boolean) => void;
}



interface SkeletalXinXinProps {
  isWiggling: boolean;
  mascotX: any;
  mascotY: any;
  mouseX: any;
  mouseY: any;
  isHovered: boolean;
  eyeState: EyeState;
}

type EyeState = 
  | 'normal' 
  | 'wink_left' 
  | 'wink_right' 
  | 'look_left' 
  | 'look_right' 
  | 'look_up' 
  | 'look_down'
  | 'happy' 
  | 'surprised'
  | 'dizzy'
  | 'love'
  | 'star'
  | 'thinking'
  | 'worried'
  | 'wink_happy'
  | 'sleeping';

const MASCOT_VERSION = "8";

function SkeletalXinXin({ isWiggling, mascotX, mascotY, mouseX, mouseY, isHovered, eyeState }: SkeletalXinXinProps) {
  const wiggleTransition = { duration: 0.6, ease: "easeInOut" };

  // Eye pupil mouse-tracking translations (simulating advanced Live2D depth)
  const rawEyeOffsetX = useTransform(mouseX, [-0.5, 0.5], [-4, 4]);
  const rawEyeOffsetY = useTransform(mouseY, [-0.5, 0.5], [-3, 3]);
  const eyeOffsetX = useSpring(rawEyeOffsetX, { stiffness: 150, damping: 18 });
  const eyeOffsetY = useSpring(rawEyeOffsetY, { stiffness: 150, damping: 18 });

  // Multi-layered depth parallax transforms for a volumetric Live2D feel
  // Background layers shift opposite to the cursor direction, foreground layers shift with the cursor.
  const flameX = useSpring(useTransform(mouseX, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 18 });
  const flameY = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 150, damping: 18 });

  const legsX = useSpring(useTransform(mouseX, [-0.5, 0.5], [3, -3]), { stiffness: 150, damping: 18 });
  const legsY = useSpring(useTransform(mouseY, [-0.5, 0.5], [2, -2]), { stiffness: 150, damping: 18 });

  // Middle layer (head, face, and base) shifts very slightly with cursor to amplify separation with flame & limbs
  const bodyX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-2.5, 2.5]), { stiffness: 150, damping: 18 });
  const bodyY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-2, 2]), { stiffness: 150, damping: 18 });

  // Head shifts and tilts with the cursor to simulate 2.5D neck pivot rotation
  const headX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), { stiffness: 150, damping: 18 });
  const headY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-4, 4]), { stiffness: 150, damping: 18 });
  const headRotate = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), { stiffness: 150, damping: 18 });

  const handsX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 150, damping: 18 });
  const handsY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-8, 8]), { stiffness: 150, damping: 18 });

  const getLeftEyeAnimate = () => {
    if (isWiggling) {
      if (eyeState === 'happy') {
        return { scaleY: 0.3, scaleX: 1.25, x: 0, y: 1, rotate: 0 };
      }
      if (eyeState === 'surprised') {
        return { scale: 1.35, x: 0, y: -2, rotate: 0 };
      }
      if (eyeState === 'love' || eyeState === 'star') {
        return { scale: 0, rotate: 0 };
      }
      if (eyeState === 'dizzy') {
        return { scale: 1.0, x: 1, y: 1, rotate: -35 };
      }
      if (eyeState === 'wink_happy') {
        return { scaleY: 0.3, scaleX: 1.25, x: 0, y: 1, rotate: 0 };
      }
    }
    switch (eyeState) {
      case 'wink_left':
        return { scaleY: 0.1, scaleX: 1.1, x: 0, y: 0, rotate: 0 };
      case 'wink_right':
        return { scaleY: 1.0, scaleX: 1.0, x: 0, y: 0, rotate: 0 };
      case 'look_left':
        return { scaleY: 1.0, scaleX: 1.0, x: -3.5, y: 0, rotate: 0 };
      case 'look_right':
        return { scaleY: 1.0, scaleX: 1.0, x: 3.5, y: 0, rotate: 0 };
      case 'look_up':
        return { scaleY: 1.0, scaleX: 1.0, x: 0, y: -2.5, rotate: 0 };
      case 'look_down':
        return { scaleY: 1.0, scaleX: 1.0, x: 0, y: 2.5, rotate: 0 };
      case 'happy':
        return { scaleY: 0.3, scaleX: 1.25, x: 0, y: 1, rotate: 0 };
      case 'surprised':
        return { scale: 1.35, x: 0, y: -2, rotate: 0 };
      case 'dizzy':
        return { scale: 1.0, x: 1, y: 1, rotate: -35 };
      case 'love':
      case 'star':
        return { scale: 0, rotate: 0 };
      case 'thinking':
        return { scaleY: 0.4, scaleX: 1.1, x: -2, y: 2, rotate: 0 };
      case 'worried':
        return { scaleY: 0.85, scaleX: 0.95, x: 1, y: 1.5, rotate: 15 };
      case 'wink_happy':
        return { scaleY: 0.3, scaleX: 1.25, x: 0, y: 1, rotate: 0 };
      case 'sleeping':
        return { scaleY: 0.1, scaleX: 1.0, x: 0, y: 2, rotate: 0 };
      case 'normal':
      default:
        return {
          scaleY: 1.0,
          scaleX: 1.0,
          x: 0,
          y: 0,
          rotate: 0
        };
    }
  };

  const getRightEyeAnimate = () => {
    if (isWiggling) {
      if (eyeState === 'happy') {
        return { scaleY: 0.3, scaleX: 1.25, x: 0, y: 1, rotate: 0 };
      }
      if (eyeState === 'surprised') {
        return { scale: 1.35, x: 0, y: -2, rotate: 0 };
      }
      if (eyeState === 'love' || eyeState === 'star') {
        return { scale: 0, rotate: 0 };
      }
      if (eyeState === 'dizzy') {
        return { scale: 1.0, x: -1, y: 1, rotate: 35 };
      }
      if (eyeState === 'wink_happy') {
        return { scaleY: 1.1, scaleX: 1.1, x: 0, y: -1, rotate: 0 };
      }
    }
    switch (eyeState) {
      case 'wink_left':
        return { scaleY: 1.0, scaleX: 1.0, x: 0, y: 0, rotate: 0 };
      case 'wink_right':
        return { scaleY: 0.1, scaleX: 1.1, x: 0, y: 0, rotate: 0 };
      case 'look_left':
        return { scaleY: 1.0, scaleX: 1.0, x: -3.5, y: 0, rotate: 0 };
      case 'look_right':
        return { scaleY: 1.0, scaleX: 1.0, x: 3.5, y: 0, rotate: 0 };
      case 'look_up':
        return { scaleY: 1.0, scaleX: 1.0, x: 0, y: -2.5, rotate: 0 };
      case 'look_down':
        return { scaleY: 1.0, scaleX: 1.0, x: 0, y: 2.5, rotate: 0 };
      case 'happy':
        return { scaleY: 0.3, scaleX: 1.25, x: 0, y: 1, rotate: 0 };
      case 'surprised':
        return { scale: 1.35, x: 0, y: -2, rotate: 0 };
      case 'dizzy':
        return { scale: 1.0, x: -1, y: 1, rotate: 35 };
      case 'love':
      case 'star':
        return { scale: 0, rotate: 0 };
      case 'thinking':
        return { scaleY: 1.0, scaleX: 1.0, x: 2, y: -3, rotate: 0 };
      case 'worried':
        return { scaleY: 0.85, scaleX: 0.95, x: -1, y: 1.5, rotate: -15 };
      case 'wink_happy':
        return { scaleY: 1.1, scaleX: 1.1, x: 0, y: -1, rotate: 0 };
      case 'sleeping':
        return { scaleY: 0.1, scaleX: 1.0, x: 0, y: 2, rotate: 0 };
      case 'normal':
      default:
        return {
          scaleY: 1.0,
          scaleX: 1.0,
          x: 0,
          y: 0,
          rotate: 0
        };
    }
  };

  const leftEyeTransition = { type: "spring", stiffness: 220, damping: 14 };
  const rightEyeTransition = { type: "spring", stiffness: 220, damping: 14 };

  return (
    <motion.div 
      className="relative select-none pointer-events-none mb-4"
      style={{
        width: '224px',
        height: '307px',
        x: mascotX,
        y: mascotY,
        transformStyle: "preserve-3d" as const,
      }}
    >
      {/* Dynamic Floor Shadow beneath her feet */}
      <motion.div
        className="absolute bg-slate-900/15 filter blur-md rounded-full"
        style={{
          left: "20%",
          bottom: "-4px",
          width: "60%",
          height: "10px",
          zIndex: 0,
          transformOrigin: "50% 50%",
        }}
        animate={isWiggling ? {
          scaleX: [1, 0.7, 1.1, 0.85, 1],
          opacity: [1, 0.4, 1.1, 0.6, 1],
        } : {
          scaleX: isHovered ? [1, 0.85, 1] : [1, 0.92, 1],
          opacity: isHovered ? [1, 0.6, 1] : [1, 0.75, 1],
        }}
        transition={isWiggling ? wiggleTransition : {
          scaleX: { duration: isHovered ? 2.4 : 3.4, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: isHovered ? 2.4 : 3.4, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* Nested Body Core Wrapper - carries the primary torso bobbing, excited breathing and wiggling transforms */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={{
          transformOrigin: "50% 80%",
          transformStyle: "preserve-3d" as const,
        }}
        animate={isWiggling ? {
          scale: [1, 1.08, 0.94, 1.04, 1],
          rotate: [0, -6, 6, -3, 0],
          y: [0, -8, 2, -3, 0],
        } : {
          y: isHovered ? [0, -6, 0] : [0, -4, 0],
          rotate: isHovered ? [-0.8, 0.8, -0.8] : [-0.5, 0.5, -0.5],
          scaleY: isHovered ? [1, 1.025, 1] : [1, 1.012, 1],
          scaleX: isHovered ? [1, 0.98, 1] : [1, 0.993, 1],
        }}
        transition={isWiggling ? wiggleTransition : {
          y: { duration: isHovered ? 2.4 : 3.4, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: isHovered ? 2.4 : 3.4, repeat: Infinity, ease: "easeInOut" },
          scaleY: { duration: isHovered ? 2.4 : 3.4, repeat: Infinity, ease: "easeInOut" },
          scaleX: { duration: isHovered ? 2.4 : 3.4, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        {/* 1. Left Leg Layer (rendered behind skirt/body base with organic swaying, dancing, and parallax) */}
        <motion.img
          src={getPublicAssetUrl(`/學校圖檔/吉祥物/xinxin_left_leg_v7.png?v=${MASCOT_VERSION}`)}
          alt="left leg"
          className="absolute"
          style={{
            left: "29.86%",
            top: "75.85%",
            width: "39.86%",
            height: "19.46%",
            transformOrigin: "36.94% 20.51%",
            x: legsX,
            y: legsY,
          }}
          animate={isWiggling ? {
            rotate: [0, -25, 20, -15, 0],
            y: [0, -6, 2, -3, 0],
            scaleY: [1, 0.85, 1.1, 0.95, 1],
          } : {
            rotate: isHovered ? [-4, 4, -4] : [-2.5, 2.5, -2.5],
            y: isHovered ? [0, 1.4, 0] : [0, 1.0, 0],
            scaleY: isHovered ? [1, 0.94, 1] : [1, 0.96, 1],
          }}
          transition={isWiggling ? wiggleTransition : { 
            rotate: { duration: isHovered ? 2.0 : 3.0, repeat: Infinity, ease: "easeInOut" },
            y: { duration: isHovered ? 1.8 : 2.5, repeat: Infinity, ease: "easeInOut" },
            scaleY: { duration: isHovered ? 1.8 : 2.5, repeat: Infinity, ease: "easeInOut" }
          }}
        />

        {/* 2. Right Leg Layer (rendered behind skirt/body base with organic swaying, dancing, and parallax) */}
        <motion.img
          src={getPublicAssetUrl(`/學校圖檔/吉祥物/xinxin_right_leg_v7.png?v=${MASCOT_VERSION}`)}
          alt="right leg"
          className="absolute"
          style={{
            left: "29.86%",
            top: "75.85%",
            width: "39.86%",
            height: "19.46%",
            transformOrigin: "64.09% 20.51%",
            x: legsX,
            y: legsY,
          }}
          animate={isWiggling ? {
            rotate: [0, 25, -20, 15, 0],
            y: [0, -6, 2, -3, 0],
            scaleY: [1, 0.85, 1.1, 0.95, 1],
          } : {
            rotate: isHovered ? [4, -4, 4] : [2.5, -2.5, 2.5],
            y: isHovered ? [0, 1.4, 0] : [0, 1.0, 0],
            scaleY: isHovered ? [1, 0.94, 1] : [1, 0.96, 1],
          }}
          transition={isWiggling ? wiggleTransition : { 
            rotate: { duration: isHovered ? 2.2 : 3.3, repeat: Infinity, ease: "easeInOut" }, // offset duration for natural swaying posture
            y: { duration: isHovered ? 1.8 : 2.5, repeat: Infinity, ease: "easeInOut" },
            scaleY: { duration: isHovered ? 1.8 : 2.5, repeat: Infinity, ease: "easeInOut" }
          }}
        />

        {/* 3. Main Torso Body Base Layer (collar upwards to neck extended base and dress) */}
        <motion.img
          src={getPublicAssetUrl(`/學校圖檔/吉祥物/xinxin_body_base_v8.png?v=${MASCOT_VERSION}`)}
          alt="body"
          className="absolute left-0 top-0 w-full h-full"
          style={{ x: bodyX, y: bodyY }}
        />

        {/* 4. Unified 2.5D Head Block Wrapper (Chin upwards, rotating around the neck pivot) */}
        <motion.div
          className="absolute inset-0 w-full h-full"
          style={{
            transformOrigin: "48.63% 70.16%", // center of neck joint (x=355, y=703)
            x: headX,
            y: headY,
            rotate: headRotate,
            transformStyle: "preserve-3d" as const,
          }}
          animate={isWiggling ? {
            rotate: [0, -12, 12, -6, 0],
            y: [0, -4, 2, -1, 0],
          } : {}}
          transition={isWiggling ? wiggleTransition : undefined}
        >
          {/* 4a. Fire Flame Layer (rendered behind her helmet inside the head block, creating organic lagging sway!) */}
          <motion.img
            src={getPublicAssetUrl(`/學校圖檔/吉祥物/xinxin_fire_v7.png?v=${MASCOT_VERSION}`)}
            alt="fire flame"
            className="absolute"
            style={{
              left: "23.42%",
              top: "4.99%",
              width: "57.81%",
              height: "20.96%",
              transformOrigin: "50% 100%",
              x: flameX,
              y: flameY,
            }}
            animate={isWiggling ? {
              scale: [1, 1.35, 0.85, 1.15, 1],
              skewX: [0, -12, 12, -6, 0],
              y: [0, -4, 0],
            } : {
              y: isHovered ? [0, -6, 0] : [0, -4, 0],
              skewX: isHovered ? [-5, 6, -5] : [-3, 4, -3],
              scale: isHovered ? [1, 1.07, 0.95, 1.04, 1] : [1, 1.04, 0.97, 1.03, 1],
            }}
            transition={isWiggling ? wiggleTransition : { 
              y: { duration: isHovered ? 2.4 : 3.4, repeat: Infinity, ease: "easeInOut" },
              skewX: { duration: isHovered ? 0.85 : 1.1, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: isHovered ? 1.15 : 1.4, repeat: Infinity, ease: "easeInOut" }
            }}
          />

          {/* 4b. Head Base Layer (helmet, hair, and face skin) */}
          <img
            src={getPublicAssetUrl(`/學校圖檔/吉祥物/xinxin_head_v8.png?v=${MASCOT_VERSION}`)}
            alt="head"
            className="absolute left-0 top-0 w-full h-full pointer-events-none"
          />

          {/* 4c. Left Eye Layer */}
          <motion.div 
            className="absolute"
            style={{
              left: "35.62%",
              top: "46.91%",
              width: "8.90%",
              height: "10.98%"
            }}
          >
            {/* Mouse tracking pupil depth wrapper */}
            <motion.div
              className="w-full h-full"
              style={{
                x: (eyeState !== 'sleeping' && eyeState !== 'love' && eyeState !== 'star') ? eyeOffsetX : 0,
                y: (eyeState !== 'sleeping' && eyeState !== 'love' && eyeState !== 'star') ? eyeOffsetY : 0,
              }}
            >
              <motion.img
                src={getPublicAssetUrl(`/學校圖檔/吉祥物/xinxin_left_eye_v7.png?v=${MASCOT_VERSION}`)}
                alt="left eye"
                className="w-full h-full"
                style={{ transformOrigin: "50% 50%" }}
                animate={getLeftEyeAnimate()}
                transition={leftEyeTransition}
              />
            </motion.div>
            <AnimatePresence>
              {eyeState === 'love' && (
                <motion.svg
                  viewBox="0 0 24 24"
                  className="absolute inset-0 w-full h-full fill-red-500 text-red-500 filter drop-shadow-[0_2px_4px_rgba(239,68,68,0.4)]"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 0.9, 1.1, 1], rotate: [0, -10, 10, -5, 0] }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 12 }}
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </motion.svg>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {eyeState === 'star' && (
                <motion.svg
                  viewBox="0 0 24 24"
                  className="absolute inset-0 w-full h-full fill-amber-400 text-amber-400 filter drop-shadow-[0_2px_6px_rgba(251,191,36,0.5)]"
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: [0, 1.4, 0.85, 1.1, 1], rotate: [0, 180] }}
                  exit={{ scale: 0, rotate: 45 }}
                  transition={{ type: "spring", stiffness: 280, damping: 13 }}
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </motion.svg>
              )}
            </AnimatePresence>
          </motion.div>

          {/* 4d. Right Eye Layer */}
          <motion.div 
            className="absolute"
            style={{
              left: "58.90%",
              top: "46.91%",
              width: "8.22%",
              height: "10.98%"
            }}
          >
            {/* Mouse tracking pupil depth wrapper */}
            <motion.div
              className="w-full h-full"
              style={{
                x: (eyeState !== 'sleeping' && eyeState !== 'love' && eyeState !== 'star') ? eyeOffsetX : 0,
                y: (eyeState !== 'sleeping' && eyeState !== 'love' && eyeState !== 'star') ? eyeOffsetY : 0,
              }}
            >
              <motion.img
                src={getPublicAssetUrl(`/學校圖檔/吉祥物/xinxin_right_eye_v7.png?v=${MASCOT_VERSION}`)}
                alt="right eye"
                className="w-full h-full"
                style={{ transformOrigin: "50% 50%" }}
                animate={getRightEyeAnimate()}
                transition={rightEyeTransition}
              />
            </motion.div>
            <AnimatePresence>
              {eyeState === 'love' && (
                <motion.svg
                  viewBox="0 0 24 24"
                  className="absolute inset-0 w-full h-full fill-red-500 text-red-500 filter drop-shadow-[0_2px_4px_rgba(239,68,68,0.4)]"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 0.9, 1.1, 1], rotate: [0, 10, -10, 5, 0] }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 12 }}
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </motion.svg>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {eyeState === 'star' && (
                <motion.svg
                  viewBox="0 0 24 24"
                  className="absolute inset-0 w-full h-full fill-amber-400 text-amber-400 filter drop-shadow-[0_2px_6px_rgba(251,191,36,0.5)]"
                  initial={{ scale: 0, rotate: 45 }}
                  animate={{ scale: [0, 1.4, 0.85, 1.1, 1], rotate: [0, -180] }}
                  exit={{ scale: 0, rotate: -45 }}
                  transition={{ type: "spring", stiffness: 280, damping: 13 }}
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </motion.svg>
              )}
            </AnimatePresence>
          </motion.div>


        </motion.div>

        {/* 5. Left Hand Layer (rendered with custom parallax, outside head block so it doesn't rotate) */}
        <motion.img
          src={getPublicAssetUrl(`/學校圖檔/吉祥物/xinxin_left_hand_v7.png?v=${MASCOT_VERSION}`)}
          alt="left hand"
          className="absolute"
          style={{
            left: "11.10%",
            top: "59.88%",
            width: "43.70%",
            height: "19.96%",
            transformOrigin: "84.33% 85%",
            x: handsX,
            y: handsY,
          }}
          animate={isWiggling ? {
            rotate: [0, 25, -20, 15, 0],
            x: [0, -4, 0],
          } : {
            rotate: isHovered ? [-5, 10, -5] : [-3, 6, -3],
            y: isHovered ? [0, -3.2, 0] : [0, -1.5, 0],
          }}
          transition={isWiggling ? wiggleTransition : { 
            rotate: { duration: isHovered ? 1.6 : 2.2, repeat: Infinity, ease: "easeInOut" },
            y: { duration: isHovered ? 1.6 : 2.2, repeat: Infinity, ease: "easeInOut" }
          }}
        />

        {/* 6. Right Hand Layer (rendered with custom parallax, outside head block so it doesn't rotate) */}
        <motion.img
          src={getPublicAssetUrl(`/學校圖檔/吉祥物/xinxin_right_hand_v7.png?v=${MASCOT_VERSION}`)}
          alt="right hand"
          className="absolute"
          style={{
            left: "46.58%",
            top: "59.88%",
            width: "39.86%",
            height: "19.96%",
            transformOrigin: "13.40% 85%",
            x: handsX,
            y: handsY,
          }}
          animate={isWiggling ? {
            rotate: [0, -25, 20, -15, 0],
            x: [0, 4, 0],
          } : {
            rotate: isHovered ? [5, -10, 5] : [3, -6, 3],
            y: isHovered ? [0, -3.2, 0] : [0, -1.5, 0],
          }}
          transition={isWiggling ? wiggleTransition : { 
            rotate: { duration: isHovered ? 1.9 : 2.6, repeat: Infinity, ease: "easeInOut" },
            y: { duration: isHovered ? 1.9 : 2.6, repeat: Infinity, ease: "easeInOut" }
          }}
        />
      </motion.div>
    </motion.div>
  );
}

export class SoundSynth {
  private static audioCtx: AudioContext | null = null;
  private static isMuted: boolean = false;

  private static getContext() {
    if (this.isMuted) return null;
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public static toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
    return this.isMuted;
  }

  public static getMuteStatus() {
    return this.isMuted;
  }

  public static playBubbleOpen() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(300, now);
    osc1.frequency.exponentialRampToValueAtTime(600, now + 0.15);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(450, now + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(900, now + 0.2);
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(0.05, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc1.start(now);
    osc1.stop(now + 0.15);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.2);
  }

  public static playPop() {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Cute bubble pop sound
    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.12);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  public static playJoyChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    // A beautiful sparkling 4-note major arpeggio
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'triangle';
      const delay = index * 0.08;
      const playTime = now + delay;

      osc.frequency.setValueAtTime(freq, playTime);
      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(0.12, playTime);
      gain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.5);

      osc.start(playTime);
      osc.stop(playTime + 0.5);
    });
  }

  public static playCalmBell() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Two low warm harmony notes (F4, A4)
    const notes = [349.23, 440.00];
    notes.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.start(now);
      osc.stop(now + 0.8);
    });
  }

  public static playExcitedZap() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.25);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public static playGratefulSweep() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(660, now + 0.4);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.start(now);
    osc.stop(now + 0.45);
  }
}

export default function Landing({ setViewState, setPrivacyModalVisible }: LandingProps) {
  // States for 2.5D Mascot Card
  const [isHovered, setIsHovered] = useState(false);
  const [isWiggling, setIsWiggling] = useState(false);
  const [eyeState, setEyeState] = useState<EyeState>('normal');
  const [isMuted, setIsMuted] = useState(false);

  // Particle state for click feedback
  interface VisualParticle {
    id: number;
    color: string;
    size: number;
    x: number;
    y: number;
    scale: number;
    rotate: number;
    velocityUp: number;
    velocitySide: number;
  }
  const [particles, setParticles] = useState<VisualParticle[]>([]);

  // Persistent eye state machine tracking references to prevent race conditions and locking
  const expressiveIndexRef = useRef(0);
  const isExpressiveActiveRef = useRef(false);
  const expressiveTimeoutRef = useRef<any>(null);
  const idleTimeoutRef = useRef<any>(null);
  const blinkTimeoutRef = useRef<any>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs with custom settings for a premium physical weight feel
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]), { stiffness: 120, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]), { stiffness: 120, damping: 20 });

  // Parallax layers translates
  const mascotX = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]), { stiffness: 120, damping: 20 });
  const mascotY = useSpring(useTransform(y, [-0.5, 0.5], [-15, 15]), { stiffness: 120, damping: 20 });

  const bgX = useSpring(useTransform(x, [-0.5, 0.5], [8, -8]), { stiffness: 120, damping: 20 });
  const bgY = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 120, damping: 20 });

  const heartX = useSpring(useTransform(x, [-0.5, 0.5], [-25, 25]), { stiffness: 120, damping: 20 });
  const heartY = useSpring(useTransform(y, [-0.5, 0.5], [-25, 25]), { stiffness: 120, damping: 20 });

  const glareX = useSpring(useTransform(x, [-0.5, 0.5], [0, 100]), { stiffness: 120, damping: 20 });
  const glareY = useSpring(useTransform(y, [-0.5, 0.5], [0, 100]), { stiffness: 120, damping: 20 });

  // Specular physical shadow casting dynamically in 3D (inverted offsets for authentic depth depth)
  const shadowX = useSpring(useTransform(x, [-0.5, 0.5], [15, -15]), { stiffness: 120, damping: 20 });
  const shadowY = useSpring(useTransform(y, [-0.5, 0.5], [32, 12]), { stiffness: 120, damping: 20 });
  const shadowBlur = isHovered ? 55 : 35;
  const shadowOpacity = isHovered ? 0.22 : 0.08;
  const boxShadow = useMotionTemplate`${shadowX}px ${shadowY}px ${shadowBlur}px rgba(139, 92, 246, ${shadowOpacity})`;

  // Passive auto-sway effect for touch/desktop standby
  useEffect(() => {
    if (isHovered) return;

    let animationFrameId: number;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      // Lissajous curve for highly fluid, multi-axis organic idle sway
      const px = Math.sin(elapsed * 1.2) * 0.22;
      const py = Math.cos(elapsed * 0.8) * 0.22;

      x.set(px);
      y.set(py);

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered, x, y]);

  // Handle automatic eye expressions cycle and idle blinks with strict reference-tracking to eliminate race conditions
  useEffect(() => {
    if (isWiggling) {
      const reactions: EyeState[] = ['happy', 'surprised', 'love', 'star', 'dizzy', 'wink_happy'];
      const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
      setEyeState(randomReaction);
      return;
    }

    setEyeState('normal');

    const EXPRESSIVE_STATES: EyeState[] = [
      'love',
      'star',
      'dizzy',
      'thinking',
      'worried',
      'wink_happy',
      'sleeping',
      'happy',
      'surprised'
    ];

    // Expressive autonomous cycle every 10 seconds
    const expressiveInterval = setInterval(() => {
      isExpressiveActiveRef.current = true;
      const nextState = EXPRESSIVE_STATES[expressiveIndexRef.current];
      expressiveIndexRef.current = (expressiveIndexRef.current + 1) % EXPRESSIVE_STATES.length;
      
      setEyeState(nextState);

      // Stay expressive for 4.5 seconds, then return to normal/idle
      if (expressiveTimeoutRef.current) clearTimeout(expressiveTimeoutRef.current);
      expressiveTimeoutRef.current = setTimeout(() => {
        setEyeState('normal');
        isExpressiveActiveRef.current = false;
      }, 4500);
    }, 10000);

    // Idle organic eye drift & blinks (only triggers when no expressive state is active)
    const idleInterval = setInterval(() => {
      if (isExpressiveActiveRef.current) return;

      if (isHovered) {
        // Direct tracking is active, only perform organic blinking reactions
        if (Math.random() < 0.28) {
          setEyeState('sleeping');
          if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
          blinkTimeoutRef.current = setTimeout(() => {
            if (!isExpressiveActiveRef.current) setEyeState('normal');
          }, 150);
        }
        return;
      }

      const rand = Math.random();
      if (rand < 0.16) {
        setEyeState('look_left');
        if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = setTimeout(() => { if (!isExpressiveActiveRef.current) setEyeState('normal'); }, 1200);
      } else if (rand < 0.32) {
        setEyeState('look_right');
        if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = setTimeout(() => { if (!isExpressiveActiveRef.current) setEyeState('normal'); }, 1200);
      } else if (rand < 0.45) {
        setEyeState('look_up');
        if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = setTimeout(() => { if (!isExpressiveActiveRef.current) setEyeState('normal'); }, 1000);
      } else if (rand < 0.58) {
        setEyeState('look_down');
        if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = setTimeout(() => { if (!isExpressiveActiveRef.current) setEyeState('normal'); }, 1000);
      } else if (rand < 0.75) {
        setEyeState('wink_left');
        if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = setTimeout(() => { if (!isExpressiveActiveRef.current) setEyeState('normal'); }, 500);
      } else if (rand < 0.92) {
        setEyeState('wink_right');
        if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = setTimeout(() => { if (!isExpressiveActiveRef.current) setEyeState('normal'); }, 500);
      } else {
        // Natural biological blink (both eyes closed)
        setEyeState('sleeping');
        if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
        blinkTimeoutRef.current = setTimeout(() => { if (!isExpressiveActiveRef.current) setEyeState('normal'); }, 150);
      }
    }, 3500);

    return () => {
      clearInterval(expressiveInterval);
      clearInterval(idleInterval);
      if (expressiveTimeoutRef.current) clearTimeout(expressiveTimeoutRef.current);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
    };
  }, [isWiggling, isHovered]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXVal = event.clientX - rect.left - width / 2;
    const mouseYVal = event.clientY - rect.top - height / 2;

    x.set(mouseXVal / width);
    y.set(mouseYVal / height);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    setIsHovered(true);
    if (event.touches.length === 0) return;
    const touch = event.touches[0];
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const touchXVal = touch.clientX - rect.left - width / 2;
    const touchYVal = touch.clientY - rect.top - height / 2;

    const clampedX = Math.max(-width / 2, Math.min(width / 2, touchXVal));
    const clampedY = Math.max(-height / 2, Math.min(height / 2, touchYVal));

    x.set(clampedX / width);
    y.set(clampedY / height);
  };

  const handleTouchEnd = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const handleCardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    SoundSynth.playPop();

    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 500);

    // Spawn a physical-feeling burst of particles at click position
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const colors = [
      "rgba(139, 92, 246, 0.85)", // Violet
      "rgba(236, 72, 153, 0.85)", // Fuchsia
      "rgba(245, 158, 11, 0.85)", // Amber
      "rgba(244, 63, 94, 0.85)",  // Rose
      "rgba(14, 165, 233, 0.85)", // Sky
    ];
    const newParticles = Array.from({ length: 12 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 6, // 6px to 14px
      x: clickX,
      y: clickY,
      scale: Math.random() * 0.4 + 0.8,
      rotate: Math.random() * 360 - 180,
      velocityUp: Math.random() * 80 + 100,
      velocitySide: Math.random() * 160 - 80,
    }));
    setParticles((prev) => [...prev, ...newParticles].slice(-40));
  };

  // Synchronize audio mute state on mount
  useEffect(() => {
    setIsMuted(SoundSynth.getMuteStatus());
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }} 
      transition={{ duration: 0.2 }}
      className="max-w-2xl mx-auto py-12 text-center"
    >
      <div className="mb-6 flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-white rounded-3xl p-3 shadow-md flex items-center justify-center border border-indigo-100/50 mb-3 relative overflow-hidden">
          <img
            src={getPublicAssetUrl("/學校圖檔/學校logo/school_logo.png")}
            alt="天主教善導小學 校徽"
            className="w-20 h-24 object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
              const parent = (e.target as HTMLElement).parentElement;
              if (parent) {
                const iconHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.91a2 2 0 0 0 1.66 0z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>`;
                parent.innerHTML = iconHTML;
              }
            }}
          />
        </div>
        <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3.5 py-1 rounded-full text-xs font-black tracking-wide shadow-3xs">
          <span>校訓：仁愛、忍耐 • Charity & Patience</span>
        </div>
      </div>
      <h2 className="text-3xl font-black text-[#0F172A] tracking-tight mb-3">健康、安心。從聆聽每一個心聲開始</h2>
      <p className="text-slate-500 mb-8 max-w-lg mx-auto text-sm font-semibold leading-relaxed">
        歡迎來到 <b>天主教善導小學</b>「心情加油站」。本系統專門為本校學生及教職員團隊設計。學生每天登記心情，教師可即時掌握情緒動態，落實校園 <b>「信、望、愛」</b> 精神，共創充滿關愛和安全的校園。
      </p>

      {/* 2.5D INTERACTIVE MASCOT CARD & CONTROLS */}
      <div className="mb-10 max-w-sm mx-auto space-y-4">
        <div 
          className="relative w-full max-w-[340px] h-[460px] mx-auto"
          style={{ perspective: "1000px" }}
        >
          {/* Specular Backlight Ambient Parallax Glow */}
          <motion.div 
            className="absolute -inset-6 rounded-[48px] bg-gradient-to-tr from-violet-500/20 via-fuchsia-500/25 to-amber-400/20 blur-2xl pointer-events-none z-[-1]"
            style={{
              x: useTransform(x, [-0.5, 0.5], [20, -25]),
              y: useTransform(y, [-0.5, 0.5], [20, -25]),
              opacity: isHovered ? 0.85 : 0,
              scale: isHovered ? 1.05 : 0.9,
            }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />

          <motion.div
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            onTouchStart={() => setIsHovered(true)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleCardClick}
            whileTap={{ scale: 0.98 }}
            style={{ 
              rotateX, 
              rotateY, 
              boxShadow,
              transformStyle: "preserve-3d" as const 
            }}
            className="relative w-full h-full rounded-[32px] p-6 bg-gradient-to-br from-violet-50/90 to-fuchsia-50/90 border-2 border-violet-100 transition-all duration-300 flex flex-col items-center justify-between overflow-hidden select-none cursor-pointer"
          >
            {/* Background grid depth layer */}
            <motion.div 
              className="absolute inset-0 pointer-events-none z-0 opacity-15"
              style={{
                x: bgX,
                y: bgY,
                backgroundImage: "radial-gradient(circle, #8b5cf6 1.5px, transparent 1.5px)",
                backgroundSize: "20px 20px"
              }}
            />

            {/* Decorative Depth Halo */}
            <motion.div 
              className="absolute w-44 h-44 rounded-full bg-gradient-to-tr from-violet-300/25 via-fuchsia-300/25 to-amber-200/25 blur-xl pointer-events-none z-0"
              style={{
                x: bgX,
                y: bgY,
                top: "30%",
                left: "25%"
              }}
              animate={{
                rotate: [0, 180, 360],
                scale: [1, 1.12, 0.92, 1.08, 1],
              }}
              transition={{
                rotate: { duration: 16, repeat: Infinity, ease: "linear" },
                scale: { duration: 5.5, repeat: Infinity, ease: "easeInOut" }
              }}
            />

            {/* Dynamic Holographic Glare Sheen */}
            <motion.div 
              className="absolute inset-0 pointer-events-none z-30"
              style={{
                background: useTransform(
                  [glareX, glareY],
                  ([gx, gy]) => `radial-gradient(circle 240px at ${gx}% ${gy}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 80%)` as string
                ),
                mixBlendMode: "overlay" as const
              }}
            />

            {/* Floating Hearts & Sparkles Parallax Layers */}
            <motion.div 
              className="absolute top-12 left-10 text-red-500 z-20 drop-shadow-md pointer-events-none"
              style={{ x: useTransform(heartX, hx => hx * 0.8), y: useTransform(heartY, hy => hy * 0.8) }}
            >
              <Heart className="w-6 h-6 fill-red-500 text-red-500 animate-bounce" style={{ animationDuration: '3s' }} />
            </motion.div>

            {/* Speaker / Mute Toggle Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newMute = SoundSynth.toggleMute();
                setIsMuted(newMute);
                if (!newMute) {
                  SoundSynth.playPop();
                }
              }}
              type="button"
              className="absolute top-4 right-4 z-40 bg-white/70 hover:bg-white border border-violet-200/50 hover:border-violet-300 rounded-full w-8 h-8 flex items-center justify-center shadow-3xs cursor-pointer transition-all duration-200 focus:outline-none"
              title={isMuted ? "取消靜音" : "靜音"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-slate-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-violet-600 animate-pulse" />
              )}
            </button>

            {/* Top Interactive Indicator */}
            <div className="z-10 flex flex-col items-center gap-1">
              <div className="inline-flex items-center gap-1.5 bg-violet-600/10 backdrop-blur-xs px-3 py-1 rounded-full border border-violet-200/50 shadow-3xs text-[10px] font-black text-violet-700">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-violet-500" />
                <span>今日校園大使</span>
              </div>
            </div>

            <motion.div 
              className="absolute top-28 right-8 text-amber-400 z-20 drop-shadow-[0_2px_4px_rgba(251,191,36,0.3)] pointer-events-none"
              style={{ x: useTransform(heartX, hx => hx * 1.4), y: useTransform(heartY, hy => hy * 1.4) }}
            >
              <Sparkles className="w-5 h-5 fill-amber-400 text-amber-400 animate-pulse" style={{ animationDuration: '2s' }} />
            </motion.div>

            <motion.div 
              className="absolute bottom-20 right-8 text-red-500 z-20 drop-shadow-md pointer-events-none"
              style={{ x: useTransform(heartX, hx => hx * 1.2), y: useTransform(heartY, hy => hy * 1.2) }}
            >
              <Heart className="w-5 h-5 fill-red-500 text-red-500 animate-bounce" style={{ animationDuration: '2.5s' }} />
            </motion.div>

            <motion.div 
              className="absolute bottom-36 left-8 text-amber-300 z-10 drop-shadow-[0_1px_3px_rgba(251,191,36,0.2)] pointer-events-none"
              style={{ x: useTransform(heartX, hx => hx * 0.4), y: useTransform(heartY, hy => hy * 0.4) }}
            >
              <Sparkles className="w-4 h-4 fill-amber-300 text-amber-300 animate-pulse" style={{ animationDuration: '3s' }} />
            </motion.div>

            <motion.div 
              className="absolute top-1/2 right-12 text-red-500 z-20 drop-shadow-md pointer-events-none"
              style={{ x: useTransform(heartX, hx => hx * 0.6), y: useTransform(heartY, hy => hy * 0.6) }}
            >
              <Heart className="w-4 h-4 fill-red-500 text-red-500 animate-bounce" style={{ animationDuration: '4s' }} />
            </motion.div>


            {/* Character Mascot Layer */}
            <SkeletalXinXin 
              isWiggling={isWiggling} 
              mascotX={mascotX} 
              mascotY={mascotY} 
              mouseX={x}
              mouseY={y}
              isHovered={isHovered}
              eyeState={eyeState}
            />

            {/* Click CTA Indicator */}
            <div className="z-10 bg-white/80 backdrop-blur-xs px-4 py-2 rounded-2xl border border-violet-100 shadow-3xs text-xs font-black text-violet-700 transition-colors hover:bg-white">
              <span>點擊與我互動</span>
            </div>
          </motion.div>

          {/* Physical Particle Burst Layer (with premium parabolic gravity physics) */}
          <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden rounded-[32px]">
            <AnimatePresence>
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ 
                    opacity: 1, 
                    scale: 0.2, 
                    x: p.x, 
                    y: p.y, 
                    rotate: 0 
                  }}
                  animate={{ 
                    opacity: [1, 1, 0], 
                    scale: [0.2, p.scale, 0], 
                    x: [p.x, p.x + p.velocitySide * 0.4, p.x + p.velocitySide], 
                    y: [p.y, p.y - p.velocityUp, p.y - p.velocityUp + 220], 
                    rotate: [0, p.rotate] 
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    duration: 1.6, 
                    times: [0, 0.4, 1],
                    ease: ["easeOut", "easeIn"]
                  }}
                  className="absolute pointer-events-none filter drop-shadow-md select-none"
                  style={{
                    width: p.size,
                    height: p.size,
                    borderRadius: "50%",
                    backgroundColor: p.color,
                  }}
                  onAnimationComplete={() => {
                    setParticles((prev) => prev.filter((item) => item.id !== p.id));
                  }}
                />
              ))}
            </AnimatePresence>
          </div>

        </div>


      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* STUDENT ELEMENT */}
        <motion.button
          whileHover={{ y: -6, scale: 1.015, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.06), 0 8px 10px -6px rgba(0,0,0,0.06)" }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          id="portal-student"
          onClick={() => setViewState('STUDENT_LOGIN')}
          className="group flex flex-col items-center p-8 bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl shadow-sm text-center cursor-pointer text-slate-800"
        >
          <div className="w-20 h-20 bg-indigo-50 group-hover:bg-indigo-100 rounded-full mb-4 overflow-hidden border-2 border-indigo-200/50 group-hover:border-indigo-400 transition-all flex items-center justify-center p-1">
            <img 
              src={encodeURI("/學校圖檔/學生/student_img-01.png")} 
              alt="GCCPS 學生" 
              className="w-16 h-16 object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
                const parent = (e.target as HTMLElement).parentElement;
                if (parent) {
                  parent.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
                }
              }}
            />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A] mb-1">我是學生 (Student)</h3>
          <p className="text-xs text-slate-500 mb-4 max-w-xs leading-relaxed">
            小四至小六及測試生輸入每日心情指數和留言。小一至小三無須到此登記。
          </p>
          <span className="bg-indigo-600 text-white font-bold text-xs px-4 py-2 rounded-xl group-hover:scale-105 transition-all flex items-center gap-1">
            前往學生登記處
          </span>
        </motion.button>

        {/* TEACHER ELEMENT */}
        <motion.button
          whileHover={{ y: -6, scale: 1.015, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.06), 0 8px 10px -6px rgba(0,0,0,0.06)" }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          id="portal-teacher"
          onClick={() => setViewState('TEACHER_LOGIN')}
          className="group flex flex-col items-center p-8 bg-white border border-slate-200 hover:border-amber-300 rounded-2xl shadow-sm text-center cursor-pointer text-slate-800"
        >
          <div className="w-20 h-20 bg-amber-50 group-hover:bg-amber-100 rounded-full mb-4 overflow-hidden border-2 border-amber-200/50 group-hover:border-amber-400 transition-all flex items-center justify-center p-1">
            <img 
              src={encodeURI("/學校圖檔/吉祥物/些些_correct.png")} 
              alt="GCCPS 吉祥物" 
              className="w-16 h-16 object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
                const parent = (e.target as HTMLElement).parentElement;
                if (parent) {
                  parent.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-600"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10M6 10h10"/></svg>`;
                }
              }}
            />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A] mb-1">我是教師 (Teacher)</h3>
          <p className="text-xs text-slate-500 mb-4 max-w-xs leading-relaxed">
            老師登入專屬班級進行數據批次輸入（小一至小三）或進行全校情緒安全看板監控（小四至小六）。
          </p>
          <span className="bg-amber-600 group-hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1">
            進入教育管理端
          </span>
        </motion.button>

      </div>

      <div className="mt-16 bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4 text-left max-w-lg mx-auto">
        <Shield className="w-10 h-10 text-emerald-500 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-sm text-slate-800">全程資訊加密傳輸</h4>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            本系統與 Firestore 進行極速即時同步。所有文字安全演算法由本地加密解析，確保孩子們的言談敏感資料完全符合隱私條例。您可以點此閱讀本平台的「<button type="button" onClick={() => setPrivacyModalVisible(true)} className="text-emerald-600 font-bold underline hover:text-emerald-700 cursor-pointer focus:outline-none bg-transparent border-none p-0">核心隱私政策與安全權益保障聲明</button>」。
          </p>
        </div>
      </div>
    </motion.div>
  );
}
