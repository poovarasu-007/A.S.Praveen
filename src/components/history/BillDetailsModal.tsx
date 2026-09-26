import React from 'react';
import type { Bill, BusinessSettings, PaymentMethod, UnitType } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency, numberToWords } from '../../utils/currency';
import { formatDate, formatTime } from '../../utils/date';
import { formatNumber } from '../../utils/i18n';
import { X, Printer, Receipt, FileText, Calendar, Clock, Phone, MapPin } from 'lucide-react';

interface BillDetailsModalProps {
  isOpen: boolean;
  bill: Bill | null;
  settings: BusinessSettings;
  onPrintThermal: () => void;
  onPrintA4: () => void;
  onClose: () => void;
}

const UNIT_LABELS = {
  en: {
    kg: 'kg',
    gram: 'gram',
    quintal: 'quintal',
    ton: 'ton',
    bag: 'bag',
    litre: 'litre',
    ml: 'ml',
    piece: 'piece',
    box: 'box',
    packet: 'packet',
    bundle: 'bundle',
    set: 'set',
  },
  ta: {
    kg: 'கிலோ',
    gram: 'கிராம்',
    quintal: 'குவிண்டல்',
    ton: 'டன்',
    bag: 'பை',
    litre: 'லிட்டர்',
    ml: 'மில்லி',
    piece: 'துண்டு',
    box: 'பெட்டி',
    packet: 'பாக்கெட்',
    bundle: 'கட்டு',
    set: 'தொகுதி',
  },
} as const;

const COPY = {
  en: {
    snapshot: 'Immutable historical snapshot created on',
    customerInfo: 'Customer information',
    transactionMeta: 'Transaction details',
    billedBy: 'Billed by',
    itemRate: 'Rate',
    quantity: 'Quantity',
    total: 'Total',
  },
  ta: {
    snapshot: 'உருவாக்கப்பட்ட நிலையான வரலாற்றுப் பதிவு',
    customerInfo: 'வாடிக்கையாளர் விவரங்கள்',
    transactionMeta: 'பரிவர்த்தனை விவரங்கள்',
    billedBy: 'பில் வழங்கியவர்',
    itemRate: 'விலை',
    quantity: 'அளவு',
    total: 'மொத்தம்',
  },
} as const;

