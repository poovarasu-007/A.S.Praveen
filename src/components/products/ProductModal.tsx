import React, { useState, useEffect } from 'react';
import type { Product, ProductCategory, UnitType } from '../../types';
import { X, Save, AlertCircle } from 'lucide-react';

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
  'Other'
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
  'set'
];

const GST_RATES = [0, 5, 12, 18, 28];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  product,
  onSave,
  onClose,
}) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Product Name is required.');
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Please enter a valid fixed price greater than 0.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        name: name.trim(),
        category,
        unit,
        price: numPrice,
        gstRate,
        hsnCode: hsnCode.trim() || undefined,
        stockQuantity: stockQuantity ? parseFloat(stockQuantity) : undefined,
        minStockAlert: minStockAlert ? parseFloat(minStockAlert) : undefined,
        active
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-gray-200">
        <div className="bg-agri-800 text-white p-4 flex items-center justify-between">
          <h3 className="font-bold text-base flex items-center space-x-2">
            <span>📦</span>
            <span>{product ? 'Edit Agricultural Product' : 'Add New Agricultural Product'}</span>
          </h3>
          <button onClick={onClose} className="p-1 text-agri-200 hover:text-white rounded-lg hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="bg-rose-50 border-l-4 border-rose-600 p-3 rounded-lg text-rose-800 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Product Name <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Urea (45kg Bag) / Paddy Seeds"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-agri-600 outline-none"
              autoFocus
            />
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Category <span className="text-rose-600">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-agri-600 outline-none bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Unit of Measurement <span className="text-rose-600">*</span>
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitType)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-agri-600 outline-none bg-white"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fixed Price & GST Rate */}
          <div className="grid grid-cols-2 gap-3 bg-agri-50/70 p-3 rounded-xl border border-agri-200">
            <div>
              <label className="block text-xs font-bold text-agri-900 mb-1">
                Fixed Counter Rate (₹) <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm font-mono font-bold border-2 border-agri-600 rounded-xl focus:ring-2 focus:ring-agri-600 outline-none bg-white"
              />
              <span className="text-[10px] text-gray-500 mt-0.5 block">
                Billing operators cannot edit this rate.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-agri-900 mb-1">
                GST Rate (%) <span className="text-rose-600">*</span>
              </label>
              <select
                value={gstRate}
                onChange={(e) => setGstRate(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-agri-600 outline-none bg-white font-bold"
              >
                {GST_RATES.map((rate) => (
                  <option key={rate} value={rate}>
                    {rate}% GST
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-gray-500 mt-0.5 block">
                Seeds: 0%, Fertilizers: 5%, Tools: 12%, etc.
              </span>
            </div>
          </div>

          {/* HSN & Stock Quantity */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                HSN/SAC Code
              </label>
              <input
                type="text"
                value={hsnCode}
                onChange={(e) => setHsnCode(e.target.value)}
                placeholder="e.g. 3102"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-agri-600 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Current Stock Qty
              </label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="100"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-agri-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Min Stock Alert
              </label>
              <input
                type="number"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(e.target.value)}
                placeholder="10"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-agri-600 outline-none"
              />
            </div>
          </div>

          {/* Active / Inactive status */}
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="activeStatus"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 text-agri-700 rounded border-gray-300 focus:ring-agri-600"
            />
            <label htmlFor="activeStatus" className="text-xs font-bold text-gray-700 cursor-pointer">
              Active in Counter Billing (Uncheck to hide from product list)
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-agri-700 hover:bg-agri-800 rounded-xl shadow transition-colors flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4 text-agri-gold" />
              <span>{isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Add Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
