import React from 'react';
import { getPublicAssetUrl } from '../../utils/assetHelper';

export interface PrintableDiarySheetProps {
  studentClass?: string;
  studentNumber?: string | number;
  studentName?: string;
  cycleNumber?: number;
  dateStr?: string;
  showSampleText?: boolean;
}

export const PrintableDiarySheet: React.FC<PrintableDiarySheetProps> = ({
  studentClass = '4A',
  studentNumber = '01',
  studentName = '陳大文',
  cycleNumber = 1,
  dateStr = '',
  showSampleText = false,
}) => {
  const formattedNo = String(studentNumber).padStart(2, '0');
  const qrData = `GCCPS|${studentClass}|${formattedNo}|CYCLE${cycleNumber}`;

  return (
    <div className="a4-sheet bg-white text-slate-900 mx-auto box-border p-[10mm] sm:p-[14mm] w-[210mm] min-h-[297mm] flex flex-col justify-between border border-slate-200 shadow-lg print:shadow-none print:border-none print:m-0 print:p-[10mm] relative font-sans">
      
      {/* 1. HEADER SECTION (SCHOOL BRANDING) */}
      <div className="border-b-2 border-indigo-700 pb-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={getPublicAssetUrl('/學校圖檔/學校logo/school_logo.png')} 
              alt="校徽" 
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="text-[17px] font-black tracking-tight text-slate-900 leading-tight">
                天主教善導小學 <span className="text-xs text-indigo-700 font-bold block sm:inline">Good Counsel Catholic Primary School</span>
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[13px] font-black text-indigo-900">🌱 4Rs 心靈成長與感恩日記</span>
                <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.2 rounded-full font-bold">
                  校訓：仁愛、忍耐
                </span>
              </div>
            </div>
          </div>

          {/* QR Code & Identification Badge */}
          <div className="flex items-center gap-2 border border-slate-300 bg-slate-50 p-1.5 rounded-lg text-right">
            <div className="flex flex-col text-[10px] font-black text-slate-700 leading-tight">
              <span>第 {cycleNumber * 2 - 1}-{cycleNumber * 2} 循環週</span>
              <span className="font-mono text-indigo-700">{studentClass} - {formattedNo}</span>
            </div>
            {/* Embedded SVG QR Simulation */}
            <div className="w-10 h-10 bg-white border border-slate-300 p-0.5 flex flex-col items-center justify-center rounded">
              <svg viewBox="0 0 24 24" className="w-full h-full fill-slate-900">
                <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm12 0h2v2h-2v-2zm-2 2h2v2h-2v-2zm4 0h2v2h-2v-2zm-2 2h2v2h-2v-2zm4 0h2v2h-2v-2zm-4-6h4v2h-4v-2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* STUDENT INFO FIELDS */}
        <div className="grid grid-cols-4 gap-2 mt-2 pt-2 border-t border-dashed border-slate-300 text-[12px] font-bold">
          <div className="flex items-center gap-1">
            <span className="text-slate-500">班別：</span>
            <span className="border-b border-slate-800 flex-1 text-center font-black">{studentClass}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">學號：</span>
            <span className="border-b border-slate-800 flex-1 text-center font-black">{formattedNo}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">姓名：</span>
            <span className="border-b border-slate-800 flex-1 text-center font-black">{studentName || '___________'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">日期：</span>
            <span className="border-b border-slate-800 flex-1 text-center font-black">{dateStr || '____年__月__日'}</span>
          </div>
        </div>
      </div>

      {/* 2. SECTION: MOOD WEATHER & 4Rs REFLECTION (TOP INTERACTIVE AREA) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 text-[11px]">
        {/* Mood Weather */}
        <div className="border border-indigo-100 bg-indigo-50/40 rounded-xl p-2.5">
          <div className="font-black text-indigo-900 mb-1.5 flex items-center gap-1">
            <span>🌈【今日心情天氣圖】(請圈選最符合的心情)</span>
          </div>
          <div className="flex items-center justify-between px-1 text-center font-bold text-[10px]">
            <div className="flex flex-col items-center">
              <span className="text-lg">☀️</span>
              <span>晴天(愉快)</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg">⛅</span>
              <span>多雲(平靜)</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg">🌧️</span>
              <span>雨天(難過)</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg">⛈️</span>
              <span>雷雨(憤怒)</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg">💨</span>
              <span>颳風(緊張)</span>
            </div>
          </div>
        </div>

        {/* 4Rs Focus Self-Check */}
        <div className="border border-amber-100 bg-amber-50/40 rounded-xl p-2.5">
          <div className="font-black text-amber-900 mb-1 flex items-center gap-1">
            <span>🌱【4Rs 本期微反思】(勾選你這兩週做得最棒的一項)</span>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] font-bold text-slate-700">
            <label className="flex items-center gap-1">
              <input type="checkbox" className="rounded" />
              <span>💤 <b>Rest</b> (充足睡眠休息)</span>
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" className="rounded" />
              <span>🎈 <b>Relaxation</b> (找到放鬆好方法)</span>
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" className="rounded" />
              <span>🤝 <b>Relationship</b> (與人友好相處)</span>
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" className="rounded" />
              <span>💪 <b>Resilience</b> (勇於面對挑戰)</span>
            </label>
          </div>
        </div>
      </div>

      {/* 3. SECTION: HANDWRITTEN DIARY WRITING AREA (WITH CLEAN LINES) */}
      <div className="flex-1 flex flex-col my-1 border border-slate-300 rounded-xl p-3 bg-white relative">
        <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-200">
          <div className="font-black text-slate-800 text-[12px] flex items-center gap-1.5">
            <span>📝【生活點滴與感恩隨筆】</span>
            <span className="text-[10px] text-slate-500 font-normal">
              (分享這兩週讓你印象深刻的一件事、感恩的人，或是克服困難的經過)
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-bold">字數建議：50～150字</span>
        </div>

        {/* Writing Guidelines & Lines */}
        <div className="flex-1 flex flex-col justify-between py-1 relative">
          {showSampleText ? (
            <div className="text-[13px] leading-[32px] text-slate-700 font-medium font-sans px-1">
              這兩週在常識科分組報告時，我和組員一開始為題目的選擇有些爭執。後來我們互相聆聽對方的想法，並在老師的指導下順利完成了報告。這讓我學會了同理心與忍耐，很感謝組員的包容與合作！下週的英文默書我會繼續加油。
            </div>
          ) : (
            Array.from({ length: 9 }).map((_, idx) => (
              <div 
                key={idx} 
                className="w-full border-b border-slate-200 h-[30px] flex items-center text-[10px] text-slate-300 select-none pl-1"
              >
                {idx === 0 && <span className="italic text-slate-400">請由此開始書寫……</span>}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. SECTION: MASCOTS ENCOURAGEMENT & SIGNATURE FOOTER */}
      <div className="pt-2 border-t border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
          
          {/* Mascot EnEn Cheer Quote */}
          <div className="flex items-center gap-2 bg-pink-50/60 border border-pink-200/60 rounded-xl p-2">
            <img 
              src={getPublicAssetUrl('/學校圖檔/吉祥物/enen_cheer.png')} 
              alt="恩恩加油" 
              className="w-10 h-10 object-contain flex-shrink-0"
            />
            <div className="text-[10px] leading-snug">
              <span className="font-black text-pink-900 block">恩恩為你喝采：</span>
              <span className="text-pink-800 font-bold">「只要相信自己、勇於嘗試，每一次反思都是閃閃發光的足跡！」</span>
            </div>
          </div>

          {/* Mascot EnEn Heart Quote */}
          <div className="flex items-center gap-2 bg-indigo-50/60 border border-indigo-200/60 rounded-xl p-2">
            <img 
              src={getPublicAssetUrl('/學校圖檔/吉祥物/enen_hearts.png')} 
              alt="恩恩祝福" 
              className="w-10 h-10 object-contain flex-shrink-0"
            />
            <div className="text-[10px] leading-snug">
              <span className="font-black text-indigo-900 block">恩恩的祝福：</span>
              <span className="text-indigo-800 font-bold">「常懷感恩與愛德，身邊處處都能發現美好與恩典！」</span>
            </div>
          </div>

        </div>

        {/* Signatures & Stamps */}
        <div className="grid grid-cols-2 gap-4 pt-1 text-[11px] font-bold text-slate-700">
          <div className="border border-dashed border-slate-300 rounded-lg p-2 h-14 flex flex-col justify-between">
            <span className="text-slate-500 text-[10px]">家長簽署 / 親職心語：</span>
            <span className="text-slate-400 text-right text-[10px]">日期：_____________</span>
          </div>
          <div className="border border-dashed border-slate-300 rounded-lg p-2 h-14 flex flex-col justify-between">
            <span className="text-slate-500 text-[10px]">班主任評語 / 愛心蓋印：</span>
            <span className="text-slate-400 text-right text-[10px]">日期：_____________</span>
          </div>
        </div>

        <div className="text-center text-[9px] text-slate-400 mt-1">
          天主教善導小學學生心理健康追蹤平台 • 4Rs 心靈成長計畫 • 本工作紙支援智能 OCR 自動建檔
        </div>
      </div>

    </div>
  );
};
