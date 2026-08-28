import React from 'react';
import { Activity, HelpCircle, LogOut } from 'lucide-react';
import { getPublicAssetUrl } from '../../utils/assetHelper';

interface HeaderProps {
  viewState: string;
  selectedClass: string;
  activeStudentNumber: string;
  setGuideModalVisible: (visible: boolean) => void;
  handleLogout: () => void;
}

export default function Header({
  viewState,
  selectedClass,
  activeStudentNumber,
  setGuideModalVisible,
  handleLogout,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0]/80 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-2xs">
      <div className="flex items-center space-x-3.5">
        <div className="relative flex-shrink-0 w-11 h-11 bg-indigo-50 rounded-xl overflow-hidden shadow-sm flex items-center justify-center border border-indigo-100">
          <img
            src={getPublicAssetUrl("/學校圖檔/學校logo/school_logo.png")}
            alt="天主教善導小學 校徽"
            className="w-9 h-9 object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
              const parent = (e.target as HTMLElement).parentElement;
              if (parent) {
                parent.className = "bg-indigo-600 text-white p-2.5 rounded-xl shadow-md flex items-center justify-center";
                const iconHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-pulse"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`;
                parent.innerHTML = iconHTML;
              }
            }}
          />
        </div>
        <div>
          <h1 className="text-base md:text-lg font-black tracking-tight text-[#0F172A] flex flex-wrap items-center gap-x-1.5 leading-tight">
            <span>天主教善導小學</span>
            <span className="text-indigo-600 font-extrabold">心情加油站</span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold border border-indigo-100">校園版</span>
          </h1>
          <p className="text-[11px] text-[#64748B] font-bold hidden sm:flex items-center gap-1.5 mt-0.5">
            <span>學生心理健康追蹤平台</span>
            <span className="text-[#CBD5E1]">•</span>
            <span className="text-indigo-600/90 font-black">校訓：仁愛、忍耐</span>
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2.5">
        {/* 💡 How to Use Guide button, always visible in upper right */}
        <button
          onClick={() => setGuideModalVisible(true)}
          className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 px-3.5 py-2 rounded-xl text-xs font-black transition-all border border-amber-200 cursor-pointer shadow-3xs"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="hidden sm:inline">💡 使用指南</span>
        </button>

        {viewState !== 'LANDING' && (
          <div className="flex items-center space-x-2.5">
            <span className="hidden sm:inline-block text-sm font-bold text-[#475569] bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              {viewState.includes('TEACHER') ? "🏫 教師權限 ：" : "🎒 學生通道 ："}
              <span className="text-blue-600 ml-1">{selectedClass || "未登入"}</span>
              {activeStudentNumber && <span className="text-indigo-600 ml-1">({activeStudentNumber} 號)</span>}
            </span>
            <button
              id="btn-logout"
              onClick={handleLogout}
              className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-xl text-xs font-bold transition-all border border-red-200 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              登出
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
