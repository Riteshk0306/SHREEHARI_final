const fs = require('fs');
let code = fs.readFileSync('src/pages/customer/ProductDetails.tsx', 'utf-8');

const handlers = `  const handleAddToCart = () => {
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
  };`;

code = code.replace(
  /const handleAddToCart = \(\) => \{[\s\S]*?navigate\('\/checkout'\);\n  \};/,
  handlers
);

const addToCartBtn = `onClick={handleAddToCart}
                  className="flex-1 bg-amber-50 text-amber-600 font-bold py-3 md:py-4 rounded-xl border-2 border-amber-500 hover:bg-amber-100 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"`;
code = code.replace(
  /onClick=\{handleAddToCart\}\s*disabled=\{product\.stock === 0\}\s*className="[^"]+"/g,
  addToCartBtn
);

const buyNowBtn = `onClick={handleBuyNow}
                  className="flex-1 bg-amber-500 text-white font-bold py-3 md:py-4 rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"`;
code = code.replace(
  /onClick=\{handleBuyNow\}\s*disabled=\{product\.stock === 0\}\s*className="[^"]+"/g,
  buyNowBtn
);

fs.writeFileSync('src/pages/customer/ProductDetails.tsx', code);
