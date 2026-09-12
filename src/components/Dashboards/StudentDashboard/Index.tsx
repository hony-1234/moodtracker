import React, { useState, FormEvent } from 'react';
import { CheckCircle, Smile, BookOpen, TrendingUp, LogOut, Award, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MoodLogger } from './MoodLogger';
import { ReportCard } from './ReportCard';
import { FourRsStation } from './FourRsStation';
import { StudentDiariesTab } from './StudentDiariesTab';
import { formatDateObj, getUnixTime } from '../../../utils/dateHelpers';
import { findStudentByClassAndNumber, findStudentByGoogleEmail } from '../../../data/studentsRoster';
import { auth } from '../../../firebase/config';
import ClassroomBookExperience from '../../Portals/ClassroomBookExperience';

interface StudentDashboardProps {
  selectedClass: string;
  activeStudentNumber: string | number;
  studentSuccessMessage: boolean;
  setStudentSuccessMessage: (val: boolean) => void;
  studentMood: number;
  setStudentMood: (m: number) => void;
  studentComment: string;
  setStudentComment: (c: string) => void;
  showStudentReport: boolean;
  setShowStudentReport: (s: boolean) => void;
  reports: any[];
  handleLogout: () => void;
  handleStudentReportSubmit: (e: FormEvent) => void;
  loading: boolean;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  selectedClass,
  activeStudentNumber,
  studentSuccessMessage,
  setStudentSuccessMessage,
  studentMood,
  setStudentMood,
  studentComment,
  setStudentComment,
  showStudentReport,
  setShowStudentReport,
  reports,
  handleLogout,
  handleStudentReportSubmit,
  loading,
}) => {
  const [activeTab, setActiveTab] = useState<'MOOD' | 'REPORT' | 'DIARIES'>('MOOD');
  const [displayMode, setDisplayMode] = useState<'CLASSROOM_BOOK' | 'STANDARD_DASHBOARD'>('CLASSROOM_BOOK');
  const studentFormattedNumber = `${selectedClass}${String(activeStudentNumber).padStart(2, '0')}`;

  // Look up student from official roster
  const currentUser = auth.currentUser;
  const studentProfile = findStudentByClassAndNumber(selectedClass, activeStudentNumber) || 
    (currentUser?.email ? findStudentByGoogleEmail(currentUser.email) : undefined);

  const studentDisplayName = studentProfile 
    ? `${studentProfile.chineseName} (${studentProfile.englishName})` 
    : `${selectedClass} 班 ${activeStudentNumber} 號同學`;

  // Filter personal mood logs for stats
  const personalReports = reports.filter((r: any) => {
    const rClass = (r.class || r.班別 || '').toUpperCase();
    const rStudentNo = String(r.studentNumber || r.學號 || '');
    return rClass === selectedClass.toUpperCase() && rStudentNo === String(activeStudentNumber);
  });
  const totalCheckIns = personalReports.length;

  if (displayMode === 'CLASSROOM_BOOK') {
    return (
      <ClassroomBookExperience
        selectedClass={selectedClass}
        activeStudentNumber={activeStudentNumber}
        studentMood={studentMood}
        setStudentMood={setStudentMood}
        studentComment={studentComment}
        setStudentComment={setStudentComment}
        studentSuccessMessage={studentSuccessMessage}
        setStudentSuccessMessage={setStudentSuccessMessage}
        handleStudentReportSubmit={handleStudentReportSubmit}
        loading={loading}
        handleLogout={handleLogout}
        reports={reports}
        showStudentReport={showStudentReport}
        setShowStudentReport={setShowStudentReport}
        onSwitchToDashboard={(tab?: 'MOOD' | 'REPORT' | 'DIARIES') => {
          if (tab) setActiveTab(tab);
          setDisplayMode('STANDARD_DASHBOARD');
        }}
      />
    );
  }

  return (
    <motion.div 
      key="student_dashboard"
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 1.02 }} 
      transition={{ duration: 0.2 }}
      className="max-w-4xl mx-auto font-sans space-y-4"
    >
      {/* TOP STUDENT IDENTITY & STATUS CARD */}
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          {currentUser?.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt={studentDisplayName}
              className="w-12 h-12 rounded-full border-2 border-indigo-400 object-cover shrink-0 shadow-xs"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-xs">
              <User className="w-6 h-6" />
            </div>
          )}

          <div className="truncate">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {selectedClass} 班 {activeStudentNumber} 號 {studentProfile?.chineseName || '同學'}
              </h2>
              {studentProfile?.englishName && (
                <span className="hidden md:inline-block text-xs text-slate-500 font-semibold">
                  ({studentProfile.englishName})
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
              {studentProfile?.studentId && (
                <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold text-[11px]">
                  學號: {studentProfile.studentId}
                </span>
              )}
              <span className="text-slate-400">·</span>
              <span className="text-slate-600 font-medium truncate max-w-[200px] sm:max-w-xs">
                {currentUser?.email || studentProfile?.email || '已登入'}
              </span>
            </div>
          </div>
        </div>

        {/* STATS & LOGOUT BUTTON */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
          <div className="bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold text-amber-800">
            <Award className="w-4 h-4 text-amber-600" />
            <span>累計記錄 {totalCheckIns} 次</span>
          </div>

          <button
            type="button"
            data-role="enter-classroom-book-btn"
            onClick={() => setDisplayMode('CLASSROOM_BOOK')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-black text-amber-900 bg-amber-100/90 hover:bg-amber-200 border border-amber-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="進入沉浸式卡通教室與心情日記"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span>🏫 卡通教室日記</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer bg-white"
            title="登出此帳號"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>登出</span>
          </button>
        </div>
      </div>

      {/* MODE SWITCHER TABS (3 TABS: MOOD, REPORT, DIARIES) */}
      <div className="flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('MOOD')}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'MOOD'
                ? 'bg-amber-500 text-slate-950 shadow-xs scale-102'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Smile className="w-4 h-4 text-slate-950" />
            <span>☀️ 每日心情登記</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('REPORT');
              setShowStudentReport(true);
            }}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'REPORT'
                ? 'bg-blue-600 text-white shadow-xs scale-102'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>📈 個人情緒進度與報告</span>
          </button>

          <button
            type="button"
            onClick={() => {
              alert("🚧 4Rs 心靈日記正在精心籌備中 (In Development)，即將正式開放，敬請期待喔！✨");
            }}
            className="relative px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-not-allowed opacity-80 text-slate-500 bg-slate-100 border border-slate-300 shadow-3xs"
            title="4Rs 心靈日記正在籌備中 (In Development)"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span>📖 我的 4Rs 心靈日記</span>
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 uppercase tracking-tight shadow-3xs flex items-center gap-1 animate-pulse">
              <span>🚧</span>
              <span>In Development</span>
            </span>
          </button>
        </div>
      </div>

      {/* TAB CONTENTS */}
      <AnimatePresence mode="wait">
        {/* ========================================= */}
        {/* TAB 1: 4Rs DIARIES                       */}
        {/* ========================================= */}
        {activeTab === 'DIARIES' && (
          <motion.div
            key="student_diaries_view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <StudentDiariesTab
              studentNumber={studentFormattedNumber}
              studentName={`${selectedClass} 班 ${activeStudentNumber} 號 ${studentProfile?.chineseName || '同學'}`}
            />
          </motion.div>
        )}

        {/* ========================================= */}
        {/* TAB 2: PROGRESS & EMOTIONAL REPORT CARD   */}
        {/* ========================================= */}
        {activeTab === 'REPORT' && (
          <motion.div
            key="student_progress_view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-2">
              <div>
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span>{studentDisplayName} 的個人情緒成長進度</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  透過連續記錄，了解自己的情緒起伏，照顧身心健康
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('MOOD')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg cursor-pointer"
              >
                前往今日登記 ☀️
              </button>
            </div>

            <ReportCard
              reports={reports}
              selectedClass={selectedClass}
              activeStudentNumber={activeStudentNumber}
              showStudentReport={true}
              setShowStudentReport={setShowStudentReport}
              hideToggleButton={true}
            />

            <div className="mt-6 pt-6 border-t border-slate-100">
              <FourRsStation initialExpanded={false} />
            </div>
          </motion.div>
        )}

        {/* ========================================= */}
        {/* TAB 3: DAILY MOOD LOGGER                  */}
        {/* ========================================= */}
        {activeTab === 'MOOD' && (
          <motion.div
            key="student_mood_view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="max-w-2xl mx-auto"
          >
            {studentSuccessMessage ? (
              <div className="bg-white border-2 border-emerald-500 rounded-2xl p-8 text-center shadow-xl">
                <div className="text-emerald-500 mb-4 flex justify-center">
                  <CheckCircle className="w-20 h-20" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">🎈 登記成功！</h3>
                <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto font-medium">
                  親愛的 {selectedClass} 班 {activeStudentNumber} 號 {studentProfile?.chineseName || '同學'}，我們已安全記錄你今天「{formatDateObj(new Date())}」的心情。
                  不論今天高興還是有點煩，老師都會在這裡陪伴你。加油！
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('REPORT');
                      setShowStudentReport(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>查看我的情緒成長進度</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStudentSuccessMessage(false);
                      setStudentMood(5);
                    }}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer"
                  >
                    重新修改/填寫
                  </button>
                  <button
                    type="button"
                    onClick={() => setDisplayMode('CLASSROOM_BOOK')}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>🏫 查看卡通日記本印章</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer"
                  >
                    安全登出
                  </button>
                </div>

                {/* Smart recommendation of the 4Rs Station */}
                <FourRsStation initialExpanded={studentMood <= 4} />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Cheerful Invitation Card to Cartoon Classroom Experience */}
                <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-200/90 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🏫</span>
                    <div>
                      <p className="text-xs sm:text-sm font-black text-amber-950">
                        想在沉浸式卡通教室裡翻開日記本登記嗎？
                      </p>
                      <p className="text-[11px] text-amber-800 font-medium">
                        伴隨微風鐘聲、恩恩吉祥物印章與翻頁效果，身歷其境記錄今天的心情！
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    data-role="banner-enter-classroom-btn"
                    onClick={() => setDisplayMode('CLASSROOM_BOOK')}
                    className="shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-xs transition-transform hover:scale-102 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>進入教室日記 📖</span>
                  </button>
                </div>

                <MoodLogger
                  studentMood={studentMood}
                  setStudentMood={setStudentMood}
                  studentComment={studentComment}
                  setStudentComment={setStudentComment}
                  onSubmit={handleStudentReportSubmit}
                  loading={loading}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StudentDashboard;
