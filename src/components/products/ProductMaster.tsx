import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/currency';
import { formatDate, formatTime } from '../../utils/date';
import { ProductModal } from './ProductModal';
import { ConfirmModal } from '../common/ConfirmModal';
import type { Product, ProductCategory } from '../../types';
import {
  Boxes,
  Plus,
  Search,
  Edit2,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle
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
  'Other'
];

export const ProductMaster: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const products = useLiveQuery(() => db.products.toArray(), []) || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProductCategory>('All');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.hsnCode && p.hsnCode.includes(searchTerm)) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (data: Partial<Product>) => {
    const now = new Date().toISOString();

    if (editingProduct) {
      const oldPrice = editingProduct.price;
      const newPrice = data.price || oldPrice;

      await db.products.update(editingProduct.id, {
        ...data,
        updatedAt: now
      });

      // If price was modified, record dedicated price change audit log
      if (oldPrice !== newPrice) {
        await db.auditLogs.add({
          id: `audit_${Date.now()}`,
          timestamp: now,
          date: formatDate(new Date()),
          time: formatTime(new Date()),
          user: currentUser?.username || 'admin',
          role: 'ADMIN',
          action: 'Changed product price',
          recordType: 'PRODUCT',
          recordId: editingProduct.id,
          details: `Changed ${editingProduct.name} price: ₹${oldPrice.toFixed(2)} → ₹${newPrice.toFixed(2)}`
        });
      } else {
        await db.auditLogs.add({
          id: `audit_${Date.now()}`,
          timestamp: now,
          date: formatDate(new Date()),
          time: formatTime(new Date()),
          user: currentUser?.username || 'admin',
          role: 'ADMIN',
          action: 'Updated product details',
          recordType: 'PRODUCT',
          recordId: editingProduct.id,
          details: `Updated ${editingProduct.name}`
        });
      }

      setFeedbackMsg(`Product "${data.name}" updated successfully.`);
    } else {
      const newId = `prod_${Date.now()}`;
      await db.products.add({
        ...(data as Product),
        id: newId,
        createdAt: now,
        updatedAt: now
      });

      await db.auditLogs.add({
        id: `audit_${Date.now()}`,
        timestamp: now,
        date: formatDate(new Date()),
        time: formatTime(new Date()),
        user: currentUser?.username || 'admin',
        role: 'ADMIN',
        action: 'Created new product',
        recordType: 'PRODUCT',
        recordId: newId,
        details: `Created product ${data.name} @ ₹${data.price} (${data.category})`
      });

      setFeedbackMsg(`New product "${data.name}" added successfully.`);
    }

    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;

    await db.products.delete(deletingProduct.id);

    await db.auditLogs.add({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      date: formatDate(new Date()),
      time: formatTime(new Date()),
      user: currentUser?.username || 'admin',
      role: 'ADMIN',
      action: 'Deleted product',
      recordType: 'PRODUCT',
      recordId: deletingProduct.id,
      details: `Deleted product ${deletingProduct.name} (${deletingProduct.category})`
    });

    setIsDeleteModalOpen(false);
    setDeletingProduct(null);
    setFeedbackMsg(`Product "${deletingProduct.name}" removed from catalog.`);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-8">
      {/* Header Banner with Agricultural Photo */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border-2 border-agri-gold/50 text-white min-h-[110px] p-5 flex flex-wrap items-center justify-between gap-3">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 scale-105"
          style={{ backgroundImage: "url('/images/tractor_spraying_crops.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-agri-950/95 via-emerald-950/90 to-agri-950/95" />

        <div className="relative z-10 flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-agri-gold to-yellow-500 text-agri-950 flex items-center justify-center font-bold text-xl shadow-lg border border-white/40">
            🌾
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <h2 className="text-xl font-black text-white tracking-tight font-serif">
                வேளாண் பொருட்கள் பட்டியல் (PRODUCT MASTER)
              </h2>
              <span className="bg-yellow-400 text-agri-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                {products.length} Items
              </span>
            </div>
            <p className="text-xs text-emerald-200 mt-0.5">
              பாரம்பரிய நாட்டு விதைகள், உரங்கள், பூச்சிக்கொல்லிகள் & நவீன வேளாண் கருவிகள்
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isAdmin ? (
            <button
              onClick={handleOpenAdd}
              className="flex items-center space-x-1.5 px-4 py-2 bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs rounded-xl shadow transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 text-agri-gold" />
              <span>Add New Product</span>
            </button>
          ) : (
            <div className="flex items-center space-x-1 text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Operator Mode: Price editing restricted to Admin</span>
            </div>
          )}
        </div>
      </div>

      {feedbackMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-agri-200 p-4 space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search agricultural products by name, category, or HSN code..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-agri-600 outline-none"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-agri-700 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-agri-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-agri-900 text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3 text-center w-12">S.No</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-3 hidden md:table-cell">Category</th>
                <th className="py-3 px-3 text-center w-20">Unit</th>
                <th className="py-3 px-4 text-right w-32">Fixed Rate (₹)</th>
                <th className="py-3 px-3 text-center w-24">GST %</th>
                <th className="py-3 px-3 text-center w-24 hidden lg:table-cell">HSN</th>
                <th className="py-3 px-3 text-center w-24">Status</th>
                <th className="py-3 px-4 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    <p className="text-sm font-semibold">No products configured.</p>
                    <p className="text-xs mt-1">Admin can add products using the button above.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod, idx) => (
                  <tr key={prod.id} className="hover:bg-agri-50/50 transition-colors">
                    <td className="py-3 px-3 text-center font-semibold text-gray-500">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{prod.name}</div>
                      {prod.stockQuantity !== undefined && (
                        <div className="text-[11px] text-gray-500 flex items-center space-x-1 mt-0.5">
                          <span>Stock: {prod.stockQuantity} {prod.unit}</span>
                          {prod.minStockAlert && prod.stockQuantity <= prod.minStockAlert && (
                            <span className="text-rose-600 font-bold flex items-center space-x-0.5">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Low Stock</span>
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 hidden md:table-cell">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-agri-50 text-agri-800 border border-agri-200 font-medium">
                        {prod.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center text-xs font-semibold text-gray-600">
                      {prod.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-agri-900 text-sm">
                      {formatCurrency(prod.price)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        {prod.gstRate}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-xs text-gray-600 hidden lg:table-cell">
                      {prod.hsnCode || '-'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {prod.active ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          <XCircle className="w-3 h-3" />
                          <span>Disabled</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isAdmin ? (
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => handleOpenEdit(prod)}
                            className="p-1.5 rounded-lg text-agri-700 hover:text-agri-900 hover:bg-agri-100 transition-colors"
                            title="Edit Price & Details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingProduct(prod);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">View Only</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        product={editingProduct}
        onSave={handleSaveProduct}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Agricultural Product"
        warningText={`Are you sure you want to permanently delete "${deletingProduct?.name}" from Product Master?`}
        detailsText="Note: Any existing historical bills will retain their original price and product name snapshot."
        confirmLabel="Delete Product"
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
