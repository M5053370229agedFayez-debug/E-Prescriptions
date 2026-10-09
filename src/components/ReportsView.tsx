import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  Download, 
  Calendar, 
  DollarSign,
  BarChart3
} from 'lucide-react';
import { Drug, SaleInvoice, Expense } from '../types/pharmacy';
import { PharmacyDatabaseService } from '../services/db';

export const ReportsView: React.FC = () => {
  const db = PharmacyDatabaseService.getInstance();
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [sales, setSales] = useState<SaleInvoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    setDrugs(db.getDrugs());
    setSales(db.getSales());
    setExpenses(db.getExpenses());
  }, []);

  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.netPayable, 0);
  const totalExpensesCost = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Reorder recommendations: Drugs where stock <= minStockAlert
  const lowStockRecommendations = drugs.filter(d => d.totalBoxesStock <= d.minStockAlert);

  // Near expiry alert list: within 90 days
  const nearExpiryBatches = drugs.flatMap(d => 
    d.batches.filter(b => {
      const diffDays = (new Date(b.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
      return diffDays <= 90;
    }).map(b => ({ drug: d, batch: b }))
  );

  return (
    <div className="p-6 bg-slate-900 min-h-full space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">التقارير الشاملة وتحليلات الصيدلية</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              مبنية بالكامل على البيانات المحلية Offline دون أي اتصال خارجي
            </p>
          </div>
        </div>

        <button
          onClick={() => alert('تم تصدير التقرير كملف Excel (ClosedXML simulation)')}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs border border-slate-700 transition-all"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>تصدير تقرير Excel (ClosedXML)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs text-slate-400">إجمالي المبيعات المحققة:</div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {totalSalesRevenue.toFixed(2)} ج.م
          </div>
          <div className="text-[11px] text-slate-500 mt-1">إجمالي الفواتير: {sales.length} فاتورة</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs text-slate-400">المصروفات والنثريات:</div>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">
            {totalExpensesCost.toFixed(2)} ج.م
          </div>
          <div className="text-[11px] text-slate-500 mt-1">كهرباء، أكياس، صيانة، إيجار</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs text-slate-400">أصناف تتطلب إعادة الطلب فوراً:</div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            {lowStockRecommendations.length} صنف
          </div>
          <div className="text-[11px] text-slate-500 mt-1">وصلت إلى أو تجاوزت حد الأمان</div>
        </div>
      </div>

      {/* Reorder Recommendations */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-3">
          <AlertTriangle className="w-4 h-4" />
          <span>توصيات إعادة الطلب والنواقص (Reorder Recommendations):</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                <th className="py-2.5 px-3">كود الصنف</th>
                <th className="py-2.5 px-3">اسم الدواء</th>
                <th className="py-2.5 px-3">الشركة</th>
                <th className="py-2.5 px-3">المكان</th>
                <th className="py-2.5 px-3 text-center">الرصيد الحالي</th>
                <th className="py-2.5 px-3 text-center">حد الأمان</th>
                <th className="py-2.5 px-3 text-center">الكمية المقترحة للطلب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {lowStockRecommendations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    جميع الأصناف متوفرة بأرصدة تفوق حد الأمان
                  </td>
                </tr>
              ) : (
                lowStockRecommendations.map(d => (
                  <tr key={d.id} className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-3 text-indigo-400 font-bold">{d.code}</td>
                    <td className="py-2.5 px-3 font-sans text-white font-bold">{d.nameArabic}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-400">{d.company}</td>
                    <td className="py-2.5 px-3 text-slate-400">{d.location}</td>
                    <td className="py-2.5 px-3 text-center text-rose-400 font-bold">{d.totalBoxesStock} علبة</td>
                    <td className="py-2.5 px-3 text-center text-slate-400">{d.minStockAlert} علبة</td>
                    <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">
                      +{Math.max(20, d.minStockAlert * 2 - d.totalBoxesStock)} علبة
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
