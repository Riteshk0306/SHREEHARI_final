import { useStore } from '../../store';
import { api } from '../../api';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart } = useStore();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  useEffect(() => {
    api.get('/api/products').then(setProducts);
  }, []);

  const handleUpdateQuantity = (productId: string, newQty: number) => {
    const product = products.find(p => p.id === productId);
    if (product && newQty > product.stock) {
      alert('Only ' + product.stock + ' units available in stock. Limit reached.');
      updateQuantity(productId, product.stock);
    } else {
      updateQuantity(productId, newQty);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
  
  const total = subtotal;

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight uppercase">Your cart is empty</h2>
        <p className="text-slate-500 mb-8 font-medium">Looks like you haven't added any pooja samagri to your cart yet.</p>
        <Link to="/products" className="bg-slate-900 text-white px-8 py-3.5 rounded-lg font-bold hover:bg-slate-800 transition shadow-sm uppercase tracking-wide text-sm inline-block">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-8 tracking-tight uppercase">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-4">
          {cart.map(item => (
            <div key={item.productId} className="flex gap-4 sm:gap-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <img src={item.image} alt={item.name} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg bg-slate-100 shrink-0" referrerPolicy="no-referrer" />
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between">
                  <h3 className="font-bold text-lg text-slate-900">{item.name}</h3>
                  <button onClick={() => removeFromCart(item.productId)} className="text-slate-400 hover:text-red-500 p-1 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex justify-between items-end">
                  <div className="text-lg font-bold text-slate-900">₹{item.sellingPrice}</div>
                  <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm">
                    <button 
                      onClick={() => handleUpdateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                      className="text-slate-500 hover:text-red-500 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input 
                      type="number" 
                      min="1"
                      value={item.quantity || ''}
                      onChange={(e) => handleUpdateQuantity(item.productId, parseInt(e.target.value) || 0)}
                      onBlur={(e) => { if (!e.target.value || parseInt(e.target.value) < 1) handleUpdateQuantity(item.productId, 1); }}
                      className="font-bold w-12 text-center text-slate-900 bg-transparent border-none focus:ring-0 p-0" 
                    />
                    <button 
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                      className="text-slate-500 hover:text-emerald-500 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
          <h2 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-tight">Order Summary</h2>
          <div className="space-y-4 text-slate-600 font-medium">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900">₹{Number(subtotal || 0).toFixed(2)}</span>
            </div>
            
            <div className="border-t border-slate-200 pt-4 flex justify-between text-lg font-bold text-slate-900">
              <span>Total</span>
              <span>₹{Number(total || 0).toFixed(2)}</span>
            </div>
          </div>
          <button 
            onClick={() => navigate('/checkout')}
            className="w-full mt-8 bg-slate-900 text-white py-3.5 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-sm flex justify-center items-center gap-2 uppercase tracking-wide text-sm"
          >
            Proceed to Checkout
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
