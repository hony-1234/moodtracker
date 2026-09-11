/**
 * Mascot Costume Wardrobe for 天主教善導小學 (GCCPS) 恩恩 (En-en)
 * Provides random costume selection upon entering the website and interactive costume switching.
 */

export interface MascotCostume {
  id: string;
  name: string;
  tag: string;
  imagePath: string;
  speech: string;
  accentGlow: string;
  badgeBg: string;
  sparkleEmoji: string;
}

export const MASCOT_COSTUMES: MascotCostume[] = [
  {
    id: 'classic',
    name: '經典校服',
    tag: '💛 經典麥餅聖經',
    imagePath: '/學校圖檔/吉祥物/enen_grat_bread_bible.png',
    speech: '我是恩恩！手握五餅二魚與聖經，點我前往學生積點獎勵系統 ↗',
    accentGlow: 'bg-yellow-300/40',
    badgeBg: 'bg-amber-500 text-white',
    sparkleEmoji: '✨',
  },
  {
    id: 'scientist',
    name: '小小科學家',
    tag: '🧪 求真探索',
    imagePath: '/學校圖檔/吉祥物/costumes/enen_scientist.png',
    speech: '我是科學家恩恩！正在調配感恩與快樂試劑，點我前往積點系統 🧪',
    accentGlow: 'bg-cyan-300/45',
    badgeBg: 'bg-teal-600 text-white',
    sparkleEmoji: '🔬',
  },
  {
    id: 'astronaut',
    name: '太空探險家',
    tag: '🚀 浩瀚星空',
    imagePath: '/學校圖檔/吉祥物/costumes/enen_astronaut.png',
    speech: '我是太空恩恩！帶著愛與麥餅漫遊宇宙，點我前往積點系統 🚀',
    accentGlow: 'bg-indigo-300/45',
    badgeBg: 'bg-indigo-600 text-white',
    sparkleEmoji: '⭐',
  },
  {
    id: 'chef',
    name: '愛心小廚師',
    tag: '🥐 溫暖烘焙',
    imagePath: '/學校圖檔/吉祥物/costumes/enen_chef.png',
    speech: '我是小廚師恩恩！熱騰騰的感恩香氣出爐囉，點我前往積點系統 🥐',
    accentGlow: 'bg-amber-300/45',
    badgeBg: 'bg-orange-500 text-white',
    sparkleEmoji: '🥖',
  },
  {
    id: 'artist',
    name: '創意小畫家',
    tag: '🎨 揮灑色彩',
    imagePath: '/學校圖檔/吉祥物/costumes/enen_artist.png',
    speech: '我是小畫家恩恩！為每一天彩繪繽紛色彩，點我前往積點系統 🎨',
    accentGlow: 'bg-pink-300/45',
    badgeBg: 'bg-rose-500 text-white',
    sparkleEmoji: '🌈',
  },
  {
    id: 'sports',
    name: '活力小健將',
    tag: '🏀 元氣運動',
    imagePath: '/學校圖檔/吉祥物/costumes/enen_sports.png',
    speech: '我是運動恩恩！活力滿分一起動起來，點我前往積點系統 🏀',
    accentGlow: 'bg-amber-300/45',
    badgeBg: 'bg-amber-600 text-white',
    sparkleEmoji: '⚡',
  },
  {
    id: 'detective',
    name: '好奇小偵探',
    tag: '🔍 觀察感恩',
    imagePath: '/學校圖檔/吉祥物/costumes/enen_detective.png',
    speech: '我是小偵探恩恩！發現今天身邊充滿了美好恩典，點我前往積點系統 🔍',
    accentGlow: 'bg-amber-400/40',
    badgeBg: 'bg-yellow-700 text-white',
    sparkleEmoji: '🔎',
  },
  {
    id: 'musician',
    name: '聖樂小天使',
    tag: '🎵 讚美聖樂',
    imagePath: '/學校圖檔/吉祥物/costumes/enen_musician.png',
    speech: '我是聖樂恩恩！彈奏讚美與感恩的悠揚音符，點我前往積點系統 🎵',
    accentGlow: 'bg-indigo-300/45',
    badgeBg: 'bg-indigo-700 text-white',
    sparkleEmoji: '🎵',
  },
  {
    id: 'gardener',
    name: '綠意小園丁',
    tag: '🌱 愛心灌溉',
    imagePath: '/學校圖檔/吉祥物/costumes/enen_gardener.png',
    speech: '我是園丁恩恩！細心澆灌善念小種子，看它開花結果囉，點我前往積點系統 🌱',
    accentGlow: 'bg-emerald-300/45',
    badgeBg: 'bg-emerald-700 text-white',
    sparkleEmoji: '🌻',
  },
  {
    id: 'reading',
    name: '書香悅讀家',
    tag: '📚 沉浸閱讀',
    imagePath: '/學校圖檔/吉祥物/costumes/enen_reading.png',
    speech: '我是悅讀恩恩！打開書本漫遊知識天地，點我前往積點系統 📚',
    accentGlow: 'bg-amber-300/45',
    badgeBg: 'bg-amber-800 text-white',
    sparkleEmoji: '✨',
  },
  {
    id: 'doctor',
    name: '愛心小醫生',
    tag: '🩺 溫暖療癒',
    imagePath: '/學校圖檔/吉祥物/costumes/enen_doctor.png',
    speech: '我是小醫生恩恩！送你滿滿的溫暖與快樂處方籤，點我前往積點系統 🩺',
    accentGlow: 'bg-teal-300/45',
    badgeBg: 'bg-teal-700 text-white',
    sparkleEmoji: '💖',
  },
  {
    id: 'scout',
    name: '愛心小童軍',
    tag: '🏕️ 探索奉獻',
    imagePath: '/學校圖檔/吉祥物/costumes/enen_scout.png',
    speech: '我是童軍恩恩！日行一善、熱心助人，點我前往積點系統 🏕️',
    accentGlow: 'bg-green-300/45',
    badgeBg: 'bg-emerald-800 text-white',
    sparkleEmoji: '⭐',
  },
  {
    id: 'graduate',
    name: '榮譽學士恩恩',
    tag: '🎓 榮譽成長',
    imagePath: '/學校圖檔/吉祥物/costumes/enen_graduate.png',
    speech: '我是畢業榮譽恩恩！努力耕耘必歡呼收割，點我前往積點系統 🎓',
    accentGlow: 'bg-amber-300/45',
    badgeBg: 'bg-amber-600 text-white',
    sparkleEmoji: '🎓',
  },
  {
    id: 'tea',
    name: '奉茶小天使',
    tag: '🍵 溫馨款待',
    imagePath: '/學校圖檔/吉祥物/costumes/enen_tea.png',
    speech: '我是款待恩恩！奉上一杯暖胃又暖心的感恩茶，點我前往積點系統 🍵',
    accentGlow: 'bg-rose-200/45',
    badgeBg: 'bg-rose-600 text-white',
    sparkleEmoji: '☕',
  },
  {
    id: 'gift',
    name: '暖心恩典禮物',
    tag: '🎁 恩典分享',
    imagePath: '/學校圖檔/吉祥物/costumes/enen_gift.png',
    speech: '我是恩典恩恩！把愛與祝福化為禮物分享給你，點我前往積點系統 🎁',
    accentGlow: 'bg-teal-300/45',
    badgeBg: 'bg-teal-600 text-white',
    sparkleEmoji: '🎀',
  },
];

