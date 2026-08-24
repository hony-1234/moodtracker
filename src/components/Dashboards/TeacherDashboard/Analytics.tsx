import React from 'react';
import { getMoodColor, MOOD_EMOJIS } from '../../../constants/moodConstants';

interface AnalyticsData {
  overallAvg: string;
  scoreFreq: Record<number, number>;
  processedClass: Array<{ name: string; avg: string; count: number }>;
  processedDates: Array<{ date: string; avg: string; count: number }>;
  totalRedThreats: number;
}

interface AnalyticsProps {
  reports: any[];
  analyticsData: AnalyticsData;
}

export const Analytics: React.FC<AnalyticsProps> = ({ reports, analyticsData }) => {
  return (
    <div className="space-y-6 font-sans">
      
      {/* Statistics Highlights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-4">
          <span className="text-4xl">🌤️</span>
          <div>
            <p className="text-xs font-bold text-slate-400 leading-none">全體平均心情得分</p>
            <h4 
              style={{ color: getMoodColor(analyticsData.overallAvg) }}
              className="text-3xl font-black mt-2 font-sans"
            >
              {analyticsData.overallAvg} <span className="text-xs text-slate-400">/ 10.0</span>
            </h4>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-4">
          <span className="text-4xl">📊</span>
          <div>
            <p className="text-xs font-bold text-slate-400 leading-none">累計報告總數</p>
            <h4 className="text-3xl font-black mt-2 text-blue-600 font-sans">{reports.length} <span className="text-xs text-slate-400">筆數據</span></h4>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-4">
          <span className="text-4xl">🚨</span>
          <div>
            <p className="text-xs font-bold text-slate-400 leading-none">觸發敏感言論次數</p>
            <h4 className="text-3xl font-black mt-2 text-red-600 font-sans">
              {analyticsData.totalRedThreats} <span className="text-xs text-slate-400">次檢出</span>
            </h4>
          </div>
        </div>
      </div>

      {/* SVG Graphics Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
        
        {/* Graphical line progress */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl">
          <div className="mb-4">
            <h4 className="text-sm font-black text-slate-800">📈 過去 7 填心情變動趨勢圖</h4>
            <p className="text-xs text-slate-400 mt-1 font-semibold">採用 7 填平均心情分佈動態。X軸代表日期，Y軸代表評分。</p>
          </div>

          <div className="h-64 flex items-end justify-between px-4 pt-10 border-b border-l border-slate-100 relative font-sans">
            {analyticsData.processedDates.map((pDay) => {
              const numericAvg = parseFloat(pDay.avg);
              const pctHeight = (numericAvg / 10) * 100;
              return (
                <div 
                  key={pDay.date}
                  className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer relative"
                >
                  <span className="text-[10px] font-black text-indigo-700 opacity-0 group-hover:opacity-100 absolute -top-4 transition-opacity whitespace-nowrap">
                    {pDay.avg}分 ({pDay.count}人)
                  </span>
                  <div 
                    style={{ height: `${pctHeight}%`, backgroundColor: getMoodColor(pDay.avg) }}
                    className="w-8 rounded-t-lg transition-all duration-300 shadow"
                  />
                  <span className="text-[10px] text-slate-400 font-bold mt-2 font-sans">
                    {pDay.date.split('/').slice(1).join('/')}
                  </span>
                </div>
              );
            })}
            {analyticsData.processedDates.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-sans">
                不足以分析今日與昨日數據
              </div>
            )}
          </div>
        </div>

        {/* Graphical Bar distribution */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl">
          <div className="mb-4">
            <h4 className="text-sm font-black text-slate-800">📊 心情指數分佈頻率直方圖</h4>
            <p className="text-xs text-slate-400 mt-1 font-semibold">1 - 10 每個分值對應的填寫人次累加圖表。</p>
          </div>

          <div className="space-y-3 font-sans">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => {
              const cnt = analyticsData.scoreFreq[val] || 0;
              const maxCount = Math.max(...(Object.values(analyticsData.scoreFreq) as number[]), 1);
              const pctWidth = (cnt / maxCount) * 100;

              return (
                <div key={val} className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-slate-500 w-12 text-right">
                    {val} 分 {MOOD_EMOJIS[val]?.emoji}
                  </span>
                  <div className="flex-1 bg-slate-100 h-6 rounded-lg overflow-hidden relative">
                    <div 
                      style={{ width: `${pctWidth}%`, backgroundColor: getMoodColor(val) }}
                      className="h-full rounded-r transition-all duration-300"
                    />
                    <span className="absolute left-2 top-1 text-[10px] font-extrabold text-[#1E293B]">
                      {cnt} 筆記錄
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Grid Class summary board */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl font-sans">
        <h4 className="text-sm font-black text-[#1E293B] mb-4">🏛️ 各登錄班級情绪動態均分排名</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {analyticsData.processedClass.map(pC => (
            <div key={pC.name} className="p-4 border border-slate-100 rounded-xl bg-slate-50 text-center">
              <span className="text-[11px] font-extrabold text-[#64748B] block">{pC.name} 班</span>
              <h5 
                style={{ color: getMoodColor(pC.avg) }}
                className="text-xl font-bold mt-1.5 font-sans"
              >
                {pC.avg}
              </h5>
              <span className="text-[10px] text-slate-300 font-semibold font-sans">{pC.count} 筆登記</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
