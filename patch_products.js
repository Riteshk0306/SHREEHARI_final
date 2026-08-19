import fs from 'fs';
let code = fs.readFileSync('src/pages/customer/Products.tsx', 'utf-8');

code = code.replace(
  "import { Link } from 'react-router-dom';",
  "import { Link, useNavigate } from 'react-router-dom';"
);

code = code.replace(
  "const { addToCart } = useStore();",
  "const { addToCart, clearCart } = useStore();\n  const navigate = useNavigate();\n  \n  const handleBuyNow = (product: Product) => {\n    clearCart();\n    addToCart(product, 1);\n    navigate('/checkout');\n  };"
);

const buttonsSearch = `<button 
                  onClick={() => addToCart(product, 1)}
                  disabled={product.stock === 0}
                  className="p-2 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={product.stock === 0 ? "Out of stock" : "Add to Cart"}
                >
                  <ShoppingCart className="w-5 h-5" />
                </button>`;

const buttonsReplace = `<div className="flex gap-2">
                  <button 
                    onClick={() => addToCart(product, 1)}
                    disabled={product.stock === 0}
                    className="p-2 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={product.stock === 0 ? "Out of stock" : "Add to Cart"}
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleBuyNow(product)}
                    disabled={product.stock === 0}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xs uppercase tracking-wide"
                  >
                    Buy
                  </button>
                </div>`;

code = code.replace(buttonsSearch, buttonsReplace);
fs.writeFileSync('src/pages/customer/Products.tsx', code);
