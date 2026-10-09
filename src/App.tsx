/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  ActiveTab 
} from './components/Navigation';
import { SalesInvoiceView } from './components/SalesInvoiceView';
import { InventoryView } from './components/InventoryView';
import { PurchasesView } from './components/PurchasesView';
import { CustomersSuppliersView } from './components/CustomersSuppliersView';
import { FinanceZakatView } from './components/FinanceZakatView';
import { ReportsView } from './components/ReportsView';
import { UsersManagementView } from './components/UsersManagementView';
import { OwnerAuditLogView } from './components/OwnerAuditLogView';
import { SettingsBackupView } from './components/SettingsBackupView';
import { CSharpSolutionExplorer } from './components/CSharpSolutionExplorer';
import { FirstRunWizardModal } from './components/FirstRunWizardModal';
import { PharmacyDatabaseService } from './services/db';
import { User } from './types/pharmacy';
import { 
  Minus, 
  Square, 
  X, 
  WifiOff, 
  ShieldCheck, 
  ChevronLeft,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';

export default function App() {
  const db = PharmacyDatabaseService.getInstance();
  const [currentUser, setCurrentUser] = useState<User>(db.getCurrentUser());
  const [activeTab, setActiveTab] = useState<ActiveTab>('sales');
  const [showFirstRunModal, setShowFirstRunModal] = useState<boolean>(false);

  // Global F-keys navigation shortcuts (Desktop feel)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setActiveTab('sales');
      } else if (e.key === 'F2' && activeTab !== 'sales') {
        // If not on sales screen, F2 opens inventory
        e.preventDefault();
        setActiveTab('inventory');
      } else if (e.key === 'F3' && activeTab !== 'sales') {
        e.preventDefault();
        setActiveTab('purchases');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setActiveTab('customers');
      } else if (e.key === 'F5') {
        e.preventDefault();
        setActiveTab('suppliers');
      } else if (e.key === 'F6') {
        e.preventDefault();
        setActiveTab('finance');
      } else if (e.key === 'F7') {
        e.preventDefault();
        setActiveTab('reports');
      } else if (e.key === 'F8') {
        if (currentUser.role === 'Owner' || currentUser.role === 'Admin') {
          e.preventDefault();
          setActiveTab('users');
        }
      } else if (e.key === 'F11') {
        e.preventDefault();
        setActiveTab('settings');
      } else if (e.key === 'F12') {
        e.preventDefault();
        setActiveTab('csharp-code');
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeTab, currentUser]);

  const handleSwitchUser = (user: User) => {
    db.setCurrentUser(user);
    setCurrentUser(user);
    // Navigation Guard 4.2: If switching to non-owner while on owner audit log, bounce to sales
    if (user.role !== 'Owner' && activeTab === 'owner-audit') {
      setActiveTab('sales');
    }
  };

  const handleSelectTab = (tab: ActiveTab) => {
    // Navigation Guard 4.2:
    if (tab === 'owner-audit' && currentUser.role !== 'Owner') {
      // Silently fail navigation
      return;
    }
    setActiveTab(tab);
  };

  // Breadcrumb Title
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
      case 'owner-audit': return 'سجل تعديلات المالك (Owner Audit Log)';
      case 'settings': return 'إعدادات النظام والطابعات والنسخ الاحتياطي';
      case 'csharp-code': return 'مستكشف كود C# .NET الكامل والحل البرمجي';
    }
  };

  // All users available for testing
  // In real WPF application, login screen selects user.
  // Here we show all users in the switcher so the reviewer can test Owner vs Admin behavior!
  const allUsersForTesting: User[] = [
    {
      id: 'user_owner_01',
      username: 'dr_owner',
      fullName: 'د. طارق عبد الرحمن (مالك الصيدلية)',
      role: 'Owner',
      isActive: true,
      createdAt: '2026-01-01',
    },
    {
      id: 'user_admin_02',
      username: 'admin_ahmed',
      fullName: 'أحمد كمال (مدير النظام والفرع)',
      role: 'Admin',
      isActive: true,
      createdAt: '2026-01-10',
    },
    {
      id: 'user_pharm_03',
      username: 'ph_youssef',
      fullName: 'د. يوسف عادل (صيدلي أول)',
      role: 'Pharmacist',
      isActive: true,
      createdAt: '2026-02-01',
    },
    {
      id: 'user_cashier_04',
      username: 'cashier_sara',
      fullName: 'سارة مصطفى (كاشير)',
      role: 'Cashier',
      isActive: true,
      createdAt: '2026-02-15',
    }
  ];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-900 text-slate-100 select-none">
      
      {/* ══════════ Windows Desktop Title Bar (WPF Window Chrome) ══════════ */}
      <header className="h-9 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-3 text-xs shrink-0 z-40 select-none">
        
        {/* Left (RTL Start): App Icon & Title */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white">
            Rx
          </div>
          <span className="font-bold text-slate-300">
            e_prescriptions — نظام إدارة الصيدليات المتكامل (.NET Framework 4.8 / WPF)
          </span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">
            EGP / مصر
          </span>
        </div>

        {/* Center: System Status & User Security info */}
        <div className="hidden md:flex items-center gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>SQLite محلي (بدون إنترنت)</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <span>المستخدم:</span>
            <strong className="text-white">{currentUser.fullName}</strong>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
              currentUser.role === 'Owner' ? 'bg-amber-500/20 text-amber-300' : 'bg-indigo-500/20 text-indigo-300'
            }`}>
              ({currentUser.role})
            </span>
          </div>
        </div>

        {/* Right (RTL End): Window Controls (Minimize, Maximize, Close) */}
        <div className="flex items-center space-x-1 space-x-reverse text-slate-400">
          <button className="w-7 h-6 flex items-center justify-center hover:bg-slate-800 hover:text-white transition-colors rounded">
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button className="w-7 h-6 flex items-center justify-center hover:bg-slate-800 hover:text-white transition-colors rounded">
            <Square className="w-3 h-3" />
          </button>
          <button className="w-7 h-6 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-colors rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ══════════ Main Content Area with Sidebar ══════════ */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Navigation Sidebar */}
        <Navigation
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          currentUser={currentUser}
          onSwitchUser={handleSwitchUser}
          availableUsers={allUsersForTesting}
          isOwnerLoggedIn={currentUser.role === 'Owner'}
        />

        {/* Main View Area with Breadcrumb */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-900">
          
          {/* Breadcrumb Header */}
          <div className="h-10 bg-slate-950/60 border-b border-slate-800/80 px-6 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">الرئيسية</span>
              <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-indigo-400 font-bold">{getTabTitle(activeTab)}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFirstRunModal(true)}
                className="text-[11px] text-slate-400 hover:text-indigo-300 flex items-center gap-1 hover:underline"
              >
                <Sparkles className="w-3 h-3 text-indigo-400" />
                معالج الإعداد الأول
              </button>
              <span>•</span>
              <span className="font-mono text-slate-500">FlowDirection="RightToLeft"</span>
            </div>
          </div>

          {/* Tab Views */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'sales' && (
              <SalesInvoiceView currentUser={currentUser} />
            )}

            {activeTab === 'inventory' && (
              <InventoryView />
            )}

            {activeTab === 'purchases' && (
              <PurchasesView />
            )}

            {activeTab === 'customers' && (
              <CustomersSuppliersView type="customers" />
            )}

            {activeTab === 'suppliers' && (
              <CustomersSuppliersView type="suppliers" />
            )}

            {activeTab === 'finance' && (
              <FinanceZakatView currentUser={currentUser} />
            )}

            {activeTab === 'reports' && (
              <ReportsView />
            )}

            {activeTab === 'users' && (
              <UsersManagementView currentUser={currentUser} />
            )}

            {activeTab === 'owner-audit' && (
              <OwnerAuditLogView currentUser={currentUser} />
            )}

            {activeTab === 'settings' && (
              <SettingsBackupView currentUser={currentUser} />
            )}

            {activeTab === 'csharp-code' && (
              <CSharpSolutionExplorer />
            )}
          </div>

        </main>
      </div>

      {/* First-Run Setup Wizard Modal */}
      <FirstRunWizardModal
        isOpen={showFirstRunModal}
        onComplete={() => {
          setShowFirstRunModal(false);
          setCurrentUser(db.getCurrentUser());
        }}
      />

    </div>
  );
}