export const BillDetailsModal: React.FC<BillDetailsModalProps> = ({
  isOpen,
  bill,
  settings,
  onPrintThermal,
  onPrintA4,
  onClose,
}) => {
  const { language, t } = useSettings();
  const copy = COPY[language];

  if (!isOpen || !bill) return null;

  const paymentLabel = (method: PaymentMethod): string => {
    if (method === 'Cash') return t.paymentCash;
    if (method === 'UPI') return t.paymentUpi;
    if (method === 'Card') return t.paymentCard;
    if (method === 'Bank Transfer') return t.bank;
    if (method === 'Credit') return t.paymentCredit;
    return t.other;
  };

  const unitLabel = (unit: UnitType): string => UNIT_LABELS[language][unit];

  return (
    <div className="modal-overlay animate-fade-in p-3 md:p-6" role="dialog" aria-modal="true" aria-labelledby="bill-details-title" aria-describedby="bill-snapshot-description">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-primary-200 bg-white shadow-soft-lg">
        <header className="flex items-center justify-between gap-3 border-b border-primary-100 bg-primary-50 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary-200 bg-white text-secondary-700">
              <Receipt size={20} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="bill-details-title" className="text-base font-semibold text-primary-900">{t.billDetails}</h2>
                <span className="badge-arch font-mono">{bill.billNumber}</span>
              </div>
              <p id="bill-snapshot-description" className="truncate text-[11px] text-text-secondary">
                {copy.snapshot} {formatDate(bill.date, language)} {formatTime(bill.time, language)}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost shrink-0 p-2" aria-label={t.close} title={t.close}>
            <X size={19} aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <section className="grid grid-cols-1 gap-4 rounded-xl border border-primary-100 bg-primary-50/70 p-4 text-xs sm:grid-cols-2" aria-label={copy.customerInfo}>
            <div>
              <h3 className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-secondary-700">
                {copy.customerInfo}
              </h3>
              <div className="text-sm font-semibold text-primary-900">{bill.customer.name}</div>
              {bill.customer.mobile && (
                <div className="mt-1 flex items-center gap-1.5 text-text-secondary">
                  <Phone size={13} className="shrink-0 text-secondary-700" aria-hidden="true" />
                  <span>{bill.customer.mobile}</span>
                </div>
              )}
              {bill.customer.address && (
                <div className="mt-1 flex items-start gap-1.5 text-text-secondary">
                  <MapPin size={13} className="mt-0.5 shrink-0 text-secondary-700" aria-hidden="true" />
                  <span>{bill.customer.address}</span>
                </div>
              )}
              {bill.customer.gstin && (
                <div className="mt-1 text-text-secondary">
                  {t.gstin}: <strong className="font-mono text-primary-900">{bill.customer.gstin}</strong>
                </div>
              )}
            </div>

            <div className="space-y-1.5 sm:text-right">
              <h3 className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-secondary-700">
                {copy.transactionMeta}
              </h3>
              <div className="flex items-center gap-1.5 text-text-secondary sm:justify-end">
                <Calendar size={13} className="shrink-0 text-secondary-700" aria-hidden="true" />
                <span>{t.date}: <strong>{formatDate(bill.date, language)}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-text-secondary sm:justify-end">
                <Clock size={13} className="shrink-0 text-secondary-700" aria-hidden="true" />
                <span>{t.time}: <strong>{formatTime(bill.time, language)}</strong></span>
              </div>
              <div className="text-text-secondary">
                {t.paymentMethod}:{' '}
                <strong className="badge-arch ml-1">{paymentLabel(bill.paymentMethod)}</strong>
              </div>
              <div className="text-[11px] text-text-tertiary">
                {copy.billedBy}: {bill.createdBy}
              </div>
            </div>
          </section>

          <section className="overflow-x-auto rounded-xl border border-primary-200" aria-label={t.itemsList}>
            <table className="table-arch min-w-[680px] text-xs">
              <caption className="sr-only">{t.itemsList}</caption>
              <thead>
                <tr>
                  <th scope="col" className="w-8 text-center">#</th>
                  <th scope="col">{t.productName}</th>
                  <th scope="col" className="text-center">{t.unit}</th>
                  <th scope="col" className="text-right">{copy.itemRate}</th>
                  <th scope="col" className="text-center">{copy.quantity}</th>
                  <th scope="col" className="text-center">{t.gstRate}</th>
                  <th scope="col" className="text-right">{copy.total}</th>
                </tr>
              </thead>
              <tbody>
                {bill.items.map((item, index) => (
                  <tr key={item.id || `${item.productId}-${index}`}>
                    <td className="text-center text-text-tertiary">{formatNumber(index + 1, language)}</td>
                    <td className="font-semibold text-primary-900">{item.productName}</td>
                    <td className="text-center text-text-secondary">{unitLabel(item.unit)}</td>
                    <td className="text-right font-mono text-text-secondary">{formatCurrency(item.rate, language)}</td>
                    <td className="text-center font-semibold text-text-secondary">{formatNumber(item.quantity, language)}</td>
                    <td className="text-center font-semibold text-warning">{formatNumber(item.gstRate, language)}%</td>
                    <td className="text-right font-mono font-semibold text-primary-900">
                      {formatCurrency(item.totalAmount, language)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="rounded-xl border border-primary-200 bg-primary-50/60 p-4 text-xs" aria-label={t.grandTotal}>
            <div className="space-y-2">
              <div className="flex justify-between gap-4 text-text-secondary">
                <span>{t.subtotal}:</span>
                <span className="font-mono font-semibold">{formatCurrency(bill.subtotal, language)}</span>
              </div>
              {bill.cgst > 0 && (
                <div className="flex justify-between gap-4 text-text-secondary">
                  <span>{t.cgst}:</span>
                  <span className="font-mono">{formatCurrency(bill.cgst, language)}</span>
                </div>
              )}
              {bill.sgst > 0 && (
                <div className="flex justify-between gap-4 text-text-secondary">
                  <span>{t.sgst}:</span>
                  <span className="font-mono">{formatCurrency(bill.sgst, language)}</span>
                </div>
              )}
              {bill.igst > 0 && (
                <div className="flex justify-between gap-4 text-text-secondary">
                  <span>{t.igst}:</span>
                  <span className="font-mono">{formatCurrency(bill.igst, language)}</span>
                </div>
              )}
              {bill.roundOff !== 0 && (
                <div className="flex justify-between gap-4 text-text-tertiary">
                  <span>{t.roundOff}:</span>
                  <span className="font-mono">{formatCurrency(bill.roundOff, language)}</span>
                </div>
              )}
              <div className="flex items-center justify-between gap-4 border-t border-primary-200 pt-3 text-sm font-semibold text-primary-900">
                <span>{t.grandTotal}:</span>
                <span className="font-mono text-lg text-secondary-700">{formatCurrency(bill.grandTotal, language)}</span>
              </div>
              <p className="pt-1 text-[11px] italic text-text-tertiary">
                {t.amountInWords}: {numberToWords(bill.grandTotal, language)}
              </p>
            </div>
          </section>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-primary-100 bg-primary-50 px-5 py-4">
          <button type="button" onClick={onClose} className="btn-light px-4 py-2 text-xs">
            {t.close}
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={onPrintThermal} className="btn-light px-3 py-2 text-xs">
              <Printer size={15} aria-hidden="true" />
              <span>{t.thermalInvoice}</span>
            </button>
            <button type="button" onClick={onPrintA4} className="btn-primary px-4 py-2 text-xs">
              <FileText size={15} aria-hidden="true" />
              <span>{t.a4Invoice}</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
