import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { Product } from '../../types';
import { ShoppingBag, Search, Filter, Package } from 'lucide-react';
import { useStore } from '../../store';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const { addToCart, clearCart } = useStore();
  const navigate = useNavigate();
  
    const handleAddToCart = (product: Product, e: any) => {
    e.preventDefault();
    if (product.stock <= 0) {
      alert('This product is not available, select another product');
      return;
    }
    addToCart(product, 1);
  };
  
  const handleBuyNow = (product: Product, e?: any) => {
    if (e) e.preventDefault();
    if (product.stock <= 0) {
      alert('This product is not available, select another product');
      return;
    }
    clearCart();
    addToCart(product, 1);
    navigate('/checkout');
  };

  useEffect(() => {
    api.get('/api/products').then(data => setProducts(data));
  }, []);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">All Products</h1>
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-slate-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {filtered.map(product => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:border-amber-500 transition-all flex flex-col h-full relative">
            <Link to={`/products/${product.id}`} className="relative aspect-square bg-slate-100 overflow-hidden group block">
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
              
              {product.stock <= 0 ? (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center text-white text-xs sm:text-sm font-bold tracking-wider z-10">OUT OF STOCK</div>
              ) : (product.stock < 10 ? (
                <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider z-10">ONLY {product.stock} LEFT</span>
              ) : null)}
              {product.discountPercentage > 0 && (
                <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  {Number(product.discountPercentage || 0).toFixed(0)}% OFF
                </span>
              )}
            </Link>
            <div className="p-3 sm:p-4 flex-1 flex flex-col">
              <p className="text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-widest">{product.category}</p>
              <Link to={`/products/${product.id}`} className="text-sm sm:text-base font-bold text-slate-800 line-clamp-2 hover:text-amber-600 transition-colors mb-2">
                {product.name}
              </Link>
              
              <div className="mt-auto pt-3 flex items-end justify-between border-t border-slate-50">
                <div className="flex flex-col">
                  {product.mrp > product.sellingPrice && (
                    <span className="text-[10px] sm:text-xs text-slate-400 line-through font-medium leading-none mb-1">₹{product.mrp}</span>
                  )}
                  <span className="text-sm sm:text-lg font-bold text-slate-900 leading-none">₹{product.sellingPrice}</span>
                </div>
                
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button 
                    onClick={(e) => handleAddToCart(product, e)}
                    className="p-1.5 sm:p-2 bg-slate-50 text-slate-600 border border-slate-200 rounded-full hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all"
                    title="Add to Cart"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button 
                    onClick={(e) => handleBuyNow(product, e)}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 transition-all text-[10px] sm:text-xs uppercase tracking-wider"
                  >
                    Buy
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-medium">No products found matching your search.</p>
        </div>
      )}
    </div>
  );
}


