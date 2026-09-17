import React, { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { getNextBillNumber } from '../../db/sequence';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency, numberToWords } from '../../utils/currency';
import { formatDate, formatTime, getTodayDateString } from '../../utils/date';
import { translations } from '../../utils/translations';
import { ProductSelectorModal } from './ProductSelectorModal';
import { BillSuccessModal } from './BillSuccessModal';
import { PrintModal } from '../print/PrintModal';
import type { Bill, BillItem, Customer, GstMode, PaymentMethod, Product, UnitType } from '../../types';
import {
  Plus,
  Trash2,
  Printer,
  Save,
  RotateCcw,
  Eye,
  Search,
  UserCheck,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  HelpCircle,
  AlertCircle,
  Sparkles,
  Sprout,
  Wheat,
  Coins,
  ShieldCheck,
  Check,
  ArrowRight
} from 'lucide-react';

interface BillingCounterProps {
  onBillCreated?: () => void;
}

export const BillingCounter: React.FC<BillingCounterProps> = ({ onBillCreated }) => {
  const { currentUser } = useAuth();
  const { settings, language } = useSettings();
  const t = translations[language];

  // Live queries for reactive data
  const products = useLiveQuery(() => db.products.toArray(), []) || [];
  const existingCustomers = useLiveQuery(() => db.customers.toArray(), []) || [];

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);

  // Billing items
  const [items, setItems] = useState<BillItem[]>([]);
  const [gstMode, setGstMode] = useState<GstMode>(settings.defaultGstMode || 'CGST_SGST');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [amountReceived, setAmountReceived] = useState<string>('');

  // Modals and UI states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedBill, setSavedBill] = useState<Bill | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Live preview bill number
  const [estimatedBillNumber, setEstimatedBillNumber] = useState('Generating...');
  const customerInputRef = useRef<HTMLInputElement>(null);

  // Fetch estimated next bill number on mount / date
  useEffect(() => {
    async function previewBillNo() {
      try {
        const seqRec = await db.dailySequences.get(new Date().toISOString().slice(0, 10).replace(/-/g, ''));
        const next = (seqRec?.lastSeq || 0) + 1;
        const dateKey = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        setEstimatedBillNumber(`AST-${dateKey}-${String(next).padStart(3, '0')}`);
      } catch (e) {
        setEstimatedBillNumber('AST-AUTO');
      }
    }
    previewBillNo();
  }, [savedBill]);

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If modal is open, let Esc close it
      if (e.key === 'Escape') {
        if (isProductModalOpen) setIsProductModalOpen(false);
        if (isSuccessModalOpen) setIsSuccessModalOpen(false);
        if (isPrintModalOpen) setIsPrintModalOpen(false);
        return;
      }

      if (e.key === 'F2') {
        e.preventDefault();
        handleClearForm();
      } else if (e.key === 'F4') {
        e.preventDefault();
        setIsProductModalOpen(true);
      } else if (e.key === 'F8') {
        e.preventDefault();
        handleSaveBill(true);
      } else if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        handleSaveBill(false);
      } else if (e.ctrlKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        if (items.length > 0 && customerName.trim()) {
          handleSaveBill(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, customerName, customerMobile, customerAddress, gstMode, paymentMethod, amountReceived, isProductModalOpen, isSuccessModalOpen, isPrintModalOpen]);

  // Autocomplete customer selection
  const customerSuggestions = existingCustomers.filter(c =>
    customerName.trim().length > 1 &&
    (c.name.toLowerCase().includes(customerName.toLowerCase()) ||
     (c.mobile && c.mobile.includes(customerName)))
  );

  const selectCustomerSuggestion = (c: Customer) => {
    setCustomerName(c.name);
    setCustomerMobile(c.mobile || '');
    setCustomerAddress(c.address || '');
    setCustomerGstin(c.gstin || '');
    setShowCustomerSuggestions(false);
  };

  // Add Product to bill
  const handleSelectProduct = (product: Product) => {
    setIsProductModalOpen(false);

    // Check if product already exists in item list
    const existingIndex = items.findIndex(item => item.productId === product.id);

    if (existingIndex > -1) {
      // Increment quantity
      const updated = [...items];
      const currentItem = updated[existingIndex];
      const newQty = currentItem.quantity + 1;
      const taxable = product.price * newQty;
      const tax = gstMode === 'EXEMPT' ? 0 : (taxable * product.gstRate) / 100;

      updated[existingIndex] = {
        ...currentItem,
        quantity: newQty,
        taxableAmount: taxable,
        gstAmount: tax,
        totalAmount: taxable + tax
      };
      setItems(updated);
    } else {
      // Add new item with STRICT FIXED PRICING SNAPSHOT
      const initialQty = 1;
      const taxable = product.price * initialQty;
      const tax = gstMode === 'EXEMPT' ? 0 : (taxable * product.gstRate) / 100;

      const newItem: BillItem = {
        id: `item_${Date.now()}_${items.length + 1}`,
        productId: product.id,
        productName: product.name,
        unit: product.unit,
        rate: product.price, // FIXED RATE FROM PRODUCT MASTER
        quantity: initialQty,
        gstRate: product.gstRate, // FIXED GST FROM PRODUCT MASTER
        taxableAmount: taxable,
        gstAmount: tax,
        totalAmount: taxable + tax
      };

      setItems([...items, newItem]);
    }
  };

  // Quantity Change (ONLY field operator can edit)
  const handleQuantityChange = (index: number, newQty: number) => {
    if (isNaN(newQty) || newQty < 0) return;

    const updated = [...items];
    const item = updated[index];
    const taxable = item.rate * newQty;
    const tax = gstMode === 'EXEMPT' ? 0 : (taxable * item.gstRate) / 100;

    updated[index] = {
      ...item,
      quantity: newQty,
      taxableAmount: taxable,
      gstAmount: tax,
      totalAmount: taxable + tax
    };

    setItems(updated);
  };

  // Remove Line Item
  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.taxableAmount, 0);

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (gstMode === 'CGST_SGST') {
    const totalItemTax = items.reduce((sum, item) => sum + item.gstAmount, 0);
    cgst = totalItemTax / 2;
    sgst = totalItemTax / 2;
  } else if (gstMode === 'IGST') {
    igst = items.reduce((sum, item) => sum + item.gstAmount, 0);
  }

  const rawTotal = subtotal + cgst + sgst + igst;
  const roundedGrandTotal = Math.round(rawTotal);
  const roundOff = Math.round((roundedGrandTotal - rawTotal) * 100) / 100;

  const numReceived = parseFloat(amountReceived) || 0;
  const balance = numReceived > 0 ? numReceived - roundedGrandTotal : 0;

  // Clear Form
  const handleClearForm = () => {
    setCustomerName('');
    setCustomerMobile('');
    setCustomerAddress('');
    setCustomerGstin('');
    setItems([]);
    setAmountReceived('');
    setErrorMessage('');
    customerInputRef.current?.focus();
  };

  // Validation
  const validateBill = (): boolean => {
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Customer Name is mandatory.');
      customerInputRef.current?.focus();
      return false;
    }

    if (items.length === 0) {
      setErrorMessage('Please add at least one product to the bill.');
      setIsProductModalOpen(true);
      return false;
    }

    for (const item of items) {
      if (item.quantity <= 0) {
        setErrorMessage(`Quantity for "${item.productName}" must be greater than 0.`);
        return false;
      }
    }

    return true;
  };

  // Save Bill to IndexedDB
  const handleSaveBill = async (andPrint: boolean) => {
    if (!validateBill()) return;

    try {
      setIsSaving(true);
      const now = new Date();
      const generatedBillNumber = await getNextBillNumber(now);

      const billRecord: Bill = {
        id: `bill_${Date.now()}`,
        billNumber: generatedBillNumber,
        date: getTodayDateString(),
        time: formatTime(now),
        customer: {
          name: customerName.trim(),
          mobile: customerMobile.trim() || undefined,
          address: customerAddress.trim() || undefined,
          gstin: customerGstin.trim() || undefined
        },
        items: items.map(item => ({ ...item })),
        gstMode,
        subtotal: Math.round(subtotal * 100) / 100,
        cgst: Math.round(cgst * 100) / 100,
        sgst: Math.round(sgst * 100) / 100,
        igst: Math.round(igst * 100) / 100,
        totalTax: Math.round((cgst + sgst + igst) * 100) / 100,
        roundOff,
        grandTotal: roundedGrandTotal,
        paymentMethod,
        amountReceived: numReceived > 0 ? numReceived : undefined,
        balance: numReceived > 0 ? balance : undefined,
        createdBy: currentUser ? currentUser.name : 'Operator',
        createdAt: now.toISOString()
      };

      // 1. Save Bill permanently to IndexedDB
      await db.bills.add(billRecord);

      // 2. Update or insert customer
      const existingCustomer = await db.customers.where('name').equalsIgnoreCase(customerName.trim()).first();
      if (existingCustomer) {
        await db.customers.update(existingCustomer.id, {
          mobile: customerMobile.trim() || existingCustomer.mobile,
          address: customerAddress.trim() || existingCustomer.address,
          gstin: customerGstin.trim() || existingCustomer.gstin,
          totalBills: (existingCustomer.totalBills || 0) + 1,
          totalPurchases: (existingCustomer.totalPurchases || 0) + roundedGrandTotal,
          lastVisit: billRecord.date
        });
      } else {
        await db.customers.add({
          id: `cust_${Date.now()}`,
          name: customerName.trim(),
          mobile: customerMobile.trim() || undefined,
          address: customerAddress.trim() || undefined,
          gstin: customerGstin.trim() || undefined,
          totalBills: 1,
          totalPurchases: roundedGrandTotal,
          lastVisit: billRecord.date
        });
      }

      // 3. Log Audit
      await db.auditLogs.add({
        id: `audit_${Date.now()}`,
        timestamp: now.toISOString(),
        date: formatDate(now),
        time: formatTime(now),
        user: currentUser?.username || 'operator',
        role: currentUser?.role || 'OPERATOR',
        action: 'Created Bill',
        recordType: 'BILL',
        recordId: generatedBillNumber,
        details: `Generated Bill ${generatedBillNumber} for ${customerName} (₹${roundedGrandTotal})`
      });

      setSavedBill(billRecord);

      if (onBillCreated) onBillCreated();

      if (andPrint) {
        setIsPrintModalOpen(true);
      } else {
        setIsSuccessModalOpen(true);
      }

      // Clear the inputs for next bill
      handleClearForm();
    } catch (err: any) {
      console.error('Error saving bill:', err);
      setErrorMessage(
        'Unable to save bill to local storage. Please check your browser storage permissions and try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to return colorful badges for agricultural product categories
  const getProductBadge = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('seed') || lower.includes('விதை') || lower.includes('paddy') || lower.includes('maize')) {
      return { icon: '🌱', label: 'Seeds', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    }
    if (lower.includes('urea') || lower.includes('dap') || lower.includes('potash') || lower.includes('npk') || lower.includes('fertilizer') || lower.includes('உரம்')) {
      return { icon: '🌾', label: 'Fertilizer', color: 'bg-amber-100 text-amber-900 border-amber-300' };
    }
    if (lower.includes('vermi') || lower.includes('neem cake') || lower.includes('organic') || lower.includes('manure')) {
      return { icon: '🍂', label: 'Organic', color: 'bg-lime-100 text-lime-900 border-lime-300' };
    }
    if (lower.includes('sprayer') || lower.includes('hoe') || lower.includes('sickle') || lower.includes('gloves') || lower.includes('கருவி')) {
      return { icon: '🚜', label: 'Tools', color: 'bg-orange-100 text-orange-900 border-orange-300' };
    }
    if (lower.includes('drip') || lower.includes('pipe') || lower.includes('valve') || lower.includes('irrigation')) {
      return { icon: '💧', label: 'Irrigation', color: 'bg-cyan-100 text-cyan-900 border-cyan-300' };
    }
    return { icon: '🌿', label: 'Agri Input', color: 'bg-teal-100 text-teal-800 border-teal-300' };
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-8">
      {/* Top Banner: Colorful Agricultural Header */}
      <div className="bg-gradient-to-r from-agri-800 via-emerald-800 to-agri-900 text-white rounded-3xl p-5 shadow-xl border-2 border-agri-gold/50 relative overflow-hidden">
        {/* Subtle decorative farm watermark in background */}
        <div className="absolute right-3 -bottom-6 text-8xl opacity-10 pointer-events-none select-none">
          🌾
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-agri-gold via-yellow-400 to-amber-600 text-agri-950 flex items-center justify-center text-3xl font-black shadow-lg border-2 border-white/60">
              🌾
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight font-serif drop-shadow">
                  {settings.businessName}
                </h2>
                <span className="bg-gradient-to-r from-agri-gold to-yellow-400 text-agri-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm tracking-wide">
                  🌱 Agri Counter
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
                {settings.tagline} • <span className="text-agri-gold font-bold">GSTIN: {settings.gstin}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Live Daily Bill Sequence Card */}
            <div className="bg-gradient-to-br from-emerald-950/90 via-agri-900/90 to-black/70 border-2 border-agri-gold/70 px-4 py-2 rounded-2xl shadow-inner text-right">
              <span className="text-[10px] text-agri-gold font-bold uppercase block tracking-wider">
                TODAY'S BILL NO.
              </span>
              <span className="font-mono font-black text-yellow-300 text-base md:text-lg tracking-wider drop-shadow-sm">
                {estimatedBillNumber}
              </span>
            </div>

            {/* Clear Button */}
            <button
              onClick={handleClearForm}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 text-xs font-bold text-rose-100 bg-rose-900/50 hover:bg-rose-800/80 border border-rose-400/50 rounded-2xl transition-all shadow active:scale-95"
              title="Clear Form (F2)"
            >
              <RotateCcw className="w-4 h-4 text-rose-300" />
              <span>{t.clearBill} (F2)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message Notification */}
      {errorMessage && (
        <div className="bg-rose-100 border-2 border-rose-400 p-3.5 rounded-2xl flex items-center justify-between text-rose-900 text-xs font-bold shadow-md animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="text-rose-700 hover:text-rose-900 font-black px-2 py-1 bg-rose-200 rounded-lg"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Customer Information Card (Vibrant Mint & Sunlight Agri Card) */}
      <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/60 to-amber-50/70 rounded-3xl shadow-md border-2 border-emerald-600/30 p-5">
        <div className="flex items-center justify-between mb-3 border-b border-emerald-200 pb-2.5">
          <h3 className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center space-x-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs shadow-sm">
              👥
            </span>
            <span className="text-sm font-bold text-agri-900">{t.customerDetails}</span>
          </h3>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-300">
            🌾 Farmer / Buyer Profile
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          {/* Customer Name with Autocomplete */}
          <div className="relative md:col-span-1">
            <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center justify-between">
              <span>{t.customerName} <span className="text-rose-600 font-black">*</span></span>
              <span className="text-[10px] text-emerald-700 font-semibold">Mandatory</span>
            </label>
            <input
              ref={customerInputRef}
              type="text"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                setShowCustomerSuggestions(true);
              }}
              onFocus={() => setShowCustomerSuggestions(true)}
              placeholder="e.g. K. Murugan / முருகன்"
              className="w-full px-3.5 py-2.5 text-sm font-semibold bg-white border-2 border-emerald-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600 outline-none shadow-sm transition-all text-gray-900"
              autoFocus
            />

            {/* Returning Customers Autocomplete Popup */}
            {showCustomerSuggestions && customerSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border-2 border-emerald-300 rounded-2xl shadow-2xl z-30 max-h-48 overflow-y-auto">
                <div className="p-2 text-[10px] uppercase font-black text-emerald-800 bg-emerald-50 border-b border-emerald-200">
                  🌾 Returning Customers:
                </div>
                {customerSuggestions.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => selectCustomerSuggestion(c)}
                    className="p-2.5 text-xs hover:bg-emerald-50 cursor-pointer flex justify-between items-center border-b border-gray-100 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-gray-900">{c.name}</div>
                      <div className="text-[11px] text-gray-500">{c.address || c.mobile || 'No address'}</div>
                    </div>
                    {c.mobile && (
                      <span className="font-mono text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-lg">
                        {c.mobile}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Mobile */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              {t.customerMobile}
            </label>
            <input
              type="tel"
              value={customerMobile}
              onChange={(e) => setCustomerMobile(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full px-3.5 py-2.5 text-sm font-mono font-bold bg-white border-2 border-emerald-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600 outline-none shadow-sm transition-all text-gray-900"
            />
          </div>

          {/* Village / Address */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              {t.customerAddress}
            </label>
            <input
              type="text"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="e.g. Thanipadi / தானிப்பாடி"
              className="w-full px-3.5 py-2.5 text-sm font-semibold bg-white border-2 border-emerald-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600 outline-none shadow-sm transition-all text-gray-900"
            />
          </div>

          {/* Customer GSTIN */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              {t.gstin}
            </label>
            <input
              type="text"
              value={customerGstin}
              onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
              placeholder="33XXXXX..."
              className="w-full px-3.5 py-2.5 text-sm font-mono font-bold uppercase bg-white border-2 border-emerald-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600 outline-none shadow-sm transition-all text-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Bill Item Table Card (Colorful Agricultural Theme) */}
      <div className="bg-white rounded-3xl shadow-lg border-2 border-emerald-700/30 overflow-hidden">
        {/* Table Top Toolbar */}
        <div className="p-4 bg-gradient-to-r from-emerald-800 via-agri-700 to-emerald-900 text-white flex flex-wrap items-center justify-between gap-3 border-b-2 border-agri-gold/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-agri-gold text-agri-950 flex items-center justify-center font-bold text-sm shadow">
              🌾
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-white">
                Agricultural Billing Table ({items.length})
              </span>
              <span className="ml-2 text-xs bg-amber-400 text-agri-950 px-2 py-0.5 rounded-full font-black shadow-sm">
                🔒 Fixed Price Locked
              </span>
            </div>
          </div>

          {/* Add Product Button (Harvest Gold Glowing CTA) */}
          <button
            onClick={() => setIsProductModalOpen(true)}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-agri-950 font-black text-xs md:text-sm rounded-2xl shadow-lg transition-all active:scale-95 ring-2 ring-white/50"
          >
            <Plus className="w-5 h-5 text-agri-950 stroke-[3]" />
            <span>{t.addProduct} (F4)</span>
          </button>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-agri-950 text-agri-gold text-xs uppercase tracking-wider border-b border-agri-800">
              <tr>
                <th className="py-3 px-3 text-center w-12 text-white">S.No</th>
                <th className="py-3 px-4 text-white">Product Name & Category</th>
                <th className="py-3 px-3 text-center w-24 text-white">{t.unit}</th>
                <th className="py-3 px-3 text-right w-28 text-white">Fixed Rate</th>
                <th className="py-3 px-3 text-center w-36 text-white">{t.qty}</th>
                <th className="py-3 px-3 text-center w-24 text-white">GST %</th>
                <th className="py-3 px-4 text-right w-36 text-white">{t.amount} (₹)</th>
                <th className="py-3 px-3 text-center w-14 text-white">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center bg-gradient-to-b from-agri-50/40 to-white">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
                      🌱
                    </div>
                    <p className="text-base font-bold text-agri-900">No products added to the bill yet.</p>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      Click the golden <strong className="text-emerald-700 font-bold">+ Add Product (F4)</strong> button above to pick seeds, fertilizers, or tools.
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const badge = getProductBadge(item.productName);
                  const isEven = index % 2 === 0;

                  return (
                    <tr
                      key={item.id || index}
                      className={`transition-colors ${isEven ? 'bg-white' : 'bg-emerald-50/30'} hover:bg-amber-50/60`}
                    >
                      {/* S.No */}
                      <td className="py-3 px-3 text-center font-bold text-gray-500">
                        {index + 1}
                      </td>

                      {/* Product Name with Agri Badge */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900 text-sm flex items-center space-x-2">
                          <span>{item.productName}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                            {badge.icon} {badge.label}
                          </span>
                        </div>
                      </td>

                      {/* Unit */}
                      <td className="py-3 px-3 text-center">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-300">
                          {item.unit}
                        </span>
                      </td>

                      {/* Fixed Rate: Non-editable */}
                      <td className="py-3 px-3 text-right">
                        <span className="font-mono font-black text-amber-900 bg-amber-100/70 px-2.5 py-1 rounded-lg border border-amber-300 text-sm">
                          ₹{item.rate.toFixed(2)}
                        </span>
                      </td>

                      {/* Quantity: ONLY EDITABLE FIELD */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1.5 bg-emerald-50 p-1 rounded-xl border border-emerald-200 inline-flex shadow-sm">
                          <button
                            onClick={() => handleQuantityChange(index, Math.max(1, item.quantity - 1))}
                            className="w-8 h-8 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-black text-base flex items-center justify-center shadow transition-all active:scale-90"
                            title="Decrease quantity"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            step="any"
                            min="0.01"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(index, parseFloat(e.target.value) || 0)}
                            className="w-16 text-center font-black text-sm border-2 border-emerald-500 rounded-lg py-1 px-1 bg-white focus:ring-2 focus:ring-emerald-600 outline-none text-gray-900"
                          />
                          <button
                            onClick={() => handleQuantityChange(index, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-black text-base flex items-center justify-center shadow transition-all active:scale-90"
                            title="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* GST % */}
                      <td className="py-3 px-3 text-center">
                        <span className="text-xs font-black px-2 py-1 rounded-lg bg-orange-100 text-orange-900 border border-orange-300 font-mono">
                          {item.gstRate}%
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3 px-4 text-right">
                        <span className="font-mono font-black text-base text-emerald-950 bg-emerald-100 px-3 py-1 rounded-xl border border-emerald-300 shadow-sm inline-block">
                          ₹{item.totalAmount.toFixed(2)}
                        </span>
                      </td>

                      {/* Remove Button */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 rounded-xl text-rose-600 hover:text-white hover:bg-rose-600 transition-all shadow-sm"
                          title="Remove Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill Calculation & Payment Area (Rich Colorful Agri Theme) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Side: GST Mode, Colorful Payment Mode & Cash Counter */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-gradient-to-br from-emerald-50/80 via-white to-amber-50/60 rounded-3xl shadow-md border-2 border-emerald-600/30 p-5 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-agri-900 flex items-center space-x-2 border-b border-emerald-200 pb-2">
              <span>💳</span>
              <span>Payment Method & Tax Configuration</span>
            </h4>

            {/* GST Mode Selector */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-gray-700 block">GST Tax Calculation Mode:</span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGstMode('CGST_SGST')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm ${
                    gstMode === 'CGST_SGST'
                      ? 'bg-gradient-to-r from-agri-700 to-emerald-800 text-white ring-2 ring-agri-gold'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <span>Intra-state (CGST + SGST)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGstMode('IGST')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm ${
                    gstMode === 'IGST'
                      ? 'bg-gradient-to-r from-teal-700 to-cyan-800 text-white ring-2 ring-agri-gold'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <span>Inter-state (IGST)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGstMode('EXEMPT')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm ${
                    gstMode === 'EXEMPT'
                      ? 'bg-gradient-to-r from-amber-700 to-orange-800 text-white ring-2 ring-agri-gold'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <span>GST Exempt</span>
                </button>
              </div>
            </div>

            {/* Colorful Payment Method Selector */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold text-gray-700">
                {t.paymentMethod}:
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                {[
                  { id: 'Cash', label: '💵 Cash', color: 'from-emerald-600 to-green-700', activeRing: 'ring-emerald-400' },
                  { id: 'UPI', label: '📲 UPI / QR', color: 'from-blue-600 to-indigo-700', activeRing: 'ring-blue-400' },
                  { id: 'Card', label: '💳 Card', color: 'from-purple-600 to-fuchsia-700', activeRing: 'ring-purple-400' },
                  { id: 'Bank Transfer', label: '🏛️ Bank', color: 'from-teal-600 to-cyan-700', activeRing: 'ring-teal-400' },
                  { id: 'Credit', label: '📝 Khata', color: 'from-amber-600 to-orange-700', activeRing: 'ring-amber-400' },
                  { id: 'Other', label: '🏷️ Other', color: 'from-gray-700 to-slate-800', activeRing: 'ring-gray-400' },
                ].map((item) => {
                  const isSelected = paymentMethod === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPaymentMethod(item.id as PaymentMethod)}
                      className={`py-2.5 px-2 rounded-2xl font-black text-center transition-all shadow-sm active:scale-95 ${
                        isSelected
                          ? `bg-gradient-to-r ${item.color} text-white ring-2 ${item.activeRing} shadow-md scale-[1.02]`
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cash Tender & Balance Calculator (Vibrant Light Emerald) */}
            {paymentMethod === 'Cash' && (
              <div className="bg-gradient-to-r from-emerald-100/90 via-teal-100/70 to-emerald-100/90 border-2 border-emerald-400 rounded-2xl p-4 grid grid-cols-2 gap-4 shadow-sm">
                <div>
                  <label className="block text-xs font-bold text-emerald-950 mb-1">
                    {t.amountReceived} (₹)
                  </label>
                  <input
                    type="number"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    placeholder="Cash tendered"
                    className="w-full px-3 py-2 text-base font-mono font-black border-2 border-emerald-500 rounded-xl focus:ring-2 focus:ring-emerald-600 outline-none bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-950 mb-1">
                    {t.balance} (₹)
                  </label>
                  <div className={`px-3 py-2 text-base font-mono font-black rounded-xl border-2 flex items-center justify-between ${
                    balance >= 0
                      ? 'bg-white text-emerald-800 border-emerald-500 shadow-inner'
                      : 'bg-rose-50 text-rose-700 border-rose-400'
                  }`}>
                    <span>Change:</span>
                    <span>{formatCurrency(balance)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Amount in Words Display (Warm Harvest Gold Parchment) */}
          <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 rounded-3xl shadow-md border-2 border-amber-300 p-4">
            <span className="text-[11px] font-black text-amber-900 uppercase tracking-wider block flex items-center space-x-1.5">
              <span>🌾</span>
              <span>{t.amountInWords}</span>
            </span>
            <p className="text-sm font-black text-agri-950 font-serif italic mt-1 leading-relaxed">
              {numberToWords(roundedGrandTotal)}
            </p>
          </div>
        </div>

        {/* Right Side: Totals Summary & Save/Print Actions (Vibrant Agricultural Grand Card) */}
        <div className="lg:col-span-5 bg-white rounded-3xl shadow-xl border-2 border-agri-700 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-agri-900 to-emerald-950 text-white font-black text-sm flex items-center justify-between border-b-2 border-agri-gold">
            <span className="flex items-center space-x-2">
              <span>🧾</span>
              <span>Bill Calculation Summary</span>
            </span>
            <span className="text-xs bg-agri-gold text-agri-950 font-bold px-2 py-0.5 rounded-full">
              Live Total
            </span>
          </div>

          <div className="p-5 space-y-3 text-sm bg-gradient-to-b from-white to-emerald-50/30">
            <div className="flex justify-between text-gray-700 font-semibold">
              <span>{t.subtotal} (Taxable):</span>
              <span className="font-mono font-bold text-gray-950 text-base">{formatCurrency(subtotal)}</span>
            </div>

            {gstMode === 'CGST_SGST' && (
              <>
                <div className="flex justify-between text-emerald-800 text-xs font-semibold bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                  <span>{t.cgst} (Central GST):</span>
                  <span className="font-mono font-bold">{formatCurrency(cgst)}</span>
                </div>
                <div className="flex justify-between text-emerald-800 text-xs font-semibold bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                  <span>{t.sgst} (State GST):</span>
                  <span className="font-mono font-bold">{formatCurrency(sgst)}</span>
                </div>
              </>
            )}

            {gstMode === 'IGST' && (
              <div className="flex justify-between text-teal-800 text-xs font-semibold bg-teal-50 p-2 rounded-xl border border-teal-200">
                <span>{t.igst} (Integrated GST):</span>
                <span className="font-mono font-bold">{formatCurrency(igst)}</span>
              </div>
            )}

            {roundOff !== 0 && (
              <div className="flex justify-between text-gray-500 text-xs">
                <span>{t.roundOff}:</span>
                <span className="font-mono font-semibold">{formatCurrency(roundOff)}</span>
              </div>
            )}

            {/* Grand Total Hero Box */}
            <div className="bg-gradient-to-r from-agri-900 via-agri-800 to-emerald-950 text-white rounded-2xl p-4 shadow-xl border-2 border-agri-gold mt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-black uppercase tracking-wider text-emerald-200">
                  {t.grandTotal}
                </span>
                <span className="text-2xl md:text-3xl font-black font-mono text-amber-300 drop-shadow-md">
                  {formatCurrency(roundedGrandTotal)}
                </span>
              </div>
              <div className="text-[10px] text-agri-gold font-medium mt-1 text-right">
                All taxes included • Indian Currency Format
              </div>
            </div>
          </div>

          {/* Action Buttons Section */}
          <div className="p-5 bg-gradient-to-br from-emerald-100/70 via-agri-50 to-amber-50/70 border-t-2 border-emerald-600/30 space-y-3">
            {/* Primary Action: SAVE & PRINT (Glowing Leaf Green Button) */}
            <button
              onClick={() => handleSaveBill(true)}
              disabled={isSaving || items.length === 0}
              className={`w-full py-4 px-4 rounded-2xl text-white font-black text-base md:text-lg tracking-wide flex items-center justify-center space-x-2.5 shadow-xl transition-all active:scale-[0.98] ${
                items.length === 0 || isSaving
                  ? 'bg-gray-400 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 ring-4 ring-emerald-400/50 shadow-emerald-900/30 hover:shadow-2xl'
              }`}
            >
              <Printer className="w-6 h-6 text-amber-300 stroke-[2.5]" />
              <span>{isSaving ? 'SAVING BILL TO DB...' : `${t.saveAndPrint} (F8)`}</span>
            </button>

            {/* Secondary Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <button
                onClick={() => handleSaveBill(false)}
                disabled={isSaving || items.length === 0}
                className="py-3 px-3 rounded-2xl bg-gradient-to-r from-agri-700 to-emerald-800 hover:from-agri-800 hover:to-emerald-900 disabled:bg-gray-300 text-white font-bold flex items-center justify-center space-x-1.5 transition-all shadow active:scale-95"
              >
                <Save className="w-4 h-4 text-agri-gold" />
                <span>{t.saveBill}</span>
              </button>

              <button
                onClick={() => {
                  if (validateBill()) {
                    // Create mock bill for live preview
                    const mockBill: Bill = {
                      id: 'preview',
                      billNumber: estimatedBillNumber,
                      date: getTodayDateString(),
                      time: formatTime(new Date()),
                      customer: {
                        name: customerName.trim(),
                        mobile: customerMobile.trim() || undefined,
                        address: customerAddress.trim() || undefined,
                        gstin: customerGstin.trim() || undefined
                      },
                      items: [...items],
                      gstMode,
                      subtotal,
                      cgst,
                      sgst,
                      igst,
                      totalTax: cgst + sgst + igst,
                      roundOff,
                      grandTotal: roundedGrandTotal,
                      paymentMethod,
                      amountReceived: numReceived > 0 ? numReceived : undefined,
                      balance: numReceived > 0 ? balance : undefined,
                      createdBy: currentUser?.name || 'Operator',
                      createdAt: new Date().toISOString()
                    };
                    setSavedBill(mockBill);
                    setIsPrintModalOpen(true);
                  }
                }}
                disabled={items.length === 0}
                className="py-3 px-3 rounded-2xl bg-amber-100 hover:bg-amber-200 disabled:bg-gray-100 text-amber-950 border-2 border-amber-300 font-black flex items-center justify-center space-x-1.5 transition-all shadow active:scale-95"
              >
                <Eye className="w-4 h-4 text-amber-700" />
                <span>{t.printPreview}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Selection Modal */}
      <ProductSelectorModal
        isOpen={isProductModalOpen}
        products={products}
        onSelectProduct={handleSelectProduct}
        onClose={() => setIsProductModalOpen(false)}
      />

      {/* Bill Success Modal */}
      <BillSuccessModal
        isOpen={isSuccessModalOpen}
        bill={savedBill}
        onPrint={() => {
          setIsSuccessModalOpen(false);
          setIsPrintModalOpen(true);
        }}
        onNewBill={() => {
          setIsSuccessModalOpen(false);
          handleClearForm();
        }}
        onClose={() => setIsSuccessModalOpen(false)}
      />

      {/* Print Preview & Print Modal */}
      <PrintModal
        isOpen={isPrintModalOpen}
        bill={savedBill}
        settings={settings}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
};
