import React from 'react';
import type { Bill, BusinessSettings } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency, numberToWords } from '../../utils/currency';
import { formatDate, formatTime } from '../../utils/date';
import { formatPaymentMethod, formatUnit } from '../../utils/i18n';

interface ThermalBillProps { bill: Bill; settings: BusinessSettings; }

export const ThermalBill: React.FC<ThermalBillProps> = ({ bill, settings }) => {
  const { t, language } = useSettings();
  const money = (value: number | null | undefined) => formatCurrency(value, language);
  const address = settings.completeAddress || [settings.addressLine1, settings.street, settings.city, settings.district, settings.state, settings.pincode].filter(Boolean).join(', ');
  return (
    <article className="thermal-bill mx-auto w-[80mm] max-w-[80mm] select-text border border-dashed border-gray-300 bg-white p-3 font-mono text-[11px] leading-tight text-black shadow-sm print:w-[80mm] print:border-0 print:p-0 print:shadow-none" aria-label={`${t.thermalInvoice} ${bill.billNumber}`}>
      <header className="text-center"><div className="flex items-center justify-center gap-1 text-base font-black uppercase tracking-tight"><span className="text-xl">✦</span>{settings.businessName || t.brandName}</div><p className="mt-0.5 text-[9px] uppercase">{settings.tagline || t.invoiceSubtitle}</p><p className="mt-1 text-[9px]">{address}</p><p className="mt-1 text-[10px] font-bold">GSTIN: {settings.gstin || '—'}</p></header>
      <div className="my-1.5 border-t border-dashed border-black" />
      <div className="flex justify-between text-[10px] font-bold"><span>{t.invoiceNo}: {bill.billNumber}</span><span>{formatDate(bill.date, language)}</span></div><div className="flex justify-between text-[9px]"><span>{t.invoiceTime}: {formatTime(bill.time, language)}</span><span>{formatPaymentMethod(bill.paymentMethod, language)}</span></div>
      <div className="my-1.5 border-t border-dashed border-black" />
      <div className="text-[10px]"><p className="font-bold uppercase">{t.billedTo}</p><p className="font-bold">{bill.customer.name}</p>{bill.customer.mobile && <p>{t.customerMobile}: {bill.customer.mobile}</p>}{bill.customer.address && <p>{t.village}: {bill.customer.address}</p>}{bill.customer.crop && <p>{t.crop}: {bill.customer.crop}</p>}{bill.customer.landArea && <p>{t.landArea}: {bill.customer.landArea}</p>}{bill.customer.gstin && <p>GSTIN: {bill.customer.gstin}</p>}</div>
      <div className="my-1.5 border-t border-dashed border-black" />
      <table className="w-full border-collapse text-[10px]"><thead><tr className="border-b border-dashed border-black font-bold"><th className="py-1 text-left">{t.itemNo}</th><th className="py-1 text-left">{t.itemName || t.productName}</th><th className="py-1 text-right">{t.qty}</th><th className="py-1 text-right">{t.rate}</th><th className="py-1 text-right">{t.amount}</th></tr></thead><tbody>{bill.items.map((item, index) => <tr key={item.id || index} className="align-top"><td className="py-1 pr-1">{index + 1}</td><td className="py-1 pr-1 font-bold">{item.productName}<br /><span className="font-normal">{formatUnit(item.unit, language)} · GST {item.gstRate}%</span></td><td className="py-1 pr-1 text-right">{item.quantity}</td><td className="py-1 pr-1 text-right">{money(item.rate)}</td><td className="py-1 text-right font-bold">{money(item.totalAmount)}</td></tr>)}</tbody></table>
      <div className="my-1.5 border-t border-dashed border-black" />
      <div className="space-y-0.5 text-[10px]"><div className="flex justify-between"><span>{t.subtotal}</span><span>{money(bill.subtotal)}</span></div>{bill.gstMode !== 'EXEMPT' && <>{bill.cgst > 0 && <div className="flex justify-between"><span>{t.cgst}</span><span>{money(bill.cgst)}</span></div>}{bill.sgst > 0 && <div className="flex justify-between"><span>{t.sgst}</span><span>{money(bill.sgst)}</span></div>}{bill.igst > 0 && <div className="flex justify-between"><span>{t.igst}</span><span>{money(bill.igst)}</span></div>}</>}{bill.roundOff !== 0 && <div className="flex justify-between"><span>{t.roundOff}</span><span>{money(bill.roundOff)}</span></div>}<div className="my-1 flex justify-between border-y border-dashed border-black py-1 text-[13px] font-black"><span>{t.totalAmount}</span><span>{money(bill.grandTotal)}</span></div><div className="flex justify-between"><span>{t.received}</span><span>{money(bill.amountReceived)}</span></div><div className="flex justify-between"><span>{t.balanceDue}</span><span>{money(bill.balance || 0)}</span></div></div>
      <div className="my-1.5 border-t border-dashed border-black" /><p className="text-[9px]"><strong>{t.amountInWordsLabel}:</strong> {numberToWords(bill.grandTotal, language)}</p><p className="mt-1 text-center text-[9px] font-bold uppercase">{settings.invoiceFooterMessage || t.invoiceFooter}</p><div className="mt-2 flex justify-between text-[8px] text-gray-600"><span>{settings.mobile1}</span><span>{t.user}: {bill.createdBy}</span></div>
    </article>
  );
};
