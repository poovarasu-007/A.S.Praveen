import React, { useState, useEffect } from 'react';
import type { Product, ProductCategory, UnitType } from '../../types';
import { useSettings } from '../../context/SettingsContext';
import { formatNumber } from '../../utils/i18n';
import { Package, X, Save, AlertCircle } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  product?: Product | null;
  onSave: (productData: Partial<Product>) => Promise<void>;
  onClose: () => void;
}

const CATEGORIES: ProductCategory[] = [
  'Seeds',
  'Fertilizers',
  'Pesticides',
  'Organic Manure',
  'Agricultural Tools',
  'Irrigation Equipment',
  'Plant Growth Products',
  'Crop Protection',
  'Bio-Fertilizers',
  'Farming Accessories',
  'Other',
];

const UNITS: UnitType[] = [
  'kg',
  'gram',
  'quintal',
  'ton',
  'bag',
  'litre',
  'ml',
  'piece',
  'box',
  'packet',
  'bundle',
  'set',
];

const GST_RATES = [0, 5, 12, 18, 28];

const CATEGORY_LABEL_KEYS: Record<ProductCategory, string> = {
  Seeds: 'catSeeds',
  Fertilizers: 'catFertilizers',
  Pesticides: 'catPesticides',
  'Organic Manure': 'catOrganicManure',
  'Agricultural Tools': 'catAgriTools',
  'Irrigation Equipment': 'catIrrigation',
  'Plant Growth Products': 'catPlantGrowth',
  'Crop Protection': 'catCropProtection',
  'Bio-Fertilizers': 'catBioFertilizers',
  'Farming Accessories': 'catFarmingAccessories',
  Other: 'catOther',
};

const UNIT_LABELS = {
  en: {
    kg: 'kg',
    gram: 'gram',
    quintal: 'quintal',
    ton: 'ton',
    bag: 'bag',
    litre: 'litre',
    ml: 'ml',
    piece: 'piece',
    box: 'box',
    packet: 'packet',
    bundle: 'bundle',
    set: 'set',
  },
  ta: {
    kg: 'கிலோ',
    gram: 'கிராம்',
    quintal: 'குவிண்டல்',
    ton: 'டன்',
    bag: 'பை',
    litre: 'லிட்டர்',
    ml: 'மில்லி',
    piece: 'துண்டு',
    box: 'பெட்டி',
    packet: 'பாக்கெட்',
    bundle: 'கட்டு',
    set: 'தொகுதி',
  },
} as const;

