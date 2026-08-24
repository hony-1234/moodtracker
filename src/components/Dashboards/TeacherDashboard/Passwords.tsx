import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Key, Users, RotateCcw, Trash2, Clipboard, Shield, CheckCircle, Info } from 'lucide-react';
import { ALL_CLASSES } from '../../../constants/moodConstants';

interface PasswordsProps {
  passwordsData: Record<string, string>;
  setPasswordsData: (data: Record<string, string>) => void;
  editingStudentPasswords: Record<string, string>;
  setEditingStudentPasswords: (data: Record<string, string>) => void;
  currentEditClass: string;
  setCurrentEditClass: (cls: string) => void;
  handleSavePasswords: () => Promise<void>;
  handleSaveStudentPasswords: () => Promise<void>;
  isSavingPass: boolean;
}

export const Passwords: React.FC<PasswordsProps> = ({
  passwordsData,
  setPasswordsData,
  editingStudentPasswords,
  setEditingStudentPasswords,
  currentEditClass,
  setCurrentEditClass,
  handleSavePasswords,
  handleSaveStudentPasswords,
  isSavingPass,
}) => {
  const [passTab, setPassTab] = useState<'CLASS' | 'STUDENT'>('CLASS');

  // Handle prefix generation e.g. "4a01", "4a02"...
  const handleGeneratePrefixPattern = () => {
    const clsPrefix = currentEditClass.toLowerCase();
    const updated = { ...editingStudentPasswords };
    for (let i = 1; i <= 30; i++) {
      updated[String(i)] = `${clsPrefix}${String(i).padStart(2, '0')}`;
    }
    setEditingStudentPasswords(updated);
  };

  // Handle 6 digit pin generation
  const handleGenerateRandomPINs = () => {
    const updated = { ...editingStudentPasswords };
    for (let i = 1; i <= 30; i++) {
      const rand = Math.floor(100000 + Math.random() * 900000);
      updated[String(i)] = String(rand);
    }
    setEditingStudentPasswords(updated);
  };

  // Clear student custom passwords
  const handleClearStudentPasswords = () => {
    if (window.confirm(`⚠️ 確定要清除 ${currentEditClass} 的所有個別學生的密碼嗎？(清除後將沿用班級通用金鑰)`)) {
      const empty: Record<string, string> = {};
      for (let i = 1; i <= 30; i++) {
        empty[String(i)] = '';
      }
      setEditingStudentPasswords(empty);
    }
  };

  // Smart Clipboard Parser
  const handleClipboardPaste = (text: string) => {
    const lines = text.split(/[\r\n\t,]+/).map(v => v.trim()).filter(v => v !== '');
    if (lines.length > 0) {
      const updated = { ...editingStudentPasswords };
      lines.forEach((val, index) => {
        const sNo = index + 1;
        if (sNo <= 30) {
          updated[String(sNo)] = val;
        }
      });
      setEditingStudentPasswords(updated);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6 font-sans"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h4 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-500" />
            密碼管控中心 (Excel 級管理)
          </h4>
          <p className="text-xs text-slate-400 mt-1 font-semibold">
            對全校班級的安全防護金鑰進行修改，或為高年級 (P.4-P.6) 與 TEST 帳號設定學生個人專屬密碼。
          </p>
        </div>
        
        {/* Tab Selector */}
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl flex-shrink-0">
          <button
            type="button"
            onClick={() => setPassTab('CLASS')}
            className={`text-[10.5px] font-black px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              passTab === 'CLASS'
                ? 'bg-white text-slate-800 shadow-3xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            🏫 班級通用金鑰 Matrix
          </button>
          <button
            type="button"
            onClick={() => setPassTab('STUDENT')}
            className={`text-[10.5px] font-black px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              passTab === 'STUDENT'
                ? 'bg-emerald-600 text-white shadow-3xs'
                : 'text-slate-500 hover:text-emerald-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            📊 學生個人個別密碼 (Excel)
          </button>
        </div>
      </div>

      {passTab === 'CLASS' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ALL_CLASSES.map(cls => (
              <div key={cls} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center gap-2">
                <span className="text-xs font-black text-slate-600">{cls} 班密碼</span>
                <input
                  type="text"
                  className={`h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-center w-full focus:ring-2 focus:ring-slate-300 focus:outline-none ${(passwordsData[cls] || '').startsWith('sha256:') ? 'text-slate-400 placeholder-slate-400 font-serif' : 'text-slate-800'}`}
                  value={(passwordsData[cls] || '').startsWith('sha256:') ? '●●●●●●' : passwordsData[cls] || ''}
                  onChange={(e) => {
                    const inputVal = e.target.value;
                    const prevVal = passwordsData[cls] || '';
                    if (prevVal.startsWith('sha256:') && inputVal !== '●●●●●●') {
                      let newVal = inputVal;
                      if (inputVal.startsWith('●●●●●●')) {
                        newVal = inputVal.substring(6);
                      } else if (inputVal.endsWith('●●●●●●')) {
                        newVal = inputVal.substring(0, inputVal.length - 6);
                      }
                      setPasswordsData({ ...passwordsData, [cls]: newVal });
                    } else {
                      setPasswordsData({ ...passwordsData, [cls]: inputVal });
                    }
                  }}
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleSavePasswords}
            disabled={isSavingPass}
            className="w-full h-12 bg-[#9333EA] hover:bg-[#7e22ce] disabled:bg-slate-300 text-white rounded-xl font-black text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSavingPass ? "正在批量上傳變更中..." : "💾 儲存並批量覆寫全班防護密碼"}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Class Selector for individual management */}
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-black text-slate-600">選擇要設定的班級:</span>
              <select 
                value={currentEditClass} 
                onChange={(e) => setCurrentEditClass(e.target.value)}
                className="h-10 px-3 bg-white border border-slate-200 rounded-xl font-black text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 cursor-pointer"
              >
                {['4A','4B','4C','4D','5A','5B','5C','5D','6A','6B','6C','6D','TEST'].map(c => (
                  <option key={c} value={c}>{c === 'TEST' ? 'TEST 測試帳號' : `${c} 班`}</option>
                ))}
              </select>
            </div>

            {/* Excel Helper Tools */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleGeneratePrefixPattern}
                className="bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-[10px] font-black px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              >
                <Key className="w-3 h-3" />
                拼裝模式 (如 {currentEditClass.toLowerCase()}01)
              </button>
              <button
                type="button"
                onClick={handleGenerateRandomPINs}
                className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-black px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                隨機生成 6 碼數字
              </button>
              <button
                type="button"
                onClick={handleClearStudentPasswords}
                className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-[10px] font-black px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                ⚠️ 批量清空個別密碼
              </button>
            </div>
          </div>

          {/* Clipboard Import TextArea */}
          <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="text-[11px] font-black text-slate-800 flex items-center gap-1.5">
                <Clipboard className="w-4 h-4 text-emerald-600" />
                📋 從 Excel / Google Sheets 一鍵智能複製貼上
              </h5>
              <span className="text-[9px] bg-emerald-100 text-[#107C41] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                EXCEL 級貼上
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
              在 Excel 挑選 1 列/欄學生密碼按下 <kbd className="bg-white border px-1 rounded text-[9px] shadow-3xs font-bold">Ctrl+C</kbd>，直接連擊下方文字框按 <kbd className="bg-white border px-1 rounded text-[9px] shadow-3xs font-bold">Ctrl+V</kbd>！系統會全自動按 1-30 號依序批量覆寫，極度省時。
            </p>
            <textarea
              placeholder="在此連擊貼上 (支援換行、逗號或 Tab 分隔)"
              className="w-full h-11 p-2 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-[10px] focus:outline-none focus:ring-1 focus:ring-[#107C41] font-mono text-slate-700 resize-none"
              onChange={(e) => {
                handleClipboardPaste(e.target.value);
                e.target.value = ''; // Auto reset for ease of use
              }}
            />
          </div>

          {/* Dense Excel Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Column 1: Nos 1-15 */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-3xs">
              <table className="w-full text-xs font-bold text-slate-700">
                <thead className="bg-[#107C41] text-white text-center">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-[#107C41]/20 w-16 text-center">學號</th>
                    <th className="py-2.5 px-3 text-left">個別登入密碼 (留空沿用班級)</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 15 }, (_, i) => i + 1).map(num => {
                    const sNo = String(num);
                    return (
                      <tr key={sNo} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-1.5 px-3 bg-slate-50 text-center border-r border-slate-200 text-[#475569] font-black">{sNo}</td>
                        <td className="p-1">
                          <input
                            type="text"
                            placeholder="留空即使用公用密碼"
                            className={`w-full h-7 px-2 border border-transparent hover:border-slate-200 bg-transparent focus:bg-white focus:border-[#107C41] rounded text-[11px] font-extrabold focus:outline-none placeholder:text-[9.5px] placeholder:font-normal ${(editingStudentPasswords[sNo] || '').startsWith('sha256:') ? 'text-slate-400 font-serif' : 'text-slate-800'}`}
                            value={(editingStudentPasswords[sNo] || '').startsWith('sha256:') ? '●●●●●●' : editingStudentPasswords[sNo] || ''}
                            onChange={(e) => {
                              const inputVal = e.target.value;
                              const prevVal = editingStudentPasswords[sNo] || '';
                              if (prevVal.startsWith('sha256:') && inputVal !== '●●●●●●') {
                                let newVal = inputVal;
                                if (inputVal.startsWith('●●●●●●')) {
                                  newVal = inputVal.substring(6);
                                } else if (inputVal.endsWith('●●●●●●')) {
                                  newVal = inputVal.substring(0, inputVal.length - 6);
                                }
                                setEditingStudentPasswords({ ...editingStudentPasswords, [sNo]: newVal });
                              } else {
                                setEditingStudentPasswords({ ...editingStudentPasswords, [sNo]: inputVal });
                              }
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Column 2: Nos 16-30 */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-3xs">
              <table className="w-full text-xs font-bold text-slate-700">
                <thead className="bg-[#107C41] text-white text-center">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-[#107C41]/20 w-16 text-center">學號</th>
                    <th className="py-2.5 px-3 text-left">個別登入密碼 (留空沿用班級)</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 15 }, (_, i) => i + 16).map(num => {
                    const sNo = String(num);
                    return (
                      <tr key={sNo} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-1.5 px-3 bg-slate-50 text-center border-r border-slate-200 text-[#475569] font-black">{sNo}</td>
                        <td className="p-1">
                          <input
                            type="text"
                            placeholder="留空即使用公用密碼"
                            className={`w-full h-7 px-2 border border-transparent hover:border-slate-200 bg-transparent focus:bg-white focus:border-[#107C41] rounded text-[11px] font-extrabold focus:outline-none placeholder:text-[9.5px] placeholder:font-normal ${(editingStudentPasswords[sNo] || '').startsWith('sha256:') ? 'text-slate-400 font-serif' : 'text-slate-800'}`}
                            value={(editingStudentPasswords[sNo] || '').startsWith('sha256:') ? '●●●●●●' : editingStudentPasswords[sNo] || ''}
                            onChange={(e) => {
                              const inputVal = e.target.value;
                              const prevVal = editingStudentPasswords[sNo] || '';
                              if (prevVal.startsWith('sha256:') && inputVal !== '●●●●●●') {
                                let newVal = inputVal;
                                if (inputVal.startsWith('●●●●●●')) {
                                  newVal = inputVal.substring(6);
                                } else if (inputVal.endsWith('●●●●●●')) {
                                  newVal = inputVal.substring(0, inputVal.length - 6);
                                }
                                setEditingStudentPasswords({ ...editingStudentPasswords, [sNo]: newVal });
                              } else {
                                setEditingStudentPasswords({ ...editingStudentPasswords, [sNo]: inputVal });
                              }
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-2.5 text-xs text-slate-500 font-semibold">
            <Info className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <p>
              當為某個座號設定個別登入密碼後，該學生將只能透過其專屬密碼登入（即使班級公用密鑰正確也無法登入其座號），藉此提供更高階的隱私安全保障。若需要解除限制，點選個別學號輸入欄按 Backspace 留空儲存，或點選上方「批量清空」即可。
            </p>
          </div>

          {/* Submit Individual class button */}
          <button
            onClick={handleSaveStudentPasswords}
            disabled={isSavingPass}
            className="w-full h-12 bg-[#107C41] hover:bg-[#0E6C38] disabled:bg-slate-300 text-white rounded-xl font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSavingPass ? "正在儲存個別密碼試算表" : `💾 儲存已更新的 ${currentEditClass} 班級學生個別密碼 (Excel)`}
          </button>
        </div>
      )}
    </motion.div>
  );
};
