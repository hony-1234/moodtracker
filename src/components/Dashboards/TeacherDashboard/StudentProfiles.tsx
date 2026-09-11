import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Search, Filter, ShieldCheck, Mail, Calendar, 
  ChevronRight, Award, AlertCircle, CheckCircle2, TrendingUp, 
  TrendingDown, Minus, Eye, Sparkles, BookOpen, Clock, Heart, 
  X, ExternalLink, RefreshCw, LayoutGrid, List
} from 'lucide-react';
import { GCCPS_STUDENTS, getStudentsByClass, StudentRecord } from '../../../data/studentsRoster';
import { getPublicAssetUrl } from '../../../utils/assetHelper';
import { getMoodColor, MOOD_EMOJIS } from '../../../constants/moodConstants';

const getMoodEmoji = (val: number): string => MOOD_EMOJIS[Math.round(val)]?.emoji || '😐';
const getMoodLabel = (val: number): string => MOOD_EMOJIS[Math.round(val)]?.desc?.split('/')[0]?.trim() || '平穩';

interface StudentProfilesProps {
  selectedClass: string;
  reports: any[];
  todayStr: string;
  onOpenStudentReport?: (studentNo: string, studentClass: string, studentName: string) => void;
}

const ALL_CLASSES = [
  '1A','1B','1C','2A','2B','2C','2D','3A','3B','3C','3D',
  '4A','4B','4C','4D','5A','5B','5C','5D','6A','6B','6C','6D'
];

