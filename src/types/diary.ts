export interface FourRsScores {
  rest: number;         // 1-5 (睡眠充足度)
  relaxation: number;   // 1-5 (身心放鬆度)
  relationship: number; // 1-5 (同儕/家庭人際和諧度)
  resilience: number;   // 1-5 (抗逆力與面對挑戰勇氣)
}

export type RiskLevel = 'NORMAL' | 'ATTENTION' | 'CRITICAL';

export interface DiaryAiAnalysis {
  sentimentScore: number;          // 1 (低落) ~ 5 (極佳)
  primaryEmotion: string;          // 例如：感恩、喜悅、平靜、焦慮、沮喪、期待
  secondaryEmotions: string[];     // 其他情緒特徵
  fourRs: FourRsScores;            // 4Rs 評分
  summary: string;                 // 20-30 字精華摘要
  keyThemes: string[];             // 核心標籤，如：學業壓力、家庭生活、友誼相處
  riskLevel: RiskLevel;            // 安全預警等級
  safetyFlags: string[];           // 潛在警示（如無則為空）
  mascotFeedback: string;          // 信信或恩恩的溫馨回饋金句
  analyzedAt: string;              // ISO 時間戳
}

export interface StudentDiaryEntry {
  id: string;                      // 唯一識別碼
  studentNumber: string;           // 格式如 "4A12" 或 "12"
  studentName?: string;            // 學生姓名
  class: string;                   // 班別如 "4A"
  cycleNumber: number;             // 循環週編號 (例如 2, 4, 6...)
  cycleLabel?: string;             // 例如 "Cycle 1-2" 或 "Cycle 3-4"
  submissionDate: string;          // 日期字串 YYYY-MM-DD
  scanImageUrl?: string;           // 手寫掃描原稿圖片 (DataURL 或 Storage URL)
  transcribedText: string;         // AI OCR 辨識出之手寫全文
  selfReportedWeather?: 'sunny' | 'cloudy' | 'rainy' | 'storm' | 'windy'; // 學生自評天氣
  selfReported4RFocus?: 'rest' | 'relaxation' | 'relationship' | 'resilience'; // 學生自選 4R 焦點
  aiAnalysis: DiaryAiAnalysis;     // AI 多模態分析數據
  verifiedByTeacher: boolean;      // 教師是否已校對
  teacherNotes?: string;           // 班主任/輔導老師專屬備註
  teacherSticker?: 'star' | 'heart' | 'thumb' | 'sparkle'; // 老師愛心蓋印
  createdAt: string;               // 建立時間 ISO
  updatedAt: string;               // 更新時間 ISO
}

export interface DiaryCycleConfig {
  cycleNumber: number;
  label: string;                   // 如 "第 1-2 循環週"
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface StudentProfile {
  studentNumber: string;           // "4A12"
  class: string;                   // "4A"
  classNumber: number;             // 12
  name: string;                    // "陳大文"
  email?: string;                  // "chan.tai.man@gccps.edu.hk"
  gmailLinked: boolean;            // 是否已綁定 Google 帳號
}
