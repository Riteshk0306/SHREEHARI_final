import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Minus, User, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../../api';
import type { Product } from '../../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getLogoBase64 } from '../../utils/pdfHelper';
import { format } from 'date-fns';

export default function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', mobile: '' });
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paidAmount, setPaidAmount] = useState<number | ''>('');
  const [includeGst, setIncludeGst] = useState(false);
  const [sendWhatsapp, setSendWhatsapp] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await api.get('/api/products');
      setProducts(data);
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

  const handleDownloadInvoice = async (bill: any) => {
    try {
      const doc = new jsPDF();
      
      try {
        const logoData = await getLogoBase64();
        doc.addImage(logoData, 'PNG', 14, 10, 16, 16);
      } catch (err) {
        console.warn('Failed to load logo', err);
      }
      
      try {
        const logoData = await getLogoBase64();
        doc.addImage(logoData, 'PNG', 14, 10, 16, 16);
      } catch (err) {
        console.warn('Failed to load logo', err);
      }
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(245, 158, 11);
      doc.text("SHREE HARI", 35, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Premium Pooja Samagri", 35, 28);
      
      // Invoice Details
      doc.setFontSize(14);
      doc.setTextColor(15);
      doc.text("INVOICE", 14, 45);
      
      doc.setFontSize(10);
      doc.setTextColor(50);
      doc.text(`Bill No: ${bill.billNumber || 'PENDING'}`, 14, 55);
      doc.text(`Date: ${new Date(bill.date).toLocaleDateString()}`, 14, 62);
      
      // Customer Details
      doc.text("Bill To:", 120, 45);
      doc.setTextColor(15);
      doc.text(bill.customerName, 120, 55);
      doc.setTextColor(50);
      doc.text(`Mobile: ${bill.mobile}`, 120, 62);
      
      // Table Header
      let y = 80;
      doc.setFillColor(245, 247, 250);
      doc.rect(14, y - 6, 182, 10, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(15);
      doc.setFont("helvetica", "bold");
      doc.text("#", 16, y);
      doc.text("Item", 25, y);
      doc.text("Qty", 120, y);
      doc.text("Price", 140, y);
      doc.text("Amount", 170, y);
      
      doc.setFont("helvetica", "normal");
      y += 10;
      
      // Items
      cart.forEach((item, index) => {
        doc.text((index + 1).toString(), 16, y);
        doc.text(item.name.substring(0, 35), 25, y);
        doc.text(item.quantity.toString(), 120, y);
        doc.text(`Rs. ${item.sellingPrice}`, 140, y);
        doc.text(`Rs. ${item.sellingPrice * item.quantity}`, 170, y);
        y += 10;
      });
      
      // Footer/Totals
      y += 5;
      doc.line(14, y, 196, y);
      y += 10;
      
      const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
      doc.text("Subtotal:", 140, y);
      doc.text(`Rs. ${Number(subtotal || 0).toFixed(2)}`, 170, y);
      
      if (includeGst) {
        y += 10;
        doc.text("GST (18%):", 140, y);
        doc.text(`Rs. ${(Number(subtotal || 0) * 0.18).toFixed(2)}`, 170, y);
      }
      
      y += 10;
      doc.setFont("helvetica", "bold");
      doc.text("Total:", 140, y);
      doc.text(`Rs. ${Number(bill.totalAmount || 0).toFixed(2)}`, 170, y);
      
      doc.save(`Invoice_${bill.billNumber || Date.now()}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF", err);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
  const totalProfit = cart.reduce((sum, item) => sum + ((item.sellingPrice - item.purchasePrice) * item.quantity), 0);
  const gst = includeGst ? (subtotal * 0.18) : 0;
  const total = subtotal + gst;

  const handleGenerateBill = async () => {
    if (cart.length === 0) return alert('Cart is empty');
    if (!customerInfo.name || !customerInfo.mobile) return alert('Enter customer details');
    
    try {
      const res = await api.post('/api/orders', {
        customerName: customerInfo.name,
        mobile: customerInfo.mobile,
        address: 'In-Store',
        items: cart,
        paymentMethod,
        paidAmount: paidAmount === '' ? total : paidAmount,
        paymentStatus: (paidAmount === '' || paidAmount >= total) ? 'Paid' : 'Pending',
        date: new Date().toISOString(),
        totalAmount: total,
        profit: totalProfit,
        gstIncluded: includeGst,
        gstAmount: gst,
        source: 'Admin (POS)',
        orderStatus: 'Completed'
      });
      
      // Removed auto-download PDF

      let msg = "Bill generated successfully!";
      
      if (sendWhatsapp) {
        const message = `*New Bill Generated!*\n\n*Name:* ${customerInfo.name}\n*Amount:* ₹${Number(total || 0).toFixed(2)}\n\n*Items:*\n${cart.map((item: any) => `- ${item.name} x${item.quantity}`).join('\n')}\n\n*Bill ID:* ${res.billNumber || 'Pending'}\n\n_Thank you for shopping with Shree Hari. Your invoice PDF will be shared shortly._`;
        const whatsappUrl = `https://wa.me/91${customerInfo.mobile}?text=${encodeURIComponent(message)}`;
        // Open whatsapp in new tab
        window.open(whatsappUrl, '_blank');
        msg += " WhatsApp opened.";
      }

      alert(msg);
      
      setCart([]);
      setCustomerInfo({ name: '', mobile: '' });
      setPaidAmount('');
      setIncludeGst(false);
    } catch(e) {
      alert('Error generating bill');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-6rem)]">
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

            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
              <label className="font-medium text-slate-700 flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={sendWhatsapp} onChange={e => setSendWhatsapp(e.target.checked)} className="w-4 h-4 text-emerald-500 rounded border-slate-300 focus:ring-emerald-500" />
                Send Invoice via WhatsApp
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
          <button onClick={handleGenerateBill} disabled={cart.length === 0} className="w-full bg-slate-900 text-white py-3.5 rounded-lg font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 mt-4 tracking-wide uppercase text-xs">
            Confirm Bill
          </button>
        </div>
      </div>
    </div>
  );
}
