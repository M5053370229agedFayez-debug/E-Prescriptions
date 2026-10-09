// Types for e_prescriptions Pharmacy Management System
// Egyptian Market (EGP), Offline-First, Role-Based Access Control

export type UserRole = 'Owner' | 'Admin' | 'Pharmacist' | 'Cashier' | 'Accountant';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  phone?: string;
  nationalId?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface Shift {
  id: string;
  userId: string;
  userName: string;
  startTime: string;
  endTime?: string;
  initialCash: number;
  expectedCash: number;
  actualCash?: number;
  cashDifference?: number;
  totalSales: number;
  totalReturns: number;
  status: 'Open' | 'Closed';
  notes?: string;
}

export interface DrugBatch {
  id: string;
  drugId: string;
  batchNumber: string;
  expiryDate: string; // YYYY-MM-DD (Used for FEFO sorting)
  costPrice: number; // EGP
  salePrice: number; // EGP (Per Box/Package)
  stripPrice: number; // EGP (Per Strip/Tape)
  unitPrice: number; // EGP (Per Single Unit/Tablet)
  boxQuantity: number;
  stripsPerBox: number;
  unitsPerStrip: number;
  totalUnitsAvailable: number; // Calculated: box * stripsPerBox * unitsPerStrip
}

export interface Drug {
  id: string;
  code: string;
  barcode: string;
  nameArabic: string;
  nameEnglish: string;
  activeIngredient: string;
  category: string;
  company: string;
  location: string; // Shelf / Rack
  stripsPerBox: number;
  unitsPerStrip: number;
  minStockAlert: number;
  batches: DrugBatch[];
  totalBoxesStock: number;
  isPrescriptionRequired: boolean;
  notes?: string;
}

export type UnitType = 'Box' | 'Strip' | 'Unit';

export interface SaleInvoiceItem {
  id: string;
  drugId: string;
  drugCode: string;
  drugName: string;
  batchId: string;
  batchNumber: string;
  expiryDate: string;
  unitType: UnitType; // علبة / شريط / وحدة (قرص)
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
  total: number;
  availableStock: number;
}

export interface SaleInvoice {
  id: string;
  invoiceNumber: string;
  date: string; // ISO
  time: string;
  dayName: string;
  userId: string;
  userNameSnapshot: string; // Snapshot for joins
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  doctorName?: string;
  items: SaleInvoiceItem[];
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  netPayable: number;
  paidAmount: number;
  remainingAmount: number;
  paymentMethod: 'Cash' | 'Card' | 'Credit' | 'InstaPay' | 'VodafoneCash';
  status: 'Completed' | 'Returned' | 'PartiallyReturned';
  zatcaQrBase64?: string;
  notes?: string;
}

export interface PurchaseInvoiceItem {
  id: string;
  drugId: string;
  drugName: string;
  batchNumber: string;
  expiryDate: string;
  boxQuantity: number;
  bonusQuantity: number;
  costPrice: number;
  salePrice: number;
  discountPercent: number;
  taxPercent: number;
  total: number;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  supplierInvoiceNumber: string;
  date: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseInvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  netPayable: number;
  paidAmount: number;
  status: 'Received' | 'Pending';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  balance: number; // Positive = owes pharmacy, Negative = pharmacy owes customer
  creditLimit: number;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  representativeName?: string;
  representativePhone?: string;
  balance: number; // Positive = pharmacy owes supplier
  address?: string;
}

export interface Expense {
  id: string;
  date: string;
  category: 'Salaries' | 'Utilities' | 'Rent' | 'Maintenance' | 'Supplies' | 'Taxes' | 'Other';
  amount: number;
  description: string;
  userId: string;
  userName: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  referenceNumber: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  userId: string;
}

// 4.2 Owner Audit Log Entity with Hash Chain
export interface OwnerAuditLog {
  id: string;
  timestampUtc: string;
  timestampLocal: string;
  ownerUserId: string;
  machineName: string;
  entityType: 'Drug' | 'SaleInvoice' | 'PurchaseInvoice' | 'User' | 'Customer' | 'Supplier' | 'Settings' | 'JournalEntry';
  entityId: string;
  action: 'Create' | 'Update' | 'Delete';
  fieldName: string;
  oldValue: string;
  newValue: string;
  changeGroupId: string;
  hash: string;       // SHA-256(previousHash + rowContent)
  previousHash: string;
}

export interface PharmacySettings {
  pharmacyName: string;
  pharmacyBranch: string;
  commercialReg: string; // السجل التجاري
  taxNumber: string; // البطاقة الضريبية
  phone1: string;
  phone2?: string;
  address: string;
  currency: string; // "ج.م"
  defaultTaxRate: number; // 0 or 14%
  enableZatcaQr: boolean;
  thermalPrinterWidth: '58mm' | '80mm';
  receiptFooterMessage: string;
  isFirstRunCompleted: boolean;
  lowStockThreshold: number;
  nearExpiryMonths: number;
  backupPath: string;
  autoBackupIntervalHours: number;
}
