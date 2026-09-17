/**
 * Currency and Number-to-Words utilities for Indian Rupee (INR)
 */

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0.00';
  }
  
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const fixed = absAmount.toFixed(2);
  const [integerPart, decimalPart] = fixed.split('.');

  // Indian numbering system: 3 digits for rightmost group, then groups of 2 digits
  let result = '';
  const len = integerPart.length;

  if (len <= 3) {
    result = integerPart;
  } else {
    const lastThree = integerPart.substring(len - 3);
    const otherNumbers = integerPart.substring(0, len - 3);
    const formattedOthers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    result = `${formattedOthers},${lastThree}`;
  }

  return `${isNegative ? '-' : ''}₹${result}.${decimalPart}`;
}

const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const twoDigits = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tensDigits = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertTwoDigits(num: number): string {
  if (num < 10) return singleDigits[num];
  if (num >= 10 && num < 20) return twoDigits[num - 10];
  const ten = Math.floor(num / 10);
  const single = num % 10;
  return `${tensDigits[ten]}${single > 0 ? ' ' + singleDigits[single] : ''}`.trim();
}

function convertThreeDigits(num: number): string {
  const hundred = Math.floor(num / 100);
  const rest = num % 100;
  let str = '';
  if (hundred > 0) {
    str += `${singleDigits[hundred]} Hundred`;
    if (rest > 0) str += ' ';
  }
  if (rest > 0) {
    str += convertTwoDigits(rest);
  }
  return str.trim();
}

export function numberToWords(amount: number): string {
  if (amount === null || amount === undefined || isNaN(amount) || amount === 0) {
    return 'Rupees Zero Only';
  }

  const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
  const integerPart = Math.floor(Math.abs(rounded));
  const paisa = Math.round((Math.abs(rounded) - integerPart) * 100);

  if (integerPart === 0 && paisa === 0) {
    return 'Rupees Zero Only';
  }

  let words = '';
  let temp = integerPart;

  const crore = Math.floor(temp / 10000000);
  temp %= 10000000;

  const lakh = Math.floor(temp / 100000);
  temp %= 100000;

  const thousand = Math.floor(temp / 1000);
  temp %= 1000;

  const hundreds = temp;

  if (crore > 0) {
    words += `${convertTwoDigits(crore)} Crore `;
  }
  if (lakh > 0) {
    words += `${convertTwoDigits(lakh)} Lakh `;
  }
  if (thousand > 0) {
    words += `${convertTwoDigits(thousand)} Thousand `;
  }
  if (hundreds > 0) {
    words += `${convertThreeDigits(hundreds)} `;
  }

  words = words.trim();
  let result = words.length > 0 ? `Rupees ${words}` : 'Rupees';

  if (paisa > 0) {
    result += ` and ${convertTwoDigits(paisa)} Paise`;
  }

  return `${result} Only`;
}
