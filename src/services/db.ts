// Data Layer & Repository with Central UserQuery Scope & Owner Audit Interceptor
import { 
  Drug, 
  SaleInvoice, 
  PurchaseInvoice, 
  Customer, 
  Supplier, 
  User, 
  OwnerAuditLog, 
  PharmacySettings, 
  Shift, 
  Expense, 
  JournalEntry 
} from '../types/pharmacy';

const STORAGE_KEYS = {
  SETTINGS: 'ep_settings',
  USERS: 'ep_users',
  DRUGS: 'ep_drugs',
  SALES: 'ep_sales',
  PURCHASES: 'ep_purchases',
  CUSTOMERS: 'ep_customers',
  SUPPLIERS: 'ep_suppliers',
  SHIFTS: 'ep_shifts',
  EXPENSES: 'ep_expenses',
  JOURNAL: 'ep_journal',
  OWNER_AUDIT: 'ep_owner_audit_log',
  CURRENT_USER: 'ep_current_user',
};

// Default Egyptian Pharmacy Settings
const defaultSettings: PharmacySettings = {
  pharmacyName: 'صيدلية النور والشفاء',
  pharmacyBranch: 'الفرع الرئيسي - مصر',
  commercialReg: '109842',
  taxNumber: '489-210-983',
  phone1: '02-23456789',
  phone2: '01012345678',
  address: 'شارع الجمهورية، وسط البلد، القاهرة',
  currency: 'ج.م',
  defaultTaxRate: 0, // Medications mostly 0% VAT in Egypt
  enableZatcaQr: true,
  thermalPrinterWidth: '80mm',
  receiptFooterMessage: 'نتمنى لكم الشفاء العاجل - يرجي الاحتفاظ بالفاتورة للاسترجاع خلال 14 يوماً وفقاً لتعليمات وزارة الصحة',
  isFirstRunCompleted: true, // Will start initialized with sample data
  lowStockThreshold: 10,
  nearExpiryMonths: 4,
  backupPath: 'C:\\EPrescriptions\\Backups',
  autoBackupIntervalHours: 24,
};

