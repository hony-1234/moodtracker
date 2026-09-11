import React, { useState } from 'react';
import { X, Printer, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { PrintableDiarySheet } from './PrintableDiarySheet';

interface DiaryPrintHubModalProps {
  visible: boolean;
  onClose: () => void;
  defaultClass?: string;
  allClasses?: string[];
}

export const DiaryPrintHubModal: React.FC<DiaryPrintHubModalProps> = ({
  visible,
  onClose,
  defaultClass = '4A',
  allClasses = ['4A', '4B', '4C', '4D', '5A', '5B', '5C', '5D', '6A', '6B', '6C', '6D', 'P4_TEST']
}) => {
  const [selectedClass, setSelectedClass] = useState<string>(defaultClass);
  const [cycleNumber, setCycleNumber] = useState<number>(1);
  const [printMode, setPrintMode] = useState<'BATCH_CLASS' | 'SINGLE' | 'BLANK'>('BATCH_CLASS');
  const [singleStudentNumber, setSingleStudentNumber] = useState<number>(1);
  const [classSize, setClassSize] = useState<number>(30);
  const [previewStudentNo, setPreviewStudentNo] = useState<number>(1);

  if (!visible) return null;

  const handlePrint = () => {
    window.print();
  };

  // Generate list of student sheets based on printMode
  const getSheetList = () => {
    if (printMode === 'BLANK') {
      return [{ class: selectedClass, no: '', name: '', key: 'blank-1' }];
    }
    if (printMode === 'SINGLE') {
      return [{ class: selectedClass, no: singleStudentNumber, name: '', key: `single-${singleStudentNumber}` }];
    }
    // Batch class (1 to classSize)
    return Array.from({ length: classSize }, (_, i) => ({
      class: selectedClass,
      no: i + 1,
      name: '',
      key: `batch-${i + 1}`
    }));
  };

  const sheetsToRender = getSheetList();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      
      {/* SCREEN CONTROL PANEL & MODAL WRAPPER (HIDDEN ON PRINT) */}
      <div className="print:hidden bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20 shadow-inner">
              <Printer className="w-6 h-6 text-indigo-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span>🖨️ A4 專屬心靈日記紙 • 列印中樞</span>
                <span className="text-[11px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                  支援全班 QR 碼批次產出
                </span>
              </h2>
              <p className="text-xs text-indigo-200 mt-0.5">
                每兩循環週配發乙次 • 標準 A4 格式 • 事務機掃描時自動由 QR 碼精準對應學號歸檔
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/50">
          
          {/* LEFT: SETTINGS CONTROLS (5 COLS) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* PRINT MODE SELECTOR */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <label className="text-xs font-black text-slate-700 block">1. 選擇列印模式</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPrintMode('BATCH_CLASS')}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    printMode === 'BATCH_CLASS' 
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-black shadow-2xs' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold">全班批次</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">30位個人化紙張</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPrintMode('SINGLE')}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    printMode === 'SINGLE' 
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-black shadow-2xs' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold">個別補印</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">指定單一學號</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPrintMode('BLANK')}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    printMode === 'BLANK' 
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-black shadow-2xs' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold">通用空白版</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">手填班級學號</div>
                </button>
              </div>
            </div>

            {/* CLASS & CYCLE PARAMETERS */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <label className="text-xs font-black text-slate-700 block">2. 設定班別與循環週</label>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">目標班別</span>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {allClasses.map(cls => (
                      <option key={cls} value={cls}>{cls} 班</option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">發放週期</span>
                  <select
                    value={cycleNumber}
                    onChange={(e) => setCycleNumber(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={1}>第 1-2 循環週</option>
                    <option value={2}>第 3-4 循環週</option>
                    <option value={3}>第 5-6 循環週</option>
                    <option value={4}>第 7-8 循環週</option>
                    <option value={5}>第 9-10 循環週</option>
                    <option value={6}>第 11-12 循環週</option>
                    <option value={7}>第 13-14 循環週</option>
                    <option value={8}>第 15-16 循環週</option>
                  </select>
                </div>
              </div>

              {printMode === 'BATCH_CLASS' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-slate-500">全班人數設定</span>
                    <span className="text-xs font-black text-indigo-700">{classSize} 位學生</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={36}
                    value={classSize}
                    onChange={(e) => setClassSize(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              )}

              {printMode === 'SINGLE' && (
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">指定學生學號</span>
                  <input
                    type="number"
                    min={1}
                    max={36}
                    value={singleStudentNumber}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSingleStudentNumber(val);
                      setPreviewStudentNo(val);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* PRINT TIP ALERT */}
            <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 text-[11px] text-amber-900 space-y-1">
              <div className="font-black flex items-center gap-1.5 text-amber-800">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>列印建議小貼士</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                點擊下方「立即列印」時，請在系統列印對話框中將<b>「邊界 (Margins)」設為「無 (None)」或「預設」</b>，並確認<b>「背景圖形 (Background Graphics)」已勾選</b>，即可產出最漂亮的滿版標準 A4 日記紙！
              </p>
            </div>

            {/* ACTION PRINT BUTTON */}
            <button
              type="button"
              onClick={handlePrint}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>立即啟動列印 ({sheetsToRender.length} 頁 A4)</span>
            </button>

          </div>

          {/* RIGHT: LIVE INTERACTIVE PREVIEW (7 COLS) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
              <span className="text-xs font-black text-slate-700 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>即時 A4 紙張預覽 (實例展示)</span>
              </span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                {selectedClass} 班 • 第 {cycleNumber * 2 - 1}-{cycleNumber * 2} 循環週
              </span>
            </div>

            {/* SCALED PREVIEW CONTAINER */}
            <div className="w-full overflow-x-auto flex justify-center p-2 bg-slate-200/60 rounded-2xl border border-slate-300">
              <div className="transform scale-[0.60] origin-top my-[-55mm]">
                <PrintableDiarySheet
                  studentClass={selectedClass}
                  studentNumber={printMode === 'BLANK' ? '' : previewStudentNo}
                  cycleNumber={cycleNumber}
                  showSampleText={false}
                />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* DEDICATED PRINT ENGINE (ACTIVE ONLY DURING WINDOW.PRINT) */}
      <div className="hidden print:block absolute inset-0 bg-white m-0 p-0" id="print-sheet-batch">
        {sheetsToRender.map((sheet, index) => (
          <div key={sheet.key} className="break-after-page min-h-screen">
            <PrintableDiarySheet
              studentClass={sheet.class}
              studentNumber={sheet.no}
              cycleNumber={cycleNumber}
              showSampleText={false}
            />
          </div>
        ))}
      </div>

    </div>
  );
};
