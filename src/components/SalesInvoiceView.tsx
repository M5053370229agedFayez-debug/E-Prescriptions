import React, { useState, useEffect, useRef } from 'react';
import { 
  Barcode, 
  Plus, 
  Trash2, 
  Printer, 
  Save, 
  RotateCcw, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Calendar, 
  User as UserIcon,
  CreditCard,
  Banknote,
  Smartphone,
  Eye,
  FileCheck
} from 'lucide-react';
import { 
  Drug, 
  DrugBatch, 
  SaleInvoice, 
  SaleInvoiceItem, 
  Customer, 
  UnitType, 
  PharmacySettings,
  User 
} from '../types/pharmacy';
import { PharmacyDatabaseService } from '../services/db';
import { generateZatcaTlvBase64, generateQrDataUrl } from '../services/zatca';

interface SalesInvoiceViewProps {
  currentUser: User;
  onInvoiceCreated?: () => void;
}

export const SalesInvoiceView: React.FC<SalesInvoiceViewProps> = ({ currentUser, onInvoiceCreated }) => {
  const db = PharmacyDatabaseService.getInstance();
  const [settings, setSettings] = useState<PharmacySettings>(db.getSettings());
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  // Invoice Header State
  const [invoiceNumber, setInvoiceNumber] = useState<string>(`INV-${Date.now().toString().slice(-6)}`);
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust_cash');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [doctorName, setDoctorName] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<SaleInvoice['paymentMethod']>('Cash');

  // Search & Barcode
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Drug[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Invoice Items
  const [items, setItems] = useState<SaleInvoiceItem[]>([]);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  // Thermal Receipt Modal & ZATCA QR
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [lastSavedInvoice, setLastSavedInvoice] = useState<SaleInvoice | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Reload data
  const loadData = () => {
    setDrugs(db.getDrugs());
    setCustomers(db.getCustomers());
    setSettings(db.getSettings());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Keyboard wedge scanner / F-key listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        handleResetInvoice();
      } else if (e.key === 'F3') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F9' || e.key === 'F10') {
        e.preventDefault();
        handleSaveAndPrint();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, paidAmount, paymentMethod, selectedCustomerId]);

  // Search Handler (Search by Barcode, Code, Arabic Name, or English Name)
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    const q = val.toLowerCase().trim();
    // Check exact barcode scan (instant add)
    const exactBarcodeMatch = drugs.find(d => d.barcode === q || d.code.toLowerCase() === q);
    if (exactBarcodeMatch && exactBarcodeMatch.batches.length > 0) {
      addItemToInvoice(exactBarcodeMatch);
      setSearchQuery('');
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    const matches = drugs.filter(d => 
      d.nameArabic.toLowerCase().includes(q) ||
      d.nameEnglish.toLowerCase().includes(q) ||
      d.activeIngredient.toLowerCase().includes(q) ||
      d.code.toLowerCase().includes(q) ||
      d.barcode.includes(q)
    );
    setSearchResults(matches);
    setIsSearchOpen(matches.length > 0);
  };

  // Add Item to Invoice (FEFO Default Batch)
  const addItemToInvoice = (drug: Drug) => {
    if (drug.batches.length === 0) {
      alert('لا توجد تشغيلات متوفرة لهذا الدواء في المخزون');
      return;
    }

    // FEFO: Take earliest expiry batch
    const bestBatch = [...drug.batches].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())[0];
    
    // Check if item already in invoice
    const existingIndex = items.findIndex(it => it.drugId === drug.id && it.batchId === bestBatch.id && it.unitType === 'Box');
    if (existingIndex !== -1) {
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].total = calculateRowTotal(
        updated[existingIndex].quantity,
        updated[existingIndex].unitPrice,
        updated[existingIndex].discountPercent,
        updated[existingIndex].taxPercent
      );
      setItems(updated);
    } else {
      const newItem: SaleInvoiceItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        drugId: drug.id,
        drugCode: drug.code,
        drugName: drug.nameArabic,
        batchId: bestBatch.id,
        batchNumber: bestBatch.batchNumber,
        expiryDate: bestBatch.expiryDate,
        unitType: 'Box',
        quantity: 1,
        unitPrice: bestBatch.salePrice,
        discountPercent: 0,
        taxPercent: settings.defaultTaxRate,
        total: bestBatch.salePrice,
        availableStock: bestBatch.boxQuantity,
      };
      setItems([...items, newItem]);
    }

    setSearchQuery('');
    setIsSearchOpen(false);
    searchInputRef.current?.focus();
  };

  const calculateRowTotal = (qty: number, price: number, discountPct: number, taxPct: number): number => {
    const gross = qty * price;
    const discounted = gross - (gross * (discountPct / 100));
    const finalRow = discounted + (discounted * (taxPct / 100));
    return parseFloat(finalRow.toFixed(2));
  };

  // Change Unit Type (Box -> Strip -> Unit)
  const handleUnitTypeChange = (itemId: string, newUnit: UnitType) => {
    setItems(items.map(it => {
      if (it.id !== itemId) return it;
      const drug = drugs.find(d => d.id === it.drugId);
      const batch = drug?.batches.find(b => b.id === it.batchId);
      if (!drug || !batch) return it;

      let newPrice = batch.salePrice;
      if (newUnit === 'Strip') newPrice = batch.stripPrice;
      if (newUnit === 'Unit') newPrice = batch.unitPrice;

      const total = calculateRowTotal(it.quantity, newPrice, it.discountPercent, it.taxPercent);
      return { ...it, unitType: newUnit, unitPrice: newPrice, total };
    }));
  };

  // Change Quantity
  const handleQuantityChange = (itemId: string, qty: number) => {
    if (qty <= 0) return;
    setItems(items.map(it => {
      if (it.id !== itemId) return it;
      const total = calculateRowTotal(qty, it.unitPrice, it.discountPercent, it.taxPercent);
      return { ...it, quantity: qty, total };
    }));
  };

  // Change Discount
  const handleDiscountChange = (itemId: string, discount: number) => {
    setItems(items.map(it => {
      if (it.id !== itemId) return it;
      const total = calculateRowTotal(it.quantity, it.unitPrice, discount, it.taxPercent);
      return { ...it, discountPercent: discount, total };
    }));
  };

  // Remove Item
  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(it => it.id !== itemId));
  };

  // Calculated Totals
  const subtotal = items.reduce((sum, it) => sum + (it.quantity * it.unitPrice), 0);
  const totalDiscount = items.reduce((sum, it) => sum + ((it.quantity * it.unitPrice) * (it.discountPercent / 100)), 0);
  const totalTax = items.reduce((sum, it) => {
    const discounted = (it.quantity * it.unitPrice) * (1 - (it.discountPercent / 100));
    return sum + (discounted * (it.taxPercent / 100));
  }, 0);
  const netPayable = parseFloat((subtotal - totalDiscount + totalTax).toFixed(2));
  const remaining = paymentMethod === 'Credit' ? Math.max(0, netPayable - paidAmount) : 0;

  // Save and Print
  const handleSaveAndPrint = async () => {
    if (items.length === 0) {
      alert('يرجى إضافة صنف واحد على الأقل إلى الفاتورة');
      return;
    }

    const selectedCust = customers.find(c => c.id === selectedCustomerId);
    const invoiceDate = new Date();

    // 1. ZATCA TLV Base64 calculation
    const zatcaBase64 = generateZatcaTlvBase64({
      sellerName: settings.pharmacyName,
      vatNumber: settings.taxNumber,
      timestamp: invoiceDate.toISOString(),
      totalAmount: netPayable,
      vatAmount: totalTax,
    });

    const qrUrl = await generateQrDataUrl(zatcaBase64);
    setQrDataUrl(qrUrl);

    // 2. Build Invoice
    const newInvoice: SaleInvoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber,
      date: invoiceDate.toISOString().split('T')[0],
      time: invoiceDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      dayName: invoiceDate.toLocaleDateString('ar-EG', { weekday: 'long' }),
      userId: currentUser.id,
      userNameSnapshot: currentUser.fullName, // Snapshot so joins never break
      customerId: selectedCustomerId,
      customerName: selectedCust ? selectedCust.name : 'عميل نقدي',
      customerPhone,
      doctorName,
      items,
      subtotal,
      totalDiscount,
      totalTax,
      netPayable,
      paidAmount: paymentMethod === 'Credit' ? paidAmount : netPayable,
      remainingAmount: remaining,
      paymentMethod,
      status: 'Completed',
      zatcaQrBase64: zatcaBase64,
      notes,
    };

    // 3. Deduct stock using FEFO
    for (const item of items) {
      await db.deductStockFEFO(item.drugId, item.unitType, item.quantity);
    }

    // 4. Save to Database
    await db.saveSaleInvoice(newInvoice);

    setLastSavedInvoice(newInvoice);
    setShowReceiptModal(true);
    setSuccessMessage(`تم حفظ الفاتورة ${invoiceNumber} بنجاح!`);
    loadData();
    if (onInvoiceCreated) onInvoiceCreated();

    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleResetInvoice = () => {
    setInvoiceNumber(`INV-${Date.now().toString().slice(-6)}`);
    setItems([]);
    setPaidAmount(0);
    setDoctorName('');
    setNotes('');
    setSelectedCustomerId('cust_cash');
    setPaymentMethod('Cash');
    searchInputRef.current?.focus();
  };

  return (
    <div className="min-h-full p-4 lg:p-6" style={{
      // Exact Section 6 specification: Slanted linear gradient background in blue and purple
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #4338ca 100%)'
    }}>
      {/* Success notification */}
      {successMessage && (
        <div className="mb-4 bg-emerald-500/90 text-white px-4 py-3 rounded-xl flex items-center justify-between shadow-xl animate-fade-in font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-white hover:opacity-80">✕</button>
        </div>
      )}

      {/* Main White Container with Rounded Corners & Soft Drop Shadow (DropShadowEffect) */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col min-h-[calc(100vh-6rem)]">
        
        {/* ══════════ رأس الفاتورة (Header) ══════════ */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-5 border-b border-indigo-900/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-600/40 border border-indigo-400/30 flex items-center justify-center text-white font-black text-xl shadow-inner">
                POS
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  فاتورة مبيعات جديدة
                  <span className="text-xs font-mono font-normal bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/20">
                    {invoiceNumber}
                  </span>
                </h1>
                <p className="text-xs text-indigo-200/70 font-medium mt-0.5">
                  {settings.pharmacyName} — {settings.pharmacyBranch}
                </p>
              </div>
            </div>

            {/* Invoice metadata (Number, Date, Day, Time, User) in semi-transparent text */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-indigo-100/80 bg-white/5 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>{currentDateTime.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' })}</span>
              </div>
              <div className="w-px h-3 bg-white/20"></div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>{currentDateTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>
              <div className="w-px h-3 bg-white/20"></div>
              <div className="flex items-center gap-1.5">
                <UserIcon className="w-4 h-4 text-indigo-400" />
                <span className="text-white font-bold">{currentUser.fullName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ قسم بيانات العميل والباركود ══════════ */}
        <div className="p-4 lg:p-5 bg-slate-50/80 border-b border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            
            {/* Quick Barcode & Drug Search (Keyboard Wedge / Fast Input Capture) */}
            <div className="md:col-span-5 relative">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Barcode className="w-4 h-4 text-indigo-600" />
                  مسح الباركود أو البحث عن الدواء:
                </span>
                <span className="text-[10px] text-indigo-600 font-mono bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                  F3 للتركيز
                </span>
              </label>
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="امسح الباركود بالماسح أو اكتب اسم الدواء / المادة الفعالة..."
                  className="w-full bg-white text-slate-800 placeholder-slate-400 border-2 border-indigo-200 rounded-xl py-2.5 pr-10 pl-3 text-sm font-medium focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                  autoFocus
                />
                <Search className="w-4 h-4 text-indigo-500 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>

              {/* Autocomplete Search Dropdown */}
              {isSearchOpen && searchResults.length > 0 && (
                <div className="absolute z-30 right-0 left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {searchResults.map(drug => {
                    const bestBatch = drug.batches[0];
                    const nearExpiry = bestBatch && new Date(bestBatch.expiryDate) < new Date(Date.now() + 90 * 86400000);
                    return (
                      <div
                        key={drug.id}
                        onClick={() => addItemToInvoice(drug)}
                        className="p-3 hover:bg-indigo-50/80 cursor-pointer transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-indigo-700 text-sm">
                            {drug.nameArabic}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{drug.nameEnglish}</span>
                            <span>•</span>
                            <span className="text-indigo-600 font-mono">{drug.code}</span>
                            <span>•</span>
                            <span className="text-slate-600">{drug.location}</span>
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="font-extrabold text-indigo-600 text-sm">
                            {bestBatch ? `${bestBatch.salePrice.toFixed(2)} ج.م` : 'غير متوفر'}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            رصيد: {drug.totalBoxesStock} علبة
                            {nearExpiry && (
                              <span className="mr-1 text-amber-600 font-bold">(صلاحية قريبة)</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Customer Select */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                اسم العميل:
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-white text-slate-800 border border-slate-300 rounded-xl py-2.5 px-3 text-sm font-medium focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.balance > 0 ? `(عليه ${c.balance} ج.م)` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                طريقة الدفع:
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-white text-slate-800 border border-slate-300 rounded-xl py-2.5 px-3 text-sm font-medium focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
              >
                <option value="Cash">نقدي (كاش)</option>
                <option value="Card">بطاقة بنكية / فيزا</option>
                <option value="InstaPay">إنستاباي (InstaPay)</option>
                <option value="VodafoneCash">فودافون كاش</option>
                <option value="Credit">آجل (شكك / ذمة)</option>
              </select>
            </div>

            {/* Doctor Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الطبيب المعالج:
              </label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="د. الطبيب (اختياري)"
                className="w-full bg-white text-slate-800 border border-slate-300 rounded-xl py-2.5 px-3 text-sm font-medium focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* ══════════ جدول الأصناف الديناميكي (DataGrid) ══════════ */}
        <div className="flex-1 overflow-x-auto p-4 lg:p-5">
          {items.length === 0 ? (
            <div className="h-64 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-300">
                <Barcode className="w-7 h-7" />
              </div>
              <p className="text-base font-bold text-slate-600">الفاتورة فارغة حالياً</p>
              <p className="text-xs text-slate-400 mt-1">
                امسح باركود الدواء أو ابحث بالاسم في الخانة العلوية لإضافة الأصناف
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 text-xs font-black uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-3 w-12 text-center">#</th>
                    <th className="py-3 px-3">كود الصنف</th>
                    <th className="py-3 px-3 min-w-[200px]">اسم الدواء</th>
                    <th className="py-3 px-3 w-32">الوحدة المباعة</th>
                    <th className="py-3 px-3 w-24 text-center">الكمية</th>
                    <th className="py-3 px-3 w-28 text-left">السعر (ج.م)</th>
                    <th className="py-3 px-3 w-20 text-center">خصم %</th>
                    <th className="py-3 px-3 w-24 text-center">الرصيد</th>
                    <th className="py-3 px-3 w-28">الصلاحية (FEFO)</th>
                    <th className="py-3 px-3 w-28 text-left">الإجمالي</th>
                    <th className="py-3 px-2 w-12 text-center">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-indigo-50/40 transition-colors">
                      <td className="py-3 px-3 text-center text-slate-400 font-mono text-xs">{idx + 1}</td>
                      <td className="py-3 px-3 font-mono text-xs text-indigo-700 font-semibold">{item.drugCode}</td>
                      <td className="py-3 px-3 font-bold text-slate-800">{item.drugName}</td>
                      
                      {/* وحدة البيع: علبة / شريط / قرص */}
                      <td className="py-2.5 px-3">
                        <select
                          value={item.unitType}
                          onChange={(e) => handleUnitTypeChange(item.id, e.target.value as UnitType)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg py-1.5 px-2 text-xs font-semibold focus:outline-none focus:border-indigo-600"
                        >
                          <option value="Box">علبة كاملة</option>
                          <option value="Strip">شريط</option>
                          <option value="Unit">قرص / وحدة</option>
                        </select>
                      </td>

                      {/* الكمية */}
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseFloat(e.target.value) || 1)}
                          className="w-full text-center bg-white border border-slate-200 text-slate-900 rounded-lg py-1 px-1 text-sm font-bold focus:outline-none focus:border-indigo-600"
                        />
                      </td>

                      {/* السعر */}
                      <td className="py-3 px-3 text-left font-mono font-semibold text-slate-700">
                        {item.unitPrice.toFixed(2)}
                      </td>

                      {/* الخصم % */}
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discountPercent}
                          onChange={(e) => handleDiscountChange(item.id, parseFloat(e.target.value) || 0)}
                          className="w-full text-center bg-white border border-slate-200 text-slate-900 rounded-lg py-1 px-1 text-xs font-bold focus:outline-none focus:border-indigo-600"
                        />
                      </td>

                      {/* الرصيد المتوفر */}
                      <td className="py-3 px-3 text-center text-xs font-semibold text-slate-600">
                        {item.availableStock}
                      </td>

                      {/* تاريخ الصلاحية FEFO */}
                      <td className="py-3 px-3 text-xs font-mono">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                          {item.expiryDate}
                        </span>
                      </td>

                      {/* الإجمالي */}
                      <td className="py-3 px-3 text-left font-mono font-extrabold text-indigo-700">
                        {item.total.toFixed(2)}
                      </td>

                      {/* زر حذف تفاعلي */}
                      <td className="py-2.5 px-2 text-center">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                          title="حذف الصنف من الفاتورة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ══════════ قسم المجاميع وشريط الأزرار التفاعلية ══════════ */}
        <div className="p-4 lg:p-5 bg-slate-50 border-t border-slate-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            
            {/* Quick Action Buttons (F-Keys) */}
            <div className="lg:col-span-6 flex flex-wrap gap-2.5">
              <button
                onClick={handleSaveAndPrint}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-5 rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all text-sm"
              >
                <Save className="w-4 h-4" />
                <span>حفظ وطباعة الفاتورة</span>
                <span className="text-[10px] bg-emerald-800/60 px-1.5 py-0.5 rounded font-mono">F10</span>
              </button>

              <button
                onClick={handleResetInvoice}
                className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 px-4 rounded-xl active:scale-95 transition-all text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>فاتورة جديدة</span>
                <span className="text-[10px] bg-slate-300 px-1.5 py-0.5 rounded font-mono">F2</span>
              </button>

              {paymentMethod === 'Credit' && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 px-3 py-1.5 rounded-xl">
                  <span className="text-xs font-bold text-amber-800">المدفوع نقداً:</span>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                    className="w-20 bg-white border border-amber-300 text-slate-900 rounded-lg px-2 py-1 text-xs font-bold text-center"
                  />
                  <span className="text-xs font-mono text-amber-700">المتبقي: {remaining.toFixed(2)} ج.م</span>
                </div>
              )}
            </div>

            {/* Totals Section highlighting "صافي المستحق" (Net Payable in EGP) */}
            <div className="lg:col-span-6 flex flex-wrap items-center justify-end gap-4">
              <div className="text-left text-xs text-slate-600 space-y-1">
                <div>الإجمالي قبل الخصم: <span className="font-mono font-bold text-slate-800">{subtotal.toFixed(2)} ج.م</span></div>
                <div>إجمالي الخصم: <span className="font-mono font-bold text-rose-600">{totalDiscount.toFixed(2)} ج.م</span></div>
              </div>

              {/* Net Payable Highlight Container */}
              <div className="bg-gradient-to-r from-indigo-900 to-violet-900 text-white rounded-2xl p-4 shadow-xl border-2 border-indigo-400/40 flex items-center gap-4">
                <div>
                  <div className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider">
                    صافي المستحق (Net Payable)
                  </div>
                  <div className="text-2xl lg:text-3xl font-black text-white font-mono tracking-tight mt-0.5">
                    {netPayable.toFixed(2)}
                    <span className="text-sm font-sans font-bold text-indigo-300 mr-1.5">جنيه مصري</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ══════════ نافذة محاكاة الطابعة الحرارية 80مم / 58مم مع ZATCA QR ══════════ */}
      {showReceiptModal && lastSavedInvoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base">معاينة الإيصال الحراري ({settings.thermalPrinterWidth})</h3>
              </div>
              <button 
                onClick={() => setShowReceiptModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Receipt Preview (Thermal 80mm format) */}
            <div className="p-6 bg-slate-50 font-mono text-xs overflow-y-auto max-h-[70vh]">
              <div className="bg-white p-5 border border-dashed border-slate-300 shadow-sm text-center text-slate-900">
                
                {/* Pharmacy Name & Header */}
                <h2 className="font-black text-base">{settings.pharmacyName}</h2>
                <p className="text-[11px] text-slate-600">{settings.pharmacyBranch}</p>
                <p className="text-[11px] text-slate-600">س.ت: {settings.commercialReg} | ب.ض: {settings.taxNumber}</p>
                <p className="text-[11px] text-slate-600">هاتف: {settings.phone1}</p>

                <div className="my-2 border-b border-dashed border-slate-400"></div>

                {/* Receipt Details */}
                <div className="text-right text-[11px] space-y-0.5">
                  <div>رقم الفاتورة: <span className="font-bold">{lastSavedInvoice.invoiceNumber}</span></div>
                  <div>التاريخ: {lastSavedInvoice.date} {lastSavedInvoice.time}</div>
                  <div>المستخدم: {lastSavedInvoice.userNameSnapshot}</div>
                  <div>العميل: {lastSavedInvoice.customerName}</div>
                  <div>طريقة الدفع: {lastSavedInvoice.paymentMethod}</div>
                </div>

                <div className="my-2 border-b border-dashed border-slate-400"></div>

                {/* Items */}
                <table className="w-full text-right text-[11px] mb-2">
                  <thead>
                    <tr className="border-b border-slate-300 font-bold">
                      <th className="py-1">الصنف</th>
                      <th className="py-1 text-center">الكمية</th>
                      <th className="py-1 text-left">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lastSavedInvoice.items.map((it, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="py-1 font-sans">{it.drugName} ({it.unitType})</td>
                        <td className="py-1 text-center font-bold">{it.quantity}</td>
                        <td className="py-1 text-left font-bold">{it.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="my-2 border-b-2 border-slate-900"></div>

                {/* Totals */}
                <div className="text-right text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>الإجمالي:</span>
                    <span>{lastSavedInvoice.subtotal.toFixed(2)} ج.م</span>
                  </div>
                  {lastSavedInvoice.totalDiscount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>الخصم:</span>
                      <span>-{lastSavedInvoice.totalDiscount.toFixed(2)} ج.م</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-200">
                    <span>صافي المستحق:</span>
                    <span>{lastSavedInvoice.netPayable.toFixed(2)} ج.م</span>
                  </div>
                </div>

                {/* ZATCA QR Code (TLV Base64) */}
                {settings.enableZatcaQr && qrDataUrl && (
                  <div className="mt-4 pt-3 border-t border-dashed border-slate-300 flex flex-col items-center">
                    <img src={qrDataUrl} alt="ZATCA TLV QR" className="w-28 h-28 border border-slate-200 p-1" />
                    <span className="text-[9px] text-slate-500 mt-1 font-sans">
                      رمز الفاتورة الإلكترونية المعتمد (ZATCA TLV)
                    </span>
                  </div>
                )}

                <div className="mt-4 text-[10px] text-slate-500 font-sans">
                  {settings.receiptFooterMessage}
                </div>

              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">طابعة ويندوز: الافتراضية ({settings.thermalPrinterWidth})</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg"
                >
                  إغلاق
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  طباعة الآن
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
