import type { Bill } from '../types';
import { formatDate, formatTime } from './date';

/**
 * Exports detailed sales line items to standard CSV format
 */
export function exportBillsToCSV(bills: Bill[], filename = 'praveen-traders-sales.csv') {
  const headers = [
    'Bill Number',
    'Date',
    'Time',
    'Customer Name',
    'Customer Mobile',
    'Customer Address',
    'Customer GSTIN',
    'Product Name',
    'Unit',
    'Fixed Rate (INR)',
    'Quantity',
    'GST Rate (%)',
    'Taxable Value (INR)',
    'GST Tax (INR)',
    'Item Total (INR)',
    'Bill Subtotal (INR)',
    'Bill Grand Total (INR)',
    'Payment Method',
    'Billed By'
  ];

  const rows: string[][] = [];

  bills.forEach((bill) => {
    bill.items.forEach((item) => {
      rows.push([
        `"${bill.billNumber}"`,
        `"${formatDate(bill.date)}"`,
        `"${formatTime(bill.time)}"`,
        `"${(bill.customer.name || '').replace(/"/g, '""')}"`,
        `"${bill.customer.mobile || ''}"`,
        `"${(bill.customer.address || '').replace(/"/g, '""')}"`,
        `"${bill.customer.gstin || ''}"`,
        `"${item.productName.replace(/"/g, '""')}"`,
        `"${item.unit}"`,
        item.rate.toFixed(2),
        item.quantity.toString(),
        `${item.gstRate}%`,
        item.taxableAmount.toFixed(2),
        item.gstAmount.toFixed(2),
        item.totalAmount.toFixed(2),
        bill.subtotal.toFixed(2),
        bill.grandTotal.toFixed(2),
        `"${bill.paymentMethod}"`,
        `"${bill.createdBy}"`
      ]);
    });
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
