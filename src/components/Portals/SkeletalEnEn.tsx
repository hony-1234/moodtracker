import React from 'react';
import { motion, useTransform, useSpring } from 'motion/react';
import { getPublicAssetUrl } from '../../utils/assetHelper';

export type EyeState = 
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

export interface SkeletalEnEnProps {
  isWiggling: boolean;
  mascotX: any;
  mascotY: any;
  mouseX: any;
  mouseY: any;
  isHovered: boolean;
  eyeState: EyeState;
}

const MASCOT_VERSION = "1";

export const SkeletalEnEn: React.FC<SkeletalEnEnProps> = ({
  isWiggling,
  mascotX,
  mascotY,
  mouseX,
  mouseY,
  isHovered,
  eyeState
}) => {
  // Cursor tracking spring offsets for 2.5D depth parallax
  const rawEyeOffsetX = useTransform(mouseX, [-0.5, 0.5], [-3.5, 3.5]);
  const rawEyeOffsetY = useTransform(mouseY, [-0.5, 0.5], [-2.5, 2.5]);
  const eyeOffsetX = useSpring(rawEyeOffsetX, { stiffness: 160, damping: 18 });
  const eyeOffsetY = useSpring(rawEyeOffsetY, { stiffness: 160, damping: 18 });

  // Wing depth parallax (wings behind body shift slightly opposite to mouse)
  const wingsX = useSpring(useTransform(mouseX, [-0.5, 0.5], [6, -6]), { stiffness: 140, damping: 18 });
  const wingsY = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), { stiffness: 140, damping: 18 });

  // Body & Head parallax (shifts in cursor direction)
  const bodyX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-3, 3]), { stiffness: 150, damping: 18 });
  const bodyY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-2.5, 2.5]), { stiffness: 150, damping: 18 });
  const bodyRotate = useSpring(useTransform(mouseX, [-0.5, 0.5], [-3, 3]), { stiffness: 150, damping: 18 });

  // Halo floating parallax
  const haloX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), { stiffness: 130, damping: 16 });
  const haloY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-4, 4]), { stiffness: 130, damping: 16 });

  // Left Eye Animation Configuration (Original Hand-Drawn Eyes)
  const getLeftEyeAnimate = () => {
    if (isWiggling) {
      if (eyeState === 'happy' || eyeState === 'wink_happy' || eyeState === 'love') {
        return { scaleY: 0.25, scaleX: 1.25, x: 0, y: 1, rotate: 0 };
      }
      if (eyeState === 'surprised') {
        return { scale: 1.35, x: 0, y: -2, rotate: 0 };
      }
      if (eyeState === 'star') {
        return { scale: 1.25, x: 0, y: -1, rotate: 0 };
      }
      if (eyeState === 'dizzy') {
        return { scale: 1.0, x: 1, y: 1, rotate: -35 };
      }
    }
    switch (eyeState) {
      case 'wink_left':
        return { scaleY: 0.1, scaleX: 1.1, x: 0, y: 0, rotate: 0 };
      case 'wink_right':
        return { scaleY: 1.0, scaleX: 1.0, x: 0, y: 0, rotate: 0 };
      case 'look_left':
        return { scaleY: 1.0, scaleX: 1.0, x: -3, y: 0, rotate: 0 };
      case 'look_right':
        return { scaleY: 1.0, scaleX: 1.0, x: 3, y: 0, rotate: 0 };
      case 'look_up':
        return { scaleY: 1.0, scaleX: 1.0, x: 0, y: -2.5, rotate: 0 };
      case 'look_down':
        return { scaleY: 1.0, scaleX: 1.0, x: 0, y: 2.5, rotate: 0 };
      case 'happy':
        return { scaleY: 0.25, scaleX: 1.25, x: 0, y: 1, rotate: 0 };
      case 'surprised':
        return { scale: 1.35, x: 0, y: -2, rotate: 0 };
      case 'dizzy':
        return { scale: 1.0, x: 1, y: 1, rotate: -35 };
      case 'love':
        return { scaleY: 0.25, scaleX: 1.25, x: 0, y: 1, rotate: 0 };
      case 'star':
        return { scale: 1.25, x: 0, y: -1, rotate: 0 };
      case 'thinking':
        return { scaleY: 0.4, scaleX: 1.1, x: -2, y: 2, rotate: 0 };
      case 'worried':
        return { scaleY: 0.85, scaleX: 0.95, x: 1, y: 1.5, rotate: 15 };
      case 'wink_happy':
        return { scaleY: 0.25, scaleX: 1.25, x: 0, y: 1, rotate: 0 };
      case 'sleeping':
        return { scaleY: 0.1, scaleX: 1.0, x: 0, y: 2, rotate: 0 };
      case 'normal':
      default:
        return { scaleY: 1.0, scaleX: 1.0, x: 0, y: 0, rotate: 0 };
    }
  };

  // Right Eye Animation Configuration (Original Hand-Drawn Eyes)
  const getRightEyeAnimate = () => {
    if (isWiggling) {
      if (eyeState === 'happy' || eyeState === 'love') {
        return { scaleY: 0.25, scaleX: 1.25, x: 0, y: 1, rotate: 0 };
      }
      if (eyeState === 'surprised') {
        return { scale: 1.35, x: 0, y: -2, rotate: 0 };
      }
      if (eyeState === 'star') {
        return { scale: 1.25, x: 0, y: -1, rotate: 0 };
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
        return { scaleY: 1.0, scaleX: 1.0, x: -3, y: 0, rotate: 0 };
      case 'look_right':
        return { scaleY: 1.0, scaleX: 1.0, x: 3, y: 0, rotate: 0 };
      case 'look_up':
        return { scaleY: 1.0, scaleX: 1.0, x: 0, y: -2.5, rotate: 0 };
      case 'look_down':
        return { scaleY: 1.0, scaleX: 1.0, x: 0, y: 2.5, rotate: 0 };
      case 'happy':
        return { scaleY: 0.25, scaleX: 1.25, x: 0, y: 1, rotate: 0 };
      case 'surprised':
        return { scale: 1.35, x: 0, y: -2, rotate: 0 };
      case 'dizzy':
        return { scale: 1.0, x: -1, y: 1, rotate: 35 };
      case 'love':
        return { scaleY: 0.25, scaleX: 1.25, x: 0, y: 1, rotate: 0 };
      case 'star':
        return { scale: 1.25, x: 0, y: -1, rotate: 0 };
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
        return { scaleY: 1.0, scaleX: 1.0, x: 0, y: 0, rotate: 0 };
    }
  };

  const eyeSpringTransition = { type: "spring", stiffness: 240, damping: 15 };

  return (
    <motion.div 
      className="relative select-none pointer-events-none mb-4"
      style={{
        width: '240px',
        height: '260px',
        transformStyle: 'preserve-3d',
        perspective: 1000
      }}
      animate={isWiggling ? {
        scale: [1, 1.08, 0.96, 1.05, 1],
        y: [0, -14, 2, -6, 0],
        rotate: [0, -6, 5, -3, 0]
      } : isHovered ? {
        scale: 1.04,
        y: -6,
        rotate: [0, -1.5, 1.5, 0]
      } : {
        scale: 1,
        y: [0, -6, 0],
        rotate: [-1.2, 1.2, -1.2]
      }}
      transition={isWiggling ? {
        duration: 0.65,
        ease: "easeInOut"
      } : isHovered ? {
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut"
      } : {
        duration: 3.2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* 0. GROUND CONTACT SHADOW */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-full w-full pointer-events-none"
        style={{ zIndex: 1 }}
        animate={{
          scaleX: isWiggling ? [1, 0.8, 1.1, 0.9, 1] : isHovered ? [0.92, 0.96, 0.92] : [1, 0.93, 1],
          opacity: isWiggling ? [0.8, 0.5, 0.9, 0.6, 0.8] : isHovered ? 0.7 : [0.85, 0.65, 0.85]
        }}
        transition={{
          duration: isWiggling ? 0.65 : isHovered ? 1.2 : 3.2,
          repeat: isWiggling ? 0 : Infinity,
          ease: "easeInOut"
        }}
      >
        <img 
          src={getPublicAssetUrl(`/學校圖檔/吉祥物/enen_shadow.png?v=${MASCOT_VERSION}`)}
          alt="恩恩陰影"
          className="w-full h-full object-contain pointer-events-none"
        />
      </motion.div>

      {/* 1. LEFT WING (FLAPPING WITH ROOT PIVOT) */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 5,
          x: wingsX,
          y: wingsY,
          transformOrigin: "25.4% 45.0%" // Left wing root attachment point
        }}
        animate={isWiggling ? {
          rotate: [-15, 24, -18, 20, 0],
          scale: [1, 1.12, 0.95, 1.08, 1]
        } : isHovered ? {
          rotate: [-14, 20, -14],
          scale: [1, 1.08, 1]
        } : {
          rotate: [-6, 12, -6],
          scale: [1, 1.04, 1]
        }}
        transition={{
          duration: isWiggling ? 0.45 : isHovered ? 0.6 : 1.8,
          repeat: isWiggling ? 1 : Infinity,
          ease: "easeInOut"
        }}
      >
        <img 
          src={getPublicAssetUrl(`/學校圖檔/吉祥物/enen_left_wing.png?v=${MASCOT_VERSION}`)}
          alt="恩恩左翼"
          className="w-full h-full object-contain pointer-events-none filter drop-shadow-sm"
        />
      </motion.div>

      {/* 2. RIGHT WING (FLAPPING WITH ROOT PIVOT) */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 5,
          x: wingsX,
          y: wingsY,
          transformOrigin: "74.5% 45.0%" // Right wing root attachment point
        }}
        animate={isWiggling ? {
          rotate: [15, -24, 18, -20, 0],
          scale: [1, 1.12, 0.95, 1.08, 1]
        } : isHovered ? {
          rotate: [14, -20, 14],
          scale: [1, 1.08, 1]
        } : {
          rotate: [6, -12, 6],
          scale: [1, 1.04, 1]
        }}
        transition={{
          duration: isWiggling ? 0.45 : isHovered ? 0.6 : 1.8,
          repeat: isWiggling ? 1 : Infinity,
          ease: "easeInOut"
        }}
      >
        <img 
          src={getPublicAssetUrl(`/學校圖檔/吉祥物/enen_right_wing.png?v=${MASCOT_VERSION}`)}
          alt="恩恩右翼"
          className="w-full h-full object-contain pointer-events-none filter drop-shadow-sm"
        />
      </motion.div>

      {/* 3. BREAD SACRED RADIANCE (WARM GLOWING AURA) */}
      <motion.div
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
        style={{
          zIndex: 8,
          x: bodyX,
          y: bodyY
        }}
        animate={{
          scale: [0.94, 1.08, 0.94],
          opacity: [0.55, 0.95, 0.55]
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div 
          className="w-28 h-20 rounded-full bg-gradient-to-tr from-amber-300/40 via-yellow-200/50 to-orange-300/30 blur-md pointer-events-none"
          style={{ transform: 'translate(4px, 46px)' }}
        />
      </motion.div>

      {/* 4. MAIN BODY BASE (CONTOUR, HANDS, BREAD, FACE BG, SMILE) */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 10,
          x: bodyX,
          y: bodyY,
          rotate: bodyRotate
        }}
      >
        <img 
          src={getPublicAssetUrl(`/學校圖檔/吉祥物/enen_body_base.png?v=${MASCOT_VERSION}`)}
          alt="恩恩本體"
          className="w-full h-full object-contain pointer-events-none"
        />
      </motion.div>

      {/* 5. FLOATING HALO & HAT WITH GOLDEN CROSS */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 12,
          x: haloX,
          y: haloY
        }}
        animate={{
          y: [0, -4, 0],
          rotate: [-0.8, 0.8, -0.8]
        }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <img 
          src={getPublicAssetUrl(`/學校圖檔/吉祥物/enen_halo.png?v=${MASCOT_VERSION}`)}
          alt="恩恩光環"
          className="w-full h-full object-contain pointer-events-none"
        />
      </motion.div>

      {/* 6. LEFT EYE (AUTHENTIC ORIGINAL LIVE2D SKELETAL EYE) */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 20,
          x: eyeOffsetX,
          y: eyeOffsetY,
          transformOrigin: "42.5% 38.0%"
        }}
        animate={getLeftEyeAnimate()}
        transition={eyeSpringTransition}
      >
        <img 
          src={getPublicAssetUrl(`/學校圖檔/吉祥物/enen_left_eye.png?v=${MASCOT_VERSION}`)}
          alt="恩恩左眼"
          className="w-full h-full object-contain pointer-events-none"
        />
      </motion.div>

      {/* 7. RIGHT EYE (AUTHENTIC ORIGINAL LIVE2D SKELETAL EYE) */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 20,
          x: eyeOffsetX,
          y: eyeOffsetY,
          transformOrigin: "57.5% 38.0%"
        }}
        animate={getRightEyeAnimate()}
        transition={eyeSpringTransition}
      >
        <img 
          src={getPublicAssetUrl(`/學校圖檔/吉祥物/enen_right_eye.png?v=${MASCOT_VERSION}`)}
          alt="恩恩右眼"
          className="w-full h-full object-contain pointer-events-none"
        />
      </motion.div>

      {/* 10. HOVER / WIGGLE CELEBRATION SPARKLES */}
      {(isHovered || isWiggling) && (
        <motion.div
          className="absolute -top-4 -right-2 text-xl pointer-events-none"
          style={{ zIndex: 30 }}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: [1, 1.3, 1], rotate: [0, 15, -10, 0], y: [-2, -8, -2] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          ✨
        </motion.div>
      )}
      {(isHovered || isWiggling) && (
        <motion.div
          className="absolute -top-3 -left-2 text-lg pointer-events-none"
          style={{ zIndex: 30 }}
          initial={{ scale: 0, rotate: 20 }}
          animate={{ scale: [1, 1.2, 1], rotate: [0, -15, 10, 0], y: [-1, -6, -1] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
        >
          🍞
        </motion.div>
      )}
    </motion.div>
  );
};
