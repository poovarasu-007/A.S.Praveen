export type UnitType = 
  | 'kg' 
  | 'gram' 
  | 'quintal' 
  | 'ton' 
  | 'bag' 
  | 'litre' 
  | 'ml' 
  | 'piece' 
  | 'box' 
  | 'packet' 
  | 'bundle' 
  | 'set';

export type ProductCategory = 
  | 'Seeds'
  | 'Fertilizers'
  | 'Pesticides'
  | 'Organic Manure'
  | 'Agricultural Tools'
  | 'Irrigation Equipment'
  | 'Plant Growth Products'
  | 'Crop Protection'
  | 'Bio-Fertilizers'
  | 'Farming Accessories'
  | 'Other';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number; // Fixed Price - can only be changed by Admin in Product Master
  unit: UnitType;
  gstRate: number; // 0, 5, 12, 18, 28
  hsnCode?: string;
  stockQuantity?: number;
  minStockAlert?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile?: string;
  address?: string;
  gstin?: string;
  crop?: string;
  landArea?: string;
  totalBills: number;
  totalPurchases: number;
  lastVisit: string;
}

export interface BillItem {
  id: string;
  productId: string;
  productName: string;
  unit: UnitType;
  rate: number; // Fixed price snapshot from Product Master at time of bill
  quantity: number;
  gstRate: number; // GST % snapshot
  taxableAmount: number; // rate * quantity (or derived)
  gstAmount: number; // tax on this item
  totalAmount: number; // taxableAmount + gstAmount
}

export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Credit' | 'Other';

export type GstMode = 'CGST_SGST' | 'IGST' | 'EXEMPT';

export interface Bill {
  id: string;
  billNumber: string; // AST-YYYYMMDD-### or manual custom bill number
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss / 12-hr string

  customer: {
    name: string;
    mobile?: string;
    address?: string;
    gstin?: string;
    crop?: string;
    landArea?: string;
  };

  items: BillItem[];

  gstMode: GstMode;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  roundOff: number;
  grandTotal: number;

  paymentMethod: PaymentMethod;
  amountReceived?: number;
  balance?: number;

  billFormat?: 'traditional' | 'standard';
  isManualBillNumber?: boolean;

  createdBy: string;
  createdAt: string; // ISO string
}

export type UserRole = 'ADMIN' | 'OPERATOR';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  name: string;
  active: boolean;
  createdAt: string;
}

export interface BusinessSettings {
  id?: string;
  businessName: string;
  tagline: string;
  gstin: string;
  mobile1: string;
  mobile2: string;
  addressLine1: string;
  street: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  completeAddress: string;
  email?: string;
  invoiceFooterMessage: string;
  defaultGstMode: GstMode;
  defaultPrintFormat: '80mm' | 'A4';
  backupReminderDays: number; // 1, 7, 30, or 0 for disabled
  lastBackupDate?: string;
}

export interface DailySequence {
  date: string; // YYYYMMDD
  lastSeq: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  date: string;
  time: string;
  user: string;
  role: UserRole;
  action: string;
  recordType: 'BILL' | 'PRODUCT' | 'USER' | 'SETTINGS' | 'BACKUP' | 'AUTH';
  recordId?: string;
  details: string;
}

export interface BackupPayload {
  version: string;
  exportedAt: string;
  businessName: string;
  products: Product[];
  bills: Bill[];
  customers: Customer[];
  users: User[];
  settings: BusinessSettings;
  dailySequences: DailySequence[];
  auditLogs: AuditLog[];
}
