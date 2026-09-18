import React from 'react';
import type { Bill, BusinessSettings } from '../../types';
import { formatCurrency, numberToWords } from '../../utils/currency';
import { formatDate, formatTime } from '../../utils/date';

interface A4InvoiceProps {
  bill: Bill;
  settings: BusinessSettings;
  billNumber?: string;
  isA5?: boolean;
  isTraditional?: boolean;
}

export const A4Invoice: React.FC<A4InvoiceProps> = ({ bill, settings, billNumber, isA5, isTraditional }) => {
  const displayBillNumber = billNumber || bill.billNumber;
  const isTraditionalFormat = isTraditional ?? (bill.billFormat !== 'standard');

  // Determine Payment Status
  const isCredit = bill.paymentMethod === 'Credit';
  const paymentStatus = isCredit
    ? 'PENDING'
    : bill.amountReceived && bill.amountReceived < bill.grandTotal
    ? 'PARTIAL'
    : 'PAID';

  return (
    <div
      className={`a4-invoice bg-white text-gray-900 mx-auto shadow-lg border-2 border-agri-900/40 print:border-none print:shadow-none print:m-0 print:p-4 select-text font-sans text-xs relative overflow-hidden ${
        isA5
          ? 'w-[148mm] min-h-[210mm] p-4 text-[10px]'
          : 'w-[210mm] min-h-[297mm] p-8 text-xs'
      }`}
    >
      {/* Subtle Agricultural Bullock Ploughing Background Watermark */}
      <div
        className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: "url('/images/farmer_bullock_ploughing.jpg')" }}
      />

      {/* Auspicious Village Agriculture Invocation */}
      <div className="text-center font-serif text-[11px] font-black text-amber-900 tracking-wider mb-1">
        🌾 || Sri Chennammal Thunai || 🌾
      </div>

      {/* 1. Centered Agricultural Business Header */}
      <div className="border-b-2 border-agri-800 pb-3 mb-3 text-center relative z-10">
        <div className="flex items-center justify-center space-x-2 mb-0.5">
          <span className="text-xl md:text-2xl">🌱</span>
          <h1 className="text-xl md:text-2xl font-black text-agri-900 tracking-tight font-serif uppercase">
            {settings.businessName || 'A.S. PRAVEEN TRADERS'}
          </h1>
          <span className="text-xl md:text-2xl">🌾</span>
        </div>
        <p className="text-xs font-bold text-agri-700 tracking-wide uppercase">
          {settings.tagline || 'Agricultural Products & Farm Inputs'} • உழவர் சேவை மையம்
        </p>
        <p className="text-[11px] text-gray-800 mt-1 font-medium leading-tight max-w-xl mx-auto">
          {settings.completeAddress || 'NO : 2428, SATHYA NAGAR MAIN STREET, Thanipadi, Tiruvannamalai District, Tamil Nadu - 606708'}
        </p>
        <div className="mt-1.5 flex flex-wrap justify-center gap-x-5 text-[11px] font-bold text-gray-900">
          <span>GSTIN: <strong className="text-agri-950 font-mono">{settings.gstin || '33HQYPP5735G1Z3'}</strong></span>
          <span>தொடர்புக்கு / Phone: <strong className="text-agri-950 font-mono">{settings.mobile1 || '8825633575'} / {settings.mobile2 || '9443990403'}</strong></span>
        </div>

        {/* 2. Invoice / Bill Title Bar */}
        <div className="mt-3 pt-2 border-t border-gray-200 flex items-center justify-between">
          <div className="inline-block bg-agri-800 text-white font-black px-4 py-1 rounded uppercase tracking-wider text-xs shadow-sm">
            {isTraditionalFormat ? 'விவசாயி விற்பனை ரசீது (FARMER INVOICE)' : 'INVOICE / BILL'}
          </div>
          <div className="text-[11px] space-y-0.5 text-right font-medium">
            <div>
              <span className="text-gray-500">Bill No / ரசீது எண்:</span>{' '}
              <strong className="font-mono text-xs text-agri-950 font-black">{displayBillNumber}</strong>
            </div>
            <div>
              <span className="text-gray-500">Date / தேதி:</span>{' '}
              <strong className="text-gray-900">{formatDate(bill.date)}</strong>
            </div>
            <div>
              <span className="text-gray-500">Time / நேரம்:</span>{' '}
              <strong className="text-gray-900 font-mono">{formatTime(bill.time)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Customer & Payment Details Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3 border-2 border-agri-800/40 rounded-lg p-3 bg-agri-50/30 relative z-10">
        <div>
          <div className="text-[10px] font-black uppercase text-agri-800 tracking-wider mb-1 flex items-center space-x-1">
            <span>👨‍🌾</span>
            <span>{isTraditionalFormat ? 'விவசாயி விவரம் (Farmer Details):' : 'Customer Details:'}</span>
          </div>
          <div className="text-sm font-bold text-gray-950 uppercase">
            {bill.customer.name}
          </div>
          {bill.customer.mobile && (
            <div className="text-[11px] text-gray-700 mt-0.5">
              <span className="text-gray-500">அலைபேசி (Mobile):</span> <strong className="font-mono">{bill.customer.mobile}</strong>
            </div>
          )}
          {bill.customer.address && (
            <div className="text-[11px] text-gray-700 mt-0.5">
              <span className="text-gray-500">கிராமம் / ஊர் (Village):</span> <strong className="text-agri-950">{bill.customer.address}</strong>
            </div>
          )}
          {bill.customer.crop && (
            <div className="text-[11px] text-gray-700 mt-0.5">
              <span className="text-gray-500">சாகுபடி பயிர் (Crop):</span> <strong className="text-emerald-800">{bill.customer.crop}</strong>
            </div>
          )}
          {bill.customer.landArea && (
            <div className="text-[11px] text-gray-700 mt-0.5">
              <span className="text-gray-500">நிலப் பரப்பு (Land Area):</span> <strong>{bill.customer.landArea}</strong>
            </div>
          )}
          {bill.customer.gstin && (
            <div className="text-[11px] text-gray-700 mt-0.5">
              <span className="text-gray-500">GSTIN / ID:</span> <strong className="font-mono">{bill.customer.gstin}</strong>
            </div>
          )}
        </div>

        <div className="text-right flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-agri-800 tracking-wider">
              செலுத்தும் முறை (Payment Method):
            </span>
            <div className="mt-1 flex items-center justify-end space-x-2 text-[11px]">
              <span className="text-gray-500">Method:</span>
              <span className="font-bold bg-agri-100 text-agri-900 px-2 py-0.5 rounded border border-agri-300">
                {bill.paymentMethod}
              </span>
              <span
                className={`font-black px-2 py-0.5 rounded text-[10px] ${
                  paymentStatus === 'PAID'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : paymentStatus === 'PENDING'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {paymentStatus}
              </span>
            </div>
            {bill.amountReceived !== undefined && bill.amountReceived > 0 && (
              <div className="mt-1 text-[11px] text-gray-600 font-mono">
                <span>Received: {formatCurrency(bill.amountReceived)} | Balance: {formatCurrency(bill.balance || 0)}</span>
              </div>
            )}
          </div>
          <div className="text-[10px] text-gray-500">
            பில் பதிவு செய்தவர்: <span className="font-semibold text-gray-800">{bill.createdBy}</span>
          </div>
        </div>
      </div>

      {/* 4. Product Table */}
      <table className="w-full border-collapse border border-gray-300 mb-3 text-[11px]">
        <thead>
          <tr className="bg-agri-800 text-white font-bold">
            <th className="border border-agri-700 p-1.5 text-center w-8">S.No</th>
            <th className="border border-agri-700 p-1.5 text-left">Product / Agricultural Item</th>
            <th className="border border-agri-700 p-1.5 text-center w-16">HSN/SAC</th>
            <th className="border border-agri-700 p-1.5 text-center w-12">Qty</th>
            <th className="border border-agri-700 p-1.5 text-center w-12">Unit</th>
            <th className="border border-agri-700 p-1.5 text-right w-16">Rate (₹)</th>
            <th className="border border-agri-700 p-1.5 text-center w-14">Tax %</th>
            <th className="border border-agri-700 p-1.5 text-right w-20">Amount (₹)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {bill.items.map((item, index) => (
            <tr key={item.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-agri-50/20'}>
              <td className="border border-gray-300 p-1.5 text-center font-medium text-gray-600">{index + 1}</td>
              <td className="border border-gray-300 p-1.5">
                <div className="font-bold text-gray-950">{item.productName}</div>
              </td>
              <td className="border border-gray-300 p-1.5 text-center font-mono text-gray-600">
                1209
              </td>
              <td className="border border-gray-300 p-1.5 text-center font-bold text-gray-900">{item.quantity}</td>
              <td className="border border-gray-300 p-1.5 text-center text-gray-700">{item.unit}</td>
              <td className="border border-gray-300 p-1.5 text-right font-mono">{item.rate.toFixed(2)}</td>
              <td className="border border-gray-300 p-1.5 text-center text-gray-700">{item.gstRate}%</td>
              <td className="border border-gray-300 p-1.5 text-right font-bold text-gray-950 font-mono">
                {item.totalAmount.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 5. Total Calculation Section */}
      <div className="grid grid-cols-12 gap-3 items-start mb-4">
        {/* Left: Amount in Words & Terms / UPI QR Area */}
        <div className="col-span-7 space-y-2.5">
          <div className="border border-gray-300 rounded-lg p-2.5 bg-gray-50">
            <div className="text-[10px] font-black text-gray-600 uppercase tracking-wider">
              Amount in Words:
            </div>
            <div className="text-xs font-black text-agri-950 font-serif italic mt-0.5">
              Rupees {numberToWords(bill.grandTotal)}
            </div>
          </div>

          {/* UPI QR Code placeholder if UPI selected */}
          {bill.paymentMethod === 'UPI' && (
            <div className="border border-blue-200 rounded-lg p-2 bg-blue-50/50 flex items-center space-x-3">
              <div className="w-14 h-14 bg-white border border-blue-300 rounded-lg flex items-center justify-center text-2xl shadow-inner shrink-0">
                📱
              </div>
              <div className="text-[10px] text-blue-900">
                <div className="font-bold">Scan & Pay via UPI</div>
                <div className="text-gray-600">GPay / PhonePe / Paytm / BHIM</div>
                <div className="font-mono font-bold text-agri-800">8825633575@upi</div>
              </div>
            </div>
          )}

          <div className="border border-gray-200 rounded-lg p-2.5 text-[10px] text-gray-600 space-y-0.5">
            <div className="font-bold text-gray-700 uppercase tracking-wider text-[9px]">
              Terms & Conditions:
            </div>
            <p>1. Quality seeds & agro-inputs sold with manufacturer batch verification.</p>
            <p>2. Goods once sold will not be accepted back without original tax bill.</p>
            <p>3. Subject to Tiruvannamalai jurisdiction.</p>
          </div>
        </div>

        {/* Right: Tax Breakdown & Grand Total */}
        <div className="col-span-5 border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-3 py-1.5 border-b border-gray-300 font-bold text-gray-800 text-[11px] flex justify-between">
            <span>Subtotal (Taxable):</span>
            <span className="font-mono">{formatCurrency(bill.subtotal)}</span>
          </div>

          <div className="p-2 space-y-1 bg-white text-[11px]">
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

          <div className="bg-agri-800 text-white px-3 py-2 flex justify-between items-center text-xs font-bold">
            <span className="uppercase tracking-wider">TOTAL AMOUNT:</span>
            <span className="text-sm font-mono text-agri-gold font-black">
              {formatCurrency(bill.grandTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Footer & Signatures */}
      <div className="pt-4 border-t-2 border-agri-800/40 grid grid-cols-2 gap-4 items-end relative z-10">
        <div>
          <p className="text-[11px] font-bold text-agri-950 font-serif">
            "🌾 உழவர் செழிக்க நாடு செழிக்கும் • நன்றி, மீண்டும் வருக! 🌾"
          </p>
          <p className="text-[10px] font-bold text-agri-800 uppercase mt-0.5">
            A.S. Praveen Traders • உழவர் சேவை மையம்
          </p>
          <div className="h-10 flex items-end">
            <span className="border-t border-gray-400 pt-0.5 text-[10px] text-gray-700 font-bold px-3">
              விவசாயி கையொப்பம் (Farmer's Signature)
            </span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[11px] font-bold text-gray-900 uppercase">
            For A.S. PRAVEEN TRADERS
          </p>
          <div className="h-10 flex items-end justify-end">
            <span className="border-t border-gray-400 pt-0.5 text-[10px] text-gray-700 font-bold px-3">
              உரிமையாளர் / அங்கீகரிக்கப்பட்ட கையொப்பம் (Authorized Signature)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

