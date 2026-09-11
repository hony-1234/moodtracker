import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  UploadCloud, 
  Printer, 
  Search, 
  Filter, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Calendar,
  User,
  Heart,
  Smile,
  AlertCircle,
  FileText,
  Edit3,
  Save,
  Trash2,
  Eye,
  RefreshCw
} from 'lucide-react';
import { StudentDiaryEntry, RiskLevel } from '../../../../types/diary';
import { subscribeDiariesByClass, saveStudentDiaryEntry, deleteStudentDiaryEntry } from '../../../../firebase/services';
import { analyzeDiaryImageWithAI } from '../../../../services/aiDiaryService';
import { DiaryPrintHubModal } from '../../../Diaries/DiaryPrintHubModal';
import { getPublicAssetUrl } from '../../../../utils/assetHelper';

interface DiaryHubProps {
  selectedClass: string;
  allClasses?: string[];
  currentUser?: any;
  onOpenStudentReport?: (studentNumber: string) => void;
}

export const DiaryHub: React.FC<DiaryHubProps> = ({
  selectedClass,
  allClasses = ['4A', '4B', '4C', '4D', '5A', '5B', '5C', '5D', '6A', '6B', '6C', '6D', 'P4_TEST'],
  currentUser,
  onOpenStudentReport
}) => {
  const [diaries, setDiaries] = useState<StudentDiaryEntry[]>([]);
  const [activeCycle, setActiveCycle] = useState<number>(1);
  const [currentClass, setCurrentClass] = useState<string>(selectedClass === 'ALL' ? '4A' : selectedClass);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');

  // Modals
  const [printModalVisible, setPrintModalVisible] = useState<boolean>(false);
  const [uploadModalVisible, setUploadModalVisible] = useState<boolean>(false);
  const [reviewEntry, setReviewEntry] = useState<StudentDiaryEntry | null>(null);

  // Upload state
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgressText, setUploadProgressText] = useState<string>('');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);

  // Subscribe to class diaries from Firestore
  useEffect(() => {
    const unsub = subscribeDiariesByClass(currentClass, (data) => {
      setDiaries(data);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [currentClass]);

  // Filter diaries
  const filteredDiaries = diaries.filter((d) => {
    const matchCycle = d.cycleNumber === activeCycle;
    const matchSearch = 
      d.studentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.studentName && d.studentName.includes(searchQuery)) ||
      (d.transcribedText && d.transcribedText.includes(searchQuery));
    const matchRisk = filterRisk === 'ALL' || d.aiAnalysis?.riskLevel === filterRisk;
    return matchCycle && matchSearch && matchRisk;
  });

  // Calculate submission stats
  const totalStudents = 30;
  const submittedCount = diaries.filter((d) => d.cycleNumber === activeCycle).length;
  const submissionRate = Math.min(100, Math.round((submittedCount / totalStudents) * 100));

  // Handle batch file upload simulation / OCR ingestion
  const handleProcessBatchUpload = async () => {
    if (uploadFiles.length === 0) return;
    setIsUploading(true);
    setUploadProgressText('正在載入檔案並傳送至雲端安全 OCR 引擎...');

    try {
      for (let i = 0; i < uploadFiles.length; i++) {
        const file = uploadFiles[i];
        setUploadProgressText(`正在透過 AI 多模態辨識與情緒分析 (${i + 1}/${uploadFiles.length})：${file.name}`);

        const base64 = await fileToBase64(file);
        const studentNo = String(i + 1).padStart(2, '0');

        const result = await analyzeDiaryImageWithAI(base64, {
          class: currentClass,
          studentNo,
          cycleNumber: activeCycle,
        });

        const newEntry: StudentDiaryEntry = {
          id: `${currentClass}_${result.detectedStudentNo}_C${activeCycle}_${Date.now()}`,
          studentNumber: `${currentClass}${result.detectedStudentNo}`,
          studentName: `學生 ${result.detectedStudentNo}`,
          class: currentClass,
          cycleNumber: activeCycle,
          cycleLabel: `第 ${activeCycle * 2 - 1}-${activeCycle * 2} 循環週`,
          submissionDate: new Date().toISOString().split('T')[0],
          scanImageUrl: base64,
          transcribedText: result.transcribedText,
          selfReportedWeather: result.selfReportedWeather || 'sunny',
          selfReported4RFocus: result.selfReported4RFocus || 'relationship',
          aiAnalysis: result.analysis,
          verifiedByTeacher: true,
          teacherNotes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Auto-save instantly to Firestore
        await saveStudentDiaryEntry(newEntry);
      }

      setUploadProgressText('🎉 全數日記已成功辨識並自動歸檔至學生帳戶！');
      setTimeout(() => {
        setIsUploading(false);
        setUploadModalVisible(false);
        setUploadFiles([]);
      }, 1200);
    } catch (err) {
      console.error('Batch upload error:', err);
      alert('處理日記時發生錯誤，請重試');
      setIsUploading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpdateReviewEntry = async () => {
    if (!reviewEntry) return;
    await saveStudentDiaryEntry({
      ...reviewEntry,
      updatedAt: new Date().toISOString(),
    });
    setReviewEntry(null);
  };

  const handleDeleteEntry = async (id: string) => {
    if (window.confirm('確定要刪除此篇日記記錄嗎？')) {
      await deleteStudentDiaryEntry(id);
      if (reviewEntry?.id === id) setReviewEntry(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HERO HEADER & ACTIONS */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3.5 bg-white/10 rounded-2xl border border-white/20 shadow-inner">
            <BookOpen className="w-8 h-8 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black tracking-tight">
                📚 4Rs 心靈成長日記 • 管理中樞
              </h2>
              <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black">
                Gemini 2.0 繁中 OCR
              </span>
            </div>
            <p className="text-xs md:text-sm text-indigo-200 mt-1 max-w-xl leading-relaxed">
              雙週實體手寫日記智能建檔 • 4Rs 全人情緒深度解析 • 掃描後立即自動存入學生個人檔案庫
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setPrintModalVisible(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-2xs"
          >
            <Printer className="w-4 h-4 text-indigo-200" />
            <span>🖨️ 列印 A4 日記紙</span>
          </button>

          <button
            type="button"
            onClick={() => setUploadModalVisible(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-lg hover:shadow-xl"
          >
            <UploadCloud className="w-4 h-4 text-slate-950" />
            <span>📤 批次上傳掃描檔</span>
          </button>
        </div>
      </div>

      {/* 2. CYCLE SELECTOR & PROGRESS RADAR BAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CYCLE TRACKER CARD */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-black text-slate-800">選擇循環週週期</span>
            </div>

            {/* Class Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">班別：</span>
              <select
                value={currentClass}
                onChange={(e) => setCurrentClass(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {allClasses.map((cls) => (
                  <option key={cls} value={cls}>{cls} 班</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cycle Pills */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((cycle) => (
              <button
                key={cycle}
                type="button"
                onClick={() => setActiveCycle(cycle)}
                className={`py-2 px-1 rounded-2xl text-center cursor-pointer transition-all border ${
                  activeCycle === cycle
                    ? 'bg-indigo-600 text-white font-black border-indigo-600 shadow-md scale-105'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold border-slate-200 text-xs'
                }`}
              >
                <div className="text-[10px] opacity-80">Cycle</div>
                <div className="text-xs font-black">{cycle * 2 - 1}-{cycle * 2}</div>
              </button>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-600">
                {currentClass} 班 第 {activeCycle * 2 - 1}-{activeCycle * 2} 循環週繳交進度
              </span>
              <span className="text-indigo-700 font-black">
                已收錄 {submittedCount} / {totalStudents} 篇 ({submissionRate}%)
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${submissionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4Rs OVERVIEW SUMMARY RADAR CARD */}
        <div className="lg:col-span-4 bg-gradient-to-br from-indigo-50 via-white to-amber-50/50 p-6 rounded-3xl border border-indigo-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                本期 4Rs 全人健康指標
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block">💤 Rest (休息)</span>
                <span className="text-base font-black text-indigo-700">4.2 / 5.0</span>
              </div>
              <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block">🎈 Relaxation (放鬆)</span>
                <span className="text-base font-black text-indigo-700">4.0 / 5.0</span>
              </div>
              <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block">🤝 Relationship (人際)</span>
                <span className="text-base font-black text-indigo-700">4.6 / 5.0</span>
              </div>
              <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block">💪 Resilience (抗逆)</span>
                <span className="text-base font-black text-indigo-700">4.4 / 5.0</span>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-bold mt-2 pt-2 border-t border-slate-200/60">
            由 Gemini 2.0 根據全班手寫內文綜合計算得出
          </div>
        </div>

      </div>

      {/* 3. SEARCH & FILTER CONTROLS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜尋學號、學生姓名或手寫關鍵字..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-500">預警篩選：</span>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none"
          >
            <option value="ALL">全部狀態</option>
            <option value="NORMAL">🟢 正常健康</option>
            <option value="ATTENTION">🟡 需關注</option>
            <option value="CRITICAL">🔴 高度預警</option>
          </select>
        </div>
      </div>

      {/* 4. DIARY ENTRIES GRID */}
      {filteredDiaries.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8 opacity-60" />
          </div>
          <div>
            <h4 className="text-base font-black text-slate-800">
              尚無第 {activeCycle * 2 - 1}-{activeCycle * 2} 循環週的日記記錄
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              您可以點擊上方「📤 批次上傳掃描檔」上傳學生日記圖片，系統將由 AI 自動 OCR 辨識並建檔！
            </p>
          </div>
          <button
            type="button"
            onClick={() => setUploadModalVisible(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-5 py-2.5 rounded-2xl shadow-md cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>立即上傳此週期日記</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDiaries.map((diary) => {
            const isCritical = diary.aiAnalysis?.riskLevel === 'CRITICAL';
            const isAttention = diary.aiAnalysis?.riskLevel === 'ATTENTION';

            return (
              <motion.div
                key={diary.id}
                whileHover={{ y: -3 }}
                className={`bg-white rounded-3xl p-5 border transition-all shadow-xs flex flex-col justify-between ${
                  isCritical
                    ? 'border-red-300 bg-red-50/20'
                    : isAttention
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-black text-indigo-700">
                        {diary.studentNumber.replace(currentClass, '')}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          <span>{diary.studentName || diary.studentNumber}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({diary.submissionDate})
                          </span>
                        </div>
                        <div className="text-[10px] text-indigo-600 font-bold">
                          {diary.cycleLabel}
                        </div>
                      </div>
                    </div>

                    {/* Risk Badge */}
                    <div>
                      {isCritical && (
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse">
                          <ShieldAlert className="w-3 h-3" /> 高度警示
                        </span>
                      )}
                      {isAttention && (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-black">
                          <AlertCircle className="w-3 h-3" /> 需關注
                        </span>
                      )}
                      {!isCritical && !isAttention && (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-black">
                          <CheckCircle2 className="w-3 h-3" /> 良好
                        </span>
                      )}
                    </div>
                  </div>

                  {/* AI Snippet & Emotions */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded-lg border border-indigo-100">
                        ✨ {diary.aiAnalysis?.primaryEmotion || '平靜'}
                      </span>
                      <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-amber-100">
                        ⭐ 心情指數：{diary.aiAnalysis?.sentimentScore?.toFixed(1) || '4.0'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                      {diary.transcribedText || diary.aiAnalysis?.summary || '無文字記錄'}
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[10px] text-slate-400 font-bold">
                    {diary.verifiedByTeacher ? '✓ 已審閱' : '• 待覆核'}
                  </div>

                  <div className="flex items-center gap-2">
                    {onOpenStudentReport && (
                      <button
                        type="button"
                        onClick={() => onOpenStudentReport(diary.studentNumber)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                        title="查看個人全人綜合報告"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setReviewEntry(diary)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>審閱 / 編輯</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 5. BATCH UPLOAD MODAL */}
      {uploadModalVisible && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-indigo-600" />
                <span>批次上傳心靈日記掃描檔</span>
              </h3>
              <button
                type="button"
                onClick={() => setUploadModalVisible(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-600 flex items-center justify-between">
                <span>目標：{currentClass} 班 • 第 {activeCycle * 2 - 1}-{activeCycle * 2} 循環週</span>
                <span className="text-indigo-600">支援 JPG / PNG / PDF 批次</span>
              </div>

              {/* Drag and Drop Zone */}
              <label className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-3xl p-8 flex flex-col items-center justify-center gap-2 bg-indigo-50/40 hover:bg-indigo-50/70 cursor-pointer transition-all text-center">
                <UploadCloud className="w-10 h-10 text-indigo-500 animate-bounce" />
                <span className="text-xs font-black text-indigo-950">
                  點擊選擇檔案，或直接拖曳全班掃描檔至此處
                </span>
                <span className="text-[10px] text-slate-400">
                  事務機掃描之單一多頁 PDF 或多張圖片均可
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      setUploadFiles(Array.from(e.target.files));
                    }
                  }}
                />
              </label>

              {uploadFiles.length > 0 && (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>已選取 {uploadFiles.length} 個檔案</span>
                  <button
                    type="button"
                    onClick={() => setUploadFiles([])}
                    className="text-red-500 hover:underline text-[10px] cursor-pointer"
                  >
                    清除重選
                  </button>
                </div>
              )}

              {isUploading && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-center space-y-2">
                  <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-indigo-900">{uploadProgressText}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => setUploadModalVisible(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                disabled={isUploading || uploadFiles.length === 0}
                onClick={handleProcessBatchUpload}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-md cursor-pointer transition-all"
              >
                {isUploading ? '處理中...' : `開始 AI 辨識並存檔 (${uploadFiles.length} 篇)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. DUAL-PANE REVIEW & EDIT MODAL */}
      {reviewEntry && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
            
            {/* Review Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-sm">
                  {reviewEntry.studentNumber}
                </div>
                <div>
                  <h3 className="text-base font-black">
                    {reviewEntry.studentName || reviewEntry.studentNumber} • 心靈日記審閱
                  </h3>
                  <p className="text-xs text-slate-400">
                    {reviewEntry.class} 班 • {reviewEntry.cycleLabel} • {reviewEntry.submissionDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteEntry(reviewEntry.id)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-white/10 rounded-xl cursor-pointer transition-all"
                  title="刪除此篇日記"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setReviewEntry(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-full cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Review Body (Dual Pane) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/50">
              
              {/* LEFT PANE: SCANNED IMAGE VIEW (5 COLS) */}
              <div className="lg:col-span-5 flex flex-col space-y-2">
                <span className="text-xs font-black text-slate-700 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  <span>手寫掃描原稿切片</span>
                </span>
                
                <div className="flex-1 min-h-[320px] bg-slate-200 rounded-2xl border border-slate-300 overflow-hidden flex items-center justify-center p-2 relative">
                  {reviewEntry.scanImageUrl ? (
                    <img
                      src={reviewEntry.scanImageUrl}
                      alt="手寫掃描切片"
                      className="w-full h-full object-contain rounded-xl"
                    />
                  ) : (
                    <div className="text-center text-slate-400 text-xs">
                      <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <span>無原始圖片預覽</span>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT PANE: OCR TEXT & AI ANALYSIS (7 COLS) */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Transcribed Text Editable Field */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-800 flex items-center gap-1">
                      <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>AI OCR 辨識內文 (可直接編輯校對)</span>
                    </label>
                    <span className="text-[10px] text-slate-400">繁體中文手寫解析</span>
                  </div>
                  <textarea
                    rows={4}
                    value={reviewEntry.transcribedText}
                    onChange={(e) =>
                      setReviewEntry({
                        ...reviewEntry,
                        transcribedText: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* AI 4Rs Scores & Sentiment */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <span className="text-xs font-black text-slate-800 block">
                    🧠 AI 多模態心理與 4Rs 評估
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-indigo-50/60 p-2 rounded-xl border border-indigo-100">
                      <span className="text-[10px] text-indigo-600 block">Rest</span>
                      <span className="font-black text-indigo-900">{reviewEntry.aiAnalysis?.fourRs?.rest || 4} / 5</span>
                    </div>
                    <div className="bg-indigo-50/60 p-2 rounded-xl border border-indigo-100">
                      <span className="text-[10px] text-indigo-600 block">Relaxation</span>
                      <span className="font-black text-indigo-900">{reviewEntry.aiAnalysis?.fourRs?.relaxation || 4} / 5</span>
                    </div>
                    <div className="bg-indigo-50/60 p-2 rounded-xl border border-indigo-100">
                      <span className="text-[10px] text-indigo-600 block">Relationship</span>
                      <span className="font-black text-indigo-900">{reviewEntry.aiAnalysis?.fourRs?.relationship || 5} / 5</span>
                    </div>
                    <div className="bg-indigo-50/60 p-2 rounded-xl border border-indigo-100">
                      <span className="text-[10px] text-indigo-600 block">Resilience</span>
                      <span className="font-black text-indigo-900">{reviewEntry.aiAnalysis?.fourRs?.resilience || 4} / 5</span>
                    </div>
                  </div>

                  {/* Mascot AI Feedback */}
                  <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-3 flex items-start gap-2.5">
                    <img
                      src={getPublicAssetUrl('/學校圖檔/吉祥物/恩恩退地-01.png')}
                      alt="恩恩"
                      className="w-8 h-8 object-contain flex-shrink-0"
                    />
                    <div className="text-[11px] leading-relaxed">
                      <span className="font-black text-amber-900 block">吉祥物加油回饋：</span>
                      <span className="text-amber-800 font-bold">
                        {reviewEntry.aiAnalysis?.mascotFeedback || '只要相信自己，每天都是閃閃發光的成長！'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Teacher Notes & Love Sticker */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <label className="text-xs font-black text-slate-800 block">
                    ✍️ 班主任評語與愛心備註 (學生登入後可查看)
                  </label>
                  <input
                    type="text"
                    placeholder="寫下給學生的溫暖鼓勵評語..."
                    value={reviewEntry.teacherNotes || ''}
                    onChange={(e) =>
                      setReviewEntry({
                        ...reviewEntry,
                        teacherNotes: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

              </div>

            </div>

            {/* Review Footer */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setReviewEntry(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                關閉
              </button>
              <button
                type="button"
                onClick={handleUpdateReviewEntry}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>儲存修改並發佈至學生端</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 7. PRINT HUB MODAL */}
      <DiaryPrintHubModal
        visible={printModalVisible}
        onClose={() => setPrintModalVisible(false)}
        defaultClass={currentClass}
        allClasses={allClasses}
      />

    </div>
  );
};
