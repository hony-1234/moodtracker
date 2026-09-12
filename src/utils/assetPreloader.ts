/**
 * Immediate Asset Preloading Engine for 天主教善導小學 (GCCPS) 心情加油站
 * 
 * Ensures all scene transition assets (backdrops, gates, maps, classroom books,
 * character sprites, costumes, and audio) are immediately downloaded, pre-cached,
 * and decoded into GPU/RAM memory right upon app boot for instantaneous, zero-latency
 * scene transitions without broken image flashes.
 */

import { getPublicAssetUrl, getWebpUrl } from './assetHelper';
import { MASCOT_COSTUMES } from './mascotCostumes';

// Persistent in-memory references to prevent garbage collection of decoded textures
const preloadedImageCache = new Map<string, HTMLImageElement>();
let preloadedBgmAudio: HTMLAudioElement | null = null;
let isPreloadingInitiated = false;

/**
 * High-priority scene transition assets needed for smooth portal jumps
 */
export const CRITICAL_SCENE_ASSETS = [
  // Scene 1: Landing Scene & Sky
  '/學校圖檔/school_cartoon_backdrop.png',
  '/學校圖檔/學生/chibi_student_boy.png',
  '/學校圖檔/學生/chibi_student_girl.png',
  '/學校圖檔/教師/teacher_male.png',
  '/學校圖檔/教師/teacher_female.png',
  '/學校圖檔/學校logo/school_logo.png',
  '/學校圖檔/吉祥物/enen_grat_bread_bible.png',
  '/學校圖檔/吉祥物/enen_gift.png',
  '/學校圖檔/吉祥物/enen_clean_reassembled.png',
  '/學校圖檔/吉祥物/enen_warm_tea.png',
  '/學校圖檔/吉祥物/enen_bread_bible.png',

  // Skeletal EnEn Live2D Parts
  '/學校圖檔/吉祥物/enen_shadow.png',
  '/學校圖檔/吉祥物/enen_left_wing.png',
  '/學校圖檔/吉祥物/enen_right_wing.png',
  '/學校圖檔/吉祥物/enen_body_base.png',
  '/學校圖檔/吉祥物/enen_halo.png',
  '/學校圖檔/吉祥物/enen_hearts.png',
  '/學校圖檔/吉祥物/enen_left_eye.png',
  '/學校圖檔/吉祥物/enen_right_eye.png',

  // Scene 2: Student Login Gate Sequence & Campus Exploration Map
  '/學校圖檔/school_main_gate.png',
  '/學校圖檔/school_cartoon_map.png',
  '/學校圖檔/吉祥物/enen_reading.png',

  // Scene 3: Classroom Book Experience (Diary Entrance) & Hardcover Book
  '/學校圖檔/教室/classroom_cartoon_backdrop.png',
  '/學校圖檔/學生/cartoon_journal_cover.png',
  '/學校圖檔/吉祥物/enen_cheer.png',

  // Fallback backdrop
  '/學校圖檔/school_backdrop.jpg',
];

/**
 * Preloads a single image and triggers async off-thread decoding
 */
export function preloadSingleImage(path: string, preferWebp = true): Promise<void> {
  const url = preferWebp && path.endsWith('.png') ? getWebpUrl(path) : getPublicAssetUrl(path);

  if (preloadedImageCache.has(url)) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';

    img.onload = () => {
      preloadedImageCache.set(url, img);
      if ('decode' in img && typeof img.decode === 'function') {
        img.decode().then(resolve).catch(resolve);
      } else {
        resolve();
      }
    };

    img.onerror = () => {
      // In case WebP is unavailable or fails, try the fallback PNG
      if (preferWebp && path.endsWith('.png')) {
        const fallbackUrl = getPublicAssetUrl(path);
        const fallbackImg = new Image();
        fallbackImg.decoding = 'async';
        fallbackImg.onload = () => {
          preloadedImageCache.set(fallbackUrl, fallbackImg);
          resolve();
        };
        fallbackImg.onerror = () => resolve();
        fallbackImg.src = fallbackUrl;
      } else {
        resolve();
      }
    };

    img.src = url;
  });
}

