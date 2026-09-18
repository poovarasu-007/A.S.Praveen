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

  const isCredit = bill.paymentMethod === 'Credit';
  const paymentStatus = isCredit
    ? 'PENDING'
    : bill.amountReceived && bill.amountReceived < bill.grandTotal
    ? 'PARTIAL'
    : 'PAID';

  return (
    <div
      className="thermal-bill font-mono text-[12px] leading-tight text-black bg-white p-3 mx-auto w-[80mm] max-w-[80mm] border border-dashed border-gray-300 shadow-sm print:border-none print:p-0 print:shadow-none print:w-[80mm] select-text"
      style={{ fontFamily: "'Courier New', Courier, monospace" }}
    >
      {/* Auspicious Village Agriculture Invocation */}
      <div className="text-center font-bold text-[10px] pb-1 text-black">
        🌾 || ஸ்ரீ ராமஜெயம் || உழவே தலை || 🌾
      </div>

      {/* Header */}
      <div className="text-center pb-2">
        <div className="text-base">🌱 🌾 🌱</div>
        <h1 className="text-[16px] font-black tracking-tight uppercase">
          {settings.businessName || 'A.S. PRAVEEN TRADERS'}
        </h1>
        <p className="text-[11px] font-bold uppercase">{settings.tagline || 'Agricultural Products & Farm Inputs'} • உழவர் மையம்</p>
        <p className="text-[10px] mt-0.5">NO : 2428, SATHYA NAGAR MAIN ST, THANIPADI, TIRUVANNAMALAI - 606708</p>
        <p className="text-[11px] font-bold mt-1">GSTIN: {settings.gstin || '33HQYPP5735G1Z3'}</p>
        <p className="text-[10px] font-bold">
          Mob: {settings.mobile1 || '8825633575'} / {settings.mobile2 || '9443990403'}
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
          <span className="font-bold">Status: {paymentStatus}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span>Payment: {bill.paymentMethod}</span>
          <span>GST: {bill.gstMode}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black my-1.5" />

      {/* Customer / Farmer Info */}
      <div className="text-[11px] space-y-0.5">
        <div className="font-bold">
          விவசாயி / Cust: <span className="uppercase">{bill.customer.name}</span>
        </div>
        {bill.customer.mobile && <div>அலைபேசி / Mob: {bill.customer.mobile}</div>}
        {bill.customer.address && <div>கிராமம் / Village: {bill.customer.address}</div>}
        {bill.customer.crop && <div>பயிர் / Crop: {bill.customer.crop}</div>}
        {bill.customer.landArea && <div>நிலப் பரப்பு: {bill.customer.landArea}</div>}
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
                <div className="font-bold">{item.productName}</div>
                <div className="text-[9px] text-gray-700">
                  GST {item.gstRate}% {item.unit && `(${item.unit})`}
                </div>
              </td>
              <td className="text-center py-1 px-1 whitespace-nowrap font-bold">{item.quantity}</td>
              <td className="text-right py-1 px-1 whitespace-nowrap">{item.rate.toFixed(2)}</td>
              <td className="text-right py-1 pl-1 font-black whitespace-nowrap">{item.totalAmount.toFixed(2)}</td>
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

        <div className="flex justify-between text-[14px] font-black">
          <span>TOTAL AMOUNT:</span>
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
        Rupees {numberToWords(bill.grandTotal)}
      </div>

      <div className="border-t border-dashed border-black my-2" />

      {/* Traditional Village Footer message */}
      <div className="text-center text-[10px] space-y-1">
        <p className="font-bold">🌾 உழவர் செழிக்க நாடு செழிக்கும்! 🌾</p>
        <p className="text-[9px] uppercase font-bold">A.S. Praveen Traders • உழவர் மையம்</p>
        <p className="text-[9px] italic">விவசாயம் காப்போம்! நன்றி, மீண்டும் வருக!</p>
        <div className="pt-2 flex justify-between text-[8px] border-t border-dotted border-gray-400 mt-2">
          <span>விவசாயி கையொப்பம்</span>
          <span>உரிமையாளர் கையொப்பம்</span>
        </div>
        <p className="text-[8px] text-gray-500 pt-1">Operator: {bill.createdBy}</p>
      </div>
    </div>
  );
};

