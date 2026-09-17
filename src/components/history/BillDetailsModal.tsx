import React from 'react';
import type { Bill, BusinessSettings } from '../../types';
import { formatCurrency, numberToWords } from '../../utils/currency';
import { formatDate, formatTime } from '../../utils/date';
import { X, Printer, Receipt, FileText, Calendar, Clock, User, Phone, MapPin } from 'lucide-react';

interface BillDetailsModalProps {
  isOpen: boolean;
  bill: Bill | null;
  settings: BusinessSettings;
  onPrintThermal: () => void;
  onPrintA4: () => void;
  onClose: () => void;
}

export const BillDetailsModal: React.FC<BillDetailsModalProps> = ({
  isOpen,
  bill,
  settings,
  onPrintThermal,
  onPrintA4,
  onClose,
}) => {
  if (!isOpen || !bill) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden border border-agri-200">
        {/* Header */}
        <div className="bg-agri-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-agri-gold" />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base">Bill Details</h3>
                <span className="font-mono text-xs bg-agri-gold text-agri-900 px-2 py-0.5 rounded font-bold">
                  {bill.billNumber}
                </span>
              </div>
              <p className="text-[11px] text-agri-200">
                Immutable historical snapshot created on {formatDate(bill.date)} {formatTime(bill.time)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-agri-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Customer & Bill Meta Grid */}
          <div className="bg-agri-50/70 border border-agri-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-agri-800 block mb-1">
                Customer Information:
              </span>
              <div className="font-bold text-sm text-gray-900">{bill.customer.name}</div>
              {bill.customer.mobile && (
                <div className="text-gray-600 flex items-center space-x-1 mt-0.5">
                  <Phone className="w-3 h-3 text-gray-400" />
                  <span>{bill.customer.mobile}</span>
                </div>
              )}
              {bill.customer.address && (
                <div className="text-gray-600 flex items-center space-x-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span>{bill.customer.address}</span>
                </div>
              )}
              {bill.customer.gstin && (
                <div className="text-gray-600 mt-0.5">
                  GSTIN: <strong className="font-mono">{bill.customer.gstin}</strong>
                </div>
              )}
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-agri-800 block mb-1">
                Transaction Meta:
              </span>
              <div className="flex sm:justify-end items-center space-x-1 text-gray-600">
                <Calendar className="w-3 h-3 text-gray-400" />
                <span>Date: <strong>{formatDate(bill.date)}</strong></span>
              </div>
              <div className="flex sm:justify-end items-center space-x-1 text-gray-600">
                <Clock className="w-3 h-3 text-gray-400" />
                <span>Time: <strong>{formatTime(bill.time)}</strong></span>
              </div>
              <div className="text-gray-600">
                Mode: <strong className="text-agri-900 bg-white px-2 py-0.5 rounded border border-gray-200">{bill.paymentMethod}</strong>
              </div>
              <div className="text-gray-500 text-[11px]">
                Billed by: {bill.createdBy}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100 font-bold text-gray-700">
                <tr>
                  <th className="p-2.5 text-center w-8">#</th>
                  <th className="p-2.5">Product</th>
                  <th className="p-2.5 text-center">Unit</th>
                  <th className="p-2.5 text-right">Rate</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-center">GST</th>
                  <th className="p-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bill.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="p-2.5 text-center text-gray-500">{idx + 1}</td>
                    <td className="p-2.5 font-bold text-gray-900">{item.productName}</td>
                    <td className="p-2.5 text-center text-gray-600">{item.unit}</td>
                    <td className="p-2.5 text-right font-mono">{item.rate.toFixed(2)}</td>
                    <td className="p-2.5 text-center font-bold text-gray-800">{item.quantity}</td>
                    <td className="p-2.5 text-center text-amber-800 font-semibold">{item.gstRate}%</td>
                    <td className="p-2.5 text-right font-mono font-bold text-gray-900">
                      {formatCurrency(item.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-xs border border-gray-200">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span className="font-mono font-bold">{formatCurrency(bill.subtotal)}</span>
            </div>
            {bill.cgst > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>CGST:</span>
                <span className="font-mono">{formatCurrency(bill.cgst)}</span>
              </div>
            )}
            {bill.sgst > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>SGST:</span>
                <span className="font-mono">{formatCurrency(bill.sgst)}</span>
              </div>
            )}
            {bill.igst > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>IGST:</span>
                <span className="font-mono">{formatCurrency(bill.igst)}</span>
              </div>
            )}
            {bill.roundOff !== 0 && (
              <div className="flex justify-between text-gray-500">
                <span>Round Off:</span>
                <span className="font-mono">{formatCurrency(bill.roundOff)}</span>
              </div>
            )}
            <div className="border-t border-gray-300 pt-2 flex justify-between items-center text-sm font-black text-agri-900">
              <span>GRAND TOTAL:</span>
              <span className="text-lg font-mono text-agri-800">{formatCurrency(bill.grandTotal)}</span>
            </div>
            <div className="text-[11px] italic text-gray-500 pt-1">
              {numberToWords(bill.grandTotal)}
            </div>
          </div>
        </div>

        {/* Footer Actions: Print / Reprint */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl transition-colors"
          >
            Close
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onPrintThermal}
              className="flex items-center space-x-1.5 px-3 py-2 bg-gray-800 hover:bg-black text-white text-xs font-bold rounded-xl shadow transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print 80mm Thermal</span>
            </button>
            <button
              onClick={onPrintA4}
              className="flex items-center space-x-1.5 px-4 py-2 bg-agri-700 hover:bg-agri-800 text-white text-xs font-bold rounded-xl shadow transition-colors"
            >
              <FileText className="w-4 h-4 text-agri-gold" />
              <span>Print A4 Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
