import React, { useEffect, useState } from 'react';
import { ArrowLeft, FileText, Printer, Receipt, X } from 'lucide-react';
import type { Bill, BusinessSettings } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { A4Invoice } from './A4Invoice';
import { ThermalBill } from './ThermalBill';

interface PrintModalProps { isOpen: boolean; bill: Bill | null; settings: BusinessSettings; onClose: () => void; }
type PrintFormat = 'village' | 'A4' | 'A5' | '80mm';

export const PrintModal: React.FC<PrintModalProps> = ({ isOpen, bill, settings, onClose }) => {
  const { t } = useSettings();
  const [format, setFormat] = useState<PrintFormat>(bill?.billFormat === 'traditional' ? 'village' : settings.defaultPrintFormat === 'A4' ? 'A4' : '80mm');
  useEffect(() => {
    if (isOpen) setFormat(bill?.billFormat === 'traditional' ? 'village' : settings.defaultPrintFormat === 'A4' ? 'A4' : '80mm');
  }, [isOpen, bill?.billNumber, bill?.billFormat, settings.defaultPrintFormat]);
  useEffect(() => { if (!isOpen) return; const onKeyDown = (event: KeyboardEvent) => { if (event.ctrlKey && event.key.toLowerCase() === 'p') { event.preventDefault(); window.print(); } else if (event.key === 'Escape') onClose(); }; window.addEventListener('keydown', onKeyDown); return () => window.removeEventListener('keydown', onKeyDown); }, [isOpen, onClose]);
  if (!isOpen || !bill) return null;
  const formats: { id: PrintFormat; label: string; icon?: React.ReactNode }[] = [{ id: 'village', label: t.villageFormat }, { id: 'A4', label: t.a4Standard, icon: <FileText size={14} /> }, { id: 'A5', label: t.a5Compact, icon: <FileText size={14} /> }, { id: '80mm', label: t.thermal80mm, icon: <Receipt size={14} /> }];
  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-primary-900/95 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={t.printInvoice}>
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-primary-700 bg-primary-900 px-4 py-3 text-white shadow-soft print:hidden"><div className="flex items-center gap-3"><button type="button" onClick={onClose} className="btn-light px-3 py-2 text-xs"><ArrowLeft size={15} aria-hidden="true" />{t.backToBilling}</button><div><div className="flex items-center gap-2"><span className="text-sm font-semibold">{t.printInvoice}</span><span className="rounded-full bg-primary-100 px-2.5 py-0.5 font-mono text-xs font-bold text-primary-900">{bill.billNumber}</span></div><p className="hidden text-[11px] text-primary-100 sm:block">{t.traditionalBill} · {t.pressCtrlP}</p></div></div><div className="flex flex-wrap items-center gap-1 rounded-2xl border border-primary-700 bg-primary-800 p-1" role="group" aria-label={t.invoiceType}>{formats.map(({ id, label, icon }) => <button key={id} type="button" onClick={() => setFormat(id)} aria-pressed={format === id} className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${format === id ? 'bg-primary-100 text-primary-900' : 'text-primary-100 hover:bg-primary-700'}`}>{icon}{label}</button>)}</div><div className="flex items-center gap-2"><button type="button" onClick={() => window.print()} className="btn-secondary px-5 py-2.5 text-sm"><Printer size={17} aria-hidden="true" />{t.printBill}</button><button type="button" onClick={onClose} className="rounded-xl p-2 text-primary-100 hover:bg-primary-700 hover:text-white" aria-label={t.close} title={t.close}><X size={19} aria-hidden="true" /></button></div></div>
      <div className="flex flex-1 items-start justify-center p-4 print:p-0 print:bg-white md:p-8"><div className="max-w-full overflow-x-auto rounded-2xl bg-white p-2 shadow-soft-lg print:rounded-none print:p-0 print:shadow-none">{format === '80mm' ? <div className="print-area-thermal"><ThermalBill bill={bill} settings={settings} /></div> : <div className={format === 'A5' ? 'print-area-a5' : 'print-area-a4'}><A4Invoice bill={bill} settings={settings} isA5={format === 'A5'} isTraditional={format === 'village'} /></div>}</div></div>
    </div>
  );
};
