import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/currency';
import { formatDate, formatTime } from '../../utils/date';
import { formatNumber, formatUnit } from '../../utils/i18n';
import { ProductModal } from './ProductModal';
import { ConfirmModal } from '../common/ConfirmModal';
import type { Product, ProductCategory, UnitType } from '../../types';
import {
  Boxes,
  Plus,
  Search,
  Edit2,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

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
  'Other',
];

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
    catalogSubtitle: 'Quality seeds, fertilizers, crop care and modern farm equipment',
    operatorMode: 'Operator mode: only an administrator can edit prices',
    searchPlaceholder: 'Search products by name, category, or HSN code...',
    items: 'items',
    serialNo: 'S.No.',
    productName: 'Product name',
    deleteTitle: 'Delete product',
    deleteHeading: 'Delete agricultural product',
    deleteWarning: 'Permanently delete “{name}” from Product Master?',
    deleteDetails: 'Existing historical bills will retain their original price and product-name snapshots.',
  },
  ta: {
    catalogSubtitle: 'தரமான விதைகள், உரங்கள், பயிர் பாதுகாப்பு மற்றும் நவீன வேளாண் உபகரணங்கள்',
    operatorMode: 'ஆபரேட்டர் முறை: விலையை நிர்வாகி மட்டுமே திருத்தலாம்',
    searchPlaceholder: 'பெயர், வகை அல்லது HSN குறியீடு மூலம் பொருட்களைத் தேடுங்கள்...',
    items: 'பொருட்கள்',
    serialNo: 'வரிசை எண்',
    productName: 'பொருளின் பெயர்',
    deleteTitle: 'பொருளை நீக்கு',
    deleteHeading: 'வேளாண் பொருளை நீக்கு',
    deleteWarning: '“{name}” என்ற பொருளை பொருட்கள் பட்டியலிலிருந்து நிரந்தரமாக நீக்க விரும்புகிறீர்களா?',
    deleteDetails: 'ஏற்கனவே உள்ள வரலாற்றுப் பில்களில் அசல் விலை மற்றும் பொருள் பெயர் விவரங்கள் தக்கவைக்கப்படும்.',
  },
} as const;