/**
 * Preloads the background music stream immediately
 */
export function preloadAudioStream(path: string = '/audio/bgm.mp3'): Promise<void> {
  if (preloadedBgmAudio) return Promise.resolve();

  return new Promise((resolve) => {
    try {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = getPublicAssetUrl(path);
      audio.loop = true;
      audio.volume = 0.35;

      audio.oncanplaythrough = () => {
        preloadedBgmAudio = audio;
        (window as any).__gccps_preloaded_bgm = audio;
        resolve();
      };

      audio.onerror = () => resolve();
      audio.load();

      // Store globally so BackgroundMusic component can claim it immediately
      (window as any).__gccps_preloaded_bgm = audio;
      preloadedBgmAudio = audio;

      // Timeout fallback so audio loading never blocks UI
      setTimeout(resolve, 1500);
    } catch {
      resolve();
    }
  });
}

/**
 * Prefetches lazy route code chunks in the background right after startup
 */
export function prefetchRouteChunks(): void {
  const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 100));

  schedule(() => {
    import('../components/Dashboards/StudentDashboard/Index').catch(() => {});
    import('../components/Dashboards/TeacherDashboard/Index').catch(() => {});
    import('../components/Portals/ClassroomBatchBookExperience').catch(() => {});
    import('../components/Portals/StudentBookClosingAnimation').catch(() => {});
    import('../components/Common/Modals').catch(() => {});
  });
}

/**
 * Preload all critical assets with real-time percentage progress callback
 */
export async function preloadAllAssetsWithProgress(
  onProgress?: (percent: number, loaded: number, total: number) => void,
  minDuration = 1800
): Promise<void> {
  const costumeImagePaths = MASCOT_COSTUMES.map(c => c.imagePath);
  const allImagePaths = Array.from(new Set([...CRITICAL_SCENE_ASSETS, ...costumeImagePaths]));
  
  const totalItems = allImagePaths.length + 1; // +1 for Audio
  let loadedItems = 0;

  const notifyProgress = () => {
    if (onProgress) {
      const percent = Math.min(99, Math.round((loadedItems / totalItems) * 100));
      onProgress(percent, loadedItems, totalItems);
    }
  };

  // Start with initial pulse
  if (onProgress) onProgress(5, 0, totalItems);

  const minDurationPromise = new Promise(resolve => setTimeout(resolve, minDuration));

  // Asset download promises
  const imagePromises = allImagePaths.map(async (path) => {
    try {
      await preloadSingleImage(path, true);
    } catch {
      // Ignored
    } finally {
      loadedItems++;
      notifyProgress();
    }
  });

  const audioPromise = (async () => {
    try {
      await preloadAudioStream('/audio/bgm.mp3');
    } catch {
      // Ignored
    } finally {
      loadedItems++;
      notifyProgress();
    }
  })();

  // Maximum safety timeout of 5.5s so slow network never hangs
  const safetyTimeoutPromise = new Promise(resolve => setTimeout(resolve, 5500));

  await Promise.race([
    Promise.all([Promise.allSettled([...imagePromises, audioPromise]), minDurationPromise]),
    safetyTimeoutPromise
  ]);

  if (onProgress) {
    onProgress(100, totalItems, totalItems);
  }

  // Also prefetch chunks
  prefetchRouteChunks();
}

/**
 * Main Entry Point: Starts downloading ALL scene assets immediately in parallel
 */
export function startImmediateAssetPreload(): void {
  if (isPreloadingInitiated) return;
  isPreloadingInitiated = true;

  preloadAllAssetsWithProgress();
}

/**
 * Check if a specific asset path has been preloaded
 */
export function isAssetPreloaded(path: string): boolean {
  const webpUrl = getWebpUrl(path);
  const pngUrl = getPublicAssetUrl(path);
  return preloadedImageCache.has(webpUrl) || preloadedImageCache.has(pngUrl);
}
