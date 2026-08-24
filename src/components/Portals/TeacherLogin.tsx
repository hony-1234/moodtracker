import React, { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Mail, Lock, ShieldCheck, UserPlus, LogIn, KeyRound } from 'lucide-react';
import { 
  loginWithEmail, 
  registerWithEmail, 
  resetUserPassword, 
  formatAuthErrorMessage 
} from '../../firebase/services';
import { getPublicAssetUrl } from '../../utils/assetHelper';

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
  loading: parentLoading,
  handleTeacherLoginSubmit,
  setViewState,
}: TeacherLoginProps) {
  const [authMode, setAuthMode] = useState<'email' | 'class'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  const loading = parentLoading || localLoading;

  const handleEmailAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!email.trim()) {
      setAuthError('請輸入電子郵件地址。');
      return;
    }
    if (!password) {
      setAuthError('請輸入密碼。');
      return;
    }

    setLocalLoading(true);
    try {
      if (isRegistering) {
        if (password.length < 6) {
          setAuthError('密碼長度至少需 6 個字元。');
          setLocalLoading(false);
          return;
        }
        await registerWithEmail(email, password);
        setAuthSuccess('🎉 帳號註冊成功！正在進入控制台...');
      } else {
        await loginWithEmail(email, password);
      }

      // Default role to GCCPS if not chosen
      const activeRole = selectedClass || 'GCCPS';
      setSelectedClass(activeRole);

      if (rememberMe) {
        localStorage.setItem('teacher_token_session', JSON.stringify({ 
          cls: activeRole, 
          view: 'TEACHER_DASHBOARD',
          email: email.trim()
        }));
      } else {
        localStorage.removeItem('teacher_token_session');
      }

      setViewState('TEACHER_DASHBOARD');
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      setAuthError(formatAuthErrorMessage(err));
    } finally {
      setLocalLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setAuthError('請先在上方輸入您的電子郵件地址以接收重設密碼信件。');
      return;
    }
    setLocalLoading(true);
    setAuthError(null);
    try {
      await resetUserPassword(email);
      setAuthSuccess(`重設密碼信已成功寄送至 ${email}，請查收信箱。`);
    } catch (err: any) {
      setAuthError(formatAuthErrorMessage(err));
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -10 }} 
      transition={{ duration: 0.2 }}
      className="max-w-md mx-auto bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden"
    >
      <div className="bg-amber-600 px-6 py-6 text-white text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-white rounded-2xl p-1.5 shadow-md flex items-center justify-center border border-white/10 mb-2 relative overflow-hidden">
          <img
            src={getPublicAssetUrl("/學校圖檔/學校logo/LOGOCO_不起格.png")}
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
        <h3 className="text-lg font-black mt-1 tracking-wide">校園管理與教師端登入</h3>
        <p className="text-xs text-amber-100 mt-0.5">Firebase 身份驗證 / 全校安全儀表板</p>
      </div>

      {/* AUTH MODE TOGGLE */}
      <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5">
        <button
          type="button"
          onClick={() => { setAuthMode('email'); setAuthError(null); }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            authMode === 'email' 
              ? 'bg-white text-amber-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          Firebase 電郵驗證
        </button>
        <button
          type="button"
          onClick={() => { setAuthMode('class'); setAuthError(null); }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            authMode === 'class' 
              ? 'bg-white text-amber-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          班級專屬安全碼
        </button>
      </div>

      {/* FEEDBACK NOTIFICATIONS */}
      {authError && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl flex items-start gap-2">
          <span className="font-bold">⚠️</span>
          <span className="flex-1">{authError}</span>
        </div>
      )}
      {authSuccess && (
        <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium rounded-xl flex items-start gap-2">
          <span className="font-bold">✅</span>
          <span className="flex-1">{authSuccess}</span>
        </div>
      )}

      {/* EMAIL / PASSWORD FORM */}
      {authMode === 'email' && (
        <form onSubmit={handleEmailAuthSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              管理身分 / 班級權限
            </label>
            <select
              id="teacher-role-select"
              className="w-full h-11 px-3 border border-slate-200 rounded-xl font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-amber-200 focus:outline-none text-sm"
              value={selectedClass || 'GCCPS'}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <optgroup label="全校安全官">
                <option value="GCCPS">🏫 GCCPS 全校安全監控中心</option>
              </optgroup>
              <optgroup label="測試用與除錯">
                <option value="TEST">TEST 測試班級</option>
              </optgroup>
              <optgroup label="小一 (P.1) 至 小六 (P.6) 班級">
                {['1A','1B','1C','1D','2A','2B','2C','2D','3A','3B','3C','3D','4A','4B','4C','4D','5A','5B','5C','5D','6A','6B','6C','6D'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              教師或管理員電郵 (Firebase Auth)
            </label>
            <div className="relative">
              <input
                id="teacher-email-input"
                type="email"
                placeholder="teacher@gccps.edu.hk"
                className="w-full h-11 pl-10 pr-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-200 focus:outline-none text-slate-800 text-sm font-semibold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider">
                密碼
              </label>
              {!isRegistering && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 underline bg-transparent border-none p-0 cursor-pointer"
                >
                  忘記密碼？
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id="teacher-password-auth-input"
                type="password"
                placeholder="請輸入密碼 (至少 6 位字元)"
                className="w-full h-11 pl-10 pr-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-200 focus:outline-none text-slate-800 text-sm font-semibold"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="teacher-remember-me-email"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500"
            />
            <label htmlFor="teacher-remember-me-email" className="text-xs font-semibold text-slate-700 cursor-pointer">
              記住我的登入狀態
            </label>
          </div>

          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              id="btn-teacher-email-submit"
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black text-sm tracking-widest transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                "驗證中..."
              ) : isRegistering ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  註冊並登入 Firebase 帳號
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  以電郵密碼登入
                </>
              )}
            </motion.button>
          </div>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setAuthError(null);
                setAuthSuccess(null);
              }}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 underline bg-transparent border-none cursor-pointer"
            >
              {isRegistering ? '已有 Firebase 帳號？切換至登入' : '第一次使用？點此註冊 Firebase 教師帳號'}
            </button>
          </div>

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
      )}

      {/* CLASS PASSCODE FORM */}
      {authMode === 'class' && (
        <form onSubmit={handleTeacherLoginSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              登入班級帳號 / 控制終端
            </label>
            <select
              id="teacher-class-select"
              className="w-full h-11 px-3 border border-slate-200 rounded-xl font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-amber-200 focus:outline-none text-sm"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">--請選擇登入權限--</option>
              <optgroup label="全校安全官">
                <option value="GCCPS">🏫 GCCPS 全校安全監控中心</option>
              </optgroup>
              <optgroup label="測試用與除錯">
                <option value="TEST">TEST 測試班級</option>
              </optgroup>
              <optgroup label="小一 (P.1) 至 小六 (P.6) 班級">
                {['1A','1B','1C','1D','2A','2B','2C','2D','3A','3B','3C','3D','4A','4B','4C','4D','5A','5B','5C','5D','6A','6B','6C','6D'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              請輸入班級安全密碼
            </label>
            <div className="relative">
              <input
                id="teacher-password-input"
                type="password"
                placeholder="請輸入班級管理密碼"
                className="w-full h-11 pl-10 pr-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-200 focus:outline-none text-slate-800 text-sm font-semibold"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="teacher-remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500"
            />
            <label htmlFor="teacher-remember-me" className="text-xs font-semibold text-slate-700 cursor-pointer">
              記住我的登入狀態
            </label>
          </div>

          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              id="btn-teacher-submit"
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black text-sm tracking-widest transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              {loading ? "進入管理授權中..." : "安全登入控制端"}
            </motion.button>
          </div>

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
      )}
    </motion.div>
  );
}
