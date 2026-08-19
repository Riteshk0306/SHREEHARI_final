import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { Product } from '../../types';
import { useStore } from '../../store';
import { ShoppingBag, ArrowLeft, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart, clearCart } = useStore();

  useEffect(() => {
    if (id) {
      api.get('/api/products').then(data => {
        const p = data.find((x: Product) => x.id === id);
        if (p) setProduct(p);
      });
    }
  }, [id]);

  if (!product) return <div className="p-24 text-center text-neutral-500">Loading product...</div>;

    const handleAddToCart = () => {
    if (product.stock <= 0) {
      alert('This product is not available, select another product');
      return;
    }
    addToCart(product, quantity);
    navigate('/cart');
  };

  const handleBuyNow = () => {
    if (product.stock <= 0) {
      alert('This product is not available, select another product');
      return;
    }
    clearCart();
    addToCart(product, quantity);
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-amber-500 mb-8 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden relative border border-slate-200">
            <img src={product.images[activeImage] || product.images[0]} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        {product.stock <= 0 ? (
              <span className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center text-white text-xl font-bold tracking-widest z-10">OUT OF STOCK</span>
            ) : (product.stock < 10 ? (
              <span className="absolute top-4 right-4 bg-amber-500 text-white text-[12px] font-bold px-3 py-1.5 rounded uppercase tracking-wider shadow-sm z-10">ONLY {product.stock} LEFT</span>
            ) : null)}
            {product.discountPercentage > 0 && (

              <span className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider shadow-sm">
                {Number(product.discountPercentage || 0).toFixed(0)}% OFF
              </span>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-amber-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover bg-slate-100" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-amber-600 font-bold uppercase tracking-widest text-xs mb-2">{product.brand}</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-4 tracking-tight uppercase">{product.name}</h1>
          
          <div className="flex items-end gap-4 mb-6">
            <span className="text-4xl font-bold text-slate-900">₹{product.sellingPrice}</span>
            {product.mrp > product.sellingPrice && (
              <span className="text-xl text-slate-400 line-through mb-1 font-medium">₹{product.mrp}</span>
            )}
          </div>

          <div className="prose text-slate-600 mb-8 font-medium">
            <p>{product.description}</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4 shadow-sm">
            <div className="flex flex-col items-center text-center gap-2">
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">100% Authentic</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <Truck className="w-8 h-8 text-blue-500" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <RotateCcw className="w-8 h-8 text-amber-500" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Easy Returns</span>
            </div>
          </div>

          <div className="mt-auto space-y-6 border-t border-slate-200 pt-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-slate-500 hover:text-red-500 text-xl font-bold w-10 h-10 flex items-center justify-center transition-colors"
                >-</button>
                <span className="font-bold text-lg w-6 text-center text-slate-900">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="text-slate-500 hover:text-emerald-500 text-xl font-bold w-10 h-10 flex items-center justify-center transition-colors"
                >+</button>
              </div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                {product.stock > 0 ? `${product.stock} items available` : <span className="text-red-500">Out of Stock</span>}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-white text-amber-600 font-bold py-3 px-6 rounded-full border border-amber-500 hover:bg-amber-50 transition-colors flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-sm"
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span className="truncate">{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
              </button>
              <button 
                onClick={handleBuyNow}
                className="flex-1 bg-slate-900 text-white font-bold py-3 px-6 rounded-full border border-slate-900 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-sm"
              >
                <span className="truncate">Buy Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
