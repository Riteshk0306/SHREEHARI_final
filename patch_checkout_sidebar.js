import fs from 'fs';
let code = fs.readFileSync('src/pages/customer/Checkout.tsx', 'utf-8');

// 1. Add lucide icons
code = code.replace(`import { FileText, CheckCircle2 } from 'lucide-react';`, `import { FileText, CheckCircle2, Plus, Minus, PlusCircle } from 'lucide-react';`);

// 2. Add useStore methods
code = code.replace(`const { user, cart, clearCart } = useStore();`, `const { user, cart, clearCart, updateQuantity, removeFromCart } = useStore();`);

// 3. Update Order Summary Sidebar
const sidebarSearch = `<div className="flex justify-between items-center mt-1">
                  <span className="text-slate-500 text-sm">Qty: {item.quantity}</span>
                  <span className="font-bold text-slate-900 text-sm">₹{(item.sellingPrice * item.quantity).toFixed(2)}</span>
                </div>`;

const sidebarReplace = `<div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm">
                    <button 
                      type="button"
                      onClick={() => updateQuantity(item.productId, Math.max(0, item.quantity - 1))}
                      className="text-slate-500 hover:text-red-500 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-xs w-4 text-center text-slate-900">{item.quantity}</span>
                    <button 
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="text-slate-500 hover:text-emerald-500 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="font-bold text-slate-900 text-sm">₹{(item.sellingPrice * item.quantity).toFixed(2)}</span>
                </div>`;

code = code.replace(sidebarSearch, sidebarReplace);

const addAnotherSearch = `<div className="border-t border-slate-200 pt-4 space-y-3">`;

const addAnotherReplace = `<button 
          type="button"
          onClick={() => navigate('/products')}
          className="w-full mb-4 flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4 text-slate-500" />
          Add Another Product
        </button>

        <div className="border-t border-slate-200 pt-4 space-y-3">`;

code = code.replace(addAnotherSearch, addAnotherReplace);

fs.writeFileSync('src/pages/customer/Checkout.tsx', code);
