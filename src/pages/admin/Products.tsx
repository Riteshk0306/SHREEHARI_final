import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { Product } from '../../types';
import { Plus, Edit2, Trash2, Copy, Search, AlertCircle, X, Printer, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getLogoBase64 } from '../../utils/pdfHelper';
import { uploadProductImage } from '../../lib/storage';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const publicUrl = await uploadProductImage(file);
      updateField('images', [publicUrl]);
    } catch (err) {
      console.error('Failed to upload image:', err);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };
  
  const handleDownloadStockList = async () => {
    const doc = new jsPDF();
    
    try {
      const logoData = await getLogoBase64();
      doc.addImage(logoData, 'PNG', 14, 10, 16, 16);
    } catch (err) {
      console.warn('Failed to load logo', err);
    }
    
    doc.setFontSize(22);
    doc.setTextColor(245, 158, 11);
    doc.text("SHREE HARI", 35, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Premium Pooja Samagri", 35, 26);
    
    doc.setFontSize(14);
    doc.setTextColor(15);
    doc.text("INVENTORY STOCK LIST", 14, 40);
    
    const dateStr = new Date().toLocaleString('en-IN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${dateStr}`, 14, 46);

    const tableData = products.map((p, index) => [
      index + 1,
      p.name,
      p.category,
      `Rs ${Number(p.purchasePrice || 0).toFixed(2)}`,
      `Rs ${Number(p.sellingPrice || 0).toFixed(2)}`,
      p.stock.toString(),
      p.stock > 0 ? (p.stock < 10 ? 'Low Stock' : 'In Stock') : 'Out of Stock'
    ]);

    autoTable(doc, {
      startY: 52,
      head: [['#', 'Product Name', 'Category', 'Purchase', 'Selling', 'Qty', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11] },
      styles: { fontSize: 9 },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 6) {
           const status = data.cell.raw;
           if (status === 'Out of Stock') {
              data.cell.styles.textColor = [239, 68, 68];
              data.cell.styles.fontStyle = 'bold';
           } else if (status === 'Low Stock') {
              data.cell.styles.textColor = [245, 158, 11];
              data.cell.styles.fontStyle = 'bold';
           } else {
              data.cell.styles.textColor = [34, 197, 94];
           }
        }
      }
    });

    doc.save(`Stock_List_${Date.now()}.pdf`);
  };

  const fetchProducts = () => api.get('/api/products').then(setProducts);
  
  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    // Bypassing window.confirm for iframe compatibility
    await api.delete(`/api/products/${id}`);
    fetchProducts();
  };

  const handleDuplicate = async (p: Product) => {
    const { id, ...rest } = p;
    const newProduct = { ...rest, name: `${p.name} (Copy)` };
    await api.post('/api/products', newProduct);
    fetchProducts();
  };

  const openAddModal = () => {
    setEditingProduct({
      name: '', category: '', brand: '', description: '', 
      purchasePrice: 0, sellingPrice: 0, mrp: 0, stock: 0, 
      images: [''], status: 'Active', discountPercentage: 0
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if(editingProduct?.id) {
      await api.put(`/api/products/${editingProduct.id}`, editingProduct);
    } else {
      await api.post('/api/products', editingProduct);
    }
    setIsModalOpen(false);
    fetchProducts();
  };

  const updateField = (field: string, value: any) => {
    setEditingProduct(prev => {
      if(!prev) return prev;
      const updated = { ...prev, [field]: value };
      
      // Auto calculate discount
      if (field === 'mrp' || field === 'sellingPrice') {
        const mrp = Number(updated.mrp || 0);
        const sellingPrice = Number(updated.sellingPrice || 0);
        if (mrp > 0) {
          updated.discountPercentage = ((mrp - sellingPrice) / mrp) * 100;
        } else {
          updated.discountPercentage = 0;
        }
      }
      return updated;
    });
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Manage Products</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
            />
          </div>
          <button onClick={handleDownloadStockList} className="w-full sm:w-auto justify-center bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition flex items-center gap-2 whitespace-nowrap text-sm tracking-wide shadow-sm">
            <Printer className="w-4 h-4" /> Print Stock List
          </button>
          <button onClick={openAddModal} className="w-full sm:w-auto justify-center bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition flex items-center gap-2 whitespace-nowrap text-sm tracking-wide shadow-sm">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Product</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Category</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Pricing</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Stock</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(product => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={product.images[0]} className="w-10 h-10 rounded-lg object-cover bg-slate-100" referrerPolicy="no-referrer" />
                      <div>
                        <p className="font-bold text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{product.category}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">₹{product.sellingPrice}</span>
                      <span className="text-xs text-slate-500 line-through">₹{product.mrp}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${product.stock > 10 ? 'bg-emerald-50 text-emerald-700' : product.stock > 0 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                      {product.stock <= 10 && <AlertCircle className="w-3 h-3" />}
                      {product.stock} in stock
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${product.status === 'Active' ? 'bg-slate-100 text-slate-700' : 'bg-slate-100 text-slate-400'}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleDuplicate(product)} className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors" title="Duplicate">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEditModal(product)} className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-slate-500 font-medium">No products found.</div>
          )}
        </div>
      </div>

      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{editingProduct.id ? 'Edit' : 'Add'} Product</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-white">
              <form id="productForm" onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Product Name</label>
                  <input required type="text" value={editingProduct.name} onChange={e => updateField('name', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Category</label>
                  <input required type="text" value={editingProduct.category} onChange={e => updateField('category', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Brand</label>
                  <input required type="text" value={editingProduct.brand} onChange={e => updateField('brand', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">MRP</label>
                  <input required type="number" value={editingProduct.mrp} onChange={e => updateField('mrp', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Selling Price</label>
                  <input required type="number" value={editingProduct.sellingPrice} onChange={e => updateField('sellingPrice', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Discount %</label>
                  <input type="number" value={Number(editingProduct.discountPercentage || 0).toFixed(2)} disabled className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Purchase Price</label>
                  <input required type="number" value={editingProduct.purchasePrice} onChange={e => updateField('purchasePrice', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Stock</label>
                  <input required type="number" value={editingProduct.stock} onChange={e => updateField('stock', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Product Image (Upload to Supabase)</label>
                  <input 
                    type="file" 
                    accept="image/jpeg, image/png, image/jpg, image/webp" 
                    onChange={handleImageUpload} 
                    disabled={uploadingImage}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium text-slate-900" 
                  />
                  {uploadingImage && (
                    <div className="flex items-center gap-2 mt-2 text-xs font-bold text-amber-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading to Supabase Storage...</span>
                    </div>
                  )}
                  {editingProduct.images?.[0] && !uploadingImage && (
                    <div className="mt-2 relative inline-block">
                      <img src={editingProduct.images[0]} alt="Preview" className="h-16 w-16 object-cover rounded border border-slate-200" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description</label>
                  <textarea rows={3} value={editingProduct.description} onChange={e => updateField('description', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium text-slate-900" />
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-lg font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-colors">Cancel</button>
              <button type="submit" form="productForm" className="px-6 py-2.5 rounded-lg font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors">Save Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
