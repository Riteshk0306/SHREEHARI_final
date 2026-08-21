import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Minus, User, FileText, CheckCircle2, Eye, Download, MessageCircle, ArrowRight, X } from 'lucide-react';
import { api } from '../../api';
import type { Product } from '../../types';
import { generateInvoicePdfBlob, downloadInvoicePdf, viewInvoicePdf, sendInvoiceViaWhatsApp } from '../../utils/pdfGenerator';
import { uploadInvoicePdf } from '../../lib/storage';

export default function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', mobile: '' });
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paidAmount, setPaidAmount] = useState<number | ''>('');
  const [includeGst, setIncludeGst] = useState(false);
  const [sendWhatsapp, setSendWhatsapp] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await api.get('/api/products');
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (p: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === p.id);
      const reqQty = existing ? existing.quantity + 1 : 1;
      let finalQty = reqQty;
      if (reqQty > p.stock) {
        alert('Only ' + p.stock + ' units available in stock. Limit reached.');
        finalQty = p.stock;
      }
      if (existing) {
        return prev.map(item => item.productId === p.id ? { ...item, quantity: finalQty } : item);
      }
      return [...prev, { productId: p.id, name: p.name, sellingPrice: p.sellingPrice, purchasePrice: p.purchasePrice, quantity: finalQty, image: p.images?.[0] }];
    });
  };

  const updateQuantity = (id: string, q: number) => {
    const p = products.find(prod => prod.id === id);
    if (!p) return;
    if (q > p.stock) {
      alert('Only ' + p.stock + ' units available in stock. Limit reached.');
      q = p.stock;
    }
    if (q <= 0) setCart(prev => prev.filter(item => item.productId !== id));
    else setCart(prev => prev.map(item => item.productId === id ? { ...item, quantity: q } : item));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
  const totalProfit = cart.reduce((sum, item) => sum + ((item.sellingPrice - item.purchasePrice) * item.quantity), 0);
  const gst = includeGst ? (subtotal * 0.18) : 0;
  const total = subtotal + gst;

  const handleGenerateBill = async () => {
    if (cart.length === 0) return alert('Cart is empty. Please select products first.');
    if (!customerInfo.name.trim() || !customerInfo.mobile.trim()) {
      return alert('Please enter customer Name and Mobile Number.');
    }

    setIsGenerating(true);

    try {
      const actualPaid = paidAmount === '' ? total : Number(paidAmount);
      const calculatedPaymentStatus = actualPaid >= total ? 'Paid' : (actualPaid > 0 ? 'Pending' : 'Pending');
      const dueAmount = Math.max(0, total - actualPaid);

      // 1. Create order in Database
      const orderPayload = {
        customerName: customerInfo.name.trim(),
        mobile: customerInfo.mobile.trim(),
        address: 'In-Store',
        items: [...cart],
        paymentMethod,
        paidAmount: actualPaid,
        dueAmount,
        paymentStatus: calculatedPaymentStatus,
        date: new Date().toISOString(),
        totalAmount: total,
        profit: totalProfit,
        gstIncluded: includeGst,
        gstAmount: gst,
        source: 'Admin (POS)',
        orderStatus: 'Completed'
      };

      const res = await api.post('/api/orders', orderPayload);
      const invoiceNumber = res.invoiceNumber || res.billNumber || `INV-${Date.now()}`;

      // Complete order model
      const completedOrder = {
        ...orderPayload,
        ...res,
        id: res.id,
        invoiceNumber
      };

      // 2. Generate standard PDF Blob
      const pdfBlob = await generateInvoicePdfBlob(completedOrder);

      // 3. Upload PDF to Supabase Storage (invoices bucket)
      let invoiceUrl = '';
      try {
        invoiceUrl = await uploadInvoicePdf(pdfBlob, invoiceNumber);
        if (invoiceUrl && res.id) {
          // 4. Sync invoiceUrl to Database
          await api.put(`/api/orders/${res.id}`, { invoiceUrl });
          completedOrder.invoiceUrl = invoiceUrl;
        }
      } catch (uploadError) {
        console.warn('Could not sync invoice to cloud storage, continuing:', uploadError);
      }

      // 5. Send via WhatsApp if requested
      if (sendWhatsapp) {
        await sendInvoiceViaWhatsApp(completedOrder, pdfBlob, invoiceUrl);
      } else {
        // Automatically download PDF for admin record
        await downloadInvoicePdf(completedOrder);
      }

      setLastCreatedOrder(completedOrder);
      setShowSuccessModal(true);

      // Reset form
      setCart([]);
      setCustomerInfo({ name: '', mobile: '' });
      setPaidAmount('');
      setIncludeGst(false);

      // Re-fetch products to reflect updated stock count
      fetchProducts();
    } catch (e: any) {
      console.error('Error generating bill:', e);
      alert('Error generating bill: ' + (e.message || 'Unknown error'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-6rem)] relative">
      {/* Products Section */}
      <div className="flex-1 flex flex-col min-h-[500px] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search products by name or category..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm font-medium text-slate-900"
            />
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 bg-slate-50">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(p => (
              <div 
                key={p.id} 
                onClick={() => p.stock > 0 ? addToCart(p) : alert('This product is not available, select another product')}
                className={`border rounded-xl p-3 cursor-pointer transition-all ${p.stock > 0 ? 'border-slate-200 hover:border-amber-500 hover:shadow-md bg-white' : 'opacity-50 bg-slate-50 cursor-not-allowed border-slate-200'}`}
              >
                <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden mb-3 relative">
                  <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  {p.stock <= 0 ? <span className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center text-white text-xs font-bold tracking-wider">OUT OF STOCK</span> : (p.stock < 10 ? <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">ONLY {p.stock} LEFT</span> : null)}
                </div>
                <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-tight mb-2">{p.name}</h4>
                <div className="flex justify-between items-center mt-auto">
                  <span className="font-bold text-slate-900">₹{p.sellingPrice}</span>
                  <span className="text-xs text-slate-500 font-medium">Stock: {p.stock}</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 font-medium">
                No products found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart & Checkout Section */}
      <div className="w-full lg:w-96 flex flex-col min-h-[500px] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden shrink-0">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-bold text-slate-900 flex items-center gap-2 uppercase tracking-tight">
            <ShoppingCart className="w-5 h-5 text-amber-500" /> Current Bill
          </h2>
        </div>
        
        <div className="flex-1 overflow-auto p-4 space-y-3 bg-white">
          {cart.length === 0 ? (
             <div className="text-center text-slate-400 py-12 text-sm font-medium">Add products to create a bill</div>
          ) : (
            cart.map(item => (
              <div key={item.productId} className="flex gap-3 border-b border-slate-100 pb-3">
                <img src={item.image} className="w-12 h-12 rounded-lg bg-slate-100 object-cover" referrerPolicy="no-referrer" />
                <div className="flex-1 text-sm">
                  <h5 className="font-bold text-slate-900 leading-tight">{item.name}</h5>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-slate-900">₹{item.sellingPrice}</span>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="text-slate-500 hover:text-red-500 transition-colors"><Minus className="w-3 h-3" /></button>
                      <input 
                        type="number"
                        min="1"
                        value={item.quantity || ''}
                        onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0)}
                        onBlur={(e) => { if (!e.target.value || parseInt(e.target.value) < 1) updateQuantity(item.productId, 1); }}
                        className="w-12 text-center font-bold text-slate-900 bg-transparent border-none focus:ring-0 p-0"
                      />
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="text-slate-500 hover:text-emerald-500 transition-colors"><Plus className="w-3 h-3" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between text-slate-600 font-medium"><span>Subtotal</span><span>₹{Number(subtotal || 0).toFixed(2)}</span></div>
            {includeGst && (
              <div className="flex justify-between text-slate-600 font-medium"><span>GST (18%)</span><span>₹{Number(gst || 0).toFixed(2)}</span></div>
            )}
            <div className="flex justify-between font-bold text-lg text-slate-900 pt-3 border-t border-slate-200 mt-2"><span>Total</span><span>₹{Number(total || 0).toFixed(2)}</span></div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Customer Name" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium text-slate-900" />
            </div>
            <input type="text" placeholder="Mobile Number" value={customerInfo.mobile} onChange={e => setCustomerInfo({...customerInfo, mobile: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium text-slate-900" />
            
            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
              <label className="font-medium text-slate-700 flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={includeGst} onChange={e => setIncludeGst(e.target.checked)} className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500" />
                Add GST (18%)
              </label>
            </div>

            <div className="flex items-center justify-between bg-emerald-50/50 p-3 rounded-lg border border-emerald-200">
              <label className="font-bold text-emerald-900 flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={sendWhatsapp} onChange={e => setSendWhatsapp(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                Send Invoice PDF via WhatsApp
              </label>
            </div>
            
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Amount Paid Today (₹)</label>
              <input type="number" value={paidAmount} onChange={e => setPaidAmount(e.target.value === '' ? '' : Number(e.target.value))} placeholder={`Full Amount: ₹${total.toFixed(2)}`} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 transition-all font-medium" />
              <p className="text-[10px] text-slate-500 mt-1">Leave empty if full amount is paid instantly.</p>
            </div>

            <div className="flex gap-2 pt-2">
              {['Cash', 'UPI', 'Card'].map(m => (
                <button key={m} onClick={() => setPaymentMethod(m)} className={`flex-1 py-2.5 rounded-lg font-bold border transition-colors ${paymentMethod === m ? 'bg-amber-500 border-amber-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <button 
            onClick={handleGenerateBill} 
            disabled={cart.length === 0 || isGenerating} 
            className="w-full bg-slate-900 text-white py-3.5 rounded-lg font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 mt-4 tracking-wide uppercase text-xs flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating & Syncing Invoice...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Confirm Bill & Generate PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bill Confirmation & PDF Invoice Success Modal */}
      {showSuccessModal && lastCreatedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-1">Bill Generated Successfully!</h3>
            <p className="text-sm text-slate-500 mb-4">
              Invoice <span className="font-bold text-slate-800">{lastCreatedOrder.invoiceNumber}</span> is saved and synced to database.
            </p>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-900">{lastCreatedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mobile:</span>
                <span className="font-medium text-slate-700">{lastCreatedOrder.mobile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Amount:</span>
                <span className="font-bold text-emerald-600">₹{Number(lastCreatedOrder.totalAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment:</span>
                <span className="font-medium text-slate-700">{lastCreatedOrder.paymentMethod} ({lastCreatedOrder.paymentStatus})</span>
              </div>
            </div>

            <div className="space-y-2">
              <button 
                onClick={() => sendInvoiceViaWhatsApp(lastCreatedOrder, undefined, lastCreatedOrder.invoiceUrl)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Send / Re-send to WhatsApp
              </button>

              <div className="flex gap-2">
                <button 
                  onClick={() => viewInvoicePdf(lastCreatedOrder)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Invoice PDF
                </button>
                <button 
                  onClick={() => downloadInvoicePdf(lastCreatedOrder)}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>

            <button 
              onClick={() => setShowSuccessModal(false)}
              className="w-full mt-4 text-center text-xs font-semibold text-slate-400 hover:text-slate-600 py-1"
            >
              Close and Start New Bill
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
