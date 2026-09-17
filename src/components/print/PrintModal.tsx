import React, { useState, useEffect } from 'react';
import type { Bill, BusinessSettings } from '../../types';
import { ThermalBill } from './ThermalBill';
import { A4Invoice } from './A4Invoice';
import { Printer, X, FileText, Receipt, ArrowLeft, Check } from 'lucide-react';

interface PrintModalProps {
  isOpen: boolean;
  bill: Bill | null;
  settings: BusinessSettings;
  onClose: () => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  bill,
  settings,
  onClose,
}) => {
  const [format, setFormat] = useState<'80mm' | 'A4' | 'A5'>(
    (settings.defaultPrintFormat as any) || 'A4'
  );

  // Keyboard shortcut Ctrl+P while modal is open to trigger window.print
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        window.print();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !bill) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-950/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      {/* Top Toolbar (Hidden during print) */}
      <div className="sticky top-0 z-20 bg-agri-950 text-white px-4 py-3 shadow-xl flex items-center justify-between print:hidden border-b-2 border-agri-gold/40 flex-wrap gap-2">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center space-x-1 text-xs font-bold transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Billing</span>
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-black uppercase text-white">
                🖨️ PRINT BILL / INVOICE
              </span>
              <span className="text-xs bg-agri-gold text-agri-950 px-2.5 py-0.5 rounded-full font-mono font-black shadow-sm">
                {bill.billNumber}
              </span>
            </div>
            <p className="text-[11px] text-emerald-200 hidden sm:block">
              Clean white GST invoice print preview • Press <strong>Ctrl + P</strong> to print
            </p>
          </div>
        </div>

        {/* Paper Format Switcher (80mm, A4, A5) */}
        <div className="flex items-center space-x-1.5 bg-black/50 p-1 rounded-2xl border border-white/20">
          <button
            onClick={() => setFormat('A4')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              format === 'A4'
                ? 'bg-agri-gold text-agri-950 shadow-md scale-[1.02]'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>A4 Full Page</span>
          </button>
          <button
            onClick={() => setFormat('A5')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              format === 'A5'
                ? 'bg-agri-gold text-agri-950 shadow-md scale-[1.02]'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>A5 Compact</span>
          </button>
          <button
            onClick={() => setFormat('80mm')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              format === '80mm'
                ? 'bg-agri-gold text-agri-950 shadow-md scale-[1.02]'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>80mm Thermal</span>
          </button>
        </div>

        {/* Print Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm shadow-xl active:scale-95 transition-all ring-2 ring-emerald-300"
          >
            <Printer className="w-5 h-5 text-amber-200 stroke-[2.5]" />
            <span>PRINT BILL</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            title="Close Preview (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Preview Body Container */}
      <div className="flex-1 p-4 md:p-8 flex justify-center items-start print:p-0 print:m-0 print:bg-white">
        <div className="bg-white rounded-2xl shadow-2xl p-2 print:p-0 print:shadow-none print:rounded-none max-w-full overflow-x-auto">
          {format === '80mm' ? (
            <div className="print-area-thermal">
              <ThermalBill bill={bill} settings={settings} />
            </div>
          ) : (
            <div className={format === 'A5' ? 'print-area-a5' : 'print-area-a4'}>
              <A4Invoice bill={bill} settings={settings} isA5={format === 'A5'} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

