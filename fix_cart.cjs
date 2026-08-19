const fs = require('fs');
let code = fs.readFileSync('src/pages/customer/Cart.tsx', 'utf-8');
code = code.replace(
  '<div key={item.productId} className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">',
  '<div key={item.productId} className="flex gap-4 sm:gap-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">'
);
fs.writeFileSync('src/pages/customer/Cart.tsx', code);
