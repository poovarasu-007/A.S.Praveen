import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { formatNumber } from '../../utils/i18n';
import { BillDetailsModal } from '../history/BillDetailsModal';
import { PrintModal } from '../print/PrintModal';
import type { Customer, Bill, PaymentMethod } from '../../types';
import { Users, Search, Phone, MapPin, Receipt, X } from 'lucide-react';

const COPY = {
  en: {
    directorySubtitle: 'A local directory of farmers, buyers and their purchase history',
    searchPlaceholder: 'Search customers by name, mobile number, village or town...',
    farmer: 'Farmer',
    history: 'History',
    contactMobile: 'Contact & mobile',
    address: 'Address / village',
    customerHistory: 'Customer purchase history',
    pastBills: 'Past bills for this customer',
    noCustomerBills: 'No individual bill records were found for this customer.',
    phone: 'Phone',
    totalCustomers: 'Total customers',
  },
  ta: {
    directorySubtitle: 'உள்ளூர் விவசாயிகள், வாங்குபவர்கள் மற்றும் அவர்களின் கொள்முதல் வரலாறு',
    searchPlaceholder: 'பெயர், கைபேசி எண், ஊர் அல்லது பட்டி மூலம் வாடிக்கையாளர்களைத் தேடுங்கள்...',
    farmer: 'விவசாயி',
    history: 'வரலாறு',
    contactMobile: 'தொடர்பு & கைபேசி',
    address: 'முகவரி / ஊர்',
    customerHistory: 'வாடிக்கையாளர் கொள்முதல் வரலாறு',
    pastBills: 'இந்த வாடிக்கையாளரின் கடந்த பில்கள்',
    noCustomerBills: 'இந்த வாடிக்கையாளருக்கான தனிப்பட்ட பில் பதிவுகள் எதுவும் கிடைக்கவில்லை.',
    phone: 'கைபேசி',
    totalCustomers: 'மொத்த வாடிக்கையாளர்கள்',
  },
} as const;