export const ProductMaster: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { language, t } = useSettings();
  const copy = COPY[language];
  const products = useLiveQuery(() => db.products.toArray(), []) || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProductCategory>('All');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const categoryLabel = (category: 'All' | ProductCategory): string =>
    category === 'All' ? t.catAll : t[CATEGORY_LABEL_KEYS[category]];
  const unitLabel = (unit: UnitType): string => UNIT_LABELS[language][unit];

  const filteredProducts = products.filter((product) => {
    const query = searchTerm.toLowerCase();
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(query) ||
      (product.hsnCode && product.hsnCode.includes(searchTerm)) ||
      product.category.toLowerCase().includes(query) ||
      categoryLabel(product.category).toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (data: Partial<Product>) => {
    const auditTimestamp = new Date();
    const now = auditTimestamp.toISOString();

    if (editingProduct) {
      const oldPrice = editingProduct.price;
      const newPrice = data.price || oldPrice;

      await db.products.update(editingProduct.id, {
        ...data,
        updatedAt: now,
      });

      await db.auditLogs.add({
        id: `audit_${Date.now()}`,
        timestamp: now,
        date: formatDate(auditTimestamp, language),
        time: formatTime(auditTimestamp, language),
        user: currentUser?.username || 'admin',
        role: 'ADMIN',
        action: oldPrice !== newPrice ? 'Changed product price' : 'Updated product details',
        recordType: 'PRODUCT',
        recordId: editingProduct.id,
        details:
          oldPrice !== newPrice
            ? `Changed ${editingProduct.name} price: ${formatCurrency(oldPrice, language)} → ${formatCurrency(newPrice, language)}`
            : `Updated ${editingProduct.name}`,
      });

      setFeedbackMsg(`${t.productUpdatedMsg} ${data.name || editingProduct.name}`);
    } else {
      const newId = `prod_${Date.now()}`;
      await db.products.add({
        ...(data as Product),
        id: newId,
        createdAt: now,
        updatedAt: now,
      });

      await db.auditLogs.add({
        id: `audit_${Date.now()}`,
        timestamp: now,
        date: formatDate(auditTimestamp, language),
        time: formatTime(auditTimestamp, language),
        user: currentUser?.username || 'admin',
        role: 'ADMIN',
        action: 'Created new product',
        recordType: 'PRODUCT',
        recordId: newId,
        details: `Created product ${data.name} @ ${formatCurrency(data.price, language)} (${data.category})`,
      });

      setFeedbackMsg(`${t.productAddedMsg} ${data.name || ''}`.trim());
    }

    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;

    const auditTimestamp = new Date();
    await db.products.delete(deletingProduct.id);

    await db.auditLogs.add({
      id: `audit_${Date.now()}`,
      timestamp: auditTimestamp.toISOString(),
      date: formatDate(auditTimestamp, language),
      time: formatTime(auditTimestamp, language),
      user: currentUser?.username || 'admin',
      role: 'ADMIN',
      action: 'Deleted product',
      recordType: 'PRODUCT',
      recordId: deletingProduct.id,
      details: `Deleted product ${deletingProduct.name} (${deletingProduct.category})`,
    });

    setIsDeleteModalOpen(false);
    setDeletingProduct(null);
    setFeedbackMsg(`${t.productDeletedMsg} ${deletingProduct.name}`);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-8">
      <section
        className="card-glass relative overflow-hidden border-primary-200 bg-gradient-to-br from-primary-50 via-surface to-secondary-50 p-5"
        aria-labelledby="product-master-title"
      >
        <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-primary-100/60 blur-2xl" aria-hidden="true" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary-200 bg-white text-secondary-700 shadow-soft-sm">
              <Boxes size={23} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="product-master-title" className="section-title text-xl font-semibold sm:text-2xl">
                  {t.products}
                </h2>
                <span className="badge-arch">
                  {formatNumber(products.length, language)} {copy.items}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-text-secondary sm:text-sm">{copy.catalogSubtitle}</p>
            </div>
          </div>

          {isAdmin ? (
            <button type="button" onClick={handleOpenAdd} className="btn-primary px-4 py-2.5 text-xs">
              <Plus size={16} aria-hidden="true" />
              <span>{t.addProductTitle}</span>
            </button>
          ) : (
            <div className="flex max-w-md items-center gap-2 rounded-xl border border-warning/30 bg-warning-bg px-3 py-2 text-xs font-medium text-warning" role="status">
              <ShieldAlert size={16} className="shrink-0" aria-hidden="true" />
              <span>{copy.operatorMode}</span>
            </div>
          )}
        </div>
      </section>

      {feedbackMsg && (
        <div className="toast toast-success static relative w-full" role="status" aria-live="polite">
          <CheckCircle2 size={17} className="shrink-0 text-success" aria-hidden="true" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      <section className="card-glass space-y-3 p-4" aria-label={t.search}>
        <div className="relative">
          <Search size={19} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-700" aria-hidden="true" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={copy.searchPlaceholder}
            className="input-arch pl-11"
            aria-label={t.searchProductPlaceholder}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1" role="group" aria-label={t.productCategory}>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              aria-pressed={selectedCategory === category}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedCategory === category
                  ? 'border-primary-900 bg-primary-900 text-white'
                  : 'border-primary-100 bg-white text-text-secondary hover:border-primary-300 hover:bg-primary-50'
              }`}
            >
              {categoryLabel(category)}
            </button>
          ))}
        </div>
      </section>

      <section className="card-glass overflow-hidden" aria-label={t.products}>
        <div className="overflow-x-auto">
          <table className="table-arch min-w-[980px]">
            <caption className="sr-only">{t.products}</caption>
            <thead>
              <tr>
                <th scope="col" className="w-12 text-center">{copy.serialNo}</th>
                <th scope="col">{copy.productName}</th>
                <th scope="col" className="hidden md:table-cell">{t.productCategory}</th>
                <th scope="col" className="w-20 text-center">{t.unit}</th>
                <th scope="col" className="w-36 text-right">{t.fixedRate}</th>
                <th scope="col" className="w-24 text-center">{t.gstRate}</th>
                <th scope="col" className="hidden w-24 text-center lg:table-cell">HSN</th>
                <th scope="col" className="w-28 text-center">{t.status}</th>
                <th scope="col" className="w-28 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <Boxes size={30} className="mx-auto mb-2 text-secondary-700" aria-hidden="true" />
                    <p className="text-sm font-semibold text-text-secondary">{t.noProducts}</p>
                    <p className="mt-1 text-xs text-text-tertiary">{t.adminAddProducts}</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, index) => (
                  <tr key={product.id}>
                    <td className="text-center font-semibold text-text-tertiary">{formatNumber(index + 1, language)}</td>
                    <td>
                      <div className="font-semibold text-primary-900">{product.name}</div>
                      {product.stockQuantity !== undefined && (
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-text-tertiary">
                          <span>
                            {t.stockLeft}: {formatNumber(product.stockQuantity, language)} {unitLabel(product.unit)}
                          </span>
                          {product.minStockAlert && product.stockQuantity <= product.minStockAlert && (
                            <span className="inline-flex items-center gap-1 font-semibold text-warning">
                              <AlertTriangle size={12} aria-hidden="true" />
                              {t.lowStock}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="hidden md:table-cell">
                      <span className="badge-arch">{categoryLabel(product.category)}</span>
                    </td>
                    <td className="text-center text-xs font-semibold text-text-secondary">{unitLabel(product.unit)}</td>
                    <td className="text-right font-mono text-sm font-semibold text-primary-900">
                      {formatCurrency(product.price, language)}
                    </td>
                    <td className="text-center">
                      <span className="badge-warning">{formatNumber(product.gstRate, language)}%</span>
                    </td>
                    <td className="hidden text-center font-mono text-xs text-text-secondary lg:table-cell">
                      {product.hsnCode || '—'}
                    </td>
                    <td className="text-center">
                      {product.active ? (
                        <span className="badge-success">
                          <CheckCircle2 size={12} aria-hidden="true" />
                          {t.active}
                        </span>
                      ) : (
                        <span className="badge-arch">
                          <XCircle size={12} aria-hidden="true" />
                          {t.disabled}
                        </span>
                      )}
                    </td>
                    <td className="text-center">
                      {isAdmin ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(product)}
                            className="btn-light p-2 text-secondary-700"
                            title={t.editProductTitle}
                            aria-label={`${t.editProductTitle}: ${product.name}`}
                          >
                            <Edit2 size={15} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeletingProduct(product);
                              setIsDeleteModalOpen(true);
                            }}
                            className="btn-light p-2 text-error hover:text-red-800"
                            title={copy.deleteTitle}
                            aria-label={`${copy.deleteTitle}: ${product.name}`}
                          >
                            <Trash2 size={15} aria-hidden="true" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs italic text-text-tertiary">{t.viewOnly}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <ProductModal
        isOpen={isModalOpen}
        product={editingProduct}
        onSave={handleSaveProduct}
        onClose={() => setIsModalOpen(false)}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title={copy.deleteHeading}
        warningText={copy.deleteWarning.replace('{name}', deletingProduct?.name || '')}
        detailsText={copy.deleteDetails}
        confirmLabel={t.delete}
        confirmButtonColor="red"
        onConfirm={handleDeleteProduct}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeletingProduct(null);
        }}
      />
    </div>
  );
};
