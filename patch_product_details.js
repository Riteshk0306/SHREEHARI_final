import fs from 'fs';
let code = fs.readFileSync('src/pages/customer/ProductDetails.tsx', 'utf-8');

code = code.replace(
  "const { addToCart } = useStore();",
  "const { addToCart, clearCart } = useStore();"
);

const handleAddToCartRegex = /const handleAddToCart = \(\) => \{[\s\S]*?\n  \};/;
const handleAddToCartReplacement = `const handleAddToCart = () => {
    addToCart(product, quantity);
    navigate('/cart');
  };

  const handleBuyNow = () => {
    clearCart();
    addToCart(product, quantity);
    navigate('/checkout');
  };`;

code = code.replace(handleAddToCartRegex, handleAddToCartReplacement);

const buttonSearch = `<button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-5 h-5" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>`;

const buttonReplace = `<div className="flex gap-4">
              <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-900 border border-slate-300 py-4 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-slate-200 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button 
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-white py-4 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-amber-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>`;

code = code.replace(buttonSearch, buttonReplace);
fs.writeFileSync('src/pages/customer/ProductDetails.tsx', code);
