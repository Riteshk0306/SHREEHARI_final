const fs = require('fs');
let code = fs.readFileSync('src/pages/customer/ProductDetails.tsx', 'utf-8');

const updatedBadges = `            {product.stock <= 0 ? (
              <span className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center text-white text-xl font-bold tracking-widest z-10">OUT OF STOCK</span>
            ) : (product.stock < 10 ? (
              <span className="absolute top-4 right-4 bg-amber-500 text-white text-[12px] font-bold px-3 py-1.5 rounded uppercase tracking-wider shadow-sm z-10">ONLY {product.stock} LEFT</span>
            ) : null)}
            {product.discountPercentage > 0 && (
`;

code = code.replace(
  "{product.discountPercentage > 0 && (",
  updatedBadges
);

fs.writeFileSync('src/pages/customer/ProductDetails.tsx', code);
