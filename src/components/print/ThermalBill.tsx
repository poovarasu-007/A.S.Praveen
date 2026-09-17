import React from 'react';
import type { Bill, BusinessSettings } from '../../types';
import { formatCurrency, numberToWords } from '../../utils/currency';
import { formatDate, formatTime } from '../../utils/date';

interface ThermalBillProps {
  bill: Bill;
  settings: BusinessSettings;
  billNumber?: string;
}

export const ThermalBill: React.FC<ThermalBillProps> = ({ bill, settings, billNumber }) => {
  const displayBillNumber = billNumber || bill.billNumber;
  return (
    <div
      className="thermal-bill font-mono text-[12px] leading-tight text-black bg-white p-3 mx-auto w-[80mm] max-w-[80mm] border border-dashed border-gray-300 shadow-sm print:border-none print:p-0 print:shadow-none print:w-[80mm] select-text"
      style={{ fontFamily: "'Courier New', Courier, monospace" }}
    >
      {/* Header */}
      <div className="text-center pb-2">
        <h1 className="text-[16px] font-bold tracking-tight uppercase">
          {settings.businessName}
        </h1>
        <p className="text-[11px] font-semibold">{settings.tagline}</p>
        <p className="text-[10px] mt-0.5">{settings.completeAddress}</p>
        <p className="text-[11px] font-bold mt-1">GSTIN: {settings.gstin}</p>
        <p className="text-[10px]">
          Mob: {settings.mobile1} | {settings.mobile2}
        </p>
      </div>

      <div className="border-t border-dashed border-black my-1.5" />

      {/* Bill Metadata */}
      <div className="text-[11px] space-y-0.5">
        <div className="flex justify-between font-bold">
          <span>Bill No: {displayBillNumber}</span>
          <span>{formatDate(bill.date)}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span>Time: {formatTime(bill.time)}</span>
          <span className="font-semibold">Mode: {bill.paymentMethod}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black my-1.5" />

      {/* Customer Info */}
      <div className="text-[11px]">
        <div className="font-bold">
          Customer: <span className="uppercase">{bill.customer.name}</span>
        </div>
        {bill.customer.mobile && <div>Mob: {bill.customer.mobile}</div>}
        {bill.customer.address && <div>Addr: {bill.customer.address}</div>}
        {bill.customer.gstin && <div>GSTIN: {bill.customer.gstin}</div>}
      </div>

      <div className="border-t border-dashed border-black my-1.5" />

      {/* Items Table */}
      <table className="w-full text-left text-[11px]">
        <thead>
          <tr className="border-b border-dashed border-black font-bold">
            <th className="py-1">Item</th>
            <th className="text-center py-1">Qty</th>
            <th className="text-right py-1">Rate</th>
            <th className="text-right py-1">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dotted divide-gray-300">
          {bill.items.map((item, idx) => (
            <tr key={idx} className="align-top">
              <td className="py-1 pr-1">
                <div className="font-semibold">{item.productName}</div>
                <div className="text-[9px] text-gray-700">
                  GST {item.gstRate}% {item.unit && `(${item.unit})`}
                </div>
              </td>
              <td className="text-center py-1 px-1 whitespace-nowrap">{item.quantity}</td>
              <td className="text-right py-1 px-1 whitespace-nowrap">{item.rate.toFixed(2)}</td>
              <td className="text-right py-1 pl-1 font-bold whitespace-nowrap">{item.totalAmount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t border-dashed border-black my-1.5" />

      {/* Totals */}
      <div className="space-y-0.5 text-[11px]">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(bill.subtotal)}</span>
        </div>
        {bill.gstMode === 'CGST_SGST' && (
          <>
            <div className="flex justify-between text-[10px]">
              <span>CGST:</span>
              <span>{formatCurrency(bill.cgst)}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span>SGST:</span>
              <span>{formatCurrency(bill.sgst)}</span>
            </div>
          </>
        )}
        {bill.gstMode === 'IGST' && (
          <div className="flex justify-between text-[10px]">
            <span>IGST:</span>
            <span>{formatCurrency(bill.igst)}</span>
          </div>
        )}
        {bill.roundOff !== 0 && (
          <div className="flex justify-between text-[10px]">
            <span>Round Off:</span>
            <span>{formatCurrency(bill.roundOff)}</span>
          </div>
        )}
        
        <div className="border-t border-dashed border-black my-1" />

        <div className="flex justify-between text-[14px] font-bold">
          <span>GRAND TOTAL:</span>
          <span>{formatCurrency(bill.grandTotal)}</span>
        </div>

        {bill.amountReceived !== undefined && bill.amountReceived > 0 && (
          <div className="pt-1 text-[10px] space-y-0.5">
            <div className="flex justify-between">
              <span>Amount Received:</span>
              <span>{formatCurrency(bill.amountReceived)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Change / Balance:</span>
              <span>{formatCurrency(bill.balance || 0)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-black my-1.5" />

      {/* Words */}
      <div className="text-[10px] italic leading-tight">
        {numberToWords(bill.grandTotal)}
      </div>

      <div className="border-t border-dashed border-black my-2" />

      {/* Footer message */}
      <div className="text-center text-[10px] space-y-1">
        <p className="font-semibold">{settings.invoiceFooterMessage || 'Thank you for your business!'}</p>
        <p className="text-[9px]">Operator: {bill.createdBy}</p>
        <p className="text-[8px] text-gray-500">*** Software by Antigravity ***</p>
      </div>
    </div>
  );
};
