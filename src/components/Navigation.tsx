import React from 'react';
import { 
  ShoppingCart, 
  Package, 
  Truck, 
  Users, 
  Building2, 
  Coins, 
  FileText, 
  ShieldAlert, 
  Settings, 
  Code2, 
  WifiOff, 
  Lock,
  Layers
} from 'lucide-react';
import { User } from '../types/pharmacy';

export type ActiveTab = 
  | 'sales' 
  | 'inventory' 
  | 'purchases' 
  | 'customers' 
  | 'suppliers' 
  | 'finance' 
  | 'reports' 
  | 'users' 
  | 'owner-audit' 
  | 'settings' 
  | 'csharp-code';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  currentUser: User;
  onSwitchUser: (user: User) => void;
  availableUsers: User[];
  isOwnerLoggedIn: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onSwitchUser,
  availableUsers,
  isOwnerLoggedIn,
}) => {
  // Breadcrumb generation
  const getTabTitle = (tab: ActiveTab) => {
    switch (tab) {
      case 'sales': return 'نقطة البيع وفاتورة المبيعات (POS)';
      case 'inventory': return 'الأدوية والمخزون والتشغيلات (FEFO)';
      case 'purchases': return 'فواتير المشتريات والتوريدات';
      case 'customers': return 'العملاء والمديونيات';
      case 'suppliers': return 'الموردين وكشوف الحساب';
      case 'finance': return 'المالية والشيفتات وحساب الزكاة';
      case 'reports': return 'التقارير الشاملة والإحصائيات';
      case 'users': return 'إدارة المستخدمين والصلاحيات';
      case 'owner-audit': return 'سجل تعديلات المالك (سري للغاية)';
      case 'settings': return 'إعدادات النظام والطابعات والنسخ الاحتياطي';
      case 'csharp-code': return 'مستكشف كود C# .NET والحل البرمجي';
    }
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; shortcut: string; ownerOnly?: boolean; adminMin?: boolean }[] = [
    { id: 'sales', label: 'نقطة البيع (المبيعات)', icon: <ShoppingCart className="w-5 h-5" />, shortcut: 'F1' },
    { id: 'inventory', label: 'المخزون والتشغيلات', icon: <Package className="w-5 h-5" />, shortcut: 'F2' },
    { id: 'purchases', label: 'فواتير المشتريات', icon: <Truck className="w-5 h-5" />, shortcut: 'F3' },
    { id: 'customers', label: 'العملاء والديون', icon: <Users className="w-5 h-5" />, shortcut: 'F4' },
    { id: 'suppliers', label: 'الموردين والحسابات', icon: <Building2 className="w-5 h-5" />, shortcut: 'F5' },
    { id: 'finance', label: 'المالية والشيفتات والزكاة', icon: <Coins className="w-5 h-5" />, shortcut: 'F6' },
    { id: 'reports', label: 'التقارير التحليلية', icon: <FileText className="w-5 h-5" />, shortcut: 'F7' },
    { id: 'users', label: 'المستخدمين والصلاحيات', icon: <Users className="w-5 h-5" />, shortcut: 'F8', adminMin: true },
    // Strictly Owner Only: Does not appear in sidebar unless user is Owner
    { id: 'owner-audit', label: 'سجل تعديلات المالك', icon: <ShieldAlert className="w-5 h-5 text-amber-400" />, shortcut: 'Sec', ownerOnly: true },
    { id: 'settings', label: 'الإعدادات والنسخ الاحتياطي', icon: <Settings className="w-5 h-5" />, shortcut: 'F11' },
    { id: 'csharp-code', label: 'مشروع C# .NET والمصدر', icon: <Code2 className="w-5 h-5 text-emerald-400" />, shortcut: 'F12' },
  ];

  const visibleNavItems = navItems.filter(item => {
    if (item.ownerOnly && !isOwnerLoggedIn) return false;
    if (item.adminMin && currentUser.role !== 'Owner' && currentUser.role !== 'Admin') return false;
    return true;
  });

  return (
    <aside className="w-64 bg-slate-950 border-l border-slate-800 flex flex-col justify-between shrink-0 select-none">
      {/* App Branding */}
      <div>
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-xl">
              Rx
            </div>
            <div>
              <div className="font-extrabold text-white text-base tracking-wide flex items-center gap-1.5">
                e_prescriptions
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">v1.0</span>
              </div>
              <div className="text-xs text-slate-400">نظام إدارة الصيدليات المتكامل</div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              يعمل محلياً (Offline)
            </span>
            <span className="font-mono text-slate-400">EGP</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-2 space-y-1">
          {visibleNavItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${isActive ? 'text-white' : 'text-slate-400'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  isActive ? 'bg-indigo-800 text-indigo-200' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.shortcut}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Current User Session Card & Switcher (for testing role isolation) */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
        <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
          <span>المستخدم الحالي (جلسة WPF):</span>
          {currentUser.role === 'Owner' ? (
            <span className="flex items-center gap-1 text-amber-400 text-[10px] bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
              <Lock className="w-3 h-3" /> المالك المخفي
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
              {currentUser.role}
            </span>
          )}
        </div>

        <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
          <div className="truncate">
            <div className="text-xs font-bold text-white truncate">{currentUser.fullName}</div>
            <div className="text-[11px] text-indigo-400 font-mono">@{currentUser.username}</div>
          </div>
        </div>

        {/* Quick Role Switcher to demonstrate the exact Owner data-layer hiding specification */}
        <div className="mt-2 text-[10px] text-slate-400">
          تبديل المستخدم لتجربة الصلاحيات:
          <select
            value={currentUser.id}
            onChange={(e) => {
              const selected = availableUsers.find(u => u.id === e.target.value);
              if (selected) onSwitchUser(selected);
            }}
            className="mt-1 w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            {availableUsers.map(u => (
              <option key={u.id} value={u.id}>
                {u.fullName} ({u.role})
              </option>
            ))}
          </select>
        </div>
      </div>
    </aside>
  );
};
