const fs = require('fs');

let code = fs.readFileSync('src/pages/customer/ProductDetails.tsx', 'utf-8');

const regex = /<div className="flex flex-col sm:flex-row gap-4">[\s\S]*?<\/button>\s*<\/div>/m;

const replacement = `<div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-white text-amber-600 font-bold py-3.5 px-4 rounded-xl border border-amber-500 hover:bg-amber-50 transition-colors flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-sm"
              >
                <ShoppingCart className="w-5 h-5 shrink-0" />
                <span className="truncate">{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
              </button>
              <button 
                onClick={handleBuyNow}
                className="flex-1 bg-slate-900 text-white font-bold py-3.5 px-4 rounded-xl border border-slate-900 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-sm"
              >
                <span className="truncate">Buy Now</span>
              </button>
            </div>`;

code = code.replace(regex, replacement);

// Remove the `w-full` if it was somehow causing it
fs.writeFileSync('src/pages/customer/ProductDetails.tsx', code);
