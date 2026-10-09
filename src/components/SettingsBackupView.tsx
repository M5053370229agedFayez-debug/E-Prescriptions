import React, { useState } from 'react';
import { 
  Settings, 
  Printer, 
  QrCode, 
  Database, 
  Save, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck,
  Building,
  FileCheck
} from 'lucide-react';
import { PharmacySettings, User } from '../types/pharmacy';
import { PharmacyDatabaseService } from '../services/db';

interface SettingsBackupViewProps {
  currentUser: User;
}

export const SettingsBackupView: React.FC<SettingsBackupViewProps> = ({ currentUser }) => {
  const db = PharmacyDatabaseService.getInstance();
  const [settings, setSettings] = useState<PharmacySettings>(db.getSettings());
  const [successMsg, setSuccessMsg] = useState<string>('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.saveSettings(settings);
    setSuccessMsg('تم حفظ الإعدادات بنجاح!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleBackupDownload = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      settings: db.getSettings(),
      drugs: db.getDrugs(),
      sales: db.getSales(),
      customers: db.getCustomers(),
      suppliers: db.getSuppliers(),
      shifts: db.getShifts(),
      expenses: db.getExpenses(),
      // 4.2 Security rule: backup includes audit log, but restore does not display it to non-owners
      ownerAuditLog: currentUser.role === 'Owner' ? db.getOwnerAuditLogs() : [],
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eprescriptions_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-slate-900 min-h-full space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">إعدادات النظام والنسخ الاحتياطي</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              تهيئة بيانات الصيدلية، طابعات الفواتير، رمز الفاتورة الإلكترونية، وقاعدة البيانات
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Pharmacy Info Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Building className="w-4 h-4 text-indigo-400" />
            بيانات الصيدلية والفرع
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">اسم الصيدلية الرئيسي</label>
              <input
                type="text"
                value={settings.pharmacyName}
                onChange={(e) => setSettings({ ...settings, pharmacyName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">اسم الفرع</label>
              <input
                type="text"
                value={settings.pharmacyBranch}
                onChange={(e) => setSettings({ ...settings, pharmacyBranch: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">السجل التجاري (س.ت)</label>
              <input
                type="text"
                value={settings.commercialReg}
                onChange={(e) => setSettings({ ...settings, commercialReg: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">البطاقة الضريبية (ب.ض)</label>
              <input
                type="text"
                value={settings.taxNumber}
                onChange={(e) => setSettings({ ...settings, taxNumber: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">رقم الهاتف الأساسي</label>
              <input
                type="text"
                value={settings.phone1}
                onChange={(e) => setSettings({ ...settings, phone1: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">رقم هاتف إضافي (موبايل)</label>
              <input
                type="text"
                value={settings.phone2 || ''}
                onChange={(e) => setSettings({ ...settings, phone2: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-slate-300 font-semibold mb-1">عنوان الصيدلية بالتفصيل</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
              />
            </div>
          </div>
        </div>

        {/* Printer & Electronic Invoicing Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Printer className="w-4 h-4 text-indigo-400" />
            إعدادات الطباعة والفاتورة الإلكترونية
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">عرض ورق الطابعة الحرارية</label>
              <select
                value={settings.thermalPrinterWidth}
                onChange={(e) => setSettings({ ...settings, thermalPrinterWidth: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
              >
                <option value="80mm">طابعة إيصالات 80 مم (القياسية)</option>
                <option value="58mm">طابعة إيصالات 58 مم (الصغيرة)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">نسبة ضريبة القيمة المضافة الافتراضية</label>
              <select
                value={settings.defaultTaxRate}
                onChange={(e) => setSettings({ ...settings, defaultTaxRate: parseFloat(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
              >
                <option value="0">0% (معظم الأدوية معفاة في مصر)</option>
                <option value="14">14% (مستحضرات التجميل والمستلزمات)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="zatcaToggle"
                checked={settings.enableZatcaQr}
                onChange={(e) => setSettings({ ...settings, enableZatcaQr: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700"
              />
              <label htmlFor="zatcaToggle" className="text-slate-300 font-semibold cursor-pointer">
                تفعيل رمز QR الفاتورة الإلكترونية (ZATCA TLV)
              </label>
            </div>

            <div className="md:col-span-3">
              <label className="block text-slate-300 font-semibold mb-1">رسالة تذييل الإيصال (Receipt Footer Message)</label>
              <textarea
                value={settings.receiptFooterMessage}
                onChange={(e) => setSettings({ ...settings, receiptFooterMessage: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Database & Backup Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Database className="w-4 h-4 text-indigo-400" />
            النسخ الاحتياطي وقاعدة البيانات المحلية
          </h2>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              <div className="text-slate-200 font-bold">قاعدة بيانات SQLite محلية (مشفرة بـ SQLCipher)</div>
              <div>يتم تخزين جميع البيانات على القرص الصلب محلياً دون الحاجة للاتصال بالإنترنت</div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleBackupDownload}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs border border-slate-700 transition-all"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>تحميل نسخة احتياطية (Backup JSON)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>حفظ كل الإعدادات</span>
          </button>
        </div>
      </form>
    </div>
  );
};
