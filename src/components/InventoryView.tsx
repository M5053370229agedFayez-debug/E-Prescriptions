import React, { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  Calendar, 
  Search, 
  Plus, 
  Layers, 
  QrCode, 
  Filter, 
  CheckCircle,
  Clock,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { Drug, DrugBatch } from '../types/pharmacy';
import { PharmacyDatabaseService } from '../services/db';

export const InventoryView: React.FC = () => {
  const db = PharmacyDatabaseService.getInstance();
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [search, setSearch] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showNearExpiryOnly, setShowNearExpiryOnly] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Drug Form State
  const [nameArabic, setNameArabic] = useState<string>('');
  const [nameEnglish, setNameEnglish] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [barcode, setBarcode] = useState<string>('');
  const [activeIngredient, setActiveIngredient] = useState<string>('');
  const [category, setCategory] = useState<string>('مسكنات وخافض حرارة');
  const [company, setCompany] = useState<string>('');
  const [location, setLocation] = useState<string>('رف A-1');
  const [stripsPerBox, setStripsPerBox] = useState<number>(2);
  const [unitsPerStrip, setUnitsPerStrip] = useState<number>(10);
  const [salePrice, setSalePrice] = useState<number>(50);
  const [costPrice, setCostPrice] = useState<number>(38);
  const [initialQty, setInitialQty] = useState<number>(20);
  const [expiryDate, setExpiryDate] = useState<string>('2027-12-31');
  const [batchNumber, setBatchNumber] = useState<string>('BN-NEW-01');

  const loadDrugs = () => {
    setDrugs(db.getDrugs());
  };

  useEffect(() => {
    loadDrugs();
  }, []);

  const handleAddDrug = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameArabic || !code) {
      alert('يرجى ملء الاسم العربي وكود الصنف');
      return;
    }

    const newDrugId = `drug_${Date.now()}`;
    const batchId = `b_${Date.now()}`;

    const newBatch: DrugBatch = {
      id: batchId,
      drugId: newDrugId,
      batchNumber,
      expiryDate,
      costPrice,
      salePrice,
      stripPrice: salePrice / stripsPerBox,
      unitPrice: (salePrice / stripsPerBox) / unitsPerStrip,
      boxQuantity: initialQty,
      stripsPerBox,
      unitsPerStrip,
      totalUnitsAvailable: initialQty * stripsPerBox * unitsPerStrip,
    };

    const newDrug: Drug = {
      id: newDrugId,
      code,
      barcode: barcode || `${Date.now().toString().slice(-13)}`,
      nameArabic,
      nameEnglish,
      activeIngredient,
      category,
      company,
      location,
      stripsPerBox,
      unitsPerStrip,
      minStockAlert: 10,
      totalBoxesStock: initialQty,
      isPrescriptionRequired: false,
      batches: [newBatch],
    };

    await db.saveDrug(newDrug, true);
    setShowAddModal(false);
    loadDrugs();
  };

  // Expiry check helpers
  const isNearExpiry = (dateStr: string) => {
    const diffDays = (new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    return diffDays > 0 && diffDays <= 90; // within 3 months
  };

  const isExpired = (dateStr: string) => {
    return new Date(dateStr).getTime() < new Date().getTime();
  };

  // Filtered List
  const filteredDrugs = drugs.filter(d => {
    const matchesSearch = 
      d.nameArabic.toLowerCase().includes(search.toLowerCase()) ||
      d.nameEnglish.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      d.barcode.includes(search);

    const matchesCat = filterCategory === 'all' || d.category === filterCategory;
    
    if (showNearExpiryOnly) {
      const hasNearExpiryBatch = d.batches.some(b => isNearExpiry(b.expiryDate) || isExpired(b.expiryDate));
      return matchesSearch && matchesCat && hasNearExpiryBatch;
    }

    return matchesSearch && matchesCat;
  });

  const categories = Array.from(new Set(drugs.map(d => d.category)));

  return (
    <div className="p-6 bg-slate-900 min-h-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              إدارة المخزون والتشغيلات بنظام FEFO
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-mono">
                {drugs.length} صنف
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              الأقرب انتهاءً يصرف أولاً (First-Expired, First-Out) مع تتبع العلب والأشرطة والأقراص
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNearExpiryOnly(!showNearExpiryOnly)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              showNearExpiryOnly 
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30' 
                : 'bg-slate-800 text-amber-400 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>تنبيهات الصلاحية والرواكد</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة دواء جديد</span>
          </button>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
        <div className="md:col-span-6 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم العربي، الإنجليزي، الكود، الباركود..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
        </div>

        <div className="md:col-span-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all">كل المجموعات العلاجية</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3 flex items-center justify-end text-xs text-slate-400 font-mono">
          تم العثور على: <span className="font-bold text-white mr-1">{filteredDrugs.length}</span> دواء
        </div>
      </div>

      {/* Drugs Catalog Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 text-xs font-bold border-b border-slate-800">
                <th className="py-3 px-4">كود الصنف</th>
                <th className="py-3 px-4">اسم الدواء والمادة الفعالة</th>
                <th className="py-3 px-4">المجموعة والشركة</th>
                <th className="py-3 px-4">مكان الرف</th>
                <th className="py-3 px-4 text-center">الرصيد الكلي</th>
                <th className="py-3 px-4 text-left">سعر البيع</th>
                <th className="py-3 px-4">التشغيلات والصلاحيات (FEFO)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredDrugs.map(drug => {
                const isLow = drug.totalBoxesStock <= drug.minStockAlert;
                return (
                  <tr key={drug.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-400">
                      {drug.code}
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{drug.barcode}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm">{drug.nameArabic}</div>
                      <div className="text-[11px] text-slate-400">{drug.nameEnglish}</div>
                      <div className="text-[10px] text-indigo-300 font-mono mt-0.5">{drug.activeIngredient}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                        {drug.category}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-1">{drug.company}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        {drug.location}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                        isLow ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {drug.totalBoxesStock} علبة
                      </span>
                      <div className="text-[10px] text-slate-500 mt-1">
                        ({drug.stripsPerBox} شريط/علبة - {drug.unitsPerStrip} قرص/شريط)
                      </div>
                    </td>
                    <td className="py-3 px-4 text-left font-mono">
                      {drug.batches[0] ? (
                        <div>
                          <div className="font-bold text-white text-sm">{drug.batches[0].salePrice.toFixed(2)} ج.م</div>
                          <div className="text-[10px] text-slate-400">
                            الشريط: {drug.batches[0].stripPrice.toFixed(2)} ج.م
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500">--</span>
                      )}
                    </td>
                    
                    {/* FEFO Batches Display */}
                    <td className="py-3 px-4">
                      <div className="space-y-1.5 max-w-md">
                        {drug.batches.map(batch => {
                          const nearExp = isNearExpiry(batch.expiryDate);
                          const expired = isExpired(batch.expiryDate);
                          return (
                            <div 
                              key={batch.id} 
                              className={`p-1.5 rounded-lg border text-[11px] flex items-center justify-between ${
                                expired 
                                  ? 'bg-rose-950/40 border-rose-800 text-rose-300' 
                                  : nearExp 
                                  ? 'bg-amber-950/40 border-amber-800 text-amber-300' 
                                  : 'bg-slate-900 border-slate-800 text-slate-300'
                              }`}
                            >
                              <div className="font-mono">
                                <span className="font-bold">{batch.batchNumber}</span>
                                <span className="mr-2 text-[10px] opacity-80">صلاحية: {batch.expiryDate}</span>
                              </div>
                              <div className="font-bold">
                                {batch.boxQuantity} علبة ({batch.totalUnitsAvailable} قرص)
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Drug */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                إضافة دواء جديد إلى قاعدة البيانات
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddDrug} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">الاسم بالعربية *</label>
                  <input
                    type="text"
                    required
                    value={nameArabic}
                    onChange={(e) => setNameArabic(e.target.value)}
                    placeholder="مثال: كونكور 5 مجم أقراص"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">الاسم بالإنجليزية</label>
                  <input
                    type="text"
                    value={nameEnglish}
                    onChange={(e) => setNameEnglish(e.target.value)}
                    placeholder="Concor 5mg Tablets"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">كود الصنف (Unique Code) *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="CON-05"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">الباركود الدولي</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="6221234567890"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">المادة الفعالة</label>
                  <input
                    type="text"
                    value={activeIngredient}
                    onChange={(e) => setActiveIngredient(e.target.value)}
                    placeholder="Bisoprolol 5mg"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">الشركة المصنعة</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Merck Egypt"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">تقسيم العلبة (أشرطة بالعلبة)</label>
                  <input
                    type="number"
                    min="1"
                    value={stripsPerBox}
                    onChange={(e) => setStripsPerBox(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">تقسيم الشريط (أقراص بالشريط)</label>
                  <input
                    type="number"
                    min="1"
                    value={unitsPerStrip}
                    onChange={(e) => setUnitsPerStrip(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                {/* Batch Data */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">رقم التشغيلة الأولى (Batch #)</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">تاريخ الصلاحية (FEFO)</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">سعر البيع للعلبة (ج.م)</label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">كمية العلب الأولية</label>
                  <input
                    type="number"
                    value={initialQty}
                    onChange={(e) => setInitialQty(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-600/30"
                >
                  حفظ الصنف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
