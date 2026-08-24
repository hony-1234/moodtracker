import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Search, RefreshCw, Terminal, Clock, Monitor } from 'lucide-react';

interface AuditLogItem {
  id: string;
  class: string;
  device?: string;
  timestamp?: {
    seconds?: number;
    nanoseconds?: number;
  } | any;
}

interface AuditLogsProps {
  loginHistory: AuditLogItem[];
  onRefresh?: () => void;
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ loginHistory, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = loginHistory.filter(log => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.class.toLowerCase().includes(term) ||
      (log.device || '').toLowerCase().includes(term)
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="bg-white border border-slate-200 p-6 rounded-2xl space-y-5 font-sans"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h4 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600 animate-pulse" />
            🕒 校園管理終端安全登入歷史紀錄
          </h4>
          <p className="text-xs text-slate-400 mt-1 font-semibold">
            顯示最近 55 次的管理者與導師端登陸，用於稽核校園資訊防護與追蹤越權存取。
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-black px-3.5 py-2 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            重載數據
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-150 rounded-xl px-3 py-2">
        <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="依登入班別、帳號或登入載體設備進行過濾..."
          className="bg-transparent border-none text-xs font-semibold focus:outline-none w-full text-slate-700 placeholder:text-slate-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Timeline of Logs */}
      <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
        {filteredHistory.map((audit, index) => {
          let dateStr = "未知時間";
          if (audit.timestamp) {
            if (audit.timestamp.seconds) {
              dateStr = new Date(audit.timestamp.seconds * 1000).toLocaleString();
            } else if (audit.timestamp instanceof Date) {
              dateStr = audit.timestamp.toLocaleString();
            } else if (typeof audit.timestamp === 'string') {
              dateStr = new Date(audit.timestamp).toLocaleString();
            } else if (typeof audit.timestamp === 'number') {
              dateStr = new Date(audit.timestamp).toLocaleString();
            }
          }

          const isGCCPS = audit.class === 'GCCPS';

          return (
            <div
              key={audit.id || index}
              className="p-4 border border-slate-100 bg-slate-50/40 hover:bg-slate-50 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3.5 transition-all shadow-3xs"
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className={`p-2 rounded-lg flex-shrink-0 ${isGCCPS ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-black text-xs px-2 py-0.5 rounded ${isGCCPS ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                      {audit.class} {isGCCPS ? '全校安全官' : '導師帳號'} 登入成功
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                      <Monitor className="w-3 h-3 text-slate-300" />
                      設備載體: {audit.device || "網頁控制端"}
                    </span>
                  </div>
                  {audit.device && (
                    <p className="text-[9.5px] text-slate-400 mt-1 font-mono leading-tight max-w-xl break-all">
                      {audit.device}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-slate-400 font-extrabold text-[10.5px] sm:text-right flex-shrink-0">
                <Clock className="w-3.5 h-3.5 text-slate-350" />
                <span>{dateStr}</span>
              </div>
            </div>
          );
        })}

        {filteredHistory.length === 0 && (
          <div className="text-center py-12">
            <span className="text-3xl block mb-2">🔍</span>
            <p className="text-slate-400 font-black text-xs">沒有找到相符合的安全稽核紀錄。</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
export default AuditLogs;
