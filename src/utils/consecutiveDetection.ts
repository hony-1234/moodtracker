import { findStudentByClassAndNumber, StudentRecord } from '../data/studentsRoster';

export interface ConsecutiveOptions {
  lowScoreThreshold?: number; // e.g. score <= 3 (default: 3)
  criticalScoreThreshold?: number; // e.g. score <= 2 (default: 2)
  minStreakDays?: number; // e.g. 3 consecutive days (default: 3)
  detectSevereDrop?: boolean; // detect >= 3 points drop (default: true)
  onlySchoolDays?: boolean; // only count school days: Monday-Friday (default: true)
  maxCalendarDaysGap?: number; // max calendar days allowed between consecutive submissions (default: 7 days)
}

export interface ConsecutiveLowMoodAlert {
  class: string;
  studentNo: string;
  chineseName: string;
  englishName: string;
  studentId: string;
  email: string;
  streakCount: number;
  dates: string[];
  scores: number[];
  comments: string[];
  type: 'consecutive_low' | 'severe_drop';
  urgency: 'high' | 'medium';
  description: string;
}

// Helper to extract timestamp in ms from report record
export const getEntryTimeMs = (r: any): number => {
  if (!r) return 0;
  if (r.timestamp) {
    if (typeof r.timestamp.toMillis === 'function') return r.timestamp.toMillis();
    if (typeof r.timestamp === 'number') return r.timestamp;
    if (r.timestamp.seconds) return r.timestamp.seconds * 1000;
  }
  if (r.submittedAt) {
    if (typeof r.submittedAt.toMillis === 'function') return r.submittedAt.toMillis();
    const parsed = new Date(r.submittedAt).getTime();
    if (!isNaN(parsed)) return parsed;
  }
  const dateStr = r.date || r.日期;
  if (dateStr) {
    const parsed = new Date(dateStr).getTime();
    if (!isNaN(parsed)) return parsed;
  }
  return 0;
};

// Helper to determine if an entry falls on a school day (Monday to Friday, 1..5)
export const isSchoolDay = (item: any): boolean => {
  const ms = getEntryTimeMs(item);
  let d: Date;
  if (ms > 0) {
    d = new Date(ms);
  } else {
    const dStr = getEntryDateStr(item);
    if (!dStr) return true;
    d = new Date(dStr);
  }
  if (isNaN(d.getTime())) return true;
  const day = d.getDay(); // 0 is Sunday, 6 is Saturday
  return day >= 1 && day <= 5;
};

