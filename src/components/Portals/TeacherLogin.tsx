import React, { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles, KeyRound } from 'lucide-react';
import { getPublicAssetUrl } from '../../utils/assetHelper';
import { getDefaultPass } from '../../utils/dateHelpers';

interface TeacherLoginProps {
  selectedClass: string;
  setSelectedClass: (val: string) => void;
  loginPassword: string;
  setLoginPassword: (val: string) => void;
  rememberMe: boolean;
  setRememberMe: (val: boolean) => void;
  loading: boolean;
  handleTeacherLoginSubmit: (e: FormEvent) => void;
  setViewState: (view: 'LANDING' | 'STUDENT_LOGIN' | 'STUDENT_DASHBOARD' | 'TEACHER_LOGIN' | 'TEACHER_DASHBOARD' | 'TEACHER_P1_3_BATCH') => void;
}

export default function TeacherLogin({
  selectedClass,
  setSelectedClass,
  loginPassword,
  setLoginPassword,
  rememberMe,
  setRememberMe,
  loading,
  handleTeacherLoginSubmit,
  setViewState,
}: TeacherLoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const defaultPassHint = selectedClass ? getDefaultPass(selectedClass) : '4a4a';

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!selectedClass) {
      setErrorMsg("請先選擇您任教或管理的班別！");
      return;
    }
    if (!loginPassword.trim()) {
      setErrorMsg(`請輸入 ${selectedClass} 班密碼（預設為 ${defaultPassHint}）！`);
      return;
    }
    handleTeacherLoginSubmit(e);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -12 }} 
      transition={{ duration: 0.25 }}
      className="max-w-md mx-auto bg-white border border-slate-200 shadow-2xl rounded-3xl overflow-hidden font-sans"
    >
      {/* HEADER */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 px-6 py-6 text-white text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-white rounded-2xl p-1.5 shadow-md flex items-center justify-center border border-white/10 mb-2 relative overflow-hidden">
          <img
            src={getPublicAssetUrl("/學校圖檔/學校logo/school_logo.png")}
            alt="天主教善導小學 校徽"
            className="w-14 h-16 object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
              const parent = (e.target as HTMLElement).parentElement;
              if (parent) {
                const iconHTML = `<span class="text-4xl">🏫</span>`;
                parent.innerHTML = iconHTML;
              }
            }}
          />
        </div>
        <h3 className="text-lg sm:text-xl font-black mt-1 tracking-tight">教師及管理員終端 (Teacher Terminal)</h3>
        <p className="text-xs text-amber-100 mt-1 font-medium">
          天主教善導小學 · 班級安全管理控制台
        </p>
      </div>

      {/* NOTICE BANNER */}
      <div className="px-6 pt-5 pb-1">
        <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-950 font-medium space-y-1">
          <div className="flex items-center gap-1.5 font-black text-amber-900 text-xs">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>教師班級專屬登入（無需 Google / Gmail）</span>
          </div>
          <p className="text-[11.5px] leading-relaxed text-amber-900">
            老師<strong>無需登入個人的 Gmail 帳號</strong>，只需在下方選擇任教班級並輸入班級安全密碼即可直接進入管理儀表板。
          </p>
        </div>
      </div>

      {/* ERROR FEEDBACK */}
      {errorMsg && (
        <div className="mx-6 mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* CLASS LOGIN FORM */}
      <form onSubmit={onSubmit} className="p-6 space-y-4">
        {/* CLASS SELECTOR */}
        <div>
          <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1.5">
            1. 選擇任教班別 / 管理權限
          </label>
          <select
            id="teacher-class-select"
            className="w-full h-12 px-3.5 border-2 border-slate-200 focus:border-amber-500 rounded-xl font-black text-slate-800 bg-white focus:ring-2 focus:ring-amber-200 focus:outline-none text-sm transition-all cursor-pointer"
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setErrorMsg(null);
            }}
            required
          >
            <option value="">-- 請選擇班別 --</option>
            <optgroup label="初小 (P.1 - P.3) 班級">
              {['1A','1B','1C','2A','2B','2C','2D','3A','3B','3C','3D'].map(c => (
                <option key={c} value={c}>{c} 班</option>
              ))}
            </optgroup>
            <optgroup label="高小 (P.4 - P.6) 班級">
              {['4A','4B','4C','4D','5A','5B','5C','5D','6A','6B','6C','6D'].map(c => (
                <option key={c} value={c}>{c} 班</option>
              ))}
            </optgroup>
            <optgroup label="全校安全官與測試">
              <option value="GCCPS">🏫 GCCPS 全校安全監控中心</option>
              <option value="TEST">TEST 測試班級</option>
            </optgroup>
          </select>
        </div>

        {/* PASSWORD INPUT */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wide">
              2. 班級安全密碼 (Class Password)
            </label>
          </div>
          <div className="relative">
            <input
              id="teacher-password-input"
              type={showPassword ? "text" : "password"}
              placeholder={selectedClass ? `請輸入 ${selectedClass} 班安全密碼` : "請先選擇班級"}
              className="w-full h-12 pl-10 pr-11 border-2 border-slate-200 focus:border-amber-500 rounded-xl focus:ring-2 focus:ring-amber-200 focus:outline-none text-slate-800 text-sm font-bold transition-all placeholder:text-slate-300 placeholder:font-medium"
              value={loginPassword}
              onChange={(e) => {
                setLoginPassword(e.target.value);
                setErrorMsg(null);
              }}
              autoComplete="current-password"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 transition-colors p-0.5 cursor-pointer"
              title={showPassword ? "隱藏密碼" : "顯示密碼"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            💡 密碼不區分大小寫（英文大小寫皆可接受）。
          </p>
        </div>

        {/* REMEMBER ME */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="teacher-remember-me"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500 cursor-pointer"
          />
          <label htmlFor="teacher-remember-me" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
            記住我的登入狀態 (下次在此瀏覽器自動進入)
          </label>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-2">
          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            id="btn-teacher-submit"
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-black text-xs sm:text-sm tracking-wide transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 px-2 sm:px-4 disabled:from-slate-300 disabled:to-slate-300"
          >
            {loading ? (
              <span>驗證安全碼中...</span>
            ) : (
              <>
                <span>
                  {selectedClass 
                    ? `🚀 進入 ${selectedClass} 班 教學管理控制台`
                    : '🚀 登入教師控制台'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>

        {/* BACK BUTTON */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setViewState('LANDING')}
            className="w-full text-center text-xs text-slate-400 hover:text-amber-600 transition-all flex items-center justify-center gap-1 font-semibold bg-transparent border-none p-0 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            返回首頁模式選擇
          </button>
        </div>
      </form>

      {/* FOOTER NOTE */}
      <div className="bg-slate-50 border-t border-slate-100 p-4 text-center">
        <p className="text-[11px] text-slate-400 font-medium">
          🛡️ 天主教善導小學 學生心理健康追蹤平台 · 班級密碼保護機制
        </p>
      </div>
    </motion.div>
  );
}
