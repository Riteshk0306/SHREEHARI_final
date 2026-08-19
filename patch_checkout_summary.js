import fs from 'fs';

let code = fs.readFileSync('src/pages/customer/Checkout.tsx', 'utf-8');

const searchReturn = `  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-8 uppercase tracking-tight">Checkout</h1>
      
      <form onSubmit={handlePlaceOrder} className="space-y-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">`;

const replaceReturn = `  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-8 uppercase tracking-tight">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <form onSubmit={handlePlaceOrder} className="lg:col-span-2 space-y-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">`;

const searchEnd = `        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-slate-900 text-white py-4 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? 'Processing...' : \`Place Order • ₹\${total.toFixed(2)}\`}
        </button>
      </form>
    </div>
  );
}`;

const replaceEnd = `        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-slate-900 text-white py-4 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? 'Processing...' : \`Place Order • ₹\${total.toFixed(2)}\`}
        </button>
      </form>

      {/* Order Summary Sidebar */}
      <div className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
        <h2 className="text-xl font-bold text-slate-900 mb-6 tracking-tight uppercase">Order Summary</h2>
        <div className="space-y-4 mb-6">
          {cart.map(item => (
            <div key={item.productId} className="flex gap-4">
              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded bg-slate-200" referrerPolicy="no-referrer" />
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 text-sm line-clamp-2">{item.name}</h4>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-slate-500 text-sm">Qty: {item.quantity}</span>
                  <span className="font-bold text-slate-900 text-sm">₹{(item.sellingPrice * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t border-slate-200 pt-4 space-y-3">
          <div className="flex justify-between text-slate-600 font-medium">
            <span>Subtotal</span>
            <span className="font-bold text-slate-900">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-slate-900 pt-3 border-t border-slate-200">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      </div>
    </div>
  );
}`;

code = code.replace(searchReturn, replaceReturn);
code = code.replace(searchEnd, replaceEnd);

fs.writeFileSync('src/pages/customer/Checkout.tsx', code);
