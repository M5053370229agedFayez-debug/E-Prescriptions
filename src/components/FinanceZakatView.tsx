import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  Wallet, 
  TrendingUp, 
  Calculator, 
  Receipt, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowDownLeft, 
  Plus,
  Scale
} from 'lucide-react';
import { Shift, Expense, Drug, Customer, Supplier, User } from '../types/pharmacy';
import { PharmacyDatabaseService } from '../services/db';

interface FinanceZakatViewProps {
  currentUser: User;
}

export const FinanceZakatView: React.FC<FinanceZakatViewProps> = ({ currentUser }) => {
  const db = PharmacyDatabaseService.getInstance();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Shift Modal
  const [showCloseShiftModal, setShowCloseShiftModal] = useState<boolean>(false);
  const [actualCashCount, setActualCashCount] = useState<number>(0);
  const [shiftNotes, setShiftNotes] = useState<string>('');

  // Expense Modal
  const [showAddExpenseModal, setShowAddExpenseModal] = useState<boolean>(false);
  const [expAmount, setExpAmount] = useState<number>(50);
  const [expDesc, setExpDesc] = useState<string>('');
  const [expCategory, setExpCategory] = useState<Expense['category']>('Supplies');

  // Zakat Calculator State
  const [goldGramPrice21, setGoldGramPrice21] = useState<number>(3600); // Egyptian gold 21 price in EGP
  const [cashInSafe, setCashInSafe] = useState<number>(15000);
  const [bankBalance, setBankBalance] = useState<number>(50000);
  const [isGregorianYear, setIsGregorianYear] = useState<boolean>(true);

  const loadData = () => {
    setShifts(db.getShifts());
    setExpenses(db.getExpenses());
    setDrugs(db.getDrugs());
    setCustomers(db.getCustomers());
    setSuppliers(db.getSuppliers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const openShift = shifts.find(s => s.status === 'Open');

  // Zakat Calculation (عروض التجارة)
  // Total inventory at cost price
  const inventoryCostValue = drugs.reduce((sum, d) => {
    const drugCost = d.batches.reduce((bSum, b) => bSum + (b.boxQuantity * b.costPrice), 0);
    return sum + drugCost;
  }, 0);

  // Good debts from customers
  const customerDebts = customers.reduce((sum, c) => sum + Math.max(0, c.balance), 0);

  // Debts owed to suppliers
  const supplierDebts = suppliers.reduce((sum, s) => sum + Math.max(0, s.balance), 0);

  // Zakat pool = (Inventory at cost + Cash in safe + Bank balance + Customer debts) - Supplier debts
  const zakatPool = Math.max(0, (inventoryCostValue + cashInSafe + bankBalance + customerDebts) - supplierDebts);
  const nisabValue = 85 * goldGramPrice21; // 85 grams gold
  const isNisabReached = zakatPool >= nisabValue;
  const zakatRate = isGregorianYear ? 0.02577 : 0.025; // 2.577% Gregorian or 2.5% Hijri
  const zakatDue = isNisabReached ? (zakatPool * zakatRate) : 0;

  const handleCloseShift = () => {
    db.closeCurrentShift(actualCashCount, shiftNotes);
    setShowCloseShiftModal(false);
    loadData();
  };

  const handleStartShift = () => {
    const initCash = parseFloat(prompt('أدخل رصيد العهدة النقدية الافتتاحية (ج.م):', '500') || '0');
    db.startNewShift(initCash);
    loadData();
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const newExp: Expense = {
      id: `exp_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      category: expCategory,
      amount: expAmount,
      description: expDesc,
      userId: currentUser.id,
      userName: currentUser.fullName,
    };
    db.addExpense(newExp);
    setShowAddExpenseModal(false);
    setExpDesc('');
    loadData();
  };

  return (
    <div className="p-6 bg-slate-900 min-h-full space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              المالية والشيفتات وحساب الزكاة الشرعية
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              تسليم عهدة الشيفت، تسجيل المصروفات، وحساب زكاة عروض التجارة للصيدليات
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs border border-slate-700 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل مصروف جديد</span>
          </button>

          {openShift ? (
            <button
              onClick={() => { setActualCashCount(openShift.expectedCash); setShowCloseShiftModal(true); }}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-lg shadow-amber-600/30 active:scale-95 transition-all"
            >
              <Clock className="w-4 h-4" />
              <span>إغلاق وتسليم الشيفت الحالي</span>
            </button>
          ) : (
            <button
              onClick={handleStartShift}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
            >
              <Wallet className="w-4 h-4" />
              <span>فتح شيفت جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* Shift Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400">حالة الشيفت الحالي:</div>
          <div className="text-lg font-black text-white mt-1 flex items-center gap-2">
            {openShift ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>مفتوح (قيد العمل)</span>
              </>
            ) : (
              <span className="text-slate-500">لا يوجد شيفت مفتوح</span>
            )}
          </div>
          {openShift && (
            <div className="text-[11px] text-indigo-400 font-mono mt-1">المسؤول: {openShift.userName}</div>
          )}
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400">المبيعات النقدية المتوقعة بالدرج:</div>
          <div className="text-xl font-black text-indigo-400 font-mono mt-1">
            {openShift ? `${openShift.expectedCash.toFixed(2)} ج.م` : '0.00 ج.م'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">شامل العهدة الافتتاحية والمبيعات النقدية</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400">إجمالي قيمة المخزون (سعر التكلفة):</div>
          <div className="text-xl font-black text-emerald-400 font-mono mt-1">
            {inventoryCostValue.toFixed(2)} ج.م
          </div>
          <div className="text-[11px] text-slate-500 mt-1">محسوب بدقة من فواتير الشراء والتشغيلات</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400">الديون المستحقة للموردين:</div>
          <div className="text-xl font-black text-rose-400 font-mono mt-1">
            {supplierDebts.toFixed(2)} ج.م
          </div>
          <div className="text-[11px] text-slate-500 mt-1">التزامات واجبة السداد</div>
        </div>
      </div>

      {/* Islamic Zakat Calculator Section */}
      <div className="bg-gradient-to-r from-teal-950/60 via-slate-950 to-indigo-950/60 border-2 border-teal-500/30 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">حاسبة زكاة الصيدلية (عروض التجارة الشرعية)</h2>
            <p className="text-xs text-slate-400">
              تُحسب بناءً على معادلة الإجماع الفقهي: (المخزون بسعر الجملة + السيولة + ديون العملاء المرجوة) - ديون الموردين
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-medium">
          <div>
            <label className="text-slate-300 block mb-1">سعر جرام الذهب عيار 21 اليوم (ج.م):</label>
            <input
              type="number"
              value={goldGramPrice21}
              onChange={(e) => setGoldGramPrice21(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">النصاب (85 جم) = {(85 * goldGramPrice21).toLocaleString('ar-EG')} ج.م</span>
          </div>

          <div>
            <label className="text-slate-300 block mb-1">النقدية بالخزينة والدرج (ج.م):</label>
            <input
              type="number"
              value={cashInSafe}
              onChange={(e) => setCashInSafe(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-300 block mb-1">أرصدة الحسابات البنكية (ج.م):</label>
            <input
              type="number"
              value={bankBalance}
              onChange={(e) => setBankBalance(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-300 block mb-1">نوع الحول (السنة):</label>
            <select
              value={isGregorianYear ? 'gregorian' : 'hijri'}
              onChange={(e) => setIsGregorianYear(e.target.value === 'gregorian')}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
            >
              <option value="gregorian">سنة ميلادية (نسبة الزكاة: 2.577%)</option>
              <option value="hijri">سنة هجرية (نسبة الزكاة: 2.5%)</option>
            </select>
          </div>
        </div>

        {/* Zakat Result Summary Card */}
        <div className="mt-5 p-4 bg-slate-900/90 rounded-xl border border-teal-500/20 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <div className="text-xs text-slate-400">وعاء الزكاة الصافي (الخاضع للزكاة):</div>
            <div className="text-xl font-black text-white font-mono mt-0.5">
              {zakatPool.toFixed(2)} ج.م
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400">حالة بلوغ النصاب الشرعي:</div>
            <div className="text-sm font-bold mt-0.5">
              {isNisabReached ? (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> بلغ النصاب الشرعي (تجب الزكاة)
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> لم يبلغ النصاب (أقل من 85 جرام ذهب)
                </span>
              )}
            </div>
          </div>

          <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-left">
            <div className="text-xs text-teal-300 font-bold">الزكاة الواجبة الإخراج (Zakat Due):</div>
            <div className="text-2xl font-black text-teal-400 font-mono mt-0.5">
              {zakatDue.toFixed(2)} ج.م
            </div>
          </div>
        </div>
      </div>

      {/* Shifts History Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-3">سجل تسليم الشيفتات الأخير</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                <th className="py-2.5 px-3">رقم الشيفت</th>
                <th className="py-2.5 px-3">المستخدم</th>
                <th className="py-2.5 px-3">وقت البدء</th>
                <th className="py-2.5 px-3">وقت الإغلاق</th>
                <th className="py-2.5 px-3">العهدة الافتتاحية</th>
                <th className="py-2.5 px-3">المتوقع بالدرج</th>
                <th className="py-2.5 px-3">الفعلي بالعد</th>
                <th className="py-2.5 px-3">العجز / الزيادة</th>
                <th className="py-2.5 px-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {shifts.map(s => (
                <tr key={s.id} className="hover:bg-slate-900/40">
                  <td className="py-2.5 px-3 text-slate-400 font-semibold">{s.id}</td>
                  <td className="py-2.5 px-3 font-sans text-white font-bold">{s.userName}</td>
                  <td className="py-2.5 px-3 text-slate-400">{new Date(s.startTime).toLocaleTimeString('ar-EG')}</td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {s.endTime ? new Date(s.endTime).toLocaleTimeString('ar-EG') : '—'}
                  </td>
                  <td className="py-2.5 px-3">{s.initialCash.toFixed(2)} ج.م</td>
                  <td className="py-2.5 px-3 text-indigo-400 font-bold">{s.expectedCash.toFixed(2)} ج.م</td>
                  <td className="py-2.5 px-3">{s.actualCash !== undefined ? `${s.actualCash.toFixed(2)} ج.م` : '—'}</td>
                  <td className="py-2.5 px-3">
                    {s.cashDifference !== undefined ? (
                      <span className={s.cashDifference < 0 ? 'text-rose-400 font-bold' : s.cashDifference > 0 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                        {s.cashDifference > 0 ? `+${s.cashDifference.toFixed(2)}` : `${s.cashDifference.toFixed(2)}`} ج.م
                      </span>
                    ) : '—'}
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.status === 'Open' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {s.status === 'Open' ? 'مفتوح' : 'مغلق'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Close Shift Modal */}
      {showCloseShiftModal && openShift && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-6 text-xs text-white">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              إغلاق وتسليم الشيفت
            </h3>

            <div className="space-y-3 font-mono">
              <div className="p-3 bg-slate-900 rounded-xl space-y-1">
                <div>العهدة الافتتاحية: <span className="font-bold text-white">{openShift.initialCash.toFixed(2)} ج.م</span></div>
                <div>المبيعات النقدية بالشيفت: <span className="font-bold text-white">{openShift.totalSales.toFixed(2)} ج.م</span></div>
                <div className="text-indigo-400 font-bold pt-1 border-t border-slate-800">
                  النقدية المتوقعة بالدرج: {openShift.expectedCash.toFixed(2)} ج.م
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-sans mb-1 font-bold">النقدية الفعلية بعد العد (ج.م) *</label>
                <input
                  type="number"
                  value={actualCashCount}
                  onChange={(e) => setActualCashCount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-base font-bold"
                />
              </div>

              <div className="p-2 bg-slate-900 rounded-lg text-center font-bold">
                الفارق (العجز / الزيادة):{' '}
                <span className={(actualCashCount - openShift.expectedCash) < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                  {(actualCashCount - openShift.expectedCash).toFixed(2)} ج.م
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-sans mb-1">ملاحظات التسليم:</label>
                <textarea
                  value={shiftNotes}
                  onChange={(e) => setShiftNotes(e.target.value)}
                  placeholder="أي ملاحظات حول العجز أو التسليم..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-sans"
                  rows={2}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowCloseShiftModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleCloseShift}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow"
              >
                تأكيد الإغلاق والتسليم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-6 text-xs text-white">
            <h3 className="text-base font-bold text-white mb-3">تسجيل مصروف جديد</h3>
            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="block text-slate-300 mb-1">المبلغ (ج.م) *</label>
                <input
                  type="number"
                  required
                  value={expAmount}
                  onChange={(e) => setExpAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">التصنيف *</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="Supplies">مستلزمات وأدوات صيدلية</option>
                  <option value="Utilities">فواتير (كهرباء/مياه/إنترنت)</option>
                  <option value="Salaries">مرتبات وحوافز</option>
                  <option value="Rent">إيجار المقر</option>
                  <option value="Maintenance">صيانة وأجهزة</option>
                  <option value="Other">نثريات أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">بيان المصروف *</label>
                <input
                  type="text"
                  required
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="مثال: فاتورة كهرباء شهر أكتوبر"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow"
                >
                  حفظ المصروف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
