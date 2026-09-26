import React, { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { getNextBillNumber } from '../../db/sequence';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency, numberToWords } from '../../utils/currency';
import { formatDate, formatTime, getTodayDateString } from '../../utils/date';
import { translations } from '../../utils/translations';
import { formatUnit, interpolate } from '../../utils/i18n';
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

const BILLING_COPY = {
  en: {
    customerNamePlaceholder: 'e.g. K. Murugan',
    mobilePlaceholder: '9876543210',
    villagePlaceholder: 'e.g. Thanipadi',
    cropPlaceholder: 'e.g. Paddy / Groundnut',
    gstinPlaceholder: '33XXXXX...',
    landAreaPlaceholder: 'e.g. 2.5 Acres',
    farmerIdPlaceholder: 'Optional GSTIN or Farmer ID',
    cashTenderedPlaceholder: 'Cash tendered',
  },
  ta: {
    customerNamePlaceholder: 'எ.கா. கே. முருகன்',
    mobilePlaceholder: '9876543210',
    villagePlaceholder: 'எ.கா. தாணிப்பாடி',
    cropPlaceholder: 'எ.கா. நெல் / நிலக்கடலை',
    gstinPlaceholder: '33XXXXX...',
    landAreaPlaceholder: 'எ.கா. 2.5 ஏக்கரம்',
    farmerIdPlaceholder: 'விருப்ப GSTIN அல்லது விவசாயி ID',
    cashTenderedPlaceholder: 'கொடுத்த ரொக்கம்',
  },
} as const;

