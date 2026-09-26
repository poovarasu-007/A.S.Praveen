import React, { useEffect, useRef, useState } from 'react';
import { Check, PackageOpen, Search, Sprout, X } from 'lucide-react';
import type { Product, ProductCategory } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { formatUnit } from '../../utils/i18n';
import { useSettings } from '../../context/SettingsContext';

interface ProductSelectorModalProps {
  isOpen: boolean;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onClose: () => void;
}

const CATEGORIES: ('All' | ProductCategory)[] = ['All', 'Seeds', 'Fertilizers', 'Pesticides', 'Organic Manure', 'Agricultural Tools', 'Irrigation Equipment', 'Plant Growth Products', 'Crop Protection', 'Bio-Fertilizers', 'Farming Accessories', 'Other'];

export const ProductSelectorModal: React.FC<ProductSelectorModalProps> = ({ isOpen, products, onSelectProduct, onClose }) => {
  const { t, language } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProductCategory>('All');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm(''); setSelectedCategory('All'); setSelectedIndex(0);
      const timer = window.setTimeout(() => searchInputRef.current?.focus(), 50);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen]);

  const activeProducts = products.filter((product) => product.active);
  const filtered = activeProducts.filter((product) => {
    const query = searchTerm.trim().toLowerCase();
    return (selectedCategory === 'All' || product.category === selectedCategory) && (!query || product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query) || Boolean(product.hsnCode?.includes(query)));
  });

  const categoryLabel = (category: 'All' | ProductCategory): string => {
    const labels: Record<string, string> = {
      All: t.catAll, Seeds: t.catSeeds, Fertilizers: t.catFertilizers, Pesticides: t.catPesticides,
      'Organic Manure': t.catOrganicManure, 'Agricultural Tools': t.catAgriTools, 'Irrigation Equipment': t.catIrrigation,
      'Plant Growth Products': t.catPlantGrowth, 'Crop Protection': t.catCropProtection, 'Bio-Fertilizers': t.catBioFertilizers,
      'Farming Accessories': t.catFarmingAccessories, Other: t.catOther,
    };
    return labels[category] || category;
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setSelectedIndex((index) => Math.min(index + 1, Math.max(filtered.length - 1, 0))); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setSelectedIndex((index) => Math.max(index - 1, 0)); }
    else if (event.key === 'Enter') { event.preventDefault(); if (filtered[selectedIndex]) onSelectProduct(filtered[selectedIndex]); }
    else if (event.key === 'Escape') onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="product-selector-title">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-primary-200 bg-white shadow-soft-lg" onKeyDown={handleKeyDown}>
        <header className="flex items-center justify-between border-b border-primary-100 bg-primary-900 p-4 text-white">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-primary-900"><Sprout size={21} aria-hidden="true" /></div><div><h2 id="product-selector-title" className="text-base font-semibold">{t.selectProduct}</h2><p className="text-xs text-primary-100">{t.fixedPriceLocked}</p></div></div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-primary-100 hover:bg-white/10 hover:text-white" aria-label={t.close}><X size={19} aria-hidden="true" /></button>
        </header>
        <div className="space-y-3 border-b border-primary-100 bg-primary-50 p-4">
          <div className="relative"><Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary-700" aria-hidden="true" /><input ref={searchInputRef} type="search" value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setSelectedIndex(0); }} placeholder={t.searchProductPlaceholder} className="input-arch pl-10" aria-label={t.search} /></div>
          <div className="flex gap-1.5 overflow-x-auto pb-1" role="group" aria-label={t.productCategory}>{CATEGORIES.map((category) => <button key={category} type="button" onClick={() => { setSelectedCategory(category); setSelectedIndex(0); }} aria-pressed={selectedCategory === category} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${selectedCategory === category ? 'border-primary-900 bg-primary-900 text-white' : 'border-primary-100 bg-white text-text-secondary hover:bg-primary-100'}`}>{categoryLabel(category)}</button>)}</div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {filtered.length === 0 ? <div className="flex flex-col items-center justify-center gap-2 py-14 text-center"><PackageOpen size={32} className="text-secondary-700" aria-hidden="true" /><p className="text-sm font-semibold text-primary-900">{t.noActiveProducts}</p><p className="text-xs text-text-tertiary">{t.adminCanConfigure}</p></div> : <div className="overflow-x-auto"><table className="table-arch"><thead><tr><th>{t.productName}</th><th className="hidden sm:table-cell">{t.productCategory}</th><th className="text-center">{t.unit}</th><th className="text-right">{t.fixedRate}</th><th className="text-center">{t.gstRate}</th><th className="text-center">{t.action}</th></tr></thead><tbody>{filtered.map((product, index) => <tr key={product.id} onClick={() => onSelectProduct(product)} onKeyDown={(event) => { if (event.key === 'Enter') onSelectProduct(product); }} tabIndex={0} className={`cursor-pointer ${index === selectedIndex ? 'bg-primary-50' : ''}`}><td><div className="font-semibold text-primary-900">{product.name}</div>{product.hsnCode && <div className="font-mono text-[11px] text-text-tertiary">HSN: {product.hsnCode}</div>}</td><td className="hidden sm:table-cell"><span className="badge-arch">{categoryLabel(product.category)}</span></td><td className="text-center"><span className="badge-arch">{formatUnit(product.unit, language)}</span></td><td className="text-right font-mono font-semibold text-primary-900">{formatCurrency(product.price, language)}</td><td className="text-center"><span className="badge-info">{product.gstRate}%</span></td><td className="text-center"><button type="button" onClick={(event) => { event.stopPropagation(); onSelectProduct(product); }} className="btn-primary px-3 py-1.5 text-xs"><Check size={13} aria-hidden="true" />{t.confirm}</button></td></tr>)}</tbody></table></div>}
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-primary-100 bg-primary-50 px-4 py-3 text-xs text-text-secondary"><span>{filtered.length} {t.products.toLowerCase()}</span><div className="flex items-center gap-3"><span className="hidden sm:inline text-secondary-700">{t.pressEnterSelect}</span><button type="button" onClick={onClose} className="btn-light px-4 py-2 text-xs">{t.cancel}</button></div></footer>
      </div>
    </div>
  );
};