// Seed Data for Egyptian Market Drugs with realistic FEFO batches & split packages
const seedDrugs: Drug[] = [
  {
    id: 'drug_1',
    code: 'PAN-EXT-01',
    barcode: '6223000123456',
    nameArabic: 'بنادول إكسترا 500 مجم (Panadol Extra)',
    nameEnglish: 'Panadol Extra 500mg',
    activeIngredient: 'Paracetamol 500mg + Caffeine 65mg',
    category: 'مسكنات وخافض حرارة',
    company: 'GSK Egypt',
    location: 'رف A-1',
    stripsPerBox: 2,
    unitsPerStrip: 12,
    minStockAlert: 15,
    totalBoxesStock: 45,
    isPrescriptionRequired: false,
    batches: [
      {
        id: 'b_1_1',
        drugId: 'drug_1',
        batchNumber: 'BN-2024-098',
        expiryDate: '2026-12-01',
        costPrice: 42.0,
        salePrice: 55.0, // Box
        stripPrice: 27.5, // Strip
        unitPrice: 2.3, // Tablet
        boxQuantity: 20,
        stripsPerBox: 2,
        unitsPerStrip: 12,
        totalUnitsAvailable: 480,
      },
      {
        id: 'b_1_2',
        drugId: 'drug_1',
        batchNumber: 'BN-2025-112',
        expiryDate: '2027-08-15',
        costPrice: 43.5,
        salePrice: 55.0,
        stripPrice: 27.5,
        unitPrice: 2.3,
        boxQuantity: 25,
        stripsPerBox: 2,
        unitsPerStrip: 12,
        totalUnitsAvailable: 600,
      }
    ]
  },
  {
    id: 'drug_2',
    code: 'AUG-1G-02',
    barcode: '6221000987654',
    nameArabic: 'أوجمنتين 1 جم أقراص (Augmentin 1g)',
    nameEnglish: 'Augmentin 1g Tablets',
    activeIngredient: 'Amoxicillin 875mg + Clavulanic Acid 125mg',
    category: 'مضادات حيوية',
    company: 'Medical Union / GSK',
    location: 'رف B-3',
    stripsPerBox: 2,
    unitsPerStrip: 7,
    minStockAlert: 10,
    totalBoxesStock: 28,
    isPrescriptionRequired: true,
    batches: [
      {
        id: 'b_2_1',
        drugId: 'drug_2',
        batchNumber: 'AUG-24-77',
        expiryDate: '2026-11-20', // Expiring relatively soon
        costPrice: 110.0,
        salePrice: 135.0,
        stripPrice: 67.5,
        unitPrice: 9.64,
        boxQuantity: 8,
        stripsPerBox: 2,
        unitsPerStrip: 7,
        totalUnitsAvailable: 112,
      },
      {
        id: 'b_2_2',
        drugId: 'drug_2',
        batchNumber: 'AUG-25-101',
        expiryDate: '2027-10-30',
        costPrice: 112.0,
        salePrice: 135.0,
        stripPrice: 67.5,
        unitPrice: 9.64,
        boxQuantity: 20,
        stripsPerBox: 2,
        unitsPerStrip: 7,
        totalUnitsAvailable: 280,
      }
    ]
  },
  {
    id: 'drug_3',
    code: 'CONG-TAB-03',
    barcode: '6224000334455',
    nameArabic: 'كونجستال أقراص (Congestal Tablets)',
    nameEnglish: 'Congestal Tablets',
    activeIngredient: 'Paracetamol + Pseudoephedrine + Chlorpheniramine',
    category: 'نزلات البرد والإنفلونزا',
    company: 'Sigma Pharma',
    location: 'رف A-2',
    stripsPerBox: 2,
    unitsPerStrip: 10,
    minStockAlert: 20,
    totalBoxesStock: 50,
    isPrescriptionRequired: false,
    batches: [
      {
        id: 'b_3_1',
        drugId: 'drug_3',
        batchNumber: 'CG-8834',
        expiryDate: '2027-05-10',
        costPrice: 28.0,
        salePrice: 36.0,
        stripPrice: 18.0,
        unitPrice: 1.8,
        boxQuantity: 50,
        stripsPerBox: 2,
        unitsPerStrip: 10,
        totalUnitsAvailable: 1000,
      }
    ]
  },
  {
    id: 'drug_4',
    code: 'CAT-50-04',
    barcode: '6221500445566',
    nameArabic: 'كتافلام 50 مجم (Cataflam 50mg)',
    nameEnglish: 'Cataflam 50mg Tablets',
    activeIngredient: 'Diclofenac Potassium 50mg',
    category: 'مضادات الالتهاب والروماتيزم',
    company: 'Novartis Egypt',
    location: 'رف C-1',
    stripsPerBox: 2,
    unitsPerStrip: 10,
    minStockAlert: 12,
    totalBoxesStock: 34,
    isPrescriptionRequired: false,
    batches: [
      {
        id: 'b_4_1',
        drugId: 'drug_4',
        batchNumber: 'NOV-CTF-99',
        expiryDate: '2026-10-25', // Near expiry alert
        costPrice: 51.0,
        salePrice: 65.0,
        stripPrice: 32.5,
        unitPrice: 3.25,
        boxQuantity: 14,
        stripsPerBox: 2,
        unitsPerStrip: 10,
        totalUnitsAvailable: 280,
      },
      {
        id: 'b_4_2',
        drugId: 'drug_4',
        batchNumber: 'NOV-CTF-105',
        expiryDate: '2028-02-14',
        costPrice: 52.0,
        salePrice: 65.0,
        stripPrice: 32.5,
        unitPrice: 3.25,
        boxQuantity: 20,
        stripsPerBox: 2,
        unitsPerStrip: 10,
        totalUnitsAvailable: 400,
      }
    ]
  },
  {
    id: 'drug_5',
    code: 'CONC-5-05',
    barcode: '6222000889900',
    nameArabic: 'كونكور 5 مجم (Concor 5mg)',
    nameEnglish: 'Concor 5mg Tablets',
    activeIngredient: 'Bisoprolol Fumarate 5mg',
    category: 'ضغط الدم والقلب',
    company: 'Merck Serono',
    location: 'رف D-2',
    stripsPerBox: 3,
    unitsPerStrip: 10,
    minStockAlert: 8,
    totalBoxesStock: 18,
    isPrescriptionRequired: true,
    batches: [
      {
        id: 'b_5_1',
        drugId: 'drug_5',
        batchNumber: 'MRK-230-01',
        expiryDate: '2027-11-15',
        costPrice: 78.0,
        salePrice: 96.0,
        stripPrice: 32.0,
        unitPrice: 3.2,
        boxQuantity: 18,
        stripsPerBox: 3,
        unitsPerStrip: 10,
        totalUnitsAvailable: 540,
      }
    ]
  },
  {
    id: 'drug_6',
    code: 'GLUC-1G-06',
    barcode: '6221100554433',
    nameArabic: 'جلوكوفاج 1000 مجم (Glucophage 1000mg)',
    nameEnglish: 'Glucophage 1000mg',
    activeIngredient: 'Metformin Hydrochloride 1000mg',
    category: 'أدوية السكر',
    company: 'Merck / Minapharm',
    location: 'رف D-4',
    stripsPerBox: 3,
    unitsPerStrip: 10,
    minStockAlert: 15,
    totalBoxesStock: 25,
    isPrescriptionRequired: true,
    batches: [
      {
        id: 'b_6_1',
        drugId: 'drug_6',
        batchNumber: 'GLU-945',
        expiryDate: '2028-06-30',
        costPrice: 62.0,
        salePrice: 78.0,
        stripPrice: 26.0,
        unitPrice: 2.6,
        boxQuantity: 25,
        stripsPerBox: 3,
        unitsPerStrip: 10,
        totalUnitsAvailable: 750,
      }
    ]
  }
];

