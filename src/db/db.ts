import Dexie, { type Table } from 'dexie';
import type {
  Product,
  Bill,
  Customer,
  User,
  BusinessSettings,
  DailySequence,
  AuditLog
} from '../types';
import { hashPassword } from '../utils/security';
import { getTodayDateSequenceFormat } from '../utils/date';

export class ASPraveenTradersDatabase extends Dexie {
  products!: Table<Product, string>;
  bills!: Table<Bill, string>;
  customers!: Table<Customer, string>;
  users!: Table<User, string>;
  settings!: Table<BusinessSettings, string>;
  dailySequences!: Table<DailySequence, string>;
  auditLogs!: Table<AuditLog, string>;

  constructor() {
    super('ASPraveenTradersDB');

    this.version(1).stores({
      products: 'id, name, category, price, unit, active, createdAt',
      bills: 'id, billNumber, date, [customer.name], grandTotal, paymentMethod, createdAt',
      customers: 'id, name, mobile, lastVisit',
      users: 'id, username, role, active',
      settings: 'id',
      dailySequences: 'date',
      auditLogs: 'id, timestamp, date, user, role, recordType, action'
    });
  }
}

export const db = new ASPraveenTradersDatabase();

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  id: 'main_settings',
  businessName: 'A.S.Praveen Traders',
  tagline: 'Agricultural Products & Farm Inputs',
  gstin: '33HQYPP5735G1Z3',
  mobile1: '8825633575',
  mobile2: '9443990403',
  addressLine1: 'NO : 2428',
  street: 'SATHYA NAGAR MAIN STREET',
  city: 'Thanipadi',
  district: 'Tiruvannamalai',
  state: 'Tamil Nadu',
  pincode: '606708',
  completeAddress: 'NO : 2428, SATHYA NAGAR MAIN STREET, Thanipadi, Tiruvannamalai, Tamil Nadu - 606708',
  email: 'aspraveentraders@gmail.com',
  invoiceFooterMessage: 'Thank you for doing business with A.S.Praveen Traders! Quality Seeds & Fertilizers for Better Harvest.',
  defaultGstMode: 'CGST_SGST',
  defaultPrintFormat: '80mm',
  backupReminderDays: 7,
  lastBackupDate: ''
};

