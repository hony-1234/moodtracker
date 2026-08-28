import React, { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, CheckCircle2, User, LogOut, ArrowRight, ShieldCheck, Sparkles, Users, GraduationCap } from 'lucide-react';
import { auth } from '../../firebase/config';
import { loginWithGoogle, logoutUser, formatAuthErrorMessage } from '../../firebase/services';
import { isP1_3 } from '../../utils/dateHelpers';
import { getPublicAssetUrl } from '../../utils/assetHelper';
import { User as FirebaseUser } from 'firebase/auth';

interface StudentLoginProps {
  ALL_CLASSES: string[];
  selectedClass: string;
  setSelectedClass: (val: string) => void;
  studentNoInput: string;
  setStudentNoInput: (val: string) => void;
  loginPassword: string;
  setLoginPassword: (val: string) => void;
  rememberMe: boolean;
  setRememberMe: (val: boolean) => void;
  loading: boolean;
  handleStudentLoginSubmit: (e: FormEvent) => void;
  setViewState: (view: 'LANDING' | 'STUDENT_LOGIN' | 'STUDENT_DASHBOARD' | 'TEACHER_LOGIN' | 'TEACHER_DASHBOARD' | 'TEACHER_P1_3_BATCH') => void;
}

export default function StudentLogin({
  ALL_CLASSES,
  selectedClass,
  setSelectedClass,
  studentNoInput,
  setStudentNoInput,
  rememberMe,
  setRememberMe,
  loading: parentLoading,
  handleStudentLoginSubmit,
  setViewState,
}: StudentLoginProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [localLoading, setLocalLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginMode, setLoginMode] = useState<'SENIOR_GOOGLE' | 'JUNIOR_P13'>('SENIOR_GOOGLE');

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  const handleGoogleSignIn = async () => {
    setLocalLoading(true);
    setAuthError(null);
    try {
      const result = await loginWithGoogle();
      setCurrentUser(result.user);
    } catch (err: any) {
      console.error('Student Google Auth Error:', err);
      setAuthError(formatAuthErrorMessage(err));
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSwitchAccount = async () => {
    setLocalLoading(true);
    try {
      await logoutUser();
      setCurrentUser(null);
    } catch (err: any) {
      console.error('Logout error:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  const isJuniorClass = isP1_3(selectedClass);
  const loading = parentLoading || localLoading;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -12 }} 
      transition={{ duration: 0.25 }}
      className="max-w-md mx-auto bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden"
    >
      {/* HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-6 text-white text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-white rounded-2xl p-1.5 shadow-md flex items-center justify-center border border-white/10 mb-2 relative overflow-hidden">
          <img
            src={getPublicAssetUrl("/學校圖檔/學校logo/school_logo.png")}
            alt="天主教善導小學 校徽"
            className="w-14 h-16 object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
              const parent = (e.target as HTMLElement).parentElement;
              if (parent) {
                const iconHTML = `<span class="text-4xl">🎒</span>`;
                parent.innerHTML = iconHTML;
              }
            }}
          />
        </div>
        <h3 className="text-xl font-black mt-1 tracking-wide">學生心情加油站登記</h3>
        <p className="text-xs text-indigo-100 mt-0.5">全校班級心情登記與導師快速登分通道</p>
      </div>

      {/* TABS (If not yet logged into Google) */}
      {!currentUser && (
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => { setLoginMode('SENIOR_GOOGLE'); setSelectedClass(''); }}
            className={`flex-1 py-3 px-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border-b-2 ${
              loginMode === 'SENIOR_GOOGLE'
                ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>P.4 - P.6 學生登入</span>
          </button>
          <button
            type="button"
            onClick={() => { setLoginMode('JUNIOR_P13'); setSelectedClass('1A'); }}
            className={`flex-1 py-3 px-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border-b-2 ${
              loginMode === 'JUNIOR_P13'
                ? 'border-indigo-600 text-indigo-700 bg-white shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>P.1 - P.3 班級批次通道</span>
          </button>
        </div>
      )}

      {/* ERROR FEEDBACK */}
      {authError && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-start gap-2">
          <span>⚠️</span>
          <span className="flex-1">{authError}</span>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="p-6 space-y-5">
        {/* CASE 1: NOT LOGGED IN & IN SENIOR P4-P6 MODE */}
        {!currentUser && loginMode === 'SENIOR_GOOGLE' && (
          <div className="space-y-4 text-center py-2">
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-left">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm mb-1">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>高年級（P.4 - P.6）同學請登入</span>
              </div>
              <p className="text-xs text-indigo-700 leading-relaxed">
                請點擊下方按鈕以 Google/Gmail 帳號登入，<strong>登入後無需再輸入密碼</strong>！
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-indigo-400 text-slate-700 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              {/* Google Official G Logo */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93z"
                />
              </svg>
              <span>{loading ? "正在連接 Google..." : "使用 Google / Gmail 帳號登入"}</span>
            </motion.button>
          </div>
        )}

        {/* CASE 2: LOGGED IN (OR P.1-P.3 DIRECT TEACHER ENTRY) */}
        {(currentUser || loginMode === 'JUNIOR_P13') && (
          <form onSubmit={handleStudentLoginSubmit} className="space-y-4">
            {/* LOGGED IN GOOGLE USER BANNER (if user is authenticated) */}
            {currentUser && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Student'}
                      className="w-10 h-10 rounded-full border border-emerald-300 object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <div className="truncate">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{currentUser.displayName || '已登入 Google 帳號'}</span>
                    </div>
                    <div className="text-[11px] text-emerald-700 truncate font-mono">
                      {currentUser.email}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSwitchAccount}
                  className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white bg-transparent border-none cursor-pointer shrink-0 ml-2"
                  title="切換其他 Google 帳號"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  切換
                </button>
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
              <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5 border-b border-slate-200/80 pb-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>
                  {isJuniorClass 
                    ? "請選擇初小班別（支援全班批次登分）" 
                    : "請選擇您的班別與學號（免密碼）"}
                </span>
              </div>

              {/* CLASS SELECTOR (ALL CLASSES AVAILABLE) */}
              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                  選擇班別
                </label>
                <select
                  id="student-class-select"
                  className="w-full h-11 px-3 border border-slate-200 rounded-xl font-bold text-slate-800 bg-white focus:ring-2 focus:ring-indigo-200 focus:outline-none text-sm"
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                  }}
                  required
                >
                  <option value="">-- 請選擇班別 --</option>
                  <optgroup label="測試專用">
                    <option value="TEST">TEST 測試班級</option>
                  </optgroup>
                  <optgroup label="初小 (P.1 - P.3) 班級">
                    {['1A','1B','1C','1D','2A','2B','2C','2D','3A','3B','3C','3D'].map(c => (
                      <option key={c} value={c}>{c} 班</option>
                    ))}
                  </optgroup>
                  <optgroup label="高小 (P.4 - P.6) 班級">
                    {['4A','4B','4C','4D','5A','5B','5C','5D','6A','6B','6C','6D'].map(c => (
                      <option key={c} value={c}>{c} 班</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* STUDENT NUMBER INPUT (Required for P.4-P.6, Optional for P.1-P.3) */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    {isJuniorClass ? "學生學號 / 座號 (選填)" : "學生學號 / 座號 (1 - 30)"}
                  </label>
                  {isJuniorClass && (
                    <span className="text-[11px] text-indigo-600 font-semibold">
                      留空將直接進入全班批次登分
                    </span>
                  )}
                </div>
                <input
                  id="student-number-input"
                  type="number"
                  placeholder={isJuniorClass ? "留空進入全班批次登分，或輸入座號" : "請輸入座號（例如 1 至 30）"}
                  className="w-full h-11 px-4 border border-slate-200 rounded-xl font-bold text-slate-800 bg-white focus:ring-2 focus:ring-indigo-200 focus:outline-none text-sm"
                  value={studentNoInput}
                  onChange={(e) => setStudentNoInput(e.target.value)}
                  min="1"
                  max="35"
                  required={!isJuniorClass}
                />
              </div>

              {/* REMEMBER ME */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="student-remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="student-remember-me" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  記住我的登入狀態 (下次直接進入)
                </label>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-1">
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                id="btn-stud-submit"
                type="submit"
                disabled={loading || !selectedClass || (!isJuniorClass && !studentNoInput.trim())}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-black text-sm tracking-widest transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <span>
                  {loading 
                    ? "進入中..." 
                    : isJuniorClass && !studentNoInput.trim()
                      ? `🚀 進入 ${selectedClass} 班級批次登分介面`
                      : `🚀 確認並進入心情加油站`}
                </span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </motion.button>
            </div>
          </form>
        )}

        {/* BACK TO LANDING */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setViewState('LANDING')}
            className="w-full text-center text-xs text-slate-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-1 font-semibold bg-transparent border-none p-0 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            返回首頁模式選擇
          </button>
        </div>
      </div>

      {/* FOOTER NOTE */}
      <div className="bg-slate-50 border-t border-slate-100 p-4 text-center">
        <p className="text-[11px] text-[#94A3B8] leading-relaxed">
          💡 小一至小三 (P.1 - P.3) 支援班主任與科任老師於課室進行全班即時批次登記。
        </p>
      </div>
    </motion.div>
  );
}