// Seed Customers
const seedCustomers: Customer[] = [
  {
    id: 'cust_cash',
    name: 'عميل نقدي عام (جمهور)',
    phone: '00000000000',
    balance: 0,
    creditLimit: 0,
  },
  {
    id: 'cust_1',
    name: 'أحمد محمود إسماعيل',
    phone: '01099887766',
    address: 'عمارة 14، شارع الجمهورية',
    balance: 150.0, // owes 150 EGP
    creditLimit: 1000.0,
    notes: 'مريض سكر وضغط مزمن - حساب شهري',
  },
  {
    id: 'cust_2',
    name: 'دكتورة منى إبراهيم سليم',
    phone: '01223344556',
    address: 'عيادات النزهة التخصصية',
    balance: 0,
    creditLimit: 3000.0,
    notes: 'طبيبة أطفال',
  }
];

// Seed Suppliers
const seedSuppliers: Supplier[] = [
  {
    id: 'sup_1',
    name: 'الشركة المتحدة للتوزيع (UCP)',
    companyName: 'United Company of Pharmacists',
    phone: '02-33445566',
    representativeName: 'كابتن هاني التوريدات',
    representativePhone: '01011223344',
    balance: 12500.0,
  },
  {
    id: 'sup_2',
    name: 'شركة ابن سينا فارما (Ibnsina Pharma)',
    companyName: 'Ibnsina Pharma S.A.E',
    phone: '02-44556677',
    representativeName: 'م. شريف مندوب وسط البلد',
    representativePhone: '01122334455',
    balance: 8400.0,
  },
  {
    id: 'sup_3',
    name: 'فارما أوفرسيز (Pharma Overseas)',
    companyName: 'Pharma Overseas Egypt',
    phone: '02-55667788',
    balance: 0.0,
  }
];

// Initial Users:
// 1 Owner (Hidden at data layer for non-owner), 1 Admin, 1 Pharmacist, 1 Cashier
const seedUsers: User[] = [
  {
    id: 'user_owner_01',
    username: 'dr_owner',
    fullName: 'د. طارق عبد الرحمن (مالك الصيدلية)',
    role: 'Owner',
    isActive: true,
    phone: '01000000001',
    nationalId: '28001010100123',
    createdAt: '2026-01-01T08:00:00Z',
    lastLogin: '2026-10-09T08:30:00Z',
  },
  {
    id: 'user_admin_02',
    username: 'admin_ahmed',
    fullName: 'أحمد كمال (مدير النظام والفرع)',
    role: 'Admin',
    isActive: true,
    phone: '01022334455',
    createdAt: '2026-01-10T09:00:00Z',
    lastLogin: '2026-10-09T07:15:00Z',
  },
  {
    id: 'user_pharm_03',
    username: 'ph_youssef',
    fullName: 'د. يوسف عادل (صيدلي أول شيفت صباحي)',
    role: 'Pharmacist',
    isActive: true,
    phone: '01144556677',
    createdAt: '2026-02-01T10:00:00Z',
    lastLogin: '2026-10-09T09:00:00Z',
  },
  {
    id: 'user_cashier_04',
    username: 'cashier_sara',
    fullName: 'سارة مصطفى (كاشير شيفت مسائي)',
    role: 'Cashier',
    isActive: true,
    phone: '01288990011',
    createdAt: '2026-02-15T11:00:00Z',
  }
];

