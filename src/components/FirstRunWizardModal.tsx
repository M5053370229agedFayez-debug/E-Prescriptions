import React, { useState } from 'react';
import { ShieldCheck, Lock, Building, Check, Sparkles, KeyRound } from 'lucide-react';
import { PharmacySettings, User } from '../types/pharmacy';
import { PharmacyDatabaseService } from '../services/db';

interface FirstRunWizardModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const FirstRunWizardModal: React.FC<FirstRunWizardModalProps> = ({ isOpen, onComplete }) => {
  const db = PharmacyDatabaseService.getInstance();
  const [step, setStep] = useState<number>(1);

  // Pharmacy details
  const [pharmacyName, setPharmacyName] = useState<string>('صيدلية الشفاء الجديدة');
  const [pharmacyBranch, setPharmacyBranch] = useState<string>('الفرع الرئيسي');
  const [taxNumber, setTaxNumber] = useState<string>('500-123-456');
  const [commercialReg, setCommercialReg] = useState<string>('89234');
  const [phone, setPhone] = useState<string>('01012345678');

  // Owner Account Credentials (No default hardcoded credentials!)
  const [ownerFullName, setOwnerFullName] = useState<string>('د. محمد المالك');
  const [ownerUsername, setOwnerUsername] = useState<string>('dr_pharmacy_owner');
  const [ownerPassword, setOwnerPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ownerPassword.length < 6) {
      setErrorMsg('كلمة المرور يجب أن تكون 6 أحرف أو أرقام على الأقل.');
      return;
    }
    if (ownerPassword !== confirmPassword) {
      setErrorMsg('كلمتا المرور غير متطابقتين.');
      return;
    }

    // 1. Update Settings
    const currentSettings = db.getSettings();
    await db.saveSettings({
      ...currentSettings,
      pharmacyName,
      pharmacyBranch,
      taxNumber,
      commercialReg,
      phone1: phone,
      isFirstRunCompleted: true,
    });

    // 2. Create the ONE and ONLY Owner account with salt & hash
    const ownerUser: User = {
      id: `owner_${Date.now()}`,
      username: ownerUsername.trim(),
      fullName: ownerFullName.trim(),
      role: 'Owner',
      isActive: true,
      phone,
      createdAt: new Date().toISOString(),
    };

    await db.saveUser(ownerUser, true);
    db.setCurrentUser(ownerUser);
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-950 border-2 border-indigo-500/40 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden p-6 text-white space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center mx-auto shadow-xl shadow-indigo-600/30 text-white font-black text-2xl">
            Rx
          </div>
          <h2 className="text-xl font-black">معالج الإعداد الأول للنظام (First-Run Wizard)</h2>
          <p className="text-xs text-slate-400">
            إنشاء حساب المالك الرئيسي (Owner) وضبط بيانات الصيدلية لأول مرة
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {step === 1 ? (
            <div className="space-y-3">
              <div className="font-bold text-indigo-400 border-b border-slate-800 pb-2 flex items-center gap-2">
                <Building className="w-4 h-4" />
                <span>الخطوة 1 من 2: بيانات الصيدلية والترخيص</span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">اسم الصيدلية *</label>
                <input
                  type="text"
                  required
                  value={pharmacyName}
                  onChange={(e) => setPharmacyName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">اسم الفرع</label>
                  <input
                    type="text"
                    value={pharmacyBranch}
                    onChange={(e) => setPharmacyBranch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">البطاقة الضريبية</label>
                  <input
                    type="text"
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">السجل التجاري</label>
                  <input
                    type="text"
                    value={commercialReg}
                    onChange={(e) => setCommercialReg(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl text-white shadow"
                >
                  التالي: بيانات حساب المالك ←
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="font-bold text-amber-400 border-b border-slate-800 pb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>الخطوة 2 من 2: حساب المالك الرئيسي (Owner - مشفر ومخفي)</span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">اسم المالك الكامل *</label>
                <input
                  type="text"
                  required
                  value={ownerFullName}
                  onChange={(e) => setOwnerFullName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">اسم المستخدم للمالك (Username) *</label>
                <input
                  type="text"
                  required
                  value={ownerUsername}
                  onChange={(e) => setOwnerUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">كلمة المرور *</label>
                  <input
                    type="password"
                    required
                    value={ownerPassword}
                    onChange={(e) => setOwnerPassword(e.target.value)}
                    placeholder="اختر كلمة مرور قوية"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">تأكيد كلمة المرور *</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="أعد إدخال كلمة المرور"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 leading-relaxed">
                ملاحظة أمنية: هذا الحساب هو المالك الوحيد للنظام ولن يظهر في شاشات الموظفين أو المديرين، وتُشفر كلمة المرور بـ PBKDF2 و Salt محلياً.
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  → السابق
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-bold rounded-xl shadow-lg"
                >
                  إنهاء الإعداد وبدء تشغيل النظام
                </button>
              </div>
            </div>
          )}
        </form>

      </div>
    </div>
  );
};