/**
 * Returns a random mascot costume from the wardrobe.
 * If excludeId is provided, returns a different costume.
 */
export function getRandomCostume(excludeId?: string): MascotCostume {
  const candidates = excludeId 
    ? MASCOT_COSTUMES.filter(c => c.id !== excludeId)
    : MASCOT_COSTUMES;
  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index] || MASCOT_COSTUMES[0];
}

/**
 * Get costume by ID with fallback to classic
 */
export function getCostumeById(id?: string | null): MascotCostume {
  if (!id) return MASCOT_COSTUMES[0];
  return MASCOT_COSTUMES.find(c => c.id === id) || MASCOT_COSTUMES[0];
}

const LAST_COSTUME_KEY = 'gccps_last_mascot_costume_id';
const CURRENT_SESSION_KEY = 'gccps_mascot_costume_id';

let currentCostumeInstance: MascotCostume | null = null;

/**
 * Initializes or switches the costume upon page load / refresh.
 * It is guaranteed to switch to a different costume than the last one displayed before refresh!
 */
export function switchCostumeOnPageRefresh(): MascotCostume {
  let lastId: string | null = null;
  try {
    lastId = localStorage.getItem(LAST_COSTUME_KEY) || sessionStorage.getItem(CURRENT_SESSION_KEY);
  } catch {}

  // Guarantee switching to a different costume from the previous one
  const next = getRandomCostume(lastId || undefined);
  currentCostumeInstance = next;

  try {
    localStorage.setItem(LAST_COSTUME_KEY, next.id);
    sessionStorage.setItem(CURRENT_SESSION_KEY, next.id);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gccps:costume-changed', { detail: next }));
    }
  } catch {}

  return next;
}

/**
 * Gets the current active costume.
 * When the page is first loaded or refreshed, this automatically switches
 * to a fresh different costume!
 */
export function getActiveCostume(): MascotCostume {
  if (currentCostumeInstance) {
    return currentCostumeInstance;
  }
  return switchCostumeOnPageRefresh();
}

/**
 * Sets a specific costume and notifies all listening components.
 */
export function setActiveCostume(costume: MascotCostume) {
  currentCostumeInstance = costume;
  try {
    localStorage.setItem(LAST_COSTUME_KEY, costume.id);
    sessionStorage.setItem(CURRENT_SESSION_KEY, costume.id);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gccps:costume-changed', { detail: costume }));
    }
  } catch {}
}

