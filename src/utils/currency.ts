/**
 * Currency and number-to-words utilities for Indian Rupee (INR).
 * Formatting is delegated to Intl so the active English/Tamil locale is
 * respected without changing stored numeric values.
 */
import { formatCurrency as formatLocalizedCurrency, type LanguageCode } from './i18n';

export function formatCurrency(amount: number | null | undefined, language: LanguageCode = 'en'): string {
  return formatLocalizedCurrency(amount, language);
}

const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const twoDigits = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tensDigits = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const tamilSingles = ['', 'ஒன்று', 'இரண்டு', 'மூன்று', 'நான்கு', 'ஐந்து', 'ஆறு', 'ஏழு', 'எட்டு', 'ஒன்பது'];
const tamilTeens = ['பத்து', 'பதினொன்று', 'பன்னிரண்டு', 'பதின்மூன்று', 'பதினான்கு', 'பதினைந்து', 'பதினாறு', 'பதினேழு', 'பதினெட்டு', 'பதினொன்பது'];
const tamilTens = ['', '', 'இருபது', 'முப்பது', 'நாற்பது', 'ஐம்பது', 'அறுபது', 'எழுபது', 'எண்பது', 'தொண்பது'];

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

function convertTwoDigitsTamil(num: number): string {
  if (num < 10) return tamilSingles[num];
  if (num < 20) return tamilTeens[num - 10];
  const ten = Math.floor(num / 10);
  const single = num % 10;
  return `${tamilTens[ten]}${single > 0 ? ` ${tamilSingles[single]}` : ''}`;
}

function convertThreeDigitsTamil(num: number): string {
  const hundred = Math.floor(num / 100);
  const rest = num % 100;
  let str = '';
  if (hundred > 0) {
    str += 'நூற்று';
    if (rest > 0) str += ' ';
  }
  if (rest > 0) str += convertTwoDigitsTamil(rest);
  return str.trim();
}

export function numberToWords(amount: number, language: LanguageCode = 'en'): string {
  const rupeeWord = language === 'ta' ? 'ரூபாய்' : 'Rupees';
  const zeroWord = language === 'ta' ? 'பூஜ்யம்' : 'Zero';
  const onlyWord = language === 'ta' ? 'மட்டும்' : 'Only';
  const paisaWord = language === 'ta' ? 'பைசா' : 'Paise';
  const tamil = language === 'ta';
  const convertTwo = tamil ? convertTwoDigitsTamil : convertTwoDigits;
  const convertThree = tamil ? convertThreeDigitsTamil : convertThreeDigits;
  if (amount === null || amount === undefined || isNaN(amount) || amount === 0) {
    return `${rupeeWord} ${zeroWord} ${onlyWord}`;
  }

  const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
  const integerPart = Math.floor(Math.abs(rounded));
  const paisa = Math.round((Math.abs(rounded) - integerPart) * 100);

  if (integerPart === 0 && paisa === 0) {
    return `${rupeeWord} ${zeroWord} ${onlyWord}`;
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
    words += `${convertTwo(crore)} ${tamil ? 'கோடி' : 'Crore'} `;
  }
  if (lakh > 0) {
    words += `${convertTwo(lakh)} ${tamil ? 'இலட்சம்' : 'Lakh'} `;
  }
  if (thousand > 0) {
    words += `${convertTwo(thousand)} ${tamil ? 'ஆயிரம்' : 'Thousand'} `;
  }
  if (hundreds > 0) {
    words += `${convertThree(hundreds)} `;
  }

  words = words.trim();
  let result = words.length > 0 ? `${rupeeWord} ${words}` : rupeeWord;

  if (paisa > 0) {
    result += ` ${tamil ? 'மற்றும்' : 'and'} ${convertTwo(paisa)} ${paisaWord}`;
  }

  return `${result} ${onlyWord}`;
}
