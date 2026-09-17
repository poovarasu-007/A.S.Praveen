import React from 'react';
import type { Bill, BusinessSettings } from '../../types';
import { formatCurrency, numberToWords } from '../../utils/currency';
import { formatDate, formatTime } from '../../utils/date';

interface A4InvoiceProps {
  bill: Bill;
  settings: BusinessSettings;
  billNumber?: string;
}

export const A4Invoice: React.FC<A4InvoiceProps> = ({ bill, settings, billNumber }) => {
  const displayBillNumber = billNumber || bill.billNumber;
  return (
    <div className="a4-invoice bg-white text-gray-900 p-8 mx-auto w-[210mm] min-h-[297mm] shadow-lg border border-gray-200 print:border-none print:shadow-none print:p-6 print:w-[210mm] print:min-h-0 select-text font-sans text-xs">
      {/* Header Banner – centered business info */}
      <div className="border-b-2 border-agri-800 pb-4 mb-4 text-center">
        <div className="flex items-center justify-center space-x-2 mb-1">
          <span className="text-2xl">🌾</span>
          <h1 className="text-2xl font-black text-agri-800 tracking-tight font-serif uppercase">
            {settings.businessName}
          </h1>
          <span className="text-2xl">🌾</span>
        </div>
        <p className="text-xs font-semibold text-agri-700 tracking-wide">
          {settings.tagline}
        </p>
        <p className="text-xs text-gray-700 mt-1 leading-relaxed">
          {settings.completeAddress}
        </p>
        <div className="mt-1.5 flex flex-wrap justify-center gap-x-4 text-xs font-semibold text-gray-800">
          <span>GSTIN: <strong className="text-agri-900">{settings.gstin}</strong></span>
          <span>Mob: <strong className="text-agri-900">{settings.mobile1} | {settings.mobile2}</strong></span>
          {settings.email && <span>Email: {settings.email}</span>}
        </div>

        {/* Invoice title + number row below centered header */}
        <div className="mt-3 flex items-center justify-between">
          <div className="inline-block bg-agri-800 text-white font-bold px-4 py-1.5 rounded uppercase tracking-wider text-sm shadow-sm">
            Tax Invoice
          </div>
          <div className="text-xs space-y-1 text-right">
            <div><span className="text-gray-500">Invoice No:</span> <strong className="font-mono text-sm text-gray-900">{displayBillNumber}</strong></div>
            <div><span className="text-gray-500">Invoice Date:</span> <strong className="text-gray-900">{formatDate(bill.date)}</strong></div>
            <div><span className="text-gray-500">Time:</span> <strong className="text-gray-900">{formatTime(bill.time)}</strong></div>
            <div><span className="text-gray-500">GST Mode:</span> <strong className="text-gray-900">{bill.gstMode}</strong></div>
          </div>
        </div>
      </div>

      {/* Customer & Bill Meta Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-5 border border-gray-300 rounded-lg p-3 bg-agri-50/30">
        <div>
          <div className="text-[11px] font-bold uppercase text-agri-800 tracking-wider mb-1">
            Billed To (Customer Details):
          </div>
          <div className="text-sm font-bold text-gray-900 uppercase">
            {bill.customer.name}
          </div>
          {bill.customer.mobile && (
            <div className="text-xs text-gray-700 mt-0.5">
              <span className="text-gray-500">Mobile:</span> {bill.customer.mobile}
            </div>
          )}
          {bill.customer.address && (
            <div className="text-xs text-gray-700 mt-0.5">
              <span className="text-gray-500">Address:</span> {bill.customer.address}
            </div>
          )}
          {bill.customer.gstin && (
            <div className="text-xs text-gray-700 mt-0.5">
              <span className="text-gray-500">GSTIN:</span> <strong className="font-mono">{bill.customer.gstin}</strong>
            </div>
          )}
        </div>

        <div className="text-right flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-agri-800 tracking-wider">
              Payment Information:
            </span>
            <div className="mt-1 text-xs">
              <span className="text-gray-500">Payment Mode:</span>{' '}
              <span className="font-bold bg-agri-100 text-agri-800 px-2 py-0.5 rounded border border-agri-200">
                {bill.paymentMethod}
              </span>
            </div>
            {bill.amountReceived !== undefined && bill.amountReceived > 0 && (
              <div className="mt-1 text-xs text-gray-600">
                <span>Received: {formatCurrency(bill.amountReceived)} | Balance: {formatCurrency(bill.balance || 0)}</span>
              </div>
            )}
          </div>
          <div className="text-[11px] text-gray-500">
            Billed By: <span className="font-medium text-gray-700">{bill.createdBy}</span>
          </div>
        </div>
      </div>

      {/* Item Table */}
      <table className="w-full border-collapse border border-gray-300 mb-4 text-xs">
        <thead>
          <tr className="bg-agri-700 text-white font-bold">
            <th className="border border-agri-600 p-2 text-center w-10">S.No</th>
            <th className="border border-agri-600 p-2 text-left">Product Description</th>
            <th className="border border-agri-600 p-2 text-center w-16">Unit</th>
            <th className="border border-agri-600 p-2 text-right w-16">Qty</th>
            <th className="border border-agri-600 p-2 text-right w-20">Rate (₹)</th>
            <th className="border border-agri-600 p-2 text-center w-16">GST %</th>
            <th className="border border-agri-600 p-2 text-right w-24">Taxable Value</th>
            <th className="border border-agri-600 p-2 text-right w-24">Total (₹)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {bill.items.map((item, index) => (
            <tr key={item.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
              <td className="border border-gray-300 p-2 text-center font-medium">{index + 1}</td>
              <td className="border border-gray-300 p-2">
                <div className="font-bold text-gray-900">{item.productName}</div>
              </td>
              <td className="border border-gray-300 p-2 text-center text-gray-700">{item.unit}</td>
              <td className="border border-gray-300 p-2 text-right font-semibold">{item.quantity}</td>
              <td className="border border-gray-300 p-2 text-right">{item.rate.toFixed(2)}</td>
              <td className="border border-gray-300 p-2 text-center text-gray-700">{item.gstRate}%</td>
              <td className="border border-gray-300 p-2 text-right font-mono">{item.taxableAmount.toFixed(2)}</td>
              <td className="border border-gray-300 p-2 text-right font-bold text-gray-900 font-mono">
                {item.totalAmount.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary and Calculation Area */}
      <div className="grid grid-cols-12 gap-4 items-start mb-6">
        {/* Left: Amount in words & Bank/Terms */}
        <div className="col-span-7 space-y-3">
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Amount in Words:
            </div>
            <div className="text-sm font-bold text-agri-900 font-serif italic mt-0.5">
              {numberToWords(bill.grandTotal)}
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-3 text-[11px] text-gray-600 space-y-1">
            <div className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
              Terms & Conditions:
            </div>
            <p>1. Goods once sold will not be taken back or exchanged without valid original bill.</p>
            <p>2. Warranty on agricultural sprayers and tools as per manufacturer policy.</p>
            <p>3. Subject to Tiruvannamalai jurisdiction.</p>
          </div>
        </div>

        {/* Right: Tax Breakdown & Grand Total */}
        <div className="col-span-5 border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-3 py-2 border-b border-gray-300 font-bold text-gray-800 text-xs flex justify-between">
            <span>Subtotal (Taxable):</span>
            <span className="font-mono">{formatCurrency(bill.subtotal)}</span>
          </div>

          <div className="p-3 space-y-2 bg-white text-xs">
            {bill.gstMode === 'CGST_SGST' && (
              <>
                <div className="flex justify-between text-gray-700">
                  <span>Central GST (CGST):</span>
                  <span className="font-mono">{formatCurrency(bill.cgst)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>State GST (SGST):</span>
                  <span className="font-mono">{formatCurrency(bill.sgst)}</span>
                </div>
              </>
            )}

            {bill.gstMode === 'IGST' && (
              <div className="flex justify-between text-gray-700">
                <span>Integrated GST (IGST):</span>
                <span className="font-mono">{formatCurrency(bill.igst)}</span>
              </div>
            )}

            {bill.roundOff !== 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Round Off:</span>
                <span className="font-mono">{formatCurrency(bill.roundOff)}</span>
              </div>
            )}
          </div>

          <div className="bg-agri-800 text-white px-3 py-2.5 flex justify-between items-center text-sm font-bold">
            <span className="uppercase tracking-wider">Grand Total:</span>
            <span className="text-base font-mono text-agri-gold font-black">
              {formatCurrency(bill.grandTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Signatures & Footer Note */}
      <div className="pt-8 border-t border-gray-300 grid grid-cols-2 gap-4 items-end">
        <div>
          <p className="text-[11px] font-semibold text-agri-800">
            {settings.invoiceFooterMessage || 'Thank you for doing business with A.S.Praveen Traders'}
          </p>
          <p className="text-[10px] text-gray-500 mt-1">
            Certified that the particulars given above are true and correct.
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs font-bold text-gray-800 uppercase">
            For {settings.businessName}
          </p>
          <div className="h-14 flex items-end justify-end">
            <span className="border-t border-gray-400 pt-1 text-[11px] text-gray-600 font-medium px-4">
              Authorized Signatory
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