export const INITIAL_PRODUCTS: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Paddy Seeds (CR 1009 Sub 1)',
    category: 'Seeds',
    price: 45.00,
    unit: 'kg',
    gstRate: 0,
    hsnCode: '1209',
    stockQuantity: 1200,
    minStockAlert: 100,
    active: true
  },
  {
    name: 'Paddy Seeds (BPT 5204 Samba Masuri)',
    category: 'Seeds',
    price: 52.00,
    unit: 'kg',
    gstRate: 0,
    hsnCode: '1209',
    stockQuantity: 800,
    minStockAlert: 100,
    active: true
  },
  {
    name: 'Hybrid Maize Seeds (Pioneer 3396)',
    category: 'Seeds',
    price: 195.00,
    unit: 'kg',
    gstRate: 0,
    hsnCode: '1209',
    stockQuantity: 450,
    minStockAlert: 50,
    active: true
  },
  {
    name: 'Groundnut Seeds (TMV 7)',
    category: 'Seeds',
    price: 115.00,
    unit: 'kg',
    gstRate: 0,
    hsnCode: '1209',
    stockQuantity: 600,
    minStockAlert: 80,
    active: true
  },
  {
    name: 'Hybrid Vegetable Seeds Pack',
    category: 'Seeds',
    price: 90.00,
    unit: 'packet',
    gstRate: 0,
    hsnCode: '1209',
    stockQuantity: 200,
    minStockAlert: 20,
    active: true
  },
  {
    name: 'Neem Coated Urea (45kg Bag)',
    category: 'Fertilizers',
    price: 266.50,
    unit: 'bag',
    gstRate: 5,
    hsnCode: '3102',
    stockQuantity: 350,
    minStockAlert: 40,
    active: true
  },
  {
    name: 'DAP (Di-Ammonium Phosphate 50kg)',
    category: 'Fertilizers',
    price: 1350.00,
    unit: 'bag',
    gstRate: 5,
    hsnCode: '3105',
    stockQuantity: 280,
    minStockAlert: 30,
    active: true
  },
  {
    name: 'MOP Potash (Muriate of Potash 50kg)',
    category: 'Fertilizers',
    price: 1700.00,
    unit: 'bag',
    gstRate: 5,
    hsnCode: '3104',
    stockQuantity: 190,
    minStockAlert: 25,
    active: true
  },
  {
    name: 'NPK 20:20:0:13 Fertilizer (50kg)',
    category: 'Fertilizers',
    price: 1250.00,
    unit: 'bag',
    gstRate: 5,
    hsnCode: '3105',
    stockQuantity: 220,
    minStockAlert: 30,
    active: true
  },
  {
    name: 'Organic Vermicompost (40kg Bag)',
    category: 'Organic Manure',
    price: 380.00,
    unit: 'bag',
    gstRate: 5,
    hsnCode: '3101',
    stockQuantity: 150,
    minStockAlert: 20,
    active: true
  },
  {
    name: 'Pure Neem Cake Powder (25kg Bag)',
    category: 'Organic Manure',
    price: 850.00,
    unit: 'bag',
    gstRate: 5,
    hsnCode: '3101',
    stockQuantity: 90,
    minStockAlert: 15,
    active: true
  },
  {
    name: 'Bio-Fertilizer Azospirillum (1kg)',
    category: 'Bio-Fertilizers',
    price: 75.00,
    unit: 'packet',
    gstRate: 5,
    hsnCode: '3101',
    stockQuantity: 120,
    minStockAlert: 20,
    active: true
  },
  {
    name: 'Bio-Fertilizer Phosphobacteria (1kg)',
    category: 'Bio-Fertilizers',
    price: 75.00,
    unit: 'packet',
    gstRate: 5,
    hsnCode: '3101',
    stockQuantity: 110,
    minStockAlert: 20,
    active: true
  },
  {
    name: 'Chlorpyrifos 20% EC Insecticide (1L)',
    category: 'Pesticides',
    price: 490.00,
    unit: 'litre',
    gstRate: 18,
    hsnCode: '3808',
    stockQuantity: 85,
    minStockAlert: 15,
    active: true
  },
  {
    name: 'Mancozeb 75% WP Fungicide (1kg)',
    category: 'Crop Protection',
    price: 430.00,
    unit: 'kg',
    gstRate: 18,
    hsnCode: '3808',
    stockQuantity: 70,
    minStockAlert: 10,
    active: true
  },
  {
    name: 'Glyphosate 41% SL Weedicide (1L)',
    category: 'Crop Protection',
    price: 560.00,
    unit: 'litre',
    gstRate: 18,
    hsnCode: '3808',
    stockQuantity: 65,
    minStockAlert: 10,
    active: true
  },
  {
    name: 'Knapsack Manual Farm Sprayer 16L',
    category: 'Agricultural Tools',
    price: 1850.00,
    unit: 'piece',
    gstRate: 12,
    hsnCode: '8424',
    stockQuantity: 25,
    minStockAlert: 5,
    active: true
  },
  {
    name: '12V Battery Operated Sprayer 16L',
    category: 'Agricultural Tools',
    price: 3250.00,
    unit: 'piece',
    gstRate: 12,
    hsnCode: '8424',
    stockQuantity: 18,
    minStockAlert: 4,
    active: true
  },
  {
    name: 'Traditional Steel Hand Hoe',
    category: 'Agricultural Tools',
    price: 240.00,
    unit: 'piece',
    gstRate: 12,
    hsnCode: '8201',
    stockQuantity: 50,
    minStockAlert: 10,
    active: true
  },
  {
    name: 'Paddy Harvesting Curved Sickle',
    category: 'Agricultural Tools',
    price: 160.00,
    unit: 'piece',
    gstRate: 12,
    hsnCode: '8201',
    stockQuantity: 80,
    minStockAlert: 15,
    active: true
  },
  {
    name: 'Drip Lateral Pipe 16mm (400m Coil)',
    category: 'Irrigation Equipment',
    price: 1450.00,
    unit: 'bundle',
    gstRate: 12,
    hsnCode: '3917',
    stockQuantity: 30,
    minStockAlert: 5,
    active: true
  },
  {
    name: 'PVC Irrigation Ball Valve 2 Inch',
    category: 'Irrigation Equipment',
    price: 240.00,
    unit: 'piece',
    gstRate: 18,
    hsnCode: '8481',
    stockQuantity: 40,
    minStockAlert: 8,
    active: true
  },
  {
    name: 'Humic Acid 12% Growth Promoter (1L)',
    category: 'Plant Growth Products',
    price: 390.00,
    unit: 'litre',
    gstRate: 18,
    hsnCode: '3808',
    stockQuantity: 60,
    minStockAlert: 10,
    active: true
  },
  {
    name: 'Agricultural Rubber Safety Gloves',
    category: 'Farming Accessories',
    price: 95.00,
    unit: 'set',
    gstRate: 12,
    hsnCode: '6116',
    stockQuantity: 100,
    minStockAlert: 20,
    active: true
  },
  {
    name: 'Trichoderma Viride Bio-Fungicide (1kg)',
    category: 'Bio-Fertilizers',
    price: 180.00,
    unit: 'packet',
    gstRate: 5,
    hsnCode: '3101',
    stockQuantity: 75,
    minStockAlert: 12,
    active: true
  }
];

export async function initializeDatabase(): Promise<void> {
  const productCount = await db.products.count();
  const now = new Date().toISOString();

  // 1. Seed Products if empty
  if (productCount === 0) {
    const productsToInsert: Product[] = INITIAL_PRODUCTS.map((p, idx) => ({
      ...p,
      id: `prod_${Date.now()}_${idx}`,
      createdAt: now,
      updatedAt: now
    }));
    await db.products.bulkAdd(productsToInsert);
  }

  // 2. Seed Default Settings if missing
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.add(DEFAULT_BUSINESS_SETTINGS);
  }

  // 3. Seed Default Users if empty
  const userCount = await db.users.count();
  if (userCount === 0) {
    const adminHash = await hashPassword('admin123');
    const operatorHash = await hashPassword('operator123');

    await db.users.bulkAdd([
      {
        id: 'usr_admin',
        username: 'admin',
        passwordHash: adminHash,
        role: 'ADMIN',
        name: 'System Administrator',
        active: true,
        createdAt: now
      },
      {
        id: 'usr_operator',
        username: 'operator',
        passwordHash: operatorHash,
        role: 'OPERATOR',
        name: 'Billing Counter Operator',
        active: true,
        createdAt: now
      }
    ]);

    await db.auditLogs.add({
      id: `audit_${Date.now()}`,
      timestamp: now,
      date: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
      user: 'SYSTEM',
      role: 'ADMIN',
      action: 'Initialized Database System & Default Accounts',
      recordType: 'AUTH',
      details: 'Created Admin and Operator default credentials'
    });
  }
}
