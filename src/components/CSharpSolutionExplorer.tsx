import React, { useState } from 'react';
import { 
  Code2, 
  Folder, 
  FileCode, 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  FileText,
  Boxes
} from 'lucide-react';
import { CSHARP_SOLUTION_FILES, CSharpSourceFile } from '../csharp-source';
import { downloadCSharpSolutionZip } from '../services/exportZip';

export const CSharpSolutionExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CSharpSourceFile>(CSHARP_SOLUTION_FILES[0]);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      await downloadCSharpSolutionZip();
    } catch (err) {
      console.error('Failed to download zip:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Group files by project
  const projects = Array.from(new Set(CSHARP_SOLUTION_FILES.map(f => f.projectName)));

  return (
    <div className="p-6 bg-slate-900 min-h-full space-y-6">
      {/* Top Banner with Download Button */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-950 to-indigo-950 p-6 rounded-2xl border border-emerald-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-inner">
            <Code2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">
                مستكشف حل Visual Studio 2022 (EPrescriptions.sln)
              </h1>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                .NET Framework 4.8 / C#
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              الكود المصدري الكامل للمشاريع الستة + اختبارات xUnit + سكربت Inno Setup + أمان دور المالك الخفي
            </p>
          </div>
        </div>

        {/* 1-Click ZIP Download Button */}
        <button
          onClick={handleDownloadZip}
          disabled={isDownloading}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold px-6 py-3.5 rounded-xl shadow-xl shadow-emerald-600/30 active:scale-95 transition-all text-sm shrink-0"
        >
          <Download className="w-5 h-5" />
          <span>{isDownloading ? 'جاري تحزيم ملف ZIP...' : 'تحميل الحل الكامل (ZIP)'}</span>
        </button>
      </div>

      {/* Automated xUnit Tests Compliance Card (Specs 8: أ، ب، ج) */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 bg-slate-900 rounded-xl border border-emerald-500/20">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>الاختبار (أ) - عزل حساب المالك:</span>
          </div>
          <p className="text-[11px] text-slate-400">
            تم التحقق: أي استعلام من حساب Admin أو موظف يمر عبر <code className="text-indigo-300 font-mono">UserScopedQueryFilter</code> ولا يُرجع Owner أبدًا في طبقة البيانات.
          </p>
        </div>

        <div className="p-3 bg-slate-900 rounded-xl border border-emerald-500/20">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>الاختبار (ب) - سجل تدقيق المالك:</span>
          </div>
          <p className="text-[11px] text-slate-400">
            تم التحقق: الـ <code className="text-indigo-300 font-mono">Interceptor</code> يسجل تلقائياً تعديلات المستخدم إذا كان Owner فقط، ولا يسجل أي تعديل لـ Admin أو غيره.
          </p>
        </div>

        <div className="p-3 bg-slate-900 rounded-xl border border-emerald-500/20">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>الاختبار (ج) - حارس التنقل (Guard):</span>
          </div>
          <p className="text-[11px] text-slate-400">
            تم التحقق: خدمة التنقل <code className="text-indigo-300 font-mono">NavigationService</code> تفحص صلاحية Owner وتمنع الوصول المباشر لشاشة السجل بصمت لغير المالك.
          </p>
        </div>
      </div>

      {/* Main Solution Explorer IDE Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl min-h-[600px]">
        
        {/* Solution Tree (Right side in RTL) */}
        <div className="lg:col-span-4 border-l border-slate-800 p-4 bg-slate-950/80 overflow-y-auto max-h-[750px]">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-indigo-400" />
              مشاريع الحل (Solution Tree)
            </span>
            <span className="font-mono text-[10px] text-slate-500">{CSHARP_SOLUTION_FILES.length} ملفات</span>
          </div>

          <div className="space-y-3">
            {projects.map(proj => {
              const filesInProj = CSHARP_SOLUTION_FILES.filter(f => f.projectName === proj);
              return (
                <div key={proj} className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 py-1 px-2 rounded-lg bg-slate-900 border border-slate-800/80">
                    <Folder className="w-3.5 h-3.5 text-amber-400" />
                    <span>{proj}</span>
                  </div>

                  <div className="mr-3 space-y-0.5">
                    {filesInProj.map(file => {
                      const isSelected = selectedFile.path === file.path;
                      return (
                        <button
                          key={file.path}
                          onClick={() => setSelectedFile(file)}
                          className={`w-full text-right px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                              : 'text-slate-400 hover:text-white hover:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-indigo-400'}`} />
                            <span className="truncate">{file.path.split('/').pop()}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Code Viewer (Left side in RTL) */}
        <div className="lg:col-span-8 flex flex-col bg-slate-950">
          
          {/* File Header */}
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>{selectedFile.path}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {selectedFile.description}
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ' : 'نسخ الكود'}</span>
            </button>
          </div>

          {/* Syntax Code Editor Container */}
          <div className="p-4 flex-1 overflow-x-auto max-h-[700px] font-mono text-xs text-slate-300 leading-relaxed select-text">
            <pre className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 overflow-x-auto text-[11px] whitespace-pre">
              {selectedFile.content}
            </pre>
          </div>

        </div>

      </div>
    </div>
  );
};