// Helper to get formatted display date YYYY-MM-DD
export const getEntryDateStr = (r: any): string => {
  if (!r) return '';
  if (r.date) return String(r.date);
  if (r.日期) return String(r.日期);
  const ms = getEntryTimeMs(r);
  if (ms > 0) {
    const d = new Date(ms);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  return '';
};

/**
 * Robust detection of consecutive low mood scores and severe emotional drops.
 * Evaluates by sequential submissions across school calendar (not blocked by weekends).
 */
export function detectConsecutiveLowMood(
  reports: any[],
  options: ConsecutiveOptions = {}
): ConsecutiveLowMoodAlert[] {
  if (!reports || reports.length === 0) return [];

  const {
    lowScoreThreshold = 3,
    criticalScoreThreshold = 2,
    minStreakDays = 3,
    detectSevereDrop = true,
    onlySchoolDays = true,
    maxCalendarDaysGap = 7,
  } = options;

  // Group by student
  const studentMap: Record<string, any[]> = {};
  reports.forEach((r: any) => {
    const cls = String(r.class || r.班別 || '').trim();
    const sId = String(r.studentNumber || r.學號 || '').trim();
    if (!cls || !sId) return;
    const key = `${cls}_${sId}`;
    if (!studentMap[key]) {
      studentMap[key] = [];
    }
    studentMap[key].push(r);
  });

  const alerts: ConsecutiveLowMoodAlert[] = [];

  Object.keys(studentMap).forEach((key) => {
    const rawList = studentMap[key];
    // Sort chronologically descending (newest first)
    const sorted = [...rawList].sort((a, b) => getEntryTimeMs(b) - getEntryTimeMs(a));

    // Deduplicate by date (keep latest per date)
    const uniqueDayRecords: any[] = [];
    const seenDates = new Set<string>();

    for (const item of sorted) {
      if (onlySchoolDays && !isSchoolDay(item)) {
        continue; // Only count school days (Monday - Friday)
      }
      const dStr = getEntryDateStr(item) || String(getEntryTimeMs(item));
      if (!seenDates.has(dStr)) {
        seenDates.add(dStr);
        uniqueDayRecords.push(item);
      }
    }

    if (uniqueDayRecords.length === 0) return;

    const first = uniqueDayRecords[0];
    const cls = first.class || first.班別 || '';
    const studentNo = String(first.studentNumber || first.學號 || '');
    const roster: StudentRecord | undefined = findStudentByClassAndNumber(cls, studentNo);

    const chineseName = roster?.chineseName || first.studentName || first.姓名 || `${studentNo}號同學`;
    const englishName = roster?.englishName || '';
    const studentId = roster?.studentId || first.studentId || '';
    const email = roster?.email || first.studentEmail || '';

    // 1. Check Consecutive Low Scores Streak (from most recent backward)
    let lowStreak = 0;
    const streakDates: string[] = [];
    const streakScores: number[] = [];
    const streakComments: string[] = [];

    for (let i = 0; i < uniqueDayRecords.length; i++) {
      const rec = uniqueDayRecords[i];
      const score = parseInt(rec.moodScore || rec.心情指數 || '5', 10);

      // Verify gap between consecutive school day submissions does not exceed threshold (e.g. 7 calendar days to cross weekends/short breaks)
      if (i > 0) {
        const timeCur = getEntryTimeMs(rec);
        const timePrev = getEntryTimeMs(uniqueDayRecords[i - 1]);
        if (timeCur > 0 && timePrev > 0) {
          const gapDays = Math.abs(timePrev - timeCur) / (1000 * 60 * 60 * 24);
          if (gapDays > maxCalendarDaysGap) {
            break; // Gap too wide between school day submissions
          }
        }
      }

      if (!isNaN(score) && score <= lowScoreThreshold && score > 0) {
        lowStreak++;
        streakDates.push(getEntryDateStr(rec));
        streakScores.push(score);
        streakComments.push(rec.comment || rec.學生留言 || '');
      } else {
        // Streak broken
        break;
      }
    }

    // Flag if lowStreak meets threshold
    if (lowStreak >= minStreakDays) {
      const hasCriticalScores = streakScores.some(s => s <= criticalScoreThreshold);
      alerts.push({
        class: cls,
        studentNo,
        chineseName,
        englishName,
        studentId,
        email,
        streakCount: lowStreak,
        dates: [...streakDates].reverse(),
        scores: [...streakScores].reverse(),
        comments: [...streakComments].reverse(),
        type: 'consecutive_low',
        urgency: hasCriticalScores || lowStreak >= 4 ? 'high' : 'medium',
        description: `連續 ${lowStreak} 個上課日填報心情指數低於或等於 ${lowScoreThreshold} 分 (${streakScores.slice().reverse().join('分 → ')}分) [僅計上課日]`
      });
      return; // Already flagged for consecutive low mood
    }

    // 2. Check Severe Sudden Drop (e.g. Previous >= 4, Current <= 2)
    if (detectSevereDrop && uniqueDayRecords.length >= 2) {
      const latest = uniqueDayRecords[0];
      const previous = uniqueDayRecords[1];
      const curScore = parseInt(latest.moodScore || latest.心情指數 || '5', 10);
      const prevScore = parseInt(previous.moodScore || previous.心情指數 || '5', 10);

      if (!isNaN(curScore) && !isNaN(prevScore) && curScore > 0 && prevScore > 0) {
        const drop = prevScore - curScore;
        if (drop >= 3 || (prevScore >= 4 && curScore <= 1)) {
          alerts.push({
            class: cls,
            studentNo,
            chineseName,
            englishName,
            studentId,
            email,
            streakCount: 1,
            dates: [getEntryDateStr(previous), getEntryDateStr(latest)],
            scores: [prevScore, curScore],
            comments: [previous.comment || '', latest.comment || ''],
            type: 'severe_drop',
            urgency: 'high',
            description: `情緒急劇驟降 ${drop} 分 (從 ${prevScore} 分突然降至 ${curScore} 分)`
          });
        }
      }
    }
  });

  // Sort alerts: high urgency first, then by streakCount descending
  return alerts.sort((a, b) => {
    if (a.urgency === 'high' && b.urgency !== 'high') return -1;
    if (a.urgency !== 'high' && b.urgency === 'high') return 1;
    return b.streakCount - a.streakCount;
  });
}

/**
 * Evaluate single student's new submission against their past history
 */
export function checkSingleStudentAlert(
  pastReports: any[],
  currentClass: string,
  currentStudentNo: string,
  newScore: number,
  newComment: string = '',
  todayDateStr: string = ''
): { shouldAlert: boolean; alert?: ConsecutiveLowMoodAlert } {
  // Filter history for this student excluding today's potential prior record
  const studentPast = (pastReports || [])
    .filter(
      r =>
        String(r.class || r.班別 || '').toUpperCase() === currentClass.toUpperCase() &&
        String(r.studentNumber || r.學號 || '') === String(currentStudentNo) &&
        getEntryDateStr(r) !== todayDateStr
    )
    .sort((a, b) => getEntryTimeMs(b) - getEntryTimeMs(a));

  // Synthesize combined timeline with current submission at index 0
  const combined = [
    {
      class: currentClass,
      studentNumber: currentStudentNo,
      moodScore: newScore,
      comment: newComment,
      date: todayDateStr,
      timestamp: Date.now()
    },
    ...studentPast
  ];

  const results = detectConsecutiveLowMood(combined, {
    lowScoreThreshold: 3,
    criticalScoreThreshold: 2,
    minStreakDays: 3,
    detectSevereDrop: true
  });

  if (results.length > 0) {
    return { shouldAlert: true, alert: results[0] };
  }

  return { shouldAlert: false };
}