export const CustomerList: React.FC = () => {
  const { settings, language, t } = useSettings();
  const copy = COPY[language];
  const customers = useLiveQuery(() => db.customers.toArray(), []) || [];
  const allBills = useLiveQuery(() => db.bills.toArray(), []) || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [inspectedBill, setInspectedBill] = useState<Bill | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [printBill, setPrintBill] = useState<Bill | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const filtered = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.mobile && customer.mobile.includes(searchTerm)) ||
      (customer.address && customer.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const customerBills = selectedCustomer
    ? allBills
        .filter(
          (bill) =>
            bill.customer.name.toLowerCase().trim() === selectedCustomer.name.toLowerCase().trim() ||
            (selectedCustomer.mobile && bill.customer.mobile === selectedCustomer.mobile)
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  const totalSpent = customerBills.reduce((sum, bill) => sum + bill.grandTotal, 0);

  const paymentLabel = (method: PaymentMethod): string => {
    if (method === 'Cash') return t.paymentCash;
    if (method === 'UPI') return t.paymentUpi;
    if (method === 'Card') return t.paymentCard;
    if (method === 'Bank Transfer') return t.bank;
    if (method === 'Credit') return t.paymentCredit;
    return t.other;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-8">
      <section
        className="card-glass relative overflow-hidden border-primary-200 bg-gradient-to-br from-primary-50 via-surface to-secondary-50 p-5"
        aria-labelledby="customer-directory-title"
      >
        <div className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full bg-secondary-100/70 blur-2xl" aria-hidden="true" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary-200 bg-white text-secondary-700 shadow-soft-sm">
              <Users size={23} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="customer-directory-title" className="section-title text-xl font-semibold sm:text-2xl">
                  {t.customers}
                </h2>
                <span className="badge-arch">{formatNumber(customers.length, language)}</span>
              </div>
              <p className="mt-0.5 text-xs text-text-secondary sm:text-sm">{copy.directorySubtitle}</p>
            </div>
          </div>

          <div className="rounded-xl border border-primary-200 bg-white/80 px-3.5 py-2 text-xs font-medium text-text-secondary shadow-soft-sm">
            {copy.totalCustomers}:{' '}
            <strong className="ml-1 font-mono text-sm text-secondary-700">
              {formatNumber(customers.length, language)}
            </strong>
          </div>
        </div>
      </section>

      <section className="card-glass p-4" aria-label={t.search}>
        <div className="relative">
          <Search size={19} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-700" aria-hidden="true" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={copy.searchPlaceholder}
            className="input-arch pl-11"
            aria-label={copy.searchPlaceholder}
          />
        </div>
      </section>

      <section className="card-glass overflow-hidden" aria-label={t.customers}>
        <div className="overflow-x-auto">
          <table className="table-arch min-w-[960px]">
            <caption className="sr-only">{t.customers}</caption>
            <thead>
              <tr>
                <th scope="col" className="w-12 text-center">#</th>
                <th scope="col">{t.customerName}</th>
                <th scope="col">{copy.contactMobile}</th>
                <th scope="col">{copy.address}</th>
                <th scope="col" className="text-center">{t.totalBills}</th>
                <th scope="col" className="text-right">{t.totalPurchases}</th>
                <th scope="col" className="text-center">{t.lastVisit}</th>
                <th scope="col" className="text-center">{copy.history}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <Users size={30} className="mx-auto mb-2 text-secondary-700" aria-hidden="true" />
                    <p className="text-sm font-semibold text-text-secondary">{t.noCustomers}</p>
                    <p className="mt-1 text-xs text-text-tertiary">{t.customersAutoAdded}</p>
                  </td>
                </tr>
              ) : (
                filtered.map((customer, index) => (
                  <tr
                    key={customer.id}
                    onClick={() => setSelectedCustomer(customer)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedCustomer(customer);
                      }
                    }}
                    tabIndex={0}
                    aria-label={`${t.view}: ${customer.name}`}
                    className="cursor-pointer"
                  >
                    <td className="text-center font-semibold text-text-tertiary">{formatNumber(index + 1, language)}</td>
                    <td>
                      <div className="flex flex-wrap items-center gap-1.5 font-semibold text-primary-900">
                        <span>{customer.name}</span>
                        <span className="badge-success">{copy.farmer}</span>
                        {customer.crop && <span className="badge-warning">{customer.crop}</span>}
                      </div>
                      {customer.gstin && (
                        <div className="mt-0.5 font-mono text-[11px] text-text-tertiary">
                          {t.gstin}: {customer.gstin}
                        </div>
                      )}
                    </td>
                    <td className="text-xs font-mono">
                      {customer.mobile ? (
                        <span className="flex items-center gap-1.5 text-text-secondary">
                          <Phone size={13} className="shrink-0 text-secondary-700" aria-hidden="true" />
                          <span>{customer.mobile}</span>
                        </span>
                      ) : (
                        <span className="italic text-text-tertiary">{t.notProvided}</span>
                      )}
                    </td>
                    <td className="text-xs text-text-secondary">
                      {customer.address ? (
                        <span className="flex items-start gap-1.5">
                          <MapPin size={13} className="mt-0.5 shrink-0 text-secondary-700" aria-hidden="true" />
                          <span>{customer.address}</span>
                        </span>
                      ) : (
                        <span className="italic text-text-tertiary">{t.notProvided}</span>
                      )}
                    </td>
                    <td className="text-center">
                      <span className="badge-arch">
                        <Receipt size={12} aria-hidden="true" />
                        {formatNumber(customer.totalBills || 1, language)}
                      </span>
                    </td>
                    <td className="text-right font-mono font-semibold text-primary-900">
                      {formatCurrency(customer.totalPurchases || 0, language)}
                    </td>
                    <td className="text-center text-xs text-text-secondary">
                      {customer.lastVisit ? formatDate(customer.lastVisit, language) : '—'}
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedCustomer(customer);
                        }}
                        className="btn-light px-3 py-1.5 text-xs"
                        aria-label={`${copy.history}: ${customer.name}`}
                      >
                        {t.view}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedCustomer && (
        <div className="modal-overlay animate-fade-in p-3 md:p-4" role="dialog" aria-modal="true" aria-labelledby="customer-history-title">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-primary-200 bg-white shadow-soft-lg">
            <header className="flex items-center justify-between gap-3 border-b border-primary-100 bg-primary-50 px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary-200 bg-white text-secondary-700">
                  <Users size={20} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h2 id="customer-history-title" className="truncate text-base font-semibold text-primary-900">
                    {selectedCustomer.name}
                  </h2>
                  <p className="truncate text-xs text-text-secondary">
                    {selectedCustomer.address || t.notProvided} • {copy.phone}: {selectedCustomer.mobile || t.notProvided}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="btn-ghost shrink-0 p-2"
                aria-label={t.close}
                title={t.close}
              >
                <X size={19} aria-hidden="true" />
              </button>
            </header>

            <div className="grid grid-cols-1 gap-3 border-b border-primary-100 bg-secondary-50/70 p-4 text-center sm:grid-cols-3">
              <div className="stat-card py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">{t.totalBills}</span>
                <span className="font-mono text-lg font-semibold text-primary-900">{formatNumber(customerBills.length, language)}</span>
              </div>
              <div className="stat-card py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">{t.totalSpent}</span>
                <span className="font-mono text-lg font-semibold text-secondary-700">{formatCurrency(totalSpent, language)}</span>
              </div>
              <div className="stat-card py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">{t.lastVisit}</span>
                <span className="text-xs font-semibold text-text-secondary">
                  {selectedCustomer.lastVisit ? formatDate(selectedCustomer.lastVisit, language) : t.today}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="mb-2.5 text-sm font-semibold text-primary-900">
                {copy.pastBills} ({formatNumber(customerBills.length, language)})
              </h3>

              {customerBills.length === 0 ? (
                <div className="rounded-xl border border-dashed border-primary-200 bg-primary-50/60 py-10 text-center text-xs text-text-tertiary">
                  {copy.noCustomerBills}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-primary-200">
                  <table className="table-arch min-w-[720px] text-xs">
                    <caption className="sr-only">{copy.pastBills}</caption>
                    <thead>
                      <tr>
                        <th scope="col">{t.billNo}</th>
                        <th scope="col">{t.date}</th>
                        <th scope="col" className="text-center">{t.items}</th>
                        <th scope="col">{t.paymentMethod}</th>
                        <th scope="col" className="text-right">{t.amount}</th>
                        <th scope="col" className="text-center">{t.action}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerBills.map((bill) => (
                        <tr key={bill.id}>
                          <td className="font-mono font-semibold text-secondary-700">{bill.billNumber}</td>
                          <td className="text-text-secondary">{formatDate(bill.date, language)}</td>
                          <td className="text-center font-medium">{formatNumber(bill.items.length, language)}</td>
                          <td><span className="badge-arch">{paymentLabel(bill.paymentMethod)}</span></td>
                          <td className="text-right font-mono font-semibold text-primary-900">
                            {formatCurrency(bill.grandTotal, language)}
                          </td>
                          <td className="text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setInspectedBill(bill);
                                setIsDetailsOpen(true);
                              }}
                              className="btn-light px-3 py-1.5 text-[11px]"
                              aria-label={`${t.view}: ${bill.billNumber}`}
                            >
                              {t.view}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <footer className="flex justify-end border-t border-primary-100 bg-primary-50 px-4 py-3">
              <button type="button" onClick={() => setSelectedCustomer(null)} className="btn-light px-4 py-2 text-xs">
                {t.close}
              </button>
            </footer>
          </div>
        </div>
      )}

      <BillDetailsModal
        isOpen={isDetailsOpen}
        bill={inspectedBill}
        settings={settings}
        onPrintThermal={() => {
          setIsDetailsOpen(false);
          setPrintBill(inspectedBill);
          setIsPrintModalOpen(true);
        }}
        onPrintA4={() => {
          setIsDetailsOpen(false);
          setPrintBill(inspectedBill);
          setIsPrintModalOpen(true);
        }}
        onClose={() => {
          setIsDetailsOpen(false);
          setInspectedBill(null);
        }}
      />

      <PrintModal
        isOpen={isPrintModalOpen}
        bill={printBill}
        settings={settings}
        onClose={() => {
          setIsPrintModalOpen(false);
          setPrintBill(null);
        }}
      />
    </div>
  );
};
