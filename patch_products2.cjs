const fs = require('fs');
let code = fs.readFileSync('src/pages/customer/Products.tsx', 'utf-8');

const updatedBadges = `              {product.stock <= 0 ? (
                <span className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center text-white text-sm font-bold tracking-wider z-10">OUT OF STOCK</span>
              ) : (product.stock < 10 ? (
                <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider z-10">ONLY {product.stock} LEFT</span>
              ) : null)}
              {product.discountPercentage > 0 && (
`;

code = code.replace(
  "{product.discountPercentage > 0 && (",
  updatedBadges
);

fs.writeFileSync('src/pages/customer/Products.tsx', code);