const COPY = {
  en: {
    namePlaceholder: 'e.g. Urea (45 kg bag) or paddy seeds',
    hsnPlaceholder: 'e.g. 3102',
    nameRequired: 'Product name is required.',
    invalidPrice: 'Enter a valid fixed price greater than 0.',
    saveFailed: 'Failed to save product.',
    rateLocked: 'Only an administrator can change this rate.',
    gstHint: 'Choose the applicable GST percentage.',
    activeHint: 'Inactive products are hidden from the billing counter.',
  },
  ta: {
    namePlaceholder: 'எ.கா. யூரியா (45 கிலோ பை) அல்லது நெல் விதைகள்',
    hsnPlaceholder: 'எ.கா. 3102',
    nameRequired: 'பொருளின் பெயர் அவசியம்.',
    invalidPrice: '0-ஐ விட பெரிய சரியான நிலையான விலையை உள்ளிடவும்.',
    saveFailed: 'பொருளைச் சேமிக்க முடியவில்லை.',
    rateLocked: 'இந்த விலையை நிர்வாகி மட்டுமே மாற்றலாம்.',
    gstHint: 'பொருந்தும் GST சதவீதத்தைத் தேர்ந்தெடுக்கவும்.',
    activeHint: 'செயலிழக்கப்பட்ட பொருட்கள் பில்லிங் கவுண்டரில் தெரியாது.',
  },
} as const;

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  product,
  onSave,
  onClose,
}) => {
  const { language, t } = useSettings();
  const copy = COPY[language];
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Seeds');
  const [unit, setUnit] = useState<UnitType>('kg');
  const [price, setPrice] = useState<string>('');
  const [gstRate, setGstRate] = useState<number>(0);
  const [hsnCode, setHsnCode] = useState('');
  const [stockQuantity, setStockQuantity] = useState<string>('');
  const [minStockAlert, setMinStockAlert] = useState<string>('');
  const [active, setActive] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setUnit(product.unit);
      setPrice(String(product.price));
      setGstRate(product.gstRate);
      setHsnCode(product.hsnCode || '');
      setStockQuantity(product.stockQuantity !== undefined ? String(product.stockQuantity) : '');
      setMinStockAlert(product.minStockAlert !== undefined ? String(product.minStockAlert) : '');
      setActive(product.active);
    } else {
      setName('');
      setCategory('Seeds');
      setUnit('kg');
      setPrice('');
      setGstRate(0);
      setHsnCode('');
      setStockQuantity('100');
      setMinStockAlert('10');
      setActive(true);
    }
    setError('');
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!name.trim()) {
      setError(copy.nameRequired);
      return;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setError(copy.invalidPrice);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        name: name.trim(),
        category,
        unit,
        price: numericPrice,
        gstRate,
        hsnCode: hsnCode.trim() || undefined,
        stockQuantity: stockQuantity ? parseFloat(stockQuantity) : undefined,
        minStockAlert: minStockAlert ? parseFloat(minStockAlert) : undefined,
        active,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || copy.saveFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in p-3 md:p-4" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-primary-200 bg-white shadow-soft-lg">
        <header className="flex items-center justify-between border-b border-primary-100 bg-primary-50 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary-200 bg-white text-secondary-700">
              <Package size={20} aria-hidden="true" />
            </div>
            <h2 id="product-modal-title" className="truncate text-base font-semibold text-primary-900">
              {product ? t.editProductTitle : t.addProductTitle}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost p-2" aria-label={t.close} title={t.close}>
            <X size={19} aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto p-5" aria-busy={isSubmitting}>
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-error/30 bg-error-bg p-3 text-xs font-semibold text-error" role="alert">
              <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="product-name" className="label-arch">
              {t.productName} <span className="text-error">*</span>
            </label>
            <input
              id="product-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={copy.namePlaceholder}
              className="input-arch"
              autoFocus
              aria-required="true"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="product-category" className="label-arch">
                {t.productCategory} <span className="text-error">*</span>
              </label>
              <select
                id="product-category"
                value={category}
                onChange={(event) => setCategory(event.target.value as ProductCategory)}
                className="input-arch"
                aria-required="true"
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {t[CATEGORY_LABEL_KEYS[item]]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="product-unit" className="label-arch">
                {t.unitType} <span className="text-error">*</span>
              </label>
              <select
                id="product-unit"
                value={unit}
                onChange={(event) => setUnit(event.target.value as UnitType)}
                className="input-arch"
                aria-required="true"
              >
                {UNITS.map((item) => (
                  <option key={item} value={item}>
                    {UNIT_LABELS[language][item]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 rounded-xl border border-primary-100 bg-primary-50/70 p-3 sm:grid-cols-2">
            <div>
              <label htmlFor="product-price" className="label-arch">
                {t.sellingPrice} <span className="text-error">*</span>
              </label>
              <input
                id="product-price"
                type="number"
                step="0.01"
                min="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="0.00"
                className="input-arch font-mono font-semibold"
                aria-describedby="product-price-hint"
                aria-required="true"
              />
              <span id="product-price-hint" className="mt-1 block text-[10px] text-text-tertiary">
                {copy.rateLocked}
              </span>
            </div>

            <div>
              <label htmlFor="product-gst" className="label-arch">
                {t.gstRate} <span className="text-error">*</span>
              </label>
              <select
                id="product-gst"
                value={gstRate}
                onChange={(event) => setGstRate(Number(event.target.value))}
                className="input-arch font-semibold"
                aria-describedby="product-gst-hint"
                aria-required="true"
              >
                {GST_RATES.map((rate) => (
                  <option key={rate} value={rate}>
                    {formatNumber(rate, language)}% GST
                  </option>
                ))}
              </select>
              <span id="product-gst-hint" className="mt-1 block text-[10px] text-text-tertiary">
                {copy.gstHint}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="product-hsn" className="label-arch">{t.hsnCode}</label>
              <input
                id="product-hsn"
                type="text"
                value={hsnCode}
                onChange={(event) => setHsnCode(event.target.value)}
                placeholder={copy.hsnPlaceholder}
                className="input-arch font-mono"
              />
            </div>

            <div>
              <label htmlFor="product-stock" className="label-arch">{t.stockQuantity}</label>
              <input
                id="product-stock"
                type="number"
                value={stockQuantity}
                onChange={(event) => setStockQuantity(event.target.value)}
                placeholder="100"
                className="input-arch"
              />
            </div>

            <div>
              <label htmlFor="product-min-stock" className="label-arch">{t.minStockAlert}</label>
              <input
                id="product-min-stock"
                type="number"
                value={minStockAlert}
                onChange={(event) => setMinStockAlert(event.target.value)}
                placeholder="10"
                className="input-arch"
              />
            </div>
          </div>

          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="activeStatus"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-primary-300"
              aria-describedby="active-status-hint"
            />
            <div>
              <label htmlFor="activeStatus" className="cursor-pointer text-xs font-semibold text-text-secondary">
                {t.activeStatus}
              </label>
              <p id="active-status-hint" className="mt-0.5 text-[10px] text-text-tertiary">{copy.activeHint}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-primary-100 pt-4">
            <button type="button" onClick={onClose} className="btn-light px-4 py-2 text-xs">
              {t.cancel}
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary px-5 py-2 text-xs">
              <Save size={15} aria-hidden="true" />
              <span>{isSubmitting ? t.saving : product ? t.save : t.addProductTitle}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
