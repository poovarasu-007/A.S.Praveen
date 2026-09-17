import React, { useState, useEffect, useRef } from 'react';
import type { Product, ProductCategory } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { Search, X, Check, PackageOpen, Sprout } from 'lucide-react';

interface ProductSelectorModalProps {
  isOpen: boolean;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onClose: () => void;
}

const CATEGORIES: ('All' | ProductCategory)[] = [
  'All',
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

export const ProductSelectorModal: React.FC<ProductSelectorModalProps> = ({
  isOpen,
  products,
  onSelectProduct,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProductCategory>('All');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedIndex(0);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const activeProducts = products.filter(p => p.active);

  const filtered = activeProducts.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.hsnCode && p.hsnCode.includes(searchTerm));
    return matchesCategory && matchesSearch;
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filtered.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        onSelectProduct(filtered[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Seeds':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Fertilizers':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Pesticides':
      case 'Crop Protection':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'Organic Manure':
      case 'Bio-Fertilizers':
        return 'bg-lime-100 text-lime-900 border-lime-300';
      case 'Agricultural Tools':
        return 'bg-orange-100 text-orange-900 border-orange-300';
      case 'Irrigation Equipment':
        return 'bg-cyan-100 text-cyan-900 border-cyan-300';
      case 'Plant Growth Products':
        return 'bg-teal-100 text-teal-900 border-teal-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[90vh] overflow-hidden border-2 border-emerald-600/50"
        onKeyDown={handleKeyDown}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-agri-900 via-emerald-800 to-agri-800 text-white p-4 flex items-center justify-between border-b-2 border-agri-gold/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 bg-agri-gold rounded-2xl flex items-center justify-center text-xl shadow-md text-agri-950 font-black">
              🌾
            </div>
            <div>
              <h3 className="font-black text-base text-white tracking-tight">Select Agricultural Product</h3>
              <p className="text-xs text-emerald-200 font-medium">
                Locked counter prices applied directly from Product Master
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input & Category Filters */}
        <div className="p-4 border-b border-emerald-100 space-y-3 bg-gradient-to-r from-emerald-50/70 via-[#F7F4E9]/60 to-amber-50/60">
          <div className="relative">
            <Search className="w-5 h-5 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Search product by name, category, or HSN code (Press ↑ ↓ to navigate, Enter to select)..."
              className="w-full pl-11 pr-4 py-3 bg-white border-2 border-emerald-300 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600 outline-none shadow-sm text-gray-900"
            />
          </div>

          {/* Categories Pill Bar */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedIndex(0);
                }}
                className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all shadow-sm ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-agri-700 to-emerald-800 text-white ring-2 ring-agri-gold shadow-md'
                    : 'bg-white text-gray-700 border border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products List Table */}
        <div className="flex-1 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-sm font-semibold">No active products found matching "{searchTerm}"</p>
              <p className="text-xs text-gray-400 mt-1">Admin can configure products in Product Master</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead className="sticky top-0 bg-agri-950 text-agri-gold text-xs uppercase tracking-wider border-b border-agri-800">
                <tr>
                  <th className="py-2.5 px-3 text-white">Product Name</th>
                  <th className="py-2.5 px-3 hidden sm:table-cell text-white">Category</th>
                  <th className="py-2.5 px-3 text-center text-white">Unit</th>
                  <th className="py-2.5 px-3 text-right text-white">Fixed Rate</th>
                  <th className="py-2.5 px-3 text-center text-white">GST %</th>
                  <th className="py-2.5 px-3 text-center text-white">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100">
                {filtered.map((prod, idx) => {
                  const isHighlighted = idx === selectedIndex;
                  const catBadgeColor = getCategoryColor(prod.category);

                  return (
                    <tr
                      key={prod.id}
                      onClick={() => onSelectProduct(prod)}
                      className={`cursor-pointer transition-colors ${
                        isHighlighted
                          ? 'bg-emerald-100/90 text-emerald-950 font-bold'
                          : 'hover:bg-amber-50/70 text-gray-800'
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-gray-900">{prod.name}</div>
                        {prod.hsnCode && (
                          <div className="text-[11px] text-gray-500 font-mono">HSN: {prod.hsnCode}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 hidden sm:table-cell">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${catBadgeColor}`}>
                          {prod.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-xs font-bold text-emerald-900 bg-emerald-50 rounded-lg">
                        {prod.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-amber-900 font-mono text-sm">
                        {formatCurrency(prod.price)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-orange-100 text-orange-900 border border-orange-300">
                          {prod.gstRate}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProduct(prod);
                          }}
                          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-agri-700 hover:from-emerald-700 hover:to-agri-800 text-white text-xs font-black shadow transition-all active:scale-90"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-amber-50 border-t border-emerald-200 flex items-center justify-between text-xs text-gray-600">
          <div>
            Showing <strong className="text-agri-950">{filtered.length}</strong> agricultural products
          </div>
          <div className="flex items-center space-x-2">
            <span className="hidden sm:inline text-emerald-800 font-semibold">Press Enter or click Select</span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold transition-colors shadow-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
