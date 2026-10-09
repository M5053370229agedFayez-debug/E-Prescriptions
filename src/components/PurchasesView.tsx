import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Calendar, 
  FileText, 
  CheckCircle, 
  DollarSign 
} from 'lucide-react';
import { PurchaseInvoice, PurchaseInvoiceItem, Supplier, Drug } from '../types/pharmacy';
import { PharmacyDatabaseService } from '../services/db';

export const PurchasesView: React.FC = () => {
  const db = PharmacyDatabaseService.getInstance();
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form
  const [invoiceNumber, setInvoiceNumber] = useState<string>(`PUR-${Date.now().toString().slice(-6)}`);
  const [supplierInvNum, setSupplierInvNum] = useState<string>('SUP-INV-109');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [selectedDrugId, setSelectedDrugId] = useState<string>('');
  const [batchNum, setBatchNum] = useState<string>('BN-2026-');
  const [expiry, setExpiry] = useState<string>('2028-06-30');
  const [boxQty, setBoxQty] = useState<number>(10);
  const [costPrice, setCostPrice] = useState<number>(45);
  const [salePrice, setSalePrice] = useState<number>(60);
  const [paidAmt, setPaidAmt] = useState<number>(450);

  const loadData = () => {
    setPurchases(db.getPurchases());
    const sups = db.getSuppliers();
    setSuppliers(sups);
    if (sups.length > 0 && !selectedSupplierId) setSelectedSupplierId(sups[0].id);
    const dList = db.getDrugs();
    setDrugs(dList);
    if (dList.length > 0 && !selectedDrugId) setSelectedDrugId(dList[0].id);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === selectedSupplierId);
    const drug = drugs.find(d => d.id === selectedDrugId);
    if (!sup || !drug) return;

    const itemTotal = boxQty * costPrice;
    const item: PurchaseInvoiceItem = {
      id: `pitem_${Date.now()}`,
      drugId: drug.id,
      drugName: drug.nameArabic,
      batchNumber: batchNum,
      expiryDate: expiry,
      boxQuantity: boxQty,
      bonusQuantity: 0,
      costPrice,
      salePrice,
      discountPercent: 0,
      taxPercent: 0,
      total: itemTotal,
    };

    const newInvoice: PurchaseInvoice = {
      id: `pur_${Date.now()}`,
      invoiceNumber,
      supplierInvoiceNumber: supplierInvNum,
      date: new Date().toISOString().split('T')[0],
      supplierId: sup.id,
      supplierName: sup.name,
      items: [item],
      subtotal: itemTotal,
      discount: 0,
      tax: 0,
      netPayable: itemTotal,
      paidAmount: paidAmt,
      status: 'Received',
    };

    await db.savePurchaseInvoice(newInvoice);
    setShowAddModal(false);
    loadData();
  };

  return (
    <div className="p-6 bg-slate-900 min-h-full space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">فواتير المشتريات والتوريدات</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              تسجيل بضائع شركات التوزيع (ابن سينا، المتحدة، فارما أوفرسيز) وتحديث أرصدة التشغيلات
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>فاتورة شراء جديدة</span>
        </button>
      </div>

      {/* Invoices List */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                <th className="py-3 px-4">رقم الفاتورة الداخلي</th>
                <th className="py-3 px-4">رقم فاتورة المورد</th>
                <th className="py-3 px-4">اسم المورد</th>
                <th className="py-3 px-4">التاريخ</th>
                <th className="py-3 px-4 text-center">عدد الأصناف</th>
                <th className="py-3 px-4 text-left">إجمالي الفاتورة</th>
                <th className="py-3 px-4 text-left">المدفوع</th>
                <th className="py-3 px-4 text-left">المتبقي للمورد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-sans">
                    لا توجد فواتير مشتريات مسجلة بعد
                  </td>
                </tr>
              ) : (
                purchases.map(p => (
                  <tr key={p.id} className="hover:bg-slate-900/50">
                    <td className="py-3 px-4 text-indigo-400 font-bold">{p.invoiceNumber}</td>
                    <td className="py-3 px-4 text-slate-300">{p.supplierInvoiceNumber}</td>
                    <td className="py-3 px-4 font-sans text-white font-bold">{p.supplierName}</td>
                    <td className="py-3 px-4 text-slate-400">{p.date}</td>
                    <td className="py-3 px-4 text-center">{p.items.length}</td>
                    <td className="py-3 px-4 text-left font-bold text-white">{p.netPayable.toFixed(2)} ج.م</td>
                    <td className="py-3 px-4 text-left text-emerald-400">{p.paidAmount.toFixed(2)} ج.م</td>
                    <td className="py-3 px-4 text-left text-rose-400">{(p.netPayable - p.paidAmount).toFixed(2)} ج.م</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Purchase */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl p-6 text-xs text-white">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-400" />
              تسجيل فاتورة شراء جديدة
            </h3>

            <form onSubmit={handleCreatePurchase} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">رقم الفاتورة الداخلي</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">رقم فاتورة المورد الورقية</label>
                  <input
                    type="text"
                    value={supplierInvNum}
                    onChange={(e) => setSupplierInvNum(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">المورد *</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (رصيده: {s.balance} ج.م)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">الدواء المشتَرى *</label>
                <select
                  value={selectedDrugId}
                  onChange={(e) => setSelectedDrugId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                >
                  {drugs.map(d => (
                    <option key={d.id} value={d.id}>{d.nameArabic} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">رقم التشغيلة (Batch Number)</label>
                  <input
                    type="text"
                    value={batchNum}
                    onChange={(e) => setBatchNum(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">تاريخ الصلاحية (FEFO)</label>
                  <input
                    type="date"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">كمية العلب</label>
                  <input
                    type="number"
                    min="1"
                    value={boxQty}
                    onChange={(e) => setBoxQty(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">سعر التكلفة (شراء)</label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">سعر البيع للجمهور</label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl flex items-center justify-between font-mono">
                <span>إجمالي الفاتورة: {(boxQty * costPrice).toFixed(2)} ج.م</span>
                <div>
                  <span>المدفوع نقداً: </span>
                  <input
                    type="number"
                    value={paidAmt}
                    onChange={(e) => setPaidAmt(parseFloat(e.target.value) || 0)}
                    className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-left"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow"
                >
                  حفظ وتحديث المخزون
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