// Helper: Simple SHA-256 for browser runtime hash chain
async function computeSha256(text: string): Promise<string> {
  const enc = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(text));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export class PharmacyDatabaseService {
  private static instance: PharmacyDatabaseService;
  private currentUser: User = seedUsers[0]; // Default to Owner initially for full demonstration

  private constructor() {
    this.initDatabase();
  }

  public static getInstance(): PharmacyDatabaseService {
    if (!PharmacyDatabaseService.instance) {
      PharmacyDatabaseService.instance = new PharmacyDatabaseService();
    }
    return PharmacyDatabaseService.instance;
  }

  private initDatabase() {
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(seedUsers));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DRUGS)) {
      localStorage.setItem(STORAGE_KEYS.DRUGS, JSON.stringify(seedDrugs));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(seedCustomers));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
      localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(seedSuppliers));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SALES)) {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PURCHASES)) {
      localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SHIFTS)) {
      // Create an open shift for the day
      const initialShift: Shift = {
        id: 'shift_today_1',
        userId: seedUsers[0].id,
        userName: seedUsers[0].fullName,
        startTime: new Date().toISOString(),
        initialCash: 500.0,
        expectedCash: 500.0,
        totalSales: 0,
        totalReturns: 0,
        status: 'Open',
        notes: 'شيفت الافتتاح الصباحي',
      };
      localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify([initialShift]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
      const seedExp: Expense[] = [
        {
          id: 'exp_1',
          date: new Date().toISOString().split('T')[0],
          category: 'Supplies',
          amount: 85.0,
          description: 'أكياس صيدلية وبكر طابعة حرارية 80مم',
          userId: seedUsers[0].id,
          userName: seedUsers[0].fullName,
        }
      ];
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(seedExp));
    }
    if (!localStorage.getItem(STORAGE_KEYS.JOURNAL)) {
      localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.OWNER_AUDIT)) {
      localStorage.setItem(STORAGE_KEYS.OWNER_AUDIT, JSON.stringify([]));
    }

    const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch {
        this.currentUser = seedUsers[0];
      }
    }
  }

  // Current User Session Management
  public getCurrentUser(): User {
    return this.currentUser;
  }

  public setCurrentUser(user: User): void {
    this.currentUser = user;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  // ════════════════════════════════════════════════════════════════════
  // 4.1 Owner Role - Central Data Layer UserQuery Scope Filtering
  // ════════════════════════════════════════════════════════════════════
  /**
   * CENTRAL REPOSITORY FILTER:
   * Any query from a non-owner user AUTOMATICALLY excludes the Owner user.
   * ViewModels and callers CANNOT bypass this.
   */
  public getUsers(): User[] {
    const rawUsers: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    if (this.currentUser.role === 'Owner') {
      return rawUsers;
    }
    // Strict Central Data Layer Hiding:
    return rawUsers.filter(u => u.role !== 'Owner');
  }

  public getUserById(id: string): User | undefined {
    const users = this.getUsers(); // Uses central filter
    return users.find(u => u.id === id);
  }

  /**
   * Snapshot User Name Helper:
   * Left-joins or document displays use the snapshot username saved with the record,
   * so historical sales made by Owner do not display blank or fail for staff.
   */
  public getUserDisplayNameForDocument(userId: string, snapshotName?: string): string {
    if (snapshotName) return snapshotName;
    const user = this.getUserById(userId);
    return user ? user.fullName : 'مسؤول النظام';
  }

  public async saveUser(userToSave: User, isNew: boolean): Promise<{ success: boolean; message: string }> {
    const allUsers: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');

    // Check if non-owner tries to edit or tamper with Owner account
    const existing = allUsers.find(u => u.id === userToSave.id);
    if (existing && existing.role === 'Owner' && this.currentUser.role !== 'Owner') {
      return { success: false, message: 'غير مصرح بتعديل هذا الحساب.' };
    }

    // Specification 4.1: If non-owner tries to create username matching Owner's username,
    // return generic "اسم المستخدم غير متاح" without revealing that Owner exists!
    const duplicate = allUsers.find(u => u.username.toLowerCase() === userToSave.username.toLowerCase() && u.id !== userToSave.id);
    if (duplicate) {
      return { success: false, message: 'اسم المستخدم غير متاح' };
    }

    if (isNew) {
      allUsers.push(userToSave);
      await this.auditLogCentral('User', userToSave.id, 'Create', 'all', '', JSON.stringify({ username: userToSave.username, role: userToSave.role }));
    } else {
      const idx = allUsers.findIndex(u => u.id === userToSave.id);
      if (idx !== -1) {
        const old = allUsers[idx];
        allUsers[idx] = userToSave;
        await this.auditLogCentral('User', userToSave.id, 'Update', 'details', JSON.stringify(old), JSON.stringify(userToSave));
      }
    }

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(allUsers));
    return { success: true, message: 'تم حفظ المستخدم بنجاح.' };
  }

  public async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    const allUsers: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const target = allUsers.find(u => u.id === userId);
    
    if (!target) {
      return { success: false, message: 'المستخدم غير موجود' };
    }

    if (target.role === 'Owner') {
      return { success: false, message: 'لا يمكن حذف حساب المالك الرئيسي نهائياً.' };
    }

    const filtered = allUsers.filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
    await this.auditLogCentral('User', userId, 'Delete', 'all', target.username, '');
    return { success: true, message: 'تم حذف المستخدم بنجاح.' };
  }

  // ════════════════════════════════════════════════════════════════════
  // 4.2 Owner Audit Log - Central Interceptor & Cryptographic Hash Chain
  // ════════════════════════════════════════════════════════════════════
  private async auditLogCentral(
    entityType: OwnerAuditLog['entityType'],
    entityId: string,
    action: OwnerAuditLog['action'],
    fieldName: string,
    oldValue: string,
    newValue: string
  ): Promise<void> {
    // Specification: "تعديلات Admin والموظفين العاديين لا تُسجّل في هذا الجدول ولا في أي جدول مراقبة إضافي."
    // Automatic Interceptor: ONLY runs when currentUser is Owner!
    if (this.currentUser.role !== 'Owner') {
      return;
    }

    const logs: OwnerAuditLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.OWNER_AUDIT) || '[]');
    const previousHash = logs.length > 0 ? logs[logs.length - 1].hash : 'GENESIS_HASH_E_PRESCRIPTIONS_ROOT';

    const now = new Date();
    const id = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const changeGroupId = `grp_${Date.now()}`;

    const rawPayload = `${previousHash}|${id}|${now.toISOString()}|${this.currentUser.id}|${entityType}|${entityId}|${action}|${fieldName}|${oldValue}|${newValue}`;
    const hash = await computeSha256(rawPayload);

    const newLog: OwnerAuditLog = {
      id,
      timestampUtc: now.toISOString(),
      timestampLocal: now.toLocaleString('ar-EG'),
      ownerUserId: this.currentUser.id,
      machineName: 'PHARMACY-MAIN-PC',
      entityType,
      entityId,
      action,
      fieldName,
      oldValue,
      newValue,
      changeGroupId,
      hash,
      previousHash,
    };

    logs.push(newLog);
    localStorage.setItem(STORAGE_KEYS.OWNER_AUDIT, JSON.stringify(logs));
  }

  /**
   * Specification 4.2: Guarded retrieval.
   * If non-owner calls this, returns empty array silently (as if screen/data does not exist).
   */
  public getOwnerAuditLogs(): OwnerAuditLog[] {
    if (this.currentUser.role !== 'Owner') {
      return [];
    }
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.OWNER_AUDIT) || '[]');
  }

  // ════════════════════════════════════════════════════════════════════
  // Inventory & Drugs (FEFO - First Expired, First Out)
  // ════════════════════════════════════════════════════════════════════
  public getDrugs(): Drug[] {
    const drugs: Drug[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.DRUGS) || '[]');
    // Sort batches by FEFO (Earliest expiry first)
    drugs.forEach(d => {
      d.batches.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
      d.totalBoxesStock = d.batches.reduce((sum, b) => sum + b.boxQuantity, 0);
    });
    return drugs;
  }

  public async saveDrug(drug: Drug, isNew: boolean): Promise<void> {
    const drugs = this.getDrugs();
    if (isNew) {
      drugs.push(drug);
      await this.auditLogCentral('Drug', drug.id, 'Create', 'DrugRecord', '', JSON.stringify({ name: drug.nameArabic, code: drug.code }));
    } else {
      const idx = drugs.findIndex(d => d.id === drug.id);
      if (idx !== -1) {
        const old = drugs[idx];
        drugs[idx] = drug;
        await this.auditLogCentral('Drug', drug.id, 'Update', 'DrugDetails', JSON.stringify(old), JSON.stringify(drug));
      }
    }
    localStorage.setItem(STORAGE_KEYS.DRUGS, JSON.stringify(drugs));
  }

  /**
   * FEFO Stock Deduction for Sale Invoices
   */
  public async deductStockFEFO(drugId: string, unitType: 'Box' | 'Strip' | 'Unit', qty: number): Promise<{ success: boolean; batchNumberUsed: string; error?: string }> {
    const drugs = this.getDrugs();
    const drug = drugs.find(d => d.id === drugId);
    if (!drug) return { success: false, batchNumberUsed: '', error: 'الصنف غير موجود' };

    // FEFO: Sort batches by earliest expiry
    drug.batches.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

    // Calculate total units needed
    let unitsNeeded = 0;
    if (unitType === 'Box') {
      unitsNeeded = qty * drug.stripsPerBox * drug.unitsPerStrip;
    } else if (unitType === 'Strip') {
      unitsNeeded = qty * drug.unitsPerStrip;
    } else {
      unitsNeeded = qty;
    }

    let remainingNeeded = unitsNeeded;
    let usedBatchNum = '';

    for (const batch of drug.batches) {
      if (batch.totalUnitsAvailable <= 0) continue;

      if (!usedBatchNum) usedBatchNum = batch.batchNumber;

      if (batch.totalUnitsAvailable >= remainingNeeded) {
        batch.totalUnitsAvailable -= remainingNeeded;
        // Recalculate box quantity approximation
        batch.boxQuantity = parseFloat((batch.totalUnitsAvailable / (drug.stripsPerBox * drug.unitsPerStrip)).toFixed(2));
        remainingNeeded = 0;
        break;
      } else {
        remainingNeeded -= batch.totalUnitsAvailable;
        batch.totalUnitsAvailable = 0;
        batch.boxQuantity = 0;
      }
    }

    if (remainingNeeded > 0) {
      return { success: false, batchNumberUsed: '', error: 'الرصيد المتاح لا يكفي الكمية المطلوبة' };
    }

    drug.totalBoxesStock = drug.batches.reduce((sum, b) => sum + b.boxQuantity, 0);
    localStorage.setItem(STORAGE_KEYS.DRUGS, JSON.stringify(drugs));

    await this.auditLogCentral('Drug', drugId, 'Update', 'StockDeduction', `unitsNeeded: ${unitsNeeded}`, `remainingUnits: ${drug.totalBoxesStock}`);
    return { success: true, batchNumberUsed: usedBatchNum };
  }

  // ════════════════════════════════════════════════════════════════════
  // Sales Invoices
  // ════════════════════════════════════════════════════════════════════
  public getSales(): SaleInvoice[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES) || '[]');
  }

  public async saveSaleInvoice(invoice: SaleInvoice): Promise<void> {
    const sales = this.getSales();
    sales.unshift(invoice);
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));

    // Update customer balance if Credit
    if (invoice.paymentMethod === 'Credit' && invoice.customerId && invoice.remainingAmount > 0) {
      this.updateCustomerBalance(invoice.customerId, invoice.remainingAmount);
    }

    // Update open shift stats
    this.recordSaleInShift(invoice.netPayable, invoice.paymentMethod === 'Cash');

    await this.auditLogCentral('SaleInvoice', invoice.id, 'Create', 'Invoice', '', JSON.stringify({ number: invoice.invoiceNumber, total: invoice.netPayable, itemsCount: invoice.items.length }));
  }

  private recordSaleInShift(amount: number, isCash: boolean): void {
    const shifts: Shift[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SHIFTS) || '[]');
    const currentOpen = shifts.find(s => s.status === 'Open');
    if (currentOpen) {
      currentOpen.totalSales += amount;
      if (isCash) {
        currentOpen.expectedCash += amount;
      }
      localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
    }
  }

  // Customers & Suppliers
  public getCustomers(): Customer[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
  }

  public updateCustomerBalance(customerId: string, deltaAmount: number): void {
    const customers = this.getCustomers();
    const cust = customers.find(c => c.id === customerId);
    if (cust) {
      cust.balance += deltaAmount;
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    }
  }

  public async saveCustomer(customer: Customer, isNew: boolean): Promise<void> {
    const customers = this.getCustomers();
    if (isNew) {
      customers.push(customer);
      await this.auditLogCentral('Customer', customer.id, 'Create', 'Record', '', customer.name);
    } else {
      const idx = customers.findIndex(c => c.id === customer.id);
      if (idx !== -1) {
        customers[idx] = customer;
        await this.auditLogCentral('Customer', customer.id, 'Update', 'Record', '', customer.name);
      }
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }

  public getSuppliers(): Supplier[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SUPPLIERS) || '[]');
  }

  public async saveSupplier(supplier: Supplier, isNew: boolean): Promise<void> {
    const suppliers = this.getSuppliers();
    if (isNew) {
      suppliers.push(supplier);
      await this.auditLogCentral('Supplier', supplier.id, 'Create', 'Record', '', supplier.name);
    } else {
      const idx = suppliers.findIndex(s => s.id === supplier.id);
      if (idx !== -1) {
        suppliers[idx] = supplier;
        await this.auditLogCentral('Supplier', supplier.id, 'Update', 'Record', '', supplier.name);
      }
    }
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  }

  // Purchases
  public getPurchases(): PurchaseInvoice[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PURCHASES) || '[]');
  }

  public async savePurchaseInvoice(invoice: PurchaseInvoice): Promise<void> {
    const purchases = this.getPurchases();
    purchases.unshift(invoice);
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));

    // Update supplier balance
    const suppliers = this.getSuppliers();
    const sup = suppliers.find(s => s.id === invoice.supplierId);
    if (sup) {
      sup.balance += (invoice.netPayable - invoice.paidAmount);
      localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
    }

    // Add or update drug batches
    const drugs = this.getDrugs();
    invoice.items.forEach(item => {
      const drug = drugs.find(d => d.id === item.drugId);
      if (drug) {
        const totalUnits = (item.boxQuantity + item.bonusQuantity) * drug.stripsPerBox * drug.unitsPerStrip;
        drug.batches.push({
          id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          drugId: drug.id,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
          costPrice: item.costPrice,
          salePrice: item.salePrice,
          stripPrice: item.salePrice / drug.stripsPerBox,
          unitPrice: (item.salePrice / drug.stripsPerBox) / drug.unitsPerStrip,
          boxQuantity: item.boxQuantity + item.bonusQuantity,
          stripsPerBox: drug.stripsPerBox,
          unitsPerStrip: drug.unitsPerStrip,
          totalUnitsAvailable: totalUnits,
        });
        drug.totalBoxesStock = drug.batches.reduce((sum, b) => sum + b.boxQuantity, 0);
      }
    });
    localStorage.setItem(STORAGE_KEYS.DRUGS, JSON.stringify(drugs));

    await this.auditLogCentral('PurchaseInvoice', invoice.id, 'Create', 'Invoice', '', JSON.stringify({ number: invoice.invoiceNumber, total: invoice.netPayable }));
  }

  // Shifts & Expenses
  public getShifts(): Shift[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SHIFTS) || '[]');
  }

  public closeCurrentShift(actualCash: number, notes?: string): void {
    const shifts = this.getShifts();
    const current = shifts.find(s => s.status === 'Open');
    if (current) {
      current.status = 'Closed';
      current.endTime = new Date().toISOString();
      current.actualCash = actualCash;
      current.cashDifference = actualCash - current.expectedCash;
      current.notes = notes;
      localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
    }
  }

  public startNewShift(initialCash: number): void {
    const shifts = this.getShifts();
    const newShift: Shift = {
      id: `shift_${Date.now()}`,
      userId: this.currentUser.id,
      userName: this.currentUser.fullName,
      startTime: new Date().toISOString(),
      initialCash,
      expectedCash: initialCash,
      totalSales: 0,
      totalReturns: 0,
      status: 'Open',
    };
    shifts.unshift(newShift);
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
  }

  public getExpenses(): Expense[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
  }

  public addExpense(expense: Expense): void {
    const expenses = this.getExpenses();
    expenses.unshift(expense);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }

  public getSettings(): PharmacySettings {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || JSON.stringify(defaultSettings));
  }

  public async saveSettings(settings: PharmacySettings): Promise<void> {
    const old = this.getSettings();
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    await this.auditLogCentral('Settings', 'global', 'Update', 'PharmacySettings', JSON.stringify(old), JSON.stringify(settings));
  }
}
