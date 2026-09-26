import React from 'react';
import { CheckCircle2, PlusCircle, Printer, X } from 'lucide-react';
import type { Bill } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { useSettings } from '../../context/SettingsContext';

interface BillSuccessModalProps { isOpen: boolean; bill: Bill | null; onPrint: () => void; onNewBill: () => void; onClose: () => void; }

export const BillSuccessModal: React.FC<BillSuccessModalProps> = ({ isOpen, bill, onPrint, onNewBill, onClose }) => {
  const { t, language } = useSettings();
  if (!isOpen || !bill) return null;
  return (
    <div className="modal-overlay animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="bill-success-title">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-primary-200 bg-white shadow-soft-lg">
        <div className="relative border-b border-primary-100 bg-primary-900 p-6 text-center text-white">
          <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-full p-1.5 text-primary-100 hover:bg-white/10 hover:text-white" aria-label={t.close}><X size={19} aria-hidden="true" /></button>
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500 text-primary-900 shadow-soft"><CheckCircle2 size={34} aria-hidden="true" /></div>
          <h2 id="bill-success-title" className="text-xl font-semibold">{t.billSaved}</h2>
          <p className="mt-1 text-xs text-primary-100">{t.systemOnline}</p>
        </div>
        <div className="space-y-4 bg-primary-50 p-6">
          <div className="space-y-3 rounded-2xl border border-primary-200 bg-white p-4 text-center shadow-soft-sm">
            <div><span className="label-arch">{t.billNumber}</span><div className="font-mono text-xl font-bold tracking-wider text-primary-900">{bill.billNumber}</div></div>
            <div className="rounded-xl border border-primary-100 bg-primary-50 p-3"><span className="label-arch">{t.grandTotal}</span><div className="font-mono text-3xl font-bold text-secondary-700">{formatCurrency(bill.grandTotal, language)}</div></div>
            <div className="text-xs text-text-secondary">{t.customerName}: <span className="font-semibold text-primary-900">{bill.customer.name}</span>{bill.customer.mobile && <span className="font-mono text-secondary-700"> ({bill.customer.mobile})</span>}</div>
          </div>
          <div className="space-y-2.5"><button type="button" onClick={onPrint} className="btn-primary w-full py-3.5 text-base"><Printer size={18} aria-hidden="true" />{t.printBillNow}</button><button type="button" onClick={onNewBill} className="btn-light w-full py-3 text-sm"><PlusCircle size={16} aria-hidden="true" />{t.createAnotherBill}</button></div>
        </div>
      </div>
    </div>
  );
};
