import { useStore } from '../../store';
import { format } from 'date-fns';
import { FileText, CheckCircle2, Plus, Minus, PlusCircle, Eye, Download, MessageCircle } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { generateInvoicePdfBlob, downloadInvoicePdf, viewInvoicePdf, sendInvoiceViaWhatsApp } from '../../utils/pdfGenerator';
import { uploadInvoicePdf } from '../../lib/storage';

export default function Checkout() {
  const { user, cart, clearCart, updateQuantity, removeFromCart } = useStore();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobile || '');
  
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!mobileNumber) setMobileNumber(user.mobile);
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login?redirect=/checkout" />;
  }

  if (cart.length === 0 && !placedOrder) {
    return <Navigate to="/cart" />;
  }

  if (placedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Order Placed Successfully!</h1>
        <p className="text-slate-600 mb-2">Thank you for your purchase. Your order <span className="font-bold text-slate-900">{placedOrder.invoiceNumber}</span> is confirmed.</p>
        <p className="text-sm text-slate-500 mb-10">An official PDF invoice has been generated for your order.</p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => viewInvoicePdf(placedOrder)} 
              className="flex-1 sm:flex-none px-6 flex items-center justify-center gap-2 bg-slate-100 text-slate-800 py-3.5 rounded-lg hover:bg-slate-200 transition-colors font-bold text-sm" 
              title="View Invoice"
            >
              <Eye className="w-5 h-5" />
              View PDF
            </button>
            <button 
              onClick={() => downloadInvoicePdf(placedOrder)} 
              className="flex-1 sm:flex-none px-6 flex items-center justify-center gap-2 bg-slate-900 text-white py-3.5 rounded-lg hover:bg-slate-800 transition-colors font-bold text-sm" 
              title="Download Invoice"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
          </div>
          <button 
            onClick={() => sendInvoiceViaWhatsApp(placedOrder, undefined, placedOrder.invoiceUrl)}
            className="w-full sm:w-auto bg-emerald-600 text-white px-6 py-3.5 rounded-lg font-bold uppercase tracking-wider text-xs hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Share to WhatsApp
          </button>
          <button 
            onClick={() => navigate('/my-orders')} 
            className="w-full sm:w-auto bg-amber-500 text-white px-8 py-3.5 rounded-lg font-bold uppercase tracking-wider text-xs hover:bg-amber-600 transition-colors"
          >
            View My Orders
          </button>
        </div>
      </div>
    );
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
  const totalProfit = cart.reduce((sum, item) => sum + ((item.sellingPrice - item.purchasePrice) * item.quantity), 0);
  const total = subtotal;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const order = {
        customerId: user.id,
        customerName: customerName,
        mobile: mobileNumber,
        email: user.email,
        items: [...cart],
        address,
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
        date: new Date().toISOString(),
        totalAmount: total,
        profit: totalProfit,
        source: 'Customer'
      };
      
      const res = await api.post('/api/orders', order);
      const invoiceNumber = res.invoiceNumber || `INV-${Date.now()}`;
      
      const completeOrder = {
        ...order,
        ...res,
        id: res.id,
        invoiceNumber
      };

      // Generate and upload PDF invoice to storage in background
      try {
        const pdfBlob = await generateInvoicePdfBlob(completeOrder);
        const invoiceUrl = await uploadInvoicePdf(pdfBlob, invoiceNumber);
        if (invoiceUrl && res.id) {
          await api.put(`/api/orders/${res.id}`, { invoiceUrl });
          completeOrder.invoiceUrl = invoiceUrl;
        }
      } catch (pdfErr) {
        console.warn('PDF storage sync notice:', pdfErr);
      }

      clearCart();
      setPlacedOrder(completeOrder);
    } catch (err: any) {
      alert(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-8 uppercase tracking-tight">Checkout</h1>
      
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6 tracking-tight uppercase">Delivery Details</h2>
          <div className="grid gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
              <input type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium text-slate-900 transition-all bg-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Mobile Number</label>
              <input type="tel" required value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium text-slate-900 transition-all bg-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Delivery Address</label>
              <textarea 
                required 
                value={address} 
                onChange={e => setAddress(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium text-slate-900 transition-all"
                rows={3}
                placeholder="Enter complete address with PIN code"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6 tracking-tight uppercase">Payment Method</h2>
          <div className="space-y-3">
            {['UPI', 'Card', 'COD'].map(method => (
              <label key={method} className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === method ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value={method} 
                  checked={paymentMethod === method}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <span className="font-bold text-slate-800">{method}</span>
              </label>
            ))}
          </div>
        </div>

        </div>

      {/* Order Summary Sidebar */}
      <div className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
        <h2 className="text-xl font-bold text-slate-900 mb-6 tracking-tight uppercase">Order Summary</h2>
        <div className="space-y-4 mb-6">
          {cart.map(item => (
            <div key={item.productId} className="flex gap-4">
              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded bg-slate-200" referrerPolicy="no-referrer" />
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 text-sm line-clamp-2">{item.name}</h4>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm">
                    <button 
                      type="button"
                      onClick={() => {
                        if (item.quantity <= 1) {
                          removeFromCart(item.productId);
                        } else {
                          updateQuantity(item.productId, item.quantity - 1);
                        }
                      }}
                      className="text-slate-500 hover:text-red-500 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input 
                      type="number"
                      min="1"
                      value={item.quantity || ''}
                      onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0)}
                      onBlur={(e) => { if (!e.target.value || parseInt(e.target.value) < 1) updateQuantity(item.productId, 1); }}
                      className="font-bold text-xs w-12 text-center text-slate-900 bg-transparent border-none focus:ring-0 p-0"
                    />
                    <button 
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="text-slate-500 hover:text-emerald-500 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="font-bold text-slate-900 text-sm">₹{(Number(item.sellingPrice || 0) * Number(item.quantity || 0)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          type="button"
          onClick={() => navigate('/products')}
          className="w-full mb-4 flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4 text-slate-500" />
          Add Another Product
        </button>

        <div className="border-t border-slate-200 pt-4 space-y-3">
          <div className="flex justify-between text-slate-600 font-medium">
            <span>Subtotal</span>
            <span className="font-bold text-slate-900">₹{Number(subtotal || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-slate-900 pt-3 border-t border-slate-200">
            <span>Total</span>
            <span>₹{Number(total || 0).toFixed(2)}</span>
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-6 bg-slate-900 text-white py-4 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? 'Processing...' : `Place Order • ₹${Number(total || 0).toFixed(2)}`}
        </button>
      </div>
      
      </form>
    </div>
  );
}