export const BillingCounter: React.FC<BillingCounterProps> = ({ onBillCreated }) => {
  const { currentUser } = useAuth();
  const { settings, language } = useSettings();
  const t = translations[language];
  const copy = BILLING_COPY[language];
  const formatMoney = (amount: number | null | undefined) => formatCurrency(amount, language);

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

  // Live preview bill number & manual entry
  const [estimatedBillNumber, setEstimatedBillNumber] = useState('Generating...');
  const [isManualBillNo, setIsManualBillNo] = useState(false);
  const [manualBillNumber, setManualBillNumber] = useState('');

  // Traditional Village Agriculture Format states
  const [isVillageFormat, setIsVillageFormat] = useState(true);
  const [cropType, setCropType] = useState('');
  const [landArea, setLandArea] = useState('');
  const customerInputRef = useRef<HTMLInputElement>(null);

  // Fetch estimated next bill number on mount / after save
  useEffect(() => {
    async function previewBillNo() {
      try {
        const seqRec = await db.dailySequences.get('GLOBAL');
        const next = (seqRec?.lastSeq || 0) + 1;
        const autoNo = `A.S.P-${String(next).padStart(3, '0')}`;
        setEstimatedBillNumber(autoNo);
        if (!isManualBillNo) {
          setManualBillNumber(autoNo);
        }
      } catch (e) {
        setEstimatedBillNumber('A.S.P-AUTO');
        if (!isManualBillNo) {
          setManualBillNumber('A.S.P-AUTO');
        }
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
    if (c.crop) setCropType(c.crop);
    if (c.landArea) setLandArea(c.landArea);
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
        hsnCode: product.hsnCode,
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
    setCropType('');
    setLandArea('');
    setItems([]);
    setAmountReceived('');
    setErrorMessage('');
    customerInputRef.current?.focus();
  };

  // Validation
  const validateBill = (): boolean => {
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage(t.customerRequired);
      customerInputRef.current?.focus();
      return false;
    }

    if (items.length === 0) {
      setErrorMessage(t.atLeastOneProduct);
      setIsProductModalOpen(true);
      return false;
    }

    for (const item of items) {
      if (item.quantity <= 0) {
        setErrorMessage(interpolate(t.quantityGreater, { name: item.productName }));
        return false;
      }
    }

    if (isManualBillNo && !manualBillNumber.trim()) {
      setErrorMessage(t.manualBillRequired);
      return false;
    }

    return true;
  };

  // Save Bill to IndexedDB
  const handleSaveBill = async (andPrint: boolean) => {
    if (!validateBill()) return;

    try {
      setIsSaving(true);
      const now = new Date();

      let finalBillNumber = '';
      if (isManualBillNo) {
        finalBillNumber = manualBillNumber.trim();
        // Check for duplicate bill number
        const duplicate = await db.bills.where('billNumber').equals(finalBillNumber).first();
        if (duplicate) {
          setErrorMessage(interpolate(t.billNumberExists, { number: finalBillNumber }));
          setIsSaving(false);
          return;
        }
      } else {
        finalBillNumber = await getNextBillNumber(now);
      }

      const billRecord: Bill = {
        id: `bill_${Date.now()}`,
        billNumber: finalBillNumber,
        date: getTodayDateString(),
        time: formatTime(now, language),
        customer: {
          name: customerName.trim(),
          mobile: customerMobile.trim() || undefined,
          address: customerAddress.trim() || undefined,
          gstin: customerGstin.trim() || undefined,
          crop: cropType.trim() || undefined,
          landArea: landArea.trim() || undefined
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
        billFormat: isVillageFormat ? 'traditional' : 'standard',
        isManualBillNumber: isManualBillNo,
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
          crop: cropType.trim() || existingCustomer.crop,
          landArea: landArea.trim() || existingCustomer.landArea,
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
          crop: cropType.trim() || undefined,
          landArea: landArea.trim() || undefined,
          totalBills: 1,
          totalPurchases: roundedGrandTotal,
          lastVisit: billRecord.date
        });
      }

      // 3. Log Audit
      await db.auditLogs.add({
        id: `audit_${Date.now()}`,
        timestamp: now.toISOString(),
        date: formatDate(now, language),
        time: formatTime(now, language),
        user: currentUser?.username || 'operator',
        role: currentUser?.role || 'OPERATOR',
        action: 'Created Bill',
        recordType: 'BILL',
        recordId: finalBillNumber,
        details: `Generated Bill ${finalBillNumber} for ${customerName} (₹${roundedGrandTotal})${isManualBillNo ? ' [Manual No]' : ''}`
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
        t.saveBillError
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to return colorful badges for agricultural product categories
  const getProductBadge = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('seed') || lower.includes('விதை') || lower.includes('paddy') || lower.includes('maize')) {
      return { icon: '🌱', label: t.catSeeds, color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    }
    if (lower.includes('urea') || lower.includes('dap') || lower.includes('potash') || lower.includes('npk') || lower.includes('fertilizer') || lower.includes('உரம்')) {
      return { icon: '🌾', label: t.catFertilizers, color: 'bg-amber-100 text-amber-900 border-amber-300' };
    }
    if (lower.includes('vermi') || lower.includes('neem cake') || lower.includes('organic') || lower.includes('manure')) {
      return { icon: '🍂', label: t.catOrganicManure, color: 'bg-lime-100 text-lime-900 border-lime-300' };
    }
    if (lower.includes('sprayer') || lower.includes('hoe') || lower.includes('sickle') || lower.includes('gloves') || lower.includes('கருவி')) {
      return { icon: '🚜', label: t.catAgriTools, color: 'bg-orange-100 text-orange-900 border-orange-300' };
    }
    if (lower.includes('drip') || lower.includes('pipe') || lower.includes('valve') || lower.includes('irrigation')) {
      return { icon: '💧', label: t.catIrrigation, color: 'bg-cyan-100 text-cyan-900 border-cyan-300' };
    }
    return { icon: '🌿', label: t.catOther, color: 'bg-teal-100 text-teal-800 border-teal-300' };
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-8">
      {/* ── Header Banner ─────────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-800) 100%)',
          border: '1px solid #F3FAF0',
        }}
      >
        <div className="p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-secondary-700) 100%)',
                border: '1px solid rgba(193,230,186,0.35)',
              }}
            >
              🌾
            </div>
            <div>
              <h2 className="font-display font-medium text-white text-lg tracking-wide">{settings.businessName}</h2>
              <p className="text-xs text-primary-100" style={{ color: 'rgba(255,255,255,0.72)' }}>
                {settings.tagline} &nbsp;·&nbsp; <span className="text-primary-100">GSTIN: {settings.gstin}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Bill Number Card */}
            <div className="card-panel px-4 py-2 min-w-[220px]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-widest text-accent font-semibold" style={{ letterSpacing: '0.12em' }}>
                  {t.billNumber}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (isManualBillNo) {
                      setIsManualBillNo(false);
                      setManualBillNumber(estimatedBillNumber);
                    } else {
                      setIsManualBillNo(true);
                      if (!manualBillNumber) setManualBillNumber(estimatedBillNumber);
                    }
                  }}
                  className="text-[10px] text-white/50 hover:text-white underline transition-colors"
                >
                  {isManualBillNo ? t.resetAuto : t.manualBillNumber}
                </button>
              </div>
              <input
                type="text"
                value={isManualBillNo ? manualBillNumber : estimatedBillNumber}
                onChange={(e) => { setIsManualBillNo(true); setManualBillNumber(e.target.value); }}
                className="w-full border-none bg-transparent text-right font-mono text-sm font-bold text-primary-900 outline-none"
                style={{ color: '#287056' }}
                aria-label={t.billNumber}
              />
            </div>

            {/* Bill Format toggle */}
            <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(2,51,55,0.18)' }}>
              <button
                type="button"
                onClick={() => setIsVillageFormat(true)}
                className="px-3 py-2 text-xs font-semibold transition-all"
                style={{
                  background: isVillageFormat ? 'rgba(2,51,55,0.7)' : 'transparent',
                  color: isVillageFormat ? '#fff' : 'rgba(255,255,255,0.68)',
                }}
              >
                {t.villageFormat}
              </button>
              <button
                type="button"
                onClick={() => setIsVillageFormat(false)}
                className="px-3 py-2 text-xs font-semibold transition-all"
                style={{
                  background: !isVillageFormat ? 'rgba(2,51,55,0.7)' : 'transparent',
                  color: !isVillageFormat ? '#fff' : 'rgba(255,255,255,0.68)',
                }}
              >
                {t.standardFormat}
              </button>
            </div>

            {/* Clear */}
            <button
              onClick={handleClearForm}
              className="btn-ghost gap-1.5 text-xs"
              title={t.clearShortcut}
            >
              <RotateCcw size={14} />
              <span className="hidden sm:inline">{t.clearShortcut}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="toast-error flex items-center justify-between w-full static relative" role="alert">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="btn-ghost px-2 py-1 text-xs">{t.dismiss}</button>
        </div>
      )}

      {/* ── Customer Info ──────────────────────────────────────────── */}
      <div className="card-glass p-5">
        <h3 className="text-xs font-semibold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: '#287056', letterSpacing: '0.12em' }}>
          <UserCheck size={14} />
          {isVillageFormat ? t.farmerBuyerProfile : t.customerDetails}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Name */}
          <div className="relative md:col-span-1">
            <label className="label-arch">{isVillageFormat ? `${t.farmerName} *` : `${t.customerName} *`}</label>
            <input
              ref={customerInputRef}
              type="text"
              value={customerName}
              onChange={(e) => { setCustomerName(e.target.value); setShowCustomerSuggestions(true); }}
              onFocus={() => setShowCustomerSuggestions(true)}
              placeholder={copy.customerNamePlaceholder}
              className="input-arch"
              autoFocus
            />
            {showCustomerSuggestions && customerSuggestions.length > 0 && (
              <div
                className="absolute left-0 right-0 top-full mt-1 z-30 rounded-xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.98)', border: '1px solid rgba(2,51,55,0.14)', boxShadow: '0 8px 32px rgba(2,51,55,0.12)' }}
              >
                <div className="px-3 py-2 text-[10px] uppercase tracking-widest" style={{ color: 'rgba(2,51,55,0.7)', borderBottom: '1px solid rgba(2,51,55,0.12)' }}>
                  Returning Customers
                </div>
                {customerSuggestions.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => selectCustomerSuggestion(c)}
                    className="px-3 py-2.5 cursor-pointer flex justify-between items-center text-xs transition-colors hover:bg-deep-800"
                    style={{ borderBottom: '1px solid rgba(2,51,55,0.08)' }}
                  >
                    <div>
                      <div className="font-semibold text-white/85">{c.name}</div>
                      <div style={{ color: '#28564B' }}>{c.address || c.mobile || '—'}</div>
                    </div>
                    {c.mobile && <span className="font-mono text-xs" style={{ color: '#287056' }}>{c.mobile}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mobile */}
          <div>
            <label className="label-arch">{isVillageFormat ? t.mobileNo : t.customerMobile}</label>
            <input type="tel" value={customerMobile} onChange={(e) => setCustomerMobile(e.target.value)} placeholder={copy.mobilePlaceholder} className="input-arch font-mono" />
          </div>

          {/* Village / Address */}
          <div>
            <label className="label-arch">{isVillageFormat ? t.villageTown : t.customerAddress}</label>
            <input type="text" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder={copy.villagePlaceholder} className="input-arch" />
            <div className="flex flex-wrap gap-1 mt-1.5">
              {['தானிப்பாடி', 'சாத்தனூர்', 'செங்கம்', 'மேல்செங்கம்'].map((v) => (
                <button key={v} type="button" onClick={() => setCustomerAddress(v)} className="text-[10px] px-2 py-0.5 rounded-md transition-colors" style={{ background: '#EAF8E7', color: '#28564B', border: '1px solid rgba(2,51,55,0.2)' }}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Crop / GSTIN */}
          <div>
            <label className="label-arch">{isVillageFormat ? t.cropType : t.gstin}</label>
            {isVillageFormat ? (
              <div>
                <input type="text" value={cropType} onChange={(e) => setCropType(e.target.value)} placeholder={copy.cropPlaceholder} className="input-arch" />
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {['🌾 நெல்', '🥜 நிலக்கடலை', '🎋 கரும்பு', '🍌 வாழை'].map((c) => (
                    <button key={c} type="button" onClick={() => setCropType(c)} className="text-[10px] px-2 py-0.5 rounded-md transition-colors" style={{ background: '#EAF8E7', color: '#28564B', border: '1px solid rgba(2,51,55,0.2)' }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <input type="text" value={customerGstin} onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())} placeholder={copy.gstinPlaceholder} className="input-arch font-mono" />
            )}
          </div>
        </div>

        {isVillageFormat && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4" style={{ borderTop: '1px solid rgba(2,51,55,0.12)' }}>
            <div>
              <label className="label-arch">{t.landAreaInput}</label>
              <input type="text" value={landArea} onChange={(e) => setLandArea(e.target.value)} placeholder={copy.landAreaPlaceholder} className="input-arch" />
            </div>
            <div>
              <label className="label-arch">{t.gstinOptional}</label>
              <input type="text" value={customerGstin} onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())} placeholder={copy.farmerIdPlaceholder} className="input-arch font-mono" />
            </div>
          </div>
        )}
      </div>

      {/* ── Product Category Quick-Select Cards ──────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { title: t.categorySeedsPaddy, sub: t.nativeSeeds, icon: '🌱', color: '#EAF8E7', border: 'rgba(77,166,116,0.30)' },
          { title: t.catFertilizers, sub: t.organicChemical, icon: '🌾', color: '#F3FAF0', border: 'rgba(193,230,186,0.40)' },
          { title: t.catPesticides, sub: t.cropProtection, icon: '🚜', color: '#EAF8E7', border: 'rgba(112,185,135,0.32)' },
          { title: t.toolsEquipment, sub: t.agricultureTools, icon: '🛠️', color: '#F3FAF0', border: 'rgba(77,166,116,0.28)' },
        ].map((card, i) => (
          <button
            key={i}
            onClick={() => setIsProductModalOpen(true)}
            className="rounded-xl p-4 text-left transition-all duration-200 hover:scale-[1.02]"
            style={{ background: card.color, border: `1px solid ${card.border}` }}
          >
            <span className="text-2xl block mb-1">{card.icon}</span>
            <div className="text-xs font-semibold text-primary-900">{card.title}</div>
            <div className="text-[11px]" style={{ color: '#28564B' }}>{card.sub}</div>
          </button>
        ))}
      </div>

      {/* ── Items Table ───────────────────────────────────────────── */}
      <div className="card-glass overflow-hidden">
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: '1px solid rgba(2,51,55,0.15)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-primary-900">{t.billingItems}</span>
            {items.length > 0 && <span className="badge-arch">{items.length}</span>}
            <span className="text-xs text-text-tertiary">{t.fixedPriceLocked}</span>
          </div>
          <button
            id="add-product-btn"
            onClick={() => setIsProductModalOpen(true)}
            className="btn-primary py-2 px-4 text-xs gap-1.5"
          >
            <Plus size={14} /> {t.addProduct} (F4)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="table-arch">
            <thead>
              <tr>
                <th className="text-center w-10">#</th>
                <th>{t.productName}</th>
                <th className="text-center w-20">{t.unit}</th>
                <th className="text-right w-28">{t.rate}</th>
                <th className="text-center w-36">{t.qty}</th>
                <th className="text-center w-20">GST %</th>
                <th className="text-right w-32">{t.amount}</th>
                <th className="text-center w-12">{t.deleteColumn}</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                        style={{ background: '#F3FAF0', border: '1px solid rgba(2,51,55,0.15)' }}
                      >
                        🌾
                      </div>
                      <p className="text-sm text-text-secondary">{t.noProductsAdded}</p>
                      <button
                        type="button"
                        onClick={() => setIsProductModalOpen(true)}
                        className="btn-primary py-2 px-5 text-xs"
                      >
                        <Plus size={13} /> {t.addProduct} (F4)
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const badge = getProductBadge(item.productName);
                  return (
                    <tr key={item.id || index}>
                      <td className="text-center text-muted font-mono text-xs">{index + 1}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white/85 text-sm">{item.productName}</span>
                          <span className="badge-arch text-[10px]">{badge.icon} {badge.label}</span>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="badge-arch">{formatUnit(item.unit, language)}</span>
                      </td>
                      <td className="text-right">
                        <span className="font-mono font-semibold text-white/80">{formatMoney(item.rate)}</span>
                      </td>
                      <td className="text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            aria-label={t.decreaseQuantity}
                            onClick={() => handleQuantityChange(index, Math.max(1, item.quantity - 1))}
                            className="w-7 h-7 rounded-lg text-white font-bold text-base flex items-center justify-center transition-colors"
                            style={{ background: 'rgba(2,51,55,0.5)', border: '1px solid rgba(2,51,55,0.14)' }}
                          >−</button>
                          <input
                            type="number"
                            aria-label={t.qty}
                            step="any"
                            min="0.01"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(index, parseFloat(e.target.value) || 0)}
                            className="w-14 text-center font-bold text-sm rounded-lg py-1 bg-transparent text-white outline-none"
                            style={{ border: '1px solid rgba(2,51,55,0.14)' }}
                          />
                          <button
                            type="button"
                            aria-label={t.increaseQuantity}
                            onClick={() => handleQuantityChange(index, item.quantity + 1)}
                            className="w-7 h-7 rounded-lg text-white font-bold text-base flex items-center justify-center transition-colors"
                            style={{ background: 'rgba(2,51,55,0.5)', border: '1px solid rgba(2,51,55,0.14)' }}
                          >+</button>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="badge-info">{item.gstRate}%</span>
                      </td>
                      <td className="text-right">
                        <span className="font-mono font-semibold text-white">{formatMoney(item.totalAmount)}</span>
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          aria-label={t.removeItem}
                          onClick={() => handleRemoveItem(index)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: 'rgba(180,35,24,0.75)' }}
                          title={t.removeItem}
                        >
                          <Trash2 size={14} aria-hidden="true" />
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

      {/* ── Bottom: Payment & Totals ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

        {/* Left: GST Mode + Payment + Amount in Words */}
        <div className="lg:col-span-7 space-y-4">
          <div className="card-glass p-5 space-y-5">
            <h4 className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#287056', letterSpacing: '0.12em' }}>
              {t.paymentTaxConfiguration}
            </h4>

            {/* GST Mode */}
            <div>
              <label className="label-arch">{t.gstMode}</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {[
                  { id: 'CGST_SGST' as const, label: t.gstModeCgstSgst },
                  { id: 'IGST' as const, label: t.gstModeIgst },
                  { id: 'EXEMPT' as const, label: t.gstModeExempted },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setGstMode(m.id)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      background: gstMode === m.id ? '#023337' : '#F3FAF0',
                      border: `1px solid ${gstMode === m.id ? '#4DA674' : '#C1E6BA'}`,
                      color: gstMode === m.id ? '#fff' : '#28564B',
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="label-arch">{t.paymentMethod}</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-1">
                {[
                  { id: 'Cash', label: t.cash, icon: '💵' },
                  { id: 'UPI', label: t.upi, icon: '📲' },
                  { id: 'Card', label: t.card, icon: '💳' },
                  { id: 'Bank Transfer', label: t.bank, icon: '🏛️' },
                  { id: 'Credit', label: t.khata, icon: '📝' },
                  { id: 'Other', label: t.other, icon: '🏷️' },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                    className="py-2.5 px-2 rounded-xl text-xs font-semibold text-center transition-all"
                    style={{
                      background: paymentMethod === pm.id ? '#023337' : '#F3FAF0',
                      border: `1px solid ${paymentMethod === pm.id ? '#4DA674' : '#C1E6BA'}`,
                      color: paymentMethod === pm.id ? '#fff' : '#28564B',
                    }}
                  >
                    {pm.icon} {pm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cash counter */}
            {paymentMethod === 'Cash' && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="label-arch">{t.amountReceived}</label>
                  <input
                    type="number"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    placeholder={copy.cashTenderedPlaceholder}
                    className="input-arch font-mono"
                  />
                </div>
                <div>
                  <label className="label-arch">{t.balance}</label>
                  <div
                    className="rounded-xl px-4 py-3 font-mono font-bold text-sm flex items-center justify-between"
                    style={{
                      background: balance >= 0 ? '#EAF8E7' : '#FDECEC',
                      border: `1px solid ${balance >= 0 ? 'rgba(77,166,116,0.30)' : 'rgba(180,35,24,0.30)'}`,
                      color: balance >= 0 ? '#287056' : '#B42318',
                    }}
                  >
                    <span>{t.change}:</span>
                    <span>{formatMoney(balance)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Amount in words */}
          <div className="card-panel px-5 py-4">
            <span className="label-arch block mb-1">{t.amountInWords}</span>
            <p className="text-sm font-medium italic text-white/75 leading-relaxed">{numberToWords(roundedGrandTotal, language)}</p>
          </div>
        </div>

        {/* Right: Totals + Actions */}
        <div className="lg:col-span-5 card-glass overflow-hidden">
          <div
            className="px-5 py-3.5 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(2,51,55,0.15)' }}
          >
            <span className="text-sm font-semibold text-primary-900">{t.billSummary}</span>
            <span className="badge-arch text-[10px]">{t.liveTotal}</span>
          </div>

          <div className="p-5 space-y-3 text-sm">
            <div className="flex justify-between" style={{ color: '#28564B' }}>
              <span>{t.subtotal} ({t.taxableLabel})</span>
              <span className="font-mono font-semibold text-white">{formatMoney(subtotal)}</span>
            </div>

            {gstMode === 'CGST_SGST' && (
              <>
                <div className="flex justify-between text-xs" style={{ color: 'rgba(2,51,55,0.8)', background: 'rgba(2,51,55,0.15)', borderRadius: '8px', padding: '8px 12px' }}>
                  <span>{t.centralGst}</span>
                  <span className="font-mono">{formatMoney(cgst)}</span>
                </div>
                <div className="flex justify-between text-xs" style={{ color: 'rgba(2,51,55,0.8)', background: 'rgba(2,51,55,0.15)', borderRadius: '8px', padding: '8px 12px' }}>
                  <span>{t.stateGst}</span>
                  <span className="font-mono">{formatMoney(sgst)}</span>
                </div>
              </>
            )}

            {gstMode === 'IGST' && (
              <div className="flex justify-between text-xs" style={{ color: 'rgba(2,51,55,0.8)', background: 'rgba(2,51,55,0.15)', borderRadius: '8px', padding: '8px 12px' }}>
                <span>{t.integratedGst}</span>
                <span className="font-mono">{formatMoney(igst)}</span>
              </div>
            )}

            {roundOff !== 0 && (
              <div className="flex justify-between text-xs" style={{ color: '#28564B' }}>
                <span>{t.roundOff}</span>
                <span className="font-mono">{formatMoney(roundOff)}</span>
              </div>
            )}

            {/* Grand Total */}
            <div
              className="rounded-xl p-4 flex items-center justify-between mt-2"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary-800) 0%, var(--color-primary-900) 100%)',
                border: '1px solid rgba(193,230,186,0.3)',
              }}
            >
              <span className="text-xs uppercase tracking-widest font-semibold text-primary-100" style={{ letterSpacing: '0.1em' }}>
                {t.grandTotal}
              </span>
              <span className="text-2xl font-bold font-mono text-white">{formatMoney(roundedGrandTotal)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="px-5 pb-5 space-y-2.5" style={{ borderTop: '1px solid rgba(2,51,55,0.12)', paddingTop: '16px' }}>
            <button
              id="save-print-btn"
              onClick={() => handleSaveBill(true)}
              disabled={isSaving || items.length === 0}
              className="btn-primary w-full py-3.5 text-sm gap-2 tracking-wider"
              style={{ letterSpacing: '0.08em' }}
            >
              <Printer size={17} />
              {isSaving ? t.saving : `${t.saveAndPrint} (F8)`}
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                id="save-only-btn"
                onClick={() => handleSaveBill(false)}
                disabled={isSaving || items.length === 0}
                className="btn-outline py-2.5 text-xs gap-1.5"
              >
                <Save size={14} /> {t.saveBill}
              </button>
              <button
                id="preview-btn"
                onClick={() => {
                  if (validateBill()) {
                    const mockBill: Bill = {
                      id: 'preview',
                      billNumber: isManualBillNo && manualBillNumber.trim() ? manualBillNumber.trim() : estimatedBillNumber,
                      date: getTodayDateString(),
                      time: formatTime(new Date(), language),
                      customer: {
                        name: customerName.trim(),
                        mobile: customerMobile.trim() || undefined,
                        address: customerAddress.trim() || undefined,
                        gstin: customerGstin.trim() || undefined,
                        crop: cropType.trim() || undefined,
                        landArea: landArea.trim() || undefined
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
                      billFormat: isVillageFormat ? 'traditional' : 'standard',
                      isManualBillNumber: isManualBillNo,
                      createdBy: currentUser?.name || 'Operator',
                      createdAt: new Date().toISOString()
                    };
                    setSavedBill(mockBill);
                    setIsPrintModalOpen(true);
                  }
                }}
                disabled={items.length === 0}
                className="btn-ghost border py-2.5 text-xs gap-1.5"
                style={{ borderColor: 'rgba(2,51,55,0.14)' }}
              >
                <Eye size={14} /> {t.printPreview}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProductSelectorModal
        isOpen={isProductModalOpen}
        products={products}
        onSelectProduct={handleSelectProduct}
        onClose={() => setIsProductModalOpen(false)}
      />
      <BillSuccessModal
        isOpen={isSuccessModalOpen}
        bill={savedBill}
        onPrint={() => { setIsSuccessModalOpen(false); setIsPrintModalOpen(true); }}
        onNewBill={() => { setIsSuccessModalOpen(false); handleClearForm(); }}
        onClose={() => setIsSuccessModalOpen(false)}
      />
      <PrintModal
        isOpen={isPrintModalOpen}
        bill={savedBill}
        settings={settings}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
};
