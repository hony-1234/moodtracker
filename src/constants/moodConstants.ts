export const ALL_CLASSES = [
  '1A','1B','1C','1D',
  '2A','2B','2C','2D',
  '3A','3B','3C','3D',
  '4A','4B','4C','4D',
  '5A','5B','5C','5D',
  '6A','6B','6C','6D',
  'GCCPS','TEST'
];

export interface MoodEmojiItem {
  emoji: string;
  desc: string;
  colorClass: string;
  textColor: string;
}

export const MOOD_EMOJIS: Record<number, MoodEmojiItem> = {
  1: { emoji: "😭", desc: "非常難過 / 極度焦慮", colorClass: "bg-red-50 hover:bg-red-100 border-red-200", textColor: "text-red-700" },
  2: { emoji: "😢", desc: "很傷心 / 孤單無助", colorClass: "bg-red-50 hover:bg-red-100 border-red-200", textColor: "text-red-600" },
  3: { emoji: "☹️", desc: "不開心 / 感到挫折", colorClass: "bg-orange-50 hover:bg-orange-100 border-orange-200", textColor: "text-orange-700" },
  4: { emoji: "😕", desc: "有些不適 / 壓力大", colorClass: "bg-orange-50 hover:bg-orange-100 border-orange-200", textColor: "text-orange-600" },
  5: { emoji: "😐", desc: "平常 / 一般 / 沒特別感覺", colorClass: "bg-amber-50 hover:bg-amber-100 border-amber-200", textColor: "text-amber-700" },
  6: { emoji: "🙂", desc: "還可以 / 還算平穩", colorClass: "bg-amber-50 hover:bg-amber-100 border-amber-200", textColor: "text-amber-600" },
  7: { emoji: "😊", desc: "心情挺好 / 輕鬆舒服", colorClass: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200", textColor: "text-emerald-700" },
  8: { emoji: "😄", desc: "很充實 / 開心愉快", colorClass: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200", textColor: "text-emerald-600" },
  9: { emoji: "😆", desc: "非常棒 / 活力滿滿", colorClass: "bg-teal-50 hover:bg-teal-100 border-teal-200", textColor: "text-teal-700" },
  10: { emoji: "🥰", desc: "超級幸福 / 滿滿感恩", colorClass: "bg-teal-50 hover:bg-teal-100 border-teal-200", textColor: "text-teal-600" },
};

export const getMoodColor = (val: string | number): string => {
  const v = parseFloat(val as string);
  if (v >= 6.5) return '#10B981'; // Green
  if (v < 4.5) return '#EF4444';  // Red
  return '#F59E0B';               // Yellow/Orange
};
