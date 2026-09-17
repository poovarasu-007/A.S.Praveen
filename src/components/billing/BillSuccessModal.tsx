import React from 'react';
import type { Bill } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { CheckCircle2, Printer, PlusCircle, X, Sparkles, Wheat } from 'lucide-react';

interface BillSuccessModalProps {
  isOpen: boolean;
  bill: Bill | null;
  onPrint: () => void;
  onNewBill: () => void;
  onClose: () => void;
}

export const BillSuccessModal: React.FC<BillSuccessModalProps> = ({
  isOpen,
  bill,
  onPrint,
  onNewBill,
  onClose,
}) => {
  if (!isOpen || !bill) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-emerald-500 animate-in zoom-in-95 duration-200">
        {/* Header with vibrant lush gradient */}
        <div className="bg-gradient-to-br from-agri-900 via-emerald-800 to-agri-800 p-6 text-white text-center relative border-b-2 border-agri-gold">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 bg-gradient-to-br from-agri-gold to-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg text-agri-950 text-3xl font-black">
            🌾
          </div>

          <h3 className="text-xl font-black tracking-tight text-white flex items-center justify-center space-x-1.5">
            <span>✓ Bill Saved Successfully</span>
          </h3>
          <p className="text-xs text-emerald-200 mt-1 font-medium">
            Saved permanently in local IndexedDB storage
          </p>
        </div>

        {/* Bill Summary */}
        <div className="p-6 space-y-4 bg-gradient-to-b from-emerald-50/50 to-white">
          <div className="bg-white border-2 border-emerald-300 rounded-3xl p-4 text-center space-y-2.5 shadow-md">
            <div>
              <span className="text-xs text-emerald-900 font-black uppercase tracking-wider block">
                Bill Number
              </span>
              <div className="text-xl font-black font-mono text-agri-900 tracking-wider mt-0.5">
                {bill.billNumber}
              </div>
            </div>

            <div className="border-t-2 border-emerald-100 pt-2.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-2 rounded-2xl">
              <span className="text-xs text-emerald-900 font-black uppercase tracking-wider block">
                Grand Total
              </span>
              <div className="text-3xl font-black text-emerald-800 font-mono">
                {formatCurrency(bill.grandTotal)}
              </div>
            </div>

            <div className="text-xs text-gray-700 font-medium">
              Customer: <span className="font-bold text-gray-950">{bill.customer.name}</span>
              {bill.customer.mobile && <span className="font-mono text-emerald-800 font-bold"> ({bill.customer.mobile})</span>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <button
              onClick={onPrint}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-base shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-[0.98] ring-2 ring-emerald-400"
            >
              <Printer className="w-5 h-5 text-amber-300" />
              <span>Print Bill Now (80mm / A4)</span>
            </button>

            <button
              onClick={onNewBill}
              className="w-full py-3 px-4 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-sm flex items-center justify-center space-x-2 transition-all active:scale-[0.98] border border-amber-300"
            >
              <PlusCircle className="w-4 h-4 text-amber-800" />
              <span>Create Another Bill (F2)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
