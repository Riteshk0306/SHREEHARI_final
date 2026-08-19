import fs from 'fs';
let code = fs.readFileSync('src/pages/customer/Checkout.tsx', 'utf-8');

const searchStructure = `      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <form onSubmit={handlePlaceOrder} className="lg:col-span-2 space-y-8">`;

const replaceStructure = `      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">`;

code = code.replace(searchStructure, replaceStructure);

const searchButton = `        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-slate-900 text-white py-4 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? 'Processing...' : \`Place Order • ₹\${total.toFixed(2)}\`}
        </button>
      </form>

      {/* Order Summary Sidebar */}
      <div className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-200 h-fit">`;

const replaceButton = `        </div>

      {/* Order Summary Sidebar */}
      <div className="bg-slate-50 p-6 rounded-xl shadow-sm border border-slate-200 h-fit">`;

code = code.replace(searchButton, replaceButton);

const searchEnd = `          <div className="flex justify-between text-lg font-bold text-slate-900 pt-3 border-t border-slate-200">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      </div>
    </div>
  );
}`;

const replaceEnd = `          <div className="flex justify-between text-lg font-bold text-slate-900 pt-3 border-t border-slate-200">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-6 bg-slate-900 text-white py-4 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? 'Processing...' : \`Place Order • ₹\${total.toFixed(2)}\`}
        </button>
      </div>
      
      </form>
    </div>
  );
}`;

code = code.replace(searchEnd, replaceEnd);

fs.writeFileSync('src/pages/customer/Checkout.tsx', code);
