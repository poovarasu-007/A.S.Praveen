import React, { useState } from 'react';
import type { Bill, BusinessSettings } from '../../types';
import { ThermalBill } from './ThermalBill';
import { A4Invoice } from './A4Invoice';
import { Printer, X, FileText, Receipt, ArrowLeft, Hash } from 'lucide-react';

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
  const [format, setFormat] = useState<'80mm' | 'A4'>(settings.defaultPrintFormat || '80mm');
  const [manualBillNumber, setManualBillNumber] = useState<string>('');

  if (!isOpen || !bill) return null;

  // Use manual bill number if entered, otherwise fall back to auto-generated
  const effectiveBillNumber = manualBillNumber.trim() || bill.billNumber;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-900/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      {/* Top Toolbar (Hidden during print) */}
      <div className="sticky top-0 z-20 bg-agri-900 text-white px-4 py-3 shadow-md flex items-center justify-between print:hidden border-b border-white/10 flex-wrap gap-2">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center space-x-1 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Billing</span>
          </button>
          <div>
            <h2 className="text-base font-bold flex items-center space-x-2">
              <span>Print Preview</span>
              <span className="text-xs bg-agri-gold text-agri-900 px-2 py-0.5 rounded font-mono font-bold">
                {effectiveBillNumber}
              </span>
            </h2>
            <p className="text-xs text-agri-200 hidden sm:block">
              Select paper layout and click Print
            </p>
          </div>
        </div>

        {/* Manual Bill Number Input */}
        <div className="flex items-center space-x-2 bg-black/30 border border-white/15 rounded-xl px-3 py-1.5">
          <Hash className="w-3.5 h-3.5 text-agri-gold flex-shrink-0" />
          <label className="text-xs text-agri-200 font-semibold whitespace-nowrap hidden sm:block">
            Bill No:
          </label>
          <input
            type="text"
            value={manualBillNumber}
            onChange={(e) => setManualBillNumber(e.target.value)}
            placeholder={bill.billNumber}
            className="bg-transparent text-white text-xs font-mono w-28 outline-none placeholder:text-gray-500 placeholder:italic"
          />
        </div>

        {/* Paper Format Switcher */}
        <div className="flex items-center space-x-2 bg-black/40 p-1 rounded-xl border border-white/15">
          <button
            onClick={() => setFormat('80mm')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              format === '80mm'
                ? 'bg-agri-gold text-agri-900 shadow'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>80mm Thermal</span>
          </button>
          <button
            onClick={() => setFormat('A4')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              format === 'A4'
                ? 'bg-agri-gold text-agri-900 shadow'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>A4 Invoice</span>
          </button>
        </div>

        {/* Print Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-lg active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
            title="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Preview Body Container */}
      <div className="flex-1 p-4 md:p-8 flex justify-center items-start print:p-0 print:m-0 print:bg-white">
        <div className="bg-white rounded-xl shadow-2xl p-2 print:p-0 print:shadow-none print:rounded-none max-w-full overflow-x-auto">
          {format === '80mm' ? (
            <div className="print-area-thermal">
              <ThermalBill bill={bill} settings={settings} billNumber={effectiveBillNumber} />
            </div>
          ) : (
            <div className="print-area-a4">
              <A4Invoice bill={bill} settings={settings} billNumber={effectiveBillNumber} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