export const StudentProfiles: React.FC<StudentProfilesProps> = ({
  selectedClass,
  reports,
  todayStr,
  onOpenStudentReport
}) => {
  const isSafetyCentre = selectedClass === 'GCCPS';

  // Filter states
  const [classFilter, setClassFilter] = useState<string>(isSafetyCentre ? 'ALL' : selectedClass);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DONE_TODAY' | 'PENDING_TODAY' | 'ATTENTION'>('ALL');
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');

  // Selected student for detailed drawer/modal
  const [activeStudent, setActiveStudent] = useState<StudentRecord | null>(null);

  // Determine base students list
  const baseStudents = useMemo(() => {
    if (!isSafetyCentre) {
      return getStudentsByClass(selectedClass);
    }
    if (classFilter === 'ALL') {
      return GCCPS_STUDENTS;
    }
    return getStudentsByClass(classFilter);
  }, [isSafetyCentre, selectedClass, classFilter]);

  // Pre-index reports by student identifier for fast lookup
  const studentReportsMap = useMemo(() => {
    const map = new Map<string, any[]>();
    reports.forEach(r => {
      const cls = (r.class || r.班別 || '').toUpperCase();
      const num = String(r.studentNumber || r.學號 || '').trim();
      const sId = (r.studentId || '').toLowerCase().trim();
      const email = (r.email || r.studentEmail || '').toLowerCase().trim();

      // Index keys
      const keys = [
        `${cls}_${num}`,
        sId,
        email
      ].filter(k => k && k !== '_');

      keys.forEach(k => {
        if (!map.has(k)) map.set(k, []);
        map.get(k)!.push(r);
      });
    });
    return map;
  }, [reports]);

  // Aggregate stats per student
  const studentProfiles = useMemo(() => {
    return baseStudents.map(student => {
      const clsKey = `${student.class.toUpperCase()}_${student.number}`;
      const sIdKey = student.studentId?.toLowerCase().trim() || '';
      const emailKey = student.email?.toLowerCase().trim() || '';

      const matchedReports: any[] = [];
      const seenIds = new Set<string>();

      [clsKey, sIdKey, emailKey].forEach(k => {
        if (k && studentReportsMap.has(k)) {
          studentReportsMap.get(k)!.forEach(r => {
            const reportId = r.id || `${r.date}_${r.time}_${r.moodScore}`;
            if (!seenIds.has(reportId)) {
              seenIds.add(reportId);
              matchedReports.push(r);
            }
          });
        }
      });

      // Sort by date/time descending
      matchedReports.sort((a, b) => {
        const da = new Date(`${a.date || a.日期 || ''} ${a.time || a.時間 || '00:00'}`).getTime();
        const db = new Date(`${b.date || b.日期 || ''} ${b.time || b.時間 || '00:00'}`).getTime();
        return db - da;
      });

      // Today's entry
      const todayEntry = matchedReports.find(r => (r.date || r.日期) === todayStr);

      // Numeric scores for stats
      const validScores = matchedReports
        .map(r => typeof r.moodScore === 'number' ? r.moodScore : typeof r.心情指數 === 'number' ? r.心情指數 : null)
        .filter((s): s is number => s !== null);

      const totalEntries = matchedReports.length;
      const avgScore = validScores.length > 0 
        ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1) 
        : null;

      const needsAttention = validScores.length > 0 && (
        parseFloat(avgScore || '10') <= 4.0 ||
        (todayEntry && (todayEntry.moodScore <= 3 || todayEntry.心情指數 <= 3))
      );

      return {
        ...student,
        totalEntries,
        avgScore,
        todayEntry,
        recentScores: validScores.slice(0, 5),
        allReports: matchedReports,
        needsAttention
      };
    });
  }, [baseStudents, studentReportsMap, todayStr]);

  // Filtered by search and status
  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return studentProfiles.filter(st => {
      // Search
      const matchesSearch = !q || 
        st.chineseName.toLowerCase().includes(q) ||
        st.englishName.toLowerCase().includes(q) ||
        st.studentId.toLowerCase().includes(q) ||
        st.class.toLowerCase().includes(q) ||
        String(st.number) === q;

      if (!matchesSearch) return false;

      // Status
      if (statusFilter === 'DONE_TODAY') return !!st.todayEntry;
      if (statusFilter === 'PENDING_TODAY') return !st.todayEntry;
      if (statusFilter === 'ATTENTION') return st.needsAttention;

      return true;
    });
  }, [studentProfiles, searchQuery, statusFilter]);

  // Overall statistics for the current selection
  const stats = useMemo(() => {
    const total = studentProfiles.length;
    const completedToday = studentProfiles.filter(s => !!s.todayEntry).length;
    const pendingToday = total - completedToday;
    const attentionCount = studentProfiles.filter(s => s.needsAttention).length;
    const completionRate = total > 0 ? Math.round((completedToday / total) * 100) : 0;
    return { total, completedToday, pendingToday, attentionCount, completionRate };
  }, [studentProfiles]);

  return (
    <div id="student-profiles-root" className="space-y-6 font-sans">
      {/* HEADER SECTION */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 p-2.5 flex items-center justify-center shadow-md shrink-0">
              <img 
                src={getPublicAssetUrl('/學校圖檔/吉祥物/enen_reading.png')} 
                alt="恩恩吉祥物" 
                className="w-full h-full object-contain filter drop-shadow"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black text-slate-800 tracking-tight">
                  {isSafetyCentre 
                    ? '👑 GCCPS 全校學生檔案管理中心' 
                    : `🏫 ${selectedClass} 班 學生檔案總覽`}
                </h3>
                <span className="text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                  {isSafetyCentre ? (classFilter === 'ALL' ? '全校 572 人' : `${classFilter} 班`) : `${selectedClass} 班`}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                {isSafetyCentre 
                  ? '安全監控中心可查閱全校各級學生之個人檔案、即時情緒記錄與歷史身心靈數據。支援按班別篩選與個別深度檢視。'
                  : `本班導師可查看 ${selectedClass} 班每位學生的個人資料、官方學號、今日心情指數與歷史關懷記錄。`}
              </p>
            </div>
          </div>

          {/* QUICK STATS PILLS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-center">
              <span className="text-[10px] text-slate-400 font-bold block">總學生數</span>
              <span className="text-base font-black text-slate-800">{stats.total} 人</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-2.5 text-center">
              <span className="text-[10px] text-emerald-600 font-bold block">今日已登記</span>
              <span className="text-base font-black text-emerald-700">{stats.completedToday} 人</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-2.5 text-center">
              <span className="text-[10px] text-amber-600 font-bold block">今日待填報</span>
              <span className="text-base font-black text-amber-700">{stats.pendingToday} 人</span>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-2.5 text-center">
              <span className="text-[10px] text-rose-600 font-bold block">需特別關注</span>
              <span className="text-base font-black text-rose-700">{stats.attentionCount} 人</span>
            </div>
          </div>
        </div>

        {/* SAFETY CENTRE CLASS FILTER TABS */}
        {isSafetyCentre && (
          <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-indigo-600" />
                全校班別快速篩選：
              </span>
              <span className="text-slate-400 font-medium text-[11px]">
                點擊切換班別或檢視全校總名冊
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50/80 rounded-2xl border border-slate-100">
              <button
                type="button"
                onClick={() => setClassFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  classFilter === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                🏫 全校總名冊 (572人)
              </button>

              <div className="w-[1px] h-6 bg-slate-300 self-center mx-1" />

              {ALL_CLASSES.map(cls => {
                const count = getStudentsByClass(cls).length;
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setClassFilter(cls)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      classFilter === cls
                        ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cls} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SEARCH & STATUS CONTROLS BAR */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* SEARCH BAR */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="搜尋姓名、學號 (s26...)、座號..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 text-xs font-bold rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* STATUS FILTERS */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              全部 ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('DONE_TODAY')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'DONE_TODAY'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              今日已登記 ({stats.completedToday})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('PENDING_TODAY')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'PENDING_TODAY'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              今日待填 ({stats.pendingToday})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ATTENTION')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'ATTENTION'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              需關注 ({stats.attentionCount})
            </button>
          </div>

          {/* VIEW MODE TOGGLE */}
          <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-slate-50 shrink-0 self-end md:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('CARDS')}
              title="卡片檢視"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'CARDS' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              title="清單檢視"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'TABLE' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* RESULT COUNT */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
        <span>顯示 {filteredStudents.length} 位學生檔案</span>
        {searchQuery && (
          <span>關鍵字「{searchQuery}」符合結果</span>
        )}
      </div>

      {/* EMPTY STATE */}
      {filteredStudents.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-3xl">
            🔍
          </div>
          <h4 className="text-base font-black text-slate-800">找不到符合條件的學生檔案</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            請嘗試更換搜尋關鍵字，或清除班別/狀態篩選條件以檢視其他學生。
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
              if (isSafetyCentre) setClassFilter('ALL');
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            重置所有篩選
          </button>
        </div>
      )}

      {/* CARDS VIEW */}
      {viewMode === 'CARDS' && filteredStudents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStudents.map((student) => {
            const todayScore = student.todayEntry 
              ? (student.todayEntry.moodScore ?? student.todayEntry.心情指數) 
              : null;
            const moodColor = todayScore !== null && typeof todayScore === 'number' 
              ? getMoodColor(todayScore) 
              : '#94A3B8';

            return (
              <motion.div
                key={`${student.class}_${student.number}_${student.studentId}`}
                data-testid="student-profile-card"
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
                onClick={() => setActiveStudent(student)}
                className={`bg-white rounded-2xl border p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden ${
                  student.needsAttention 
                    ? 'border-rose-300 ring-2 ring-rose-100' 
                    : student.todayEntry 
                    ? 'border-emerald-200' 
                    : 'border-slate-200'
                }`}
              >
                {/* TOP ACCENT LINE */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: todayScore ? moodColor : '#CBD5E1' }}
                />

                {/* STUDENT HEADER */}
                <div className="flex items-start justify-between gap-2 pt-1">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-700 text-sm shadow-2xs shrink-0">
                      {student.number}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-800 text-sm tracking-tight">
                          {student.chineseName}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.2 rounded">
                          {student.class}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-semibold uppercase block truncate max-w-[130px]">
                        {student.englishName}
                      </span>
                    </div>
                  </div>

                  {/* ATTENTION BADGE */}
                  {student.needsAttention && (
                    <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0" title="連續低分或平均偏低">
                      <AlertCircle className="w-3 h-3 text-rose-600" />
                      需關注
                    </span>
                  )}
                </div>

                {/* TODAY STATUS BADGE */}
                <div className="bg-slate-50/90 rounded-xl p-2.5 border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">今日登記：</span>
                    {student.todayEntry ? (
                      <span 
                        className="font-black text-xs px-2 py-0.5 rounded-lg text-white shadow-3xs flex items-center gap-1"
                        style={{ backgroundColor: moodColor }}
                      >
                        <span>{getMoodEmoji(Number(todayScore))}</span>
                        <span>{todayScore} 分</span>
                        <span className="text-[10px] opacity-90">({getMoodLabel(Number(todayScore))})</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        今日尚未登記
                      </span>
                    )}
                  </div>
                  {student.todayEntry?.comment && (
                    <p className="text-[11px] text-slate-600 line-clamp-1 italic pt-0.5">
                      💬 "{student.todayEntry.comment}"
                    </p>
                  )}
                </div>

                {/* FOOTER STATS */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <div>
                    <span>學號: </span>
                    <strong className="text-slate-700 font-mono">{student.studentId}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>
                      均分: <strong className="text-indigo-600 font-bold">{student.avgScore || 'N/A'}</strong>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'TABLE' && filteredStudents.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-black uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3.5">班別</th>
                  <th className="px-3 py-3.5">座號</th>
                  <th className="px-4 py-3.5">學生姓名</th>
                  <th className="px-4 py-3.5">官方學號</th>
                  <th className="px-4 py-3.5">學校電郵</th>
                  <th className="px-4 py-3.5">今日心情</th>
                  <th className="px-3 py-3.5 text-center">累計填報</th>
                  <th className="px-3 py-3.5 text-center">平均分數</th>
                  <th className="px-4 py-3.5 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStudents.map((student) => {
                  const todayScore = student.todayEntry 
                    ? (student.todayEntry.moodScore ?? student.todayEntry.心情指數) 
                    : null;
                  const moodColor = todayScore !== null && typeof todayScore === 'number' 
                    ? getMoodColor(todayScore) 
                    : '#94A3B8';

                  return (
                    <tr 
                      key={`${student.class}_${student.number}_${student.studentId}`}
                      onClick={() => setActiveStudent(student)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <span className="font-black bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md">
                          {student.class}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-bold text-slate-500">
                        {student.number} 號
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-sm">
                            {student.chineseName}
                          </span>
                          <span className="text-[11px] text-slate-400 font-semibold uppercase">
                            ({student.englishName})
                          </span>
                          {student.needsAttention && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="需關注" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-600">
                        {student.studentId}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                        {student.email}
                      </td>
                      <td className="px-4 py-3">
                        {student.todayEntry ? (
                          <span 
                            className="font-black text-xs px-2.5 py-1 rounded-lg text-white shadow-3xs inline-flex items-center gap-1.5"
                            style={{ backgroundColor: moodColor }}
                          >
                            <span>{getMoodEmoji(Number(todayScore))}</span>
                            <span>{todayScore} 分</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            未填報
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-slate-700">
                        {student.totalEntries} 次
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="font-black text-indigo-700 text-xs">
                          {student.avgScore ? `${student.avgScore} 分` : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveStudent(student);
                          }}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          查看檔案
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAILED STUDENT PROFILE MODAL */}
      <AnimatePresence>
        {activeStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col font-sans"
            >
              {/* MODAL HEADER */}
              <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white p-6 relative">
                <button
                  type="button"
                  onClick={() => setActiveStudent(null)}
                  className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-2 flex items-center justify-center shrink-0">
                    <img 
                      src={getPublicAssetUrl('/學校圖檔/吉祥物/enen_hearts.png')} 
                      alt="恩恩吉祥物" 
                      className="w-full h-full object-contain filter drop-shadow"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black">{activeStudent.chineseName}</span>
                      <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs font-black">
                        {activeStudent.class} 班 {activeStudent.number} 號
                      </span>
                    </div>
                    <span className="text-xs text-indigo-200 font-semibold block uppercase mt-0.5">
                      {activeStudent.englishName}
                    </span>
                    <div className="flex items-center gap-3 text-[11px] text-indigo-200 mt-2 font-mono">
                      <span>學號: {activeStudent.studentId}</span>
                      <span>•</span>
                      <span>電郵: {activeStudent.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* MODAL BODY */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* QUICK STATS CARDS */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3 text-center">
                    <span className="text-[11px] text-indigo-600 font-bold block">累計登分次數</span>
                    <span className="text-lg font-black text-indigo-900 mt-0.5 block">
                      {activeStudent.allReports.length} 次
                    </span>
                  </div>
                  <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 text-center">
                    <span className="text-[11px] text-emerald-600 font-bold block">平均心情指數</span>
                    <span className="text-lg font-black text-emerald-900 mt-0.5 block">
                      {activeStudent.avgScore ? `${activeStudent.avgScore} 分` : '尚無評分'}
                    </span>
                  </div>
                  <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-3 text-center">
                    <span className="text-[11px] text-amber-600 font-bold block">今日登記狀態</span>
                    <span className="text-xs font-black text-amber-900 mt-1 block">
                      {activeStudent.todayEntry 
                        ? `已登記 (${activeStudent.todayEntry.moodScore ?? activeStudent.todayEntry.心情指數}分)` 
                        : '今日未填報'}
                    </span>
                  </div>
                </div>

                {/* CHRONOLOGICAL MOOD HISTORY */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      歷史心情登錄歷程 ({activeStudent.allReports.length} 筆)
                    </h5>
                    {onOpenStudentReport && (
                      <button
                        type="button"
                        onClick={() => {
                          const sNo = String(activeStudent.number);
                          onOpenStudentReport(sNo, activeStudent.class, activeStudent.chineseName);
                          setActiveStudent(null);
                        }}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        開啟雙軌輔導報表
                      </button>
                    )}
                  </div>

                  {activeStudent.allReports.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-400 font-medium">
                      該學生目前尚無任何心情填報記錄。
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {activeStudent.allReports.map((entry, idx) => {
                        const score = entry.moodScore ?? entry.心情指數;
                        const date = entry.date || entry.日期;
                        const time = entry.time || entry.時間;
                        const comment = entry.comment || entry.有事情想向老師分享;
                        const color = typeof score === 'number' ? getMoodColor(score) : '#94A3B8';

                        return (
                          <div
                            key={idx}
                            className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3 flex items-start justify-between gap-3"
                          >
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center gap-2 text-xs">
                                <span className="font-bold text-slate-700">{date}</span>
                                {time && <span className="text-[11px] text-slate-400 font-mono">{time}</span>}
                              </div>
                              {comment ? (
                                <p className="text-xs text-slate-800 font-medium italic bg-white p-2 rounded-xl border border-slate-100">
                                  💬 "{comment}"
                                </p>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">無文字備註</span>
                              )}
                            </div>

                            <div className="shrink-0 text-right">
                              {typeof score === 'number' ? (
                                <span
                                  className="px-2.5 py-1 rounded-xl text-white font-black text-xs inline-flex items-center gap-1 shadow-3xs"
                                  style={{ backgroundColor: color }}
                                >
                                  <span>{getMoodEmoji(score)}</span>
                                  <span>{score} 分</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-xs font-bold">
                                  缺席 / NA
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  天主教善導小學 · 學生個人身心靈健康檔案
                </span>
                <button
                  type="button"
                  onClick={() => setActiveStudent(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  關閉檔案
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
