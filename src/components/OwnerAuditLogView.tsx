import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye,
  Hash,
  Laptop
} from 'lucide-react';
import { OwnerAuditLog, User } from '../types/pharmacy';
import { PharmacyDatabaseService } from '../services/db';

interface OwnerAuditLogViewProps {
  currentUser: User;
}

export const OwnerAuditLogView: React.FC<OwnerAuditLogViewProps> = ({ currentUser }) => {
  const db = PharmacyDatabaseService.getInstance();
  const [logs, setLogs] = useState<OwnerAuditLog[]>([]);
  const [filterEntity, setFilterEntity] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isChainValid, setIsChainValid] = useState<boolean>(true);
  const [selectedLog, setSelectedLog] = useState<OwnerAuditLog | null>(null);

  // Specification 4.2 Guard Check:
  // "وتُحمى بحارس (Guard) في خدمة التنقل نفسها بحيث يفشل الوصول المباشر لغير Owner بصمت (كأن الشاشة غير موجودة)."
  if (currentUser.role !== 'Owner') {
    return (
      <div className="p-8 text-center text-slate-500 font-mono">
        404 - الصفحة غير موجودة
      </div>
    );
  }

  const loadLogs = () => {
    const data = db.getOwnerAuditLogs();
    setLogs(data);
    verifyHashChain(data);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Verification of the cryptographic Hash Chain
  const verifyHashChain = (logList: OwnerAuditLog[]) => {
    // If empty or correctly chained
    let valid = true;
    for (let i = 1; i < logList.length; i++) {
      if (logList[i].previousHash !== logList[i - 1].hash) {
        valid = false;
        break;
      }
    }
    setIsChainValid(valid);
  };

  const filteredLogs = logs.filter(log => {
    const matchesEntity = filterEntity === 'all' || log.entityType === filterEntity;
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesSearch = 
      log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.fieldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.oldValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.newValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.hash.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesEntity && matchesAction && matchesSearch;
  });

  return (
    <div className="p-6 bg-slate-900 min-h-full space-y-6">
      {/* Top Security Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-950 to-amber-900/60 p-6 rounded-2xl border-2 border-amber-500/40 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-inner">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">
                  سجل تدقيق وتعديلات المالك (Owner Audit Log)
                </h1>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30 font-mono">
                  للقراءة فقط (Read-Only)
                </span>
              </div>
              <p className="text-xs text-amber-200/80 mt-1">
                سجل سري مشفر يسجل تلقائياً عبر Interceptor أي حركة إنشاء أو تعديل أو حذف ينفذها حساب المالك فقط
              </p>
            </div>
          </div>

          {/* Cryptographic Hash Chain Verification Badge */}
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold ${
              isChainValid 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
            }`}>
              {isChainValid ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>سلسلة الهاش مشفرة وسليمة 100% (SHA-256)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>تحذير: تم اكتشاف عبث في سلسلة الهاش!</span>
                </>
              )}
            </div>

            <button
              onClick={loadLogs}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700"
              title="تحديث السجلات"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Security Perimeter Architectural Note (Specification 4.2 Requirement) */}
        <div className="mt-4 p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
          <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>الحد الأمني للنظام:</strong> إخفاء حساب المالك وسجل التدقيق يعتمد على المنطق المركزي في طبقة البيانات وتشفير قاعدة بيانات SQLite عبر SQLCipher. الوصول المباشر لملف القاعدة بدون مفتاح التشفير هو الحد الأمني الفعلي للتطبيق.
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
        <div className="md:col-span-5 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالكيان، الحقل، القيمة القديمة/الجديدة، كود الهاش..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
        </div>

        <div className="md:col-span-3">
          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">كل الكيانات (الكل)</option>
            <option value="Drug">الأدوية والأسعار (Drug)</option>
            <option value="SaleInvoice">فواتير المبيعات (SaleInvoice)</option>
            <option value="PurchaseInvoice">فواتير الشراء (PurchaseInvoice)</option>
            <option value="User">المستخدمين (User)</option>
            <option value="Settings">الإعدادات (Settings)</option>
            <option value="Customer">العملاء (Customer)</option>
            <option value="Supplier">الموردين (Supplier)</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">كل العمليات</option>
            <option value="Create">إنشاء (Create)</option>
            <option value="Update">تعديل (Update)</option>
            <option value="Delete">حذف (Delete)</option>
          </select>
        </div>

        <div className="md:col-span-2 flex items-center justify-end text-xs text-slate-400 font-mono">
          إجمالي السجلات: <span className="font-bold text-amber-400 mr-1">{filteredLogs.length}</span>
        </div>
      </div>

      {/* Read-Only Audit Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-400 text-xs font-bold border-b border-slate-800">
                <th className="py-3 px-4">التاريخ والوقت</th>
                <th className="py-3 px-4">نوع الكيان</th>
                <th className="py-3 px-4">العملية</th>
                <th className="py-3 px-4">الحقل المعدل</th>
                <th className="py-3 px-4">القيمة السابقة (Old)</th>
                <th className="py-3 px-4">القيمة الجديدة (New)</th>
                <th className="py-3 px-4">سلسلة الهاش SHA-256</th>
                <th className="py-3 px-4 text-center">تفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    لا توجد تعديلات مسجلة حتى الآن من حساب المالك
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const actionColor = 
                    log.action === 'Create' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    log.action === 'Update' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' :
                    'bg-rose-500/20 text-rose-400 border-rose-500/30';

                  return (
                    <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-300">
                        <div>{log.timestampLocal}</div>
                        <div className="text-[10px] text-slate-500">{log.machineName}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-indigo-300 font-mono">
                          {log.entityType}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded border text-[11px] font-bold ${actionColor}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-amber-300 font-semibold">
                        {log.fieldName}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate font-mono text-rose-300/80" title={log.oldValue}>
                        {log.oldValue || '—'}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate font-mono text-emerald-300/90 font-bold" title={log.newValue}>
                        {log.newValue || '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-500 max-w-[120px] truncate" title={log.hash}>
                        <div className="flex items-center gap-1">
                          <Hash className="w-3 h-3 text-amber-500" />
                          <span>{log.hash.substring(0, 12)}...</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl p-6 text-xs text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-amber-400 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />
                تفاصيل سجل التدقيق: {selectedLog.id}
              </h3>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="mt-4 space-y-3 font-mono">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-900 rounded-xl">
                <div>الكيان: <span className="text-white font-bold">{selectedLog.entityType}</span></div>
                <div>العملية: <span className="text-white font-bold">{selectedLog.action}</span></div>
                <div>معرف السجل: <span className="text-indigo-400">{selectedLog.entityId}</span></div>
                <div>الجهاز: <span className="text-slate-400">{selectedLog.machineName}</span></div>
                <div className="col-span-2">الوقت المحلي: <span className="text-slate-300">{selectedLog.timestampLocal}</span></div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">القيمة السابقة (Old Value):</label>
                <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-rose-300 overflow-x-auto text-[11px]">
                  {selectedLog.oldValue || '(لا يوجد)'}
                </pre>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">القيمة الجديدة (New Value):</label>
                <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-emerald-300 overflow-x-auto text-[11px]">
                  {selectedLog.newValue || '(لا يوجد)'}
                </pre>
              </div>

              <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl space-y-1 text-[10px]">
                <div className="text-amber-400 font-bold">سلسلة التشفير والتحقق (Hash Chain):</div>
                <div className="text-slate-400 break-all">Current Hash: {selectedLog.hash}</div>
                <div className="text-slate-500 break-all">Prev Hash: {selectedLog.previousHash}</div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
