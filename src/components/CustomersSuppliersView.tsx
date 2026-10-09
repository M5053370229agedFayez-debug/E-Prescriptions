import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  Plus, 
  Search, 
  Phone, 
  MapPin, 
  CreditCard,
  DollarSign
} from 'lucide-react';
import { Customer, Supplier } from '../types/pharmacy';
import { PharmacyDatabaseService } from '../services/db';

export const CustomersSuppliersView: React.FC<{ type: 'customers' | 'suppliers' }> = ({ type }) => {
  const db = PharmacyDatabaseService.getInstance();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState<string>('');

  const loadData = () => {
    setCustomers(db.getCustomers());
    setSuppliers(db.getSuppliers());
  };

  useEffect(() => {
    loadData();
  }, [type]);

  const isCustomers = type === 'customers';

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search)
  );

  return (
    <div className="p-6 bg-slate-900 min-h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            {isCustomers ? <Users className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
          </div>
          <div>
            <h1 className="text-xl font-black text-white">
              {isCustomers ? 'إدارة العملاء ومديونيات الصيدلية' : 'الموردون وشركات توزيع الأدوية'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {isCustomers 
                ? 'كشوف حسابات العملاء، حسابات الشكك الشهرية، وتتبع سقف الائتمان' 
                : 'أرصدة شركات التوزيع، بيانات المناديب، ومطابقة الحسابات الدائنة'}
            </p>
          </div>
        </div>

        <div className="relative w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isCustomers ? 'بحث باسم العميل أو الهاتف...' : 'بحث باسم المورد أو الشركة...'}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isCustomers ? (
          filteredCustomers.map(c => (
            <div key={c.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-white text-sm">{c.name}</div>
                <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                  c.balance > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {c.balance > 0 ? `مدين: ${c.balance.toFixed(2)} ج.م` : 'خالص الحساب'}
                </span>
              </div>

              <div className="text-xs text-slate-400 space-y-1.5 font-mono">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{c.phone}</span>
                </div>
                {c.address && (
                  <div className="flex items-center gap-2 font-sans">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{c.address}</span>
                  </div>
                )}
              </div>

              {c.notes && (
                <div className="text-[11px] text-indigo-300 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  {c.notes}
                </div>
              )}
            </div>
          ))
        ) : (
          filteredSuppliers.map(s => (
            <div key={s.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm">{s.name}</div>
                  <div className="text-[11px] text-slate-400">{s.companyName}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                  s.balance > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {s.balance > 0 ? `دائن: ${s.balance.toFixed(2)} ج.م` : 'مُسوّى'}
                </span>
              </div>

              <div className="text-xs text-slate-400 space-y-1.5 font-mono">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{s.phone}</span>
                </div>
                {s.representativeName && (
                  <div className="flex items-center gap-2 font-sans">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>المندوب: {s.representativeName} ({s.representativePhone})</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
