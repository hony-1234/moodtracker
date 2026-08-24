import React, { FormEvent } from 'react';
import { CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { MoodLogger } from './MoodLogger';
import { ReportCard } from './ReportCard';
import { FourRsStation } from './FourRsStation';
import { formatDateObj } from '../../../utils/dateHelpers';

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
  return (
    <motion.div 
      key="student_dashboard"
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 1.02 }} 
      transition={{ duration: 0.2 }}
      className="max-w-2xl mx-auto font-sans"
    >
      {studentSuccessMessage ? (
        <div className="bg-white border-2 border-emerald-500 rounded-2xl p-8 text-center shadow-xl">
          <div className="text-emerald-500 mb-4 flex justify-center">
            <CheckCircle className="w-20 h-20" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">🎈 登記成功！</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto font-semibold">
            親愛的 {selectedClass} 班 {activeStudentNumber} 號同學，我們已安全記錄你今天「{formatDateObj(new Date())}」的心情。
            不論今天高興還是有點煩，老師都會在這裡陪伴你。加油！
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setStudentSuccessMessage(false);
                setStudentMood(5);
              }}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer"
            >
              重新修改/填寫
            </button>
            <button
              onClick={handleLogout}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              安全登出 (完成登記)
            </button>
          </div>

          {/* Smart recommendation of the 4Rs Station */}
          <FourRsStation initialExpanded={studentMood <= 4} />

          <ReportCard
            reports={reports}
            selectedClass={selectedClass}
            activeStudentNumber={activeStudentNumber}
            showStudentReport={showStudentReport}
            setShowStudentReport={setShowStudentReport}
          />
        </div>
      ) : (
        <MoodLogger
          studentMood={studentMood}
          setStudentMood={setStudentMood}
          studentComment={studentComment}
          setStudentComment={setStudentComment}
          onSubmit={handleStudentReportSubmit}
          loading={loading}
        />
      )}
    </motion.div>
  );
};

export default StudentDashboard;
